/**
 * Vanilla carousel: responsive columns per breakpoint, autoplay with hover/focus pause, infinite loop
 * (cloned slides) or rewind, configurable speed / timeout / items to scroll, navs, dots, swipe and keyboard.
 */
import { $, $$, deviceKey, reducedMotion, sprintf } from './utils';

export default class Carousel {
	/**
	 * @param {Element} stage    `.bptm-carousel` element.
	 * @param {Object}  cfg      `config.carousel` from PHP.
	 * @param {Object}  i18n     Strings.
	 */
	constructor( stage, cfg, i18n ) {
		this.stage = stage;
		this.cfg = Object.assign(
			{ autoplay: true, hoverPause: true, loop: true, speed: 1000, timeout: 2500, scroll: 1, navs: true, dots: true, cols: { d: 4, t: 3, mp: 2, m: 1 }, gap: 30 },
			cfg || {}
		);
		this.i18n = i18n || {};
		this.viewport = $( '.bptm-carousel-viewport', stage );
		this.track = $( '.bptm-carousel-track', stage );
		this.prevBtn = $( '.bptm-nav-prev', stage );
		this.nextBtn = $( '.bptm-nav-next', stage );
		this.dotsEl = $( '.bptm-carousel-dots', stage );
		this.slides = $$( ':scope > .bptm-item', this.track );
		this.count = this.slides.length;
		this.index = 0;
		this.pos = 0;
		this.clones = 0;
		this.paused = false;
		this.hovering = false;
		this.focused = false;
		this.timer = null;
		this.busy = false;

		if ( ! this.viewport || ! this.track || ! this.count ) {
			return;
		}
		this.bind();
		this.setup();
	}

	get perView() {
		const c = this.cfg.cols || {};
		const v = parseInt( c[ deviceKey() ], 10 ) || 1;
		return Math.max( 1, v );
	}

	get active() {
		return this.count > this.perViewCached;
	}

	get step() {
		return Math.max( 1, Math.min( parseInt( this.cfg.scroll, 10 ) || 1, this.perViewCached ) );
	}

	get loop() {
		return !! this.cfg.loop && this.active;
	}

	get maxIndex() {
		return Math.max( 0, this.count - this.perViewCached );
	}

	/* ------------------------------------------------------------------ */

	setup() {
		this.perViewCached = this.perView;
		this.removeClones();
		this.stage.classList.toggle( 'is-static', ! this.active );
		this.stage.style.setProperty( '--bptm-per-view', String( this.perViewCached ) );

		if ( this.loop ) {
			this.addClones();
		}
		this.index = Math.min( this.index, this.loop ? this.count - 1 : this.maxIndex );
		this.buildDots();
		this.go( this.index, false );
		this.restart();
	}

	removeClones() {
		$$( ':scope > .bptm-clone', this.track ).forEach( ( el ) => el.remove() );
		this.clones = 0;
	}

	cloneOf( el ) {
		const c = el.cloneNode( true );
		c.classList.add( 'bptm-clone' );
		c.setAttribute( 'aria-hidden', 'true' );
		c.removeAttribute( 'id' );
		c.removeAttribute( 'itemscope' );
		c.removeAttribute( 'itemtype' );
		$$( '[id]', c ).forEach( ( n ) => n.removeAttribute( 'id' ) );
		$$( '[itemprop]', c ).forEach( ( n ) => n.removeAttribute( 'itemprop' ) );
		c.setAttribute( 'inert', '' );
		return c;
	}

	addClones() {
		const n = this.perViewCached + this.step;
		this.clones = n;
		const before = document.createDocumentFragment();
		const after = document.createDocumentFragment();
		for ( let k = 0; k < n; k++ ) {
			const bi = ( ( ( this.count - n + k ) % this.count ) + this.count ) % this.count;
			before.appendChild( this.cloneOf( this.slides[ bi ] ) );
			after.appendChild( this.cloneOf( this.slides[ k % this.count ] ) );
		}
		this.track.insertBefore( before, this.track.firstChild );
		this.track.appendChild( after );
	}

	/* ------------------------------------------------------------------ */

	bind() {
		this.onPrev = () => {
			this.prev();
			this.restart();
		};
		this.onNext = () => {
			this.next();
			this.restart();
		};
		if ( this.prevBtn ) {
			this.prevBtn.addEventListener( 'click', this.onPrev );
		}
		if ( this.nextBtn ) {
			this.nextBtn.addEventListener( 'click', this.onNext );
		}

		this.track.addEventListener( 'transitionend', ( e ) => {
			if ( e.target === this.track && e.propertyName === 'transform' ) {
				this.settle();
			}
		} );

		this.stage.addEventListener( 'mouseenter', () => {
			this.hovering = true;
		} );
		this.stage.addEventListener( 'mouseleave', () => {
			this.hovering = false;
		} );
		this.stage.addEventListener( 'focusin', () => {
			this.focused = true;
		} );
		this.stage.addEventListener( 'focusout', ( e ) => {
			if ( ! this.stage.contains( e.relatedTarget ) ) {
				this.focused = false;
			}
		} );
		this.stage.addEventListener( 'keydown', ( e ) => {
			if ( e.target.matches( 'input, select, textarea' ) ) {
				return;
			}
			const rtl = this.isRTL();
			if ( e.key === 'ArrowLeft' ) {
				e.preventDefault();
				( rtl ? this.onNext : this.onPrev )();
			} else if ( e.key === 'ArrowRight' ) {
				e.preventDefault();
				( rtl ? this.onPrev : this.onNext )();
			}
		} );

		this.bindSwipe();

		let rw = window.innerWidth;
		this.onResize = () => {
			if ( ! this.stage.isConnected ) {
				return;
			}
			const pv = this.perView;
			if ( pv !== this.perViewCached ) {
				this.setup();
			} else if ( window.innerWidth !== rw ) {
				this.go( this.index, false );
			}
			rw = window.innerWidth;
		};
		if ( typeof window.ResizeObserver === 'function' ) {
			this.ro = new window.ResizeObserver( () => this.onResize() );
			this.ro.observe( this.viewport );
		} else {
			window.addEventListener( 'resize', this.onResize );
		}
		document.addEventListener( 'visibilitychange', () => {
			if ( document.hidden ) {
				this.stop();
			} else {
				this.restart();
			}
		} );
	}

	bindSwipe() {
		let startX = 0;
		let startY = 0;
		let dx = 0;
		let dragging = false;
		let moved = false;
		let pid = null;

		const down = ( e ) => {
			if ( ! this.active || ( e.pointerType === 'mouse' && e.button !== 0 ) ) {
				return;
			}
			if ( e.target.closest( 'input, select, textarea, button' ) ) {
				return;
			}
			dragging = true;
			moved = false;
			dx = 0;
			startX = e.clientX;
			startY = e.clientY;
			pid = e.pointerId;
		};
		const move = ( e ) => {
			if ( ! dragging || e.pointerId !== pid ) {
				return;
			}
			const x = e.clientX - startX;
			const y = e.clientY - startY;
			if ( ! moved ) {
				if ( Math.abs( x ) < 6 ) {
					return;
				}
				if ( Math.abs( y ) > Math.abs( x ) ) {
					dragging = false;
					return;
				}
				moved = true;
				this.stage.classList.add( 'is-dragging' );
				try {
					this.viewport.setPointerCapture( pid );
				} catch ( err ) {
					// Ignore.
				}
			}
			dx = x;
			this.translate( this.offsetFor( this.pos ) + dx, false );
		};
		const up = () => {
			if ( ! dragging ) {
				return;
			}
			dragging = false;
			this.stage.classList.remove( 'is-dragging' );
			if ( ! moved ) {
				return;
			}
			const threshold = Math.min( 80, this.slideWidth() / 4 );
			const rtl = this.isRTL();
			if ( dx < -threshold ) {
				( rtl ? this.onPrev : this.onNext )();
			} else if ( dx > threshold ) {
				( rtl ? this.onNext : this.onPrev )();
			} else {
				this.go( this.index, true );
			}
			// Swallow the click that follows a drag.
			const block = ( ev ) => {
				ev.preventDefault();
				ev.stopPropagation();
			};
			this.viewport.addEventListener( 'click', block, { capture: true, once: true } );
			setTimeout( () => this.viewport.removeEventListener( 'click', block, { capture: true } ), 50 );
		};
		this.viewport.addEventListener( 'pointerdown', down );
		this.viewport.addEventListener( 'pointermove', move );
		this.viewport.addEventListener( 'pointerup', up );
		this.viewport.addEventListener( 'pointercancel', up );
		this.viewport.addEventListener( 'dragstart', ( e ) => e.preventDefault() );
	}

	isRTL() {
		return window.getComputedStyle( this.stage ).direction === 'rtl';
	}

	/* ------------------------------------------------------------------ */

	slideWidth() {
		const first = this.track.firstElementChild;
		return first ? first.getBoundingClientRect().width : 0;
	}

	gapPx() {
		const g = parseFloat( window.getComputedStyle( this.track ).columnGap );
		return isNaN( g ) ? Number( this.cfg.gap ) || 0 : g;
	}

	offsetFor( pos ) {
		const px = pos * ( this.slideWidth() + this.gapPx() );
		return this.isRTL() ? px : -px;
	}

	translate( x, animate ) {
		const speed = reducedMotion() ? 0 : Math.max( 0, parseInt( this.cfg.speed, 10 ) || 0 );
		this.track.style.transitionDuration = animate ? speed + 'ms' : '0ms';
		this.track.style.transform = 'translate3d(' + x + 'px,0,0)';
		if ( animate && speed === 0 ) {
			window.requestAnimationFrame( () => this.settle() );
		}
	}

	/**
	 * Move to a logical index.
	 *
	 * @param {number}  i       Index (may be out of range when looping).
	 * @param {boolean} animate Animate.
	 */
	go( i, animate = true ) {
		if ( ! this.active ) {
			this.index = 0;
			this.pos = 0;
			this.translate( 0, false );
			this.updateUI();
			return;
		}
		if ( this.loop ) {
			const min = -this.clones;
			const max = this.count + this.clones - this.perViewCached;
			i = Math.max( min, Math.min( max, i ) );
			this.pos = i + this.clones;
		} else {
			i = Math.max( 0, Math.min( this.maxIndex, i ) );
			this.pos = i;
		}
		this.index = i;
		this.translate( this.offsetFor( this.pos ), animate );
		this.updateUI();
	}

	/** After a transition: jump from clones back to the real slides. */
	settle() {
		if ( ! this.loop ) {
			return;
		}
		if ( this.index < 0 || this.index >= this.count ) {
			const norm = ( ( this.index % this.count ) + this.count ) % this.count;
			this.go( norm, false );
			// Force reflow so the next animated move starts from the normalised position.
			void this.track.offsetWidth; // eslint-disable-line no-void
		}
	}

	next() {
		if ( ! this.active ) {
			return;
		}
		if ( this.loop ) {
			this.settle();
			this.go( this.index + this.step );
		} else if ( this.index >= this.maxIndex ) {
			this.go( 0 ); // Rewind.
		} else {
			this.go( this.index + this.step );
		}
	}

	prev() {
		if ( ! this.active ) {
			return;
		}
		if ( this.loop ) {
			this.settle();
			this.go( this.index - this.step );
		} else if ( this.index <= 0 ) {
			this.go( this.maxIndex );
		} else {
			this.go( this.index - this.step );
		}
	}

	/* ------------------------------------------------------------------ */

	pageCount() {
		if ( ! this.active ) {
			return 0;
		}
		return this.loop ? Math.ceil( this.count / this.step ) : Math.ceil( this.maxIndex / this.step ) + 1;
	}

	currentPage() {
		if ( this.loop ) {
			const norm = ( ( this.index % this.count ) + this.count ) % this.count;
			return Math.min( this.pageCount() - 1, Math.floor( norm / this.step ) );
		}
		if ( this.index >= this.maxIndex ) {
			return this.pageCount() - 1;
		}
		return Math.floor( this.index / this.step );
	}

	buildDots() {
		if ( ! this.dotsEl ) {
			return;
		}
		this.dotsEl.innerHTML = '';
		const pages = this.pageCount();
		this.dotsEl.hidden = pages <= 1;
		for ( let p = 0; p < pages; p++ ) {
			const b = document.createElement( 'button' );
			b.type = 'button';
			b.className = 'bptm-dot';
			b.setAttribute( 'role', 'tab' );
			b.setAttribute( 'aria-label', sprintf( this.i18n.slide || 'Go to slide %d', p + 1 ) );
			b.addEventListener( 'click', () => {
				const target = this.loop ? p * this.step : Math.min( p * this.step, this.maxIndex );
				this.go( target );
				this.restart();
			} );
			this.dotsEl.appendChild( b );
		}
	}

	updateUI() {
		const navsWrap = $( '.bptm-carousel-navs', this.stage );
		if ( navsWrap ) {
			navsWrap.hidden = ! this.active;
		}
		const page = this.currentPage();
		if ( this.dotsEl ) {
			$$( '.bptm-dot', this.dotsEl ).forEach( ( d, p ) => {
				const on = p === page;
				d.classList.toggle( 'is-active', on );
				d.setAttribute( 'aria-selected', on ? 'true' : 'false' );
			} );
		}
		// Only visible slides are reachable by keyboard / screen readers.
		const all = $$( ':scope > .bptm-item', this.track );
		all.forEach( ( el, k ) => {
			const visible = k >= this.pos && k < this.pos + this.perViewCached;
			el.classList.toggle( 'is-visible', visible );
			if ( el.classList.contains( 'bptm-clone' ) ) {
				return;
			}
			if ( visible ) {
				el.removeAttribute( 'inert' );
				el.removeAttribute( 'aria-hidden' );
			} else {
				el.setAttribute( 'inert', '' );
				el.setAttribute( 'aria-hidden', 'true' );
			}
		} );
	}

	/* ------------------------------------------------------------------ */

	stop() {
		if ( this.timer ) {
			clearInterval( this.timer );
			this.timer = null;
		}
	}

	restart() {
		this.stop();
		if ( ! this.cfg.autoplay || ! this.active ) {
			return;
		}
		const timeout = Math.max( 500, parseInt( this.cfg.timeout, 10 ) || 2500 );
		const speed = Math.max( 0, parseInt( this.cfg.speed, 10 ) || 0 );
		this.timer = setInterval( () => {
			if ( ! this.stage.isConnected ) {
				this.destroy();
				return;
			}
			if ( document.hidden || this.focused || ( this.cfg.hoverPause && this.hovering ) || this.stage.closest( '.bptm-modal-open-host' ) ) {
				return;
			}
			this.next();
		}, timeout + speed );
	}

	destroy() {
		this.stop();
		if ( this.ro ) {
			this.ro.disconnect();
		} else if ( this.onResize ) {
			window.removeEventListener( 'resize', this.onResize );
		}
	}
}
