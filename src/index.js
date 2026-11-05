import { registerBlockType } from '@wordpress/blocks';

import './editor.scss';
import metadata from './block.json';
import Edit from './Components/Backend/Edit';
import { blockIcon } from './utils/icons';

// Dynamic block: markup comes from src/render.php, nothing is saved in post content.
registerBlockType( metadata, {
	icon: blockIcon,
	edit: Edit,
	save: () => null,
} );
