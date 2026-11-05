/**
 * Live server-side preview of the block.
 *
 * - ServerSideRender (POST) renders src/render.php with the current attributes.
 * - While a new render loads, the previous markup stays visible (no flicker).
 * - After every render window.BPTM.init(el) runs (frontend script, render area).
 * - Link clicks / form submits inside the preview never navigate.
 */
import ServerSideRender from '@wordpress/server-side-render';
import { Spinner, Placeholder, Button } from '@wordpress/components';
import { useEffect, useRef, useState, memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { blockIcon } from '../../utils/icons';
import { hasMembers, adminUrl } from '../../utils/editorData';

// URL of build/view.js, derived from this editor script's own URL (build/index.js).
// Used only when the editor canvas has not loaded the frontend script itself.
const SCRIPT_SRC = 'undefined' !== typeof document && document.currentScript ? document.currentScript.src : '';
const VIEW_URL = SCRIPT_SRC && /\/index\.js(\?.*)?$/.test( SCRIPT_SRC ) ? SCRIPT_SRC.replace( /\/index\.js(\?.*)?$/, '/view.js$1' ) : '';

const loaders = new WeakMap();

const ensureViewScript = ( doc ) => {
	if ( loaders.has( doc ) ) {
		return loaders.get( doc );
	}
	const promise = new Promise( ( resolve ) => {
		if ( ! VIEW_URL || ! doc || ! doc.head ) {
			resolve( false );
			return;
		}
		const script = doc.createElement( 'script' );
		script.src = VIEW_URL;
		script.async = true;
		script.dataset.bptmEditorView = '1';
		script.onload = () => resolve( true );
		script.onerror = () => resolve( false );
		doc.head.appendChild( script );
	} );
	loaders.set( doc, promise );
	return promise;
};

const getApi = ( el ) => {
	const win = el.ownerDocument && el.ownerDocument.defaultView;
	if ( win && win.BPTM && 'function' === typeof win.BPTM.init ) {
		return win.BPTM;
	}
	if ( window.BPTM && 'function' === typeof window.BPTM.init ) {
		return window.BPTM;
	}
	return null;
};

const initPreview = ( el ) => {
	if ( ! el || ! el.querySelector( '.bptm-wrap[data-bptm]:not([data-bptm-ready])' ) ) {
		return;
	}
	const run = () => {
		const api = getApi( el );
		if ( ! api ) {
			return;
		}
		try {
			api.init( el );
		} catch ( e ) {
			// eslint-disable-next-line no-console
			console.error( 'BP Team Member preview init failed', e );
		}
	};
	if ( getApi( el ) ) {
		run();
	} else {
		ensureViewScript( el.ownerDocument ).then( run );
	}
};

// ServerSideRender passes the previous markup as children while a new render
// loads, so the old preview stays visible; the spinner only appears after a
// short delay to avoid flashing on fast responses.
const LoadingPlaceholder = ( { children } ) => {
	const [ showLoader, setShowLoader ] = useState( false );
	useEffect( () => {
		const t = setTimeout( () => setShowLoader( true ), 400 );
		return () => clearTimeout( t );
	}, [] );
	return (
		<div className={ `bptm-ed-preview__loading${ showLoader ? ' is-slow' : '' }` }>
			{ showLoader && (
				<div className="bptm-ed-preview__spinner">
					<Spinner />
				</div>
			) }
			{ children || <div className="bptm-ed-preview__skeleton" /> }
		</div>
	);
};

const ErrorPlaceholder = ( { response } ) => (
	<Placeholder icon={ blockIcon } label={ __( 'BP Team Member', 'bp-team-member' ) }>
		{ __( 'The preview could not be rendered.', 'bp-team-member' ) }
		{ response && response.errorMsg ? ` ${ response.errorMsg }` : '' }
	</Placeholder>
);

const EmptyPlaceholder = () => (
	<Placeholder icon={ blockIcon } label={ __( 'BP Team Member', 'bp-team-member' ) }>
		{ __( 'No team members match the current query settings.', 'bp-team-member' ) }
	</Placeholder>
);

export const EmptyState = () => (
	<Placeholder
		icon={ blockIcon }
		label={ __( 'BP Team Member', 'bp-team-member' ) }
		instructions={ __( 'You have not added any team members yet. Add your first member, or import the demo data to try every theme.', 'bp-team-member' ) }
		className="bptm-ed-empty"
	>
		<Button variant="primary" href={ adminUrl( 'addMember' ) } target="_blank" rel="noopener noreferrer">
			{ __( 'Add team member', 'bp-team-member' ) }
		</Button>
		<Button variant="secondary" href={ adminUrl( 'settings' ) } target="_blank" rel="noopener noreferrer">
			{ __( 'Import demo data', 'bp-team-member' ) }
		</Button>
	</Placeholder>
);

const Preview = ( { name, attributes } ) => {
	const ref = useRef( null );

	useEffect( () => {
		const el = ref.current;
		if ( ! el ) {
			return undefined;
		}
		let timer = null;
		const schedule = () => {
			el.ownerDocument.defaultView.clearTimeout( timer );
			timer = el.ownerDocument.defaultView.setTimeout( () => initPreview( el ), 30 );
		};
		const win = el.ownerDocument.defaultView || window;
		const observer = new win.MutationObserver( schedule );
		observer.observe( el, { childList: true, subtree: true } );
		schedule();

		const stopLink = ( e ) => {
			const a = e.target && e.target.closest ? e.target.closest( 'a[href]' ) : null;
			if ( a ) {
				e.preventDefault();
			}
		};
		const stopSubmit = ( e ) => e.preventDefault();
		el.addEventListener( 'click', stopLink );
		el.addEventListener( 'submit', stopSubmit );

		return () => {
			observer.disconnect();
			win.clearTimeout( timer );
			el.removeEventListener( 'click', stopLink );
			el.removeEventListener( 'submit', stopSubmit );
		};
	}, [] );

	return (
		<div className="bptm-ed-preview" ref={ ref }>
			<ServerSideRender
				block={ name }
				attributes={ attributes }
				httpMethod="POST"
				LoadingResponsePlaceholder={ LoadingPlaceholder }
				ErrorResponsePlaceholder={ ErrorPlaceholder }
				EmptyResponsePlaceholder={ EmptyPlaceholder }
			/>
		</div>
	);
};

export const shouldShowEmptyState = () => ! hasMembers();

export default memo( Preview );
