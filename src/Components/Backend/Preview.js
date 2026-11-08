/**
 * Live editor preview: the block renders in the browser from its attributes (same React component as the
 * front end), so every inspector change shows instantly, without any server request.
 *
 * - Links / form submits inside the preview never navigate (popup / panel portals handle their own links).
 * - After the first entrance animation, re-renders never replay it (`is-settled`).
 */
import { Placeholder, Button } from '@wordpress/components';
import { useEffect, useRef, memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import TeamMembers from '../Common/Team/TeamMembers';
import { htmlClass } from '../Common/Team/sanitize';
import { blockIcon } from '../../utils/icons';

export const EmptyState = ( { onAdd } ) => (
	<Placeholder
		icon={ blockIcon }
		label={ __( 'BP Team Member', 'bp-team-member' ) }
		instructions={ __( 'This block has no team members yet. Add your first member, then fill in its details in the sidebar (General → Team Members).', 'bp-team-member' ) }
		className="bptm-ed-empty"
	>
		<Button variant="primary" onClick={ onAdd }>
			{ __( 'Add member', 'bp-team-member' ) }
		</Button>
	</Placeholder>
);

const Preview = ( { attributes, clientId } ) => {
	const ref = useRef( null );
	const uid = 'e' + String( clientId || '' ).replace( /[^a-z0-9]/gi, '' ).slice( 0, 11 ).toLowerCase();
	const anchor = attributes && 'string' === typeof attributes.anchor ? htmlClass( attributes.anchor ) : '';
	const domId = anchor || 'bptm-' + uid;

	useEffect( () => {
		const el = ref.current;
		if ( ! el ) {
			return undefined;
		}
		const win = el.ownerDocument.defaultView || window;
		const settle = win.setTimeout( () => el.classList.add( 'is-settled' ), 1500 );
		const stopLink = ( e ) => {
			const a = e.target && e.target.closest ? e.target.closest( 'a[href]' ) : null;
			if ( a ) {
				e.preventDefault();
			}
		};
		const stopSubmit = ( e ) => e.preventDefault();
		el.addEventListener( 'click', stopLink );
		el.addEventListener( 'submit', stopSubmit );
		return () => {
			win.clearTimeout( settle );
			el.removeEventListener( 'click', stopLink );
			el.removeEventListener( 'submit', stopSubmit );
		};
	}, [] );

	return (
		<div className="bptm-ed-preview" ref={ ref }>
			<TeamMembers attributes={ attributes } uid={ uid } domId={ domId } isEditor />
		</div>
	);
};

export const shouldShowEmptyState = ( attributes ) => ! ( Array.isArray( attributes.members ) && attributes.members.length );

export default memo( Preview );
