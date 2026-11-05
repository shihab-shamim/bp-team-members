<?php
/**
 * Partial: generic member card, used when a theme template file is missing.
 *
 * @package BPTM
 *
 * @var array                $m   Member.
 * @var \BPTM\Render\Context $ctx Context.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div <?php echo $ctx->item_attrs( $m, array( 'bptm-item--fallback' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by item_attrs. ?>>
	<div class="bptm-card">
		<?php $bptm_img = $ctx->image( $m ); ?>
		<?php if ( '' !== $bptm_img ) : ?>
			<div class="bptm-img-wrap">
				<?php echo $bptm_img; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php echo $ctx->ribbon( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php echo $ctx->featured_badge( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
		<?php endif; ?>
		<div class="bptm-card-body">
			<?php echo $ctx->name( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php echo $ctx->designation( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php echo $ctx->details( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php echo $ctx->meta_details( $m, 'icons' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php echo $ctx->skills( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php echo $ctx->social( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php echo $ctx->vcard( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php echo $ctx->read_more( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
	</div>
</div>
