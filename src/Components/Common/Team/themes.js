/**
 * Item templates of all themes (ports of templates/themes/*.php). Same markup and class names as the
 * former PHP templates so the theme CSS applies unchanged.
 */
import { createElement as h } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { join, cx } from './context';
import { META_FIELDS, themeFamily } from './registry';
import { t, termLabel } from './bridge';
import { color as cssColor, length as cssLength } from './css';

const div = ( className, ...children ) => h( 'div', { className }, ...children );

/* ================================================================== */
/* Registry A helpers (grid / circle / horizontal / flip)              */
/* ================================================================== */

const taPart = ( ctx, m, field, ...args ) => {
	if ( ! ctx.show( field ) ) {
		return null;
	}
	switch ( field ) {
		case 'name':
			return ctx.name( m, ...args );
		case 'designation':
			return ctx.designation( m );
		case 'details':
			return ctx.details( m );
		case 'social':
			return ctx.social( m, ...args );
		case 'ribbon':
			return ctx.ribbon( m );
		case 'featured_badge':
			return ctx.featuredBadge( m );
		case 'skills':
			return ctx.skills( m );
		case 'vcard':
			return ctx.vcard( m );
		case 'read_more':
			return ctx.readMore( m );
	}
	return null;
};

const taImage = ( ctx, m, link = true, flip = false ) => {
	if ( ! ctx.show( 'thumbnail' ) ) {
		return null;
	}
	let img = flip ? ctx.flipImage( m ) : null;
	if ( ! img ) {
		img = ctx.image( m, 'bptm-img', link );
	}
	return img;
};

const taExtras = ( ctx, m, variant = 'icons' ) => {
	const html = join( ctx.metaDetails( m, variant ), taPart( ctx, m, 'skills' ), taPart( ctx, m, 'vcard' ), taPart( ctx, m, 'read_more' ) );
	return html ? div( 'bptm-ta-extras', html ) : null;
};

const taParts = ( ctx, m, nameTag = 'h3' ) => ( {
	img: taImage( ctx, m ),
	name: taPart( ctx, m, 'name', nameTag ),
	role: taPart( ctx, m, 'designation' ),
	desc: taPart( ctx, m, 'details' ),
	social: taPart( ctx, m, 'social' ),
	badges: join( taPart( ctx, m, 'ribbon' ), taPart( ctx, m, 'featured_badge' ) ),
	extras: taExtras( ctx, m ),
} );

const taClasses = ( ctx, id, family ) => {
	const c = [ 'bptm-ta', 'bptm-ta-' + family, 'bptm-ta-' + id ];
	if ( 'grid' === family || 'circle' === family ) {
		c.push( 'bptm-tap-reveal' );
	}
	if ( ! ctx.show( 'thumbnail' ) ) {
		c.push( 'bptm-ta-no-thumb' );
	}
	return c;
};

const overlay = () => h( 'span', { className: 'bptm-ta-overlay', 'aria-hidden': 'true' } );
const badgesDiv = ( b ) => ( b ? div( 'bptm-ta-badges', b ) : null );

const taItem = ( ctx, m, cls, ...children ) => h( 'div', ctx.itemProps( m, cls ), div( 'bptm-ta-card', ...children ) );

const gridTheme = ( id ) => ( ctx, m ) => {
	const p = taParts( ctx, m );
	const cls = taClasses( ctx, id, 'grid' );
	const wrap = ( ...c ) => h( 'div', { className: ctx.vis_classes( 'thumbnail', 'bptm-img-wrap' ) }, ...c );
	switch ( id ) {
		case 'grid-1':
			return taItem(
				ctx,
				m,
				cls,
				p.img ? wrap( p.img, overlay(), p.social ? div( 'bptm-ta-hover', p.social ) : null ) : null,
				badgesDiv( p.badges ),
				div( 'bptm-ta-info', join( p.name, p.role, p.desc ), ! p.img && p.social ? p.social : null, p.extras )
			);
		case 'grid-2':
			return taItem(
				ctx,
				m,
				cls,
				p.img ? wrap( p.img, overlay(), p.social ? div( 'bptm-ta-hover', p.social ) : null, badgesDiv( p.badges ) ) : badgesDiv( p.badges ),
				div( 'bptm-ta-info', join( p.name, p.role, p.desc, p.extras ), ! p.img && p.social ? p.social : null )
			);
		case 'grid-3':
			return taItem(
				ctx,
				m,
				cls,
				h(
					'div',
					{ className: ctx.vis_classes( 'thumbnail', 'bptm-ta-media' ) },
					p.img ? wrap( p.img, overlay() ) : null,
					p.social ? div( 'bptm-ta-share', p.social, h( 'span', { className: 'bptm-ta-share-btn', 'aria-hidden': 'true' }, h( 'i', { className: 'fas fa-share-alt' } ) ) ) : null
				),
				badgesDiv( p.badges ),
				div( 'bptm-ta-info', join( p.name, p.role, p.desc, p.extras ) )
			);
		case 'grid-4':
		case 'grid-5': {
			const hover = join( p.desc, p.extras, p.social );
			// Grid 5 reveals the row with a grid-row (0fr → 1fr) animation: the inner wrapper clips while it
			// grows, and the scroll box inside it keeps the 300px cap (so no scrollbar flashes mid-animation).
			const hoverRow = hover && 'grid-5' === id ? div( 'bptm-ta-hover', div( 'bptm-ta-hover-inner', div( 'bptm-ta-hover-scroll', hover ) ) ) : hover && div( 'bptm-ta-hover', hover );
			return taItem( ctx, m, cls, p.img ? wrap( p.img, overlay() ) : null, badgesDiv( p.badges ), div( 'bptm-ta-info', join( p.name, p.role ), hoverRow || null ) );
		}
		default: // grid-6
			return taItem( ctx, m, cls, p.img ? wrap( p.img ) : null, badgesDiv( p.badges ), div( 'bptm-ta-info', div( 'bptm-ta-info-inner', join( p.name, p.role, p.desc, p.extras, p.social ) ) ) );
	}
};

const circleTheme = ( id ) => ( ctx, m ) => {
	const p = taParts( ctx, m );
	const n = Number( id.slice( -1 ) );
	let hover = null;
	if ( n >= 2 && n <= 4 ) {
		hover = p.social;
	} else if ( n >= 5 ) {
		hover = join( p.desc, p.social );
	}
	let info;
	if ( 1 === n ) {
		info = join( p.name, p.role, p.desc, p.extras, p.social );
	} else if ( n <= 4 ) {
		info = join( p.name, p.role, p.desc, p.extras );
	} else {
		info = join( p.name, p.role, p.extras );
	}
	return taItem(
		ctx,
		m,
		taClasses( ctx, id, 'circle' ),
		p.img
			? h(
				'div',
				{ className: ctx.vis_classes( 'thumbnail', 'bptm-ta-media' ) },
				h( 'div', { className: ctx.vis_classes( 'thumbnail', 'bptm-img-wrap' ) }, p.img, overlay(), hover ? div( 'bptm-ta-hover', hover ) : null )
			)
			: null,
		badgesDiv( p.badges ),
		div( 'bptm-ta-info', info, ! p.img && hover ? div( 'bptm-ta-static', hover ) : null )
	);
};

const horizontalTheme = ( id ) => ( ctx, m ) => {
	const p = taParts( ctx, m );
	return taItem(
		ctx,
		m,
		taClasses( ctx, id, 'horizontal' ),
		p.img ? h( 'div', { className: ctx.vis_classes( 'thumbnail', 'bptm-ta-media' ) }, h( 'div', { className: ctx.vis_classes( 'thumbnail', 'bptm-img-wrap' ) }, p.img ) ) : null,
		div( 'bptm-ta-info', join( p.name, p.role, p.desc, p.extras, p.social ) ),
		badgesDiv( p.badges )
	);
};

const flipTheme = ( id ) => ( ctx, m ) => {
	const p = taParts( ctx, m );
	const cls = taClasses( ctx, id, 'flip' );
	const wrap = ( img ) => h( 'div', { className: ctx.vis_classes( 'thumbnail', 'bptm-img-wrap' ) }, img );
	if ( 'flip-5' === id ) {
		const avatar = taImage( ctx, m, false );
		const panel = join( p.name, p.role, p.desc, p.extras, p.social );
		return taItem(
			ctx,
			m,
			cls,
			p.img ? wrap( p.img ) : null,
			badgesDiv( p.badges ),
			div( 'bptm-ta-info', div( 'bptm-ta-info-inner', avatar ? h( 'div', { className: 'bptm-ta-avatar', 'aria-hidden': 'true' }, avatar ) : null, panel ) )
		);
	}
	if ( 'flip-6' === id ) {
		const backImg = taImage( ctx, m, false, true );
		const back = join( p.name, p.role, p.desc, p.extras, p.social );
		if ( p.img && back ) {
			cls.push( 'bptm-ta-has-flip' );
		}
		const nameText = p.name ? m.name : '';
		const roleText = p.role ? m.designation : '';
		return taItem(
			ctx,
			m,
			cls,
			...( p.img
				? [
					div(
						'bptm-ta-flipbox',
						div(
							'bptm-ta-face bptm-ta-front',
							wrap( p.img ),
							p.name || p.role
								? h(
									'div',
									{ className: 'bptm-ta-caption', 'aria-hidden': 'true' },
									nameText ? h( 'span', { className: 'bptm-ta-caption-name' }, nameText ) : null,
									roleText ? h( 'span', { className: 'bptm-ta-caption-role' }, roleText ) : null
								)
								: null,
							badgesDiv( p.badges )
						),
						back ? div( 'bptm-ta-face bptm-ta-back', h( 'div', { className: 'bptm-ta-back-img', 'aria-hidden': 'true' }, backImg ), div( 'bptm-ta-back-inner', back ) ) : null
					),
				]
				: [ badgesDiv( p.badges ), div( 'bptm-ta-info', div( 'bptm-ta-static', back ) ) ] )
		);
	}
	// flip-1 … flip-4.
	const back = 'flip-4' === id ? join( p.name, p.role, p.desc, p.extras, p.social ) : join( p.desc, p.extras, p.social );
	const info = 'flip-4' === id ? null : join( p.name, p.role );
	if ( p.img && back ) {
		cls.push( 'bptm-ta-has-flip' );
	}
	return taItem(
		ctx,
		m,
		cls,
		p.img
			? div(
				'bptm-ta-flipbox',
				div( 'bptm-ta-face bptm-ta-front', wrap( p.img ), badgesDiv( p.badges ) ),
				back ? div( 'bptm-ta-face bptm-ta-back', div( 'bptm-ta-back-inner', back ) ) : null
			)
			: badgesDiv( p.badges ),
		info || ( ! p.img && back ) ? div( 'bptm-ta-info', info, ! p.img ? div( 'bptm-ta-static', back ) : null ) : null
	);
};

/* ================================================================== */
/* Registry B helpers (tables / lists / legacy)                        */
/* ================================================================== */

export const tbPart = taPart;
export const tbBadges = ( ctx, m ) => join( taPart( ctx, m, 'ribbon' ), taPart( ctx, m, 'featured_badge' ) );

export const tbImage = ( ctx, m, link = true, force = false ) => {
	if ( ! ctx.show( 'thumbnail' ) ) {
		return null;
	}
	if ( force ) {
		const img = ctx.image( m, 'bptm-img', false );
		return img ? ctx.wrapLink( m, img, 'bptm-img-link' ) : null;
	}
	return ctx.image( m, 'bptm-img', link );
};

export const tbPlainName = ( ctx, m, tag = 'h3', cls = '' ) => {
	if ( ! ctx.show( 'name' ) || ! m.name ) {
		return null;
	}
	tag = [ 'h2', 'h3', 'h4', 'div', 'span' ].includes( tag ) ? tag : 'h3';
	return h( tag, { className: ctx.vis_classes( 'name', cx( 'bptm-name', cls ) ) }, h( 'span', ctx.clone ? {} : { itemProp: 'name' }, m.name ) );
};

export const tbPlainDesignation = ( ctx, m, cls = '' ) => {
	if ( ! ctx.show( 'designation' ) || ! m.designation ) {
		return null;
	}
	return h( 'div', { className: ctx.vis_classes( 'designation', cx( 'bptm-designation', cls ) ), ...( ctx.clone ? {} : { itemProp: 'jobTitle' } ) }, m.designation );
};

const metaRowMap = ( ctx, m ) => {
	const map = {};
	ctx.metaRows( m ).forEach( ( r ) => {
		map[ r.field ] = r;
	} );
	return map;
};

const tbContact = ( rows, field, withLabel ) => {
	const row = rows[ field ];
	if ( ! row ) {
		return null;
	}
	return h(
		'div',
		{ className: 'bptm-contact bptm-contact--' + field.replace( /_/g, '-' ) + ' ' + row.classes, key: field },
		h( 'i', { className: row.icon, 'aria-hidden': 'true' } ),
		h(
			'span',
			{ className: 'bptm-contact-text' },
			withLabel ? h( 'span', { className: 'bptm-contact-label' }, row.label + ':' ) : null,
			withLabel ? ' ' : null,
			h( 'span', { className: 'bptm-contact-value' }, row.value )
		)
	);
};

export const tbContacts = ( ctx, m, fields = null, cls = 'bptm-contacts', withLabel = false ) => {
	const rows = metaRowMap( ctx, m );
	const list = ( fields || META_FIELDS ).map( ( f ) => tbContact( rows, f, withLabel ) ).filter( Boolean );
	return list.length ? h( 'div', { className: cls }, ...list ) : null;
};

export const tbExtras = ( ctx, m, exclude = [] ) => {
	const html = join(
		tbContacts( ctx, m, META_FIELDS.filter( ( f ) => ! exclude.includes( f ) ), 'bptm-contacts bptm-meta', true ),
		exclude.includes( 'skills' ) ? null : taPart( ctx, m, 'skills' ),
		exclude.includes( 'vcard' ) ? null : taPart( ctx, m, 'vcard' ),
		exclude.includes( 'read_more' ) ? null : taPart( ctx, m, 'read_more' )
	);
	return html ? div( 'bptm-tb-extras', html ) : null;
};

const tbClasses = ( ctx, id, family, extra = [] ) => {
	const c = [ 'bptm-tb', 'bptm-tb-' + family, 'bptm-tb-' + id, ...extra ];
	if ( ! ctx.show( 'thumbnail' ) ) {
		c.push( 'bptm-tb-no-thumb' );
	}
	return c;
};

const tbItem = ( ctx, m, cls, ...children ) => h( 'div', ctx.itemProps( m, cls ), div( 'bptm-tb-card', ...children ) );
const media = ( ...c ) => div( 'bptm-img-wrap bptm-tb-media', ...c );

/** grid-7 / grid-slider: hover card. */
const tbHoverCard = ( id ) => ( ctx, m ) => {
	const img = tbImage( ctx, m );
	const hover = join( taPart( ctx, m, 'details' ), taPart( ctx, m, 'social' ) );
	return tbItem(
		ctx,
		m,
		tbClasses( ctx, id, 'legacy', [ 'bptm-tb-hovercard' ] ),
		img ? media( img, tbBadges( ctx, m ), hover ? div( 'bptm-tb-hover', div( 'bptm-tb-hover-inner', hover ) ) : null ) : null,
		div( 'bptm-tb-info', img ? null : join( tbBadges( ctx, m ), hover ), taPart( ctx, m, 'name', 'h3' ), taPart( ctx, m, 'designation' ), tbExtras( ctx, m ) )
	);
};

/** grid-popup / grid-single / grid-filter-popup / grid-filter-selected / grid-panel / grid-drawer-2: overlay card. */
const OVERLAY_ICON = {
	'grid-popup': 'fas fa-expand-alt',
	'grid-single': 'fas fa-external-link-alt',
	'grid-filter-popup': 'fas fa-expand-alt',
	'grid-filter-selected': 'fas fa-expand-alt',
	'grid-panel': 'fas fa-arrow-right',
	'grid-drawer-2': 'fas fa-chevron-down',
};
const tbOverlayCard = ( id ) => ( ctx, m ) => {
	const img = tbImage( ctx, m, false );
	const caption = join( tbPlainName( ctx, m, 'h3' ), tbPlainDesignation( ctx, m ) );
	const lp = ctx.linkProps( m, 'bptm-tb-cover-link' );
	const inner = media( img, lp ? h( 'span', { className: 'bptm-tb-indicator', 'aria-hidden': 'true' }, h( 'i', { className: OVERLAY_ICON[ id ] } ) ) : null, caption ? div( 'bptm-tb-caption', caption ) : null );
	return tbItem(
		ctx,
		m,
		tbClasses( ctx, id, 'legacy', [ 'bptm-tb-overlay-card' ] ),
		lp ? h( 'a', lp, inner ) : inner,
		tbBadges( ctx, m ),
		join( taPart( ctx, m, 'details' ), tbExtras( ctx, m ), taPart( ctx, m, 'social' ) )
	);
};

/** grid-filter-single / group-filter-1: banner card. */
const tbBannerCard = ( id ) => ( ctx, m ) => {
	const img = tbImage( ctx, m, true, true );
	const caption = join( taPart( ctx, m, 'name', 'h3' ), taPart( ctx, m, 'designation' ) );
	const fields = [ 'cell_phone', 'email' ];
	return tbItem(
		ctx,
		m,
		tbClasses( ctx, id, 'legacy', [ 'bptm-tb-banner-card' ] ),
		media( img, tbBadges( ctx, m ), caption ? div( 'bptm-tb-caption', caption ) : null ),
		tbContacts( ctx, m, fields, 'bptm-contacts bptm-tb-contact-box' ),
		taPart( ctx, m, 'details' ),
		taPart( ctx, m, 'social' ),
		tbExtras( ctx, m, fields )
	);
};

/** grid-10 / grid-11 / grid-drawer-1: simple card. */
const tbSimpleCard = ( id, force = false ) => ( ctx, m ) => {
	const img = force ? tbImage( ctx, m, true, true ) : tbImage( ctx, m );
	return tbItem(
		ctx,
		m,
		tbClasses( ctx, id, 'legacy' ),
		img ? media( img, tbBadges( ctx, m ) ) : null,
		div(
			'bptm-tb-info',
			img ? null : tbBadges( ctx, m ),
			taPart( ctx, m, 'name', 'h3' ),
			taPart( ctx, m, 'designation' ),
			taPart( ctx, m, 'details' ),
			taPart( ctx, m, 'social' ),
			tbExtras( ctx, m )
		)
	);
};

const TB = {
	'grid-7': tbHoverCard( 'grid-7' ),
	'grid-slider': tbHoverCard( 'grid-slider' ),
	'grid-8': ( ctx, m ) => {
		const img = tbImage( ctx, m, true, true );
		const tip = join( taPart( ctx, m, 'name', 'h3' ), taPart( ctx, m, 'designation' ) );
		return tbItem(
			ctx,
			m,
			tbClasses( ctx, 'grid-8', 'legacy' ),
			img ? media( img, tbBadges( ctx, m ) ) : null,
			tip ? div( 'bptm-tb-tip', tip ) : null,
			join( taPart( ctx, m, 'details' ), tbExtras( ctx, m ), taPart( ctx, m, 'social' ) )
		);
	},
	'grid-9': ( ctx, m ) => {
		const img = tbImage( ctx, m, true, true );
		const info = join( taPart( ctx, m, 'name', 'h3' ), taPart( ctx, m, 'designation' ) );
		return tbItem(
			ctx,
			m,
			tbClasses( ctx, 'grid-9', 'legacy' ),
			media( join( img, tbBadges( ctx, m ) ), info ? div( 'bptm-tb-infocard', info ) : null ),
			join( taPart( ctx, m, 'details' ), tbExtras( ctx, m ), taPart( ctx, m, 'social' ) )
		);
	},
	'grid-10': tbSimpleCard( 'grid-10' ),
	'grid-11': tbSimpleCard( 'grid-11' ),
	'grid-drawer-1': tbSimpleCard( 'grid-drawer-1', true ),
	'grid-12': ( ctx, m ) => {
		const img = tbImage( ctx, m );
		const more = taPart( ctx, m, 'read_more' );
		const social = taPart( ctx, m, 'social' );
		return tbItem(
			ctx,
			m,
			tbClasses( ctx, 'grid-12', 'legacy' ),
			img ? media( img, tbBadges( ctx, m ) ) : null,
			div(
				'bptm-tb-info',
				div( 'bptm-tb-info-top', img ? null : tbBadges( ctx, m ), taPart( ctx, m, 'name', 'h3' ), taPart( ctx, m, 'designation' ), taPart( ctx, m, 'details' ), tbExtras( ctx, m, [ 'read_more' ] ) ),
				more || social ? div( 'bptm-tb-foot', join( more, social ) ) : null
			)
		);
	},
	'grid-popup': tbOverlayCard( 'grid-popup' ),
	'grid-single': tbOverlayCard( 'grid-single' ),
	'grid-filter-popup': tbOverlayCard( 'grid-filter-popup' ),
	'grid-filter-selected': tbOverlayCard( 'grid-filter-selected' ),
	'grid-panel': tbOverlayCard( 'grid-panel' ),
	'grid-drawer-2': tbOverlayCard( 'grid-drawer-2' ),
	'grid-filter-single': tbBannerCard( 'grid-filter-single' ),
	'group-filter-1': tbBannerCard( 'group-filter-1' ),
	'grid-filter-vcard': ( ctx, m ) => {
		const img = tbImage( ctx, m, true, true );
		const fields = [ 'cell_phone', 'email' ];
		const vcard = taPart( ctx, m, 'vcard' );
		return tbItem(
			ctx,
			m,
			tbClasses( ctx, 'grid-filter-vcard', 'legacy' ),
			img ? media( img, tbBadges( ctx, m ) ) : null,
			div(
				'bptm-tb-info',
				img ? null : tbBadges( ctx, m ),
				taPart( ctx, m, 'name', 'h3' ),
				taPart( ctx, m, 'designation' ),
				tbContacts( ctx, m, fields, 'bptm-contacts bptm-tb-contacts' ),
				taPart( ctx, m, 'details' ),
				taPart( ctx, m, 'social' ),
				tbExtras( ctx, m, [ ...fields, 'vcard' ] ),
				vcard ? div( 'bptm-tb-vcard', vcard ) : null
			)
		);
	},
};

const LIST_CONTACTS = { 'list-2': [ 'cell_phone' ], 'list-3': [ 'email' ], 'list-4': [ 'email', 'address' ] };

const listTheme = ( id ) => ( ctx, m ) => {
	const fields = LIST_CONTACTS[ id ] || [];
	const img = tbImage( ctx, m, true, true );
	const badges = tbBadges( ctx, m );
	return tbItem(
		ctx,
		m,
		tbClasses( ctx, id, 'list' ),
		img ? media( join( img, badges ) ) : null,
		div(
			'bptm-tb-info',
			img ? null : badges,
			taPart( ctx, m, 'name', 'h3' ),
			taPart( ctx, m, 'designation' ),
			taPart( ctx, m, 'details' ),
			tbContacts( ctx, m, fields, 'bptm-contacts bptm-tb-contacts' ),
			taPart( ctx, m, 'social' ),
			tbExtras( ctx, m, fields )
		)
	);
};

/* ================================================================== */
/* Tables                                                              */
/* ================================================================== */

const columnDefs = () => ( {
	thumbnail: [ __( 'Image', 'bp-team-member' ), 'thumbnail' ],
	name: [ __( 'Name', 'bp-team-member' ), 'name' ],
	designation: [ __( 'Position', 'bp-team-member' ), 'designation' ],
	details: [ __( 'Description', 'bp-team-member' ), 'details' ],
	company: [ t( 'company' ), 'company' ],
	email: [ t( 'email' ), 'email' ],
	cell_phone: [ t( 'cell_phone' ), 'cell_phone' ],
	land_phone: [ t( 'land_phone' ), 'land_phone' ],
	address: [ t( 'address' ), 'address' ],
	location: [ termLabel( 'location' ), 'location' ],
	social: [ __( 'Social', 'bp-team-member' ), 'social' ],
} );

const tableColumns = ( id ) =>
	[ 'table-9', 'table-10' ].includes( id )
		? [ 'thumbnail', 'name', 'designation', 'company', 'email', 'cell_phone', 'land_phone', 'address', 'location', 'social' ]
		: [ 'thumbnail', 'name', 'designation', 'company', 'details', 'email', 'cell_phone', 'land_phone', 'address', 'location', 'social' ];

const visibleColumns = ( ctx, id ) => {
	const defs = columnDefs();
	const out = tableColumns( id ).filter( ( c ) => defs[ c ] && ctx.show( defs[ c ][ 1 ] ) );
	return out.length ? out : [ 'name' ];
};

const colsClass = ( n ) => {
	if ( n >= 10 ) {
		return 'bptm-tb-cols-xl';
	}
	if ( n >= 8 ) {
		return 'bptm-tb-cols-l';
	}
	if ( n >= 6 ) {
		return 'bptm-tb-cols-m';
	}
	return 'bptm-tb-cols-s';
};

/** Table head: optional border <style> + <thead>. */
export const TableHead = ( { ctx, id } ) => {
	const defs = columnDefs();
	const cols = visibleColumns( ctx, id );
	const uid = String( ctx.uid || '' ).replace( /[^A-Za-z0-9_-]/g, '' );
	const bw = cssLength( ctx.attr( 'itemBorderWidth', '' ) );
	const bc = cssColor( ctx.attr( 'itemBorderColor', '' ) );
	let style = null;
	if ( uid && ( bw || bc ) ) {
		const br = cssLength( ctx.attr( 'itemBorderRadius', '' ) );
		let vars = '--bptm-tb-bw:' + ( bw || '1px' ) + ';--bptm-tb-bc:' + ( bc || 'currentColor' ) + ';';
		if ( br ) {
			vars += '--bptm-tb-br:' + br + ';';
		}
		vars = vars.replace( /[<>{}]/g, '' );
		style = h( 'style', { key: 's' }, '.bptm-wrap:has(.bptm-thead[data-bptm-uid="' + uid + '"]){' + vars + '}' );
	}
	return [
		style,
		h(
			'thead',
			{ key: 'h', className: 'bptm-thead', 'data-bptm-cols': String( cols.length ), ...( uid ? { 'data-bptm-uid': uid } : {} ) },
			h( 'tr', null, cols.map( ( c ) => h( 'th', { key: c, scope: 'col', className: ctx.vis_classes( defs[ c ][ 1 ], 'bptm-th bptm-col-' + c.replace( /_/g, '-' ) ) }, defs[ c ][ 0 ] ) ) )
		),
	];
};

const tableCell = ( ctx, m, col, id, extra ) => {
	const defs = columnDefs();
	const label = defs[ col ] ? defs[ col ][ 0 ] : '';
	let inner = null;
	let sort = '';
	switch ( col ) {
		case 'thumbnail': {
			const img = tbImage( ctx, m, true, true );
			inner = img ? div( 'bptm-img-wrap', img ) : null;
			break;
		}
		case 'name':
			inner = join( taPart( ctx, m, 'name', 'h3' ), tbBadges( ctx, m ), tbExtras( ctx, m, tableColumns( id ) ) );
			sort = m.name || '';
			break;
		case 'designation':
			inner = taPart( ctx, m, 'designation' );
			sort = m.designation || '';
			break;
		case 'details':
			inner = taPart( ctx, m, 'details' );
			break;
		case 'social':
			inner = taPart( ctx, m, 'social' );
			break;
		default: {
			const row = ctx.metaRows( m ).find( ( r ) => r.field === col );
			if ( row ) {
				inner = h( 'span', { className: 'bptm-contact bptm-contact--' + col.replace( /_/g, '-' ) }, h( 'i', { className: row.icon, 'aria-hidden': 'true' } ), h( 'span', { className: 'bptm-contact-value' }, row.value ) );
				sort = row.text || '';
			}
		}
	}
	const content = join( inner, extra );
	const field = defs[ col ] ? defs[ col ][ 1 ] : col;
	return h(
		'td',
		{
			key: col,
			className: ctx.vis_classes( field, 'bptm-td bptm-col-' + col.replace( /_/g, '-' ) + ( inner ? '' : ' bptm-td-empty' ) ),
			'data-label': label,
			...( '' !== sort ? { 'data-sort-value': sort } : {} ),
		},
		content
	);
};

const tableRow = ( id ) => ( ctx, m ) => {
	const cols = visibleColumns( ctx, id );
	// Tables 9 / 10 have no Description column: the description goes at the end of the name cell (or the first cell).
	let descCol = null;
	let desc = null;
	if ( [ 'table-9', 'table-10' ].includes( id ) ) {
		desc = taPart( ctx, m, 'details' );
		descCol = cols.includes( 'name' ) ? 'name' : cols[ 0 ];
	}
	return h(
		'tr',
		ctx.itemProps( m, tbClasses( ctx, id, 'table', [ 'bptm-trow', colsClass( cols.length ) ] ) ),
		cols.map( ( c ) => tableCell( ctx, m, c, id, c === descCol ? desc : null ) )
	);
};

/* ================================================================== */
/* Sidebar                                                             */
/* ================================================================== */

const sidebarTheme = ( id ) => ( ctx, m ) => {
	const img = ctx.image( m, 'bptm-img' );
	const badges = join( ctx.ribbon( m ), ctx.featuredBadge( m ) );
	return h(
		'div',
		ctx.itemProps( m, [ 'bptm-sb', 'bptm-sb-' + id, img ? 'bptm-sb-has-img' : 'bptm-sb-no-img' ] ),
		div(
			'bptm-sb-card bptm-tb-card',
			img ? h( 'div', { className: ctx.vis_classes( 'thumbnail', 'bptm-img-wrap bptm-sb-media' ) }, img ) : null,
			div(
				'bptm-sb-info',
				badges,
				ctx.name( m, 'h4' ),
				ctx.designation( m ),
				ctx.details( m ),
				ctx.metaDetails( m, 'icons' ),
				ctx.skills( m ),
				ctx.social( m, 'small' ),
				ctx.vcard( m ),
				ctx.readMore( m )
			)
		)
	);
};

/* ================================================================== */

/**
 * Item renderer of a theme: ( ctx, member ) => element.
 *
 * @param {Object} theme Theme.
 * @return {Function} Renderer.
 */
export const itemRenderer = ( theme ) => {
	const id = theme.id;
	if ( 'table' === theme.layout ) {
		return tableRow( id );
	}
	const fam = themeFamily( id );
	if ( 'sidebar' === fam ) {
		return sidebarTheme( id );
	}
	if ( 'ta' === fam ) {
		if ( /^grid-/.test( id ) ) {
			return gridTheme( id );
		}
		if ( /^circle-/.test( id ) ) {
			return circleTheme( id );
		}
		if ( /^horizontal-/.test( id ) ) {
			return horizontalTheme( id );
		}
		return flipTheme( id );
	}
	if ( /^list-/.test( id ) ) {
		return listTheme( id );
	}
	return TB[ id ] || TB[ 'grid-10' ];
};
