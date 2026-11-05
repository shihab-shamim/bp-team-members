<?php
/**
 * Plugin Name: BP Team Member
 * Description: BP Team Member is a WordPress plugin that allows you to showcase your team members beautifully on your website.
 * Version: 1.0.0
 * Author: bPlugins
 * Author URI: https://bplugins.com
 * License: GPLv3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.txt
 * Text Domain: bp-team-member
 * Domain Path: /languages
 * Requires at least: 6.3
 * Requires PHP: 7.4
 */

// ABS PATH
if ( !defined( 'ABSPATH' ) ) { exit; }

// Constant
define( 'DFORC_VERSION', isset( $_SERVER['HTTP_HOST'] ) && 'localhost' === $_SERVER['HTTP_HOST'] ? time() : '1.0.0' );
define( 'DFORC_DIR_URL', plugin_dir_url( __FILE__ ) );
define( 'DFORC_DIR_PATH', plugin_dir_path( __FILE__ ) );

define( 'BPTM_FILE', __FILE__ );
require_once __DIR__ . '/includes/bootstrap.php';

if( !class_exists( 'DFORCPlugin' ) ){
	class DFORCPlugin{
		function __construct(){
			add_action( 'init', [ $this, 'onInit' ] );
		}

		function onInit(){
			register_block_type( __DIR__ . '/build' );
		}
	}
	new DFORCPlugin();
}