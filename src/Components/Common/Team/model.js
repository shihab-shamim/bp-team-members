/**
 * Pure data layer (ports of the former PHP Renderer::sanitize, bptm_member_from_item, Query, Filters,
 * Visibility and Context link logic). Everything here works on untrusted block attributes.
 */
import metadata from '../../../block.json';
import { getThemeDef, VIS_KEYS, CORE_FIELDS, VIS_GROUPS, VIS_DEVICES } from './registry';
import { pluginUrl, pref } from './bridge';
import * as S from './sanitize';

export const MAX_MEMBERS = 500;

const SCHEMA = metadata.attributes || {};

const ENUMS = {
	filterType: [ 'normal-filter', 'ajax-filter' ],
	linkType: [ 'default', 'popup', 'panel', 'drawer', 'custom', 'none', 'single_page' ],
	linkTarget: [ '_self', '_blank' ],
	popupColumns: [ 'two', 'one' ],
	panelPosition: [ 'right', 'left', 'center' ],
	imageFilter: [ 'none', 'blur', 'brightness', 'contrast', 'grayscale', 'hue_rotate', 'invert', 'opacity', 'saturate', 'sepia' ],
	hoverImageFilter: [ 'none', 'blur', 'brightness', 'contrast', 'grayscale', 'hue_rotate', 'invert', 'opacity', 'saturate', 'sepia' ],
	orderBy: [ 'default', 'title', 'rand', 'name', 'date', 'ID', 'menu_order', 'modified' ],
	order: [ 'ASC', 'DESC' ],
	taxonomyOrderBy: [ 'name', 'default', 'slug', 'term_id', 'order', 'count', 'menu_order', 'term_order' ],
	taxonomyOrder: [ 'ASC', 'DESC' ],
	filterColumns: [ 'two', 'three' ],
	filterCatPosition: [ 'center', 'left', 'right' ],
	filterStyle: [ 'default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five' ],
	paginationType: [ 'normal-pagination', 'ajax-pagination', 'load-more-button', 'load-more-scroll' ],
	carouselNavsStyle: [ 'default', 'style-one', 'style-two', 'style-three' ],
	carouselDotsStyle: [ 'default', 'style-one', 'style-two', 'style-three' ],
	alignment: [ 'center', 'left', 'right' ],
};

const clone = ( v ) => ( v && 'object' === typeof v ? JSON.parse( JSON.stringify( v ) ) : v );

const isNumeric = ( v ) => ( 'number' === typeof v && isFinite( v ) ) || ( 'string' === typeof v && '' !== v.trim() && isFinite( Number( v ) ) );

const toBool = ( v ) => {
	if ( 'boolean' === typeof v ) {
		return v;
	}
	if ( 'string' === typeof v ) {
		return ! [ 'false', '0', '' ].includes( v.toLowerCase() );
	}
	return !! v;
};

/** bptm_is_on(). */
export const isOn = ( v ) => {
	if ( 'boolean' === typeof v ) {
		return v;
	}
	if ( 'number' === typeof v ) {
		return v > 0;
	}
	if ( 'string' === typeof v ) {
		return isNumeric( v ) ? Number( v ) > 0 : [ 'on', 'yes', 'true', '1' ].includes( v.trim().toLowerCase() );
	}
	return !! v;
};

const cleanKey = ( k ) => String( k ).replace( /[^A-Za-z0-9_-]/g, '' );

/** Structural clean-up of nested values: scalar leaves, max depth (strings sanitized). */
const cleanDeep = ( v, depth = 0 ) => {
	if ( Array.isArray( v ) ) {
		return depth > 4 ? [] : v.map( ( x ) => cleanDeep( x, depth + 1 ) );
	}
	if ( v && 'object' === typeof v ) {
		const out = {};
		if ( depth > 4 ) {
			return out;
		}
		Object.keys( v ).forEach( ( k ) => {
			const ck = cleanKey( k );
			if ( '' !== ck ) {
				out[ ck ] = cleanDeep( v[ k ], depth + 1 );
			}
		} );
		return out;
	}
	if ( 'boolean' === typeof v || 'number' === typeof v || null === v ) {
		return v;
	}
	return S.text( v );
};

/** Members: list of plain objects, string leaves capped at 20000 chars, max 3 levels. */
const cleanRaw = ( obj, depth ) => {
	const out = Array.isArray( obj ) ? [] : {};
	Object.keys( obj ).forEach( ( k ) => {
		const v = obj[ k ];
		const ck = Array.isArray( obj ) ? k : cleanKey( k );
		if ( '' === ck ) {
			return;
		}
		if ( v && 'object' === typeof v ) {
			if ( depth < 3 ) {
				out[ ck ] = cleanRaw( v, depth + 1 );
			}
		} else if ( 'string' === typeof v ) {
			out[ ck ] = v.length > 20000 ? v.slice( 0, 20000 ) : v;
		} else if ( 'boolean' === typeof v || 'number' === typeof v || null === v ) {
			out[ ck ] = v;
		}
	} );
	return Array.isArray( obj ) ? out.filter( ( x ) => undefined !== x ) : out;
};

export const cleanMembers = ( val ) => {
	if ( 'string' === typeof val ) {
		try {
			val = JSON.parse( val );
		} catch ( e ) {
			val = [];
		}
	}
	if ( ! Array.isArray( val ) ) {
		return [];
	}
	return val.slice( 0, MAX_MEMBERS ).filter( ( m ) => m && 'object' === typeof m && ! Array.isArray( m ) ).map( ( m ) => cleanRaw( m, 0 ) );
};

/** Default attribute values from block.json. */
export const defaults = () => {
	const out = {};
	Object.keys( SCHEMA ).forEach( ( k ) => {
		const def = SCHEMA[ k ];
		if ( Object.prototype.hasOwnProperty.call( def, 'default' ) ) {
			out[ k ] = clone( def.default );
		} else {
			out[ k ] = { boolean: false, number: 0, integer: 0, array: [], object: {} }[ def.type ] ?? '';
		}
	} );
	return out;
};

/**
 * Merge defaults, coerce types, validate enums and clamp numbers (Renderer::sanitize()).
 *
 * @param {Object} atts Raw attributes.
 * @return {Object} Sanitized attributes.
 */
export const sanitizeAttributes = ( atts ) => {
	atts = atts && 'object' === typeof atts ? atts : {};
	const out = defaults();
	Object.keys( atts ).forEach( ( k ) => {
		const v = atts[ k ];
		if ( 'members' === k ) {
			out.members = cleanMembers( v );
			return;
		}
		if ( ! SCHEMA[ k ] ) {
			if ( [ 'className', 'anchor', 'align' ].includes( k ) && 'string' === typeof v ) {
				out[ k ] = S.text( v );
			}
			return;
		}
		const type = Array.isArray( SCHEMA[ k ].type ) ? SCHEMA[ k ].type[ 0 ] : SCHEMA[ k ].type;
		switch ( type ) {
			case 'boolean':
				out[ k ] = toBool( v );
				break;
			case 'number':
				out[ k ] = isNumeric( v ) ? Number( v ) : out[ k ];
				break;
			case 'integer':
				out[ k ] = isNumeric( v ) ? Math.trunc( Number( v ) ) : out[ k ];
				break;
			case 'array':
				if ( Array.isArray( v ) ) {
					out[ k ] = cleanDeep( v );
				} else {
					out[ k ] = 'string' === typeof v && '' !== v ? v.split( ',' ).map( ( s ) => s.trim() ) : [];
				}
				break;
			case 'object':
				out[ k ] = v && 'object' === typeof v && ! Array.isArray( v ) ? cleanDeep( v ) : out[ k ];
				break;
			default:
				out[ k ] = null !== v && 'object' !== typeof v && undefined !== v ? S.text( v ) : out[ k ];
		}
	} );
	Object.keys( ENUMS ).forEach( ( k ) => {
		if ( ! ENUMS[ k ].includes( out[ k ] ) ) {
			const d = SCHEMA[ k ] && SCHEMA[ k ].default;
			out[ k ] = ENUMS[ k ].includes( d ) ? d : ENUMS[ k ][ 0 ];
		}
	} );
	[ 'popupStyle', 'panelStyle', 'drawerStyle', 'thumbnailSize', 'theme' ].forEach( ( k ) => {
		out[ k ] = S.key( out[ k ] );
	} );
	if ( '' === out.thumbnailSize ) {
		out.thumbnailSize = 'large';
	}
	out.numberOfMembers = Math.trunc( Number( out.numberOfMembers ) ) || 0;
	[ 'perPage', 'initialItems', 'loadPerClick', 'perLoad', 'carouselItemsToScroll' ].forEach( ( k ) => {
		out[ k ] = Math.max( 1, Math.trunc( Number( out[ k ] ) ) || 0 );
	} );
	const clamp = ( v, a, b ) => Math.max( a, Math.min( b, v ) );
	out.carouselSpeed = clamp( Math.trunc( Number( out.carouselSpeed ) ) || 0, 100, 10000 );
	out.carouselAutoplayTimeout = clamp( Math.trunc( Number( out.carouselAutoplayTimeout ) ) || 0, 500, 60000 );
	out.detailsLength = Math.max( 0, Math.trunc( Number( out.detailsLength ) ) || 0 );
	out.columnGap = clamp( Number( out.columnGap ) || 0, 0, 200 );
	out.rowGap = clamp( Number( out.rowGap ) || 0, 0, 200 );
	return out;
};

/* ------------------------------------------------------------------ */
/* View / link / pagination decisions                                  */
/* ------------------------------------------------------------------ */

/** grid | carousel | filter (Renderer::view()). */
export const resolveView = ( atts, theme ) => {
	if ( 'carousel' === theme.forced_view ) {
		return 'carousel';
	}
	if ( 'filter' === theme.forced_view ) {
		return 'filter';
	}
	if ( atts.carouselEnabled && theme.carousel && 'table' !== theme.layout && ! theme.grouped ) {
		return 'carousel';
	}
	if ( atts.filterEnabled && theme.filter ) {
		return 'filter';
	}
	return 'grid';
};

/** popup | panel | drawer | custom | none (Context::resolve_link_type()). */
export const resolveLinkType = ( atts, theme, view ) => {
	if ( ! atts.nameIsLinked ) {
		return 'none';
	}
	let type = String( atts.linkType || '' );
	let forced = String( theme.forced_link || '' );
	if ( 'single_page' === forced ) {
		forced = 'popup';
	}
	if ( forced && ( 'default' === type || [ 'panel', 'drawer' ].includes( forced ) ) ) {
		type = forced;
	}
	if ( 'default' === type || '' === type ) {
		type = 'popup';
	}
	if ( 'single_page' === type ) {
		type = 'custom';
	}
	if ( ! [ 'popup', 'panel', 'drawer', 'custom', 'none' ].includes( type ) ) {
		type = 'popup';
	}
	if ( 'drawer' === type && ( 'carousel' === view || 'table' === theme.layout ) ) {
		type = 'popup';
	}
	return type;
};

/** '' | normal-pagination | ajax-pagination | load-more-button | load-more-scroll (Query::pagination_mode()). */
export const paginationMode = ( atts, theme, view ) => {
	if ( ! atts.paginationEnabled || 'carousel' === view || theme.grouped || false === theme.pagination ) {
		return '';
	}
	let type = String( atts.paginationType );
	if ( ! ENUMS.paginationType.includes( type ) ) {
		type = 'normal-pagination';
	}
	if ( 'filter' === view ) {
		if ( 'ajax-filter' !== atts.filterType ) {
			return '';
		}
		if ( 'normal-pagination' === type ) {
			type = 'ajax-pagination';
		}
	}
	return type;
};

export const normOrderBy = ( o ) => {
	o = String( o );
	if ( 'name' === o ) {
		return 'title';
	}
	return [ 'title', 'rand' ].includes( o ) ? o : 'default';
};

/* ------------------------------------------------------------------ */
/* Visibility                                                          */
/* ------------------------------------------------------------------ */

/** Default visibility per group for a theme. */
export const visibilityDefaults = ( theme ) => {
	const initial = {};
	VIS_KEYS.forEach( ( k ) => {
		initial[ k ] = CORE_FIELDS.includes( k );
	} );
	const reg = theme.visibility || {};
	if ( Array.isArray( reg ) ) {
		reg.forEach( ( k ) => {
			if ( k in initial ) {
				initial[ k ] = true;
			}
		} );
	} else {
		Object.keys( reg ).forEach( ( k ) => {
			if ( k in initial ) {
				initial[ k ] = !! reg[ k ];
			}
		} );
	}
	const overlay = {};
	VIS_KEYS.forEach( ( k ) => {
		overlay[ k ] = 'read_more' !== k;
	} );
	return { initial, popup: overlay, panel: overlay, drawer: overlay };
};

const deviceMap = ( value, fallback ) => {
	const out = {};
	if ( value && 'object' === typeof value && ! Array.isArray( value ) ) {
		const v = { ...value };
		if ( undefined !== v.mobile_landscape && undefined === v.mobilePortrait ) {
			v.mobilePortrait = v.mobile_landscape;
		}
		VIS_DEVICES.forEach( ( d ) => {
			out[ d ] = undefined !== v[ d ] && null !== v[ d ] ? toBool( v[ d ] ) : fallback;
		} );
		return out;
	}
	VIS_DEVICES.forEach( ( d ) => {
		out[ d ] = null === value || undefined === value ? !! fallback : toBool( value );
	} );
	return out;
};

/** group => field => device => bool (Visibility::resolve()). */
export const resolveVisibility = ( attr, theme ) => {
	const defs = visibilityDefaults( theme );
	attr = attr && 'object' === typeof attr && ! Array.isArray( attr ) ? attr : {};
	const grouped = {};
	VIS_GROUPS.forEach( ( g ) => {
		if ( attr[ g ] && 'object' === typeof attr[ g ] && ! Array.isArray( attr[ g ] ) ) {
			grouped[ g ] = { ...attr[ g ] };
		}
	} );
	Object.keys( attr ).forEach( ( k ) => {
		if ( ! VIS_GROUPS.includes( k ) ) {
			grouped.initial = grouped.initial || {};
			grouped.initial[ k ] = attr[ k ];
		}
	} );
	const out = {};
	VIS_GROUPS.forEach( ( g ) => {
		out[ g ] = {};
		Object.keys( defs[ g ] ).forEach( ( f ) => {
			const rawV = grouped[ g ] ? grouped[ g ][ f ] : undefined;
			out[ g ][ f ] = deviceMap( rawV, defs[ g ][ f ] );
		} );
	} );
	return out;
};

export const anyDevice = ( map ) => !! map && VIS_DEVICES.some( ( d ) => true === map[ d ] );

const HIDE = { desktop: 'bptm-hide-desktop', tablet: 'bptm-hide-tablet', mobilePortrait: 'bptm-hide-mobile-portrait', mobile: 'bptm-hide-mobile' };

export const hideClasses = ( map ) => ( map ? VIS_DEVICES.filter( ( d ) => false === map[ d ] ).map( ( d ) => HIDE[ d ] ).join( ' ' ) : '' );

/* ------------------------------------------------------------------ */
/* Members                                                             */
/* ------------------------------------------------------------------ */

export const TERM_FIELDS = {
	group: 'group',
	tags: 'tag',
	language: 'language',
	location: 'location',
	gender: 'gender',
	specialty: 'specialty',
	extraOne: 'extra_one',
	extraTwo: 'extra_two',
	extraThree: 'extra_three',
	extraFour: 'extra_four',
	extraFive: 'extra_five',
};

export const FILTER_TAX = [ 'group', 'location', 'language', 'gender', 'specialty', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five' ];

/** bptm_split_terms(). */
export const splitTerms = ( value ) => {
	if ( Array.isArray( value ) ) {
		value = value.filter( ( x ) => 'string' === typeof x || 'number' === typeof x ).join( ',' );
	}
	if ( 'string' !== typeof value && 'number' !== typeof value ) {
		return [];
	}
	const seen = new Map();
	String( value ).split( ',' ).forEach( ( part ) => {
		const name = S.text( part );
		if ( '' === name ) {
			return;
		}
		const slug = S.termSlug( name );
		if ( ! seen.has( slug ) ) {
			seen.set( slug, { id: slug, name, slug, parent: 0 } );
		}
	} );
	return [ ...seen.values() ];
};

/**
 * Resolve an image value for a size: { id, url, alt } (+ optional sizes map stored by the editor).
 * Relative URLs (no scheme, no leading "/") are relative to the plugin root.
 *
 * @param {Object} image Raw image.
 * @param {string} size  Image size.
 * @return {Object} { id, url, alt }.
 */
export const resolveImage = ( image, size ) => {
	image = image && 'object' === typeof image && ! Array.isArray( image ) ? image : {};
	let id = isNumeric( image.id ) ? Math.max( 0, Math.trunc( Number( image.id ) ) ) : 0;
	let u = 'string' === typeof image.url ? image.url.trim() : '';
	const alt = 'string' === typeof image.alt || 'number' === typeof image.alt ? S.text( image.alt ) : '';
	let sizes = image.sizes && 'object' === typeof image.sizes && ! Array.isArray( image.sizes ) ? image.sizes : null;
	// Bundled sample photos (assets/img/team/name.jpg) ship -150x150 / -300x300 copies; blocks saved
	// before the sizes map existed get it derived here.
	if ( ! sizes && /^assets\/img\/team\/[a-z0-9-]+\.jpg$/i.test( u ) ) {
		const base = u.replace( /\.jpg$/i, '' );
		sizes = { thumbnail: { url: base + '-150x150.jpg' }, medium: { url: base + '-300x300.jpg' } };
	}
	if ( sizes ) {
		const s = sizes[ size ] || ( 'full' !== size ? null : sizes.full );
		const su = s && 'object' === typeof s ? s.url : s;
		if ( 'string' === typeof su && '' !== su.trim() ) {
			u = su.trim();
		}
	}
	if ( '' !== u && ! /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test( u ) ) {
		const parts = u.replace( /\\/g, '/' ).split( '/' ).filter( ( seg ) => '' !== seg && '.' !== seg && '..' !== seg ).map( ( seg ) => {
			let dec = seg;
			try {
				dec = decodeURIComponent( seg );
			} catch ( e ) {
				dec = seg;
			}
			return encodeURIComponent( dec ).replace( /[!'()*]/g, ( c ) => '%' + c.charCodeAt( 0 ).toString( 16 ).toUpperCase() );
		} );
		u = parts.length ? pluginUrl() + parts.join( '/' ) : '';
		id = 0;
	}
	u = '' !== u ? S.url( u, S.WEB ) : '';
	if ( '' === u ) {
		id = 0;
	}
	return { id, url: u, alt };
};

export const placeholderUrl = () => pluginUrl() + 'assets/img/placeholder.svg';

/**
 * Member object used by every template (bptm_member_from_item()).
 *
 * @param {Object}  item      Raw item.
 * @param {string}  size      Image size.
 * @param {boolean} allowHtml Rich details.
 * @param {number}  index     Position.
 * @return {Object|null} Member.
 */
export const memberFromItem = ( item, size, allowHtml, index ) => {
	if ( ! item || 'object' !== typeof item || Array.isArray( item ) ) {
		return null;
	}
	const txt = ( k ) => ( 'string' === typeof item[ k ] || 'number' === typeof item[ k ] ? S.text( item[ k ] ) : '' );
	const lnk = ( k ) => ( 'string' === typeof item[ k ] && '' !== item[ k ].trim() ? S.url( item[ k ].trim() ) : '' );

	let id = S.itemId( item.id );
	if ( '' === id ) {
		id = 'm' + ( index + 1 );
	}
	const name = txt( 'name' );
	const rawDetails = 'string' === typeof item.details ? item.details.replace( /\r\n?/g, '\n' ) : '';
	let content = null; // Clean node list (paragraphs).
	if ( allowHtml ) {
		content = '' !== rawDetails.trim() ? S.cleanHtml( rawDetails ) : [];
	} else {
		const plain = S.decodeEntities( S.stripTags( rawDetails ) );
		content = '' !== plain.trim() ? S.textParagraphs( plain ) : [];
	}
	const excerpt = S.decodeEntities( S.stripTags( rawDetails ) ).replace( /\s+/g, ' ' ).trim();

	const image = resolveImage( item.image, size );
	const flip = resolveImage( item.flipImage, size );

	const terms = {};
	Object.keys( TERM_FIELDS ).forEach( ( f ) => {
		terms[ TERM_FIELDS[ f ] ] = splitTerms( item[ f ] );
	} );

	const social = [];
	( Array.isArray( item.social ) ? item.social : [] ).forEach( ( row ) => {
		if ( ! row || 'object' !== typeof row ) {
			return;
		}
		const icon = S.iconClass( row.icon );
		const link = socialLink( 'string' === typeof row.link || 'number' === typeof row.link ? String( row.link ) : '', icon );
		if ( icon && link ) {
			social.push( { icon, link } );
		}
	} );
	const skills = [];
	( Array.isArray( item.skills ) ? item.skills : [] ).forEach( ( row ) => {
		if ( ! row || 'object' !== typeof row ) {
			return;
		}
		const skill = 'string' === typeof row.skill || 'number' === typeof row.skill ? S.text( row.skill ) : '';
		if ( '' === skill ) {
			return;
		}
		const pct = isNumeric( row.percent ) ? Math.round( Number( row.percent ) ) : 0;
		skills.push( { skill, percent: Math.max( 0, Math.min( 100, pct ) ) } );
	} );

	return {
		id,
		name,
		slug: S.termSlug( name ),
		content,
		excerpt,
		designation: txt( 'designation' ),
		company: txt( 'company' ),
		company_website: lnk( 'companyWebsite' ),
		land_phone: txt( 'landPhone' ),
		cell_phone: txt( 'cellPhone' ),
		email: S.email( item.email ),
		email_cc: S.emailList( item.emailCc ),
		email_bcc: S.emailList( item.emailBcc ),
		address: txt( 'address' ),
		ribbon: txt( 'ribbon' ),
		zip_code: txt( 'zipCode' ),
		vcard: lnk( 'vcard' ),
		custom_page: lnk( 'customUrl' ),
		featured: isOn( item.featured ),
		image_id: image.id,
		image_url: '' !== image.url ? image.url : placeholderUrl(),
		image_alt: '' !== image.alt ? image.alt : name,
		flip_image_id: flip.id,
		flip_image_url: flip.url,
		social,
		skills,
		terms,
		menu_order: index,
	};
};

const isPhoneIcon = ( icon ) => /(?:^|\s)fa-(?:phone(?:-[a-z0-9-]+)?|square-phone(?:-[a-z0-9-]+)?|mobile(?:-[a-z0-9-]+)?)(?:\s|$)/.test( String( icon ).toLowerCase() );

/** bptm_sanitize_social_link(). */
export const socialLink = ( link, icon ) => {
	link = String( link || '' ).trim();
	if ( '' === link ) {
		return '';
	}
	if ( S.isEmail( link ) ) {
		link = 'mailto:' + link;
	} else if ( /^\+?[0-9 ().-]{5,}$/.test( link ) && isPhoneIcon( icon ) ) {
		link = 'tel:' + link.replace( /[^0-9+]/g, '' );
	}
	return S.url( link, [ 'http', 'https', 'ftp', 'ftps', 'mailto', 'news', 'irc', 'irc6', 'ircs', 'gopher', 'nntp', 'feed', 'telnet', 'mms', 'rtsp', 'sms', 'svn', 'tel', 'fax', 'xmpp', 'webcal', 'urn', 'skype', 'whatsapp', 'viber', 'tg', 'callto' ] );
};

/** Href for a social entry (Context::social_href()). */
export const socialHref = ( s ) => {
	const icon = s.icon || '';
	let link = String( s.link || '' ).trim();
	if ( '' === link ) {
		return '';
	}
	if ( -1 !== icon.indexOf( 'envelope' ) && S.isEmail( link ) ) {
		return 'mailto:' + link;
	}
	if ( /fa-(phone|mobile)/.test( icon ) && /^[+\d][\d\s().-]+$/.test( link ) ) {
		return 'tel:' + link.replace( /[^\d+]/g, '' );
	}
	if ( -1 !== icon.indexOf( 'whatsapp' ) && /^[+\d][\d\s().-]+$/.test( link ) ) {
		return 'https://wa.me/' + link.replace( /\D/g, '' );
	}
	if ( -1 !== icon.indexOf( 'skype' ) && ! /^[a-z]+:/i.test( link ) ) {
		return 'skype:' + link + '?chat';
	}
	if ( ! /^[a-z][a-z0-9+.-]*:/i.test( link ) ) {
		link = 'https://' + link.replace( /^\/+/, '' );
	}
	return link;
};

/** All member objects of the block (ids made unique). */
export const buildMembers = ( atts ) => {
	const items = Array.isArray( atts.members ) ? atts.members.slice( 0, MAX_MEMBERS ) : [];
	const size = atts.thumbnailSize || 'large';
	const html = !! atts.allowHtmlDetails;
	const seen = new Set();
	const out = [];
	items.forEach( ( item, index ) => {
		const m = memberFromItem( item, size, html, index );
		if ( ! m ) {
			return;
		}
		const base = m.id;
		let id = base;
		let n = 1;
		while ( seen.has( id ) ) {
			n++;
			id = base + '-' + n;
		}
		seen.add( id );
		m.id = id;
		out.push( m );
	} );
	return out;
};

export const termNames = ( m, k, sep = ', ' ) => ( m.terms[ k ] || [] ).map( ( t ) => t.name ).join( sep );
export const termSlugs = ( m, k ) => ( m.terms[ k ] || [] ).map( ( t ) => t.slug );

/* ------------------------------------------------------------------ */
/* Query                                                               */
/* ------------------------------------------------------------------ */

export const INCLUDE_MAP = {
	includeGroups: 'group',
	includeTags: 'tag',
	includeLocations: 'location',
	includeLanguages: 'language',
	includeSpecialties: 'specialty',
	includeGenders: 'gender',
	includeExtraOne: 'extra_one',
	includeExtraTwo: 'extra_two',
	includeExtraThree: 'extra_three',
	includeExtraFour: 'extra_four',
	includeExtraFive: 'extra_five',
};

/** Include / exclude list → term names (legacy numeric ids ignored). */
export const termValues = ( rawList ) => {
	if ( 'string' === typeof rawList ) {
		rawList = rawList.split( ',' );
	}
	const out = [];
	( Array.isArray( rawList ) ? rawList : [] ).forEach( ( v ) => {
		if ( v && 'object' === typeof v ) {
			v = undefined !== v.value ? v.value : ( undefined !== v.name ? v.name : v.label );
		}
		if ( 'string' !== typeof v ) {
			return;
		}
		v = S.text( v );
		if ( '' !== v && ! out.includes( v ) ) {
			out.push( v );
		}
	} );
	return out;
};

export const termMatches = ( term, values ) => {
	const name = S.lower( term.name );
	return values.some( ( v ) => S.lower( v ) === name || S.termSlug( v ) === term.slug );
};

const memberHas = ( m, k, values ) => ( m.terms[ k ] || [] ).some( ( t ) => termMatches( t, values ) );

const contains = ( hay, needle ) => '' === needle || -1 !== S.lower( hay ).indexOf( needle );

/** Text searched by "search in all fields". */
export const searchText = ( m ) => {
	const hay = [ m.designation, m.company, m.company_website, m.email, m.land_phone, m.cell_phone, m.address, m.zip_code, m.ribbon, m.excerpt ];
	Object.keys( m.terms ).forEach( ( k ) => m.terms[ k ].forEach( ( t ) => hay.push( t.name ) ) );
	m.skills.forEach( ( s ) => hay.push( s.skill ) );
	return hay.filter( ( x ) => '' !== String( x ) ).join( ' ' );
};

const applyIncludes = ( atts, members ) => {
	Object.keys( INCLUDE_MAP ).forEach( ( attr ) => {
		const values = termValues( atts[ attr ] );
		if ( values.length ) {
			members = members.filter( ( m ) => memberHas( m, INCLUDE_MAP[ attr ], values ) );
		}
	} );
	const exclude = termValues( atts.excludeGroups );
	if ( exclude.length ) {
		members = members.filter( ( m ) => ! memberHas( m, 'group', exclude ) );
	}
	return members;
};

/** Order + featured first (Query::order()). `seed` keeps the random order stable per instance. */
export const orderMembers = ( atts, members, seed ) => {
	const orderby = normOrderBy( atts.orderBy );
	let desc = 'DESC' === String( atts.order ).toUpperCase();
	let list = members.slice();
	if ( 'title' === orderby ) {
		const coll = 'undefined' !== typeof Intl ? new Intl.Collator( undefined, { numeric: true, sensitivity: 'base' } ) : null;
		list.sort( ( a, b ) => {
			const c = coll ? coll.compare( a.name, b.name ) : a.name.localeCompare( b.name );
			return 0 !== c ? c : a.menu_order - b.menu_order;
		} );
	} else if ( 'rand' === orderby ) {
		const h = ( id ) => {
			let x = 2166136261 ^ seed;
			const s = String( seed ) + '|' + id;
			for ( let i = 0; i < s.length; i++ ) {
				x ^= s.charCodeAt( i );
				x = Math.imul( x, 16777619 ) >>> 0;
			}
			return x;
		};
		list.sort( ( a, b ) => h( a.id ) - h( b.id ) );
		desc = false;
	}
	if ( desc ) {
		list.reverse();
	}
	if ( atts.enableFeaturing ) {
		list = [ ...list.filter( ( m ) => m.featured ), ...list.filter( ( m ) => ! m.featured ) ];
	}
	return list;
};

/**
 * Server-style filters (former "ajax filter" REST path): applied to the base list before pagination.
 *
 * @param {Object[]} members Members.
 * @param {Object}   f       Filter state { group, designation, location…: string[], search, company, zip, tag }.
 * @return {Object[]} Members.
 */
export const applyRuntimeFilters = ( members, f ) => {
	FILTER_TAX.forEach( ( k ) => {
		const vals = ( f[ k ] || [] ).map( ( v ) => S.termSlug( String( v ) ) ).filter( Boolean );
		if ( vals.length ) {
			members = members.filter( ( m ) => termSlugs( m, k ).some( ( s ) => vals.includes( s ) ) );
		}
	} );
	if ( f.designation && f.designation.length ) {
		const want = f.designation.map( ( v ) => S.termSlug( String( v ) ) );
		members = members.filter( ( m ) => want.includes( S.termSlug( m.designation ) ) );
	}
	const search = f.search ? S.lower( String( f.search ).trim() ) : '';
	if ( search ) {
		const all = pref( 'search_all_fields' );
		members = members.filter( ( m ) => contains( m.name, search ) || ( all && contains( searchText( m ), search ) ) );
	}
	[ [ 'company', 'company' ], [ 'zip', 'zip_code' ] ].forEach( ( [ k, field ] ) => {
		const v = f[ k ] ? S.lower( String( f[ k ] ).trim() ) : '';
		if ( v ) {
			members = members.filter( ( m ) => '' !== m[ field ] && contains( m[ field ], v ) );
		}
	} );
	const tag = f.tag ? S.lower( String( f.tag ).trim() ) : '';
	if ( tag ) {
		members = members.filter( ( m ) => ( m.terms.tag || [] ).some( ( t ) => contains( t.name, tag ) ) );
	}
	return members;
};

/**
 * Client-side ("normal filter") match, same semantics as the former data-attribute matching.
 *
 * @param {Object} m Member.
 * @param {Object} s State { group: slug, designation: [slug], <tax>: [slug], search, company, zip, tag }.
 * @return {boolean} Match.
 */
export const clientMatches = ( m, s ) => {
	if ( s.group && ! termSlugs( m, 'group' ).map( S.lower ).includes( s.group ) ) {
		return false;
	}
	if ( s.designation && s.designation.length && ! s.designation.includes( '' !== m.designation ? S.termSlug( m.designation ) : '' ) ) {
		return false;
	}
	for ( const k of FILTER_TAX ) {
		if ( 'group' === k || ! s[ k ] || ! s[ k ].length ) {
			continue;
		}
		const have = termSlugs( m, k ).map( S.lower );
		if ( ! s[ k ].some( ( v ) => have.includes( S.lower( String( v ) ) ) ) ) {
			return false;
		}
	}
	if ( s.search ) {
		const q = S.lower( s.search );
		const inName = -1 !== S.lower( m.name ).indexOf( q );
		const inAll = pref( 'search_all_fields' ) && -1 !== S.lower( searchText( m ) ).indexOf( q );
		if ( ! inName && ! inAll ) {
			return false;
		}
	}
	if ( s.company && -1 === S.lower( m.company ).indexOf( S.lower( s.company ) ) ) {
		return false;
	}
	if ( s.zip && -1 === S.lower( m.zip_code ).indexOf( S.lower( s.zip ) ) ) {
		return false;
	}
	if ( s.tag ) {
		const q = S.lower( s.tag );
		if ( ! ( m.terms.tag || [] ).some( ( t ) => -1 !== S.lower( t.name ).indexOf( q ) ) ) {
			return false;
		}
	}
	return true;
};

/**
 * Members before frontend filters / pagination: includes applied, ordered, capped.
 *
 * @param {Object}   atts    Sanitized attributes.
 * @param {Object[]} members All members.
 * @param {number}   seed    Random seed.
 * @return {Object} { base, pool }.
 */
export const queryPool = ( atts, members, seed ) => {
	const base = applyIncludes( atts, members );
	let pool = orderMembers( atts, base, seed );
	const num = Math.trunc( Number( atts.numberOfMembers ) ) || 0;
	if ( num > 0 ) {
		pool = pool.slice( 0, num );
	}
	return { base, pool };
};

/** Distinct terms of a key across the pool (Filters::terms()). */
export const filterTerms = ( key, atts, pool, includeAttr = '' ) => {
	const include = includeAttr ? termValues( atts[ includeAttr ] ) : [];
	const exclude = 'group' === key ? termValues( atts.excludeGroups ) : [];
	const terms = new Map();
	pool.forEach( ( m ) => {
		( m.terms[ key ] || [] ).forEach( ( t ) => {
			if ( terms.has( t.slug ) ) {
				terms.get( t.slug ).count++;
				return;
			}
			if ( ( include.length && ! termMatches( t, include ) ) || ( exclude.length && termMatches( t, exclude ) ) ) {
				return;
			}
			terms.set( t.slug, { slug: t.slug, name: t.name, count: 1 } );
		} );
	} );
	let list = [ ...terms.values() ];
	if ( [ 'name', 'slug' ].includes( atts.taxonomyOrderBy ) ) {
		const coll = 'undefined' !== typeof Intl ? new Intl.Collator( undefined, { numeric: true, sensitivity: 'base' } ) : null;
		list.sort( ( a, b ) => ( coll ? coll.compare( a.name, b.name ) : a.name.localeCompare( b.name ) ) );
	}
	if ( 'DESC' === atts.taxonomyOrder ) {
		list = list.reverse();
	}
	return list;
};

/** Distinct designations (slug => label), natural case-insensitive order. */
export const designations = ( pool ) => {
	const vals = new Map();
	pool.forEach( ( m ) => {
		const d = m.designation.trim();
		if ( '' !== d ) {
			const slug = S.termSlug( d );
			if ( ! vals.has( slug ) ) {
				vals.set( slug, d );
			}
		}
	} );
	const coll = 'undefined' !== typeof Intl ? new Intl.Collator( undefined, { numeric: true, sensitivity: 'base' } ) : null;
	return [ ...vals.entries() ].sort( ( a, b ) => ( coll ? coll.compare( a[ 1 ], b[ 1 ] ) : a[ 1 ].localeCompare( b[ 1 ] ) ) );
};

export { getThemeDef };
