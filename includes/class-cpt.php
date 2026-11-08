<?php
/**
 * Member post type, taxonomies, registered post meta, rewrite flushing.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the bptm_member CPT and its 11 taxonomies.
 */
class CPT {

	const POST_TYPE  = 'bptm_member';
	const FLUSH_FLAG = 'bptm_flush_rewrite';

	/**
	 * Meta keys whose last sanitized value was a rejected (invalid, non-empty) input: key => raw value.
	 *
	 * @var array
	 */
	public static $rejected_meta = array();

	/**
	 * Hook everything.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_post_type' ), 5 );
		add_action( 'init', array( __CLASS__, 'register_taxonomies' ), 6 );
		add_action( 'init', array( __CLASS__, 'register_meta' ), 7 );
		add_action( 'init', array( __CLASS__, 'maybe_flush' ), 999 );
		add_action( 'after_setup_theme', array( __CLASS__, 'theme_support' ), 99 );

		// Slug changes => flush on next request.
		foreach ( array( 'bptm_settings', 'bptm_taxonomy_settings' ) as $option ) {
			add_action( "update_option_{$option}", array( __CLASS__, 'on_settings_change' ), 10, 2 );
			add_action( "add_option_{$option}", array( __CLASS__, 'schedule_flush' ) );
		}

		add_filter( 'enter_title_here', array( __CLASS__, 'title_placeholder' ), 10, 2 );
		add_filter( 'post_updated_messages', array( __CLASS__, 'updated_messages' ) );
		add_filter( 'update_post_metadata', array( __CLASS__, 'keep_previous_on_reject' ), 10, 4 );
		add_filter( 'add_post_metadata', array( __CLASS__, 'keep_previous_on_reject' ), 10, 4 );

		register_activation_hook( BPTM_FILE, array( __CLASS__, 'activate' ) );
		register_deactivation_hook( BPTM_FILE, array( __CLASS__, 'deactivate' ) );
	}

	/**
	 * Activation: register types, then flush.
	 */
	public static function activate() {
		self::register_post_type();
		self::register_taxonomies();
		flush_rewrite_rules();
		update_option( self::FLUSH_FLAG, 1, true );
	}

	/**
	 * Deactivation: remove our rules.
	 */
	public static function deactivate() {
		unregister_post_type( self::POST_TYPE );
		flush_rewrite_rules();
	}

	/**
	 * Request a flush on the next init.
	 */
	public static function schedule_flush() {
		update_option( self::FLUSH_FLAG, 1, true );
	}

	/**
	 * Flush only when a slug-relevant value changed.
	 *
	 * @param mixed $old Old value.
	 * @param mixed $new New value.
	 */
	public static function on_settings_change( $old, $new ) {
		$old = is_array( $old ) ? $old : array();
		$new = is_array( $new ) ? $new : array();
		foreach ( array_unique( array_merge( array_keys( $old ), array_keys( $new ) ) ) as $key ) {
			if ( ! preg_match( '/slug|enable_|^member_slug$|archive/', (string) $key ) ) {
				continue;
			}
			$a = isset( $old[ $key ] ) ? $old[ $key ] : null;
			$b = isset( $new[ $key ] ) ? $new[ $key ] : null;
			if ( $a !== $b ) {
				self::schedule_flush();
				return;
			}
		}
	}

	/**
	 * Flush rewrite rules when flagged.
	 */
	public static function maybe_flush() {
		$version_changed = get_option( 'bptm_rewrite_version' ) !== BPTM_VERSION;
		if ( get_option( self::FLUSH_FLAG ) || $version_changed ) {
			delete_option( self::FLUSH_FLAG );
			update_option( 'bptm_rewrite_version', BPTM_VERSION, true );
			flush_rewrite_rules( false );
		}
	}

	/**
	 * Ensure thumbnails are supported for members even if the theme does not declare them.
	 */
	public static function theme_support() {
		if ( ! current_theme_supports( 'post-thumbnails' ) ) {
			add_theme_support( 'post-thumbnails', array( self::POST_TYPE ) );
		} else {
			$supported = get_theme_support( 'post-thumbnails' );
			if ( is_array( $supported ) && isset( $supported[0] ) && is_array( $supported[0] ) && ! in_array( self::POST_TYPE, $supported[0], true ) ) {
				$supported[0][] = self::POST_TYPE;
				add_theme_support( 'post-thumbnails', $supported[0] );
			}
		}
	}

	/**
	 * Register the member post type.
	 */
	public static function register_post_type() {
		if ( post_type_exists( self::POST_TYPE ) ) {
			return;
		}

		$slug = sanitize_title( (string) bptm_get_option( 'member_slug', 'team-members' ) );
		if ( '' === $slug ) {
			$slug = 'team-members';
		}
		$archive_raw   = bptm_archive_page_slug();
		// A full URL points the archive link elsewhere (template loader filters the link); keep the default archive slug.
		// Nested slugs ("about/team") are kept as a path so the rewrite rules match the archive links.
		$archive_slug  = preg_match( '#^https?://#i', $archive_raw ) ? '' : $archive_raw;
		$archive_title = trim( (string) bptm_get_option( 'archive_page_title', '' ) );
		$name          = ( ! is_admin() && '' !== $archive_title ) ? $archive_title : __( 'Team Members', 'bp-team-member' );

		$labels = array(
			'name'                  => $name,
			'singular_name'         => __( 'Team Member', 'bp-team-member' ),
			'menu_name'             => _x( 'BP Team', 'admin menu', 'bp-team-member' ),
			'name_admin_bar'        => _x( 'Team Member', 'add new on admin bar', 'bp-team-member' ),
			'add_new'               => __( 'Add New Member', 'bp-team-member' ),
			'add_new_item'          => __( 'Add New Member', 'bp-team-member' ),
			'new_item'              => __( 'New Member', 'bp-team-member' ),
			'edit_item'             => __( 'Edit Member', 'bp-team-member' ),
			'view_item'             => __( 'View Member', 'bp-team-member' ),
			'view_items'            => __( 'View Members', 'bp-team-member' ),
			'all_items'             => __( 'All Members', 'bp-team-member' ),
			'search_items'          => __( 'Search Members', 'bp-team-member' ),
			'not_found'             => __( 'No members found.', 'bp-team-member' ),
			'not_found_in_trash'    => __( 'No members found in Trash.', 'bp-team-member' ),
			'featured_image'        => __( 'Member Photo', 'bp-team-member' ),
			'set_featured_image'    => __( 'Set member photo', 'bp-team-member' ),
			'remove_featured_image' => __( 'Remove member photo', 'bp-team-member' ),
			'use_featured_image'    => __( 'Use as member photo', 'bp-team-member' ),
			'archives'              => __( 'Member Archives', 'bp-team-member' ),
			'attributes'            => __( 'Member Attributes', 'bp-team-member' ),
			'items_list'            => __( 'Members list', 'bp-team-member' ),
			'items_list_navigation' => __( 'Members list navigation', 'bp-team-member' ),
			'filter_items_list'     => __( 'Filter members list', 'bp-team-member' ),
			'insert_into_item'      => __( 'Insert into member', 'bp-team-member' ),
			'uploaded_to_this_item' => __( 'Uploaded to this member', 'bp-team-member' ),
			'item_published'        => __( 'Member published.', 'bp-team-member' ),
			'item_published_privately' => __( 'Member published privately.', 'bp-team-member' ),
			'item_reverted_to_draft' => __( 'Member reverted to draft.', 'bp-team-member' ),
			'item_trashed'          => __( 'Member trashed.', 'bp-team-member' ),
			'item_scheduled'        => __( 'Member scheduled.', 'bp-team-member' ),
			'item_updated'          => __( 'Member updated.', 'bp-team-member' ),
			'item_link'             => _x( 'Member Link', 'navigation link block title', 'bp-team-member' ),
			'item_link_description' => _x( 'A link to a team member.', 'navigation link block description', 'bp-team-member' ),
		);

		$args = array(
			'labels'              => $labels,
			'public'              => true,
			'publicly_queryable'  => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => true,
			'rest_base'           => self::POST_TYPE,
			'query_var'           => true,
			'rewrite'             => array(
				'slug'       => $slug,
				'with_front' => ! bptm_is_on( bptm_get_option( 'replace_custom_slug', false ) ),
			),
			'capability_type'     => 'post',
			'map_meta_cap'        => true,
			'has_archive'         => '' !== $archive_slug ? $archive_slug : true,
			'hierarchical'        => false,
			'menu_position'       => 25,
			'menu_icon'           => 'dashicons-groups',
			'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt', 'page-attributes', 'custom-fields' ),
			'exclude_from_search' => false,
		);

		register_post_type( self::POST_TYPE, apply_filters( 'bptm_post_type_args', $args ) );
	}

	/**
	 * Register every enabled taxonomy.
	 */
	public static function register_taxonomies() {
		foreach ( bptm_taxonomies() as $key => $tax ) {
			if ( ! $tax['enabled'] || taxonomy_exists( $tax['taxonomy'] ) ) {
				continue;
			}

			$singular = $tax['label'];
			$plural   = $tax['plural'];

			$labels = array(
				'name'                       => $plural,
				'singular_name'              => $singular,
				'menu_name'                  => $plural,
				/* translators: %s: taxonomy plural label */
				'all_items'                  => sprintf( __( 'All %s', 'bp-team-member' ), $plural ),
				/* translators: %s: taxonomy singular label */
				'parent_item'                => sprintf( __( 'Parent %s', 'bp-team-member' ), $singular ),
				/* translators: %s: taxonomy singular label */
				'parent_item_colon'          => sprintf( __( 'Parent %s:', 'bp-team-member' ), $singular ),
				/* translators: %s: taxonomy singular label */
				'new_item_name'              => sprintf( __( 'New %s Name', 'bp-team-member' ), $singular ),
				/* translators: %s: taxonomy singular label */
				'add_new_item'               => sprintf( __( 'Add New %s', 'bp-team-member' ), $singular ),
				/* translators: %s: taxonomy singular label */
				'edit_item'                  => sprintf( __( 'Edit %s', 'bp-team-member' ), $singular ),
				/* translators: %s: taxonomy singular label */
				'update_item'                => sprintf( __( 'Update %s', 'bp-team-member' ), $singular ),
				/* translators: %s: taxonomy singular label */
				'view_item'                  => sprintf( __( 'View %s', 'bp-team-member' ), $singular ),
				/* translators: %s: taxonomy plural label */
				'separate_items_with_commas' => sprintf( __( 'Separate %s with commas', 'bp-team-member' ), strtolower( $plural ) ),
				/* translators: %s: taxonomy plural label */
				'search_items'               => sprintf( __( 'Search %s', 'bp-team-member' ), $plural ),
				/* translators: %s: taxonomy plural label */
				'add_or_remove_items'        => sprintf( __( 'Add or remove %s', 'bp-team-member' ), strtolower( $plural ) ),
				/* translators: %s: taxonomy plural label */
				'choose_from_most_used'      => sprintf( __( 'Choose from the most used %s', 'bp-team-member' ), strtolower( $plural ) ),
				/* translators: %s: taxonomy plural label */
				'popular_items'              => sprintf( __( 'Popular %s', 'bp-team-member' ), $plural ),
				'not_found'                  => __( 'Not found.', 'bp-team-member' ),
				/* translators: %s: taxonomy singular label */
				'back_to_items'              => sprintf( __( '&larr; Back to %s', 'bp-team-member' ), $plural ),
			);

			$archive = (bool) $tax['archive'];

			$args = array(
				'labels'             => $labels,
				'hierarchical'       => 'group' === $key,
				'public'             => true,
				'publicly_queryable' => $archive,
				'show_ui'            => true,
				'show_in_menu'       => true,
				'show_admin_column'  => true,
				'show_in_nav_menus'  => $archive,
				'show_tagcloud'      => false,
				'show_in_rest'       => true,
				'rest_base'          => $tax['taxonomy'],
				'query_var'          => $archive ? $tax['taxonomy'] : false,
				'rewrite'            => $archive ? array(
					'slug'         => $tax['slug'],
					'with_front'   => true,
					'hierarchical' => 'group' === $key,
				) : false,
			);

			register_taxonomy( $tax['taxonomy'], array( self::POST_TYPE ), apply_filters( 'bptm_taxonomy_args', $args, $key ) );
		}
	}

	/**
	 * Meta definitions: key => [type, sanitize callback, default, rest schema(optional)].
	 *
	 * @return array
	 */
	public static function meta_definitions() {
		$text = 'sanitize_text_field';
		$url  = array( __CLASS__, 'sanitize_url' );

		return array(
			'_bptm_designation'     => array( 'string', $text, '' ),
			'_bptm_company'         => array( 'string', $text, '' ),
			'_bptm_company_website' => array( 'string', $url, '' ),
			'_bptm_land_phone'      => array( 'string', $text, '' ),
			'_bptm_cell_phone'      => array( 'string', $text, '' ),
			'_bptm_email'           => array(
				'string',
				array( __CLASS__, 'sanitize_email' ),
				'',
				array(
					'type'  => 'string',
					// Empty (clear) or one strictly valid address; anything else is a REST 400.
					'anyOf' => array(
						array(
							'type'      => 'string',
							'maxLength' => 0,
						),
						array(
							'type'   => 'string',
							'format' => 'email',
						),
					),
				),
			),
			'_bptm_email_cc'        => array( 'string', array( __CLASS__, 'sanitize_email_list' ), '' ),
			'_bptm_email_bcc'       => array( 'string', array( __CLASS__, 'sanitize_email_list' ), '' ),
			'_bptm_address'         => array( 'string', $text, '' ),
			'_bptm_ribbon'          => array( 'string', $text, '' ),
			'_bptm_zip_code'        => array( 'string', $text, '' ),
			'_bptm_vcard'           => array( 'string', $url, '' ),
			'_bptm_custom_page'     => array( 'string', $url, '' ),
			'_bptm_featured'        => array( 'string', array( __CLASS__, 'sanitize_flag' ), '' ),
			'_bptm_flip_image'      => array( 'integer', array( __CLASS__, 'sanitize_flip_image' ), 0 ),
			'_bptm_social'          => array(
				'array',
				'bptm_sanitize_social',
				array(),
				array(
					'type'  => 'array',
					'items' => array(
						'type'                 => 'object',
						'properties'           => array(
							'icon' => array( 'type' => 'string' ),
							'link' => array( 'type' => 'string' ),
						),
						'additionalProperties' => false,
					),
				),
			),
			'_bptm_skills'          => array(
				'array',
				'bptm_sanitize_skills',
				array(),
				array(
					'type'  => 'array',
					'items' => array(
						'type'                 => 'object',
						'properties'           => array(
							'skill'   => array( 'type' => 'string' ),
							'percent' => array( 'type' => 'integer' ),
						),
						'additionalProperties' => false,
					),
				),
			),
		);
	}

	/**
	 * Register post meta with REST exposure.
	 */
	public static function register_meta() {
		foreach ( self::meta_definitions() as $key => $def ) {
			$args = array(
				'type'              => $def[0],
				'single'            => true,
				'default'           => $def[2],
				'sanitize_callback' => $def[1],
				'auth_callback'     => array( __CLASS__, 'meta_auth' ),
				'show_in_rest'      => isset( $def[3] ) ? array( 'schema' => $def[3] ) : true,
			);
			register_post_meta( self::POST_TYPE, $key, $args );
		}
	}

	/**
	 * Meta write permission.
	 *
	 * @param bool   $allowed  Allowed.
	 * @param string $meta_key Key.
	 * @param int    $post_id  Post ID.
	 * @return bool
	 */
	public static function meta_auth( $allowed, $meta_key = '', $post_id = 0 ) {
		return current_user_can( 'edit_post', (int) $post_id );
	}

	/**
	 * URL sanitizer for http(s) links.
	 *
	 * @param string $value    Raw.
	 * @param string $meta_key Meta key (when called as a meta sanitize callback).
	 * @return string
	 */
	public static function sanitize_url( $value, $meta_key = '' ) {
		self::flag_rejected( $meta_key, null );
		$value = is_scalar( $value ) ? trim( (string) $value ) : '';
		if ( '' === $value ) {
			return '';
		}
		if ( ! self::is_plausible_url( $value ) ) {
			self::flag_rejected( $meta_key, $value );
			return '';
		}
		if ( '/' !== $value[0] && false === strpos( $value, '://' ) ) {
			$value = 'http://' . $value; // Scheme-less domain ("example.com", "host:8080/x").
		}
		$clean = esc_url_raw( $value, array( 'http', 'https', 'ftp', 'ftps' ) );
		if ( '' === $clean ) {
			self::flag_rejected( $meta_key, $value );
		}
		return $clean;
	}

	/**
	 * Whether a value looks like a real link: an http(s)/ftp(s) URL or a scheme-less domain
	 * ("example.com/page") with a valid host, or a site-relative path ("/team.vcf").
	 * Rejects words such as "notaurl" that esc_url_raw() would turn into "http://notaurl".
	 *
	 * @param string $value Raw value.
	 * @return bool
	 */
	public static function is_plausible_url( $value ) {
		$value = trim( (string) $value );
		if ( '' === $value || preg_match( '/\s/', $value ) ) {
			return false;
		}
		if ( preg_match( '#^/(?!/)#', $value ) ) {
			return true; // Site-relative path.
		}
		if ( preg_match( '#^([a-z][a-z0-9+.-]*):#i', $value, $scheme ) && ! preg_match( '#^[^:/]+:\d+(/|$)#', $value ) ) {
			if ( ! in_array( strtolower( $scheme[1] ), array( 'http', 'https', 'ftp', 'ftps' ), true ) ) {
				return false;
			}
			$check = $value;
		} else {
			$check = 'http://' . ltrim( $value, '/' );
		}
		$host = wp_parse_url( $check, PHP_URL_HOST );
		if ( ! is_string( $host ) || '' === $host ) {
			return false;
		}
		$host = strtolower( trim( $host, '[]' ) );
		if ( 'localhost' === $host || filter_var( $host, FILTER_VALIDATE_IP ) ) {
			return true;
		}
		// Dotted host name with a 2+ letter TLD (Unicode/IDN labels allowed).
		return (bool) preg_match( '/^(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+(?:[\p{L}]{2,63}|xn--[a-z0-9-]{1,59})$/u', $host );
	}

	/**
	 * Flip image meta: only an existing image attachment id (also enforced for REST writes).
	 *
	 * @param mixed $value Raw.
	 * @return int
	 */
	public static function sanitize_flip_image( $value ) {
		$id = is_numeric( $value ) ? absint( $value ) : 0;
		return ( $id && 'attachment' === get_post_type( $id ) && wp_attachment_is_image( $id ) ) ? $id : 0;
	}

	/**
	 * Email sanitizer.
	 *
	 * @param string $value    Raw.
	 * @param string $meta_key Meta key (when called as a meta sanitize callback).
	 * @return string
	 */
	public static function sanitize_email( $value, $meta_key = '' ) {
		self::flag_rejected( $meta_key, null );
		// Strict like the CC/BCC lists: an invalid address is rejected as a whole instead of being
		// "repaired" (sanitize_email() turns "foo@x.com?body=x" into "foo@x.combodyx").
		$value = is_scalar( $value ) ? trim( (string) $value ) : '';
		if ( '' === $value ) {
			return '';
		}
		$valid = bptm_parse_email_list( $value );
		if ( 1 !== count( $valid ) || $valid[0] !== $value ) {
			self::flag_rejected( $meta_key, $value );
			return '';
		}
		return $value;
	}

	/**
	 * CC / BCC list sanitizer: invalid entries are dropped; a list with no valid entry at all is
	 * flagged as rejected so the previous value is kept.
	 *
	 * @param string $value    Raw.
	 * @param string $meta_key Meta key (when called as a meta sanitize callback).
	 * @return string
	 */
	public static function sanitize_email_list( $value, $meta_key = '' ) {
		self::flag_rejected( $meta_key, null );
		$raw   = is_scalar( $value ) ? trim( (string) $value ) : '';
		$clean = bptm_sanitize_email_list( $raw );
		if ( '' !== $raw && '' === $clean ) {
			self::flag_rejected( $meta_key, $raw );
		}
		return $clean;
	}

	/**
	 * Remember (or clear) that the last sanitized value of a meta key was rejected.
	 *
	 * @param string      $meta_key Meta key ('' = not a meta write, ignored).
	 * @param string|null $raw      Rejected raw value, null to clear.
	 */
	private static function flag_rejected( $meta_key, $raw ) {
		if ( ! is_string( $meta_key ) || '' === $meta_key ) {
			return;
		}
		if ( null === $raw ) {
			unset( self::$rejected_meta[ $meta_key ] );
		} else {
			self::$rejected_meta[ $meta_key ] = (string) $raw;
		}
	}

	/**
	 * update_post_meta() / add_post_meta() (REST, third-party code): a value that the sanitizer
	 * rejected (non-empty input sanitized to '') keeps the previous valid value instead of erasing it.
	 *
	 * @param null|bool $check     Short-circuit value.
	 * @param int       $object_id Post ID.
	 * @param string    $meta_key  Meta key.
	 * @param mixed     $value     Sanitized value.
	 * @return null|bool
	 */
	public static function keep_previous_on_reject( $check, $object_id, $meta_key, $value ) {
		if ( null !== $check || '' !== $value || ! is_string( $meta_key ) || ! isset( self::$rejected_meta[ $meta_key ] ) ) {
			return $check;
		}
		if ( self::POST_TYPE !== get_post_type( (int) $object_id ) ) {
			return $check;
		}
		unset( self::$rejected_meta[ $meta_key ] );
		return true; // Treat as done: the stored value stays untouched.
	}

	/**
	 * '1' or ''.
	 *
	 * @param mixed $value Raw.
	 * @return string
	 */
	public static function sanitize_flag( $value ) {
		return bptm_is_on( $value ) ? '1' : '';
	}

	/**
	 * Title placeholder.
	 *
	 * @param string   $text Placeholder.
	 * @param \WP_Post $post Post.
	 * @return string
	 */
	public static function title_placeholder( $text, $post ) {
		if ( $post && self::POST_TYPE === $post->post_type ) {
			return __( 'Member name', 'bp-team-member' );
		}
		return $text;
	}

	/**
	 * Post updated messages.
	 *
	 * @param array $messages Messages.
	 * @return array
	 */
	public static function updated_messages( $messages ) {
		$messages[ self::POST_TYPE ] = array(
			0  => '',
			1  => __( 'Member updated.', 'bp-team-member' ),
			2  => __( 'Custom field updated.', 'bp-team-member' ),
			3  => __( 'Custom field deleted.', 'bp-team-member' ),
			4  => __( 'Member updated.', 'bp-team-member' ),
			5  => __( 'Member restored from revision.', 'bp-team-member' ),
			6  => __( 'Member published.', 'bp-team-member' ),
			7  => __( 'Member saved.', 'bp-team-member' ),
			8  => __( 'Member submitted.', 'bp-team-member' ),
			9  => __( 'Member scheduled.', 'bp-team-member' ),
			10 => __( 'Member draft updated.', 'bp-team-member' ),
		);
		return $messages;
	}
}

CPT::init();
