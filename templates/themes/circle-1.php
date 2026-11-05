<?php
/**
 * Item theme: Circle 1 — round photo that zooms gently on hover, centred
 * name / designation / description and a row of round social icons below.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_p     = bptm_ta_parts( $ctx, $m );
$bptm_hover = ''; // Circle 1 keeps every part below the photo; the overlay is purely visual.
?>
<div <?php echo $ctx->item_attrs( $m, bptm_ta_classes( $ctx, $m, 'circle-1', 'circle' ) ); ?>>
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
			<?php echo $bptm_p['name'] . $bptm_p['role'] . $bptm_p['desc'] . $bptm_p['extras'] . $bptm_p['social']; ?>
			<?php if ( ! $bptm_p['img'] && $bptm_hover ) : ?>
				<div class="bptm-ta-static"><?php echo $bptm_hover; ?></div>
			<?php endif; ?>
		</div>
	</div>
</div>
