<?php
/**
 * Settings: Preferences, Taxonomy settings and Translations admin pages.
 *
 * Options:
 *  - bptm_settings          Preferences + translations (see Settings::defaults()).
 *  - bptm_taxonomy_settings Per taxonomy enable / labels / archive / slug.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings controller.
 */
class Settings {

	const OPTION       = 'bptm_settings';
	const TAX_OPTION   = 'bptm_taxonomy_settings';
	const GROUP        = 'bptm_settings_group';
	const TAX_GROUP    = 'bptm_taxonomy_settings_group';
	const FLUSH_OPTION = 'bptm_flush_rewrite_rules';
	const PARENT_SLUG  = 'edit.php?post_type=bptm_member';
	const CAPABILITY   = 'manage_options';

	/**
	 * Hook everything.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ), 20 );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'admin_assets' ) );
		add_action( 'admin_post_bptm_flush_permalinks', array( __CLASS__, 'handle_flush_permalinks' ) );
		add_action( 'init', array( __CLASS__, 'maybe_flush_rewrite_rules' ), 999 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_custom_css' ), 100 );
		add_action( 'update_option_' . self::OPTION, array( __CLASS__, 'on_settings_updated' ), 10, 2 );
		add_action( 'add_option_' . self::OPTION, array( __CLASS__, 'schedule_flush' ) );
		add_action( 'update_option_' . self::TAX_OPTION, array( __CLASS__, 'schedule_flush' ) );
		add_action( 'add_option_' . self::TAX_OPTION, array( __CLASS__, 'schedule_flush' ) );
	}

	/* ------------------------------------------------------------------
	 * Defaults
	 * ------------------------------------------------------------------ */

	/**
	 * Front-end translatable strings => default English text.
	 *
	 * @return array
	 */
	public static function translation_defaults() {
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
	 * Preference defaults (without translations).
	 *
	 * @return array
	 */
	public static function preference_defaults() {
		return array(
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
	}

	/**
	 * All defaults of option bptm_settings (preferences + translations).
	 *
	 * @return array
	 */
	public static function defaults() {
		return array_merge( self::preference_defaults(), self::translation_defaults() );
	}

	/**
	 * Taxonomy keys => [ singular, plural ].
	 *
	 * @return array
	 */
	public static function taxonomy_labels() {
		return array(
			'group'       => array( __( 'Group', 'bp-team-member' ), __( 'Groups', 'bp-team-member' ) ),
			'tag'         => array( __( 'Tag', 'bp-team-member' ), __( 'Tags', 'bp-team-member' ) ),
			'language'    => array( __( 'Language', 'bp-team-member' ), __( 'Languages', 'bp-team-member' ) ),
			'location'    => array( __( 'Location', 'bp-team-member' ), __( 'Locations', 'bp-team-member' ) ),
			'gender'      => array( __( 'Gender', 'bp-team-member' ), __( 'Genders', 'bp-team-member' ) ),
			'specialty'   => array( __( 'Specialty', 'bp-team-member' ), __( 'Specialties', 'bp-team-member' ) ),
			'extra_one'   => array( __( 'Extra One', 'bp-team-member' ), __( 'Extra One', 'bp-team-member' ) ),
			'extra_two'   => array( __( 'Extra Two', 'bp-team-member' ), __( 'Extra Two', 'bp-team-member' ) ),
			'extra_three' => array( __( 'Extra Three', 'bp-team-member' ), __( 'Extra Three', 'bp-team-member' ) ),
			'extra_four'  => array( __( 'Extra Four', 'bp-team-member' ), __( 'Extra Four', 'bp-team-member' ) ),
			'extra_five'  => array( __( 'Extra Five', 'bp-team-member' ), __( 'Extra Five', 'bp-team-member' ) ),
		);
	}

	/**
	 * Defaults of option bptm_taxonomy_settings.
	 *
	 * @return array
	 */
	public static function taxonomy_defaults() {
		$out = array();
		foreach ( self::taxonomy_labels() as $key => $labels ) {
			$is_extra                          = 0 === strpos( $key, 'extra_' );
			$out[ "enable_{$key}_tax" ]         = ! $is_extra;
			$out[ "{$key}_tax_label" ]          = $labels[0];
			$out[ "{$key}_tax_plural_label" ]   = $labels[1];
			$out[ "enable_{$key}_tax_archive" ] = true;
			$out[ "{$key}_tax_archive_slug" ]   = 'bptm-' . str_replace( '_', '-', $key );
		}
		return $out;
	}

	/* ------------------------------------------------------------------
	 * Getters (fallbacks used when includes/functions.php is not loaded)
	 * ------------------------------------------------------------------ */

	/**
	 * Preferences merged with defaults.
	 *
	 * @return array
	 */
	public static function all() {
		$stored = get_option( self::OPTION, array() );
		return array_merge( self::defaults(), is_array( $stored ) ? $stored : array() );
	}

	/**
	 * Get one preference.
	 *
	 * @param string $key     Key.
	 * @param mixed  $default Fallback.
	 * @return mixed
	 */
	public static function get( $key, $default = null ) {
		if ( function_exists( 'bptm_get_option' ) ) {
			return bptm_get_option( $key, $default );
		}
		$all = self::all();
		return array_key_exists( $key, $all ) ? $all[ $key ] : $default;
	}

	/**
	 * Taxonomy settings merged with defaults.
	 *
	 * @return array
	 */
	public static function tax_all() {
		$stored = get_option( self::TAX_OPTION, array() );
		return array_merge( self::taxonomy_defaults(), is_array( $stored ) ? $stored : array() );
	}

	/**
	 * Get one taxonomy setting.
	 *
	 * @param string $key     Key.
	 * @param mixed  $default Fallback.
	 * @return mixed
	 */
	public static function get_tax( $key, $default = null ) {
		if ( function_exists( 'bptm_get_tax_option' ) ) {
			return bptm_get_tax_option( $key, $default );
		}
		$all = self::tax_all();
		return array_key_exists( $key, $all ) ? $all[ $key ] : $default;
	}

	/**
	 * Front-end string (fallback for bptm_translation()).
	 *
	 * @param string $key Translation key.
	 * @return string
	 */
	public static function translation( $key ) {
		if ( function_exists( 'bptm_translation' ) ) {
			return (string) bptm_translation( $key );
		}
		$defaults = self::translation_defaults();
		if ( ! isset( $defaults[ $key ] ) ) {
			return '';
		}
		if ( self::get( 'multilingual' ) ) {
			return $defaults[ $key ];
		}
		$value = self::get( $key );
		return ( is_string( $value ) && '' !== $value ) ? $value : $defaults[ $key ];
	}

	/* ------------------------------------------------------------------
	 * Field definitions
	 * ------------------------------------------------------------------ */

	/**
	 * Single page style choices.
	 *
	 * @return array
	 */
	public static function single_styles() {
		return array(
			'default'     => __( 'Default (photo + details side by side)', 'bp-team-member' ),
			'style-one'   => __( 'Style One (profile card sidebar)', 'bp-team-member' ),
			'style-two'   => __( 'Style Two (centered hero)', 'bp-team-member' ),
			'style-three' => __( 'Style Three (colored banner)', 'bp-team-member' ),
			'style-four'  => __( 'Style Four (dark split card)', 'bp-team-member' ),
			'style-five'  => __( 'Style Five (minimal editorial)', 'bp-team-member' ),
		);
	}

	/**
	 * Preference fields grouped by section.
	 *
	 * @return array section id => [ title, fields => [ key => field ] ]
	 */
	public static function preference_fields() {
		return array(
			'general' => array(
				'title'  => __( 'Permalinks & Archive', 'bp-team-member' ),
				'fields' => array(
					'member_slug'         => array(
						'type'  => 'text',
						'label' => __( 'Member slug', 'bp-team-member' ),
						'desc'  => __( 'URL base of single member pages, e.g. example.com/team-members/jane-doe. Permalinks are flushed automatically after saving.', 'bp-team-member' ),
					),
					'replace_custom_slug' => array(
						'type'  => 'checkbox',
						'label' => __( 'Ignore permalink front base', 'bp-team-member' ),
						'desc'  => __( 'Do not prepend the front base of a custom permalink structure (e.g. /blog/) to member URLs.', 'bp-team-member' ),
					),
					'archive_page_slug'   => array(
						'type'  => 'text',
						'label' => __( 'Archive page slug', 'bp-team-member' ),
						'desc'  => __( 'Optional. A slug (e.g. "our-team") moves the built-in members archive to example.com/our-team/. A full URL makes every members-archive link point to that page instead. Leave empty to use the member slug.', 'bp-team-member' ),
					),
					'archive_page_title'  => array(
						'type'  => 'text',
						'label' => __( 'Archive page title', 'bp-team-member' ),
						'desc'  => __( 'Title shown on the built-in members archive. Defaults to "Team Members".', 'bp-team-member' ),
					),
				),
			),
			'single'  => array(
				'title'  => __( 'Single Member Page', 'bp-team-member' ),
				'fields' => array(
					'single_page_style' => array(
						'type'    => 'select',
						'label'   => __( 'Single page style', 'bp-team-member' ),
						'options' => self::single_styles(),
					),
					'single_link_type'  => array(
						'type'    => 'select',
						'label'   => __( 'Default link type', 'bp-team-member' ),
						'desc'    => __( 'Default link behaviour of members (used by blocks whose link type is "Default" and by archives).', 'bp-team-member' ),
						'options' => array(
							'single_page' => __( 'Single page', 'bp-team-member' ),
							'none'        => __( 'None', 'bp-team-member' ),
						),
					),
					'next_prev'         => array(
						'type'  => 'checkbox',
						'label' => __( 'Next / previous member links', 'bp-team-member' ),
					),
					'breadcrumb'        => array(
						'type'  => 'checkbox',
						'label' => __( 'Breadcrumb', 'bp-team-member' ),
					),
				),
			),
			'links'   => array(
				'title'  => __( 'Contact Links', 'bp-team-member' ),
				'fields' => array(
					'land_phone_link' => array(
						'type'  => 'checkbox',
						'label' => __( 'Link land phone (tel:)', 'bp-team-member' ),
					),
					'cell_phone_link' => array(
						'type'  => 'checkbox',
						'label' => __( 'Link cell phone (tel:)', 'bp-team-member' ),
					),
					'email_link'      => array(
						'type'  => 'checkbox',
						'label' => __( 'Link email (mailto:)', 'bp-team-member' ),
					),
				),
			),
			'misc'    => array(
				'title'  => __( 'Behaviour', 'bp-team-member' ),
				'fields' => array(
					'search_all_fields'    => array(
						'type'  => 'checkbox',
						'label' => __( 'Search in all fields', 'bp-team-member' ),
						'desc'  => __( 'Name search also matches designation, company, description and other meta fields.', 'bp-team-member' ),
					),
					'multilingual'         => array(
						'type'  => 'checkbox',
						'label' => __( 'Enable multilingual mode', 'bp-team-member' ),
						'desc'  => __( 'Ignore the strings of the Translations page and taxonomy labels and use the translatable defaults instead (for WPML, Polylang, Loco Translate…).', 'bp-team-member' ),
					),
					'disable_google_fonts' => array(
						'type'  => 'checkbox',
						'label' => __( 'Disable Google fonts', 'bp-team-member' ),
						'desc'  => __( 'Never load fonts from Google, even when chosen in block typography.', 'bp-team-member' ),
					),
					'show_acf_fields'      => array(
						'type'  => 'checkbox',
						'label' => __( 'Show ACF fields', 'bp-team-member' ),
						'desc'  => __( 'Display Advanced Custom Fields assigned to members.', 'bp-team-member' ),
					),
					'acf_fields_position'  => array(
						'type'      => 'select',
						'label'     => __( 'ACF fields position', 'bp-team-member' ),
						'options'   => array(
							'after_skills'       => __( 'After skills', 'bp-team-member' ),
							'after_description'  => __( 'After description', 'bp-team-member' ),
							'after_meta_details' => __( 'After meta details', 'bp-team-member' ),
						),
						'dependsOn' => 'show_acf_fields',
					),
					'disable_lazy_load'    => array(
						'type'  => 'checkbox',
						'label' => __( 'Disable lazy load', 'bp-team-member' ),
						'desc'  => __( 'Add an exclusion class to member images so lazy-load plugins skip them and drop the native loading="lazy".', 'bp-team-member' ),
					),
					'lazy_load_class'      => array(
						'type'      => 'text',
						'label'     => __( 'Lazy load exclusion class', 'bp-team-member' ),
						'dependsOn' => 'disable_lazy_load',
					),
				),
			),
			'css'     => array(
				'title'  => __( 'Custom CSS', 'bp-team-member' ),
				'fields' => array(
					'custom_css' => array(
						'type'  => 'code',
						'label' => __( 'Custom CSS', 'bp-team-member' ),
						'desc'  => __( 'Printed on every front-end page.', 'bp-team-member' ),
					),
				),
			),
		);
	}

	/**
	 * Flat key => field map of preferences.
	 *
	 * @return array
	 */
	protected static function flat_preference_fields() {
		$out = array();
		foreach ( self::preference_fields() as $section ) {
			$out = array_merge( $out, $section['fields'] );
		}
		return $out;
	}

	/* ------------------------------------------------------------------
	 * Sanitization
	 * ------------------------------------------------------------------ */

	/**
	 * Sanitize bptm_settings. Supports partial page submissions (hidden `_page`
	 * field) and full arrays (imports / update_option calls).
	 *
	 * @param mixed $input Raw value.
	 * @return array
	 */
	public static function sanitize_settings( $input ) {
		// options.php already unslashes $_POST before the sanitize callback; imports pass decoded JSON. Never unslash again (it ate backslashes, e.g. content:"\f101").
		$input   = is_array( $input ) ? $input : array();
		$current = get_option( self::OPTION, array() );
		$current = array_merge( self::defaults(), is_array( $current ) ? $current : array() );
		$page    = isset( $input['_page'] ) ? sanitize_key( $input['_page'] ) : '';
		unset( $input['_page'] );

		$fields       = self::flat_preference_fields();
		$translations = self::translation_defaults();

		if ( 'preferences' === $page ) {
			$keys = array_keys( $fields );
		} elseif ( 'translations' === $page ) {
			$keys = array_keys( $translations );
		} else {
			$keys = array_keys( array_intersect_key( $input, self::defaults() ) );
		}

		$out = $current;
		foreach ( $keys as $key ) {
			$value = array_key_exists( $key, $input ) ? $input[ $key ] : null;
			if ( isset( $translations[ $key ] ) ) {
				$out[ $key ] = null === $value ? $translations[ $key ] : sanitize_text_field( (string) $value );
				continue;
			}
			$out[ $key ] = self::sanitize_preference( $key, $value, isset( $fields[ $key ] ) ? $fields[ $key ] : array() );
		}

		// The member slug / archive slug must not take a taxonomy archive slug: keep the previous value.
		$tax_slugs = array();
		$tax_now   = array_merge( self::taxonomy_defaults(), (array) get_option( self::TAX_OPTION, array() ) );
		foreach ( self::taxonomy_labels() as $tax_key => $labels ) {
			$slug = sanitize_title( (string) $tax_now[ "{$tax_key}_tax_archive_slug" ] );
			$slug = '' !== $slug ? $slug : 'bptm-' . str_replace( '_', '-', $tax_key );
			$tax_slugs[ $slug ] = '' !== (string) $tax_now[ "{$tax_key}_tax_plural_label" ] ? (string) $tax_now[ "{$tax_key}_tax_plural_label" ] : $labels[1];
		}
		$slug_labels = array(
			'member_slug'       => __( 'Member slug', 'bp-team-member' ),
			'archive_page_slug' => __( 'Archive page slug', 'bp-team-member' ),
		);
		foreach ( $slug_labels as $key => $label ) {
			$new = (string) $out[ $key ];
			if ( $new === (string) $current[ $key ] || '' === $new || preg_match( '#^https?://#i', $new ) ) {
				continue;
			}
			$first = strtok( $new, '/' );
			$hit   = isset( $tax_slugs[ $new ] ) ? $tax_slugs[ $new ] : ( isset( $tax_slugs[ $first ] ) ? $tax_slugs[ $first ] : '' );
			if ( '' === $hit ) {
				continue;
			}
			self::add_error_once(
				self::OPTION,
				'bptm_duplicate_slug_' . $key,
				sprintf(
					/* translators: 1: setting label, 2: rejected slug, 3: taxonomy plural label, 4: previous value */
					__( '%1$s: "%2$s" is already used as the archive slug of the %3$s taxonomy. Slugs must be unique, so the previous value "%4$s" was kept.', 'bp-team-member' ),
					$label,
					$new,
					$hit,
					(string) $current[ $key ]
				)
			);
			$out[ $key ] = $current[ $key ];
		}

		// Keep only known keys.
		return array_intersect_key( $out, self::defaults() );
	}

	/**
	 * Sanitize one preference value.
	 *
	 * @param string $key   Key.
	 * @param mixed  $value Raw value (null = not submitted).
	 * @param array  $field Field definition.
	 * @return mixed
	 */
	protected static function sanitize_preference( $key, $value, $field ) {
		$defaults = self::preference_defaults();
		$type     = isset( $field['type'] ) ? $field['type'] : 'text';

		switch ( $type ) {
			case 'checkbox':
				return self::to_bool( $value );

			case 'select':
				$value = is_scalar( $value ) ? (string) $value : '';
				return isset( $field['options'][ $value ] ) ? $value : $defaults[ $key ];

			case 'code':
				return null === $value ? '' : trim( wp_strip_all_tags( (string) $value ) );
		}

		$value = is_scalar( $value ) ? trim( (string) $value ) : '';

		switch ( $key ) {
			case 'member_slug':
				$value = sanitize_title( $value );
				return '' === $value ? $defaults['member_slug'] : $value;
			case 'archive_page_slug':
				if ( function_exists( 'bptm_archive_page_slug' ) ) {
					return bptm_archive_page_slug( $value );
				}
				if ( preg_match( '#^https?://#i', $value ) ) {
					return esc_url_raw( $value );
				}
				return trim( implode( '/', array_map( 'sanitize_title', array_filter( explode( '/', $value ) ) ) ), '/' );
			case 'lazy_load_class':
				$classes = array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', $value ) ) );
				return $classes ? implode( ' ', $classes ) : $defaults['lazy_load_class'];
		}

		return sanitize_text_field( $value );
	}

	/**
	 * Sanitize bptm_taxonomy_settings.
	 *
	 * @param mixed $input Raw value.
	 * @return array
	 */
	public static function sanitize_taxonomy_settings( $input ) {
		// Input is already unslashed (options.php / JSON import).
		$input    = is_array( $input ) ? $input : array();
		$is_form  = ! empty( $input['_page'] );
		$defaults = self::taxonomy_defaults();
		$current  = get_option( self::TAX_OPTION, array() );
		$current  = array_merge( $defaults, is_array( $current ) ? $current : array() );
		$out      = array();

		foreach ( $defaults as $key => $default ) {
			$has = array_key_exists( $key, $input );
			if ( is_bool( $default ) ) {
				if ( $has ) {
					$out[ $key ] = self::to_bool( $input[ $key ] );
				} else {
					$out[ $key ] = $is_form ? false : self::to_bool( $current[ $key ] );
				}
				continue;
			}

			$value = $has ? $input[ $key ] : $current[ $key ];
			$value = is_scalar( $value ) ? trim( (string) $value ) : '';

			if ( '_archive_slug' === substr( $key, -13 ) ) {
				$value = sanitize_title( $value );
				if ( '' === $value ) {
					$value = $default;
				}
			} else {
				$value = sanitize_text_field( $value );
				if ( '' === $value ) {
					$value = $default;
				}
			}
			$out[ $key ] = $value;
		}

		return self::resolve_slug_conflicts( $out, $current );
	}

	/**
	 * Archive slugs must be unique: across every taxonomy's effective slug (saved or default,
	 * whatever its enabled state) and against the member slug / members archive slug. A changed
	 * slug that collides is rejected with a notice and the previous value is kept.
	 *
	 * @param array $out     Sanitized new taxonomy settings.
	 * @param array $current Previous settings merged with defaults.
	 * @return array
	 */
	protected static function resolve_slug_conflicts( array $out, array $current ) {
		$keys     = array_keys( self::taxonomy_labels() );
		$previous = array();
		foreach ( $keys as $tax_key ) {
			$field                = "{$tax_key}_tax_archive_slug";
			$prev                 = sanitize_title( (string) $current[ $field ] );
			$previous[ $tax_key ] = '' !== $prev ? $prev : 'bptm-' . str_replace( '_', '-', $tax_key );
		}

		// Reserved by the member post type.
		$reserved    = array();
		$member_slug = sanitize_title( (string) self::get( 'member_slug', 'team-members' ) );
		if ( '' !== $member_slug ) {
			$reserved[ $member_slug ] = __( 'the member slug', 'bp-team-member' );
		}
		$archive = function_exists( 'bptm_archive_page_slug' ) ? bptm_archive_page_slug() : '';
		if ( '' !== $archive && ! preg_match( '#^https?://#i', $archive ) ) {
			$reserved[ $archive ] = __( 'the members archive slug', 'bp-team-member' );
			$first                = strtok( $archive, '/' );
			if ( $first && ! isset( $reserved[ $first ] ) ) {
				$reserved[ $first ] = __( 'the members archive slug', 'bp-team-member' );
			}
		}

		$label_of = function ( $tax_key ) use ( $out ) {
			$plural = isset( $out[ "{$tax_key}_tax_plural_label" ] ) ? (string) $out[ "{$tax_key}_tax_plural_label" ] : '';
			return '' !== $plural ? $plural : $tax_key;
		};

		// Repeat until stable: reverting one slug can create a new clash with an accepted change.
		for ( $pass = 0; $pass <= count( $keys ); $pass++ ) {
			$changed = false;
			foreach ( $keys as $tax_key ) {
				$field = "{$tax_key}_tax_archive_slug";
				$slug  = $out[ $field ];
				if ( $slug === $previous[ $tax_key ] ) {
					continue; // Unchanged values are never rejected.
				}
				$owner = '';
				if ( isset( $reserved[ $slug ] ) ) {
					$owner = $reserved[ $slug ];
				} else {
					foreach ( $keys as $other ) {
						if ( $other !== $tax_key && $out[ "{$other}_tax_archive_slug" ] === $slug ) {
							/* translators: %s: taxonomy plural label */
							$owner = sprintf( __( 'the %s taxonomy', 'bp-team-member' ), $label_of( $other ) );
							break;
						}
					}
				}
				if ( '' === $owner ) {
					continue;
				}
				self::add_error_once(
					self::TAX_OPTION,
					'bptm_duplicate_slug_' . $tax_key,
					sprintf(
						/* translators: 1: rejected archive slug, 2: taxonomy label, 3: what already uses the slug (e.g. "the Tags taxonomy"), 4: previous slug */
						__( 'The archive slug "%1$s" for %2$s is already used by %3$s. Slugs must be unique, so the previous slug "%4$s" was kept.', 'bp-team-member' ),
						$slug,
						$label_of( $tax_key ),
						$owner,
						$previous[ $tax_key ]
					)
				);
				$out[ $field ] = $previous[ $tax_key ];
				$changed       = true;
			}
			if ( ! $changed ) {
				break;
			}
		}
		return $out;
	}

	/**
	 * add_settings_error() without duplicates (sanitize callbacks may run twice on add_option).
	 *
	 * @param string $setting Setting slug.
	 * @param string $code    Error code.
	 * @param string $message Message.
	 * @param string $type    error|warning|success|info.
	 */
	protected static function add_error_once( $setting, $code, $message, $type = 'error' ) {
		if ( ! function_exists( 'add_settings_error' ) ) {
			return;
		}
		foreach ( get_settings_errors( $setting ) as $error ) {
			if ( isset( $error['code'] ) && $code === $error['code'] ) {
				return;
			}
		}
		add_settings_error( $setting, $code, $message, $type );
	}

	/**
	 * Loose boolean.
	 *
	 * @param mixed $value Value.
	 * @return bool
	 */
	public static function to_bool( $value ) {
		if ( is_bool( $value ) ) {
			return $value;
		}
		if ( is_string( $value ) ) {
			return in_array( strtolower( $value ), array( '1', 'on', 'yes', 'true' ), true );
		}
		return ! empty( $value );
	}

	/* ------------------------------------------------------------------
	 * Registration
	 * ------------------------------------------------------------------ */

	/**
	 * Register options with the Settings API.
	 */
	public static function register_settings() {
		register_setting(
			self::GROUP,
			self::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize_settings' ),
				'default'           => self::defaults(),
			)
		);
		register_setting(
			self::TAX_GROUP,
			self::TAX_OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize_taxonomy_settings' ),
				'default'           => self::taxonomy_defaults(),
			)
		);
	}

	/**
	 * Admin sub-menus under the member post type.
	 */
	public static function admin_menu() {
		add_submenu_page( self::PARENT_SLUG, __( 'Preferences', 'bp-team-member' ), __( 'Preferences', 'bp-team-member' ), self::CAPABILITY, 'bptm-preferences', array( __CLASS__, 'render_preferences_page' ) );
		add_submenu_page( self::PARENT_SLUG, __( 'Taxonomy Settings', 'bp-team-member' ), __( 'Taxonomy Settings', 'bp-team-member' ), self::CAPABILITY, 'bptm-taxonomies', array( __CLASS__, 'render_taxonomy_page' ) );
		add_submenu_page( self::PARENT_SLUG, __( 'Translations', 'bp-team-member' ), __( 'Translations', 'bp-team-member' ), self::CAPABILITY, 'bptm-translations', array( __CLASS__, 'render_translations_page' ) );

		// Alias "bptm-settings" (linked from the block editor) => Preferences. Registered, then hidden from the menu.
		$alias = add_submenu_page( self::PARENT_SLUG, __( 'Settings', 'bp-team-member' ), __( 'Settings', 'bp-team-member' ), self::CAPABILITY, 'bptm-settings', '__return_null' );
		if ( $alias ) {
			add_action(
				'load-' . $alias,
				function () {
					wp_safe_redirect( add_query_arg( array( 'post_type' => 'bptm_member', 'page' => 'bptm-preferences' ), admin_url( 'edit.php' ) ) );
					exit;
				}
			);
		}
		remove_submenu_page( self::PARENT_SLUG, 'bptm-settings' );
	}

	/**
	 * Admin pages owned by the tools area.
	 *
	 * @return array
	 */
	public static function tools_page_slugs() {
		return array( 'bptm-preferences', 'bptm-taxonomies', 'bptm-translations', 'bptm-bulk-import', 'bptm-import-export', 'bptm-demo-data' );
	}

	/**
	 * Enqueue admin assets on our pages.
	 *
	 * @param string $hook Hook suffix.
	 */
	public static function admin_assets( $hook ) {
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! in_array( $page, self::tools_page_slugs(), true ) ) {
			return;
		}
		$ver = defined( 'BPTM_VERSION' ) ? BPTM_VERSION : '1.0.0';
		wp_enqueue_style( 'bptm-admin-settings', BPTM_URL . 'assets/admin/settings.css', array(), $ver );
		$deps = array( 'jquery' );
		if ( 'bptm-preferences' === $page ) {
			$editor = wp_enqueue_code_editor( array( 'type' => 'text/css' ) );
			if ( false !== $editor ) {
				$deps[] = 'code-editor';
				wp_localize_script( 'code-editor', 'bptmCodeEditor', $editor );
			}
		}
		wp_enqueue_script( 'bptm-admin-settings', BPTM_URL . 'assets/admin/settings.js', $deps, $ver, true );
		unset( $hook );
	}

	/* ------------------------------------------------------------------
	 * Rewrite flushing
	 * ------------------------------------------------------------------ */

	/**
	 * Flag a rewrite flush on next init.
	 */
	public static function schedule_flush() {
		update_option( self::FLUSH_OPTION, 1, true );
	}

	/**
	 * Flush only when a rewrite-relevant preference changed.
	 *
	 * @param mixed $old Old value.
	 * @param mixed $new New value.
	 */
	public static function on_settings_updated( $old, $new ) {
		$old  = is_array( $old ) ? $old : array();
		$new  = is_array( $new ) ? $new : array();
		$keys = array( 'member_slug', 'replace_custom_slug', 'archive_page_slug' );
		foreach ( $keys as $key ) {
			$a = isset( $old[ $key ] ) ? $old[ $key ] : null;
			$b = isset( $new[ $key ] ) ? $new[ $key ] : null;
			if ( $a !== $b ) {
				self::schedule_flush();
				return;
			}
		}
	}

	/**
	 * Flush rewrite rules once after CPT/taxonomies are registered.
	 */
	public static function maybe_flush_rewrite_rules() {
		if ( get_option( self::FLUSH_OPTION ) ) {
			delete_option( self::FLUSH_OPTION );
			flush_rewrite_rules( false );
		}
	}

	/**
	 * Manual "Flush permalinks" button.
	 */
	public static function handle_flush_permalinks() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'bp-team-member' ), 403 );
		}
		check_admin_referer( 'bptm_flush_permalinks' );
		flush_rewrite_rules( false );
		wp_safe_redirect( add_query_arg( array( 'post_type' => 'bptm_member', 'page' => 'bptm-preferences', 'bptm_flushed' => 1 ), admin_url( 'edit.php' ) ) );
		exit;
	}

	/* ------------------------------------------------------------------
	 * Front-end custom CSS
	 * ------------------------------------------------------------------ */

	/**
	 * Print custom CSS on the front end.
	 */
	public static function enqueue_custom_css() {
		// Print once per page. Block themes render the block (which may print the CSS inline and fire
		// `bptm_custom_css_printed`, see Render\Renderer::custom_css()) before wp_enqueue_scripts runs;
		// in the other order the renderer sees the queued `bptm-custom-css` style and skips its copy.
		if ( did_action( 'bptm_custom_css_printed' ) ) {
			return;
		}
		$css = (string) self::get( 'custom_css', '' );
		$css = trim( wp_strip_all_tags( $css ) );
		if ( '' === $css ) {
			return;
		}
		wp_register_style( 'bptm-custom-css', false, array(), defined( 'BPTM_VERSION' ) ? BPTM_VERSION : '1.0.0' );
		wp_enqueue_style( 'bptm-custom-css' );
		wp_add_inline_style( 'bptm-custom-css', $css );
	}

	/* ------------------------------------------------------------------
	 * Page rendering
	 * ------------------------------------------------------------------ */

	/**
	 * Shared page header with tab navigation.
	 *
	 * @param string $current Current page slug.
	 * @param string $title   Title.
	 */
	public static function page_header( $current, $title ) {
		$tabs = array(
			'bptm-preferences'   => __( 'Preferences', 'bp-team-member' ),
			'bptm-taxonomies'    => __( 'Taxonomies', 'bp-team-member' ),
			'bptm-translations'  => __( 'Translations', 'bp-team-member' ),
			'bptm-bulk-import'   => __( 'Bulk Import', 'bp-team-member' ),
			'bptm-import-export' => __( 'Import / Export', 'bp-team-member' ),
			'bptm-demo-data'     => __( 'Demo Data', 'bp-team-member' ),
		);
		echo '<h1 class="bptm-admin-title">' . esc_html( $title ) . '</h1>';
		echo '<nav class="nav-tab-wrapper bptm-admin-tabs">';
		foreach ( $tabs as $slug => $label ) {
			$url = add_query_arg( array( 'post_type' => 'bptm_member', 'page' => $slug ), admin_url( 'edit.php' ) );
			printf(
				'<a href="%1$s" class="nav-tab%2$s">%3$s</a>',
				esc_url( $url ),
				$slug === $current ? ' nav-tab-active' : '',
				esc_html( $label )
			);
		}
		echo '</nav>';
	}

	/**
	 * Preferences page.
	 */
	public static function render_preferences_page() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return;
		}
		$values = self::all();
		echo '<div class="wrap bptm-admin">';
		self::page_header( 'bptm-preferences', __( 'Preferences', 'bp-team-member' ) );
		settings_errors();
		if ( isset( $_GET['bptm_flushed'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Permalinks flushed.', 'bp-team-member' ) . '</p></div>';
		}
		echo '<form method="post" action="options.php" class="bptm-settings-form">';
		settings_fields( self::GROUP );
		echo '<input type="hidden" name="' . esc_attr( self::OPTION ) . '[_page]" value="preferences" />';

		foreach ( self::preference_fields() as $section_id => $section ) {
			echo '<div class="bptm-card" id="bptm-section-' . esc_attr( $section_id ) . '">';
			echo '<h2>' . esc_html( $section['title'] ) . '</h2>';
			echo '<table class="form-table" role="presentation"><tbody>';
			foreach ( $section['fields'] as $key => $field ) {
				self::render_field( self::OPTION, $key, $field, isset( $values[ $key ] ) ? $values[ $key ] : '' );
			}
			echo '</tbody></table>';
			if ( 'general' === $section_id ) {
				$archive = get_post_type_archive_link( 'bptm_member' );
				if ( $archive ) {
					echo '<p class="description">' . esc_html__( 'Members archive:', 'bp-team-member' ) . ' <a href="' . esc_url( $archive ) . '" target="_blank" rel="noopener">' . esc_html( $archive ) . '</a></p>';
				}
			}
			echo '</div>';
		}

		submit_button( __( 'Save Preferences', 'bp-team-member' ) );
		echo '</form>';

		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" class="bptm-card bptm-inline-form">';
		echo '<input type="hidden" name="action" value="bptm_flush_permalinks" />';
		wp_nonce_field( 'bptm_flush_permalinks' );
		echo '<h2>' . esc_html__( 'Permalinks', 'bp-team-member' ) . '</h2>';
		echo '<p>' . esc_html__( 'Seeing 404 errors on member pages? Flush the rewrite rules.', 'bp-team-member' ) . '</p>';
		submit_button( __( 'Flush Permalinks', 'bp-team-member' ), 'secondary', 'submit', false );
		echo '</form>';
		echo '</div>';
	}

	/**
	 * Render one field row.
	 *
	 * @param string $option Option name.
	 * @param string $key    Field key.
	 * @param array  $field  Definition.
	 * @param mixed  $value  Current value.
	 */
	protected static function render_field( $option, $key, $field, $value ) {
		$id   = 'bptm-field-' . $key;
		$name = $option . '[' . $key . ']';
		$dep  = isset( $field['dependsOn'] ) ? ' data-depends-on="bptm-field-' . esc_attr( $field['dependsOn'] ) . '"' : '';

		echo '<tr class="bptm-field bptm-field-' . esc_attr( $field['type'] ) . '"' . $dep . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
		echo '<th scope="row"><label for="' . esc_attr( $id ) . '">' . esc_html( $field['label'] ) . '</label></th><td>';

		switch ( $field['type'] ) {
			case 'checkbox':
				echo '<label class="bptm-switch"><input type="checkbox" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="1" ' . checked( self::to_bool( $value ), true, false ) . ' /><span class="bptm-switch-slider" aria-hidden="true"></span></label>';
				break;
			case 'select':
				echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '">';
				foreach ( $field['options'] as $opt => $label ) {
					echo '<option value="' . esc_attr( $opt ) . '" ' . selected( (string) $value, (string) $opt, false ) . '>' . esc_html( $label ) . '</option>';
				}
				echo '</select>';
				break;
			case 'code':
				echo '<textarea id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" rows="10" class="large-text code bptm-code-editor">' . esc_textarea( (string) $value ) . '</textarea>';
				break;
			default:
				$placeholder = isset( $field['placeholder'] ) ? $field['placeholder'] : '';
				echo '<input type="text" class="regular-text" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( (string) $value ) . '" placeholder="' . esc_attr( $placeholder ) . '" />';
		}

		if ( ! empty( $field['desc'] ) ) {
			echo '<p class="description">' . esc_html( $field['desc'] ) . '</p>';
		}
		echo '</td></tr>';
	}

	/**
	 * Taxonomy settings page.
	 */
	public static function render_taxonomy_page() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return;
		}
		$values = self::tax_all();
		echo '<div class="wrap bptm-admin">';
		self::page_header( 'bptm-taxonomies', __( 'Taxonomy Settings', 'bp-team-member' ) );
		settings_errors();
		echo '<form method="post" action="options.php" class="bptm-settings-form">';
		settings_fields( self::TAX_GROUP );
		echo '<input type="hidden" name="' . esc_attr( self::TAX_OPTION ) . '[_page]" value="taxonomies" />';
		echo '<p class="description">' . esc_html__( 'Enable or disable each member taxonomy, rename it, and control its public archive. Disabled taxonomies are hidden everywhere (admin, block filters, front end).', 'bp-team-member' ) . '</p>';
		echo '<div class="bptm-tax-grid">';

		$opt = self::TAX_OPTION;
		foreach ( self::taxonomy_labels() as $key => $labels ) {
			$enabled = self::to_bool( $values[ "enable_{$key}_tax" ] );
			echo '<div class="bptm-card bptm-tax-card' . ( $enabled ? '' : ' is-disabled' ) . '">';
			echo '<h2><code>bptm_' . esc_html( $key ) . '</code> ' . esc_html( $values[ "{$key}_tax_plural_label" ] ) . '</h2>';
			echo '<table class="form-table" role="presentation"><tbody>';
			self::render_field( $opt, "enable_{$key}_tax", array( 'type' => 'checkbox', 'label' => __( 'Enable', 'bp-team-member' ) ), $values[ "enable_{$key}_tax" ] );
			self::render_field( $opt, "{$key}_tax_label", array( 'type' => 'text', 'label' => __( 'Singular label', 'bp-team-member' ), 'placeholder' => $labels[0], 'dependsOn' => "enable_{$key}_tax" ), $values[ "{$key}_tax_label" ] );
			self::render_field( $opt, "{$key}_tax_plural_label", array( 'type' => 'text', 'label' => __( 'Plural label', 'bp-team-member' ), 'placeholder' => $labels[1], 'dependsOn' => "enable_{$key}_tax" ), $values[ "{$key}_tax_plural_label" ] );
			self::render_field( $opt, "enable_{$key}_tax_archive", array( 'type' => 'checkbox', 'label' => __( 'Public archive', 'bp-team-member' ), 'dependsOn' => "enable_{$key}_tax" ), $values[ "enable_{$key}_tax_archive" ] );
			self::render_field( $opt, "{$key}_tax_archive_slug", array( 'type' => 'text', 'label' => __( 'Archive slug', 'bp-team-member' ), 'placeholder' => 'bptm-' . str_replace( '_', '-', $key ), 'dependsOn' => "enable_{$key}_tax_archive" ), $values[ "{$key}_tax_archive_slug" ] );
			echo '</tbody></table></div>';
		}
		echo '</div>';
		submit_button( __( 'Save Taxonomy Settings', 'bp-team-member' ) );
		echo '</form></div>';
	}

	/**
	 * Translations page.
	 */
	public static function render_translations_page() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return;
		}
		$values   = self::all();
		$defaults = self::translation_defaults();
		echo '<div class="wrap bptm-admin">';
		self::page_header( 'bptm-translations', __( 'Translations', 'bp-team-member' ) );
		settings_errors();
		if ( self::to_bool( $values['multilingual'] ) ) {
			echo '<div class="notice notice-warning inline"><p>' . esc_html__( 'Multilingual mode is enabled in Preferences: these strings are ignored and the translatable defaults are used instead.', 'bp-team-member' ) . '</p></div>';
		}
		echo '<form method="post" action="options.php" class="bptm-settings-form">';
		settings_fields( self::GROUP );
		echo '<input type="hidden" name="' . esc_attr( self::OPTION ) . '[_page]" value="translations" />';
		echo '<div class="bptm-card"><table class="form-table" role="presentation"><tbody>';
		foreach ( $defaults as $key => $default ) {
			self::render_field(
				self::OPTION,
				$key,
				array(
					'type'        => 'text',
					'label'       => $default,
					'placeholder' => $default,
				),
				isset( $values[ $key ] ) ? $values[ $key ] : $default
			);
		}
		echo '</tbody></table></div>';
		submit_button( __( 'Save Translations', 'bp-team-member' ) );
		echo '</form></div>';
	}
}

Settings::init();
