<?php
/**
 * Item theme: Flip 5 — rounded photo card; on hover the photo glides upward while a
 * warm gradient panel slides in from below with a round avatar, the name,
 * designation and any enabled details.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_p      = bptm_ta_parts( $ctx, $m );
$bptm_avatar = bptm_ta_image( $ctx, $m, false );
$bptm_panel  = $bptm_p['name'] . $bptm_p['role'] . $bptm_p['desc'] . $bptm_p['extras'] . $bptm_p['social'];
?>
<div <?php echo $ctx->item_attrs( $m, bptm_ta_classes( $ctx, $m, 'flip-5', 'flip' ) ); ?>>
	<div class="bptm-ta-card">
		<?php if ( $bptm_p['img'] ) : ?>
			<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-img-wrap' ); ?>"><?php echo $bptm_p['img']; ?></div>
		<?php endif; ?>
		<?php if ( $bptm_p['badges'] ) : ?>
			<div class="bptm-ta-badges"><?php echo $bptm_p['badges']; ?></div>
		<?php endif; ?>
		<div class="bptm-ta-info">
			<div class="bptm-ta-info-inner">
				<?php if ( $bptm_avatar ) : ?>
					<div class="bptm-ta-avatar" aria-hidden="true"><?php echo $bptm_avatar; ?></div>
				<?php endif; ?>
				<?php echo $bptm_panel; ?>
			</div>
		</div>
	</div>
</div>
