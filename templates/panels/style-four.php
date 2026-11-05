<?php
/**
 * Panel detail template "style-four": photo with an accent band carrying name and designation, then description, contact details, social and skills.
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
$bptm_d = bptm_tb_detail_parts( $ctx, $m, array( 'img', 'name', 'role', 'desc', 'meta', 'social', 'skills' ) );
?>
<div class="<?php echo bptm_tb_detail_classes( $ctx, $m, 'panel', 'style-four' ); ?>">
	<?php if ( $bptm_d['img'] ) : ?>
		<div class="bptm-dv-media">
			<?php echo $bptm_d['img']; ?>
		</div>
	<?php endif; ?>
	<?php if ( $bptm_d['name'] || $bptm_d['role'] ) : ?>
		<div class="bptm-panel-band"><?php echo $bptm_d['name'] . $bptm_d['role']; ?></div>
	<?php endif; ?>
	<div class="bptm-dv-body">
		<?php echo $bptm_d['desc'] . $bptm_d['meta'] . $bptm_d['social'] . $bptm_d['skills'] . $bptm_d['tail']; ?>
	</div>
</div>
