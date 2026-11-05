<?php
/**
 * Elementor widget class (loaded only from the Elementor register hook).
 *
 * @package BPTM
 */

namespace BPTM\Integrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Elementor widget.
 */
class Elementor_Widget extends \Elementor\Widget_Base {

	/**
	 * Name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'bptm-team';
	}

	/**
	 * Title.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'BP Team Member', 'bp-team-member' );
	}

	/**
	 * Icon.
	 *
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-person';
	}

	/**
	 * Categories.
	 *
	 * @return array
	 */
	public function get_categories() {
		return array( 'general' );
	}

	/**
	 * Keywords.
	 *
	 * @return array
	 */
	public function get_keywords() {
		return array( 'team', 'member', 'staff', 'showcase' );
	}

	/**
	 * Style deps.
	 *
	 * @return array
	 */
	public function get_style_depends() {
		return array( 'icb-fold-out-reveal-style', 'bptm-fontawesome' );
	}

	/**
	 * Script deps.
	 *
	 * @return array
	 */
	public function get_script_depends() {
		return array( 'icb-fold-out-reveal-view-script' );
	}

	/**
	 * Controls.
	 */
	protected function register_controls() {
		$choices = class_exists( '\BPTM\Showcase' ) ? \BPTM\Showcase::choices() : array();
		$options = array( '0' => __( '— Select —', 'bp-team-member' ) );
		foreach ( $choices as $id => $label ) {
			$options[ (string) $id ] = $label;
		}

		$this->start_controls_section(
			'bptm_section',
			array( 'label' => __( 'Team Members', 'bp-team-member' ) )
		);
		// Default stays "showcase" so widgets saved before the list mode keep rendering their showcase.
		$this->add_control(
			'source',
			array(
				'label'   => __( 'Content', 'bp-team-member' ),
				'type'    => \Elementor\Controls_Manager::SELECT,
				'options' => array(
					'showcase' => __( 'A saved showcase', 'bp-team-member' ),
					'quick'    => __( 'Team members list', 'bp-team-member' ),
				),
				'default' => 'showcase',
			)
		);
		$this->add_control(
			'showcase',
			array(
				'label'     => __( 'Showcase', 'bp-team-member' ),
				'type'      => \Elementor\Controls_Manager::SELECT,
				'options'   => $options,
				'default'   => '0',
				'condition' => array( 'source' => 'showcase' ),
			)
		);
		if ( function_exists( __NAMESPACE__ . '\bptm_builder_fields' ) ) {
			foreach ( bptm_builder_fields() as $key => $def ) {
				if ( in_array( $key, array( 'source', 'showcase' ), true ) ) {
					continue;
				}
				list( $type, $label, $choices, $default ) = $def;
				$control = array(
					'label'     => $label,
					'type'      => 'number' === $type ? \Elementor\Controls_Manager::NUMBER : \Elementor\Controls_Manager::SELECT,
					'default'   => $default,
					'condition' => array( 'source' => 'quick' ),
				);
				if ( 'number' === $type ) {
					$control['min'] = -1;
				} else {
					$control['options'] = $choices;
				}
				$this->add_control( $key, $control );
			}
		}
		$this->add_control(
			'bptm_help',
			array(
				'type'            => \Elementor\Controls_Manager::RAW_HTML,
				'raw'             => sprintf(
					'<a href="%1$s" target="_blank">%2$s</a>',
					esc_url( admin_url( 'post-new.php?post_type=bptm_showcase' ) ),
					esc_html__( 'Create a new showcase', 'bp-team-member' )
				),
				'content_classes' => 'elementor-descriptor',
			)
		);
		$this->end_controls_section();
	}

	/**
	 * Render.
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();
		$id       = isset( $settings['showcase'] ) ? absint( $settings['showcase'] ) : 0;
		$quick    = isset( $settings['source'] ) && 'quick' === $settings['source'];
		$edit     = class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->editor ) && \Elementor\Plugin::$instance->editor->is_edit_mode();

		if ( ! $id && ! $quick ) {
			if ( $edit ) {
				echo '<p>' . esc_html__( 'Select a showcase in the widget settings.', 'bp-team-member' ) . '</p>';
			}
			return;
		}
		if ( $quick && class_exists( '\BPTM\Quick' ) ) {
			$html = \BPTM\Quick::render_settings( array_map( 'strval', array_filter( (array) $settings, 'is_scalar' ) ) );
		} else {
			$html = class_exists( '\BPTM\Showcase' ) ? \BPTM\Showcase::render( $id ) : '';
		}
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered block output.
		if ( $edit ) {
			echo '<script>(function(s){if(window.BPTM&&window.BPTM.init){window.BPTM.init(s.parentNode);}})(document.currentScript);</script>';
		}
	}
}
