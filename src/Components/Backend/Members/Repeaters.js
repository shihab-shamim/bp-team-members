/**
 * Member repeaters: social links (searchable Font Awesome icon picker) and skills.
 */
import { Button, Dropdown, RangeControl, SearchControl, TextControl } from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import { getSocialIcons } from '../../../utils/editorData';
import { moveItem } from '../../../utils/members';

const common = { __nextHasNoMarginBottom: true, __next40pxDefaultSize: true };
const MAX_RESULTS = 160;

const iconLabel = ( value ) => {
	const found = getSocialIcons().find( ( i ) => i.value === value );
	return found ? found.label : value;
};

const IconGrid = ( { value, onSelect } ) => {
	const [ search, setSearch ] = useState( '' );
	const icons = getSocialIcons();
	const results = useMemo( () => {
		const q = search.trim().toLowerCase();
		const list = q ? icons.filter( ( i ) => i.label.toLowerCase().includes( q ) || i.value.toLowerCase().includes( q ) ) : icons;
		return list.slice( 0, MAX_RESULTS );
	}, [ search, icons ] );

	return (
		<div className="bptm-ed-iconpicker">
			<SearchControl __nextHasNoMarginBottom value={ search } onChange={ setSearch } placeholder={ __( 'Search icons', 'bp-team-member' ) } />
			<div className="bptm-ed-iconpicker__grid" role="listbox" aria-label={ __( 'Icons', 'bp-team-member' ) }>
				{ results.map( ( i ) => (
					<button
						type="button"
						key={ i.value }
						role="option"
						aria-selected={ i.value === value }
						className={ `bptm-ed-iconpicker__icon${ i.value === value ? ' is-selected' : '' }` }
						title={ i.label }
						aria-label={ i.label }
						onClick={ () => onSelect( i.value ) }
					>
						<i className={ i.value } aria-hidden="true" />
					</button>
				) ) }
			</div>
			{ ! results.length && <p className="bptm-ed-muted">{ __( 'No icons found.', 'bp-team-member' ) }</p> }
			{ results.length === MAX_RESULTS && <p className="bptm-ed-muted">{ __( 'Type to search more icons.', 'bp-team-member' ) }</p> }
		</div>
	);
};

export const IconPicker = ( { value, onChange } ) => (
	<Dropdown
		className="bptm-ed-iconpicker__dropdown"
		contentClassName="bptm-ed-iconpicker__popover"
		popoverProps={ { placement: 'left-start' } }
		renderToggle={ ( { isOpen, onToggle } ) => (
			<Button variant="secondary" size="compact" className="bptm-ed-iconpicker__toggle" onClick={ onToggle } aria-expanded={ isOpen } label={ __( 'Choose icon', 'bp-team-member' ) } showTooltip>
				{ value ? <i className={ value } aria-hidden="true" /> : <span className="dashicons dashicons-plus" /> }
				<span className="bptm-ed-iconpicker__name">{ value ? iconLabel( value ) : __( 'Choose icon', 'bp-team-member' ) }</span>
			</Button>
		) }
		renderContent={ ( { onClose } ) => (
			<IconGrid
				value={ value }
				onSelect={ ( v ) => {
					onChange( v );
					onClose();
				} }
			/>
		) }
	/>
);

/** Up / down / remove buttons for one repeater row. */
const RowActions = ( { index, count, onMove, onRemove, label } ) => (
	<span className="bptm-ed-repeater__actions">
		<Button size="small" icon="arrow-up-alt2" disabled={ 0 === index } label={ sprintf( /* translators: %s: row label */ __( 'Move %s up', 'bp-team-member' ), label ) } onClick={ () => onMove( index, index - 1 ) } />
		<Button size="small" icon="arrow-down-alt2" disabled={ index === count - 1 } label={ sprintf( /* translators: %s: row label */ __( 'Move %s down', 'bp-team-member' ), label ) } onClick={ () => onMove( index, index + 1 ) } />
		<Button size="small" icon="trash" isDestructive label={ sprintf( /* translators: %s: row label */ __( 'Remove %s', 'bp-team-member' ), label ) } onClick={ () => onRemove( index ) } />
	</span>
);

const useRows = ( value, onChange ) => {
	const rows = Array.isArray( value ) ? value : [];
	return {
		rows,
		update: ( i, patch ) => onChange( rows.map( ( r, j ) => ( i === j ? { ...r, ...patch } : r ) ) ),
		move: ( from, to ) => onChange( moveItem( rows, from, to ) ),
		remove: ( i ) => onChange( rows.filter( ( _, j ) => j !== i ) ),
		add: ( row ) => onChange( [ ...rows, row ] ),
	};
};

export const SocialLinks = ( { value, onChange } ) => {
	const { rows, update, move, remove, add } = useRows( value, onChange );
	return (
		<div className="bptm-ed-repeater bptm-ed-social">
			{ ! rows.length && <p className="bptm-ed-muted">{ __( 'No social links yet.', 'bp-team-member' ) }</p> }
			{ rows.map( ( row, i ) => {
				const label = sprintf( /* translators: %d: row number */ __( 'link %d', 'bp-team-member' ), i + 1 );
				return (
					<div className="bptm-ed-repeater__row" key={ i }>
						<div className="bptm-ed-repeater__head">
							<IconPicker value={ row && row.icon } onChange={ ( icon ) => update( i, { icon } ) } />
							<RowActions index={ i } count={ rows.length } onMove={ move } onRemove={ remove } label={ label } />
						</div>
						<TextControl
							{ ...common }
							type="url"
							label={ __( 'Link', 'bp-team-member' ) }
							placeholder="https://"
							value={ ( row && row.link ) || '' }
							onChange={ ( link ) => update( i, { link } ) }
						/>
					</div>
				);
			} ) }
			<Button variant="secondary" size="compact" icon="plus-alt2" onClick={ () => add( { icon: 'fab fa-linkedin-in', link: '' } ) }>
				{ __( 'Add social link', 'bp-team-member' ) }
			</Button>
		</div>
	);
};

export const Skills = ( { value, onChange } ) => {
	const { rows, update, move, remove, add } = useRows( value, onChange );
	return (
		<div className="bptm-ed-repeater bptm-ed-skills">
			{ ! rows.length && <p className="bptm-ed-muted">{ __( 'No skills yet.', 'bp-team-member' ) }</p> }
			{ rows.map( ( row, i ) => {
				const label = ( row && row.skill ) || sprintf( /* translators: %d: row number */ __( 'skill %d', 'bp-team-member' ), i + 1 );
				return (
					<div className="bptm-ed-repeater__row" key={ i }>
						<div className="bptm-ed-repeater__head">
							<TextControl
								{ ...common }
								label={ __( 'Skill', 'bp-team-member' ) }
								hideLabelFromVision
								placeholder={ __( 'Skill name', 'bp-team-member' ) }
								value={ ( row && row.skill ) || '' }
								onChange={ ( skill ) => update( i, { skill } ) }
							/>
							<RowActions index={ i } count={ rows.length } onMove={ move } onRemove={ remove } label={ label } />
						</div>
						<RangeControl
							{ ...common }
							label={ __( 'Percent', 'bp-team-member' ) }
							min={ 0 }
							max={ 100 }
							value={ Math.min( 100, Math.max( 0, Number( row && row.percent ) || 0 ) ) }
							onChange={ ( v ) => update( i, { percent: Math.min( 100, Math.max( 0, Number( v ) || 0 ) ) } ) }
						/>
					</div>
				);
			} ) }
			<Button variant="secondary" size="compact" icon="plus-alt2" onClick={ () => add( { skill: '', percent: 80 } ) }>
				{ __( 'Add skill', 'bp-team-member' ) }
			</Button>
		</div>
	);
};
