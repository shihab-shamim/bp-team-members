<?php
/**
 * Drawer detail template "default": text-only: name, designation and description left of a rule; social and skills right.
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
$bptm_d = bptm_tb_detail_parts( $ctx, $m, array( 'img', 'badges', 'name', 'role', 'desc', 'meta', 'social_plain', 'skills' ) );
$bptm_right = $bptm_d['meta'] . $bptm_d['social_plain'] . $bptm_d['skills'] . $bptm_d['tail'];
// Small round avatar beside the name (the grid card above already shows the large photo).
$bptm_ident = $bptm_d['img'] ? '<div class="bptm-dv-ident">' . $bptm_d['img'] . '<div class="bptm-dv-ident-text">' . $bptm_d['badges_block'] . $bptm_d['name'] . $bptm_d['role'] . '</div></div>' : $bptm_d['name'] . $bptm_d['role'];
?>
<div class="<?php echo bptm_tb_detail_classes( $ctx, $m, 'drawer', 'default' ); ?>">
	<div class="bptm-dv-body">
		<?php echo $bptm_ident . $bptm_d['desc']; ?>
	</div>
	<?php if ( $bptm_right ) : ?>
		<div class="bptm-dv-aside"><?php echo $bptm_right; ?></div>
	<?php endif; ?>
</div>
