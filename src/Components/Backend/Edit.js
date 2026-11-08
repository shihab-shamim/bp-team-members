import { useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';

import Settings from './Settings/Settings';
import Preview, { EmptyState, shouldShowEmptyState } from './Preview';
import { blankMember, getMembers } from '../../utils/members';

const IMAGE_KEYS = [ 'image', 'flipImage' ];

/** Media Library images (id > 0) saved without their size URLs. */
const missingSizeIds = ( members ) => {
	const ids = [];
	members.forEach( ( m ) => IMAGE_KEYS.forEach( ( k ) => {
		const img = m && m[ k ];
		const id = img && Number( img.id );
		if ( id > 0 && ! ( img.sizes && 'object' === typeof img.sizes && Object.keys( img.sizes ).length ) && ! ids.includes( id ) ) {
			ids.push( id );
		}
	} ) );
	return ids;
};

/** REST media object → { size: { url, width, height } }. */
const sizesFromMedia = ( media ) => {
	const out = {};
	const sizes = media && media.media_details && media.media_details.sizes ? media.media_details.sizes : {};
	Object.keys( sizes ).forEach( ( name ) => {
		const s = sizes[ name ];
		if ( s && s.source_url ) {
			out[ name ] = { url: s.source_url, width: s.width, height: s.height };
		}
	} );
	if ( media && media.source_url && ! out.full ) {
		out.full = { url: media.source_url };
	}
	return out;
};

/**
 * Block edit. Nothing instance-specific (clientId etc.) is ever written to the
 * attributes, so duplicating / copy-pasting the block is safe; the preview derives
 * its DOM ids from the clientId, the front end from the server-side uid.
 */
const Edit = ( { attributes, setAttributes, clientId } ) => {
	const blockProps = useBlockProps( { className: 'bptm-ed-block' } );
	const members = getMembers( attributes );

	// Preview only (nothing is saved): give older Media Library photos their size URLs so the
	// "Thumbnail size" setting picks the right file, like the front end does (class-block.php).
	const ids = missingSizeIds( members );
	const idsKey = ids.join( ',' );
	const medias = useSelect(
		( select ) => ( idsKey ? select( 'core' ).getEntityRecords( 'postType', 'attachment', { include: ids, per_page: ids.length, context: 'view' } ) : null ),
		[ idsKey ]
	);
	const previewAttributes = useMemo( () => {
		if ( ! ids.length || ! Array.isArray( medias ) ) {
			return attributes;
		}
		const byId = {};
		medias.forEach( ( media ) => {
			const sizes = sizesFromMedia( media );
			if ( media && Object.keys( sizes ).length ) {
				byId[ Number( media.id ) ] = sizes;
			}
		} );
		if ( ! Object.keys( byId ).length ) {
			return attributes;
		}
		return {
			...attributes,
			members: members.map( ( m ) => {
				if ( ! m || 'object' !== typeof m ) {
					return m;
				}
				const next = { ...m };
				IMAGE_KEYS.forEach( ( k ) => {
					const img = m[ k ];
					const id = img && Number( img.id );
					if ( id > 0 && byId[ id ] && ! ( img.sizes && Object.keys( img.sizes ).length ) ) {
						next[ k ] = { ...img, sizes: byId[ id ] };
					}
				} );
				return next;
			} ),
		};
	}, [ attributes, medias ] );

	return (
		<>
			<Settings attributes={ attributes } setAttributes={ setAttributes } />
			<div { ...blockProps }>
				{ shouldShowEmptyState( attributes ) ? (
					<EmptyState onAdd={ () => setAttributes( { members: [ ...members, blankMember( members ) ] } ) } />
				) : (
					<Preview clientId={ clientId } attributes={ previewAttributes } />
				) }
			</div>
		</>
	);
};

export default Edit;
