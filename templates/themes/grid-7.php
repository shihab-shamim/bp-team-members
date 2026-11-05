<?php
/**
 * Item theme: Grid 7 — photo with a dark overlay that slides in on hover showing details and social links; name and designation centred below.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by the bptm_tb_* helpers / Context.
$bptm_img   = bptm_tb_image( $ctx, $m );
$bptm_hover = bptm_tb_part( $ctx, $m, 'details' ) . bptm_tb_part( $ctx, $m, 'social' );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_tb_classes( $ctx, $m, 'grid-7', 'legacy', array( 'bptm-tb-hovercard' ) ) ); ?>>
	<div class="bptm-tb-card">
		<?php if ( $bptm_img ) : ?>
			<div class="bptm-img-wrap bptm-tb-media">
				<?php echo $bptm_img . bptm_tb_badges( $ctx, $m ); ?>
				<?php if ( $bptm_hover ) : ?>
					<div class="bptm-tb-hover"><div class="bptm-tb-hover-inner"><?php echo $bptm_hover; ?></div></div>
				<?php endif; ?>
			</div>
		<?php endif; ?>
		<div class="bptm-tb-info">
			<?php
			if ( ! $bptm_img ) {
				echo bptm_tb_badges( $ctx, $m ) . $bptm_hover;
			}
			echo bptm_tb_part( $ctx, $m, 'name', 'h3' );
			echo bptm_tb_part( $ctx, $m, 'designation' );
			echo bptm_tb_extras( $ctx, $m );
			?>
		</div>
	</div>
</div>
