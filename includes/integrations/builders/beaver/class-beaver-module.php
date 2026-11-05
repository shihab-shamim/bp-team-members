<?php
/**
 * Beaver Builder module (loaded from builders.php only when Beaver Builder is active).
 * Output: includes/frontend.php in this folder.
 *
 * @package BPTM
 */

namespace BPTM\Integrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Beaver module.
 */
class Beaver_Module extends \FLBuilderModule {

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct(
			array(
				'name'            => __( 'BP Team Member', 'bp-team-member' ),
				'description'     => __( 'Team members showcase or list', 'bp-team-member' ),
				'group'           => __( 'BP Team Member', 'bp-team-member' ),
				'category'        => __( 'Basic', 'bp-team-member' ),
				'dir'             => __DIR__ . '/',
				'url'             => plugins_url( '', __FILE__ ) . '/',
				'icon'            => 'groups.svg',
				'editor_export'   => true,
				'enabled'         => true,
				'partial_refresh' => true,
			)
		);
		if ( class_exists( '\BPTM\Render\Assets' ) ) {
			$this->add_css( \BPTM\Render\Assets::FA_HANDLE );
		}
	}

	/**
	 * Use a dashicon instead of a bundled SVG file.
	 *
	 * @param string $icon Icon file.
	 * @return string
	 */
	public function get_icon( $icon = '' ) {
		unset( $icon );
		return '<span class="dashicons dashicons-groups" aria-hidden="true"></span>';
	}
}
