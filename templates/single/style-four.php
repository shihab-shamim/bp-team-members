<?php
/**
 * Single member - Style Four (dark split card).
 *
 * Override: yourtheme/bp-team-member/single/style-four.php
 * In scope: $v (BPTM\Single_View), $m (member array). Helper output is already escaped.
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- helpers return escaped HTML.
?>
<div class="bptm-s4">
	<div class="bptm-s4__content">
		<?php echo $v->designation(); ?>
		<?php echo $v->name( 'h1' ); ?>
		<?php echo $v->content(); ?>
		<?php echo $v->acf_at( 'after_description' ); ?>
		<?php echo $v->meta_details( 'table' ); ?>
		<div class="bptm-s4__actions">
			<?php echo $v->social( false ); ?>
			<?php echo $v->vcard(); ?>
		</div>
	</div>
	<div class="bptm-s4__media">
		<div class="bptm-single__photo">
			<?php echo $v->image( 'large' ); ?>
			<?php echo $v->ribbon(); ?>
		</div>
	</div>
</div>
<?php
$bptm_skills = $v->skills( true ) . $v->acf_at( 'after_skills' );
if ( '' !== $bptm_skills ) :
	?>
	<div class="bptm-s4__skills"><?php echo $bptm_skills; ?></div>
<?php endif; ?>
