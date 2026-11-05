<?php
/**
 * Beaver Builder module output.
 *
 * @package BPTM
 * @var object $settings Module settings.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

echo \BPTM\Integrations\bptm_builder_render( isset( $settings ) ? $settings : array() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered block output.
