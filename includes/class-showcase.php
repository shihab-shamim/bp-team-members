<?php
/**
 * Showcase CPT (bptm_showcase) + [bp_team id="X"] shortcode.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Showcases.
 */
class Showcase {

	const POST_TYPE = 'bptm_showcase';
	const BLOCK     = 'icb/fold-out-reveal';

	/**
	 * Hooks.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ), 11 );
		add_shortcode( 'bp_team', array( __CLASS__, 'shortcode' ) );
		add_filter( 'allowed_block_types_all', array( __CLASS__, 'allowed_blocks' ), 10, 2 );
		add_filter( 'manage_' . self::POST_TYPE . '_posts_columns', array( __CLASS__, 'columns' ) );
		add_action( 'manage_' . self::POST_TYPE . '_posts_custom_column', array( __CLASS__, 'column_content' ), 10, 2 );
		add_filter( 'post_row_actions', array( __CLASS__, 'row_actions' ), 10, 2 );
		add_action( 'admin_action_bptm_duplicate_showcase', array( __CLASS__, 'duplicate' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'admin_assets' ) );
		add_action( 'admin_notices', array( __CLASS__, 'edit_screen_notice' ) );
		add_filter( 'rest_request_before_callbacks', array( __CLASS__, 'restrict_rest_read' ), 10, 3 );
		add_filter( 'post_updated_messages', array( __CLASS__, 'updated_messages' ) );
	}

	/**
	 * Classic-screen "updated" messages for showcases.
	 *
	 * @param array $messages Messages.
	 * @return array
	 */
	public static function updated_messages( $messages ) {
		$messages[ self::POST_TYPE ] = array(
			0  => '',
			1  => __( 'Showcase updated.', 'bp-team-member' ),
			2  => __( 'Custom field updated.', 'bp-team-member' ),
			3  => __( 'Custom field deleted.', 'bp-team-member' ),
			4  => __( 'Showcase updated.', 'bp-team-member' ),
			5  => __( 'Showcase restored from revision.', 'bp-team-member' ),
			6  => __( 'Showcase published.', 'bp-team-member' ),
			7  => __( 'Showcase saved.', 'bp-team-member' ),
			8  => __( 'Showcase submitted.', 'bp-team-member' ),
			9  => __( 'Showcase scheduled.', 'bp-team-member' ),
			10 => __( 'Showcase draft updated.', 'bp-team-member' ),
		);
		return $messages;
	}

	/**
	 * The post type is not public: only users who can edit posts may read showcases over REST
	 * (block editor, Elementor / widget pickers keep working for editors).
	 *
	 * @param mixed            $response Response so far.
	 * @param array            $handler  Route handler.
	 * @param \WP_REST_Request $request  Request.
	 * @return mixed
	 */
	public static function restrict_rest_read( $response, $handler, $request ) {
		unset( $handler );
		if ( is_wp_error( $response ) || ! $request instanceof \WP_REST_Request ) {
			return $response;
		}
		if ( ! preg_match( '#^/wp/v2/' . preg_quote( self::POST_TYPE, '#' ) . '(?:/|$)#', (string) $request->get_route() ) ) {
			return $response;
		}
		if ( current_user_can( 'edit_posts' ) ) {
			return $response;
		}
		return new \WP_Error( 'rest_forbidden', __( 'Sorry, you are not allowed to view showcases.', 'bp-team-member' ), array( 'status' => rest_authorization_required_code() ) );
	}

	/**
	 * Register CPT.
	 */
	public static function register() {
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => array(
					'name'               => __( 'Showcases', 'bp-team-member' ),
					'singular_name'      => __( 'Showcase', 'bp-team-member' ),
					'add_new'            => __( 'Add New Showcase', 'bp-team-member' ),
					'add_new_item'       => __( 'Add New Showcase', 'bp-team-member' ),
					'edit_item'          => __( 'Edit Showcase', 'bp-team-member' ),
					'new_item'           => __( 'New Showcase', 'bp-team-member' ),
					'view_item'          => __( 'View Showcase', 'bp-team-member' ),
					'search_items'       => __( 'Search Showcases', 'bp-team-member' ),
					'not_found'          => __( 'No showcases found.', 'bp-team-member' ),
					'not_found_in_trash' => __( 'No showcases found in Trash.', 'bp-team-member' ),
					'all_items'          => __( 'Showcases', 'bp-team-member' ),
					'menu_name'          => __( 'Showcases', 'bp-team-member' ),
					'items_list'         => __( 'Showcases list', 'bp-team-member' ),
					'item_published'     => __( 'Showcase published.', 'bp-team-member' ),
					'item_published_privately' => __( 'Showcase published privately.', 'bp-team-member' ),
					'item_reverted_to_draft'   => __( 'Showcase reverted to draft.', 'bp-team-member' ),
					'item_trashed'       => __( 'Showcase trashed.', 'bp-team-member' ),
					'item_scheduled'     => __( 'Showcase scheduled.', 'bp-team-member' ),
					'item_updated'       => __( 'Showcase updated.', 'bp-team-member' ),
				),
				'public'              => false,
				'publicly_queryable'  => false,
				'exclude_from_search' => true,
				'show_ui'             => true,
				'show_in_menu'        => 'edit.php?post_type=bptm_member',
				'show_in_nav_menus'   => false,
				'show_in_rest'        => true,
				'rest_base'           => 'bptm_showcase',
				'supports'            => array( 'title', 'editor', 'revisions' ),
				'capability_type'     => 'post',
				'map_meta_cap'        => true,
				'template'            => array( array( self::BLOCK, array() ) ),
				'template_lock'       => 'all',
				'rewrite'             => false,
				'query_var'           => false,
			)
		);
	}

	/**
	 * Only our block inside showcases.
	 *
	 * @param bool|array               $allowed Allowed.
	 * @param \WP_Block_Editor_Context $context Context.
	 * @return bool|array
	 */
	public static function allowed_blocks( $allowed, $context ) {
		if ( isset( $context->post ) && $context->post instanceof \WP_Post && self::POST_TYPE === $context->post->post_type ) {
			return array( self::BLOCK );
		}
		return $allowed;
	}

	/**
	 * Shortcode text for a showcase.
	 *
	 * @param int $id Post id.
	 * @return string
	 */
	public static function shortcode_text( $id ) {
		return sprintf( '[bp_team id="%d"]', (int) $id );
	}

	/**
	 * Find the first block of ours (recursive).
	 *
	 * @param array $blocks Parsed blocks.
	 * @return array|null
	 */
	public static function find_block( array $blocks ) {
		foreach ( $blocks as $block ) {
			if ( self::BLOCK === $block['blockName'] ) {
				return $block;
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$found = self::find_block( $block['innerBlocks'] );
				if ( $found ) {
					return $found;
				}
			}
		}
		return null;
	}

	/**
	 * Render a showcase to HTML.
	 *
	 * @param int $id Showcase id.
	 * @return string
	 */
	public static function render( $id, array $overrides = array() ) {
		$post = get_post( (int) $id );
		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return '';
		}
		if ( 'publish' !== $post->post_status && ! current_user_can( 'edit_post', $post->ID ) ) {
			return '';
		}
		$block = self::find_block( parse_blocks( $post->post_content ) );
		if ( ! $block ) {
			return '';
		}
		if ( $overrides ) {
			$block['attrs'] = array_merge( is_array( $block['attrs'] ) ? $block['attrs'] : array(), $overrides );
		}
		self::enqueue_assets();

		static $depth = 0;
		if ( $depth > 2 ) {
			return '';
		}
		++$depth;
		$html = render_block( $block );
		--$depth;

		return '<div class="bptm-showcase bptm-showcase-' . (int) $post->ID . '">' . $html . '</div>';
	}

	/**
	 * Enqueue block + icon assets (also used outside block contexts).
	 */
	public static function enqueue_assets() {
		foreach ( array( 'icb-fold-out-reveal-style', 'bptm-fontawesome' ) as $handle ) {
			if ( wp_style_is( $handle, 'registered' ) ) {
				wp_enqueue_style( $handle );
			}
		}
		if ( wp_script_is( 'icb-fold-out-reveal-view-script', 'registered' ) ) {
			wp_enqueue_script( 'icb-fold-out-reveal-view-script' );
		}
	}

	/**
	 * [bp_team id="X"].
	 *
	 * @param array|string $atts Attributes.
	 * @return string
	 */
	public static function shortcode( $atts ) {
		$raw   = is_array( $atts ) ? $atts : array();
		$quick = class_exists( __NAMESPACE__ . '\Quick' ) && Quick::has_any( $raw );
		$atts  = shortcode_atts( array_merge( array( 'id' => 0 ), array_fill_keys( $quick ? Quick::keys() : array(), '' ) ), $raw, 'bp_team' );
		$id    = absint( $atts['id'] );
		if ( ! $id && $quick ) {
			// Inline attributes without a showcase, e.g. [bp_team theme="grid-1" number="6" group="sales"].
			$attributes = Quick::map( $atts );
			if ( empty( $attributes['theme'] ) ) {
				$attributes['theme'] = 'grid-5';
			}
			return Quick::render( $attributes );
		}
		if ( ! $id ) {
			return current_user_can( 'edit_posts' ) ? '<p class="bptm-notice">' . esc_html__( 'BP Team Member: please provide a showcase id, e.g. [bp_team id="123"].', 'bp-team-member' ) . '</p>' : '';
		}
		$html = self::render( $id, $quick ? Quick::map( $atts ) : array() );
		if ( '' === $html && current_user_can( 'edit_posts' ) ) {
			/* translators: %d: showcase id */
			return '<p class="bptm-notice">' . esc_html( sprintf( __( 'BP Team Member: showcase #%d was not found or contains no team block.', 'bp-team-member' ), $id ) ) . '</p>';
		}
		return '' === $html || ! class_exists( __NAMESPACE__ . '\Quick' ) ? $html : $html . Quick::builder_init_script();
	}

	/**
	 * List table columns.
	 *
	 * @param array $columns Columns.
	 * @return array
	 */
	public static function columns( $columns ) {
		$out = array();
		foreach ( $columns as $key => $label ) {
			$out[ $key ] = $label;
			if ( 'title' === $key ) {
				$out['bptm_shortcode'] = __( 'Shortcode', 'bp-team-member' );
				$out['bptm_theme']     = __( 'Theme', 'bp-team-member' );
			}
		}
		return $out;
	}

	/**
	 * Column content.
	 *
	 * @param string $column  Column.
	 * @param int    $post_id Post.
	 */
	public static function column_content( $column, $post_id ) {
		if ( 'bptm_shortcode' === $column ) {
			$code = self::shortcode_text( $post_id );
			echo '<span class="bptm-shortcode-copy"><input type="text" readonly class="bptm-shortcode-input" value="' . esc_attr( $code ) . '" size="' . esc_attr( (string) strlen( $code ) ) . '" /> <button type="button" class="button button-small bptm-copy-btn" data-copy="' . esc_attr( $code ) . '">' . esc_html__( 'Copy', 'bp-team-member' ) . '</button></span>';
		} elseif ( 'bptm_theme' === $column ) {
			$post  = get_post( $post_id );
			$block = $post ? self::find_block( parse_blocks( $post->post_content ) ) : null;
			if ( ! $block ) {
				echo '&mdash;';
				return;
			}
			$theme = isset( $block['attrs']['theme'] ) ? (string) $block['attrs']['theme'] : 'grid-5';
			$label = $theme;
			$themes = apply_filters( 'bptm_themes', array() );
			if ( isset( $themes[ $theme ]['label'] ) ) {
				$label = $themes[ $theme ]['label'];
			}
			echo esc_html( $label );
		}
	}

	/**
	 * Duplicate row action.
	 *
	 * @param array    $actions Actions.
	 * @param \WP_Post $post    Post.
	 * @return array
	 */
	public static function row_actions( $actions, $post ) {
		if ( self::POST_TYPE !== $post->post_type || ! current_user_can( 'edit_posts' ) ) {
			return $actions;
		}
		$url                       = wp_nonce_url( admin_url( 'admin.php?action=bptm_duplicate_showcase&post=' . $post->ID ), 'bptm_duplicate_' . $post->ID );
		$actions['bptm_duplicate'] = '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Duplicate', 'bp-team-member' ) . '</a>';
		return $actions;
	}

	/**
	 * Handle duplicate.
	 */
	public static function duplicate() {
		$id = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0;
		check_admin_referer( 'bptm_duplicate_' . $id );
		$post = get_post( $id );
		if ( ! $post || self::POST_TYPE !== $post->post_type || ! current_user_can( 'edit_post', $id ) || ! current_user_can( 'edit_posts' ) ) {
			wp_die( esc_html__( 'You are not allowed to duplicate this showcase.', 'bp-team-member' ), 403 );
		}
		$new_id = wp_insert_post(
			wp_slash(
				array(
					'post_type'    => self::POST_TYPE,
					/* translators: %s: original title */
					'post_title'   => sprintf( __( '%s (Copy)', 'bp-team-member' ), $post->post_title ),
					'post_content' => $post->post_content,
					'post_status'  => 'draft',
					'post_author'  => get_current_user_id(),
				)
			),
			true
		);
		if ( is_wp_error( $new_id ) ) {
			wp_die( esc_html( $new_id->get_error_message() ) );
		}
		wp_safe_redirect( admin_url( 'edit.php?post_type=' . self::POST_TYPE . '&bptm_duplicated=' . (int) $new_id ) );
		exit;
	}

	/**
	 * Copy button script on the list screen.
	 *
	 * @param string $hook Hook.
	 */
	public static function admin_assets( $hook ) {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || self::POST_TYPE !== $screen->post_type ) {
			return;
		}
		$ver = defined( 'BPTM_VERSION' ) ? BPTM_VERSION : '1.0.0';
		wp_enqueue_style( 'bptm-admin-tools', BPTM_URL . 'assets/admin/tools.css', array(), $ver );
		wp_enqueue_script( 'bptm-admin-tools', BPTM_URL . 'assets/admin/tools.js', array( 'jquery' ), $ver . '.' . filemtime( BPTM_DIR . 'assets/admin/tools.js' ), true );
		wp_localize_script(
			'bptm-admin-tools',
			'bptmTools',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => '',
				'i18n'    => array(
					'copied'  => __( 'Copied!', 'bp-team-member' ),
					'confirm' => __( 'Are you sure?', 'bp-team-member' ),
				),
			)
		);
		unset( $hook );
	}

	/**
	 * Notices: duplicated + shortcode hint on the edit screen.
	 */
	public static function edit_screen_notice() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || self::POST_TYPE !== $screen->post_type ) {
			return;
		}
		if ( 'edit' === $screen->base && isset( $_GET['bptm_duplicated'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Showcase duplicated as draft.', 'bp-team-member' ) . '</p></div>';
		}
		if ( 'edit' === $screen->base ) {
			echo '<div class="notice notice-info"><p>' . esc_html__( 'A showcase holds one BP Team Member block. Paste its shortcode into any page builder, classic editor, widget or template, e.g. [bp_team id="123"].', 'bp-team-member' ) . '</p><p>' . esc_html__( 'Without a showcase: [bp_team theme="grid-1" number="6" group="group-slug" columns="3" orderby="title" order="ASC" link="popup" view="carousel"] or the compact list [bp_team_sidebar total_mem="3" group_mem="group-slug"]. Attributes given together with id override the showcase.', 'bp-team-member' ) . '</p></div>';
		}
	}

	/**
	 * Showcases for selects: id => title.
	 *
	 * @return array
	 */
	public static function choices() {
		$out   = array();
		$posts = get_posts(
			array(
				'post_type'      => self::POST_TYPE,
				'post_status'    => 'publish',
				'posts_per_page' => 200,
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);
		foreach ( $posts as $post ) {
			/* translators: %d: post id */
			$out[ $post->ID ] = '' !== $post->post_title ? $post->post_title : sprintf( __( 'Showcase #%d', 'bp-team-member' ), $post->ID );
		}
		return $out;
	}
}

Showcase::init();
