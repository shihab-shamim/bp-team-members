<?php
/**
 * "Quick" rendering without a saved Showcase: shortcode attributes / widget / page-builder
 * settings are mapped onto block attributes and rendered by the block renderer (with the block's
 * default sample members, since members live in the block).
 *
 *   [bp_team theme="grid-1" number="6" group="Design,Marketing" columns="3" orderby="title" order="ASC"]
 *   [bp_team id="12" number="3"]                 (showcase with overrides)
 *   [bp_team_sidebar total_mem="3" group_mem="Design"]
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Quick render helpers.
 */
class Quick {

	/**
	 * Default theme of the sidebar shortcode / widget.
	 */
	const SIDEBAR_THEME = 'sidebar-1';

	/**
	 * Shortcode attribute names understood by map() (aliases included).
	 *
	 * @return array
	 */
	public static function keys() {
		return array(
			'theme',
			'number',
			'total_mem',
			'count',
			'group',
			'group_mem',
			'exclude_group',
			'columns',
			'columns_tablet',
			'columns_mobile',
			'orderby',
			'order',
			'link',
			'view',
			'popup_style',
			'panel_style',
			'drawer_style',
			'gap',
			'pagination',
			'per_page',
			'class',
		);
	}

	/**
	 * Comma separated list of group names (matched case-insensitively, slugs work too).
	 *
	 * @param string $value Value.
	 * @return array
	 */
	private static function list_of( $value ) {
		$out = array();
		foreach ( explode( ',', (string) $value ) as $part ) {
			$part = sanitize_text_field( $part );
			if ( '' === $part || in_array( strtolower( $part ), array( 'all', '*' ), true ) ) {
				continue;
			}
			$out[] = $part;
		}
		return array_values( array_unique( $out ) );
	}

	/**
	 * Map shortcode / widget / builder settings onto block attributes (only the keys given).
	 *
	 * @param array $atts Raw attributes.
	 * @return array Block attributes (unsanitized; the renderer sanitizes and validates).
	 */
	public static function map( $atts ) {
		$atts = is_array( $atts ) ? $atts : array();
		$get  = static function ( $keys ) use ( $atts ) {
			foreach ( (array) $keys as $key ) {
				if ( isset( $atts[ $key ] ) && '' !== trim( (string) $atts[ $key ] ) ) {
					return trim( (string) $atts[ $key ] );
				}
			}
			return null;
		};
		$out  = array();

		$theme = $get( 'theme' );
		if ( null !== $theme ) {
			$out['theme'] = sanitize_key( $theme );
		}

		$number = $get( array( 'number', 'total_mem', 'count' ) );
		if ( null !== $number ) {
			$number                 = (int) $number;
			$out['numberOfMembers'] = $number > 0 ? $number : -1;
		}

		$group = $get( array( 'group', 'group_mem' ) );
		if ( null !== $group ) {
			$out['includeGroups'] = self::list_of( $group );
		}
		$exclude = $get( 'exclude_group' );
		if ( null !== $exclude ) {
			$out['excludeGroups'] = self::list_of( $exclude );
		}

		$cols = $get( 'columns' );
		if ( null !== $cols ) {
			$d              = max( 1, min( 6, (int) $cols ) );
			$t              = $get( 'columns_tablet' );
			$mo             = $get( 'columns_mobile' );
			$out['columns'] = array(
				'desktop'        => $d,
				'tablet'         => null !== $t ? max( 1, min( 6, (int) $t ) ) : min( $d, 3 ),
				'mobilePortrait' => null !== $mo ? max( 1, min( 4, (int) $mo ) ) : min( $d, 2 ),
				'mobile'         => null !== $mo ? max( 1, min( 4, (int) $mo ) ) : 1,
			);
		}

		$orderby = $get( 'orderby' );
		if ( null !== $orderby ) {
			$out['orderBy'] = sanitize_text_field( $orderby );
		}
		$order = $get( 'order' );
		if ( null !== $order ) {
			$out['order'] = strtoupper( sanitize_key( $order ) );
		}

		$link = $get( 'link' );
		if ( null !== $link ) {
			$link            = sanitize_key( str_replace( '-', '_', $link ) );
			// Single member pages no longer exist: "single" / "single_page" mean the member's custom URL.
			$out['linkType'] = in_array( $link, array( 'single', 'single_page' ), true ) ? 'custom' : $link;
		}

		$view = $get( 'view' );
		if ( null !== $view ) {
			$view                   = sanitize_key( $view );
			$out['carouselEnabled'] = 'carousel' === $view;
			$out['filterEnabled']   = 'filter' === $view;
		}

		foreach ( array(
			'popup_style'  => 'popupStyle',
			'panel_style'  => 'panelStyle',
			'drawer_style' => 'drawerStyle',
		) as $key => $attr ) {
			$val = $get( $key );
			if ( null !== $val ) {
				$out[ $attr ] = sanitize_key( $val );
			}
		}

		$gap = $get( 'gap' );
		if ( null !== $gap ) {
			$out['columnGap'] = max( 0, (float) $gap );
			$out['rowGap']    = max( 0, (float) $gap );
		}

		$pagination = $get( 'pagination' );
		if ( null !== $pagination ) {
			$pagination = sanitize_key( $pagination );
			$types      = array(
				'normal'   => 'normal-pagination',
				'ajax'     => 'normal-pagination',
				'button'   => 'load-more-button',
				'loadmore' => 'load-more-button',
				'scroll'   => 'load-more-scroll',
				'infinite' => 'load-more-scroll',
			);
			if ( isset( $types[ $pagination ] ) ) {
				$out['paginationEnabled'] = true;
				$out['paginationType']    = $types[ $pagination ];
			} else {
				$out['paginationEnabled'] = in_array( $pagination, array( '1', 'yes', 'true', 'on' ), true );
			}
		}
		$per_page = $get( 'per_page' );
		if ( null !== $per_page ) {
			$out['perPage']      = max( 1, (int) $per_page );
			$out['initialItems'] = max( 1, (int) $per_page );
		}

		$class = $get( 'class' );
		if ( null !== $class ) {
			$out['className'] = implode( ' ', array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', $class ) ) ) );
		}

		return (array) apply_filters( 'bptm_quick_attributes', $out, $atts );
	}

	/**
	 * Render block attributes outside a block context.
	 *
	 * @param array $attributes Block attributes.
	 * @return string
	 */
	public static function render( array $attributes ) {
		if ( ! class_exists( __NAMESPACE__ . '\\Block' ) ) {
			return '';
		}
		static $depth = 0;
		if ( $depth > 2 ) {
			return '';
		}
		++$depth;
		$html = Block::render( $attributes );
		--$depth;
		return $html . self::builder_init_script();
	}

	/**
	 * Sidebar defaults (GS-compatible [gs_team_sidebar] behaviour: all members, one column, compact theme).
	 *
	 * @return array
	 */
	public static function sidebar_defaults() {
		return array(
			'theme'                 => self::SIDEBAR_THEME,
			'numberOfMembers'       => -1,
			'columns'               => array(
				'desktop'        => 1,
				'tablet'         => 1,
				'mobilePortrait' => 1,
				'mobile'         => 1,
			),
			'enableScrollAnimation' => false,
			'alignment'             => 'left',
		);
	}

	/**
	 * [bp_team_sidebar total_mem="3" group_mem="Design"] (also number/group/theme/... from keys()).
	 *
	 * @param array|string $atts Attributes.
	 * @return string
	 */
	public static function sidebar_shortcode( $atts ) {
		$atts       = is_array( $atts ) ? $atts : array();
		$attributes = array_merge( self::sidebar_defaults(), self::map( $atts ) );
		if ( ! isset( $atts['columns'] ) ) {
			$attributes['columns'] = self::sidebar_defaults()['columns'];
		}
		return '<div class="bptm-sidebar-list">' . self::render( $attributes ) . '</div>';
	}

	/**
	 * Is the request a page-builder editing preview (content inserted after page load)?
	 *
	 * @return bool
	 */
	public static function is_builder_preview() {
		// phpcs:disable WordPress.Security.NonceVerification -- read-only detection of builder preview requests.
		$preview = false;
		if ( ! empty( $_GET['vc_editable'] ) || ( isset( $_POST['action'] ) && 'vc_load_shortcode' === $_POST['action'] ) ) {
			$preview = true; // WPBakery front-end editor.
		} elseif ( isset( $_GET['fl_builder'] ) || isset( $_GET['fl_builder_ui_iframe'] ) || ! empty( $_POST['fl_builder_data'] ) ) {
			$preview = true; // Beaver Builder.
		} elseif ( ! empty( $_GET['et_fb'] ) || ( isset( $_POST['action'] ) && 0 === strpos( sanitize_key( wp_unslash( $_POST['action'] ) ), 'et_fb_' ) ) ) {
			$preview = true; // Divi visual builder.
		} elseif ( ! empty( $_GET['ct_builder'] ) || ( isset( $_GET['action'] ) && 0 === strpos( sanitize_key( wp_unslash( $_GET['action'] ) ), 'oxy_render_' ) ) ) {
			$preview = true; // Oxygen.
		} elseif ( ! empty( $GLOBALS['load_in_composer_iframe'] ) || ! empty( $_GET['td_action'] ) ) {
			$preview = true; // tagDiv Composer.
		} elseif ( isset( $_POST['action'] ) && 'elementor_ajax' === $_POST['action'] ) {
			$preview = true; // Elementor.
		}
		// phpcs:enable
		return (bool) apply_filters( 'bptm_is_builder_preview', $preview );
	}

	/**
	 * Inline initializer for markup injected by page builders after load.
	 *
	 * @return string
	 */
	public static function builder_init_script() {
		if ( ! self::is_builder_preview() ) {
			return '';
		}
		return '<script>(function(s){var r=s&&s.parentNode;function go(){if(window.BPTM&&window.BPTM.init){window.BPTM.init(r||document);return true;}return false;}if(!go()){var n=0,t=setInterval(function(){if(go()||++n>40){clearInterval(t);}},250);}})(document.currentScript);</script>';
	}

	/**
	 * [bp_team theme="grid-1" number="6" group="Sales" …]: a team list from inline attributes
	 * (block defaults when none are given; the theme defaults to Grid 5).
	 *
	 * @param array|string $atts Attributes.
	 * @return string
	 */
	public static function shortcode( $atts ) {
		$atts       = is_array( $atts ) ? $atts : array();
		$attributes = self::map( shortcode_atts( array_fill_keys( self::keys(), '' ), $atts, 'bp_team' ) );
		if ( empty( $attributes['theme'] ) ) {
			$attributes['theme'] = 'grid-5';
		}
		return self::render( $attributes );
	}
}

add_shortcode( 'bp_team', array( __NAMESPACE__ . '\\Quick', 'shortcode' ) );
add_shortcode( 'bp_team_sidebar', array( __NAMESPACE__ . '\\Quick', 'sidebar_shortcode' ) );
