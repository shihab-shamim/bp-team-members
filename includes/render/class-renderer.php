<?php
/**
 * Renderer: block / shortcode / REST entry point.
 *
 * @package BPTM
 */

namespace BPTM\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renderer.
 */
class Renderer {

	/**
	 * Block attribute schema cache.
	 *
	 * @var array|null
	 */
	private static $schema = null;

	/**
	 * Uids used in this request.
	 *
	 * @var array
	 */
	private static $uids = array();

	/**
	 * Custom CSS printed?
	 *
	 * @var bool
	 */
	private static $custom_css_done = false;

	/**
	 * Enumerated attribute values (first = fallback).
	 */
	const ENUMS = array(
		'filterType'          => array( 'normal-filter', 'ajax-filter' ),
		'linkType'            => array( 'default', 'single_page', 'popup', 'panel', 'drawer', 'custom', 'none' ),
		'linkTarget'          => array( '_self', '_blank' ),
		'popupColumns'        => array( 'two', 'one' ),
		'panelPosition'       => array( 'right', 'left' ),
		'imageFilter'         => array( 'none', 'blur', 'brightness', 'contrast', 'grayscale', 'hue_rotate', 'invert', 'opacity', 'saturate', 'sepia' ),
		'hoverImageFilter'    => array( 'none', 'blur', 'brightness', 'contrast', 'grayscale', 'hue_rotate', 'invert', 'opacity', 'saturate', 'sepia' ),
		'acfFieldsPosition'   => array( 'after_skills', 'after_description', 'after_meta_details', 'none' ),
		'orderBy'             => array( 'date', 'ID', 'title', 'rand', 'menu_order', 'modified', 'name' ),
		'order'               => array( 'DESC', 'ASC' ),
		'taxonomyOrderBy'     => array( 'name', 'term_id', 'order', 'slug', 'count', 'menu_order', 'term_order' ),
		'taxonomyOrder'       => array( 'ASC', 'DESC' ),
		'filterColumns'       => array( 'two', 'three' ),
		'filterCatPosition'   => array( 'center', 'left', 'right' ),
		'filterStyle'         => array( 'default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five' ),
		'paginationType'      => array( 'normal-pagination', 'ajax-pagination', 'load-more-button', 'load-more-scroll' ),
		'carouselNavsStyle'   => array( 'default', 'style-one', 'style-two', 'style-three' ),
		'carouselDotsStyle'   => array( 'default', 'style-one', 'style-two', 'style-three' ),
		'alignment'           => array( 'center', 'left', 'right' ),
	);

	/* ---------------------------------------------------------------------
	 * Attributes
	 * ------------------------------------------------------------------- */

	/**
	 * Attribute schema from block.json.
	 *
	 * @return array
	 */
	public static function schema() {
		if ( null !== self::$schema ) {
			return self::$schema;
		}
		self::$schema = array();
		$dir          = defined( 'BPTM_DIR' ) ? BPTM_DIR : trailingslashit( dirname( __DIR__, 2 ) );
		foreach ( array( 'src/block.json', 'build/block.json' ) as $file ) {
			if ( file_exists( $dir . $file ) ) {
				$json = json_decode( (string) file_get_contents( $dir . $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
				if ( is_array( $json ) && ! empty( $json['attributes'] ) ) {
					self::$schema = $json['attributes'];
					break;
				}
			}
		}
		return self::$schema;
	}

	/**
	 * Default attribute values.
	 *
	 * @return array
	 */
	public static function defaults() {
		$out = array();
		foreach ( self::schema() as $key => $def ) {
			$out[ $key ] = array_key_exists( 'default', $def ) ? $def['default'] : self::empty_of( isset( $def['type'] ) ? $def['type'] : 'string' );
		}
		return $out;
	}

	/**
	 * Empty value for a type.
	 *
	 * @param string|array $type Type.
	 * @return mixed
	 */
	private static function empty_of( $type ) {
		$type = is_array( $type ) ? reset( $type ) : $type;
		switch ( $type ) {
			case 'boolean':
				return false;
			case 'number':
			case 'integer':
				return 0;
			case 'array':
			case 'object':
				return array();
			default:
				return '';
		}
	}

	/**
	 * Merge defaults + coerce to schema types + validate enums.
	 *
	 * @param array $atts Raw attributes.
	 * @return array
	 */
	public static function sanitize( $atts ) {
		$atts   = is_array( $atts ) ? $atts : array();
		$schema = self::schema();
		$out    = self::defaults();
		foreach ( $atts as $key => $val ) {
			if ( ! isset( $schema[ $key ] ) ) {
				// Keep core supports attributes (className, anchor, align, lock, ...) as plain strings.
				if ( in_array( $key, array( 'className', 'anchor', 'align' ), true ) && is_string( $val ) ) {
					$out[ $key ] = sanitize_text_field( $val );
				}
				continue;
			}
			$type = isset( $schema[ $key ]['type'] ) ? $schema[ $key ]['type'] : 'string';
			$type = is_array( $type ) ? reset( $type ) : $type;
			switch ( $type ) {
				case 'boolean':
					$out[ $key ] = rest_sanitize_boolean( $val );
					break;
				case 'number':
					$out[ $key ] = is_numeric( $val ) ? $val + 0 : $out[ $key ];
					break;
				case 'integer':
					$out[ $key ] = is_numeric( $val ) ? (int) $val : $out[ $key ];
					break;
				case 'array':
					$out[ $key ] = is_array( $val ) ? self::clean_deep( array_values( $val ) ) : ( is_string( $val ) && '' !== $val ? array_map( 'trim', explode( ',', $val ) ) : array() );
					break;
				case 'object':
					$out[ $key ] = is_array( $val ) ? self::clean_deep( $val ) : $out[ $key ];
					break;
				default:
					$out[ $key ] = is_scalar( $val ) ? sanitize_text_field( (string) $val ) : $out[ $key ];
			}
		}
		foreach ( self::ENUMS as $key => $allowed ) {
			if ( isset( $out[ $key ] ) && ! in_array( $out[ $key ], $allowed, true ) ) {
				$out[ $key ] = isset( $schema[ $key ]['default'] ) && in_array( $schema[ $key ]['default'], $allowed, true ) ? $schema[ $key ]['default'] : $allowed[0];
			}
		}
		foreach ( array( 'popupStyle', 'panelStyle', 'drawerStyle', 'thumbnailSize', 'theme' ) as $key ) {
			if ( isset( $out[ $key ] ) ) {
				$out[ $key ] = sanitize_key( $out[ $key ] );
			}
		}
		if ( '' === $out['thumbnailSize'] ) {
			$out['thumbnailSize'] = 'large';
		}
		$out['numberOfMembers'] = isset( $out['numberOfMembers'] ) ? (int) $out['numberOfMembers'] : -1;
		foreach ( array( 'perPage', 'initialItems', 'loadPerClick', 'perLoad', 'carouselItemsToScroll' ) as $key ) {
			$out[ $key ] = max( 1, (int) $out[ $key ] );
		}
		$out['carouselSpeed']           = max( 100, min( 10000, (int) $out['carouselSpeed'] ) );
		$out['carouselAutoplayTimeout'] = max( 500, min( 60000, (int) $out['carouselAutoplayTimeout'] ) );
		$out['detailsLength']           = max( 0, (int) $out['detailsLength'] );
		$out['columnGap']               = max( 0, min( 200, (float) $out['columnGap'] ) );
		$out['rowGap']                  = max( 0, min( 200, (float) $out['rowGap'] ) );
		return apply_filters( 'bptm_sanitized_attributes', $out, $atts );
	}

	/**
	 * Recursively sanitize nested scalars.
	 *
	 * @param array $arr Array.
	 * @param int   $depth Depth.
	 * @return array
	 */
	private static function clean_deep( array $arr, $depth = 0 ) {
		$out = array();
		if ( $depth > 4 ) {
			return $out;
		}
		foreach ( $arr as $k => $v ) {
			$k = is_int( $k ) ? $k : preg_replace( '/[^A-Za-z0-9_-]/', '', (string) $k );
			if ( is_array( $v ) ) {
				$out[ $k ] = self::clean_deep( $v, $depth + 1 );
			} elseif ( is_bool( $v ) || is_int( $v ) || is_float( $v ) || null === $v ) {
				$out[ $k ] = $v;
			} else {
				$out[ $k ] = sanitize_text_field( (string) $v );
			}
		}
		return $out;
	}

	/**
	 * Which view applies.
	 *
	 * @param array $atts  Attributes.
	 * @param array $theme Theme.
	 * @return string grid|carousel|filter
	 */
	public static function view( array $atts, array $theme ) {
		if ( 'carousel' === $theme['forced_view'] ) {
			return 'carousel';
		}
		if ( 'filter' === $theme['forced_view'] ) {
			return 'filter';
		}
		if ( ! empty( $atts['carouselEnabled'] ) && $theme['carousel'] && 'table' !== $theme['layout'] && empty( $theme['grouped'] ) ) {
			return 'carousel';
		}
		if ( ! empty( $atts['filterEnabled'] ) && $theme['filter'] ) {
			return 'filter';
		}
		return 'grid';
	}

	/**
	 * Stable uid for an instance.
	 *
	 * @param array $atts Attributes.
	 * @return string
	 */
	public static function uid( array $atts ) {
		$base = substr( md5( (string) wp_json_encode( $atts ) ), 0, 8 );
		// Editor previews render each block in its own REST request, so two blocks with identical
		// attributes would share an id inside the editor canvas; salt those ids.
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST && is_user_logged_in() && false !== strpos( isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '', 'block-renderer' ) ) {
			$base .= substr( md5( wp_generate_uuid4() ), 0, 4 );
		}
		$uid  = $base;
		$n    = 1;
		while ( isset( self::$uids[ $uid ] ) ) {
			++$n;
			$uid = $base . '-' . $n;
		}
		self::$uids[ $uid ] = true;
		return $uid;
	}

	/* ---------------------------------------------------------------------
	 * Templates
	 * ------------------------------------------------------------------- */

	/**
	 * Locate a template: child theme / theme `bp-team-member/{rel}.php` then plugin `templates/{rel}.php`.
	 *
	 * @param string $rel Relative path without extension.
	 * @return string '' when not found.
	 */
	public static function locate( $rel ) {
		$rel = trim( str_replace( array( '..', '\\' ), array( '', '/' ), (string) $rel ), '/' );
		if ( '' === $rel ) {
			return '';
		}
		$file   = $rel . '.php';
		$folder = trim( (string) apply_filters( 'bptm_templates_folder', 'bp-team-member' ), '/' );
		$found  = '' !== $folder ? locate_template( array( $folder . '/' . $file ) ) : '';
		if ( ! $found ) {
			$dir   = defined( 'BPTM_DIR' ) ? BPTM_DIR : trailingslashit( dirname( __DIR__, 2 ) );
			$found = file_exists( $dir . 'templates/' . $file ) ? $dir . 'templates/' . $file : '';
		}
		return (string) apply_filters( 'bptm_locate_template', $found, $file );
	}

	/**
	 * Include a template and return its output (null when missing).
	 *
	 * @param string $rel  Relative template path.
	 * @param array  $vars Variables.
	 * @return string|null
	 */
	public static function template( $rel, array $vars = array() ) {
		$file = self::locate( $rel );
		if ( '' === $file ) {
			return null;
		}
		ob_start();
		( static function ( $__file, $__vars ) {
			extract( $__vars, EXTR_SKIP ); // phpcs:ignore WordPress.PHP.DontExtract.extract_extract
			include $__file;
		} )( $file, $vars );
		return (string) ob_get_clean();
	}

	/* ---------------------------------------------------------------------
	 * Members
	 * ------------------------------------------------------------------- */

	/**
	 * Member array for a post (uses the data API, with a minimal fallback).
	 *
	 * @param \WP_Post $post Post.
	 * @param string   $size Image size.
	 * @return array
	 */
	public static function member( $post, $size = 'large' ) {
		$m = function_exists( 'bptm_get_member' ) ? bptm_get_member( $post, $size ) : array();
		$m = is_array( $m ) ? $m : array();
		if ( empty( $m ) ) {
			// CONTRACT-GAP: data API missing - build a minimal member so rendering never fatals.
			$id = (int) $post->ID;
			$m  = array(
				'id'          => $id,
				'name'        => get_the_title( $post ),
				'permalink'   => get_permalink( $post ),
				'content'     => apply_filters( 'the_content', $post->post_content ), // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
				'excerpt'     => $post->post_excerpt,
				'designation' => (string) get_post_meta( $id, '_bptm_designation', true ),
				'image_id'    => (int) get_post_thumbnail_id( $post ),
			);
		}
		$defaults = array(
			'id'              => (int) $post->ID,
			'name'            => '',
			'permalink'       => '',
			'content'         => '',
			'excerpt'         => '',
			'designation'     => '',
			'company'         => '',
			'company_website' => '',
			'land_phone'      => '',
			'cell_phone'      => '',
			'email'           => '',
			'email_cc'        => '',
			'email_bcc'       => '',
			'address'         => '',
			'ribbon'          => '',
			'zip_code'        => '',
			'vcard'           => '',
			'custom_page'     => '',
			'featured'        => false,
			'image_id'        => 0,
			'image_url'       => '',
			'image_alt'       => '',
			'flip_image_id'   => 0,
			'flip_image_url'  => '',
			'social'          => array(),
			'skills'          => array(),
			'terms'           => array(),
		);
		$m        = wp_parse_args( $m, $defaults );
		foreach ( array( 'social', 'skills', 'terms' ) as $k ) {
			$m[ $k ] = is_array( $m[ $k ] ) ? $m[ $k ] : array();
		}
		return $m;
	}

	/* ---------------------------------------------------------------------
	 * Render
	 * ------------------------------------------------------------------- */

	/**
	 * Build state for an instance.
	 *
	 * @param array $attributes Raw attributes.
	 * @param array $runtime    Runtime.
	 * @return array [atts, theme, view, uid, ctx, query]
	 */
	private static function prepare( $attributes, array $runtime ) {
		$atts  = self::sanitize( $attributes );
		$theme = Themes::get( $atts['theme'] );
		$view  = self::view( $atts, $theme );
		if ( ! empty( $runtime['uid'] ) ) {
			$uid = preg_replace( '/[^a-z0-9-]/', '', strtolower( (string) $runtime['uid'] ) );
		} else {
			$uid = self::uid( $atts );
		}
		if ( ! isset( $runtime['seed'] ) && 'rand' === $atts['orderBy'] ) {
			$runtime['seed'] = wp_rand( 1, 999999 );
		}
		$ctx   = new Context( $atts, $theme, $uid, $view, $runtime );
		$query = new Query( $atts, $runtime, $theme, $uid, $view );
		$query->run();
		return array( $atts, $theme, $view, $uid, $ctx, $query, $runtime );
	}

	/**
	 * Full HTML for a block instance.
	 *
	 * @param array  $attributes    Attributes.
	 * @param string $wrapper_attrs Output of get_block_wrapper_attributes().
	 * @param array  $runtime       Runtime overrides.
	 * @return string
	 */
	public static function render( $attributes, $wrapper_attrs = '', array $runtime = array() ) {
		list( $atts, $theme, $view, $uid, $ctx, $query, $runtime ) = self::prepare( $attributes, $runtime );

		Assets::enqueue_frontend();

		$wrap   = self::parse_wrapper_attrs( $wrapper_attrs );
		$dom_id = ! empty( $wrap['id'] ) ? $wrap['id'] : ( ! empty( $atts['anchor'] ) ? sanitize_html_class( $atts['anchor'] ) : 'bptm-' . $uid );
		unset( $wrap['id'] );

		$classes = array_filter(
			array(
				isset( $wrap['class'] ) ? $wrap['class'] : 'wp-block-icb-fold-out-reveal',
				! empty( $atts['className'] ) && empty( $wrap['class'] ) ? $atts['className'] : '',
				'bptm-wrap',
				'bptm-theme-' . $theme['id'],
				'bptm-group-' . sanitize_html_class( $theme['group'] ),
				'bptm-layout-' . $theme['layout'],
				'bptm-view-' . $view,
				'bptm-link-' . $ctx->link_type,
				'bptm-align-' . sanitize_html_class( $atts['alignment'] ),
				'none' !== $atts['imageFilter'] ? 'bptm-imgfx-' . $atts['imageFilter'] : '',
				'none' !== $atts['hoverImageFilter'] ? 'bptm-imghfx-' . $atts['hoverImageFilter'] : '',
				! empty( $atts['enableScrollAnimation'] ) ? 'bptm-has-anim' : '',
				! empty( $atts['detailsAreaHeight'] ) ? 'bptm-equal-details' : '',
				$theme['grouped'] ? 'bptm-grouped' : '',
			)
		);
		unset( $wrap['class'] );

		$scope = '#' . $dom_id . ', .bptm-modal[data-bptm-for="' . $uid . '"]';
		$css   = Style::css( $atts, $scope );

		$is_rest = defined( 'REST_REQUEST' ) && REST_REQUEST;
		$fonts   = Fonts::load( Style::fonts( $atts ), $is_rest || is_admin() );

		$config = self::config( $atts, $theme, $view, $uid, $ctx, $query, $runtime );

		$html  = '<div id="' . esc_attr( $dom_id ) . '" class="' . esc_attr( implode( ' ', $classes ) ) . '"';
		$html .= ' data-bptm-uid="' . esc_attr( $uid ) . '" data-bptm="' . esc_attr( (string) wp_json_encode( $config ) ) . '"';
		foreach ( $wrap as $k => $v ) {
			if ( preg_match( '/^(style|data-[a-z0-9-]+|aria-[a-z-]+|role|lang|dir)$/', $k ) ) {
				$html .= ' ' . esc_attr( $k ) . '="' . esc_attr( $v ) . '"';
			}
		}
		$html .= '>';
		$html .= $fonts;
		if ( $is_rest || is_admin() ) {
			$html .= Assets::inline_editor_links();
		}
		$html .= self::custom_css();
		if ( '' !== $css ) {
			$html .= '<style class="bptm-dynamic-css">' . $css . '</style>';
		}

		if ( 'filter' === $view ) {
			$html .= $ctx->hook( 'bptm_before_cats_filters' );
			$html .= $ctx->partial(
				'cat-filters',
				array(
					'query' => $query,
				)
			);
			$html .= $ctx->hook( 'bptm_before_filters' );
			$html .= $ctx->partial(
				'filters',
				array(
					'query' => $query,
				)
			);
		}

		$html .= $ctx->hook( 'bptm_before_team_members' );
		$html .= self::items_block( $ctx, $query, $theme, $view );
		$html .= $ctx->hook( 'bptm_after_team_members' );

		if ( $query->mode ) {
			$html .= $ctx->hook( 'bptm_before_pagination' );
			$html .= $ctx->partial( 'pagination', array( 'query' => $query ) );
			$html .= $ctx->hook( 'bptm_after_pagination' );
		}

		$details = self::details_html( $ctx, $query );
		$html   .= '<div class="bptm-details-store" hidden>' . $details . '</div>';
		if ( $ctx->modal_enabled() ) {
			$html .= $ctx->partial( 'modal', array( 'type' => $ctx->link_type ) );
		}
		$html .= '</div>';

		wp_reset_postdata();
		return apply_filters( 'bptm_render_html', $html, $atts, $uid );
	}

	/**
	 * Partial render for REST (items, details, pagination).
	 *
	 * @param array $attributes Attributes.
	 * @param array $runtime    Runtime.
	 * @return array
	 */
	public static function render_part( $attributes, array $runtime ) {
		list( $atts, $theme, $view, $uid, $ctx, $query ) = self::prepare( $attributes, $runtime );
		unset( $atts );
		$items = self::items_html( $ctx, $query, $theme );
		if ( '' === $items && 0 === $query->offset ) {
			$items = self::no_members( $ctx, $theme );
		}
		$out = array(
			'items'      => $items,
			'details'    => self::details_html( $ctx, $query ),
			'pagination' => $query->mode ? $ctx->partial( 'pagination', array( 'query' => $query ) ) : '',
			'found'      => (int) $query->total,
			'count'      => count( $query->wp_query->posts ),
			'page'       => (int) $query->page,
			'maxPages'   => (int) $query->max_pages(),
			'offset'     => (int) $query->offset,
			'hasMore'    => $query->has_more(),
			'view'       => $view,
		);
		wp_reset_postdata();
		return $out;
	}

	/**
	 * Parse get_block_wrapper_attributes() output.
	 *
	 * @param string $str Attribute string.
	 * @return array
	 */
	public static function parse_wrapper_attrs( $str ) {
		$out = array();
		if ( preg_match_all( '/([a-zA-Z_:][-a-zA-Z0-9_:.]*)="([^"]*)"/', (string) $str, $mm, PREG_SET_ORDER ) ) {
			foreach ( $mm as $match ) {
				$out[ strtolower( $match[1] ) ] = html_entity_decode( $match[2], ENT_QUOTES );
			}
		}
		return $out;
	}

	/**
	 * Items block markup (container + items, carousel shell or table).
	 *
	 * @param Context $ctx   Context.
	 * @param Query   $query Query.
	 * @param array   $theme Theme.
	 * @param string  $view  View.
	 * @return string
	 */
	private static function items_block( Context $ctx, Query $query, array $theme, $view ) {
		$items = self::items_html( $ctx, $query, $theme );
		$empty = '' === $items;
		$atts  = $ctx->atts;

		if ( $empty ) {
			return '<div class="bptm-stage">' . self::no_members( $ctx, $theme ) . '</div>';
		}

		if ( 'table' === $theme['layout'] ) {
			$head = self::template(
				$theme['template'] . '-head',
				array(
					'ctx' => $ctx,
				)
			);
			$out  = '<div class="bptm-stage bptm-table-wrap"><table class="bptm-table">';
			if ( null !== $head && '' !== trim( $head ) ) {
				$out .= false !== stripos( $head, '<thead' ) ? $head : '<thead>' . $head . '</thead>';
			}
			$out .= '<tbody class="bptm-items" aria-live="polite">' . $items . '</tbody></table></div>';
			return $out;
		}

		if ( 'carousel' === $view ) {
			$navs = ! empty( $atts['carouselNavsEnabled'] );
			$dots = ! empty( $atts['carouselDotsEnabled'] );
			$cls  = 'bptm-stage bptm-carousel bptm-navs-' . $atts['carouselNavsStyle'] . ' bptm-dots-' . $atts['carouselDotsStyle'];
			$cls .= $navs ? ' bptm-has-navs' : '';
			$cls .= $dots ? ' bptm-has-dots' : '';
			$out  = '<div class="' . esc_attr( $cls ) . '" role="region" aria-roledescription="carousel" aria-label="' . esc_attr__( 'Team members', 'bp-team-member' ) . '">';
			$out .= '<div class="bptm-carousel-viewport"><div class="bptm-items bptm-carousel-track">' . $items . '</div></div>';
			if ( $navs ) {
				$icons = self::nav_icons( $atts['carouselNavsStyle'] );
				$out  .= $ctx->hook( 'bptm_before_navigation' );
				$out  .= '<div class="bptm-carousel-navs">';
				$out  .= '<button type="button" class="bptm-nav bptm-nav-prev" aria-label="' . esc_attr( $ctx->t( 'prev' ) ) . '">' . $icons[0] . '</button>';
				$out  .= '<button type="button" class="bptm-nav bptm-nav-next" aria-label="' . esc_attr( $ctx->t( 'next' ) ) . '">' . $icons[1] . '</button>';
				$out  .= '</div>';
				$out  .= $ctx->hook( 'bptm_after_navigation' );
			}
			if ( $dots ) {
				$out .= '<div class="bptm-carousel-dots" role="tablist" aria-label="' . esc_attr__( 'Choose slide', 'bp-team-member' ) . '"></div>';
			}
			$out .= '</div>';
			return $out;
		}

		$cls = 'bptm-items';
		if ( 'list' === $theme['layout'] ) {
			$cls .= ' bptm-items--list';
		}
		return '<div class="bptm-stage"><div class="' . esc_attr( $cls ) . '" aria-live="polite">' . $items . '</div></div>';
	}

	/**
	 * Carousel nav icons per style.
	 *
	 * @param string $style Style.
	 * @return array
	 */
	private static function nav_icons( $style ) {
		switch ( $style ) {
			case 'style-two':
				return array( '<i class="fas fa-arrow-left-long" aria-hidden="true"></i>', '<i class="fas fa-arrow-right-long" aria-hidden="true"></i>' );
			case 'style-three':
				return array( '<i class="fas fa-angles-left" aria-hidden="true"></i>', '<i class="fas fa-angles-right" aria-hidden="true"></i>' );
			case 'style-one':
				return array( '<i class="fas fa-chevron-left" aria-hidden="true"></i>', '<i class="fas fa-chevron-right" aria-hidden="true"></i>' );
			default:
				return array( '<i class="fas fa-angle-left" aria-hidden="true"></i>', '<i class="fas fa-angle-right" aria-hidden="true"></i>' );
		}
	}

	/**
	 * No members markup.
	 *
	 * @param Context $ctx   Context.
	 * @param array   $theme Theme.
	 * @return string
	 */
	private static function no_members( Context $ctx, array $theme ) {
		$html = $ctx->partial( 'no-members', array() ) . $ctx->hook( 'bptm_after_no_team_found' );
		if ( 'table' === $theme['layout'] ) {
			return '<tr class="bptm-no-members-row"><td colspan="20">' . $html . '</td></tr>';
		}
		return $html;
	}

	/**
	 * Items markup only.
	 *
	 * @param Context $ctx   Context.
	 * @param Query   $query Query.
	 * @param array   $theme Theme.
	 * @return string
	 */
	public static function items_html( Context $ctx, Query $query, array $theme ) {
		$posts = $query->wp_query ? $query->wp_query->posts : array();
		if ( empty( $posts ) ) {
			return '';
		}
		$members = array();
		foreach ( $posts as $post ) {
			$members[] = self::member( $post, $ctx->attr( 'thumbnailSize', 'large' ) );
		}

		$out = '';
		if ( $theme['grouped'] ) {
			foreach ( self::grouped( $members, $ctx ) as $group ) {
				$out .= '<div class="bptm-group-title" data-group="' . esc_attr( $group['slug'] ) . '"><h3>' . esc_html( $group['name'] ) . '</h3></div>';
				foreach ( $group['members'] as $m ) {
					$out .= self::item_html( $ctx, $m, $theme );
				}
			}
			return $out;
		}
		foreach ( $members as $m ) {
			$out .= self::item_html( $ctx, $m, $theme );
		}
		return $out;
	}

	/**
	 * Group members by their first group term (order of terms per taxonomy order settings).
	 *
	 * @param array   $members Members.
	 * @param Context $ctx     Context.
	 * @return array
	 */
	private static function grouped( array $members, Context $ctx ) {
		$groups = array();
		$terms  = Filters::terms( 'group', $ctx, 'includeGroups' );
		foreach ( $terms as $t ) {
			$groups[ $t->slug ] = array(
				'slug'    => $t->slug,
				'name'    => $t->name,
				'members' => array(),
			);
		}
		$other = array();
		foreach ( $members as $m ) {
			$placed = false;
			foreach ( isset( $m['terms']['group'] ) ? $m['terms']['group'] : array() as $t ) {
				if ( isset( $groups[ $t['slug'] ] ) ) {
					$groups[ $t['slug'] ]['members'][] = $m;
					$placed                            = true;
				}
			}
			if ( ! $placed ) {
				$other[] = $m;
			}
		}
		$groups = array_filter(
			$groups,
			static function ( $g ) {
				return ! empty( $g['members'] );
			}
		);
		if ( $other ) {
			$groups['__other'] = array(
				'slug'    => '',
				'name'    => __( 'Others', 'bp-team-member' ),
				'members' => $other,
			);
		}
		return array_values( $groups );
	}

	/**
	 * One item.
	 *
	 * @param Context $ctx   Context.
	 * @param array   $m     Member.
	 * @param array   $theme Theme.
	 * @return string
	 */
	private static function item_html( Context $ctx, array $m, array $theme ) {
		$ctx->set_group( 'initial' );
		$html = self::template(
			$theme['template'],
			array(
				'm'   => $m,
				'ctx' => $ctx,
			)
		);
		if ( null === $html ) {
			$html = $ctx->partial(
				'table' === $theme['layout'] ? 'item-fallback-row' : 'item-fallback',
				array( 'm' => $m )
			);
		}
		$html = self::wrap_item_hooks( $html, $ctx->hook( 'bptm_before_member_content', $m ), $ctx->hook( 'bptm_after_member_content', $m ), 'table' === $theme['layout'] );
		++$ctx->index;
		return $html;
	}

	/**
	 * Put before/after member content hook output just inside the item's root element
	 * (inside the first / last cell for table rows) so grid and table layouts stay intact.
	 *
	 * @param string $html   Item HTML.
	 * @param string $before Output of bptm_before_member_content.
	 * @param string $after  Output of bptm_after_member_content.
	 * @param bool   $table  Item is a table row.
	 * @return string
	 */
	public static function wrap_item_hooks( $html, $before, $after, $table = false ) {
		if ( '' === $before && '' === $after ) {
			return $html;
		}
		$open  = $table ? '/<td\b[^>]*>/i' : '/^\s*<[a-z][a-z0-9-]*\b[^>]*>/i';
		$close = $table ? '</td>' : '</';
		if ( '' !== $before ) {
			if ( preg_match( $open, $html, $mm, PREG_OFFSET_CAPTURE ) ) {
				$pos  = $mm[0][1] + strlen( $mm[0][0] );
				$html = substr( $html, 0, $pos ) . $before . substr( $html, $pos );
			} else {
				$html = $before . $html;
			}
		}
		if ( '' !== $after ) {
			$pos = strrpos( $html, $close );
			if ( false !== $pos ) {
				$html = substr( $html, 0, $pos ) . $after . substr( $html, $pos );
			} else {
				$html .= $after;
			}
		}
		return $html;
	}

	/**
	 * Modal payloads for current batch.
	 *
	 * @param Context $ctx   Context.
	 * @param Query   $query Query.
	 * @return string
	 */
	private static function details_html( Context $ctx, Query $query ) {
		if ( ! $ctx->modal_enabled() ) {
			return '';
		}
		$out = '';
		foreach ( $query->wp_query ? $query->wp_query->posts : array() as $post ) {
			$out .= $ctx->modal_payload( self::member( $post, $ctx->attr( 'thumbnailSize', 'large' ) ) );
		}
		return $out;
	}

	/**
	 * JS config.
	 *
	 * @param array   $atts    Attributes.
	 * @param array   $theme   Theme.
	 * @param string  $view    View.
	 * @param string  $uid     Uid.
	 * @param Context $ctx     Context.
	 * @param Query   $query   Query.
	 * @param array   $runtime Runtime.
	 * @return array
	 */
	private static function config( array $atts, array $theme, $view, $uid, Context $ctx, Query $query, array $runtime ) {
		$cols = is_array( $atts['columns'] ) ? $atts['columns'] : array();
		$cfg  = array(
			'uid'    => $uid,
			'theme'  => $theme['id'],
			'layout' => $theme['layout'],
			'view'   => $view,
			'link'   => $ctx->link_type,
			'rest'   => esc_url_raw( rest_url( 'bptm/v1/render' ) ),
			'anim'   => ! empty( $atts['enableScrollAnimation'] ),
			'equal'  => ! empty( $atts['detailsAreaHeight'] ),
			'panel'  => $atts['panelPosition'],
			'i18n'   => array(
				'prev'      => $ctx->t( 'prev' ),
				'next'      => $ctx->t( 'next' ),
				'close'     => __( 'Close', 'bp-team-member' ),
				'loadMore'  => $ctx->t( 'load_more' ),
				'loading'   => __( 'Loading…', 'bp-team-member' ),
				'noMembers' => $ctx->t( 'no_members' ),
				'reset'     => $ctx->t( 'reset_filters' ),
				'slide'     => __( 'Go to slide %d', 'bp-team-member' ),
				'selected'  => __( '%d selected', 'bp-team-member' ),
			),
		);
		if ( isset( $runtime['seed'] ) ) {
			$cfg['seed'] = (int) $runtime['seed'];
		}
		if ( 'carousel' === $view ) {
			$cfg['carousel'] = array(
				'autoplay'   => ! empty( $atts['carouselAutoplay'] ),
				'hoverPause' => ! empty( $atts['carouselAutoplayHoverPause'] ),
				'loop'       => ! empty( $atts['carouselLoop'] ),
				'speed'      => (int) $atts['carouselSpeed'],
				'timeout'    => (int) $atts['carouselAutoplayTimeout'],
				'scroll'     => (int) $atts['carouselItemsToScroll'],
				'navs'       => ! empty( $atts['carouselNavsEnabled'] ),
				'dots'       => ! empty( $atts['carouselDotsEnabled'] ),
				'cols'       => array(
					'd'  => isset( $cols['desktop'] ) ? max( 1, (int) $cols['desktop'] ) : 4,
					't'  => isset( $cols['tablet'] ) ? max( 1, (int) $cols['tablet'] ) : 3,
					'mp' => isset( $cols['mobilePortrait'] ) ? max( 1, (int) $cols['mobilePortrait'] ) : 2,
					'm'  => isset( $cols['mobile'] ) ? max( 1, (int) $cols['mobile'] ) : 1,
				),
				'gap'        => (float) $atts['columnGap'],
			);
		}
		if ( 'filter' === $view ) {
			$cfg['filter'] = array(
				'type'     => $atts['filterType'],
				'multi'    => ! empty( $atts['enableMultiSelect'] ),
				'ellipsis' => ! empty( $atts['multiSelectEllipsis'] ),
				'reset'    => ! empty( $atts['enableClearFilters'] ),
				'all'      => ! empty( $atts['filterAllEnabled'] ),
			);
		}
		if ( $query->mode ) {
			$cfg['pagination'] = array(
				'mode'     => $query->mode,
				'page'     => (int) $query->page,
				'perPage'  => (int) $atts['perPage'],
				'offset'   => (int) $query->offset,
				'count'    => $query->wp_query ? count( $query->wp_query->posts ) : 0,
				'found'    => (int) $query->total,
				'maxPages' => (int) $query->max_pages(),
				'hasMore'  => $query->has_more(),
				'pageVar'  => $query->page_var,
			);
		}
		if ( ( 'filter' === $view && 'ajax-filter' === $atts['filterType'] ) || ( $query->mode && 'normal-pagination' !== $query->mode ) ) {
			// Only what the REST endpoint needs; it re-validates everything.
			$cfg['attrs'] = self::rest_attrs( $atts );
		}
		return apply_filters( 'bptm_js_config', $cfg, $atts );
	}

	/**
	 * Attributes that differ from defaults (keeps the data attribute small).
	 *
	 * @param array $atts Attributes.
	 * @return array
	 */
	public static function rest_attrs( array $atts ) {
		$defaults = self::defaults();
		$out      = array();
		foreach ( $atts as $k => $v ) {
			if ( ! array_key_exists( $k, $defaults ) || $defaults[ $k ] !== $v ) {
				if ( in_array( $k, array( 'className', 'anchor', 'align', 'colors', 'purposeType' ), true ) ) {
					continue;
				}
				$out[ $k ] = $v;
			}
		}
		return (object) $out;
	}

	/**
	 * Preference custom CSS, once per request.
	 *
	 * @return string
	 */
	private static function custom_css() {
		if ( self::$custom_css_done || ! apply_filters( 'bptm_print_custom_css', true ) ) {
			return '';
		}
		self::$custom_css_done = true;
		$css                   = function_exists( 'bptm_get_option' ) ? (string) bptm_get_option( 'custom_css', '' ) : '';
		$css                   = trim( str_replace( array( '</style', '<' ), '', wp_strip_all_tags( $css ) ) );
		return '' === $css ? '' : '<style class="bptm-custom-css">' . $css . '</style>';
	}
}
