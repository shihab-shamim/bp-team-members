<?php
/**
 * Theme registry B: Table, List and legacy Grid item themes, plus the helpers
 * used by those templates and by the popup / panel / drawer detail templates.
 *
 * Every helper is prefixed `bptm_tb_` and only ever returns escaped HTML.
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Every visibility field known to the render Context.
 *
 * @return string[]
 */
function bptm_tb_visibility_fields() {
	return array(
		'thumbnail',
		'name',
		'designation',
		'details',
		'social',
		'ribbon',
		'featured_badge',
		'skills',
		'company',
		'address',
		'land_phone',
		'cell_phone',
		'email',
		'location',
		'language',
		'specialty',
		'gender',
		'zip',
		'extra_one',
		'extra_two',
		'extra_three',
		'extra_four',
		'extra_five',
		'acf_fields',
		'vcard',
		'read_more',
	);
}

/**
 * Complete visibility defaults map: listed fields on, all others off.
 *
 * @param string[] $on Fields visible by default.
 * @return array<string,bool>
 */
function bptm_tb_visibility( array $on ) {
	$map = array();
	foreach ( bptm_tb_visibility_fields() as $field ) {
		$map[ $field ] = in_array( $field, $on, true );
	}
	return $map;
}

/**
 * Theme definitions of this registry.
 *
 * @return array<string,array>
 */
function bptm_tb_themes() {
	$b = array( 'thumbnail', 'name', 'designation' );
	$r = array( 'ribbon', 'featured_badge' );

	/*
	 * id => [ label, group, layout, visible fields, overrides ].
	 * Overrides may contain carousel, filter, forced_link, forced_view, grouped, pagination.
	 */
	$defs = array(
		// Tables (GS gs-team-table-one … five). GS disables the filter view on these.
		'table-1'              => array( __( 'Table 1', 'bp-team-member' ), 'table', 'table', array_merge( $b, array( 'details', 'social' ) ), array( 'filter' => false ) ),
		'table-2'              => array( __( 'Table 2', 'bp-team-member' ), 'table', 'table', array_merge( $b, array( 'details', 'social' ) ), array( 'filter' => false ) ),
		'table-3'              => array( __( 'Table 3', 'bp-team-member' ), 'table', 'table', array_merge( $b, array( 'details', 'social' ) ), array( 'filter' => false ) ),
		'table-4'              => array( __( 'Table 4', 'bp-team-member' ), 'table', 'table', array_merge( $b, array( 'details', 'social' ) ), array( 'filter' => false ) ),
		'table-5'              => array( __( 'Table 5', 'bp-team-member' ), 'table', 'table', array_merge( $b, array( 'details', 'social' ) ), array( 'filter' => false ) ),
		// Lists (GS gs-team-list-style-one … five).
		'list-1'               => array( __( 'List 1', 'bp-team-member' ), 'list', 'list', array_merge( $b, array( 'details', 'social' ) ), array() ),
		'list-2'               => array( __( 'List 2', 'bp-team-member' ), 'list', 'list', array_merge( $b, array( 'details', 'cell_phone' ) ), array() ),
		'list-3'               => array( __( 'List 3', 'bp-team-member' ), 'list', 'list', array_merge( $b, array( 'details', 'email' ) ), array() ),
		'list-4'               => array( __( 'List 4', 'bp-team-member' ), 'list', 'list', array_merge( $b, array( 'details', 'email', 'address' ) ), array() ),
		'list-5'               => array( __( 'List 5', 'bp-team-member' ), 'list', 'list', array_merge( $b, array( 'details', 'social' ) ), array() ),
		// Legacy grids.
		'grid-7'               => array( __( 'Grid 7', 'bp-team-member' ), 'grid', 'grid', array_merge( $b, array( 'details', 'social' ), $r ), array() ),
		'grid-8'               => array( __( 'Grid 8', 'bp-team-member' ), 'grid', 'grid', $b, array() ),
		'grid-9'               => array( __( 'Grid 9', 'bp-team-member' ), 'grid', 'grid', array_merge( $b, $r ), array() ),
		'grid-10'              => array( __( 'Grid 10 (Greyscale)', 'bp-team-member' ), 'grid', 'grid', array_merge( $b, array( 'details', 'social' ), $r ), array() ),
		'grid-11'              => array( __( 'Grid 11', 'bp-team-member' ), 'grid', 'grid', $b, array() ),
		'grid-12'              => array( __( 'Grid 12', 'bp-team-member' ), 'grid', 'grid', array_merge( $b, array( 'social', 'read_more' ), $r ), array() ),
		'grid-popup'           => array( __( 'Grid Popup', 'bp-team-member' ), 'legacy', 'grid', array_merge( $b, $r ), array( 'forced_link' => 'popup' ) ),
		'grid-single'          => array( __( 'Grid Single', 'bp-team-member' ), 'legacy', 'grid', array_merge( $b, $r ), array( 'forced_link' => 'single_page' ) ),
		'grid-filter-single'   => array( __( 'Grid Filter Single', 'bp-team-member' ), 'legacy', 'grid', array_merge( $b, $r, array( 'cell_phone', 'email' ) ), array( 'forced_link' => 'single_page', 'forced_view' => 'filter', 'carousel' => false, 'pagination' => false ) ),
		'grid-filter-popup'    => array( __( 'Grid Filter Popup', 'bp-team-member' ), 'legacy', 'grid', array_merge( $b, $r ), array( 'forced_link' => 'popup', 'forced_view' => 'filter', 'carousel' => false, 'pagination' => false ) ),
		'grid-slider'          => array( __( 'Grid Slider', 'bp-team-member' ), 'legacy', 'grid', array_merge( $b, array( 'details', 'social' ), $r ), array( 'forced_view' => 'carousel', 'filter' => false, 'pagination' => false ) ),
		'grid-filter-selected' => array( __( 'Grid Filter - Selected Groups', 'bp-team-member' ), 'legacy', 'grid', array_merge( $b, $r ), array( 'forced_link' => 'popup', 'forced_view' => 'filter', 'carousel' => false, 'pagination' => false ) ),
		'grid-filter-vcard'    => array( __( 'Grid Filter with vCard', 'bp-team-member' ), 'legacy', 'grid', array_merge( $b, array( 'cell_phone', 'email', 'vcard' ) ), array( 'forced_view' => 'filter', 'carousel' => false, 'pagination' => false ) ),
		'grid-panel'           => array( __( 'Grid Panel Slide', 'bp-team-member' ), 'legacy', 'grid', array_merge( $b, $r ), array( 'forced_link' => 'panel', 'pagination' => false ) ),
		'grid-drawer-1'        => array( __( 'Grid Drawer 1', 'bp-team-member' ), 'legacy', 'grid', array_merge( $b, $r ), array( 'forced_link' => 'drawer', 'carousel' => false, 'pagination' => false ) ),
		'grid-drawer-2'        => array( __( 'Grid Drawer 2', 'bp-team-member' ), 'legacy', 'grid', array_merge( $b, $r ), array( 'forced_link' => 'drawer', 'carousel' => false, 'pagination' => false ) ),
		// Legacy tables.
		'table-6'              => array( __( 'Table 6 - Underline', 'bp-team-member' ), 'table', 'table', array_merge( $b, array( 'details', 'social' ) ), array( 'pagination' => false ) ),
		'table-7'              => array( __( 'Table 7 - Box Border', 'bp-team-member' ), 'table', 'table', array_merge( $b, array( 'details', 'social' ) ), array( 'pagination' => false ) ),
		'table-8'              => array( __( 'Table 8 - Odd Even', 'bp-team-member' ), 'table', 'table', array_merge( $b, array( 'details', 'social' ) ), array( 'pagination' => false ) ),
		'table-9'              => array( __( 'Table 9 - Filter', 'bp-team-member' ), 'table', 'table', array( 'name', 'designation', 'cell_phone', 'email' ), array( 'forced_view' => 'filter', 'pagination' => false ) ),
		'table-10'             => array( __( 'Table 10 - Filter Dense', 'bp-team-member' ), 'table', 'table', array( 'name', 'cell_phone', 'email' ), array( 'forced_view' => 'filter', 'pagination' => false ) ),
		// Legacy lists.
		'list-6'               => array( __( 'List 6', 'bp-team-member' ), 'list', 'list', array_merge( $b, array( 'details', 'social' ), $r ), array() ),
		'list-7'               => array( __( 'List 7', 'bp-team-member' ), 'list', 'list', array_merge( $b, array( 'details', 'social' ), $r ), array() ),
		// Group filter: members grouped under group headings.
		'group-filter-1'       => array( __( 'Group Filter 1', 'bp-team-member' ), 'legacy', 'grid', array_merge( $b, array( 'cell_phone', 'email' ) ), array( 'forced_view' => 'filter', 'grouped' => true, 'carousel' => false, 'pagination' => false ) ),
	);

	$themes = array();
	foreach ( $defs as $id => $def ) {
		$is_flow = in_array( $def[2], array( 'table', 'list' ), true );

		$themes[ $id ] = array_merge(
			array(
				'label'       => $def[0],
				'group'       => $def[1],
				'layout'      => $def[2],
				// Tables and lists are single-column layouts: no carousel.
				'carousel'    => ! $is_flow,
				'filter'      => true,
				'forced_link' => null,
				'forced_view' => null,
				'visibility'  => bptm_tb_visibility( $def[3] ),
				'template'    => 'themes/' . $id,
				'grouped'     => false,
				'pagination'  => true,
			),
			$def[4]
		);
	}

	return $themes;
}

add_filter(
	'bptm_themes',
	function ( $themes ) {
		if ( ! is_array( $themes ) ) {
			$themes = array();
		}
		return $themes + bptm_tb_themes();
	},
	6
);

/* -------------------------------------------------------------------------
 * Template helpers. All of them delegate to BPTM\Render\Context and return
 * escaped HTML ('' when the field is hidden / empty).
 * ---------------------------------------------------------------------- */

/**
 * Translated front-end string with a fallback when the data helper is missing.
 *
 * @param string $key      Translation key.
 * @param string $fallback Fallback text.
 * @return string Plain (unescaped) text.
 */
function bptm_tb_t( $key, $fallback ) {
	if ( function_exists( 'bptm_translation' ) ) {
		$text = (string) bptm_translation( $key );
		if ( '' !== trim( $text ) ) {
			return $text;
		}
	}
	return $fallback;
}

/**
 * Whether a field is visible in the current context (card or detail group).
 *
 * @param object $ctx   Render context.
 * @param string $field Visibility field.
 * @return bool
 */
function bptm_tb_show( $ctx, $field ) {
	if ( ! is_object( $ctx ) ) {
		return false;
	}
	return method_exists( $ctx, 'show' ) ? (bool) $ctx->show( $field ) : true;
}

/**
 * Device hide classes for custom wrappers (escaped).
 *
 * @param object $ctx   Render context.
 * @param string $field Field.
 * @param string $extra Base classes.
 * @return string
 */
function bptm_tb_vis( $ctx, $field, $extra = '' ) {
	if ( is_object( $ctx ) && method_exists( $ctx, 'vis_classes' ) ) {
		return (string) $ctx->vis_classes( $field, $extra );
	}
	return esc_attr( $extra );
}

/**
 * Attribute value from the context.
 *
 * @param object $ctx     Render context.
 * @param string $key     Attribute.
 * @param mixed  $default Default.
 * @return mixed
 */
function bptm_tb_attr( $ctx, $key, $default = null ) {
	if ( is_object( $ctx ) && method_exists( $ctx, 'attr' ) ) {
		return $ctx->attr( $key, $default );
	}
	return $default;
}

/**
 * One visibility-guarded Context fragment (escaped by Context).
 *
 * @param object $ctx   Render context.
 * @param array  $m     Member.
 * @param string $field Visibility field.
 * @param mixed  ...$args Extra helper arguments.
 * @return string
 */
function bptm_tb_part( $ctx, array $m, $field, ...$args ) {
	$map = array(
		'name'           => 'name',
		'designation'    => 'designation',
		'details'        => 'details',
		'social'         => 'social',
		'ribbon'         => 'ribbon',
		'featured_badge' => 'featured_badge',
		'skills'         => 'skills',
		'acf_fields'     => 'acf',
		'vcard'          => 'vcard',
		'read_more'      => 'read_more',
	);
	if ( ! isset( $map[ $field ] ) || ! is_object( $ctx ) || ! method_exists( $ctx, $map[ $field ] ) ) {
		return '';
	}
	// skills() / details() may carry ACF output positioned after them, so they decide themselves.
	if ( ! in_array( $field, array( 'skills', 'details', 'acf_fields' ), true ) && ! bptm_tb_show( $ctx, $field ) ) {
		return '';
	}
	$method = $map[ $field ];
	return trim( (string) $ctx->$method( $m, ...$args ) );
}

/**
 * Ribbon + featured badge.
 *
 * @param object $ctx Render context.
 * @param array  $m   Member.
 * @return string
 */
function bptm_tb_badges( $ctx, array $m ) {
	return bptm_tb_part( $ctx, $m, 'ribbon' ) . bptm_tb_part( $ctx, $m, 'featured_badge' );
}

/**
 * Member image respecting visibility.
 *
 * With $link the image follows the block's "link image" option (Context::image);
 * with $force it is always wrapped in the member link (themes whose whole photo is the trigger).
 *
 * @param object $ctx   Render context.
 * @param array  $m     Member.
 * @param bool   $link  Allow the member link.
 * @param bool   $force Always link (when the member has a link).
 * @return string
 */
function bptm_tb_image( $ctx, array $m, $link = true, $force = false ) {
	if ( ! is_object( $ctx ) || ! method_exists( $ctx, 'image' ) || ! bptm_tb_show( $ctx, 'thumbnail' ) ) {
		return '';
	}
	if ( $force ) {
		$img = trim( (string) $ctx->image( $m, 'bptm-img', false ) );
		return '' === $img ? '' : bptm_tb_wrap_link( $ctx, $m, $img, 'bptm-img-link' );
	}
	return trim( (string) $ctx->image( $m, 'bptm-img', (bool) $link ) );
}

/**
 * Wrap HTML in the member link (when the member is linked).
 *
 * @param object $ctx   Render context.
 * @param array  $m     Member.
 * @param string $html  Inner (escaped) HTML.
 * @param string $class Link class.
 * @return string
 */
function bptm_tb_wrap_link( $ctx, array $m, $html, $class = '' ) {
	if ( ! is_object( $ctx ) || ! method_exists( $ctx, 'link_open' ) ) {
		return $html;
	}
	$open = (string) $ctx->link_open( $m, $class );
	if ( '' === $open ) {
		return $html;
	}
	return $open . $html . (string) $ctx->link_close( $m );
}

/**
 * Plain (never linked) member name — used inside wrapping links.
 *
 * @param object $ctx   Render context.
 * @param array  $m     Member.
 * @param string $tag   Heading tag.
 * @param string $class Extra class.
 * @return string
 */
function bptm_tb_plain_name( $ctx, array $m, $tag = 'h3', $class = '' ) {
	if ( ! bptm_tb_show( $ctx, 'name' ) || empty( $m['name'] ) ) {
		return '';
	}
	$tag = in_array( $tag, array( 'h2', 'h3', 'h4', 'div', 'span' ), true ) ? $tag : 'h3';
	return sprintf(
		'<%1$s class="%2$s"><span itemprop="name">%3$s</span></%1$s>',
		$tag,
		bptm_tb_vis( $ctx, 'name', trim( 'bptm-name ' . $class ) ),
		esc_html( $m['name'] )
	);
}

/**
 * Plain designation.
 *
 * @param object $ctx   Render context.
 * @param array  $m     Member.
 * @param string $class Extra class.
 * @return string
 */
function bptm_tb_plain_designation( $ctx, array $m, $class = '' ) {
	if ( ! bptm_tb_show( $ctx, 'designation' ) || empty( $m['designation'] ) ) {
		return '';
	}
	return sprintf(
		'<div class="%1$s" itemprop="jobTitle">%2$s</div>',
		bptm_tb_vis( $ctx, 'designation', trim( 'bptm-designation ' . $class ) ),
		esc_html( $m['designation'] )
	);
}

/**
 * Visible meta rows of a member (Context::meta_rows): field => [label, value, icon, classes].
 *
 * Cached per context + member so a template calling several helpers builds them once.
 *
 * @param object $ctx Render context.
 * @param array  $m   Member.
 * @return array
 */
function bptm_tb_meta_rows( $ctx, array $m ) {
	// Only the last member is cached. The context object itself is kept so a
	// later context can never reuse a freed object id and receive stale rows.
	static $last_ctx = null;
	static $last_key = '';
	static $last_rows = array();
	if ( ! is_object( $ctx ) || ! method_exists( $ctx, 'meta_rows' ) ) {
		return array();
	}
	$group = method_exists( $ctx, 'is_detail' ) && $ctx->is_detail() ? 'd' : 'i';
	$key   = $group . ':' . ( isset( $m['id'] ) ? (int) $m['id'] : 0 );
	if ( $last_ctx !== $ctx || $last_key !== $key ) {
		$rows      = $ctx->meta_rows( $m );
		$last_ctx  = $ctx;
		$last_key  = $key;
		$last_rows = is_array( $rows ) ? $rows : array();
	}
	return $last_rows;
}

/**
 * Contact / meta fields in display order.
 *
 * @return string[]
 */
function bptm_tb_meta_fields() {
	return array( 'company', 'address', 'land_phone', 'cell_phone', 'email', 'location', 'language', 'specialty', 'gender', 'zip', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five' );
}

/**
 * One contact line (icon + optional label + value), '' when hidden / empty.
 *
 * @param object $ctx        Render context.
 * @param array  $m          Member.
 * @param string $field      Field key.
 * @param bool   $with_label Prefix with the label.
 * @return string
 */
function bptm_tb_contact( $ctx, array $m, $field, $with_label = false ) {
	$rows = bptm_tb_meta_rows( $ctx, $m );
	if ( empty( $rows[ $field ] ) ) {
		return '';
	}
	$row   = $rows[ $field ];
	$label = $with_label ? '<span class="bptm-contact-label">' . esc_html( $row['label'] ) . ':</span> ' : '';
	return sprintf(
		'<div class="%1$s"><i class="%2$s" aria-hidden="true"></i><span class="bptm-contact-text">%3$s<span class="bptm-contact-value">%4$s</span></span></div>',
		esc_attr( 'bptm-contact bptm-contact--' . str_replace( '_', '-', $field ) ) . ' ' . $row['classes'],
		esc_attr( $row['icon'] ),
		$label,
		$row['value']
	);
}

/**
 * Several contact lines in a container ('' when none is visible / filled).
 *
 * @param object        $ctx        Render context.
 * @param array         $m          Member.
 * @param string[]|null $fields     Field keys (null = all meta fields).
 * @param string        $class      Container class.
 * @param bool          $with_label Prefix labels.
 * @return string
 */
function bptm_tb_contacts( $ctx, array $m, $fields = null, $class = 'bptm-contacts', $with_label = false ) {
	if ( null === $fields ) {
		$fields = bptm_tb_meta_fields();
	}
	$html = '';
	foreach ( $fields as $field ) {
		$html .= bptm_tb_contact( $ctx, $m, $field, $with_label );
	}
	return '' === $html ? '' : '<div class="' . esc_attr( $class ) . '">' . $html . '</div>';
}

/**
 * Secondary content for item themes: visible meta fields the template did not
 * print itself, skills, ACF, vCard and read more.
 *
 * @param object   $ctx     Render context.
 * @param array    $m       Member.
 * @param string[] $exclude Fields the template already rendered.
 * @return string
 */
function bptm_tb_extras( $ctx, array $m, array $exclude = array() ) {
	$parts = array(
		bptm_tb_contacts( $ctx, $m, array_diff( bptm_tb_meta_fields(), $exclude ), 'bptm-contacts bptm-meta', true ),
		in_array( 'skills', $exclude, true ) ? '' : bptm_tb_part( $ctx, $m, 'skills' ),
		// Once per member: '' if details()/skills() already printed it at its configured position.
		bptm_tb_part( $ctx, $m, 'acf_fields' ),
		in_array( 'vcard', $exclude, true ) ? '' : bptm_tb_part( $ctx, $m, 'vcard' ),
		in_array( 'read_more', $exclude, true ) ? '' : bptm_tb_part( $ctx, $m, 'read_more' ),
	);
	$html  = implode( '', array_filter( $parts, 'strlen' ) );
	return '' === $html ? '' : '<div class="bptm-tb-extras">' . $html . '</div>';
}

/**
 * Item root classes for this registry.
 *
 * @param object $ctx    Render context.
 * @param array  $m      Member.
 * @param string $id     Theme id.
 * @param string $family Family (table|list|legacy).
 * @param array  $extra  Extra classes.
 * @return string[]
 */
function bptm_tb_classes( $ctx, array $m, $id, $family, array $extra = array() ) {
	$classes = array_merge( array( 'bptm-tb', 'bptm-tb-' . $family, 'bptm-tb-' . $id ), $extra );
	if ( ! bptm_tb_show( $ctx, 'thumbnail' ) ) {
		$classes[] = 'bptm-tb-no-thumb';
	}
	return $classes;
}

/* -------------------------------------------------------------------------
 * Table helpers.
 * ---------------------------------------------------------------------- */

/**
 * Column definitions (key => [label, visibility field]).
 *
 * @return array<string,array{0:string,1:string}>
 */
function bptm_tb_table_column_defs() {
	$taxes    = function_exists( 'bptm_taxonomies' ) ? (array) bptm_taxonomies() : array();
	// Same rule as Context::tax_meta_label(): a customised translation wins, else the taxonomy label.
	$location = class_exists( '\BPTM\Render\Context' ) ? \BPTM\Render\Context::tax_label( 'location', $taxes ) : '';
	if ( '' === $location ) {
		$location = ! empty( $taxes['location']['label'] ) ? $taxes['location']['label'] : bptm_tb_t( 'location', __( 'Location', 'bp-team-member' ) );
	}
	return array(
		'thumbnail'   => array( __( 'Image', 'bp-team-member' ), 'thumbnail' ),
		'name'        => array( __( 'Name', 'bp-team-member' ), 'name' ),
		'designation' => array( __( 'Position', 'bp-team-member' ), 'designation' ),
		'details'     => array( __( 'Description', 'bp-team-member' ), 'details' ),
		'company'     => array( bptm_tb_t( 'company', __( 'Company', 'bp-team-member' ) ), 'company' ),
		'email'       => array( bptm_tb_t( 'email', __( 'Email', 'bp-team-member' ) ), 'email' ),
		'cell_phone'  => array( bptm_tb_t( 'cell_phone', __( 'Cell Phone', 'bp-team-member' ) ), 'cell_phone' ),
		'land_phone'  => array( bptm_tb_t( 'land_phone', __( 'Land Phone', 'bp-team-member' ) ), 'land_phone' ),
		'address'     => array( bptm_tb_t( 'address', __( 'Address', 'bp-team-member' ) ), 'address' ),
		'location'    => array( $location, 'location' ),
		'social'      => array( __( 'Social', 'bp-team-member' ), 'social' ),
	);
}

/**
 * Column order of a table theme.
 *
 * @param string $id Theme id.
 * @return string[]
 */
function bptm_tb_table_columns( $id ) {
	if ( in_array( $id, array( 'table-9', 'table-10' ), true ) ) {
		return array( 'thumbnail', 'name', 'designation', 'company', 'email', 'cell_phone', 'land_phone', 'address', 'location', 'social' );
	}
	return array( 'thumbnail', 'name', 'designation', 'company', 'details', 'email', 'cell_phone', 'land_phone', 'address', 'location', 'social' );
}

/**
 * Visible columns of a table theme in the current context.
 *
 * @param object $ctx Render context.
 * @param string $id  Theme id.
 * @return string[]
 */
function bptm_tb_visible_columns( $ctx, $id ) {
	$defs = bptm_tb_table_column_defs();
	$out  = array();
	foreach ( bptm_tb_table_columns( $id ) as $col ) {
		if ( isset( $defs[ $col ] ) && bptm_tb_show( $ctx, $defs[ $col ][1] ) ) {
			$out[] = $col;
		}
	}
	if ( empty( $out ) ) {
		$out[] = 'name';
	}
	return $out;
}

/**
 * Table head markup (<thead>) for a table theme.
 *
 * @param object $ctx Render context.
 * @param string $id  Theme id.
 * @return string
 */
function bptm_tb_table_head( $ctx, $id ) {
	$defs  = bptm_tb_table_column_defs();
	$cells = '';
	foreach ( bptm_tb_visible_columns( $ctx, $id ) as $col ) {
		$cells .= sprintf(
			'<th scope="col" class="%1$s">%2$s</th>',
			bptm_tb_vis( $ctx, $defs[ $col ][1], 'bptm-th bptm-col-' . str_replace( '_', '-', $col ) ),
			esc_html( $defs[ $col ][0] )
		);
	}
	return bptm_tb_table_border_style( $ctx ) . '<thead class="bptm-thead" data-bptm-cols="' . esc_attr( (string) bptm_tb_table_col_count( $ctx, $id ) ) . '"' . bptm_tb_table_uid_attr( $ctx ) . '><tr>' . $cells . '</tr></thead>';
}

/**
 * Number of columns a table theme shows (used to stack wide tables into cards early).
 *
 * @param object $ctx Render context.
 * @param string $id  Theme id.
 * @return int
 */
function bptm_tb_table_col_count( $ctx, $id ) {
	return count( bptm_tb_visible_columns( $ctx, $id ) );
}

/**
 * Column-count class for table rows: tables with many columns switch to the stacked
 * card layout at a wider container width (see _table.scss, "bptm-tb-cols-*").
 *
 * @param object $ctx Render context.
 * @param string $id  Theme id.
 * @return string
 */
function bptm_tb_table_cols_class( $ctx, $id ) {
	$n = bptm_tb_table_col_count( $ctx, $id );
	if ( $n >= 10 ) {
		return 'bptm-tb-cols-xl';
	}
	if ( $n >= 8 ) {
		return 'bptm-tb-cols-l';
	}
	if ( $n >= 6 ) {
		return 'bptm-tb-cols-m';
	}
	return 'bptm-tb-cols-s';
}

/**
 * data-bptm-uid attribute for the table head ('' without a context uid).
 *
 * @param object $ctx Render context.
 * @return string
 */
function bptm_tb_table_uid_attr( $ctx ) {
	$uid = is_object( $ctx ) && isset( $ctx->uid ) ? preg_replace( '/[^A-Za-z0-9_-]/', '', (string) $ctx->uid ) : '';
	return '' === $uid ? '' : ' data-bptm-uid="' . esc_attr( $uid ) . '"';
}

/**
 * Item border settings (itemBorderWidth / itemBorderColor / itemBorderRadius) for tables.
 *
 * The render style sheet draws the border on card elements only, which a table does not
 * have, and exposes no variable for the width. A <style> element (allowed inside <table>)
 * hands the values to this block's wrapper as --bptm-tb-bw / --bptm-tb-bc / --bptm-tb-br;
 * _table.scss draws them around the table (outer border + radius) or on the stacked cards.
 *
 * @param object $ctx Render context.
 * @return string
 */
function bptm_tb_table_border_style( $ctx ) {
	if ( ! is_object( $ctx ) || ! method_exists( $ctx, 'attr' ) || ! class_exists( '\BPTM\Render\Style' ) ) {
		return '';
	}
	$uid = preg_replace( '/[^A-Za-z0-9_-]/', '', isset( $ctx->uid ) ? (string) $ctx->uid : '' );
	$bw  = \BPTM\Render\Style::length( (string) $ctx->attr( 'itemBorderWidth', '' ) );
	$bc  = \BPTM\Render\Style::color( (string) $ctx->attr( 'itemBorderColor', '' ) );
	if ( '' === $uid || ( '' === $bw && '' === $bc ) ) {
		return '';
	}
	$br   = \BPTM\Render\Style::length( (string) $ctx->attr( 'itemBorderRadius', '' ) );
	$vars = '--bptm-tb-bw:' . ( '' !== $bw ? $bw : '1px' ) . ';--bptm-tb-bc:' . ( '' !== $bc ? $bc : 'currentColor' ) . ';';
	if ( '' !== $br ) {
		$vars .= '--bptm-tb-br:' . $br . ';';
	}
	// Values come from Style::length() / Style::color() (validated CSS tokens); strip anything that could close the element.
	$vars = str_replace( array( '<', '>', '{', '}' ), '', $vars );
	return '<style>.bptm-wrap:has(.bptm-thead[data-bptm-uid="' . $uid . '"]){' . $vars . '}</style>';
}

/**
 * One table cell.
 *
 * @param object $ctx Render context.
 * @param array  $m   Member.
 * @param string $col Column key.
 * @param string $id  Theme id.
 * @return string
 */
function bptm_tb_table_cell( $ctx, array $m, $col, $id ) {
	$defs  = bptm_tb_table_column_defs();
	$label = isset( $defs[ $col ] ) ? $defs[ $col ][0] : '';
	$inner = '';
	$sort  = '';

	switch ( $col ) {
		case 'thumbnail':
			$img = bptm_tb_image( $ctx, $m, true, true );
			if ( $img ) {
				$inner = '<div class="bptm-img-wrap">' . $img . '</div>';
			}
			break;
		case 'name':
			$inner  = bptm_tb_part( $ctx, $m, 'name', 'h3' );
			$inner .= bptm_tb_badges( $ctx, $m );
			// Fields without an own column (language, zip, extras, skills, ACF, vCard, read more).
			$inner .= bptm_tb_extras( $ctx, $m, bptm_tb_table_columns( $id ) );
			$sort   = isset( $m['name'] ) ? (string) $m['name'] : '';
			break;
		case 'designation':
			$inner = bptm_tb_part( $ctx, $m, 'designation' );
			$sort  = isset( $m['designation'] ) ? (string) $m['designation'] : '';
			break;
		case 'details':
			$inner = bptm_tb_part( $ctx, $m, 'details' );
			break;
		case 'social':
			$inner = bptm_tb_part( $ctx, $m, 'social' );
			break;
		default:
			$rows = bptm_tb_meta_rows( $ctx, $m );
			if ( ! empty( $rows[ $col ] ) ) {
				$inner = '<span class="bptm-contact bptm-contact--' . esc_attr( str_replace( '_', '-', $col ) ) . '"><i class="' . esc_attr( $rows[ $col ]['icon'] ) . '" aria-hidden="true"></i><span class="bptm-contact-value">' . $rows[ $col ]['value'] . '</span></span>';
				$sort  = trim( wp_strip_all_tags( $rows[ $col ]['value'] ) );
			}
	}

	$classes = 'bptm-td bptm-col-' . str_replace( '_', '-', $col ) . ( '' === $inner ? ' bptm-td-empty' : '' );
	$field   = isset( $defs[ $col ] ) ? $defs[ $col ][1] : $col;

	return sprintf(
		'<td class="%1$s" data-label="%2$s"%4$s>%3$s</td>',
		bptm_tb_vis( $ctx, $field, $classes ),
		esc_attr( $label ),
		$inner,
		'' !== $sort ? ' data-sort-value="' . esc_attr( $sort ) . '"' : ''
	);
}

/**
 * Full table row (<tr>) for a table theme.
 *
 * @param object $ctx Render context.
 * @param array  $m   Member.
 * @param string $id  Theme id.
 * @return string
 */
function bptm_tb_table_row( $ctx, array $m, $id ) {
	$cells = '';
	foreach ( bptm_tb_visible_columns( $ctx, $id ) as $col ) {
		$cells .= bptm_tb_table_cell( $ctx, $m, $col, $id );
	}
	$attrs = is_object( $ctx ) && method_exists( $ctx, 'item_attrs' )
		? $ctx->item_attrs( $m, bptm_tb_classes( $ctx, $m, $id, 'table', array( 'bptm-trow', bptm_tb_table_cols_class( $ctx, $id ) ) ) )
		: ' class="bptm-item bptm-trow"';
	return '<tr' . $attrs . '>' . $cells . '</tr>';
}

/* -------------------------------------------------------------------------
 * Detail views (popup / panel / drawer). The render area wraps each template
 * in <div class="bptm-detail bptm-detail--{type} bptm-{type}-{style}" data-bptm-detail>.
 * ---------------------------------------------------------------------- */

/**
 * Detail-view social block with optional "Follow Me On" heading.
 *
 * @param object $ctx   Render context.
 * @param array  $m     Member.
 * @param bool   $label Print the heading.
 * @return string
 */
function bptm_tb_detail_social( $ctx, array $m, $label = true ) {
	$social = bptm_tb_part( $ctx, $m, 'social' );
	if ( '' === $social ) {
		return '';
	}
	$head = $label ? '<h4 class="bptm-dv-heading">' . esc_html( bptm_tb_t( 'follow_me_on', __( 'Follow Me On', 'bp-team-member' ) ) ) . '</h4>' : '';
	return '<div class="' . bptm_tb_vis( $ctx, 'social', 'bptm-dv-social' ) . '">' . $head . $social . '</div>';
}

/**
 * Parts of a detail view, each visibility-checked and escaped.
 *
 * Only the requested parts are built, in display order, so ACF output that the
 * Context attaches after the description / skills / meta block is never lost;
 * whatever ACF output is still pending lands in 'tail' (always built last).
 *
 * @param object        $ctx Render context.
 * @param array         $m   Member.
 * @param string[]|null $use Part keys the template prints (null = all).
 * @return array<string,string>
 */
function bptm_tb_detail_parts( $ctx, array $m, $use = null ) {
	$all = array( 'img', 'flip', 'badges', 'name', 'role', 'desc', 'social', 'social_plain', 'meta', 'skills' );
	$use = null === $use ? $all : array_intersect( $all, (array) $use );
	$out = array_fill_keys( array_merge( $all, array( 'tail' ) ), '' );

	foreach ( $use as $key ) {
		switch ( $key ) {
			case 'img':
				$img         = bptm_tb_image( $ctx, $m, false );
				$out['img'] = '' === $img ? '' : '<div class="bptm-img-wrap bptm-dv-img">' . $img . '</div>';
				break;
			case 'flip':
				if ( is_object( $ctx ) && method_exists( $ctx, 'flip_image' ) && bptm_tb_show( $ctx, 'thumbnail' ) ) {
					$out['flip'] = trim( (string) $ctx->flip_image( $m ) );
				}
				break;
			case 'badges':
				$out['badges'] = bptm_tb_badges( $ctx, $m );
				break;
			case 'name':
				$out['name'] = bptm_tb_plain_name( $ctx, $m, 'h2', 'bptm-dv-name' );
				break;
			case 'role':
				$out['role'] = bptm_tb_plain_designation( $ctx, $m, 'bptm-dv-role' );
				break;
			case 'desc':
				$desc        = bptm_tb_part( $ctx, $m, 'details' );
				$out['desc'] = '' === $desc ? '' : '<div class="bptm-dv-desc">' . $desc . '</div>';
				break;
			case 'social':
				$out['social'] = bptm_tb_detail_social( $ctx, $m );
				break;
			case 'social_plain':
				$out['social_plain'] = bptm_tb_detail_social( $ctx, $m, false );
				break;
			case 'meta':
				$meta        = is_object( $ctx ) && method_exists( $ctx, 'meta_details' ) ? trim( (string) $ctx->meta_details( $m, 'list' ) ) : '';
				$out['meta'] = '' === $meta ? '' : '<div class="bptm-dv-meta">' . $meta . '</div>';
				break;
			case 'skills':
				$sk            = bptm_tb_part( $ctx, $m, 'skills' );
				$out['skills'] = '' === $sk ? '' : '<div class="bptm-dv-skills">' . $sk . '</div>';
				break;
		}
	}

	// Ribbon / featured badge: templates print 'badges' over the photo; 'badges_block' is the
	// same as an inline row for layouts without a photo frame. Without a photo (thumbnail hidden
	// or missing) the row goes above the name, so the badges are never lost.
	$out['badges_block'] = '' === $out['badges'] ? '' : '<div class="bptm-dv-badges">' . $out['badges'] . '</div>';
	if ( '' !== $out['badges_block'] && '' === $out['img'] && in_array( 'name', $use, true ) ) {
		$out['name'] = $out['badges_block'] . $out['name'];
	}

	$tail        = bptm_tb_part( $ctx, $m, 'acf_fields' ) . bptm_tb_part( $ctx, $m, 'vcard' );
	$out['tail'] = '' === $tail ? '' : '<div class="bptm-dv-tail">' . $tail . '</div>';
	return $out;
}

/**
 * Root classes for a detail template (escaped attribute value).
 *
 * @param object $ctx   Render context.
 * @param array  $m     Member.
 * @param string $kind  popup|panel|drawer.
 * @param string $style Style slug.
 * @param array  $extra Extra classes.
 * @return string
 */
function bptm_tb_detail_classes( $ctx, array $m, $kind, $style, array $extra = array() ) {
	$classes = array_merge( array( 'bptm-dv', 'bptm-dv-' . $kind, 'bptm-dv-' . $kind . '--' . $style ), $extra );
	if ( ! bptm_tb_show( $ctx, 'thumbnail' ) ) {
		$classes[] = 'bptm-dv--no-img';
	}
	return esc_attr( implode( ' ', array_map( 'sanitize_html_class', $classes ) ) );
}

/**
 * Fields each detail style renders (for editors that hide irrelevant visibility rows).
 * Exposed through the `bptm_detail_style_fields` filter.
 *
 * @return array{popup:array,panel:array,drawer:array}
 */
function bptm_tb_detail_style_fields() {
	$core   = array( 'thumbnail', 'name', 'designation', 'details', 'social' );
	$meta   = array_merge( bptm_tb_meta_fields(), array( 'acf_fields', 'vcard' ) );
	$ribbon = array( 'ribbon', 'featured_badge' );
	$skills = array( 'skills' );
	$short  = array( 'acf_fields', 'vcard' );

	$fields = array(
		'popup'  => array(
			'default'     => array_merge( $core, $skills, $meta ),
			'style-one'   => array_merge( $core, $ribbon, $skills, $meta ),
			'style-two'   => array_merge( $core, $ribbon, $skills, $meta ),
			'style-three' => array_merge( $core, $ribbon, $skills, $meta ),
			'style-four'  => array_merge( $core, $ribbon, $skills, $meta ),
			'style-five'  => array_merge( $core, $skills, $meta ),
			'style-six'   => array_merge( $core, $skills, $meta ),
		),
		'panel'  => array(
			'default'     => array_merge( $core, $skills, $meta ),
			'style-one'   => array_merge( $core, $skills, $meta ),
			'style-two'   => array_merge( $core, $skills, $meta ),
			'style-three' => array_merge( $core, $skills, $meta ),
			'style-four'  => array_merge( $core, $skills, $meta ),
			'style-five'  => array_merge( $core, $skills, $meta ),
		),
		'drawer' => array(
			'default'     => array_merge( $core, $skills, $meta ),
			'style-one'   => array_merge( $core, $skills, $meta ),
			'style-two'   => array_merge( $core, $skills, $meta ),
			'style-three' => array_merge( $core, $skills, $meta ),
			'style-four'  => array_merge( $core, $skills, $meta ),
			'style-five'  => array_merge( $core, $skills, $meta ),
		),
	);

	return apply_filters( 'bptm_detail_style_fields', $fields );
}
