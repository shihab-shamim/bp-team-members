<?php
/**
 * Item theme: Flip 3 — square shadowed card whose photo tips over vertically (top to
 * bottom) on hover to a navy side with description, address and social
 * icons; name and designation sit in the white footer of the card.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_p    = bptm_ta_parts( $ctx, $m );
$bptm_back = $bptm_p['desc'] . $bptm_p['extras'] . $bptm_p['social'];
$bptm_info = $bptm_p['name'] . $bptm_p['role'];
$bptm_cls  = bptm_ta_classes( $ctx, $m, 'flip-3', 'flip' );
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
					<?php if ( $bptm_p['badges'] ) : ?>
						<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
					<?php endif; ?>
				</div>
				<?php if ( $bptm_back ) : ?>
					<div class="bptm-ta-face bptm-ta-back">
						<div class="bptm-ta-back-inner"><?php echo $bptm_back; ?></div>
					</div>
				<?php endif; ?>
			</div>
		<?php elseif ( $bptm_p['badges'] ) : ?>
			<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
		<?php endif; ?>
		<?php if ( $bptm_info || ( ! $bptm_p['img'] && $bptm_back ) ) : ?>
			<div class="bptm-ta-info">
				<?php echo $bptm_info; ?>
				<?php if ( ! $bptm_p['img'] ) : ?>
					<div class="bptm-ta-static"><?php echo $bptm_back; ?></div>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</div>
