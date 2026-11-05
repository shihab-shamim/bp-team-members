<?php
/**
 * Partial: generic table row, used when a table theme template file is missing.
 *
 * @package BPTM
 *
 * @var array                $m   Member.
 * @var \BPTM\Render\Context $ctx Context.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<tr <?php echo $ctx->item_attrs( $m, array( 'bptm-item--fallback' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by item_attrs. ?>>
	<td class="bptm-cell-img"><?php echo $ctx->image( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></td>
	<td class="bptm-cell-name"><?php echo $ctx->name( $m, 'div' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></td>
	<td class="bptm-cell-role"><?php echo $ctx->designation( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></td>
	<td class="bptm-cell-social"><?php echo $ctx->social( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></td>
</tr>
