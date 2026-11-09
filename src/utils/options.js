import { __ } from '@wordpress/i18n';

const s = ( value, label ) => ( { value, label } );

export const styleNames = ( count ) => {
	const names = [ 'one', 'two', 'three', 'four', 'five', 'six' ];
	return [ s( 'default', __( 'Default', 'bp-team-member' ) ) ].concat(
		names.slice( 0, count ).map( ( n ) => s( `style-${ n }`, `${ __( 'Style', 'bp-team-member' ) } ${ n.charAt( 0 ).toUpperCase() + n.slice( 1 ) }` ) )
	);
};

export const viewTypeOptions = [
	s( 'grid', __( 'Grid', 'bp-team-member' ) ),
	s( 'carousel', __( 'Carousel', 'bp-team-member' ) ),
	s( 'filter', __( 'Filter', 'bp-team-member' ) ),
];

export const linkTypeOptions = [
	s( 'default', __( 'Default (popup)', 'bp-team-member' ) ),
	s( 'popup', __( 'Popup', 'bp-team-member' ) ),
	s( 'panel', __( 'Panel', 'bp-team-member' ) ),
	s( 'drawer', __( 'Drawer', 'bp-team-member' ) ),
	s( 'custom', __( 'Custom URL', 'bp-team-member' ) ),
];

export const linkTargetOptions = [
	s( '_self', __( 'Same tab', 'bp-team-member' ) ),
	s( '_blank', __( 'New tab', 'bp-team-member' ) ),
];

export const popupStyleOptions = styleNames( 6 );
export const panelStyleOptions = styleNames( 5 );
export const drawerStyleOptions = styleNames( 5 );
export const filterStyleOptions = styleNames( 5 );
export const carouselNavStyleOptions = styleNames( 3 );
export const carouselDotStyleOptions = styleNames( 3 );

export const popupColumnOptions = [ s( 'one', __( 'One', 'bp-team-member' ) ), s( 'two', __( 'Two', 'bp-team-member' ) ) ];

export const panelPositionOptions = [
	s( 'left', __( 'Left', 'bp-team-member' ) ),
	s( 'center', __( 'Center', 'bp-team-member' ) ),
	s( 'right', __( 'Right', 'bp-team-member' ) ),
];

export const imageFilterOptions = [
	s( 'none', __( 'None', 'bp-team-member' ) ),
	s( 'blur', __( 'Blur', 'bp-team-member' ) ),
	s( 'brightness', __( 'Brightness', 'bp-team-member' ) ),
	s( 'contrast', __( 'Contrast', 'bp-team-member' ) ),
	s( 'grayscale', __( 'Grayscale', 'bp-team-member' ) ),
	s( 'hue_rotate', __( 'Hue Rotate', 'bp-team-member' ) ),
	s( 'invert', __( 'Invert', 'bp-team-member' ) ),
	s( 'opacity', __( 'Opacity', 'bp-team-member' ) ),
	s( 'saturate', __( 'Saturate', 'bp-team-member' ) ),
	s( 'sepia', __( 'Sepia', 'bp-team-member' ) ),
];

export const orderByOptions = [
	s( 'default', __( 'Default (as added)', 'bp-team-member' ) ),
	s( 'title', __( 'Name', 'bp-team-member' ) ),
	s( 'rand', __( 'Random', 'bp-team-member' ) ),
];

/** Legacy orderBy values (post-type era) mapped to the v2 options. */
export const normalizeOrderBy = ( v ) => {
	if ( 'title' === v || 'name' === v ) {
		return 'title';
	}
	return 'rand' === v ? 'rand' : 'default';
};

export const taxonomyOrderByOptions = [
	s( 'name', __( 'Name', 'bp-team-member' ) ),
	s( 'default', __( 'Order of appearance', 'bp-team-member' ) ),
];

export const orderOptions = [ s( 'DESC', __( 'Descending', 'bp-team-member' ) ), s( 'ASC', __( 'Ascending', 'bp-team-member' ) ) ];

export const filterTypeOptions = [
	s( 'normal-filter', __( 'Normal Filter', 'bp-team-member' ) ),
	s( 'ajax-filter', __( 'Ajax Filter', 'bp-team-member' ) ),
];

export const filterColumnOptions = [ s( 'two', __( 'Two', 'bp-team-member' ) ), s( 'three', __( 'Three', 'bp-team-member' ) ) ];

export const positionOptions = [
	s( 'left', __( 'Left', 'bp-team-member' ) ),
	s( 'center', __( 'Center', 'bp-team-member' ) ),
	s( 'right', __( 'Right', 'bp-team-member' ) ),
];

export const paginationTypeOptions = [
	s( 'normal-pagination', __( 'Normal Pagination', 'bp-team-member' ) ),
	s( 'load-more-button', __( 'Load More Button', 'bp-team-member' ) ),
	s( 'load-more-scroll', __( 'Load More on Scroll', 'bp-team-member' ) ),
];

export const DEVICES = [
	{ key: 'desktop', label: __( 'Desktop', 'bp-team-member' ), icon: 'desktop' },
	{ key: 'tablet', label: __( 'Tablet', 'bp-team-member' ), icon: 'tablet' },
	{ key: 'mobilePortrait', label: __( 'Mobile landscape', 'bp-team-member' ), icon: 'smartphone' },
	{ key: 'mobile', label: __( 'Mobile', 'bp-team-member' ), icon: 'smartphone' },
];
