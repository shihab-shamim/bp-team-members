<?php
/**
 * Panel detail template "style-five": photo, name row with social icons floated to the right, description and skills.
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
$bptm_d = bptm_tb_detail_parts( $ctx, $m, array( 'img', 'name', 'role', 'social_plain', 'desc', 'skills' ) );
?>
<div class="<?php echo bptm_tb_detail_classes( $ctx, $m, 'panel', 'style-five' ); ?>">
	<?php if ( $bptm_d['img'] ) : ?>
		<div class="bptm-dv-media">
			<?php echo $bptm_d['img']; ?>
		</div>
	<?php endif; ?>
	<div class="bptm-dv-body">
		<div class="bptm-dv-head">
			<div class="bptm-dv-head-text"><?php echo $bptm_d['name'] . $bptm_d['role']; ?></div>
			<?php echo $bptm_d['social_plain']; ?>
		</div>
		<?php echo $bptm_d['desc'] . $bptm_d['skills'] . $bptm_d['tail']; ?>
	</div>
</div>
