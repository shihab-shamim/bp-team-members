/**
 * Theme registry, visibility fields and detail styles (single source for the editor and the front end).
 *
 * Ported from the former PHP registries (includes/render/themes/registry-{a,b,c}.php).
 * Each theme: { id, label, group, layout: grid|table|list, carousel, filter, forced_link, forced_view,
 * grouped, pagination, visibility: { field: bool } (card defaults) }.
 */
import { __ } from '@wordpress/i18n';

export const DEFAULT_THEME = 'grid-5';

export const VIS_KEYS = [
	'thumbnail', 'name', 'designation', 'details', 'social', 'ribbon', 'featured_badge', 'skills', 'company', 'address',
	'land_phone', 'cell_phone', 'email', 'location', 'language', 'specialty', 'gender', 'zip', 'extra_one', 'extra_two',
	'extra_three', 'extra_four', 'extra_five', 'vcard', 'read_more',
];

/** Fields shown on cards by default when a registry entry does not list them. */
export const CORE_FIELDS = [ 'thumbnail', 'name', 'designation', 'details', 'social', 'ribbon', 'featured_badge', 'read_more' ];

export const VIS_GROUPS = [ 'initial', 'popup', 'panel', 'drawer' ];
export const VIS_DEVICES = [ 'desktop', 'tablet', 'mobilePortrait', 'mobile' ];

/** Meta / contact fields in display order. */
export const META_FIELDS = [ 'company', 'address', 'land_phone', 'cell_phone', 'email', 'location', 'language', 'specialty', 'gender', 'zip', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five' ];

export const DETAIL_STYLES = {
	popup: [ 'default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five', 'style-six' ],
	panel: [ 'default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five' ],
	drawer: [ 'default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five' ],
};

const visMap = ( on ) => {
	const map = {};
	VIS_KEYS.forEach( ( k ) => {
		map[ k ] = on.includes( k );
	} );
	return map;
};

const labels = () => ( {
	'grid-1': __( 'Grid 1', 'bp-team-member' ),
	'grid-2': __( 'Grid 2', 'bp-team-member' ),
	'grid-3': __( 'Grid 3', 'bp-team-member' ),
	'grid-4': __( 'Grid 4', 'bp-team-member' ),
	'grid-5': __( 'Grid 5', 'bp-team-member' ),
	'grid-6': __( 'Grid 6', 'bp-team-member' ),
	'circle-1': __( 'Circle 1', 'bp-team-member' ),
	'circle-2': __( 'Circle 2', 'bp-team-member' ),
	'circle-3': __( 'Circle 3', 'bp-team-member' ),
	'circle-4': __( 'Circle 4', 'bp-team-member' ),
	'circle-5': __( 'Circle 5', 'bp-team-member' ),
	'circle-6': __( 'Circle 6', 'bp-team-member' ),
	'horizontal-1': __( 'Horizontal 1', 'bp-team-member' ),
	'horizontal-2': __( 'Horizontal 2', 'bp-team-member' ),
	'horizontal-3': __( 'Horizontal 3', 'bp-team-member' ),
	'horizontal-4': __( 'Horizontal 4', 'bp-team-member' ),
	'horizontal-5': __( 'Horizontal 5', 'bp-team-member' ),
	'horizontal-6': __( 'Horizontal 6', 'bp-team-member' ),
	'horizontal-7': __( 'Horizontal 7', 'bp-team-member' ),
	'horizontal-8': __( 'Horizontal 8', 'bp-team-member' ),
	'horizontal-9': __( 'Horizontal 9', 'bp-team-member' ),
	'flip-1': __( 'Flip 1', 'bp-team-member' ),
	'flip-2': __( 'Flip 2', 'bp-team-member' ),
	'flip-3': __( 'Flip 3', 'bp-team-member' ),
	'flip-4': __( 'Flip 4', 'bp-team-member' ),
	'flip-5': __( 'Flip 5', 'bp-team-member' ),
	'flip-6': __( 'Flip 6', 'bp-team-member' ),
	'table-1': __( 'Table 1', 'bp-team-member' ),
	'table-2': __( 'Table 2', 'bp-team-member' ),
	'table-3': __( 'Table 3', 'bp-team-member' ),
	'table-4': __( 'Table 4', 'bp-team-member' ),
	'table-5': __( 'Table 5', 'bp-team-member' ),
	'list-1': __( 'List 1', 'bp-team-member' ),
	'list-2': __( 'List 2', 'bp-team-member' ),
	'list-3': __( 'List 3', 'bp-team-member' ),
	'list-4': __( 'List 4', 'bp-team-member' ),
	'list-5': __( 'List 5', 'bp-team-member' ),
	'grid-7': __( 'Grid 7', 'bp-team-member' ),
	'grid-8': __( 'Grid 8', 'bp-team-member' ),
	'grid-9': __( 'Grid 9', 'bp-team-member' ),
	'grid-10': __( 'Grid 10 (Greyscale)', 'bp-team-member' ),
	'grid-11': __( 'Grid 11', 'bp-team-member' ),
	'grid-12': __( 'Grid 12', 'bp-team-member' ),
	'grid-popup': __( 'Grid Popup', 'bp-team-member' ),
	'grid-single': __( 'Grid Single', 'bp-team-member' ),
	'grid-filter-single': __( 'Grid Filter Single', 'bp-team-member' ),
	'grid-filter-popup': __( 'Grid Filter Popup', 'bp-team-member' ),
	'grid-slider': __( 'Grid Slider', 'bp-team-member' ),
	'grid-filter-selected': __( 'Grid Filter - Selected Groups', 'bp-team-member' ),
	'grid-filter-vcard': __( 'Grid Filter with vCard', 'bp-team-member' ),
	'grid-panel': __( 'Grid Panel Slide', 'bp-team-member' ),
	'grid-drawer-1': __( 'Grid Drawer 1', 'bp-team-member' ),
	'grid-drawer-2': __( 'Grid Drawer 2', 'bp-team-member' ),
	'table-6': __( 'Table 6 - Underline', 'bp-team-member' ),
	'table-7': __( 'Table 7 - Box Border', 'bp-team-member' ),
	'table-8': __( 'Table 8 - Odd Even', 'bp-team-member' ),
	'table-9': __( 'Table 9 - Filter', 'bp-team-member' ),
	'table-10': __( 'Table 10 - Filter Dense', 'bp-team-member' ),
	'list-6': __( 'List 6', 'bp-team-member' ),
	'list-7': __( 'List 7', 'bp-team-member' ),
	'group-filter-1': __( 'Group Filter 1', 'bp-team-member' ),
	'sidebar-1': __( 'Sidebar 1 - Framed Photo', 'bp-team-member' ),
	'sidebar-2': __( 'Sidebar 2 - Round Avatar', 'bp-team-member' ),
	'sidebar-3': __( 'Sidebar 3 - Compact Rows', 'bp-team-member' ),
} );

const B = [ 'thumbnail', 'name', 'designation' ];
const R = [ 'ribbon', 'featured_badge' ];

/** Raw definitions: id => [ group, layout, visible fields, overrides ]. */
const DEFS = [
	// Registry A: grid / circle / horizontal / flip (layout grid, carousel + filter).
	[ 'grid-1', 'grid', 'grid', [ ...B, 'social' ] ],
	[ 'grid-2', 'grid', 'grid', [ ...B, 'details', 'social', 'ribbon', 'featured_badge', 'cell_phone' ] ],
	[ 'grid-3', 'grid', 'grid', [ ...B, 'social', ...R ] ],
	[ 'grid-4', 'grid', 'grid', [ ...B, 'social', ...R ] ],
	[ 'grid-5', 'grid', 'grid', [ ...B, 'social', ...R ] ],
	[ 'grid-6', 'grid', 'grid', [ ...B, 'social', ...R ] ],
	[ 'circle-1', 'circle', 'grid', [ ...B, 'details', 'social' ] ],
	[ 'circle-2', 'circle', 'grid', [ ...B, 'details', 'social', 'cell_phone' ] ],
	[ 'circle-3', 'circle', 'grid', [ ...B, 'social' ] ],
	[ 'circle-4', 'circle', 'grid', [ ...B, 'details', 'social', 'cell_phone' ] ],
	[ 'circle-5', 'circle', 'grid', [ ...B, 'details', 'social' ] ],
	[ 'circle-6', 'circle', 'grid', [ ...B, 'details', 'social', ...R ] ],
	[ 'horizontal-1', 'horizontal', 'grid', [ ...B, 'details', 'social' ] ],
	[ 'horizontal-2', 'horizontal', 'grid', [ ...B, 'details', 'cell_phone' ] ],
	[ 'horizontal-3', 'horizontal', 'grid', [ ...B, 'details', ...R, 'address' ] ],
	[ 'horizontal-4', 'horizontal', 'grid', [ ...B, 'details', 'social' ] ],
	[ 'horizontal-5', 'horizontal', 'grid', [ ...B, 'details', 'email' ] ],
	[ 'horizontal-6', 'horizontal', 'grid', [ ...B, 'details', 'social', ...R ] ],
	[ 'horizontal-7', 'horizontal', 'grid', [ ...B, 'details', 'social', ...R ] ],
	[ 'horizontal-8', 'horizontal', 'grid', [ ...B, 'details', 'social', ...R ] ],
	[ 'horizontal-9', 'horizontal', 'grid', [ ...B, 'details', 'social', ...R ] ],
	[ 'flip-1', 'flip', 'grid', [ ...B, 'details', 'social', ...R, 'cell_phone' ] ],
	[ 'flip-2', 'flip', 'grid', [ ...B, 'details', 'social', 'email' ] ],
	[ 'flip-3', 'flip', 'grid', [ ...B, 'details', 'social', ...R, 'address' ] ],
	[ 'flip-4', 'flip', 'grid', [ ...B, 'social', 'cell_phone', 'email' ] ],
	[ 'flip-5', 'flip', 'grid', [ ...B, ...R ] ],
	[ 'flip-6', 'flip', 'grid', [ ...B, ...R, 'email', 'land_phone', 'cell_phone' ] ],
	// Registry B: tables, lists, legacy grids.
	[ 'table-1', 'table', 'table', [ ...B, 'details', 'social' ], { filter: false } ],
	[ 'table-2', 'table', 'table', [ ...B, 'details', 'social' ], { filter: false } ],
	[ 'table-3', 'table', 'table', [ ...B, 'details', 'social' ], { filter: false } ],
	[ 'table-4', 'table', 'table', [ ...B, 'details', 'social' ], { filter: false } ],
	[ 'table-5', 'table', 'table', [ ...B, 'details', 'social' ], { filter: false } ],
	[ 'list-1', 'list', 'list', [ ...B, 'details', 'social' ] ],
	[ 'list-2', 'list', 'list', [ ...B, 'details', 'cell_phone' ] ],
	[ 'list-3', 'list', 'list', [ ...B, 'details', 'email' ] ],
	[ 'list-4', 'list', 'list', [ ...B, 'details', 'email', 'address' ] ],
	[ 'list-5', 'list', 'list', [ ...B, 'details', 'social' ] ],
	[ 'grid-7', 'grid', 'grid', [ ...B, 'details', 'social', ...R ] ],
	[ 'grid-8', 'grid', 'grid', [ ...B ] ],
	[ 'grid-9', 'grid', 'grid', [ ...B, ...R ] ],
	[ 'grid-10', 'grid', 'grid', [ ...B, 'details', 'social', ...R ] ],
	[ 'grid-11', 'grid', 'grid', [ ...B ] ],
	[ 'grid-12', 'grid', 'grid', [ ...B, 'social', 'read_more', ...R ] ],
	[ 'grid-popup', 'legacy', 'grid', [ ...B, ...R ], { forced_link: 'popup' } ],
	[ 'grid-single', 'legacy', 'grid', [ ...B, ...R ], { forced_link: 'popup' } ],
	[ 'grid-filter-single', 'legacy', 'grid', [ ...B, ...R, 'cell_phone', 'email' ], { forced_link: 'popup', forced_view: 'filter', carousel: false, pagination: false } ],
	[ 'grid-filter-popup', 'legacy', 'grid', [ ...B, ...R ], { forced_link: 'popup', forced_view: 'filter', carousel: false, pagination: false } ],
	[ 'grid-slider', 'legacy', 'grid', [ ...B, 'details', 'social', ...R ], { forced_view: 'carousel', filter: false, pagination: false } ],
	[ 'grid-filter-selected', 'legacy', 'grid', [ ...B, ...R ], { forced_link: 'popup', forced_view: 'filter', carousel: false, pagination: false } ],
	[ 'grid-filter-vcard', 'legacy', 'grid', [ ...B, 'cell_phone', 'email', 'vcard' ], { forced_view: 'filter', carousel: false, pagination: false } ],
	[ 'grid-panel', 'legacy', 'grid', [ ...B, ...R ], { forced_link: 'panel', pagination: false } ],
	[ 'grid-drawer-1', 'legacy', 'grid', [ ...B, ...R ], { forced_link: 'drawer', carousel: false, pagination: false } ],
	[ 'grid-drawer-2', 'legacy', 'grid', [ ...B, ...R ], { forced_link: 'drawer', carousel: false, pagination: false } ],
	[ 'table-6', 'table', 'table', [ ...B, 'details', 'social' ], { pagination: false } ],
	[ 'table-7', 'table', 'table', [ ...B, 'details', 'social' ], { pagination: false } ],
	[ 'table-8', 'table', 'table', [ ...B, 'details', 'social' ], { pagination: false } ],
	[ 'table-9', 'table', 'table', [ 'name', 'designation', 'cell_phone', 'email' ], { forced_view: 'filter', pagination: false } ],
	[ 'table-10', 'table', 'table', [ 'name', 'cell_phone', 'email' ], { forced_view: 'filter', pagination: false } ],
	[ 'list-6', 'list', 'list', [ ...B, 'details', 'social', ...R ] ],
	[ 'list-7', 'list', 'list', [ ...B, 'details', 'social', ...R ] ],
	[ 'group-filter-1', 'legacy', 'grid', [ ...B, 'cell_phone', 'email' ], { forced_view: 'filter', grouped: true, carousel: false, pagination: false } ],
	// Registry C: sidebar.
	[ 'sidebar-1', 'sidebar', 'list', [ ...B, 'social' ], { carousel: false } ],
	[ 'sidebar-2', 'sidebar', 'list', [ ...B, 'social' ], { carousel: false } ],
	[ 'sidebar-3', 'sidebar', 'list', [ ...B, 'social' ], { carousel: false } ],
];

/** Which item renderer family a theme uses: ta (registry A), tb (registry B) or sidebar. */
export const themeFamily = ( id ) => {
	if ( /^(grid-[1-6]|circle-\d|horizontal-\d|flip-\d)$/.test( id ) ) {
		return 'ta';
	}
	if ( /^sidebar-\d$/.test( id ) ) {
		return 'sidebar';
	}
	return 'tb';
};

let cache = null;

/**
 * All themes, normalised (array, registry order).
 *
 * @return {Object[]} Themes.
 */
export const getThemeList = () => {
	if ( cache ) {
		return cache;
	}
	const L = labels();
	cache = DEFS.map( ( [ id, group, layout, vis, over = {} ] ) => {
		const flow = 'table' === layout || 'list' === layout;
		return {
			id,
			value: id,
			label: L[ id ] || id,
			group,
			layout,
			carousel: ! flow,
			filter: true,
			forced_link: null,
			forced_view: null,
			grouped: false,
			pagination: true,
			visibility: visMap( vis ),
			...over,
		};
	} );
	return cache;
};

/**
 * One theme (falls back to the default theme).
 *
 * @param {string} id Theme id.
 * @return {Object} Theme.
 */
export const getThemeDef = ( id ) => {
	const list = getThemeList();
	const key = String( id || '' ).toLowerCase().replace( /[^a-z0-9_-]/g, '' );
	return list.find( ( t ) => t.id === key ) || list.find( ( t ) => t.id === DEFAULT_THEME );
};

/** Carousel nav icons per style. */
export const NAV_ICONS = {
	'style-one': [ 'fas fa-chevron-left', 'fas fa-chevron-right' ],
	'style-two': [ 'fas fa-arrow-left-long', 'fas fa-arrow-right-long' ],
	'style-three': [ 'fas fa-angles-left', 'fas fa-angles-right' ],
	default: [ 'fas fa-angle-left', 'fas fa-angle-right' ],
};
