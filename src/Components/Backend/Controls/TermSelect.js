/**
 * Multi-select of terms for one taxonomy. Stores an array of term IDs.
 */
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { FormTokenField, Spinner } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';

const TermSelect = ( { taxonomy, label, value, onChange, help } ) => {
	const { terms, isResolving } = useSelect( ( select ) => {
		const args = [ 'taxonomy', taxonomy, { per_page: -1, context: 'view', _fields: 'id,name,parent' } ];
		return {
			terms: select( coreStore ).getEntityRecords( ...args ),
			isResolving: select( coreStore ).isResolving( 'getEntityRecords', args ),
		};
	}, [ taxonomy ] );

	const list = Array.isArray( terms ) ? terms : [];
	const nameCount = {};
	list.forEach( ( t ) => {
		const n = decodeEntities( t.name );
		nameCount[ n ] = ( nameCount[ n ] || 0 ) + 1;
	} );
	const labelOf = ( t ) => {
		const n = decodeEntities( t.name );
		return nameCount[ n ] > 1 ? `${ n } (#${ t.id })` : n;
	};
	const byLabel = {};
	list.forEach( ( t ) => {
		byLabel[ labelOf( t ) ] = t.id;
	} );

	const ids = Array.isArray( value ) ? value.map( ( v ) => parseInt( v, 10 ) ).filter( ( v ) => ! Number.isNaN( v ) ) : [];
	const tokens = ids.map( ( id ) => {
		const t = list.find( ( x ) => x.id === id );
		return t ? labelOf( t ) : `#${ id }`;
	} );

	if ( ! terms && isResolving ) {
		return (
			<div className="bptm-ed-field">
				<span className="bptm-ed-label">{ label }</span> <Spinner />
			</div>
		);
	}

	return (
		<div className="bptm-ed-field bptm-ed-terms">
			<FormTokenField
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				__experimentalExpandOnFocus
				help=""
				label={ label }
				value={ tokens }
				suggestions={ list.map( labelOf ) }
				maxSuggestions={ 50 }
				placeholder={ list.length ? __( 'All — type to choose', 'bp-team-member' ) : __( 'No terms yet', 'bp-team-member' ) }
				onChange={ ( next ) => {
					const out = [];
					next.forEach( ( tok ) => {
						const str = 'object' === typeof tok ? tok.value : tok;
						let id = byLabel[ str ];
						if ( undefined === id ) {
							const m = String( str ).match( /^#(\d+)$/ );
							id = m ? parseInt( m[ 1 ], 10 ) : undefined;
						}
						if ( undefined !== id && ! out.includes( id ) ) {
							out.push( id );
						}
					} );
					onChange( out );
				} }
				__experimentalValidateInput={ ( tok ) => undefined !== byLabel[ tok ] }
			/>
			{ help && <p className="bptm-ed-muted">{ help }</p> }
			{ ! list.length && ! isResolving && (
				<p className="bptm-ed-muted">
					{ sprintf(
						/* translators: %s: taxonomy label */
						__( 'No %s terms found.', 'bp-team-member' ),
						label
					) }
				</p>
			) }
		</div>
	);
};

export default TermSelect;
