<?php
/**
 * Single member - Style Three (colored banner).
 *
 * Override: yourtheme/bp-team-member/single/style-three.php
 * In scope: $v (BPTM\Single_View), $m (member array). Helper output is already escaped.
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- helpers return escaped HTML.
?>
<header class="bptm-s3__banner">
	<div class="bptm-single__photo bptm-s3__photo">
		<?php echo $v->image( 'medium_large' ); ?>
	</div>
	<div class="bptm-s3__intro">
		<?php echo $v->ribbon(); ?>
		<?php echo $v->name( 'h1' ); ?>
		<?php echo $v->designation(); ?>
		<?php echo $v->social( false ); ?>
	</div>
</header>
<div class="bptm-s3__body">
	<section class="bptm-s3__card bptm-s3__card--about">
		<h2 class="bptm-single__heading"><?php esc_html_e( 'About', 'bp-team-member' ); ?></h2>
		<?php echo $v->content(); ?>
		<?php echo $v->acf_at( 'after_description' ); ?>
	</section>
	<section class="bptm-s3__card bptm-s3__card--contact">
		<h2 class="bptm-single__heading"><?php esc_html_e( 'Contact Information', 'bp-team-member' ); ?></h2>
		<?php echo $v->meta_details( 'grid' ); ?>
		<?php echo $v->vcard(); ?>
	</section>
	<section class="bptm-s3__card bptm-s3__card--skills">
		<?php echo $v->skills( true ); ?>
		<?php echo $v->acf_at( 'after_skills' ); ?>
	</section>
</div>
