/**
 * BP Team Member - member edit screen: repeaters, icon picker, media field.
 */
( function ( $ ) {
	'use strict';

	var data = window.bptmMetaBoxes || { icons: [], i18n: {} };
	var i18n = data.i18n || {};
	var uid = Date.now();

	/* ------------------------------------------------------------------ *
	 * Repeaters (social links, skills)
	 * ------------------------------------------------------------------ */
	function refreshEmpty( $rep ) {
		var has = $rep.find( '.bptm-repeater-body > tr' ).length > 0;
		$rep.find( '.bptm-repeater-empty' ).prop( 'hidden', has );
	}

	function addRow( $rep ) {
		var tpl = $rep.find( 'template.bptm-repeater-template' ).get( 0 );
		if ( ! tpl ) {
			return null;
		}
		var html = tpl.innerHTML.replace( /__INDEX__/g, 'n' + ( uid++ ) );
		var $row = $( $.parseHTML( $.trim( html ) ) ).filter( 'tr' );
		$rep.find( '.bptm-repeater-body' ).append( $row );
		refreshEmpty( $rep );
		$row.find( 'input[type="text"]' ).first().trigger( 'focus' );
		return $row;
	}

	function initRepeater( $rep ) {
		if ( $rep.data( 'bptmReady' ) ) {
			return;
		}
		$rep.data( 'bptmReady', true );

		$rep.on( 'click', '.bptm-row-add', function ( e ) {
			e.preventDefault();
			var $row = addRow( $rep );
			if ( $row && 'social' === $rep.data( 'bptmRepeater' ) ) {
				openPicker( $row.find( '.bptm-icon-field' ) );
			}
		} );

		$rep.on( 'click', '.bptm-row-remove', function ( e ) {
			e.preventDefault();
			var $row = $( this ).closest( 'tr' );
			var filled = $row.find( 'input' ).filter( function () {
				return this.type !== 'range' && this.type !== 'number' && $.trim( this.value ) !== '';
			} ).length > 0;
			if ( filled && ! window.confirm( i18n.confirmDel || 'Remove this row?' ) ) {
				return;
			}
			$row.remove();
			refreshEmpty( $rep );
		} );

		// Percent: keep range and number in sync.
		$rep.on( 'input change', '.bptm-percent-range', function () {
			$( this ).siblings( '.bptm-percent-number' ).val( this.value );
		} );
		$rep.on( 'input change', '.bptm-percent-number', function () {
			var v = parseInt( this.value, 10 );
			if ( isNaN( v ) ) {
				return;
			}
			v = Math.max( 0, Math.min( 100, v ) );
			$( this ).siblings( '.bptm-percent-range' ).val( v );
		} );

		if ( $.fn.sortable ) {
			$rep.find( '.bptm-repeater-body' ).sortable( {
				handle: '.bptm-handle',
				axis: 'y',
				items: '> tr',
				placeholder: 'bptm-sort-placeholder',
				forcePlaceholderSize: true,
				helper: function ( e, tr ) {
					var $orig = tr.children();
					var $helper = tr.clone();
					$helper.children().each( function ( i ) {
						$( this ).width( $orig.eq( i ).width() );
					} );
					return $helper;
				},
			} );
		}
		refreshEmpty( $rep );
	}

	/* ------------------------------------------------------------------ *
	 * Icon picker (single shared popover)
	 * ------------------------------------------------------------------ */
	var $picker = null;
	var $pickerGrid = null;
	var $pickerSearch = null;
	var $currentField = null;
	var gridBuilt = false;

	function buildPicker() {
		if ( $picker ) {
			return;
		}
		$picker = $(
			'<div class="bptm-icon-picker" role="dialog" aria-modal="false" hidden>' +
				'<div class="bptm-icon-picker-head">' +
					'<input type="search" class="bptm-icon-search" />' +
					'<button type="button" class="button-link bptm-icon-close"><span class="dashicons dashicons-no-alt" aria-hidden="true"></span></button>' +
				'</div>' +
				'<div class="bptm-icon-grid" role="listbox"></div>' +
				'<p class="bptm-icon-none" hidden></p>' +
			'</div>'
		);
		$picker.attr( 'aria-label', i18n.chooseIcon || 'Choose icon' );
		$pickerSearch = $picker.find( '.bptm-icon-search' ).attr( 'placeholder', i18n.search || 'Search icons' ).attr( 'aria-label', i18n.search || 'Search icons' );
		$picker.find( '.bptm-icon-close' ).attr( 'aria-label', i18n.close || 'Close' );
		$picker.find( '.bptm-icon-none' ).text( i18n.noIcons || 'No icons match your search.' );
		$pickerGrid = $picker.find( '.bptm-icon-grid' );
		$( document.body ).append( $picker );

		$pickerSearch.on( 'input', filterIcons );
		$picker.on( 'click', '.bptm-icon-close', closePicker );
		$picker.on( 'click', '.bptm-icon-option', function () {
			selectIcon( $( this ).data( 'icon' ), $( this ).attr( 'title' ) );
		} );
		$picker.on( 'keydown', function ( e ) {
			if ( 'Escape' === e.key ) {
				e.preventDefault();
				closePicker();
			}
			if ( 'Enter' === e.key && $( e.target ).is( '.bptm-icon-search' ) ) {
				e.preventDefault();
				var $first = $pickerGrid.children( ':not([hidden])' ).first();
				if ( $first.length ) {
					$first.trigger( 'click' );
				}
			}
		} );
		$( document ).on( 'mousedown', function ( e ) {
			if ( ! $picker || $picker.prop( 'hidden' ) ) {
				return;
			}
			if ( $( e.target ).closest( '.bptm-icon-picker, .bptm-icon-choose' ).length ) {
				return;
			}
			closePicker();
		} );
		$( window ).on( 'resize', function () {
			if ( $currentField && ! $picker.prop( 'hidden' ) ) {
				positionPicker();
			}
		} );
	}

	function buildGrid() {
		if ( gridBuilt ) {
			return;
		}
		gridBuilt = true;
		var frag = document.createDocumentFragment();
		( data.icons || [] ).forEach( function ( pair ) {
			var btn = document.createElement( 'button' );
			btn.type = 'button';
			btn.className = 'bptm-icon-option';
			btn.title = pair[ 1 ];
			btn.setAttribute( 'role', 'option' );
			btn.setAttribute( 'data-icon', pair[ 0 ] );
			btn.setAttribute( 'data-search', ( pair[ 0 ] + ' ' + pair[ 1 ] ).toLowerCase() );
			var i = document.createElement( 'i' );
			i.className = pair[ 0 ];
			i.setAttribute( 'aria-hidden', 'true' );
			var s = document.createElement( 'span' );
			s.className = 'bptm-icon-option-label';
			s.textContent = pair[ 1 ];
			btn.appendChild( i );
			btn.appendChild( s );
			frag.appendChild( btn );
		} );
		$pickerGrid.get( 0 ).appendChild( frag );
	}

	function filterIcons() {
		var q = $.trim( $pickerSearch.val() ).toLowerCase();
		var terms = q ? q.split( /\s+/ ) : [];
		var shown = 0;
		$pickerGrid.children().each( function () {
			var hay = this.getAttribute( 'data-search' );
			var ok = terms.every( function ( t ) {
				return hay.indexOf( t ) !== -1;
			} );
			this.hidden = ! ok;
			if ( ok ) {
				shown++;
			}
		} );
		$picker.find( '.bptm-icon-none' ).prop( 'hidden', shown > 0 );
	}

	function positionPicker() {
		var $btn = $currentField.find( '.bptm-icon-choose' );
		var off = $btn.offset();
		var width = Math.min( 420, $( window ).width() - 24 );
		var left = Math.max( 12, Math.min( off.left, $( window ).width() - width - 12 ) );
		$picker.css( { top: off.top + $btn.outerHeight() + 4, left: left, width: width } );
	}

	function openPicker( $field ) {
		buildPicker();
		buildGrid();
		$currentField = $field;
		var current = $field.find( '.bptm-icon-input' ).val();
		$pickerGrid.children().removeClass( 'is-selected' ).attr( 'aria-selected', 'false' );
		if ( current ) {
			$pickerGrid.children().filter( function () {
				return this.getAttribute( 'data-icon' ) === current;
			} ).addClass( 'is-selected' ).attr( 'aria-selected', 'true' );
		}
		$pickerSearch.val( '' );
		filterIcons();
		$picker.prop( 'hidden', false );
		positionPicker();
		$pickerSearch.trigger( 'focus' );
	}

	function closePicker() {
		if ( ! $picker ) {
			return;
		}
		$picker.prop( 'hidden', true );
		if ( $currentField ) {
			$currentField.find( '.bptm-icon-choose' ).trigger( 'focus' );
		}
		$currentField = null;
	}

	function selectIcon( icon, label ) {
		if ( ! $currentField ) {
			return;
		}
		$currentField.find( '.bptm-icon-input' ).val( icon ).trigger( 'change' );
		$currentField.find( '.bptm-icon-preview' ).attr( 'class', 'bptm-icon-preview ' + icon );
		$currentField.find( '.bptm-icon-label' ).text( label || icon );
		var $row = $currentField.closest( 'tr' );
		closePicker();
		$row.find( '.bptm-col-link input' ).trigger( 'focus' );
	}

	$( document ).on( 'click', '.bptm-icon-choose', function ( e ) {
		e.preventDefault();
		var $field = $( this ).closest( '.bptm-icon-field' );
		if ( $picker && ! $picker.prop( 'hidden' ) && $currentField && $currentField.is( $field ) ) {
			closePicker();
			return;
		}
		openPicker( $field );
	} );

	/* ------------------------------------------------------------------ *
	 * Media field (flip image)
	 * ------------------------------------------------------------------ */
	function initMedia( $wrap ) {
		var frame = null;
		$wrap.on( 'click', '.bptm-media-select, .bptm-media-preview img', function ( e ) {
			e.preventDefault();
			if ( ! window.wp || ! wp.media ) {
				return;
			}
			if ( ! frame ) {
				frame = wp.media( {
					title: i18n.mediaTitle || 'Select image',
					button: { text: i18n.mediaButton || 'Use this image' },
					library: { type: 'image' },
					multiple: false,
				} );
				frame.on( 'open', function () {
					var id = parseInt( $wrap.find( '.bptm-media-id' ).val(), 10 );
					var selection = frame.state().get( 'selection' );
					selection.reset( [] );
					if ( id ) {
						var att = wp.media.attachment( id );
						att.fetch();
						selection.add( att );
					}
				} );
				frame.on( 'select', function () {
					var att = frame.state().get( 'selection' ).first();
					if ( ! att ) {
						return;
					}
					att = att.toJSON();
					var url = att.sizes && att.sizes.medium ? att.sizes.medium.url : att.url;
					$wrap.find( '.bptm-media-id' ).val( att.id ).trigger( 'change' );
					$wrap.find( '.bptm-media-preview' ).prop( 'hidden', false ).find( 'img' ).attr( 'src', url );
					$wrap.find( '.bptm-media-remove' ).prop( 'hidden', false );
				} );
			}
			frame.open();
		} );
		$wrap.on( 'click', '.bptm-media-remove', function ( e ) {
			e.preventDefault();
			$wrap.find( '.bptm-media-id' ).val( '' ).trigger( 'change' );
			$wrap.find( '.bptm-media-preview' ).prop( 'hidden', true ).find( 'img' ).attr( 'src', '' );
			$( this ).prop( 'hidden', true );
		} );
	}

	$( function () {
		$( '[data-bptm-repeater]' ).each( function () {
			initRepeater( $( this ) );
		} );
		$( '[data-bptm-media]' ).each( function () {
			initMedia( $( this ) );
		} );
	} );
}( jQuery ) );
