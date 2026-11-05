<?php
/**
 * Item theme: Grid 6 — clean full-bleed photo; on hover a frosted white veil fades in
 * with the name, designation and social icons centred over the photo.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_p = bptm_ta_parts( $ctx, $m );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_ta_classes( $ctx, $m, 'grid-6', 'grid' ) ); ?>>
	<div class="bptm-ta-card">
		<?php if ( $bptm_p['img'] ) : ?>
			<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-img-wrap' ); ?>">
				<?php echo $bptm_p['img']; ?>
			</div>
		<?php endif; ?>
		<?php if ( $bptm_p['badges'] ) : ?>
			<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
		<?php endif; ?>
		<div class="bptm-ta-info">
			<div class="bptm-ta-info-inner">
				<?php echo $bptm_p['name'] . $bptm_p['role'] . $bptm_p['desc'] . $bptm_p['extras'] . $bptm_p['social']; ?>
			</div>
		</div>
	</div>
</div>
