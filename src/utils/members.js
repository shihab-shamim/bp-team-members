/**
 * Helpers for the `members` block attribute (v2 data model: members live in the block).
 * Item shape: see docs/ARCHITECTURE.md → "v2 data model".
 */
import { getPluginUrl } from './editorData';

export const IMAGE_BLANK = { id: 0, url: '', alt: '' };

/** Taxonomy-like text fields: render key => member field + include attribute. */
export const TERM_FIELDS = [
	{ key: 'group', field: 'group', include: 'includeGroups' },
	{ key: 'tag', field: 'tags', include: 'includeTags' },
	{ key: 'location', field: 'location', include: 'includeLocations' },
	{ key: 'language', field: 'language', include: 'includeLanguages' },
	{ key: 'specialty', field: 'specialty', include: 'includeSpecialties' },
	{ key: 'gender', field: 'gender', include: 'includeGenders' },
	{ key: 'extra_one', field: 'extraOne', include: 'includeExtraOne' },
	{ key: 'extra_two', field: 'extraTwo', include: 'includeExtraTwo' },
	{ key: 'extra_three', field: 'extraThree', include: 'includeExtraThree' },
	{ key: 'extra_four', field: 'extraFour', include: 'includeExtraFour' },
	{ key: 'extra_five', field: 'extraFive', include: 'includeExtraFive' },
];

/** A new id that is not used by any of the given members. */
export const newMemberId = ( members = [] ) => {
	const used = new Set( ( Array.isArray( members ) ? members : [] ).map( ( m ) => m && m.id ) );
	let id;
	do {
		id = `m${ Date.now().toString( 36 ) }${ Math.random().toString( 36 ).slice( 2, 6 ) }`;
	} while ( used.has( id ) );
	return id;
};

/** A complete blank member. */
export const blankMember = ( members = [] ) => ( {
	id: newMemberId( members ),
	name: '',
	designation: '',
	details: '',
	image: { ...IMAGE_BLANK },
	flipImage: { ...IMAGE_BLANK },
	company: '',
	companyWebsite: '',
	landPhone: '',
	cellPhone: '',
	email: '',
	emailCc: '',
	emailBcc: '',
	address: '',
	ribbon: '',
	zipCode: '',
	vcard: '',
	customUrl: '',
	featured: false,
	social: [],
	skills: [],
	group: '',
	tags: '',
	language: '',
	location: '',
	gender: '',
	specialty: '',
	extraOne: '',
	extraTwo: '',
	extraThree: '',
	extraFour: '',
	extraFive: '',
} );

/** Deep copy of a member with a fresh id (for "Duplicate"). */
export const duplicateMember = ( member, members = [] ) => ( {
	...JSON.parse( JSON.stringify( member || {} ) ),
	id: newMemberId( members ),
} );

export const getMembers = ( attributes ) => ( Array.isArray( attributes && attributes.members ) ? attributes.members : [] );

/** Move an array item; returns a new array (or the same one when the move is impossible). */
export const moveItem = ( arr, from, to ) => {
	if ( ! Array.isArray( arr ) || to < 0 || to >= arr.length || from === to ) {
		return arr;
	}
	const next = [ ...arr ];
	const [ item ] = next.splice( from, 1 );
	next.splice( to, 0, item );
	return next;
};

/** Absolute URL for a stored image url (relative URLs are relative to the plugin root). */
export const resolveUrl = ( url ) => {
	if ( ! url || 'string' !== typeof url ) {
		return '';
	}
	if ( /^([a-z][a-z0-9+.-]*:|\/)/i.test( url ) ) {
		return url;
	}
	const base = getPluginUrl();
	return base ? base.replace( /\/?$/, '/' ) + url.replace( /^\.?\//, '' ) : url;
};

export const splitValues = ( value ) => String( value || '' ).split( ',' ).map( ( s ) => s.trim() ).filter( Boolean );

/** Distinct values (first-seen order, case-insensitive) of one text field across all members. */
export const distinctValues = ( members, field ) => {
	const seen = new Map();
	( Array.isArray( members ) ? members : [] ).forEach( ( m ) => {
		splitValues( m && m[ field ] ).forEach( ( v ) => {
			const k = v.toLowerCase();
			if ( ! seen.has( k ) ) {
				seen.set( k, v );
			}
		} );
	} );
	return [ ...seen.values() ];
};

