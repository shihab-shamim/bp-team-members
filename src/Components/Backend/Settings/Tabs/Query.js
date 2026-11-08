import { PanelBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import TermSelect from '../../Controls/TermSelect';
import { Select, NumberField, Notice } from '../../Controls/Fields';
import { termLabel } from '../../../../utils/editorData';
import { TERM_FIELDS, distinctValues, getMembers } from '../../../../utils/members';
import { orderByOptions, normalizeOrderBy, orderOptions, taxonomyOrderByOptions } from '../../../../utils/options';
import { canPaginate } from '../../../../utils/logic';

const Query = ( { attributes, setAttributes } ) => {
	const f = { attributes, setAttributes };
	const members = getMembers( attributes );
	const paginated = attributes.paginationEnabled && canPaginate( attributes );
	const groupField = TERM_FIELDS.find( ( t ) => 'group' === t.key );

	return (
		<>
			<PanelBody title={ __( 'Members', 'bp-team-member' ) } initialOpen>
				<NumberField { ...f } name="numberOfMembers" label={ __( 'Number of members', 'bp-team-member' ) } min={ -1 } help={ __( '-1 shows all members.', 'bp-team-member' ) } />
				{ paginated && <Notice>{ __( 'Pagination is on: the per-page settings control how many members load at a time.', 'bp-team-member' ) }</Notice> }
				<Select { ...f } name="orderBy" label={ __( 'Order by', 'bp-team-member' ) } options={ orderByOptions } value={ normalizeOrderBy( attributes.orderBy ) } />
				{ 'rand' !== normalizeOrderBy( attributes.orderBy ) && <Select { ...f } name="order" label={ __( 'Order', 'bp-team-member' ) } options={ orderOptions } /> }
				<p className="bptm-ed-muted">{ __( 'Default uses the order of the Team Members list (General tab).', 'bp-team-member' ) }</p>
			</PanelBody>

			<PanelBody title={ __( 'Term order', 'bp-team-member' ) } initialOpen={ false }>
				<p className="bptm-ed-muted">{ __( 'Order of values in category tabs, filters and grouped layouts.', 'bp-team-member' ) }</p>
				<Select { ...f } name="taxonomyOrderBy" label={ __( 'Order by', 'bp-team-member' ) } options={ taxonomyOrderByOptions } value={ 'name' === attributes.taxonomyOrderBy ? 'name' : 'default' } />
				<Select { ...f } name="taxonomyOrder" label={ __( 'Order', 'bp-team-member' ) } options={ orderOptions } />
			</PanelBody>

			<PanelBody title={ __( 'Include', 'bp-team-member' ) } initialOpen={ false }>
				{ TERM_FIELDS.map( ( t ) => (
					<TermSelect
						key={ t.key }
						label={ termLabel( t.key ) }
						value={ attributes[ t.include ] }
						suggestions={ distinctValues( members, t.field ) }
						onChange={ ( names ) => setAttributes( { [ t.include ]: names } ) }
					/>
				) ) }
				<p className="bptm-ed-muted">{ __( 'Only members with one of the chosen values are shown. Leave a field empty to include everyone.', 'bp-team-member' ) }</p>
			</PanelBody>

			<PanelBody title={ __( 'Exclude', 'bp-team-member' ) } initialOpen={ false }>
				<TermSelect
					label={ sprintf(
						/* translators: %s: group label */
						__( 'Exclude %s', 'bp-team-member' ),
						termLabel( 'group' )
					) }
					value={ attributes.excludeGroups }
					suggestions={ distinctValues( members, groupField.field ) }
					onChange={ ( names ) => setAttributes( { excludeGroups: names } ) }
				/>
			</PanelBody>
		</>
	);
};

export default Query;
