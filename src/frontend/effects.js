/**
 * Item effects: scroll-in animation, tap-to-flip on touch devices, equal details height, scrollable descriptions.
 */
import { $$, reducedMotion } from './utils';

let io = null;

/**
 * Scroll animation (IntersectionObserver): `.bptm-anim` items get `.bptm-in` when they enter the viewport.
 *
 * @param {Element[]} items Items.
 */
export function animate( items ) {
	const list = items.filter( ( el ) => el.classList.contains( 'bptm-anim' ) && ! el.classList.contains( 'bptm-in' ) );
	if ( ! list.length ) {
		return;
	}
	if ( reducedMotion() || typeof window.IntersectionObserver !== 'function' ) {
		list.forEach( ( el ) => el.classList.add( 'bptm-in' ) );
		return;
	}
	if ( ! io ) {
		io = new window.IntersectionObserver(
			( entries ) => {
				let n = 0;
				entries.forEach( ( en ) => {
					if ( en.isIntersecting ) {
						const el = en.target;
						el.style.setProperty( '--bptm-anim-delay', Math.min( n, 8 ) * 70 + 'ms' );
						n++;
						el.classList.add( 'bptm-in' );
						io.unobserve( el );
					}
				} );
			},
			{ rootMargin: '0px 0px -40px 0px', threshold: 0.05 }
		);
	}
	list.forEach( ( el ) => io.observe( el ) );
}

/**
 * Touch devices have no hover: first tap on a flip card flips it, links inside stay usable once flipped.
 *
 * @param {Element} root Root.
 */
export function bindFlip( root ) {
	const flipGroup = root.classList.contains( 'bptm-group-flip' );
	// Grid / circle themes reveal hover content (social icons on the photo) on tap via `.bptm-tap-reveal`.
	if ( ! flipGroup && ! root.querySelector( '.bptm-tap-reveal' ) ) {
		return;
	}
	const coarse = () => typeof window.matchMedia === 'function' && window.matchMedia( '(hover: none)' ).matches;
	root.addEventListener( 'click', ( e ) => {
		const item = e.target.closest( '.bptm-item' );
		if ( ! item || ! root.contains( item ) || ! coarse() ) {
			return;
		}
		if ( ! flipGroup && ! item.classList.contains( 'bptm-tap-reveal' ) ) {
			return;
		}
		if ( ! item.classList.contains( 'is-flipped' ) ) {
			// First tap flips instead of following a link.
			e.preventDefault();
			e.stopPropagation();
			$$( '.bptm-item.is-flipped', root ).forEach( ( el ) => el.classList.remove( 'is-flipped' ) );
			item.classList.add( 'is-flipped' );
		} else if ( ! e.target.closest( 'a, button' ) ) {
			item.classList.remove( 'is-flipped' );
		}
	}, true );
	root.addEventListener( 'keydown', ( e ) => {
		const item = e.target.closest( '.bptm-item' );
		if ( flipGroup && item && ( e.key === 'Enter' || e.key === ' ' ) && e.target === item ) {
			e.preventDefault();
			item.classList.toggle( 'is-flipped' );
		}
	} );
}

/**
 * Equalise description area heights across visible items (per row of the grid).
 *
 * @param {Element} root Root.
 */
export function equalize( root ) {
	if ( ! root.classList.contains( 'bptm-equal-details' ) ) {
		return;
	}
	// Rows are grouped by the item's offsetTop; in a carousel every slide is equalised.
	const carousel = root.classList.contains( 'bptm-view-carousel' );
	const rows = new Map();
	$$( '.bptm-items > .bptm-item', root ).forEach( ( it ) => {
		const el = it.hidden ? null : it.querySelector( '.bptm-details' );
		if ( ! el ) {
			return;
		}
		el.style.minHeight = '';
		const key = carousel ? 0 : it.offsetTop;
		if ( ! rows.has( key ) ) {
			rows.set( key, [] );
		}
		rows.get( key ).push( el );
	} );
	rows.forEach( ( row ) => {
		const max = Math.max( ...row.map( ( el ) => el.offsetHeight ) );
		if ( max > 0 && row.length > 1 ) {
			row.forEach( ( el ) => {
				el.style.minHeight = max + 'px';
			} );
		}
	} );
}

/**
 * Scroll-controlled descriptions that overflow get keyboard access and a shadow hint.
 *
 * @param {Element[]} scope Elements to search.
 */
export function scrollables( scope ) {
	scope.forEach( ( ctx ) => {
		$$( '.bptm-details.bptm-scroll', ctx ).forEach( ( el ) => {
			const over = el.scrollHeight > el.clientHeight + 2;
			el.classList.toggle( 'is-scrollable', over );
			if ( over ) {
				el.setAttribute( 'tabindex', '0' );
				if ( ! el.dataset.bptmScrollBound ) {
					el.dataset.bptmScrollBound = '1';
					el.addEventListener(
						'scroll',
						() => el.classList.toggle( 'is-end', el.scrollTop + el.clientHeight >= el.scrollHeight - 2 ),
						{ passive: true }
					);
				}
			} else {
				el.removeAttribute( 'tabindex' );
			}
		} );
	} );
}
