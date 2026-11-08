<?php
/**
 * JSON export / import of members, showcases and settings.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Import / Export tool.
 */
class Import_Export {

	const CAPABILITY = 'manage_options';
	const FORMAT     = 'bp-team-member-export';
	const UID_META   = '_bptm_export_uid';

	/**
	 * Hooks.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ), 22 );
		add_action( 'admin_post_bptm_export', array( __CLASS__, 'handle_export' ) );
		add_action( 'admin_post_bptm_import', array( __CLASS__, 'handle_import' ) );
	}

	/**
	 * Menu.
	 */
	public static function admin_menu() {
		add_submenu_page( Settings::PARENT_SLUG, __( 'Import / Export', 'bp-team-member' ), __( 'Import / Export', 'bp-team-member' ), self::CAPABILITY, 'bptm-import-export', array( __CLASS__, 'render_page' ) );
	}

	/**
	 * Page URL.
	 *
	 * @param array $args Extra args.
	 * @return string
	 */
	protected static function page_url( $args = array() ) {
		return add_query_arg( array_merge( array( 'post_type' => 'bptm_member', 'page' => 'bptm-import-export' ), $args ), admin_url( 'edit.php' ) );
	}

	/**
	 * Page.
	 */
	public static function render_page() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return;
		}
		echo '<div class="wrap bptm-admin">';
		Settings::page_header( 'bptm-import-export', __( 'Import / Export', 'bp-team-member' ) );

		$report = get_transient( 'bptm_import_report_' . get_current_user_id() );
		if ( isset( $_GET['bptm_imported'] ) && is_array( $report ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			delete_transient( 'bptm_import_report_' . get_current_user_id() );
			$class = empty( $report['error'] ) ? ( empty( $report['warning'] ) ? 'notice-success' : 'notice-warning' ) : 'notice-error';
			echo '<div class="notice ' . esc_attr( $class ) . ' is-dismissible"><p>' . esc_html( $report['message'] ) . '</p></div>';
		}
		?>
		<div class="bptm-card">
			<h2><?php esc_html_e( 'Export', 'bp-team-member' ); ?></h2>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="bptm_export" />
				<?php wp_nonce_field( 'bptm_export' ); ?>
				<p><label><input type="checkbox" name="export[]" value="members" checked /> <?php esc_html_e( 'Team members (with images, social links, skills and terms)', 'bp-team-member' ); ?></label></p>
				<p><label><input type="checkbox" name="export[]" value="showcases" checked /> <?php esc_html_e( 'Showcases', 'bp-team-member' ); ?></label></p>
				<p><label><input type="checkbox" name="export[]" value="settings" checked /> <?php esc_html_e( 'Preferences, translations and taxonomy settings', 'bp-team-member' ); ?></label></p>
				<?php submit_button( __( 'Download export file', 'bp-team-member' ), 'primary', 'submit', false ); ?>
			</form>
		</div>
		<div class="bptm-card">
			<h2><?php esc_html_e( 'Import', 'bp-team-member' ); ?></h2>
			<form method="post" enctype="multipart/form-data" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="bptm_import" />
				<?php wp_nonce_field( 'bptm_import' ); ?>
				<p><input type="file" name="import_file" accept=".json,application/json" required /></p>
				<p><label><input type="checkbox" name="import[]" value="members" checked /> <?php esc_html_e( 'Import members', 'bp-team-member' ); ?></label></p>
				<p><label><input type="checkbox" name="import[]" value="showcases" checked /> <?php esc_html_e( 'Import showcases', 'bp-team-member' ); ?></label></p>
				<p><label><input type="checkbox" name="import[]" value="settings" checked /> <?php esc_html_e( 'Import settings (overwrites current settings)', 'bp-team-member' ); ?></label></p>
				<p><label><input type="checkbox" name="overwrite" value="1" /> <?php esc_html_e( 'Update members and showcases that already exist (matched by export ID, slug or title) instead of skipping them', 'bp-team-member' ); ?></label></p>
				<?php submit_button( __( 'Import', 'bp-team-member' ), 'primary', 'submit', false ); ?>
			</form>
		</div>
		<?php
		echo '</div>';
	}

	/* ------------------------------------------------------------------
	 * Export
	 * ------------------------------------------------------------------ */

	/**
	 * Build export payload.
	 *
	 * @param array $parts members|showcases|settings.
	 * @return array
	 */
	public static function build_export( array $parts ) {
		$data = array(
			'format'    => self::FORMAT,
			'version'   => defined( 'BPTM_VERSION' ) ? BPTM_VERSION : '1.0.0',
			'site'      => home_url(),
			'generated' => gmdate( 'c' ),
		);

		if ( in_array( 'members', $parts, true ) || in_array( 'showcases', $parts, true ) ) {
			$data['terms'] = self::export_terms();
		}
		if ( in_array( 'members', $parts, true ) ) {
			$data['members'] = self::export_members();
		}
		if ( in_array( 'showcases', $parts, true ) ) {
			$data['showcases'] = array();
			$posts             = get_posts(
				array(
					'post_type'      => 'bptm_showcase',
					'post_status'    => self::statuses(),
					'posts_per_page' => -1,
				)
			);
			foreach ( $posts as $post ) {
				$data['showcases'][] = array(
					'id'       => $post->ID,
					'uid'      => self::uid( $post ),
					'title'    => $post->post_title,
					'slug'     => $post->post_name,
					'content'  => $post->post_content,
					'status'   => $post->post_status,
					'password' => $post->post_password,
					'date'     => $post->post_date,
					'date_gmt' => $post->post_date_gmt,
				);
			}
		}
		if ( in_array( 'settings', $parts, true ) ) {
			$data['settings']          = Settings::all();
			$data['taxonomy_settings'] = Settings::tax_all();
		}
		return $data;
	}

	/**
	 * Post statuses exported / accepted on import (scheduled members included).
	 *
	 * @return array
	 */
	public static function statuses() {
		return array( 'publish', 'future', 'draft', 'pending', 'private' );
	}

	/**
	 * All terms of our taxonomies.
	 *
	 * @return array
	 */
	protected static function export_terms() {
		$out = array();
		foreach ( Importer::taxonomy_map() as $key => $taxonomy ) {
			if ( ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}
			$terms = get_terms(
				array(
					'taxonomy'   => $taxonomy,
					'hide_empty' => false,
				)
			);
			if ( is_wp_error( $terms ) ) {
				continue;
			}
			foreach ( $terms as $term ) {
				$parent = $term->parent ? get_term( $term->parent, $taxonomy ) : null;
				$out[]  = array(
					'id'          => $term->term_id,
					'key'         => $key,
					'name'        => $term->name,
					'slug'        => $term->slug,
					'description' => $term->description,
					'parent'      => ( $parent && ! is_wp_error( $parent ) ) ? $parent->slug : '',
				);
			}
		}
		return $out;
	}

	/**
	 * Members.
	 *
	 * @return array
	 */
	protected static function export_members() {
		$out   = array();
		$posts = get_posts(
			array(
				'post_type'      => 'bptm_member',
				'post_status'    => self::statuses(),
				'posts_per_page' => -1,
				'orderby'        => 'menu_order',
				'order'          => 'ASC',
			)
		);
		foreach ( $posts as $post ) {
			$item = array(
				'id'         => $post->ID,
				'uid'        => self::uid( $post ),
				'name'       => $post->post_title,
				'slug'       => $post->post_name,
				'content'    => $post->post_content,
				'excerpt'    => $post->post_excerpt,
				'status'     => $post->post_status,
				'password'   => $post->post_password,
				'date'       => $post->post_date,
				'date_gmt'   => $post->post_date_gmt,
				'menu_order' => (int) $post->menu_order,
			);
			foreach ( Importer::meta_map() as $field => $meta_key ) {
				$item[ $field ] = (string) get_post_meta( $post->ID, $meta_key, true );
			}
			$social          = get_post_meta( $post->ID, '_bptm_social', true );
			$skills          = get_post_meta( $post->ID, '_bptm_skills', true );
			$item['social']  = is_array( $social ) ? array_values( $social ) : array();
			$item['skills']  = is_array( $skills ) ? array_values( $skills ) : array();
			$thumb           = get_post_thumbnail_id( $post );
			$item['image']   = $thumb ? (string) wp_get_attachment_url( $thumb ) : '';
			$flip            = (int) get_post_meta( $post->ID, '_bptm_flip_image', true );
			$item['flip_image'] = $flip ? (string) wp_get_attachment_url( $flip ) : '';
			$item['terms']   = array();
			foreach ( Importer::taxonomy_map() as $key => $taxonomy ) {
				if ( ! taxonomy_exists( $taxonomy ) ) {
					continue;
				}
				$terms = wp_get_object_terms( $post->ID, $taxonomy );
				if ( is_wp_error( $terms ) || ! $terms ) {
					continue;
				}
				foreach ( $terms as $term ) {
					$parent                  = $term->parent ? get_term( $term->parent, $taxonomy ) : null;
					$item['terms'][ $key ][] = array(
						'name'   => $term->name,
						'slug'   => $term->slug,
						'parent' => ( $parent && ! is_wp_error( $parent ) ) ? $parent->slug : '',
					);
				}
			}
			$out[] = $item;
		}
		return $out;
	}

	/**
	 * admin-post: download export.
	 */
	public static function handle_export() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'bp-team-member' ), 403 );
		}
		check_admin_referer( 'bptm_export' );
		$parts = isset( $_POST['export'] ) ? array_map( 'sanitize_key', (array) wp_unslash( $_POST['export'] ) ) : array();
		$parts = array_intersect( $parts, array( 'members', 'showcases', 'settings' ) );
		if ( ! $parts ) {
			// Friendly notice on the tool page instead of a wp_die() error screen.
			set_transient(
				'bptm_import_report_' . get_current_user_id(),
				array(
					'error'   => true,
					'message' => __( 'Nothing selected to export. Tick at least one of members, showcases or settings.', 'bp-team-member' ),
				),
				5 * MINUTE_IN_SECONDS
			);
			wp_safe_redirect( self::page_url( array( 'bptm_imported' => 1 ) ) );
			exit;
		}
		$json = wp_json_encode( self::build_export( $parts ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
		nocache_headers();
		header( 'Content-Type: application/json; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=bp-team-member-export-' . gmdate( 'Y-m-d' ) . '.json' );
		echo $json; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON download.
		exit;
	}

	/* ------------------------------------------------------------------
	 * Import
	 * ------------------------------------------------------------------ */

	/**
	 * admin-post: import file.
	 */
	public static function handle_import() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'bp-team-member' ), 403 );
		}
		check_admin_referer( 'bptm_import' );

		$report = array(
			'error'   => true,
			'message' => __( 'Import failed: invalid file.', 'bp-team-member' ),
		);
		$tmp    = isset( $_FILES['import_file']['tmp_name'] ) ? $_FILES['import_file']['tmp_name'] : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		if ( $tmp && is_uploaded_file( $tmp ) && empty( $_FILES['import_file']['error'] ) ) {
			$raw  = file_get_contents( $tmp ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$data = json_decode( (string) $raw, true );
			if ( is_array( $data ) && isset( $data['format'] ) && self::FORMAT === $data['format'] ) {
				$parts  = isset( $_POST['import'] ) ? array_map( 'sanitize_key', (array) wp_unslash( $_POST['import'] ) ) : array();
				$counts = self::import( $data, $parts, ! empty( $_POST['overwrite'] ) );
				$report = array(
					'error'   => false,
					'message' => sprintf(
						/* translators: 1: members created, 2: members updated, 3: members skipped, 4: showcases created, 5: showcases updated, 6: showcases skipped (already exist), 7: showcases not imported (empty/invalid), 8: settings yes/no */
						__( 'Import complete. Members: %1$d created, %2$d updated, %3$d skipped. Showcases: %4$d created, %5$d updated, %6$d skipped (already exist), %7$d not imported (empty or invalid). Settings imported: %8$s.', 'bp-team-member' ),
						$counts['created'],
						$counts['updated'],
						$counts['skipped'],
						$counts['showcases'],
						$counts['showcases_updated'],
						$counts['showcases_skipped'],
						$counts['showcases_invalid'],
						$counts['settings'] ? __( 'yes', 'bp-team-member' ) : __( 'no', 'bp-team-member' )
					),
				);
				if ( $counts['showcases_invalid'] ) {
					$report['warning'] = true;
				}
			}
		}
		set_transient( 'bptm_import_report_' . get_current_user_id(), $report, 5 * MINUTE_IN_SECONDS );
		wp_safe_redirect( self::page_url( array( 'bptm_imported' => 1 ) ) );
		exit;
	}

	/**
	 * Import a decoded payload.
	 *
	 * @param array $data      Payload.
	 * @param array $parts     Parts to import.
	 * @param bool  $overwrite Update members with same slug.
	 * @return array Counts.
	 */
	public static function import( array $data, array $parts, $overwrite = false ) {
		$counts = array(
			'created'   => 0,
			'updated'   => 0,
			'skipped'   => 0,
			'showcases'         => 0,
			'showcases_updated' => 0,
			'showcases_skipped' => 0,
			'showcases_invalid' => 0,
			'settings'          => false,
		);
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 300 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		}

		if ( in_array( 'settings', $parts, true ) ) {
			if ( ! empty( $data['settings'] ) && is_array( $data['settings'] ) ) {
				update_option( Settings::OPTION, Settings::sanitize_settings( $data['settings'] ) );
				$counts['settings'] = true;
			}
			if ( ! empty( $data['taxonomy_settings'] ) && is_array( $data['taxonomy_settings'] ) ) {
				update_option( Settings::TAX_OPTION, Settings::sanitize_taxonomy_settings( $data['taxonomy_settings'] ) );
				$counts['settings'] = true;
			}
		}

		// Terms: old id => new id (used to remap showcase block attributes).
		$term_map = array();
		if ( ! empty( $data['terms'] ) && is_array( $data['terms'] ) && ( in_array( 'members', $parts, true ) || in_array( 'showcases', $parts, true ) ) ) {
			$tax_map = Importer::taxonomy_map();
			// Parents first.
			$terms = $data['terms'];
			usort(
				$terms,
				function ( $a, $b ) {
					return ( empty( $a['parent'] ) ? 0 : 1 ) - ( empty( $b['parent'] ) ? 0 : 1 );
				}
			);
			foreach ( $terms as $term ) {
				if ( ! is_array( $term ) || empty( $term['key'] ) || ! isset( $tax_map[ $term['key'] ] ) ) {
					continue;
				}
				$taxonomy = $tax_map[ $term['key'] ];
				if ( ! taxonomy_exists( $taxonomy ) ) {
					continue;
				}
				$new_id = Importer::ensure_term( $term, $taxonomy );
				if ( $new_id && ! empty( $term['description'] ) ) {
					$existing = get_term( $new_id, $taxonomy );
					if ( $existing && ! is_wp_error( $existing ) && '' === $existing->description ) {
						wp_update_term( $new_id, $taxonomy, array( 'description' => sanitize_textarea_field( $term['description'] ) ) );
					}
				}
				if ( $new_id && isset( $term['id'] ) ) {
					$term_map[ (int) $term['id'] ] = $new_id;
				}
			}
		}

		if ( in_array( 'members', $parts, true ) && ! empty( $data['members'] ) && is_array( $data['members'] ) ) {
			foreach ( $data['members'] as $member ) {
				if ( ! is_array( $member ) ) {
					continue;
				}
				// Match: export uid (also drafts / pending members without a slug), then slug, then title + date.
				$existing = self::find_existing( 'bptm_member', $member, isset( $member['name'] ) && is_scalar( $member['name'] ) ? (string) $member['name'] : '' );
				if ( $existing && ! $overwrite ) {
					++$counts['skipped'];
					continue;
				}
				$id = Importer::save_member( $member, $existing );
				if ( ! is_wp_error( $id ) ) {
					self::remember_uid( (int) $id, $member );
				}
				if ( is_wp_error( $id ) ) {
					++$counts['skipped'];
				} elseif ( $existing ) {
					++$counts['updated'];
				} else {
					++$counts['created'];
				}
			}
		}

		if ( in_array( 'showcases', $parts, true ) && ! empty( $data['showcases'] ) && is_array( $data['showcases'] ) ) {
			foreach ( $data['showcases'] as $showcase ) {
				if ( ! is_array( $showcase ) ) {
					continue;
				}
				$title = isset( $showcase['title'] ) && is_scalar( $showcase['title'] ) ? sanitize_text_field( (string) $showcase['title'] ) : '';
				if ( empty( $showcase['content'] ) || ! is_string( $showcase['content'] ) || '' === trim( $showcase['content'] ) ) {
					++$counts['showcases_invalid'];
					continue;
				}
				// Same showcase already here (by slug, or by title for exports without slugs)?
				$existing = self::find_existing( 'bptm_showcase', $showcase, $title );
				if ( $existing && ! $overwrite ) {
					++$counts['showcases_skipped'];
					continue;
				}
				$content = self::remap_block_terms( (string) $showcase['content'], $term_map );
				$status  = isset( $showcase['status'] ) && in_array( $showcase['status'], self::statuses(), true ) ? $showcase['status'] : 'publish';
				$post    = array(
					'post_type'    => 'bptm_showcase',
					'post_title'   => '' !== $title ? $title : __( 'Imported showcase', 'bp-team-member' ),
					'post_content' => current_user_can( 'unfiltered_html' ) ? $content : wp_kses_post( $content ),
					'post_status'  => $status,
				);
				if ( ! empty( $showcase['slug'] ) && is_string( $showcase['slug'] ) ) {
					$post['post_name'] = sanitize_title( $showcase['slug'] );
				}
				if ( array_key_exists( 'password', $showcase ) && is_scalar( $showcase['password'] ) ) {
					$post['post_password'] = substr( trim( (string) $showcase['password'] ), 0, 255 );
				}
				// Original dates: a scheduled showcase stays scheduled (same rules as members).
				foreach ( array( 'date' => 'post_date', 'date_gmt' => 'post_date_gmt' ) as $field => $column ) {
					if ( ! empty( $showcase[ $field ] ) && is_string( $showcase[ $field ] ) && '0000-00-00 00:00:00' !== $showcase[ $field ] && preg_match( '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $showcase[ $field ] ) ) {
						$post[ $column ] = $showcase[ $field ];
					}
				}
				if ( isset( $post['post_date'] ) || isset( $post['post_date_gmt'] ) ) {
					$post['edit_date'] = true;
				}
				if ( $existing ) {
					$post['ID'] = $existing;
					$id         = wp_update_post( wp_slash( $post ), true );
				} else {
					$id = wp_insert_post( wp_slash( $post ), true );
				}
				if ( ! is_wp_error( $id ) ) {
					self::remember_uid( (int) $id, $showcase );
				}
				if ( is_wp_error( $id ) ) {
					++$counts['showcases_invalid'];
				} elseif ( $existing ) {
					++$counts['showcases_updated'];
				} else {
					++$counts['showcases'];
				}
			}
		}

		return $counts;
	}

	/**
	 * Stable export identifier of a post: the uid it was imported with, else "{site hash}-{post id}".
	 * Stays the same across exports and lets re-imports match posts that have no slug (drafts).
	 *
	 * @param \WP_Post $post Post.
	 * @return string
	 */
	public static function uid( $post ) {
		$stored = (string) get_post_meta( $post->ID, self::UID_META, true );
		return '' !== $stored ? $stored : self::site_hash() . '-' . (int) $post->ID;
	}

	/**
	 * Short hash of this site's home URL (uid prefix).
	 *
	 * @return string
	 */
	protected static function site_hash() {
		return substr( md5( untrailingslashit( home_url() ) ), 0, 12 );
	}

	/**
	 * Sanitized uid of an imported item ('' when missing / malformed).
	 *
	 * @param array $item Item.
	 * @return string
	 */
	protected static function item_uid( array $item ) {
		$uid = isset( $item['uid'] ) && is_string( $item['uid'] ) ? strtolower( trim( $item['uid'] ) ) : '';
		return preg_match( '/^[a-z0-9-]{3,80}$/', $uid ) ? $uid : '';
	}

	/**
	 * Store the source uid on an imported post so the next re-import matches it.
	 *
	 * @param int   $post_id Post id.
	 * @param array $item    Imported item.
	 */
	protected static function remember_uid( $post_id, array $item ) {
		$uid = self::item_uid( $item );
		if ( '' === $uid || ! $post_id ) {
			return;
		}
		if ( self::site_hash() . '-' . $post_id === $uid ) {
			return; // Exported from this very post: the implicit uid already matches.
		}
		update_post_meta( $post_id, self::UID_META, $uid );
	}

	/**
	 * Existing post matching an imported item: by export uid, then slug, then exact title (+ date
	 * when the file has one). Drafts / pending posts have no slug, so the uid is what matches them.
	 *
	 * @param string $post_type Post type.
	 * @param array  $item      Imported item.
	 * @param string $title     Title / name.
	 * @return int Post id or 0.
	 */
	protected static function find_existing( $post_type, array $item, $title ) {
		$args = array(
			'post_type'        => $post_type,
			'post_status'      => self::statuses(),
			'posts_per_page'   => 1,
			'fields'           => 'ids',
			'orderby'          => 'ID',
			'order'            => 'ASC',
			'suppress_filters' => true,
		);
		$uid  = self::item_uid( $item );
		if ( '' !== $uid ) {
			$prefix = self::site_hash() . '-';
			if ( 0 === strpos( $uid, $prefix ) ) {
				$id   = (int) substr( $uid, strlen( $prefix ) );
				$post = $id ? get_post( $id ) : null;
				if ( $post && $post_type === $post->post_type && in_array( $post->post_status, self::statuses(), true ) && '' === (string) get_post_meta( $id, self::UID_META, true ) ) {
					return $id;
				}
			}
			$found = get_posts(
				$args + array(
					'meta_key'   => self::UID_META, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
					'meta_value' => $uid, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				)
			);
			if ( $found ) {
				return (int) $found[0];
			}
		}
		$slug = isset( $item['slug'] ) && is_string( $item['slug'] ) ? sanitize_title( $item['slug'] ) : '';
		if ( '' !== $slug ) {
			$found = get_posts( $args + array( 'name' => $slug ) );
			return $found ? (int) $found[0] : 0;
		}
		$title = sanitize_text_field( (string) $title );
		if ( '' === $title ) {
			return 0;
		}
		$date = isset( $item['date'] ) && is_string( $item['date'] ) && preg_match( '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $item['date'] ) ? $item['date'] : '';
		$list = get_posts( array_merge( $args, array( 'fields' => 'all', 'posts_per_page' => 50, 'title' => $title ) ) );
		foreach ( $list as $candidate ) {
			if ( '' === $date || $candidate->post_date === $date ) {
				return (int) $candidate->ID;
			}
		}
		return 0;
	}

	/**
	 * Remap include/exclude term id attributes of our block.
	 *
	 * @param string $content  Block content.
	 * @param array  $term_map Old => new term ids.
	 * @return string
	 */
	public static function remap_block_terms( $content, array $term_map ) {
		if ( ! $term_map || ! function_exists( 'parse_blocks' ) ) {
			return $content;
		}
		$blocks = parse_blocks( $content );
		$blocks = self::remap_blocks( $blocks, $term_map );
		return serialize_blocks( $blocks );
	}

	/**
	 * Recursive helper.
	 *
	 * @param array $blocks   Blocks.
	 * @param array $term_map Map.
	 * @return array
	 */
	protected static function remap_blocks( array $blocks, array $term_map ) {
		foreach ( $blocks as &$block ) {
			if ( 'icb/fold-out-reveal' === $block['blockName'] && ! empty( $block['attrs'] ) ) {
				foreach ( $block['attrs'] as $attr => $value ) {
					if ( is_array( $value ) && preg_match( '/^(include|exclude)[A-Z]/', $attr ) ) {
						$block['attrs'][ $attr ] = array_map(
							function ( $v ) use ( $term_map ) {
								return ( is_numeric( $v ) && isset( $term_map[ (int) $v ] ) ) ? $term_map[ (int) $v ] : $v;
							},
							$value
						);
					}
				}
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$block['innerBlocks'] = self::remap_blocks( $block['innerBlocks'], $term_map );
			}
		}
		unset( $block );
		return $blocks;
	}
}

Import_Export::init();
