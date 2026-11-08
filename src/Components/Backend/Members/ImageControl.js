/**
 * Member image picker: media library (MediaUpload) with preview, replace and remove.
 * Value: { id, url, alt }. Users who cannot upload get a plain URL field.
 */
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { IMAGE_BLANK, resolveUrl } from '../../../utils/members';

const common = { __nextHasNoMarginBottom: true, __next40pxDefaultSize: true };

const pickUrl = ( media ) => {
	const sizes = media && media.sizes ? media.sizes : {};
	return ( sizes.large && sizes.large.url ) || media.url || '';
};

/**
 * Size URLs of the selected attachment ({ thumbnail: { url }, medium: { url }, large: { url }, full: { url }, … }),
 * so the browser renderer can honour the block's image size without asking the server.
 *
 * @param {Object} media Media object from the media library.
 * @return {Object} Sizes.
 */
const pickSizes = ( media ) => {
	const out = {};
	const sizes = media && media.sizes && 'object' === typeof media.sizes ? media.sizes : {};
	Object.keys( sizes ).forEach( ( name ) => {
		const s = sizes[ name ];
		const url = s && ( s.url || s.source_url );
		if ( 'string' === typeof url && /^(https?:)?\/\//i.test( url ) && /^[a-z0-9_-]+$/i.test( name ) ) {
			out[ name ] = { url };
		}
	} );
	if ( ! out.full && media && 'string' === typeof media.url && media.url ) {
		out.full = { url: media.url };
	}
	return out;
};

const ImageControl = ( { label, help, value, onChange, defaultAlt = '' } ) => {
	const img = { ...IMAGE_BLANK, ...( value && 'object' === typeof value ? value : {} ) };
	const src = resolveUrl( img.url );
	const hasImage = !! ( img.url || img.id );

	const onSelect = ( media ) => {
		if ( ! media || ! media.id ) {
			return;
		}
		onChange( { id: Number( media.id ) || 0, url: pickUrl( media ), alt: media.alt || img.alt || defaultAlt || '', sizes: pickSizes( media ) } );
	};

	return (
		<div className="bptm-ed-field bptm-ed-image">
			<span className="bptm-ed-label">{ label }</span>
			{ hasImage && (
				<div className="bptm-ed-image__preview">
					{ src ? <img src={ src } alt={ img.alt || '' } /> : <span className="bptm-ed-muted">{ `#${ img.id }` }</span> }
				</div>
			) }
			<MediaUploadCheck
				fallback={
					<TextControl
						{ ...common }
						type="url"
						label={ __( 'Image URL', 'bp-team-member' ) }
						value={ img.url || '' }
						onChange={ ( url ) => onChange( { ...img, id: 0, url } ) }
					/>
				}
			>
				<MediaUpload
					allowedTypes={ [ 'image' ] }
					value={ img.id || undefined }
					onSelect={ onSelect }
					render={ ( { open } ) => (
						<div className="bptm-ed-image__actions">
							<Button variant="secondary" size="compact" onClick={ open }>
								{ hasImage ? __( 'Replace', 'bp-team-member' ) : __( 'Select image', 'bp-team-member' ) }
							</Button>
							{ hasImage && (
								<Button variant="tertiary" size="compact" isDestructive onClick={ () => onChange( { ...IMAGE_BLANK } ) }>
									{ __( 'Remove image', 'bp-team-member' ) }
								</Button>
							) }
						</div>
					) }
				/>
			</MediaUploadCheck>
			{ hasImage && (
				<TextControl
					{ ...common }
					className="bptm-ed-image__alt"
					label={ __( 'Alt text', 'bp-team-member' ) }
					value={ img.alt || '' }
					onChange={ ( alt ) => onChange( { ...img, alt } ) }
				/>
			) }
			{ help && <p className="bptm-ed-muted">{ help }</p> }
		</div>
	);
};

export default ImageControl;
