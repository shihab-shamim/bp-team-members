<?php
/**
 * Divi module (loaded from builders.php on `et_builder_ready` only).
 *
 * `vb_support = partial`: the Visual Builder renders the module through Divi's
 * server-side preview of render(), so the live preview uses the real markup.
 *
 * @package BPTM
 */

namespace BPTM\Integrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Divi module.
 */
class Divi_Module extends \ET_Builder_Module {

	/**
	 * Module slug.
	 *
	 * @var string
	 */
	public $slug = 'et_pb_bptm_team';

	/**
	 * Visual builder support.
	 *
	 * @var string
	 */
	public $vb_support = 'partial';

	/**
	 * Init.
	 */
	public function init() {
		$this->name             = esc_html__( 'BP Team Member', 'bp-team-member' );
		$this->icon             = 'U';
		$this->main_css_element = '%%order_class%%.et_pb_bptm_team';
		$this->settings_modal_toggles = array(
			'general' => array(
				'toggles' => array(
					'main_content' => esc_html__( 'Team members', 'bp-team-member' ),
				),
			),
		);
	}

	/**
	 * Fields.
	 *
	 * @return array
	 */
	public function get_fields() {
		$out = array();
		foreach ( bptm_builder_fields() as $key => $def ) {
			list( $type, $label, $choices, $default ) = $def;
			$field = array(
				'label'           => $label,
				'type'            => 'number' === $type ? 'text' : 'select',
				'option_category' => 'basic_option',
				'toggle_slug'     => 'main_content',
				'default'         => $default,
			);
			if ( 'number' !== $type ) {
				$field['options'] = $choices;
			}
			if ( 'source' !== $key ) {
				$field['show_if'] = 'showcase' === $key ? array( 'source' => 'showcase' ) : array( 'source' => 'quick' );
			}
			$out[ $key ] = $field;
		}
		return $out;
	}

	/**
	 * Render.
	 *
	 * @param array  $attrs       Unprocessed attributes.
	 * @param string $content     Content.
	 * @param string $render_slug Slug.
	 * @return string
	 */
	public function render( $attrs, $content = null, $render_slug = '' ) {
		unset( $attrs, $content, $render_slug );
		return bptm_builder_render( is_array( $this->props ) ? $this->props : array() );
	}
}
