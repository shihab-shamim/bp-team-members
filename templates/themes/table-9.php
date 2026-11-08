<?php
/**
 * Item theme: Table 9 — Filter: compact contact directory (name, position, phone, email) with the filter / search bar.
 *
 * Renders one table row (<tr>); columns follow visibility (see bptm_tb_visible_columns()).
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// This directory table has no Description column: when Details is switched on,
// the description is printed under the name (or in the first cell without a name column).
$bptm_row = bptm_tb_table_row( $ctx, $m, 'table-9' );
$bptm_desc = bptm_tb_part( $ctx, $m, 'details' );
if ( '' !== $bptm_desc ) {
	$bptm_cell = strpos( $bptm_row, 'bptm-col-name' );
	$bptm_end  = strpos( $bptm_row, '</td>', false === $bptm_cell ? 0 : $bptm_cell );
	if ( false !== $bptm_end ) {
		$bptm_row = substr_replace( $bptm_row, $bptm_desc, $bptm_end, 0 );
	}
}
// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from escaped fragments.
echo $bptm_row;
