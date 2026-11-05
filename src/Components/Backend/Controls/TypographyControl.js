/**
 * Typography object control.
 *
 * CONTRACT-GAP: the architecture doc does not define the typography object
 * shape. We store the same keys the reference builder uses (only non-empty keys):
 *   font_family (string, Google font family name or '' for theme default)
 *   size (number px, or {desktop,tablet,mobilePortrait,mobile} px map)   weight (string '100'..'900')
 *   transform (string)          style (string normal|italic|oblique)
 *   decoration (string)         line_height (number, unitless)
 *   letter_spacing (number, px) color (string)   hover_color (string)
 */
import {
	Dropdown,
	Button,
	ComboboxControl,
	SelectControl,
	RangeControl,
	ColorPalette,
	BaseControl,
} from '@wordpress/components';
import { useSettings } from '@wordpress/block-editor';
import * as BE from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

import { useState } from '@wordpress/element';

import { DeviceSwitcher } from './Fields';
import { getFonts } from '../../../utils/editorData';
import { DEVICES, fontWeightOptions, textTransformOptions, fontStyleOptions, textDecorationOptions } from '../../../utils/options';

const common = { __nextHasNoMarginBottom: true, __next40pxDefaultSize: true };

export const TYPO_KEYS = [ 'font_family', 'size', 'weight', 'transform', 'style', 'decoration', 'line_height', 'letter_spacing', 'color', 'hover_color' ];

const clean = ( obj ) => {
	const out = {};
	TYPO_KEYS.forEach( ( k ) => {
		if ( undefined !== obj[ k ] && null !== obj[ k ] && '' !== obj[ k ] ) {
			out[ k ] = obj[ k ];
		}
	} );
	return out;
};

const usePalette = () => {
	// useSettings exists in WP >= 6.5; fall back to useSetting.
	const hook = useSettings || BE.useSetting;
	const res = useSettings ? hook( 'color.palette' ) : [ hook( 'color.palette' ) ];
	const palette = Array.isArray( res ) ? res[ 0 ] : res;
	return Array.isArray( palette ) ? palette : [];
};

const summary = ( v ) => {
	const parts = [];
	if ( v.font_family ) {
		parts.push( v.font_family );
	}
	const desktopSize = sizeFor( v.size, 'desktop' );
	if ( desktopSize ) {
		parts.push( `${ desktopSize }px` );
	}
	if ( v.weight ) {
		parts.push( v.weight );
	}
	return parts.length ? parts.join( ' · ' ) : __( 'Default', 'bp-team-member' );
};

const SIZE_DEVICES = [ 'desktop', 'tablet', 'mobilePortrait', 'mobile' ];

/** Font size for one device: `size` is a number (all devices) or a device map. */
const sizeFor = ( size, device ) => {
	if ( size && 'object' === typeof size ) {
		const n = Number( size[ device ] );
		return n > 0 ? n : undefined;
	}
	if ( 'desktop' !== device ) {
		return undefined;
	}
	const n = Number( size );
	return n > 0 ? n : undefined;
};

/** New `size` value with one device changed; collapses to a plain number when only desktop is set. */
const setSize = ( size, device, val ) => {
	const map = {};
	if ( size && 'object' === typeof size ) {
		SIZE_DEVICES.forEach( ( d ) => {
			if ( Number( size[ d ] ) > 0 ) {
				map[ d ] = Number( size[ d ] );
			}
		} );
	} else if ( Number( size ) > 0 ) {
		map.desktop = Number( size );
	}
	if ( Number( val ) > 0 ) {
		map[ device ] = Number( val );
	} else {
		delete map[ device ];
	}
	const keys = Object.keys( map );
	if ( ! keys.length ) {
		return '';
	}
	if ( 1 === keys.length && map.desktop ) {
		return map.desktop;
	}
	return map;
};

const TypographyControl = ( { label, value, onChange } ) => {
	const [ device, setDevice ] = useState( 'desktop' );
	const v = value && 'object' === typeof value && ! Array.isArray( value ) ? value : {};
	const set = ( key, val ) => onChange( clean( { ...v, [ key ]: val } ) );
	const palette = usePalette();
	const fonts = getFonts();
	const hasValue = Object.keys( clean( v ) ).length > 0;

	return (
		<div className="bptm-ed-field bptm-ed-typo">
			<span className="bptm-ed-label">{ label }</span>
			<div className="bptm-ed-typo__actions">
				<Dropdown
					popoverProps={ { placement: 'left-start', offset: 36, shift: true } }
					contentClassName="bptm-ed-typo__popover"
					renderToggle={ ( { isOpen, onToggle } ) => (
						<Button variant="secondary" size="compact" onClick={ onToggle } aria-expanded={ isOpen } icon="edit">
							{ summary( v ) }
						</Button>
					) }
					renderContent={ () => (
						<div className="bptm-ed-typo__content">
							<ComboboxControl
								{ ...common }
								label={ __( 'Font family', 'bp-team-member' ) }
								value={ v.font_family || '' }
								options={ [ { label: __( 'Theme default', 'bp-team-member' ), value: '' } ].concat( fonts.map( ( f ) => ( { label: f, value: f } ) ) ) }
								onChange={ ( val ) => set( 'font_family', val || '' ) }
							/>
							<div className="bptm-ed-typo__size">
								<div className="bptm-ed-columns__head">
									<span className="bptm-ed-label">
										{ __( 'Font size (px)', 'bp-team-member' ) } <em>({ ( DEVICES.find( ( d ) => d.key === device ) || {} ).label })</em>
									</span>
									<DeviceSwitcher device={ device } onChange={ setDevice } />
								</div>
								<RangeControl
									{ ...common }
									hideLabelFromVision
									label={ __( 'Font size (px)', 'bp-team-member' ) }
									min={ 0 }
									max={ 120 }
									allowReset
									resetFallbackValue={ undefined }
									value={ sizeFor( v.size, device ) }
									onChange={ ( val ) => set( 'size', setSize( v.size, device, val ) ) }
								/>
							</div>
							<div className="bptm-ed-typo__row">
								<SelectControl { ...common } label={ __( 'Weight', 'bp-team-member' ) } value={ v.weight ? String( v.weight ) : '' } options={ fontWeightOptions } onChange={ ( val ) => set( 'weight', val ) } />
								<SelectControl { ...common } label={ __( 'Transform', 'bp-team-member' ) } value={ v.transform || '' } options={ textTransformOptions } onChange={ ( val ) => set( 'transform', val ) } />
							</div>
							<div className="bptm-ed-typo__row">
								<SelectControl { ...common } label={ __( 'Style', 'bp-team-member' ) } value={ v.style || '' } options={ fontStyleOptions } onChange={ ( val ) => set( 'style', val ) } />
								<SelectControl { ...common } label={ __( 'Decoration', 'bp-team-member' ) } value={ v.decoration || '' } options={ textDecorationOptions } onChange={ ( val ) => set( 'decoration', val ) } />
							</div>
							<RangeControl
								{ ...common }
								label={ __( 'Line height', 'bp-team-member' ) }
								min={ 0.5 }
								max={ 4 }
								step={ 0.05 }
								allowReset
								resetFallbackValue={ undefined }
								value={ v.line_height ? Number( v.line_height ) : undefined }
								onChange={ ( val ) => set( 'line_height', val ? Number( val ) : '' ) }
							/>
							<RangeControl
								{ ...common }
								label={ __( 'Letter spacing (px)', 'bp-team-member' ) }
								min={ -5 }
								max={ 20 }
								step={ 0.1 }
								allowReset
								resetFallbackValue={ undefined }
								value={ undefined !== v.letter_spacing && '' !== v.letter_spacing ? Number( v.letter_spacing ) : undefined }
								onChange={ ( val ) => set( 'letter_spacing', undefined === val || null === val || Number.isNaN( Number( val ) ) ? '' : Number( val ) ) }
							/>
							<BaseControl __nextHasNoMarginBottom label={ __( 'Color', 'bp-team-member' ) } id="bptm-typo-color">
								<ColorPalette colors={ palette } value={ v.color || '' } enableAlpha onChange={ ( val ) => set( 'color', val || '' ) } />
							</BaseControl>
							<BaseControl __nextHasNoMarginBottom label={ __( 'Hover color', 'bp-team-member' ) } id="bptm-typo-hover-color">
								<ColorPalette colors={ palette } value={ v.hover_color || '' } enableAlpha onChange={ ( val ) => set( 'hover_color', val || '' ) } />
							</BaseControl>
							{ hasValue && (
								<Button variant="link" isDestructive onClick={ () => onChange( {} ) }>
									{ __( 'Reset typography', 'bp-team-member' ) }
								</Button>
							) }
						</div>
					) }
				/>
				{ ( v.color || v.hover_color ) && (
					<span className="bptm-ed-typo__swatches" aria-hidden="true">
						{ v.color && <i style={ { background: v.color } } /> }
						{ v.hover_color && <i style={ { background: v.hover_color } } /> }
					</span>
				) }
			</div>
		</div>
	);
};

export default TypographyControl;
