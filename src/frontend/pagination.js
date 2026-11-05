/**
 * Pagination: ajax numbered links, load-more button, infinite scroll. Normal pagination uses plain links (no JS).
 */
import { $ } from './utils';

export default class Pagination {
	/**
	 * @param {Object} inst Instance.
	 */
	constructor( inst ) {
		this.inst = inst;
		this.root = inst.root;
		this.cfg = inst.cfg.pagination || {};
		this.mode = this.cfg.mode || '';
		this.loading = false;
		this.io = null;

		if ( this.mode === 'ajax-pagination' ) {
			this.root.addEventListener( 'click', ( e ) => {
				const a = e.target.closest( '.bptm-pagination a.bptm-page[data-page]' );
				if ( ! a || ! this.root.contains( a ) ) {
					return;
				}
				e.preventDefault();
				const page = parseInt( a.getAttribute( 'data-page' ), 10 ) || 1;
				this.inst.load( { page }, 'replace' ).then( () => {
					const r = this.root.getBoundingClientRect();
					if ( r.top < 0 ) {
						this.root.scrollIntoView( { behavior: 'smooth', block: 'start' } );
					}
					const first = $( '.bptm-items [data-bptm-open], .bptm-items a', this.root );
					if ( first ) {
						first.focus( { preventScroll: true } );
					}
				} );
			} );
		} else if ( this.mode === 'load-more-button' ) {
			this.root.addEventListener( 'click', ( e ) => {
				const b = e.target.closest( '.bptm-loadmore' );
				if ( ! b || ! this.root.contains( b ) ) {
					return;
				}
				e.preventDefault();
				this.more();
			} );
		} else if ( this.mode === 'load-more-scroll' ) {
			this.observe();
		}
	}

	/** Offset of the next batch = items currently loaded. */
	nextOffset() {
		return this.inst.loadedCount();
	}

	more() {
		if ( this.loading ) {
			return Promise.resolve();
		}
		this.loading = true;
		return this.inst.load( { offset: this.nextOffset() }, 'append' ).finally( () => {
			this.loading = false;
			// Keep filling while the sentinel is still visible (short pages).
			if ( this.mode === 'load-more-scroll' ) {
				window.requestAnimationFrame( () => this.check() );
			}
		} );
	}

	observe() {
		if ( this.io ) {
			this.io.disconnect();
		}
		const sentinel = $( '.bptm-infinite', this.root );
		if ( ! sentinel ) {
			return;
		}
		if ( typeof window.IntersectionObserver !== 'function' ) {
			// Fallback: a manual button.
			sentinel.addEventListener( 'click', () => this.more() );
			return;
		}
		this.io = new window.IntersectionObserver(
			( entries ) => {
				entries.forEach( ( en ) => {
					if ( en.isIntersecting && ! sentinel.hidden && this.root.isConnected ) {
						this.more();
					}
				} );
			},
			{ rootMargin: '0px 0px 300px 0px' }
		);
		this.io.observe( sentinel );
	}

	check() {
		const sentinel = $( '.bptm-infinite', this.root );
		if ( ! sentinel || sentinel.hidden || this.loading ) {
			return;
		}
		const r = sentinel.getBoundingClientRect();
		if ( r.top < window.innerHeight + 300 && r.bottom > -300 ) {
			this.more();
		}
	}

	/**
	 * Replace the pagination markup with the server version.
	 *
	 * @param {string} html Markup.
	 */
	replace( html ) {
		const current = $( '.bptm-pagination, .bptm-loadmore-wrap, .bptm-infinite', this.root );
		const tpl = document.createElement( 'template' );
		tpl.innerHTML = String( html || '' ).trim();
		const next = tpl.content.firstElementChild;
		if ( current && next ) {
			current.replaceWith( next );
		} else if ( current && ! next ) {
			current.hidden = true;
		} else if ( ! current && next ) {
			const anchor = $( '.bptm-stage', this.root );
			if ( anchor ) {
				anchor.insertAdjacentElement( 'afterend', next );
			}
		}
		if ( this.mode === 'load-more-scroll' ) {
			this.observe();
		}
	}
}
