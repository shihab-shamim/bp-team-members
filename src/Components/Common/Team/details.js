/**
 * Detail views for popup / panel / drawer (ports of templates/{popups,panels,drawers}/*.php)
 * and the detail payload wrapper (former Context::modal_payload()).
 */
import { createElement as h } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { join } from './context';
import { tbPart, tbBadges, tbImage, tbPlainName, tbPlainDesignation } from './themes';
import { DETAIL_STYLES } from './registry';
import { t } from './bridge';
import { htmlClass } from './sanitize';

const div = ( className, ...children ) => h( 'div', { className }, ...children );

const detailSocial = ( ctx, m, label = true ) => {
	const social = tbPart( ctx, m, 'social' );
	if ( ! social ) {
		return null;
	}
	return h( 'div', { className: ctx.vis_classes( 'social', 'bptm-dv-social' ) }, label ? h( 'h4', { className: 'bptm-dv-heading' }, t( 'follow_me_on' ) ) : null, social );
};

const ALL = [ 'img', 'flip', 'badges', 'name', 'role', 'desc', 'social', 'social_plain', 'meta', 'skills' ];

/** Parts of a detail view (bptm_tb_detail_parts()). */
const parts = ( ctx, m, use ) => {
	use = use ? ALL.filter( ( k ) => use.includes( k ) ) : ALL;
	const out = {};
	[ ...ALL, 'tail' ].forEach( ( k ) => {
		out[ k ] = null;
	} );
	use.forEach( ( k ) => {
		switch ( k ) {
			case 'img': {
				const img = tbImage( ctx, m, false );
				out.img = img ? div( 'bptm-img-wrap bptm-dv-img', img ) : null;
				break;
			}
			case 'flip':
				out.flip = ctx.show( 'thumbnail' ) ? ctx.flipImage( m ) : null;
				break;
			case 'badges':
				out.badges = tbBadges( ctx, m );
				break;
			case 'name':
				out.name = tbPlainName( ctx, m, 'h2', 'bptm-dv-name' );
				break;
			case 'role':
				out.role = tbPlainDesignation( ctx, m, 'bptm-dv-role' );
				break;
			case 'desc': {
				const d = tbPart( ctx, m, 'details' );
				out.desc = d ? div( 'bptm-dv-desc', d ) : null;
				break;
			}
			case 'social':
				out.social = detailSocial( ctx, m );
				break;
			case 'social_plain':
				out.social_plain = detailSocial( ctx, m, false );
				break;
			case 'meta': {
				const meta = ctx.metaDetails( m, 'list' );
				out.meta = meta ? div( 'bptm-dv-meta', meta ) : null;
				break;
			}
			case 'skills': {
				const sk = tbPart( ctx, m, 'skills' );
				out.skills = sk ? div( 'bptm-dv-skills', sk ) : null;
				break;
			}
		}
	} );
	out.badges_block = out.badges ? div( 'bptm-dv-badges', out.badges ) : null;
	if ( out.badges_block && ! out.img && use.includes( 'name' ) ) {
		out.name = join( out.badges_block, out.name );
	}
	const tail = tbPart( ctx, m, 'vcard' );
	out.tail = tail ? div( 'bptm-dv-tail', tail ) : null;
	return out;
};

const rootClass = ( ctx, kind, style, extra = [] ) => {
	const c = [ 'bptm-dv', 'bptm-dv-' + kind, 'bptm-dv-' + kind + '--' + style, ...extra ];
	if ( ! ctx.show( 'thumbnail' ) ) {
		c.push( 'bptm-dv--no-img' );
	}
	return c.map( htmlClass ).join( ' ' );
};

const mediaDiv = ( d ) => ( d.img ? div( 'bptm-dv-media', join( d.img, d.badges ) ) : null );

/** Templates: kind => style => ( ctx, m ) => element. */
const T = {
	popup: {
		default: ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'social_plain', 'desc', 'meta', 'skills' ] );
			const cols = 'one' === ctx.attr( 'popupColumns', 'two' ) ? 'one' : 'two';
			if ( 'one' === cols ) {
				return div( rootClass( ctx, 'popup', 'default', [ 'bptm-dv--cols-one' ] ), mediaDiv( d ), div( 'bptm-dv-body', join( d.name, d.role, d.social_plain, d.desc, d.meta, d.skills, d.tail ) ) );
			}
			return div(
				rootClass( ctx, 'popup', 'default', [ 'bptm-dv--cols-two' ] ),
				div( 'bptm-dv-side', mediaDiv( d ), d.meta ),
				div( 'bptm-dv-body', join( d.name, d.role, d.social_plain, d.desc, d.skills, d.tail ) )
			);
		},
		'style-one': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'desc', 'social', 'meta', 'skills' ] );
			return div( rootClass( ctx, 'popup', 'style-one' ), div( 'bptm-dv-side', mediaDiv( d ) ), div( 'bptm-dv-body', join( d.name, d.role, d.desc, d.social, d.meta, d.skills, d.tail ) ) );
		},
		'style-two': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'desc', 'meta', 'social', 'skills' ] );
			return div( rootClass( ctx, 'popup', 'style-two' ), div( 'bptm-dv-side', mediaDiv( d ) ), div( 'bptm-dv-body bptm-dv-body--scroll', join( d.name, d.role, d.desc, d.meta, d.social, d.skills, d.tail ) ) );
		},
		'style-three': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'desc', 'meta', 'skills', 'social' ] );
			return div(
				rootClass( ctx, 'popup', 'style-three' ),
				div( 'bptm-dv-side', mediaDiv( d ), join( d.name, d.role, d.desc ) ),
				div( 'bptm-dv-body', d.meta ? h( 'h4', { className: 'bptm-dv-heading' }, __( 'Contact Info', 'bp-team-member' ) ) : null, d.meta, join( d.skills, d.social, d.tail ) )
			);
		},
		'style-four': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'desc', 'social', 'meta', 'skills' ] );
			return div( rootClass( ctx, 'popup', 'style-four' ), div( 'bptm-dv-side', mediaDiv( d ) ), div( 'bptm-dv-body', join( d.name, d.role, d.desc, d.social, d.meta, d.skills, d.tail ) ) );
		},
		'style-five': ( ctx, m ) => split( ctx, m, 'popup', 'style-five' ),
		'style-six': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'social_plain', 'desc', 'meta', 'skills', 'flip' ] );
			const cols = 'one' === ctx.attr( 'popupColumns', 'two' ) ? 'one' : 'two';
			if ( 'one' === cols ) {
				return div( rootClass( ctx, 'popup', 'style-six', [ 'bptm-dv--cols-one' ] ), mediaDiv( d ), div( 'bptm-dv-body', join( d.name, d.role, d.social_plain, d.desc, d.meta, d.skills, d.tail ) ) );
			}
			return div(
				rootClass( ctx, 'popup', 'style-six', [ 'bptm-dv--cols-two' ] ),
				div( 'bptm-dv-side', mediaDiv( d ) ),
				div(
					'bptm-dv-body',
					div( 'bptm-dv-head', div( 'bptm-dv-head-text', join( d.name, d.role ) ), d.flip ? div( 'bptm-dv-avatar', d.flip ) : null ),
					join( d.desc, d.social_plain, d.meta, d.skills, d.tail )
				)
			);
		},
	},
	panel: {
		default: ( ctx, m ) => {
			const d = parts( ctx, m, [ 'social_plain', 'name', 'role', 'img', 'badges', 'desc', 'meta', 'skills' ] );
			return div(
				rootClass( ctx, 'panel', 'default' ),
				d.social_plain ? div( 'bptm-panel-strip', d.social_plain ) : null,
				div(
					'bptm-panel-main',
					d.name ? div( 'bptm-panel-titlebar', d.name ) : null,
					d.role ? div( 'bptm-panel-rolebar', d.role ) : null,
					mediaDiv( d ),
					div( 'bptm-dv-body', join( d.desc, d.meta, d.skills, d.tail ) )
				)
			);
		},
		'style-one': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'desc', 'social', 'meta', 'skills' ] );
			return div( rootClass( ctx, 'panel', 'style-one' ), mediaDiv( d ), div( 'bptm-dv-body', join( d.name, d.role, d.desc, d.social, d.meta, d.skills, d.tail ) ) );
		},
		'style-two': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'name', 'role', 'img', 'badges', 'desc', 'meta', 'social', 'skills' ] );
			return div(
				rootClass( ctx, 'panel', 'style-two' ),
				d.name || d.role ? div( 'bptm-panel-band', join( d.name, d.role ) ) : null,
				mediaDiv( d ),
				div( 'bptm-dv-body', join( d.desc, d.meta, d.social, d.skills, d.tail ) )
			);
		},
		'style-three': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'desc', 'meta', 'social', 'skills' ] );
			return div( rootClass( ctx, 'panel', 'style-three' ), mediaDiv( d ), div( 'bptm-dv-body', join( d.name, d.role, d.desc, d.meta, d.social, d.skills, d.tail ) ) );
		},
		'style-four': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'desc', 'meta', 'social', 'skills' ] );
			return div(
				rootClass( ctx, 'panel', 'style-four' ),
				mediaDiv( d ),
				d.name || d.role ? div( 'bptm-panel-band', join( d.name, d.role ) ) : null,
				div( 'bptm-dv-body', join( d.desc, d.meta, d.social, d.skills, d.tail ) )
			);
		},
		'style-five': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'social_plain', 'desc', 'meta', 'skills' ] );
			return div(
				rootClass( ctx, 'panel', 'style-five' ),
				mediaDiv( d ),
				div( 'bptm-dv-body', div( 'bptm-dv-head', div( 'bptm-dv-head-text', join( d.name, d.role ) ), d.social_plain ), join( d.desc, d.meta, d.skills, d.tail ) )
			);
		},
	},
	drawer: {
		default: ( ctx, m ) => ident( ctx, m, 'default', [ 'img', 'badges', 'name', 'role', 'desc', 'meta', 'social_plain', 'skills' ], ( d ) => join( d.meta, d.social_plain, d.skills, d.tail ) ),
		'style-one': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'desc', 'social', 'meta', 'skills' ] );
			return div( rootClass( ctx, 'drawer', 'style-one' ), div( 'bptm-dv-side', mediaDiv( d ) ), div( 'bptm-dv-body', join( d.name, d.role, d.desc, d.social, d.meta, d.skills, d.tail ) ) );
		},
		'style-two': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'desc', 'meta', 'social', 'skills' ] );
			return div( rootClass( ctx, 'drawer', 'style-two' ), div( 'bptm-dv-side', mediaDiv( d ) ), div( 'bptm-dv-body', join( d.name, d.role, d.desc, d.meta, d.social, d.skills, d.tail ) ) );
		},
		'style-three': ( ctx, m ) => ident( ctx, m, 'style-three', [ 'img', 'badges', 'meta', 'social', 'skills', 'name', 'role', 'desc' ], ( d ) => join( d.meta, d.social, d.skills, d.tail ) ),
		'style-four': ( ctx, m ) => {
			const d = parts( ctx, m, [ 'img', 'badges', 'name', 'role', 'desc', 'social', 'meta', 'skills' ] );
			return div( rootClass( ctx, 'drawer', 'style-four' ), div( 'bptm-dv-side', mediaDiv( d ) ), div( 'bptm-dv-body', join( d.name, d.role, d.desc, d.social, d.meta, d.skills, d.tail ) ) );
		},
		'style-five': ( ctx, m ) => split( ctx, m, 'drawer', 'style-five' ),
	},
};

/** Popup / drawer style-five: media side + top text + two split columns. */
function split( ctx, m, kind, style ) {
	const d = parts( ctx, m, [ 'meta', 'social', 'skills', 'img', 'badges', 'name', 'role', 'desc' ] );
	const left = join( d.meta, d.social );
	const right = join( d.skills, d.tail );
	return div(
		rootClass( ctx, kind, style ),
		div( 'bptm-dv-side', mediaDiv( d ) ),
		div(
			'bptm-dv-body',
			div( 'bptm-dv-top', join( d.name, d.role, d.desc ) ),
			left || right ? div( 'bptm-dv-split', left ? div( 'bptm-dv-split-col', left ) : null, right ? div( 'bptm-dv-split-col', right ) : null ) : null
		)
	);
}

/** Drawer default / style-three: small avatar beside the name, aside column. */
function ident( ctx, m, style, use, right ) {
	const d = parts( ctx, m, use );
	const r = right( d );
	const id = d.img ? div( 'bptm-dv-ident', d.img, div( 'bptm-dv-ident-text', join( d.badges_block, d.name, d.role ) ) ) : join( d.name, d.role );
	return div( rootClass( ctx, 'drawer', style ), div( 'bptm-dv-body', join( id, d.desc ) ), r ? div( 'bptm-dv-aside', r ) : null );
}

/**
 * Style used for a detail type.
 *
 * @param {Object} atts Attributes.
 * @param {string} type popup|panel|drawer.
 * @return {string} Style.
 */
export const detailStyle = ( atts, type ) => {
	const key = { popup: 'popupStyle', panel: 'panelStyle', drawer: 'drawerStyle' }[ type ];
	const s = String( atts[ key ] || 'default' );
	return DETAIL_STYLES[ type ].includes( s ) ? s : 'default';
};

/**
 * Detail payload of one member (open in a popup / panel / drawer).
 *
 * @param {Object} props { ctx (initial group), m, type }.
 * @return {Element|null} Element.
 */
export const DetailPayload = ( { ctx, m, type } ) => {
	if ( ! [ 'popup', 'panel', 'drawer' ].includes( type ) ) {
		return null;
	}
	const style = detailStyle( ctx.atts, type );
	const dctx = ctx.withGroup( type );
	const inner = ( T[ type ][ style ] || T[ type ].default )( dctx, m );
	let classes = 'bptm-detail bptm-detail--' + type + ' bptm-' + type + '-' + style;
	if ( 'popup' === type ) {
		classes += ' bptm-popup-cols-' + ( 'one' === ctx.attr( 'popupColumns' ) ? 'one' : 'two' );
	}
	return h(
		'div',
		{
			id: ctx.detailId( m ),
			className: classes,
			'data-bptm-detail': m.id,
			'data-bptm-type': type,
			'data-bptm-style': style,
			itemScope: true,
			itemType: 'https://schema.org/Person',
		},
		inner
	);
};
