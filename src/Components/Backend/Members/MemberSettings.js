/**
 * Settings of one member (ItemSettings for bpl-tools ItemsPanel).
 * Receives { attributes, setAttributes, arrKey, index } from ItemsPanel.
 */
import { PanelBody, TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import ImageControl from './ImageControl';
import { SocialLinks, Skills } from './Repeaters';
import { termLabel } from '../../../utils/editorData';
import { TERM_FIELDS } from '../../../utils/members';

const common = { __nextHasNoMarginBottom: true, __next40pxDefaultSize: true };

const MemberSettings = ( { attributes, setAttributes, arrKey = 'members', index } ) => {
	const items = Array.isArray( attributes && attributes[ arrKey ] ) ? attributes[ arrKey ] : [];
	const member = items[ index ];
	if ( ! member || 'object' !== typeof member ) {
		return null;
	}

	const update = ( patch ) => setAttributes( { [ arrKey ]: items.map( ( m, i ) => ( i === index ? { ...m, ...patch } : m ) ) } );

	const text = ( field, label, props = {} ) => (
		<TextControl
			{ ...common }
			className="bptm-ed-field"
			label={ label }
			value={ 'string' === typeof member[ field ] ? member[ field ] : String( member[ field ] ?? '' ) }
			onChange={ ( v ) => update( { [ field ]: v } ) }
			{ ...props }
		/>
	);

	const htmlOn = !! attributes.allowHtmlDetails;

	return (
		<div className="bptm-ed-member">
			<PanelBody className="bptm-ed-subpanel" title={ __( 'Basic', 'bp-team-member' ) } initialOpen>
				{ text( 'name', __( 'Name', 'bp-team-member' ) ) }
				{ text( 'designation', __( 'Designation', 'bp-team-member' ) ) }
				<TextareaControl
					__nextHasNoMarginBottom
					className="bptm-ed-field"
					label={ __( 'Details', 'bp-team-member' ) }
					rows={ 6 }
					value={ member.details || '' }
					onChange={ ( v ) => update( { details: v } ) }
					help={ htmlOn ? __( 'Blank lines start new paragraphs. HTML is allowed (General → Content → Allow HTML in details is on).', 'bp-team-member' ) : __( 'Blank lines start new paragraphs.', 'bp-team-member' ) }
				/>
				<ImageControl
					label={ __( 'Image', 'bp-team-member' ) }
					value={ member.image }
					defaultAlt={ member.name }
					onChange={ ( image ) => update( { image } ) }
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					className="bptm-ed-field"
					label={ __( 'Featured member', 'bp-team-member' ) }
					checked={ !! member.featured }
					onChange={ ( v ) => update( { featured: !! v } ) }
				/>
				{ text( 'ribbon', __( 'Ribbon', 'bp-team-member' ), { help: __( 'Short label shown on the card ribbon, e.g. “CEO”.', 'bp-team-member' ) } ) }
			</PanelBody>

			<PanelBody className="bptm-ed-subpanel" title={ __( 'Contact', 'bp-team-member' ) } initialOpen={ false }>
				{ text( 'company', __( 'Company', 'bp-team-member' ) ) }
				{ text( 'companyWebsite', __( 'Company website', 'bp-team-member' ), { type: 'url', placeholder: 'https://' } ) }
				{ text( 'landPhone', __( 'Land phone', 'bp-team-member' ), { type: 'tel' } ) }
				{ text( 'cellPhone', __( 'Cell phone', 'bp-team-member' ), { type: 'tel' } ) }
				{ text( 'email', __( 'Email', 'bp-team-member' ), { type: 'email' } ) }
				{ text( 'emailCc', __( 'Email CC', 'bp-team-member' ) ) }
				{ text( 'emailBcc', __( 'Email BCC', 'bp-team-member' ) ) }
				{ text( 'address', __( 'Address', 'bp-team-member' ) ) }
				{ text( 'zipCode', __( 'Zip code', 'bp-team-member' ) ) }
				{ text( 'vcard', __( 'vCard URL', 'bp-team-member' ), { type: 'url', placeholder: 'https://' } ) }
				{ text( 'customUrl', __( 'Custom URL', 'bp-team-member' ), { type: 'url', placeholder: 'https://', help: __( 'Used when the link type is “Custom URL”.', 'bp-team-member' ) } ) }
			</PanelBody>

			<PanelBody className="bptm-ed-subpanel" title={ __( 'Social links', 'bp-team-member' ) } initialOpen={ false }>
				<SocialLinks value={ member.social } onChange={ ( social ) => update( { social } ) } />
			</PanelBody>

			<PanelBody className="bptm-ed-subpanel" title={ __( 'Skills', 'bp-team-member' ) } initialOpen={ false }>
				<Skills value={ member.skills } onChange={ ( skills ) => update( { skills } ) } />
			</PanelBody>

			<PanelBody className="bptm-ed-subpanel" title={ __( 'Groups & filters', 'bp-team-member' ) } initialOpen={ false }>
				<p className="bptm-ed-muted">{ __( 'Comma-separated values, e.g. “Design, Marketing”. Used by filters, category tabs and the Query include/exclude settings.', 'bp-team-member' ) }</p>
				{ TERM_FIELDS.map( ( t ) => <Fragment key={ t.field }>{ text( t.field, termLabel( t.key ) ) }</Fragment> ) }
			</PanelBody>

			<PanelBody className="bptm-ed-subpanel" title={ __( 'Flip image', 'bp-team-member' ) } initialOpen={ false }>
				<ImageControl
					label={ __( 'Back side image', 'bp-team-member' ) }
					help={ __( 'Shown on the back of the card in flip themes.', 'bp-team-member' ) }
					value={ member.flipImage }
					defaultAlt={ member.name }
					onChange={ ( flipImage ) => update( { flipImage } ) }
				/>
			</PanelBody>
		</div>
	);
};

export default MemberSettings;
