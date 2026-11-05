<?php
/**
 * Item theme: Grid 12 — padded card: photo, left-aligned name and designation, footer row with a read-more action and compact social icons; background tints on hover.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by the bptm_tb_* helpers / Context.
$bptm_img    = bptm_tb_image( $ctx, $m );
$bptm_more   = bptm_tb_part( $ctx, $m, 'read_more' );
$bptm_social = bptm_tb_part( $ctx, $m, 'social' );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_tb_classes( $ctx, $m, 'grid-12', 'legacy' ) ); ?>>
	<div class="bptm-tb-card">
		<?php if ( $bptm_img ) : ?>
			<div class="bptm-img-wrap bptm-tb-media">
				<?php echo $bptm_img . bptm_tb_badges( $ctx, $m ); ?>
			</div>
		<?php endif; ?>
		<div class="bptm-tb-info">
			<div class="bptm-tb-info-top">
				<?php
				if ( ! $bptm_img ) {
					echo bptm_tb_badges( $ctx, $m );
				}
				echo bptm_tb_part( $ctx, $m, 'name', 'h3' );
				echo bptm_tb_part( $ctx, $m, 'designation' );
				echo bptm_tb_part( $ctx, $m, 'details' );
				echo bptm_tb_extras( $ctx, $m, array( 'read_more' ) );
				?>
			</div>
			<?php if ( $bptm_more || $bptm_social ) : ?>
				<div class="bptm-tb-foot"><?php echo $bptm_more . $bptm_social; ?></div>
			<?php endif; ?>
		</div>
	</div>
</div>
