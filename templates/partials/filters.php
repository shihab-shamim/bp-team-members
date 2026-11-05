<?php
/**
 * Partial: search inputs + dropdown filters + reset button.
 *
 * @package BPTM
 *
 * @var \BPTM\Render\Context $ctx   Context.
 * @var \BPTM\Render\Query   $query Query.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$bptm_taxes    = function_exists( 'bptm_taxonomies' ) ? bptm_taxonomies() : array();
$bptm_multi    = (bool) $ctx->attr( 'enableMultiSelect', false );
$bptm_controls = array();

foreach ( \BPTM\Render\Filters::order() as $bptm_key ) {
	if ( isset( \BPTM\Render\Filters::SEARCHES[ $bptm_key ] ) ) {
		list( $bptm_toggle, $bptm_tkey ) = \BPTM\Render\Filters::SEARCHES[ $bptm_key ];
		if ( ! $ctx->attr( $bptm_toggle, false ) ) {
			continue;
		}
		if ( 'tag' === $bptm_key && ! \BPTM\Render\Query::tax_name( 'tag', $bptm_taxes ) ) {
			continue;
		}
		$bptm_controls[] = array(
			'type'  => 'search',
			'key'   => $bptm_key,
			'label' => $ctx->t( $bptm_tkey ),
		);
		continue;
	}
	if ( ! isset( \BPTM\Render\Filters::DROPDOWNS[ $bptm_key ] ) ) {
		continue;
	}
	list( $bptm_toggle, $bptm_include, $bptm_kind ) = \BPTM\Render\Filters::DROPDOWNS[ $bptm_key ];
	if ( ! $ctx->attr( $bptm_toggle, false ) ) {
		continue;
	}
	$bptm_options = array();
	if ( 'meta' === $bptm_kind ) {
		foreach ( \BPTM\Render\Filters::designations( $ctx ) as $bptm_slug => $bptm_label ) {
			$bptm_options[] = array( $bptm_slug, $bptm_label, $bptm_label, 0 );
		}
		$bptm_placeholder = $ctx->t( 'filter_designation' );
	} else {
		if ( ! \BPTM\Render\Query::tax_name( $bptm_key, $bptm_taxes ) ) {
			continue;
		}
		$bptm_terms = \BPTM\Render\Filters::terms( $bptm_key, $ctx, $bptm_include );
		foreach ( \BPTM\Render\Filters::tree( $bptm_terms ) as $bptm_root ) {
			$bptm_stack = array( array( $bptm_root, 0 ) );
			while ( $bptm_stack ) {
				list( $bptm_node, $bptm_depth ) = array_shift( $bptm_stack );
				$bptm_options[]                 = array( $bptm_node['term']->slug, $bptm_node['term']->name, $bptm_node['term']->slug, $bptm_depth );
				foreach ( array_reverse( $bptm_node['children'] ) as $bptm_c ) {
					array_unshift( $bptm_stack, array( $bptm_c, $bptm_depth + 1 ) );
				}
			}
		}
		$bptm_placeholder = isset( $bptm_taxes[ $bptm_key ]['label'] ) && $bptm_taxes[ $bptm_key ]['label'] ? $bptm_taxes[ $bptm_key ]['label'] : ucwords( str_replace( '_', ' ', $bptm_key ) );
	}
	if ( empty( $bptm_options ) ) {
		continue;
	}
	$bptm_controls[] = array(
		'type'        => 'select',
		'key'         => $bptm_key,
		'label'       => $bptm_placeholder,
		'options'     => $bptm_options,
	);
}

$bptm_reset = (bool) $ctx->attr( 'enableClearFilters', false );
if ( empty( $bptm_controls ) && ! $bptm_reset ) {
	return;
}
$bptm_cols = 'three' === $ctx->attr( 'filterColumns', 'two' ) ? 3 : 2;
$bptm_uid  = $ctx->uid;
?>
<div class="bptm-filters bptm-filter-cols-<?php echo esc_attr( $bptm_cols ); ?><?php echo $bptm_multi ? ' bptm-filters--multi' : ''; ?>" role="search">
	<?php if ( $bptm_controls ) : ?>
		<div class="bptm-filters-grid">
			<?php foreach ( $bptm_controls as $bptm_c ) : ?>
				<?php $bptm_fid = 'bptm-f-' . $bptm_uid . '-' . $bptm_c['key']; ?>
				<div class="bptm-filter bptm-filter--<?php echo esc_attr( $bptm_c['type'] ); ?> bptm-filter-<?php echo esc_attr( str_replace( '_', '-', $bptm_c['key'] ) ); ?>">
					<?php
					$bptm_hook_keys = array(
						'search'  => 'search',
						'company' => 'company_search',
						'zip'     => 'zip_search',
						'tag'     => 'tag_search',
					);
					echo $ctx->hook( 'bptm_before_' . ( isset( $bptm_hook_keys[ $bptm_c['key'] ] ) ? $bptm_hook_keys[ $bptm_c['key'] ] : $bptm_c['key'] ) . '_filter' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- developer hook output.
					?>
					<label class="screen-reader-text" for="<?php echo esc_attr( $bptm_fid ); ?>"><?php echo esc_html( $bptm_c['label'] ); ?></label>
					<?php if ( 'search' === $bptm_c['type'] ) : ?>
						<span class="bptm-search-icon fas fa-magnifying-glass" aria-hidden="true"></span>
						<input type="search" id="<?php echo esc_attr( $bptm_fid ); ?>" class="bptm-search" data-bptm-search="<?php echo esc_attr( $bptm_c['key'] ); ?>" placeholder="<?php echo esc_attr( $bptm_c['label'] ); ?>" autocomplete="off" />
					<?php else : ?>
						<select id="<?php echo esc_attr( $bptm_fid ); ?>" class="bptm-select" data-bptm-filter="<?php echo esc_attr( $bptm_c['key'] ); ?>" data-placeholder="<?php echo esc_attr( $bptm_c['label'] ); ?>">
							<option value="*"><?php echo esc_html( $bptm_c['label'] ); ?></option>
							<?php foreach ( $bptm_c['options'] as $bptm_o ) : ?>
								<option value="<?php echo esc_attr( $bptm_o[0] ); ?>" data-value="<?php echo esc_attr( $bptm_o[2] ); ?>" data-depth="<?php echo esc_attr( $bptm_o[3] ); ?>"><?php echo esc_html( str_repeat( '— ', (int) $bptm_o[3] ) . $bptm_o[1] ); ?></option>
							<?php endforeach; ?>
						</select>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
	<?php if ( $bptm_reset ) : ?>
		<div class="bptm-reset-wrap">
			<button type="button" class="bptm-reset" hidden><i class="fas fa-rotate-left" aria-hidden="true"></i> <span><?php echo esc_html( $ctx->t( 'reset_filters' ) ); ?></span></button>
		</div>
	<?php endif; ?>
	<div class="bptm-filter-status screen-reader-text" aria-live="polite"></div>
</div>
