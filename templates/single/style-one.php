<?php
/**
 * Single member - Style One (profile card sidebar).
 *
 * Override: yourtheme/bp-team-member/single/style-one.php
 * In scope: $v (BPTM\Single_View), $m (member array). Helper output is already escaped.
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- helpers return escaped HTML.
?>
<div class="bptm-s1">
	<aside class="bptm-s1__card">
		<div class="bptm-single__photo">
			<?php echo $v->image( 'large' ); ?>
			<?php echo $v->ribbon(); ?>
		</div>
		<div class="bptm-s1__card-body">
			<?php echo $v->name( 'h1' ); ?>
			<?php echo $v->designation(); ?>
			<?php echo $v->social( false ); ?>
			<?php echo $v->vcard(); ?>
		</div>
	</aside>
	<div class="bptm-s1__main">
		<?php echo $v->groups(); ?>
		<section class="bptm-s1__section">
			<h2 class="bptm-single__heading"><?php esc_html_e( 'About', 'bp-team-member' ); ?></h2>
			<?php echo $v->content(); ?>
			<?php echo $v->acf_at( 'after_description' ); ?>
		</section>
		<section class="bptm-s1__section">
			<h2 class="bptm-single__heading"><?php esc_html_e( 'Contact Information', 'bp-team-member' ); ?></h2>
			<?php echo $v->meta_details( 'grid' ); ?>
		</section>
		<section class="bptm-s1__section">
			<?php echo $v->skills( true ); ?>
			<?php echo $v->acf_at( 'after_skills' ); ?>
		</section>
	</div>
</div>
