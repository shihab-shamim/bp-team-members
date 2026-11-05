<?php
/**
 * Partial: skills progress bars.
 *
 * @package BPTM
 *
 * @var array                $m     Member.
 * @var bool                 $title Show the "Skills" title.
 * @var \BPTM\Render\Context $ctx   Context.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$bptm_skills = array();
foreach ( (array) $m['skills'] as $bptm_skill ) {
	$bptm_name = isset( $bptm_skill['skill'] ) ? trim( (string) $bptm_skill['skill'] ) : '';
	$bptm_pct  = isset( $bptm_skill['percent'] ) ? max( 0, min( 100, (int) $bptm_skill['percent'] ) ) : 0;
	if ( '' !== $bptm_name && $bptm_pct > 0 ) {
		$bptm_skills[] = array( $bptm_name, $bptm_pct );
	}
}
if ( ! $bptm_skills ) {
	return;
}
?>
<div class="<?php echo $ctx->vis_classes( 'skills', 'bptm-skills' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>">
	<?php if ( ! empty( $title ) ) : ?>
		<h4 class="bptm-skills-title"><?php echo esc_html( $ctx->t( 'skills' ) ); ?></h4>
	<?php endif; ?>
	<?php foreach ( $bptm_skills as $bptm_skill ) : ?>
		<div class="bptm-skill">
			<div class="bptm-skill-head">
				<span class="bptm-skill-name"><?php echo esc_html( $bptm_skill[0] ); ?></span>
				<span class="bptm-skill-value"><?php echo esc_html( $bptm_skill[1] ); ?>%</span>
			</div>
			<div class="bptm-skill-bar" role="progressbar" aria-label="<?php echo esc_attr( $bptm_skill[0] ); ?>" aria-valuenow="<?php echo esc_attr( $bptm_skill[1] ); ?>" aria-valuemin="0" aria-valuemax="100">
				<span class="bptm-skill-fill" style="--bptm-skill:<?php echo esc_attr( $bptm_skill[1] ); ?>%"></span>
			</div>
		</div>
	<?php endforeach; ?>
</div>
