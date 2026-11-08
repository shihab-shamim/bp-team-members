<?php
/**
 * Block render callback (copied to build/ by wp-scripts --webpack-copy-php).
 *
 * Prints only the mount wrapper with the block attributes as data; the block itself is rendered in
 * the browser by build/view.js (React), from the attributes.
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

if ( class_exists( '\BPTM\Block' ) ) {
	// Every value is escaped by Block::render().
	echo \BPTM\Block::render( $attributes, get_block_wrapper_attributes() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
