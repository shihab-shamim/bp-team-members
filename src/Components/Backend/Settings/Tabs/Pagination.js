import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { Toggle, Select, NumberField, Text, Notice } from '../../Controls/Fields';
import { paginationTypeOptions } from '../../../../utils/options';
import { canPaginate, isCarousel } from '../../../../utils/logic';
import { getTheme } from '../../../../utils/editorData';

/**
 * Why pagination is unavailable (mirrors Query::pagination_mode()).
 *
 * @param {Object} attributes Block attributes.
 * @return {string} Notice text.
 */
const unavailableReason = ( attributes ) => {
	const theme = getTheme( attributes.theme );
	if ( false === theme.pagination || theme.grouped ) {
		return __( 'This theme always shows all members on one page, so pagination is not available. Use “Number of members” in the Query tab to limit the list.', 'bp-team-member' );
	}
	if ( isCarousel( attributes ) ) {
		return __( 'Pagination is not available for carousels.', 'bp-team-member' );
	}
	return __( 'Normal filters work on the loaded members only. Switch the filter type to “Ajax Filter” to use pagination.', 'bp-team-member' );
};

const Pagination = ( { attributes, setAttributes } ) => {
	const f = { attributes, setAttributes };
	const type = attributes.paginationType;

	if ( ! canPaginate( attributes ) ) {
		return (
			<PanelBody title={ __( 'Pagination', 'bp-team-member' ) } initialOpen>
				<Notice>{ unavailableReason( attributes ) }</Notice>
			</PanelBody>
		);
	}

	return (
		<PanelBody title={ __( 'Pagination', 'bp-team-member' ) } initialOpen>
			<Toggle { ...f } name="paginationEnabled" label={ __( 'Enable pagination', 'bp-team-member' ) } />
			{ attributes.paginationEnabled && (
				<>
					<Select { ...f } name="paginationType" label={ __( 'Pagination type', 'bp-team-member' ) } options={ paginationTypeOptions } />
					{ [ 'normal-pagination', 'ajax-pagination' ].includes( type ) && (
						<NumberField { ...f } name="perPage" label={ __( 'Members per page', 'bp-team-member' ) } min={ 1 } />
					) }
					{ [ 'load-more-button', 'load-more-scroll' ].includes( type ) && (
						<NumberField { ...f } name="initialItems" label={ __( 'Initial members', 'bp-team-member' ) } min={ 1 } />
					) }
					{ 'load-more-button' === type && (
						<>
							<NumberField { ...f } name="loadPerClick" label={ __( 'Members per click', 'bp-team-member' ) } min={ 1 } />
							<Text { ...f } name="loadButtonText" label={ __( 'Button text', 'bp-team-member' ) } />
						</>
					) }
					{ 'load-more-scroll' === type && (
						<NumberField { ...f } name="perLoad" label={ __( 'Members per load', 'bp-team-member' ) } min={ 1 } />
					) }
				</>
			) }
		</PanelBody>
	);
};

export default Pagination;
