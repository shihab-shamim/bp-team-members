import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { Toggle, Select, NumberField, Range } from '../../Controls/Fields';
import { carouselNavStyleOptions, carouselDotStyleOptions } from '../../../../utils/options';

const Carousel = ( { attributes, setAttributes } ) => {
	const f = { attributes, setAttributes };
	return (
		<>
			<PanelBody title={ __( 'Carousel', 'bp-team-member' ) } initialOpen>
				<Toggle { ...f } name="carouselAutoplay" label={ __( 'Autoplay', 'bp-team-member' ) } />
				{ attributes.carouselAutoplay && (
					<>
						<Toggle { ...f } name="carouselAutoplayHoverPause" label={ __( 'Pause on hover', 'bp-team-member' ) } />
						<NumberField { ...f } name="carouselAutoplayTimeout" label={ __( 'Autoplay delay (ms)', 'bp-team-member' ) } min={ 500 } step={ 100 } />
					</>
				) }
				<NumberField { ...f } name="carouselSpeed" label={ __( 'Slide speed (ms)', 'bp-team-member' ) } min={ 0 } step={ 50 } />
				<Toggle { ...f } name="carouselLoop" label={ __( 'Loop', 'bp-team-member' ) } />
				<Range { ...f } name="carouselItemsToScroll" label={ __( 'Items to scroll', 'bp-team-member' ) } min={ 1 } max={ 6 } />
				<p className="bptm-ed-muted">{ __( 'Visible slides follow the column settings per device (Layout tab).', 'bp-team-member' ) }</p>
			</PanelBody>
			<PanelBody title={ __( 'Navigation', 'bp-team-member' ) } initialOpen={ false }>
				<Toggle { ...f } name="carouselNavsEnabled" label={ __( 'Show arrows', 'bp-team-member' ) } />
				{ attributes.carouselNavsEnabled && <Select { ...f } name="carouselNavsStyle" label={ __( 'Arrow style', 'bp-team-member' ) } options={ carouselNavStyleOptions } /> }
				<Toggle { ...f } name="carouselDotsEnabled" label={ __( 'Show dots', 'bp-team-member' ) } />
				{ attributes.carouselDotsEnabled && <Select { ...f } name="carouselDotsStyle" label={ __( 'Dot style', 'bp-team-member' ) } options={ carouselDotStyleOptions } /> }
				<p className="bptm-ed-muted">{ __( 'Arrow and dot colors are in the Style tab.', 'bp-team-member' ) }</p>
			</PanelBody>
		</>
	);
};

export default Carousel;
