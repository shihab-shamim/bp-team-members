import { __ } from '@wordpress/i18n';
import * as BE from '@wordpress/block-editor';
import { TabPanel, ToolbarGroup, ToolbarButton, ToolbarDropdownMenu, Dropdown } from '@wordpress/components';

import Layout from './Tabs/Layout';
import Query from './Tabs/Query';
import Filter from './Tabs/Filter';
import Carousel from './Tabs/Carousel';
import Pagination from './Tabs/Pagination';
import Style from './Tabs/Style';
import ThemePicker from '../Controls/ThemePicker';
import { getTheme } from '../../../utils/editorData';
import { effectiveView, isCarousel, isFilter, viewChange, themeChange, themeSupportsCarousel, themeSupportsFilter } from '../../../utils/logic';
import { viewTypeOptions } from '../../../utils/options';

const { InspectorControls, BlockControls } = BE;
const AlignmentControl = BE.AlignmentControl || BE.AlignmentToolbar;

const VIEW_ICONS = { grid: 'grid-view', carousel: 'slides', filter: 'filter' };

const Settings = ( { attributes, setAttributes } ) => {
	const { alignment } = attributes;
	const theme = getTheme( attributes.theme );
	const view = effectiveView( attributes );

	const tabs = [ { name: 'layout', title: __( 'Layout', 'bp-team-member' ) }, { name: 'query', title: __( 'Query', 'bp-team-member' ) } ];
	if ( isFilter( attributes ) ) {
		tabs.push( { name: 'filter', title: __( 'Filter', 'bp-team-member' ) } );
	}
	if ( isCarousel( attributes ) ) {
		tabs.push( { name: 'carousel', title: __( 'Carousel', 'bp-team-member' ) } );
	} else {
		tabs.push( { name: 'pagination', title: __( 'Pagination', 'bp-team-member' ) } );
	}
	tabs.push( { name: 'style', title: __( 'Style', 'bp-team-member' ) } );

	const props = { attributes, setAttributes };

	return (
		<>
			<InspectorControls>
				<TabPanel className="bptm-ed-tabs" activeClass="is-active" tabs={ tabs }>
					{ ( tab ) => (
						<div className={ `bptm-ed-tab bptm-ed-tab--${ tab.name }` }>
							{ 'layout' === tab.name && <Layout { ...props } /> }
							{ 'query' === tab.name && <Query { ...props } /> }
							{ 'filter' === tab.name && <Filter { ...props } /> }
							{ 'carousel' === tab.name && <Carousel { ...props } /> }
							{ 'pagination' === tab.name && <Pagination { ...props } /> }
							{ 'style' === tab.name && <Style { ...props } /> }
						</div>
					) }
				</TabPanel>
			</InspectorControls>

			<BlockControls group="block">
				<AlignmentControl value={ alignment } onChange={ ( v ) => setAttributes( { alignment: v || 'center' } ) } />
			</BlockControls>

			<BlockControls group="other">
				<ToolbarGroup>
					<Dropdown
						popoverProps={ { placement: 'bottom-start' } }
						contentClassName="bptm-ed-toolbar-themes"
						renderToggle={ ( { isOpen, onToggle } ) => (
							<ToolbarButton icon="admin-appearance" onClick={ onToggle } aria-expanded={ isOpen } label={ __( 'Change theme', 'bp-team-member' ) } showTooltip>
								{ theme.label }
							</ToolbarButton>
						) }
						renderContent={ ( { onClose } ) => (
							<ThemePicker
								compact
								value={ attributes.theme }
								onChange={ ( id ) => {
									setAttributes( themeChange( attributes, id ) );
									onClose();
								} }
							/>
						) }
					/>
					<ToolbarDropdownMenu
						icon={ VIEW_ICONS[ view ] || 'grid-view' }
						label={ __( 'View type', 'bp-team-member' ) }
						controls={ viewTypeOptions.map( ( o ) => ( {
							title: o.label,
							icon: VIEW_ICONS[ o.value ],
							isActive: view === o.value,
							isDisabled: !! theme.forced_view || ( 'carousel' === o.value && ! themeSupportsCarousel( theme ) ) || ( 'filter' === o.value && ! themeSupportsFilter( theme ) ),
							onClick: () => setAttributes( viewChange( o.value ) ),
						} ) ) }
					/>
				</ToolbarGroup>
			</BlockControls>
		</>
	);
};

export default Settings;
