import { useBlockProps } from '@wordpress/block-editor';

import Settings from './Settings/Settings';
import Preview, { EmptyState, shouldShowEmptyState } from './Preview';

/**
 * Block edit. Nothing instance-specific (clientId etc.) is ever written to the
 * attributes, so duplicating / copy-pasting the block is safe; the server
 * generates a unique wrapper id per render.
 */
const Edit = ( { attributes, setAttributes, name } ) => {
	const blockProps = useBlockProps( { className: 'bptm-ed-block' } );

	return (
		<>
			<Settings attributes={ attributes } setAttributes={ setAttributes } />
			<div { ...blockProps }>
				{ shouldShowEmptyState() ? <EmptyState /> : <Preview name={ name } attributes={ attributes } /> }
			</div>
		</>
	);
};

export default Edit;
