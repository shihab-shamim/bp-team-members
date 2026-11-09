/**
 * Team Builder – Grid, List, Carousel & Popup front end (block viewScript + style).
 *
 * src/render.php prints only a wrapper `<div class="wp-block-tsb-team-members …" data-bptm-uid data-attributes="{json}">`;
 * this script renders the block in the browser from those attributes with React (the same component the editor uses).
 *
 * window.BPTM.init( root = document ) mounts every not-yet-mounted block inside root (page builders call it
 * after injecting markup). window.BPTM.get( el ) returns { attributes } of a mounted block.
 */
import './style.scss';
import { createRoot, createElement } from '@wordpress/element';

import TeamMembers from './Components/Common/Team/TeamMembers';

const SELECTOR = '.wp-block-tsb-team-members[data-attributes]';
const mounted = new Map();

const randomUid = () => Math.random().toString( 16 ).slice( 2, 10 );

function mount( el ) {
	if ( mounted.has( el ) ) {
		return;
	}
	let attributes = {};
	try {
		attributes = JSON.parse( el.getAttribute( 'data-attributes' ) || '{}' ) || {};
	} catch ( e ) {
		attributes = {};
	}
	if ( ! attributes || 'object' !== typeof attributes || Array.isArray( attributes ) ) {
		attributes = {};
	}
	const uid = String( el.getAttribute( 'data-bptm-uid' ) || randomUid() ).replace( /[^a-z0-9-]/gi, '' ).toLowerCase() || randomUid();
	const domId = el.id || 'bptm-' + uid;
	const wrapperClass = el.className;
	const root = createRoot( el );
	mounted.set( el, { root, attributes } );
	root.render( createElement( TeamMembers, { attributes, uid, domId, host: el, wrapperClass } ) );
}

function init( scope ) {
	// Roots whose element left the document (builder previews re-render): unmount.
	mounted.forEach( ( rec, el ) => {
		if ( ! el.isConnected ) {
			rec.root.unmount();
			mounted.delete( el );
		}
	} );
	const ctx = scope && 'function' === typeof scope.querySelectorAll ? scope : document;
	const els = Array.from( ctx.querySelectorAll( SELECTOR ) );
	if ( ctx.matches && ctx.matches( SELECTOR ) ) {
		els.unshift( ctx );
	}
	els.forEach( ( el ) => {
		try {
			mount( el );
		} catch ( e ) {
			// eslint-disable-next-line no-console
			console.error( 'Team Builder – Grid, List, Carousel & Popup:', e );
		}
	} );
	return els;
}

const api = window.BPTM && 'object' === typeof window.BPTM ? window.BPTM : {};
api.init = init;
api.get = ( el ) => {
	const rec = mounted.get( el );
	return rec ? { attributes: rec.attributes } : null;
};
window.BPTM = api;

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', () => init( document ) );
} else {
	init( document );
}
