<?php
/**
 * Popup detail template "style-one": square rounded photo (30%) beside name, description, social, contact details.
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
$bptm_d = bptm_tb_detail_parts( $ctx, $m, array( 'img', 'badges', 'name', 'role', 'desc', 'social', 'meta', 'skills' ) );
?>
<div class="<?php echo bptm_tb_detail_classes( $ctx, $m, 'popup', 'style-one' ); ?>">
	<div class="bptm-dv-side">
		<?php if ( $bptm_d['img'] ) : ?>
			<div class="bptm-dv-media">
				<?php echo $bptm_d['img'] . $bptm_d['badges']; ?>
			</div>
		<?php endif; ?>
	</div>
	<div class="bptm-dv-body">
		<?php echo $bptm_d['name'] . $bptm_d['role'] . $bptm_d['desc'] . $bptm_d['social'] . $bptm_d['meta'] . $bptm_d['skills'] . $bptm_d['tail']; ?>
	</div>
</div>
