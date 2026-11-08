<?php
/**
 * Classic widget: a quick member list (title, total members, group, theme, order, link)
 * or a saved Showcase.
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
				'description'                 => __( 'Display team members: a quick list or a saved showcase.', 'bp-team-member' ),
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
			'source'   => 'quick',
			'showcase' => 0,
			'number'   => 3,
			'group'    => '',
			'theme'    => Quick::SIDEBAR_THEME,
			'columns'  => 1,
			'orderby'  => 'date',
			'order'    => 'DESC',
			'link'     => 'default',
		);
	}

	/**
	 * Normalised instance (instances saved before the quick mode existed only had a showcase).
	 *
	 * @param array $instance Instance.
	 * @return array
	 */
	public static function normalize( $instance ) {
		$instance = is_array( $instance ) ? $instance : array();
		if ( ! isset( $instance['source'] ) && ! empty( $instance['showcase'] ) ) {
			$instance['source'] = 'showcase';
		}
		return wp_parse_args( $instance, self::defaults() );
	}

	/**
	 * Widget HTML (without sidebar wrappers).
	 *
	 * @param array $instance Instance.
	 * @return string
	 */
	public static function content( $instance ) {
		$i = self::normalize( $instance );
		if ( 'showcase' === $i['source'] ) {
			return $i['showcase'] ? Showcase::render( absint( $i['showcase'] ) ) : '';
		}
		$attributes = Quick::map(
			array(
				'theme'   => $i['theme'],
				'number'  => (string) $i['number'],
				'group'   => $i['group'],
				'columns' => (string) $i['columns'],
				'orderby' => $i['orderby'],
				'order'   => 'ASC' === strtoupper( (string) $i['order'] ) ? 'ASC' : 'DESC',
				'link'    => $i['link'],
			)
		);
		$attributes            = array_merge( Quick::sidebar_defaults(), $attributes );
		$cols                  = max( 1, min( 4, (int) $i['columns'] ) );
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
	 * A <select>.
	 *
	 * @param string $field   Field.
	 * @param string $label   Label.
	 * @param array  $choices value => label.
	 * @param string $value   Current.
	 */
	private function select( $field, $label, array $choices, $value ) {
		?>
		<p class="bptm-widget-field bptm-widget-<?php echo esc_attr( $field ); ?>">
			<label for="<?php echo esc_attr( $this->get_field_id( $field ) ); ?>"><?php echo esc_html( $label ); ?></label>
			<select class="widefat" id="<?php echo esc_attr( $this->get_field_id( $field ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( $field ) ); ?>">
				<?php foreach ( $choices as $key => $text ) : ?>
					<option value="<?php echo esc_attr( (string) $key ); ?>" <?php selected( (string) $value, (string) $key ); ?>><?php echo esc_html( $text ); ?></option>
				<?php endforeach; ?>
			</select>
		</p>
		<?php
	}

	/**
	 * Admin form.
	 *
	 * @param array $instance Instance.
	 * @return string
	 */
	public function form( $instance ) {
		$i       = self::normalize( $instance );
		$choices = Quick::choices();
		$themes  = $choices['themes'];
		// Compact themes first: they are made for widget areas.
		uksort(
			$themes,
			static function ( $a, $b ) {
				$sa = 0 === strpos( $a, 'sidebar-' ) ? 0 : 1;
				$sb = 0 === strpos( $b, 'sidebar-' ) ? 0 : 1;
				return $sa === $sb ? 0 : $sa - $sb;
			}
		);
		$uid = $this->get_field_id( 'source' );
		?>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'bp-team-member' ); ?></label>
			<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $i['title'] ); ?>" />
		</p>
		<p>
			<?php esc_html_e( 'Show:', 'bp-team-member' ); ?><br />
			<label><input type="radio" class="bptm-widget-source" name="<?php echo esc_attr( $this->get_field_name( 'source' ) ); ?>" value="quick" <?php checked( $i['source'], 'quick' ); ?> /> <?php esc_html_e( 'Team members list', 'bp-team-member' ); ?></label><br />
			<label><input type="radio" class="bptm-widget-source" name="<?php echo esc_attr( $this->get_field_name( 'source' ) ); ?>" value="showcase" <?php checked( $i['source'], 'showcase' ); ?> /> <?php esc_html_e( 'A saved showcase', 'bp-team-member' ); ?></label>
		</p>
		<fieldset id="<?php echo esc_attr( $uid ); ?>-quick" class="bptm-widget-quick" style="margin:0 0 1em;padding:0 10px;border:1px solid #dcdcde;">
			<legend><?php esc_html_e( 'Team members list', 'bp-team-member' ); ?></legend>
			<p>
				<label for="<?php echo esc_attr( $this->get_field_id( 'number' ) ); ?>"><?php esc_html_e( 'Total members to display:', 'bp-team-member' ); ?></label>
				<input class="widefat" type="number" min="-1" step="1" id="<?php echo esc_attr( $this->get_field_id( 'number' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'number' ) ); ?>" value="<?php echo esc_attr( (string) $i['number'] ); ?>" />
				<small><?php esc_html_e( '-1 shows all members.', 'bp-team-member' ); ?></small>
			</p>
			<?php
			$this->select( 'group', __( 'Team group:', 'bp-team-member' ), array( '' => __( 'All groups', 'bp-team-member' ) ) + $choices['groups'], $i['group'] );
			$this->select( 'theme', __( 'Theme:', 'bp-team-member' ), $themes, $i['theme'] );
			$this->select(
				'columns',
				__( 'Columns:', 'bp-team-member' ),
				array(
					'1' => '1',
					'2' => '2',
					'3' => '3',
					'4' => '4',
				),
				(string) $i['columns']
			);
			$this->select( 'orderby', __( 'Order by:', 'bp-team-member' ), Quick::orderby_choices(), $i['orderby'] );
			$this->select(
				'order',
				__( 'Order:', 'bp-team-member' ),
				array(
					'DESC' => __( 'Descending', 'bp-team-member' ),
					'ASC'  => __( 'Ascending', 'bp-team-member' ),
				),
				$i['order']
			);
			$this->select( 'link', __( 'Member link:', 'bp-team-member' ), Quick::link_choices(), $i['link'] );
			?>
		</fieldset>
		<fieldset id="<?php echo esc_attr( $uid ); ?>-showcase" class="bptm-widget-showcase" style="margin:0 0 1em;padding:0 10px;border:1px solid #dcdcde;">
			<legend><?php esc_html_e( 'Saved showcase', 'bp-team-member' ); ?></legend>
			<?php $this->select( 'showcase', __( 'Showcase:', 'bp-team-member' ), array( '0' => __( '— Select —', 'bp-team-member' ) ) + $choices['showcases'], (string) $i['showcase'] ); ?>
			<?php if ( ! $choices['showcases'] ) : ?>
				<p><a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=bptm_showcase' ) ); ?>"><?php esc_html_e( 'Create a showcase first.', 'bp-team-member' ); ?></a></p>
			<?php endif; ?>
		</fieldset>
		<?php
		return '';
	}

	/**
	 * Save.
	 *
	 * @param array $new_instance New.
	 * @param array $old_instance Old.
	 * @return array
	 */
	public function update( $new_instance, $old_instance ) {
		unset( $old_instance );
		$d       = self::defaults();
		$n       = is_array( $new_instance ) ? $new_instance : array();
		$themes  = class_exists( '\BPTM\Render\Themes' ) ? \BPTM\Render\Themes::all() : array();
		$theme   = isset( $n['theme'] ) ? sanitize_key( $n['theme'] ) : $d['theme'];
		$orderby = isset( $n['orderby'] ) ? sanitize_text_field( $n['orderby'] ) : $d['orderby'];
		$link    = isset( $n['link'] ) ? sanitize_key( $n['link'] ) : $d['link'];
		$number  = isset( $n['number'] ) && '' !== $n['number'] ? (int) $n['number'] : $d['number'];
		return array(
			'title'    => isset( $n['title'] ) ? sanitize_text_field( $n['title'] ) : '',
			'source'   => isset( $n['source'] ) && 'showcase' === $n['source'] ? 'showcase' : 'quick',
			'showcase' => isset( $n['showcase'] ) ? absint( $n['showcase'] ) : 0,
			'number'   => $number < 1 ? -1 : min( 100, $number ),
			'group'    => isset( $n['group'] ) ? sanitize_title( $n['group'] ) : '',
			'theme'    => isset( $themes[ $theme ] ) || ! $themes ? $theme : $d['theme'],
			'columns'  => isset( $n['columns'] ) ? max( 1, min( 4, (int) $n['columns'] ) ) : 1,
			'orderby'  => array_key_exists( $orderby, Quick::orderby_choices() ) ? $orderby : $d['orderby'],
			'order'    => isset( $n['order'] ) && is_scalar( $n['order'] ) && 'ASC' === strtoupper( trim( (string) $n['order'] ) ) ? 'ASC' : 'DESC',
			'link'     => array_key_exists( $link, Quick::link_choices() ) ? $link : $d['link'],
		);
	}
}

add_action( 'widgets_init', array( __NAMESPACE__ . '\\Widget', 'register' ) );
