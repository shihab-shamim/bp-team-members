/**
 * Popup / panel (off-canvas) / drawer (inline, expands under the clicked row) detail views.
 * Detail payloads live hidden in `.bptm-details-store`; the open one is moved into the shell and moved back on close.
 * ESC + overlay close, focus trap, focus restore, body scroll lock, prev/next across visible members.
 */
import { $, $$, focusables, lockScroll, unlockScroll } from './utils';

export default class Modal {
	/**
	 * @param {Object} inst Instance.
	 */
	constructor( inst ) {
		this.inst = inst;
		this.root = inst.root;
		this.uid = inst.cfg.uid;
		this.type = inst.cfg.link;
		this.store = $( '.bptm-details-store', this.root );
		this.current = null;
		this.lastFocus = null;
		this.shell = null;
		this.portal = null;

		if ( this.type === 'drawer' ) {
			this.shell = $( '.bptm-drawer[data-bptm-for]', this.root );
		} else {
			this.shell = $( '.bptm-modal[data-bptm-for]', this.root );
			if ( this.shell && this.type === 'panel' ) {
				// Side class from the config (right | left | center) so a centred panel opens as a centred dialog
				// even with an overridden modal template that only knows left/right.
				const side = [ 'left', 'right', 'center' ].includes( inst.cfg.panel ) ? inst.cfg.panel : 'right';
				this.shell.classList.remove( 'bptm-panel-left', 'bptm-panel-right', 'bptm-panel-center' );
				this.shell.classList.add( 'bptm-panel-' + side );
			}
			if ( this.shell ) {
				this.mountPortal();
			}
		}

		this.root.addEventListener( 'click', ( e ) => this.onTrigger( e ) );
		if ( this.shell ) {
			this.shell.addEventListener( 'click', ( e ) => this.onShellClick( e ) );
			this.shell.addEventListener( 'keydown', ( e ) => this.onKey( e ) );
		}
	}

	/**
	 * Move the popup/panel shell to <body> (escapes transformed / overflow-hidden ancestors) inside a wrapper
	 * that keeps the `.bptm-wrap` + theme classes so scoped styles still apply.
	 */
	mountPortal() {
		Modal.cleanupPortals();
		const portal = document.createElement( 'div' );
		const keep = Array.from( this.root.classList ).filter(
			( c ) => /^bptm-(wrap|theme-|group-|layout-|link-|align-|imgfx-|imghfx-)/.test( c ) || c === 'wp-block-icb-fold-out-reveal'
		);
		portal.className = keep.concat( [ 'bptm-portal' ] ).join( ' ' );
		portal.setAttribute( 'data-bptm-portal', this.uid );
		const dir = window.getComputedStyle( this.root ).direction;
		if ( dir === 'rtl' ) {
			portal.setAttribute( 'dir', 'rtl' );
		}
		// Fonts + dynamic CSS custom properties are scoped to the modal itself by the server CSS.
		portal.appendChild( this.shell );
		portal._bptmRoot = this.root; // eslint-disable-line no-underscore-dangle
		( this.root.ownerDocument.body || document.body ).appendChild( portal );
		this.portal = portal;
	}

	/** Remove portals whose block is gone (editor re-renders). */
	static cleanupPortals() {
		$$( '.bptm-portal' ).forEach( ( p ) => {
			const r = p._bptmRoot; // eslint-disable-line no-underscore-dangle
			if ( ! r || ! r.isConnected ) {
				if ( p.querySelector( '.bptm-modal:not([hidden])' ) ) {
					unlockScroll();
				}
				p.remove();
			}
		} );
	}

	onTrigger( e ) {
		const a = e.target.closest( '[data-bptm-open]' );
		if ( ! a || ! this.root.contains( a ) ) {
			return;
		}
		const id = a.getAttribute( 'data-bptm-id' );
		const type = a.getAttribute( 'data-bptm-open' );
		if ( ! id || type !== this.type || ! this.shell ) {
			return;
		}
		e.preventDefault();
		const item = a.closest( '.bptm-item' );
		if ( this.type === 'drawer' && this.current === id && ! this.shell.hidden ) {
			this.close();
			return;
		}
		this.lastFocus = a;
		this.open( id, item );
	}

	onShellClick( e ) {
		if ( e.target.closest( '[data-bptm-close]' ) ) {
			e.preventDefault();
			this.close();
		} else if ( e.target.closest( '[data-bptm-prev]' ) ) {
			e.preventDefault();
			this.step( -1 );
		} else if ( e.target.closest( '[data-bptm-next]' ) ) {
			e.preventDefault();
			this.step( 1 );
		}
	}

	onKey( e ) {
		if ( e.key === 'Escape' ) {
			e.preventDefault();
			e.stopPropagation();
			this.close();
			return;
		}
		const tag = e.target.tagName;
		if ( ( e.key === 'ArrowLeft' || e.key === 'ArrowRight' ) && ! /INPUT|TEXTAREA|SELECT/.test( tag ) ) {
			const rtl = window.getComputedStyle( this.shell ).direction === 'rtl';
			const dir = e.key === 'ArrowRight' ? 1 : -1;
			this.step( rtl ? -dir : dir );
			return;
		}
		if ( e.key === 'Tab' && this.type !== 'drawer' ) {
			const dialog = $( '.bptm-modal-dialog', this.shell ) || this.shell;
			const f = focusables( dialog );
			if ( ! f.length ) {
				e.preventDefault();
				return;
			}
			const first = f[ 0 ];
			const last = f[ f.length - 1 ];
			const active = this.shell.ownerDocument.activeElement;
			if ( e.shiftKey && ( active === first || ! dialog.contains( active ) ) ) {
				e.preventDefault();
				last.focus();
			} else if ( ! e.shiftKey && active === last ) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	/** Ids of members that can be opened, in visual order (filtered-out and cloned items excluded). */
	ids() {
		const out = [];
		$$( '.bptm-item:not(.bptm-clone)', this.root ).forEach( ( item ) => {
			if ( item.hidden || item.closest( '[hidden]' ) ) {
				return;
			}
			const id = item.getAttribute( 'data-bptm-id' );
			if ( id && ! out.includes( id ) && this.root.ownerDocument.getElementById( 'bptm-detail-' + this.uid + '-' + id ) ) {
				out.push( id );
			}
		} );
		return out;
	}

	detail( id ) {
		return this.store ? this.store.querySelector( '[data-bptm-detail="' + id + '"]' ) : null;
	}

	content() {
		return $( '.bptm-modal-content', this.shell );
	}

	restoreCurrent() {
		const content = this.content();
		if ( ! content || ! this.store ) {
			return;
		}
		Array.from( content.children ).forEach( ( el ) => {
			el.hidden = true;
			this.store.appendChild( el );
		} );
	}

	open( id, item ) {
		const d = this.detail( id );
		const content = this.content();
		if ( ! d || ! content ) {
			return;
		}
		if ( this.closeTimer ) {
			clearTimeout( this.closeTimer );
			this.closeTimer = null;
			this.shell.hidden = true;
		}
		const wasOpen = ! this.shell.hidden;
		this.restoreCurrent();
		d.hidden = false;
		content.appendChild( d );
		this.current = id;

		// Style hooks for the shell (popup/panel/drawer style classes come from the payload).
		this.shell.setAttribute( 'data-bptm-style', d.getAttribute( 'data-bptm-style' ) || 'default' );
		const ids = this.ids();
		const nav = $( '.bptm-modal-nav', this.shell );
		if ( nav ) {
			nav.hidden = ids.length < 2;
		}

		if ( this.type === 'drawer' ) {
			this.placeDrawer( item || $( '.bptm-item[data-bptm-id="' + id + '"]', this.root ) );
		}

		if ( ! wasOpen ) {
			this.shell.hidden = false;
			if ( this.type !== 'drawer' ) {
				lockScroll();
				this.root.classList.add( 'bptm-modal-open-host' );
				this.bindOutsideFocus();
			} else {
				this.bindDrawerKey();
			}
			// Next frame: allow CSS enter transitions.
			window.requestAnimationFrame( () => {
				window.requestAnimationFrame( () => this.shell.classList.add( 'is-open' ) );
			} );
		}
		$$( '.bptm-item.is-current', this.root ).forEach( ( el ) => el.classList.remove( 'is-current' ) );
		const cur = item || $( '.bptm-item[data-bptm-id="' + id + '"]:not(.bptm-clone)', this.root );
		if ( cur ) {
			cur.classList.add( 'is-current' );
		}
		content.scrollTop = 0;
		const dialog = $( '.bptm-modal-dialog', this.shell );
		if ( dialog ) {
			dialog.scrollTop = 0;
		}
		content.focus( { preventScroll: this.type === 'drawer' } );
		if ( this.type === 'drawer' ) {
			const r = this.shell.getBoundingClientRect();
			if ( r.bottom > window.innerHeight || r.top < 0 ) {
				this.shell.scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
			}
		}
		this.root.dispatchEvent( new window.CustomEvent( 'bptm:open', { bubbles: true, detail: { id, type: this.type } } ) );
	}

	/**
	 * Place the inline drawer right after the last item of the clicked item's row and point its arrow at the item.
	 *
	 * @param {Element} item Clicked item.
	 */
	placeDrawer( item ) {
		if ( ! item ) {
			return;
		}
		const container = item.parentElement;
		const top = item.offsetTop;
		let last = item;
		let n = item.nextElementSibling;
		while ( n ) {
			if ( n !== this.shell && n.classList.contains( 'bptm-item' ) && ! n.hidden ) {
				if ( Math.abs( n.offsetTop - top ) > 2 ) {
					break;
				}
				last = n;
			}
			n = n.nextElementSibling;
		}
		if ( this.shell.parentElement !== container || this.shell.previousElementSibling !== last ) {
			last.insertAdjacentElement( 'afterend', this.shell );
		}
		const cr = container.getBoundingClientRect();
		const ir = item.getBoundingClientRect();
		const x = ir.left + ir.width / 2 - cr.left;
		this.shell.style.setProperty( '--bptm-drawer-arrow', Math.round( x ) + 'px' );
		this.drawerItem = item;
	}

	step( dir ) {
		const ids = this.ids();
		if ( ids.length < 2 ) {
			return;
		}
		let i = ids.indexOf( this.current );
		i = ( i + dir + ids.length ) % ids.length;
		const id = ids[ i ];
		const item = $( '.bptm-item[data-bptm-id="' + id + '"]:not(.bptm-clone)', this.root );
		this.open( id, item );
	}

	bindOutsideFocus() {
		this.onDocFocus = ( e ) => {
			if ( ! this.shell.hidden && ! this.shell.contains( e.target ) ) {
				const c = this.content();
				if ( c ) {
					c.focus();
				}
			}
		};
		document.addEventListener( 'focusin', this.onDocFocus );
		this.onDocKey = ( e ) => {
			if ( e.key === 'Escape' && ! this.shell.hidden ) {
				this.close();
			}
		};
		document.addEventListener( 'keydown', this.onDocKey );
	}

	/** Inline drawer: ESC closes it from anywhere on the page (focus may have left the drawer). */
	bindDrawerKey() {
		if ( this.onDrawerKey ) {
			document.removeEventListener( 'keydown', this.onDrawerKey );
		}
		this.onDrawerKey = ( e ) => {
			if ( e.key !== 'Escape' || e.defaultPrevented || this.shell.hidden ) {
				return;
			}
			// An open popup/panel above the page handles ESC itself.
			if ( document.querySelector( '.bptm-modal.is-open:not([hidden])' ) ) {
				return;
			}
			this.close();
		};
		document.addEventListener( 'keydown', this.onDrawerKey );
	}

	close() {
		if ( ! this.shell || this.shell.hidden || this.current === null ) {
			return;
		}
		const finish = () => {
			this.closeTimer = null;
			this.shell.hidden = true;
			this.restoreCurrent();
		};
		this.shell.classList.remove( 'is-open' );
		if ( this.type !== 'drawer' ) {
			unlockScroll();
			this.root.classList.remove( 'bptm-modal-open-host' );
			document.removeEventListener( 'focusin', this.onDocFocus );
			document.removeEventListener( 'keydown', this.onDocKey );
		} else if ( this.onDrawerKey ) {
			document.removeEventListener( 'keydown', this.onDrawerKey );
			this.onDrawerKey = null;
		}
		const dur = parseFloat( window.getComputedStyle( this.shell ).getPropertyValue( '--bptm-modal-speed' ) ) || 0;
		if ( dur > 0 && ! window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
			this.closeTimer = setTimeout( finish, dur );
		} else {
			finish();
		}
		$$( '.bptm-item.is-current', this.root ).forEach( ( el ) => el.classList.remove( 'is-current' ) );
		const back = this.lastFocus && this.lastFocus.isConnected ? this.lastFocus : $( '.bptm-item[data-bptm-id="' + this.current + '"] [data-bptm-open]', this.root );
		this.current = null;
		if ( back ) {
			back.focus( { preventScroll: true } );
		}
		this.root.dispatchEvent( new window.CustomEvent( 'bptm:close', { bubbles: true } ) );
	}

	/** Items were replaced (ajax): close and park the drawer back outside the items list. */
	reset() {
		if ( this.shell && ! this.shell.hidden ) {
			this.close();
		}
		if ( this.type === 'drawer' && this.shell && this.shell.parentElement && this.shell.parentElement.classList.contains( 'bptm-items' ) ) {
			this.shell.hidden = true;
			this.root.appendChild( this.shell );
		}
	}

	/** Re-place an open drawer after layout changes (resize / filter). */
	relayout() {
		if ( this.type === 'drawer' && this.shell && ! this.shell.hidden && this.drawerItem ) {
			if ( this.drawerItem.hidden || ! this.drawerItem.isConnected ) {
				this.close();
				return;
			}
			this.placeDrawer( this.drawerItem );
		}
	}
}
