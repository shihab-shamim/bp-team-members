<?php
/**
 * Item theme: Table 1 — underlined rows, rounded-corner photos, outlined social icons.
 *
 * Renders one table row (<tr>); columns follow visibility (see bptm_tb_visible_columns()).
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped fragments.
echo bptm_tb_table_row( $ctx, $m, 'table-1' );
