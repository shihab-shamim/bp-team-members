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

/**
 * Placeholder image URL used when a member has no image.
 *
 * @return string
 */
function bptm_placeholder_image_url() {
	return (string) apply_filters( 'bptm_placeholder_image_url', BPTM_URL . 'assets/img/placeholder.svg' );
}

/**
 * Sanitize a Font Awesome class string ("fab fa-linkedin-in"). Only Font Awesome style classes
 * (fa, fab, fas, far, fa-brands, fa-solid, fa-regular) and `fa-{name}` icon classes are kept;
 * anything else drops the whole value.
 *
 * @param string $icon Raw icon.
 * @return string '' when invalid.
 */
function bptm_sanitize_icon_class( $icon ) {
	$icon    = is_string( $icon ) ? strtolower( trim( $icon ) ) : '';
	$classes = preg_split( '/\s+/', $icon, -1, PREG_SPLIT_NO_EMPTY );
	$out     = array();
	$has_ico = false;
	foreach ( (array) $classes as $class ) {
		if ( in_array( $class, array( 'fa', 'fab', 'fas', 'far', 'fa-brands', 'fa-solid', 'fa-regular' ), true ) ) {
			$out[] = $class;
		} elseif ( preg_match( '/^fa-[a-z0-9]+(?:-[a-z0-9]+)*$/', $class ) ) {
			$out[]   = $class;
			$has_ico = true;
		} else {
			return '';
		}
	}
	return $has_ico ? implode( ' ', array_unique( $out ) ) : '';
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
		$value   = is_array( $decoded ) ? $decoded : array();
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
		$link = bptm_sanitize_social_link( isset( $row['link'] ) && is_scalar( $row['link'] ) ? $row['link'] : '', $icon );
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
		$value   = is_array( $decoded ) ? $decoded : array();
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
		$skill = sanitize_text_field( isset( $row['skill'] ) && is_scalar( $row['skill'] ) ? (string) $row['skill'] : '' );
		if ( '' === $skill ) {
			continue;
		}
		$percent = isset( $row['percent'] ) && is_numeric( $row['percent'] ) ? (int) round( (float) $row['percent'] ) : 0;
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
 * Item text fields (block `members` attribute) that hold comma-separated "term" values,
 * mapped to the member array's `terms` keys.
 *
 * @return array item field => term key
 */
function bptm_term_fields() {
	return array(
		'group'      => 'group',
		'tags'       => 'tag',
		'language'   => 'language',
		'location'   => 'location',
		'gender'     => 'gender',
		'specialty'  => 'specialty',
		'extraOne'   => 'extra_one',
		'extraTwo'   => 'extra_two',
		'extraThree' => 'extra_three',
		'extraFour'  => 'extra_four',
		'extraFive'  => 'extra_five',
	);
}

/**
 * Term keys (group, tag, location, …, extra_five).
 *
 * @return string[]
 */
function bptm_term_keys() {
	return array_values( bptm_term_fields() );
}

/**
 * Front-end label of a term key (from Translations).
 *
 * @param string $key Term key (group, tag, location, …).
 * @return string
 */
function bptm_term_label( $key ) {
	$label = bptm_translation( $key );
	return '' !== $label ? $label : ucwords( str_replace( '_', ' ', (string) $key ) );
}

/**
 * Stable filter slug of a term value ("Product Design" => "product-design"); values that sanitize
 * to nothing (e.g. only punctuation) get a hash-based slug.
 *
 * @param string $name Term name.
 * @return string
 */
function bptm_term_slug( $name ) {
	$name = (string) $name;
	$slug = sanitize_title( $name );
	if ( '' === $slug && '' !== trim( $name ) ) {
		$slug = 'v-' . substr( md5( $name ), 0, 8 );
	}
	return $slug;
}

/**
 * Split a comma-separated text value into term arrays.
 *
 * @param mixed $value Raw value (string; arrays of strings are accepted too).
 * @return array List of ['id' => slug, 'name' => .., 'slug' => .., 'parent' => 0].
 */
function bptm_split_terms( $value ) {
	if ( is_array( $value ) ) {
		$value = implode( ',', array_filter( $value, 'is_scalar' ) );
	}
	if ( ! is_scalar( $value ) ) {
		return array();
	}
	$out = array();
	foreach ( explode( ',', (string) $value ) as $part ) {
		$name = sanitize_text_field( $part );
		if ( '' === $name ) {
			continue;
		}
		$slug = bptm_term_slug( $name );
		if ( isset( $out[ $slug ] ) ) {
			continue;
		}
		$out[ $slug ] = array(
			'id'     => $slug,
			'name'   => $name,
			'slug'   => $slug,
			'parent' => 0,
		);
	}
	return array_values( $out );
}

/**
 * Sanitize a member item id: [A-Za-z0-9_-], max 64 chars.
 *
 * @param mixed $id Raw id.
 * @return string '' when nothing is left.
 */
function bptm_sanitize_item_id( $id ) {
	if ( ! is_scalar( $id ) ) {
		return '';
	}
	return substr( (string) preg_replace( '/[^A-Za-z0-9_-]/', '', (string) $id ), 0, 64 );
}

/**
 * Resolve a member image ({id, url, alt}) for an image size.
 *
 * Attachment ids win (wp_get_attachment_image_src() with $size, falling back to the stored url).
 * URLs without a scheme and without a leading "/" are relative to the plugin root (BPTM_URL).
 *
 * @param mixed  $image Raw image value.
 * @param string $size  Image size.
 * @return array ['id' => int, 'url' => string, 'alt' => string] ('' url when none).
 */
function bptm_resolve_image( $image, $size = 'large' ) {
	$image = is_array( $image ) ? $image : array();
	$id    = isset( $image['id'] ) && is_numeric( $image['id'] ) ? absint( $image['id'] ) : 0;
	$url   = isset( $image['url'] ) && is_string( $image['url'] ) ? trim( $image['url'] ) : '';
	$alt   = isset( $image['alt'] ) && is_scalar( $image['alt'] ) ? sanitize_text_field( (string) $image['alt'] ) : '';

	if ( $id ) {
		$src = wp_get_attachment_image_src( $id, $size );
		if ( is_array( $src ) && ! empty( $src[0] ) ) {
			$url = $src[0];
			if ( '' === $alt ) {
				$alt = sanitize_text_field( (string) get_post_meta( $id, '_wp_attachment_image_alt', true ) );
			}
		} else {
			$id = 0;
		}
	}

	if ( '' !== $url && ! $id && ! preg_match( '#^(?:[a-z][a-z0-9+.-]*:|/)#i', $url ) ) {
		// Plugin-relative path (e.g. "assets/img/team/jane.jpg"); never allow walking up.
		$parts = array();
		foreach ( explode( '/', str_replace( '\\', '/', $url ) ) as $seg ) {
			if ( '' === $seg || '.' === $seg || '..' === $seg ) {
				continue;
			}
			$parts[] = rawurlencode( rawurldecode( $seg ) );
		}
		$url = $parts ? BPTM_URL . implode( '/', $parts ) : '';
	}

	$url = '' !== $url ? esc_url_raw( $url, array( 'http', 'https' ) ) : '';
	if ( '' === $url ) {
		$id = 0;
	}

	return array(
		'id'  => $id,
		'url' => $url,
		'alt' => $alt,
	);
}

/**
 * Build the member array (shape used by every template and the render Context) from one item of
 * the block's `members` attribute. Every value is sanitized here; templates still escape on output.
 *
 * @param array  $item       Raw item.
 * @param string $image_size Image size for image_url / flip_image_url.
 * @param bool   $allow_html Details may contain HTML (block option allowHtmlDetails); otherwise plain text.
 * @param int    $index      Position in the members list (fallback id, menu_order).
 * @return array Empty array when the item is not an array.
 */
function bptm_member_from_item( $item, $image_size = 'large', $allow_html = false, $index = 0 ) {
	if ( is_object( $item ) ) {
		$item = (array) $item;
	}
	if ( ! is_array( $item ) ) {
		return array();
	}
	$image_size = is_string( $image_size ) && '' !== $image_size ? $image_size : 'large';

	$text = static function ( $key ) use ( $item ) {
		return isset( $item[ $key ] ) && is_scalar( $item[ $key ] ) && ! is_bool( $item[ $key ] ) ? sanitize_text_field( (string) $item[ $key ] ) : '';
	};
	$url  = static function ( $key ) use ( $item ) {
		return isset( $item[ $key ] ) && is_string( $item[ $key ] ) && '' !== trim( $item[ $key ] ) ? esc_url_raw( trim( $item[ $key ] ) ) : '';
	};

	$id = bptm_sanitize_item_id( isset( $item['id'] ) ? $item['id'] : '' );
	if ( '' === $id ) {
		$id = 'm' . ( (int) $index + 1 );
	}
	$name = $text( 'name' );

	// Details: plain text (blank lines = paragraphs) unless HTML is allowed.
	$raw_details = isset( $item['details'] ) && is_string( $item['details'] ) ? str_replace( array( "\r\n", "\r" ), "\n", $item['details'] ) : '';
	$raw_details = wp_check_invalid_utf8( $raw_details, true );
	if ( $allow_html ) {
		$content = wp_kses_post( $raw_details );
		$content = '' !== trim( $content ) ? wpautop( $content ) : '';
	} else {
		$plain   = wp_strip_all_tags( $raw_details );
		$content = '' !== trim( $plain ) ? wpautop( esc_html( $plain ) ) : '';
	}
	$excerpt = trim( (string) preg_replace( '/\s+/u', ' ', wp_strip_all_tags( $raw_details ) ) );

	$image = bptm_resolve_image( isset( $item['image'] ) ? $item['image'] : array(), $image_size );
	$flip  = bptm_resolve_image( isset( $item['flipImage'] ) ? $item['flipImage'] : array(), $image_size );

	$terms = array();
	foreach ( bptm_term_fields() as $field => $key ) {
		$terms[ $key ] = bptm_split_terms( isset( $item[ $field ] ) ? $item[ $field ] : '' );
	}

	$email = isset( $item['email'] ) && is_string( $item['email'] ) ? sanitize_email( $item['email'] ) : '';

	$member = array(
		'id'              => $id,
		'name'            => $name,
		'slug'            => bptm_term_slug( $name ),
		'permalink'       => '',
		'content'         => $content,
		'excerpt'         => $excerpt,
		'designation'     => $text( 'designation' ),
		'company'         => $text( 'company' ),
		'company_website' => $url( 'companyWebsite' ),
		'land_phone'      => $text( 'landPhone' ),
		'cell_phone'      => $text( 'cellPhone' ),
		'email'           => is_email( $email ) ? $email : '',
		'email_cc'        => bptm_sanitize_email_list( isset( $item['emailCc'] ) ? $item['emailCc'] : '' ),
		'email_bcc'       => bptm_sanitize_email_list( isset( $item['emailBcc'] ) ? $item['emailBcc'] : '' ),
		'address'         => $text( 'address' ),
		'ribbon'          => $text( 'ribbon' ),
		'zip_code'        => $text( 'zipCode' ),
		'vcard'           => $url( 'vcard' ),
		'custom_page'     => $url( 'customUrl' ),
		'featured'        => isset( $item['featured'] ) && bptm_is_on( $item['featured'] ),
		'image_id'        => $image['id'],
		'image_url'       => '' !== $image['url'] ? $image['url'] : bptm_placeholder_image_url(),
		'image_alt'       => '' !== $image['alt'] ? $image['alt'] : $name,
		'flip_image_id'   => $flip['id'],
		'flip_image_url'  => $flip['url'],
		/**
		 * Filters a member's social links (front end): array of { icon, link }.
		 *
		 * @param array  $links   Sanitized links.
		 * @param string $item_id Member item id.
		 */
		'social'          => bptm_sanitize_social( apply_filters( 'bptm_member_social_links', bptm_sanitize_social( isset( $item['social'] ) ? $item['social'] : array() ), $id ) ),
		/**
		 * Filters a member's skills (front end): array of { skill, percent }.
		 *
		 * @param array  $skills  Sanitized skills.
		 * @param string $item_id Member item id.
		 */
		'skills'          => bptm_sanitize_skills( apply_filters( 'bptm_member_skills', bptm_sanitize_skills( isset( $item['skills'] ) ? $item['skills'] : array() ), $id ) ),
		'terms'           => $terms,
		'menu_order'      => (int) $index,
		'date'            => '',
	);

	/**
	 * Filters the member array built from a block item.
	 *
	 * @param array  $member     Member array.
	 * @param array  $item       Raw item.
	 * @param string $image_size Image size.
	 */
	$member = apply_filters( 'bptm_member', $member, $item, $image_size );
	return is_array( $member ) ? $member : array();
}

/**
 * Term names of a member for a term key.
 *
 * @param array  $member Member array from bptm_member_from_item().
 * @param string $key    Term key (group, tag, location, ...).
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
 * Term slugs of a member for a term key.
 *
 * @param array  $member Member array.
 * @param string $key    Term key.
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
