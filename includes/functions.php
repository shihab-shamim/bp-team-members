<?php
/**
 * Public helper API (data area).
 *
 * Every function here is part of the data contract in docs/ARCHITECTURE.md and
 * may be called by any other area.
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Member post type name.
 */
if ( ! defined( 'BPTM_POST_TYPE' ) ) {
	define( 'BPTM_POST_TYPE', 'bptm_member' );
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
		'location'           => __( 'Location', 'bp-team-member' ),
		'language'           => __( 'Language', 'bp-team-member' ),
		'specialty'          => __( 'Specialty', 'bp-team-member' ),
		'gender'             => __( 'Gender', 'bp-team-member' ),
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
 * Preference defaults. Uses BPTM\Settings::defaults() when the Settings class exists,
 * otherwise the built-in contract defaults.
 *
 * @return array
 */
function bptm_option_defaults() {
	$builtin = array(
		'member_slug'          => 'team-members',
		'replace_custom_slug'  => false,
		'archive_page_slug'    => '',
		'archive_page_title'   => '',
		'single_page_style'    => 'default',
		'single_link_type'     => 'single_page',
		'next_prev'            => false,
		'breadcrumb'           => false,
		'search_all_fields'    => false,
		'multilingual'         => false,
		'disable_google_fonts' => false,
		'show_acf_fields'      => false,
		'acf_fields_position'  => 'after_skills',
		'disable_lazy_load'    => false,
		'lazy_load_class'      => 'skip-lazy',
		'land_phone_link'      => false,
		'cell_phone_link'      => false,
		'email_link'           => false,
		'custom_css'           => '',
	);
	$builtin = array_merge( $builtin, bptm_translation_defaults() );

	if ( class_exists( '\BPTM\Settings' ) && method_exists( '\BPTM\Settings', 'defaults' ) ) {
		$from_settings = \BPTM\Settings::defaults();
		if ( is_array( $from_settings ) ) {
			$builtin = array_merge( $builtin, $from_settings );
		}
	}

	return $builtin;
}

/**
 * Get a preference (option 'bptm_settings') merged with defaults.
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
 * Taxonomy key => [taxonomy name, default singular, default plural].
 *
 * @return array
 */
function bptm_taxonomy_definitions() {
	return array(
		'group'       => array( 'bptm_group', __( 'Group', 'bp-team-member' ), __( 'Groups', 'bp-team-member' ) ),
		'tag'         => array( 'bptm_tag', __( 'Tag', 'bp-team-member' ), __( 'Tags', 'bp-team-member' ) ),
		'language'    => array( 'bptm_language', __( 'Language', 'bp-team-member' ), __( 'Languages', 'bp-team-member' ) ),
		'location'    => array( 'bptm_location', __( 'Location', 'bp-team-member' ), __( 'Locations', 'bp-team-member' ) ),
		'gender'      => array( 'bptm_gender', __( 'Gender', 'bp-team-member' ), __( 'Genders', 'bp-team-member' ) ),
		'specialty'   => array( 'bptm_specialty', __( 'Specialty', 'bp-team-member' ), __( 'Specialties', 'bp-team-member' ) ),
		'extra_one'   => array( 'bptm_extra_one', __( 'Extra One', 'bp-team-member' ), __( 'Extra One', 'bp-team-member' ) ),
		'extra_two'   => array( 'bptm_extra_two', __( 'Extra Two', 'bp-team-member' ), __( 'Extra Two', 'bp-team-member' ) ),
		'extra_three' => array( 'bptm_extra_three', __( 'Extra Three', 'bp-team-member' ), __( 'Extra Three', 'bp-team-member' ) ),
		'extra_four'  => array( 'bptm_extra_four', __( 'Extra Four', 'bp-team-member' ), __( 'Extra Four', 'bp-team-member' ) ),
		'extra_five'  => array( 'bptm_extra_five', __( 'Extra Five', 'bp-team-member' ), __( 'Extra Five', 'bp-team-member' ) ),
	);
}

/**
 * Taxonomy settings defaults (option 'bptm_taxonomy_settings').
 * Uses BPTM\Settings::taxonomy_defaults() when available.
 *
 * @return array
 */
function bptm_tax_option_defaults() {
	$defaults = array();
	foreach ( bptm_taxonomy_definitions() as $key => $def ) {
		$defaults[ "enable_{$key}_tax" ]         = 0 !== strpos( $key, 'extra_' );
		$defaults[ "{$key}_tax_label" ]          = $def[1];
		$defaults[ "{$key}_tax_plural_label" ]   = $def[2];
		$defaults[ "enable_{$key}_tax_archive" ] = true;
		$defaults[ "{$key}_tax_archive_slug" ]   = 'bptm-' . str_replace( '_', '-', $key );
	}

	if ( class_exists( '\BPTM\Settings' ) && method_exists( '\BPTM\Settings', 'taxonomy_defaults' ) ) {
		$from_settings = \BPTM\Settings::taxonomy_defaults();
		if ( is_array( $from_settings ) ) {
			$defaults = array_merge( $defaults, $from_settings );
		}
	}

	return $defaults;
}

/**
 * Get a taxonomy setting (option 'bptm_taxonomy_settings') merged with defaults.
 * Empty labels / slugs fall back to their defaults. With the "multilingual" preference on,
 * labels always come from the (translatable) defaults.
 *
 * @param string $key     Setting key, e.g. 'enable_group_tax'.
 * @param mixed  $default Fallback.
 * @return mixed
 */
function bptm_get_tax_option( $key, $default = null ) {
	$saved    = get_option( 'bptm_taxonomy_settings', array() );
	$saved    = is_array( $saved ) ? $saved : array();
	$defaults = bptm_tax_option_defaults();

	$is_label = (bool) preg_match( '/_tax(_plural)?_label$/', $key );
	$is_slug  = (bool) preg_match( '/_tax_archive_slug$/', $key );

	if ( $is_label && isset( $defaults[ $key ] ) && bptm_is_on( bptm_get_option( 'multilingual', false ) ) ) {
		return $defaults[ $key ];
	}

	if ( array_key_exists( $key, $saved ) ) {
		$value = $saved[ $key ];
		if ( ( $is_label || $is_slug ) && ( ! is_string( $value ) || '' === trim( $value ) ) && isset( $defaults[ $key ] ) ) {
			return $defaults[ $key ];
		}
		return $value;
	}

	if ( array_key_exists( $key, $defaults ) ) {
		return $defaults[ $key ];
	}

	return $default;
}

/**
 * Normalize an archive page slug: each path segment is sanitized, so a nested slug such as
 * "about/team" stays "about/team" (used for the rewrite rules and for every archive link).
 * Full http(s) URLs are returned as-is (escaped), they point the archive link elsewhere.
 *
 * @param string|null $raw Raw value (null = read the saved preference).
 * @return string '' when empty.
 */
function bptm_archive_page_slug( $raw = null ) {
	$raw = trim( (string) ( null === $raw ? bptm_get_option( 'archive_page_slug', '' ) : $raw ) );
	if ( '' === $raw ) {
		return '';
	}
	if ( preg_match( '#^https?://#i', $raw ) ) {
		return esc_url_raw( $raw );
	}
	$parts = array_filter( array_map( 'sanitize_title', explode( '/', $raw ) ), 'strlen' );
	return implode( '/', $parts );
}

/**
 * All member taxonomies with their current settings.
 *
 * @return array key => ['taxonomy','label','plural','enabled','archive','slug']
 */
function bptm_taxonomies() {
	$out = array();
	foreach ( bptm_taxonomy_definitions() as $key => $def ) {
		$slug = sanitize_title( (string) bptm_get_tax_option( "{$key}_tax_archive_slug" ) );
		if ( '' === $slug ) {
			$slug = 'bptm-' . str_replace( '_', '-', $key );
		}
		$out[ $key ] = array(
			'taxonomy' => $def[0],
			'label'    => (string) bptm_get_tax_option( "{$key}_tax_label", $def[1] ),
			'plural'   => (string) bptm_get_tax_option( "{$key}_tax_plural_label", $def[2] ),
			'enabled'  => bptm_is_on( bptm_get_tax_option( "enable_{$key}_tax" ) ),
			'archive'  => bptm_is_on( bptm_get_tax_option( "enable_{$key}_tax_archive" ) ),
			'slug'     => $slug,
		);
	}
	return apply_filters( 'bptm_taxonomies', $out );
}

/**
 * Enabled taxonomy names (e.g. bptm_group) keyed by taxonomy key.
 *
 * @return array
 */
function bptm_enabled_taxonomy_names() {
	$out = array();
	foreach ( bptm_taxonomies() as $key => $tax ) {
		if ( $tax['enabled'] ) {
			$out[ $key ] = $tax['taxonomy'];
		}
	}
	return $out;
}

/**
 * Whether a taxonomy name belongs to this plugin.
 *
 * @param string $taxonomy Taxonomy name.
 * @return bool
 */
function bptm_is_member_taxonomy( $taxonomy ) {
	foreach ( bptm_taxonomy_definitions() as $def ) {
		if ( $def[0] === $taxonomy ) {
			return true;
		}
	}
	return false;
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
		$value = bptm_get_option( $key, $default );
		$value = is_string( $value ) && '' !== trim( $value ) ? $value : $default;
	}

	return (string) apply_filters( 'bptm_translation', $value, $key );
}

/**
 * Placeholder image URL used when a member has no featured image.
 *
 * @return string
 */
function bptm_placeholder_image_url() {
	return (string) apply_filters( 'bptm_placeholder_image_url', BPTM_URL . 'assets/img/placeholder.svg' );
}

/**
 * Read a member's social links meta in normalized form.
 *
 * @param int $post_id Post ID.
 * @return array
 */
function bptm_get_member_social( $post_id ) {
	$raw = get_post_meta( $post_id, '_bptm_social', true );
	return bptm_sanitize_social( $raw );
}

/**
 * Read a member's skills meta in normalized form.
 *
 * @param int $post_id Post ID.
 * @return array
 */
function bptm_get_member_skills( $post_id ) {
	$raw = get_post_meta( $post_id, '_bptm_skills', true );
	return bptm_sanitize_skills( $raw );
}

/**
 * Sanitize a Font Awesome class string ("fab fa-linkedin-in").
 *
 * @param string $icon Raw icon.
 * @return string
 */
function bptm_sanitize_icon_class( $icon ) {
	$icon    = is_string( $icon ) ? strtolower( $icon ) : '';
	$classes = preg_split( '/\s+/', trim( $icon ) );
	$classes = array_filter( array_map( 'sanitize_html_class', (array) $classes ) );
	return implode( ' ', $classes );
}

/**
 * Sanitize a social link (URL, email or phone).
 *
 * @param string $link Raw link.
 * @param string $icon Icon class (used to guess mailto:/tel:).
 * @return string
 */
function bptm_sanitize_social_link( $link, $icon = '' ) {
	$link = trim( (string) $link );
	if ( '' === $link ) {
		return '';
	}
	if ( is_email( $link ) ) {
		$link = 'mailto:' . $link;
	} elseif ( preg_match( '/^\+?[0-9 ().-]{5,}$/', $link ) && bptm_is_phone_icon( $icon ) ) {
		$link = 'tel:' . preg_replace( '/[^0-9+]/', '', $link );
	}
	$protocols = array_merge( wp_allowed_protocols(), array( 'skype', 'whatsapp', 'viber', 'tg', 'callto' ) );
	return esc_url_raw( $link, array_unique( $protocols ) );
}

/**
 * Whether an icon class is a phone icon (fa-phone, fa-phone-*, fa-square-phone*, fa-mobile*),
 * as opposed to icons that merely contain "phone" (fa-microphone, fa-headphones…).
 *
 * @param string $icon Icon class string.
 * @return bool
 */
function bptm_is_phone_icon( $icon ) {
	return (bool) preg_match( '/(?:^|\s)fa-(?:phone(?:-[a-z0-9-]+)?|square-phone(?:-[a-z0-9-]+)?|mobile(?:-[a-z0-9-]+)?)(?:\s|$)/', strtolower( (string) $icon ) );
}

/**
 * Sanitize social links array.
 *
 * @param mixed $value Raw value: list of {icon, link}.
 * @return array
 */
function bptm_sanitize_social( $value ) {
	if ( is_string( $value ) ) {
		$decoded = json_decode( $value, true );
		$value   = is_array( $decoded ) ? $decoded : maybe_unserialize( $value );
	}
	if ( ! is_array( $value ) ) {
		return array();
	}
	$out = array();
	foreach ( $value as $row ) {
		if ( is_object( $row ) ) {
			$row = (array) $row;
		}
		if ( ! is_array( $row ) ) {
			continue;
		}
		$icon = bptm_sanitize_icon_class( isset( $row['icon'] ) ? $row['icon'] : '' );
		$link = bptm_sanitize_social_link( isset( $row['link'] ) ? $row['link'] : '', $icon );
		if ( '' === $icon || '' === $link ) {
			continue;
		}
		$out[] = array(
			'icon' => $icon,
			'link' => $link,
		);
	}
	return $out;
}

/**
 * Sanitize skills array.
 *
 * @param mixed $value Raw value: list of {skill, percent}.
 * @return array
 */
function bptm_sanitize_skills( $value ) {
	if ( is_string( $value ) ) {
		$decoded = json_decode( $value, true );
		$value   = is_array( $decoded ) ? $decoded : maybe_unserialize( $value );
	}
	if ( ! is_array( $value ) ) {
		return array();
	}
	$out = array();
	foreach ( $value as $row ) {
		if ( is_object( $row ) ) {
			$row = (array) $row;
		}
		if ( ! is_array( $row ) ) {
			continue;
		}
		$skill = sanitize_text_field( isset( $row['skill'] ) ? (string) $row['skill'] : '' );
		if ( '' === $skill ) {
			continue;
		}
		$percent = isset( $row['percent'] ) ? (int) $row['percent'] : 0;
		$out[]   = array(
			'skill'   => $skill,
			'percent' => max( 0, min( 100, $percent ) ),
		);
	}
	return $out;
}

/**
 * Sanitize a list of emails (separated by comma or semicolon). Returns comma-separated valid emails.
 *
 * @param string $value Raw value.
 * @return string
 */
function bptm_sanitize_email_list( $value ) {
	return implode( ',', bptm_parse_email_list( $value ) );
}

/**
 * Split an email list into valid and invalid addresses. Invalid entries are rejected as a
 * whole instead of being "repaired" (sanitize_email() turns "a@x.com?body=x" into "a@x.combodyx").
 *
 * @param string $value   Raw value (addresses separated by comma, semicolon or whitespace).
 * @param array  $invalid Filled with the rejected entries.
 * @return array Valid addresses (unique).
 */
function bptm_parse_email_list( $value, &$invalid = array() ) {
	$invalid = array();
	$parts   = preg_split( '/[;,\s]+/', is_scalar( $value ) ? (string) $value : '', -1, PREG_SPLIT_NO_EMPTY );
	$valid   = array();
	foreach ( (array) $parts as $part ) {
		$part  = trim( $part );
		$email = sanitize_email( $part );
		if ( $email && $email === $part && is_email( $email ) ) {
			$valid[] = $email;
		} elseif ( '' !== $part ) {
			$invalid[] = $part;
		}
	}
	return array_values( array_unique( $valid ) );
}

/**
 * Build the normalized member array.
 *
 * @param int|WP_Post $post       Member post or ID.
 * @param string      $image_size Image size for image_url / flip_image_url.
 * @return array Empty array when the post is not found.
 */
function bptm_get_member( $post, $image_size = 'large' ) {
	static $cache = array();
	static $depth = 0;

	$post = get_post( $post );
	if ( ! $post instanceof WP_Post ) {
		return array();
	}

	$image_size = is_string( $image_size ) && '' !== $image_size ? $image_size : 'large';
	$cache_key  = $post->ID . '|' . $image_size . '|' . $post->post_modified_gmt . '|' . wp_cache_get_last_changed( 'posts' ) . '|' . wp_cache_get_last_changed( 'terms' );
	if ( isset( $cache[ $cache_key ] ) ) {
		return $cache[ $cache_key ];
	}

	$id = (int) $post->ID;

	// Filtered content. Guard against recursion (a member whose content renders a team block).
	if ( $depth > 1 ) {
		$content = wpautop( wp_kses_post( $post->post_content ) );
	} else {
		++$depth;
		$content = apply_filters( 'the_content', $post->post_content ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
		$content = str_replace( ']]>', ']]&gt;', $content );
		--$depth;
	}

	if ( '' !== trim( $post->post_excerpt ) ) {
		$excerpt = $post->post_excerpt;
	} else {
		$excerpt = wp_trim_words( wp_strip_all_tags( strip_shortcodes( excerpt_remove_blocks( $post->post_content ) ) ), 55, '&hellip;' );
	}

	$image_id  = (int) get_post_thumbnail_id( $id );
	$image_url = $image_id ? wp_get_attachment_image_url( $image_id, $image_size ) : '';
	$image_alt = '';
	if ( $image_id ) {
		$image_alt = trim( wp_strip_all_tags( (string) get_post_meta( $image_id, '_wp_attachment_image_alt', true ) ) );
	}
	if ( ! $image_url ) {
		$image_id  = 0;
		$image_url = bptm_placeholder_image_url();
	}
	if ( '' === $image_alt ) {
		$image_alt = get_the_title( $post );
	}

	$flip_id  = (int) get_post_meta( $id, '_bptm_flip_image', true );
	$flip_url = $flip_id ? wp_get_attachment_image_url( $flip_id, $image_size ) : '';
	if ( ! $flip_url ) {
		$flip_id  = 0;
		$flip_url = '';
	}

	$terms = array();
	foreach ( bptm_taxonomies() as $key => $tax ) {
		if ( ! $tax['enabled'] || ! taxonomy_exists( $tax['taxonomy'] ) ) {
			continue;
		}
		$list   = array();
		$objs   = get_the_terms( $id, $tax['taxonomy'] );
		if ( is_array( $objs ) ) {
			foreach ( $objs as $term ) {
				$list[] = array(
					'id'     => (int) $term->term_id,
					'name'   => $term->name,
					'slug'   => $term->slug,
					'parent' => (int) $term->parent,
				);
			}
		}
		$terms[ $key ] = $list;
	}

	$meta = function ( $key ) use ( $id ) {
		$value = get_post_meta( $id, $key, true );
		return is_scalar( $value ) ? (string) $value : '';
	};

	$member = array(
		'id'              => $id,
		'name'            => get_the_title( $post ),
		'slug'            => $post->post_name,
		'permalink'       => get_permalink( $post ),
		'content'         => $content,
		'excerpt'         => $excerpt,
		'designation'     => $meta( '_bptm_designation' ),
		'company'         => $meta( '_bptm_company' ),
		'company_website' => $meta( '_bptm_company_website' ),
		'land_phone'      => $meta( '_bptm_land_phone' ),
		'cell_phone'      => $meta( '_bptm_cell_phone' ),
		'email'           => $meta( '_bptm_email' ),
		'email_cc'        => $meta( '_bptm_email_cc' ),
		'email_bcc'       => $meta( '_bptm_email_bcc' ),
		'address'         => $meta( '_bptm_address' ),
		'ribbon'          => $meta( '_bptm_ribbon' ),
		'zip_code'        => $meta( '_bptm_zip_code' ),
		'vcard'           => $meta( '_bptm_vcard' ),
		'custom_page'     => $meta( '_bptm_custom_page' ),
		'featured'        => '1' === $meta( '_bptm_featured' ),
		'image_id'        => $image_id,
		'image_url'       => (string) $image_url,
		'image_alt'       => $image_alt,
		'flip_image_id'   => $flip_id,
		'flip_image_url'  => (string) $flip_url,
		/**
		 * Filters a member's social links (front end): array of { icon, link }.
		 *
		 * @param array $links   Sanitized links.
		 * @param int   $post_id Member post id.
		 */
		'social'          => bptm_sanitize_social( apply_filters( 'bptm_member_social_links', bptm_get_member_social( $id ), $id ) ),
		/**
		 * Filters a member's skills (front end): array of { skill, percent }.
		 *
		 * @param array $skills  Sanitized skills.
		 * @param int   $post_id Member post id.
		 */
		'skills'          => bptm_sanitize_skills( apply_filters( 'bptm_member_skills', bptm_get_member_skills( $id ), $id ) ),
		'terms'           => $terms,
		'menu_order'      => (int) $post->menu_order,
		'date'            => $post->post_date,
	);

	$member = apply_filters( 'bptm_member', $member, $post, $image_size );

	if ( count( $cache ) > 500 ) {
		$cache = array();
	}
	$cache[ $cache_key ] = $member;

	return $member;
}

/**
 * Term names of a member for a taxonomy key.
 *
 * @param array  $member Member array from bptm_get_member().
 * @param string $key    Taxonomy key (group, tag, location, ...).
 * @param string $sep    Separator.
 * @return string Unescaped names.
 */
function bptm_member_term_names( array $member, $key, $sep = ', ' ) {
	if ( empty( $member['terms'][ $key ] ) || ! is_array( $member['terms'][ $key ] ) ) {
		return '';
	}
	return implode( $sep, wp_list_pluck( $member['terms'][ $key ], 'name' ) );
}

/**
 * Term slugs of a member for a taxonomy key.
 *
 * @param array  $member Member array.
 * @param string $key    Taxonomy key.
 * @return array
 */
function bptm_member_term_slugs( array $member, $key ) {
	if ( empty( $member['terms'][ $key ] ) || ! is_array( $member['terms'][ $key ] ) ) {
		return array();
	}
	return array_values( wp_list_pluck( $member['terms'][ $key ], 'slug' ) );
}

/**
 * Icon picker list: Font Awesome 6 Free class => label (all brand icons + contact-related solid icons).
 *
 * @return array
 */
function bptm_social_icons() {
	static $icons = null;
	if ( null === $icons ) {
		$icons = require BPTM_DIR . 'includes/data/social-icons.php';
		$icons = is_array( $icons ) ? $icons : array();
	}
	return apply_filters( 'bptm_social_icons', $icons );
}

/**
 * Filter (search/filter bar) order configured on the "Sort Order" admin page.
 *
 * Keys: search_name, search_company, search_zip, search_tag, designation, location, language,
 * gender, specialty, extra_one … extra_five.
 *
 * @return array Ordered list of keys.
 */
function bptm_filters_order() {
	$defaults = array_keys( bptm_filter_labels() );
	$saved    = get_option( 'bptm_filters_order', array() );
	$saved    = is_array( $saved ) ? array_values( array_intersect( $saved, $defaults ) ) : array();
	return array_values( array_unique( array_merge( $saved, $defaults ) ) );
}

/**
 * Labels for the sortable filter keys.
 *
 * @return array key => label
 */
function bptm_filter_labels() {
	$tax = bptm_taxonomies();
	return array(
		'search_name'    => bptm_translation( 'search_name' ),
		'search_company' => bptm_translation( 'search_company' ),
		'search_zip'     => bptm_translation( 'search_zip' ),
		'search_tag'     => bptm_translation( 'search_tag' ),
		'designation'    => bptm_translation( 'filter_designation' ),
		'location'       => $tax['location']['label'],
		'language'       => $tax['language']['label'],
		'gender'         => $tax['gender']['label'],
		'specialty'      => $tax['specialty']['label'],
		'extra_one'      => $tax['extra_one']['label'],
		'extra_two'      => $tax['extra_two']['label'],
		'extra_three'    => $tax['extra_three']['label'],
		'extra_four'     => $tax['extra_four']['label'],
		'extra_five'     => $tax['extra_five']['label'],
	);
}

/**
 * ACF field groups/values for a member (empty when ACF is inactive).
 *
 * @param int $post_id Member ID.
 * @return array List of ['title'=>string,'fields'=>[['name','label','type','value'(raw),'html'(safe HTML)]]]
 */
function bptm_member_acf_fields( $post_id ) {
	if ( ! class_exists( '\BPTM\ACF' ) ) {
		return array();
	}
	return \BPTM\ACF::get_member_fields( (int) $post_id );
}
