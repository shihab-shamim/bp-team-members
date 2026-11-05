<?php
/**
 * Advanced Custom Fields support: collect a member's ACF field groups/values for display.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * ACF helper.
 */
class ACF {

	/**
	 * Is ACF (free or PRO) active?
	 *
	 * @return bool
	 */
	public static function is_active() {
		return function_exists( 'acf_get_field_groups' ) && function_exists( 'acf_get_fields' ) && function_exists( 'get_field' );
	}

	/**
	 * Field groups with non-empty values for a member.
	 *
	 * @param int $post_id Member ID.
	 * @return array List of ['key','title','fields'=>[['key','name','label','type','value','html']]].
	 */
	public static function get_member_fields( $post_id ) {
		static $cache = array();

		$post_id = (int) $post_id;
		if ( ! $post_id || ! self::is_active() ) {
			return array();
		}
		if ( isset( $cache[ $post_id ] ) ) {
			return $cache[ $post_id ];
		}

		$groups = acf_get_field_groups(
			array(
				'post_id'   => $post_id,
				'post_type' => CPT::POST_TYPE,
			)
		);

		$out = array();
		foreach ( (array) $groups as $group ) {
			if ( empty( $group ) || ( isset( $group['active'] ) && ! $group['active'] ) ) {
				continue;
			}
			$fields = acf_get_fields( $group );
			if ( empty( $fields ) ) {
				continue;
			}
			$items = array();
			foreach ( $fields as $field ) {
				if ( empty( $field['name'] ) || in_array( $field['type'], array( 'tab', 'message', 'accordion' ), true ) ) {
					continue;
				}
				$value = get_field( $field['name'], $post_id );
				if ( self::is_empty( $value ) ) {
					continue;
				}
				$html = self::format( $value, $field );
				if ( '' === trim( wp_strip_all_tags( $html, true ) ) && false === strpos( $html, '<img' ) ) {
					continue;
				}
				$items[] = array(
					'key'   => isset( $field['key'] ) ? (string) $field['key'] : '',
					'name'  => (string) $field['name'],
					'label' => isset( $field['label'] ) ? (string) $field['label'] : (string) $field['name'],
					'type'  => (string) $field['type'],
					'value' => $value,
					'html'  => $html,
				);
			}
			if ( $items ) {
				$out[] = array(
					'key'    => isset( $group['key'] ) ? (string) $group['key'] : '',
					'title'  => isset( $group['title'] ) ? (string) $group['title'] : '',
					'fields' => $items,
				);
			}
		}

		$out               = apply_filters( 'bptm_acf_fields', $out, $post_id );
		$cache[ $post_id ] = $out;
		return $out;
	}

	/**
	 * Empty check that keeps "0".
	 *
	 * @param mixed $value Value.
	 * @return bool
	 */
	private static function is_empty( $value ) {
		if ( is_array( $value ) ) {
			return empty( array_filter( $value, array( __CLASS__, 'not_empty' ) ) );
		}
		return null === $value || false === $value || '' === $value;
	}

	/**
	 * Inverse helper for array_filter.
	 *
	 * @param mixed $v Value.
	 * @return bool
	 */
	private static function not_empty( $v ) {
		return ! self::is_empty( $v );
	}

	/**
	 * Format a value as safe HTML.
	 *
	 * @param mixed $value Value from get_field().
	 * @param array $field Field definition.
	 * @return string
	 */
	public static function format( $value, array $field ) {
		$type = isset( $field['type'] ) ? $field['type'] : 'text';

		switch ( $type ) {
			case 'image':
				$id = is_array( $value ) ? ( isset( $value['ID'] ) ? (int) $value['ID'] : 0 ) : ( is_numeric( $value ) ? (int) $value : 0 );
				if ( $id ) {
					return wp_get_attachment_image( $id, 'medium', false, array( 'class' => 'bptm-acf-image' ) );
				}
				if ( is_string( $value ) && wp_http_validate_url( $value ) ) {
					return '<img class="bptm-acf-image" src="' . esc_url( $value ) . '" alt="" />';
				}
				return '';

			case 'gallery':
				$html = '';
				foreach ( (array) $value as $img ) {
					$id = is_array( $img ) ? ( isset( $img['ID'] ) ? (int) $img['ID'] : 0 ) : (int) $img;
					if ( $id ) {
						$html .= wp_get_attachment_image( $id, 'thumbnail', false, array( 'class' => 'bptm-acf-image' ) );
					}
				}
				return $html;

			case 'file':
				$url  = is_array( $value ) ? ( isset( $value['url'] ) ? $value['url'] : '' ) : ( is_numeric( $value ) ? wp_get_attachment_url( (int) $value ) : (string) $value );
				$name = is_array( $value ) && ! empty( $value['title'] ) ? $value['title'] : basename( (string) $url );
				return $url ? '<a href="' . esc_url( $url ) . '" target="_blank" rel="noopener">' . esc_html( $name ) . '</a>' : '';

			case 'url':
				return '<a href="' . esc_url( (string) $value ) . '" target="_blank" rel="noopener">' . esc_html( (string) $value ) . '</a>';

			case 'email':
				return '<a href="' . esc_url( 'mailto:' . antispambot( (string) $value ) ) . '">' . esc_html( antispambot( (string) $value ) ) . '</a>';

			case 'link':
				if ( is_array( $value ) ) {
					$url    = isset( $value['url'] ) ? $value['url'] : '';
					$title  = ! empty( $value['title'] ) ? $value['title'] : $url;
					$target = ! empty( $value['target'] ) ? ' target="' . esc_attr( $value['target'] ) . '" rel="noopener"' : '';
					return $url ? '<a href="' . esc_url( $url ) . '"' . $target . '>' . esc_html( $title ) . '</a>' : '';
				}
				return '<a href="' . esc_url( (string) $value ) . '">' . esc_html( (string) $value ) . '</a>';

			case 'true_false':
				return $value ? esc_html__( 'Yes', 'bp-team-member' ) : esc_html__( 'No', 'bp-team-member' );

			case 'wysiwyg':
			case 'oembed':
				return wp_kses_post( (string) $value );

			case 'textarea':
				return nl2br( esc_html( (string) $value ) );

			case 'color_picker':
				$c = sanitize_hex_color( (string) $value );
				return $c ? '<span class="bptm-acf-color" style="display:inline-block;width:1em;height:1em;vertical-align:middle;background:' . esc_attr( $c ) . '"></span> ' . esc_html( $c ) : esc_html( (string) $value );

			case 'post_object':
			case 'relationship':
			case 'page_link':
				$links = array();
				foreach ( is_array( $value ) && ! isset( $value['ID'] ) ? $value : array( $value ) as $p ) {
					if ( is_string( $p ) && wp_http_validate_url( $p ) ) {
						$links[] = '<a href="' . esc_url( $p ) . '">' . esc_html( $p ) . '</a>';
						continue;
					}
					$p = get_post( $p );
					if ( $p ) {
						$links[] = '<a href="' . esc_url( get_permalink( $p ) ) . '">' . esc_html( get_the_title( $p ) ) . '</a>';
					}
				}
				return implode( ', ', $links );

			case 'taxonomy':
				$names = array();
				foreach ( (array) $value as $t ) {
					$t = is_object( $t ) ? $t : get_term( (int) $t );
					if ( $t && ! is_wp_error( $t ) ) {
						$names[] = esc_html( $t->name );
					}
				}
				return implode( ', ', $names );

			case 'user':
				$names = array();
				foreach ( is_array( $value ) && ! isset( $value['ID'] ) ? $value : array( $value ) as $u ) {
					$id = is_array( $u ) ? ( isset( $u['ID'] ) ? (int) $u['ID'] : 0 ) : ( is_object( $u ) ? (int) $u->ID : (int) $u );
					$ud = $id ? get_userdata( $id ) : false;
					if ( $ud ) {
						$names[] = esc_html( $ud->display_name );
					}
				}
				return implode( ', ', $names );

			case 'select':
			case 'checkbox':
			case 'radio':
			case 'button_group':
				$labels = array();
				foreach ( (array) $value as $v ) {
					if ( is_array( $v ) ) {
						$v = isset( $v['label'] ) ? $v['label'] : ( isset( $v['value'] ) ? $v['value'] : '' );
					} elseif ( isset( $field['choices'][ $v ] ) ) {
						$v = $field['choices'][ $v ];
					}
					if ( is_scalar( $v ) && '' !== (string) $v ) {
						$labels[] = esc_html( (string) $v );
					}
				}
				return implode( ', ', $labels );

			case 'google_map':
				return is_array( $value ) && ! empty( $value['address'] ) ? esc_html( $value['address'] ) : '';
		}

		if ( is_scalar( $value ) ) {
			return wp_kses_post( (string) $value );
		}
		if ( is_array( $value ) ) {
			$flat = array();
			array_walk_recursive(
				$value,
				function ( $v ) use ( &$flat ) {
					if ( is_scalar( $v ) && '' !== (string) $v ) {
						$flat[] = esc_html( (string) $v );
					}
				}
			);
			return implode( ', ', $flat );
		}
		return '';
	}
}
