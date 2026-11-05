<?php
/**
 * Partial: ACF field groups attached to the member.
 *
 * @package BPTM
 *
 * @var array                $m   Member.
 * @var \BPTM\Render\Context $ctx Context.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
if ( ! function_exists( 'acf_get_field_groups' ) || ! function_exists( 'acf_get_fields' ) || ! function_exists( 'get_field' ) ) {
	return;
}

$bptm_groups = acf_get_field_groups(
	array(
		'post_id'   => (int) $m['id'],
		'post_type' => 'bptm_member',
	)
);
if ( empty( $bptm_groups ) ) {
	return;
}

$bptm_flatten = static function ( $v ) {
	if ( is_scalar( $v ) ) {
		return (string) $v;
	}
	if ( is_object( $v ) && isset( $v->post_title ) ) {
		return $v->post_title;
	}
	if ( is_object( $v ) && isset( $v->name ) ) {
		return $v->name;
	}
	return '';
};

foreach ( $bptm_groups as $bptm_group ) {
	$bptm_fields = acf_get_fields( $bptm_group );
	if ( empty( $bptm_fields ) ) {
		continue;
	}
	$bptm_rows = array();
	foreach ( $bptm_fields as $bptm_field ) {
		$bptm_val = get_field( $bptm_field['name'], (int) $m['id'] );
		if ( '' === $bptm_val || null === $bptm_val || false === $bptm_val || array() === $bptm_val ) {
			continue;
		}
		if ( is_array( $bptm_val ) && isset( $bptm_val['url'] ) ) {
			$bptm_text = ! empty( $bptm_val['title'] ) ? $bptm_val['title'] : $bptm_val['url'];
			$bptm_html = '<a href="' . esc_url( $bptm_val['url'] ) . '">' . esc_html( $bptm_text ) . '</a>';
		} elseif ( is_array( $bptm_val ) ) {
			$bptm_html = esc_html( implode( ', ', array_filter( array_map( $bptm_flatten, $bptm_val ) ) ) );
		} elseif ( is_object( $bptm_val ) ) {
			$bptm_html = esc_html( $bptm_flatten( $bptm_val ) );
		} elseif ( 'url' === $bptm_field['type'] ) {
			$bptm_html = '<a href="' . esc_url( $bptm_val ) . '" target="_blank" rel="noopener">' . esc_html( $bptm_val ) . '</a>';
		} elseif ( 'email' === $bptm_field['type'] ) {
			$bptm_html = '<a href="' . esc_url( 'mailto:' . $bptm_val ) . '">' . esc_html( $bptm_val ) . '</a>';
		} else {
			$bptm_html = wp_kses_post( (string) $bptm_val );
		}
		if ( '' === trim( wp_strip_all_tags( $bptm_html ) ) ) {
			continue;
		}
		$bptm_rows[] = array( $bptm_field['label'], $bptm_html, sanitize_html_class( $bptm_field['name'] ) );
	}
	if ( ! $bptm_rows ) {
		continue;
	}
	?>
	<div class="<?php echo $ctx->vis_classes( 'acf_fields', 'bptm-acf' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by vis_classes. ?>">
		<?php if ( ! empty( $bptm_group['title'] ) ) : ?>
			<h4 class="bptm-acf-title"><?php echo esc_html( $bptm_group['title'] ); ?></h4>
		<?php endif; ?>
		<ul class="bptm-meta bptm-meta--list bptm-acf-fields">
			<?php foreach ( $bptm_rows as $bptm_row ) : ?>
				<li class="bptm-meta-item bptm-acf-<?php echo esc_attr( $bptm_row[2] ); ?>">
					<span class="bptm-meta-label"><?php echo esc_html( $bptm_row[0] ); ?></span>
					<span class="bptm-meta-value"><?php echo wp_kses_post( $bptm_row[1] ); ?></span>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
	<?php
}
