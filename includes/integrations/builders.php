<?php
/**
 * Page-builder modules: WPBakery, Divi, Beaver Builder, Oxygen and tagDiv Composer.
 * (Elementor lives in elementor.php.) Each one only loads when its builder is active;
 * every module renders through \BPTM\Quick::render_settings(), i.e. a saved Showcase (members are
 * edited in the showcase's block) or a quick list of the block's default sample members
 * (theme, number, group, columns, order, link).
 *
 * Each integration can be turned off with the `bptm_integration_{builder}` filter.
 *
 * @package BPTM
 */

namespace BPTM\Integrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared field definitions for builder modules.
 *
 * @return array key => [type (select|number), label, choices, default]
 */
function bptm_builder_fields() {
	$c         = \BPTM\Quick::choices();
	$showcases = array( '0' => __( '— None (use the options below) —', 'bp-team-member' ) );
	foreach ( $c['showcases'] as $id => $label ) {
		$showcases[ (string) $id ] = $label;
	}
	return array(
		'source'   => array(
			'select',
			__( 'Content', 'bp-team-member' ),
			array(
				'showcase' => __( 'A saved showcase', 'bp-team-member' ),
				'quick'    => __( 'Sample team list (options below)', 'bp-team-member' ),
			),
			'showcase',
		),
		'showcase' => array( 'select', __( 'Showcase', 'bp-team-member' ), $showcases, '0' ),
		'theme'    => array( 'select', __( 'Theme', 'bp-team-member' ), $c['themes'], 'grid-5' ),
		'number'   => array( 'number', __( 'Number of members (-1 = all)', 'bp-team-member' ), array(), '-1' ),
		'group'    => array( 'select', __( 'Group', 'bp-team-member' ), array( '' => __( 'All groups', 'bp-team-member' ) ) + $c['groups'], '' ),
		'columns'  => array(
			'select',
			__( 'Columns (desktop)', 'bp-team-member' ),
			array(
				'1' => '1',
				'2' => '2',
				'3' => '3',
				'4' => '4',
				'5' => '5',
				'6' => '6',
			),
			'4',
		),
		'view'     => array(
			'select',
			__( 'View', 'bp-team-member' ),
			array(
				'grid'     => __( 'Grid', 'bp-team-member' ),
				'carousel' => __( 'Carousel', 'bp-team-member' ),
				'filter'   => __( 'Filter', 'bp-team-member' ),
			),
			'grid',
		),
		'orderby'  => array( 'select', __( 'Order by', 'bp-team-member' ), \BPTM\Quick::orderby_choices(), 'default' ),
		'order'    => array(
			'select',
			__( 'Order', 'bp-team-member' ),
			array(
				'ASC'  => __( 'Ascending', 'bp-team-member' ),
				'DESC' => __( 'Descending', 'bp-team-member' ),
			),
			'ASC',
		),
		'link'     => array( 'select', __( 'Member link', 'bp-team-member' ), \BPTM\Quick::link_choices(), 'default' ),
	);
}

/**
 * Render builder settings (array or object of settings).
 *
 * @param array|object $settings Settings.
 * @return string
 */
function bptm_builder_render( $settings ) {
	$settings = is_object( $settings ) ? get_object_vars( $settings ) : (array) $settings;
	$clean    = array();
	foreach ( array_keys( bptm_builder_fields() ) as $key ) {
		if ( isset( $settings[ $key ] ) && is_scalar( $settings[ $key ] ) ) {
			$clean[ $key ] = sanitize_text_field( (string) $settings[ $key ] );
		}
	}
	if ( ! isset( $clean['source'] ) ) {
		$clean['source'] = ! empty( $clean['showcase'] ) ? 'showcase' : 'quick';
	}
	$html = \BPTM\Quick::render_settings( $clean );
	if ( '' === $html && \BPTM\Quick::is_builder_preview() ) {
		return '<p class="bptm-notice">' . esc_html__( 'BP Team Member: choose a showcase or switch Content to "Team members list".', 'bp-team-member' ) . '</p>';
	}
	return $html;
}

/**
 * Integration enabled?
 *
 * @param string $builder Builder key.
 * @return bool
 */
function bptm_integration_enabled( $builder ) {
	return (bool) apply_filters( 'bptm_integration_' . $builder, true );
}

/* ---------------------------------------------------------------------------
 * WPBakery Page Builder: maps the [bp_team] shortcode itself.
 * ------------------------------------------------------------------------- */

/**
 * Register the WPBakery element.
 */
function bptm_wpbakery_register() {
	if ( ! function_exists( 'vc_map' ) || ! bptm_integration_enabled( 'wpbakery' ) ) {
		return;
	}
	$fields = bptm_builder_fields();
	$params = array();
	// [bp_team] reads `id` for the showcase; quick options override it only when not empty.
	$params[] = array(
		'type'        => 'dropdown',
		'heading'     => $fields['showcase'][1],
		'param_name'  => 'id',
		'value'       => array_flip( $fields['showcase'][2] ),
		'std'         => '0',
		'admin_label' => true,
		'description' => sprintf(
			'<a href="%1$s" target="_blank">%2$s</a>',
			esc_url( admin_url( 'post-new.php?post_type=bptm_showcase' ) ),
			esc_html__( 'Create a new showcase', 'bp-team-member' )
		),
	);
	foreach ( array( 'theme', 'number', 'group', 'columns', 'view', 'orderby', 'order', 'link' ) as $key ) {
		list( $type, $label, $choices ) = $fields[ $key ];
		if ( 'number' === $type ) {
			$params[] = array(
				'type'        => 'textfield',
				'heading'     => $label,
				'param_name'  => $key,
				'value'       => '',
				'group'       => __( 'Team list', 'bp-team-member' ),
				'description' => __( 'Leave empty to keep the showcase setting.', 'bp-team-member' ),
			);
			continue;
		}
		$params[] = array(
			'type'       => 'dropdown',
			'heading'    => $label,
			'param_name' => $key,
			'value'      => array( __( '— Default —', 'bp-team-member' ) => '' ) + array_flip( $choices ),
			'std'        => '',
			'group'      => __( 'Team list', 'bp-team-member' ),
		);
	}
	vc_map(
		array(
			'name'        => __( 'BP Team Member', 'bp-team-member' ),
			'base'        => 'bp_team',
			'description' => __( 'Team members showcase or list', 'bp-team-member' ),
			'category'    => __( 'Content', 'bp-team-member' ),
			'icon'        => 'icon-wpb-ui-separator-label',
			'params'      => $params,
		)
	);
}
add_action( 'vc_before_init', __NAMESPACE__ . '\\bptm_wpbakery_register' );

/* ---------------------------------------------------------------------------
 * Divi Builder (Divi 4 module API, also loaded by Divi 5's compatibility layer).
 * ------------------------------------------------------------------------- */

/**
 * Register the Divi module.
 */
function bptm_divi_register() {
	if ( ! class_exists( '\ET_Builder_Module' ) || ! bptm_integration_enabled( 'divi' ) ) {
		return;
	}
	require_once __DIR__ . '/builders/class-divi-module.php';
	new Divi_Module();
}
add_action( 'et_builder_ready', __NAMESPACE__ . '\\bptm_divi_register' );

/* ---------------------------------------------------------------------------
 * Beaver Builder.
 * ------------------------------------------------------------------------- */

/**
 * Register the Beaver Builder module.
 */
function bptm_beaver_register() {
	if ( ! class_exists( '\FLBuilder' ) || ! class_exists( '\FLBuilderModule' ) || ! bptm_integration_enabled( 'beaver' ) ) {
		return;
	}
	require_once __DIR__ . '/builders/beaver/class-beaver-module.php';
	$fields = array();
	foreach ( bptm_builder_fields() as $key => $def ) {
		list( $type, $label, $choices, $default ) = $def;
		$fields[ $key ] = 'number' === $type
			? array(
				'type'    => 'text',
				'label'   => $label,
				'default' => $default,
				'size'    => '6',
			)
			: array(
				'type'    => 'select',
				'label'   => $label,
				'default' => $default,
				'options' => $choices,
			);
	}
	\FLBuilder::register_module(
		__NAMESPACE__ . '\\Beaver_Module',
		array(
			'bptm-general' => array(
				'title'    => __( 'Team', 'bp-team-member' ),
				'sections' => array(
					'bptm-section' => array(
						'title'  => __( 'Team members', 'bp-team-member' ),
						'fields' => $fields,
					),
				),
			),
		)
	);
}
add_action( 'init', __NAMESPACE__ . '\\bptm_beaver_register', 20 );

/* ---------------------------------------------------------------------------
 * Oxygen Builder.
 * ------------------------------------------------------------------------- */

/**
 * Register the Oxygen element.
 */
function bptm_oxygen_register() {
	if ( ! class_exists( '\OxyEl' ) || ! bptm_integration_enabled( 'oxygen' ) ) {
		return;
	}
	require_once __DIR__ . '/builders/class-oxygen-element.php';
	new Oxygen_Element();
}
add_action( 'init', __NAMESPACE__ . '\\bptm_oxygen_register', 20 );

/* ---------------------------------------------------------------------------
 * tagDiv Composer (Newspaper / Newsmag themes).
 * ------------------------------------------------------------------------- */

/**
 * Register the tagDiv block.
 */
function bptm_tagdiv_register() {
	if ( ! class_exists( '\td_api_block' ) || ! bptm_integration_enabled( 'tagdiv' ) ) {
		return;
	}
	$params = array();
	foreach ( bptm_builder_fields() as $key => $def ) {
		list( $type, $label, $choices, $default ) = $def;
		$params[] = 'number' === $type
			? array(
				'param_name' => $key,
				'type'       => 'textfield',
				'value'      => $default,
				'heading'    => $label,
			)
			: array(
				'param_name' => $key,
				'type'       => 'dropdown',
				'value'      => array_flip( $choices ),
				'heading'    => $label,
			);
	}
	\td_api_block::add(
		'td_bptm_team',
		array(
			'map_in_visual_composer' => false,
			'map_in_td_composer'     => true,
			'name'                   => __( 'BP Team Member', 'bp-team-member' ),
			'base'                   => 'td_bptm_team',
			'class'                  => 'td_bptm_team',
			'controls'               => 'full',
			'category'               => 'Content',
			'tdc_category'           => 'Blocks',
			'file'                   => __DIR__ . '/builders/class-tagdiv-block.php',
			'params'                 => $params,
		)
	);
}
add_action( 'td_global_after', __NAMESPACE__ . '\\bptm_tagdiv_register' );

/**
 * Builder canvases that inject markup after load: make sure the frontend assets are present.
 */
function bptm_builder_preview_assets() {
	if ( \BPTM\Quick::is_builder_preview() && class_exists( '\BPTM\Block' ) ) {
		\BPTM\Block::enqueue_frontend();
	}
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\bptm_builder_preview_assets', 20 );
