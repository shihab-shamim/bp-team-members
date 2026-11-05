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
		$archive_raw   = trim( (string) bptm_get_option( 'archive_page_slug', '' ) );
		// A full URL points the archive link elsewhere (template loader filters the link); keep the default archive slug.
		$archive_slug  = preg_match( '#^https?://#i', $archive_raw ) ? '' : sanitize_title( $archive_raw );
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
			'_bptm_email'           => array( 'string', array( __CLASS__, 'sanitize_email' ), '' ),
			'_bptm_email_cc'        => array( 'string', 'bptm_sanitize_email_list', '' ),
			'_bptm_email_bcc'       => array( 'string', 'bptm_sanitize_email_list', '' ),
			'_bptm_address'         => array( 'string', $text, '' ),
			'_bptm_ribbon'          => array( 'string', $text, '' ),
			'_bptm_zip_code'        => array( 'string', $text, '' ),
			'_bptm_vcard'           => array( 'string', $url, '' ),
			'_bptm_custom_page'     => array( 'string', $url, '' ),
			'_bptm_featured'        => array( 'string', array( __CLASS__, 'sanitize_flag' ), '' ),
			'_bptm_flip_image'      => array( 'integer', 'absint', 0 ),
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
	 * @param string $value Raw.
	 * @return string
	 */
	public static function sanitize_url( $value ) {
		$value = trim( (string) $value );
		return '' === $value ? '' : esc_url_raw( $value, array( 'http', 'https', 'ftp', 'ftps' ) );
	}

	/**
	 * Email sanitizer.
	 *
	 * @param string $value Raw.
	 * @return string
	 */
	public static function sanitize_email( $value ) {
		$value = sanitize_email( (string) $value );
		return is_email( $value ) ? $value : '';
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
