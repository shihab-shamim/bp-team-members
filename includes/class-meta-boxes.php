<?php
/**
 * Member edit screen meta boxes: details, flip image, social links, skills.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Meta boxes for bptm_member.
 */
class Meta_Boxes {

	const NONCE_ACTION = 'bptm_save_member_meta';
	const NONCE_NAME   = 'bptm_member_meta_nonce';

	/**
	 * Hook everything.
	 */
	public static function init() {
		add_action( 'add_meta_boxes_bptm_member', array( __CLASS__, 'add_meta_boxes' ) );
		add_action( 'save_post_bptm_member', array( __CLASS__, 'save' ), 10, 2 );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
	}

	/**
	 * Detail field definitions: name => [meta key, label, input type, placeholder, help].
	 *
	 * @return array
	 */
	public static function detail_fields() {
		return array(
			'designation'     => array( '_bptm_designation', __( 'Designation', 'bp-team-member' ), 'text', __( 'e.g. Lead Designer', 'bp-team-member' ), '' ),
			'company'         => array( '_bptm_company', __( 'Company', 'bp-team-member' ), 'text', '', '' ),
			'company_website' => array( '_bptm_company_website', __( 'Company Website', 'bp-team-member' ), 'url', 'https://', '' ),
			'land_phone'      => array( '_bptm_land_phone', __( 'Land Phone', 'bp-team-member' ), 'text', '', '' ),
			'cell_phone'      => array( '_bptm_cell_phone', __( 'Cell Phone', 'bp-team-member' ), 'text', '', '' ),
			'email'           => array( '_bptm_email', __( 'Email', 'bp-team-member' ), 'email', 'name@example.com', '' ),
			'email_cc'        => array( '_bptm_email_cc', __( 'Email CC', 'bp-team-member' ), 'text', 'one@example.com; two@example.com', __( 'Added as CC to the email link. Separate multiple addresses with ; or ,', 'bp-team-member' ) ),
			'email_bcc'       => array( '_bptm_email_bcc', __( 'Email BCC', 'bp-team-member' ), 'text', 'one@example.com; two@example.com', __( 'Added as BCC to the email link. Separate multiple addresses with ; or ,', 'bp-team-member' ) ),
			'address'         => array( '_bptm_address', __( 'Address', 'bp-team-member' ), 'text', '', '' ),
			'zip_code'        => array( '_bptm_zip_code', __( 'Zip Code', 'bp-team-member' ), 'text', '', '' ),
			'ribbon'          => array( '_bptm_ribbon', __( 'Ribbon', 'bp-team-member' ), 'text', __( 'e.g. New', 'bp-team-member' ), __( 'Short label shown as a ribbon on themes that support it.', 'bp-team-member' ) ),
			'vcard'           => array( '_bptm_vcard', __( 'vCard Link', 'bp-team-member' ), 'url', 'https://', __( 'Link to a .vcf file (internal or external).', 'bp-team-member' ) ),
			'custom_page'     => array( '_bptm_custom_page', __( 'Custom Page Link', 'bp-team-member' ), 'url', 'https://', __( 'Used when the block link type is "Custom link".', 'bp-team-member' ) ),
		);
	}

	/**
	 * Register meta boxes.
	 */
	public static function add_meta_boxes() {
		add_meta_box( 'bptm-member-details', __( 'Member Details', 'bp-team-member' ), array( __CLASS__, 'render_details' ), CPT::POST_TYPE, 'normal', 'high' );
		add_meta_box( 'bptm-member-social', __( 'Social Links', 'bp-team-member' ), array( __CLASS__, 'render_social' ), CPT::POST_TYPE, 'normal', 'high' );
		add_meta_box( 'bptm-member-skills', __( 'Skills', 'bp-team-member' ), array( __CLASS__, 'render_skills' ), CPT::POST_TYPE, 'normal', 'high' );
		add_meta_box( 'bptm-member-flip', __( 'Flip Image', 'bp-team-member' ), array( __CLASS__, 'render_flip' ), CPT::POST_TYPE, 'side', 'low' );
	}

	/**
	 * Enqueue assets on the member edit screen.
	 *
	 * @param string $hook Admin page hook.
	 */
	public static function enqueue( $hook ) {
		if ( 'post.php' !== $hook && 'post-new.php' !== $hook ) {
			return;
		}
		$screen = get_current_screen();
		if ( ! $screen || CPT::POST_TYPE !== $screen->post_type ) {
			return;
		}

		wp_enqueue_media();
		self::enqueue_icon_font();

		$ver = defined( 'BPTM_VERSION' ) ? BPTM_VERSION : '1.0.0';
		$css = BPTM_DIR . 'assets/admin/meta-boxes.css';
		$js  = BPTM_DIR . 'assets/admin/meta-boxes.js';

		wp_enqueue_style( 'bptm-admin-meta-boxes', BPTM_URL . 'assets/admin/meta-boxes.css', array(), file_exists( $css ) ? $ver . '.' . filemtime( $css ) : $ver );
		wp_enqueue_script( 'bptm-admin-meta-boxes', BPTM_URL . 'assets/admin/meta-boxes.js', array( 'jquery', 'jquery-ui-sortable' ), file_exists( $js ) ? $ver . '.' . filemtime( $js ) : $ver, true );

		$icons = array();
		foreach ( bptm_social_icons() as $class => $label ) {
			$icons[] = array( $class, $label );
		}

		wp_localize_script(
			'bptm-admin-meta-boxes',
			'bptmMetaBoxes',
			array(
				'icons' => $icons,
				'i18n'  => array(
					'chooseIcon'  => __( 'Choose icon', 'bp-team-member' ),
					'search'      => __( 'Search icons…', 'bp-team-member' ),
					'noIcons'     => __( 'No icons match your search.', 'bp-team-member' ),
					'close'       => __( 'Close', 'bp-team-member' ),
					'mediaTitle'  => __( 'Select flip image', 'bp-team-member' ),
					'mediaButton' => __( 'Use this image', 'bp-team-member' ),
					'confirmDel'  => __( 'Remove this row?', 'bp-team-member' ),
				),
			)
		);
	}

	/**
	 * Enqueue Font Awesome for icon previews (render registers 'bptm-fontawesome').
	 */
	public static function enqueue_icon_font() {
		if ( wp_style_is( 'bptm-fontawesome', 'registered' ) ) {
			wp_enqueue_style( 'bptm-fontawesome' );
			return;
		}
		// CONTRACT-GAP: render registers 'bptm-fontawesome'; if it is not registered on admin screens we load the vendored file directly.
		foreach ( array( 'assets/vendor/fontawesome/css/all.min.css', 'assets/vendor/fontawesome/css/all.css' ) as $rel ) {
			if ( file_exists( BPTM_DIR . $rel ) ) {
				wp_enqueue_style( 'bptm-fontawesome', BPTM_URL . $rel, array(), BPTM_VERSION );
				return;
			}
		}
	}

	/**
	 * Details box.
	 *
	 * @param \WP_Post $post Post.
	 */
	public static function render_details( $post ) {
		wp_nonce_field( self::NONCE_ACTION, self::NONCE_NAME );
		$featured = '1' === (string) get_post_meta( $post->ID, '_bptm_featured', true );
		?>
		<div class="bptm-mb bptm-mb-details">
			<div class="bptm-mb-grid">
				<?php
				foreach ( self::detail_fields() as $name => $field ) :
					list( $meta_key, $label, $type, $placeholder, $help ) = $field;
					$value = get_post_meta( $post->ID, $meta_key, true );
					$value = is_scalar( $value ) ? (string) $value : '';
					if ( in_array( $name, array( 'email_cc', 'email_bcc' ), true ) ) {
						$value = str_replace( ',', '; ', $value );
					}
					$id = 'bptm-field-' . $name;
					?>
					<div class="bptm-mb-field bptm-mb-field-<?php echo esc_attr( $name ); ?>">
						<label for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $label ); ?></label>
						<input type="<?php echo esc_attr( $type ); ?>" id="<?php echo esc_attr( $id ); ?>" name="bptm_meta[<?php echo esc_attr( $name ); ?>]" value="<?php echo 'url' === $type ? esc_url( $value ) : esc_attr( $value ); ?>" placeholder="<?php echo esc_attr( $placeholder ); ?>" class="widefat" />
						<?php if ( $help ) : ?>
							<p class="description"><?php echo esc_html( $help ); ?></p>
						<?php endif; ?>
					</div>
				<?php endforeach; ?>
				<div class="bptm-mb-field bptm-mb-field-featured">
					<label class="bptm-mb-toggle" for="bptm-field-featured">
						<input type="checkbox" id="bptm-field-featured" name="bptm_meta[featured]" value="1" <?php checked( $featured ); ?> />
						<span><?php esc_html_e( 'Featured member', 'bp-team-member' ); ?></span>
					</label>
					<p class="description"><?php esc_html_e( 'Featured members can be highlighted / listed first when "Enable featuring" is on in the block.', 'bp-team-member' ); ?></p>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Flip image box.
	 *
	 * @param \WP_Post $post Post.
	 */
	public static function render_flip( $post ) {
		$flip_id = (int) get_post_meta( $post->ID, '_bptm_flip_image', true );
		$src     = $flip_id ? wp_get_attachment_image_url( $flip_id, 'medium' ) : '';
		if ( ! $src ) {
			$flip_id = 0;
		}
		?>
		<div class="bptm-mb bptm-media-field" data-bptm-media>
			<div class="bptm-media-preview"<?php echo $src ? '' : ' hidden'; ?>>
				<img src="<?php echo esc_url( (string) $src ); ?>" alt="" />
			</div>
			<input type="hidden" name="bptm_meta[flip_image]" value="<?php echo esc_attr( (string) $flip_id ); ?>" class="bptm-media-id" />
			<p>
				<button type="button" class="button bptm-media-select"><?php echo $src ? esc_html__( 'Change image', 'bp-team-member' ) : esc_html__( 'Select image', 'bp-team-member' ); ?></button>
				<button type="button" class="button-link button-link-delete bptm-media-remove"<?php echo $src ? '' : ' hidden'; ?>><?php esc_html_e( 'Remove', 'bp-team-member' ); ?></button>
			</p>
			<p class="description"><?php esc_html_e( 'Back side image for the flip themes.', 'bp-team-member' ); ?></p>
		</div>
		<?php
	}

	/**
	 * One social row.
	 *
	 * @param string $index Row index.
	 * @param string $icon  Icon class.
	 * @param string $link  Link.
	 */
	private static function social_row( $index, $icon = '', $link = '' ) {
		$icons = bptm_social_icons();
		$label = isset( $icons[ $icon ] ) ? $icons[ $icon ] : $icon;
		?>
		<tr class="bptm-repeater-row">
			<td class="bptm-col-handle"><span class="bptm-handle dashicons dashicons-menu" title="<?php esc_attr_e( 'Drag to reorder', 'bp-team-member' ); ?>"></span></td>
			<td class="bptm-col-icon">
				<div class="bptm-icon-field">
					<button type="button" class="button bptm-icon-choose" aria-label="<?php esc_attr_e( 'Choose icon', 'bp-team-member' ); ?>">
						<i class="bptm-icon-preview <?php echo esc_attr( $icon ); ?>" aria-hidden="true"></i>
						<span class="bptm-icon-label"><?php echo $label ? esc_html( $label ) : esc_html__( 'Choose icon', 'bp-team-member' ); ?></span>
					</button>
					<input type="hidden" class="bptm-icon-input" name="bptm_social[<?php echo esc_attr( $index ); ?>][icon]" value="<?php echo esc_attr( $icon ); ?>" />
				</div>
			</td>
			<td class="bptm-col-link"><input type="text" class="widefat" name="bptm_social[<?php echo esc_attr( $index ); ?>][link]" value="<?php echo esc_attr( $link ); ?>" placeholder="<?php esc_attr_e( 'https://… , email or phone', 'bp-team-member' ); ?>" /></td>
			<td class="bptm-col-remove"><button type="button" class="button-link button-link-delete bptm-row-remove" aria-label="<?php esc_attr_e( 'Remove row', 'bp-team-member' ); ?>"><span class="dashicons dashicons-trash" aria-hidden="true"></span></button></td>
		</tr>
		<?php
	}

	/**
	 * Social box.
	 *
	 * @param \WP_Post $post Post.
	 */
	public static function render_social( $post ) {
		$rows = bptm_get_member_social( $post->ID );
		?>
		<div class="bptm-mb bptm-repeater" data-bptm-repeater="social">
			<table class="bptm-repeater-table widefat striped">
				<thead>
					<tr>
						<th class="bptm-col-handle"><span class="screen-reader-text"><?php esc_html_e( 'Order', 'bp-team-member' ); ?></span></th>
						<th class="bptm-col-icon"><?php esc_html_e( 'Icon', 'bp-team-member' ); ?></th>
						<th class="bptm-col-link"><?php esc_html_e( 'Link', 'bp-team-member' ); ?></th>
						<th class="bptm-col-remove"><span class="screen-reader-text"><?php esc_html_e( 'Remove', 'bp-team-member' ); ?></span></th>
					</tr>
				</thead>
				<tbody class="bptm-repeater-body">
					<?php
					foreach ( $rows as $i => $row ) {
						self::social_row( (string) $i, $row['icon'], $row['link'] );
					}
					?>
				</tbody>
			</table>
			<template class="bptm-repeater-template"><?php self::social_row( '__INDEX__' ); ?></template>
			<p class="bptm-repeater-empty"<?php echo $rows ? ' hidden' : ''; ?>><?php esc_html_e( 'No social links yet.', 'bp-team-member' ); ?></p>
			<p><button type="button" class="button button-secondary bptm-row-add"><span class="dashicons dashicons-plus-alt2" aria-hidden="true"></span> <?php esc_html_e( 'Add Social Link', 'bp-team-member' ); ?></button></p>
			<input type="hidden" name="bptm_social_present" value="1" />
		</div>
		<?php
	}

	/**
	 * One skill row.
	 *
	 * @param string $index   Row index.
	 * @param string $skill   Skill name.
	 * @param string $percent Percent.
	 */
	private static function skill_row( $index, $skill = '', $percent = '' ) {
		?>
		<tr class="bptm-repeater-row">
			<td class="bptm-col-handle"><span class="bptm-handle dashicons dashicons-menu" title="<?php esc_attr_e( 'Drag to reorder', 'bp-team-member' ); ?>"></span></td>
			<td class="bptm-col-skill"><input type="text" class="widefat" name="bptm_skills[<?php echo esc_attr( $index ); ?>][skill]" value="<?php echo esc_attr( $skill ); ?>" placeholder="<?php esc_attr_e( 'e.g. WordPress', 'bp-team-member' ); ?>" /></td>
			<td class="bptm-col-percent">
				<div class="bptm-percent">
					<input type="range" min="0" max="100" step="1" class="bptm-percent-range" value="<?php echo esc_attr( '' === $percent ? '50' : $percent ); ?>" tabindex="-1" aria-hidden="true" />
					<input type="number" min="0" max="100" step="1" class="small-text bptm-percent-number" name="bptm_skills[<?php echo esc_attr( $index ); ?>][percent]" value="<?php echo esc_attr( '' === $percent ? '50' : $percent ); ?>" />
					<span>%</span>
				</div>
			</td>
			<td class="bptm-col-remove"><button type="button" class="button-link button-link-delete bptm-row-remove" aria-label="<?php esc_attr_e( 'Remove row', 'bp-team-member' ); ?>"><span class="dashicons dashicons-trash" aria-hidden="true"></span></button></td>
		</tr>
		<?php
	}

	/**
	 * Skills box.
	 *
	 * @param \WP_Post $post Post.
	 */
	public static function render_skills( $post ) {
		$rows = bptm_get_member_skills( $post->ID );
		?>
		<div class="bptm-mb bptm-repeater" data-bptm-repeater="skills">
			<table class="bptm-repeater-table widefat striped">
				<thead>
					<tr>
						<th class="bptm-col-handle"><span class="screen-reader-text"><?php esc_html_e( 'Order', 'bp-team-member' ); ?></span></th>
						<th class="bptm-col-skill"><?php esc_html_e( 'Skill', 'bp-team-member' ); ?></th>
						<th class="bptm-col-percent"><?php esc_html_e( 'Percent', 'bp-team-member' ); ?></th>
						<th class="bptm-col-remove"><span class="screen-reader-text"><?php esc_html_e( 'Remove', 'bp-team-member' ); ?></span></th>
					</tr>
				</thead>
				<tbody class="bptm-repeater-body">
					<?php
					foreach ( $rows as $i => $row ) {
						self::skill_row( (string) $i, $row['skill'], (string) $row['percent'] );
					}
					?>
				</tbody>
			</table>
			<template class="bptm-repeater-template"><?php self::skill_row( '__INDEX__' ); ?></template>
			<p class="bptm-repeater-empty"<?php echo $rows ? ' hidden' : ''; ?>><?php esc_html_e( 'No skills yet.', 'bp-team-member' ); ?></p>
			<p><button type="button" class="button button-secondary bptm-row-add"><span class="dashicons dashicons-plus-alt2" aria-hidden="true"></span> <?php esc_html_e( 'Add Skill', 'bp-team-member' ); ?></button></p>
			<input type="hidden" name="bptm_skills_present" value="1" />
		</div>
		<?php
	}

	/**
	 * Save meta box data.
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post    Post.
	 */
	public static function save( $post_id, $post ) {
		if ( ! isset( $_POST[ self::NONCE_NAME ] ) ) {
			return;
		}
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST[ self::NONCE_NAME ] ) ), self::NONCE_ACTION ) ) {
			return;
		}
		if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		// phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- each value is sanitized below.
		$raw = isset( $_POST['bptm_meta'] ) && is_array( $_POST['bptm_meta'] ) ? wp_unslash( $_POST['bptm_meta'] ) : array();

		foreach ( self::detail_fields() as $name => $field ) {
			$meta_key = $field[0];
			$value    = isset( $raw[ $name ] ) && is_scalar( $raw[ $name ] ) ? (string) $raw[ $name ] : '';
			$value    = sanitize_meta( $meta_key, $value, 'post', CPT::POST_TYPE );
			self::store( $post_id, $meta_key, $value );
		}

		self::store( $post_id, '_bptm_featured', ! empty( $raw['featured'] ) ? '1' : '' );

		$flip = isset( $raw['flip_image'] ) ? absint( $raw['flip_image'] ) : 0;
		if ( $flip && ! wp_attachment_is_image( $flip ) ) {
			$flip = 0;
		}
		self::store( $post_id, '_bptm_flip_image', $flip );

		if ( isset( $_POST['bptm_social_present'] ) ) {
			$social = isset( $_POST['bptm_social'] ) && is_array( $_POST['bptm_social'] ) ? bptm_sanitize_social( array_values( wp_unslash( $_POST['bptm_social'] ) ) ) : array();
			self::store( $post_id, '_bptm_social', $social );
		}

		if ( isset( $_POST['bptm_skills_present'] ) ) {
			$skills = isset( $_POST['bptm_skills'] ) && is_array( $_POST['bptm_skills'] ) ? bptm_sanitize_skills( array_values( wp_unslash( $_POST['bptm_skills'] ) ) ) : array();
			self::store( $post_id, '_bptm_skills', $skills );
		}
		// phpcs:enable

		do_action( 'bptm_member_meta_saved', $post_id, $post );
	}

	/**
	 * Update or delete a meta value.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $key     Meta key.
	 * @param mixed  $value   Value (empty => delete).
	 */
	private static function store( $post_id, $key, $value ) {
		if ( '' === $value || 0 === $value || array() === $value || null === $value ) {
			delete_post_meta( $post_id, $key );
		} else {
			update_post_meta( $post_id, $key, $value );
		}
	}
}

Meta_Boxes::init();
