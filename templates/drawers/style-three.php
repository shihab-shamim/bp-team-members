<?php
/**
 * Drawer detail template "style-three": no photo: name, designation and description left of a rule; contact details, social and skills right.
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
$bptm_d = bptm_tb_detail_parts( $ctx, $m, array( 'meta', 'social', 'skills', 'name', 'role', 'desc' ) );
$bptm_right = $bptm_d['meta'] . $bptm_d['social'] . $bptm_d['skills'] . $bptm_d['tail'];
?>
<div class="<?php echo bptm_tb_detail_classes( $ctx, $m, 'drawer', 'style-three' ); ?>">
	<div class="bptm-dv-body">
		<?php echo $bptm_d['name'] . $bptm_d['role'] . $bptm_d['desc']; ?>
	</div>
	<?php if ( $bptm_right ) : ?>
		<div class="bptm-dv-aside"><?php echo $bptm_right; ?></div>
	<?php endif; ?>
</div>
