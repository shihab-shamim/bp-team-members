<?php
/**
 * Partial: social links.
 *
 * @package BPTM
 *
 * @var array                $m     Member.
 * @var string               $style Modifier.
 * @var \BPTM\Render\Context $ctx   Context.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$bptm_labels = function_exists( 'bptm_social_icons' ) ? bptm_social_icons() : array();
$bptm_items  = array();
foreach ( (array) $m['social'] as $bptm_s ) {
	if ( empty( $bptm_s['icon'] ) ) {
		continue;
	}
	$bptm_href = \BPTM\Render\Context::social_href( $bptm_s );
	if ( '' === $bptm_href ) {
		continue;
	}
	$bptm_icon  = preg_replace( '/[^a-z0-9 _-]/i', '', (string) $bptm_s['icon'] );
	$bptm_label = isset( $bptm_labels[ $bptm_s['icon'] ] ) ? $bptm_labels[ $bptm_s['icon'] ] : ucwords( trim( str_replace( array( 'fa-brands', 'fa-solid', 'fa-regular', 'fab', 'fas', 'far', 'fa-', '-' ), ' ', $bptm_icon ) ) );
	$bptm_slug  = sanitize_html_class( trim( preg_replace( '/\b(fab|fas|far|fa-brands|fa-solid|fa-regular)\b/', '', str_replace( 'fa-', '', $bptm_icon ) ) ) );
	$bptm_items[] = array( $bptm_href, $bptm_icon, $bptm_label, $bptm_slug );
}
if ( ! $bptm_items ) {
	return;
}
$bptm_ext_target = (bool) apply_filters( 'bptm_social_new_tab', true );
?>
<ul class="<?php echo $ctx->vis_classes( 'social', 'bptm-social' . ( $style ? ' bptm-social--' . sanitize_html_class( $style ) : '' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by vis_classes. ?>">
	<?php foreach ( $bptm_items as $bptm_item ) : ?>
		<?php $bptm_is_web = (bool) preg_match( '#^https?://#i', $bptm_item[0] ); ?>
		<li class="bptm-social-item">
			<a class="bptm-social-link bptm-social-<?php echo esc_attr( $bptm_item[3] ); ?>" href="<?php echo esc_url( $bptm_item[0], array( 'http', 'https', 'mailto', 'tel', 'skype', 'callto', 'sms', 'viber', 'whatsapp' ) ); ?>"<?php echo $bptm_is_web && $bptm_ext_target ? ' target="_blank" rel="noopener nofollow"' : ''; ?> itemprop="sameAs" aria-label="<?php echo esc_attr( $bptm_item[2] ); ?>" title="<?php echo esc_attr( $bptm_item[2] ); ?>"><i class="<?php echo esc_attr( $bptm_item[1] ); ?>" aria-hidden="true"></i></a>
		</li>
	<?php endforeach; ?>
</ul>
