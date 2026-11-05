<?php
/**
 * Item theme: Grid 11 — rounded photo with an elevated name card overlapping its bottom; the card fills with the accent colour on hover.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by the bptm_tb_* helpers / Context.
$bptm_img = bptm_tb_image( $ctx, $m );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_tb_classes( $ctx, $m, 'grid-11', 'legacy' ) ); ?>>
	<div class="bptm-tb-card">
		<?php if ( $bptm_img ) : ?>
			<div class="bptm-img-wrap bptm-tb-media">
				<?php echo $bptm_img . bptm_tb_badges( $ctx, $m ); ?>
			</div>
		<?php endif; ?>
		<div class="bptm-tb-info">
			<?php
			if ( ! $bptm_img ) {
				echo bptm_tb_badges( $ctx, $m );
			}
			echo bptm_tb_part( $ctx, $m, 'name', 'h3' );
			echo bptm_tb_part( $ctx, $m, 'designation' );
			echo bptm_tb_part( $ctx, $m, 'details' );
			echo bptm_tb_part( $ctx, $m, 'social' );
			echo bptm_tb_extras( $ctx, $m );
			?>
		</div>
	</div>
</div>
