<?php
/**
 * Table head (<thead>) for item theme table-5. Included once per table.
 *
 * @package BPTM
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in bptm_tb_table_head().
echo bptm_tb_table_head( $ctx, 'table-5' );
