/**
 * <TeamMembers />: the whole block, rendered in the browser from the block attributes.
 * Used by the editor preview (isEditor) and the front end (src/view.js, `host` = the server wrapper div).
 *
 * Markup and class names match the former PHP renderer, so build/view.css applies unchanged.
 */
import { cloneElement, createElement as h, Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, createPortal } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { getThemeDef, NAV_ICONS } from './registry';
import {
	sanitizeAttributes, buildMembers, resolveView, resolveLinkType, resolveVisibility, paginationMode, queryPool,
	applyRuntimeFilters, orderMembers, clientMatches, filterTerms,
} from './model';
import { makeContext, cx } from './context';
import { itemRenderer, TableHead } from './themes';
import { DetailPayload, detailStyle } from './details';
import { dynamicCss, googleFontsUrl } from './css';
import { useCarousel } from './carousel';
import { useModal, usePortal, ModalShell } from './modal';
import { CatFilters, FilterControls, catTerms, filterControls } from './Filters';
import { Numbered, LoadMore, Infinite, pageUrl } from './Pagination';
import { useScrollAnimation, useTapReveal, useLayoutHelpers, useFontLink } from './effects';
import { t } from './bridge';
import { htmlClass } from './sanitize';

const EMPTY_FILTERS = { group: null, selects: {}, searches: {} };

const readPageFromUrl = ( win, pageVar ) => {
	try {
		const v = new win.URL( win.location.href ).searchParams.get( pageVar );
		const n = parseInt( v, 10 );
		return n > 0 ? n : 1;
	} catch ( e ) {
		return 1;
	}
};

const TeamMembers = ( { attributes, uid, domId, isEditor = false, host = null, wrapperClass = '' } ) => {
	const ownRef = useRef( null );
	const hostRef = useRef( host );
	hostRef.current = host;
	const rootRef = host ? hostRef : ownRef;
	const seed = useRef( Math.floor( Math.random() * 999998 ) + 1 );
	const seen = useRef( new Set() );
	const win = ( rootRef.current && rootRef.current.ownerDocument.defaultView ) || ( 'undefined' !== typeof window ? window : null );

	/* ---------------- Data ---------------- */
	const atts = useMemo( () => sanitizeAttributes( attributes ), [ attributes ] );
	const theme = useMemo( () => getThemeDef( atts.theme ), [ atts.theme ] );
	const view = resolveView( atts, theme );
	const linkType = resolveLinkType( atts, theme, view );
	const mode = paginationMode( atts, theme, view );
	const vis = useMemo( () => resolveVisibility( atts.visibility, theme ), [ atts.visibility, theme ] );
	const members = useMemo( () => buildMembers( atts ), [ atts ] );
	const { base, pool } = useMemo( () => queryPool( atts, members, seed.current ), [ atts, members ] );
	const pageVar = 'bptm-page-' + uid;

	const baseCtx = useMemo( () => makeContext( { atts, theme, uid, view, linkType, vis, isEditor } ), [ atts, theme, uid, view, linkType, vis, isEditor ] );
	const cloneCtx = useMemo( () => baseCtx.asClone(), [ baseCtx ] );
	const renderItem = useMemo( () => itemRenderer( theme ), [ theme ] );

	/* ---------------- Filters ---------------- */
	const isFilter = 'filter' === view;
	const ajaxFilter = isFilter && 'ajax-filter' === atts.filterType;
	const terms = useMemo( () => ( isFilter ? catTerms( atts, pool ) : [] ), [ isFilter, atts, pool ] );
	const controls = useMemo( () => ( isFilter ? filterControls( atts, pool ) : [] ), [ isFilter, atts, pool ] );
	const [ fstate, setFstate ] = useState( EMPTY_FILTERS );
	const [ changedOnce, setChangedOnce ] = useState( false );
	const firstGroup = atts.filterAllEnabled || ! terms.length ? '*' : terms[ 0 ].slug;
	let group = fstate.group;
	if ( null === group || ( '*' === group && ! atts.filterAllEnabled ) || ( '*' !== group && ! terms.some( ( x ) => x.slug === group ) ) ) {
		group = firstGroup;
	}
	const selects = {};
	controls.forEach( ( c ) => {
		if ( 'select' === c.type && fstate.selects[ c.key ] ) {
			const v = fstate.selects[ c.key ].filter( ( x ) => c.options.some( ( o ) => o.value === x ) );
			if ( v.length ) {
				selects[ c.key ] = v;
			}
		}
	} );
	const searches = {};
	controls.forEach( ( c ) => {
		if ( 'search' === c.type && fstate.searches[ c.key ] && fstate.searches[ c.key ].trim() ) {
			searches[ c.key ] = fstate.searches[ c.key ].trim();
		}
	} );
	const clientState = { ...( '*' !== group ? { group } : {} ), ...selects, ...searches };
	const filterActive = Object.keys( clientState ).filter( ( k ) => ! ( 'group' === k && ! atts.filterAllEnabled && group === firstGroup ) ).length > 0;

	/* ---------------- Pagination ---------------- */
	const [ page, setPage ] = useState( () => ( ! isEditor && win && ( 'normal-pagination' === mode || 'ajax-pagination' === mode ) ? readPageFromUrl( win, pageVar ) : 1 ) );
	const [ loads, setLoads ] = useState( 0 );
	const resetPaging = () => {
		setPage( 1 );
		setLoads( 0 );
	};

	/* ---------------- List ---------------- */
	let list = pool;
	let hiddenIds = null;
	if ( isFilter && ! ajaxFilter ) {
		hiddenIds = new Set();
		pool.forEach( ( m ) => {
			if ( ! clientMatches( m, clientState ) ) {
				hiddenIds.add( m.id );
			}
		} );
	} else if ( ajaxFilter && Object.keys( clientState ).length ) {
		const serverState = { ...clientState };
		if ( serverState.group ) {
			serverState.group = [ serverState.group ];
		}
		if ( serverState.designation ) {
			serverState.designation = serverState.designation.map( ( slug ) => {
				const c = controls.find( ( x ) => 'designation' === x.key );
				const o = c ? c.options.find( ( x ) => x.value === slug ) : null;
				return o ? o.raw : slug;
			} );
		}
		list = orderMembers( atts, applyRuntimeFilters( base, serverState ), seed.current );
		const num = Math.trunc( Number( atts.numberOfMembers ) ) || 0;
		if ( num > 0 ) {
			list = list.slice( 0, num );
		}
	}
	const total = list.length;
	let shown = list;
	let maxPages = 1;
	let curPage = 1;
	let more = false;
	if ( 'normal-pagination' === mode || 'ajax-pagination' === mode ) {
		const pp = Math.max( 1, atts.perPage );
		maxPages = Math.max( 1, Math.ceil( total / pp ) );
		curPage = Math.min( Math.max( 1, page ), maxPages );
		shown = list.slice( ( curPage - 1 ) * pp, curPage * pp );
		maxPages = pp > 0 ? Math.ceil( total / pp ) : 1;
	} else if ( 'load-more-button' === mode || 'load-more-scroll' === mode ) {
		const step = 'load-more-button' === mode ? atts.loadPerClick : atts.perLoad;
		const count = Math.max( 1, atts.initialItems ) + loads * Math.max( 1, step );
		shown = list.slice( 0, count );
		more = count < total;
	}
	const shownCount = hiddenIds ? shown.filter( ( m ) => ! hiddenIds.has( m.id ) ).length : shown.length;

	/* ---------------- Modal ---------------- */
	const modalOn = [ 'popup', 'panel', 'drawer' ].includes( linkType );
	const modal = useModal( { type: linkType, rootRef } );
	const openId = modal.state.visible ? modal.state.id : null;
	const openable = shown.filter( ( m ) => ( ! hiddenIds || ! hiddenIds.has( m.id ) ) && [ 'popup', 'panel', 'drawer' ].includes( baseCtx.memberLinkType( m ) ) ).map( ( m ) => m.id );
	const [ drawerAt, setDrawerAt ] = useState( -1 );
	const drawerItemRef = useRef( null );

	/* ---------------- Classes ---------------- */
	const baseClass = String( wrapperClass || cx( 'wp-block-tsb-team-members', atts.className ) )
		.split( /\s+/ )
		.map( htmlClass )
		.filter( Boolean )
		.join( ' ' );
	const rootClass = cx(
		baseClass,
		'bptm-wrap',
		'bptm-theme-' + theme.id,
		'bptm-group-' + htmlClass( theme.group ),
		'bptm-layout-' + theme.layout,
		'bptm-view-' + view,
		'bptm-link-' + linkType,
		'bptm-align-' + htmlClass( atts.alignment ),
		'none' !== atts.imageFilter ? 'bptm-imgfx-' + atts.imageFilter : '',
		'none' !== atts.hoverImageFilter ? 'bptm-imghfx-' + atts.hoverImageFilter : '',
		atts.enableScrollAnimation ? 'bptm-has-anim' : '',
		atts.detailsAreaHeight ? 'bptm-equal-details' : '',
		theme.grouped ? 'bptm-grouped' : '',
		'bptm-js',
		modalOn && 'drawer' !== linkType && openId && ! modal.state.closing ? 'bptm-modal-open-host' : ''
	);

	useLayoutEffect( () => {
		if ( host ) {
			if ( host.className !== rootClass ) {
				host.className = rootClass;
			}
			host.setAttribute( 'data-bptm-uid', uid );
			if ( domId && host.id !== domId ) {
				host.id = domId;
			}
		}
	} );

	/* ---------------- Effects ---------------- */
	const css = useMemo( () => dynamicCss( atts, domId, uid ), [ atts, domId, uid ] );
	useFontLink( rootRef, googleFontsUrl( atts ) );
	useScrollAnimation( rootRef, seen.current );
	useTapReveal( rootRef );

	const carouselCfg = 'carousel' === view
		? {
			autoplay: !! atts.carouselAutoplay,
			hoverPause: !! atts.carouselAutoplayHoverPause,
			loop: !! atts.carouselLoop,
			speed: atts.carouselSpeed,
			timeout: atts.carouselAutoplayTimeout,
			scroll: atts.carouselItemsToScroll,
			navs: !! atts.carouselNavsEnabled,
			dots: !! atts.carouselDotsEnabled,
			cols: {
				d: Math.max( 1, parseInt( atts.columns && atts.columns.desktop, 10 ) || 4 ),
				t: Math.max( 1, parseInt( atts.columns && atts.columns.tablet, 10 ) || 3 ),
				mp: Math.max( 1, parseInt( atts.columns && atts.columns.mobilePortrait, 10 ) || 2 ),
				m: Math.max( 1, parseInt( atts.columns && atts.columns.mobile, 10 ) || 1 ),
			},
			gap: atts.columnGap,
		}
		: null;
	const stageRef = useRef( null );
	const clones = useCarousel( stageRef, 'carousel' === view && shown.length > 0, carouselCfg || {}, { slide: __( 'Go to slide %d', 'bp-team-member' ) } );

	/* ---------------- Drawer placement ---------------- */
	const containerEl = () => ( rootRef.current ? rootRef.current.querySelector( '.bptm-stage .bptm-items' ) || rootRef.current.querySelector( '.bptm-items' ) : null );
	const placeDrawer = useCallback( ( item ) => {
		const c = item ? item.parentElement : null;
		if ( ! c ) {
			return;
		}
		const top = item.offsetTop;
		let last = item;
		let n = item.nextElementSibling;
		while ( n ) {
			if ( n.classList.contains( 'bptm-item' ) && ! n.classList.contains( 'bptm-drawer' ) && ! n.hidden ) {
				if ( Math.abs( n.offsetTop - top ) > 2 ) {
					break;
				}
				last = n;
			}
			n = n.nextElementSibling;
		}
		const kids = Array.from( c.children ).filter( ( k ) => ! k.classList.contains( 'bptm-drawer' ) );
		drawerItemRef.current = item;
		setDrawerAt( kids.indexOf( last ) );
	}, [] );

	const step = ( dir ) => {
		if ( openable.length < 2 ) {
			return;
		}
		let i = openable.indexOf( modal.state.id );
		i = ( i + dir + openable.length ) % openable.length;
		const id = openable[ i ];
		const c = containerEl();
		const item = c ? c.querySelector( ':scope > .bptm-item[data-bptm-id="' + id + '"]:not(.bptm-clone)' ) : null;
		if ( 'drawer' === linkType && item ) {
			placeDrawer( item );
		}
		modal.open( id, null );
		const root = rootRef.current;
		if ( root ) {
			root.dispatchEvent( new ( root.ownerDocument.defaultView || window ).CustomEvent( 'bptm:open', { bubbles: true, detail: { id, type: linkType } } ) );
		}
	};

	// Open triggers (native listener so it also works when React renders into the server wrapper).
	const latest = useRef();
	latest.current = { modal, linkType, placeDrawer };
	useEffect( () => {
		const root = rootRef.current;
		if ( ! root ) {
			return undefined;
		}
		const onClick = ( e ) => {
			const a = e.target.closest && e.target.closest( '[data-bptm-open]' );
			if ( ! a || ! root.contains( a ) || a.closest( '.bptm-modal, .bptm-drawer' ) ) {
				return;
			}
			const L = latest.current;
			const id = a.getAttribute( 'data-bptm-id' );
			if ( ! id || a.getAttribute( 'data-bptm-open' ) !== L.linkType ) {
				return;
			}
			e.preventDefault();
			const item = a.closest( '.bptm-item' );
			if ( 'drawer' === L.linkType && L.modal.state.id === id && L.modal.state.visible && ! L.modal.state.closing ) {
				L.modal.close();
				root.dispatchEvent( new ( root.ownerDocument.defaultView || window ).CustomEvent( 'bptm:close', { bubbles: true } ) );
				return;
			}
			if ( 'drawer' === L.linkType && item ) {
				L.placeDrawer( item );
			}
			L.modal.open( id, a );
			root.dispatchEvent( new ( root.ownerDocument.defaultView || window ).CustomEvent( 'bptm:open', { bubbles: true, detail: { id, type: L.linkType } } ) );
		};
		root.addEventListener( 'click', onClick );
		return () => root.removeEventListener( 'click', onClick );
	}, [ host ] );

	// Close the detail when its member disappears (filters, paging, editor changes).
	useEffect( () => {
		if ( openId && ! openable.includes( openId ) && ! modal.state.closing ) {
			modal.close();
		}
	} );

	// Drawer arrow position + re-placement after layout changes.
	useLayoutEffect( () => {
		if ( 'drawer' !== linkType || ! openId ) {
			return;
		}
		const c = containerEl();
		const shell = modal.shellRef.current;
		const item = c ? c.querySelector( ':scope > .bptm-item[data-bptm-id="' + openId + '"]:not(.bptm-clone)' ) : null;
		if ( ! c || ! shell || ! item ) {
			return;
		}
		const cr = c.getBoundingClientRect();
		const ir = item.getBoundingClientRect();
		shell.style.setProperty( '--bptm-drawer-arrow', Math.round( ir.left + ir.width / 2 - cr.left ) + 'px' );
	} );
	useLayoutHelpers( rootRef, () => {
		if ( 'drawer' === linkType && openId && drawerItemRef.current ) {
			if ( drawerItemRef.current.hidden || ! drawerItemRef.current.isConnected ) {
				modal.close();
			} else {
				placeDrawer( drawerItemRef.current );
			}
		}
	} );

	// Filter-in animation for items that become visible again.
	const prevHidden = useRef( null );
	useLayoutEffect( () => {
		const prev = prevHidden.current;
		prevHidden.current = hiddenIds;
		if ( ! prev || ! hiddenIds || ! rootRef.current ) {
			return;
		}
		prev.forEach( ( id ) => {
			if ( ! hiddenIds.has( id ) ) {
				rootRef.current.querySelectorAll( '.bptm-items > .bptm-item[data-bptm-id="' + id + '"]' ).forEach( ( el ) => {
					el.classList.remove( 'bptm-filter-in' );
					void el.offsetWidth; // eslint-disable-line no-void
					el.classList.add( 'bptm-filter-in' );
				} );
			}
		} );
		if ( 'drawer' === linkType && openId && hiddenIds.has( openId ) ) {
			modal.close();
		} else if ( 'drawer' === linkType && openId && drawerItemRef.current && drawerItemRef.current.isConnected ) {
			placeDrawer( drawerItemRef.current );
		}
	} );

	/* ---------------- Pagination behaviour ---------------- */
	const goPage = ( n ) => {
		setPage( n );
		const root = rootRef.current;
		if ( ! isEditor && 'normal-pagination' === mode && win && win.history && 'function' === typeof win.history.pushState ) {
			try {
				win.history.pushState( { bptmPage: n }, '', pageUrl( win, pageVar, n, false ) );
			} catch ( e ) {
				// Ignore (sandboxed documents).
			}
		}
		if ( root ) {
			( root.ownerDocument.defaultView || window ).requestAnimationFrame( () => {
				const r = root.getBoundingClientRect();
				if ( r.top < 0 ) {
					root.scrollIntoView( { behavior: 'smooth', block: 'start' } );
				}
				const first = root.querySelector( '.bptm-items [data-bptm-open], .bptm-items a' );
				if ( first ) {
					first.focus( { preventScroll: true } );
				}
			} );
		}
	};
	useEffect( () => {
		if ( isEditor || ! win || 'normal-pagination' !== mode ) {
			return undefined;
		}
		const onPop = () => setPage( readPageFromUrl( win, pageVar ) );
		win.addEventListener( 'popstate', onPop );
		return () => win.removeEventListener( 'popstate', onPop );
	}, [ isEditor, win, mode, pageVar ] );

	const sentinelRef = useRef( null );
	const moreRef = useRef( more );
	moreRef.current = more;
	useEffect( () => {
		const s = sentinelRef.current;
		if ( 'load-more-scroll' !== mode || ! s || ! more ) {
			return undefined;
		}
		const w = s.ownerDocument.defaultView || window;
		if ( 'function' !== typeof w.IntersectionObserver ) {
			const onClick = () => setLoads( ( n ) => n + 1 );
			s.addEventListener( 'click', onClick );
			return () => s.removeEventListener( 'click', onClick );
		}
		const io = new w.IntersectionObserver(
			( entries ) => {
				entries.forEach( ( en ) => {
					if ( en.isIntersecting && moreRef.current ) {
						setLoads( ( n ) => n + 1 );
					}
				} );
			},
			{ rootMargin: '0px 0px 300px 0px' }
		);
		io.observe( s );
		return () => io.disconnect();
	}, [ mode, more, shown.length ] );

	/* ---------------- Filter handlers ---------------- */
	const touch = () => {
		setChangedOnce( true );
		if ( ajaxFilter ) {
			resetPaging();
		}
	};
	const onGroup = ( slug ) => {
		setFstate( ( s ) => ( { ...s, group: slug } ) );
		touch();
	};
	const onSelect = ( key, values ) => {
		setFstate( ( s ) => ( { ...s, selects: { ...s.selects, [ key ]: values } } ) );
		touch();
	};
	const onSearch = ( key, value ) => {
		setFstate( ( s ) => ( { ...s, searches: { ...s.searches, [ key ]: value } } ) );
		touch();
	};
	const onReset = () => {
		setFstate( { group: firstGroup, selects: {}, searches: {} } );
		touch();
	};

	/* ---------------- Render: items ---------------- */
	const curId = openId && ! modal.state.closing ? openId : null;
	const decorate = ( el, m, extraKey = '' ) =>
		cloneElement( el, {
			key: extraKey + m.id,
			className: cx( el.props.className, seen.current.has( m.id ) && el.props.className.indexOf( 'bptm-anim' ) !== -1 ? 'bptm-in' : '', curId === m.id ? 'is-current' : '' ),
			...( hiddenIds && hiddenIds.has( m.id ) ? { hidden: true } : {} ),
		} );

	const itemEls = [];
	if ( theme.grouped ) {
		const groups = filterTerms( 'group', atts, pool, 'includeGroups' ).map( ( g ) => ( { ...g, members: [] } ) );
		const other = [];
		shown.forEach( ( m ) => {
			let placed = false;
			( m.terms.group || [] ).forEach( ( x ) => {
				const g = groups.find( ( gg ) => gg.slug === x.slug );
				if ( g ) {
					g.members.push( m );
					placed = true;
				}
			} );
			if ( ! placed ) {
				other.push( m );
			}
		} );
		const all = groups.filter( ( g ) => g.members.length );
		if ( other.length ) {
			all.push( { slug: '', name: __( 'Others', 'bp-team-member' ), members: other } );
		}
		let idx = 0;
		all.forEach( ( g ) => {
			const allHidden = hiddenIds && g.members.every( ( m ) => hiddenIds.has( m.id ) );
			itemEls.push( h( 'div', { key: 'g-' + g.slug, className: 'bptm-group-title', 'data-group': g.slug, hidden: !! allHidden }, h( 'h3', null, g.name ) ) );
			g.members.forEach( ( m ) => {
				baseCtx.index = idx++;
				itemEls.push( decorate( renderItem( baseCtx, m ), m, 'g-' + g.slug + '-' ) );
			} );
		} );
	} else {
		shown.forEach( ( m, i ) => {
			baseCtx.index = i;
			itemEls.push( decorate( renderItem( baseCtx, m ), m ) );
		} );
	}

	const showDrawerInline = 'drawer' === linkType && modal.state.visible && drawerAt >= 0 && drawerAt < itemEls.length;
	const detailMember = modal.state.id ? pool.find( ( m ) => m.id === modal.state.id ) || list.find( ( m ) => m.id === modal.state.id ) : null;
	const shell = modalOn
		? h( ModalShell, {
			key: 'shell',
			type: linkType,
			uid,
			panelPosition: atts.panelPosition,
			drawerStyle: atts.drawerStyle,
			modal,
			navHidden: !! modal.state.visible && openable.length < 2,
			onStep: step,
			detailStyle: detailStyle( atts, linkType ),
			content: detailMember ? h( DetailPayload, { ctx: baseCtx, m: detailMember, type: linkType } ) : null,
		} )
		: null;
	if ( showDrawerInline ) {
		itemEls.splice( drawerAt + 1, 0, shell );
	}

	let itemsBlock;
	if ( ! shown.length && ( ! ajaxFilter || ! Object.keys( clientState ).length ) ) {
		itemsBlock = h( 'div', { className: 'bptm-stage' }, h( 'div', { className: 'bptm-no-members', role: 'status' }, t( 'no_members' ) ) );
	} else if ( 'table' === theme.layout ) {
		const empty = ! shown.length ? h( 'tr', { className: 'bptm-no-members-row', key: 'empty' }, h( 'td', { colSpan: 20 }, h( 'div', { className: 'bptm-no-members', role: 'status' }, t( 'no_members' ) ) ) ) : null;
		itemsBlock = h(
			'div',
			{ className: 'bptm-stage bptm-table-wrap' },
			h( 'table', { className: 'bptm-table' }, h( TableHead, { ctx: baseCtx, id: theme.id } ), h( 'tbody', { className: 'bptm-items', 'aria-live': 'polite' }, empty || itemEls ) )
		);
	} else if ( 'carousel' === view ) {
		const navs = !! atts.carouselNavsEnabled;
		const dots = !! atts.carouselDotsEnabled;
		const icons = NAV_ICONS[ atts.carouselNavsStyle ] || NAV_ICONS.default;
		const n = shown.length;
		const before = [];
		const after = [];
		for ( let k = 0; k < clones && n; k++ ) {
			const bi = ( ( ( n - clones + k ) % n ) + n ) % n;
			[ [ before, bi, 'cb' ], [ after, k % n, 'ca' ] ].forEach( ( [ arr, idx, pre ] ) => {
				cloneCtx.index = idx;
				const el = renderItem( cloneCtx, shown[ idx ] );
				arr.push( cloneElement( el, { key: pre + k, className: cx( el.props.className, 'bptm-clone' ), 'aria-hidden': 'true' } ) );
			} );
		}
		itemsBlock = h(
			'div',
			{
				className: cx( 'bptm-stage bptm-carousel', 'bptm-navs-' + atts.carouselNavsStyle, 'bptm-dots-' + atts.carouselDotsStyle, navs && 'bptm-has-navs', dots && 'bptm-has-dots' ),
				role: 'region',
				'aria-roledescription': 'carousel',
				'aria-label': __( 'Team members', 'bp-team-member' ),
				ref: stageRef,
			},
			h( 'div', { className: 'bptm-carousel-viewport' }, h( 'div', { className: 'bptm-items bptm-carousel-track' }, before, itemEls, after ) ),
			navs
				? h(
					'div',
					{ className: 'bptm-carousel-navs' },
					h( 'button', { type: 'button', className: 'bptm-nav bptm-nav-prev', 'aria-label': t( 'prev' ) }, h( 'i', { className: icons[ 0 ], 'aria-hidden': 'true' } ) ),
					h( 'button', { type: 'button', className: 'bptm-nav bptm-nav-next', 'aria-label': t( 'next' ) }, h( 'i', { className: icons[ 1 ], 'aria-hidden': 'true' } ) )
				)
				: null,
			dots ? h( 'div', { className: 'bptm-carousel-dots', role: 'tablist', 'aria-label': __( 'Choose slide', 'bp-team-member' ) } ) : null
		);
	} else {
		const inner = ! shown.length ? h( 'div', { className: 'bptm-no-members', role: 'status' }, t( 'no_members' ) ) : itemEls;
		const noResults = hiddenIds && ! shownCount ? h( 'div', { className: 'bptm-no-members bptm-no-results', role: 'status' }, t( 'no_members' ) ) : null;
		itemsBlock = h(
			'div',
			{ className: 'bptm-stage' },
			h( 'div', { className: cx( 'bptm-items', 'list' === theme.layout ? 'bptm-items--list' : '' ), 'aria-live': 'polite' }, inner ),
			noResults
		);
	}

	/* ---------------- Render: pagination ---------------- */
	let pagination = null;
	if ( mode ) {
		if ( 'normal-pagination' === mode || 'ajax-pagination' === mode ) {
			pagination = h( Numbered, { mode, page: curPage, max: maxPages, pageVar, win, isEditor, onPage: goPage } );
		} else if ( 'load-more-button' === mode ) {
			pagination = h( LoadMore, { text: String( atts.loadButtonText || '' ).trim() || t( 'load_more' ), more, onMore: () => setLoads( ( n ) => n + 1 ) } );
		} else {
			pagination = h( Infinite, { more, sentinelRef } );
		}
	}

	/* ---------------- Render: modal ---------------- */
	const portalEl = usePortal( rootRef, modalOn && 'drawer' !== linkType, rootClass, uid, isEditor );
	let modalEl = null;
	if ( modalOn && 'drawer' !== linkType ) {
		modalEl = portalEl ? createPortal( shell, portalEl ) : null;
	} else if ( 'drawer' === linkType && ! showDrawerInline ) {
		modalEl = shell;
	}

	const children = h(
		Fragment,
		null,
		css ? h( 'style', { className: 'bptm-dynamic-css' }, css ) : null,
		isFilter ? h( CatFilters, { atts, terms, group, onGroup } ) : null,
		isFilter
			? h( FilterControls, {
				atts,
				uid,
				controls,
				state: { selects, searches: fstate.searches },
				onSelect,
				onSearch,
				onReset,
				resetVisible: filterActive,
				ajax: ajaxFilter,
				status: changedOnce || ( ! atts.filterAllEnabled && terms.length ) ? ( shownCount ? String( hiddenIds ? shownCount : total ) : t( 'no_members' ) ) : '',
			} )
			: null,
		itemsBlock,
		pagination,
		modalEl
	);

	if ( host ) {
		return children;
	}
	return h( 'div', { id: domId, className: rootClass, 'data-bptm-uid': uid, ref: ownRef }, children );
};

export default TeamMembers;
