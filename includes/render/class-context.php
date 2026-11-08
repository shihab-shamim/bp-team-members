<?php
/**
 * Render context: one per block instance. Theme / popup / panel / drawer templates receive it as `$ctx`.
 *
 * Every helper returns escaped HTML (echo it raw).
 *
 * @package BPTM
 */

namespace BPTM\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Context.
 */
class Context {

	/**
	 * Sanitized attributes.
	 *
	 * @var array
	 */
	public $atts;

	/**
	 * Theme registry entry.
	 *
	 * @var array
	 */
	public $theme;

	/**
	 * Instance uid.
	 *
	 * @var string
	 */
	public $uid;

	/**
	 * View: grid | carousel | filter.
	 *
	 * @var string
	 */
	public $view;

	/**
	 * Resolved link type: single_page | popup | panel | drawer | custom | none.
	 *
	 * @var string
	 */
	public $link_type;

	/**
	 * Visibility map group => field => device => bool.
	 *
	 * @var array
	 */
	public $vis;

	/**
	 * Current visibility group.
	 *
	 * @var string
	 */
	public $group = 'initial';

	/**
	 * Index of the item being rendered (0-based, within this batch).
	 *
	 * @var int
	 */
	public $index = 0;

	/**
	 * Runtime (REST etc.).
	 *
	 * @var array
	 */
	public $runtime;

	/**
	 * ACF printed tracker.
	 *
	 * @var array
	 */
	private $acf_done = array();

	/**
	 * Constructor.
	 *
	 * @param array  $atts    Attributes.
	 * @param array  $theme   Theme entry.
	 * @param string $uid     Uid.
	 * @param string $view    View.
	 * @param array  $runtime Runtime.
	 */
	public function __construct( array $atts, array $theme, $uid, $view, array $runtime = array() ) {
		$this->atts      = $atts;
		$this->theme     = $theme;
		$this->uid       = $uid;
		$this->view      = $view;
		$this->runtime   = $runtime;
		$this->vis       = Visibility::resolve( isset( $atts['visibility'] ) ? $atts['visibility'] : array(), $theme['id'] );
		$this->link_type = $this->resolve_link_type();
	}

	/* ---------------------------------------------------------------------
	 * Basics
	 * ------------------------------------------------------------------- */

	/**
	 * Attribute value.
	 *
	 * @param string $key     Key.
	 * @param mixed  $default Default.
	 * @return mixed
	 */
	public function attr( $key, $default = null ) {
		return array_key_exists( $key, $this->atts ) ? $this->atts[ $key ] : $default;
	}

	/**
	 * Translated front-end string.
	 *
	 * @param string $key Key.
	 * @return string
	 */
	public function t( $key ) {
		$defaults = array(
			'filter_designation' => __( 'Show All Designation', 'bp-team-member' ),
			'search_name'        => __( 'Search By Name', 'bp-team-member' ),
			'search_company'     => __( 'Search By Company', 'bp-team-member' ),
			'search_zip'         => __( 'Search By Zip', 'bp-team-member' ),
			'search_tag'         => __( 'Search By Tag', 'bp-team-member' ),
			'company'            => __( 'Company', 'bp-team-member' ),
			'address'            => __( 'Address', 'bp-team-member' ),
			'land_phone'         => __( 'Land Phone', 'bp-team-member' ),
			'cell_phone'         => __( 'Cell Phone', 'bp-team-member' ),
			'email'              => __( 'Email', 'bp-team-member' ),
			'zip_code'           => __( 'Zip Code', 'bp-team-member' ),
			'location'           => __( 'Location', 'bp-team-member' ),
			'language'           => __( 'Language', 'bp-team-member' ),
			'specialty'          => __( 'Specialty', 'bp-team-member' ),
			'gender'             => __( 'Gender', 'bp-team-member' ),
			'follow_me_on'       => __( 'Follow Me On', 'bp-team-member' ),
			'skills'             => __( 'Skills', 'bp-team-member' ),
			'read_on'            => __( 'Read On', 'bp-team-member' ),
			'more'               => __( 'More', 'bp-team-member' ),
			'vcard'              => __( 'Download vCard', 'bp-team-member' ),
			'reset_filters'      => __( 'Reset Filters', 'bp-team-member' ),
			'prev'               => __( 'Prev', 'bp-team-member' ),
			'next'               => __( 'Next', 'bp-team-member' ),
			'load_more'          => __( 'Load More', 'bp-team-member' ),
			'no_members'         => __( 'No team member found.', 'bp-team-member' ),
		);
		$val = function_exists( 'bptm_translation' ) ? (string) bptm_translation( $key ) : '';
		if ( '' === $val || $val === $key ) {
			$val = isset( $defaults[ $key ] ) ? $defaults[ $key ] : $key;
		}
		return $val;
	}

	/**
	 * Preference value.
	 *
	 * @param string $key     Key.
	 * @param mixed  $default Default.
	 * @return mixed
	 */
	public function pref( $key, $default = null ) {
		return function_exists( 'bptm_get_option' ) ? bptm_get_option( $key, $default ) : $default;
	}

	/**
	 * Switch the visibility group (initial | popup | panel | drawer). Returns the previous one.
	 *
	 * @param string $group Group.
	 * @return string
	 */
	public function set_group( $group ) {
		$prev        = $this->group;
		$this->group = in_array( $group, Visibility::GROUPS, true ) ? $group : 'initial';
		return $prev;
	}

	/**
	 * Is the context rendering a detail view (popup/panel/drawer)?
	 *
	 * @return bool
	 */
	public function is_detail() {
		return 'initial' !== $this->group;
	}

	/**
	 * Run a developer action and return what its callbacks echo.
	 *
	 * Callbacks receive the member array (or null for list-level hooks) and this Context.
	 * Output is printed by callbacks, so they are responsible for escaping it.
	 *
	 * @param string     $hook Action name (bptm_*).
	 * @param array|null $m    Member.
	 * @return string
	 */
	public function hook( $hook, $m = null ) {
		if ( ! has_action( $hook ) ) {
			return '';
		}
		ob_start();
		do_action( $hook, $m, $this );
		return (string) ob_get_clean();
	}

	/**
	 * Append a hook's output after an element (inside it for table cells, to keep rows valid).
	 *
	 * @param string     $html Element HTML.
	 * @param string     $hook Action.
	 * @param array|null $m    Member.
	 * @param string     $tag  Element tag.
	 * @return string
	 */
	private function with_hook( $html, $hook, $m, $tag = '' ) {
		$extra = $this->hook( $hook, $m );
		if ( '' === $extra ) {
			return $html;
		}
		if ( 'td' === $tag && '</td>' === substr( $html, -5 ) ) {
			return substr( $html, 0, -5 ) . $extra . '</td>';
		}
		return $html . $extra;
	}

	/**
	 * Visibility check.
	 *
	 * @param string $field Field.
	 * @return bool
	 */
	public function show( $field ) {
		$map = isset( $this->vis[ $this->group ][ $field ] ) ? $this->vis[ $this->group ][ $field ] : null;
		if ( null === $map ) {
			return 'initial' !== $this->group;
		}
		return Visibility::any( $map );
	}

	/**
	 * Device hide classes for a field (for theme templates wrapping custom markup).
	 *
	 * @param string $field Field.
	 * @param string $extra Extra classes.
	 * @return string Escaped class list.
	 */
	public function vis_classes( $field, $extra = '' ) {
		$map = isset( $this->vis[ $this->group ][ $field ] ) ? $this->vis[ $this->group ][ $field ] : null;
		return esc_attr( trim( $extra . ' ' . Visibility::classes( $map ) ) );
	}

	/* ---------------------------------------------------------------------
	 * Links
	 * ------------------------------------------------------------------- */

	/**
	 * Resolve the block-level link type.
	 *
	 * @return string
	 */
	private function resolve_link_type() {
		if ( empty( $this->atts['nameIsLinked'] ) ) {
			return 'none';
		}
		$type   = (string) $this->atts['linkType'];
		$forced = $this->theme['forced_link'];
		if ( $forced && ( 'default' === $type || in_array( $forced, array( 'panel', 'drawer' ), true ) ) ) {
			$type = $forced;
		}
		if ( 'default' === $type || '' === $type ) {
			$type = (string) $this->pref( 'single_link_type', 'single_page' );
		}
		if ( ! in_array( $type, array( 'single_page', 'popup', 'panel', 'drawer', 'custom', 'none' ), true ) ) {
			$type = 'single_page';
		}
		// The inline drawer expands below a grid row; carousels and tables use the popup instead.
		if ( 'drawer' === $type && ( 'carousel' === $this->view || 'table' === $this->theme['layout'] ) ) {
			$type = 'popup';
		}
		return $type;
	}

	/**
	 * Link type for one member (custom URL falls back when empty).
	 *
	 * @param array $m Member.
	 * @return string
	 */
	public function member_link_type( $m ) {
		$type = $this->link_type;
		if ( 'custom' === $type && empty( $m['custom_page'] ) ) {
			$type = (string) $this->pref( 'single_link_type', 'single_page' );
			if ( ! in_array( $type, array( 'single_page', 'popup', 'none' ), true ) ) {
				$type = 'single_page';
			}
			if ( 'popup' === $type && ! $this->modal_enabled( 'popup' ) ) {
				$type = 'single_page';
			}
		}
		return $type;
	}

	/**
	 * Is a modal type used by this instance (detail payloads must be printed)?
	 *
	 * @param string $type popup|panel|drawer.
	 * @return bool
	 */
	public function modal_enabled( $type = '' ) {
		if ( '' === $type ) {
			return in_array( $this->link_type, array( 'popup', 'panel', 'drawer' ), true );
		}
		return $this->link_type === $type;
	}

	/**
	 * Has a link?
	 *
	 * @param array $m Member.
	 * @return bool
	 */
	public function has_link( $m ) {
		return 'none' !== $this->member_link_type( $m ) && ! $this->is_detail();
	}

	/**
	 * DOM id of a member's detail payload.
	 *
	 * @param array $m Member.
	 * @return string
	 */
	public function detail_id( $m ) {
		return 'bptm-detail-' . $this->uid . '-' . (int) $m['id'];
	}

	/**
	 * Opening <a> per link type, or '' when not linked.
	 *
	 * @param array  $m     Member.
	 * @param string $class Extra class.
	 * @return string
	 */
	public function link_open( $m, $class = '' ) {
		if ( ! $this->has_link( $m ) ) {
			return '';
		}
		$type  = $this->member_link_type( $m );
		$attrs = array( 'class' => trim( 'bptm-link ' . $class ) );
		switch ( $type ) {
			case 'popup':
			case 'panel':
			case 'drawer':
				$attrs['href']           = '#' . $this->detail_id( $m );
				$attrs['class']         .= ' bptm-open';
				$attrs['data-bptm-open'] = $type;
				$attrs['data-bptm-id']   = (int) $m['id'];
				$attrs['role']           = 'button';
				$attrs['aria-haspopup']  = 'drawer' === $type ? 'true' : 'dialog';
				$attrs['aria-controls']  = $this->detail_id( $m );
				break;
			case 'custom':
				$attrs['href'] = $m['custom_page'];
				if ( ! self::is_internal( $m['custom_page'] ) ) {
					$attrs['target'] = '_blank';
					$attrs['rel']    = 'noopener';
				} elseif ( '_blank' === $this->attr( 'linkTarget' ) ) {
					$attrs['target'] = '_blank';
					$attrs['rel']    = 'noopener';
				}
				break;
			default:
				$attrs['href'] = $m['permalink'];
				if ( '_blank' === $this->attr( 'linkTarget' ) ) {
					$attrs['target'] = '_blank';
					$attrs['rel']    = 'noopener';
				}
		}
		return '<a' . self::attrs( $attrs ) . '>';
	}

	/**
	 * Closing tag matching link_open().
	 *
	 * @param array $m Member.
	 * @return string
	 */
	public function link_close( $m ) {
		return $this->has_link( $m ) ? '</a>' : '';
	}

	/**
	 * URL is on this site?
	 *
	 * @param string $url URL.
	 * @return bool
	 */
	public static function is_internal( $url ) {
		$host = wp_parse_url( $url, PHP_URL_HOST );
		return ! $host || wp_parse_url( home_url(), PHP_URL_HOST ) === $host;
	}

	/**
	 * Build an escaped attribute string.
	 *
	 * @param array $attrs name => value (null/false skipped, true => bare attr).
	 * @return string
	 */
	public static function attrs( array $attrs ) {
		$out = '';
		foreach ( $attrs as $k => $v ) {
			if ( null === $v || false === $v ) {
				continue;
			}
			if ( true === $v ) {
				$out .= ' ' . esc_attr( $k );
				continue;
			}
			$v    = 'href' === $k || 'src' === $k ? esc_url( $v, array( 'http', 'https', 'mailto', 'tel', 'skype', 'callto', 'sms', 'viber', 'whatsapp' ) ) : esc_attr( $v );
			$out .= ' ' . esc_attr( $k ) . '="' . $v . '"';
		}
		return $out;
	}

	/**
	 * Allowed tags for meta values (links + itemprop spans + basic inline formatting).
	 *
	 * @return array
	 */
	public static function kses() {
		$common = array(
			'class'    => true,
			'itemprop' => true,
		);
		return array(
			'a'      => $common + array(
				'href'   => true,
				'target' => true,
				'rel'    => true,
				'title'  => true,
			),
			'span'   => $common,
			'strong' => $common,
			'em'     => $common,
			'b'      => array(),
			'i'      => $common + array( 'aria-hidden' => true ),
			'br'     => array(),
			'wbr'    => array(),
		);
	}

	/* ---------------------------------------------------------------------
	 * Item wrapper
	 * ------------------------------------------------------------------- */

	/**
	 * Item attributes: classes, filter/search data, animation, schema.
	 *
	 * @param array $m             Member.
	 * @param array $extra_classes Extra classes.
	 * @return string
	 */
	public function item_attrs( $m, array $extra_classes = array() ) {
		$classes = array_merge( array( 'bptm-item' ), $extra_classes );
		if ( ! empty( $m['featured'] ) ) {
			$classes[] = 'bptm-is-featured';
		}
		if ( ! empty( $this->atts['enableScrollAnimation'] ) && 'carousel' !== $this->view ) {
			$classes[] = 'bptm-anim';
		}
		$type = $this->member_link_type( $m );
		if ( 'none' !== $type ) {
			$classes[] = 'bptm-linked-' . $type;
		}

		$attrs = array(
			'class'        => implode( ' ', array_unique( array_filter( $classes ) ) ),
			'data-bptm-id' => (int) $m['id'],
			'data-name'    => self::lower( $m['name'] ),
		);

		if ( 'filter' === $this->view || 'carousel' !== $this->view ) {
			$attrs['data-designation'] = sanitize_title( $m['designation'] );
			$attrs['data-company']     = self::lower( $m['company'] );
			$attrs['data-zip']         = self::lower( $m['zip_code'] );
			$tag_names                 = array();
			if ( ! empty( $m['terms']['tag'] ) ) {
				foreach ( $m['terms']['tag'] as $t ) {
					$tag_names[] = self::lower( $t['name'] );
				}
			}
			$attrs['data-tags'] = implode( '|', $tag_names );
			foreach ( Query::FILTER_TAX as $key ) {
				$slugs = $this->term_slugs_with_ancestors( $m, $key );
				if ( $slugs ) {
					$attrs[ 'data-' . str_replace( '_', '-', $key ) ] = implode( ' ', $slugs );
				}
			}
			if ( $this->pref( 'search_all_fields', false ) ) {
				$hay = array( $m['designation'], $m['company'], $m['email'], $m['land_phone'], $m['cell_phone'], $m['address'], $m['zip_code'] );
				if ( ! empty( $m['terms'] ) ) {
					foreach ( $m['terms'] as $terms ) {
						foreach ( (array) $terms as $t ) {
							$hay[] = $t['name'];
						}
					}
				}
				$attrs['data-search'] = self::lower( implode( ' ', array_filter( $hay ) ) );
			}
		}

		$attrs['itemscope'] = true;
		$attrs['itemtype']  = 'https://schema.org/Person';
		return self::attrs( $attrs );
	}

	/**
	 * Lowercase helper.
	 *
	 * @param string $s String.
	 * @return string
	 */
	private static function lower( $s ) {
		$s = wp_strip_all_tags( (string) $s );
		return function_exists( 'mb_strtolower' ) ? mb_strtolower( $s ) : strtolower( $s );
	}

	/**
	 * Term slugs of a member including ancestors (so parent category tabs match child terms).
	 *
	 * @param array  $m   Member.
	 * @param string $key Tax key.
	 * @return array
	 */
	public function term_slugs_with_ancestors( $m, $key ) {
		if ( empty( $m['terms'][ $key ] ) ) {
			return array();
		}
		$slugs = array();
		$tax   = Query::tax_name( $key );
		foreach ( $m['terms'][ $key ] as $t ) {
			$slugs[] = $t['slug'];
			if ( $tax && ! empty( $t['parent'] ) ) {
				foreach ( get_ancestors( (int) $t['id'], $tax, 'taxonomy' ) as $aid ) {
					$a = get_term( $aid, $tax );
					if ( $a && ! is_wp_error( $a ) ) {
						$slugs[] = $a->slug;
					}
				}
			}
		}
		return array_values( array_unique( $slugs ) );
	}

	/* ---------------------------------------------------------------------
	 * Elements
	 * ------------------------------------------------------------------- */

	/**
	 * Thumbnail image (wrapped in the member link when "Link Image" is on).
	 *
	 * @param array  $m        Member.
	 * @param string $class    Class.
	 * @param bool   $linkable Allow wrapping with the member link.
	 * @return string
	 */
	public function image( $m, $class = 'bptm-img', $linkable = true ) {
		if ( ! $this->show( 'thumbnail' ) ) {
			return '';
		}
		$img = $this->img_tag( (int) $m['image_id'], $m['image_url'], $m['image_alt'] ? $m['image_alt'] : $m['name'], $class, 'image', $m );
		/**
		 * Filters the member thumbnail markup (the <img>, before link / visibility wrappers).
		 *
		 * @param string  $img       Image HTML.
		 * @param int     $member_id Member post id.
		 * @param array   $m         Member data.
		 * @param Context $ctx       Render context.
		 */
		$img = (string) apply_filters( 'bptm_member_thumbnail_html', $img, (int) $m['id'], $m, $this );
		$cls = $this->vis_classes( 'thumbnail' );
		if ( $cls ) {
			$img = '<span class="bptm-vis ' . $cls . '">' . $img . '</span>';
		}
		if ( $linkable && ! empty( $this->atts['linkPreviewImage'] ) && $this->has_link( $m ) ) {
			$img = $this->link_open( $m, 'bptm-img-link' ) . $img . '</a>';
		}
		return $img . $this->hook( $this->is_detail() ? 'bptm_after_member_thumbnail_popup' : 'bptm_after_member_thumbnail', $m );
	}

	/**
	 * Back side image for flip themes ('' when none).
	 *
	 * @param array  $m     Member.
	 * @param string $class Class.
	 * @return string
	 */
	public function flip_image( $m, $class = 'bptm-img bptm-flip-img' ) {
		if ( empty( $m['flip_image_id'] ) && empty( $m['flip_image_url'] ) ) {
			return '';
		}
		$img = $this->img_tag( (int) $m['flip_image_id'], $m['flip_image_url'], $m['name'], $class, '', $m, true );
		/** This filter is documented for the primary image; same arguments. */
		return (string) apply_filters( 'bptm_member_secondary_thumbnail_html', $img, (int) $m['id'], $m, $this );
	}

	/**
	 * Image tag with lazy-load handling.
	 *
	 * @param int    $id        Attachment.
	 * @param string $url       Fallback URL.
	 * @param string $alt       Alt.
	 * @param string $class     Class.
	 * @param string $itemprop  Itemprop.
	 * @param array  $m         Member (for filters).
	 * @param bool   $secondary Flip / secondary image.
	 * @return string
	 */
	private function img_tag( $id, $url, $alt, $class, $itemprop, $m = array(), $secondary = false ) {
		$member_id = isset( $m['id'] ) ? (int) $m['id'] : 0;
		$size      = $this->attr( 'thumbnailSize', 'large' );
		/**
		 * Filters the image size used for a member thumbnail (primary or flip image).
		 *
		 * @param string $size      Registered image size.
		 * @param int    $member_id Member post id.
		 * @param bool   $secondary True for the flip (secondary) image.
		 */
		$size    = (string) apply_filters( $secondary ? 'bptm_member_secondary_thumbnail_size' : 'bptm_member_thumbnail_size', $size, $member_id, $secondary );
		$size    = '' !== $size ? $size : 'large';
		$no_lazy = (bool) $this->pref( 'disable_lazy_load', false );
		/**
		 * Filters the CSS classes of a member thumbnail <img>.
		 *
		 * @param string[] $classes   Classes.
		 * @param int      $member_id Member post id.
		 * @param bool     $secondary True for the flip (secondary) image.
		 */
		$classes = implode( ' ', array_map( 'sanitize_html_class', array_filter( (array) apply_filters( $secondary ? 'bptm_member_secondary_thumbnail_classes' : 'bptm_member_thumbnail_classes', preg_split( '/\s+/', trim( (string) $class ) ), $member_id, $secondary ) ) ) );
		$attr    = array(
			'class' => '',
			'alt'   => wp_strip_all_tags( (string) $alt ),
		);
		if ( $no_lazy ) {
			// "Disable lazy load" applies to every member image (cards, flip, popup / panel / drawer).
			$classes             = trim( $classes . ' ' . implode( ' ', $this->no_lazy_classes() ) );
			$attr['loading']      = 'eager';
			$attr['data-no-lazy'] = '1';
		} else {
			$attr['loading']  = $this->index < 4 && 'carousel' !== $this->view && ! $this->is_detail() ? 'eager' : 'lazy';
			$attr['decoding'] = 'async';
		}
		$attr['class'] = trim( $classes );
		if ( $itemprop ) {
			$attr['itemprop'] = $itemprop;
		}
		if ( $id && wp_attachment_is_image( $id ) ) {
			$html = wp_get_attachment_image( $id, $size, false, $attr );
			if ( $html ) {
				return $html;
			}
		}
		if ( empty( $url ) ) {
			$url             = function_exists( 'bptm_placeholder_image_url' ) ? bptm_placeholder_image_url() : '';
			$attr['class'] .= ' bptm-img-placeholder';
		}
		if ( empty( $url ) ) {
			return '<span class="' . esc_attr( $attr['class'] ) . ' bptm-img-empty" role="img" aria-label="' . esc_attr( $attr['alt'] ) . '"></span>';
		}
		$attr = array( 'src' => $url ) + $attr;
		return '<img' . self::attrs( $attr ) . ' />';
	}

	/**
	 * Lazy-load exclusion classes from Preferences (space / comma separated list, each sanitized).
	 *
	 * @return string[]
	 */
	public function no_lazy_classes() {
		$raw = (string) $this->pref( 'lazy_load_class', 'skip-lazy' );
		$out = array();
		foreach ( preg_split( '/[\s,]+/', trim( $raw ), -1, PREG_SPLIT_NO_EMPTY ) as $c ) {
			$c = sanitize_html_class( $c );
			if ( '' !== $c ) {
				$out[ $c ] = $c;
			}
		}
		return array_values( $out );
	}

	/**
	 * When "disable lazy load" is on, mark the <img> tags inside rich HTML (full description in popup /
	 * panel / drawer, which went through the_content and got loading="lazy") as eager + exclusion classes.
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	public function no_lazy_html( $html ) {
		if ( ! $this->pref( 'disable_lazy_load', false ) || false === stripos( $html, '<img' ) || ! class_exists( '\WP_HTML_Tag_Processor' ) ) {
			return $html;
		}
		$classes = $this->no_lazy_classes();
		$p       = new \WP_HTML_Tag_Processor( $html );
		while ( $p->next_tag( 'img' ) ) {
			$p->set_attribute( 'loading', 'eager' );
			$p->set_attribute( 'data-no-lazy', '1' );
			$p->remove_attribute( 'decoding' );
			foreach ( $classes as $c ) {
				$p->add_class( $c );
			}
		}
		return $p->get_updated_html();
	}

	/**
	 * Escape plain (already entity-decoded) text exactly once.
	 *
	 * @param string $text Text.
	 * @return string
	 */
	public static function esc_text( $text ) {
		return htmlspecialchars( (string) $text, ENT_QUOTES, 'UTF-8', true );
	}

	/**
	 * Escaped visible text of an email address / URL with <wbr> break opportunities after "@" and
	 * before "." (so it wraps at sensible points instead of mid-word), wrapped in .bptm-email-text.
	 *
	 * @param string $text Raw text.
	 * @return string
	 */
	public static function breakable_text( $text ) {
		$parts = preg_split( '/(@|\.)/', (string) $text, -1, PREG_SPLIT_DELIM_CAPTURE );
		$out   = '';
		foreach ( (array) $parts as $part ) {
			if ( '@' === $part ) {
				$out .= '@<wbr>';
			} elseif ( '.' === $part ) {
				$out .= '<wbr>.';
			} else {
				$out .= esc_html( $part );
			}
		}
		return '<span class="bptm-email-text">' . $out . '</span>';
	}

	/**
	 * Name heading (linked when name linking is on).
	 *
	 * @param array  $m   Member.
	 * @param string $tag Tag.
	 * @return string
	 */
	public function name( $m, $tag = 'h3' ) {
		if ( ! $this->show( 'name' ) || '' === (string) $m['name'] ) {
			return '';
		}
		$tag  = in_array( $tag, array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'span', 'td', 'strong' ), true ) ? $tag : 'h3';
		$name = esc_html( $m['name'] );
		if ( $this->has_link( $m ) ) {
			$name = $this->link_open( $m, 'bptm-name-link' ) . '<span itemprop="name">' . $name . '</span></a>';
		} else {
			$name = '<span itemprop="name">' . $name . '</span>';
		}
		$html = sprintf( '<%1$s class="%2$s">%3$s</%1$s>', $tag, $this->vis_classes( 'name', 'bptm-name' ), $name );
		/**
		 * Filters the member name markup.
		 *
		 * @param string  $html      Name HTML.
		 * @param int     $member_id Member post id.
		 * @param array   $m         Member data.
		 * @param Context $ctx       Render context.
		 */
		$html = (string) apply_filters( 'bptm_member_name_html', $html, (int) $m['id'], $m, $this );
		return $this->with_hook( $html, 'bptm_after_member_name', $m, $tag );
	}

	/**
	 * Designation.
	 *
	 * @param array  $m   Member.
	 * @param string $tag Tag.
	 * @return string
	 */
	public function designation( $m, $tag = 'div' ) {
		if ( ! $this->show( 'designation' ) || '' === (string) $m['designation'] ) {
			return '';
		}
		$tag = in_array( $tag, array( 'div', 'p', 'span', 'td', 'h4', 'h5', 'h6' ), true ) ? $tag : 'div';
		$html = sprintf( '<%1$s class="%2$s" itemprop="jobTitle">%3$s</%1$s>', $tag, $this->vis_classes( 'designation', 'bptm-designation' ), esc_html( $m['designation'] ) );
		return $this->with_hook( $html, 'bptm_after_member_designation', $m, $tag );
	}

	/**
	 * Description: trimmed text on cards, full HTML in detail views or when HTML is allowed.
	 *
	 * @param array $m Member.
	 * @return string
	 */
	public function details( $m ) {
		if ( ! $this->show( 'details' ) ) {
			return '';
		}
		$classes = 'bptm-details';
		if ( ! empty( $this->atts['descScrollControl'] ) ) {
			$classes .= ' bptm-scroll';
		}
		if ( $this->is_detail() || ! empty( $this->atts['allowHtmlDetails'] ) ) {
			$html = (string) $m['content'];
			if ( '' === trim( wp_strip_all_tags( $html ) ) ) {
				$html = (string) $m['excerpt'];
			}
			if ( '' === trim( wp_strip_all_tags( $html ) ) ) {
				return $this->acf_after( $m, 'after_description' );
			}
			if ( false === strpos( $html, '<p' ) ) {
				$html = wpautop( $html );
			}
			$inner = $this->no_lazy_html( wp_kses_post( $html ) );
		} else {
			$text = '' !== trim( (string) $m['excerpt'] ) ? $m['excerpt'] : $m['content'];
			// Measure and cut the plain text, never its HTML-encoded form: decode entities first (wptexturize
			// stores `&` as `&#038;`/`&amp;`), so a cut can never land inside an entity; esc_html() encodes once below.
			$text = html_entity_decode( wp_check_invalid_utf8( wp_strip_all_tags( strip_shortcodes( (string) $text ) ), true ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
			$text = trim( (string) preg_replace( '/[\s\x{00A0}]+/u', ' ', $text ) );
			if ( '' === $text ) {
				return $this->acf_after( $m, 'after_description' );
			}
			$max   = (int) $this->attr( 'detailsLength', 100 );
			$inner = self::esc_text( $text );
			$len   = function_exists( 'mb_strlen' ) ? mb_strlen( $text ) : strlen( $text );
			if ( $max > 0 && $len > $max ) {
				$cut   = function_exists( 'mb_substr' ) ? mb_substr( $text, 0, $max ) : substr( $text, 0, $max );
				$inner = self::esc_text( rtrim( $cut ) ) . '&hellip;';
				if ( $this->has_link( $m ) ) {
					$inner .= ' ' . $this->link_open( $m, 'bptm-more' ) . esc_html( $this->t( 'more' ) ) . '</a>';
				}
			}
			$inner = '<p>' . $inner . '</p>';
		}
		$out = sprintf( '<div class="%s" itemprop="description">%s</div>', $this->vis_classes( 'details', $classes ), $inner );
		return $out . $this->hook( 'bptm_after_member_details', $m ) . $this->acf_after( $m, 'after_description' );
	}

	/**
	 * Social links.
	 *
	 * @param array  $m     Member.
	 * @param string $style Modifier.
	 * @return string
	 */
	public function social( $m, $style = '' ) {
		if ( ! $this->show( 'social' ) || empty( $m['social'] ) ) {
			return '';
		}
		$html = $this->partial( 'social', array( 'm' => $m, 'style' => $style ) );
		return '' === $html ? '' : $html . $this->hook( 'bptm_after_member_social_links', $m );
	}

	/**
	 * Href for a social entry.
	 *
	 * @param array $s Social entry.
	 * @return string
	 */
	public static function social_href( $s ) {
		$icon = isset( $s['icon'] ) ? (string) $s['icon'] : '';
		$link = isset( $s['link'] ) ? trim( (string) $s['link'] ) : '';
		if ( '' === $link ) {
			return '';
		}
		if ( false !== strpos( $icon, 'envelope' ) && is_email( $link ) ) {
			return 'mailto:' . $link;
		}
		if ( preg_match( '/fa-(phone|mobile)/', $icon ) && preg_match( '/^[+\d][\d\s().-]+$/', $link ) ) {
			return 'tel:' . preg_replace( '/[^\d+]/', '', $link );
		}
		if ( false !== strpos( $icon, 'whatsapp' ) && preg_match( '/^[+\d][\d\s().-]+$/', $link ) ) {
			return 'https://wa.me/' . preg_replace( '/\D/', '', $link );
		}
		if ( false !== strpos( $icon, 'skype' ) && ! preg_match( '#^[a-z]+:#i', $link ) ) {
			return 'skype:' . $link . '?chat';
		}
		if ( ! preg_match( '#^[a-z][a-z0-9+.-]*:#i', $link ) ) {
			$link = 'https://' . ltrim( $link, '/' );
		}
		return $link;
	}

	/**
	 * Ribbon.
	 *
	 * @param array $m Member.
	 * @return string
	 */
	public function ribbon( $m ) {
		if ( ! $this->show( 'ribbon' ) || '' === trim( (string) $m['ribbon'] ) ) {
			return '';
		}
		return $this->partial( 'ribbon', array( 'm' => $m ) ) . $this->hook( 'bptm_after_member_ribbon', $m );
	}

	/**
	 * Featured badge.
	 *
	 * @param array $m Member.
	 * @return string
	 */
	public function featured_badge( $m ) {
		if ( empty( $m['featured'] ) || empty( $this->atts['enableFeaturing'] ) || ! $this->show( 'featured_badge' ) ) {
			return '';
		}
		return '<span class="' . $this->vis_classes( 'featured_badge', 'bptm-featured' ) . '" title="' . esc_attr__( 'Featured', 'bp-team-member' ) . '"><i class="fas fa-award" aria-hidden="true"></i><span class="screen-reader-text">' . esc_html__( 'Featured', 'bp-team-member' ) . '</span></span>' . $this->hook( 'bptm_after_member_featured_badge', $m );
	}

	/**
	 * Skills bars.
	 *
	 * @param array $m     Member.
	 * @param bool  $title Show title.
	 * @return string
	 */
	public function skills( $m, $title = null ) {
		$out = '';
		if ( $this->show( 'skills' ) && ! empty( $m['skills'] ) ) {
			$out = $this->partial(
				'skills',
				array(
					'm'     => $m,
					'title' => null === $title ? $this->is_detail() : (bool) $title,
				)
			);
			if ( '' !== $out ) {
				$out .= $this->hook( 'bptm_after_member_skills', $m );
			}
		}
		return $out . $this->acf_after( $m, 'after_skills' );
	}

	/**
	 * Meta details rows.
	 *
	 * @param array  $m       Member.
	 * @param string $variant list | icons | inline | table.
	 * @return string
	 */
	public function meta_details( $m, $variant = 'list' ) {
		$rows = $this->meta_rows( $m );
		$out  = $rows ? $this->partial(
			'meta-details',
			array(
				'm'       => $m,
				'rows'    => $rows,
				'variant' => in_array( $variant, array( 'list', 'icons', 'inline', 'table' ), true ) ? $variant : 'list',
			)
		) : '';
		if ( '' !== $out ) {
			$out .= $this->hook( 'bptm_after_member_meta_details', $m );
		}
		return $out . $this->acf_after( $m, 'after_meta_details' );
	}

	/**
	 * Visible meta rows: field => [label, html value, icon, classes].
	 *
	 * @param array $m Member.
	 * @return array
	 */
	public function meta_rows( $m ) {
		$rows = array();
		$taxes = function_exists( 'bptm_taxonomies' ) ? bptm_taxonomies() : array();
		$add   = function ( $field, $label, $value_html, $icon, $prop = '' ) use ( &$rows ) {
			if ( '' === trim( wp_strip_all_tags( (string) $value_html ) ) || ! $this->show( $field ) ) {
				return;
			}
			$rows[ $field ] = array(
				'label'   => $label,
				'value'   => $value_html,
				'icon'    => $icon,
				'classes' => $this->vis_classes( $field, 'bptm-meta-item bptm-meta-' . str_replace( '_', '-', $field ) ),
				'prop'    => $prop,
			);
		};

		// Company.
		$company = '';
		if ( '' !== (string) $m['company'] || '' !== (string) $m['company_website'] ) {
			$text    = '' !== (string) $m['company'] ? $m['company'] : preg_replace( '#^https?://#', '', $m['company_website'] );
			$company = '' !== (string) $m['company_website']
				? '<a href="' . esc_url( $m['company_website'] ) . '" target="_blank" rel="nofollow noopener">' . ( '' !== (string) $m['company'] ? esc_html( $text ) : self::breakable_text( $text ) ) . '</a>'
				: esc_html( $text );
			$company = '<span itemprop="worksFor">' . $company . '</span>';
		}
		$add( 'company', $this->t( 'company' ), $company, 'fas fa-briefcase' );
		$add( 'address', $this->t( 'address' ), '' !== (string) $m['address'] ? '<span itemprop="address">' . wp_kses_post( $m['address'] ) . '</span>' : '', 'fas fa-location-dot' );
		$add( 'land_phone', $this->t( 'land_phone' ), $this->phone( $m['land_phone'], 'land_phone_link' ), 'fas fa-phone' );
		$add( 'cell_phone', $this->t( 'cell_phone' ), $this->phone( $m['cell_phone'], 'cell_phone_link' ), 'fas fa-mobile-screen' );
		$add( 'email', $this->t( 'email' ), $this->email( $m ), 'fas fa-envelope' );
		foreach ( array( 'location', 'language', 'specialty', 'gender' ) as $k ) {
			$label = $this->tax_meta_label( $k, $taxes );
			$icons = array(
				'location'  => 'fas fa-map-pin',
				'language'  => 'fas fa-language',
				'specialty' => 'fas fa-star',
				'gender'    => 'fas fa-venus-mars',
			);
			$add( $k, $label, esc_html( $this->terms_text( $m, $k ) ), $icons[ $k ] );
		}
		$add( 'zip', $this->t( 'zip_code' ), '' !== (string) $m['zip_code'] ? '<span itemprop="postalCode">' . esc_html( $m['zip_code'] ) . '</span>' : '', 'fas fa-map-location-dot' );
		foreach ( array( 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five' ) as $k ) {
			$label = isset( $taxes[ $k ]['label'] ) && $taxes[ $k ]['label'] ? $taxes[ $k ]['label'] : ucwords( str_replace( '_', ' ', $k ) );
			$add( $k, $label, esc_html( $this->terms_text( $m, $k ) ), 'fas fa-circle-info' );
		}
		return apply_filters( 'bptm_meta_rows', $rows, $m, $this );
	}

	/**
	 * Meta-details label for a taxonomy field (location, language, specialty, gender).
	 * A customised translation (Settings > Translations, or the `bptm_translation` filter in
	 * multilingual mode) wins; otherwise the taxonomy label (which can be renamed in taxonomy settings).
	 *
	 * @param string $k     Taxonomy key.
	 * @param array  $taxes bptm_taxonomies().
	 * @return string
	 */
	public function tax_meta_label( $k, array $taxes = array() ) {
		$label = self::tax_label( $k, $taxes );
		return '' !== $label ? $label : $this->t( $k );
	}

	/**
	 * Static form of tax_meta_label() for code without a Context (table column headers, filter placeholders).
	 * Customised translation wins, else taxonomy label, else the translation / default string.
	 *
	 * @param string     $k     Taxonomy key.
	 * @param array|null $taxes bptm_taxonomies() (loaded when null).
	 * @return string
	 */
	public static function tax_label( $k, $taxes = null ) {
		$translated = function_exists( 'bptm_translation' ) ? trim( (string) bptm_translation( $k ) ) : '';
		$defaults   = function_exists( 'bptm_translation_defaults' ) ? bptm_translation_defaults() : array();
		$default    = isset( $defaults[ $k ] ) ? (string) $defaults[ $k ] : '';
		if ( '' !== $translated && $translated !== $k && $translated !== $default ) {
			return $translated;
		}
		if ( null === $taxes ) {
			$taxes = function_exists( 'bptm_taxonomies' ) ? (array) bptm_taxonomies() : array();
		}
		if ( isset( $taxes[ $k ]['label'] ) && '' !== (string) $taxes[ $k ]['label'] ) {
			return (string) $taxes[ $k ]['label'];
		}
		if ( '' !== $translated && $translated !== $k ) {
			return $translated;
		}
		return $default;
	}

	/**
	 * Phone value (optionally linked).
	 *
	 * @param string $num  Number.
	 * @param string $pref Preference key.
	 * @return string
	 */
	public function phone( $num, $pref ) {
		$num = trim( (string) $num );
		if ( '' === $num ) {
			return '';
		}
		$text = '<span itemprop="telephone">' . esc_html( $num ) . '</span>';
		if ( $this->pref( $pref, false ) ) {
			return '<a href="' . esc_url( 'tel:' . preg_replace( '/[^\d+]/', '', $num ), array( 'tel' ) ) . '">' . $text . '</a>';
		}
		return $text;
	}

	/**
	 * Email value (optionally mailto link with cc/bcc).
	 *
	 * @param array $m Member.
	 * @return string
	 */
	public function email( $m ) {
		$email = sanitize_email( (string) $m['email'] );
		if ( '' === $email ) {
			return '';
		}
		// Visible text gets <wbr> break points (after @, before .); the href below stays the plain address.
		$text = '<span itemprop="email">' . self::breakable_text( $email ) . '</span>';
		if ( ! $this->pref( 'email_link', false ) ) {
			return $text;
		}
		$link = '<a href="' . esc_url( $this->mailto( $m ), array( 'mailto' ) ) . '">' . $text . '</a>';
		/**
		 * Filters the member email link markup (only when email linking is on).
		 *
		 * @param string $link      Link HTML.
		 * @param int    $member_id Member post id.
		 * @param array  $m         Member data.
		 */
		return (string) apply_filters( 'bptm_member_email_link', $link, (int) $m['id'], $m );
	}

	/**
	 * Mailto URL.
	 *
	 * @param array $m Member.
	 * @return string
	 */
	public function mailto( $m ) {
		$q = array();
		if ( ! empty( $m['email_cc'] ) ) {
			$q[] = 'cc=' . rawurlencode( $m['email_cc'] );
		}
		if ( ! empty( $m['email_bcc'] ) ) {
			$q[] = 'bcc=' . rawurlencode( $m['email_bcc'] );
		}
		return 'mailto:' . sanitize_email( $m['email'] ) . ( $q ? '?' . implode( '&', $q ) : '' );
	}

	/**
	 * vCard download link.
	 *
	 * @param array $m Member.
	 * @return string
	 */
	public function vcard( $m ) {
		if ( empty( $m['vcard'] ) || ! $this->show( 'vcard' ) ) {
			return '';
		}
		return '<a class="' . $this->vis_classes( 'vcard', 'bptm-vcard' ) . '" href="' . esc_url( $m['vcard'] ) . '" download><i class="fas fa-address-card" aria-hidden="true"></i> <span>' . esc_html( $this->t( 'vcard' ) ) . '</span></a>';
	}

	/**
	 * Read more button.
	 *
	 * @param array  $m    Member.
	 * @param string $text Custom text.
	 * @return string
	 */
	public function read_more( $m, $text = '' ) {
		if ( ! $this->show( 'read_more' ) || ! $this->has_link( $m ) ) {
			return '';
		}
		$text = '' !== $text ? $text : $this->t( 'read_on' );
		return '<div class="' . $this->vis_classes( 'read_more', 'bptm-readmore' ) . '">' . $this->link_open( $m, 'bptm-readmore-btn' ) . esc_html( $text ) . '</a></div>';
	}

	/**
	 * ACF fields block (once per member per group).
	 *
	 * @param array $m Member.
	 * @return string
	 */
	public function acf( $m ) {
		$key = $this->group . ':' . (int) $m['id'];
		if ( isset( $this->acf_done[ $key ] ) || ! $this->acf_enabled() || ! $this->show( 'acf_fields' ) || ! function_exists( 'acf_get_field_groups' ) ) {
			return '';
		}
		$this->acf_done[ $key ] = true;
		return $this->partial( 'acf', array( 'm' => $m ) );
	}

	/**
	 * ACF output enabled?
	 *
	 * @return bool
	 */
	private function acf_enabled() {
		return ! empty( $this->atts['showAcfFields'] ) || (bool) $this->pref( 'show_acf_fields', false );
	}

	/**
	 * ACF position.
	 *
	 * @return string
	 */
	private function acf_position() {
		if ( ! empty( $this->atts['showAcfFields'] ) ) {
			return (string) $this->attr( 'acfFieldsPosition', 'after_skills' );
		}
		return (string) $this->pref( 'acf_fields_position', 'after_skills' );
	}

	/**
	 * ACF block when the configured position matches.
	 *
	 * @param array  $m        Member.
	 * @param string $position Position.
	 * @return string
	 */
	private function acf_after( $m, $position ) {
		if ( ! $this->acf_enabled() || $this->acf_position() !== $position ) {
			return '';
		}
		return $this->acf( $m );
	}

	/**
	 * Term names text.
	 *
	 * @param array  $m   Member.
	 * @param string $key Tax key.
	 * @param string $sep Separator.
	 * @return string
	 */
	public function terms_text( $m, $key, $sep = ', ' ) {
		if ( function_exists( 'bptm_member_term_names' ) ) {
			return (string) bptm_member_term_names( $m, $key, $sep );
		}
		if ( empty( $m['terms'][ $key ] ) ) {
			return '';
		}
		return implode( $sep, wp_list_pluck( $m['terms'][ $key ], 'name' ) );
	}

	/**
	 * Hidden detail markup for popup / panel / drawer.
	 *
	 * @param array $m Member.
	 * @return string
	 */
	public function modal_payload( $m ) {
		$type = $this->member_link_type( $m );
		if ( ! in_array( $type, array( 'popup', 'panel', 'drawer' ), true ) ) {
			return '';
		}
		$styles = array(
			'popup'  => array( 'popupStyle', array( 'default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five', 'style-six' ) ),
			'panel'  => array( 'panelStyle', array( 'default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five' ) ),
			'drawer' => array( 'drawerStyle', array( 'default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five' ) ),
		);
		$style = (string) $this->attr( $styles[ $type ][0], 'default' );
		if ( ! in_array( $style, $styles[ $type ][1], true ) ) {
			$style = 'default';
		}
		$prev  = $this->set_group( $type );
		$dir   = $type . 's';
		$inner = Renderer::template(
			$dir . '/' . $style,
			array(
				'm'   => $m,
				'ctx' => $this,
			)
		);
		if ( null === $inner && 'default' !== $style ) {
			$inner = Renderer::template(
				$dir . '/default',
				array(
					'm'   => $m,
					'ctx' => $this,
				)
			);
		}
		if ( null === $inner ) {
			$inner = $this->partial( 'detail-fallback', array( 'm' => $m ) );
		}
		$inner .= $this->acf( $m );
		$this->set_group( $prev );

		$classes = 'bptm-detail bptm-detail--' . $type . ' bptm-' . $type . '-' . $style;
		if ( 'popup' === $type ) {
			$classes .= ' bptm-popup-cols-' . ( 'one' === $this->attr( 'popupColumns' ) ? 'one' : 'two' );
		}
		return sprintf(
			'<div id="%1$s" class="%2$s" data-bptm-detail="%3$d" data-bptm-type="%4$s" data-bptm-style="%5$s" hidden itemscope itemtype="https://schema.org/Person">%6$s</div>',
			esc_attr( $this->detail_id( $m ) ),
			esc_attr( $classes ),
			(int) $m['id'],
			esc_attr( $type ),
			esc_attr( $style ),
			$inner
		);
	}

	/**
	 * Render a partial from templates/partials and return it.
	 *
	 * @param string $name Partial name.
	 * @param array  $vars Vars.
	 * @return string
	 */
	public function partial( $name, array $vars = array() ) {
		$vars['ctx'] = $this;
		$out         = Renderer::template( 'partials/' . $name, $vars );
		return null === $out ? '' : $out;
	}
}
