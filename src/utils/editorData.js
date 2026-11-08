/**
 * Accessors for the data PHP localizes as `window.bptmEditor`
 * (render area: includes/render/class-editor-data.php), with static fallbacks
 * so the inspector stays usable if the localized object is missing.
 */
import { __ } from '@wordpress/i18n';

const raw = () => ( 'undefined' !== typeof window && window.bptmEditor && 'object' === typeof window.bptmEditor ? window.bptmEditor : {} );

export const FAMILY_LABELS = {
	grid: __( 'Grid', 'bp-team-member' ),
	circle: __( 'Circle', 'bp-team-member' ),
	horizontal: __( 'Horizontal', 'bp-team-member' ),
	flip: __( 'Flip', 'bp-team-member' ),
	table: __( 'Table', 'bp-team-member' ),
	list: __( 'List', 'bp-team-member' ),
	legacy: __( 'Special layouts', 'bp-team-member' ),
	sidebar: __( 'Sidebar / Widget', 'bp-team-member' ),
};

export const FAMILY_ORDER = [ 'grid', 'circle', 'horizontal', 'flip', 'table', 'list', 'legacy', 'sidebar' ];

const range = ( prefix, from, to ) => {
	const out = [];
	for ( let i = from; i <= to; i++ ) {
		out.push( `${ prefix }-${ i }` );
	}
	return out;
};

const titleCase = ( id ) => id.replace( /-/g, ' ' ).replace( /\b\w/g, ( c ) => c.toUpperCase() );

/**
 * Fallback registry built from the theme ids listed in docs/ARCHITECTURE.md.
 * Only used when window.bptmEditor.themes is absent.
 */
const fallbackThemes = () => {
	const list = [];
	const add = ( id, group, extra = {} ) => list.push( {
		id,
		label: titleCase( id ),
		group,
		layout: 'table' === group ? 'table' : ( 'list' === group ? 'list' : 'grid' ),
		carousel: [ 'grid', 'circle', 'horizontal', 'flip' ].includes( group ),
		filter: [ 'grid', 'circle', 'horizontal', 'flip' ].includes( group ),
		forced_link: null,
		forced_view: null,
		visibility: {},
		...extra,
	} );
	range( 'grid', 1, 6 ).forEach( ( id ) => add( id, 'grid' ) );
	range( 'circle', 1, 6 ).forEach( ( id ) => add( id, 'circle' ) );
	range( 'horizontal', 1, 9 ).forEach( ( id ) => add( id, 'horizontal' ) );
	range( 'flip', 1, 6 ).forEach( ( id ) => add( id, 'flip' ) );
	range( 'table', 1, 10 ).forEach( ( id ) => add( id, 'table' ) );
	range( 'list', 1, 7 ).forEach( ( id ) => add( id, 'list' ) );
	range( 'grid', 7, 12 ).forEach( ( id ) => add( id, 'legacy' ) );
	add( 'grid-popup', 'legacy', { forced_link: 'popup' } );
	add( 'grid-single', 'legacy', { forced_link: 'single_page' } );
	add( 'grid-filter-single', 'legacy', { forced_view: 'filter', forced_link: 'single_page' } );
	add( 'grid-filter-popup', 'legacy', { forced_view: 'filter', forced_link: 'popup' } );
	add( 'grid-slider', 'legacy', { forced_view: 'carousel' } );
	add( 'grid-panel', 'legacy', { forced_link: 'panel' } );
	add( 'grid-drawer-1', 'legacy', { forced_link: 'drawer' } );
	add( 'grid-drawer-2', 'legacy', { forced_link: 'drawer' } );
	add( 'group-filter-1', 'legacy', { forced_view: 'filter' } );
	range( 'sidebar', 1, 3 ).forEach( ( id ) => add( id, 'sidebar', { layout: 'list' } ) );
	return list;
};

let themeCache = null;

/**
 * Normalised theme list: [{id,label,group,layout,carousel,filter,forced_link,forced_view,visibility}].
 * Accepts the registry either as an array of entries or as an object keyed by id.
 */
export const getThemes = () => {
	if ( themeCache ) {
		return themeCache;
	}
	const src = raw().themes;
	let list = [];
	if ( Array.isArray( src ) ) {
		list = src;
	} else if ( src && 'object' === typeof src ) {
		list = Object.keys( src ).map( ( id ) => ( { id, ...src[ id ] } ) );
	}
	list = list
		.filter( ( t ) => t && ( t.id || t.value ) )
		.map( ( t ) => ( {
			...t,
			id: String( t.id || t.value ),
			label: t.label || titleCase( String( t.id || t.value ) ),
			group: FAMILY_LABELS[ t.group ] ? t.group : 'legacy',
			forced_link: t.forced_link || null,
			forced_view: t.forced_view || null,
			carousel: !! t.carousel || 'carousel' === t.forced_view,
			filter: !! t.filter || 'filter' === t.forced_view,
			// Map field => bool, or a list of visible field keys (both accepted by render).
			visibility: t.visibility && 'object' === typeof t.visibility ? t.visibility : {},
		} ) );
	themeCache = list.length ? list : fallbackThemes();
	return themeCache;
};

export const getTheme = ( id ) => getThemes().find( ( t ) => t.id === id ) || {
	id,
	label: id ? titleCase( id ) : '',
	group: 'grid',
	layout: 'grid',
	carousel: true,
	filter: true,
	forced_link: null,
	forced_view: null,
	visibility: {},
};

export const getThemesByFamily = () => {
	const families = {};
	getThemes().forEach( ( t ) => {
		( families[ t.group ] = families[ t.group ] || [] ).push( t );
	} );
	return FAMILY_ORDER.filter( ( f ) => families[ f ] ).map( ( f ) => ( { key: f, label: FAMILY_LABELS[ f ], themes: families[ f ] } ) );
};

export const getThumbnailSizes = () => {
	const sizes = raw().thumbnailSizes;
	if ( Array.isArray( sizes ) && sizes.length ) {
		return sizes.map( ( s ) => ( 'object' === typeof s ? { label: s.label || s.value, value: s.value } : { label: s, value: s } ) );
	}
	return [
		{ label: __( 'Thumbnail', 'bp-team-member' ), value: 'thumbnail' },
		{ label: __( 'Medium', 'bp-team-member' ), value: 'medium' },
		{ label: __( 'Medium Large', 'bp-team-member' ), value: 'medium_large' },
		{ label: __( 'Large', 'bp-team-member' ), value: 'large' },
		{ label: __( 'Full', 'bp-team-member' ), value: 'full' },
	];
};

export const getFonts = () => {
	const fonts = raw().fonts;
	if ( Array.isArray( fonts ) && fonts.length ) {
		return fonts.map( ( f ) => ( 'object' === typeof f ? ( f.value || f.label || f.family ) : f ) ).filter( Boolean );
	}
	return [ 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Oswald', 'Playfair Display', 'Merriweather', 'Nunito', 'Inter', 'Source Sans Pro' ];
};

const FALLBACK_VISIBILITY = [
	[ 'thumbnail', __( 'Thumbnail', 'bp-team-member' ) ],
	[ 'name', __( 'Name', 'bp-team-member' ) ],
	[ 'designation', __( 'Designation', 'bp-team-member' ) ],
	[ 'details', __( 'Details', 'bp-team-member' ) ],
	[ 'social', __( 'Social links', 'bp-team-member' ) ],
	[ 'ribbon', __( 'Ribbon', 'bp-team-member' ) ],
	[ 'featured_badge', __( 'Featured badge', 'bp-team-member' ) ],
	[ 'skills', __( 'Skills', 'bp-team-member' ) ],
	[ 'company', __( 'Company', 'bp-team-member' ) ],
	[ 'address', __( 'Address', 'bp-team-member' ) ],
	[ 'land_phone', __( 'Land phone', 'bp-team-member' ) ],
	[ 'cell_phone', __( 'Cell phone', 'bp-team-member' ) ],
	[ 'email', __( 'Email', 'bp-team-member' ) ],
	[ 'location', __( 'Location', 'bp-team-member' ) ],
	[ 'language', __( 'Language', 'bp-team-member' ) ],
	[ 'specialty', __( 'Specialty', 'bp-team-member' ) ],
	[ 'gender', __( 'Gender', 'bp-team-member' ) ],
	[ 'zip', __( 'Zip code', 'bp-team-member' ) ],
	[ 'extra_one', __( 'Extra One', 'bp-team-member' ) ],
	[ 'extra_two', __( 'Extra Two', 'bp-team-member' ) ],
	[ 'extra_three', __( 'Extra Three', 'bp-team-member' ) ],
	[ 'extra_four', __( 'Extra Four', 'bp-team-member' ) ],
	[ 'extra_five', __( 'Extra Five', 'bp-team-member' ) ],
	[ 'acf_fields', __( 'ACF fields', 'bp-team-member' ) ],
	[ 'vcard', __( 'vCard', 'bp-team-member' ) ],
	[ 'read_more', __( 'Read more link', 'bp-team-member' ) ],
];

export const getVisibilityFields = () => {
	const fields = raw().visibilityFields;
	if ( Array.isArray( fields ) && fields.length ) {
		return fields.filter( ( f ) => f && f.key ).map( ( f ) => ( { key: String( f.key ), label: f.label || f.key } ) );
	}
	if ( fields && 'object' === typeof fields && ! Array.isArray( fields ) && Object.keys( fields ).length ) {
		return Object.keys( fields ).map( ( key ) => ( { key, label: fields[ key ] } ) );
	}
	return FALLBACK_VISIBILITY.map( ( [ key, label ] ) => ( { key, label } ) );
};

/**
 * Taxonomy key => include attribute name in block.json.
 */
export const TAXONOMY_ATTRS = {
	group: 'includeGroups',
	tag: 'includeTags',
	location: 'includeLocations',
	language: 'includeLanguages',
	specialty: 'includeSpecialties',
	gender: 'includeGenders',
	extra_one: 'includeExtraOne',
	extra_two: 'includeExtraTwo',
	extra_three: 'includeExtraThree',
	extra_four: 'includeExtraFour',
	extra_five: 'includeExtraFive',
};

const FALLBACK_TAX_LABELS = {
	group: __( 'Groups', 'bp-team-member' ),
	tag: __( 'Tags', 'bp-team-member' ),
	location: __( 'Location', 'bp-team-member' ),
	language: __( 'Language', 'bp-team-member' ),
	specialty: __( 'Specialty', 'bp-team-member' ),
	gender: __( 'Gender', 'bp-team-member' ),
	extra_one: __( 'Extra One', 'bp-team-member' ),
	extra_two: __( 'Extra Two', 'bp-team-member' ),
	extra_three: __( 'Extra Three', 'bp-team-member' ),
	extra_four: __( 'Extra Four', 'bp-team-member' ),
	extra_five: __( 'Extra Five', 'bp-team-member' ),
};

/**
 * All taxonomies: [{key, taxonomy, label, enabled}].
 */
export const getTaxonomies = () => {
	const tax = raw().taxonomies;
	let list = [];
	if ( Array.isArray( tax ) ) {
		list = tax;
	} else if ( tax && 'object' === typeof tax ) {
		list = Object.keys( tax ).map( ( key ) => ( { key, ...tax[ key ] } ) );
	}
	list = list.filter( ( t ) => t && t.key && TAXONOMY_ATTRS[ t.key ] ).map( ( t ) => ( {
		key: t.key,
		taxonomy: t.taxonomy || `bptm_${ t.key }`,
		label: t.plural || t.label || FALLBACK_TAX_LABELS[ t.key ],
		enabled: false !== t.enabled,
	} ) );
	if ( ! list.length ) {
		list = Object.keys( TAXONOMY_ATTRS ).map( ( key ) => ( {
			key,
			taxonomy: `bptm_${ key }`,
			label: FALLBACK_TAX_LABELS[ key ],
			enabled: ! key.startsWith( 'extra_' ),
		} ) );
	}
	return list;
};

export const getEnabledTaxonomies = () => getTaxonomies().filter( ( t ) => t.enabled );

export const isTaxonomyEnabled = ( key ) => getEnabledTaxonomies().some( ( t ) => t.key === key );

export const taxonomyLabel = ( key ) => ( getTaxonomies().find( ( t ) => t.key === key ) || {} ).label || FALLBACK_TAX_LABELS[ key ] || key;

/**
 * Whether there are any members. Unknown (no localized data) is treated as true
 * so the preview is still attempted.
 */
export const hasMembers = () => false !== raw().hasMembers;

export const hasAcf = () => !! raw().hasAcf;

/** Settings → Preferences → default link type (used when a block keeps link type "Default"). */
export const singleLinkType = () => raw().singleLinkType || 'single_page';

export const adminUrl = ( key ) => {
	const urls = raw().adminUrls || {};
	const defaults = {
		addMember: 'post-new.php?post_type=bptm_member',
		members: 'edit.php?post_type=bptm_member',
		settings: 'edit.php?post_type=bptm_member&page=bptm-preferences',
		demoData: 'edit.php?post_type=bptm_member&page=bptm-demo-data',
	};
	return urls[ key ] || defaults[ key ] || '';
};
