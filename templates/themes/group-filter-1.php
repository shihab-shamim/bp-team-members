<?php
/**
 * Item theme: Group Filter 1 — banner cards (as Grid Filter Single) listed under their group headings, with the group filter on top.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by the bptm_tb_* helpers / Context.
$bptm_img     = bptm_tb_image( $ctx, $m, true, true );
$bptm_caption = bptm_tb_part( $ctx, $m, 'name', 'h3' ) . bptm_tb_part( $ctx, $m, 'designation' );
$bptm_fields  = array( 'cell_phone', 'email' );
$bptm_box     = bptm_tb_contacts( $ctx, $m, $bptm_fields, 'bptm-contacts bptm-tb-contact-box' );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_tb_classes( $ctx, $m, 'group-filter-1', 'legacy', array( 'bptm-tb-banner-card' ) ) ); ?>>
	<div class="bptm-tb-card">
		<div class="bptm-img-wrap bptm-tb-media">
			<?php echo $bptm_img . bptm_tb_badges( $ctx, $m ); ?>
			<?php if ( $bptm_caption ) : ?>
				<div class="bptm-tb-caption"><?php echo $bptm_caption; ?></div>
			<?php endif; ?>
		</div>
		<?php
		echo $bptm_box;
		echo bptm_tb_part( $ctx, $m, 'details' );
		echo bptm_tb_part( $ctx, $m, 'social' );
		echo bptm_tb_extras( $ctx, $m, $bptm_fields );
		?>
	</div>
</div>
