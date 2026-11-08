/**
 * One rendered block instance (`.bptm-wrap[data-bptm]`).
 */
import { $, $$, debounce, fetchRender, parseElements } from './utils';
import Carousel from './carousel';
import Filters from './filters';
import Modal from './modal';
import Pagination from './pagination';
import { animate, bindFlip, equalize, scrollables } from './effects';

export default class Instance {
	/**
	 * @param {Element} root Root element.
	 */
	constructor( root ) {
		this.root = root;
		let cfg = {};
		try {
			cfg = JSON.parse( root.getAttribute( 'data-bptm' ) || '{}' ) || {};
		} catch ( e ) {
			cfg = {};
		}
		cfg.i18n = cfg.i18n || {};
		cfg.uid = cfg.uid || root.getAttribute( 'data-bptm-uid' ) || '';
		this.cfg = cfg;
		this.filterState = {};
		this.request = 0;

		root.classList.add( 'bptm-js' );

		const stage = $( '.bptm-carousel', root );
		if ( cfg.view === 'carousel' && stage ) {
			this.carousel = new Carousel( stage, cfg.carousel, cfg.i18n );
		}
		if ( [ 'popup', 'panel', 'drawer' ].includes( cfg.link ) ) {
			this.modal = new Modal( this );
		}
		if ( cfg.pagination && cfg.pagination.mode && cfg.pagination.mode !== 'normal-pagination' ) {
			this.pagination = new Pagination( this );
		}
		if ( cfg.view === 'filter' ) {
			this.filters = new Filters( this );
		}

		bindFlip( root );
		this.refresh( this.items( true ) );

		this.onResize = debounce( () => {
			if ( ! this.root.isConnected ) {
				window.removeEventListener( 'resize', this.onResize );
				return;
			}
			equalize( this.root );
			scrollables( [ this.root ] );
			if ( this.modal ) {
				this.modal.relayout();
			}
		}, 150 );
		window.addEventListener( 'resize', this.onResize );
		// Fonts / lazy images change heights after first paint.
		window.addEventListener( 'load', () => equalize( this.root ), { once: true } );
	}

	/**
	 * The items container.
	 *
	 * @return {Element|null} Container.
	 */
	container() {
		return $( '.bptm-stage .bptm-items', this.root ) || $( '.bptm-items', this.root );
	}

	/**
	 * Real items (no carousel clones).
	 *
	 * @param {boolean} all Include hidden.
	 * @return {Element[]} Items.
	 */
	items( all = true ) {
		const c = this.container();
		if ( ! c ) {
			return [];
		}
		return $$( ':scope > .bptm-item:not(.bptm-clone)', c ).filter( ( el ) => all || ! el.hidden );
	}

	loadedCount() {
		return this.items( true ).length;
	}

	refresh( newItems ) {
		animate( newItems );
		scrollables( newItems.length ? newItems : [ this.root ] );
		equalize( this.root );
	}

	/**
	 * After client-side filtering.
	 *
	 * @param {number} shown Visible count.
	 */
	afterFilter( shown ) {
		const c = this.container();
		if ( c ) {
			// Group titles (group themes): hide the ones whose members are all filtered out.
			$$( ':scope > .bptm-group-title', c ).forEach( ( title ) => {
				let n = title.nextElementSibling;
				let any = false;
				while ( n && ! n.classList.contains( 'bptm-group-title' ) ) {
					if ( n.classList.contains( 'bptm-item' ) && ! n.hidden ) {
						any = true;
						break;
					}
					n = n.nextElementSibling;
				}
				title.hidden = ! any;
			} );
		}
		let empty = $( '.bptm-no-results', this.root );
		if ( ! shown ) {
			if ( ! empty ) {
				empty = document.createElement( 'div' );
				empty.className = 'bptm-no-members bptm-no-results';
				empty.setAttribute( 'role', 'status' );
				empty.textContent = this.cfg.i18n.noMembers || '';
				const stage = $( '.bptm-stage', this.root );
				if ( stage ) {
					stage.appendChild( empty );
				}
			}
			empty.hidden = false;
		} else if ( empty ) {
			empty.hidden = true;
		}
		this.refresh( [] );
		if ( this.modal ) {
			this.modal.relayout();
		}
	}

	/**
	 * Ajax filter changed: reload the first page/batch.
	 *
	 * @param {Object}  filters Server filter state.
	 * @param {boolean} initial Initial (preselected category).
	 */
	reload( filters, initial = false ) {
		this.filterState = filters || {};
		const params = this.pagination && this.pagination.mode === 'ajax-pagination' ? { page: 1 } : {};
		return this.load( params, 'replace', initial );
	}

	/**
	 * Fetch a batch from the REST endpoint.
	 *
	 * @param {Object} params page | offset.
	 * @param {string} how    replace | append.
	 * @return {Promise} Done.
	 */
	load( params, how ) {
		const cfg = this.cfg;
		if ( ! cfg.rest ) {
			return Promise.resolve();
		}
		const id = ++this.request;
		const body = Object.assign(
			{
				attributes: cfg.attrs || {},
				uid: cfg.uid,
				filters: this.filterState,
			},
			params
		);
		if ( typeof cfg.seed !== 'undefined' ) {
			body.seed = cfg.seed;
		}
		// Page URL: the server builds absolute page links from it (keeps other query args).
		const loc = window.location;
		if ( /^https?:$/.test( loc.protocol ) && loc.pathname.indexOf( '/wp-admin/' ) === -1 ) {
			body.url = loc.href.split( '#' )[ 0 ];
		}
		const c = this.container();
		this.root.classList.add( 'is-loading' );
		if ( c ) {
			c.setAttribute( 'aria-busy', 'true' );
		}
		return fetchRender( cfg.rest, body )
			.then( ( data ) => {
				if ( id !== this.request || ! data ) {
					return;
				}
				this.apply( data, how );
			} )
			.catch( ( err ) => {
				// eslint-disable-next-line no-console
				console.error( err );
			} )
			.finally( () => {
				if ( id === this.request ) {
					this.root.classList.remove( 'is-loading' );
					const cc = this.container();
					if ( cc ) {
						cc.removeAttribute( 'aria-busy' );
					}
				}
			} );
	}

	/**
	 * Apply a REST response.
	 *
	 * @param {Object} data Response.
	 * @param {string} how  replace | append.
	 */
	apply( data, how ) {
		const c = this.container();
		if ( ! c ) {
			return;
		}
		if ( this.modal && how === 'replace' ) {
			this.modal.reset();
		}
		const els = parseElements( data.items || '' );
		if ( how === 'replace' ) {
			c.innerHTML = '';
		}
		const old = $( '.bptm-no-results', this.root );
		if ( old ) {
			old.remove();
		}
		els.forEach( ( el ) => c.appendChild( el ) );

		const store = $( '.bptm-details-store', this.root );
		if ( store ) {
			if ( how === 'replace' ) {
				store.innerHTML = '';
			}
			parseElements( data.details || '' ).forEach( ( el ) => {
				const dup = el.id ? this.root.ownerDocument.getElementById( el.id ) : null;
				if ( dup ) {
					dup.remove();
				}
				store.appendChild( el );
			} );
		}
		if ( this.pagination ) {
			this.pagination.replace( data.pagination || '' );
		}
		if ( this.filters && this.filters.status ) {
			this.filters.status.textContent = data.found ? String( data.found ) : this.cfg.i18n.noMembers || '';
		}
		const items = els.filter( ( el ) => el.classList && el.classList.contains( 'bptm-item' ) );
		this.refresh( items );
		this.root.dispatchEvent( new window.CustomEvent( 'bptm:loaded', { bubbles: true, detail: { how, data } } ) );
	}
}
