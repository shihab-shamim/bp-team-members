import { PanelBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import { Toggle, Select, Text } from '../../Controls/Fields';
import { termLabel } from '../../../../utils/editorData';
import { filterTypeOptions, filterColumnOptions, positionOptions, filterStyleOptions } from '../../../../utils/options';

/* translators: %s: field label, e.g. Location */
const byLabel = ( key ) => sprintf( __( 'Filter by %s', 'bp-team-member' ), termLabel( key ) );

const TAX_FILTERS = [
	[ 'location', 'filterByLocation' ],
	[ 'language', 'filterByLanguage' ],
	[ 'gender', 'filterByGender' ],
	[ 'specialty', 'filterBySpecialty' ],
	[ 'extra_one', 'filterByExtraOne' ],
	[ 'extra_two', 'filterByExtraTwo' ],
	[ 'extra_three', 'filterByExtraThree' ],
	[ 'extra_four', 'filterByExtraFour' ],
	[ 'extra_five', 'filterByExtraFive' ],
];

const Filter = ( { attributes, setAttributes } ) => {
	const f = { attributes, setAttributes };
	return (
		<>
			<PanelBody title={ __( 'Filter', 'bp-team-member' ) } initialOpen>
				<Select { ...f } name="filterType" label={ __( 'Filter type', 'bp-team-member' ) } options={ filterTypeOptions } help={ __( 'Normal filters in the browser; Ajax queries the server for each filter change (works with pagination).', 'bp-team-member' ) } />
				<Select { ...f } name="filterStyle" label={ __( 'Filter style', 'bp-team-member' ) } options={ filterStyleOptions } />
				<Select { ...f } name="filterCatPosition" label={ __( 'Category tabs position', 'bp-team-member' ) } options={ positionOptions } />
				<Select { ...f } name="filterColumns" label={ __( 'Filter columns', 'bp-team-member' ) } options={ filterColumnOptions } />
			</PanelBody>

			<PanelBody title={ __( 'Category tabs', 'bp-team-member' ) } initialOpen={ false }>
				<Toggle { ...f } name="filterAllEnabled" label={ __( 'Show “All” tab', 'bp-team-member' ) } />
				{ attributes.filterAllEnabled && <Text { ...f } name="filterAllText" label={ __( '“All” text', 'bp-team-member' ) } /> }
				<p className="bptm-ed-muted">{ __( 'Tabs are built from the members’ Group values.', 'bp-team-member' ) }</p>
			</PanelBody>

			<PanelBody title={ __( 'Search', 'bp-team-member' ) } initialOpen={ false }>
				<Toggle { ...f } name="searchByName" label={ __( 'Search by name', 'bp-team-member' ) } />
				<Toggle { ...f } name="searchByCompany" label={ __( 'Search by company', 'bp-team-member' ) } />
				<Toggle { ...f } name="searchByZip" label={ __( 'Search by zip', 'bp-team-member' ) } />
				<Toggle { ...f } name="searchByTag" label={ __( 'Search by tag', 'bp-team-member' ) } />
			</PanelBody>

			<PanelBody title={ __( 'Dropdown filters', 'bp-team-member' ) } initialOpen={ false }>
				<Toggle { ...f } name="filterByDesignation" label={ __( 'Filter by designation', 'bp-team-member' ) } />
				{ TAX_FILTERS.map( ( [ key, name ] ) => (
					<Toggle key={ name } { ...f } name={ name } label={ byLabel( key ) } />
				) ) }
				<Toggle { ...f } name="enableMultiSelect" label={ __( 'Multi-select dropdowns', 'bp-team-member' ) } />
				{ attributes.enableMultiSelect && <Toggle { ...f } name="multiSelectEllipsis" label={ __( 'Ellipsis for long selections', 'bp-team-member' ) } /> }
				<Toggle { ...f } name="enableClearFilters" label={ __( 'Reset filters button', 'bp-team-member' ) } />
			</PanelBody>
		</>
	);
};

export default Filter;
