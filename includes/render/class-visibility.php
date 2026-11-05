<?php
/**
 * Field visibility: per-theme defaults, per-group (card / popup / panel / drawer) and per-device.
 *
 * Accepted shapes for the block attribute `visibility` (all optional, mixed allowed):
 *  - { name: true, email: false }                                   -> card ("initial") group, all devices
 *  - { name: { desktop: true, tablet: true, mobilePortrait: false, mobile: false } } -> per device
 *    (`mobile_landscape` is accepted as an alias of `mobilePortrait`)
 *  - { initial: {...}, popup: {...}, panel: {...}, drawer: {...} }  -> per group, each as above
 *
 * @package BPTM
 */

namespace BPTM\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Visibility helper.
 */
class Visibility {

	const GROUPS  = array( 'initial', 'popup', 'panel', 'drawer' );
	const DEVICES = array( 'desktop', 'tablet', 'mobilePortrait', 'mobile' );

	/**
	 * Fields shown on cards by default when a theme registry entry does not list them.
	 */
	const CORE = array( 'thumbnail', 'name', 'designation', 'details', 'social', 'ribbon', 'featured_badge', 'read_more' );

	/**
	 * All visibility fields => label.
	 *
	 * @return array
	 */
	public static function fields() {
		$tax = function_exists( 'bptm_taxonomies' ) ? bptm_taxonomies() : array();
		$tl  = static function ( $key, $fallback ) use ( $tax ) {
			return isset( $tax[ $key ]['label'] ) && '' !== $tax[ $key ]['label'] ? $tax[ $key ]['label'] : $fallback;
		};
		return array(
			'thumbnail'      => __( 'Thumbnail', 'bp-team-member' ),
			'name'           => __( 'Name', 'bp-team-member' ),
			'designation'    => __( 'Designation', 'bp-team-member' ),
			'details'        => __( 'Details', 'bp-team-member' ),
			'social'         => __( 'Social Links', 'bp-team-member' ),
			'ribbon'         => __( 'Ribbon', 'bp-team-member' ),
			'featured_badge' => __( 'Featured Badge', 'bp-team-member' ),
			'skills'         => __( 'Skills', 'bp-team-member' ),
			'company'        => __( 'Company', 'bp-team-member' ),
			'address'        => __( 'Address', 'bp-team-member' ),
			'land_phone'     => __( 'Land Phone', 'bp-team-member' ),
			'cell_phone'     => __( 'Cell Phone', 'bp-team-member' ),
			'email'          => __( 'Email', 'bp-team-member' ),
			'location'       => $tl( 'location', __( 'Location', 'bp-team-member' ) ),
			'language'       => $tl( 'language', __( 'Language', 'bp-team-member' ) ),
			'specialty'      => $tl( 'specialty', __( 'Specialty', 'bp-team-member' ) ),
			'gender'         => $tl( 'gender', __( 'Gender', 'bp-team-member' ) ),
			'zip'            => __( 'Zip Code', 'bp-team-member' ),
			'extra_one'      => $tl( 'extra_one', __( 'Extra One', 'bp-team-member' ) ),
			'extra_two'      => $tl( 'extra_two', __( 'Extra Two', 'bp-team-member' ) ),
			'extra_three'    => $tl( 'extra_three', __( 'Extra Three', 'bp-team-member' ) ),
			'extra_four'     => $tl( 'extra_four', __( 'Extra Four', 'bp-team-member' ) ),
			'extra_five'     => $tl( 'extra_five', __( 'Extra Five', 'bp-team-member' ) ),
			'acf_fields'     => __( 'ACF Fields', 'bp-team-member' ),
			'vcard'          => __( 'vCard', 'bp-team-member' ),
			'read_more'      => __( 'Read More', 'bp-team-member' ),
		);
	}

	/**
	 * Field keys.
	 *
	 * @return string[]
	 */
	public static function keys() {
		return array_keys( self::fields() );
	}

	/**
	 * Default visibility per group (booleans) for a theme.
	 *
	 * @param string $theme Theme id.
	 * @return array group => field => bool
	 */
	public static function defaults( $theme ) {
		$def  = Themes::get( $theme );
		$keys = self::keys();
		$reg  = isset( $def['visibility'] ) && is_array( $def['visibility'] ) ? $def['visibility'] : array();

		$initial = array();
		foreach ( $keys as $key ) {
			$initial[ $key ] = in_array( $key, self::CORE, true );
		}
		// Registry entries may be field => bool or a plain list of visible fields.
		foreach ( $reg as $k => $v ) {
			if ( is_int( $k ) && is_string( $v ) ) {
				$initial[ $v ] = true;
			} elseif ( is_string( $k ) ) {
				$initial[ $k ] = (bool) $v;
			}
		}

		$overlay = array_fill_keys( $keys, true );
		$overlay['read_more'] = false;

		$out = array(
			'initial' => $initial,
			'popup'   => $overlay,
			'panel'   => $overlay,
			'drawer'  => $overlay,
		);
		return apply_filters( 'bptm_visibility_defaults', $out, $theme );
	}

	/**
	 * Normalise one field value into a device map.
	 *
	 * @param mixed $value Raw value.
	 * @param bool  $fallback Fallback.
	 * @return array device => bool
	 */
	private static function device_map( $value, $fallback ) {
		if ( is_array( $value ) ) {
			if ( isset( $value['mobile_landscape'] ) && ! isset( $value['mobilePortrait'] ) ) {
				$value['mobilePortrait'] = $value['mobile_landscape'];
			}
			$out = array();
			foreach ( self::DEVICES as $d ) {
				$out[ $d ] = isset( $value[ $d ] ) ? rest_sanitize_boolean( $value[ $d ] ) : $fallback;
			}
			return $out;
		}
		if ( null === $value ) {
			return array_fill_keys( self::DEVICES, (bool) $fallback );
		}
		return array_fill_keys( self::DEVICES, rest_sanitize_boolean( $value ) );
	}

	/**
	 * Resolve the attribute against the theme defaults.
	 *
	 * @param mixed  $attr  Attribute value.
	 * @param string $theme Theme id.
	 * @return array group => field => device => bool
	 */
	public static function resolve( $attr, $theme ) {
		$defaults = self::defaults( $theme );
		$attr     = is_array( $attr ) ? $attr : array();

		$grouped = array();
		foreach ( self::GROUPS as $g ) {
			if ( isset( $attr[ $g ] ) && is_array( $attr[ $g ] ) ) {
				$grouped[ $g ] = $attr[ $g ];
			}
		}
		// Flat keys belong to the card group.
		foreach ( $attr as $k => $v ) {
			if ( ! in_array( $k, self::GROUPS, true ) ) {
				$grouped['initial'][ $k ] = $v;
			}
		}

		$out = array();
		foreach ( self::GROUPS as $g ) {
			foreach ( $defaults[ $g ] as $field => $def ) {
				$raw                   = isset( $grouped[ $g ][ $field ] ) ? $grouped[ $g ][ $field ] : null;
				$out[ $g ][ $field ] = self::device_map( $raw, (bool) $def );
			}
		}
		return $out;
	}

	/**
	 * Visible on at least one device?
	 *
	 * @param array $map device map.
	 * @return bool
	 */
	public static function any( $map ) {
		return is_array( $map ) && in_array( true, $map, true );
	}

	/**
	 * Hide classes for devices where the field is off.
	 *
	 * @param array $map device map.
	 * @return string
	 */
	public static function classes( $map ) {
		if ( ! is_array( $map ) ) {
			return '';
		}
		$cls = array(
			'desktop'        => 'bptm-hide-desktop',
			'tablet'         => 'bptm-hide-tablet',
			'mobilePortrait' => 'bptm-hide-mobile-portrait',
			'mobile'         => 'bptm-hide-mobile',
		);
		$out = array();
		foreach ( $cls as $d => $c ) {
			if ( isset( $map[ $d ] ) && ! $map[ $d ] ) {
				$out[] = $c;
			}
		}
		return implode( ' ', $out );
	}
}
