<?php
/**
 * Item theme: Grid 5 (default) — rounded photo with a floating white caption card
 * overlapping its lower edge; the card grows on hover to reveal social icons.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_p = bptm_ta_parts( $ctx, $m );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_ta_classes( $ctx, $m, 'grid-5', 'grid' ) ); ?>>
	<div class="bptm-ta-card">
		<?php if ( $bptm_p['img'] ) : ?>
			<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-img-wrap' ); ?>">
				<?php echo $bptm_p['img']; ?>
				<span class="bptm-ta-overlay" aria-hidden="true"></span>
			</div>
		<?php endif; ?>
		<?php if ( $bptm_p['badges'] ) : ?>
			<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
		<?php endif; ?>
		<div class="bptm-ta-info">
			<?php echo $bptm_p['name'] . $bptm_p['role']; ?>
			<?php if ( $bptm_p['desc'] || $bptm_p['social'] || $bptm_p['extras'] ) : ?>
				<div class="bptm-ta-hover"><?php echo $bptm_p['desc'] . $bptm_p['extras'] . $bptm_p['social']; ?></div>
			<?php endif; ?>
		</div>
	</div>
</div>
