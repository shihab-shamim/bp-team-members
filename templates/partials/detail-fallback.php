<?php
/**
 * Partial: generic detail view for popup / panel / drawer, used when the style template is missing.
 *
 * @package BPTM
 *
 * @var array                $m   Member.
 * @var \BPTM\Render\Context $ctx Context (group already switched to popup|panel|drawer).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
$bptm_img = $ctx->image( $m, 'bptm-img', false );
?>
<div class="bptm-detail-inner<?php echo '' === $bptm_img ? ' bptm-detail-inner--noimg' : ''; ?>">
	<?php if ( '' !== $bptm_img ) : ?>
		<div class="bptm-detail-media">
			<div class="bptm-img-wrap"><?php echo $bptm_img; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
			<?php echo $ctx->social( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
	<?php endif; ?>
	<div class="bptm-detail-body">
		<?php echo $ctx->name( $m, 'h2' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php echo $ctx->designation( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php echo $ctx->ribbon( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php echo $ctx->details( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php echo $ctx->meta_details( $m, 'list' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php echo $ctx->skills( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php if ( '' === $bptm_img ) : ?>
			<?php echo $ctx->social( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?php endif; ?>
		<?php echo $ctx->vcard( $m ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>
</div>
