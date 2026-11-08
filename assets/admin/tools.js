/* BP Team Member - admin tools: CSV bulk import, shortcode copy, confirmations. */
( function ( $ ) {
	'use strict';

	var cfg = window.bptmTools || { i18n: {} };
	var t = function ( key ) {
		return ( cfg.i18n && cfg.i18n[ key ] ) || key;
	};
	var fmt = function ( str, args ) {
		return str.replace( /%(\d+)\$d/g, function ( m, n ) {
			return String( args[ n - 1 ] );
		} );
	};
	var esc = function ( s ) {
		return $( '<div>' ).text( s == null ? '' : String( s ) ).html();
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

	/* Confirm destructive forms */
	$( document ).on( 'submit', 'form.bptm-confirm', function ( e ) {
		if ( ! window.confirm( this.getAttribute( 'data-confirm' ) || t( 'confirm' ) ) ) {
			e.preventDefault();
		}
	} );

	/* CSV import */
	var total = 0;
	var stats = { created: 0, updated: 0, skipped: 0, failed: 0, rejected: 0 };

	$( '#bptm-csv-form' ).on( 'submit', function ( e ) {
		e.preventDefault();
		var form = this;
		var file = $( '#bptm-csv-file' )[ 0 ].files[ 0 ];
		var status = $( form ).find( '.bptm-status' );
		if ( ! file ) {
			status.text( t( 'choose' ) );
			return;
		}
		var data = new FormData( form );
		data.append( 'action', 'bptm_csv_upload' );
		data.append( 'nonce', cfg.nonce );
		status.text( t( 'uploading' ) );
		$.ajax( {
			url: cfg.ajaxUrl,
			method: 'POST',
			data: data,
			processData: false,
			contentType: false,
		} )
			.done( function ( res ) {
				if ( ! res || ! res.success ) {
					status.text( ( res && res.data && res.data.message ) || t( 'error' ) );
					return;
				}
				status.text( '' );
				total = res.data.total;
				var rows = res.data.preview
					.map( function ( r, i ) {
						return '<tr><td>' + ( i + 1 ) + '</td><td>' + esc( r.name ) + '</td><td>' + esc( r.designation ) + '</td><td>' + esc( r.email ) + '</td><td>' + esc( r.group ) + '</td></tr>';
					} )
					.join( '' );
				var more = total > res.data.preview.length ? '<p>+' + ( total - res.data.preview.length ) + '</p>' : '';
				$( '#bptm-csv-preview' ).prop( 'hidden', false ).find( '.bptm-preview-table' ).html(
					'<p><strong>' + total + '</strong> rows</p><table class="widefat striped"><thead><tr><th>#</th><th>Name</th><th>Designation</th><th>Email</th><th>Group</th></tr></thead><tbody>' + rows + '</tbody></table>' + more
				);
				$( '#bptm-csv-start' ).prop( 'disabled', false );
				$( '.bptm-import-log' ).empty();
				$( '.bptm-import-status' ).text( '' );
			} )
			.fail( function ( xhr ) {
				var msg = xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message;
				status.text( msg || t( 'error' ) );
			} );
	} );

	function runBatch( offset ) {
		$.post( cfg.ajaxUrl, { action: 'bptm_csv_import', nonce: cfg.nonce, offset: offset } )
			.done( function ( res ) {
				if ( ! res || ! res.success ) {
					$( '.bptm-import-status' ).text( ( res && res.data && res.data.message ) || t( 'error' ) );
					return;
				}
				var d = res.data;
				[ 'created', 'updated', 'skipped', 'failed', 'rejected' ].forEach( function ( k ) {
					stats[ k ] += d[ k ] || 0;
				} );
				( d.log || [] ).forEach( function ( line ) {
					$( '.bptm-import-log' ).append( '<li>' + esc( line ) + '</li>' );
				} );
				var pct = d.total ? Math.round( ( d.next / d.total ) * 100 ) : 100;
				$( '.bptm-progress-bar' ).css( 'width', pct + '%' );
				if ( d.finish ) {
					var summary = fmt( t( 'done' ), [ stats.created, stats.updated, stats.skipped, stats.failed ] );
					if ( stats.rejected && t( 'rejected' ) ) {
						summary += ' ' + fmt( t( 'rejected' ), [ stats.rejected ] );
					}
					$( '.bptm-import-status' ).addClass( 'is-done' ).text( summary );
				} else {
					$( '.bptm-import-status' ).text( fmt( t( 'importing' ), [ d.next, d.total ] ) );
					runBatch( d.next );
				}
			} )
			.fail( function ( xhr ) {
				var msg = xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message;
				$( '.bptm-import-status' ).text( msg || t( 'error' ) );
			} );
	}

	$( '#bptm-csv-start' ).on( 'click', function () {
		$( this ).prop( 'disabled', true );
		stats = { created: 0, updated: 0, skipped: 0, failed: 0, rejected: 0 };
		$( '.bptm-progress' ).prop( 'hidden', false );
		$( '.bptm-progress-bar' ).css( 'width', '0%' );
		$( '.bptm-import-status' ).removeClass( 'is-done' ).text( fmt( t( 'importing' ), [ 0, total ] ) );
		runBatch( 0 );
	} );
}( jQuery ) );
