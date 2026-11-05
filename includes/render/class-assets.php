<?php
/**
 * Asset registration: Font Awesome, block asset dependencies, lazy-load compatibility.
 *
 * @package BPTM
 */

namespace BPTM\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Assets.
 */
class Assets {

	const STYLE_HANDLE  = 'icb-fold-out-reveal-style';
	const SCRIPT_HANDLE = 'icb-fold-out-reveal-view-script';
	const FA_HANDLE     = 'bptm-fontawesome';
	const FA_VERSION    = '6.5.2';

	/**
	 * Inline links printed?
	 *
	 * @var bool
	 */
	private static $inline_done = false;

	/**
	 * Hooks.
	 */
	public static function hooks() {
		add_action( 'init', array( __CLASS__, 'register' ), 5 );
		add_action( 'init', array( __CLASS__, 'attach_dependencies' ), 99 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register' ), 1 );
		add_action( 'enqueue_block_assets', array( __CLASS__, 'block_assets' ) );
		add_filter( 'wp_get_attachment_image_attributes', array( __CLASS__, 'no_lazy_attributes' ), 99, 1 );
	}

	/**
	 * Register Font Awesome.
	 */
	public static function register() {
		if ( ! wp_style_is( self::FA_HANDLE, 'registered' ) ) {
			wp_register_style( self::FA_HANDLE, BPTM_URL . 'assets/vendor/fontawesome/css/all.min.css', array(), self::FA_VERSION );
		}
	}

	/**
	 * Make the block style depend on Font Awesome so it loads wherever the block style loads (front + editor iframe).
	 */
	public static function attach_dependencies() {
		self::register();
		$styles = wp_styles();
		if ( isset( $styles->registered[ self::STYLE_HANDLE ] ) && ! in_array( self::FA_HANDLE, $styles->registered[ self::STYLE_HANDLE ]->deps, true ) ) {
			$styles->registered[ self::STYLE_HANDLE ]->deps[] = self::FA_HANDLE;
		}
	}

	/**
	 * Editor iframe: make sure Font Awesome is present.
	 */
	public static function block_assets() {
		if ( is_admin() ) {
			self::register();
			wp_enqueue_style( self::FA_HANDLE );
			// Block viewScripts are not loaded in the editor canvas; the SSR preview needs window.BPTM.
			if ( wp_script_is( self::SCRIPT_HANDLE, 'registered' ) ) {
				wp_enqueue_script( self::SCRIPT_HANDLE );
			}
		}
	}

	/**
	 * Enqueue everything a rendered instance needs (block, shortcode, template contexts).
	 */
	public static function enqueue_frontend() {
		self::register();
		wp_enqueue_style( self::FA_HANDLE );
		if ( wp_style_is( self::STYLE_HANDLE, 'registered' ) ) {
			wp_enqueue_style( self::STYLE_HANDLE );
		}
		if ( wp_script_is( self::SCRIPT_HANDLE, 'registered' ) ) {
			wp_enqueue_script( self::SCRIPT_HANDLE );
		}
	}

	/**
	 * Stylesheet links for markup delivered through REST (editor preview), printed once.
	 *
	 * @return string
	 */
	public static function inline_editor_links() {
		if ( self::$inline_done ) {
			return '';
		}
		self::$inline_done = true;
		// phpcs:ignore WordPress.WP.EnqueuedResources.NonEnqueuedStylesheet -- REST markup cannot use the enqueue queue.
		return '<link rel="stylesheet" class="bptm-fa-link" href="' . esc_url( add_query_arg( 'ver', self::FA_VERSION, BPTM_URL . 'assets/vendor/fontawesome/css/all.min.css' ) ) . '" media="all" />';
	}

	/**
	 * When "disable lazy load" is on, keep lazy-load plugins away from member images.
	 *
	 * @param array $attr Image attributes.
	 * @return array
	 */
	public static function no_lazy_attributes( $attr ) {
		if ( isset( $attr['class'] ) && false !== strpos( $attr['class'], 'bptm-img' ) && isset( $attr['data-no-lazy'] ) ) {
			$attr['loading'] = 'eager';
			unset( $attr['decoding'] );
		}
		return $attr;
	}
}

Assets::hooks();
