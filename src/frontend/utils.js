/**
 * Shared helpers for the BP Team Member frontend (vanilla JS, no dependencies).
 */

export const $ = ( sel, ctx = document ) => ( ctx ? ctx.querySelector( sel ) : null );
export const $$ = ( sel, ctx = document ) => ( ctx ? Array.from( ctx.querySelectorAll( sel ) ) : [] );

export const reducedMotion = () =>
	typeof window.matchMedia === 'function' && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

/**
 * Device key for the current viewport: d (≥1025) | t (768–1024) | mp (576–767) | m (<576).
 *
 * @return {string} Device key.
 */
export const deviceKey = () => {
	const w = window.innerWidth || document.documentElement.clientWidth;
	if ( w >= 1025 ) {
		return 'd';
	}
	if ( w >= 768 ) {
		return 't';
	}
	if ( w >= 576 ) {
		return 'mp';
	}
	return 'm';
};

export const debounce = ( fn, wait = 200 ) => {
	let t;
	return ( ...args ) => {
		clearTimeout( t );
		t = setTimeout( () => fn( ...args ), wait );
	};
};

export const sprintf = ( str, n ) => String( str || '' ).replace( /%d|%s/, String( n ) );

/**
 * Parse an HTML string into nodes (works for <tr> rows too).
 *
 * @param {string} html Markup.
 * @return {Node[]} Nodes.
 */
export const parseHTML = ( html ) => {
	const tpl = document.createElement( 'template' );
	tpl.innerHTML = String( html || '' ).trim();
	return Array.from( tpl.content.childNodes );
};

/**
 * Elements only from parseHTML.
 *
 * @param {string} html Markup.
 * @return {Element[]} Elements.
 */
export const parseElements = ( html ) => parseHTML( html ).filter( ( n ) => n.nodeType === 1 );

/**
 * POST to the public render endpoint.
 *
 * @param {string} url  Endpoint.
 * @param {Object} body Payload.
 * @return {Promise<Object>} JSON.
 */
export const fetchRender = async ( url, body ) => {
	const res = await window.fetch( url, {
		method: 'POST',
		credentials: 'same-origin',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify( body ),
	} );
	if ( ! res.ok ) {
		throw new Error( 'BPTM render request failed: ' + res.status );
	}
	return res.json();
};

const FOCUSABLE =
	'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

export const focusables = ( ctx ) =>
	$$( FOCUSABLE, ctx ).filter(
		( el ) => ! el.closest( '[hidden], [inert]' ) && ( el.offsetWidth || el.offsetHeight || el.getClientRects().length )
	);

/* Body scroll lock (reference counted so stacked modals behave). */
let lockCount = 0;
export const lockScroll = () => {
	lockCount++;
	if ( lockCount > 1 ) {
		return;
	}
	const html = document.documentElement;
	const sbw = window.innerWidth - html.clientWidth;
	html.style.setProperty( '--bptm-scrollbar', sbw + 'px' );
	html.classList.add( 'bptm-scroll-lock' );
};
export const unlockScroll = () => {
	lockCount = Math.max( 0, lockCount - 1 );
	if ( lockCount === 0 ) {
		document.documentElement.classList.remove( 'bptm-scroll-lock' );
		document.documentElement.style.removeProperty( '--bptm-scrollbar' );
	}
};
