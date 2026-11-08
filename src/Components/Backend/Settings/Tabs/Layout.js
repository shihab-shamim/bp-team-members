import { PanelBody } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import ThemePicker from '../../Controls/ThemePicker';
import VisibilityControl from '../../Controls/VisibilityControl';
import { Toggle, Select, Text, Range, Segmented, ColumnsControl, Notice } from '../../Controls/Fields';
// bpl-tools ItemsPanel, imported from its own file so the bundle does not pull in every bpl-tools component.
import ItemsPanel from '../../../../../../bpl-tools/Components/ItemsPanel/ItemsPanel';
import MemberSettings from '../../Members/MemberSettings';
import { blankMember, duplicateMember, getMembers } from '../../../../utils/members';
import { ensureFontAwesome } from '../../../../utils/fontAwesome';
import { getTheme, getThumbnailSizes } from '../../../../utils/editorData';
import {
	effectiveView, effectiveLinkType, linkTypeLocked, selectedView, viewChange, themeChange,
	themeSupportsCarousel, themeSupportsFilter, themeForcedLink,
} from '../../../../utils/logic';
import {
	viewTypeOptions, linkTypeOptions, linkTargetOptions, popupStyleOptions, popupColumnOptions,
	panelStyleOptions, panelPositionOptions, drawerStyleOptions, imageFilterOptions,
} from '../../../../utils/options';

const optLabel = ( opts, v ) => ( opts.find( ( o ) => o.value === v ) || {} ).label || v;

const Layout = ( { attributes, setAttributes } ) => {
	const f = { attributes, setAttributes };
	const members = getMembers( attributes );
	const [ activeMember, setActiveMember ] = useState( 0 );

	// Font Awesome for the social icon picker inside each member's settings.
	useEffect( () => {
		ensureFontAwesome();
	}, [] );

	// New / duplicated members always get a fresh unique id.
	const setMembers = ( next ) => setAttributes( { members: next } );
	const handleAdd = () => {
		setMembers( [ ...members, blankMember( members ) ] );
		setActiveMember( members.length );
	};
	const handleCopy = ( index ) => {
		const next = [ ...members ];
		next.splice( index + 1, 0, duplicateMember( members[ index ], members ) );
		setMembers( next );
		setActiveMember( index + 1 );
	};
	const handleDelete = ( index ) => {
		setMembers( members.filter( ( _, i ) => i !== index ) );
		setActiveMember( Math.max( 0, index - 1 ) );
	};
	const theme = getTheme( attributes.theme );
	const view = effectiveView( attributes );
	const link = effectiveLinkType( attributes );
	const linkOn = !! attributes.nameIsLinked;
	const locked = linkTypeLocked( attributes );
	const forcedLink = themeForcedLink( theme );
	const selectedLink = 'single_page' === attributes.linkType ? 'custom' : attributes.linkType || 'default';

	const viewOptions = viewTypeOptions.map( ( o ) => ( {
		...o,
		disabled: !! theme.forced_view || ( 'carousel' === o.value && ! themeSupportsCarousel( theme ) ) || ( 'filter' === o.value && ! themeSupportsFilter( theme ) ),
	} ) );

	return (
		<>
			<PanelBody title={ __( 'Team Members', 'bp-team-member' ) } className="bptm-ed-members-panel" initialOpen>
				<ItemsPanel
					attributes={ { ...attributes, members } }
					setAttributes={ setAttributes }
					arrKey="members"
					design="sortable"
					title="name"
					itemLabel={ __( 'Member', 'bp-team-member' ) }
					newItem={ blankMember( members ) }
					ItemSettings={ MemberSettings }
					activeIndex={ activeMember }
					setActiveIndex={ setActiveMember }
					handleAdd={ handleAdd }
					handleCopy={ handleCopy }
					handleDelete={ handleDelete }
					minItem={ 0 }
				/>
			</PanelBody>

			<PanelBody title={ __( 'Theme', 'bp-team-member' ) } initialOpen={ false }>
				<p className="bptm-ed-current">
					{ __( 'Current:', 'bp-team-member' ) } <strong>{ theme.label }</strong>
				</p>
				<ThemePicker value={ attributes.theme } onChange={ ( id ) => setAttributes( themeChange( attributes, id ) ) } />
			</PanelBody>

			<PanelBody title={ __( 'View & Columns', 'bp-team-member' ) } initialOpen={ false }>
				<Segmented
					label={ __( 'View type', 'bp-team-member' ) }
					value={ view }
					options={ viewOptions }
					onChange={ ( v ) => ! theme.forced_view && setAttributes( viewChange( v ) ) }
				/>
				{ theme.forced_view && (
					<Notice>
						{ sprintf(
							/* translators: 1: theme, 2: view */
							__( '%1$s always uses the %2$s view.', 'bp-team-member' ),
							theme.label,
							optLabel( viewTypeOptions, theme.forced_view )
						) }
					</Notice>
				) }
				{ ! theme.forced_view && selectedView( attributes ) !== view && (
					<Notice status="warning">{ __( 'This theme does not support the selected view; it renders as a grid.', 'bp-team-member' ) }</Notice>
				) }
				{ 'table' === theme.layout || 'list' === theme.layout ? (
					<Notice>{ __( 'Table and list themes use one row per member; columns do not apply.', 'bp-team-member' ) }</Notice>
				) : (
					<ColumnsControl value={ attributes.columns } onChange={ ( v ) => setAttributes( { columns: v } ) } />
				) }
				<Range { ...f } name="columnGap" label={ __( 'Column gap (px)', 'bp-team-member' ) } min={ 0 } max={ 120 } />
				<Range { ...f } name="rowGap" label={ __( 'Row gap (px)', 'bp-team-member' ) } min={ 0 } max={ 120 } />
			</PanelBody>

			<PanelBody title={ __( 'Linking', 'bp-team-member' ) } initialOpen={ false }>
				<Toggle { ...f } name="nameIsLinked" label={ __( 'Link members', 'bp-team-member' ) } help={ __( 'Make the name (and image) open the member detail.', 'bp-team-member' ) } />
				{ linkOn && forcedLink && (
					<Notice>
						{ sprintf(
							/* translators: 1: theme, 2: link type */
							locked ? __( '%1$s always opens members as: %2$s.', 'bp-team-member' ) : __( '%1$s opens members as %2$s unless you choose another link type.', 'bp-team-member' ),
							theme.label,
							optLabel( linkTypeOptions, forcedLink )
						) }
					</Notice>
				) }
				{ linkOn && (
					<>
						<Select { ...f } name="linkType" label={ __( 'Link type', 'bp-team-member' ) } options={ linkTypeOptions } disabled={ locked } value={ locked ? forcedLink : selectedLink } />
						{ 'popup' === link && selectedLink === 'drawer' && (
							<Notice status="warning">{ __( 'Drawers cannot open inside carousels or tables; the popup is used instead.', 'bp-team-member' ) }</Notice>
						) }
						{ 'custom' === link && (
							<Select { ...f } name="linkTarget" label={ __( 'Open in', 'bp-team-member' ) } options={ linkTargetOptions } />
						) }
						{ 'popup' === link && (
							<>
								<Select { ...f } name="popupStyle" label={ __( 'Popup style', 'bp-team-member' ) } options={ popupStyleOptions } />
								{ [ 'default', 'style-six' ].includes( attributes.popupStyle ) && (
									<Select { ...f } name="popupColumns" label={ __( 'Popup columns', 'bp-team-member' ) } options={ popupColumnOptions } />
								) }
							</>
						) }
						{ 'panel' === link && (
							<>
								<Select { ...f } name="panelStyle" label={ __( 'Panel style', 'bp-team-member' ) } options={ panelStyleOptions } />
								<Select { ...f } name="panelPosition" label={ __( 'Panel side', 'bp-team-member' ) } options={ panelPositionOptions } />
							</>
						) }
						{ 'drawer' === link && (
							<Select { ...f } name="drawerStyle" label={ __( 'Drawer style', 'bp-team-member' ) } options={ drawerStyleOptions } />
						) }
						{ 'custom' === link && (
							<p className="bptm-ed-muted">{ __( 'Uses each member’s “Custom URL” field (Team Members → Contact). Members without one are not linked.', 'bp-team-member' ) }</p>
						) }
					</>
				) }
			</PanelBody>

			<PanelBody title={ __( 'Image', 'bp-team-member' ) } initialOpen={ false }>
				<Select { ...f } name="thumbnailSize" label={ __( 'Thumbnail size', 'bp-team-member' ) } options={ getThumbnailSizes() } />
				<Toggle { ...f } name="linkPreviewImage" label={ __( 'Link image', 'bp-team-member' ) } help={ __( 'Clicking the image opens the member like the name does.', 'bp-team-member' ) } />
				<Select { ...f } name="imageFilter" label={ __( 'Image filter', 'bp-team-member' ) } options={ imageFilterOptions } />
				<Select { ...f } name="hoverImageFilter" label={ __( 'Hover image filter', 'bp-team-member' ) } options={ imageFilterOptions } />
			</PanelBody>

			<PanelBody title={ __( 'Visibility', 'bp-team-member' ) } initialOpen={ false }>
				<VisibilityControl { ...f } />
			</PanelBody>

			<PanelBody title={ __( 'Content', 'bp-team-member' ) } initialOpen={ false }>
				<Toggle { ...f } name="enableFeaturing" label={ __( 'Show featured members first', 'bp-team-member' ) } />
				<Toggle { ...f } name="enableScrollAnimation" label={ __( 'Scroll animation', 'bp-team-member' ) } />
				<Toggle { ...f } name="allowHtmlDetails" label={ __( 'Allow HTML in details', 'bp-team-member' ) } help={ __( 'Show the full formatted description instead of a trimmed text.', 'bp-team-member' ) } />
				{ ! attributes.allowHtmlDetails && (
					<Range { ...f } name="detailsLength" label={ __( 'Details length (characters)', 'bp-team-member' ) } min={ 0 } max={ 1000 } />
				) }
				<Toggle { ...f } name="descScrollControl" label={ __( 'Scrollable description', 'bp-team-member' ) } />
				{ attributes.descScrollControl && (
					<Text { ...f } name="maxScrollHeight" label={ __( 'Max scroll height', 'bp-team-member' ) } placeholder="200px" help={ __( 'CSS length, e.g. 200px. Empty = theme default.', 'bp-team-member' ) } />
				) }
				<Toggle { ...f } name="detailsAreaHeight" label={ __( 'Equal details area height', 'bp-team-member' ) } />
			</PanelBody>
			

		</>
	);
};

export default Layout;
