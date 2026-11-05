/**
 * Small schematic SVG previews of each theme, drawn procedurally from the theme
 * family and variant number. Purely illustrative — no images.
 */
const W = 72;
const H = 52;
const C = {
	accent: '#4527a4',
	soft: '#d9d2f3',
	img: '#b9b0dc',
	line: '#c5c9d1',
	dark: '#5b6170',
	bg: '#ffffff',
	page: '#f3f4f7',
};

const variantOf = ( id ) => {
	const m = String( id ).match( /(\d+)$/ );
	return m ? parseInt( m[ 1 ], 10 ) : 1;
};

const Lines = ( { x, y, w, center = false, n = 2, gap = 3.2 } ) => {
	const out = [];
	for ( let i = 0; i < n; i++ ) {
		const lw = 0 === i ? w : w * 0.65;
		const lx = center ? x + ( w - lw ) / 2 : x;
		out.push( <rect key={ i } x={ lx } y={ y + i * gap } width={ lw } height={ 0 === i ? 2 : 1.6 } rx={ 0.8 } fill={ 0 === i ? C.dark : C.line } /> );
	}
	return <>{ out }</>;
};

const Dots = ( { x, y, n = 3, r = 1.1, gap = 3.4, color = C.accent } ) => {
	const out = [];
	for ( let i = 0; i < n; i++ ) {
		out.push( <circle key={ i } cx={ x + i * gap } cy={ y } r={ r } fill={ color } /> );
	}
	return <>{ out }</>;
};

const gridCard = ( x, y, w, h, v, k ) => {
	const kind = ( ( v - 1 ) % 6 ) + 1;
	const imgH = h * 0.55;
	switch ( kind ) {
		case 2: // Bordered card, inset image, left-aligned text.
			return (
				<g key={ k }>
					<rect x={ x } y={ y } width={ w } height={ h } rx={ 2.5 } fill={ C.bg } stroke={ C.soft } strokeWidth={ 0.8 } />
					<rect x={ x + 2 } y={ y + 2 } width={ w - 4 } height={ imgH - 2 } rx={ 1.5 } fill={ C.img } />
					<Lines x={ x + 2.5 } y={ y + imgH + 4 } w={ w - 5 } />
				</g>
			);
		case 3: // Name band over the image.
			return (
				<g key={ k }>
					<rect x={ x } y={ y } width={ w } height={ h } rx={ 1 } fill={ C.img } />
					<rect x={ x } y={ y + h - 10 } width={ w } height={ 10 } fill={ C.accent } opacity={ 0.9 } />
					<rect x={ x + 2 } y={ y + h - 7.5 } width={ w * 0.6 } height={ 1.8 } fill="#fff" />
					<rect x={ x + 2 } y={ y + h - 4 } width={ w * 0.4 } height={ 1.4 } fill="#fff" opacity={ 0.7 } />
				</g>
			);
		case 4: // Hover icons over the image.
			return (
				<g key={ k }>
					<rect x={ x } y={ y } width={ w } height={ h } rx={ 1 } fill={ C.bg } />
					<rect x={ x } y={ y } width={ w } height={ imgH + 2 } rx={ 1 } fill={ C.img } />
					<rect x={ x } y={ y } width={ w } height={ imgH + 2 } rx={ 1 } fill={ C.accent } opacity={ 0.35 } />
					<Dots x={ x + w / 2 - 3.4 } y={ y + imgH / 2 + 1 } color="#fff" r={ 1.3 } />
					<Lines x={ x + 2 } y={ y + imgH + 6 } w={ w - 4 } center />
				</g>
			);
		case 5: // Rounded card with social row.
			return (
				<g key={ k }>
					<rect x={ x } y={ y } width={ w } height={ h } rx={ 4 } fill={ C.bg } />
					<rect x={ x + 2 } y={ y + 2 } width={ w - 4 } height={ imgH - 4 } rx={ 3 } fill={ C.img } />
					<Lines x={ x + 2 } y={ y + imgH + 2 } w={ w - 4 } center />
					<Dots x={ x + w / 2 - 3.4 } y={ y + h - 3 } />
				</g>
			);
		case 6: // Dark content box overlapping the image.
			return (
				<g key={ k }>
					<rect x={ x } y={ y } width={ w } height={ imgH + 6 } rx={ 1 } fill={ C.img } />
					<rect x={ x + 2 } y={ y + imgH } width={ w - 4 } height={ h - imgH } rx={ 1.5 } fill={ C.dark } />
					<rect x={ x + 4 } y={ y + imgH + 4 } width={ w - 8 } height={ 1.8 } fill="#fff" />
					<rect x={ x + 4 } y={ y + imgH + 8 } width={ ( w - 8 ) * 0.6 } height={ 1.4 } fill="#fff" opacity={ 0.6 } />
				</g>
			);
		default: // 1: image on top, centered text.
			return (
				<g key={ k }>
					<rect x={ x } y={ y } width={ w } height={ h } rx={ 1 } fill={ C.bg } />
					<rect x={ x + 1 } y={ y + 1 } width={ w - 2 } height={ imgH } rx={ 1 } fill={ C.img } />
					<Lines x={ x + 2 } y={ y + imgH + 4 } w={ w - 4 } center />
				</g>
			);
	}
};

const circleCard = ( x, y, w, h, v, k ) => {
	const r = w * 0.3;
	const cx = x + w / 2;
	const cy = y + r + 3;
	return (
		<g key={ k }>
			{ v % 2 === 0 && <rect x={ x } y={ y } width={ w } height={ h } rx={ 2 } fill={ C.bg } /> }
			<circle cx={ cx } cy={ cy } r={ r } fill={ C.img } stroke={ v > 2 ? C.accent : 'none' } strokeWidth={ v > 2 ? 1 : 0 } />
			{ 5 === v && <circle cx={ cx } cy={ cy } r={ r + 2 } fill="none" stroke={ C.soft } strokeWidth={ 1 } strokeDasharray="2 1.5" /> }
			<Lines x={ x + 2 } y={ cy + r + 4 } w={ w - 4 } center />
			{ ( 3 === v || 6 === v ) && <Dots x={ cx - 3.4 } y={ y + h - 2 } /> }
		</g>
	);
};

const horizontalCard = ( x, y, w, h, v, k ) => {
	const right = 0 === v % 2;
	const round = v >= 8 || 3 === v;
	const iw = h - 4;
	const ix = right ? x + w - iw - 2 : x + 2;
	const tx = right ? x + 3 : x + iw + 5;
	return (
		<g key={ k }>
			<rect x={ x } y={ y } width={ w } height={ h } rx={ 1.5 } fill={ C.bg } />
			{ round ? <circle cx={ ix + iw / 2 } cy={ y + h / 2 } r={ iw / 2 } fill={ C.img } /> : <rect x={ ix } y={ y + 2 } width={ iw } height={ iw } rx={ 1 } fill={ C.img } /> }
			<Lines x={ tx } y={ y + 4 } w={ w - iw - 9 } n={ 3 } />
			{ v > 4 && <Dots x={ tx + 1 } y={ y + h - 3 } n={ 3 } r={ 0.9 } gap={ 2.8 } /> }
		</g>
	);
};

const flipCard = ( x, y, w, h, v, k ) => (
	<g key={ k }>
		<rect x={ x } y={ y } width={ w } height={ h } rx={ 1.5 } fill={ 0 === k % 2 ? C.img : C.accent } />
		{ 0 === k % 2 ? (
			<>
				<polygon points={ `${ x + w - 6 },${ y } ${ x + w },${ y } ${ x + w },${ y + 6 }` } fill={ C.page } />
				<rect x={ x + 2 } y={ y + h - 6 } width={ w - 4 } height={ 4 } fill="#fff" opacity={ 0.8 } />
			</>
		) : (
			<>
				<Lines x={ x + 2 } y={ y + 4 } w={ w - 4 } n={ 3 } center />
				<Dots x={ x + w / 2 - 3.4 } y={ y + h - 4 } color="#fff" />
			</>
		) }
		{ 1 === k && (
			<path d={ `M${ x - 4 } ${ y + h / 2 - 3 } a3 3 0 1 1 0 6` } fill="none" stroke={ C.dark } strokeWidth={ 0.9 } markerEnd="" />
		) }
		{ v > 3 && 0 === k % 2 && <circle cx={ x + w / 2 } cy={ y + h / 2 - 3 } r={ 3 } fill="#fff" opacity={ 0.6 } /> }
	</g>
);

const Table = ( { v } ) => {
	const rows = [];
	for ( let i = 0; i < 4; i++ ) {
		const y = 10 + i * 9.5;
		rows.push(
			<g key={ i }>
				{ ( 3 === v % 5 || 8 === v ) && 1 === i % 2 && <rect x={ 5 } y={ y - 1 } width={ 62 } height={ 9 } fill={ C.soft } opacity={ 0.6 } /> }
				<circle cx={ 10 } cy={ y + 3.5 } r={ 3 } fill={ C.img } />
				<rect x={ 16 } y={ y + 2.6 } width={ 14 } height={ 1.8 } rx={ 0.8 } fill={ C.dark } />
				<rect x={ 34 } y={ y + 2.6 } width={ 12 } height={ 1.6 } rx={ 0.8 } fill={ C.line } />
				<rect x={ 50 } y={ y + 2.6 } width={ 12 } height={ 1.6 } rx={ 0.8 } fill={ C.line } />
				{ ( 1 === v % 5 || 6 === v ) && <rect x={ 5 } y={ y + 8 } width={ 62 } height={ 0.6 } fill={ C.line } /> }
			</g>
		);
	}
	const boxed = 2 === v % 5 || 7 === v;
	return (
		<>
			<rect x={ 5 } y={ 4 } width={ 62 } height={ 5 } fill={ C.accent } />
			{ v >= 9 && <rect x={ 5 } y={ 0.5 } width={ 20 } height={ 2.5 } rx={ 1 } fill={ C.soft } /> }
			{ rows }
			{ boxed && <rect x={ 5 } y={ 4 } width={ 62 } height={ 44 } fill="none" stroke={ C.line } strokeWidth={ 0.7 } /> }
		</>
	);
};

const List = ( { v } ) => {
	const rows = [];
	for ( let i = 0; i < 3; i++ ) {
		const y = 4 + i * 15.5;
		const round = 0 === v % 2;
		rows.push(
			<g key={ i }>
				<rect x={ 4 } y={ y } width={ 64 } height={ 13 } rx={ 1.5 } fill={ C.bg } />
				{ round ? <circle cx={ 11 } cy={ y + 6.5 } r={ 5 } fill={ C.img } /> : <rect x={ 6 } y={ y + 1.5 } width={ 10 } height={ 10 } fill={ C.img } /> }
				<Lines x={ 20 } y={ y + 3 } w={ 28 } n={ 3 } gap={ 2.8 } />
				{ v >= 3 && <rect x={ 54 } y={ y + 4.5 } width={ 11 } height={ 4 } rx={ 2 } fill={ C.accent } /> }
			</g>
		);
	}
	return <>{ rows }</>;
};

const Sidebar = ( { v } ) => {
	const rows = [];
	const n = 3 === v ? 4 : 3;
	const step = 3 === v ? 11.5 : 15.5;
	for ( let i = 0; i < n; i++ ) {
		const y = 4 + i * step;
		const s = 3 === v ? 8 : 12;
		rows.push(
			<g key={ i }>
				{ 2 === v && <rect x={ 14 } y={ y - 1 } width={ 44 } height={ 14 } rx={ 3 } fill={ C.bg } /> }
				{ 2 === v && <circle cx={ 22 } cy={ y + 6 } r={ 5 } fill={ C.img } stroke={ C.soft } strokeWidth={ 0.8 } /> }
				{ 1 === v && <rect x={ 16 } y={ y } width={ s } height={ s } fill={ C.img } stroke={ C.line } strokeWidth={ 0.8 } /> }
				{ 3 === v && <rect x={ 16 } y={ y } width={ s } height={ s } rx={ 1 } fill={ C.img } /> }
				<Lines x={ 2 === v ? 30 : 16 + s + 3 } y={ y + ( 3 === v ? 2 : 3 ) } w={ 22 } n={ 2 } gap={ 3 } />
				{ 3 !== v && <Dots x={ 2 === v ? 31 : 16 + s + 4 } y={ y + 10.5 } n={ 3 } r={ 0.8 } gap={ 2.6 } /> }
				{ 3 === v && <rect x={ 16 } y={ y + 10 } width={ 40 } height={ 0.5 } fill={ C.line } /> }
			</g>
		);
	}
	return <>{ rows }</>;
};

const Filters = () => (
	<>
		<rect x={ 18 } y={ 3 } width={ 10 } height={ 4 } rx={ 2 } fill={ C.accent } />
		<rect x={ 30 } y={ 3 } width={ 10 } height={ 4 } rx={ 2 } fill={ C.soft } />
		<rect x={ 42 } y={ 3 } width={ 10 } height={ 4 } rx={ 2 } fill={ C.soft } />
	</>
);

const Row = ( { draw, v, y = 6, h = 40, n = 3 } ) => {
	const gap = 4;
	const w = ( W - 8 - gap * ( n - 1 ) ) / n;
	const out = [];
	for ( let i = 0; i < n; i++ ) {
		out.push( draw( 4 + i * ( w + gap ), y, w, h, v, i ) );
	}
	return <>{ out }</>;
};

const legacy = ( id, v ) => {
	if ( /slider/.test( id ) ) {
		return (
			<>
				<Row draw={ gridCard } v={ 1 } y={ 5 } h={ 36 } />
				<polygon points="1.5,23 4,20.5 4,25.5" fill={ C.dark } />
				<polygon points="70.5,23 68,20.5 68,25.5" fill={ C.dark } />
				<Dots x={ 31 } y={ 47 } />
			</>
		);
	}
	if ( /group-filter/.test( id ) ) {
		return (
			<>
				<Filters />
				<rect x={ 4 } y={ 11 } width={ 18 } height={ 2 } fill={ C.dark } />
				<Row draw={ circleCard } v={ 1 } y={ 15 } h={ 14 } n={ 4 } />
				<rect x={ 4 } y={ 32 } width={ 18 } height={ 2 } fill={ C.dark } />
				<Row draw={ circleCard } v={ 1 } y={ 36 } h={ 14 } n={ 4 } />
			</>
		);
	}
	if ( /filter/.test( id ) ) {
		return (
			<>
				<Filters />
				<Row draw={ gridCard } v={ /vcard/.test( id ) ? 4 : 1 } y={ 11 } h={ 37 } />
			</>
		);
	}
	if ( /popup/.test( id ) ) {
		return (
			<>
				<Row draw={ gridCard } v={ 1 } />
				<rect x={ 0 } y={ 0 } width={ W } height={ H } fill="#000" opacity={ 0.35 } />
				<rect x={ 14 } y={ 10 } width={ 44 } height={ 32 } rx={ 2 } fill={ C.bg } />
				<rect x={ 17 } y={ 13 } width={ 16 } height={ 20 } fill={ C.img } />
				<Lines x={ 36 } y={ 15 } w={ 18 } n={ 4 } gap={ 3 } />
			</>
		);
	}
	if ( /panel/.test( id ) ) {
		return (
			<>
				<Row draw={ gridCard } v={ 1 } n={ 2 } />
				<rect x={ 46 } y={ 0 } width={ 26 } height={ H } fill={ C.bg } stroke={ C.soft } strokeWidth={ 0.8 } />
				<rect x={ 50 } y={ 4 } width={ 18 } height={ 14 } fill={ C.img } />
				<Lines x={ 50 } y={ 22 } w={ 18 } n={ 5 } gap={ 3.5 } />
			</>
		);
	}
	if ( /drawer/.test( id ) ) {
		return (
			<>
				<Row draw={ gridCard } v={ 1 } y={ 3 } h={ 20 } />
				<polygon points="13,24 16,27 10,27" fill={ C.soft } />
				<rect x={ 4 } y={ 27 } width={ 64 } height={ 22 } rx={ 1.5 } fill={ C.soft } />
				<rect x={ 7 } y={ 30 } width={ 14 } height={ 16 } fill={ C.img } />
				<Lines x={ 25 } y={ 32 } w={ 38 } n={ 4 } gap={ 3.2 } />
				{ 2 === v && <rect x={ 4 } y={ 27 } width={ 64 } height={ 2 } fill={ C.accent } /> }
			</>
		);
	}
	if ( /single/.test( id ) ) {
		return (
			<>
				<Row draw={ gridCard } v={ 2 } />
				<path d="M62 4 h6 v6 M68 4 l-6 6" stroke={ C.accent } strokeWidth={ 1.2 } fill="none" />
			</>
		);
	}
	return <Row draw={ 0 === v % 2 ? circleCard : gridCard } v={ v } n={ v > 9 ? 4 : 3 } />;
};

const ThemeThumb = ( { theme } ) => {
	const v = variantOf( theme.id );
	let body;
	switch ( theme.group ) {
		case 'grid':
			body = <Row draw={ gridCard } v={ v } />;
			break;
		case 'circle':
			body = <Row draw={ circleCard } v={ v } />;
			break;
		case 'horizontal':
			body = (
				<>
					{ horizontalCard( 4, 4, 64, 20, v, 0 ) }
					{ horizontalCard( 4, 28, 64, 20, v, 1 ) }
				</>
			);
			break;
		case 'flip':
			body = <Row draw={ flipCard } v={ v } n={ 2 } h={ 42 } y={ 5 } />;
			break;
		case 'table':
			body = <Table v={ v } />;
			break;
		case 'list':
			body = <List v={ v } />;
			break;
		case 'sidebar':
			body = <Sidebar v={ v } />;
			break;
		default:
			body = legacy( theme.id, v );
	}
	return (
		<svg className="bptm-ed-thumb" viewBox={ `0 0 ${ W } ${ H }` } width={ W } height={ H } aria-hidden="true" focusable="false">
			<rect x={ 0 } y={ 0 } width={ W } height={ H } fill={ C.page } />
			{ body }
		</svg>
	);
};

export default ThemeThumb;
