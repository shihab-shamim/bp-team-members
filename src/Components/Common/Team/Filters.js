/**
 * Filter UI: category tabs, search inputs, dropdowns (single or accessible multi-select with ellipsis),
 * reset button and live status (ports of templates/partials/cat-filters.php + filters.php and the
 * former vanilla filter behaviour). State lives in TeamMembers; this component only renders it.
 */
import { createElement as h, useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import { t, termLabel } from './bridge';
import { designations, filterTerms } from './model';
import { htmlClass } from './sanitize';

export const SEARCHES = {
	search: [ 'searchByName', 'search_name' ],
	company: [ 'searchByCompany', 'search_company' ],
	zip: [ 'searchByZip', 'search_zip' ],
	tag: [ 'searchByTag', 'search_tag' ],
};

export const DROPDOWNS = {
	designation: [ 'filterByDesignation', '', 'field' ],
	location: [ 'filterByLocation', 'includeLocations', 'terms' ],
	language: [ 'filterByLanguage', 'includeLanguages', 'terms' ],
	gender: [ 'filterByGender', 'includeGenders', 'terms' ],
	specialty: [ 'filterBySpecialty', 'includeSpecialties', 'terms' ],
	extra_one: [ 'filterByExtraOne', 'includeExtraOne', 'terms' ],
	extra_two: [ 'filterByExtraTwo', 'includeExtraTwo', 'terms' ],
	extra_three: [ 'filterByExtraThree', 'includeExtraThree', 'terms' ],
	extra_four: [ 'filterByExtraFour', 'includeExtraFour', 'terms' ],
	extra_five: [ 'filterByExtraFive', 'includeExtraFive', 'terms' ],
};

export const FILTER_ORDER = [ 'search', 'company', 'zip', 'tag', 'designation', 'location', 'language', 'gender', 'specialty', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five' ];

/** Category tabs data. */
export const catTerms = ( atts, pool ) => filterTerms( 'group', atts, pool, 'includeGroups' );

/**
 * Controls to render: [{ type: search|select, key, label, options: [{ value, label, raw }] }].
 *
 * @param {Object}   atts Attributes.
 * @param {Object[]} pool Members.
 * @return {Object[]} Controls.
 */
export const filterControls = ( atts, pool ) => {
	const out = [];
	FILTER_ORDER.forEach( ( key ) => {
		if ( SEARCHES[ key ] ) {
			if ( atts[ SEARCHES[ key ][ 0 ] ] ) {
				out.push( { type: 'search', key, label: t( SEARCHES[ key ][ 1 ] ) } );
			}
			return;
		}
		const [ toggle, include, kind ] = DROPDOWNS[ key ];
		if ( ! atts[ toggle ] ) {
			return;
		}
		let options;
		let label;
		if ( 'field' === kind ) {
			options = designations( pool ).map( ( [ slug, lbl ] ) => ( { value: slug, label: lbl, raw: lbl } ) );
			label = t( 'filter_designation' );
		} else {
			options = filterTerms( key, atts, pool, include ).map( ( x ) => ( { value: x.slug, label: x.name, raw: x.slug } ) );
			label = t( key );
		}
		if ( options.length ) {
			out.push( { type: 'select', key, label, options } );
		}
	} );
	return out;
};

const MultiSelect = ( { id, label, options, value, onChange, ellipsis, openKey, setOpenKey, fieldKey } ) => {
	const wrapRef = useRef( null );
	const toggleRef = useRef( null );
	const open = openKey === fieldKey;
	const names = options.filter( ( o ) => value.includes( o.value ) ).map( ( o ) => o.label );
	let text = label;
	if ( names.length ) {
		text = ellipsis || names.length <= 2 ? names.join( ', ' ) : sprintf( /* translators: %d: number of selected options */ __( '%d selected', 'bp-team-member' ), names.length );
	}
	useEffect( () => {
		if ( ! open || ! wrapRef.current ) {
			return undefined;
		}
		const doc = wrapRef.current.ownerDocument;
		const onDoc = ( e ) => {
			if ( wrapRef.current && ! wrapRef.current.contains( e.target ) ) {
				setOpenKey( null );
			}
		};
		doc.addEventListener( 'click', onDoc );
		return () => doc.removeEventListener( 'click', onDoc );
	}, [ open, setOpenKey ] );
	return h(
		'div',
		{
			className: 'bptm-ms' + ( ellipsis ? ' bptm-ms--ellipsis' : '' ) + ( open ? ' is-open' : '' ),
			ref: wrapRef,
			onKeyDown: ( e ) => {
				if ( 'Escape' === e.key && open ) {
					e.stopPropagation();
					setOpenKey( null );
					if ( toggleRef.current ) {
						toggleRef.current.focus();
					}
				} else if ( 'ArrowDown' === e.key && ! open && e.target === toggleRef.current ) {
					e.preventDefault();
					setOpenKey( fieldKey );
					const w = wrapRef.current;
					( w.ownerDocument.defaultView || window ).requestAnimationFrame( () => {
						const first = w.querySelector( '.bptm-ms-menu input' );
						if ( first ) {
							first.focus();
						}
					} );
				}
			},
		},
		h(
			'button',
			{
				type: 'button',
				className: 'bptm-ms-toggle bptm-select',
				'aria-haspopup': 'listbox',
				'aria-expanded': open ? 'true' : 'false',
				'aria-controls': id + '-ms',
				'aria-label': label,
				title: names.length ? names.join( ', ' ) : undefined,
				ref: toggleRef,
				onClick: () => setOpenKey( open ? null : fieldKey ),
			},
			h( 'span', { className: 'bptm-ms-label' + ( names.length ? '' : ' is-placeholder' ) }, text ),
			h( 'i', { className: 'fas fa-angle-down bptm-ms-caret', 'aria-hidden': 'true' } )
		),
		h(
			'div',
			{ className: 'bptm-ms-menu', id: id + '-ms', role: 'group', 'aria-label': label, hidden: ! open },
			options.map( ( o, k ) =>
				h(
					'label',
					{ className: 'bptm-ms-option', key: o.value, style: { '--bptm-depth': '0' } },
					h( 'input', {
						type: 'checkbox',
						value: o.value,
						'data-index': String( k + 1 ),
						checked: value.includes( o.value ),
						onChange: ( e ) => onChange( e.target.checked ? [ ...value, o.value ] : value.filter( ( v ) => v !== o.value ) ),
					} ),
					h( 'span', null, o.label )
				)
			)
		)
	);
};

const SearchInput = ( { id, fieldKey, label, value, onChange, delay } ) => {
	const [ local, setLocal ] = useState( value );
	const timer = useRef( null );
	const ref = useRef( null );
	useEffect( () => {
		setLocal( value );
	}, [ value ] );
	useEffect( () => () => timer.current && clearTimeout( timer.current ), [] );
	const commit = ( v, now ) => {
		if ( timer.current ) {
			clearTimeout( timer.current );
		}
		if ( now ) {
			onChange( v );
			return;
		}
		timer.current = setTimeout( () => onChange( v ), delay );
	};
	return h( 'input', {
		type: 'search',
		id,
		className: 'bptm-search',
		'data-bptm-search': fieldKey,
		placeholder: label,
		autoComplete: 'off',
		ref,
		value: local,
		onChange: ( e ) => {
			setLocal( e.target.value );
			commit( e.target.value, false );
		},
		onKeyDown: ( e ) => {
			if ( 'Enter' === e.key ) {
				e.preventDefault();
				commit( e.target.value, true );
			}
		},
	} );
};

/**
 * Category tabs.
 *
 * @param {Object} props Props.
 * @return {Element|null} Tabs.
 */
export const CatFilters = ( { atts, terms, group, onGroup } ) => {
	if ( ! terms.length ) {
		return null;
	}
	const all = !! atts.filterAllEnabled;
	const style = htmlClass( atts.filterStyle || 'default' );
	const pos = htmlClass( atts.filterCatPosition || 'center' );
	const allText = String( atts.filterAllText || '' ).trim() ? atts.filterAllText : __( 'All', 'bp-team-member' );
	const items = [];
	if ( all ) {
		items.push( { slug: '*', name: allText } );
	}
	terms.forEach( ( x ) => items.push( x ) );
	return h(
		'nav',
		{ className: 'bptm-cats-wrap bptm-cats-pos-' + pos, 'aria-label': sprintf( /* translators: %s: group label */ __( 'Filter by %s', 'bp-team-member' ), termLabel( 'group' ) ) },
		h(
			'ul',
			{ className: 'bptm-cats bptm-cats--' + style },
			items.map( ( x ) => {
				const active = group === x.slug;
				return h(
					'li',
					{ className: 'bptm-cat-item' + ( active ? ' is-active' : '' ), key: x.slug },
					h(
						'button',
						{
							type: 'button',
							className: 'bptm-cat',
							'data-filter': x.slug,
							'aria-pressed': active ? 'true' : 'false',
							onClick: ( e ) => {
								e.preventDefault();
								onGroup( x.slug );
							},
						},
						h( 'span', null, x.name )
					)
				);
			} )
		)
	);
};

/**
 * Search / dropdown controls + reset + status.
 *
 * @param {Object} props Props.
 * @return {Element|null} Controls.
 */
export const FilterControls = ( { atts, uid, controls, state, onSelect, onSearch, onReset, resetVisible, status, ajax } ) => {
	const [ openKey, setOpenKey ] = useState( null );
	const multi = !! atts.enableMultiSelect;
	const reset = !! atts.enableClearFilters;
	if ( ! controls.length && ! reset ) {
		return null;
	}
	const cols = 'three' === atts.filterColumns ? 3 : 2;
	return h(
		'div',
		{ className: 'bptm-filters bptm-filter-cols-' + cols + ( multi ? ' bptm-filters--multi' : '' ), role: 'search' },
		controls.length
			? h(
				'div',
				{ className: 'bptm-filters-grid' },
				controls.map( ( c ) => {
					const fid = 'bptm-f-' + uid + '-' + c.key;
					let field;
					if ( 'search' === c.type ) {
						field = [
							h( 'span', { key: 'i', className: 'bptm-search-icon fas fa-magnifying-glass', 'aria-hidden': 'true' } ),
							h( SearchInput, { key: 's', id: fid, fieldKey: c.key, label: c.label, value: state.searches[ c.key ] || '', onChange: ( v ) => onSearch( c.key, v ), delay: ajax ? 350 : 120 } ),
						];
					} else {
						const value = state.selects[ c.key ] || [];
						const select = h(
							'select',
							{
								key: 'sel',
								id: fid,
								className: 'bptm-select',
								'data-bptm-filter': c.key,
								'data-placeholder': c.label,
								...( multi
									? { multiple: true, hidden: true, tabIndex: -1, value, onChange: () => {} }
									: { value: value[ 0 ] || '*', onChange: ( e ) => onSelect( c.key, '*' === e.target.value ? [] : [ e.target.value ] ) } ),
							},
							h( 'option', { value: '*' }, c.label ),
							c.options.map( ( o ) => h( 'option', { key: o.value, value: o.value, 'data-value': o.raw, 'data-depth': '0' }, o.label ) )
						);
						field = multi
							? [
								select,
								h( MultiSelect, {
									key: 'ms',
									id: fid,
									fieldKey: c.key,
									label: c.label,
									options: c.options,
									value,
									ellipsis: !! atts.multiSelectEllipsis,
									openKey,
									setOpenKey,
									onChange: ( v ) => onSelect( c.key, v ),
								} ),
							]
							: [ select ];
					}
					return h(
						'div',
						{ key: c.key, className: 'bptm-filter bptm-filter--' + c.type + ' bptm-filter-' + c.key.replace( /_/g, '-' ) },
						h( 'label', { className: 'screen-reader-text', htmlFor: multi && 'select' === c.type ? '' : fid }, c.label ),
						...field
					);
				} )
			)
			: null,
		reset
			? h(
				'div',
				{ className: 'bptm-reset-wrap' },
				h( 'button', { type: 'button', className: 'bptm-reset', hidden: ! resetVisible, onClick: onReset }, h( 'i', { className: 'fas fa-rotate-left', 'aria-hidden': 'true' } ), ' ', h( 'span', null, t( 'reset_filters' ) ) )
			)
			: null,
		h( 'div', { className: 'bptm-filter-status screen-reader-text', 'aria-live': 'polite' }, status )
	);
};
