<?php
/**
 * Item theme: Grid 8 — framed photo; name and designation pop up in a tooltip bubble above the photo on hover / focus.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by the bptm_tb_* helpers / Context.
$bptm_img = bptm_tb_image( $ctx, $m, true, true );
$bptm_tip = bptm_tb_part( $ctx, $m, 'name', 'h3' ) . bptm_tb_part( $ctx, $m, 'designation' );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_tb_classes( $ctx, $m, 'grid-8', 'legacy' ) ); ?>>
	<div class="bptm-tb-card">
		<?php if ( $bptm_img ) : ?>
			<div class="bptm-img-wrap bptm-tb-media">
				<?php echo $bptm_img . bptm_tb_badges( $ctx, $m ); ?>
			</div>
		<?php endif; ?>
		<?php if ( $bptm_tip ) : ?>
			<div class="bptm-tb-tip"><?php echo $bptm_tip; ?></div>
		<?php endif; ?>
		<?php echo bptm_tb_part( $ctx, $m, 'details' ) . bptm_tb_extras( $ctx, $m ) . bptm_tb_part( $ctx, $m, 'social' ); // Details + social follow their visibility toggles (off by default). ?>
	</div>
</div>
