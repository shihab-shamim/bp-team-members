<?php
/**
 * Item theme: Grid 1 — round photo, social icons over a scaling overlay,
 * floating info bubble overlapping the bottom-right of the photo.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_p = bptm_ta_parts( $ctx, $m );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_ta_classes( $ctx, $m, 'grid-1', 'grid' ) ); ?>>
	<div class="bptm-ta-card">
		<?php if ( $bptm_p['img'] ) : ?>
			<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-img-wrap' ); ?>">
				<?php echo $bptm_p['img']; ?>
				<span class="bptm-ta-overlay" aria-hidden="true"></span>
				<?php if ( $bptm_p['social'] ) : ?>
					<div class="bptm-ta-hover"><?php echo $bptm_p['social']; ?></div>
				<?php endif; ?>
			</div>
		<?php endif; ?>
		<?php if ( $bptm_p['badges'] ) : ?>
			<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
		<?php endif; ?>
		<div class="bptm-ta-info">
			<?php echo $bptm_p['name'] . $bptm_p['role'] . $bptm_p['desc']; ?>
			<?php if ( ! $bptm_p['img'] && $bptm_p['social'] ) : ?>
				<?php echo $bptm_p['social']; ?>
			<?php endif; ?>
			<?php echo $bptm_p['extras']; ?>
		</div>
	</div>
</div>
