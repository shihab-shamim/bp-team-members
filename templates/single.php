<?php
/**
 * Single team member page.
 *
 * Override: copy to yourtheme/bp-team-member/single.php (style files: yourtheme/bp-team-member/single/{style}.php).
 * Each style file receives `$v` (BPTM\Single_View) and `$m` (member array).
 *
 * @package BPTM
 */

use BPTM\Single_View;
use BPTM\Template_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

Template_Loader::header();

$bptm_style = Template_Loader::single_style();
?>
<main id="bptm-main" class="bptm-page bptm-page--single">
	<?php
	while ( have_posts() ) :
		the_post();
		$bptm_v = new Single_View( get_post(), 'large' );
		$bptm_m = $bptm_v->m;
		do_action( 'bptm_before_single', $bptm_m, $bptm_style );
		?>
		<article id="bptm-member-<?php echo (int) $bptm_m['id']; ?>" class="bptm-single bptm-single--<?php echo esc_attr( $bptm_style ); ?>" itemscope itemtype="https://schema.org/Person">
			<?php
			echo $bptm_v->breadcrumb(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in helper.
			if ( post_password_required() ) {
				echo get_the_password_form(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			} else {
				Template_Loader::render_style( $bptm_style, $bptm_v );
				echo $bptm_v->navigation(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in helper.
				echo $bptm_v->schema(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON-LD.
			}
			?>
		</article>
		<?php
		do_action( 'bptm_after_single', $bptm_m, $bptm_style );
	endwhile;
	?>
</main>
<?php
Template_Loader::footer();
