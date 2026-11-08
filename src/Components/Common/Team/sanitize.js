/**
 * Sanitizers for untrusted block attributes (ports of the WordPress / BPTM PHP helpers the
 * server renderer used). Text is rendered by React (always escaped); HTML details go through a
 * DOMParser-based whitelist and are converted to React elements (never dangerouslySetInnerHTML).
 */
import { createElement, Fragment } from '@wordpress/element';

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

let decoderDoc = null;

/**
 * Decode HTML entities (&amp; → &). Uses an inert DOMParser document (scripts never run there).
 *
 * @param {string} s String.
 * @return {string} Decoded.
 */
export const decodeEntities = ( s ) => {
	s = String( s );
	if ( -1 === s.indexOf( '&' ) ) {
		return s;
	}
	if ( 'undefined' === typeof window || 'function' !== typeof window.DOMParser ) {
		return s.replace( /&amp;/g, '&' ).replace( /&lt;/g, '<' ).replace( /&gt;/g, '>' ).replace( /&quot;/g, '"' ).replace( /&#0?39;/g, "'" );
	}
	if ( ! decoderDoc ) {
		decoderDoc = new window.DOMParser().parseFromString( '<!doctype html><textarea></textarea>', 'text/html' );
	}
	const ta = decoderDoc.querySelector( 'textarea' );
	ta.innerHTML = s.replace( /</g, '&lt;' );
	return ta.value;
};

/**
 * wp_strip_all_tags(): removes script/style blocks and every tag.
 *
 * @param {string} s String.
 * @return {string} Text.
 */
export const stripTags = ( s ) =>
	String( s )
		.replace( /<(script|style)[^>]*?>[\s\S]*?<\/\1\s*>/gi, '' )
		.replace( /<\/?[a-zA-Z!?][^>]*(>|$)/g, '' );

/**
 * sanitize_text_field() + entity decoding (PHP printed esc_html() of it, which shows entities decoded).
 *
 * @param {*} v Value.
 * @return {string} Clean single-line text.
 */
export const text = ( v ) => {
	if ( null === v || undefined === v || 'boolean' === typeof v || 'object' === typeof v ) {
		return '';
	}
	let s = stripTags( String( v ) );
	s = s.replace( /[\r\n\t ]+/g, ' ' );
	let prev;
	do {
		prev = s;
		s = s.replace( /%[a-f0-9]{2}/gi, '' );
	} while ( prev !== s );
	return decodeEntities( s.replace( /\s+/g, ' ' ).trim() );
};

/** Lowercase helper (mb_strtolower). */
export const lower = ( s ) => String( s ).toLowerCase();

/* ------------------------------------------------------------------ */
/* Slugs / ids / classes                                               */
/* ------------------------------------------------------------------ */

const hash8 = ( s ) => {
	let h = 0x811c9dc5;
	for ( let i = 0; i < s.length; i++ ) {
		h ^= s.charCodeAt( i );
		h = Math.imul( h, 0x01000193 ) >>> 0;
	}
	return ( '0000000' + h.toString( 16 ) ).slice( -8 );
};

/**
 * sanitize_title() port ("Product Design" → "product-design"); values that sanitize to nothing get a hash slug.
 *
 * @param {string} name Name.
 * @return {string} Slug.
 */
export const termSlug = ( name ) => {
	name = String( name || '' );
	let s = stripTags( name );
	s = s.normalize ? s.normalize( 'NFD' ).replace( /\p{M}/gu, '' ) : s;
	s = s.replace( /ß/g, 'ss' ).replace( /æ/gi, 'ae' ).replace( /ø/gi, 'o' ).replace( /đ/gi, 'd' ).replace( /ł/gi, 'l' ).replace( /œ/gi, 'oe' );
	s = s.toLowerCase();
	s = s.replace( /&.+?;/g, '' ).replace( /\./g, '-' );
	s = Array.from( s ).map( ( ch ) => ( ch.charCodeAt( 0 ) > 127 ? encodeURIComponent( ch ).toLowerCase() : ch ) ).join( '' );
	s = s.replace( /[^%a-z0-9 _-]/g, '' ).replace( /\s+/g, '-' ).replace( /-+/g, '-' ).replace( /^-+|-+$/g, '' );
	if ( '' === s && '' !== name.trim() ) {
		s = 'v-' + hash8( name );
	}
	return s;
};

/** bptm_sanitize_item_id(): [A-Za-z0-9_-], max 64. */
export const itemId = ( id ) => ( 'string' === typeof id || 'number' === typeof id ? String( id ).replace( /[^A-Za-z0-9_-]/g, '' ).slice( 0, 64 ) : '' );

/** sanitize_html_class(). */
export const htmlClass = ( c ) => String( c || '' ).replace( /%[a-fA-F0-9][a-fA-F0-9]/g, '' ).replace( /[^A-Za-z0-9_-]/g, '' );

/** sanitize_key(). */
export const key = ( k ) => String( k || '' ).toLowerCase().replace( /[^a-z0-9_-]/g, '' );

const FA_STYLE = [ 'fa', 'fab', 'fas', 'far', 'fa-brands', 'fa-solid', 'fa-regular' ];

/**
 * bptm_sanitize_icon_class(): only Font Awesome style classes and `fa-{name}` classes; anything else drops the value.
 *
 * @param {*} icon Raw.
 * @return {string} Class string or ''.
 */
export const iconClass = ( icon ) => {
	if ( 'string' !== typeof icon ) {
		return '';
	}
	const parts = icon.trim().toLowerCase().split( /\s+/ ).filter( Boolean );
	const out = [];
	let hasIcon = false;
	for ( const c of parts ) {
		if ( FA_STYLE.includes( c ) ) {
			out.push( c );
		} else if ( /^fa-[a-z0-9]+(?:-[a-z0-9]+)*$/.test( c ) ) {
			out.push( c );
			hasIcon = true;
		} else {
			return '';
		}
	}
	return hasIcon ? [ ...new Set( out ) ].join( ' ' ) : '';
};

/* ------------------------------------------------------------------ */
/* Emails / URLs                                                       */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

/** is_email() (simplified, strict). */
export const isEmail = ( v ) => 'string' === typeof v && v.length >= 6 && v.length <= 254 && EMAIL_RE.test( v ) && ! /\.\./.test( v );

/** sanitize_email() + is_email(): '' when invalid. */
export const email = ( v ) => {
	const s = 'string' === typeof v ? v.trim() : '';
	return isEmail( s ) ? s : '';
};

/** bptm_sanitize_email_list(): comma-separated valid addresses. */
export const emailList = ( v ) => {
	const parts = ( 'string' === typeof v || 'number' === typeof v ? String( v ) : '' ).split( /[;,\s]+/ ).filter( Boolean );
	return [ ...new Set( parts.filter( isEmail ) ) ].join( ',' );
};

export const WEB = [ 'http', 'https' ];
export const LINK_PROTOCOLS = [ 'http', 'https', 'mailto', 'tel', 'skype', 'callto', 'sms', 'viber', 'whatsapp' ];
const ALLOWED = [ 'http', 'https', 'ftp', 'ftps', 'mailto', 'news', 'irc', 'irc6', 'ircs', 'gopher', 'nntp', 'feed', 'telnet', 'mms', 'rtsp', 'sms', 'svn', 'tel', 'fax', 'xmpp', 'webcal', 'urn' ];

/**
 * esc_url_raw() port: '' for disallowed protocols (javascript:, data:, vbscript: …); scheme-less
 * host-like values get http://; relative paths, queries and fragments pass.
 *
 * @param {*}        v         Raw URL.
 * @param {string[]} protocols Allowed protocols.
 * @return {string} URL.
 */
export const url = ( v, protocols = ALLOWED ) => {
	if ( 'string' !== typeof v ) {
		return '';
	}
	let u = v.trim().replace( / /g, '%20' );
	u = Array.from( u ).filter( ( ch ) => ch.charCodeAt( 0 ) > 127 || /[a-z0-9\-~+_.?#=!&;,/:%@$|*'()[\]]/i.test( ch ) ).join( '' );
	if ( '' === u ) {
		return '';
	}
	if ( -1 !== u.indexOf( ':' ) ) {
		const m = /^([a-z][a-z0-9+.-]*):/i.exec( u );
		// Anything before the first ":" must be an allowed protocol (blocks javascript:, data:, vbscript: …).
		if ( ! m || ! protocols.includes( m[ 1 ].toLowerCase() ) ) {
			return /^[/#?]/.test( u ) && ! /^\/\/[^/]*:/.test( u ) ? u : '';
		}
		return u;
	}
	if ( /^[/#?]/.test( u ) || /^[a-z0-9-]+?\.php/i.test( u ) ) {
		return u;
	}
	const http = protocols.includes( 'http' ) ? 'http://' : '';
	return http ? http + u : '';
};

/* ------------------------------------------------------------------ */
/* Rich details (allowHtmlDetails)                                     */
/* ------------------------------------------------------------------ */

const ALLOWED_TAGS = {
	p: [],
	br: [],
	strong: [],
	b: [],
	em: [],
	i: [],
	u: [],
	a: [ 'href', 'target', 'rel' ],
	ul: [],
	ol: [],
	li: [],
	span: [],
	h3: [],
	h4: [],
	h5: [],
	h6: [],
	blockquote: [],
};
const BLOCK_TAGS = [ 'p', 'ul', 'ol', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li' ];
const DROP_WITH_CONTENT = [ 'script', 'style', 'template', 'iframe', 'object', 'embed', 'noscript', 'svg', 'math', 'head', 'title', 'textarea', 'select' ];

let parser = null;

/**
 * Parse untrusted HTML into an inert document.
 *
 * @param {string} html HTML.
 * @return {Element|null} Body.
 */
const parse = ( html ) => {
	if ( 'undefined' === typeof window || 'function' !== typeof window.DOMParser ) {
		return null;
	}
	if ( ! parser ) {
		parser = new window.DOMParser();
	}
	return parser.parseFromString( '<!doctype html><body>' + String( html ) + '</body>', 'text/html' ).body;
};

/**
 * Whitelisted node list (plain objects): { tag, attrs, children } | string.
 *
 * @param {Node} node DOM node.
 * @return {Array} Clean nodes.
 */
const cleanNodes = ( node ) => {
	const out = [];
	node.childNodes.forEach( ( c ) => {
		if ( 3 === c.nodeType ) {
			out.push( c.nodeValue );
			return;
		}
		if ( 1 !== c.nodeType ) {
			return;
		}
		const tag = c.tagName.toLowerCase();
		if ( DROP_WITH_CONTENT.includes( tag ) ) {
			return;
		}
		const children = cleanNodes( c );
		if ( ! Object.prototype.hasOwnProperty.call( ALLOWED_TAGS, tag ) ) {
			out.push( ...children ); // Unwrap unknown tags, keep their (clean) content.
			return;
		}
		const attrs = {};
		ALLOWED_TAGS[ tag ].forEach( ( name ) => {
			const v = c.getAttribute( name );
			if ( null === v ) {
				return;
			}
			if ( 'href' === name ) {
				const h = url( v, LINK_PROTOCOLS );
				if ( h ) {
					attrs.href = h;
				}
			} else if ( 'target' === name ) {
				if ( /^_(blank|self|parent|top)$/.test( v ) ) {
					attrs.target = v;
				}
			} else if ( 'rel' === name ) {
				const rel = v.toLowerCase().split( /\s+/ ).filter( ( r ) => /^[a-z-]+$/.test( r ) ).join( ' ' );
				if ( rel ) {
					attrs.rel = rel;
				}
			}
		} );
		if ( 'a' === tag && '_blank' === attrs.target ) {
			const rel = new Set( ( attrs.rel || '' ).split( ' ' ).filter( Boolean ) );
			rel.add( 'noopener' );
			attrs.rel = [ ...rel ].join( ' ' );
		}
		out.push( { tag, attrs, children } );
	} );
	return out;
};

const isBlock = ( n ) => n && 'object' === typeof n && BLOCK_TAGS.includes( n.tag );

/**
 * wpautop()-like grouping: runs of inline content become paragraphs (blank lines split them,
 * single newlines become <br>); block elements stay as they are.
 *
 * @param {Array} nodes Clean nodes.
 * @return {Array} Nodes.
 */
const autop = ( nodes ) => {
	const out = [];
	let run = [];
	const flush = () => {
		// Split the inline run on blank lines inside text nodes.
		const paras = [ [] ];
		run.forEach( ( n ) => {
			if ( 'string' === typeof n ) {
				const parts = n.replace( /\r\n?/g, '\n' ).split( /\n[ \t]*\n+/ );
				parts.forEach( ( p, i ) => {
					if ( i > 0 ) {
						paras.push( [] );
					}
					paras[ paras.length - 1 ].push( p );
				} );
			} else {
				paras[ paras.length - 1 ].push( n );
			}
		} );
		paras.forEach( ( p ) => {
			// Trim leading/trailing whitespace of the paragraph.
			while ( p.length && 'string' === typeof p[ 0 ] && '' === p[ 0 ].trim() ) {
				p.shift();
			}
			while ( p.length && 'string' === typeof p[ p.length - 1 ] && '' === p[ p.length - 1 ].trim() ) {
				p.pop();
			}
			if ( ! p.length ) {
				return;
			}
			if ( 'string' === typeof p[ 0 ] ) {
				p[ 0 ] = p[ 0 ].replace( /^\s+/, '' );
			}
			if ( 'string' === typeof p[ p.length - 1 ] ) {
				p[ p.length - 1 ] = p[ p.length - 1 ].replace( /\s+$/, '' );
			}
			const children = [];
			p.forEach( ( n ) => {
				if ( 'string' === typeof n && /\n/.test( n ) ) {
					n.split( '\n' ).forEach( ( line, i ) => {
						if ( i > 0 ) {
							children.push( { tag: 'br', attrs: {}, children: [] } );
						}
						children.push( line );
					} );
				} else {
					children.push( n );
				}
			} );
			out.push( { tag: 'p', attrs: {}, children } );
		} );
		run = [];
	};
	nodes.forEach( ( n ) => {
		if ( isBlock( n ) ) {
			flush();
			// wpautop() also wraps the inline content of a blockquote in paragraphs.
			out.push( 'blockquote' === n.tag ? { ...n, children: autop( n.children ) } : n );
		} else {
			run.push( n );
		}
	} );
	flush();
	return out;
};

/**
 * Clean node tree for rich details.
 *
 * @param {string} html Untrusted HTML.
 * @return {Array} Clean nodes (paragraph-grouped).
 */
export const cleanHtml = ( html ) => {
	const body = parse( html );
	if ( ! body ) {
		return autop( [ stripTags( html ) ] );
	}
	return autop( cleanNodes( body ) );
};

/** Plain text of clean nodes. */
export const nodesText = ( nodes ) => nodes.map( ( n ) => ( 'string' === typeof n ? n : nodesText( n.children ) ) ).join( '' );

/**
 * React elements from clean nodes.
 *
 * @param {Array}  nodes Clean nodes.
 * @param {string} kp    Key prefix.
 * @return {Array} Elements.
 */
export const nodesToReact = ( nodes, kp = 'n' ) =>
	nodes.map( ( n, i ) => {
		if ( 'string' === typeof n ) {
			return n;
		}
		const props = { key: kp + i, ...n.attrs };
		if ( 'br' === n.tag ) {
			return createElement( 'br', props );
		}
		return createElement( n.tag, props, ...nodesToReact( n.children, kp + i + '-' ) );
	} );

/**
 * Plain text → paragraphs (wpautop(esc_html())): blank lines split paragraphs, single newlines become <br>.
 *
 * @param {string} plain Text.
 * @return {Array} Clean nodes.
 */
export const textParagraphs = ( plain ) => autop( [ String( plain ) ] );

export { Fragment };
