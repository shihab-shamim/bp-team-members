/**
 * Item effects: scroll-in animation, tap-to-reveal / flip on touch devices, equal description heights,
 * scrollable descriptions, Google font links. All use the root element's own window / document.
 */
import { useEffect, useLayoutEffect, useRef } from '@wordpress/element';

const winOf = ( el ) => ( el && el.ownerDocument && el.ownerDocument.defaultView ) || window;

/**
 * Scroll animation: `.bptm-anim` items get `.bptm-in` once they enter the viewport. Ids that already
 * animated are remembered (so re-renders keep them visible and never replay the animation).
 *
 * @param {Object} rootRef Root ref.
 * @param {Set}    seen    Ids that are in (mutable, owned by the component).
 */
export const useScrollAnimation = ( rootRef, seen ) => {
	const io = useRef( null );
	useLayoutEffect( () => {
		const root = rootRef.current;
		if ( ! root ) {
			return;
		}
		const items = Array.from( root.querySelectorAll( '.bptm-anim:not(.bptm-in)' ) );
		if ( ! items.length ) {
			return;
		}
		const win = winOf( root );
		const reduced = 'function' === typeof win.matchMedia && win.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		if ( reduced || 'function' !== typeof win.IntersectionObserver ) {
			items.forEach( ( el ) => {
				el.classList.add( 'bptm-in' );
				seen.add( el.getAttribute( 'data-bptm-id' ) );
			} );
			return;
		}
		if ( ! io.current ) {
			io.current = new win.IntersectionObserver(
				( entries ) => {
					let n = 0;
					entries.forEach( ( en ) => {
						if ( en.isIntersecting ) {
							const el = en.target;
							el.style.setProperty( '--bptm-anim-delay', Math.min( n, 8 ) * 70 + 'ms' );
							n++;
							el.classList.add( 'bptm-in' );
							seen.add( el.getAttribute( 'data-bptm-id' ) );
							io.current.unobserve( el );
						}
					} );
				},
				{ rootMargin: '0px 0px -40px 0px', threshold: 0.05 }
			);
		}
		items.forEach( ( el ) => io.current.observe( el ) );
	} );
	useEffect(
		() => () => {
			if ( io.current ) {
				io.current.disconnect();
				io.current = null;
			}
		},
		[]
	);
};

/**
 * Touch devices have no hover: the first tap on a flip / tap-reveal card reveals it, links stay usable once revealed.
 *
 * @param {Object} rootRef Root ref.
 */
export const useTapReveal = ( rootRef ) => {
	useEffect( () => {
		const root = rootRef.current;
		if ( ! root ) {
			return undefined;
		}
		const win = winOf( root );
		const coarse = () => 'function' === typeof win.matchMedia && win.matchMedia( '(hover: none)' ).matches;
		const onClick = ( e ) => {
			const flipGroup = root.classList.contains( 'bptm-group-flip' );
			const item = e.target.closest( '.bptm-item' );
			if ( ! item || ! root.contains( item ) || ! coarse() ) {
				return;
			}
			if ( ! flipGroup && ! item.classList.contains( 'bptm-tap-reveal' ) ) {
				return;
			}
			if ( ! item.classList.contains( 'is-flipped' ) ) {
				e.preventDefault();
				e.stopPropagation();
				root.querySelectorAll( '.bptm-item.is-flipped' ).forEach( ( el ) => el.classList.remove( 'is-flipped' ) );
				item.classList.add( 'is-flipped' );
			} else if ( ! e.target.closest( 'a, button' ) ) {
				item.classList.remove( 'is-flipped' );
			}
		};
		const onKey = ( e ) => {
			const item = e.target.closest && e.target.closest( '.bptm-item' );
			if ( root.classList.contains( 'bptm-group-flip' ) && item && ( 'Enter' === e.key || ' ' === e.key ) && e.target === item ) {
				e.preventDefault();
				item.classList.toggle( 'is-flipped' );
			}
		};
		root.addEventListener( 'click', onClick, true );
		root.addEventListener( 'keydown', onKey );
		return () => {
			root.removeEventListener( 'click', onClick, true );
			root.removeEventListener( 'keydown', onKey );
		};
	}, [ rootRef ] );
};

/** Equalise description heights across visible items (per grid row; every slide in a carousel). */
export const equalize = ( root ) => {
	if ( ! root || ! root.classList.contains( 'bptm-equal-details' ) ) {
		if ( root ) {
			root.querySelectorAll( '.bptm-items > .bptm-item .bptm-details' ).forEach( ( el ) => {
				if ( el.style.minHeight ) {
					el.style.minHeight = '';
				}
			} );
		}
		return;
	}
	const carousel = root.classList.contains( 'bptm-view-carousel' );
	const rows = new Map();
	root.querySelectorAll( '.bptm-items > .bptm-item' ).forEach( ( it ) => {
		const el = it.hidden ? null : it.querySelector( '.bptm-details' );
		if ( ! el ) {
			return;
		}
		el.style.minHeight = '';
		const k = carousel ? 0 : it.offsetTop;
		if ( ! rows.has( k ) ) {
			rows.set( k, [] );
		}
		rows.get( k ).push( el );
	} );
	rows.forEach( ( row ) => {
		const max = Math.max( ...row.map( ( el ) => el.offsetHeight ) );
		if ( max > 0 && row.length > 1 ) {
			row.forEach( ( el ) => {
				el.style.minHeight = max + 'px';
			} );
		}
	} );
};

/** Scroll-controlled descriptions that overflow get keyboard access and a shadow hint. */
export const scrollables = ( scope ) => {
	// Cards only (as before): not carousel clones, not popup / panel / drawer details.
	scope.querySelectorAll( '.bptm-item:not(.bptm-clone) .bptm-details.bptm-scroll' ).forEach( ( el ) => {
		if ( el.closest( '.bptm-drawer, .bptm-modal, .bptm-clone' ) ) {
			return;
		}
		const over = el.scrollHeight > el.clientHeight + 2;
		el.classList.toggle( 'is-scrollable', over );
		if ( over ) {
			el.setAttribute( 'tabindex', '0' );
			if ( ! el.bptmScrollBound ) {
				el.bptmScrollBound = true;
				el.addEventListener( 'scroll', () => el.classList.toggle( 'is-end', el.scrollTop + el.clientHeight >= el.scrollHeight - 2 ), { passive: true } );
			}
		} else {
			el.removeAttribute( 'tabindex' );
		}
	} );
};

/**
 * Layout helpers after every commit + on resize / load / font load.
 *
 * @param {Object}   rootRef Root ref.
 * @param {Function} extra   Extra callback on resize (drawer relayout).
 */
export const useLayoutHelpers = ( rootRef, extra ) => {
	const extraRef = useRef( extra );
	extraRef.current = extra;
	useLayoutEffect( () => {
		const root = rootRef.current;
		if ( root ) {
			scrollables( root );
			equalize( root );
		}
	} );
	useEffect( () => {
		const root = rootRef.current;
		if ( ! root ) {
			return undefined;
		}
		const win = winOf( root );
		let tm = 0;
		const run = () => {
			win.clearTimeout( tm );
			tm = win.setTimeout( () => {
				if ( ! root.isConnected ) {
					return;
				}
				equalize( root );
				scrollables( root );
				if ( extraRef.current ) {
					extraRef.current();
				}
			}, 150 );
		};
		win.addEventListener( 'resize', run );
		const onLoad = () => equalize( root );
		if ( 'complete' !== root.ownerDocument.readyState ) {
			win.addEventListener( 'load', onLoad, { once: true } );
		}
		// Lazy images / fonts change heights after the first paint.
		const onImg = ( e ) => {
			if ( e.target && 'IMG' === e.target.tagName ) {
				run();
			}
		};
		root.addEventListener( 'load', onImg, true );
		if ( root.ownerDocument.fonts && root.ownerDocument.fonts.ready ) {
			root.ownerDocument.fonts.ready.then( () => root.isConnected && equalize( root ) );
		}
		return () => {
			win.clearTimeout( tm );
			win.removeEventListener( 'resize', run );
			win.removeEventListener( 'load', onLoad );
			root.removeEventListener( 'load', onImg, true );
		};
	}, [ rootRef ] );
};

/**
 * Google Fonts stylesheet link in the root's document <head> (deduplicated by URL across blocks).
 *
 * @param {Object} rootRef Root ref.
 * @param {string} url     Stylesheet URL ('' = none).
 */
export const useFontLink = ( rootRef, url ) => {
	useEffect( () => {
		const root = rootRef.current;
		if ( ! root || ! url ) {
			return;
		}
		const doc = root.ownerDocument;
		let hsh = 0;
		for ( let i = 0; i < url.length; i++ ) {
			hsh = ( Math.imul( 31, hsh ) + url.charCodeAt( i ) ) | 0;
		}
		const id = 'bptm-gf-' + ( hsh >>> 0 ).toString( 16 ) + '-css';
		if ( doc.getElementById( id ) ) {
			return;
		}
		const link = doc.createElement( 'link' );
		link.rel = 'stylesheet';
		link.id = id;
		link.href = url;
		link.media = 'all';
		( doc.head || doc.documentElement ).appendChild( link );
	}, [ rootRef, url ] );
};
