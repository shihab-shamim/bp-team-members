import { PanelBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import TermSelect from '../../Controls/TermSelect';
import { Toggle, Select, NumberField, Notice } from '../../Controls/Fields';
import { getEnabledTaxonomies, TAXONOMY_ATTRS } from '../../../../utils/editorData';
import { orderByOptions, orderOptions, taxonomyOrderByOptions } from '../../../../utils/options';
import { canPaginate } from '../../../../utils/logic';

const Query = ( { attributes, setAttributes } ) => {
	const f = { attributes, setAttributes };
	const taxonomies = getEnabledTaxonomies();
	const group = taxonomies.find( ( t ) => 'group' === t.key );
	const paginated = attributes.paginationEnabled && canPaginate( attributes );

	return (
		<>
			<PanelBody title={ __( 'Members', 'bp-team-member' ) } initialOpen>
				<NumberField { ...f } name="numberOfMembers" label={ __( 'Number of members', 'bp-team-member' ) } min={ -1 } help={ __( '-1 shows all members.', 'bp-team-member' ) } />
				{ paginated && <Notice>{ __( 'Pagination is on: the per-page settings control how many members load at a time.', 'bp-team-member' ) }</Notice> }
				<Select { ...f } name="orderBy" label={ __( 'Order by', 'bp-team-member' ) } options={ orderByOptions } />
				<Select { ...f } name="order" label={ __( 'Order', 'bp-team-member' ) } options={ orderOptions } />
			</PanelBody>

			<PanelBody title={ __( 'Taxonomy order', 'bp-team-member' ) } initialOpen={ false }>
				<p className="bptm-ed-muted">{ __( 'Order of terms in filters and grouped layouts.', 'bp-team-member' ) }</p>
				<Select { ...f } name="taxonomyOrderBy" label={ __( 'Taxonomy order by', 'bp-team-member' ) } options={ taxonomyOrderByOptions } />
				<Select { ...f } name="taxonomyOrder" label={ __( 'Taxonomy order', 'bp-team-member' ) } options={ orderOptions } />
				<Toggle { ...f } name="taxonomyHideEmpty" label={ __( 'Hide empty terms', 'bp-team-member' ) } />
			</PanelBody>

			<PanelBody title={ __( 'Include terms', 'bp-team-member' ) } initialOpen={ false }>
				{ ! taxonomies.length && <Notice>{ __( 'All taxonomies are disabled in the taxonomy settings.', 'bp-team-member' ) }</Notice> }
				{ taxonomies.map( ( t ) => (
					<TermSelect
						key={ t.key }
						taxonomy={ t.taxonomy }
						label={ t.label }
						value={ attributes[ TAXONOMY_ATTRS[ t.key ] ] }
						onChange={ ( ids ) => setAttributes( { [ TAXONOMY_ATTRS[ t.key ] ]: ids } ) }
					/>
				) ) }
				<p className="bptm-ed-muted">{ __( 'Leave a taxonomy empty to include all of its terms.', 'bp-team-member' ) }</p>
			</PanelBody>

			{ group && (
				<PanelBody title={ __( 'Exclude terms', 'bp-team-member' ) } initialOpen={ false }>
					<TermSelect
						taxonomy={ group.taxonomy }
						label={ sprintf(
							/* translators: %s: group taxonomy label */
							__( 'Exclude %s', 'bp-team-member' ),
							group.label
						) }
						value={ attributes.excludeGroups }
						onChange={ ( ids ) => setAttributes( { excludeGroups: ids } ) }
					/>
				</PanelBody>
			) }
		</>
	);
};

export default Query;
