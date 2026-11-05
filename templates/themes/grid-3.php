<?php
/**
 * Item theme: Grid 3 — soft tinted card, square photo with a floating share
 * button; hovering (or focusing) the card fans the social icons out
 * vertically above it. Info is left aligned below the photo.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_p = bptm_ta_parts( $ctx, $m );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_ta_classes( $ctx, $m, 'grid-3', 'grid' ) ); ?>>
	<div class="bptm-ta-card">
		<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-ta-media' ); ?>">
			<?php if ( $bptm_p['img'] ) : ?>
				<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-img-wrap' ); ?>">
					<?php echo $bptm_p['img']; ?>
					<span class="bptm-ta-overlay" aria-hidden="true"></span>
				</div>
			<?php endif; ?>
			<?php if ( $bptm_p['social'] ) : ?>
				<div class="bptm-ta-share">
					<?php echo $bptm_p['social']; ?>
					<span class="bptm-ta-share-btn" aria-hidden="true"><i class="fas fa-share-alt"></i></span>
				</div>
			<?php endif; ?>
		</div>
		<?php if ( $bptm_p['badges'] ) : ?>
			<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
		<?php endif; ?>
		<div class="bptm-ta-info">
			<?php echo $bptm_p['name'] . $bptm_p['role'] . $bptm_p['desc'] . $bptm_p['extras']; ?>
		</div>
	</div>
</div>
