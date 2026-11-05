<?php
/**
 * Item theme: Sidebar 1-3 — compact row for widget areas: photo on the left, name,
 * designation and small social icons on the right. Variant from $ctx->theme['id'].
 *
 * @package BPTM
 * @var array                $m   Member data (bptm_get_member()).
 * @var \BPTM\Render\Context $ctx Render context.
 */

defined( 'ABSPATH' ) || exit;

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- every fragment is escaped by BPTM\Render\Context.
$bptm_variant = isset( $ctx->theme['id'] ) ? sanitize_html_class( $ctx->theme['id'] ) : 'sidebar-1';
$bptm_img     = $ctx->image( $m, 'bptm-img' );
$bptm_badges  = $ctx->ribbon( $m ) . $ctx->featured_badge( $m );
?>
<div <?php echo $ctx->item_attrs( $m, array( 'bptm-sb', 'bptm-sb-' . $bptm_variant, $bptm_img ? 'bptm-sb-has-img' : 'bptm-sb-no-img' ) ); ?>>
	<div class="bptm-sb-card">
		<?php if ( $bptm_img ) : ?>
			<div class="<?php echo $ctx->vis_classes( 'thumbnail', 'bptm-img-wrap bptm-sb-media' ); ?>">
				<?php echo $bptm_img; ?>
			</div>
		<?php endif; ?>
		<div class="bptm-sb-info">
			<?php
			echo $bptm_badges;
			echo $ctx->name( $m, 'h4' );
			echo $ctx->designation( $m );
			echo $ctx->details( $m );
			echo $ctx->meta_details( $m, 'icons' );
			echo $ctx->skills( $m );
			echo $ctx->social( $m, 'small' );
			echo $ctx->vcard( $m );
			echo $ctx->read_more( $m );
			echo $ctx->acf( $m );
			?>
		</div>
	</div>
</div>
