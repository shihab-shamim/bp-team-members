<?php
/**
 * Public helper API.
 *
 * Team members live in the block (`members` attribute, see docs/ARCHITECTURE.md "v2 data model").
 * bptm_member_from_item() turns one stored item into the member array every theme / popup / panel /
 * drawer template and the render Context work with.
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Interpret a stored option value as boolean.
 *
 * Settings may store toggles as bool, 1/0, '1'/'', 'on'/'off', 'yes'/'no' or 'true'/'false'.
 *
 * @param mixed $value Raw value.
 * @return bool
 */
function bptm_is_on( $value ) {
	if ( is_bool( $value ) ) {
		return $value;
	}
	if ( is_numeric( $value ) ) {
		return (int) $value > 0;
	}
	if ( is_string( $value ) ) {
		return in_array( strtolower( trim( $value ) ), array( 'on', 'yes', 'true', '1' ), true );
	}
	return ! empty( $value );
}

/**
 * Built-in default front-end strings (keys => English).
 *
 * @return array
 */
function bptm_translation_defaults() {
	return array(
		'filter_designation' => __( 'Show All Designation', 'bp-team-member' ),
		'search_name'        => __( 'Search By Name', 'bp-team-member' ),
		'search_company'     => __( 'Search By Company', 'bp-team-member' ),
		'search_zip'         => __( 'Search By Zip', 'bp-team-member' ),
		'search_tag'         => __( 'Search By Tag', 'bp-team-member' ),
		'company'            => __( 'Company', 'bp-team-member' ),
		'address'            => __( 'Address', 'bp-team-member' ),
		'land_phone'         => __( 'Land Phone', 'bp-team-member' ),
		'cell_phone'         => __( 'Cell Phone', 'bp-team-member' ),
		'email'              => __( 'Email', 'bp-team-member' ),
		'zip_code'           => __( 'Zip Code', 'bp-team-member' ),
		'group'              => __( 'Group', 'bp-team-member' ),
		'tag'                => __( 'Tag', 'bp-team-member' ),
		'location'           => __( 'Location', 'bp-team-member' ),
		'language'           => __( 'Language', 'bp-team-member' ),
		'specialty'          => __( 'Specialty', 'bp-team-member' ),
		'gender'             => __( 'Gender', 'bp-team-member' ),
		'extra_one'          => __( 'Extra One', 'bp-team-member' ),
		'extra_two'          => __( 'Extra Two', 'bp-team-member' ),
		'extra_three'        => __( 'Extra Three', 'bp-team-member' ),
		'extra_four'         => __( 'Extra Four', 'bp-team-member' ),
		'extra_five'         => __( 'Extra Five', 'bp-team-member' ),
		'follow_me_on'       => __( 'Follow Me On', 'bp-team-member' ),
		'skills'             => __( 'Skills', 'bp-team-member' ),
		'read_on'            => __( 'Read On', 'bp-team-member' ),
		'more'               => __( 'More', 'bp-team-member' ),
		'vcard'              => __( 'Download vCard', 'bp-team-member' ),
		'reset_filters'      => __( 'Reset Filters', 'bp-team-member' ),
		'prev'               => __( 'Prev', 'bp-team-member' ),
		'next'               => __( 'Next', 'bp-team-member' ),
		'load_more'          => __( 'Load More', 'bp-team-member' ),
		'no_members'         => __( 'No team member found.', 'bp-team-member' ),
	);
}

/**
 * Preference defaults (option 'bptm_settings' without translations).
 *
 * @return array
 */
function bptm_preference_defaults() {
	return array(
		'search_all_fields'    => false,
		'multilingual'         => false,
		'disable_google_fonts' => false,
		'disable_lazy_load'    => false,
		'lazy_load_class'      => 'skip-lazy',
		'land_phone_link'      => false,
		'cell_phone_link'      => false,
		'email_link'           => false,
		'custom_css'           => '',
	);
}

/**
 * All defaults of option 'bptm_settings' (preferences + translations).
 *
 * @return array
 */
function bptm_option_defaults() {
	return array_merge( bptm_preference_defaults(), bptm_translation_defaults() );
}

/**
 * Get a preference (option 'bptm_settings') merged with defaults.
 *
 * Keys of removed preferences (member slug, single page, ACF …) still saved in the option are
 * returned as stored but no code reads them any more.
 *
 * @param string $key     Option key.
 * @param mixed  $default Fallback when neither saved nor default exists.
 * @return mixed
 */
function bptm_get_option( $key, $default = null ) {
	$saved = get_option( 'bptm_settings', array() );
	if ( is_array( $saved ) && array_key_exists( $key, $saved ) ) {
		return $saved[ $key ];
	}
	$defaults = bptm_option_defaults();
	if ( array_key_exists( $key, $defaults ) ) {
		return $defaults[ $key ];
	}
	return $default;
}

/**
 * Replaceable front-end string.
 *
 * Saved values are read from option 'bptm_settings' (either top-level key or a
 * 'translations' sub-array); multilingual mode always uses the translatable default.
 *
 * @param string $key Translation key.
 * @return string
 */
function bptm_translation( $key ) {
	$defaults = bptm_translation_defaults();
	$default  = isset( $defaults[ $key ] ) ? $defaults[ $key ] : '';

	if ( bptm_is_on( bptm_get_option( 'multilingual', false ) ) ) {
		return (string) apply_filters( 'bptm_translation', $default, $key );
	}

	$saved = get_option( 'bptm_settings', array() );
	$value = '';
	if ( is_array( $saved ) ) {
		if ( isset( $saved['translations'][ $key ] ) && is_string( $saved['translations'][ $key ] ) ) {
			$value = $saved['translations'][ $key ];
		} elseif ( isset( $saved[ $key ] ) && is_string( $saved[ $key ] ) ) {
			$value = $saved[ $key ];
		}
	}
	if ( '' === trim( $value ) ) {
		$value = $default;
	}

	return (string) apply_filters( 'bptm_translation', $value, $key );
}

