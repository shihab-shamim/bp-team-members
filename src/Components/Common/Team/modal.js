/**
 * Popup / panel (dialog shells portalled to <body>) and the inline drawer shell.
 * ESC + overlay close, focus trap, focus restore, body scroll lock, prev / next across openable
 * members, arrow keys. Uses the root element's own document / window (editor canvas iframe safe).
 */
import { createElement as h, createPortal, useEffect, useLayoutEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { t } from './bridge';

const CLOSE_SVG = h(
	'svg',
	{ viewBox: '0 0 24 24', width: '20', height: '20', 'aria-hidden': 'true', focusable: 'false' },
	h( 'path', {
		d: 'M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 1 0-1.4 1.4l4.9 4.9-4.9 4.9a1 1 0 1 0 1.4 1.4l4.9-4.9 4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4z',
		fill: 'currentColor',
	} )
);

const FOCUSABLE = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

export const focusables = ( ctx ) =>
	Array.from( ctx.querySelectorAll( FOCUSABLE ) ).filter( ( el ) => ! el.closest( '[hidden], [inert]' ) && ( el.offsetWidth || el.offsetHeight || el.getClientRects().length ) );

/* Body scroll lock, reference counted per document. */
const locks = new WeakMap();
export const lockScroll = ( doc ) => {
	const n = ( locks.get( doc ) || 0 ) + 1;
	locks.set( doc, n );
	if ( n > 1 ) {
		return;
	}
	const html = doc.documentElement;
	const win = doc.defaultView || window;
	html.style.setProperty( '--bptm-scrollbar', win.innerWidth - html.clientWidth + 'px' );
	html.classList.add( 'bptm-scroll-lock' );
};
export const unlockScroll = ( doc ) => {
	const n = Math.max( 0, ( locks.get( doc ) || 0 ) - 1 );
	locks.set( doc, n );
	if ( 0 === n ) {
		doc.documentElement.classList.remove( 'bptm-scroll-lock' );
		doc.documentElement.style.removeProperty( '--bptm-scrollbar' );
	}
};

/**
 * Portal container (`.bptm-wrap.bptm-portal` at the end of <body>) keeping the root's theme classes.
 *
 * @param {Object}  rootRef  Root element ref.
 * @param {boolean} enabled  Popup / panel in use.
 * @param {string}  classes  Root classes.
 * @param {string}  uid      Instance uid.
 * @param {boolean} isEditor Editor canvas (links never navigate).
 * @return {Element|null} Container.
 */
export const usePortal = ( rootRef, enabled, classes, uid, isEditor ) => {
	const [ el, setEl ] = useState( null );
	useLayoutEffect( () => {
		const root = rootRef.current;
		if ( ! enabled || ! root ) {
			return undefined;
		}
		const doc = root.ownerDocument;
		const portal = doc.createElement( 'div' );
		portal.setAttribute( 'data-bptm-portal', uid );
		const win = doc.defaultView || window;
		if ( 'rtl' === win.getComputedStyle( root ).direction ) {
			portal.setAttribute( 'dir', 'rtl' );
		}
		const stop = ( e ) => {
			const a = e.target && e.target.closest ? e.target.closest( 'a[href]' ) : null;
			if ( a ) {
				e.preventDefault();
			}
		};
		if ( isEditor ) {
			portal.addEventListener( 'click', stop );
		}
		( doc.body || doc.documentElement ).appendChild( portal );
		setEl( portal );
		return () => {
			portal.removeEventListener( 'click', stop );
			portal.remove();
			setEl( null );
		};
	}, [ enabled, uid ] );
	useLayoutEffect( () => {
		if ( el ) {
			const keep = String( classes )
				.split( /\s+/ )
				.filter( ( c ) => /^bptm-(wrap|theme-|group-|layout-|link-|align-|imgfx-|imghfx-)/.test( c ) || 'wp-block-icb-fold-out-reveal' === c );
			el.className = keep.concat( [ 'bptm-portal' ] ).join( ' ' );
		}
	} );
	return el;
};

/**
 * Modal controller state + behaviour.
 *
 * @param {Object} opts { type, rootRef, openable: () => string[], onRequestDrawerPlace }.
 * @return {Object} API.
 */
export const useModal = ( { type, rootRef } ) => {
	const [ state, setState ] = useState( { id: null, visible: false, isOpen: false } );
	const shellRef = useRef( null );
	const lastFocus = useRef( null );
	const closeTimer = useRef( null );
	// Set while closing so the focus trap lets focus go back to the trigger.
	const closing = useRef( false );
	const stateRef = useRef( state );
	stateRef.current = state;

	const doc = () => ( rootRef.current ? rootRef.current.ownerDocument : document );
	const win = () => doc().defaultView || window;

	const open = ( id, trigger ) => {
		if ( trigger ) {
			lastFocus.current = trigger;
		}
		closing.current = false;
		if ( closeTimer.current ) {
			win().clearTimeout( closeTimer.current );
			closeTimer.current = null;
		}
		const wasOpen = stateRef.current.visible && stateRef.current.isOpen;
		setState( { id, visible: true, isOpen: wasOpen } );
	};

	const close = () => {
		const s = stateRef.current;
		if ( ! s.visible || null === s.id ) {
			return;
		}
		const shell = shellRef.current;
		const dur = shell ? parseFloat( win().getComputedStyle( shell ).getPropertyValue( '--bptm-modal-speed' ) ) || 0 : 0;
		const reduced = 'function' === typeof win().matchMedia && win().matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		const back = lastFocus.current && lastFocus.current.isConnected ? lastFocus.current : null;
		const closedId = s.id;
		closing.current = true;
		if ( dur > 0 && ! reduced ) {
			setState( { id: closedId, visible: true, isOpen: false, closing: true } );
			closeTimer.current = win().setTimeout( () => {
				closeTimer.current = null;
				setState( { id: null, visible: false, isOpen: false } );
			}, dur );
		} else {
			setState( { id: null, visible: false, isOpen: false } );
		}
		const root = rootRef.current;
		const fallback = root ? root.querySelector( '.bptm-item[data-bptm-id="' + String( closedId ).replace( /["\\]/g, '' ) + '"] [data-bptm-open]' ) : null;
		const target = back || fallback;
		if ( target ) {
			target.focus( { preventScroll: true } );
		}
		lastFocus.current = null;
	};

	// Enter transition: add `is-open` two frames after the shell became visible.
	useEffect( () => {
		if ( state.visible && ! state.isOpen && ! state.closing && null !== state.id ) {
			const w = win();
			let r2 = 0;
			const r1 = w.requestAnimationFrame( () => {
				r2 = w.requestAnimationFrame( () => setState( ( s ) => ( s.visible && ! s.closing ? { ...s, isOpen: true } : s ) ) );
			} );
			return () => {
				w.cancelAnimationFrame( r1 );
				w.cancelAnimationFrame( r2 );
			};
		}
		return undefined;
	}, [ state.visible, state.isOpen, state.closing, state.id ] );

	// Scroll lock + host class for dialogs; document-level ESC / focus containment.
	const active = state.visible && ! state.closing;
	useEffect( () => {
		if ( ! active || ! rootRef.current ) {
			return undefined;
		}
		const d = doc();
		const root = rootRef.current;
		if ( 'drawer' !== type ) {
			lockScroll( d );
			root.classList.add( 'bptm-modal-open-host' );
			const onFocus = ( e ) => {
				const shell = shellRef.current;
				if ( shell && ! closing.current && ! shell.contains( e.target ) ) {
					const c = shell.querySelector( '.bptm-modal-content' );
					if ( c ) {
						c.focus();
					}
				}
			};
			const onKey = ( e ) => {
				if ( 'Escape' === e.key ) {
					close();
				}
			};
			d.addEventListener( 'focusin', onFocus );
			d.addEventListener( 'keydown', onKey );
			return () => {
				d.removeEventListener( 'focusin', onFocus );
				d.removeEventListener( 'keydown', onKey );
				root.classList.remove( 'bptm-modal-open-host' );
				unlockScroll( d );
			};
		}
		const onDrawerKey = ( e ) => {
			if ( 'Escape' !== e.key || e.defaultPrevented ) {
				return;
			}
			if ( d.querySelector( '.bptm-modal.is-open:not([hidden])' ) ) {
				return;
			}
			close();
		};
		d.addEventListener( 'keydown', onDrawerKey );
		return () => d.removeEventListener( 'keydown', onDrawerKey );
	}, [ active, type ] );

	useEffect(
		() => () => {
			if ( closeTimer.current ) {
				win().clearTimeout( closeTimer.current );
			}
		},
		[]
	);

	return { state, open, close, shellRef };
};

/**
 * Popup / panel dialog shell or drawer shell.
 *
 * @param {Object} props Props.
 * @return {Element} Shell.
 */
export const ModalShell = ( { type, uid, panelPosition, drawerStyle, modal, content, navHidden, onStep, detailStyle } ) => {
	const { state, close, shellRef } = modal;
	const contentRef = useRef( null );
	const shown = state.visible;

	// Focus the content when a member opens / changes; reset scroll.
	useEffect( () => {
		if ( ! shown || null === state.id || state.closing ) {
			return;
		}
		const c = contentRef.current;
		if ( ! c ) {
			return;
		}
		c.scrollTop = 0;
		const dialog = shellRef.current && shellRef.current.querySelector( '.bptm-modal-dialog' );
		if ( dialog ) {
			dialog.scrollTop = 0;
		}
		c.focus( { preventScroll: 'drawer' === type } );
		if ( 'drawer' === type && shellRef.current ) {
			const w = shellRef.current.ownerDocument.defaultView || window;
			const r = shellRef.current.getBoundingClientRect();
			if ( r.bottom > w.innerHeight || r.top < 0 ) {
				shellRef.current.scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
			}
		}
	}, [ state.id, shown ] );

	const onClick = ( e ) => {
		if ( e.target.closest( '[data-bptm-close]' ) ) {
			e.preventDefault();
			close();
		} else if ( e.target.closest( '[data-bptm-prev]' ) ) {
			e.preventDefault();
			onStep( -1 );
		} else if ( e.target.closest( '[data-bptm-next]' ) ) {
			e.preventDefault();
			onStep( 1 );
		}
	};

	const onKeyDown = ( e ) => {
		if ( 'Escape' === e.key ) {
			e.preventDefault();
			e.stopPropagation();
			close();
			return;
		}
		const shell = shellRef.current;
		if ( ! shell ) {
			return;
		}
		const w = shell.ownerDocument.defaultView || window;
		if ( ( 'ArrowLeft' === e.key || 'ArrowRight' === e.key ) && ! /INPUT|TEXTAREA|SELECT/.test( e.target.tagName ) ) {
			const rtl = 'rtl' === w.getComputedStyle( shell ).direction;
			const dir = 'ArrowRight' === e.key ? 1 : -1;
			onStep( rtl ? -dir : dir );
			return;
		}
		if ( 'Tab' === e.key && 'drawer' !== type ) {
			const dialog = shell.querySelector( '.bptm-modal-dialog' ) || shell;
			const f = focusables( dialog );
			if ( ! f.length ) {
				e.preventDefault();
				return;
			}
			const first = f[ 0 ];
			const last = f[ f.length - 1 ];
			const activeEl = shell.ownerDocument.activeElement;
			if ( e.shiftKey && ( activeEl === first || ! dialog.contains( activeEl ) ) ) {
				e.preventDefault();
				last.focus();
			} else if ( ! e.shiftKey && activeEl === last ) {
				e.preventDefault();
				first.focus();
			}
		}
	};

	const styleAttr = shown && null !== state.id ? { 'data-bptm-style': detailStyle } : {};
	const contentEl = h( 'div', { className: 'bptm-modal-content', tabIndex: -1, ref: contentRef }, content );

	if ( 'drawer' === type ) {
		return h(
			'div',
			{
				className: 'bptm-drawer bptm-drawer--' + String( drawerStyle || 'default' ).replace( /[^A-Za-z0-9_-]/g, '' ) + ( state.isOpen ? ' is-open' : '' ),
				'data-bptm-for': uid,
				role: 'region',
				'aria-label': __( 'Member details', 'bp-team-member' ),
				hidden: ! shown,
				ref: shellRef,
				onClick,
				onKeyDown,
				...styleAttr,
			},
			h( 'div', { className: 'bptm-drawer-arrow', 'aria-hidden': 'true' } ),
			h(
				'div',
				{ className: 'bptm-drawer-inner' },
				h( 'button', { type: 'button', className: 'bptm-modal-close', 'data-bptm-close': '', 'aria-label': __( 'Close', 'bp-team-member' ) }, CLOSE_SVG ),
				contentEl,
				h(
					'div',
					{ className: 'bptm-modal-nav', hidden: navHidden },
					h( 'button', { type: 'button', className: 'bptm-modal-prev', 'data-bptm-prev': '', 'aria-label': t( 'prev' ) }, h( 'i', { className: 'fas fa-angle-left', 'aria-hidden': 'true' } ) ),
					h( 'button', { type: 'button', className: 'bptm-modal-next', 'data-bptm-next': '', 'aria-label': t( 'next' ) }, h( 'i', { className: 'fas fa-angle-right', 'aria-hidden': 'true' } ) )
				)
			)
		);
	}

	let side = '';
	if ( 'panel' === type ) {
		side = ' bptm-panel-' + ( [ 'left', 'right', 'center' ].includes( panelPosition ) ? panelPosition : 'right' );
	}
	return h(
		'div',
		{
			className: 'bptm-modal bptm-modal--' + type + side + ( state.isOpen ? ' is-open' : '' ),
			'data-bptm-for': uid,
			hidden: ! shown,
			ref: shellRef,
			onClick,
			onKeyDown,
			...styleAttr,
		},
		h( 'div', { className: 'bptm-modal-overlay', 'data-bptm-close': '' } ),
		h(
			'div',
			{ className: 'bptm-modal-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': __( 'Member details', 'bp-team-member' ) },
			h( 'button', { type: 'button', className: 'bptm-modal-close', 'data-bptm-close': '', 'aria-label': __( 'Close', 'bp-team-member' ) }, CLOSE_SVG ),
			contentEl,
			h(
				'div',
				{ className: 'bptm-modal-nav', hidden: navHidden },
				h( 'button', { type: 'button', className: 'bptm-modal-prev', 'data-bptm-prev': '', 'aria-label': t( 'prev' ) }, h( 'i', { className: 'fas fa-angle-left', 'aria-hidden': 'true' } ), h( 'span', null, t( 'prev' ) ) ),
				h( 'button', { type: 'button', className: 'bptm-modal-next', 'data-bptm-next': '', 'aria-label': t( 'next' ) }, h( 'span', null, t( 'next' ) ), h( 'i', { className: 'fas fa-angle-right', 'aria-hidden': 'true' } ) )
			)
		)
	);
};

export { createPortal };
