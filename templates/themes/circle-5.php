<?php
/**
 * Item theme: Circle 5 — round photo in a thick translucent ring; on hover an inner
 * white disc fades in holding the description and social icons.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_p     = bptm_ta_parts( $ctx, $m );
$bptm_hover = $bptm_p['desc'] . $bptm_p['social'];
?>
<div <?php echo $ctx->item_attrs( $m, bptm_ta_classes( $ctx, $m, 'circle-5', 'circle' ) ); ?>>
	<div class="bptm-ta-card">
		<?php if ( $bptm_p['img'] ) : ?>
			<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-ta-media' ); ?>">
				<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-img-wrap' ); ?>">
					<?php echo $bptm_p['img']; ?>
					<span class="bptm-ta-overlay" aria-hidden="true"></span>
					<?php if ( $bptm_hover ) : ?>
						<div class="bptm-ta-hover"><?php echo $bptm_hover; ?></div>
					<?php endif; ?>
				</div>
			</div>
		<?php endif; ?>
		<?php if ( $bptm_p['badges'] ) : ?>
			<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
		<?php endif; ?>
		<div class="bptm-ta-info">
			<?php echo $bptm_p['name'] . $bptm_p['role'] . $bptm_p['extras']; ?>
			<?php if ( ! $bptm_p['img'] && $bptm_hover ) : ?>
				<div class="bptm-ta-static"><?php echo $bptm_hover; ?></div>
			<?php endif; ?>
		</div>
	</div>
</div>
