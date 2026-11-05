<?php
/**
 * Item theme: Flip 6 — photo card with a name caption that turns over on hover to
 * the member's flip image (falls back to the main photo) under a dark veil,
 * showing the name, designation and contact details.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_p        = bptm_ta_parts( $ctx, $m );
$bptm_back_img = bptm_ta_image( $ctx, $m, false, true );
$bptm_back     = $bptm_p['name'] . $bptm_p['role'] . $bptm_p['desc'] . $bptm_p['extras'] . $bptm_p['social'];
$bptm_cls      = bptm_ta_classes( $ctx, $m, 'flip-6', 'flip' );
if ( $bptm_p['img'] && $bptm_back ) {
	$bptm_cls[] = 'bptm-ta-has-flip';
}
?>
<div <?php echo $ctx->item_attrs( $m, $bptm_cls ); ?>>
	<div class="bptm-ta-card">
		<?php if ( $bptm_p['img'] ) : ?>
			<div class="bptm-ta-flipbox">
				<div class="bptm-ta-face bptm-ta-front">
					<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-img-wrap' ); ?>"><?php echo $bptm_p['img']; ?></div>
					<?php if ( $bptm_p['name'] || $bptm_p['role'] ) : ?>
						<div class="bptm-ta-caption" aria-hidden="true"><?php echo wp_strip_all_tags( $bptm_p['name'] ) ? '<span class="bptm-ta-caption-name">' . esc_html( wp_strip_all_tags( $bptm_p['name'] ) ) . '</span>' : ''; ?><?php echo wp_strip_all_tags( $bptm_p['role'] ) ? '<span class="bptm-ta-caption-role">' . esc_html( wp_strip_all_tags( $bptm_p['role'] ) ) . '</span>' : ''; ?></div>
					<?php endif; ?>
					<?php if ( $bptm_p['badges'] ) : ?>
						<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
					<?php endif; ?>
				</div>
				<?php if ( $bptm_back ) : ?>
					<div class="bptm-ta-face bptm-ta-back">
						<div class="bptm-ta-back-img" aria-hidden="true"><?php echo $bptm_back_img; ?></div>
						<div class="bptm-ta-back-inner"><?php echo $bptm_back; ?></div>
					</div>
				<?php endif; ?>
			</div>
		<?php else : ?>
			<?php if ( $bptm_p['badges'] ) : ?>
				<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
			<?php endif; ?>
			<div class="bptm-ta-info"><div class="bptm-ta-static"><?php echo $bptm_back; ?></div></div>
		<?php endif; ?>
	</div>
</div>
