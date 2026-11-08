/**
 * Carousel engine (port of the former vanilla carousel): responsive slides per view, autoplay with
 * hover / focus pause, loop (clones) or rewind, speed, timeout, items to scroll, navs, dots, swipe,
 * keyboard. React renders the slides and their clones; the engine only measures, translates the track
 * and keeps classes / attributes in sync. Everything uses the element's own window / document, so it
 * works inside the block editor canvas iframe.
 */
import { useLayoutEffect, useRef, useState } from '@wordpress/element';

const sprintf = ( str, n ) => String( str || '' ).replace( /%d|%s/, String( n ) );

const debounce = ( win, fn, wait ) => {
	let tm;
	const f = ( ...args ) => {
		win.clearTimeout( tm );
		tm = win.setTimeout( () => fn( ...args ), wait );
	};
	f.cancel = () => win.clearTimeout( tm );
	return f;
};

export const deviceKey = ( win ) => {
	const w = win.innerWidth || win.document.documentElement.clientWidth;
	if ( w >= 1025 ) {
		return 'd';
	}
	if ( w >= 768 ) {
		return 't';
	}
	if ( w >= 576 ) {
		return 'mp';
	}
	return 'm';
};

class Engine {
	constructor( stage, cfg, i18n, onClones ) {
		this.stage = stage;
		this.doc = stage.ownerDocument;
		this.win = this.doc.defaultView || window;
		this.cfg = cfg;
		this.i18n = i18n || {};
		this.onClones = onClones;
		this.index = 0;
		this.pos = 0;
		this.clones = 0;
		this.hovering = false;
		this.focused = false;
		this.timer = null;
		this.sig = '';
		this.dotsCount = -1;
		this.bind();
	}

	get viewport() {
		return this.stage.querySelector( '.bptm-carousel-viewport' );
	}

	get track() {
		return this.stage.querySelector( '.bptm-carousel-track' );
	}

	slides() {
		const tr = this.track;
		return tr ? Array.from( tr.children ).filter( ( el ) => el.classList.contains( 'bptm-item' ) && ! el.classList.contains( 'bptm-clone' ) ) : [];
	}

	perView() {
		const c = this.cfg.cols || {};
		const v = Math.max( 1, parseInt( c[ deviceKey( this.win ) ], 10 ) || 1 );
		const vp = this.viewport;
		const width = vp ? vp.clientWidth : 0;
		if ( ! width ) {
			return v;
		}
		const min = this.minSlideWidth();
		const gap = this.gapPx();
		const fit = Math.floor( ( width + gap ) / ( min + gap ) );
		return Math.max( 1, Math.min( v, fit ) );
	}

	minSlideWidth() {
		const style = this.win.getComputedStyle( this.stage.closest( '.bptm-wrap' ) || this.stage );
		const raw = style.getPropertyValue( '--bptm-carousel-min' ).trim() || style.getPropertyValue( '--bptm-min-col' ).trim();
		const px = raw ? this.toPx( raw ) : 0;
		return px > 0 ? px : 150;
	}

	toPx( value ) {
		const m = /^(-?[\d.]+)(px|rem|em)?$/i.exec( value );
		if ( m ) {
			const n = parseFloat( m[ 1 ] );
			const unit = ( m[ 2 ] || 'px' ).toLowerCase();
			if ( 'px' === unit ) {
				return n;
			}
			const el = 'rem' === unit ? this.doc.documentElement : this.stage;
			return n * ( parseFloat( this.win.getComputedStyle( el ).fontSize ) || 16 );
		}
		const probe = this.doc.createElement( 'div' );
		probe.style.cssText = 'position:absolute;visibility:hidden;height:0;padding:0;border:0;width:' + value;
		this.viewport.appendChild( probe );
		const w = probe.getBoundingClientRect().width;
		probe.remove();
		return w;
	}

	get active() {
		return this.count > this.pv;
	}

	get step() {
		return Math.max( 1, Math.min( parseInt( this.cfg.scroll, 10 ) || 1, this.pv ) );
	}

	get loop() {
		return !! this.cfg.loop && this.active;
	}

	get maxIndex() {
		return Math.max( 0, this.count - this.pv );
	}

	/**
	 * Called after every React commit. Re-measures; when the layout changed, asks React for the right
	 * number of clones (returns false while a re-render is pending) and re-positions.
	 *
	 * @param {number} rendered Clones currently rendered on each side.
	 * @return {boolean} Settled.
	 */
	sync( rendered ) {
		this.count = this.slides().length;
		this.pv = this.perView();
		const need = this.loop ? this.pv + this.step : 0;
		if ( need !== rendered ) {
			this.onClones( need );
			return false;
		}
		this.clones = rendered;
		const sig = [ this.count, this.pv, this.clones, JSON.stringify( this.cfg ) ].join( '|' );
		this.stage.classList.toggle( 'is-static', ! this.active );
		this.stage.style.setProperty( '--bptm-per-view', String( this.pv ) );
		if ( sig !== this.sig ) {
			this.sig = sig;
			this.index = Math.min( this.index, this.loop ? this.count - 1 : this.maxIndex );
			this.buildDots();
			this.go( this.index, false );
			this.restart();
		} else {
			this.updateUI();
		}
		return true;
	}

	bind() {
		const s = this.stage;
		this.onPrev = () => {
			this.prev();
			this.restart();
		};
		this.onNext = () => {
			this.next();
			this.restart();
		};
		this.onClick = ( e ) => {
			if ( e.target.closest( '.bptm-nav-prev' ) ) {
				this.onPrev();
			} else if ( e.target.closest( '.bptm-nav-next' ) ) {
				this.onNext();
			} else {
				const dot = e.target.closest( '.bptm-dot' );
				if ( dot && dot.parentElement && dot.parentElement.classList.contains( 'bptm-carousel-dots' ) ) {
					const p = Array.from( dot.parentElement.children ).indexOf( dot );
					this.go( this.loop ? p * this.step : Math.min( p * this.step, this.maxIndex ) );
					this.restart();
				}
			}
		};
		this.onTransitionEnd = ( e ) => {
			if ( e.target === this.track && 'transform' === e.propertyName ) {
				this.settle();
			}
		};
		this.onEnter = () => {
			this.hovering = true;
		};
		this.onLeave = () => {
			this.hovering = false;
		};
		this.onFocusIn = () => {
			this.focused = true;
		};
		this.onFocusOut = ( e ) => {
			if ( ! s.contains( e.relatedTarget ) ) {
				this.focused = false;
			}
		};
		this.onKey = ( e ) => {
			if ( e.target.matches && e.target.matches( 'input, select, textarea' ) ) {
				return;
			}
			const rtl = this.isRTL();
			if ( 'ArrowLeft' === e.key ) {
				e.preventDefault();
				( rtl ? this.onNext : this.onPrev )();
			} else if ( 'ArrowRight' === e.key ) {
				e.preventDefault();
				( rtl ? this.onPrev : this.onNext )();
			}
		};
		s.addEventListener( 'click', this.onClick );
		s.addEventListener( 'transitionend', this.onTransitionEnd );
		s.addEventListener( 'mouseenter', this.onEnter );
		s.addEventListener( 'mouseleave', this.onLeave );
		s.addEventListener( 'focusin', this.onFocusIn );
		s.addEventListener( 'focusout', this.onFocusOut );
		s.addEventListener( 'keydown', this.onKey );
		this.bindSwipe();

		let rw = this.win.innerWidth;
		this.onResize = () => {
			if ( ! s.isConnected ) {
				return;
			}
			const pv = this.perView();
			if ( pv !== this.pv ) {
				this.sig = '';
				this.sync( this.clones );
			} else if ( this.win.innerWidth !== rw ) {
				this.go( this.index, false );
			}
			rw = this.win.innerWidth;
		};
		if ( 'function' === typeof this.win.ResizeObserver ) {
			this.ro = new this.win.ResizeObserver( () => this.onResize() );
			this.ro.observe( this.viewport );
		}
		this.onWinResize = debounce( this.win, () => this.onResize(), 120 );
		this.win.addEventListener( 'resize', this.onWinResize );
		this.mqls = [];
		if ( 'function' === typeof this.win.matchMedia ) {
			[ '(min-width: 1025px)', '(min-width: 768px)', '(min-width: 576px)' ].forEach( ( q ) => {
				const mql = this.win.matchMedia( q );
				if ( 'function' === typeof mql.addEventListener ) {
					mql.addEventListener( 'change', this.onWinResize );
				}
				this.mqls.push( mql );
			} );
		}
		this.onVisibility = () => {
			if ( this.doc.hidden ) {
				this.stop();
			} else {
				this.restart();
			}
		};
		this.doc.addEventListener( 'visibilitychange', this.onVisibility );
	}

	bindSwipe() {
		const vp = this.viewport;
		let startX = 0;
		let startY = 0;
		let dx = 0;
		let dragging = false;
		let moved = false;
		let pid = null;
		this.onDown = ( e ) => {
			if ( ! this.active || ( 'mouse' === e.pointerType && 0 !== e.button ) ) {
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
		this.onMove = ( e ) => {
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
		this.onUp = () => {
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
			const block = ( ev ) => {
				ev.preventDefault();
				ev.stopPropagation();
			};
			this.viewport.addEventListener( 'click', block, { capture: true, once: true } );
			this.win.setTimeout( () => this.viewport && this.viewport.removeEventListener( 'click', block, { capture: true } ), 50 );
		};
		this.onDragStart = ( e ) => e.preventDefault();
		vp.addEventListener( 'pointerdown', this.onDown );
		vp.addEventListener( 'pointermove', this.onMove );
		vp.addEventListener( 'pointerup', this.onUp );
		vp.addEventListener( 'pointercancel', this.onUp );
		vp.addEventListener( 'dragstart', this.onDragStart );
		this.swipeVp = vp;
	}

	isRTL() {
		return 'rtl' === this.win.getComputedStyle( this.stage ).direction;
	}

	slideWidth() {
		const first = this.track && this.track.firstElementChild;
		return first ? first.getBoundingClientRect().width : 0;
	}

	gapPx() {
		const tr = this.track;
		const g = tr ? parseFloat( this.win.getComputedStyle( tr ).columnGap ) : NaN;
		return isNaN( g ) ? Number( this.cfg.gap ) || 0 : g;
	}

	offsetFor( pos ) {
		const px = pos * ( this.slideWidth() + this.gapPx() );
		return this.isRTL() ? px : -px;
	}

	reduced() {
		return 'function' === typeof this.win.matchMedia && this.win.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	}

	translate( x, animate ) {
		const tr = this.track;
		if ( ! tr ) {
			return;
		}
		const speed = this.reduced() ? 0 : Math.max( 0, parseInt( this.cfg.speed, 10 ) || 0 );
		tr.style.transitionDuration = animate ? speed + 'ms' : '0ms';
		tr.style.transform = 'translate3d(' + x + 'px,0,0)';
		if ( animate && 0 === speed ) {
			this.win.requestAnimationFrame( () => this.settle() );
		}
	}

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
			const max = this.count + this.clones - this.pv;
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

	settle() {
		if ( ! this.loop ) {
			return;
		}
		if ( this.index < 0 || this.index >= this.count ) {
			const norm = ( ( this.index % this.count ) + this.count ) % this.count;
			this.go( norm, false );
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
			this.go( 0 );
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

	/** Dots live in a React-rendered, childless container: React never touches its children. */
	buildDots() {
		const dots = this.stage.querySelector( '.bptm-carousel-dots' );
		if ( ! dots ) {
			return;
		}
		const pages = this.pageCount();
		dots.hidden = pages <= 1;
		if ( pages === this.dotsCount && dots.children.length === pages ) {
			return;
		}
		this.dotsCount = pages;
		dots.textContent = '';
		for ( let p = 0; p < pages; p++ ) {
			const b = this.doc.createElement( 'button' );
			b.type = 'button';
			b.className = 'bptm-dot';
			b.setAttribute( 'role', 'tab' );
			b.setAttribute( 'aria-label', sprintf( this.i18n.slide || 'Go to slide %d', p + 1 ) );
			dots.appendChild( b );
		}
	}

	updateUI() {
		const navs = this.stage.querySelector( '.bptm-carousel-navs' );
		if ( navs ) {
			navs.hidden = ! this.active;
		}
		const dots = this.stage.querySelector( '.bptm-carousel-dots' );
		if ( dots ) {
			dots.hidden = this.pageCount() <= 1;
			const page = this.currentPage();
			Array.from( dots.children ).forEach( ( d, p ) => {
				const on = p === page;
				d.classList.toggle( 'is-active', on );
				d.setAttribute( 'aria-selected', on ? 'true' : 'false' );
			} );
		}
		const tr = this.track;
		if ( ! tr ) {
			return;
		}
		Array.from( tr.children ).forEach( ( el, k ) => {
			if ( ! el.classList.contains( 'bptm-item' ) ) {
				return;
			}
			const visible = k >= this.pos && k < this.pos + this.pv;
			el.classList.toggle( 'is-visible', visible );
			if ( el.classList.contains( 'bptm-clone' ) ) {
				el.setAttribute( 'inert', '' );
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

	stop() {
		if ( this.timer ) {
			this.win.clearInterval( this.timer );
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
		this.timer = this.win.setInterval( () => {
			if ( ! this.stage.isConnected ) {
				this.stop();
				return;
			}
			if ( this.doc.hidden || this.focused || ( this.cfg.hoverPause && this.hovering ) || this.stage.closest( '.bptm-modal-open-host' ) ) {
				return;
			}
			this.next();
		}, timeout + speed );
	}

	destroy() {
		this.stop();
		const s = this.stage;
		s.removeEventListener( 'click', this.onClick );
		s.removeEventListener( 'transitionend', this.onTransitionEnd );
		s.removeEventListener( 'mouseenter', this.onEnter );
		s.removeEventListener( 'mouseleave', this.onLeave );
		s.removeEventListener( 'focusin', this.onFocusIn );
		s.removeEventListener( 'focusout', this.onFocusOut );
		s.removeEventListener( 'keydown', this.onKey );
		const vp = this.swipeVp;
		if ( vp ) {
			vp.removeEventListener( 'pointerdown', this.onDown );
			vp.removeEventListener( 'pointermove', this.onMove );
			vp.removeEventListener( 'pointerup', this.onUp );
			vp.removeEventListener( 'pointercancel', this.onUp );
			vp.removeEventListener( 'dragstart', this.onDragStart );
		}
		if ( this.ro ) {
			this.ro.disconnect();
		}
		this.onWinResize.cancel();
		this.win.removeEventListener( 'resize', this.onWinResize );
		this.mqls.forEach( ( mql ) => 'function' === typeof mql.removeEventListener && mql.removeEventListener( 'change', this.onWinResize ) );
		this.doc.removeEventListener( 'visibilitychange', this.onVisibility );
	}
}

/**
 * Carousel hook: returns the number of clones React must render on each side.
 *
 * @param {Object}  ref     Ref of the `.bptm-carousel` stage element.
 * @param {boolean} enabled View is carousel.
 * @param {Object}  cfg     Engine config.
 * @param {Object}  i18n    Strings.
 * @return {number} Clones per side.
 */
export const useCarousel = ( ref, enabled, cfg, i18n ) => {
	const [ clones, setClones ] = useState( 0 );
	const engine = useRef( null );
	const clonesRef = useRef( clones );
	clonesRef.current = clones;

	// Create / destroy with the stage element.
	useLayoutEffect( () => {
		if ( ! enabled || ! ref.current ) {
			return undefined;
		}
		const eng = new Engine( ref.current, cfg, i18n, ( n ) => {
			if ( n !== clonesRef.current ) {
				setClones( n );
			}
		} );
		engine.current = eng;
		return () => {
			eng.destroy();
			engine.current = null;
		};
	}, [ enabled ] );

	// After every commit: keep config current and re-sync (cheap when nothing changed).
	useLayoutEffect( () => {
		const eng = engine.current;
		if ( ! eng || ! enabled ) {
			return;
		}
		eng.cfg = cfg;
		eng.i18n = i18n;
		if ( eng.stage !== ref.current && ref.current ) {
			eng.destroy();
			engine.current = new Engine( ref.current, cfg, i18n, eng.onClones );
		}
		engine.current.sync( clonesRef.current );
	} );

	return enabled ? clones : 0;
};
