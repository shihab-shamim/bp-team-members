<?php
/**
 * Popup detail template "default": one or two columns (popupColumns). Two columns: photo + contact details on the left, name, social, description and skills on the right.
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
$bptm_d = bptm_tb_detail_parts( $ctx, $m, array( 'img', 'name', 'role', 'social_plain', 'desc', 'meta', 'skills' ) );
$bptm_cols = 'one' === bptm_tb_attr( $ctx, 'popupColumns', 'two' ) ? 'one' : 'two';
?>
<div class="<?php echo bptm_tb_detail_classes( $ctx, $m, 'popup', 'default', array( 'bptm-dv--cols-' . $bptm_cols ) ); ?>">
	<?php if ( 'one' === $bptm_cols ) : ?>
		<?php if ( $bptm_d['img'] ) : ?>
			<div class="bptm-dv-media">
				<?php echo $bptm_d['img']; ?>
			</div>
		<?php endif; ?>
		<div class="bptm-dv-body">
			<?php echo $bptm_d['name'] . $bptm_d['role'] . $bptm_d['social_plain'] . $bptm_d['desc'] . $bptm_d['meta'] . $bptm_d['skills'] . $bptm_d['tail']; ?>
		</div>
	<?php else : ?>
		<div class="bptm-dv-side">
			<?php if ( $bptm_d['img'] ) : ?>
				<div class="bptm-dv-media">
					<?php echo $bptm_d['img']; ?>
				</div>
			<?php endif; ?>
			<?php echo $bptm_d['meta']; ?>
		</div>
		<div class="bptm-dv-body">
			<?php echo $bptm_d['name'] . $bptm_d['role'] . $bptm_d['social_plain'] . $bptm_d['desc'] . $bptm_d['skills'] . $bptm_d['tail']; ?>
		</div>
	<?php endif; ?>
</div>
