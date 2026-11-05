<?php
/**
 * Panel detail template "default": dark vertical social strip on the left; name and designation bars, photo, description, contact details and skills on the right.
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
$bptm_d = bptm_tb_detail_parts( $ctx, $m, array( 'social_plain', 'name', 'role', 'img', 'desc', 'meta', 'skills' ) );
?>
<div class="<?php echo bptm_tb_detail_classes( $ctx, $m, 'panel', 'default' ); ?>">
	<?php if ( $bptm_d['social_plain'] ) : ?>
		<div class="bptm-panel-strip"><?php echo $bptm_d['social_plain']; ?></div>
	<?php endif; ?>
	<div class="bptm-panel-main">
		<?php if ( $bptm_d['name'] ) : ?>
			<div class="bptm-panel-titlebar"><?php echo $bptm_d['name']; ?></div>
		<?php endif; ?>
		<?php if ( $bptm_d['role'] ) : ?>
			<div class="bptm-panel-rolebar"><?php echo $bptm_d['role']; ?></div>
		<?php endif; ?>
		<?php if ( $bptm_d['img'] ) : ?>
			<div class="bptm-dv-media">
				<?php echo $bptm_d['img']; ?>
			</div>
		<?php endif; ?>
		<div class="bptm-dv-body">
			<?php echo $bptm_d['desc'] . $bptm_d['meta'] . $bptm_d['skills'] . $bptm_d['tail']; ?>
		</div>
	</div>
</div>
