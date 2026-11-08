/**
 * Editor data accessors. Themes, visibility fields and social icons come from the shared JS modules
 * (src/Components/Common/Team/*, the same ones the front end renders with); fonts, image sizes, plugin URL,
 * translations and admin URLs come from the PHP data bridge `window.bptmData` (fallback: the former
 * `window.bptmEditor`), with static fallbacks so the inspector stays usable without it.
 */
import { __ } from '@wordpress/i18n';

import { getThemeList, getThemeDef, VIS_KEYS } from '../Components/Common/Team/registry';
import { bridge, pluginUrl, termLabel as bridgeTermLabel } from '../Components/Common/Team/bridge';
import socialIconMap from '../Components/Common/Team/socialIcons.json';

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

/** Theme list: [{id,label,group,layout,carousel,filter,forced_link,forced_view,grouped,pagination,visibility}]. */
export const getThemes = () => getThemeList();

export const getTheme = ( id ) => getThemeDef( id );

export const getThemesByFamily = () => {
	const families = {};
	getThemes().forEach( ( t ) => {
		( families[ t.group ] = families[ t.group ] || [] ).push( t );
	} );
	return FAMILY_ORDER.filter( ( f ) => families[ f ] ).map( ( f ) => ( { key: f, label: FAMILY_LABELS[ f ], themes: families[ f ] } ) );
};

export const getThumbnailSizes = () => {
	const sizes = bridge().thumbnailSizes;
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

const FIELD_LABELS = () => ( {
	thumbnail: __( 'Thumbnail', 'bp-team-member' ),
	name: __( 'Name', 'bp-team-member' ),
	designation: __( 'Designation', 'bp-team-member' ),
	details: __( 'Details', 'bp-team-member' ),
	social: __( 'Social Links', 'bp-team-member' ),
	ribbon: __( 'Ribbon', 'bp-team-member' ),
	featured_badge: __( 'Featured Badge', 'bp-team-member' ),
	skills: __( 'Skills', 'bp-team-member' ),
	company: __( 'Company', 'bp-team-member' ),
	address: __( 'Address', 'bp-team-member' ),
	land_phone: __( 'Land Phone', 'bp-team-member' ),
	cell_phone: __( 'Cell Phone', 'bp-team-member' ),
	email: __( 'Email', 'bp-team-member' ),
	zip: __( 'Zip Code', 'bp-team-member' ),
	vcard: __( 'vCard', 'bp-team-member' ),
	read_more: __( 'Read More', 'bp-team-member' ),
} );

/** Visibility fields [{key,label}] (term fields use the Translations labels). */
export const getVisibilityFields = () => {
	const labels = FIELD_LABELS();
	return VIS_KEYS.map( ( key ) => ( { key, label: labels[ key ] || bridgeTermLabel( key ) } ) );
};

/** One replaceable string from Settings → Translations ('' when not set). */
export const translation = ( key ) => {
	const tr = bridge().translations;
	let v = tr && 'object' === typeof tr ? tr[ key ] : undefined;
	if ( v && 'object' === typeof v ) {
		v = v.value || v.label;
	}
	return 'string' === typeof v && v.trim() ? v : '';
};

const FALLBACK_TERM_LABELS = {
	group: __( 'Group', 'bp-team-member' ),
	tag: __( 'Tags', 'bp-team-member' ),
};

/** Label of a taxonomy-like member field (group, tag, location, …, extra_five). */
export const termLabel = ( key ) => translation( key ) || FALLBACK_TERM_LABELS[ key ] || bridgeTermLabel( key );

/** Plugin root URL (with trailing slash) used to resolve relative member image URLs. */
export const getPluginUrl = () => pluginUrl();

let socialCache = null;

/** Social icon choices: [{value: 'fab fa-…', label}]. */
export const getSocialIcons = () => {
	if ( ! socialCache ) {
		socialCache = Object.keys( socialIconMap ).map( ( value ) => ( { value, label: String( socialIconMap[ value ] || value ) } ) );
	}
	return socialCache;
};

