/**
 * BP Team Member frontend entry (block viewScript + style).
 *
 * window.BPTM.init( root = document ) initialises every `.bptm-wrap[data-bptm]` inside root exactly once.
 */
import './style.scss';
import Instance from './frontend/instance';
import Modal from './frontend/modal';

const instances = new WeakMap();

function init( root ) {
	const ctx = root && typeof root.querySelectorAll === 'function' ? root : document;
	Modal.cleanupPortals();
	const roots = Array.from( ctx.querySelectorAll( '.bptm-wrap[data-bptm]:not(.bptm-portal)' ) );
	if ( ctx.matches && ctx.matches( '.bptm-wrap[data-bptm]' ) ) {
		roots.unshift( ctx );
	}
	const created = [];
	roots.forEach( ( el ) => {
		if ( el.hasAttribute( 'data-bptm-ready' ) ) {
			return;
		}
		el.setAttribute( 'data-bptm-ready', '1' );
		try {
			const inst = new Instance( el );
			instances.set( el, inst );
			created.push( inst );
		} catch ( e ) {
			// eslint-disable-next-line no-console
			console.error( 'BP Team Member:', e );
		}
	} );
	return created;
}

const api = window.BPTM && typeof window.BPTM === 'object' ? window.BPTM : {};
api.init = init;
api.get = ( el ) => instances.get( el ) || null;
window.BPTM = api;

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', () => init( document ) );
} else {
	init( document );
}
