<?php
/**
 * Demo data: import / delete demo members, terms, avatars and showcases.
 * Everything created is flagged with `_bptm_demo` meta so delete only removes demo content.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Demo data tool.
 */
class Demo_Data {

	const CAPABILITY = 'manage_options';
	const FLAG       = '_bptm_demo';
	const GENERATED  = '_bptm_demo_generated';

	/**
	 * Hooks.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ), 23 );
		add_action( 'admin_post_bptm_demo_import', array( __CLASS__, 'handle_import' ) );
		add_action( 'admin_post_bptm_demo_delete', array( __CLASS__, 'handle_delete' ) );
	}

	/**
	 * Menu.
	 */
	public static function admin_menu() {
		add_submenu_page( Settings::PARENT_SLUG, __( 'Demo Data', 'bp-team-member' ), __( 'Demo Data', 'bp-team-member' ), self::CAPABILITY, 'bptm-demo-data', array( __CLASS__, 'render_page' ) );
	}

	/**
	 * Admin URL of the page (also used by the editor empty state).
	 *
	 * @return string
	 */
	public static function page_url() {
		return add_query_arg( array( 'post_type' => 'bptm_member', 'page' => 'bptm-demo-data' ), admin_url( 'edit.php' ) );
	}

	/**
	 * Demo content counts.
	 *
	 * @return array
	 */
	public static function counts() {
		$count = function ( $type, $status ) {
			$q = new \WP_Query(
				array(
					'post_type'      => $type,
					'post_status'    => $status,
					'posts_per_page' => 1,
					'fields'         => 'ids',
					'meta_key'       => self::FLAG, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
					'no_found_rows'  => false,
				)
			);
			return (int) $q->found_posts;
		};
		return array(
			'members'   => $count( 'bptm_member', 'any' ),
			'showcases' => $count( 'bptm_showcase', 'any' ),
			'images'    => $count( 'attachment', 'inherit' ),
		);
	}

	/**
	 * Page.
	 */
	public static function render_page() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return;
		}
		$counts = self::counts();
		echo '<div class="wrap bptm-admin">';
		Settings::page_header( 'bptm-demo-data', __( 'Demo Data', 'bp-team-member' ) );
		if ( isset( $_GET['bptm_demo'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$msg = 'imported' === $_GET['bptm_demo'] ? __( 'Demo data imported.', 'bp-team-member' ) : __( 'Demo data deleted.', 'bp-team-member' ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $msg ) . '</p></div>';
		}
		?>
		<div class="bptm-card">
			<h2><?php esc_html_e( 'Demo team members & showcases', 'bp-team-member' ); ?></h2>
			<p><?php esc_html_e( 'Imports 10 sample members with designation, contact details, social links, skills, ribbons and terms in every taxonomy, generated avatar images, and ready-made showcases. Only content created by the demo importer is removed by "Delete demo data".', 'bp-team-member' ); ?></p>
			<p>
				<?php
				/* translators: 1: members, 2: showcases, 3: images */
				echo esc_html( sprintf( __( 'Currently installed: %1$d demo members, %2$d demo showcases, %3$d demo images.', 'bp-team-member' ), $counts['members'], $counts['showcases'], $counts['images'] ) );
				?>
			</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline-block;margin-right:8px"<?php echo ( $counts['members'] || $counts['showcases'] ) ? ' class="bptm-confirm" data-confirm="' . esc_attr__( 'Re-importing first deletes all existing demo members, demo showcases and generated demo images (including any edits you made to them). Continue?', 'bp-team-member' ) . '"' : ''; ?>>
				<input type="hidden" name="action" value="bptm_demo_import" />
				<?php wp_nonce_field( 'bptm_demo_import' ); ?>
				<?php submit_button( $counts['members'] ? __( 'Re-import demo data', 'bp-team-member' ) : __( 'Import demo data', 'bp-team-member' ), 'primary', 'submit', false ); ?>
			</form>
			<?php if ( $counts['members'] || $counts['showcases'] || $counts['images'] ) : ?>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline-block" class="bptm-confirm" data-confirm="<?php esc_attr_e( 'Delete all demo members, demo showcases and generated demo images? Images you uploaded yourself are kept.', 'bp-team-member' ); ?>">
				<input type="hidden" name="action" value="bptm_demo_delete" />
				<?php wp_nonce_field( 'bptm_demo_delete' ); ?>
				<?php submit_button( __( 'Delete demo data', 'bp-team-member' ), 'delete', 'submit', false ); ?>
			</form>
			<?php endif; ?>
		</div>
		<?php
		echo '</div>';
	}

	/**
	 * admin-post: import.
	 */
	public static function handle_import() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'bp-team-member' ), 403 );
		}
		check_admin_referer( 'bptm_demo_import' );
		self::import();
		$redirect = add_query_arg( 'bptm_demo', 'imported', self::page_url() );
		wp_safe_redirect( $redirect );
		exit;
	}

	/**
	 * admin-post: delete.
	 */
	public static function handle_delete() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'bp-team-member' ), 403 );
		}
		check_admin_referer( 'bptm_demo_delete' );
		self::delete();
		wp_safe_redirect( add_query_arg( 'bptm_demo', 'deleted', self::page_url() ) );
		exit;
	}

	/**
	 * Demo member definitions.
	 *
	 * @return array
	 */
	public static function members() {
		$bio = function ( $first, $topic ) {
			return sprintf(
				"<!-- wp:paragraph -->\n<p>%1\$s has spent more than a decade working on %2\$s. Colleagues know %1\$s as a calm problem solver who enjoys mentoring new team members and sharing knowledge across departments.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:paragraph -->\n<p>Outside of work %1\$s enjoys hiking, photography and good coffee. Ask about the latest side project!</p>\n<!-- /wp:paragraph -->",
				$first,
				$topic
			);
		};
		$social = function ( $handle, array $nets ) {
			$urls = array(
				'linkedin'  => array( 'fab fa-linkedin-in', 'https://www.linkedin.com/in/' ),
				'x'         => array( 'fab fa-x-twitter', 'https://x.com/' ),
				'facebook'  => array( 'fab fa-facebook-f', 'https://www.facebook.com/' ),
				'github'    => array( 'fab fa-github', 'https://github.com/' ),
				'dribbble'  => array( 'fab fa-dribbble', 'https://dribbble.com/' ),
				'instagram' => array( 'fab fa-instagram', 'https://www.instagram.com/' ),
				'youtube'   => array( 'fab fa-youtube', 'https://www.youtube.com/@' ),
				'behance'   => array( 'fab fa-behance', 'https://www.behance.net/' ),
			);
			$out  = array();
			foreach ( $nets as $net ) {
				$out[] = array(
					'icon' => $urls[ $net ][0],
					'link' => $urls[ $net ][1] . $handle,
				);
			}
			$out[] = array(
				'icon' => 'fas fa-envelope',
				'link' => 'mailto:' . $handle . '@example.com',
			);
			return $out;
		};

		$list = array(
			array( 'Olivia Bennett', 'Chief Executive Officer', 'Management', 'Leadership', 'English, French', 'New York', 'Female', 'Strategy', 'CEO', array( 'Leadership' => 95, 'Strategy' => 90, 'Public Speaking' => 85 ), array( 'linkedin', 'x', 'facebook' ), '#4527a4', 'company strategy and growth', true ),
			array( 'Liam Carter', 'Chief Technology Officer', 'Management > Engineering', 'Leadership, Backend', 'English, German', 'Berlin', 'Male', 'Development', 'CTO', array( 'Architecture' => 92, 'PHP' => 88, 'Cloud' => 80 ), array( 'linkedin', 'github', 'x' ), '#0f766e', 'scalable web platforms', true ),
			array( 'Sophia Nguyen', 'Lead Product Designer', 'Design', 'Creative, UX', 'English, Vietnamese', 'San Francisco', 'Female', 'Design', 'Top Rated', array( 'UI Design' => 96, 'Prototyping' => 88, 'User Research' => 82 ), array( 'dribbble', 'behance', 'linkedin' ), '#db2777', 'product design and design systems', false ),
			array( 'Noah Williams', 'Senior Frontend Developer', 'Engineering', 'Frontend, JavaScript', 'English', 'London', 'Male', 'Development', '', array( 'JavaScript' => 94, 'React' => 90, 'CSS' => 86 ), array( 'github', 'x', 'linkedin' ), '#2563eb', 'frontend engineering and accessibility', false ),
			array( 'Emma Rodriguez', 'Marketing Manager', 'Marketing', 'Content, Social Media', 'English, Spanish', 'Madrid', 'Female', 'Marketing', 'New', array( 'SEO' => 85, 'Content Strategy' => 90, 'Analytics' => 78 ), array( 'instagram', 'facebook', 'x' ), '#ea580c', 'brand storytelling and digital marketing', false ),
			array( 'James Okafor', 'Backend Engineer', 'Engineering', 'Backend, API', 'English, Yoruba', 'Lagos', 'Male', 'Development', '', array( 'Node.js' => 88, 'Databases' => 84, 'DevOps' => 75 ), array( 'github', 'linkedin' ), '#16a34a', 'APIs, databases and automation', false ),
			array( 'Ava Schmidt', 'HR Specialist', 'Operations', 'People, Culture', 'German, English', 'Berlin', 'Female', 'Human Resources', '', array( 'Recruiting' => 90, 'Communication' => 95, 'Coaching' => 80 ), array( 'linkedin', 'facebook' ), '#9333ea', 'people operations and company culture', false ),
			array( 'Lucas Martin', 'Customer Success Lead', 'Support', 'Customer, Leadership', 'French, English', 'Paris', 'Male', 'Support', 'Lead', array( 'Customer Care' => 96, 'Training' => 85, 'Product Knowledge' => 88 ), array( 'linkedin', 'x', 'youtube' ), '#0891b2', 'customer success and onboarding', true ),
			array( 'Mia Tanaka', 'UX Researcher', 'Design', 'UX, Research', 'Japanese, English', 'Tokyo', 'Female', 'Design', '', array( 'Interviews' => 92, 'Usability Testing' => 89, 'Data Analysis' => 76 ), array( 'linkedin', 'dribbble', 'instagram' ), '#e11d48', 'user research and usability testing', false ),
			array( 'Ethan Brooks', 'Sales Executive', 'Sales', 'Business, Customer', 'English', 'Toronto', 'Male', 'Sales', '', array( 'Negotiation' => 91, 'CRM' => 84, 'Presentations' => 87 ), array( 'linkedin', 'facebook', 'x' ), '#ca8a04', 'business development and partnerships', false ),
		);

		$out = array();
		foreach ( $list as $i => $row ) {
			$first  = strtok( $row[0], ' ' );
			$handle = strtolower( str_replace( ' ', '.', $row[0] ) );
			$skills = array();
			foreach ( $row[9] as $skill => $percent ) {
				$skills[] = array(
					'skill'   => $skill,
					'percent' => $percent,
				);
			}
			$out[] = array(
				'name'            => $row[0],
				'content'         => $bio( $first, $row[12] ),
				'excerpt'         => sprintf( '%s at Northwind Collective, focused on %s.', $row[1], $row[12] ),
				'designation'     => $row[1],
				'company'         => 'Northwind Collective',
				'company_website' => 'https://example.com',
				'land_phone'      => sprintf( '+1 555 01%02d', $i * 2 ),
				'cell_phone'      => sprintf( '+1 555 02%02d', $i * 2 + 1 ),
				'email'           => $handle . '@example.com',
				'address'         => sprintf( '%d Harbor Avenue, %s', 10 + $i * 7, $row[5] ),
				'ribbon'          => $row[8],
				'zip_code'        => sprintf( '%05d', 10010 + $i * 37 ),
				'vcard'           => '',
				'featured'        => $row[13] ? '1' : '',
				'menu_order'      => $i + 1,
				'social'          => $social( $handle, $row[10] ),
				'skills'          => $skills,
				'color'           => $row[11],
				'terms'           => array(
					'group'       => array( $row[2] ),
					'tag'         => array_map( 'trim', explode( ',', $row[3] ) ),
					'language'    => array_map( 'trim', explode( ',', $row[4] ) ),
					'location'    => array( $row[5] ),
					'gender'      => array( $row[6] ),
					'specialty'   => array( $row[7] ),
					'extra_one'   => array( 0 === $i % 2 ? 'Remote' : 'On-site' ),
					'extra_two'   => array( $i < 5 ? 'Senior' : 'Mid-level' ),
					'extra_three' => array( 'Team ' . chr( 65 + ( $i % 3 ) ) ),
					'extra_four'  => array( 'Full-time' ),
					'extra_five'  => array( 'Since ' . ( 2015 + $i ) ),
				),
			);
		}
		return $out;
	}

	/**
	 * Demo showcases: title => block attributes.
	 *
	 * @return array
	 */
	public static function showcases() {
		return array(
			__( 'Demo: Team Grid', 'bp-team-member' )        => array( 'theme' => 'grid-1' ),
			__( 'Demo: Team Carousel', 'bp-team-member' )    => array(
				'theme'           => 'grid-5',
				'carouselEnabled' => true,
			),
			__( 'Demo: Filterable Team', 'bp-team-member' )  => array(
				'theme'         => 'grid-1',
				'filterEnabled' => true,
			),
			__( 'Demo: Team with Popup', 'bp-team-member' )  => array(
				'theme'    => 'circle-1',
				'linkType' => 'popup',
			),
			__( 'Demo: Horizontal List', 'bp-team-member' )  => array(
				'theme'   => 'horizontal-1',
				'columns' => array(
					'desktop'        => 2,
					'tablet'         => 2,
					'mobilePortrait' => 1,
					'mobile'         => 1,
				),
			),
		);
	}

	/**
	 * Import everything (deletes previous demo content first).
	 *
	 * @return array Created ids.
	 */
	public static function import() {
		self::delete();
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 300 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		}

		$created = array(
			'members'   => array(),
			'showcases' => array(),
		);
		$terms   = array();

		foreach ( self::members() as $member ) {
			$color      = $member['color'];
			$term_input = $member['terms'];
			unset( $member['color'], $member['terms'] );
			$id = Importer::save_member( $member );
			if ( is_wp_error( $id ) ) {
				continue;
			}
			update_post_meta( $id, self::FLAG, '1' );
			Importer::assign_terms( $id, $term_input, $terms );
			$image = self::create_avatar( $member['name'], $color, $id );
			if ( $image ) {
				set_post_thumbnail( $id, $image );
			}
			$created['members'][] = $id;
		}

		foreach ( $terms as $ids ) {
			foreach ( $ids as $term_id ) {
				update_term_meta( $term_id, self::FLAG, '1' );
			}
		}

		foreach ( self::showcases() as $title => $attrs ) {
			$id = wp_insert_post(
				wp_slash(
					array(
						'post_type'    => 'bptm_showcase',
						'post_status'  => 'publish',
						'post_title'   => $title,
						'post_content' => serialize_block(
							array(
								'blockName'    => 'icb/fold-out-reveal',
								'attrs'        => $attrs,
								'innerBlocks'  => array(),
								'innerHTML'    => '',
								'innerContent' => array(),
							)
						),
					)
				),
				true
			);
			if ( ! is_wp_error( $id ) ) {
				update_post_meta( $id, self::FLAG, '1' );
				$created['showcases'][] = $id;
			}
		}

		return $created;
	}

	/**
	 * Delete all demo content.
	 */
	public static function delete() {
		foreach ( array( 'bptm_member', 'bptm_showcase', 'attachment' ) as $type ) {
			$ids = get_posts(
				array(
					'post_type'      => $type,
					'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'trash', 'inherit', 'future' ),
					'posts_per_page' => -1,
					'fields'         => 'ids',
					'meta_key'       => self::FLAG, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				)
			);
			/**
			 * Filters the flagged demo post ids about to be deleted (per post type).
			 *
			 * @param int[]  $ids  Post ids.
			 * @param string $type Post type.
			 */
			$ids = (array) apply_filters( 'bptm_demo_delete_ids', $ids, $type );
			foreach ( $ids as $id ) {
				if ( 'attachment' === $type ) {
					// Only media generated by the demo importer itself; images a user uploaded or
					// attached to demo members (even if flagged) are kept.
					if ( self::is_generated_attachment( $id ) ) {
						wp_delete_attachment( $id, true );
					} else {
						// Now plain user media: unflag so it is no longer counted as demo content.
						delete_post_meta( $id, self::FLAG );
					}
				} else {
					wp_delete_post( $id, true );
				}
			}
		}
		foreach ( Importer::taxonomy_map() as $taxonomy ) {
			if ( ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}
			$term_ids = get_terms(
				array(
					'taxonomy'   => $taxonomy,
					'hide_empty' => false,
					'fields'     => 'ids',
					'meta_key'   => self::FLAG, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				)
			);
			if ( is_wp_error( $term_ids ) ) {
				continue;
			}
			/** This filter is documented above (type = "term:{taxonomy}"). */
			$term_ids = (array) apply_filters( 'bptm_demo_delete_ids', $term_ids, 'term:' . $taxonomy );
			foreach ( $term_ids as $term_id ) {
				$term = get_term( $term_id, $taxonomy );
				// Keep terms that are still used by real (non-demo) members.
				if ( $term && ! is_wp_error( $term ) && 0 === (int) $term->count ) {
					wp_delete_term( $term_id, $taxonomy );
				}
			}
		}
	}

	/**
	 * Whether a flagged attachment was generated by create_avatar() (safe to delete).
	 * New avatars carry GENERATED meta; legacy ones are recognised by their generated
	 * PNG file name (bptm-demo-{name}.png). Anything else is user media and is kept.
	 *
	 * @param int $id Attachment id.
	 * @return bool
	 */
	public static function is_generated_attachment( $id ) {
		if ( '1' === (string) get_post_meta( $id, self::GENERATED, true ) ) {
			return true;
		}
		$file = (string) get_post_meta( $id, '_wp_attached_file', true );
		return 'image/png' === get_post_mime_type( $id ) && (bool) preg_match( '/^bptm-demo-[a-z0-9-]+(?:-\d+)?\.png$/', wp_basename( $file ) );
	}

	/**
	 * Generate a simple PNG avatar (silhouette on colored background) with GD.
	 *
	 * @param string $name    Member name.
	 * @param string $hex     Background color.
	 * @param int    $post_id Parent post.
	 * @return int Attachment id or 0 when GD is missing.
	 */
	public static function create_avatar( $name, $hex, $post_id ) {
		if ( ! function_exists( 'imagecreatetruecolor' ) || ! function_exists( 'imagepng' ) ) {
			return 0;
		}
		$size = 600;
		$img  = imagecreatetruecolor( $size, $size );
		$hex  = ltrim( $hex, '#' );
		$r    = hexdec( substr( $hex, 0, 2 ) );
		$g    = hexdec( substr( $hex, 2, 2 ) );
		$b    = hexdec( substr( $hex, 4, 2 ) );

		// Vertical gradient background.
		for ( $y = 0; $y < $size; $y++ ) {
			$t   = $y / $size;
			$col = imagecolorallocate( $img, (int) ( $r + ( 255 - $r ) * 0.35 * ( 1 - $t ) ), (int) ( $g + ( 255 - $g ) * 0.35 * ( 1 - $t ) ), (int) ( $b + ( 255 - $b ) * 0.35 * ( 1 - $t ) ) );
			imageline( $img, 0, $y, $size, $y, $col );
		}
		$light = imagecolorallocatealpha( $img, 255, 255, 255, 30 );
		$soft  = imagecolorallocatealpha( $img, 255, 255, 255, 95 );
		// Decorative circle.
		imagefilledellipse( $img, (int) ( $size * 0.82 ), (int) ( $size * 0.18 ), 260, 260, $soft );
		// Shoulders + head.
		imagefilledellipse( $img, (int) ( $size / 2 ), (int) ( $size * 1.02 ), (int) ( $size * 0.86 ), (int) ( $size * 0.72 ), $light );
		imagefilledellipse( $img, (int) ( $size / 2 ), (int) ( $size * 0.40 ), (int) ( $size * 0.36 ), (int) ( $size * 0.40 ), $light );

		ob_start();
		imagepng( $img );
		$png = ob_get_clean();
		imagedestroy( $img );

		$file   = 'bptm-demo-' . sanitize_title( $name ) . '.png';
		$upload = wp_upload_bits( $file, null, $png );
		if ( ! empty( $upload['error'] ) ) {
			return 0;
		}
		$attachment_id = wp_insert_attachment(
			array(
				'post_mime_type' => 'image/png',
				'post_title'     => $name,
				'post_status'    => 'inherit',
			),
			$upload['file'],
			$post_id
		);
		if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
			return 0;
		}
		require_once ABSPATH . 'wp-admin/includes/image.php';
		wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $upload['file'] ) );
		update_post_meta( $attachment_id, '_wp_attachment_image_alt', $name );
		update_post_meta( $attachment_id, self::FLAG, '1' );
		update_post_meta( $attachment_id, self::GENERATED, '1' );
		return (int) $attachment_id;
	}
}

Demo_Data::init();
