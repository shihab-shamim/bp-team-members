<?php
/**
 * tagDiv Composer block (file registered through td_api_block::add in builders.php;
 * tagDiv requires the class name to equal the block id).
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'td_block' ) && ! class_exists( 'td_bptm_team' ) ) {
	/**
	 * tagDiv block.
	 */
	class td_bptm_team extends td_block { // phpcs:ignore Generic.Classes.OpeningBraceSameLine.ContentAfterBrace, PEAR.NamingConventions.ValidClassName.Invalid, Generic.Files.OneObjectStructurePerFile.MultipleFound

		/**
		 * Render.
		 *
		 * @param array  $atts    Attributes.
		 * @param string $content Content.
		 * @return string
		 */
		public function render( $atts, $content = null ) {
			parent::render( $atts );
			unset( $content );
			$out  = method_exists( $this, 'get_block_css' ) ? $this->get_block_css() : '';
			$cls  = method_exists( $this, 'get_block_classes' ) ? $this->get_block_classes() : '';
			$out .= '<div class="td_bptm_team_block ' . esc_attr( $cls ) . '">';
			$out .= \BPTM\Integrations\bptm_builder_render( is_array( $atts ) ? $atts : array() );
			$out .= '</div>';
			return $out;
		}
	}
}
