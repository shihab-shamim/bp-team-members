<?php
/**
 * Drawer detail template "style-five": round photo left; name and description, then a split footer with contact + social and skills.
 *
 * Renders the detail view of one member. The surrounding shell (overlay, close,
 * next / prev, positioning) is printed by the render area.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by the bptm_tb_* helpers / Context.
$bptm_d = bptm_tb_detail_parts( $ctx, $m, array( 'meta', 'social', 'skills', 'img', 'name', 'role', 'desc' ) );
$bptm_left  = $bptm_d['meta'] . $bptm_d['social'];
$bptm_right = $bptm_d['skills'] . $bptm_d['tail'];
?>
<div class="<?php echo bptm_tb_detail_classes( $ctx, $m, 'drawer', 'style-five' ); ?>">
	<div class="bptm-dv-side">
		<?php if ( $bptm_d['img'] ) : ?>
			<div class="bptm-dv-media">
				<?php echo $bptm_d['img']; ?>
			</div>
		<?php endif; ?>
	</div>
	<div class="bptm-dv-body">
		<div class="bptm-dv-top">
			<?php echo $bptm_d['name'] . $bptm_d['role'] . $bptm_d['desc']; ?>
		</div>
		<?php if ( $bptm_left || $bptm_right ) : ?>
			<div class="bptm-dv-split">
				<?php if ( $bptm_left ) : ?>
					<div class="bptm-dv-split-col"><?php echo $bptm_left; ?></div>
				<?php endif; ?>
				<?php if ( $bptm_right ) : ?>
					<div class="bptm-dv-split-col"><?php echo $bptm_right; ?></div>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</div>
