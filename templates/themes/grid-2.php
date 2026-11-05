<?php
/**
 * Item theme: Grid 2 — white card whose photo pops out above the top edge;
 * on hover the photo darkens and social icons slide up over it.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_p = bptm_ta_parts( $ctx, $m );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_ta_classes( $ctx, $m, 'grid-2', 'grid' ) ); ?>>
	<div class="bptm-ta-card">
		<?php if ( $bptm_p['img'] ) : ?>
			<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-img-wrap' ); ?>">
				<?php echo $bptm_p['img']; ?>
				<span class="bptm-ta-overlay" aria-hidden="true"></span>
				<?php if ( $bptm_p['social'] ) : ?>
					<div class="bptm-ta-hover"><?php echo $bptm_p['social']; ?></div>
				<?php endif; ?>
				<?php if ( $bptm_p['badges'] ) : ?>
					<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
				<?php endif; ?>
			</div>
		<?php elseif ( $bptm_p['badges'] ) : ?>
			<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
		<?php endif; ?>
		<div class="bptm-ta-info">
			<?php echo $bptm_p['name'] . $bptm_p['role'] . $bptm_p['desc'] . $bptm_p['extras']; ?>
			<?php if ( ! $bptm_p['img'] && $bptm_p['social'] ) : ?>
				<?php echo $bptm_p['social']; ?>
			<?php endif; ?>
		</div>
	</div>
</div>
