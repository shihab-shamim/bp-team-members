<?php
/**
 * Item theme: Grid Filter with vCard — photo, bold name, designation, phone and email lines and a full-width vCard download button; filter bar on top.
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by the bptm_tb_* helpers / Context.
$bptm_img    = bptm_tb_image( $ctx, $m, true, true );
$bptm_fields = array( 'cell_phone', 'email' );
$bptm_vcard  = bptm_tb_part( $ctx, $m, 'vcard' );
?>
<div <?php echo $ctx->item_attrs( $m, bptm_tb_classes( $ctx, $m, 'grid-filter-vcard', 'legacy' ) ); ?>>
	<div class="bptm-tb-card">
		<?php if ( $bptm_img ) : ?>
			<div class="bptm-img-wrap bptm-tb-media">
				<?php echo $bptm_img . bptm_tb_badges( $ctx, $m ); ?>
			</div>
		<?php endif; ?>
		<div class="bptm-tb-info">
			<?php
			if ( ! $bptm_img ) {
				echo bptm_tb_badges( $ctx, $m );
			}
			echo bptm_tb_part( $ctx, $m, 'name', 'h3' );
			echo bptm_tb_part( $ctx, $m, 'designation' );
			echo bptm_tb_contacts( $ctx, $m, $bptm_fields, 'bptm-contacts bptm-tb-contacts' );
			echo bptm_tb_part( $ctx, $m, 'details' );
			echo bptm_tb_part( $ctx, $m, 'social' );
			echo bptm_tb_extras( $ctx, $m, array_merge( $bptm_fields, array( 'vcard' ) ) );
			if ( $bptm_vcard ) {
				echo '<div class="bptm-tb-vcard">' . $bptm_vcard . '</div>';
			}
			?>
		</div>
	</div>
</div>
