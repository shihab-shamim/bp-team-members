<?php
/**
 * Partial: ribbon.
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
<span class="<?php echo $ctx->vis_classes( 'ribbon', 'bptm-ribbon' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"><?php echo esc_html( $m['ribbon'] ); ?></span>
