<?php
/**
 * Item theme: Table 3 — boxed table with accent header text and hover row tint.
 *
 * Renders one table row (<tr>); columns follow visibility (see bptm_tb_visible_columns()).
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped fragments.
echo bptm_tb_table_row( $ctx, $m, 'table-3' );
