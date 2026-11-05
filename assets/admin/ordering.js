/**
 * BP Team Member - Sort Order page (members, terms, filters).
 */
( function ( $ ) {
	'use strict';

	var cfg = window.bptmOrdering || {};
	var i18n = cfg.i18n || {};
	var $status = $( '.bptm-sort-status' );
	var timer = null;
	var pending = null;

	function setStatus( text, type ) {
		$status.removeClass( 'is-saving is-saved is-error' ).addClass( type ? 'is-' + type : '' ).text( text || '' );
	}

	function collect( $root ) {
		var type = $root.data( 'bptmSort' );
		var ids = [];
		// DFS order: for nested term lists this keeps siblings' relative order.
		$root.find( '.bptm-sort-item' ).addBack( '.bptm-sort-item' ).each( function () {
			ids.push( String( $( this ).data( 'id' ) ) );
		} );
		var payload = { action: 'bptm_save_order', nonce: cfg.nonce, type: type, order: ids };
		if ( 'terms' === type ) {
			payload.taxonomy = $root.data( 'taxonomy' );
		}
		return payload;
	}

	function save( $root ) {
		pending = collect( $root );
		window.clearTimeout( timer );
		setStatus( i18n.saving || 'Saving…', 'saving' );
		timer = window.setTimeout( function () {
			var payload = pending;
			$.post( cfg.ajaxUrl, payload )
				.done( function ( res ) {
					if ( res && res.success ) {
						setStatus( i18n.saved || 'Order saved.', 'saved' );
					} else {
						setStatus( ( res && res.data && res.data.message ) || i18n.error, 'error' );
					}
				} )
				.fail( function ( xhr ) {
					var msg = xhr && xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message;
					setStatus( msg || i18n.error || 'Error', 'error' );
				} );
		}, 350 );
	}

	$( '[data-bptm-sort]' ).each( function () {
		var $root = $( this );
		var $lists = $root.is( 'ul' ) ? $root : $root.find( 'ul.bptm-sortable' );

		$lists.each( function () {
			$( this ).sortable( {
				items: '> li',
				handle: '.bptm-sort-handle',
				axis: 'y',
				placeholder: 'bptm-sort-placeholder',
				forcePlaceholderSize: true,
				tolerance: 'pointer',
				update: function () {
					save( $root );
				},
			} );
		} );

		// Keyboard / button moves.
		$root.on( 'click', '.bptm-sort-up, .bptm-sort-down', function ( e ) {
			e.preventDefault();
			var $li = $( this ).closest( 'li.bptm-sort-item' );
			if ( $( this ).hasClass( 'bptm-sort-up' ) ) {
				var $prev = $li.prev( 'li' );
				if ( ! $prev.length ) {
					return;
				}
				$li.insertBefore( $prev );
			} else {
				var $next = $li.next( 'li' );
				if ( ! $next.length ) {
					return;
				}
				$li.insertAfter( $next );
			}
			$( this ).trigger( 'focus' );
			save( $root );
		} );

		$root.on( 'keydown', 'li.bptm-sort-item', function ( e ) {
			if ( e.target !== this || ! e.altKey ) {
				return;
			}
			if ( 'ArrowUp' === e.key || 'ArrowDown' === e.key ) {
				e.preventDefault();
				var $li = $( this );
				var $sib = 'ArrowUp' === e.key ? $li.prev( 'li' ) : $li.next( 'li' );
				if ( ! $sib.length ) {
					return;
				}
				if ( 'ArrowUp' === e.key ) {
					$li.insertBefore( $sib );
				} else {
					$li.insertAfter( $sib );
				}
				$li.trigger( 'focus' );
				save( $root );
			}
		} );
	} );

	// Quick sort buttons (members).
	$( document ).on( 'click', '[data-bptm-quicksort]', function ( e ) {
		e.preventDefault();
		var mode = $( this ).data( 'bptmQuicksort' );
		var $list = $( '.bptm-sortable-members' );
		var items = $list.children( 'li' ).get();
		if ( 'reverse' === mode ) {
			items.reverse();
		} else if ( 'name' === mode ) {
			items.sort( function ( a, b ) {
				return String( $( a ).data( 'name' ) ).localeCompare( String( $( b ).data( 'name' ) ) );
			} );
		} else if ( 'date' === mode ) {
			items.sort( function ( a, b ) {
				return parseInt( $( b ).data( 'date' ), 10 ) - parseInt( $( a ).data( 'date' ), 10 );
			} );
		}
		$list.append( items );
		save( $list );
	} );
}( jQuery ) );
