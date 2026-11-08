<?php
/**
 * Settings: Preferences and Translations admin pages.
 *
 * Option bptm_settings holds preferences + translations (see Settings::defaults()).
 * Values of removed preferences (member slug, single page, ACF …) and the old option
 * bptm_taxonomy_settings stay in the database untouched; nothing reads them any more.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings controller.
 */
class Settings {

	const OPTION      = 'bptm_settings';
	const GROUP       = 'bptm_settings_group';
	const PARENT_SLUG = 'edit.php?post_type=bptm_showcase';
	const CAPABILITY  = 'manage_options';

	/**
	 * Hook everything.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ), 20 );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
		// admin_menu runs before WordPress refuses the unknown plugin page (user_can_access_admin_page()).
		add_action( 'admin_menu', array( __CLASS__, 'redirect_legacy_pages' ), 1 );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'admin_assets' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_custom_css' ), 100 );
	}

	/* ------------------------------------------------------------------
	 * Defaults
	 * ------------------------------------------------------------------ */

	/**
	 * Front-end translatable strings => default English text.
	 *
	 * @return array
	 */
	public static function translation_defaults() {
		return bptm_translation_defaults();
	}

	/**
	 * Preference defaults (without translations).
	 *
	 * @return array
	 */
	public static function preference_defaults() {
		return bptm_preference_defaults();
	}

	/**
	 * All defaults of option bptm_settings (preferences + translations).
	 *
	 * @return array
	 */
	public static function defaults() {
		return array_merge( self::preference_defaults(), self::translation_defaults() );
	}

	/**
	 * Preferences merged with defaults.
	 *
	 * @return array
	 */
	public static function all() {
		$stored = get_option( self::OPTION, array() );
		return array_merge( self::defaults(), is_array( $stored ) ? $stored : array() );
	}

	/**
	 * Get one preference.
	 *
	 * @param string $key     Key.
	 * @param mixed  $default Fallback.
	 * @return mixed
	 */
	public static function get( $key, $default = null ) {
		return bptm_get_option( $key, $default );
	}

	/**
	 * Admin URL of a settings page.
	 *
	 * @param string $page Page slug (bptm-preferences | bptm-translations).
	 * @return string
	 */
	public static function page_url( $page = 'bptm-preferences' ) {
		return add_query_arg(
			array(
				'post_type' => 'bptm_showcase',
				'page'      => $page,
			),
			admin_url( 'edit.php' )
		);
	}

	/* ------------------------------------------------------------------
	 * Field definitions
	 * ------------------------------------------------------------------ */

	/**
	 * Preference fields grouped by section.
	 *
	 * @return array section id => [ title, fields => [ key => field ] ]
	 */
	public static function preference_fields() {
		return array(
			'links' => array(
				'title'  => __( 'Contact Links', 'bp-team-member' ),
				'fields' => array(
					'land_phone_link' => array(
						'type'  => 'checkbox',
						'label' => __( 'Link land phone (tel:)', 'bp-team-member' ),
					),
					'cell_phone_link' => array(
						'type'  => 'checkbox',
						'label' => __( 'Link cell phone (tel:)', 'bp-team-member' ),
					),
					'email_link'      => array(
						'type'  => 'checkbox',
						'label' => __( 'Link email (mailto:)', 'bp-team-member' ),
					),
				),
			),
			'misc'  => array(
				'title'  => __( 'Behaviour', 'bp-team-member' ),
				'fields' => array(
					'search_all_fields'    => array(
						'type'  => 'checkbox',
						'label' => __( 'Search in all fields', 'bp-team-member' ),
						'desc'  => __( 'Name search also matches designation, company, description, contact details, groups, tags and the other text fields.', 'bp-team-member' ),
					),
					'multilingual'         => array(
						'type'  => 'checkbox',
						'label' => __( 'Enable multilingual mode', 'bp-team-member' ),
						'desc'  => __( 'Ignore the strings of the Translations page and use the translatable defaults instead (for WPML, Polylang, Loco Translate…).', 'bp-team-member' ),
					),
					'disable_google_fonts' => array(
						'type'  => 'checkbox',
						'label' => __( 'Disable Google fonts', 'bp-team-member' ),
						'desc'  => __( 'Never load fonts from Google, even when chosen in block typography.', 'bp-team-member' ),
					),
					'disable_lazy_load'    => array(
						'type'  => 'checkbox',
						'label' => __( 'Disable lazy load', 'bp-team-member' ),
						'desc'  => __( 'Add an exclusion class to member images so lazy-load plugins skip them and drop the native loading="lazy".', 'bp-team-member' ),
					),
					'lazy_load_class'      => array(
						'type'      => 'text',
						'label'     => __( 'Lazy load exclusion class', 'bp-team-member' ),
						'dependsOn' => 'disable_lazy_load',
					),
				),
			),
			'css'   => array(
				'title'  => __( 'Custom CSS', 'bp-team-member' ),
				'fields' => array(
					'custom_css' => array(
						'type'  => 'code',
						'label' => __( 'Custom CSS', 'bp-team-member' ),
						'desc'  => __( 'Printed on every front-end page.', 'bp-team-member' ),
					),
				),
			),
		);
	}

	/**
	 * Flat key => field map of preferences.
	 *
	 * @return array
	 */
	protected static function flat_preference_fields() {
		$out = array();
		foreach ( self::preference_fields() as $section ) {
			$out = array_merge( $out, $section['fields'] );
		}
		return $out;
	}

	/* ------------------------------------------------------------------
	 * Sanitization
	 * ------------------------------------------------------------------ */

	/**
	 * Sanitize bptm_settings. Supports partial page submissions (hidden `_page`
	 * field) and full arrays (update_option calls).
	 *
	 * @param mixed $input Raw value.
	 * @return array
	 */
	public static function sanitize_settings( $input ) {
		// options.php already unslashes $_POST before the sanitize callback. Never unslash again (it ate backslashes, e.g. content:"\f101").
		$input   = is_array( $input ) ? $input : array();
		$stored  = get_option( self::OPTION, array() );
		$stored  = is_array( $stored ) ? $stored : array();
		$current = array_merge( self::defaults(), $stored );
		$page    = isset( $input['_page'] ) ? sanitize_key( $input['_page'] ) : '';
		unset( $input['_page'] );

		$fields       = self::flat_preference_fields();
		$translations = self::translation_defaults();

		if ( 'preferences' === $page ) {
			$keys = array_keys( $fields );
		} elseif ( 'translations' === $page ) {
			$keys = array_keys( $translations );
		} else {
			$keys = array_keys( array_intersect_key( $input, self::defaults() ) );
		}

		$out = $current;
		foreach ( $keys as $key ) {
			$value = array_key_exists( $key, $input ) ? $input[ $key ] : null;
			if ( isset( $translations[ $key ] ) ) {
				$out[ $key ] = null === $value ? $translations[ $key ] : sanitize_text_field( (string) $value );
				continue;
			}
			$out[ $key ] = self::sanitize_preference( $key, $value, isset( $fields[ $key ] ) ? $fields[ $key ] : array() );
		}

		// Known keys only, plus whatever removed preferences were stored before (left untouched).
		return array_merge( array_diff_key( $stored, self::defaults() ), array_intersect_key( $out, self::defaults() ) );
	}

	/**
	 * Sanitize one preference value.
	 *
	 * @param string $key   Key.
	 * @param mixed  $value Raw value (null = not submitted).
	 * @param array  $field Field definition.
	 * @return mixed
	 */
	protected static function sanitize_preference( $key, $value, $field ) {
		$defaults = self::preference_defaults();
		$type     = isset( $field['type'] ) ? $field['type'] : 'text';

		switch ( $type ) {
			case 'checkbox':
				return self::to_bool( $value );

			case 'select':
				$value = is_scalar( $value ) ? (string) $value : '';
				return isset( $field['options'][ $value ] ) ? $value : $defaults[ $key ];

			case 'code':
				return null === $value ? '' : trim( wp_strip_all_tags( (string) $value ) );
		}

		$value = is_scalar( $value ) ? trim( (string) $value ) : '';

		if ( 'lazy_load_class' === $key ) {
			$classes = array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', $value ) ) );
			return $classes ? implode( ' ', $classes ) : $defaults['lazy_load_class'];
		}

		return sanitize_text_field( $value );
	}

	/**
	 * Loose boolean.
	 *
	 * @param mixed $value Value.
	 * @return bool
	 */
	public static function to_bool( $value ) {
		if ( is_bool( $value ) ) {
			return $value;
		}
		if ( is_string( $value ) ) {
			return in_array( strtolower( $value ), array( '1', 'on', 'yes', 'true' ), true );
		}
		return ! empty( $value );
	}

	/* ------------------------------------------------------------------
	 * Registration
	 * ------------------------------------------------------------------ */

	/**
	 * Register options with the Settings API.
	 */
	public static function register_settings() {
		register_setting(
			self::GROUP,
			self::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize_settings' ),
				'default'           => self::defaults(),
			)
		);
	}

	/**
	 * Admin sub-menus under the BP Team Member (Showcases) menu.
	 */
	public static function admin_menu() {
		add_submenu_page( self::PARENT_SLUG, __( 'Preferences', 'bp-team-member' ), __( 'Preferences', 'bp-team-member' ), self::CAPABILITY, 'bptm-preferences', array( __CLASS__, 'render_preferences_page' ) );
		add_submenu_page( self::PARENT_SLUG, __( 'Translations', 'bp-team-member' ), __( 'Translations', 'bp-team-member' ), self::CAPABILITY, 'bptm-translations', array( __CLASS__, 'render_translations_page' ) );

		// Alias "bptm-settings" (linked from the block editor) => Preferences. Registered, then hidden from the menu.
		$alias = add_submenu_page( self::PARENT_SLUG, __( 'Settings', 'bp-team-member' ), __( 'Settings', 'bp-team-member' ), self::CAPABILITY, 'bptm-settings', '__return_null' );
		if ( $alias ) {
			add_action(
				'load-' . $alias,
				static function () {
					wp_safe_redirect( self::page_url( 'bptm-preferences' ) );
					exit;
				}
			);
		}
		remove_submenu_page( self::PARENT_SLUG, 'bptm-settings' );
	}

	/**
	 * Old admin URLs of the removed member post type (edit.php / post-new.php?post_type=bptm_member[&page=…]):
	 * send them to the new location instead of WordPress' "invalid post type" screen.
	 */
	public static function redirect_legacy_pages() {
		global $pagenow;
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- read-only redirect.
		if ( ! in_array( $pagenow, array( 'edit.php', 'post-new.php' ), true ) || ! isset( $_GET['post_type'] ) || 'bptm_member' !== sanitize_key( wp_unslash( $_GET['post_type'] ) ) ) {
			return;
		}
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
		// phpcs:enable
		if ( 0 === strpos( $page, 'bptm-' ) && current_user_can( self::CAPABILITY ) ) {
			wp_safe_redirect( self::page_url( 'bptm-translations' === $page ? 'bptm-translations' : 'bptm-preferences' ) );
			exit;
		}
		wp_safe_redirect( admin_url( 'edit.php?post_type=bptm_showcase' ) );
		exit;
	}

	/**
	 * Admin pages of the settings area.
	 *
	 * @return array
	 */
	public static function page_slugs() {
		return array( 'bptm-preferences', 'bptm-translations' );
	}

	/**
	 * Enqueue admin assets on our pages.
	 *
	 * @param string $hook Hook suffix.
	 */
	public static function admin_assets( $hook ) {
		unset( $hook );
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! in_array( $page, self::page_slugs(), true ) ) {
			return;
		}
		$ver = defined( 'BPTM_VERSION' ) ? BPTM_VERSION : '1.0.0';
		wp_enqueue_style( 'bptm-admin-settings', BPTM_URL . 'assets/admin/settings.css', array(), $ver );
		$deps = array( 'jquery' );
		if ( 'bptm-preferences' === $page ) {
			$editor = wp_enqueue_code_editor( array( 'type' => 'text/css' ) );
			if ( false !== $editor ) {
				$deps[] = 'code-editor';
				wp_localize_script( 'code-editor', 'bptmCodeEditor', $editor );
			}
		}
		wp_enqueue_script( 'bptm-admin-settings', BPTM_URL . 'assets/admin/settings.js', $deps, $ver, true );
	}

	/* ------------------------------------------------------------------
	 * Front-end custom CSS
	 * ------------------------------------------------------------------ */

	/**
	 * Print custom CSS on the front end.
	 */
	public static function enqueue_custom_css() {
		// Print once per page. Block themes render the block (which may print the CSS inline and fire
		// `bptm_custom_css_printed`, see Block::enqueue_custom_css()) before wp_enqueue_scripts runs;
		// in the other order the renderer sees the queued `bptm-custom-css` style and skips its copy.
		if ( did_action( 'bptm_custom_css_printed' ) ) {
			return;
		}
		$css = (string) self::get( 'custom_css', '' );
		$css = trim( wp_strip_all_tags( $css ) );
		if ( '' === $css ) {
			return;
		}
		wp_register_style( 'bptm-custom-css', false, array(), defined( 'BPTM_VERSION' ) ? BPTM_VERSION : '1.0.0' );
		wp_enqueue_style( 'bptm-custom-css' );
		wp_add_inline_style( 'bptm-custom-css', $css );
	}

	/* ------------------------------------------------------------------
	 * Page rendering
	 * ------------------------------------------------------------------ */

	/**
	 * Shared page header with tab navigation.
	 *
	 * @param string $current Current page slug.
	 * @param string $title   Title.
	 */
	public static function page_header( $current, $title ) {
		$tabs = array(
			'bptm-preferences'  => __( 'Preferences', 'bp-team-member' ),
			'bptm-translations' => __( 'Translations', 'bp-team-member' ),
		);
		echo '<h1 class="bptm-admin-title">' . esc_html( $title ) . '</h1>';
		echo '<nav class="nav-tab-wrapper bptm-admin-tabs">';
		foreach ( $tabs as $slug => $label ) {
			printf(
				'<a href="%1$s" class="nav-tab%2$s">%3$s</a>',
				esc_url( self::page_url( $slug ) ),
				$slug === $current ? ' nav-tab-active' : '',
				esc_html( $label )
			);
		}
		echo '</nav>';
	}

	/**
	 * Preferences page.
	 */
	public static function render_preferences_page() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return;
		}
		$values = self::all();
		echo '<div class="wrap bptm-admin">';
		self::page_header( 'bptm-preferences', __( 'Preferences', 'bp-team-member' ) );
		settings_errors();
		echo '<form method="post" action="options.php" class="bptm-settings-form">';
		settings_fields( self::GROUP );
		echo '<input type="hidden" name="' . esc_attr( self::OPTION ) . '[_page]" value="preferences" />';

		foreach ( self::preference_fields() as $section_id => $section ) {
			echo '<div class="bptm-card" id="bptm-section-' . esc_attr( $section_id ) . '">';
			echo '<h2>' . esc_html( $section['title'] ) . '</h2>';
			echo '<table class="form-table" role="presentation"><tbody>';
			foreach ( $section['fields'] as $key => $field ) {
				self::render_field( self::OPTION, $key, $field, isset( $values[ $key ] ) ? $values[ $key ] : '' );
			}
			echo '</tbody></table>';
			echo '</div>';
		}

		submit_button( __( 'Save Preferences', 'bp-team-member' ) );
		echo '</form>';
		echo '</div>';
	}

	/**
	 * Render one field row.
	 *
	 * @param string $option Option name.
	 * @param string $key    Field key.
	 * @param array  $field  Definition.
	 * @param mixed  $value  Current value.
	 */
	protected static function render_field( $option, $key, $field, $value ) {
		$id   = 'bptm-field-' . $key;
		$name = $option . '[' . $key . ']';
		$dep  = isset( $field['dependsOn'] ) ? ' data-depends-on="bptm-field-' . esc_attr( $field['dependsOn'] ) . '"' : '';

		echo '<tr class="bptm-field bptm-field-' . esc_attr( $field['type'] ) . '"' . $dep . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
		echo '<th scope="row"><label for="' . esc_attr( $id ) . '">' . esc_html( $field['label'] ) . '</label></th><td>';

		switch ( $field['type'] ) {
			case 'checkbox':
				echo '<label class="bptm-switch"><input type="checkbox" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="1" ' . checked( self::to_bool( $value ), true, false ) . ' /><span class="bptm-switch-slider" aria-hidden="true"></span></label>';
				break;
			case 'select':
				echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '">';
				foreach ( $field['options'] as $opt => $label ) {
					echo '<option value="' . esc_attr( $opt ) . '" ' . selected( (string) $value, (string) $opt, false ) . '>' . esc_html( $label ) . '</option>';
				}
				echo '</select>';
				break;
			case 'code':
				echo '<textarea id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" rows="10" class="large-text code bptm-code-editor">' . esc_textarea( (string) $value ) . '</textarea>';
				break;
			default:
				$placeholder = isset( $field['placeholder'] ) ? $field['placeholder'] : '';
				echo '<input type="text" class="regular-text" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( is_scalar( $value ) ? (string) $value : '' ) . '" placeholder="' . esc_attr( $placeholder ) . '" />';
		}

		if ( ! empty( $field['desc'] ) ) {
			echo '<p class="description">' . esc_html( $field['desc'] ) . '</p>';
		}
		echo '</td></tr>';
	}

	/**
	 * Translations page.
	 */
	public static function render_translations_page() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return;
		}
		$values   = self::all();
		$defaults = self::translation_defaults();
		echo '<div class="wrap bptm-admin">';
		self::page_header( 'bptm-translations', __( 'Translations', 'bp-team-member' ) );
		settings_errors();
		if ( self::to_bool( $values['multilingual'] ) ) {
			echo '<div class="notice notice-warning inline"><p>' . esc_html__( 'Multilingual mode is enabled in Preferences: these strings are ignored and the translatable defaults are used instead.', 'bp-team-member' ) . '</p></div>';
		}
		echo '<form method="post" action="options.php" class="bptm-settings-form">';
		settings_fields( self::GROUP );
		echo '<input type="hidden" name="' . esc_attr( self::OPTION ) . '[_page]" value="translations" />';
		echo '<div class="bptm-card"><table class="form-table" role="presentation"><tbody>';
		foreach ( $defaults as $key => $default ) {
			self::render_field(
				self::OPTION,
				$key,
				array(
					'type'        => 'text',
					'label'       => $default,
					'placeholder' => $default,
				),
				isset( $values[ $key ] ) ? $values[ $key ] : $default
			);
		}
		echo '</tbody></table></div>';
		submit_button( __( 'Save Translations', 'bp-team-member' ) );
		echo '</form></div>';
	}
}

Settings::init();
