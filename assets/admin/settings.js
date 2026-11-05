/* BP Team Member - settings pages: dependent fields + CSS code editor. */
( function ( $ ) {
	'use strict';

	function isOn( id ) {
		var el = document.getElementById( id );
		return !! ( el && el.checked );
	}

	function refreshDependencies() {
		$( '.bptm-admin [data-depends-on]' ).each( function () {
			var row = this;
			var dep = row.getAttribute( 'data-depends-on' );
			var visible = isOn( dep );
			// Chained dependency: hide when the controlling row itself is hidden.
			var depRow = document.getElementById( dep );
			if ( depRow ) {
				var parentRow = $( depRow ).closest( 'tr' )[ 0 ];
				if ( parentRow && parentRow.classList.contains( 'is-hidden' ) ) {
					visible = false;
				}
			}
			row.classList.toggle( 'is-hidden', ! visible );
		} );
		$( '.bptm-tax-card' ).each( function () {
			var first = this.querySelector( 'input[type="checkbox"]' );
			this.classList.toggle( 'is-disabled', ! ( first && first.checked ) );
		} );
	}

	$( function () {
		refreshDependencies();
		// Run twice so chained dependencies settle.
		refreshDependencies();
		$( document ).on( 'change', '.bptm-admin input[type="checkbox"]', function () {
			refreshDependencies();
			refreshDependencies();
		} );

		if ( window.wp && wp.codeEditor && window.bptmCodeEditor ) {
			$( '.bptm-code-editor' ).each( function () {
				var instance = wp.codeEditor.initialize( this, window.bptmCodeEditor );
				$( this ).closest( 'form' ).on( 'submit', function () {
					instance.codemirror.save();
				} );
			} );
		}
	} );
}( jQuery ) );
