/**
 * Group of color controls, one per string attribute.
 */
import { PanelColorSettings } from '@wordpress/block-editor';

const ColorFields = ( { title, attributes, setAttributes, colors, initialOpen = false } ) => (
	<PanelColorSettings
		__experimentalIsRenderedInSidebar
		className="bptm-ed-colors"
		title={ title }
		initialOpen={ initialOpen }
		enableAlpha
		colorSettings={ colors.map( ( c ) => ( {
			label: c.label,
			value: attributes[ c.name ] || undefined,
			onChange: ( v ) => setAttributes( { [ c.name ]: v || '' } ),
			clearable: true,
		} ) ) }
	/>
);

export default ColorFields;
