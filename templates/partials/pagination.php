<?php
/**
 * Partial: pagination (numbered links, ajax numbered, load more button, infinite scroll sentinel).
 *
 * @package BPTM
 *
 * @var \BPTM\Render\Context $ctx   Context.
 * @var \BPTM\Render\Query   $query Query.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$bptm_mode = $query->mode;
if ( ! $bptm_mode ) {
	return;
}

if ( in_array( $bptm_mode, array( 'normal-pagination', 'ajax-pagination' ), true ) ) {
	$bptm_max = $query->max_pages();
	$bptm_cur = min( max( 1, (int) $query->page ), max( 1, $bptm_max ) );
	$bptm_var = $query->page_var;

	$bptm_is_rest = defined( 'REST_REQUEST' ) && REST_REQUEST;
	$bptm_base    = '';
	if ( ! $bptm_is_rest ) {
		$bptm_req  = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';
		$bptm_base = remove_query_arg( $bptm_var, $bptm_req );
	}
	$bptm_url = static function ( $n ) use ( $bptm_base, $bptm_var ) {
		if ( '' === $bptm_base ) {
			return 1 === $n ? '?' : '?' . rawurlencode( $bptm_var ) . '=' . $n;
		}
		return 1 === $n ? $bptm_base : add_query_arg( $bptm_var, $n, $bptm_base );
	};

	// Page list: first, last, current +/- 1 and ellipses.
	$bptm_pages = array();
	for ( $bptm_i = 1; $bptm_i <= $bptm_max; $bptm_i++ ) {
		if ( 1 === $bptm_i || $bptm_max === $bptm_i || abs( $bptm_i - $bptm_cur ) <= 1 ) {
			$bptm_pages[] = $bptm_i;
		} elseif ( end( $bptm_pages ) !== '…' ) {
			$bptm_pages[] = '…';
		}
	}
	$bptm_ajax = 'ajax-pagination' === $bptm_mode;
	?>
	<nav class="bptm-pagination bptm-pagination--<?php echo $bptm_ajax ? 'ajax' : 'normal'; ?>" aria-label="<?php esc_attr_e( 'Team members pages', 'bp-team-member' ); ?>"<?php echo $bptm_max <= 1 ? ' hidden' : ''; ?>>
		<ul class="bptm-pages">
			<li>
				<?php if ( $bptm_cur > 1 ) : ?>
					<a class="bptm-page bptm-page-prev" href="<?php echo esc_url( $bptm_url( $bptm_cur - 1 ) ); ?>" data-page="<?php echo esc_attr( $bptm_cur - 1 ); ?>" rel="prev" aria-label="<?php echo esc_attr( $ctx->t( 'prev' ) ); ?>"><i class="fas fa-angle-left" aria-hidden="true"></i></a>
				<?php else : ?>
					<span class="bptm-page bptm-page-prev is-disabled" aria-hidden="true"><i class="fas fa-angle-left"></i></span>
				<?php endif; ?>
			</li>
			<?php foreach ( $bptm_pages as $bptm_p ) : ?>
				<li>
					<?php if ( '…' === $bptm_p ) : ?>
						<span class="bptm-page bptm-page-dots" aria-hidden="true">&hellip;</span>
					<?php elseif ( $bptm_p === $bptm_cur ) : ?>
						<span class="bptm-page is-current" aria-current="page"><?php echo esc_html( number_format_i18n( $bptm_p ) ); ?></span>
					<?php else : ?>
						<a class="bptm-page" href="<?php echo esc_url( $bptm_url( $bptm_p ) ); ?>" data-page="<?php echo esc_attr( $bptm_p ); ?>"><?php echo esc_html( number_format_i18n( $bptm_p ) ); ?></a>
					<?php endif; ?>
				</li>
			<?php endforeach; ?>
			<li>
				<?php if ( $bptm_cur < $bptm_max ) : ?>
					<a class="bptm-page bptm-page-next" href="<?php echo esc_url( $bptm_url( $bptm_cur + 1 ) ); ?>" data-page="<?php echo esc_attr( $bptm_cur + 1 ); ?>" rel="next" aria-label="<?php echo esc_attr( $ctx->t( 'next' ) ); ?>"><i class="fas fa-angle-right" aria-hidden="true"></i></a>
				<?php else : ?>
					<span class="bptm-page bptm-page-next is-disabled" aria-hidden="true"><i class="fas fa-angle-right"></i></span>
				<?php endif; ?>
			</li>
		</ul>
	</nav>
	<?php
	return;
}

$bptm_more = $query->has_more();
if ( 'load-more-button' === $bptm_mode ) :
	$bptm_text = trim( (string) $ctx->attr( 'loadButtonText', '' ) );
	$bptm_text = '' !== $bptm_text ? $bptm_text : $ctx->t( 'load_more' );
	?>
	<div class="bptm-loadmore-wrap"<?php echo $bptm_more ? '' : ' hidden'; ?>>
		<button type="button" class="bptm-loadmore"><span class="bptm-loadmore-text"><?php echo esc_html( $bptm_text ); ?></span><span class="bptm-spinner" aria-hidden="true"></span></button>
	</div>
<?php else : ?>
	<div class="bptm-infinite"<?php echo $bptm_more ? '' : ' hidden'; ?>>
		<span class="bptm-spinner" aria-hidden="true"></span>
		<span class="screen-reader-text"><?php esc_html_e( 'Loading more members', 'bp-team-member' ); ?></span>
	</div>
<?php endif; ?>
