/**
 * Render context (port of the former PHP Context): one per instance + visibility group.
 * Helpers return React nodes, or null when the part is hidden / empty (templates test truthiness,
 * exactly like the PHP templates tested for '').
 */
import { createElement as h, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { anyDevice, hideClasses, socialHref, termNames, termSlugs, searchText } from './model';
import { t, pref } from './bridge';
import * as S from './sanitize';
import socialIcons from './socialIcons.json';
import { VIS_GROUPS } from './registry';

const cx = ( ...parts ) => parts.filter( Boolean ).join( ' ' ).replace( /\s+/g, ' ' ).trim();

/** Fragment of non-empty parts (null when every part is empty). */
export const join = ( ...parts ) => {
	const list = parts.flat().filter( ( p ) => null !== p && undefined !== p && false !== p && '' !== p );
	if ( ! list.length ) {
		return null;
	}
	return list.length === 1 ? list[ 0 ] : h( Fragment, null, ...list.map( ( p, i ) => h( Fragment, { key: i }, p ) ) );
};

const LINK_HREF_PROTOCOLS = [ 'http', 'https', 'mailto', 'tel', 'skype', 'callto', 'sms', 'viber', 'whatsapp' ];

/**
 * Create a context.
 *
 * @param {Object} base { atts, theme, uid, view, linkType, vis, isEditor }.
 * @param {string} group Visibility group: initial | popup | panel | drawer.
 * @return {Object} Context.
 */
export const makeContext = ( base, group = 'initial' ) => {
	const ctx = { ...base, group: VIS_GROUPS.includes( group ) ? group : 'initial' };
	const { atts } = ctx;
	const ip = ( name ) => ( ctx.clone ? {} : { itemProp: name } );

	ctx.withGroup = ( g ) => makeContext( base, g );
	ctx.asClone = () => makeContext( { ...base, clone: true }, ctx.group );
	ctx.isDetail = () => 'initial' !== ctx.group;
	ctx.attr = ( k, d ) => ( Object.prototype.hasOwnProperty.call( atts, k ) ? atts[ k ] : d );

	ctx.show = ( field ) => {
		const g = ctx.vis[ ctx.group ] || {};
		if ( ! g[ field ] ) {
			return 'initial' !== ctx.group;
		}
		return anyDevice( g[ field ] );
	};
	ctx.vis_classes = ( field, extra = '' ) => {
		const g = ctx.vis[ ctx.group ] || {};
		return cx( extra, hideClasses( g[ field ] ) );
	};

	/* ---------------- Links ---------------- */
	ctx.memberLinkType = ( m ) => ( 'custom' === ctx.linkType && ! m.custom_page ? 'none' : ctx.linkType );
	ctx.modalEnabled = () => [ 'popup', 'panel', 'drawer' ].includes( ctx.linkType );
	ctx.hasLink = ( m ) => 'none' !== ctx.memberLinkType( m ) && ! ctx.isDetail();
	ctx.detailId = ( m ) => 'bptm-detail-' + ctx.uid + '-' + ( m.id || 'm0' );

	const isInternal = ( u ) => {
		const mm = /^(?:[a-z][a-z0-9+.-]*:)?\/\/([^/?#]+)/i.exec( u );
		if ( ! mm ) {
			return true;
		}
		const host = 'undefined' !== typeof window ? window.location.host : '';
		return mm[ 1 ].toLowerCase() === String( host ).toLowerCase();
	};

	/** Props of the member link (null when not linked). */
	ctx.linkProps = ( m, cls = '' ) => {
		if ( ! ctx.hasLink( m ) ) {
			return null;
		}
		const type = ctx.memberLinkType( m );
		const p = { className: cx( 'bptm-link', cls ) };
		if ( [ 'popup', 'panel', 'drawer' ].includes( type ) ) {
			p.href = '#' + ctx.detailId( m );
			p.className += ' bptm-open';
			p[ 'data-bptm-open' ] = type;
			p[ 'data-bptm-id' ] = m.id;
			p.role = 'button';
			p[ 'aria-haspopup' ] = 'drawer' === type ? 'true' : 'dialog';
			p[ 'aria-controls' ] = ctx.detailId( m );
		} else {
			p.href = S.url( m.custom_page, LINK_HREF_PROTOCOLS );
			if ( ! isInternal( m.custom_page ) || '_blank' === atts.linkTarget ) {
				p.target = '_blank';
				p.rel = 'noopener';
			}
		}
		return p;
	};
	ctx.wrapLink = ( m, children, cls = '' ) => {
		const p = ctx.linkProps( m, cls );
		return p ? h( 'a', p, children ) : children;
	};

	/* ---------------- Item wrapper ---------------- */
	/** Props for the item root (classes, filter data, schema). */
	ctx.itemProps = ( m, extra = [] ) => {
		const classes = [ 'bptm-item', ...extra ];
		if ( m.featured ) {
			classes.push( 'bptm-is-featured' );
		}
		if ( atts.enableScrollAnimation && 'carousel' !== ctx.view ) {
			classes.push( 'bptm-anim' );
		}
		const type = ctx.memberLinkType( m );
		if ( 'none' !== type ) {
			classes.push( 'bptm-linked-' + type );
		}
		const p = {
			className: [ ...new Set( classes.filter( Boolean ) ) ].join( ' ' ),
			'data-bptm-id': m.id,
			'data-name': S.lower( m.name ),
		};
		if ( 'carousel' !== ctx.view ) {
			p[ 'data-designation' ] = '' !== m.designation ? S.termSlug( m.designation ) : '';
			p[ 'data-company' ] = S.lower( m.company );
			p[ 'data-zip' ] = S.lower( m.zip_code );
			p[ 'data-tags' ] = ( m.terms.tag || [] ).map( ( x ) => S.lower( x.name ) ).join( '|' );
			[ 'group', 'location', 'language', 'gender', 'specialty', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five' ].forEach( ( k ) => {
				const slugs = termSlugs( m, k );
				if ( slugs.length ) {
					p[ 'data-' + k.replace( /_/g, '-' ) ] = slugs.join( ' ' );
				}
			} );
			if ( pref( 'search_all_fields' ) ) {
				p[ 'data-search' ] = S.lower( searchText( m ) );
			}
		}
		if ( ! ctx.clone ) {
			p.itemScope = true;
			p.itemType = 'https://schema.org/Person';
		}
		return p;
	};

	/* ---------------- Images ---------------- */
	const noLazyClasses = () => {
		const out = [];
		String( pref( 'lazy_load_class' ) || '' ).trim().split( /[\s,]+/ ).forEach( ( c ) => {
			c = S.htmlClass( c );
			if ( c && ! out.includes( c ) ) {
				out.push( c );
			}
		} );
		return out;
	};

	const imgTag = ( u, alt, cls, itemprop ) => {
		const p = { className: '', alt: S.stripTags( alt ) };
		let classes = cls.split( /\s+/ ).filter( Boolean ).map( S.htmlClass ).join( ' ' );
		if ( pref( 'disable_lazy_load' ) ) {
			classes = cx( classes, noLazyClasses().join( ' ' ) );
			p.loading = 'eager';
			p[ 'data-no-lazy' ] = '1';
		} else {
			p.loading = ( ctx.index || 0 ) < 4 && 'carousel' !== ctx.view && ! ctx.isDetail() ? 'eager' : 'lazy';
			p.decoding = 'async';
		}
		p.className = classes;
		if ( itemprop && ! ctx.clone ) {
			p.itemProp = itemprop;
		}
		if ( ! u ) {
			return h( 'span', { className: p.className + ' bptm-img-placeholder bptm-img-empty', role: 'img', 'aria-label': p.alt } );
		}
		return h( 'img', { src: u, ...p } );
	};

	/** Thumbnail (wrapped in the member link when "Link Image" is on). */
	ctx.image = ( m, cls = 'bptm-img', linkable = true ) => {
		if ( ! ctx.show( 'thumbnail' ) ) {
			return null;
		}
		let img = imgTag( m.image_url, m.image_alt || m.name, cls, 'image' );
		const vc = ctx.vis_classes( 'thumbnail' );
		if ( vc ) {
			img = h( 'span', { className: 'bptm-vis ' + vc }, img );
		}
		if ( linkable && atts.linkPreviewImage && ctx.hasLink( m ) ) {
			img = h( 'a', ctx.linkProps( m, 'bptm-img-link' ), img );
		}
		return img;
	};

	/** Flip (back side) image; null when the member has none. */
	ctx.flipImage = ( m, cls = 'bptm-img bptm-flip-img' ) => {
		if ( ! m.flip_image_id && ! m.flip_image_url ) {
			return null;
		}
		return imgTag( m.flip_image_url, m.name, cls, '' );
	};

	/* ---------------- Text parts ---------------- */
	ctx.name = ( m, tag = 'h3' ) => {
		if ( ! ctx.show( 'name' ) || '' === m.name ) {
			return null;
		}
		tag = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'span', 'td', 'strong' ].includes( tag ) ? tag : 'h3';
		const inner = h( 'span', ip( 'name' ), m.name );
		const lp = ctx.linkProps( m, 'bptm-name-link' );
		return h( tag, { className: ctx.vis_classes( 'name', 'bptm-name' ) }, lp ? h( 'a', lp, inner ) : inner );
	};

	ctx.designation = ( m, tag = 'div' ) => {
		if ( ! ctx.show( 'designation' ) || '' === m.designation ) {
			return null;
		}
		tag = [ 'div', 'p', 'span', 'td', 'h4', 'h5', 'h6' ].includes( tag ) ? tag : 'div';
		return h( tag, { className: ctx.vis_classes( 'designation', 'bptm-designation' ), ...ip( 'jobTitle' ) }, m.designation );
	};

	ctx.details = ( m ) => {
		if ( ! ctx.show( 'details' ) ) {
			return null;
		}
		let classes = 'bptm-details';
		if ( atts.descScrollControl ) {
			classes += ' bptm-scroll';
		}
		let inner;
		if ( ctx.isDetail() || atts.allowHtmlDetails ) {
			let nodes = m.content || [];
			if ( '' === S.nodesText( nodes ).trim() ) {
				nodes = '' !== m.excerpt ? S.textParagraphs( m.excerpt ) : [];
			}
			if ( '' === S.nodesText( nodes ).trim() ) {
				return null;
			}
			inner = S.nodesToReact( nodes );
		} else {
			let txt = '' !== m.excerpt.trim() ? m.excerpt : S.nodesText( m.content || [] );
			txt = S.decodeEntities( S.stripTags( txt.replace( /\[\/?[a-z][^\]]*\]/gi, '' ) ) ).replace( /[\s]+/g, ' ' ).trim();
			if ( '' === txt ) {
				return null;
			}
			const max = Math.trunc( Number( atts.detailsLength ) ) || 0;
			const chars = Array.from( txt );
			let p;
			if ( max > 0 && chars.length > max ) {
				const cut = chars.slice( 0, max ).join( '' ).replace( /\s+$/, '' ) + '…';
				const lp = ctx.linkProps( m, 'bptm-more' );
				p = lp ? [ cut, ' ', h( 'a', { ...lp, key: 'more' }, t( 'more' ) ) ] : [ cut ];
			} else {
				p = [ txt ];
			}
			inner = [ h( 'p', { key: 'p' }, ...p ) ];
		}
		return h( 'div', { className: ctx.vis_classes( 'details', classes ), ...ip( 'description' ) }, ...inner );
	};

	/* ---------------- Social ---------------- */
	ctx.social = ( m, style = '' ) => {
		if ( ! ctx.show( 'social' ) || ! m.social.length ) {
			return null;
		}
		const items = [];
		m.social.forEach( ( s ) => {
			if ( ! s.icon ) {
				return;
			}
			const href = socialHref( s );
			if ( '' === href ) {
				return;
			}
			const icon = s.icon.replace( /[^a-z0-9 _-]/gi, '' );
			let label = socialIcons[ s.icon ];
			if ( ! label ) {
				let l = icon;
				[ 'fa-brands', 'fa-solid', 'fa-regular', 'fab', 'fas', 'far', 'fa-', '-' ].forEach( ( x ) => {
					l = l.split( x ).join( ' ' );
				} );
				label = l.trim().replace( /(^|[\s])([a-z])/g, ( mm, a, b ) => a + b.toUpperCase() );
			}
			const slug = S.htmlClass( icon.split( 'fa-' ).join( '' ).replace( /\b(fab|fas|far|fa-brands|fa-solid|fa-regular)\b/g, '' ).trim() );
			items.push( [ href, icon, label, slug ] );
		} );
		if ( ! items.length ) {
			return null;
		}
		return h(
			'ul',
			{ className: ctx.vis_classes( 'social', 'bptm-social' + ( style ? ' bptm-social--' + S.htmlClass( style ) : '' ) ) },
			items.map( ( [ href, icon, label, slug ], i ) => {
				const safe = S.url( href, LINK_HREF_PROTOCOLS );
				const web = /^https?:\/\//i.test( href );
				const ap = {
					className: 'bptm-social-link bptm-social-' + slug,
					href: safe,
					...( web ? { target: '_blank', rel: 'noopener nofollow' } : {} ),
					...ip( 'sameAs' ),
					'aria-label': label,
					title: label,
				};
				return h( 'li', { className: 'bptm-social-item', key: i }, h( 'a', ap, h( 'i', { className: icon, 'aria-hidden': 'true' } ) ) );
			} )
		);
	};

	ctx.ribbon = ( m ) => {
		if ( ! ctx.show( 'ribbon' ) || '' === m.ribbon.trim() ) {
			return null;
		}
		return h( 'span', { className: ctx.vis_classes( 'ribbon', 'bptm-ribbon' ) }, m.ribbon );
	};

	ctx.featuredBadge = ( m ) => {
		if ( ! m.featured || ! atts.enableFeaturing || ! ctx.show( 'featured_badge' ) ) {
			return null;
		}
		return h(
			'span',
			{ className: ctx.vis_classes( 'featured_badge', 'bptm-featured' ), title: __( 'Featured', 'bp-team-member' ) },
			h( 'i', { className: 'fas fa-award', 'aria-hidden': 'true' } ),
			h( 'span', { className: 'screen-reader-text' }, __( 'Featured', 'bp-team-member' ) )
		);
	};

	ctx.skills = ( m, title = null ) => {
		if ( ! ctx.show( 'skills' ) || ! m.skills.length ) {
			return null;
		}
		const list = m.skills.filter( ( s ) => '' !== s.skill.trim() && s.percent > 0 );
		if ( ! list.length ) {
			return null;
		}
		const showTitle = null === title ? ctx.isDetail() : !! title;
		return h(
			'div',
			{ className: ctx.vis_classes( 'skills', 'bptm-skills' ) },
			showTitle ? h( 'h4', { className: 'bptm-skills-title' }, t( 'skills' ) ) : null,
			list.map( ( s, i ) =>
				h(
					'div',
					{ className: 'bptm-skill', key: i },
					h( 'div', { className: 'bptm-skill-head' }, h( 'span', { className: 'bptm-skill-name' }, s.skill.trim() ), h( 'span', { className: 'bptm-skill-value' }, s.percent + '%' ) ),
					h(
						'div',
						{ className: 'bptm-skill-bar', role: 'progressbar', 'aria-label': s.skill.trim(), 'aria-valuenow': String( s.percent ), 'aria-valuemin': '0', 'aria-valuemax': '100' },
						h( 'span', { className: 'bptm-skill-fill', style: { '--bptm-skill': s.percent + '%' } } )
					)
				)
			)
		);
	};

	/* ---------------- Meta ---------------- */
	const breakable = ( txt ) =>
		h(
			'span',
			{ className: 'bptm-email-text' },
			String( txt ).split( /(@|\.)/ ).map( ( part, i ) => {
				if ( '@' === part ) {
					return h( Fragment, { key: i }, '@', h( 'wbr' ) );
				}
				if ( '.' === part ) {
					return h( Fragment, { key: i }, h( 'wbr' ), '.' );
				}
				return part;
			} )
		);

	const phone = ( num, prefKey ) => {
		num = String( num || '' ).trim();
		if ( '' === num ) {
			return null;
		}
		const txt = h( 'span', ip( 'telephone' ), num );
		if ( pref( prefKey ) ) {
			return h( 'a', { href: S.url( 'tel:' + num.replace( /[^\d+]/g, '' ), [ 'tel' ] ) }, txt );
		}
		return txt;
	};

	ctx.mailto = ( m ) => {
		const q = [];
		if ( m.email_cc ) {
			q.push( 'cc=' + encodeURIComponent( m.email_cc ).replace( /[!'()*]/g, ( c ) => '%' + c.charCodeAt( 0 ).toString( 16 ).toUpperCase() ) );
		}
		if ( m.email_bcc ) {
			q.push( 'bcc=' + encodeURIComponent( m.email_bcc ).replace( /[!'()*]/g, ( c ) => '%' + c.charCodeAt( 0 ).toString( 16 ).toUpperCase() ) );
		}
		return 'mailto:' + m.email + ( q.length ? '?' + q.join( '&' ) : '' );
	};

	const emailValue = ( m ) => {
		if ( '' === m.email ) {
			return null;
		}
		const txt = h( 'span', ip( 'email' ), breakable( m.email ) );
		if ( ! pref( 'email_link' ) ) {
			return txt;
		}
		return h( 'a', { href: S.url( ctx.mailto( m ), [ 'mailto' ] ) }, txt );
	};

	/** Visible meta rows in display order: [{ field, label, value (node), icon, classes }]. */
	ctx.metaRows = ( m ) => {
		const rows = [];
		const texts = {
			address: m.address,
			land_phone: String( m.land_phone || '' ).trim(),
			cell_phone: String( m.cell_phone || '' ).trim(),
			email: m.email,
			zip: m.zip_code,
		};
		const add = ( field, label, value, icon, empty ) => {
			if ( empty || null === value || ! ctx.show( field ) ) {
				return;
			}
			const text = 'string' === typeof value ? value : texts[ field ] || '';
			rows.push( { field, label, value, icon, text: String( text ).trim(), classes: ctx.vis_classes( field, 'bptm-meta-item bptm-meta-' + field.replace( /_/g, '-' ) ) } );
		};
		let company = null;
		if ( '' !== m.company || '' !== m.company_website ) {
			const txt = '' !== m.company ? m.company : m.company_website.replace( /^https?:\/\//, '' );
			texts.company = txt;
			company = '' !== m.company_website ? h( 'a', { href: S.url( m.company_website ), target: '_blank', rel: 'nofollow noopener' }, '' !== m.company ? txt : breakable( txt ) ) : txt;
			company = h( 'span', ip( 'worksFor' ), company );
		}
		add( 'company', t( 'company' ), company, 'fas fa-briefcase', null === company );
		add( 'address', t( 'address' ), '' !== m.address ? h( 'span', ip( 'address' ), m.address ) : null, 'fas fa-location-dot' );
		add( 'land_phone', t( 'land_phone' ), phone( m.land_phone, 'land_phone_link' ), 'fas fa-phone' );
		add( 'cell_phone', t( 'cell_phone' ), phone( m.cell_phone, 'cell_phone_link' ), 'fas fa-mobile-screen' );
		add( 'email', t( 'email' ), emailValue( m ), 'fas fa-envelope' );
		const icons = { location: 'fas fa-map-pin', language: 'fas fa-language', specialty: 'fas fa-star', gender: 'fas fa-venus-mars' };
		[ 'location', 'language', 'specialty', 'gender' ].forEach( ( k ) => {
			const v = termNames( m, k );
			add( k, t( k ), '' !== v.trim() ? v : null, icons[ k ] );
		} );
		add( 'zip', t( 'zip_code' ), '' !== m.zip_code ? h( 'span', ip( 'postalCode' ), m.zip_code ) : null, 'fas fa-map-location-dot' );
		[ 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five' ].forEach( ( k ) => {
			const v = termNames( m, k );
			add( k, t( k ), '' !== v.trim() ? v : null, 'fas fa-circle-info' );
		} );
		return rows;
	};

	ctx.metaDetails = ( m, variant = 'list' ) => {
		const rows = ctx.metaRows( m );
		if ( ! rows.length ) {
			return null;
		}
		variant = [ 'list', 'icons', 'inline', 'table' ].includes( variant ) ? variant : 'list';
		if ( 'table' === variant ) {
			return h(
				'table',
				{ className: 'bptm-meta bptm-meta--table' },
				h(
					'tbody',
					null,
					rows.map( ( r ) => h( 'tr', { className: r.classes, key: r.field }, h( 'th', { scope: 'row', className: 'bptm-meta-label' }, r.label ), h( 'td', { className: 'bptm-meta-value' }, r.value ) ) )
				)
			);
		}
		return h(
			'ul',
			{ className: 'bptm-meta bptm-meta--' + variant },
			rows.map( ( r ) =>
				h(
					'li',
					{ className: r.classes, key: r.field },
					'list' !== variant ? h( 'i', { className: 'bptm-meta-icon ' + r.icon, 'aria-hidden': 'true' } ) : null,
					h( 'span', { className: 'bptm-meta-label' + ( 'list' !== variant ? ' screen-reader-text' : '' ) }, r.label ),
					h( 'span', { className: 'bptm-meta-value' }, r.value )
				)
			)
		);
	};

	ctx.vcard = ( m ) => {
		if ( ! m.vcard || ! ctx.show( 'vcard' ) ) {
			return null;
		}
		return h( 'a', { className: ctx.vis_classes( 'vcard', 'bptm-vcard' ), href: S.url( m.vcard ), download: '' }, h( 'i', { className: 'fas fa-address-card', 'aria-hidden': 'true' } ), ' ', h( 'span', null, t( 'vcard' ) ) );
	};

	ctx.readMore = ( m, txt = '' ) => {
		if ( ! ctx.show( 'read_more' ) || ! ctx.hasLink( m ) ) {
			return null;
		}
		return h( 'div', { className: ctx.vis_classes( 'read_more', 'bptm-readmore' ) }, h( 'a', ctx.linkProps( m, 'bptm-readmore-btn' ), txt || t( 'read_on' ) ) );
	};

	ctx.termsText = ( m, k, sep = ', ' ) => termNames( m, k, sep );

	return ctx;
};

export { cx };
