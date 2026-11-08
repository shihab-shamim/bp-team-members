/* BP Team Member - admin tools: shortcode copy buttons on the Showcases list. */
( function ( $ ) {
	'use strict';

	var cfg = window.bptmTools || { i18n: {} };
	var t = function ( key ) {
		return ( cfg.i18n && cfg.i18n[ key ] ) || key;
	};

	/* Copy shortcode buttons */
	$( document ).on( 'click', '.bptm-copy-btn', function () {
		var btn = this;
		var text = btn.getAttribute( 'data-copy' );
		var done = function () {
			var old = btn.textContent;
			btn.textContent = t( 'copied' );
			setTimeout( function () {
				btn.textContent = old;
			}, 1500 );
		};
		if ( navigator.clipboard && window.isSecureContext ) {
			navigator.clipboard.writeText( text ).then( done );
		} else {
			var input = $( btn ).siblings( 'input' )[ 0 ];
			if ( input ) {
				input.select();
				document.execCommand( 'copy' );
				done();
			}
		}
	} );
	$( document ).on( 'focus click', '.bptm-shortcode-input', function () {
		this.select();
	} );
}( jQuery ) );
