<?php
/**
 * Partial: meta details (company, address, phones, email, taxonomies, zip, extras).
 *
 * @package BPTM
 *
 * @var array                $m       Member.
 * @var array                $rows    field => [label, value (escaped HTML), icon, classes].
 * @var string               $variant list | icons | inline | table.
 * @var \BPTM\Render\Context $ctx     Context.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( 'table' === $variant ) : ?>
	<table class="bptm-meta bptm-meta--table">
		<tbody>
		<?php foreach ( $rows as $bptm_row ) : ?>
			<tr class="<?php echo esc_attr( $bptm_row['classes'] ); ?>">
				<th scope="row" class="bptm-meta-label"><?php echo esc_html( $bptm_row['label'] ); ?></th>
				<td class="bptm-meta-value"><?php echo wp_kses( $bptm_row['value'], \BPTM\Render\Context::kses() ); ?></td>
			</tr>
		<?php endforeach; ?>
		</tbody>
	</table>
<?php else : ?>
	<ul class="bptm-meta bptm-meta--<?php echo esc_attr( $variant ); ?>">
		<?php foreach ( $rows as $bptm_row ) : ?>
			<li class="<?php echo esc_attr( $bptm_row['classes'] ); ?>">
				<?php if ( 'list' !== $variant ) : ?>
					<i class="bptm-meta-icon <?php echo esc_attr( $bptm_row['icon'] ); ?>" aria-hidden="true"></i>
				<?php endif; ?>
				<span class="bptm-meta-label<?php echo 'list' !== $variant ? ' screen-reader-text' : ''; ?>"><?php echo esc_html( $bptm_row['label'] ); ?></span>
				<span class="bptm-meta-value"><?php echo wp_kses( $bptm_row['value'], \BPTM\Render\Context::kses() ); ?></span>
			</li>
		<?php endforeach; ?>
	</ul>
<?php endif; ?>
