/**
 * Pagination UI (port of templates/partials/pagination.php): numbered links,
 * load-more button and the infinite-scroll sentinel. Paging itself is client-side state.
 */
import { createElement as h } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { t } from './bridge';

/**
 * Page link URL: the current URL with `var=n` (page 1 drops it); '?…' in the editor.
 *
 * @param {Object}  win      Window.
 * @param {string}  pageVar  Query var.
 * @param {number}  n        Page.
 * @param {boolean} isEditor Editor.
 * @return {string} URL.
 */
export const pageUrl = ( win, pageVar, n, isEditor ) => {
	if ( isEditor || ! win || ! win.location || ! /^https?:$/.test( win.location.protocol ) ) {
		return 1 === n ? '?' : '?' + encodeURIComponent( pageVar ) + '=' + n;
	}
	try {
		const u = new win.URL( win.location.href );
		u.hash = '';
		u.searchParams.delete( pageVar );
		if ( n > 1 ) {
			u.searchParams.set( pageVar, String( n ) );
		}
		return u.toString();
	} catch ( e ) {
		return 1 === n ? '?' : '?' + encodeURIComponent( pageVar ) + '=' + n;
	}
};

export const Numbered = ( { page, max, pageVar, win, isEditor, onPage } ) => {
	const cur = Math.min( Math.max( 1, page ), Math.max( 1, max ) );
	const pages = [];
	for ( let i = 1; i <= max; i++ ) {
		if ( 1 === i || max === i || Math.abs( i - cur ) <= 1 ) {
			pages.push( i );
		} else if ( '…' !== pages[ pages.length - 1 ] ) {
			pages.push( '…' );
		}
	}
	const link = ( n, cls, extra, children ) =>
		h(
			'a',
			{
				className: cls,
				href: pageUrl( win, pageVar, n, isEditor ),
				'data-page': String( n ),
				onClick: ( e ) => {
					if ( e.metaKey || e.ctrlKey || e.shiftKey || 1 === e.button ) {
						return;
					}
					e.preventDefault();
					onPage( n, e.currentTarget );
				},
				...extra,
			},
			children
		);
	return h(
		'nav',
		{ className: 'bptm-pagination bptm-pagination--normal', 'aria-label': __( 'Team members pages', 'bp-team-member' ), hidden: max <= 1 },
		h(
			'ul',
			{ className: 'bptm-pages' },
			h(
				'li',
				null,
				cur > 1
					? link( cur - 1, 'bptm-page bptm-page-prev', { rel: 'prev', 'aria-label': t( 'prev' ) }, h( 'i', { className: 'fas fa-angle-left', 'aria-hidden': 'true' } ) )
					: h( 'span', { className: 'bptm-page bptm-page-prev is-disabled', 'aria-hidden': 'true' }, h( 'i', { className: 'fas fa-angle-left' } ) )
			),
			pages.map( ( p, i ) =>
				h(
					'li',
					{ key: i },
					'…' === p
						? h( 'span', { className: 'bptm-page bptm-page-dots', 'aria-hidden': 'true' }, '…' )
						: p === cur
							? h( 'span', { className: 'bptm-page is-current', 'aria-current': 'page' }, String( p ) )
							: link( p, 'bptm-page', {}, String( p ) )
				)
			),
			h(
				'li',
				null,
				cur < max
					? link( cur + 1, 'bptm-page bptm-page-next', { rel: 'next', 'aria-label': t( 'next' ) }, h( 'i', { className: 'fas fa-angle-right', 'aria-hidden': 'true' } ) )
					: h( 'span', { className: 'bptm-page bptm-page-next is-disabled', 'aria-hidden': 'true' }, h( 'i', { className: 'fas fa-angle-right' } ) )
			)
		)
	);
};

export const LoadMore = ( { text, more, onMore } ) =>
	h(
		'div',
		{ className: 'bptm-loadmore-wrap', hidden: ! more },
		h(
			'button',
			{
				type: 'button',
				className: 'bptm-loadmore',
				onClick: ( e ) => {
					e.preventDefault();
					onMore();
				},
			},
			h( 'span', { className: 'bptm-loadmore-text' }, text ),
			h( 'span', { className: 'bptm-spinner', 'aria-hidden': 'true' } )
		)
	);

export const Infinite = ( { more, sentinelRef } ) =>
	h(
		'div',
		{ className: 'bptm-infinite', hidden: ! more, ref: sentinelRef },
		h( 'span', { className: 'bptm-spinner', 'aria-hidden': 'true' } ),
		h( 'span', { className: 'screen-reader-text' }, __( 'Loading more members', 'bp-team-member' ) )
	);
