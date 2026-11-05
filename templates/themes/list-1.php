<?php
/**
 * Item theme: List 1 — bordered card, rounded-corner photo on the left, round social icons; tints on hover.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by the bptm_tb_* helpers / Context.
$bptm_contact_fields = array();
$bptm_img            = bptm_tb_image( $ctx, $m, true, true );
$bptm_badges         = bptm_tb_badges( $ctx, $m );
$bptm_contacts       = bptm_tb_contacts( $ctx, $m, $bptm_contact_fields, 'bptm-contacts bptm-tb-contacts' );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_tb_classes( $ctx, $m, 'list-1', 'list' ) ); ?>>
	<div class="bptm-tb-card">
		<?php if ( $bptm_img ) : ?>
			<div class="bptm-img-wrap bptm-tb-media">
				<?php echo $bptm_img . $bptm_badges; ?>
			</div>
		<?php endif; ?>
		<div class="bptm-tb-info">
			<?php
			if ( ! $bptm_img ) {
				echo $bptm_badges;
			}
			echo bptm_tb_part( $ctx, $m, 'name', 'h3' );
			echo bptm_tb_part( $ctx, $m, 'designation' );
			echo bptm_tb_part( $ctx, $m, 'details' );
			echo $bptm_contacts;
			echo bptm_tb_part( $ctx, $m, 'social' );
			echo bptm_tb_extras( $ctx, $m, $bptm_contact_fields );
			?>
		</div>
	</div>
</div>
