<?php
/**
 * Partial: empty state.
 *
 * @package BPTM
 *
 * @var \BPTM\Render\Context $ctx Context.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="bptm-no-members" role="status"><?php echo esc_html( $ctx->t( 'no_members' ) ); ?></div>
