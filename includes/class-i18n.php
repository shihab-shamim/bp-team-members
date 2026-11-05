<?php
/**
 * Translations: PHP text domain and block editor script translations.
 *
 * Files: languages/bp-team-member.pot (template), languages/bp-team-member-{locale}.mo for PHP,
 * languages/bp-team-member-{locale}-{md5}.json for scripts (generated with `wp i18n make-json`).
 * Translations installed by WordPress.org (wp-content/languages/plugins) take precedence.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * I18n.
 */
class I18n {

	const DOMAIN = 'bp-team-member';

	/**
	 * Hooks.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'load_textdomain' ), 0 );
		// After the block (registered on init 10) so the script handles exist.
		add_action( 'init', array( __CLASS__, 'script_translations' ), 100 );
	}

	/**
	 * Plugin languages directory (absolute, trailing slash).
	 *
	 * @return string
	 */
	public static function dir() {
		return BPTM_DIR . 'languages/';
	}

	/**
	 * Load the PHP text domain from the plugin's languages folder.
	 */
	public static function load_textdomain() {
		load_plugin_textdomain( self::DOMAIN, false, dirname( plugin_basename( BPTM_FILE ) ) . '/languages' );
	}

	/**
	 * Point the block's script translations at the plugin languages folder.
	 */
	public static function script_translations() {
		if ( ! function_exists( 'wp_set_script_translations' ) ) {
			return;
		}
		// The view script has no translatable strings (they come from PHP in data-bptm), so only the editor script.
		$handles = array( 'icb-fold-out-reveal-editor-script' );
		$scripts = wp_scripts();
		foreach ( $handles as $handle ) {
			if ( isset( $scripts->registered[ $handle ] ) ) {
				wp_set_script_translations( $handle, self::DOMAIN, self::dir() );
			}
		}
	}
}

I18n::init();
