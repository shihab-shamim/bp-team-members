<?php
/**
 * Block glue. The block is rendered in the browser (React) from its attributes; PHP only prints a
 * mount wrapper with the attributes as data, a small data bridge (window.bptmData), assets and the
 * preference custom CSS.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block.
 */
class Block {

	const STYLE_HANDLE  = 'tsb-team-members-style';
	const SCRIPT_HANDLE = 'tsb-team-members-view-script';
	const EDITOR_HANDLE = 'tsb-team-members-editor-script';
	const FA_HANDLE     = 'bptm-fontawesome';
	const FA_VERSION    = '6.5.2';

	/**
	 * Block attribute schema cache.
	 *
	 * @var array|null
	 */
	private static $schema = null;

	/**
	 * Uids used in this request.
	 *
	 * @var array
	 */
	private static $uids = array();

	/**
	 * Front-end data bridge attached?
	 *
	 * @var bool
	 */
	private static $bridged = false;

	/**
	 * Hooks.
	 */
	public static function hooks() {
		add_action( 'init', array( __CLASS__, 'register_assets' ), 5 );
		add_action( 'init', array( __CLASS__, 'attach_dependencies' ), 99 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register_assets' ), 1 );
		add_action( 'enqueue_block_assets', array( __CLASS__, 'block_assets' ) );
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'editor_bridge' ), 20 );
	}

	/* ------------------------------------------------------------------
	 * Attributes
	 * ------------------------------------------------------------------ */

	/**
	 * Attribute schema from block.json.
	 *
	 * @return array
	 */
	public static function schema() {
		if ( null !== self::$schema ) {
			return self::$schema;
		}
		self::$schema = array();
		foreach ( array( 'build/block.json', 'src/block.json' ) as $file ) {
			if ( file_exists( BPTM_DIR . $file ) ) {
				$json = json_decode( (string) file_get_contents( BPTM_DIR . $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
				if ( is_array( $json ) && ! empty( $json['attributes'] ) ) {
					self::$schema = $json['attributes'];
					break;
				}
			}
		}
		return self::$schema;
	}

	/**
	 * Default attribute values.
	 *
	 * @return array
	 */
	public static function defaults() {
		$out = array();
		foreach ( self::schema() as $key => $def ) {
			$out[ $key ] = array_key_exists( 'default', $def ) ? $def['default'] : null;
		}
		return $out;
	}

	/**
	 * Attributes that differ from the block.json defaults (the browser merges the defaults back).
	 *
	 * @param array $attributes Attributes.
	 * @return array
	 */
	public static function changed_attributes( array $attributes ) {
		$defaults = self::defaults();
		$out      = array();
		foreach ( $attributes as $key => $value ) {
			if ( in_array( $key, array( 'lock', 'metadata' ), true ) ) {
				continue;
			}
			if ( array_key_exists( $key, $defaults ) && $defaults[ $key ] === $value ) {
				continue;
			}
			$out[ $key ] = $value;
		}
		return $out;
	}

	/**
	 * Stable uid for an instance (unique within the request).
	 *
	 * @param array $attributes Attributes.
	 * @return string
	 */
	public static function uid( array $attributes ) {
		$base = substr( md5( (string) wp_json_encode( $attributes ) ), 0, 8 );
		$uid  = $base;
		$n    = 1;
		while ( isset( self::$uids[ $uid ] ) ) {
			++$n;
			$uid = $base . '-' . $n;
		}
		self::$uids[ $uid ] = true;
		return $uid;
	}

	/* ------------------------------------------------------------------
	 * Render
	 * ------------------------------------------------------------------ */

	/**
	 * Add a `sizes` map ({size: {url, width, height}}) to member images that come from the
	 * Media Library (id > 0) but were saved without one.
	 *
	 * @param array $members Raw member items.
	 * @return array Members.
	 */
	private static function fill_image_sizes( array $members ) {
		$names = array_merge( get_intermediate_image_sizes(), array( 'full' ) );
		foreach ( $members as $i => $member ) {
			if ( ! is_array( $member ) ) {
				continue;
			}
			foreach ( array( 'image', 'flipImage' ) as $key ) {
				$img = isset( $member[ $key ] ) && is_array( $member[ $key ] ) ? $member[ $key ] : null;
				if ( ! $img || ! empty( $img['sizes'] ) ) {
					continue;
				}
				$id = isset( $img['id'] ) ? absint( $img['id'] ) : 0;
				if ( ! $id || ! wp_attachment_is_image( $id ) ) {
					continue;
				}
				$sizes = array();
				foreach ( $names as $name ) {
					$src = wp_get_attachment_image_src( $id, $name );
					if ( $src && ! empty( $src[0] ) ) {
						$sizes[ $name ] = array(
							'url'    => esc_url_raw( $src[0] ),
							'width'  => (int) $src[1],
							'height' => (int) $src[2],
						);
					}
				}
				if ( $sizes ) {
					$members[ $i ][ $key ]['sizes'] = $sizes;
				}
			}
		}
		return $members;
	}

	/**
	 * Mount wrapper for the browser renderer.
	 *
	 * @param array  $attributes    Block attributes.
	 * @param string $wrapper_attrs Output of get_block_wrapper_attributes() ('' outside block contexts).
	 * @return string
	 */
	public static function render( $attributes, $wrapper_attrs = '' ) {
		$attributes = is_array( $attributes ) ? $attributes : array();
		$members    = array_key_exists( 'members', $attributes ) ? $attributes['members'] : ( isset( self::defaults()['members'] ) ? self::defaults()['members'] : array() );
		// No members: nothing on the front end (the editor shows its own empty state).
		if ( ! is_array( $members ) || ! $members ) {
			return '';
		}
		self::enqueue_frontend();

		// Media Library photos saved without their size URLs (older blocks): add them so the
		// "Thumbnail size" setting can pick the right file in the browser.
		if ( array_key_exists( 'members', $attributes ) && is_array( $attributes['members'] ) ) {
			$attributes['members'] = self::fill_image_sizes( $attributes['members'] );
		}

		$uid  = self::uid( $attributes );
		$data = self::changed_attributes( $attributes );
		$json = wp_json_encode( (object) $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE );
		if ( false === $json ) {
			$json = '{}';
		}

		$wrapper_attrs = trim( (string) $wrapper_attrs );
		if ( '' === $wrapper_attrs ) {
			$classes = 'wp-block-tsb-team-members';
			if ( ! empty( $attributes['className'] ) && is_string( $attributes['className'] ) ) {
				$classes .= ' ' . implode( ' ', array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', $attributes['className'] ) ) ) );
			}
			$wrapper_attrs = 'class="' . esc_attr( trim( $classes ) ) . '"';
			if ( ! empty( $attributes['anchor'] ) && is_string( $attributes['anchor'] ) ) {
				$wrapper_attrs .= ' id="' . esc_attr( sanitize_html_class( $attributes['anchor'] ) ) . '"';
			}
		}
		if ( ! preg_match( '/(^|\s)id="/', $wrapper_attrs ) ) {
			$wrapper_attrs .= ' id="' . esc_attr( 'bptm-' . $uid ) . '"';
		}

		$html  = '<div ' . $wrapper_attrs . ' data-bptm-uid="' . esc_attr( $uid ) . '" data-attributes="' . esc_attr( $json ) . '">';
		$html .= self::noscript( $members );
		$html .= '</div>';
		return (string) apply_filters( 'bptm_render_html', $html, $attributes, $uid );
	}

	/**
	 * Plain member list for visitors without JavaScript (replaced when the block mounts).
	 *
	 * @param array $members Raw member items.
	 * @return string
	 */
	private static function noscript( array $members ) {
		$items = '';
		foreach ( array_slice( $members, 0, 500 ) as $m ) {
			if ( ! is_array( $m ) ) {
				continue;
			}
			$name = isset( $m['name'] ) && is_scalar( $m['name'] ) ? sanitize_text_field( (string) $m['name'] ) : '';
			$role = isset( $m['designation'] ) && is_scalar( $m['designation'] ) ? sanitize_text_field( (string) $m['designation'] ) : '';
			if ( '' === $name ) {
				continue;
			}
			$items .= '<li><strong>' . esc_html( $name ) . '</strong>' . ( '' !== $role ? ' &ndash; ' . esc_html( $role ) : '' ) . '</li>';
		}
		return '' === $items ? '' : '<noscript><ul class="bptm-noscript">' . $items . '</ul></noscript>';
	}

	/* ------------------------------------------------------------------
	 * Data bridge
	 * ------------------------------------------------------------------ */

	/**
	 * Data handed to the scripts.
	 *
	 * @param bool $editor Editor extras (fonts, image sizes, admin URLs).
	 * @return array
	 */
	public static function data( $editor = false ) {
		$translations = array();
		foreach ( array_keys( bptm_translation_defaults() ) as $key ) {
			$translations[ $key ] = bptm_translation( $key );
		}
		$prefs = array();
		foreach ( array( 'land_phone_link', 'cell_phone_link', 'email_link', 'disable_google_fonts', 'disable_lazy_load', 'search_all_fields' ) as $key ) {
			$prefs[ $key ] = bptm_is_on( bptm_get_option( $key, false ) );
		}
		$prefs['lazy_load_class'] = (string) bptm_get_option( 'lazy_load_class', 'skip-lazy' );

		$data = array(
			'pluginUrl'    => BPTM_URL,
			'translations' => $translations,
			'prefs'        => $prefs,
		);
		if ( $editor ) {
			$data['fonts']          = self::fonts();
			$data['thumbnailSizes'] = self::thumbnail_sizes();
		}
		/**
		 * Filters the data passed to the block scripts (window.bptmData).
		 *
		 * @param array $data   Data.
		 * @param bool  $editor Editor context.
		 */
		return (array) apply_filters( 'bptm_script_data', $data, $editor );
	}

	/**
	 * Inline script assigning window.bptmData.
	 *
	 * @param bool $editor Editor.
	 * @return string
	 */
	private static function bridge_js( $editor ) {
		return 'window.bptmData = Object.assign( window.bptmData || {}, ' . wp_json_encode( self::data( $editor ), JSON_HEX_TAG | JSON_HEX_AMP ) . ' );';
	}

	/**
	 * Editor script data.
	 */
	public static function editor_bridge() {
		if ( wp_script_is( self::EDITOR_HANDLE, 'registered' ) ) {
			wp_add_inline_script( self::EDITOR_HANDLE, self::bridge_js( true ), 'before' );
		}
	}

	/**
	 * Font families for the editor's typography controls (system first, then Google fonts).
	 *
	 * @return string[]
	 */
	public static function fonts() {
		$system = array( 'Arial', 'Tahoma', 'Verdana', 'Helvetica', 'Times New Roman', 'Trebuchet MS', 'Georgia' );
		$raw    = file_exists( BPTM_DIR . 'includes/data/google-fonts.php' ) ? (string) require BPTM_DIR . 'includes/data/google-fonts.php' : '';
		$google = array_values( array_filter( array_map( 'trim', explode( "\n", $raw ) ) ) );
		return (array) apply_filters( 'bptm_fonts', array_merge( $system, $google ) );
	}

	/**
	 * Registered image sizes for the editor (value/label).
	 *
	 * @return array
	 */
	public static function thumbnail_sizes() {
		$names = apply_filters(
			'image_size_names_choose', // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- core hook.
			array(
				'thumbnail' => __( 'Thumbnail', 'bp-team-member' ),
				'medium'    => __( 'Medium', 'bp-team-member' ),
				'large'     => __( 'Large', 'bp-team-member' ),
				'full'      => __( 'Full Size', 'bp-team-member' ),
			)
		);
		$out = array();
		foreach ( get_intermediate_image_sizes() as $size ) {
			$out[] = array(
				'value' => (string) $size,
				'label' => isset( $names[ $size ] ) ? $names[ $size ] : ucwords( str_replace( array( '-', '_' ), ' ', $size ) ),
			);
		}
		$out[] = array(
			'value' => 'full',
			'label' => isset( $names['full'] ) ? $names['full'] : __( 'Full Size', 'bp-team-member' ),
		);
		return $out;
	}

	/* ------------------------------------------------------------------
	 * Assets
	 * ------------------------------------------------------------------ */

	/**
	 * Register Font Awesome.
	 */
	public static function register_assets() {
		if ( ! wp_style_is( self::FA_HANDLE, 'registered' ) ) {
			wp_register_style( self::FA_HANDLE, BPTM_URL . 'assets/vendor/fontawesome/css/all.min.css', array(), self::FA_VERSION );
		}
	}

	/**
	 * Make the block style depend on Font Awesome (front end + editor canvas).
	 */
	public static function attach_dependencies() {
		self::register_assets();
		$styles = wp_styles();
		if ( isset( $styles->registered[ self::STYLE_HANDLE ] ) && ! in_array( self::FA_HANDLE, $styles->registered[ self::STYLE_HANDLE ]->deps, true ) ) {
			$styles->registered[ self::STYLE_HANDLE ]->deps[] = self::FA_HANDLE;
		}
	}

	/**
	 * Editor canvas: Font Awesome + preference custom CSS.
	 */
	public static function block_assets() {
		if ( is_admin() ) {
			self::register_assets();
			wp_enqueue_style( self::FA_HANDLE );
			self::enqueue_custom_css();
		}
	}

	/**
	 * Everything a rendered block needs (block, shortcodes, widget, builders): style, Font Awesome,
	 * the view script with its data bridge, and the custom CSS.
	 */
	public static function enqueue_frontend() {
		self::register_assets();
		wp_enqueue_style( self::FA_HANDLE );
		if ( wp_style_is( self::STYLE_HANDLE, 'registered' ) ) {
			wp_enqueue_style( self::STYLE_HANDLE );
		}
		if ( wp_script_is( self::SCRIPT_HANDLE, 'registered' ) ) {
			if ( ! self::$bridged ) {
				self::$bridged = true;
				wp_add_inline_script( self::SCRIPT_HANDLE, self::bridge_js( false ), 'before' );
			}
			wp_enqueue_script( self::SCRIPT_HANDLE );
		}
		self::enqueue_custom_css();
	}

	/**
	 * Preference custom CSS, once per page.
	 */
	public static function enqueue_custom_css() {
		if ( wp_style_is( 'bptm-custom-css', 'enqueued' ) || wp_style_is( 'bptm-custom-css', 'done' ) || did_action( 'bptm_custom_css_printed' ) ) {
			return;
		}
		$css = trim( str_replace( array( '</style', '<' ), '', wp_strip_all_tags( (string) bptm_get_option( 'custom_css', '' ) ) ) );
		if ( '' === $css ) {
			return;
		}
		wp_register_style( 'bptm-custom-css', false, array(), defined( 'BPTM_VERSION' ) ? BPTM_VERSION : '1.0.0' );
		wp_enqueue_style( 'bptm-custom-css' );
		wp_add_inline_style( 'bptm-custom-css', $css );
		/** Fires once the preference custom CSS has been queued, so other printers skip it. */
		do_action( 'bptm_custom_css_printed' );
	}
}

Block::hooks();
