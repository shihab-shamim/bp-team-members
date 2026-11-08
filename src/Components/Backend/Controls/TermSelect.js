/**
 * Token field of term NAMES (v2: terms are the comma-separated text values of the block's members).
 * Suggestions are the distinct values found in the members; legacy numeric term ids are ignored.
 */
import { FormTokenField } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const TermSelect = ( { label, value, suggestions = [], onChange, help } ) => {
	const tokens = ( Array.isArray( value ) ? value : [] )
		.filter( ( v ) => 'string' === typeof v && v.trim() && ! /^\d+$/.test( v.trim() ) );

	return (
		<div className="bptm-ed-field bptm-ed-terms">
			<FormTokenField
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				__experimentalExpandOnFocus
				label={ label }
				value={ tokens }
				suggestions={ suggestions }
				maxSuggestions={ 50 }
				placeholder={ suggestions.length ? __( 'All — type to choose', 'bp-team-member' ) : __( 'No values in the members yet', 'bp-team-member' ) }
				// Only values that exist in the members can be chosen (anything else would match nobody).
				__experimentalValidateInput={ ( tok ) => suggestions.some( ( s ) => s.toLowerCase() === String( tok ).trim().toLowerCase() ) }
				onChange={ ( next ) => {
					const out = [];
					const seen = new Set();
					next.forEach( ( tok ) => {
						const str = String( 'object' === typeof tok && tok ? tok.value : tok ).trim();
						// Match the member value's spelling when it differs only by case.
						const match = suggestions.find( ( s ) => s.toLowerCase() === str.toLowerCase() ) || str;
						if ( match && ! seen.has( match.toLowerCase() ) ) {
							seen.add( match.toLowerCase() );
							out.push( match );
						}
					} );
					onChange( out );
				} }
			/>
			{ help && <p className="bptm-ed-muted">{ help }</p> }
		</div>
	);
};

export default TermSelect;
