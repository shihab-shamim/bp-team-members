<?php
/**
 * BP Team Member bootstrap: constants + file loader.
 *
 * Every included file must be safe to load in any order: it may only declare
 * classes/functions and register hooks (no work at include time).
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'BPTM_VERSION' ) ) {
	define( 'BPTM_VERSION', '1.0.0' );
}
if ( ! defined( 'BPTM_FILE' ) ) {
	define( 'BPTM_FILE', dirname( __DIR__ ) . '/test-purpose.php' );
}
if ( ! defined( 'BPTM_DIR' ) ) {
	define( 'BPTM_DIR', plugin_dir_path( BPTM_FILE ) );
}
if ( ! defined( 'BPTM_URL' ) ) {
	define( 'BPTM_URL', plugin_dir_url( BPTM_FILE ) );
}

/**
 * Load plugin files. functions.php first, then everything else alphabetically per folder.
 */
function bptm_load_files() {
	$dirs = array( 'includes', 'includes/render', 'includes/render/themes', 'includes/integrations' );

	if ( file_exists( BPTM_DIR . 'includes/functions.php' ) ) {
		require_once BPTM_DIR . 'includes/functions.php';
	}

	foreach ( $dirs as $dir ) {
		$files = glob( BPTM_DIR . $dir . '/*.php' );
		if ( ! $files ) {
			continue;
		}
		sort( $files );
		foreach ( $files as $file ) {
			$base = basename( $file );
			if ( 'bootstrap.php' === $base || 'functions.php' === $base ) {
				continue;
			}
			require_once $file;
		}
	}
}
bptm_load_files();
