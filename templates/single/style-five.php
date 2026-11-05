<?php
/**
 * Single member - Style Five (minimal editorial).
 *
 * Override: yourtheme/bp-team-member/single/style-five.php
 * In scope: $v (BPTM\Single_View), $m (member array). Helper output is already escaped.
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- helpers return escaped HTML.
?>
<header class="bptm-s5__head">
	<?php echo $v->designation(); ?>
	<?php echo $v->name( 'h1' ); ?>
	<?php echo $v->groups(); ?>
</header>
<figure class="bptm-single__photo bptm-s5__figure">
	<?php echo $v->image( 'full' ); ?>
	<?php echo $v->ribbon(); ?>
</figure>
<?php echo $v->meta_details( 'columns' ); ?>
<div class="bptm-s5__cols">
	<div class="bptm-s5__main">
		<?php echo $v->content(); ?>
		<?php echo $v->acf_at( 'after_description' ); ?>
	</div>
	<aside class="bptm-s5__aside">
		<?php echo $v->skills( true ); ?>
		<?php echo $v->acf_at( 'after_skills' ); ?>
		<?php echo $v->social( true ); ?>
		<?php echo $v->vcard(); ?>
	</aside>
</div>
