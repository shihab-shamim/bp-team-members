/**
 * Thin wrappers around @wordpress/components bound to one block attribute.
 */
import * as WPC from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { DEVICES } from '../../../utils/options';

const {
	ToggleControl,
	SelectControl,
	RangeControl,
	TextControl,
	Button,
} = WPC;

export const UnitControl = WPC.UnitControl || WPC.__experimentalUnitControl;
export const BoxControl = WPC.BoxControl || WPC.__experimentalBoxControl;
export const NumberControl = WPC.NumberControl || WPC.__experimentalNumberControl;
export const ToggleGroupControl = WPC.ToggleGroupControl || WPC.__experimentalToggleGroupControl;
export const ToggleGroupControlOption = WPC.ToggleGroupControlOption || WPC.__experimentalToggleGroupControlOption;

const common = { __nextHasNoMarginBottom: true, __next40pxDefaultSize: true };

export const Toggle = ( { attributes, setAttributes, name, label, help, disabled } ) => (
	<ToggleControl
		__nextHasNoMarginBottom
		className="bptm-ed-field"
		label={ label }
		help={ help }
		disabled={ disabled }
		checked={ !! attributes[ name ] }
		onChange={ ( v ) => setAttributes( { [ name ]: !! v } ) }
	/>
);

export const Select = ( { attributes, setAttributes, name, label, help, options, disabled, value } ) => (
	<SelectControl
		{ ...common }
		className="bptm-ed-field"
		label={ label }
		help={ help }
		disabled={ disabled }
		value={ undefined !== value ? value : attributes[ name ] }
		options={ options }
		onChange={ ( v ) => setAttributes( { [ name ]: v } ) }
	/>
);

export const Text = ( { attributes, setAttributes, name, label, help, placeholder } ) => (
	<TextControl
		{ ...common }
		className="bptm-ed-field"
		label={ label }
		help={ help }
		placeholder={ placeholder }
		value={ attributes[ name ] || '' }
		onChange={ ( v ) => setAttributes( { [ name ]: v } ) }
	/>
);

export const Range = ( { attributes, setAttributes, name, label, help, min = 0, max = 100, step = 1, allowReset = false, resetFallbackValue } ) => (
	<RangeControl
		{ ...common }
		className="bptm-ed-field"
		label={ label }
		help={ help }
		min={ min }
		max={ max }
		step={ step }
		allowReset={ allowReset }
		resetFallbackValue={ resetFallbackValue }
		value={ Number( attributes[ name ] ) }
		onChange={ ( v ) => setAttributes( { [ name ]: undefined === v || null === v || Number.isNaN( Number( v ) ) ? resetFallbackValue ?? min : Number( v ) } ) }
	/>
);

export const NumberField = ( { attributes, setAttributes, name, label, help, min, max, step = 1 } ) => {
	const Comp = NumberControl || TextControl;
	return (
		<Comp
			{ ...common }
			className="bptm-ed-field"
			label={ label }
			help={ help }
			type="number"
			min={ min }
			max={ max }
			step={ step }
			value={ attributes[ name ] }
			onChange={ ( v ) => {
				const n = parseInt( v, 10 );
				if ( Number.isNaN( n ) ) {
					return;
				}
				let next = n;
				if ( undefined !== min && next < min ) {
					next = min;
				}
				if ( undefined !== max && next > max ) {
					next = max;
				}
				setAttributes( { [ name ]: next } );
			} }
		/>
	);
};

/** Segmented control (ToggleGroupControl), falls back to SelectControl. */
export const Segmented = ( { label, value, options, onChange, help } ) => {
	if ( ! ToggleGroupControl || ! ToggleGroupControlOption ) {
		return <SelectControl { ...common } label={ label } help={ help } value={ value } options={ options } onChange={ onChange } />;
	}
	return (
		<ToggleGroupControl { ...common } className="bptm-ed-field" isBlock label={ label } help={ help } value={ value } onChange={ onChange }>
			{ options.map( ( o ) => (
				<ToggleGroupControlOption key={ o.value } value={ o.value } label={ o.label } disabled={ o.disabled } />
			) ) }
		</ToggleGroupControl>
	);
};

export const Unit = ( { label, value, onChange, units, help } ) => (
	<div className="bptm-ed-field">
		<UnitControl
			__next40pxDefaultSize
			label={ label }
			help={ help }
			value={ value || '' }
			units={ units || [ { value: 'px', label: 'px', default: 0 }, { value: '%', label: '%', default: 0 }, { value: 'em', label: 'em', default: 0 }, { value: 'rem', label: 'rem', default: 0 } ] }
			onChange={ ( v ) => onChange( v && /^-?[\d.]+/.test( v ) ? v : '' ) }
		/>
	</div>
);

/** Device switcher (desktop / tablet / mobile landscape / mobile). */
export const DeviceSwitcher = ( { device, onChange } ) => (
	<div className="bptm-ed-devices" role="group" aria-label={ __( 'Device', 'bp-team-member' ) }>
		{ DEVICES.map( ( d ) => (
			<Button
				key={ d.key }
				size="small"
				className={ `bptm-ed-device bptm-ed-device--${ d.key }${ device === d.key ? ' is-active' : '' }` }
				icon={ d.icon }
				label={ d.label }
				showTooltip
				isPressed={ device === d.key }
				onClick={ () => onChange( d.key ) }
			/>
		) ) }
	</div>
);

const DEFAULT_COLUMNS = { desktop: 4, tablet: 3, mobilePortrait: 2, mobile: 1 };

export const ColumnsControl = ( { value, onChange, disabled } ) => {
	const [ device, setDevice ] = useState( 'desktop' );
	const cols = { ...DEFAULT_COLUMNS, ...( value && 'object' === typeof value ? value : {} ) };
	const label = ( DEVICES.find( ( d ) => d.key === device ) || {} ).label;
	return (
		<div className="bptm-ed-field bptm-ed-columns">
			<div className="bptm-ed-columns__head">
				<span className="bptm-ed-label">{ __( 'Columns', 'bp-team-member' ) } <em>({ label })</em></span>
				<DeviceSwitcher device={ device } onChange={ setDevice } />
			</div>
			<RangeControl
				{ ...common }
				hideLabelFromVision
				label={ `${ __( 'Columns', 'bp-team-member' ) } ${ label }` }
				min={ 1 }
				max={ 6 }
				disabled={ disabled }
				value={ Number( cols[ device ] ) || DEFAULT_COLUMNS[ device ] }
				onChange={ ( v ) => onChange( { ...cols, [ device ]: Math.min( 6, Math.max( 1, Number( v ) || DEFAULT_COLUMNS[ device ] ) ) } ) }
			/>
			<p className="bptm-ed-muted bptm-ed-columns__summary">
				{ DEVICES.map( ( d ) => `${ d.label }: ${ cols[ d.key ] }` ).join( ' · ' ) }
			</p>
		</div>
	);
};

export const Notice = ( { children, status = 'info' } ) => <div className={ `bptm-ed-notice is-${ status }` }>{ children }</div>;
