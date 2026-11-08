<?php
/**
 * Item theme: Grid Popup — the whole photo opens the member popup; name / designation captions sit on the photo and a dark overlay with an icon appears on hover.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by the bptm_tb_* helpers / Context.
$bptm_img     = bptm_tb_image( $ctx, $m, false );
$bptm_caption = bptm_tb_plain_name( $ctx, $m, 'h3' ) . bptm_tb_plain_designation( $ctx, $m );
$bptm_open    = method_exists( $ctx, 'link_open' ) ? (string) $ctx->link_open( $m, 'bptm-tb-cover-link' ) : '';
?>
<div <?php echo $ctx->item_attrs( $m, bptm_tb_classes( $ctx, $m, 'grid-popup', 'legacy', array( 'bptm-tb-overlay-card' ) ) ); ?>>
	<div class="bptm-tb-card">
		<?php echo $bptm_open; ?>
			<div class="bptm-img-wrap bptm-tb-media">
				<?php echo $bptm_img; ?>
				<?php if ( '' !== $bptm_open ) : ?>
					<span class="bptm-tb-indicator" aria-hidden="true"><i class="fas fa-expand-alt"></i></span>
				<?php endif; ?>
				<?php if ( $bptm_caption ) : ?>
					<div class="bptm-tb-caption"><?php echo $bptm_caption; ?></div>
				<?php endif; ?>
			</div>
		<?php echo '' !== $bptm_open ? $ctx->link_close( $m ) : ''; ?>
		<?php echo bptm_tb_badges( $ctx, $m ); ?>
		<?php echo bptm_tb_part( $ctx, $m, 'details' ) . bptm_tb_extras( $ctx, $m ) . bptm_tb_part( $ctx, $m, 'social' ); // Details + social follow their visibility toggles (off by default). ?>
	</div>
</div>
