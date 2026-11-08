<?php
/**
 * Classic widget: renders a saved Showcase (members are edited in the showcase's block).
 *
 * Instances saved before v2 with the "quick list" mode (number / group / theme / order …) keep
 * rendering: their settings are mapped onto the block's default sample members.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Team members widget.
 */
class Widget extends \WP_Widget {

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct(
			'bptm_showcase_widget',
			__( 'BP Team Member', 'bp-team-member' ),
			array(
				'description'                 => __( 'Display a saved team showcase.', 'bp-team-member' ),
				'classname'                   => 'bptm-widget',
				'customize_selective_refresh' => true,
				'show_instance_in_rest'       => true,
			)
		);
	}

	/**
	 * Register.
	 */
	public static function register() {
		register_widget( __CLASS__ );
	}

	/**
	 * Defaults.
	 *
	 * @return array
	 */
	public static function defaults() {
		return array(
			'title'    => __( 'Meet Our Team', 'bp-team-member' ),
			'showcase' => 0,
		);
	}

	/**
	 * Normalised instance.
	 *
	 * @param array $instance Instance.
	 * @return array
	 */
	public static function normalize( $instance ) {
		$instance = is_array( $instance ) ? $instance : array();
		$out      = wp_parse_args( $instance, self::defaults() );
		$out['title']    = is_scalar( $out['title'] ) ? (string) $out['title'] : '';
		$out['showcase'] = is_scalar( $out['showcase'] ) ? absint( $out['showcase'] ) : 0;
		return $out;
	}

	/**
	 * Legacy "quick list" instance (saved before v2 without a showcase)?
	 *
	 * @param array $instance Raw instance.
	 * @return bool
	 */
	private static function is_legacy_quick( $instance ) {
		return is_array( $instance ) && isset( $instance['source'] ) && 'quick' === $instance['source'];
	}

	/**
	 * Widget HTML (without sidebar wrappers).
	 *
	 * @param array $instance Instance.
	 * @return string
	 */
	public static function content( $instance ) {
		$i = self::normalize( $instance );
		if ( ! self::is_legacy_quick( $instance ) ) {
			return $i['showcase'] ? Showcase::render( $i['showcase'] ) : '';
		}

		// Legacy quick list: same look as before, with the block's default sample members.
		$quick = array();
		foreach ( array( 'theme', 'number', 'group', 'orderby', 'order', 'link' ) as $key ) {
			if ( isset( $instance[ $key ] ) && is_scalar( $instance[ $key ] ) && '' !== (string) $instance[ $key ] ) {
				$quick[ $key ] = (string) $instance[ $key ];
			}
		}
		$attributes = array_merge( Quick::sidebar_defaults(), Quick::map( $quick ) );
		$cols       = isset( $instance['columns'] ) && is_numeric( $instance['columns'] ) ? max( 1, min( 4, (int) $instance['columns'] ) ) : 1;

		$attributes['columns'] = array(
			'desktop'        => $cols,
			'tablet'         => $cols,
			'mobilePortrait' => min( $cols, 2 ),
			'mobile'         => 1,
		);
		return '<div class="bptm-sidebar-list">' . Quick::render( $attributes ) . '</div>';
	}

	/**
	 * Front end.
	 *
	 * @param array $args     Sidebar args.
	 * @param array $instance Instance.
	 */
	public function widget( $args, $instance ) {
		$html = self::content( $instance );
		if ( '' === $html ) {
			return;
		}
		$i     = self::normalize( $instance );
		$title = apply_filters( 'widget_title', $i['title'], $instance, $this->id_base );

		echo $args['before_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- theme markup.
		if ( '' !== (string) $title ) {
			echo $args['before_title'] . esc_html( $title ) . $args['after_title']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- theme markup.
		}
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered block output.
		echo $args['after_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- theme markup.
	}

	/**
	 * Admin form.
	 *
	 * @param array $instance Instance.
	 * @return string
	 */
	public function form( $instance ) {
		$i         = self::normalize( $instance );
		$showcases = Showcase::choices();
		$field     = $this->get_field_id( 'showcase' );
		?>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'bp-team-member' ); ?></label>
			<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $i['title'] ); ?>" />
		</p>
		<p class="bptm-widget-field bptm-widget-showcase">
			<label for="<?php echo esc_attr( $field ); ?>"><?php esc_html_e( 'Showcase:', 'bp-team-member' ); ?></label>
			<select class="widefat" id="<?php echo esc_attr( $field ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'showcase' ) ); ?>">
				<option value="0"><?php esc_html_e( '— Select —', 'bp-team-member' ); ?></option>
				<?php foreach ( $showcases as $id => $label ) : ?>
					<option value="<?php echo esc_attr( (string) $id ); ?>" <?php selected( (int) $i['showcase'], (int) $id ); ?>><?php echo esc_html( $label ); ?></option>
				<?php endforeach; ?>
			</select>
		</p>
		<?php if ( self::is_legacy_quick( $instance ) ) : ?>
			<p class="description"><?php esc_html_e( 'This widget still shows its old member list (sample members). Choose a showcase and save to manage the members in the showcase\'s block.', 'bp-team-member' ); ?></p>
		<?php endif; ?>
		<p>
			<a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=bptm_showcase' ) ); ?>"><?php echo esc_html( $showcases ? __( 'Create a new showcase', 'bp-team-member' ) : __( 'Create a showcase first.', 'bp-team-member' ) ); ?></a>
		</p>
		<?php
		return '';
	}

	/**
	 * Save. Choosing a showcase drops the legacy quick-list settings.
	 *
	 * @param array $new_instance New.
	 * @param array $old_instance Old.
	 * @return array
	 */
	public function update( $new_instance, $old_instance ) {
		$n        = is_array( $new_instance ) ? $new_instance : array();
		$old      = is_array( $old_instance ) ? $old_instance : array();
		$showcase = isset( $n['showcase'] ) && is_scalar( $n['showcase'] ) ? absint( $n['showcase'] ) : 0;
		$out      = array(
			'title'    => isset( $n['title'] ) && is_scalar( $n['title'] ) ? sanitize_text_field( (string) $n['title'] ) : '',
			'showcase' => $showcase,
		);
		if ( ! $showcase && self::is_legacy_quick( $old ) ) {
			// Keep the old list until a showcase is chosen.
			foreach ( array( 'source', 'number', 'group', 'theme', 'columns', 'orderby', 'order', 'link' ) as $key ) {
				if ( isset( $old[ $key ] ) && is_scalar( $old[ $key ] ) ) {
					$out[ $key ] = sanitize_text_field( (string) $old[ $key ] );
				}
			}
		}
		return $out;
	}
}

add_action( 'widgets_init', array( __NAMESPACE__ . '\\Widget', 'register' ) );
