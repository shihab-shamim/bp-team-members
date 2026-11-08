/**
 * Data PHP hands to the scripts (no rendering happens on the server):
 * window.bptmData = { pluginUrl, translations, prefs, fonts (editor), thumbnailSizes (editor), adminUrls (editor) }.
 * Older editor builds localized window.bptmEditor; it is read as a fallback.
 */
import { __ } from '@wordpress/i18n';

const raw = () => {
	if ( 'undefined' === typeof window ) {
		return {};
	}
	const d = window.bptmData && 'object' === typeof window.bptmData ? window.bptmData : null;
	if ( d ) {
		return d;
	}
	return window.bptmEditor && 'object' === typeof window.bptmEditor ? window.bptmEditor : {};
};

export const bridge = () => raw();

/** Built-in English defaults of the replaceable front-end strings (used when the bridge is missing). */
const DEFAULT_TRANSLATIONS = () => ( {
	filter_designation: __( 'Show All Designation', 'bp-team-member' ),
	search_name: __( 'Search By Name', 'bp-team-member' ),
	search_company: __( 'Search By Company', 'bp-team-member' ),
	search_zip: __( 'Search By Zip', 'bp-team-member' ),
	search_tag: __( 'Search By Tag', 'bp-team-member' ),
	company: __( 'Company', 'bp-team-member' ),
	address: __( 'Address', 'bp-team-member' ),
	land_phone: __( 'Land Phone', 'bp-team-member' ),
	cell_phone: __( 'Cell Phone', 'bp-team-member' ),
	email: __( 'Email', 'bp-team-member' ),
	zip_code: __( 'Zip Code', 'bp-team-member' ),
	group: __( 'Group', 'bp-team-member' ),
	tag: __( 'Tag', 'bp-team-member' ),
	location: __( 'Location', 'bp-team-member' ),
	language: __( 'Language', 'bp-team-member' ),
	specialty: __( 'Specialty', 'bp-team-member' ),
	gender: __( 'Gender', 'bp-team-member' ),
	extra_one: __( 'Extra One', 'bp-team-member' ),
	extra_two: __( 'Extra Two', 'bp-team-member' ),
	extra_three: __( 'Extra Three', 'bp-team-member' ),
	extra_four: __( 'Extra Four', 'bp-team-member' ),
	extra_five: __( 'Extra Five', 'bp-team-member' ),
	follow_me_on: __( 'Follow Me On', 'bp-team-member' ),
	skills: __( 'Skills', 'bp-team-member' ),
	read_on: __( 'Read On', 'bp-team-member' ),
	more: __( 'More', 'bp-team-member' ),
	vcard: __( 'Download vCard', 'bp-team-member' ),
	reset_filters: __( 'Reset Filters', 'bp-team-member' ),
	prev: __( 'Prev', 'bp-team-member' ),
	next: __( 'Next', 'bp-team-member' ),
	load_more: __( 'Load More', 'bp-team-member' ),
	no_members: __( 'No team member found.', 'bp-team-member' ),
} );

let defaults = null;

/**
 * Replaceable front-end string (Settings → Translations; multilingual mode is resolved by PHP).
 *
 * @param {string} key Key.
 * @return {string} Text ('' never: falls back to the default, then the key).
 */
export const t = ( key ) => {
	const tr = raw().translations;
	let v = tr && 'object' === typeof tr ? tr[ key ] : undefined;
	if ( v && 'object' === typeof v ) {
		v = v.value || v.label;
	}
	if ( 'string' === typeof v && '' !== v.trim() ) {
		return v;
	}
	if ( ! defaults ) {
		defaults = DEFAULT_TRANSLATIONS();
	}
	return defaults[ key ] || String( key );
};

/** Label of a term key (group, tag, location, … extra_five). */
export const termLabel = ( key ) => {
	const v = t( key );
	return v && v !== key ? v : String( key ).replace( /_/g, ' ' ).replace( /\b\w/g, ( c ) => c.toUpperCase() );
};

const isOn = ( v ) => {
	if ( 'boolean' === typeof v ) {
		return v;
	}
	if ( 'number' === typeof v ) {
		return v > 0;
	}
	if ( 'string' === typeof v ) {
		return [ 'on', 'yes', 'true', '1' ].includes( v.trim().toLowerCase() );
	}
	return !! v;
};

const PREF_DEFAULTS = {
	land_phone_link: false,
	cell_phone_link: false,
	email_link: false,
	disable_google_fonts: false,
	disable_lazy_load: false,
	lazy_load_class: 'skip-lazy',
	search_all_fields: false,
};

/**
 * Preference value (booleans normalised; lazy_load_class stays a string).
 *
 * @param {string} key Key.
 * @return {*} Value.
 */
export const pref = ( key ) => {
	const prefs = raw().prefs && 'object' === typeof raw().prefs ? raw().prefs : {};
	const v = Object.prototype.hasOwnProperty.call( prefs, key ) ? prefs[ key ] : PREF_DEFAULTS[ key ];
	if ( 'lazy_load_class' === key ) {
		return 'string' === typeof v ? v : 'skip-lazy';
	}
	return isOn( v );
};

// Fallback plugin URL derived from this bundle's URL (…/bp-team-member/build/view.js|index.js),
// read at module load while document.currentScript still points at it.
const SCRIPT_SRC = 'undefined' !== typeof document && document.currentScript ? document.currentScript.src || '' : '';
const SCRIPT_PLUGIN_URL = /\/build\/[^/]*$/.test( SCRIPT_SRC ) ? SCRIPT_SRC.replace( /build\/[^/?#]*([?#].*)?$/, '' ) : '';

/** Plugin root URL with a trailing slash. */
export const pluginUrl = () => {
	const url = raw().pluginUrl;
	if ( url && 'string' === typeof url && /^(https?:)?\/\//i.test( url ) ) {
		return url.replace( /\/?$/, '/' );
	}
	return SCRIPT_PLUGIN_URL;
};

/** Google font families known to the editor (empty on the front end). */
export const knownFonts = () => ( Array.isArray( raw().fonts ) ? raw().fonts : [] );
