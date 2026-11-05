/**
 * Filters: category tabs (with child categories), dropdown filters (single or multi-select with ellipsis),
 * instant search (name / company / zip / tag), reset button. Normal filter = client side; ajax filter = REST.
 */
import { $, $$, debounce, sprintf } from './utils';

const TAX_KEYS = [ 'location', 'language', 'gender', 'specialty', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five' ];

export default class Filters {
	/**
	 * @param {Object} inst Instance (root, cfg, items(), onFilterChange()).
	 */
	constructor( inst ) {
		this.inst = inst;
		this.root = inst.root;
		this.cfg = Object.assign( { type: 'normal-filter', multi: false, ellipsis: false, reset: false, all: true }, inst.cfg.filter || {} );
		this.ajax = this.cfg.type === 'ajax-filter';
		this.cats = $( '.bptm-cats', this.root );
		this.selects = $$( 'select.bptm-select[data-bptm-filter]', this.root );
		this.searches = $$( 'input.bptm-search[data-bptm-search]', this.root );
		this.resetBtn = $( '.bptm-reset', this.root );
		this.status = $( '.bptm-filter-status', this.root );
		this.group = '*';
		this.multis = [];

		const active = this.cats ? $( '.bptm-cat-item.is-active > .bptm-cat', this.cats ) : null;
		if ( active ) {
			this.group = active.getAttribute( 'data-filter' ) || '*';
		}

		this.bindCats();
		this.bindSelects();
		this.bindSearch();
		if ( this.resetBtn ) {
			this.resetBtn.addEventListener( 'click', () => this.reset() );
		}
		// A preselected first category (no "All" tab) must filter immediately.
		if ( this.group !== '*' ) {
			this.changed( true );
		}
	}

	/* ------------------------------------------------------------------ */
	/* Category tabs                                                       */
	/* ------------------------------------------------------------------ */

	bindCats() {
		if ( ! this.cats ) {
			return;
		}
		this.cats.addEventListener( 'click', ( e ) => {
			const btn = e.target.closest( '.bptm-cat' );
			if ( ! btn || ! this.cats.contains( btn ) ) {
				return;
			}
			e.preventDefault();
			const li = btn.parentElement;
			const hasSub = li.classList.contains( 'bptm-has-child' ) && btn.hasAttribute( 'aria-expanded' );
			if ( hasSub ) {
				const open = btn.getAttribute( 'aria-expanded' ) === 'true';
				this.closeSubs( li );
				btn.setAttribute( 'aria-expanded', open ? 'false' : 'true' );
				li.classList.toggle( 'is-open', ! open );
			} else if ( ! btn.closest( '.bptm-cats-sub' ) ) {
				this.closeSubs();
			}
			this.setGroup( btn.getAttribute( 'data-filter' ) || '*', btn );
			if ( btn.closest( '.bptm-cats-sub' ) ) {
				this.closeSubs();
			}
		} );
		document.addEventListener( 'click', ( e ) => {
			if ( this.cats.isConnected && ! this.cats.contains( e.target ) ) {
				this.closeSubs();
			}
		} );
		this.cats.addEventListener( 'keydown', ( e ) => {
			if ( e.key === 'Escape' ) {
				const open = $( '.bptm-cat-item.is-open > .bptm-cat', this.cats );
				this.closeSubs();
				if ( open ) {
					open.focus();
				}
			}
		} );
	}

	closeSubs( except ) {
		$$( '.bptm-cat-item.is-open', this.cats ).forEach( ( li ) => {
			if ( li !== except ) {
				li.classList.remove( 'is-open' );
				const b = $( ':scope > .bptm-cat', li );
				if ( b ) {
					b.setAttribute( 'aria-expanded', 'false' );
				}
			}
		} );
	}

	setGroup( slug, btn ) {
		this.group = slug;
		$$( '.bptm-cat-item', this.cats ).forEach( ( li ) => li.classList.remove( 'is-active', 'is-active-parent' ) );
		$$( '.bptm-cat', this.cats ).forEach( ( b ) => b.setAttribute( 'aria-pressed', 'false' ) );
		if ( btn ) {
			btn.setAttribute( 'aria-pressed', 'true' );
			btn.parentElement.classList.add( 'is-active' );
			let p = btn.parentElement.parentElement.closest( '.bptm-cat-item' );
			while ( p ) {
				p.classList.add( 'is-active-parent' );
				p = p.parentElement.closest( '.bptm-cat-item' );
			}
		}
		this.changed();
	}

	/* ------------------------------------------------------------------ */
	/* Dropdowns                                                           */
	/* ------------------------------------------------------------------ */

	bindSelects() {
		this.selects.forEach( ( sel ) => {
			if ( this.cfg.multi ) {
				this.multis.push( this.buildMulti( sel ) );
			} else {
				sel.addEventListener( 'change', () => this.changed() );
			}
		} );
		if ( this.multis.length ) {
			document.addEventListener( 'click', ( e ) => {
				this.multis.forEach( ( ms ) => {
					if ( ms.wrap.isConnected && ! ms.wrap.contains( e.target ) ) {
						ms.close();
					}
				} );
			} );
		}
	}

	/**
	 * Replace a native select by an accessible checkbox dropdown (native select stays in sync, hidden).
	 *
	 * @param {HTMLSelectElement} sel Select.
	 * @return {Object} Controller.
	 */
	buildMulti( sel ) {
		const placeholder = sel.getAttribute( 'data-placeholder' ) || '';
		const id = sel.id + '-ms';
		sel.multiple = true;
		sel.hidden = true;
		sel.tabIndex = -1;
		Array.from( sel.options ).forEach( ( o ) => {
			o.selected = false;
		} );

		const wrap = document.createElement( 'div' );
		wrap.className = 'bptm-ms' + ( this.cfg.ellipsis ? ' bptm-ms--ellipsis' : '' );
		const toggle = document.createElement( 'button' );
		toggle.type = 'button';
		toggle.className = 'bptm-ms-toggle bptm-select';
		toggle.setAttribute( 'aria-haspopup', 'listbox' );
		toggle.setAttribute( 'aria-expanded', 'false' );
		toggle.setAttribute( 'aria-controls', id );
		const label = document.createElement( 'span' );
		label.className = 'bptm-ms-label is-placeholder';
		label.textContent = placeholder;
		toggle.appendChild( label );
		const caret = document.createElement( 'i' );
		caret.className = 'fas fa-angle-down bptm-ms-caret';
		caret.setAttribute( 'aria-hidden', 'true' );
		toggle.appendChild( caret );

		const menu = document.createElement( 'div' );
		menu.className = 'bptm-ms-menu';
		menu.id = id;
		menu.setAttribute( 'role', 'group' );
		menu.setAttribute( 'aria-label', placeholder );
		menu.hidden = true;

		Array.from( sel.options ).forEach( ( o, k ) => {
			if ( o.value === '*' ) {
				return;
			}
			const row = document.createElement( 'label' );
			row.className = 'bptm-ms-option';
			row.style.setProperty( '--bptm-depth', o.getAttribute( 'data-depth' ) || '0' );
			const cb = document.createElement( 'input' );
			cb.type = 'checkbox';
			cb.value = o.value;
			cb.setAttribute( 'data-index', String( k ) );
			const t = document.createElement( 'span' );
			t.textContent = o.textContent.replace( /^(—\s)+/, '' );
			row.appendChild( cb );
			row.appendChild( t );
			menu.appendChild( row );
		} );

		wrap.appendChild( toggle );
		wrap.appendChild( menu );
		sel.insertAdjacentElement( 'afterend', wrap );
		const srLabel = sel.id ? $( 'label[for="' + sel.id + '"]', this.root ) : null;
		if ( srLabel ) {
			srLabel.setAttribute( 'for', '' );
			toggle.setAttribute( 'aria-label', placeholder );
		}

		const ctrl = {
			sel,
			wrap,
			toggle,
			menu,
			open: () => {
				this.multis.forEach( ( m ) => m !== ctrl && m.close() );
				menu.hidden = false;
				wrap.classList.add( 'is-open' );
				toggle.setAttribute( 'aria-expanded', 'true' );
			},
			close: () => {
				menu.hidden = true;
				wrap.classList.remove( 'is-open' );
				toggle.setAttribute( 'aria-expanded', 'false' );
			},
			sync: () => {
				const names = [];
				$$( 'input[type=checkbox]', menu ).forEach( ( cb ) => {
					const opt = sel.options[ parseInt( cb.getAttribute( 'data-index' ), 10 ) ];
					opt.selected = cb.checked;
					if ( cb.checked ) {
						names.push( cb.nextElementSibling.textContent );
					}
				} );
				label.classList.toggle( 'is-placeholder', ! names.length );
				if ( ! names.length ) {
					label.textContent = placeholder;
				} else if ( this.cfg.ellipsis || names.length <= 2 ) {
					label.textContent = names.join( ', ' );
				} else {
					label.textContent = sprintf( this.inst.cfg.i18n.selected || '%d selected', names.length );
				}
				toggle.title = names.join( ', ' );
			},
			clear: () => {
				$$( 'input[type=checkbox]', menu ).forEach( ( cb ) => {
					cb.checked = false;
				} );
				ctrl.sync();
			},
		};

		toggle.addEventListener( 'click', () => ( menu.hidden ? ctrl.open() : ctrl.close() ) );
		menu.addEventListener( 'change', () => {
			ctrl.sync();
			this.changed();
		} );
		wrap.addEventListener( 'keydown', ( e ) => {
			if ( e.key === 'Escape' && ! menu.hidden ) {
				e.stopPropagation();
				ctrl.close();
				toggle.focus();
			} else if ( e.key === 'ArrowDown' && menu.hidden && e.target === toggle ) {
				e.preventDefault();
				ctrl.open();
				const first = $( 'input', menu );
				if ( first ) {
					first.focus();
				}
			}
		} );
		return ctrl;
	}

	/* ------------------------------------------------------------------ */
	/* Search                                                              */
	/* ------------------------------------------------------------------ */

	bindSearch() {
		const run = debounce( () => this.changed(), this.ajax ? 350 : 120 );
		this.searches.forEach( ( input ) => {
			input.addEventListener( 'input', run );
			input.addEventListener( 'search', run );
			input.addEventListener( 'keydown', ( e ) => {
				if ( e.key === 'Enter' ) {
					e.preventDefault();
					this.changed();
				}
			} );
		} );
	}

	/* ------------------------------------------------------------------ */
	/* State                                                               */
	/* ------------------------------------------------------------------ */

	/**
	 * Current filter state.
	 *
	 * @param {boolean} forServer Use raw values the REST endpoint expects (designation text).
	 * @return {Object} State.
	 */
	state( forServer = false ) {
		const s = {};
		if ( this.group && this.group !== '*' ) {
			s.group = forServer ? [ this.group ] : this.group;
		}
		this.selects.forEach( ( sel ) => {
			const key = sel.getAttribute( 'data-bptm-filter' );
			const vals = Array.from( sel.options )
				.filter( ( o ) => o.selected && o.value !== '*' )
				.map( ( o ) => ( forServer ? o.getAttribute( 'data-value' ) || o.value : o.value ) );
			if ( vals.length ) {
				s[ key ] = vals;
			}
		} );
		this.searches.forEach( ( input ) => {
			const v = input.value.trim();
			if ( v ) {
				s[ input.getAttribute( 'data-bptm-search' ) ] = v;
			}
		} );
		return s;
	}

	isActive() {
		const s = this.state();
		if ( ! this.cfg.all && this.cats ) {
			// Without an "All" tab the first category is the baseline, not an active filter.
			const first = $( '.bptm-cats > .bptm-cat-item > .bptm-cat', this.root );
			if ( first && s.group === first.getAttribute( 'data-filter' ) ) {
				delete s.group;
			}
		}
		return Object.keys( s ).length > 0;
	}

	reset() {
		this.searches.forEach( ( i ) => {
			i.value = '';
		} );
		this.selects.forEach( ( sel ) => {
			Array.from( sel.options ).forEach( ( o ) => {
				o.selected = o.value === '*' && ! sel.multiple;
			} );
			if ( ! sel.multiple ) {
				sel.value = '*';
			}
		} );
		this.multis.forEach( ( m ) => m.clear() );
		if ( this.cats ) {
			const first = $( '.bptm-cats > .bptm-cat-item > .bptm-cat', this.root );
			this.closeSubs();
			if ( first ) {
				this.setGroup( first.getAttribute( 'data-filter' ) || '*', first );
				return;
			}
		}
		this.changed();
	}

	changed( initial = false ) {
		if ( this.resetBtn ) {
			this.resetBtn.hidden = ! this.isActive();
		}
		if ( this.ajax ) {
			this.inst.reload( this.state( true ), initial );
			return;
		}
		this.applyClient();
	}

	/**
	 * Client side matching.
	 *
	 * @param {Element} item Item.
	 * @param {Object}  s    State.
	 * @return {boolean} Match.
	 */
	matches( item, s ) {
		const data = ( k ) => ( item.getAttribute( 'data-' + k ) || '' ).toLowerCase();
		const tokens = ( k ) => data( k ).split( /\s+/ ).filter( Boolean );
		if ( s.group && ! tokens( 'group' ).includes( s.group ) ) {
			return false;
		}
		if ( s.designation && ! s.designation.includes( data( 'designation' ) ) ) {
			return false;
		}
		for ( const key of TAX_KEYS ) {
			if ( s[ key ] ) {
				const have = tokens( key.replace( /_/g, '-' ) );
				if ( ! s[ key ].some( ( v ) => have.includes( String( v ).toLowerCase() ) ) ) {
					return false;
				}
			}
		}
		if ( s.search ) {
			const q = s.search.toLowerCase();
			if ( ! data( 'name' ).includes( q ) && ! data( 'search' ).includes( q ) ) {
				return false;
			}
		}
		if ( s.company && ! data( 'company' ).includes( s.company.toLowerCase() ) ) {
			return false;
		}
		if ( s.zip && ! data( 'zip' ).includes( s.zip.toLowerCase() ) ) {
			return false;
		}
		if ( s.tag ) {
			const q = s.tag.toLowerCase();
			if ( ! data( 'tags' ).split( '|' ).some( ( t ) => t.includes( q ) ) ) {
				return false;
			}
		}
		return true;
	}

	applyClient() {
		const s = this.state();
		const items = this.inst.items();
		let shown = 0;
		items.forEach( ( item ) => {
			const ok = this.matches( item, s );
			if ( ok ) {
				shown++;
				if ( item.hidden ) {
					item.hidden = false;
					item.classList.remove( 'bptm-filter-in' );
					void item.offsetWidth; // eslint-disable-line no-void
					item.classList.add( 'bptm-filter-in' );
				}
			} else {
				item.hidden = true;
			}
		} );
		this.inst.afterFilter( shown );
		if ( this.status ) {
			this.status.textContent = shown ? String( shown ) : this.inst.cfg.i18n.noMembers || '';
		}
	}
}
