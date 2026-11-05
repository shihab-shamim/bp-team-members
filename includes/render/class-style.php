<?php
/**
 * Scoped dynamic CSS generated from the block's style attributes.
 *
 * Typography objects accept camelCase or snake_case keys:
 * fontFamily|font_family, fontSize|size (number => px, string with unit, or {desktop,tablet,mobilePortrait,mobile}),
 * fontWeight|weight, fontStyle|style, lineHeight|line_height, letterSpacing|letter_spacing (number => px),
 * textTransform|transform, textDecoration|decoration, color, hoverColor|hover_color.
 *
 * @package BPTM
 */

namespace BPTM\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * CSS generator.
 */
class Style {

	/**
	 * Attribute => CSS custom property.
	 */
	const COLOR_VARS = array(
		'nameColor'               => '--bptm-name-color',
		'nameBg'                  => '--bptm-name-bg',
		'roleColor'               => '--bptm-role-color',
		'descriptionColor'        => '--bptm-desc-color',
		'descriptionLinkColor'    => '--bptm-desc-link-color',
		'infoColor'               => '--bptm-info-color',
		'infoIconColor'           => '--bptm-info-icon-color',
		'infoBg'                  => '--bptm-info-bg',
		'itemBg'                  => '--bptm-item-bg',
		'itemBgHover'             => '--bptm-item-bg-hover',
		'tooltipBg'               => '--bptm-tooltip-bg',
		'hoverIconBg'             => '--bptm-hover-icon-bg',
		'ribbonBg'                => '--bptm-ribbon-bg',
		'popupArrowColor'         => '--bptm-popup-arrow-color',
		'accentColor'             => '--bptm-accent',
		'sliderNavColor'          => '--bptm-nav-color',
		'sliderNavBg'             => '--bptm-nav-bg',
		'sliderNavHoverColor'     => '--bptm-nav-hover-color',
		'sliderNavHoverBg'        => '--bptm-nav-hover-bg',
		'sliderDotColor'          => '--bptm-dot-color',
		'sliderDotHoverColor'     => '--bptm-dot-active-color',
		'filterTextColor'         => '--bptm-filter-color',
		'filterActiveTextColor'   => '--bptm-filter-active-color',
		'filterBgColor'           => '--bptm-filter-bg',
		'filterActiveBgColor'     => '--bptm-filter-active-bg',
		'filterBorderColor'       => '--bptm-filter-border',
		'filterActiveBorderColor' => '--bptm-filter-active-border',
		'itemBorderColor'         => '--bptm-item-border-color',
	);

	/**
	 * Typography attribute => [var prefix, element selectors, hover selectors].
	 */
	const TYPO = array(
		'nameTypography'     => array( '--bptm-name', array( '.bptm-name', '.bptm-name a' ), array( '.bptm-item:hover .bptm-name', '.bptm-item:hover .bptm-name a' ) ),
		'roleTypography'     => array( '--bptm-role', array( '.bptm-designation' ), array( '.bptm-item:hover .bptm-designation' ) ),
		'detailsTypography'  => array( '--bptm-desc', array( '.bptm-details', '.bptm-details p' ), array( '.bptm-item:hover .bptm-details', '.bptm-item:hover .bptm-details p' ) ),
		'infoTypography'     => array( '--bptm-info', array( '.bptm-meta', '.bptm-meta a', '.bptm-meta-value' ), array( '.bptm-meta-item:hover', '.bptm-meta-item:hover a' ) ),
		'ribbonTypography'   => array( '--bptm-ribbon', array( '.bptm-ribbon' ), array( '.bptm-item:hover .bptm-ribbon' ) ),
		'readmoreTypography' => array( '--bptm-readmore', array( '.bptm-readmore a', '.bptm-more', '.bptm-readmore-btn' ), array( '.bptm-readmore a:hover', '.bptm-more:hover', '.bptm-readmore-btn:hover' ) ),
	);

	/**
	 * Shadow presets.
	 */
	const SHADOWS = array(
		'none' => 'none',
		'sm'   => '0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.06)',
		'md'   => '0 6px 18px rgba(15,23,42,.10)',
		'lg'   => '0 14px 40px rgba(15,23,42,.14)',
		'xl'   => '0 24px 60px rgba(15,23,42,.18)',
	);

	/**
	 * Media queries per device (desktop-first overrides).
	 */
	const MEDIA = array(
		'tablet'         => '@media (max-width:1024px)',
		'mobilePortrait' => '@media (max-width:767px)',
		'mobile'         => '@media (max-width:575px)',
	);

	/**
	 * Sanitize a CSS colour value.
	 *
	 * @param mixed $c Colour.
	 * @return string '' when invalid.
	 */
	public static function color( $c ) {
		$c = trim( (string) $c );
		if ( '' === $c ) {
			return '';
		}
		if ( preg_match( '/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $c ) ) {
			return $c;
		}
		if ( preg_match( '/^(rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s\/+-]+\)$/i', $c ) ) {
			return $c;
		}
		if ( preg_match( '/^var\(--[a-z0-9-]+(\s*,\s*[#a-z0-9(),.%\s-]+)?\)$/i', $c ) ) {
			return $c;
		}
		if ( preg_match( '/^(linear|radial)-gradient\([#a-z0-9(),.%\s-]+\)$/i', $c ) ) {
			return $c;
		}
		if ( preg_match( '/^[a-z]{3,20}$/i', $c ) ) {
			return strtolower( $c );
		}
		return '';
	}

	/**
	 * Sanitize a CSS length (number => px).
	 *
	 * @param mixed  $v       Value.
	 * @param string $unit    Unit for bare numbers.
	 * @return string
	 */
	public static function length( $v, $unit = 'px' ) {
		if ( is_int( $v ) || is_float( $v ) || ( is_string( $v ) && is_numeric( trim( $v ) ) ) ) {
			return ( (float) $v ) . $unit;
		}
		$v = trim( (string) $v );
		if ( '' === $v ) {
			return '';
		}
		if ( preg_match( '/^-?\d*\.?\d+(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|pt)$/i', $v ) ) {
			return strtolower( $v );
		}
		if ( preg_match( '/^(calc|clamp|min|max)\([0-9a-z.%+\-*\/,\s()]+\)$/i', $v ) ) {
			return $v;
		}
		return in_array( $v, array( 'auto', 'normal', 'inherit', 'initial', 'none' ), true ) ? $v : '';
	}

	/**
	 * Sanitize a font family.
	 *
	 * @param string $f Font.
	 * @return string CSS font-family value.
	 */
	public static function font_family( $f ) {
		$f = trim( preg_replace( '/[^a-zA-Z0-9 _-]/', '', (string) $f ) );
		if ( '' === $f || 'default' === strtolower( $f ) ) {
			return '';
		}
		return "'" . $f . "', sans-serif";
	}

	/**
	 * Read a typography key accepting camel or snake aliases.
	 *
	 * @param array  $t     Typography.
	 * @param string $camel Camel key.
	 * @param string $snake Snake key.
	 * @return mixed
	 */
	private static function tget( array $t, $camel, $snake ) {
		if ( isset( $t[ $camel ] ) && '' !== $t[ $camel ] ) {
			return $t[ $camel ];
		}
		return isset( $t[ $snake ] ) && '' !== $t[ $snake ] ? $t[ $snake ] : null;
	}

	/**
	 * Font families used in typography attributes.
	 *
	 * @param array $atts Attributes.
	 * @return string[]
	 */
	public static function fonts( array $atts ) {
		$out = array();
		foreach ( array_keys( self::TYPO ) as $key ) {
			$t = isset( $atts[ $key ] ) && is_array( $atts[ $key ] ) ? $atts[ $key ] : array();
			$f = self::tget( $t, 'fontFamily', 'font_family' );
			if ( $f ) {
				$out[] = trim( preg_replace( '/[^a-zA-Z0-9 _-]/', '', (string) $f ) );
			}
		}
		return array_values( array_unique( array_filter( $out ) ) );
	}

	/**
	 * Generate the CSS for an instance.
	 *
	 * @param array  $atts  Attributes.
	 * @param string $scope Scope selector list (e.g. "#bptm-x, .bptm-modal[data-bptm-for=x]").
	 * @return string
	 */
	public static function css( array $atts, $scope ) {
		$scopes = array_map( 'trim', explode( ',', $scope ) );
		$vars   = array();
		$rules  = array(); // media => selector => decls.

		$add = static function ( $media, $selectors, $decl ) use ( &$rules, $scopes ) {
			$full = array();
			foreach ( (array) $selectors as $sel ) {
				foreach ( $scopes as $sc ) {
					$full[] = '' === $sel ? $sc : $sc . ' ' . $sel;
				}
			}
			$key                      = implode( ',', $full );
			$rules[ $media ][ $key ][] = $decl;
		};

		// Columns / gaps.
		$cols = isset( $atts['columns'] ) && is_array( $atts['columns'] ) ? $atts['columns'] : array();
		$map  = array(
			'desktop'        => 'd',
			'tablet'         => 't',
			'mobilePortrait' => 'mp',
			'mobile'         => 'm',
		);
		foreach ( $map as $k => $s ) {
			if ( isset( $cols[ $k ] ) && (int) $cols[ $k ] > 0 ) {
				$vars[ '--bptm-cols-' . $s ] = min( 12, (int) $cols[ $k ] );
			}
		}
		if ( isset( $atts['columnGap'] ) && '' !== $atts['columnGap'] ) {
			$vars['--bptm-gap'] = self::length( $atts['columnGap'] );
		}
		if ( isset( $atts['rowGap'] ) && '' !== $atts['rowGap'] ) {
			$vars['--bptm-row-gap'] = self::length( $atts['rowGap'] );
		}

		// Colours.
		foreach ( self::COLOR_VARS as $attr => $var ) {
			$c = isset( $atts[ $attr ] ) ? self::color( $atts[ $attr ] ) : '';
			if ( '' !== $c ) {
				$vars[ $var ] = $c;
			}
		}
		// Direct application so themes that hard-code colours still follow the settings.
		$direct = array(
			'nameColor'            => array( array( '.bptm-name', '.bptm-name a' ), 'color' ),
			'nameBg'               => array( array( '.bptm-name' ), 'background' ),
			'roleColor'            => array( array( '.bptm-designation' ), 'color' ),
			'descriptionColor'     => array( array( '.bptm-details', '.bptm-details p' ), 'color' ),
			'descriptionLinkColor' => array( array( '.bptm-details a', '.bptm-more' ), 'color' ),
			'infoColor'            => array( array( '.bptm-meta', '.bptm-meta a' ), 'color' ),
			'infoIconColor'        => array( array( '.bptm-meta-icon' ), 'color' ),
			'ribbonBg'             => array( array( '.bptm-ribbon' ), 'background' ),
		);
		foreach ( $direct as $attr => $def ) {
			$c = isset( $atts[ $attr ] ) ? self::color( $atts[ $attr ] ) : '';
			if ( '' !== $c ) {
				$add( '', $def[0], $def[1] . ':' . $c );
			}
		}
		$c = isset( $atts['itemBg'] ) ? self::color( $atts['itemBg'] ) : '';
		if ( '' !== $c ) {
			$add( '', array( 'tr.bptm-item > td' ), 'background:' . $c );
		}
		$c = isset( $atts['itemBgHover'] ) ? self::color( $atts['itemBgHover'] ) : '';
		if ( '' !== $c ) {
			$add( '', array( 'tr.bptm-item:hover > td' ), 'background:' . $c );
		}

		// Box. Item themes draw their card on .bptm-ta-card / .bptm-tb-card (the item itself is only a grid cell).
		$card = array( '.bptm-item > .bptm-ta-card', '.bptm-item > .bptm-tb-card' );
		$pad = isset( $atts['itemPadding'] ) && is_array( $atts['itemPadding'] ) ? $atts['itemPadding'] : array();
		if ( $pad ) {
			$p = array();
			foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
				$v   = isset( $pad[ $side ] ) ? self::length( $pad[ $side ] ) : '';
				$p[] = '' === $v ? '0' : $v;
			}
			if ( '0 0 0 0' !== implode( ' ', $p ) || array_filter( $pad, 'strlen' ) ) {
				$vars['--bptm-item-padding'] = implode( ' ', $p );
				// Cards consume --bptm-item-padding (theme contract); applying it to .bptm-item as well would double it.
			}
		}
		$r = isset( $atts['itemBorderRadius'] ) ? self::length( $atts['itemBorderRadius'] ) : '';
		if ( '' !== $r ) {
			$vars['--bptm-radius'] = $r;
		}
		$sh = isset( $atts['itemShadow'] ) ? trim( (string) $atts['itemShadow'] ) : '';
		if ( '' !== $sh ) {
			$val = isset( self::SHADOWS[ $sh ] ) ? self::SHADOWS[ $sh ] : ( preg_match( '/^[#a-z0-9(),.%\s-]+$/i', $sh ) ? $sh : '' );
			if ( '' !== $val ) {
				$vars['--bptm-shadow'] = $val;
			}
		}
		$bw = isset( $atts['itemBorderWidth'] ) ? self::length( $atts['itemBorderWidth'] ) : '';
		$bc = isset( $atts['itemBorderColor'] ) ? self::color( $atts['itemBorderColor'] ) : '';
		if ( '' !== $bw || '' !== $bc ) {
			// No theme variable exists for a border width, so the border is drawn on the card itself.
			if ( '' !== $r ) {
				$add( '', $card, 'border-radius:' . $r );
			}
			$add( '', $card, 'border:' . ( '' !== $bw ? $bw : '1px' ) . ' solid ' . ( '' !== $bc ? $bc : 'currentColor' ) );
		}
		$ir = isset( $atts['imageBorderRadius'] ) ? self::length( $atts['imageBorderRadius'] ) : '';
		if ( '' !== $ir ) {
			$vars['--bptm-img-radius'] = $ir;
			$add( '', array( '.bptm-img', '.bptm-img-wrap' ), 'border-radius:' . $ir );
		}

		// Content alignment (legacy attribute).
		if ( ! empty( $atts['alignment'] ) && in_array( $atts['alignment'], array( 'left', 'center', 'right', 'start', 'end' ), true ) ) {
			$vars['--bptm-align'] = $atts['alignment'];
		}

		// Description scroll height.
		$mh = isset( $atts['maxScrollHeight'] ) ? self::length( $atts['maxScrollHeight'] ) : '';
		if ( '' !== $mh ) {
			$vars['--bptm-desc-max-h'] = $mh;
		}

		// Typography.
		foreach ( self::TYPO as $attr => $def ) {
			$t = isset( $atts[ $attr ] ) && is_array( $atts[ $attr ] ) ? $atts[ $attr ] : array();
			if ( ! $t ) {
				continue;
			}
			list( $prefix, $els, $hover ) = $def;
			$decl                         = array();
			$fam                          = self::font_family( self::tget( $t, 'fontFamily', 'font_family' ) );
			if ( '' !== $fam ) {
				$decl['font-family'] = $fam;
			}
			$w = self::tget( $t, 'fontWeight', 'weight' );
			if ( null !== $w && preg_match( '/^(\d{3}|normal|bold|lighter|bolder)$/', (string) $w ) ) {
				$decl['font-weight'] = (string) $w;
			}
			$s = self::tget( $t, 'fontStyle', 'style' );
			if ( null !== $s && in_array( $s, array( 'normal', 'italic', 'oblique' ), true ) ) {
				$decl['font-style'] = $s;
			}
			$tt = self::tget( $t, 'textTransform', 'transform' );
			if ( null !== $tt && in_array( $tt, array( 'none', 'uppercase', 'lowercase', 'capitalize' ), true ) ) {
				$decl['text-transform'] = $tt;
			}
			$td = self::tget( $t, 'textDecoration', 'decoration' );
			if ( null !== $td && in_array( $td, array( 'none', 'underline', 'overline', 'line-through' ), true ) ) {
				$decl['text-decoration'] = $td;
			}
			$lh = self::tget( $t, 'lineHeight', 'line_height' );
			if ( null !== $lh && ! is_array( $lh ) ) {
				$lhv = is_numeric( $lh ) ? (string) (float) $lh : self::length( $lh );
				if ( '' !== $lhv ) {
					$decl['line-height'] = $lhv;
				}
			}
			$ls = self::tget( $t, 'letterSpacing', 'letter_spacing' );
			if ( null !== $ls && ! is_array( $ls ) ) {
				$lsv = self::length( $ls );
				if ( '' !== $lsv ) {
					$decl['letter-spacing'] = $lsv;
				}
			}
			$col = self::color( self::tget( $t, 'color', 'color' ) );
			if ( '' !== $col ) {
				$decl['color'] = $col;
			}
			$size = self::tget( $t, 'fontSize', 'size' );
			$resp = array();
			if ( is_array( $size ) ) {
				foreach ( array( 'desktop', 'tablet', 'mobilePortrait', 'mobile' ) as $d ) {
					$alias = 'mobilePortrait' === $d && isset( $size['mobile_landscape'] ) ? $size['mobile_landscape'] : null;
					$v     = isset( $size[ $d ] ) ? $size[ $d ] : $alias;
					$v     = null === $v ? '' : self::length( $v );
					if ( '' !== $v ) {
						$resp[ $d ] = $v;
					}
				}
				if ( isset( $resp['desktop'] ) ) {
					$decl['font-size'] = $resp['desktop'];
				}
			} elseif ( null !== $size ) {
				$v = self::length( $size );
				if ( '' !== $v ) {
					$decl['font-size'] = $v;
				}
			}
			foreach ( $decl as $prop => $val ) {
				$vars[ $prefix . '-' . $prop ] = $val;
				$add( '', $els, $prop . ':' . $val );
			}
			foreach ( $resp as $d => $v ) {
				if ( 'desktop' !== $d ) {
					$add( self::MEDIA[ $d ], $els, 'font-size:' . $v );
				}
			}
			$hc = self::color( self::tget( $t, 'hoverColor', 'hover_color' ) );
			if ( '' !== $hc ) {
				$add( '', $hover, 'color:' . $hc );
			}
		}

		// Assemble.
		$css = '';
		if ( $vars ) {
			$decls = array();
			foreach ( $vars as $k => $v ) {
				$decls[] = $k . ':' . $v;
			}
			$css .= implode( ',', $scopes ) . '{' . implode( ';', $decls ) . '}';
		}
		foreach ( array( '' => '' ) + array_flip( array_values( self::MEDIA ) ) as $media => $unused ) {
			if ( empty( $rules[ $media ] ) ) {
				continue;
			}
			$block = '';
			foreach ( $rules[ $media ] as $sel => $decls ) {
				$block .= $sel . '{' . implode( ';', array_unique( $decls ) ) . '}';
			}
			$css .= '' === $media ? $block : $media . '{' . $block . '}';
		}

		// Never allow closing the style tag.
		return str_replace( array( '</', '<' ), '', apply_filters( 'bptm_dynamic_css', $css, $atts, $scope ) );
	}
}
