/**
 * The inspector (outer editor document) needs Font Awesome for the social icon picker.
 * PHP enqueues the `bptm-fontawesome` style on enqueue_block_assets; if the outer document
 * does not have it, load the vendored stylesheet once as a fallback.
 */
import { getPluginUrl } from './editorData';

const FA_PATH = 'assets/vendor/fontawesome/css/all.min.css';

export const ensureFontAwesome = ( doc = 'undefined' !== typeof document ? document : null ) => {
	if ( ! doc || ! doc.head ) {
		return;
	}
	if ( doc.getElementById( 'bptm-fontawesome-css' ) || doc.querySelector( 'link[data-bptm-fa], link[href*="fontawesome/css/all"]' ) ) {
		return;
	}
	const base = getPluginUrl();
	if ( ! base ) {
		return;
	}
	const link = doc.createElement( 'link' );
	link.rel = 'stylesheet';
	link.href = base + FA_PATH;
	link.dataset.bptmFa = '1';
	doc.head.appendChild( link );
};
