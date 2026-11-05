<?php
/**
 * Team member archive + member taxonomy archives.
 *
 * Override: copy to yourtheme/bp-team-member/archive.php.
 *
 * @package BPTM
 */

use BPTM\Settings;
use BPTM\Single_View;
use BPTM\Template_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

Template_Loader::header();

$bptm_term   = is_tax() ? get_queried_object() : null;
$bptm_title  = $bptm_term instanceof WP_Term ? $bptm_term->name : Template_Loader::archive_title();
$bptm_desc   = $bptm_term instanceof WP_Term ? term_description( $bptm_term ) : '';
$bptm_linked = 'none' !== Settings::get( 'single_link_type', 'single_page' );
$bptm_tax    = $bptm_term instanceof WP_Term ? get_taxonomy( $bptm_term->taxonomy ) : null;
?>
<main id="bptm-main" class="bptm-page bptm-page--archive">
	<div class="bptm-archive">
		<header class="bptm-archive__header">
			<?php if ( $bptm_tax ) : ?>
				<p class="bptm-archive__eyebrow"><?php echo esc_html( $bptm_tax->labels->singular_name ); ?></p>
			<?php endif; ?>
			<h1 class="bptm-archive__title"><?php echo esc_html( $bptm_title ); ?></h1>
			<?php if ( $bptm_desc ) : ?>
				<div class="bptm-archive__desc"><?php echo wp_kses_post( $bptm_desc ); ?></div>
			<?php endif; ?>
		</header>

		<?php if ( have_posts() ) : ?>
			<div class="bptm-archive__grid">
				<?php
				while ( have_posts() ) :
					the_post();
					$bptm_v = new Single_View( get_post(), 'medium_large' );
					$bptm_m = $bptm_v->m;
					?>
					<article class="bptm-archive__item<?php echo $bptm_m['featured'] ? ' is-featured' : ''; ?>" itemscope itemtype="https://schema.org/Person">
						<div class="bptm-archive__media">
							<?php if ( $bptm_linked ) : ?>
								<a href="<?php echo esc_url( $bptm_m['permalink'] ); ?>" tabindex="-1" aria-hidden="true">
							<?php endif; ?>
							<?php echo $bptm_v->image( 'medium_large', 'bptm-archive__img', false ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<?php if ( $bptm_linked ) : ?>
								</a>
							<?php endif; ?>
							<?php echo $bptm_v->ribbon(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</div>
						<div class="bptm-archive__body">
							<h2 class="bptm-archive__name" itemprop="name">
								<?php if ( $bptm_linked ) : ?>
									<a href="<?php echo esc_url( $bptm_m['permalink'] ); ?>" itemprop="url"><?php echo esc_html( $bptm_m['name'] ); ?></a>
								<?php else : ?>
									<?php echo esc_html( $bptm_m['name'] ); ?>
								<?php endif; ?>
							</h2>
							<?php echo $bptm_v->designation(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<?php echo $bptm_v->social( false ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</div>
					</article>
				<?php endwhile; ?>
			</div>
			<?php
			the_posts_pagination(
				array(
					'class'     => 'bptm-archive__pagination',
					'prev_text' => esc_html( Settings::translation( 'prev' ) ),
					'next_text' => esc_html( Settings::translation( 'next' ) ),
				)
			);
			?>
		<?php else : ?>
			<p class="bptm-archive__empty"><?php echo esc_html( Settings::translation( 'no_members' ) ); ?></p>
		<?php endif; ?>
	</div>
</main>
<?php
Template_Loader::footer();
