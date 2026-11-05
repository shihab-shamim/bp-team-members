<?php
/**
 * Elementor integration: "BP Team Member" widget that renders a showcase.
 * Only loads when Elementor fires its hooks (i.e. Elementor is active).
 *
 * @package BPTM
 */

namespace BPTM\Integrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the widget.
 *
 * @param object $widgets_manager Elementor widgets manager.
 */
function bptm_elementor_register_widget( $widgets_manager ) {
	if ( ! class_exists( '\Elementor\Widget_Base' ) ) {
		return;
	}
	require_once __DIR__ . '/elementor/class-elementor-widget.php';
	if ( method_exists( $widgets_manager, 'register' ) ) {
		$widgets_manager->register( new Elementor_Widget() );
	} elseif ( method_exists( $widgets_manager, 'register_widget_type' ) ) {
		$widgets_manager->register_widget_type( new Elementor_Widget() );
	}
}
add_action( 'elementor/widgets/register', __NAMESPACE__ . '\\bptm_elementor_register_widget' );

/**
 * Make block styles available inside the Elementor preview iframe.
 */
function bptm_elementor_preview_assets() {
	if ( class_exists( '\BPTM\Showcase' ) ) {
		\BPTM\Showcase::enqueue_assets();
	}
}
add_action( 'elementor/preview/enqueue_styles', __NAMESPACE__ . '\\bptm_elementor_preview_assets' );
add_action( 'elementor/preview/enqueue_scripts', __NAMESPACE__ . '\\bptm_elementor_preview_assets' );
