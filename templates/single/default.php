<?php
/**
 * Single member - Default style.
 *
 * Override: yourtheme/bp-team-member/single/default.php
 * In scope: $v (BPTM\Single_View), $m (member array). Helper output is already escaped.
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- helpers return escaped HTML.
?>
<div class="bptm-single__layout">
	<aside class="bptm-single__aside">
		<div class="bptm-single__photo">
			<?php echo $v->image( 'large' ); ?>
			<?php echo $v->ribbon(); ?>
		</div>
		<?php echo $v->meta_details( 'list' ); ?>
		<?php echo $v->vcard(); ?>
	</aside>
	<div class="bptm-single__main">
		<?php echo $v->name( 'h1' ); ?>
		<?php echo $v->designation(); ?>
		<?php echo $v->social( true ); ?>
		<?php echo $v->content(); ?>
		<?php echo $v->acf_at( 'after_description' ); ?>
		<?php echo $v->skills( true ); ?>
		<?php echo $v->acf_at( 'after_skills' ); ?>
	</div>
</div>
