<?php
/**
 * Item theme: Horizontal 6 — square photo on the left, info on the right with
 * square outlined social icons; photo zooms on hover.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_p = bptm_ta_parts( $ctx, $m );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_ta_classes( $ctx, $m, 'horizontal-6', 'horizontal' ) ); ?>>
	<div class="bptm-ta-card">
		<?php if ( $bptm_p['img'] ) : ?>
			<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-ta-media' ); ?>">
				<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-img-wrap' ); ?>">
					<?php echo $bptm_p['img']; ?>
				</div>
			</div>
		<?php endif; ?>
		<div class="bptm-ta-info">
			<?php echo $bptm_p['name'] . $bptm_p['role'] . $bptm_p['desc'] . $bptm_p['extras'] . $bptm_p['social']; ?>
		</div>
		<?php if ( $bptm_p['badges'] ) : ?>
			<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
		<?php endif; ?>
	</div>
</div>
