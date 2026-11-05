<?php
/**
 * Partial: modal shell for popup / panel, or the inline drawer shell. Frontend JS moves member detail payloads into it.
 *
 * @package BPTM
 *
 * @var string               $type popup | panel | drawer.
 * @var \BPTM\Render\Context $ctx  Context.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$bptm_close = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 1 0-1.4 1.4l4.9 4.9-4.9 4.9a1 1 0 1 0 1.4 1.4l4.9-4.9 4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4z" fill="currentColor"/></svg>';

if ( 'drawer' === $type ) :
	?>
	<div class="bptm-drawer bptm-drawer--<?php echo esc_attr( sanitize_html_class( (string) $ctx->attr( 'drawerStyle', 'default' ) ) ); ?>" data-bptm-for="<?php echo esc_attr( $ctx->uid ); ?>" role="region" aria-label="<?php esc_attr_e( 'Member details', 'bp-team-member' ); ?>" hidden>
		<div class="bptm-drawer-arrow" aria-hidden="true"></div>
		<div class="bptm-drawer-inner">
			<button type="button" class="bptm-modal-close" data-bptm-close aria-label="<?php esc_attr_e( 'Close', 'bp-team-member' ); ?>"><?php echo $bptm_close; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG. ?></button>
			<div class="bptm-modal-content" tabindex="-1"></div>
			<div class="bptm-modal-nav">
				<button type="button" class="bptm-modal-prev" data-bptm-prev aria-label="<?php echo esc_attr( $ctx->t( 'prev' ) ); ?>"><i class="fas fa-angle-left" aria-hidden="true"></i></button>
				<button type="button" class="bptm-modal-next" data-bptm-next aria-label="<?php echo esc_attr( $ctx->t( 'next' ) ); ?>"><i class="fas fa-angle-right" aria-hidden="true"></i></button>
			</div>
		</div>
	</div>
	<?php
	return;
endif;

$bptm_side = 'panel' === $type ? ( 'left' === $ctx->attr( 'panelPosition' ) ? ' bptm-panel-left' : ' bptm-panel-right' ) : '';
?>
<div class="bptm-modal bptm-modal--<?php echo esc_attr( $type . $bptm_side ); ?>" data-bptm-for="<?php echo esc_attr( $ctx->uid ); ?>" hidden>
	<div class="bptm-modal-overlay" data-bptm-close></div>
	<div class="bptm-modal-dialog" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Member details', 'bp-team-member' ); ?>">
		<button type="button" class="bptm-modal-close" data-bptm-close aria-label="<?php esc_attr_e( 'Close', 'bp-team-member' ); ?>"><?php echo $bptm_close; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG. ?></button>
		<div class="bptm-modal-content" tabindex="-1"></div>
		<div class="bptm-modal-nav">
			<button type="button" class="bptm-modal-prev" data-bptm-prev aria-label="<?php echo esc_attr( $ctx->t( 'prev' ) ); ?>"><i class="fas fa-angle-left" aria-hidden="true"></i><span><?php echo esc_html( $ctx->t( 'prev' ) ); ?></span></button>
			<button type="button" class="bptm-modal-next" data-bptm-next aria-label="<?php echo esc_attr( $ctx->t( 'next' ) ); ?>"><span><?php echo esc_html( $ctx->t( 'next' ) ); ?></span><i class="fas fa-angle-right" aria-hidden="true"></i></button>
		</div>
	</div>
</div>
