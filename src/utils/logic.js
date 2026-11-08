/**
 * Pure helpers that decide which controls apply to the current attributes.
 * They mirror the render decisions in src/Components/Common/Team/model.js (resolveView(),
 * paginationMode(), resolveLinkType()) so the inspector only shows controls that matter.
 */
import { getTheme } from './editorData';

/** 'grid' | 'carousel' | 'filter' as the user selected it (ignores theme forcing). */
export const selectedView = ( attributes ) => {
	if ( attributes.carouselEnabled ) {
		return 'carousel';
	}
	if ( attributes.filterEnabled ) {
		return 'filter';
	}
	return 'grid';
};

/** Can this theme be shown as a carousel? (tables and grouped layouts cannot). */
export const themeSupportsCarousel = ( theme ) => 'carousel' === theme.forced_view || ( !! theme.carousel && 'table' !== theme.layout && ! theme.grouped );

/** Can this theme be shown with filters? */
export const themeSupportsFilter = ( theme ) => 'filter' === theme.forced_view || !! theme.filter;

/** View actually rendered: theme forced_view wins, unsupported views fall back to grid. */
export const effectiveView = ( attributes ) => {
	const theme = getTheme( attributes.theme );
	if ( theme.forced_view ) {
		return theme.forced_view;
	}
	const view = selectedView( attributes );
	if ( 'carousel' === view && ! themeSupportsCarousel( theme ) ) {
		return 'grid';
	}
	if ( 'filter' === view && ! themeSupportsFilter( theme ) ) {
		return 'grid';
	}
	return view;
};

/**
 * Theme's forced link type. Single member pages no longer exist (v2), so a forced
 * single page means popup.
 */
export const themeForcedLink = ( theme ) => ( 'single_page' === theme.forced_link ? 'popup' : theme.forced_link || null );

/**
 * Whether the theme's forced link type cannot be changed.
 * A forced popup only replaces "default"; a forced panel / drawer always wins.
 */
export const linkTypeLocked = ( attributes ) => {
	const forced = themeForcedLink( getTheme( attributes.theme ) );
	return !! forced && [ 'panel', 'drawer' ].includes( forced );
};

/**
 * Link type the render will use: 'none' when members are not linked.
 * 'default' opens the popup; the removed 'single_page' type behaves like 'custom'.
 */
export const effectiveLinkType = ( attributes ) => {
	if ( ! attributes.nameIsLinked ) {
		return 'none';
	}
	const theme = getTheme( attributes.theme );
	const forced = themeForcedLink( theme );
	let type = attributes.linkType || 'default';
	if ( 'single_page' === type ) {
		type = 'custom';
	}
	if ( forced && ( 'default' === type || linkTypeLocked( attributes ) ) ) {
		type = forced;
	}
	if ( 'default' === type ) {
		type = 'popup';
	}
	// The inline drawer cannot expand inside carousels or tables; render uses the popup there.
	if ( 'drawer' === type && ( 'carousel' === effectiveView( attributes ) || 'table' === theme.layout ) ) {
		type = 'popup';
	}
	return type;
};

export const isCarousel = ( attributes ) => 'carousel' === effectiveView( attributes );
export const isFilter = ( attributes ) => 'filter' === effectiveView( attributes );

/** Pagination is not available for carousels, grouped themes, client-side (normal) filters and themes without it. */
export const canPaginate = ( attributes ) => {
	const theme = getTheme( attributes.theme );
	if ( false === theme.pagination || theme.grouped ) {
		return false;
	}
	if ( isCarousel( attributes ) ) {
		return false;
	}
	if ( isFilter( attributes ) && 'ajax-filter' !== attributes.filterType ) {
		return false;
	}
	return true;
};

/** Attribute changes that switch the view type. */
export const viewChange = ( view ) => ( {
	carouselEnabled: 'carousel' === view,
	filterEnabled: 'filter' === view,
} );

/** Attribute changes for a theme switch; drops view flags the new theme cannot use. */
export const themeChange = ( attributes, themeId ) => {
	const theme = getTheme( themeId );
	const changes = { theme: themeId };
	if ( attributes.carouselEnabled && ! themeSupportsCarousel( theme ) ) {
		changes.carouselEnabled = false;
	}
	if ( attributes.filterEnabled && ! themeSupportsFilter( theme ) ) {
		changes.filterEnabled = false;
	}
	// Horizontal cards need room for photo + text side by side: when coming from another
	// family with untouched default columns (4/3), switch to 2 columns.
	const current = getTheme( attributes.theme );
	const cols = attributes.columns || {};
	if ( 'horizontal' === theme.group && 'horizontal' !== current.group && ( cols.desktop || 4 ) === 4 && ( cols.tablet || 3 ) === 3 ) {
		changes.columns = { ...cols, desktop: 2, tablet: 2, mobilePortrait: 1, mobile: 1 };
	}
	return changes;
};

/* ---------------- Visibility ----------------
 * Mirrors includes/render/class-visibility.php:
 * - card ("initial") defaults: theme registry map (field => bool, or a list of
 *   visible fields) on top of the CORE list;
 * - popup / panel / drawer defaults: everything visible except read_more.
 * Stored attribute: flat keys = card group; `popup` / `panel` / `drawer` keys hold
 * their own maps. A field value is a bool (all devices) or a device map.
 */
export const VIS_GROUPS = [ 'initial', 'popup', 'panel', 'drawer' ];
export const VIS_DEVICES = [ 'desktop', 'tablet', 'mobilePortrait', 'mobile' ];
const CORE = [ 'thumbnail', 'name', 'designation', 'details', 'social', 'ribbon', 'featured_badge', 'read_more' ];

const isObj = ( v ) => !! v && 'object' === typeof v && ! Array.isArray( v );

export const fieldDefault = ( themeId, key, group = 'initial' ) => {
	if ( 'initial' !== group ) {
		return 'read_more' !== key;
	}
	const reg = getTheme( themeId ).visibility;
	if ( Array.isArray( reg ) ) {
		return reg.includes( key ) || CORE.includes( key );
	}
	if ( isObj( reg ) && Object.prototype.hasOwnProperty.call( reg, key ) ) {
		return !! reg[ key ];
	}
	return CORE.includes( key );
};

export const visibilityObject = ( attributes ) => ( isObj( attributes.visibility ) ? attributes.visibility : {} );

/** Stored overrides of one group: { field: bool|deviceMap }. */
export const groupOverrides = ( attributes, group ) => {
	const vis = visibilityObject( attributes );
	if ( 'initial' === group ) {
		const out = {};
		Object.keys( vis ).forEach( ( k ) => {
			if ( ! VIS_GROUPS.includes( k ) ) {
				out[ k ] = vis[ k ];
			}
		} );
		return isObj( vis.initial ) ? { ...vis.initial, ...out } : out;
	}
	return isObj( vis[ group ] ) ? vis[ group ] : {};
};

/** Device map {desktop,tablet,mobilePortrait,mobile} for a field. */
export const fieldDevices = ( attributes, key, group = 'initial' ) => {
	const def = fieldDefault( attributes.theme, key, group );
	const raw = groupOverrides( attributes, group )[ key ];
	const out = {};
	VIS_DEVICES.forEach( ( d ) => {
		if ( isObj( raw ) ) {
			let v = raw[ d ];
			if ( undefined === v && 'mobilePortrait' === d ) {
				v = raw.mobile_landscape;
			}
			out[ d ] = undefined === v ? def : !! v;
		} else if ( undefined !== raw && null !== raw ) {
			out[ d ] = !! raw;
		} else {
			out[ d ] = def;
		}
	} );
	return out;
};

export const isFieldVisible = ( attributes, key, group = 'initial' ) => {
	const map = fieldDevices( attributes, key, group );
	return VIS_DEVICES.some( ( d ) => map[ d ] );
};

/**
 * New `visibility` attribute value with one field set (value: bool, device map,
 * or undefined to remove the override).
 */
export const setVisibility = ( attributes, group, key, value ) => {
	const vis = { ...visibilityObject( attributes ) };
	if ( 'initial' === group ) {
		if ( isObj( vis.initial ) ) {
			// Normalise a nested card group into flat keys.
			const nested = vis.initial;
			delete vis.initial;
			Object.keys( nested ).forEach( ( k ) => {
				if ( undefined === vis[ k ] ) {
					vis[ k ] = nested[ k ];
				}
			} );
		}
		if ( undefined === value ) {
			delete vis[ key ];
		} else {
			vis[ key ] = value;
		}
		return vis;
	}
	const g = { ...( isObj( vis[ group ] ) ? vis[ group ] : {} ) };
	if ( undefined === value ) {
		delete g[ key ];
	} else {
		g[ key ] = value;
	}
	if ( Object.keys( g ).length ) {
		vis[ group ] = g;
	} else {
		delete vis[ group ];
	}
	return vis;
};

/** Compact a device map: all equal => bool. */
export const compactDevices = ( map ) => {
	const vals = VIS_DEVICES.map( ( d ) => !! map[ d ] );
	if ( vals.every( ( v ) => v === vals[ 0 ] ) ) {
		return vals[ 0 ];
	}
	const out = {};
	VIS_DEVICES.forEach( ( d, i ) => {
		out[ d ] = vals[ i ];
	} );
	return out;
};
