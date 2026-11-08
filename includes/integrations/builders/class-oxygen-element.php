<?php
/**
 * Oxygen element (loaded from builders.php only when Oxygen's OxyEl API exists).
 *
 * @package BPTM
 */

namespace BPTM\Integrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Oxygen element.
 */
class Oxygen_Element extends \OxyEl {

	/**
	 * Init: assets inside the builder iframe.
	 */
	public function init() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Enqueue frontend assets in the Oxygen builder iframe.
	 */
	public function enqueue_scripts() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only builder detection.
		if ( ! empty( $_GET['ct_builder'] ) && class_exists( '\BPTM\Block' ) ) {
			\BPTM\Block::enqueue_frontend();
		}
	}

	/**
	 * Name.
	 *
	 * @return string
	 */
	public function name() {
		return __( 'BP Team Member', 'bp-team-member' );
	}

	/**
	 * Slug.
	 *
	 * @return string
	 */
	public function slug() {
		return 'bptm-team';
	}

	/**
	 * Icon URL.
	 *
	 * @return string
	 */
	public function icon() {
		return BPTM_URL . 'assets/img/placeholder.svg';
	}

	/**
	 * Controls.
	 */
	public function controls() {
		foreach ( bptm_builder_fields() as $key => $def ) {
			list( $type, $label, $choices, $default ) = $def;
			$control = $this->addOptionControl(
				array(
					'type'    => 'number' === $type ? 'textfield' : 'dropdown',
					'name'    => $label,
					'slug'    => $key,
					'default' => $default,
				)
			);
			if ( 'number' !== $type && is_object( $control ) && method_exists( $control, 'setValue' ) ) {
				$control->setValue( $choices );
			}
			if ( is_object( $control ) && method_exists( $control, 'rebuildElementOnChange' ) ) {
				$control->rebuildElementOnChange();
			}
		}
	}

	/**
	 * Render.
	 *
	 * @param array  $options  Options.
	 * @param array  $defaults Defaults.
	 * @param string $content  Content.
	 */
	public function render( $options, $defaults, $content ) {
		unset( $content );
		$settings = array_merge( is_array( $defaults ) ? $defaults : array(), is_array( $options ) ? $options : array() );
		echo bptm_builder_render( $settings ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered block output.
	}
}
