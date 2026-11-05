<?php
/**
 * CSV bulk importer for team members + shared member write helpers
 * (also used by Import_Export and Demo_Data).
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Bulk importer.
 */
class Importer {

	const CAPABILITY = 'manage_options';
	const NONCE      = 'bptm_bulk_import';
	const BATCH      = 5;

	/**
	 * Hooks.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ), 21 );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_action( 'admin_post_bptm_sample_csv', array( __CLASS__, 'download_sample' ) );
		add_action( 'wp_ajax_bptm_csv_upload', array( __CLASS__, 'ajax_upload' ) );
		add_action( 'wp_ajax_bptm_csv_import', array( __CLASS__, 'ajax_import' ) );
	}

	/* ------------------------------------------------------------------
	 * Shared helpers
	 * ------------------------------------------------------------------ */

	/**
	 * Scalar member fields => meta key.
	 *
	 * @return array
	 */
	public static function meta_map() {
		return array(
			'designation'     => '_bptm_designation',
			'company'         => '_bptm_company',
			'company_website' => '_bptm_company_website',
			'land_phone'      => '_bptm_land_phone',
			'cell_phone'      => '_bptm_cell_phone',
			'email'           => '_bptm_email',
			'email_cc'        => '_bptm_email_cc',
			'email_bcc'       => '_bptm_email_bcc',
			'address'         => '_bptm_address',
			'ribbon'          => '_bptm_ribbon',
			'zip_code'        => '_bptm_zip_code',
			'vcard'           => '_bptm_vcard',
			'custom_page'     => '_bptm_custom_page',
			'featured'        => '_bptm_featured',
		);
	}

	/**
	 * Taxonomy key => taxonomy name (enabled or not).
	 *
	 * @return array
	 */
	public static function taxonomy_map() {
		$out = array();
		foreach ( array_keys( Settings::taxonomy_labels() ) as $key ) {
			$out[ $key ] = 'bptm_' . $key;
		}
		return $out;
	}

	/**
	 * Sanitize a scalar member field.
	 *
	 * @param string $field Field key.
	 * @param mixed  $value Raw value.
	 * @return string
	 */
	public static function sanitize_field( $field, $value ) {
		$value = is_scalar( $value ) ? trim( (string) $value ) : '';
		switch ( $field ) {
			case 'company_website':
			case 'vcard':
			case 'custom_page':
				return esc_url_raw( $value );
			case 'email':
				return sanitize_email( $value );
			case 'featured':
				return Settings::to_bool( $value ) ? '1' : '';
		}
		return sanitize_text_field( $value );
	}

	/**
	 * Sanitize social rows.
	 *
	 * @param mixed $rows Rows.
	 * @return array
	 */
	public static function sanitize_social( $rows ) {
		$out = array();
		foreach ( (array) $rows as $row ) {
			if ( ! is_array( $row ) || empty( $row['icon'] ) || empty( $row['link'] ) ) {
				continue;
			}
			$icon = implode( ' ', array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', (string) $row['icon'] ) ) ) );
			$link = trim( (string) $row['link'] );
			if ( is_email( $link ) ) {
				$link = 'mailto:' . $link;
			}
			$link = esc_url_raw( $link, array( 'http', 'https', 'mailto', 'tel', 'skype', 'callto', 'sms', 'whatsapp' ) );
			if ( $icon && $link ) {
				$out[] = array(
					'icon' => $icon,
					'link' => $link,
				);
			}
		}
		return $out;
	}

	/**
	 * Sanitize skill rows.
	 *
	 * @param mixed $rows Rows.
	 * @return array
	 */
	public static function sanitize_skills( $rows ) {
		$out = array();
		foreach ( (array) $rows as $row ) {
			if ( ! is_array( $row ) || ! isset( $row['skill'] ) || '' === trim( (string) $row['skill'] ) ) {
				continue;
			}
			$out[] = array(
				'skill'   => sanitize_text_field( (string) $row['skill'] ),
				'percent' => max( 0, min( 100, (int) ( isset( $row['percent'] ) ? $row['percent'] : 0 ) ) ),
			);
		}
		return $out;
	}

	/**
	 * Create or update a member from a normalized data array.
	 *
	 * Keys: name, content, excerpt, status, menu_order, slug, (meta_map fields), social, skills,
	 * image (attachment id or URL), flip_image (id or URL), terms => [ key => [ names or ['name','slug','parent'] ] ].
	 *
	 * @param array $data    Data.
	 * @param int   $post_id Existing post to update (0 = create).
	 * @return int|\WP_Error Post ID.
	 */
	public static function save_member( array $data, $post_id = 0 ) {
		$name = isset( $data['name'] ) ? sanitize_text_field( (string) $data['name'] ) : '';
		if ( '' === $name ) {
			return new \WP_Error( 'bptm_no_name', __( 'Member name is required.', 'bp-team-member' ) );
		}

		$status = isset( $data['status'] ) ? sanitize_key( $data['status'] ) : 'publish';
		if ( ! in_array( $status, array( 'publish', 'draft', 'pending', 'private' ), true ) ) {
			$status = 'publish';
		}

		$post = array(
			'post_type'    => 'bptm_member',
			'post_title'   => $name,
			'post_content' => isset( $data['content'] ) ? wp_kses_post( (string) $data['content'] ) : '',
			'post_excerpt' => isset( $data['excerpt'] ) ? sanitize_textarea_field( (string) $data['excerpt'] ) : '',
			'post_status'  => $status,
			'menu_order'   => isset( $data['menu_order'] ) ? (int) $data['menu_order'] : 0,
		);
		if ( ! empty( $data['slug'] ) ) {
			$post['post_name'] = sanitize_title( $data['slug'] );
		}

		if ( $post_id ) {
			$post['ID'] = (int) $post_id;
			$result     = wp_update_post( wp_slash( $post ), true );
		} else {
			$result = wp_insert_post( wp_slash( $post ), true );
		}
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$post_id = (int) $result;

		foreach ( self::meta_map() as $field => $meta_key ) {
			if ( array_key_exists( $field, $data ) ) {
				$value = self::sanitize_field( $field, $data[ $field ] );
				if ( '' === $value ) {
					delete_post_meta( $post_id, $meta_key );
				} else {
					update_post_meta( $post_id, $meta_key, wp_slash( $value ) );
				}
			}
		}
		if ( array_key_exists( 'social', $data ) ) {
			update_post_meta( $post_id, '_bptm_social', wp_slash( self::sanitize_social( $data['social'] ) ) );
		}
		if ( array_key_exists( 'skills', $data ) ) {
			update_post_meta( $post_id, '_bptm_skills', wp_slash( self::sanitize_skills( $data['skills'] ) ) );
		}

		if ( ! empty( $data['image'] ) ) {
			$image_id = self::resolve_image( $data['image'], $post_id, $name );
			if ( $image_id ) {
				set_post_thumbnail( $post_id, $image_id );
			}
		}
		if ( ! empty( $data['flip_image'] ) ) {
			$flip_id = self::resolve_image( $data['flip_image'], $post_id, $name );
			if ( $flip_id ) {
				update_post_meta( $post_id, '_bptm_flip_image', $flip_id );
			}
		}

		if ( ! empty( $data['terms'] ) && is_array( $data['terms'] ) ) {
			self::assign_terms( $post_id, $data['terms'] );
		}

		return $post_id;
	}

	/**
	 * Assign terms (creating missing ones).
	 *
	 * @param int   $post_id Post.
	 * @param array $terms   key => list of names, "Parent > Child" paths or ['name','slug','parent' (slug)].
	 * @param array $created Filled with created term ids (taxonomy => ids).
	 * @return array Created term ids by taxonomy.
	 */
	public static function assign_terms( $post_id, array $terms, array &$created = array() ) {
		$map = self::taxonomy_map();
		foreach ( $terms as $key => $list ) {
			$taxonomy = isset( $map[ $key ] ) ? $map[ $key ] : ( in_array( $key, $map, true ) ? $key : '' );
			if ( ! $taxonomy || ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}
			$ids = array();
			foreach ( (array) $list as $term ) {
				$id = self::ensure_term( $term, $taxonomy, $created );
				if ( $id ) {
					$ids[] = $id;
				}
			}
			if ( $ids ) {
				wp_set_object_terms( $post_id, array_values( array_unique( $ids ) ), $taxonomy, false );
			}
		}
		return $created;
	}

	/**
	 * Find or create a term.
	 *
	 * @param mixed  $term     Name, path "A > B" or array.
	 * @param string $taxonomy Taxonomy.
	 * @param array  $created  Created ids collector.
	 * @return int Term id or 0.
	 */
	public static function ensure_term( $term, $taxonomy, array &$created = array() ) {
		$parent_id = 0;
		$slug      = '';
		if ( is_array( $term ) ) {
			$name = isset( $term['name'] ) ? (string) $term['name'] : '';
			$slug = isset( $term['slug'] ) ? sanitize_title( $term['slug'] ) : '';
			if ( ! empty( $term['parent'] ) && is_taxonomy_hierarchical( $taxonomy ) ) {
				$parent    = get_term_by( 'slug', sanitize_title( $term['parent'] ), $taxonomy );
				$parent_id = $parent ? (int) $parent->term_id : 0;
			}
		} else {
			$parts = array_values( array_filter( array_map( 'trim', explode( '>', (string) $term ) ), 'strlen' ) );
			if ( ! $parts ) {
				return 0;
			}
			$name = array_pop( $parts );
			if ( $parts && is_taxonomy_hierarchical( $taxonomy ) ) {
				foreach ( $parts as $ancestor ) {
					$parent_id = self::find_or_insert( sanitize_text_field( $ancestor ), '', $taxonomy, $parent_id, $created );
				}
			}
		}
		$name = sanitize_text_field( $name );
		if ( '' === $name ) {
			return 0;
		}
		return self::find_or_insert( $name, $slug, $taxonomy, $parent_id, $created );
	}

	/**
	 * Low level find/insert.
	 *
	 * @param string $name      Name.
	 * @param string $slug      Slug.
	 * @param string $taxonomy  Taxonomy.
	 * @param int    $parent_id Parent.
	 * @param array  $created   Collector.
	 * @return int
	 */
	protected static function find_or_insert( $name, $slug, $taxonomy, $parent_id, array &$created ) {
		$existing = $slug ? get_term_by( 'slug', $slug, $taxonomy ) : false;
		if ( ! $existing ) {
			// Exact parent match first (top level for plain names), then any parent for plain names.
			$found = term_exists( $name, $taxonomy, (int) $parent_id );
			if ( ! $found && ! $parent_id ) {
				$found = term_exists( $name, $taxonomy );
			}
			if ( $found ) {
				return (int) ( is_array( $found ) ? $found['term_id'] : $found );
			}
		} else {
			return (int) $existing->term_id;
		}
		$args = array( 'parent' => (int) $parent_id );
		if ( $slug ) {
			$args['slug'] = $slug;
		}
		$res = wp_insert_term( $name, $taxonomy, $args );
		if ( is_wp_error( $res ) ) {
			$id = $res->get_error_data( 'term_exists' );
			return $id ? (int) $id : 0;
		}
		$created[ $taxonomy ][] = (int) $res['term_id'];
		return (int) $res['term_id'];
	}

	/**
	 * Resolve an image reference to an attachment id (sideloading remote URLs).
	 *
	 * @param mixed  $ref     Attachment id or URL.
	 * @param int    $post_id Parent post.
	 * @param string $desc    Description / alt.
	 * @return int
	 */
	public static function resolve_image( $ref, $post_id = 0, $desc = '' ) {
		if ( is_numeric( $ref ) ) {
			$id = (int) $ref;
			return ( $id && wp_attachment_is_image( $id ) ) ? $id : 0;
		}
		$url = esc_url_raw( trim( (string) $ref ) );
		if ( ! $url || ! preg_match( '#^https?://#i', $url ) ) {
			return 0;
		}
		$local = attachment_url_to_postid( $url );
		if ( $local ) {
			return (int) $local;
		}
		// Re-use a previous sideload of the same URL.
		$previous = get_posts(
			array(
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_key'       => '_bptm_source_url', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value'     => $url, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			)
		);
		if ( $previous ) {
			return (int) $previous[0];
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		$id = media_sideload_image( $url, $post_id, $desc, 'id' );
		if ( is_wp_error( $id ) ) {
			return 0;
		}
		update_post_meta( $id, '_bptm_source_url', $url );
		if ( $desc ) {
			update_post_meta( $id, '_wp_attachment_image_alt', sanitize_text_field( $desc ) );
		}
		return (int) $id;
	}

	/* ------------------------------------------------------------------
	 * CSV
	 * ------------------------------------------------------------------ */

	/**
	 * CSV columns in sample order => description.
	 *
	 * @return array
	 */
	public static function columns() {
		$cols = array(
			'name'            => __( 'Member name (required)', 'bp-team-member' ),
			'description'     => __( 'Biography, HTML allowed', 'bp-team-member' ),
			'excerpt'         => __( 'Short description', 'bp-team-member' ),
			'designation'     => '',
			'company'         => '',
			'company_website' => '',
			'land_phone'      => '',
			'cell_phone'      => '',
			'email'           => '',
			'email_cc'        => '',
			'email_bcc'       => '',
			'address'         => '',
			'ribbon'          => '',
			'zip_code'        => '',
			'vcard'           => __( 'URL', 'bp-team-member' ),
			'custom_page'     => __( 'URL', 'bp-team-member' ),
			'featured'        => __( '1 / yes', 'bp-team-member' ),
			'image'           => __( 'Image URL or attachment ID', 'bp-team-member' ),
			'flip_image'      => __( 'Image URL or attachment ID', 'bp-team-member' ),
			'menu_order'      => __( 'Number', 'bp-team-member' ),
			'status'          => __( 'publish / draft / pending / private', 'bp-team-member' ),
			'socials'         => __( 'icon|link pairs separated by ";" e.g. fab fa-linkedin-in|https://linkedin.com/in/x', 'bp-team-member' ),
			'skills'          => __( 'skill|percent pairs separated by ";" e.g. PHP|90;Design|70', 'bp-team-member' ),
		);
		foreach ( array_keys( Settings::taxonomy_labels() ) as $key ) {
			$cols[ $key ] = __( 'Comma separated terms; "Parent > Child" for groups', 'bp-team-member' );
		}
		return $cols;
	}

	/**
	 * Header aliases => canonical column.
	 *
	 * @return array
	 */
	protected static function aliases() {
		return array(
			'title'            => 'name',
			'full_name'        => 'name',
			'content'          => 'description',
			'bio'              => 'description',
			'cc'               => 'email_cc',
			'bcc'              => 'email_bcc',
			'custom_page_link' => 'custom_page',
			'social'           => 'socials',
			'skill'            => 'skills',
			'languages'        => 'language',
			'locations'        => 'location',
			'groups'           => 'group',
			'tags'             => 'tag',
			'genders'          => 'gender',
			'specialties'      => 'specialty',
			'role'             => 'designation',
			'job_title'        => 'designation',
			'phone'            => 'cell_phone',
			'zip'              => 'zip_code',
			'thumbnail'        => 'image',
			'photo'            => 'image',
			'image_url'        => 'image',
			'order'            => 'menu_order',
		);
	}

	/**
	 * Normalize a header cell.
	 *
	 * @param string $header Header.
	 * @return string
	 */
	public static function clean_header( $header ) {
		$header = preg_replace( '/^\xEF\xBB\xBF/', '', (string) $header );
		$header = strtolower( trim( $header ) );
		$header = preg_replace( '/[\s\-]+/', '_', $header );
		$header = preg_replace( '/[^a-z0-9_]/', '', $header );
		$aliases = self::aliases();
		return isset( $aliases[ $header ] ) ? $aliases[ $header ] : $header;
	}

	/**
	 * Parse a CSV file into associative rows.
	 *
	 * @param string $path File path.
	 * @return array|\WP_Error
	 */
	public static function parse_csv( $path ) {
		$handle = fopen( $path, 'r' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
		if ( ! $handle ) {
			return new \WP_Error( 'bptm_csv', __( 'Could not read the file.', 'bp-team-member' ) );
		}
		$first = fgets( $handle );
		if ( false === $first ) {
			fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
			return new \WP_Error( 'bptm_csv', __( 'The file is empty.', 'bp-team-member' ) );
		}
		// Detect delimiter.
		$delimiter = ',';
		$best      = 0;
		foreach ( array( ',', ';', "\t" ) as $d ) {
			$c = substr_count( $first, $d );
			if ( $c > $best ) {
				$best      = $c;
				$delimiter = $d;
			}
		}
		rewind( $handle );
		$header = fgetcsv( $handle, 0, $delimiter, '"', '\\' );
		$header = array_map( array( __CLASS__, 'clean_header' ), (array) $header );
		if ( ! in_array( 'name', $header, true ) ) {
			fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
			return new \WP_Error( 'bptm_csv', __( 'The CSV must have a "name" column header. Download the sample file for the expected format.', 'bp-team-member' ) );
		}
		$known = self::columns();
		$rows  = array();
		while ( ( $cells = fgetcsv( $handle, 0, $delimiter, '"', '\\' ) ) !== false ) { // phpcs:ignore WordPress.CodeAnalysis.AssignmentInCondition.FoundInWhileCondition
			if ( array( null ) === $cells || ! array_filter( array_map( 'trim', array_map( 'strval', $cells ) ), 'strlen' ) ) {
				continue;
			}
			$row = array();
			foreach ( $header as $i => $col ) {
				if ( '' === $col || ! isset( $known[ $col ] ) ) {
					continue;
				}
				$val         = isset( $cells[ $i ] ) ? (string) $cells[ $i ] : '';
				$row[ $col ] = function_exists( 'mb_check_encoding' ) && ! mb_check_encoding( $val, 'UTF-8' ) ? mb_convert_encoding( $val, 'UTF-8', 'ISO-8859-1' ) : trim( $val );
			}
			$rows[] = $row;
			if ( count( $rows ) >= 5000 ) {
				break;
			}
		}
		fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
		if ( ! $rows ) {
			return new \WP_Error( 'bptm_csv', __( 'No data rows found.', 'bp-team-member' ) );
		}
		return $rows;
	}

	/**
	 * Split a pair list "a|b;c|d" (also accepts commas when no ";" is used).
	 *
	 * @param string $value Cell.
	 * @param array  $keys  Pair keys.
	 * @return array
	 */
	public static function parse_pairs( $value, array $keys ) {
		$value = trim( (string) $value );
		if ( '' === $value ) {
			return array();
		}
		$items = false !== strpos( $value, ';' ) ? explode( ';', $value ) : preg_split( '/,(?=[^,|]*\|)/', $value );
		$out   = array();
		foreach ( $items as $item ) {
			$parts = array_map( 'trim', explode( '|', $item, 2 ) );
			if ( 2 === count( $parts ) && '' !== $parts[0] ) {
				$out[] = array_combine( $keys, $parts );
			}
		}
		return $out;
	}

	/**
	 * CSV row => save_member() data.
	 *
	 * @param array $row Row.
	 * @return array
	 */
	public static function row_to_data( array $row ) {
		$data = array(
			'name' => isset( $row['name'] ) ? $row['name'] : '',
		);
		// Only touch content / excerpt when the column exists (keeps existing text on updates).
		if ( isset( $row['description'] ) ) {
			$data['content'] = $row['description'];
		}
		if ( isset( $row['excerpt'] ) ) {
			$data['excerpt'] = $row['excerpt'];
		}
		foreach ( array_keys( self::meta_map() ) as $field ) {
			if ( isset( $row[ $field ] ) ) {
				$data[ $field ] = $row[ $field ];
			}
		}
		foreach ( array( 'image', 'flip_image', 'status', 'menu_order' ) as $field ) {
			if ( isset( $row[ $field ] ) && '' !== $row[ $field ] ) {
				$data[ $field ] = $row[ $field ];
			}
		}
		if ( isset( $row['socials'] ) ) {
			$data['social'] = self::parse_pairs( $row['socials'], array( 'icon', 'link' ) );
		}
		if ( isset( $row['skills'] ) ) {
			$data['skills'] = self::parse_pairs( $row['skills'], array( 'skill', 'percent' ) );
		}
		$data['terms'] = array();
		foreach ( array_keys( Settings::taxonomy_labels() ) as $key ) {
			if ( ! empty( $row[ $key ] ) ) {
				$data['terms'][ $key ] = array_filter( array_map( 'trim', explode( ',', $row[ $key ] ) ), 'strlen' );
			}
		}
		return $data;
	}

	/* ------------------------------------------------------------------
	 * Admin page + handlers
	 * ------------------------------------------------------------------ */

	/**
	 * Menu.
	 */
	public static function admin_menu() {
		add_submenu_page( Settings::PARENT_SLUG, __( 'Bulk Import', 'bp-team-member' ), __( 'Bulk Import', 'bp-team-member' ), self::CAPABILITY, 'bptm-bulk-import', array( __CLASS__, 'render_page' ) );
	}

	/**
	 * Tools JS/CSS on tool pages.
	 */
	public static function assets() {
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! in_array( $page, array( 'bptm-bulk-import', 'bptm-import-export', 'bptm-demo-data' ), true ) ) {
			return;
		}
		$ver = defined( 'BPTM_VERSION' ) ? BPTM_VERSION : '1.0.0';
		wp_enqueue_style( 'bptm-admin-tools', BPTM_URL . 'assets/admin/tools.css', array(), $ver );
		wp_enqueue_script( 'bptm-admin-tools', BPTM_URL . 'assets/admin/tools.js', array( 'jquery' ), $ver, true );
		wp_localize_script(
			'bptm-admin-tools',
			'bptmTools',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( self::NONCE ),
				'i18n'    => array(
					'uploading' => __( 'Reading file…', 'bp-team-member' ),
					'importing' => __( 'Importing %1$d of %2$d…', 'bp-team-member' ),
					'done'      => __( 'Import finished: %1$d created, %2$d updated, %3$d skipped, %4$d failed.', 'bp-team-member' ),
					'error'     => __( 'Something went wrong.', 'bp-team-member' ),
					'choose'    => __( 'Please choose a CSV file.', 'bp-team-member' ),
					'confirm'   => __( 'Are you sure?', 'bp-team-member' ),
					'copied'    => __( 'Copied!', 'bp-team-member' ),
				),
			)
		);
	}

	/**
	 * Page.
	 */
	public static function render_page() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return;
		}
		$sample = wp_nonce_url( admin_url( 'admin-post.php?action=bptm_sample_csv' ), 'bptm_sample_csv' );
		echo '<div class="wrap bptm-admin bptm-importer">';
		Settings::page_header( 'bptm-bulk-import', __( 'Bulk Import Members (CSV)', 'bp-team-member' ) );
		?>
		<div class="bptm-card">
			<h2><?php esc_html_e( '1. Upload CSV', 'bp-team-member' ); ?></h2>
			<p><?php esc_html_e( 'Import many team members at once. The first row must contain column headers; columns may be in any order and unknown columns are ignored.', 'bp-team-member' ); ?>
				<a class="button button-secondary" href="<?php echo esc_url( $sample ); ?>"><?php esc_html_e( 'Download sample CSV', 'bp-team-member' ); ?></a></p>
			<form id="bptm-csv-form" enctype="multipart/form-data">
				<p><input type="file" name="file" id="bptm-csv-file" accept=".csv,text/csv" /></p>
				<p><label><input type="checkbox" name="update_existing" value="1" /> <?php esc_html_e( 'Update existing members with the same name instead of creating duplicates', 'bp-team-member' ); ?></label></p>
				<p><button type="submit" class="button button-primary"><?php esc_html_e( 'Upload & Preview', 'bp-team-member' ); ?></button> <span class="bptm-status" aria-live="polite"></span></p>
			</form>
		</div>
		<div class="bptm-card" id="bptm-csv-preview" hidden>
			<h2><?php esc_html_e( '2. Preview & Import', 'bp-team-member' ); ?></h2>
			<div class="bptm-preview-table"></div>
			<p><button type="button" class="button button-primary" id="bptm-csv-start"><?php esc_html_e( 'Import members', 'bp-team-member' ); ?></button></p>
			<div class="bptm-progress" hidden><div class="bptm-progress-bar"></div></div>
			<p class="bptm-import-status" aria-live="polite"></p>
			<ul class="bptm-import-log"></ul>
		</div>
		<div class="bptm-card">
			<h2><?php esc_html_e( 'Columns', 'bp-team-member' ); ?></h2>
			<table class="widefat striped bptm-columns-table"><tbody>
			<?php foreach ( self::columns() as $col => $desc ) : ?>
				<tr><td><code><?php echo esc_html( $col ); ?></code></td><td><?php echo esc_html( $desc ); ?></td></tr>
			<?php endforeach; ?>
			</tbody></table>
		</div>
		<?php
		echo '</div>';
	}

	/**
	 * Stream sample CSV.
	 */
	public static function download_sample() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'bp-team-member' ), 403 );
		}
		check_admin_referer( 'bptm_sample_csv' );
		$cols = array_keys( self::columns() );
		$rows = array(
			array(
				'name'            => 'Jane Cooper',
				'description'     => '<p>Jane leads our product design team and loves turning complex problems into simple interfaces.</p>',
				'excerpt'         => 'Product design lead.',
				'designation'     => 'Head of Design',
				'company'         => 'Acme Studio',
				'company_website' => 'https://example.com',
				'land_phone'      => '+1 555 0100',
				'cell_phone'      => '+1 555 0101',
				'email'           => 'jane@example.com',
				'address'         => '12 Market Street, Springfield',
				'ribbon'          => 'Lead',
				'zip_code'        => '10001',
				'vcard'           => '',
				'featured'        => '1',
				'image'           => '',
				'menu_order'      => '1',
				'status'          => 'publish',
				'socials'         => 'fab fa-linkedin-in|https://www.linkedin.com/;fab fa-x-twitter|https://x.com/;fas fa-envelope|jane@example.com',
				'skills'          => 'UI Design|95;Research|80;Prototyping|85',
				'group'           => 'Management > Design',
				'tag'             => 'Leadership, Creative',
				'language'        => 'English, Spanish',
				'location'        => 'New York',
				'gender'          => 'Female',
				'specialty'       => 'UX',
			),
			array(
				'name'        => 'Robert Fox',
				'description' => 'Backend engineer focused on APIs and performance.',
				'designation' => 'Senior Developer',
				'company'     => 'Acme Studio',
				'email'       => 'robert@example.com',
				'cell_phone'  => '+1 555 0199',
				'socials'     => 'fab fa-github|https://github.com/;fab fa-linkedin-in|https://www.linkedin.com/',
				'skills'      => 'PHP|90;JavaScript|80',
				'group'       => 'Engineering',
				'tag'         => 'Backend',
				'language'    => 'English',
				'location'    => 'London',
				'gender'      => 'Male',
				'specialty'   => 'Development',
			),
		);
		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=bp-team-member-sample.csv' );
		$out = fopen( 'php://output', 'w' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
		fputcsv( $out, $cols, ',', '"', '\\' );
		foreach ( $rows as $row ) {
			$line = array();
			foreach ( $cols as $col ) {
				$line[] = isset( $row[ $col ] ) ? $row[ $col ] : '';
			}
			fputcsv( $out, $line, ',', '"', '\\' );
		}
		fclose( $out ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
		exit;
	}

	/**
	 * Transient key for the current user.
	 *
	 * @return string
	 */
	protected static function transient_key() {
		return 'bptm_csv_rows_' . get_current_user_id();
	}

	/**
	 * AJAX: upload + parse.
	 */
	public static function ajax_upload() {
		check_ajax_referer( self::NONCE, 'nonce' );
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'bp-team-member' ) ), 403 );
		}
		if ( empty( $_FILES['file']['tmp_name'] ) || ! empty( $_FILES['file']['error'] ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotValidated
			wp_send_json_error( array( 'message' => __( 'Upload failed.', 'bp-team-member' ) ), 400 );
		}
		$name = isset( $_FILES['file']['name'] ) ? sanitize_file_name( wp_unslash( $_FILES['file']['name'] ) ) : '';
		if ( 'csv' !== strtolower( pathinfo( $name, PATHINFO_EXTENSION ) ) ) {
			wp_send_json_error( array( 'message' => __( 'Please upload a .csv file.', 'bp-team-member' ) ), 400 );
		}
		$tmp = $_FILES['file']['tmp_name']; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		if ( ! is_uploaded_file( $tmp ) ) {
			wp_send_json_error( array( 'message' => __( 'Upload failed.', 'bp-team-member' ) ), 400 );
		}
		$rows = self::parse_csv( $tmp );
		if ( is_wp_error( $rows ) ) {
			wp_send_json_error( array( 'message' => $rows->get_error_message() ), 400 );
		}
		set_transient(
			self::transient_key(),
			array(
				'rows'   => $rows,
				'update' => ! empty( $_POST['update_existing'] ),
			),
			DAY_IN_SECONDS
		);
		$preview = array();
		foreach ( array_slice( $rows, 0, 200 ) as $row ) {
			$preview[] = array(
				'name'        => isset( $row['name'] ) ? sanitize_text_field( $row['name'] ) : '',
				'designation' => isset( $row['designation'] ) ? sanitize_text_field( $row['designation'] ) : '',
				'email'       => isset( $row['email'] ) ? sanitize_email( $row['email'] ) : '',
				'group'       => isset( $row['group'] ) ? sanitize_text_field( $row['group'] ) : '',
			);
		}
		wp_send_json_success(
			array(
				'total'   => count( $rows ),
				'preview' => $preview,
				'batch'   => self::BATCH,
			)
		);
	}

	/**
	 * AJAX: import a batch.
	 */
	public static function ajax_import() {
		check_ajax_referer( self::NONCE, 'nonce' );
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied.', 'bp-team-member' ) ), 403 );
		}
		$stored = get_transient( self::transient_key() );
		if ( empty( $stored['rows'] ) ) {
			wp_send_json_error( array( 'message' => __( 'Upload the file again, the import session expired.', 'bp-team-member' ) ), 400 );
		}
		$offset = isset( $_POST['offset'] ) ? max( 0, (int) $_POST['offset'] ) : 0;
		$rows   = array_slice( $stored['rows'], $offset, self::BATCH );
		$result = array(
			'created' => 0,
			'updated' => 0,
			'skipped' => 0,
			'failed'  => 0,
			'log'     => array(),
		);
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 120 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		}
		foreach ( $rows as $i => $row ) {
			$data = self::row_to_data( $row );
			$line = $offset + $i + 2;
			if ( '' === trim( (string) $data['name'] ) ) {
				++$result['skipped'];
				/* translators: %d: CSV line number */
				$result['log'][] = sprintf( __( 'Line %d: skipped (no name).', 'bp-team-member' ), $line );
				continue;
			}
			$existing = 0;
			if ( ! empty( $stored['update'] ) ) {
				$found    = get_posts(
					array(
						'post_type'      => 'bptm_member',
						'post_status'    => 'any',
						'title'          => sanitize_text_field( $data['name'] ),
						'posts_per_page' => 1,
						'fields'         => 'ids',
					)
				);
				$existing = $found ? (int) $found[0] : 0;
			}
			$id = self::save_member( $data, $existing );
			if ( is_wp_error( $id ) ) {
				++$result['failed'];
				$result['log'][] = sprintf( '%s %d: %s', __( 'Line', 'bp-team-member' ), $line, $id->get_error_message() );
			} elseif ( $existing ) {
				++$result['updated'];
			} else {
				++$result['created'];
			}
		}
		$next             = $offset + count( $rows );
		$result['next']   = $next;
		$result['total']  = count( $stored['rows'] );
		$result['finish'] = $next >= $result['total'];
		if ( $result['finish'] ) {
			delete_transient( self::transient_key() );
		}
		wp_send_json_success( $result );
	}
}

Importer::init();
