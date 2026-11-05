<?php
/**
 * Block render callback (copied to build/ by wp-scripts --webpack-copy-php).
 *
 * @package BPTM
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner content (unused).
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( '\BPTM\Render\Renderer' ) ) {
	// Renderer escapes every value it outputs.
	echo \BPTM\Render\Renderer::render( $attributes, get_block_wrapper_attributes() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
