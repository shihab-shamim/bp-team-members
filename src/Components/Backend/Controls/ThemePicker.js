import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';

import ThemeThumb from './ThemeThumb';
import { getThemesByFamily, FAMILY_LABELS } from '../../../utils/editorData';
import { linkTypeOptions } from '../../../utils/options';

const linkLabel = ( v ) => ( linkTypeOptions.find( ( o ) => o.value === v ) || {} ).label || v;

export const themeBadges = ( theme ) => {
	const badges = [];
	if ( 'carousel' === theme.forced_view ) {
		badges.push( __( 'Carousel', 'bp-team-member' ) );
	}
	if ( 'filter' === theme.forced_view ) {
		badges.push( __( 'Filter', 'bp-team-member' ) );
	}
	if ( theme.forced_link ) {
		badges.push( linkLabel( theme.forced_link ) );
	}
	return badges;
};

const ThemePicker = ( { value, onChange, compact = false } ) => {
	const families = getThemesByFamily();
	const [ family, setFamily ] = useState( 'all' );
	const shown = families
		.filter( ( f ) => 'all' === family || f.key === family )
		.filter( ( f ) => f.themes.length );

	return (
		<div className={ `bptm-ed-themes${ compact ? ' is-compact' : '' }` }>
			<div className="bptm-ed-themes__families" role="tablist" aria-label={ __( 'Theme families', 'bp-team-member' ) }>
				{ [ { key: 'all', label: __( 'All', 'bp-team-member' ) } ].concat( families ).map( ( f ) => (
					<button
						key={ f.key }
						type="button"
						role="tab"
						aria-selected={ family === f.key }
						className={ `bptm-ed-chip${ family === f.key ? ' is-active' : '' }` }
						onClick={ () => setFamily( f.key ) }
					>
						{ f.label || FAMILY_LABELS[ f.key ] }
					</button>
				) ) }
			</div>
			<SelectControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'Select theme', 'bp-team-member' ) }
				hideLabelFromVision
				value={ shown.some( ( f ) => f.themes.some( ( t ) => t.id === value ) ) ? value : '' }
				onChange={ ( v ) => v && onChange( v ) }
			>
				<option value="" disabled>{ __( '— Select theme —', 'bp-team-member' ) }</option>
				{ shown.map( ( f ) => (
					<optgroup key={ f.key } label={ f.label || FAMILY_LABELS[ f.key ] }>
						{ f.themes.map( ( t ) => (
							<option key={ t.id } value={ t.id }>{ t.label }</option>
						) ) }
					</optgroup>
				) ) }
			</SelectControl>
			{ shown.map( ( f ) => (
				<div className="bptm-ed-themes__family" key={ f.key }>
					<div className="bptm-ed-themes__family-title">{ f.label }</div>
					<div className="bptm-ed-themes__grid">
						{ f.themes.map( ( t ) => {
							const badges = themeBadges( t );
							const active = t.id === value;
							return (
								<button
									key={ t.id }
									type="button"
									className={ `bptm-ed-theme${ active ? ' is-active' : '' }` }
									aria-pressed={ active }
									title={ badges.length ? sprintf(
										/* translators: 1: theme name, 2: forced features. */
										__( '%1$s (%2$s)', 'bp-team-member' ),
										t.label,
										badges.join( ', ' )
									) : t.label }
									onClick={ () => onChange( t.id ) }
								>
									<ThemeThumb theme={ t } />
									<span className="bptm-ed-theme__label">{ t.label }</span>
									{ badges.length > 0 && <span className="bptm-ed-theme__badge">{ badges.join( ' · ' ) }</span> }
								</button>
							);
						} ) }
					</div>
				</div>
			) ) }
		</div>
	);
};

export default ThemePicker;
