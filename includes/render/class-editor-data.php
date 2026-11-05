<?php
/**
 * Localizes window.bptmEditor for the block editor script.
 *
 * @package BPTM
 */

namespace BPTM\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Editor data.
 */
class Editor_Data {

	const HANDLE = 'icb-fold-out-reveal-editor-script';

	/**
	 * Hooks.
	 */
	public static function hooks() {
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'localize' ), 20 );
	}

	/**
	 * Option list helper.
	 *
	 * @param array $pairs value => label.
	 * @return array
	 */
	private static function options( array $pairs ) {
		$out = array();
		foreach ( $pairs as $value => $label ) {
			$out[] = array(
				'value' => (string) $value,
				'label' => $label,
			);
		}
		return $out;
	}

	/**
	 * Build the data object.
	 *
	 * @return array
	 */
	public static function data() {
		$themes = array();
		foreach ( Themes::all() as $id => $t ) {
			$themes[] = array(
				'id'          => $id,
				'value'       => $id,
				'label'       => $t['label'],
				'group'       => $t['group'],
				'layout'      => $t['layout'],
				'carousel'    => $t['carousel'],
				'filter'      => $t['filter'],
				'forced_link' => $t['forced_link'],
				'forced_view' => $t['forced_view'],
				'grouped'     => $t['grouped'],
				'visibility'  => Visibility::defaults( $id )['initial'],
			);
		}

		$sizes = array();
		$names = apply_filters(
			'image_size_names_choose', // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- core hook.
			array(
				'thumbnail' => __( 'Thumbnail', 'bp-team-member' ),
				'medium'    => __( 'Medium', 'bp-team-member' ),
				'large'     => __( 'Large', 'bp-team-member' ),
				'full'      => __( 'Full Size', 'bp-team-member' ),
			)
		);
		foreach ( get_intermediate_image_sizes() as $size ) {
			$sizes[ $size ] = isset( $names[ $size ] ) ? $names[ $size ] : ucwords( str_replace( array( '-', '_' ), ' ', $size ) );
		}
		$sizes['full'] = isset( $names['full'] ) ? $names['full'] : __( 'Full Size', 'bp-team-member' );

		$vis_fields = array();
		foreach ( Visibility::fields() as $key => $label ) {
			$vis_fields[] = array(
				'key'   => $key,
				'label' => $label,
			);
		}

		$taxes = array();
		if ( function_exists( 'bptm_taxonomies' ) ) {
			foreach ( bptm_taxonomies() as $key => $t ) {
				$taxes[] = array(
					'key'      => $key,
					'taxonomy' => $t['taxonomy'],
					'label'    => isset( $t['plural'] ) && $t['plural'] ? $t['plural'] : $t['label'],
					'enabled'  => ! empty( $t['enabled'] ),
				);
			}
		}

		$counts      = wp_count_posts( 'bptm_member' );
		$has_members = $counts && ! empty( $counts->publish );

		$styles5 = array(
			'default'     => __( 'Default', 'bp-team-member' ),
			'style-one'   => __( 'Style One', 'bp-team-member' ),
			'style-two'   => __( 'Style Two', 'bp-team-member' ),
			'style-three' => __( 'Style Three', 'bp-team-member' ),
			'style-four'  => __( 'Style Four', 'bp-team-member' ),
			'style-five'  => __( 'Style Five', 'bp-team-member' ),
		);
		$styles3 = array_slice( $styles5, 0, 4, true );

		$data = array(
			'themes'           => $themes,
			'thumbnailSizes'   => self::options( $sizes ),
			'fonts'            => Fonts::all(),
			'visibilityFields' => $vis_fields,
			'taxonomies'       => $taxes,
			'hasMembers'       => $has_members,
			'hasAcf'           => function_exists( 'acf_get_field_groups' ),
			'singleLinkType'   => function_exists( 'bptm_get_option' ) ? (string) bptm_get_option( 'single_link_type', 'single_page' ) : 'single_page',
			'adminUrls'        => array(
				'addMember' => admin_url( 'post-new.php?post_type=bptm_member' ),
				'members'   => admin_url( 'edit.php?post_type=bptm_member' ),
				'settings'  => admin_url( 'edit.php?post_type=bptm_member&page=bptm-settings' ),
			),
			'restRender'       => esc_url_raw( rest_url( 'bptm/v1/render' ) ),
			'options'          => array(
				'linkTypes'       => self::options(
					array(
						'default'     => __( 'Default (from settings)', 'bp-team-member' ),
						'single_page' => __( 'Single Page', 'bp-team-member' ),
						'popup'       => __( 'Popup', 'bp-team-member' ),
						'panel'       => __( 'Panel', 'bp-team-member' ),
						'drawer'      => __( 'Drawer', 'bp-team-member' ),
						'custom'      => __( 'Custom URL', 'bp-team-member' ),
						'none'        => __( 'None', 'bp-team-member' ),
					)
				),
				'popupStyles'     => self::options( $styles5 + array( 'style-six' => __( 'Style Six', 'bp-team-member' ) ) ),
				'panelStyles'     => self::options( $styles5 ),
				'drawerStyles'    => self::options( $styles5 ),
				'filterStyles'    => self::options( $styles5 ),
				'navStyles'       => self::options( $styles3 ),
				'dotStyles'       => self::options( $styles3 ),
				'paginationTypes' => self::options(
					array(
						'normal-pagination' => __( 'Normal Pagination', 'bp-team-member' ),
						'ajax-pagination'   => __( 'Ajax Pagination', 'bp-team-member' ),
						'load-more-button'  => __( 'Load More Button', 'bp-team-member' ),
						'load-more-scroll'  => __( 'Load More on Scroll', 'bp-team-member' ),
					)
				),
				'filterTypes'     => self::options(
					array(
						'normal-filter' => __( 'Normal Filter', 'bp-team-member' ),
						'ajax-filter'   => __( 'Ajax Filter', 'bp-team-member' ),
					)
				),
				'imageFilters'    => self::options(
					array(
						'none'       => __( 'None', 'bp-team-member' ),
						'blur'       => __( 'Blur', 'bp-team-member' ),
						'brightness' => __( 'Brightness', 'bp-team-member' ),
						'contrast'   => __( 'Contrast', 'bp-team-member' ),
						'grayscale'  => __( 'Grayscale', 'bp-team-member' ),
						'hue_rotate' => __( 'Hue Rotate', 'bp-team-member' ),
						'invert'     => __( 'Invert', 'bp-team-member' ),
						'opacity'    => __( 'Opacity', 'bp-team-member' ),
						'saturate'   => __( 'Saturate', 'bp-team-member' ),
						'sepia'      => __( 'Sepia', 'bp-team-member' ),
					)
				),
				'orderBy'         => self::options(
					array(
						'menu_order' => __( 'Custom Order', 'bp-team-member' ),
						'ID'         => __( 'Member ID', 'bp-team-member' ),
						'title'      => __( 'Member Name', 'bp-team-member' ),
						'date'       => __( 'Date', 'bp-team-member' ),
						'rand'       => __( 'Random', 'bp-team-member' ),
					)
				),
				'taxonomyOrderBy' => self::options(
					array(
						'order'   => __( 'Custom Order', 'bp-team-member' ),
						'term_id' => __( 'Term ID', 'bp-team-member' ),
						'name'    => __( 'Term Name', 'bp-team-member' ),
					)
				),
				'acfPositions'    => self::options(
					array(
						'after_skills'       => __( 'After Skills', 'bp-team-member' ),
						'after_description'  => __( 'After Description', 'bp-team-member' ),
						'after_meta_details' => __( 'After Meta Details', 'bp-team-member' ),
						'none'               => __( 'Theme Defined', 'bp-team-member' ),
					)
				),
				'shadows'         => self::options(
					array(
						''     => __( 'Theme Default', 'bp-team-member' ),
						'none' => __( 'None', 'bp-team-member' ),
						'sm'   => __( 'Small', 'bp-team-member' ),
						'md'   => __( 'Medium', 'bp-team-member' ),
						'lg'   => __( 'Large', 'bp-team-member' ),
						'xl'   => __( 'Extra Large', 'bp-team-member' ),
					)
				),
			),
		);
		return apply_filters( 'bptm_editor_data', $data );
	}

	/**
	 * Print the data before the editor script.
	 */
	public static function localize() {
		if ( ! wp_script_is( self::HANDLE, 'registered' ) && ! wp_script_is( self::HANDLE, 'enqueued' ) ) {
			return;
		}
		wp_add_inline_script( self::HANDLE, 'window.bptmEditor = ' . wp_json_encode( self::data() ) . ';', 'before' );
	}
}

Editor_Data::hooks();
