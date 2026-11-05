<?php
/**
 * Single member - Style Two (centered hero).
 *
 * Override: yourtheme/bp-team-member/single/style-two.php
 * In scope: $v (BPTM\Single_View), $m (member array). Helper output is already escaped.
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- helpers return escaped HTML.
?>
<header class="bptm-s2__hero">
	<div class="bptm-single__photo bptm-s2__photo">
		<?php echo $v->image( 'medium_large' ); ?>
		<?php echo $v->ribbon(); ?>
	</div>
	<?php echo $v->name( 'h1' ); ?>
	<?php echo $v->designation(); ?>
	<?php echo $v->groups(); ?>
	<?php echo $v->social( false ); ?>
</header>
<div class="bptm-s2__cols">
	<div class="bptm-s2__main">
		<?php echo $v->content(); ?>
		<?php echo $v->acf_at( 'after_description' ); ?>
		<?php echo $v->skills( true ); ?>
		<?php echo $v->acf_at( 'after_skills' ); ?>
	</div>
	<aside class="bptm-s2__aside">
		<?php echo $v->meta_details( 'list' ); ?>
		<?php echo $v->vcard(); ?>
	</aside>
</div>
