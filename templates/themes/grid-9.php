<?php
/**
 * Item theme: Grid 9 — full photo with a translucent info card floating over its bottom edge; the card turns accent-coloured on hover.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by the bptm_tb_* helpers / Context.
$bptm_img  = bptm_tb_image( $ctx, $m, true, true );
$bptm_info = bptm_tb_part( $ctx, $m, 'name', 'h3' ) . bptm_tb_part( $ctx, $m, 'designation' );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_tb_classes( $ctx, $m, 'grid-9', 'legacy' ) ); ?>>
	<div class="bptm-tb-card">
		<div class="bptm-img-wrap bptm-tb-media">
			<?php echo $bptm_img . bptm_tb_badges( $ctx, $m ); ?>
			<?php if ( $bptm_info ) : ?>
				<div class="bptm-tb-infocard"><?php echo $bptm_info; ?></div>
			<?php endif; ?>
		</div>
		<?php echo bptm_tb_part( $ctx, $m, 'details' ) . bptm_tb_extras( $ctx, $m ) . bptm_tb_part( $ctx, $m, 'social' ); // Details + social follow their visibility toggles (off by default). ?>
	</div>
</div>
