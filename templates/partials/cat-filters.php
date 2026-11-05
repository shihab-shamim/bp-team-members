<?php
/**
 * Partial: category (group) filter tabs, optionally with child categories.
 *
 * @package BPTM
 *
 * @var \BPTM\Render\Context $ctx   Context.
 * @var \BPTM\Render\Query   $query Query.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$bptm_terms = \BPTM\Render\Filters::terms( 'group', $ctx, 'includeGroups' );
if ( empty( $bptm_terms ) ) {
	return;
}
$bptm_child = (bool) $ctx->attr( 'enableChildCats', false );
$bptm_tree  = \BPTM\Render\Filters::tree( $bptm_terms );
$bptm_all   = (bool) $ctx->attr( 'filterAllEnabled', true );
$bptm_style = sanitize_html_class( (string) $ctx->attr( 'filterStyle', 'default' ) );
$bptm_pos   = sanitize_html_class( (string) $ctx->attr( 'filterCatPosition', 'center' ) );
$bptm_text  = (string) $ctx->attr( 'filterAllText', '' );
$bptm_text  = '' !== trim( $bptm_text ) ? $bptm_text : __( 'All', 'bp-team-member' );
$bptm_first = true;

$bptm_render_children = static function ( $nodes, $depth ) use ( &$bptm_render_children ) {
	if ( empty( $nodes ) ) {
		return;
	}
	echo '<ul class="bptm-cats-sub" data-depth="' . esc_attr( $depth ) . '">';
	foreach ( $nodes as $bptm_node ) {
		$bptm_has = ! empty( $bptm_node['children'] );
		echo '<li class="bptm-cat-item' . ( $bptm_has ? ' bptm-has-child' : '' ) . '">';
		echo '<button type="button" class="bptm-cat" data-filter="' . esc_attr( $bptm_node['term']->slug ) . '" aria-pressed="false"><span>' . esc_html( $bptm_node['term']->name ) . '</span>';
		if ( $bptm_has ) {
			echo '<i class="fas fa-angle-right bptm-cat-caret" aria-hidden="true"></i>';
		}
		echo '</button>';
		if ( $bptm_has ) {
			$bptm_render_children( $bptm_node['children'], $depth + 1 );
		}
		echo '</li>';
	}
	echo '</ul>';
};
?>
<nav class="bptm-cats-wrap bptm-cats-pos-<?php echo esc_attr( $bptm_pos ); ?>" aria-label="<?php esc_attr_e( 'Filter by group', 'bp-team-member' ); ?>">
	<ul class="bptm-cats bptm-cats--<?php echo esc_attr( $bptm_style ); ?><?php echo $bptm_child ? ' bptm-cats--with-child' : ''; ?>">
		<?php if ( $bptm_all ) : ?>
			<li class="bptm-cat-item is-active">
				<button type="button" class="bptm-cat" data-filter="*" aria-pressed="true"><span><?php echo esc_html( $bptm_text ); ?></span></button>
			</li>
			<?php $bptm_first = false; ?>
		<?php endif; ?>
		<?php foreach ( $bptm_tree as $bptm_node ) : ?>
			<?php $bptm_has = $bptm_child && ! empty( $bptm_node['children'] ); ?>
			<li class="bptm-cat-item<?php echo $bptm_has ? ' bptm-has-child' : ''; ?><?php echo $bptm_first ? ' is-active' : ''; ?>">
				<button type="button" class="bptm-cat" data-filter="<?php echo esc_attr( $bptm_node['term']->slug ); ?>" aria-pressed="<?php echo $bptm_first ? 'true' : 'false'; ?>"<?php echo $bptm_has ? ' aria-haspopup="true" aria-expanded="false"' : ''; ?>>
					<span><?php echo esc_html( $bptm_node['term']->name ); ?></span>
					<?php if ( $bptm_has ) : ?>
						<i class="fas fa-angle-down bptm-cat-caret" aria-hidden="true"></i>
					<?php endif; ?>
				</button>
				<?php
				if ( $bptm_has ) {
					$bptm_render_children( $bptm_node['children'], 1 );
				}
				?>
			</li>
			<?php $bptm_first = false; ?>
		<?php endforeach; ?>
	</ul>
</nav>
