/**
 * Scoped dynamic CSS generated from the block's style attributes (port of the former PHP Style class).
 * Every value is validated (colours, lengths, font names, keywords) so attributes cannot break out of
 * the <style> element; '<' is stripped from the final text as a last guard.
 */
import { knownFonts, pref } from './bridge';

export const COLOR_VARS = {
	nameColor: '--bptm-name-color',
	nameBg: '--bptm-name-bg',
	roleColor: '--bptm-role-color',
	descriptionColor: '--bptm-desc-color',
	descriptionLinkColor: '--bptm-desc-link-color',
	infoColor: '--bptm-info-color',
	infoIconColor: '--bptm-info-icon-color',
	infoBg: '--bptm-info-bg',
	itemBg: '--bptm-item-bg',
	itemBgHover: '--bptm-item-bg-hover',
	tooltipBg: '--bptm-tooltip-bg',
	hoverIconBg: '--bptm-hover-icon-bg',
	ribbonBg: '--bptm-ribbon-bg',
	pgColor: '--bptm-pg-color',
	pgBg: '--bptm-pg-bg',
	pgBorderColor: '--bptm-pg-border',
	pgHoverColor: '--bptm-pg-hover-color',
	pgHoverBg: '--bptm-pg-hover-bg',
	pgHoverBorderColor: '--bptm-pg-hover-border',
	pgActiveColor: '--bptm-pg-active-color',
	pgActiveBg: '--bptm-pg-active-bg',
	pgActiveBorderColor: '--bptm-pg-active-border',
	lmColor: '--bptm-lm-color',
	lmBg: '--bptm-lm-bg',
	lmBorderColor: '--bptm-lm-border',
	lmHoverColor: '--bptm-lm-hover-color',
	lmHoverBg: '--bptm-lm-hover-bg',
	pgLoaderColor: '--bptm-pg-loader-color',
	popupBg: '--bptm-modal-bg',
	popupCloseColor: '--bptm-close-color',
	popupCloseBg: '--bptm-close-bg',
	popupCloseHoverColor: '--bptm-close-hover-color',
	popupCloseHoverBg: '--bptm-close-hover-bg',
	popupArrowColor: '--bptm-popup-arrow-color',
	popupNavBg: '--bptm-popup-nav-bg',
	popupNavBorderColor: '--bptm-popup-nav-border',
	popupNavHoverColor: '--bptm-popup-nav-hover-color',
	popupNavHoverBg: '--bptm-popup-nav-hover-bg',
	popupNavHoverBorderColor: '--bptm-popup-nav-hover-border',
	accentColor: '--bptm-accent',
	sliderNavColor: '--bptm-nav-color',
	sliderNavBg: '--bptm-nav-bg',
	sliderNavHoverColor: '--bptm-nav-hover-color',
	sliderNavHoverBg: '--bptm-nav-hover-bg',
	sliderDotColor: '--bptm-dot-color',
	sliderDotHoverColor: '--bptm-dot-active-color',
	filterTextColor: '--bptm-filter-color',
	filterActiveTextColor: '--bptm-filter-active-color',
	filterBgColor: '--bptm-filter-bg',
	filterActiveBgColor: '--bptm-filter-active-bg',
	filterBorderColor: '--bptm-filter-border',
	filterActiveBorderColor: '--bptm-filter-active-border',
	itemBorderColor: '--bptm-item-border-color',
};

const TYPO = {
	nameTypography: [ '--bptm-name', [ '.bptm-name', '.bptm-name a' ], [ '.bptm-item:hover .bptm-name', '.bptm-item:hover .bptm-name a' ] ],
	roleTypography: [ '--bptm-role', [ '.bptm-designation' ], [ '.bptm-item:hover .bptm-designation' ] ],
	detailsTypography: [ '--bptm-desc', [ '.bptm-details', '.bptm-details p' ], [ '.bptm-item:hover .bptm-details', '.bptm-item:hover .bptm-details p' ] ],
	infoTypography: [ '--bptm-info', [ '.bptm-meta', '.bptm-meta a', '.bptm-meta-value' ], [ '.bptm-meta-item:hover', '.bptm-meta-item:hover a' ] ],
	ribbonTypography: [ '--bptm-ribbon', [ '.bptm-ribbon' ], [ '.bptm-item:hover .bptm-ribbon' ] ],
	readmoreTypography: [ '--bptm-readmore', [ '.bptm-readmore a', '.bptm-more', '.bptm-readmore-btn' ], [ '.bptm-readmore a:hover', '.bptm-more:hover', '.bptm-readmore-btn:hover' ] ],
	popupNavTypography: [ '--bptm-popup-nav', [ '.bptm-modal-nav button span' ], [ '.bptm-modal-nav button:hover span' ] ],
};

const SHADOWS = {
	none: 'none',
	sm: '0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.06)',
	md: '0 6px 18px rgba(15,23,42,.10)',
	lg: '0 14px 40px rgba(15,23,42,.14)',
	xl: '0 24px 60px rgba(15,23,42,.18)',
};

const MEDIA = {
	tablet: '@media (max-width:1024px)',
	mobilePortrait: '@media (max-width:767px)',
	mobile: '@media (max-width:575px)',
};

const isNum = ( v ) => ( 'number' === typeof v && isFinite( v ) ) || ( 'string' === typeof v && '' !== v.trim() && isFinite( Number( v.trim() ) ) );

/** CSS colour or ''. */
export const color = ( c ) => {
	if ( null === c || undefined === c || 'object' === typeof c ) {
		return '';
	}
	c = String( c ).trim();
	if ( '' === c ) {
		return '';
	}
	if ( /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test( c ) ) {
		return c;
	}
	if ( /^(rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s/+-]+\)$/i.test( c ) ) {
		return c;
	}
	if ( /^var\(--[a-z0-9-]+(\s*,\s*[#a-z0-9(),.%\s-]+)?\)$/i.test( c ) ) {
		return c;
	}
	if ( /^(linear|radial)-gradient\([#a-z0-9(),.%\s-]+\)$/i.test( c ) ) {
		return c;
	}
	if ( /^[a-z]{3,20}$/i.test( c ) ) {
		return c.toLowerCase();
	}
	return '';
};

/** CSS length (bare numbers get `unit`) or ''. */
export const length = ( v, unit = 'px' ) => {
	if ( isNum( v ) ) {
		return String( Number( v ) ) + unit;
	}
	if ( null === v || undefined === v || 'object' === typeof v || 'boolean' === typeof v ) {
		return '';
	}
	v = String( v ).trim();
	if ( '' === v ) {
		return '';
	}
	if ( /^-?\d*\.?\d+(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|pt)$/i.test( v ) ) {
		return v.toLowerCase();
	}
	if ( /^(calc|clamp|min|max)\([0-9a-z.%+\-*/,\s()]+\)$/i.test( v ) ) {
		return v;
	}
	return [ 'auto', 'normal', 'inherit', 'initial', 'none' ].includes( v ) ? v : '';
};

const cleanFamily = ( f ) => String( null === f || undefined === f || 'object' === typeof f ? '' : f ).replace( /[^a-zA-Z0-9 _-]/g, '' ).trim();

export const fontFamily = ( f ) => {
	f = cleanFamily( f );
	if ( '' === f || 'default' === f.toLowerCase() ) {
		return '';
	}
	return "'" + f + "', sans-serif";
};

const tget = ( t, camel, snake ) => {
	if ( undefined !== t[ camel ] && null !== t[ camel ] && '' !== t[ camel ] ) {
		return t[ camel ];
	}
	return undefined !== t[ snake ] && null !== t[ snake ] && '' !== t[ snake ] ? t[ snake ] : null;
};

const obj = ( v ) => ( v && 'object' === typeof v && ! Array.isArray( v ) ? v : {} );

/** Font families used by the typography attributes. */
export const usedFonts = ( atts ) => {
	const out = [];
	Object.keys( TYPO ).forEach( ( k ) => {
		const t = obj( atts[ k ] );
		// bpl-tools Typography "Load Google Font" toggle: off = use the family without loading it.
		const f = false === t.isUploadFont ? '' : tget( t, 'fontFamily', 'font_family' );
		const c = f ? cleanFamily( f ) : '';
		if ( c && ! out.includes( c ) ) {
			out.push( c );
		}
	} );
	return out;
};

const SYSTEM = [ 'Arial', 'Tahoma', 'Verdana', 'Helvetica', 'Times New Roman', 'Trebuchet MS', 'Georgia', 'Courier New', 'system-ui', 'sans-serif', 'serif', 'monospace', 'inherit' ];

/**
 * Google Fonts stylesheet URL for the used families ('' when none / disabled).
 *
 * @param {Object} atts Attributes.
 * @return {string} URL.
 */
export const googleFontsUrl = ( atts ) => {
	if ( pref( 'disable_google_fonts' ) ) {
		return '';
	}
	const known = knownFonts();
	const fams = usedFonts( atts ).filter( ( f ) => '' !== f && ! SYSTEM.includes( f ) && 'default' !== f.toLowerCase() && ( ! known.length || known.includes( f ) ) ).sort();
	if ( ! fams.length ) {
		return '';
	}
	// The v1 CSS API tolerates weights a family does not have (css2 rejects the whole request).
	return 'https://fonts.googleapis.com/css?family=' + fams.map( ( f ) => f.replace( / /g, '+' ) + ':300,400,500,600,700,800,400italic,700italic' ).join( '|' ) + '&display=swap';
};

const cssId = ( id ) => ( 'undefined' !== typeof window && window.CSS && 'function' === typeof window.CSS.escape ? window.CSS.escape( id ) : String( id ).replace( /[^A-Za-z0-9_-]/g, '' ) );

/**
 * Dynamic CSS of one instance.
 *
 * @param {Object} atts  Sanitized attributes.
 * @param {string} domId Wrapper id.
 * @param {string} uid   Instance uid (modal scope).
 * @return {string} CSS.
 */
export const dynamicCss = ( atts, domId, uid ) => {
	const scopes = [ '#' + cssId( domId ), '.bptm-modal[data-bptm-for="' + String( uid ).replace( /[^A-Za-z0-9_-]/g, '' ) + '"]' ];
	const vars = [];
	const setVar = ( k, v ) => {
		const i = vars.findIndex( ( x ) => x[ 0 ] === k );
		if ( i >= 0 ) {
			vars[ i ][ 1 ] = v;
		} else {
			vars.push( [ k, v ] );
		}
	};
	const rules = { '': new Map() };
	Object.values( MEDIA ).forEach( ( m ) => {
		rules[ m ] = new Map();
	} );
	const add = ( media, selectors, decl ) => {
		const full = [];
		selectors.forEach( ( sel ) => scopes.forEach( ( sc ) => full.push( '' === sel ? sc : sc + ' ' + sel ) ) );
		const k = full.join( ',' );
		if ( ! rules[ media ].has( k ) ) {
			rules[ media ].set( k, [] );
		}
		rules[ media ].get( k ).push( decl );
	};

	const cols = obj( atts.columns );
	[ [ 'desktop', 'd' ], [ 'tablet', 't' ], [ 'mobilePortrait', 'mp' ], [ 'mobile', 'm' ] ].forEach( ( [ k, s ] ) => {
		const n = Math.trunc( Number( cols[ k ] ) );
		if ( n > 0 ) {
			setVar( '--bptm-cols-' + s, String( Math.min( 12, n ) ) );
		}
	} );
	if ( undefined !== atts.columnGap && '' !== atts.columnGap ) {
		setVar( '--bptm-gap', length( atts.columnGap ) );
	}
	if ( undefined !== atts.rowGap && '' !== atts.rowGap ) {
		setVar( '--bptm-row-gap', length( atts.rowGap ) );
	}
	Object.keys( COLOR_VARS ).forEach( ( a ) => {
		const c = color( atts[ a ] );
		if ( c ) {
			setVar( COLOR_VARS[ a ], c );
		}
	} );
	const direct = {
		nameColor: [ [ '.bptm-name', '.bptm-name a' ], 'color' ],
		nameBg: [ [ '.bptm-name' ], 'background' ],
		roleColor: [ [ '.bptm-designation' ], 'color' ],
		descriptionColor: [ [ '.bptm-details', '.bptm-details p' ], 'color' ],
		descriptionLinkColor: [ [ '.bptm-details a', '.bptm-more' ], 'color' ],
		infoColor: [ [ '.bptm-meta', '.bptm-meta a' ], 'color' ],
		infoIconColor: [ [ '.bptm-meta-icon' ], 'color' ],
		infoLabelColor: [ [ '.bptm-meta-label' ], 'color' ],
		ribbonBg: [ [ '.bptm-ribbon' ], 'background' ],
	};
	Object.keys( direct ).forEach( ( a ) => {
		const c = color( atts[ a ] );
		if ( c ) {
			add( '', direct[ a ][ 0 ], direct[ a ][ 1 ] + ':' + c );
		}
	} );
	// Featured badge (cards + popup / panel / drawer): scoped rules beat every theme's own badge styles.
	{
		const badge = [ '.bptm-featured' ];
		const badgeIcon = [ '.bptm-featured i' ];
		const fc = color( atts.featuredColor );
		if ( fc ) {
			add( '', badge, 'color:' + fc );
			add( '', badgeIcon, 'color:' + fc );
		}
		const fb = color( atts.featuredBg );
		if ( fb ) {
			add( '', badge, 'background:' + fb );
		}
		const fbw = length( atts.featuredBorderWidth );
		const fbc = color( atts.featuredBorderColor );
		if ( fbw || fbc ) {
			add( '', badge, 'border-style:solid' );
			add( '', badge, 'border-width:' + ( fbw || '1px' ) );
		}
		if ( fbc ) {
			add( '', badge, 'border-color:' + fbc );
		}
		const fs = length( atts.featuredSize );
		if ( fs ) {
			add( '', badge, 'width:' + fs );
			add( '', badge, 'height:' + fs );
		}
		const fis = length( atts.featuredIconSize );
		if ( fis ) {
			add( '', badge, 'font-size:' + fis );
			add( '', badgeIcon, 'font-size:' + fis );
		}
		const fr = length( atts.featuredRadius );
		if ( fr ) {
			add( '', badge, 'border-radius:' + fr );
		}
	}

	// Social icons (cards + popup / panel / drawer): scoped rules beat every theme's own social styles.
	{
		const link = [ '.bptm-social .bptm-social-link' ];
		const icon = [ '.bptm-social .bptm-social-link i' ];
		const hov = [ '.bptm-social .bptm-social-link:hover', '.bptm-social .bptm-social-link:focus-visible' ];
		const hovIcon = [ '.bptm-social .bptm-social-link:hover i', '.bptm-social .bptm-social-link:focus-visible i' ];
		const ic = color( atts.socialIconColor );
		if ( ic ) {
			add( '', link, 'color:' + ic );
			add( '', icon, 'color:' + ic );
		}
		const bg = color( atts.socialBg );
		if ( bg ) {
			add( '', link, 'background:' + bg );
			setVar( '--bptm-social-bg', bg );
		}
		const bc = color( atts.socialBorderColor );
		const bw = length( atts.socialBorderWidth );
		if ( bw ) {
			add( '', link, 'border-width:' + bw );
			add( '', link, 'border-style:solid' );
		}
		if ( bc ) {
			add( '', link, 'border-color:' + bc );
			if ( ! bw ) {
				add( '', link, 'border-style:solid' );
			}
		}
		const hc = color( atts.socialIconHoverColor );
		if ( hc ) {
			add( '', hov, 'color:' + hc );
			add( '', hovIcon, 'color:' + hc );
		}
		const hb = color( atts.socialHoverBg );
		if ( hb ) {
			add( '', hov, 'background:' + hb );
			setVar( '--bptm-social-hover-bg', hb );
		}
		const hbc = color( atts.socialHoverBorderColor );
		if ( hbc ) {
			add( '', hov, 'border-color:' + hbc );
		}
		const size = length( atts.socialSize );
		if ( size ) {
			setVar( '--bptm-social-size', size );
			add( '', link, 'width:' + size );
			add( '', link, 'height:' + size );
			add( '', link, 'min-width:' + size );
		}
		const is = length( atts.socialIconSize );
		if ( is ) {
			add( '', link, 'font-size:' + is );
			add( '', icon, 'font-size:' + is );
		}
		const rad = length( atts.socialRadius );
		if ( rad ) {
			add( '', link, 'border-radius:' + rad );
		}
		const gap = length( atts.socialGap );
		if ( gap ) {
			add( '', [ '.bptm-social' ], 'gap:' + gap );
		}
	}

	let c = color( atts.itemBg );
	if ( c ) {
		add( '', [ 'tr.bptm-item > td' ], 'background:' + c );
	}
	c = color( atts.itemBgHover );
	if ( c ) {
		add( '', [ 'tr.bptm-item:hover > td' ], 'background:' + c );
	}

	const card = [ '.bptm-item > .bptm-ta-card', '.bptm-item > .bptm-tb-card' ];
	const pad = obj( atts.itemPadding );
	if ( Object.keys( pad ).length ) {
		const p = [ 'top', 'right', 'bottom', 'left' ].map( ( side ) => {
			const v = undefined !== pad[ side ] ? length( pad[ side ] ) : '';
			return '' === v ? '0' : v;
		} );
		const anySet = Object.keys( pad ).some( ( k ) => '' !== String( null === pad[ k ] || undefined === pad[ k ] || 'object' === typeof pad[ k ] ? '' : pad[ k ] ) );
		if ( '0 0 0 0' !== p.join( ' ' ) || anySet ) {
			setVar( '--bptm-item-padding', p.join( ' ' ) );
		}
	}
	[ [ 'popupCloseIconSize', '--bptm-close-icon-size' ], [ 'popupCloseSize', '--bptm-close-size' ], [ 'popupCloseRadius', '--bptm-close-radius' ] ].forEach( ( [ a, v ] ) => {
		const len = length( atts[ a ] );
		if ( len ) {
			setVar( v, len );
		}
	} );
	// Pagination (numbers + load more): sizes and padding.
	[ [ 'pgBorderWidth', '--bptm-pg-border-width' ], [ 'pgBorderRadius', '--bptm-pg-radius' ], [ 'lmBorderWidth', '--bptm-lm-border-width' ], [ 'lmBorderRadius', '--bptm-lm-radius' ] ].forEach( ( [ a, v ] ) => {
		const len = length( atts[ a ] );
		if ( len ) {
			setVar( v, len );
		}
	} );
	const boxValue = ( box ) => {
		const b = obj( box );
		if ( ! Object.keys( b ).length ) {
			return '';
		}
		return [ 'top', 'right', 'bottom', 'left' ].map( ( side ) => {
			const v = undefined !== b[ side ] ? length( b[ side ] ) : '';
			return '' === v ? '0' : v;
		} ).join( ' ' );
	};
	const pgPad = boxValue( atts.pgPadding );
	if ( pgPad ) {
		setVar( '--bptm-pg-padding', pgPad );
		setVar( '--bptm-pg-height', 'auto' );
	}
	const lmPad = boxValue( atts.lmPadding );
	if ( lmPad ) {
		setVar( '--bptm-lm-padding', lmPad );
	}
	if ( color( atts.lmHoverBg ) || color( atts.lmHoverColor ) ) {
		setVar( '--bptm-lm-hover-filter', 'none' );
	}
	const navIcon = length( atts.popupNavIconSize );
	if ( navIcon ) {
		add( '', [ '.bptm-modal-nav button i' ], 'font-size:' + navIcon );
	}
	const navR = length( atts.popupNavRadius );
	if ( navR ) {
		setVar( '--bptm-popup-nav-radius', navR );
	}
	const r = length( atts.itemBorderRadius );
	if ( r ) {
		setVar( '--bptm-radius', r );
	}
	const sh = 'string' === typeof atts.itemShadow ? atts.itemShadow.trim() : '';
	if ( sh ) {
		const val = SHADOWS[ sh ] || ( /^[#a-z0-9(),.%\s-]+$/i.test( sh ) ? sh : '' );
		if ( val ) {
			setVar( '--bptm-shadow', val );
		}
	}
	const bw = length( atts.itemBorderWidth );
	const bc = color( atts.itemBorderColor );
	if ( bw || bc ) {
		if ( r ) {
			add( '', card, 'border-radius:' + r );
		}
		add( '', card, 'border:' + ( bw || '1px' ) + ' solid ' + ( bc || 'currentColor' ) );
	}
	const ir = length( atts.imageBorderRadius );
	if ( ir ) {
		setVar( '--bptm-img-radius', ir );
		add( '', [ '.bptm-img', '.bptm-img-wrap' ], 'border-radius:' + ir );
	}
	if ( atts.alignment && [ 'left', 'center', 'right', 'start', 'end' ].includes( atts.alignment ) ) {
		setVar( '--bptm-align', atts.alignment );
	}
	const mh = length( atts.maxScrollHeight );
	if ( mh ) {
		setVar( '--bptm-desc-max-h', mh );
	}

	Object.keys( TYPO ).forEach( ( a ) => {
		const t = obj( atts[ a ] );
		if ( ! Object.keys( t ).length ) {
			return;
		}
		const [ prefix, els, hover ] = TYPO[ a ];
		const decl = [];
		const fam = fontFamily( tget( t, 'fontFamily', 'font_family' ) );
		if ( fam ) {
			decl.push( [ 'font-family', fam ] );
		}
		const w = tget( t, 'fontWeight', 'weight' );
		if ( null !== w && /^(\d{3}|normal|bold|lighter|bolder)$/.test( String( w ) ) ) {
			decl.push( [ 'font-weight', String( w ) ] );
		}
		const st = tget( t, 'fontStyle', 'style' );
		if ( null !== st && [ 'normal', 'italic', 'oblique' ].includes( st ) ) {
			decl.push( [ 'font-style', st ] );
		}
		const tt = tget( t, 'textTransform', 'transform' );
		if ( null !== tt && [ 'none', 'uppercase', 'lowercase', 'capitalize' ].includes( tt ) ) {
			decl.push( [ 'text-transform', tt ] );
		}
		const td = tget( t, 'textDecoration', 'decoration' );
		if ( null !== td && [ 'none', 'underline', 'overline', 'line-through' ].includes( td ) ) {
			decl.push( [ 'text-decoration', td ] );
		}
		const lh = tget( t, 'lineHeight', 'line_height' );
		if ( null !== lh && 'object' !== typeof lh ) {
			const lhv = isNum( lh ) ? String( Number( lh ) ) : length( lh );
			if ( lhv ) {
				decl.push( [ 'line-height', lhv ] );
			}
		}
		const ls = tget( t, 'letterSpacing', 'letter_spacing' );
		if ( null !== ls && 'object' !== typeof ls ) {
			const lsv = length( ls );
			if ( lsv ) {
				decl.push( [ 'letter-spacing', lsv ] );
			}
		}
		const col = color( tget( t, 'color', 'color' ) );
		if ( col ) {
			decl.push( [ 'color', col ] );
		}
		const size = tget( t, 'fontSize', 'size' );
		const resp = {};
		if ( size && 'object' === typeof size && ! Array.isArray( size ) ) {
			[ 'desktop', 'tablet', 'mobilePortrait', 'mobile' ].forEach( ( d ) => {
				const alias = 'mobilePortrait' === d && undefined !== size.mobile_landscape ? size.mobile_landscape : null;
				let v = undefined !== size[ d ] ? size[ d ] : alias;
				v = null === v ? '' : length( v );
				if ( v ) {
					resp[ d ] = v;
				}
			} );
			if ( resp.desktop ) {
				decl.push( [ 'font-size', resp.desktop ] );
			}
		} else if ( null !== size ) {
			const v = length( size );
			if ( v ) {
				decl.push( [ 'font-size', v ] );
			}
		}
		decl.forEach( ( [ prop, val ] ) => {
			setVar( prefix + '-' + prop, val );
			add( '', els, prop + ':' + val );
		} );
		Object.keys( resp ).forEach( ( d ) => {
			if ( 'desktop' !== d ) {
				add( MEDIA[ d ], els, 'font-size:' + resp[ d ] );
			}
		} );
		const hc = color( tget( t, 'hoverColor', 'hover_color' ) );
		if ( hc ) {
			add( '', hover, 'color:' + hc );
		}
	} );

	let css = '';
	if ( vars.length ) {
		css += scopes.join( ',' ) + '{' + vars.map( ( [ k, v ] ) => k + ':' + v ).join( ';' ) + '}';
	}
	[ '', ...Object.values( MEDIA ) ].forEach( ( media ) => {
		if ( ! rules[ media ].size ) {
			return;
		}
		let block = '';
		rules[ media ].forEach( ( decls, sel ) => {
			block += sel + '{' + [ ...new Set( decls ) ].join( ';' ) + '}';
		} );
		css += '' === media ? block : media + '{' + block + '}';
	} );
	return css.replace( /<\//g, '' ).replace( /</g, '' );
};
