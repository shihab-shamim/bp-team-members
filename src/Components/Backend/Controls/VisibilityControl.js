/**
 * Visibility toggles per field, per device and per display (card / popup /
 * panel / drawer). Only fields the user changed are stored in the `visibility`
 * attribute; everything else follows the theme defaults from the registry.
 */
import { ToggleControl, Button, CheckboxControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { Segmented } from './Fields';
import { getVisibilityFields } from '../../../utils/editorData';
import { DEVICES } from '../../../utils/options';
import {
	fieldDefault, fieldDevices, isFieldVisible, groupOverrides, setVisibility,
	compactDevices, effectiveLinkType, VIS_DEVICES,
} from '../../../utils/logic';

const GROUP_LABELS = {
	initial: __( 'Card', 'bp-team-member' ),
	popup: __( 'Popup', 'bp-team-member' ),
	panel: __( 'Panel', 'bp-team-member' ),
	drawer: __( 'Drawer', 'bp-team-member' ),
};

const VisibilityControl = ( { attributes, setAttributes } ) => {
	const link = effectiveLinkType( attributes );
	const groups = [ 'initial' ].concat( [ 'popup', 'panel', 'drawer' ].includes( link ) ? [ link ] : [] );
	const [ groupState, setGroup ] = useState( 'initial' );
	const group = groups.includes( groupState ) ? groupState : 'initial';
	const [ open, setOpen ] = useState( null );

	const overrides = groupOverrides( attributes, group );
	const fields = getVisibilityFields();
	const primary = 'initial' === group ? fields.filter( ( f ) => fieldDefault( attributes.theme, f.key ) ) : fields;
	const secondary = 'initial' === group ? fields.filter( ( f ) => ! fieldDefault( attributes.theme, f.key ) ) : [];

	const update = ( key, value ) => setAttributes( { visibility: setVisibility( attributes, group, key, value ) } );

	const row = ( f ) => {
		const has = Object.prototype.hasOwnProperty.call( overrides, f.key );
		const devices = fieldDevices( attributes, f.key, group );
		const mixed = ! VIS_DEVICES.every( ( d ) => devices[ d ] === devices.desktop );
		const isOpen = open === f.key;
		return (
			<div className={ `bptm-ed-vis__row-wrap${ has ? ' is-overridden' : '' }` } key={ f.key }>
				<div className="bptm-ed-vis__row">
					<ToggleControl
						__nextHasNoMarginBottom
						label={ mixed ? `${ f.label } *` : f.label }
						checked={ isFieldVisible( attributes, f.key, group ) }
						onChange={ ( v ) => update( f.key, !! v ) }
					/>
					<Button
						size="small"
						icon="smartphone"
						label={ __( 'Per device', 'bp-team-member' ) }
						showTooltip
						isPressed={ isOpen }
						onClick={ () => setOpen( isOpen ? null : f.key ) }
					/>
					{ has && (
						<Button
							size="small"
							icon="image-rotate"
							label={ __( 'Reset to theme default', 'bp-team-member' ) }
							showTooltip
							onClick={ () => update( f.key, undefined ) }
						/>
					) }
				</div>
				{ isOpen && (
					<div className="bptm-ed-vis__devices">
						{ DEVICES.map( ( d ) => (
							<CheckboxControl
								__nextHasNoMarginBottom
								key={ d.key }
								label={ d.label }
								checked={ !! devices[ d.key ] }
								onChange={ ( v ) => update( f.key, compactDevices( { ...devices, [ d.key ]: !! v } ) ) }
							/>
						) ) }
					</div>
				) }
			</div>
		);
	};

	return (
		<div className="bptm-ed-vis">
			{ groups.length > 1 && (
				<Segmented
					label={ __( 'Fields shown in', 'bp-team-member' ) }
					value={ group }
					options={ groups.map( ( g ) => ( { value: g, label: GROUP_LABELS[ g ] } ) ) }
					onChange={ setGroup }
				/>
			) }
			{ primary.map( row ) }
			{ secondary.length > 0 && (
				<details className="bptm-ed-vis__more">
					<summary>{ __( 'More fields (hidden by this theme by default)', 'bp-team-member' ) }</summary>
					{ secondary.map( row ) }
				</details>
			) }
			<p className="bptm-ed-muted">{ __( '* differs per device.', 'bp-team-member' ) }</p>
			{ Object.keys( attributes.visibility || {} ).length > 0 && (
				<Button variant="link" onClick={ () => setAttributes( { visibility: {} } ) }>
					{ __( 'Reset all to theme defaults', 'bp-team-member' ) }
				</Button>
			) }
		</div>
	);
};

export default VisibilityControl;
