/**
 * Style tab — built with bpl-tools controls (see use.md / explore.md):
 * ColorControl, Typography, BoxControl, ShadowControl and BtnGroup, grouped in PanelBody sections.
 *
 * Data formats stay compatible with the renderer (src/Components/Common/Team/css.js):
 * - colors are plain CSS color strings (ColorControl returns rgba(...)),
 * - typography objects use the bpl-tools keys (fontFamily, fontWeight, fontSize{desktop,tablet,mobile},
 *   fontStyle, textTransform, textDecoration, lineHeight, letterSpace) + letterSpacing / color / hoverColor;
 *   older snake_case values (font_family, size, weight …) are converted when first edited,
 * - itemPadding is {top,right,bottom,left}, itemShadow is a CSS box-shadow string
 *   (custom shadows also keep their ShadowControl list in itemShadowList).
 */
import { Button, PanelBody, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// bpl-tools components, imported from their own files (the Components barrel would pull every component in).
import { ColorControl } from '../../../../../../bpl-tools/Components/ColorControl/ColorControl';
import Typography from '../../../../../../bpl-tools/Components/Typography/Typography';
import BoxControl from '../../../../../../bpl-tools/Components/BoxControl/BoxControl';
import ShadowControl from '../../../../../../bpl-tools/Components/ShadowControl/ShadowControl';
import { getMultiShadowCSS } from '../../../../../../bpl-tools/utils/getCSS';

import { Unit } from '../../Controls/Fields';
import { isCarousel, isFilter, effectiveLinkType, canPaginate } from '../../../../utils/logic';

const CLEAR = '__bptm_clear__';

/**
 * bpl-tools ColorControl for one string attribute, with an inline reset button that clears the value.
 */
const Color = ( { label, value, onChange } ) => (
	<ColorControl
		className="mt15"
		label={ label }
		value={ value || '' }
		defaultColor={ value ? CLEAR : undefined }
		onChange={ ( v ) => onChange( CLEAR === v ? '' : v || '' ) }
	/>
);

const Colors = ( { attributes, setAttributes, list } ) =>
	list.map( ( [ name, label ] ) => (
		<Color key={ name } label={ label } value={ attributes[ name ] } onChange={ ( v ) => setAttributes( { [ name ]: v } ) } />
	) );

const Section = ( { children } ) => <p className="bptm-ed-style__section">{ children }</p>;

/* ---------- Typography: bpl-tools value <-> stored attribute ---------- */

const isSet = ( v ) => undefined !== v && null !== v && '' !== v;
const pxs = ( v ) => ( isSet( v ) && ! Number.isNaN( Number( v ) ) ? `${ Number( v ) }px` : v );

/** Stored typography object → value for the bpl-tools Typography control. */
const toBpl = ( raw ) => {
	const t = raw && 'object' === typeof raw && ! Array.isArray( raw ) ? raw : {};
	const v = { ...t };
	if ( ! isSet( t.fontFamily ) && isSet( t.font_family ) ) {
		v.fontFamily = t.font_family;
	}
	if ( ! isSet( t.fontWeight ) && isSet( t.weight ) ) {
		v.fontWeight = Number( t.weight ) || t.weight;
		v.fontVariant = String( t.weight );
	}
	if ( ! isSet( t.fontStyle ) && isSet( t.style ) ) {
		v.fontStyle = t.style;
	}
	if ( ! isSet( t.textTransform ) && isSet( t.transform ) ) {
		v.textTransform = t.transform;
	}
	if ( ! isSet( t.textDecoration ) && isSet( t.decoration ) ) {
		v.textDecoration = t.decoration;
	}
	if ( ! t.fontSize && isSet( t.size ) ) {
		if ( 'object' === typeof t.size ) {
			v.fontSize = {};
			Object.keys( t.size ).forEach( ( d ) => {
				v.fontSize[ d ] = pxs( t.size[ d ] );
			} );
		} else {
			v.fontSize = { desktop: pxs( t.size ) };
		}
	}
	if ( ! isSet( t.lineHeight ) && isSet( t.line_height ) ) {
		// Unitless multiplier → percent (same visual result, a unit the control offers).
		v.lineHeight = Number.isNaN( Number( t.line_height ) ) ? t.line_height : `${ Math.round( Number( t.line_height ) * 100 ) }%`;
	}
	if ( ! isSet( t.letterSpace ) ) {
		if ( isSet( t.letterSpacing ) ) {
			v.letterSpace = pxs( t.letterSpacing );
		} else if ( isSet( t.letter_spacing ) ) {
			v.letterSpace = pxs( t.letter_spacing );
		}
	}
	return v;
};

const LEGACY_KEYS = [ 'font_family', 'size', 'weight', 'style', 'transform', 'decoration', 'line_height', 'letter_spacing' ];

/** Value from the bpl-tools Typography control → stored typography object (renderer-ready). */
const fromBpl = ( next, prev ) => {
	const out = { ...( next || {} ) };
	LEGACY_KEYS.forEach( ( k ) => delete out[ k ] );
	// The renderer reads letterSpacing; bpl-tools stores letterSpace.
	if ( isSet( out.letterSpace ) ) {
		out.letterSpacing = out.letterSpace;
	} else {
		delete out.letterSpacing;
	}
	// Keep colors that live outside the bpl control.
	const p = prev && 'object' === typeof prev ? prev : {};
	if ( isSet( p.color ) && ! isSet( out.color ) ) {
		out.color = p.color;
	}
	const hover = isSet( p.hoverColor ) ? p.hoverColor : p.hover_color;
	if ( isSet( hover ) && ! isSet( out.hoverColor ) ) {
		out.hoverColor = hover;
	}
	delete out.hover_color;
	return out;
};

/** Read a typography attribute as a plain object. */
const typoOf = ( attributes, name ) => ( attributes[ name ] && 'object' === typeof attributes[ name ] && ! Array.isArray( attributes[ name ] ) ? attributes[ name ] : {} );

/** Set / clear one color key inside a typography attribute (color, hoverColor). */
const setTypoColor = ( attributes, setAttributes, name, key, v ) => {
	const next = { ...typoOf( attributes, name ) };
	delete next.hover_color;
	if ( v ) {
		next[ key ] = v;
	} else {
		delete next[ key ];
	}
	setAttributes( { [ name ]: next } );
};

/** bpl-tools Typography for one typography attribute (font, size, weight, style, transform, decoration, line height, letter spacing). */
const TypoControl = ( { attributes, setAttributes, name, label = __( 'Typography', 'bp-team-member' ) } ) => {
	const raw = typoOf( attributes, name );
	return <Typography className="mt15" label={ label } value={ toBpl( raw ) } onChange={ ( v ) => setAttributes( { [ name ]: fromBpl( v, raw ) } ) } />;
};

/** Hover color stored in a typography attribute. */
const HoverColor = ( { attributes, setAttributes, name, label = __( 'Hover color', 'bp-team-member' ) } ) => {
	const raw = typoOf( attributes, name );
	return <Color label={ label } value={ raw.hoverColor || raw.hover_color || '' } onChange={ ( v ) => setTypoColor( attributes, setAttributes, name, 'hoverColor', v ) } />;
};

/** Text color stored in a typography attribute (elements without a dedicated color attribute). */
const TypoTextColor = ( { attributes, setAttributes, name, label = __( 'Color', 'bp-team-member' ) } ) => (
	<Color label={ label } value={ typoOf( attributes, name ).color || '' } onChange={ ( v ) => setTypoColor( attributes, setAttributes, name, 'color', v ) } />
);

/**
 * Element color stored in its own attribute (nameColor, roleColor …).
 * Also clears an older color kept in the element's typography, so only one color applies.
 */
const ElementColor = ( { attributes, setAttributes, attr, typo, label = __( 'Color', 'bp-team-member' ) } ) => (
	<Color
		label={ label }
		value={ attributes[ attr ] }
		onChange={ ( v ) => {
			const patch = { [ attr ]: v };
			const t = typo ? typoOf( attributes, typo ) : {};
			if ( typo && isSet( t.color ) ) {
				const next = { ...t };
				delete next.color;
				patch[ typo ] = next;
			}
			setAttributes( patch );
		} }
	/>
);

/* ---------- Shadow: presets (BtnGroup) + custom (ShadowControl) ---------- */

const SHADOW_PRESETS = [
	// '' = nothing saved: the theme's own shadow (selected by default, so one button is always active).
	{ value: '', label: __( 'Default', 'bp-team-member' ) },
	{ value: 'none', label: __( 'None', 'bp-team-member' ) },
	{ value: 'sm', label: 'S' },
	{ value: 'md', label: 'M' },
	{ value: 'lg', label: 'L' },
	{ value: 'xl', label: 'XL' },
	{ value: 'custom', label: __( 'Custom', 'bp-team-member' ) },
];
const PRESET_VALUES = [ 'none', 'sm', 'md', 'lg', 'xl' ];
const DEFAULT_CUSTOM = [ { hOffset: '0px', vOffset: '8px', blur: '24px', spreed: '0px', color: 'rgba(15, 23, 42, 0.15)', isInset: false } ];

const ShadowField = ( { attributes, setAttributes } ) => {
	const value = 'string' === typeof attributes.itemShadow ? attributes.itemShadow : '';
	const list = Array.isArray( attributes.itemShadowList ) ? attributes.itemShadowList : [];
	let mode = '';
	if ( PRESET_VALUES.includes( value ) ) {
		mode = value;
	} else if ( value ) {
		mode = 'custom';
	}

	const setList = ( next ) => setAttributes( {
		itemShadowList: next,
		itemShadow: ( getMultiShadowCSS( next, 'box' ) || '' ).replace( /\s+/g, ' ' ).replace( /[;{}<>]/g, '' ).trim(),
	} );

	return (
		<>
			<div className="bptm-ed-presets mt15" role="group" aria-label={ __( 'Box shadow', 'bp-team-member' ) }>
				<span className="bptm-ed-presets__label">{ __( 'Box shadow', 'bp-team-member' ) }</span>
				<div className="bptm-ed-presets__grid">
					{ SHADOW_PRESETS.map( ( o ) => {
						const active = mode === o.value;
						return (
							<Button
								key={ o.value || 'default' }
								className={ 'bptm-ed-presets__btn' + ( active ? ' is-active' : '' ) }
								variant={ active ? 'primary' : 'secondary' }
								size="compact"
								aria-pressed={ active }
								onClick={ () => {
									// Clicking the selected button again goes back to Default (same as before).
									const v = active ? '' : o.value;
									if ( 'custom' === v ) {
										setList( list.length ? list : DEFAULT_CUSTOM );
									} else {
										setAttributes( { itemShadow: v } );
									}
								} }
							>
								{ o.label }
							</Button>
						);
					} ) }
				</div>
			</div>
			{ 'custom' === mode && (
				<ShadowControl className="mt15" label={ __( 'Custom shadow', 'bp-team-member' ) } value={ list.length ? list : DEFAULT_CUSTOM } onChange={ setList } />
			) }
		</>
	);
};

const PADDING_UNITS = [
	{ value: 'px', label: 'px', default: 0 },
	{ value: 'em', label: 'em', default: 0 },
	{ value: 'rem', label: 'rem', default: 0 },
	{ value: '%', label: '%', default: 0 },
];

const Style = ( { attributes, setAttributes } ) => {
	const f = { attributes, setAttributes };
	const link = effectiveLinkType( attributes );
	const color = ( attr, label ) => <Color label={ label } value={ attributes[ attr ] } onChange={ ( v ) => setAttributes( { [ attr ]: v } ) } />;
	const unit = ( attr, label, units ) => <Unit label={ label } value={ attributes[ attr ] } onChange={ ( v ) => setAttributes( { [ attr ]: v } ) } units={ units } />;
	// Slider for a length attribute that is empty by default (each theme keeps its own design):
	// shows the base default while empty, Reset clears the value again.
	const themeRange = ( attr, label, min, max, def, suffix ) => {
		const n = parseFloat( attributes[ attr ] );
		return (
			<RangeControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				className="bptm-ed-field"
				label={ label }
				min={ min }
				max={ max }
				value={ Number.isFinite( n ) ? n : def }
				allowReset
				onChange={ ( v ) => setAttributes( { [ attr ]: undefined === v || null === v || '' === v ? '' : `${ v }${ suffix }` } ) }
			/>
		);
	};
	// Slider for a length attribute stored as "<number><suffix>" (e.g. "20px", "50%"); never shown empty.
	const range = ( attr, label, min, max, def, suffix ) => {
		const n = parseFloat( attributes[ attr ] );
		return (
			<RangeControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				className="bptm-ed-field"
				label={ label }
				min={ min }
				max={ max }
				value={ Number.isFinite( n ) ? n : def }
				allowReset
				resetFallbackValue={ def }
				onChange={ ( v ) => setAttributes( { [ attr ]: `${ undefined === v || null === v || '' === v ? def : v }${ suffix }` } ) }
			/>
		);
	};
	// `def` (optional): values shown while nothing is saved (display only; the theme's own padding still applies).
	const box = ( attr, label, def ) => {
		const v = attributes[ attr ] && 'object' === typeof attributes[ attr ] && ! Array.isArray( attributes[ attr ] ) ? attributes[ attr ] : {};
		return (
			<BoxControl
				className="mt10"
				label={ label }
				values={ def && ! Object.keys( v ).length ? def : v }
				units={ PADDING_UNITS }
				onChange={ ( next ) => {
					const out = {};
					Object.keys( next || {} ).forEach( ( k ) => {
						if ( next[ k ] && /^-?[\d.]/.test( String( next[ k ] ) ) ) {
							out[ k ] = next[ k ];
						}
					} );
					setAttributes( { [ attr ]: out } );
				} }
			/>
		);
	};
	const pagination = !! attributes.paginationEnabled && canPaginate( attributes );
	const pgType = attributes.paginationType || 'normal-pagination';
	const PX = [ { value: 'px', label: 'px', default: 1 } ];

	return (
		<div className="bptm-ed-style">
			<PanelBody className="bPlPanelBody" title={ __( '', 'bp-team-member' ) } >
				{ color( 'accentColor', __( 'Accent color', 'bp-team-member' ) ) }
				{ /* Only the Grid 8 theme has a tooltip (the name / designation bubble). */ }
				{ 'grid-8' === attributes.theme && color( 'tooltipBg', __( 'Tooltip background', 'bp-team-member' ) ) }
			</PanelBody>

			{ [ 'popup', 'panel', 'drawer' ].includes( link ) && (
				<PanelBody className="bPlPanelBody" title={ __( 'Popup', 'bp-team-member' ) } initialOpen={ false }>
					{ 'drawer' !== link && color( 'popupBg', __( 'Background color', 'bp-team-member' ) ) }

					<Section>{ __( 'Close icon', 'bp-team-member' ) }</Section>
					{ color( 'popupCloseColor', __( 'Icon color', 'bp-team-member' ) ) }
					{ color( 'popupCloseBg', __( 'Background', 'bp-team-member' ) ) }
					{ color( 'popupCloseHoverColor', __( 'Icon color (hover)', 'bp-team-member' ) ) }
					{ color( 'popupCloseHoverBg', __( 'Background (hover)', 'bp-team-member' ) ) }
					{ range( 'popupCloseIconSize', __( 'Icon size (px)', 'bp-team-member' ), 8, 48, 20, 'px' ) }
					{ range( 'popupCloseSize', __( 'Button size (px)', 'bp-team-member' ), 20, 80, 40, 'px' ) }
					{ range( 'popupCloseRadius', __( 'Border radius (%)', 'bp-team-member' ), 0, 50, 50, '%' ) }
				</PanelBody>
			) }

			{ [ 'popup', 'panel', 'drawer' ].includes( link ) && (
				<PanelBody className="bPlPanelBody" title={ __( 'Popup arrows', 'bp-team-member' ) } initialOpen={ false }>
					<p className="bptm-ed-muted">{ __( 'Prev / Next buttons shown in the member popup, panel and drawer.', 'bp-team-member' ) }</p>
					<Section>{ __( 'Normal', 'bp-team-member' ) }</Section>
					{ color( 'popupArrowColor', __( 'Arrow color', 'bp-team-member' ) ) }
					{ color( 'popupNavBg', __( 'Background', 'bp-team-member' ) ) }
					{ color( 'popupNavBorderColor', __( 'Border color', 'bp-team-member' ) ) }
					<Section>{ __( 'Hover', 'bp-team-member' ) }</Section>
					{ color( 'popupNavHoverColor', __( 'Arrow color', 'bp-team-member' ) ) }
					{ color( 'popupNavHoverBg', __( 'Background', 'bp-team-member' ) ) }
					{ color( 'popupNavHoverBorderColor', __( 'Border color', 'bp-team-member' ) ) }
					<Section>{ __( 'Shape', 'bp-team-member' ) }</Section>
					{ range( 'popupNavRadius', __( 'Border radius (px)', 'bp-team-member' ), 0, 50, 50, 'px' ) }
					{ range( 'popupNavIconSize', __( 'Icon size (px)', 'bp-team-member' ), 8, 32, 14, 'px' ) }

					<Section>{ __( 'Text', 'bp-team-member' ) }</Section>
					<TypoControl { ...f } name="popupNavTypography" label={ __( 'Text typography', 'bp-team-member' ) } />
				</PanelBody>
			) }

			<PanelBody className="bPlPanelBody" title={ __( 'Name', 'bp-team-member' ) } initialOpen={ false }>
				<ElementColor { ...f } attr="nameColor" typo="nameTypography" />
				<HoverColor { ...f } name="nameTypography" />
				{ color( 'nameBg', __( 'Background', 'bp-team-member' ) ) }
				<TypoControl { ...f } name="nameTypography" />
			</PanelBody>

			<PanelBody className="bPlPanelBody" title={ __( 'Designation', 'bp-team-member' ) } initialOpen={ false }>
				<ElementColor { ...f } attr="roleColor" typo="roleTypography" />
				<HoverColor { ...f } name="roleTypography" />
				<TypoControl { ...f } name="roleTypography" />
			</PanelBody>

			<PanelBody className="bPlPanelBody" title={ __( 'Details', 'bp-team-member' ) } initialOpen={ false }>
				<ElementColor { ...f } attr="descriptionColor" typo="detailsTypography" label={ __( 'Text color', 'bp-team-member' ) } />
				<HoverColor { ...f } name="detailsTypography" />
				{ color( 'descriptionLinkColor', __( 'Link color', 'bp-team-member' ) ) }
				<TypoControl { ...f } name="detailsTypography" />
			</PanelBody>

			<PanelBody className="bPlPanelBody" title={ __( 'Info / Contact', 'bp-team-member' ) } initialOpen={ false }>
				<ElementColor { ...f } attr="infoColor" typo="infoTypography" label={ __( 'Text color', 'bp-team-member' ) } />
				<HoverColor { ...f } name="infoTypography" />
				{ color( 'infoLabelColor', __( 'Label color', 'bp-team-member' ) ) }
				{ color( 'infoBg', __( 'Background', 'bp-team-member' ) ) }
				<TypoControl { ...f } name="infoTypography" />
			</PanelBody>

			<PanelBody className="bPlPanelBody" title={ __( 'Social', 'bp-team-member' ) } initialOpen={ false }>
				<p className="bptm-ed-muted">{ __( 'Social icons on the cards and inside the popup, panel and drawer.', 'bp-team-member' ) }</p>
				<Section>{ __( 'Normal', 'bp-team-member' ) }</Section>
				{ color( 'socialIconColor', __( 'Icon color', 'bp-team-member' ) ) }
				{ color( 'socialBg', __( 'Background', 'bp-team-member' ) ) }
				{ color( 'socialBorderColor', __( 'Border color', 'bp-team-member' ) ) }

				<Section>{ __( 'Hover', 'bp-team-member' ) }</Section>
				{ color( 'socialIconHoverColor', __( 'Icon color', 'bp-team-member' ) ) }
				{ color( 'socialHoverBg', __( 'Background', 'bp-team-member' ) ) }
				{ color( 'socialHoverBorderColor', __( 'Border color', 'bp-team-member' ) ) }

				<Section>{ __( 'Size & shape', 'bp-team-member' ) }</Section>
				{ themeRange( 'socialIconSize', __( 'Icon size (px)', 'bp-team-member' ), 8, 40, 14, 'px' ) }
				{ themeRange( 'socialSize', __( 'Button size (px)', 'bp-team-member' ), 16, 80, 34, 'px' ) }
				{ themeRange( 'socialBorderWidth', __( 'Border width (px)', 'bp-team-member' ), 0, 10, 1, 'px' ) }
				{ themeRange( 'socialRadius', __( 'Border radius (%)', 'bp-team-member' ), 0, 50, 50, '%' ) }
				{ themeRange( 'socialGap', __( 'Space between icons (px)', 'bp-team-member' ), 0, 40, 8, 'px' ) }
			</PanelBody>

			<PanelBody className="bPlPanelBody" title={ __( 'Ribbon', 'bp-team-member' ) } initialOpen={ false }>
				<TypoTextColor { ...f } name="ribbonTypography" label={ __( 'Text color', 'bp-team-member' ) } />
				{ color( 'ribbonBg', __( 'Background', 'bp-team-member' ) ) }
				<TypoControl { ...f } name="ribbonTypography" />
			</PanelBody>

			{ !! attributes.enableFeaturing && (
				<PanelBody className="bPlPanelBody" title={ __( 'Featured badge', 'bp-team-member' ) } initialOpen={ false }>
					<p className="bptm-ed-muted">{ __( 'Badge shown on featured members (cards, popup, panel and drawer).', 'bp-team-member' ) }</p>
					<Section>{ __( 'Colors', 'bp-team-member' ) }</Section>
					{ color( 'featuredColor', __( 'Icon color', 'bp-team-member' ) ) }
					{ color( 'featuredBg', __( 'Background', 'bp-team-member' ) ) }
					{ color( 'featuredBorderColor', __( 'Border color', 'bp-team-member' ) ) }

					<Section>{ __( 'Size & shape', 'bp-team-member' ) }</Section>
					{ unit( 'featuredIconSize', __( 'Icon size', 'bp-team-member' ), [ { value: 'px', label: 'px', default: 14 } ] ) }
					{ unit( 'featuredSize', __( 'Badge size', 'bp-team-member' ), [ { value: 'px', label: 'px', default: 32 } ] ) }
					{ unit( 'featuredBorderWidth', __( 'Border width', 'bp-team-member' ), PX ) }
					{ unit( 'featuredRadius', __( 'Border radius', 'bp-team-member' ), [ { value: 'px', label: 'px', default: 0 }, { value: '%', label: '%', default: 50 } ] ) }
				</PanelBody>
			) }

			<PanelBody className="bPlPanelBody" title={ __( 'Read more', 'bp-team-member' ) } initialOpen={ false }>
				<TypoTextColor { ...f } name="readmoreTypography" />
				<HoverColor { ...f } name="readmoreTypography" />
				<TypoControl { ...f } name="readmoreTypography" />
			</PanelBody>

			<PanelBody className="bPlPanelBody" title={ __( 'Card', 'bp-team-member' ) } initialOpen={ false }>
				{ color( 'itemBg', __( 'Background', 'bp-team-member' ) ) }
				{ color( 'itemBgHover', __( 'Background (hover)', 'bp-team-member' ) ) }

				<Section>{ __( 'Border', 'bp-team-member' ) }</Section>
				{ color( 'itemBorderColor', __( 'Border color', 'bp-team-member' ) ) }
				{ themeRange( 'itemBorderWidth', __( 'Border width (px)', 'bp-team-member' ), 0, 10, 1, 'px' ) }
				{ themeRange( 'itemBorderRadius', __( 'Border radius (px)', 'bp-team-member' ), 0, 50, 10, 'px' ) }

				<Section>{ __( 'Spacing & shadow', 'bp-team-member' ) }</Section>
				{ box( 'itemPadding', __( 'Padding', 'bp-team-member' ), { top: '20px', right: '20px', bottom: '20px', left: '20px' } ) }
				<ShadowField { ...f } />
			</PanelBody>

			<PanelBody className="bPlPanelBody" title={ __( 'Image', 'bp-team-member' ) } initialOpen={ false }>
				{ themeRange( 'imageBorderRadius', __( 'Border radius (px)', 'bp-team-member' ), 0, 200, 0, 'px' ) }
			</PanelBody>

			{ pagination && (
				<PanelBody className="bPlPanelBody" title={ __( 'Pagination', 'bp-team-member' ) } initialOpen={ false }>
					{ 'normal-pagination' === pgType && (
						<>
							<Section>{ __( 'Normal', 'bp-team-member' ) }</Section>
							{ color( 'pgColor', __( 'Text color', 'bp-team-member' ) ) }
							{ color( 'pgBg', __( 'Background', 'bp-team-member' ) ) }
							{ color( 'pgBorderColor', __( 'Border color', 'bp-team-member' ) ) }

							<Section>{ __( 'Hover', 'bp-team-member' ) }</Section>
							{ color( 'pgHoverColor', __( 'Text color', 'bp-team-member' ) ) }
							{ color( 'pgHoverBg', __( 'Background', 'bp-team-member' ) ) }
							{ color( 'pgHoverBorderColor', __( 'Border color', 'bp-team-member' ) ) }

							<Section>{ __( 'Active (current page)', 'bp-team-member' ) }</Section>
							{ color( 'pgActiveColor', __( 'Text color', 'bp-team-member' ) ) }
							{ color( 'pgActiveBg', __( 'Background', 'bp-team-member' ) ) }
							{ color( 'pgActiveBorderColor', __( 'Border color', 'bp-team-member' ) ) }

							<Section>{ __( 'Size & border', 'bp-team-member' ) }</Section>
							{ box( 'pgPadding', __( 'Padding', 'bp-team-member' ) ) }
							{ unit( 'pgBorderWidth', __( 'Border width', 'bp-team-member' ), PX ) }
							{ unit( 'pgBorderRadius', __( 'Border radius', 'bp-team-member' ) ) }
						</>
					) }

					{ 'load-more-button' === pgType && (
						<>
							<Section>{ __( 'Load more button', 'bp-team-member' ) }</Section>
							{ color( 'lmColor', __( 'Text color', 'bp-team-member' ) ) }
							{ color( 'lmBg', __( 'Background', 'bp-team-member' ) ) }
							{ color( 'lmBorderColor', __( 'Border color', 'bp-team-member' ) ) }

							<Section>{ __( 'Hover', 'bp-team-member' ) }</Section>
							{ color( 'lmHoverColor', __( 'Text color', 'bp-team-member' ) ) }
							{ color( 'lmHoverBg', __( 'Background', 'bp-team-member' ) ) }

							<Section>{ __( 'Size & border', 'bp-team-member' ) }</Section>
							{ box( 'lmPadding', __( 'Padding', 'bp-team-member' ) ) }
							{ unit( 'lmBorderWidth', __( 'Border width', 'bp-team-member' ), PX ) }
							{ unit( 'lmBorderRadius', __( 'Border radius', 'bp-team-member' ) ) }
						</>
					) }

					{ 'load-more-scroll' === pgType && color( 'pgLoaderColor', __( 'Loader color', 'bp-team-member' ) ) }
				</PanelBody>
			) }

			{ isCarousel( attributes ) && (
				<PanelBody className="bPlPanelBody" title={ __( 'Carousel', 'bp-team-member' ) } initialOpen={ false }>
					<Section>{ __( 'Arrows', 'bp-team-member' ) }</Section>
					<Colors { ...f } list={ [
						[ 'sliderNavColor', __( 'Color', 'bp-team-member' ) ],
						[ 'sliderNavBg', __( 'Background', 'bp-team-member' ) ],
						[ 'sliderNavHoverColor', __( 'Color (hover)', 'bp-team-member' ) ],
						[ 'sliderNavHoverBg', __( 'Background (hover)', 'bp-team-member' ) ],
					] } />
					<Section>{ __( 'Dots', 'bp-team-member' ) }</Section>
					<Colors { ...f } list={ [
						[ 'sliderDotColor', __( 'Color', 'bp-team-member' ) ],
						[ 'sliderDotHoverColor', __( 'Active / hover', 'bp-team-member' ) ],
					] } />
				</PanelBody>
			) }

			{ isFilter( attributes ) && (
				<PanelBody className="bPlPanelBody" title={ __( 'Filter', 'bp-team-member' ) } initialOpen={ false }>
					<Section>{ __( 'Normal', 'bp-team-member' ) }</Section>
					<Colors { ...f } list={ [
						[ 'filterTextColor', __( 'Text', 'bp-team-member' ) ],
						[ 'filterBgColor', __( 'Background', 'bp-team-member' ) ],
						[ 'filterBorderColor', __( 'Border', 'bp-team-member' ) ],
					] } />
					<Section>{ __( 'Active', 'bp-team-member' ) }</Section>
					<Colors { ...f } list={ [
						[ 'filterActiveTextColor', __( 'Text', 'bp-team-member' ) ],
						[ 'filterActiveBgColor', __( 'Background', 'bp-team-member' ) ],
						[ 'filterActiveBorderColor', __( 'Border', 'bp-team-member' ) ],
					] } />
				</PanelBody>
			) }
		</div>
	);
};

export default Style;
