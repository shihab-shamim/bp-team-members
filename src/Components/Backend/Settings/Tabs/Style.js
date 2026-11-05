import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import ColorFields from '../../Controls/ColorFields';
import TypographyControl from '../../Controls/TypographyControl';
import { BoxControl, Unit } from '../../Controls/Fields';
import { shadowPresets } from '../../../../utils/options';
import { isCarousel, isFilter, effectiveLinkType } from '../../../../utils/logic';

const common = { __nextHasNoMarginBottom: true, __next40pxDefaultSize: true };

const TYPOS = [
	[ 'nameTypography', __( 'Name', 'bp-team-member' ) ],
	[ 'roleTypography', __( 'Designation', 'bp-team-member' ) ],
	[ 'detailsTypography', __( 'Details', 'bp-team-member' ) ],
	[ 'infoTypography', __( 'Info / meta', 'bp-team-member' ) ],
	[ 'ribbonTypography', __( 'Ribbon', 'bp-team-member' ) ],
	[ 'readmoreTypography', __( 'Read more', 'bp-team-member' ) ],
];

const ShadowField = ( { value, onChange } ) => {
	const isPreset = shadowPresets.some( ( p ) => p.value === value && 'custom' !== p.value );
	const [ custom, setCustom ] = useState( ! isPreset && !! value );
	return (
		<div className="bptm-ed-field">
			<SelectControl
				{ ...common }
				label={ __( 'Box shadow', 'bp-team-member' ) }
				value={ custom ? 'custom' : ( value || '' ) }
				options={ shadowPresets }
				onChange={ ( v ) => {
					if ( 'custom' === v ) {
						setCustom( true );
						return;
					}
					setCustom( false );
					onChange( v );
				} }
			/>
			{ custom && (
				<TextControl
					{ ...common }
					label={ __( 'Custom box-shadow', 'bp-team-member' ) }
					placeholder="0 4px 12px rgba(0,0,0,.15)"
					value={ value || '' }
					onChange={ ( v ) => onChange( v.replace( /[;{}<>]/g, '' ) ) }
				/>
			) }
		</div>
	);
};

const Style = ( { attributes, setAttributes } ) => {
	const f = { attributes, setAttributes };
	const link = effectiveLinkType( attributes );

	const general = [
		{ name: 'accentColor', label: __( 'Accent', 'bp-team-member' ) },
		{ name: 'nameColor', label: __( 'Name', 'bp-team-member' ) },
		{ name: 'nameBg', label: __( 'Name background', 'bp-team-member' ) },
		{ name: 'roleColor', label: __( 'Designation', 'bp-team-member' ) },
		{ name: 'descriptionColor', label: __( 'Description', 'bp-team-member' ) },
		{ name: 'descriptionLinkColor', label: __( 'Description links', 'bp-team-member' ) },
		{ name: 'infoColor', label: __( 'Info text', 'bp-team-member' ) },
		{ name: 'infoIconColor', label: __( 'Info icons', 'bp-team-member' ) },
		{ name: 'infoBg', label: __( 'Info background', 'bp-team-member' ) },
	];
	const item = [
		{ name: 'itemBg', label: __( 'Item background', 'bp-team-member' ) },
		{ name: 'itemBgHover', label: __( 'Item background (hover)', 'bp-team-member' ) },
		{ name: 'itemBorderColor', label: __( 'Item border', 'bp-team-member' ) },
		{ name: 'tooltipBg', label: __( 'Tooltip background', 'bp-team-member' ) },
		{ name: 'hoverIconBg', label: __( 'Hover icon background', 'bp-team-member' ) },
		{ name: 'ribbonBg', label: __( 'Ribbon background', 'bp-team-member' ) },
	];
	if ( 'popup' === link ) {
		item.push( { name: 'popupArrowColor', label: __( 'Popup arrows', 'bp-team-member' ) } );
	}

	return (
		<>
			<ColorFields { ...f } title={ __( 'Text colors', 'bp-team-member' ) } colors={ general } initialOpen />
			<ColorFields { ...f } title={ __( 'Item colors', 'bp-team-member' ) } colors={ item } />

			<PanelBody title={ __( 'Typography', 'bp-team-member' ) } initialOpen={ false }>
				{ TYPOS.map( ( [ name, label ] ) => (
					<TypographyControl key={ name } label={ label } value={ attributes[ name ] } onChange={ ( v ) => setAttributes( { [ name ]: v } ) } />
				) ) }
			</PanelBody>

			<PanelBody title={ __( 'Box', 'bp-team-member' ) } initialOpen={ false }>
				{ BoxControl && (
					<div className="bptm-ed-field">
						<BoxControl
							__next40pxDefaultSize
							label={ __( 'Item padding', 'bp-team-member' ) }
							values={ attributes.itemPadding && 'object' === typeof attributes.itemPadding && ! Array.isArray( attributes.itemPadding ) ? attributes.itemPadding : {} }
							onChange={ ( v ) => {
								const out = {};
								Object.keys( v || {} ).forEach( ( k ) => {
									if ( v[ k ] ) {
										out[ k ] = v[ k ];
									}
								} );
								setAttributes( { itemPadding: out } );
							} }
						/>
					</div>
				) }
				<Unit label={ __( 'Item border radius', 'bp-team-member' ) } value={ attributes.itemBorderRadius } onChange={ ( v ) => setAttributes( { itemBorderRadius: v } ) } />
				<Unit label={ __( 'Item border width', 'bp-team-member' ) } value={ attributes.itemBorderWidth } onChange={ ( v ) => setAttributes( { itemBorderWidth: v } ) } units={ [ { value: 'px', label: 'px', default: 1 } ] } />
				<ShadowField value={ attributes.itemShadow } onChange={ ( v ) => setAttributes( { itemShadow: v } ) } />
				<Unit label={ __( 'Image border radius', 'bp-team-member' ) } value={ attributes.imageBorderRadius } onChange={ ( v ) => setAttributes( { imageBorderRadius: v } ) } />
			</PanelBody>

			{ isCarousel( attributes ) && (
				<ColorFields { ...f } title={ __( 'Carousel colors', 'bp-team-member' ) } colors={ [
					{ name: 'sliderNavColor', label: __( 'Arrow', 'bp-team-member' ) },
					{ name: 'sliderNavBg', label: __( 'Arrow background', 'bp-team-member' ) },
					{ name: 'sliderNavHoverColor', label: __( 'Arrow (hover)', 'bp-team-member' ) },
					{ name: 'sliderNavHoverBg', label: __( 'Arrow background (hover)', 'bp-team-member' ) },
					{ name: 'sliderDotColor', label: __( 'Dot', 'bp-team-member' ) },
					{ name: 'sliderDotHoverColor', label: __( 'Dot (hover / active)', 'bp-team-member' ) },
				] } />
			) }

			{ isFilter( attributes ) && (
				<ColorFields { ...f } title={ __( 'Filter colors', 'bp-team-member' ) } colors={ [
					{ name: 'filterTextColor', label: __( 'Text', 'bp-team-member' ) },
					{ name: 'filterActiveTextColor', label: __( 'Active text', 'bp-team-member' ) },
					{ name: 'filterBgColor', label: __( 'Background', 'bp-team-member' ) },
					{ name: 'filterActiveBgColor', label: __( 'Active background', 'bp-team-member' ) },
					{ name: 'filterBorderColor', label: __( 'Border', 'bp-team-member' ) },
					{ name: 'filterActiveBorderColor', label: __( 'Active border', 'bp-team-member' ) },
				] } />
			) }
		</>
	);
};

export default Style;
