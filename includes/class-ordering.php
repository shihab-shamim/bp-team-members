<?php
/**
 * Drag-and-drop ordering: members (menu_order), taxonomy terms (term meta 'bptm_order')
 * and the filter bar order (option 'bptm_filters_order').
 *
 * Term ordering: any get_terms()/WP_Term_Query on our taxonomies with orderby=term_order
 * is ordered by the 'bptm_order' term meta (then name).
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ordering tools.
 */
class Ordering {

	const PAGE         = 'bptm-sort-order';
	const NONCE        = 'bptm_sort_order';
	const TERM_META    = 'bptm_order';
	const FILTERS_OPT  = 'bptm_filters_order';
	const TERM_NONCE   = 'bptm_term_order_nonce';

	/**
	 * Hook everything.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		add_action( 'wp_ajax_bptm_save_order', array( __CLASS__, 'ajax_save' ) );

		add_filter( 'terms_clauses', array( __CLASS__, 'terms_clauses' ), 10, 3 );
		add_filter( 'get_terms_args', array( __CLASS__, 'admin_default_term_order' ), 10, 2 );
		add_action( 'created_term', array( __CLASS__, 'created_term' ), 10, 3 );
		add_action( 'edited_term', array( __CLASS__, 'edited_term' ), 10, 3 );
		add_action( 'init', array( __CLASS__, 'term_screen_hooks' ), 20 );

		add_action( 'pre_get_posts', array( __CLASS__, 'archive_order' ) );
	}

	/* --------------------------------------------------------------------- *
	 * Admin page
	 * --------------------------------------------------------------------- */

	/**
	 * Register "Sort Order" submenu.
	 */
	public static function menu() {
		add_submenu_page(
			'edit.php?post_type=' . CPT::POST_TYPE,
			__( 'Sort Order', 'bp-team-member' ),
			__( 'Sort Order', 'bp-team-member' ),
			'edit_others_posts',
			self::PAGE,
			array( __CLASS__, 'render_page' )
		);
	}

	/**
	 * Current tab.
	 *
	 * @return string 'members', 'filters' or a taxonomy key.
	 */
	private static function current_tab() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- tab switch only.
		$tab  = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'members';
		$taxs = bptm_taxonomies();
		if ( 'members' === $tab || 'filters' === $tab ) {
			return $tab;
		}
		if ( isset( $taxs[ $tab ] ) && $taxs[ $tab ]['enabled'] ) {
			return $tab;
		}
		return 'members';
	}

	/**
	 * Page URL.
	 *
	 * @param string $tab Tab.
	 * @return string
	 */
	public static function page_url( $tab = 'members' ) {
		return add_query_arg(
			array(
				'post_type' => CPT::POST_TYPE,
				'page'      => self::PAGE,
				'tab'       => $tab,
			),
			admin_url( 'edit.php' )
		);
	}

	/**
	 * Enqueue sort assets.
	 *
	 * @param string $hook Hook.
	 */
	public static function enqueue( $hook ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
		if ( self::PAGE !== $page || false === strpos( (string) $hook, self::PAGE ) ) {
			return;
		}
		$ver = BPTM_VERSION;
		$css = BPTM_DIR . 'assets/admin/ordering.css';
		$js  = BPTM_DIR . 'assets/admin/ordering.js';
		wp_enqueue_style( 'bptm-admin-ordering', BPTM_URL . 'assets/admin/ordering.css', array(), file_exists( $css ) ? $ver . '.' . filemtime( $css ) : $ver );
		wp_enqueue_script( 'bptm-admin-ordering', BPTM_URL . 'assets/admin/ordering.js', array( 'jquery', 'jquery-ui-sortable' ), file_exists( $js ) ? $ver . '.' . filemtime( $js ) : $ver, true );
		wp_localize_script(
			'bptm-admin-ordering',
			'bptmOrdering',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( self::NONCE ),
				'i18n'    => array(
					'saving' => __( 'Saving…', 'bp-team-member' ),
					'saved'  => __( 'Order saved.', 'bp-team-member' ),
					'error'  => __( 'Could not save the order. Please reload and try again.', 'bp-team-member' ),
				),
			)
		);
	}

	/**
	 * Render the admin page.
	 */
	public static function render_page() {
		if ( ! current_user_can( 'edit_others_posts' ) ) {
			wp_die( esc_html__( 'You are not allowed to access this page.', 'bp-team-member' ) );
		}
		$tab  = self::current_tab();
		$taxs = bptm_taxonomies();
		?>
		<div class="wrap bptm-sort-wrap">
			<h1><?php esc_html_e( 'Sort Order', 'bp-team-member' ); ?></h1>

			<nav class="nav-tab-wrapper bptm-sort-tabs" aria-label="<?php esc_attr_e( 'Sort order sections', 'bp-team-member' ); ?>">
				<a href="<?php echo esc_url( self::page_url( 'members' ) ); ?>" class="nav-tab<?php echo 'members' === $tab ? ' nav-tab-active' : ''; ?>"><?php esc_html_e( 'Members', 'bp-team-member' ); ?></a>
				<?php foreach ( $taxs as $key => $tax ) : ?>
					<?php
					if ( ! $tax['enabled'] ) {
						continue;
					}
					?>
					<a href="<?php echo esc_url( self::page_url( $key ) ); ?>" class="nav-tab<?php echo $key === $tab ? ' nav-tab-active' : ''; ?>"><?php echo esc_html( $tax['plural'] ); ?></a>
				<?php endforeach; ?>
				<?php if ( current_user_can( 'manage_options' ) ) : ?>
					<a href="<?php echo esc_url( self::page_url( 'filters' ) ); ?>" class="nav-tab<?php echo 'filters' === $tab ? ' nav-tab-active' : ''; ?>"><?php esc_html_e( 'Filters', 'bp-team-member' ); ?></a>
				<?php endif; ?>
			</nav>

			<div class="bptm-sort-layout">
				<div class="bptm-sort-main">
					<div class="bptm-sort-status" role="status" aria-live="polite"></div>
					<?php
					if ( 'members' === $tab ) {
						self::render_members();
					} elseif ( 'filters' === $tab ) {
						self::render_filters();
					} else {
						self::render_terms( $tab );
					}
					?>
				</div>
				<aside class="bptm-sort-help">
					<h2><?php esc_html_e( 'How it works', 'bp-team-member' ); ?></h2>
					<?php if ( 'members' === $tab ) : ?>
						<ol>
							<li><?php esc_html_e( 'Drag the members into the order you want. The order is saved automatically.', 'bp-team-member' ); ?></li>
							<li><?php esc_html_e( 'In the BP Team Member block, open the Query tab and set "Order by" to "Custom order" (menu order) and "Order" to ascending.', 'bp-team-member' ); ?></li>
						</ol>
					<?php elseif ( 'filters' === $tab ) : ?>
						<p><?php esc_html_e( 'Drag the search fields and filter dropdowns into the order they should appear above the members in the filter view.', 'bp-team-member' ); ?></p>
					<?php else : ?>
						<ol>
							<li><?php esc_html_e( 'Drag the terms into the order you want. Child terms are ordered within their parent.', 'bp-team-member' ); ?></li>
							<li><?php esc_html_e( 'In the block, set "Taxonomy order by" to "Custom order" to use this order for filter tabs and term lists.', 'bp-team-member' ); ?></li>
						</ol>
					<?php endif; ?>
				</aside>
			</div>
		</div>
		<?php
	}

	/**
	 * Members tab.
	 */
	private static function render_members() {
		$query = new \WP_Query(
			array(
				'post_type'              => CPT::POST_TYPE,
				'post_status'            => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page'         => -1,
				'orderby'                => array(
					'menu_order' => 'ASC',
					'date'       => 'DESC',
				),
				'no_found_rows'          => true,
				'update_post_term_cache' => true,
				'suppress_filters'       => true,
			)
		);

		if ( ! $query->have_posts() ) {
			?>
			<div class="notice notice-info inline">
				<p><?php esc_html_e( 'No team members yet. Add some members to sort them.', 'bp-team-member' ); ?></p>
				<p><a class="button button-primary" href="<?php echo esc_url( admin_url( 'post-new.php?post_type=' . CPT::POST_TYPE ) ); ?>"><?php esc_html_e( 'Add Member', 'bp-team-member' ); ?></a></p>
			</div>
			<?php
			return;
		}

		$group_tax = taxonomy_exists( 'bptm_group' ) ? 'bptm_group' : '';
		?>
		<p class="bptm-sort-tools">
			<span><?php esc_html_e( 'Quick sort:', 'bp-team-member' ); ?></span>
			<button type="button" class="button" data-bptm-quicksort="name"><?php esc_html_e( 'Name A–Z', 'bp-team-member' ); ?></button>
			<button type="button" class="button" data-bptm-quicksort="date"><?php esc_html_e( 'Newest first', 'bp-team-member' ); ?></button>
			<button type="button" class="button" data-bptm-quicksort="reverse"><?php esc_html_e( 'Reverse', 'bp-team-member' ); ?></button>
		</p>
		<ul class="bptm-sortable bptm-sortable-members" data-bptm-sort="members">
			<?php
			foreach ( $query->posts as $post ) :
				$thumb  = get_post_thumbnail_id( $post );
				$src    = $thumb ? wp_get_attachment_image_url( $thumb, 'thumbnail' ) : '';
				$src    = $src ? $src : bptm_placeholder_image_url();
				$groups = $group_tax ? get_the_terms( $post, $group_tax ) : array();
				$des    = (string) get_post_meta( $post->ID, '_bptm_designation', true );
				?>
				<li class="bptm-sort-item" data-id="<?php echo (int) $post->ID; ?>" data-name="<?php echo esc_attr( strtolower( $post->post_title ) ); ?>" data-date="<?php echo esc_attr( (string) strtotime( $post->post_date_gmt ) ); ?>" tabindex="0">
					<span class="bptm-sort-handle dashicons dashicons-menu" aria-hidden="true"></span>
					<img src="<?php echo esc_url( $src ); ?>" alt="" width="40" height="40" class="bptm-sort-thumb" loading="lazy" />
					<span class="bptm-sort-title">
						<strong><?php echo esc_html( '' !== $post->post_title ? $post->post_title : __( '(no title)', 'bp-team-member' ) ); ?></strong>
						<?php if ( 'publish' !== $post->post_status ) : ?>
							<em class="bptm-sort-status-label"><?php echo esc_html( get_post_status_object( $post->post_status ) ? get_post_status_object( $post->post_status )->label : $post->post_status ); ?></em>
						<?php endif; ?>
						<?php if ( '' !== $des ) : ?>
							<small><?php echo esc_html( $des ); ?></small>
						<?php endif; ?>
					</span>
					<span class="bptm-sort-meta">
						<?php
						if ( is_array( $groups ) ) {
							foreach ( $groups as $g ) {
								echo '<span class="bptm-sort-badge">' . esc_html( $g->name ) . '</span>';
							}
						}
						?>
					</span>
					<span class="bptm-sort-keys">
						<button type="button" class="button-link bptm-sort-up" aria-label="<?php esc_attr_e( 'Move up', 'bp-team-member' ); ?>"><span class="dashicons dashicons-arrow-up-alt2" aria-hidden="true"></span></button>
						<button type="button" class="button-link bptm-sort-down" aria-label="<?php esc_attr_e( 'Move down', 'bp-team-member' ); ?>"><span class="dashicons dashicons-arrow-down-alt2" aria-hidden="true"></span></button>
					</span>
				</li>
			<?php endforeach; ?>
		</ul>
		<?php
	}

	/**
	 * Terms tab.
	 *
	 * @param string $key Taxonomy key.
	 */
	private static function render_terms( $key ) {
		$taxs     = bptm_taxonomies();
		$taxonomy = $taxs[ $key ]['taxonomy'];
		$tax_obj  = get_taxonomy( $taxonomy );
		if ( ! $tax_obj ) {
			echo '<p>' . esc_html__( 'This taxonomy is not registered.', 'bp-team-member' ) . '</p>';
			return;
		}
		if ( ! current_user_can( $tax_obj->cap->edit_terms ) ) {
			echo '<p>' . esc_html__( 'You are not allowed to reorder these terms.', 'bp-team-member' ) . '</p>';
			return;
		}
		$terms = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
				'orderby'    => 'term_order',
				'order'      => 'ASC',
			)
		);
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			?>
			<div class="notice notice-info inline">
				<p>
					<?php
					/* translators: %s: taxonomy plural label */
					echo esc_html( sprintf( __( 'No %s yet.', 'bp-team-member' ), $taxs[ $key ]['plural'] ) );
					?>
				</p>
				<p><a class="button button-primary" href="<?php echo esc_url( admin_url( 'edit-tags.php?taxonomy=' . $taxonomy . '&post_type=' . CPT::POST_TYPE ) ); ?>"><?php echo esc_html( $tax_obj->labels->add_new_item ); ?></a></p>
			</div>
			<?php
			return;
		}

		$children = array();
		foreach ( $terms as $term ) {
			$children[ (int) $term->parent ][] = $term;
		}
		// Orphans whose parent is missing are listed at the root.
		$ids = wp_list_pluck( $terms, 'term_id' );
		foreach ( array_keys( $children ) as $parent ) {
			if ( 0 !== $parent && ! in_array( $parent, array_map( 'intval', $ids ), true ) ) {
				$children[0] = array_merge( isset( $children[0] ) ? $children[0] : array(), $children[ $parent ] );
				unset( $children[ $parent ] );
			}
		}

		echo '<div class="bptm-sort-terms" data-bptm-sort="terms" data-taxonomy="' . esc_attr( $taxonomy ) . '">';
		self::render_term_level( $children, 0 );
		echo '</div>';
	}

	/**
	 * Render one nested level of terms.
	 *
	 * @param array $children Parent => terms.
	 * @param int   $parent   Parent ID.
	 */
	private static function render_term_level( $children, $parent ) {
		if ( empty( $children[ $parent ] ) ) {
			return;
		}
		echo '<ul class="bptm-sortable bptm-sortable-terms" data-parent="' . (int) $parent . '">';
		foreach ( $children[ $parent ] as $term ) {
			?>
			<li class="bptm-sort-item" data-id="<?php echo (int) $term->term_id; ?>" data-name="<?php echo esc_attr( strtolower( $term->name ) ); ?>" tabindex="0">
				<div class="bptm-sort-row">
					<span class="bptm-sort-handle dashicons dashicons-menu" aria-hidden="true"></span>
					<span class="bptm-sort-title"><strong><?php echo esc_html( $term->name ); ?></strong> <small><?php echo esc_html( $term->slug ); ?></small></span>
					<span class="bptm-sort-meta"><span class="bptm-sort-badge">
						<?php
						/* translators: %d: number of members */
						echo esc_html( sprintf( _n( '%d member', '%d members', (int) $term->count, 'bp-team-member' ), (int) $term->count ) );
						?>
					</span></span>
					<span class="bptm-sort-keys">
						<button type="button" class="button-link bptm-sort-up" aria-label="<?php esc_attr_e( 'Move up', 'bp-team-member' ); ?>"><span class="dashicons dashicons-arrow-up-alt2" aria-hidden="true"></span></button>
						<button type="button" class="button-link bptm-sort-down" aria-label="<?php esc_attr_e( 'Move down', 'bp-team-member' ); ?>"><span class="dashicons dashicons-arrow-down-alt2" aria-hidden="true"></span></button>
					</span>
				</div>
				<?php self::render_term_level( $children, (int) $term->term_id ); ?>
			</li>
			<?php
		}
		echo '</ul>';
	}

	/**
	 * Filters tab.
	 */
	private static function render_filters() {
		if ( ! current_user_can( 'manage_options' ) ) {
			echo '<p>' . esc_html__( 'You are not allowed to change the filter order.', 'bp-team-member' ) . '</p>';
			return;
		}
		$labels = bptm_filter_labels();
		$taxs   = bptm_taxonomies();
		echo '<ul class="bptm-sortable bptm-sortable-filters" data-bptm-sort="filters">';
		foreach ( bptm_filters_order() as $key ) {
			$disabled = isset( $taxs[ $key ] ) && ! $taxs[ $key ]['enabled'];
			?>
			<li class="bptm-sort-item<?php echo $disabled ? ' is-disabled' : ''; ?>" data-id="<?php echo esc_attr( $key ); ?>" tabindex="0">
				<span class="bptm-sort-handle dashicons dashicons-menu" aria-hidden="true"></span>
				<span class="bptm-sort-title"><strong><?php echo esc_html( $labels[ $key ] ); ?></strong> <small><?php echo esc_html( $key ); ?></small></span>
				<span class="bptm-sort-meta">
					<?php if ( $disabled ) : ?>
						<span class="bptm-sort-badge"><?php esc_html_e( 'Taxonomy disabled', 'bp-team-member' ); ?></span>
					<?php endif; ?>
				</span>
				<span class="bptm-sort-keys">
					<button type="button" class="button-link bptm-sort-up" aria-label="<?php esc_attr_e( 'Move up', 'bp-team-member' ); ?>"><span class="dashicons dashicons-arrow-up-alt2" aria-hidden="true"></span></button>
					<button type="button" class="button-link bptm-sort-down" aria-label="<?php esc_attr_e( 'Move down', 'bp-team-member' ); ?>"><span class="dashicons dashicons-arrow-down-alt2" aria-hidden="true"></span></button>
				</span>
			</li>
			<?php
		}
		echo '</ul>';
	}

	/**
	 * AJAX: save an order.
	 */
	public static function ajax_save() {
		check_ajax_referer( self::NONCE, 'nonce' );

		$type  = isset( $_POST['type'] ) ? sanitize_key( wp_unslash( $_POST['type'] ) ) : '';
		$order = isset( $_POST['order'] ) ? (array) wp_unslash( $_POST['order'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitized per type below.

		if ( 'members' === $type ) {
			if ( ! current_user_can( 'edit_others_posts' ) ) {
				wp_send_json_error( array( 'message' => __( 'Permission denied.', 'bp-team-member' ) ), 403 );
			}
			$ids = array_values( array_filter( array_map( 'absint', $order ) ) );
			wp_send_json_success( array( 'updated' => self::save_member_order( $ids ) ) );
		}

		if ( 'terms' === $type ) {
			$taxonomy = isset( $_POST['taxonomy'] ) ? sanitize_key( wp_unslash( $_POST['taxonomy'] ) ) : '';
			$tax_obj  = get_taxonomy( $taxonomy );
			if ( ! $tax_obj || ! bptm_is_member_taxonomy( $taxonomy ) ) {
				wp_send_json_error( array( 'message' => __( 'Invalid taxonomy.', 'bp-team-member' ) ), 400 );
			}
			if ( ! current_user_can( $tax_obj->cap->edit_terms ) ) {
				wp_send_json_error( array( 'message' => __( 'Permission denied.', 'bp-team-member' ) ), 403 );
			}
			$ids = array_values( array_filter( array_map( 'absint', $order ) ) );
			wp_send_json_success( array( 'updated' => self::save_term_order( $taxonomy, $ids ) ) );
		}

		if ( 'filters' === $type ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( array( 'message' => __( 'Permission denied.', 'bp-team-member' ) ), 403 );
			}
			$valid = array_keys( bptm_filter_labels() );
			$keys  = array_values( array_intersect( array_map( 'sanitize_key', $order ), $valid ) );
			update_option( self::FILTERS_OPT, $keys, false );
			wp_send_json_success( array( 'updated' => count( $keys ) ) );
		}

		wp_send_json_error( array( 'message' => __( 'Unknown order type.', 'bp-team-member' ) ), 400 );
	}

	/**
	 * Save member menu_order (0..n) for the given ID sequence.
	 *
	 * @param int[] $ids Post IDs in order.
	 * @return int Number updated.
	 */
	public static function save_member_order( array $ids ) {
		global $wpdb;
		$count = 0;
		foreach ( $ids as $index => $id ) {
			if ( CPT::POST_TYPE !== get_post_type( $id ) || ! current_user_can( 'edit_post', $id ) ) {
				continue;
			}
			if ( (int) get_post_field( 'menu_order', $id ) !== (int) $index ) {
				// Direct update avoids firing save_post / creating revisions for a pure reorder.
				$wpdb->update( $wpdb->posts, array( 'menu_order' => (int) $index ), array( 'ID' => (int) $id ), array( '%d' ), array( '%d' ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
				clean_post_cache( $id );
			}
			++$count;
		}
		do_action( 'bptm_member_order_saved', $ids );
		return $count;
	}

	/**
	 * Save term order (index in DFS order of the nested list).
	 *
	 * @param string $taxonomy Taxonomy.
	 * @param int[]  $ids      Term IDs in order.
	 * @return int
	 */
	public static function save_term_order( $taxonomy, array $ids ) {
		$count = 0;
		foreach ( $ids as $index => $id ) {
			$term = get_term( $id, $taxonomy );
			if ( ! $term || is_wp_error( $term ) ) {
				continue;
			}
			update_term_meta( $id, self::TERM_META, (int) $index + 1 );
			++$count;
		}
		clean_taxonomy_cache( $taxonomy );
		do_action( 'bptm_term_order_saved', $taxonomy, $ids );
		return $count;
	}

	/* --------------------------------------------------------------------- *
	 * Term query integration
	 * --------------------------------------------------------------------- */

	/**
	 * Order our taxonomies by term meta when orderby=term_order.
	 *
	 * @param array $clauses    Clauses.
	 * @param array $taxonomies Taxonomies.
	 * @param array $args       Args.
	 * @return array
	 */
	public static function terms_clauses( $clauses, $taxonomies, $args ) {
		if ( empty( $args['orderby'] ) || 'term_order' !== $args['orderby'] || empty( $clauses['orderby'] ) ) {
			return $clauses;
		}
		$taxonomies = array_filter( (array) $taxonomies );
		if ( empty( $taxonomies ) ) {
			return $clauses;
		}
		foreach ( $taxonomies as $taxonomy ) {
			if ( ! bptm_is_member_taxonomy( $taxonomy ) ) {
				return $clauses;
			}
		}
		global $wpdb;
		$order = ( isset( $args['order'] ) && 'DESC' === strtoupper( (string) $args['order'] ) ) ? 'DESC' : 'ASC';

		$clauses['join']   .= $wpdb->prepare( " LEFT JOIN {$wpdb->termmeta} AS bptm_tord ON ( bptm_tord.term_id = t.term_id AND bptm_tord.meta_key = %s )", self::TERM_META );
		// The order clause that follows is applied to t.name as the tie-breaker.
		$clauses['orderby'] = "ORDER BY CAST( COALESCE( bptm_tord.meta_value, '0' ) AS SIGNED ) {$order}, t.name";
		return $clauses;
	}

	/**
	 * On our term list screens without an explicit sort, list terms in custom order.
	 *
	 * @param array $args       Args.
	 * @param array $taxonomies Taxonomies.
	 * @return array
	 */
	public static function admin_default_term_order( $args, $taxonomies ) {
		if ( ! is_admin() || wp_doing_ajax() || ! function_exists( 'get_current_screen' ) ) {
			return $args;
		}
		$screen = get_current_screen();
		if ( ! $screen || 'edit-tags' !== $screen->base || ! bptm_is_member_taxonomy( $screen->taxonomy ) ) {
			return $args;
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only list sort.
		if ( ! empty( $_GET['orderby'] ) ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			if ( 'bptm_order' === sanitize_key( wp_unslash( $_GET['orderby'] ) ) ) {
				$args['orderby'] = 'term_order';
			}
			return $args;
		}
		$taxonomies = (array) $taxonomies;
		if ( 1 === count( $taxonomies ) && reset( $taxonomies ) === $screen->taxonomy && ( empty( $args['orderby'] ) || 'name' === $args['orderby'] ) ) {
			$args['orderby'] = 'term_order';
		}
		return $args;
	}

	/**
	 * New terms: explicit order from form, or last position.
	 *
	 * @param int    $term_id  Term ID.
	 * @param int    $tt_id    Term taxonomy ID.
	 * @param string $taxonomy Taxonomy.
	 */
	public static function created_term( $term_id, $tt_id, $taxonomy ) {
		if ( ! bptm_is_member_taxonomy( $taxonomy ) ) {
			return;
		}
		$order = self::posted_term_order();
		if ( null === $order ) {
			global $wpdb;
			$max   = (int) $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
				$wpdb->prepare(
					"SELECT MAX( CAST( tm.meta_value AS SIGNED ) ) FROM {$wpdb->termmeta} tm INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = tm.term_id WHERE tm.meta_key = %s AND tt.taxonomy = %s",
					self::TERM_META,
					$taxonomy
				)
			);
			$order = $max + 1;
		}
		update_term_meta( $term_id, self::TERM_META, $order );
	}

	/**
	 * Edited terms: update order only when our field was submitted.
	 *
	 * @param int    $term_id  Term ID.
	 * @param int    $tt_id    Term taxonomy ID.
	 * @param string $taxonomy Taxonomy.
	 */
	public static function edited_term( $term_id, $tt_id, $taxonomy ) {
		if ( ! bptm_is_member_taxonomy( $taxonomy ) ) {
			return;
		}
		$order = self::posted_term_order();
		if ( null !== $order ) {
			update_term_meta( $term_id, self::TERM_META, $order );
		}
	}

	/**
	 * Read & validate the order field from term forms.
	 *
	 * @return int|null
	 */
	private static function posted_term_order() {
		if ( ! isset( $_POST['bptm_term_order'], $_POST[ self::TERM_NONCE ] ) ) {
			return null;
		}
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST[ self::TERM_NONCE ] ) ), 'bptm_term_order' ) ) {
			return null;
		}
		$raw = trim( sanitize_text_field( wp_unslash( $_POST['bptm_term_order'] ) ) );
		if ( '' === $raw || ! is_numeric( $raw ) ) {
			return null;
		}
		return (int) $raw;
	}

	/**
	 * Register term screen hooks for every member taxonomy.
	 */
	public static function term_screen_hooks() {
		foreach ( bptm_taxonomies() as $tax ) {
			$t = $tax['taxonomy'];
			add_filter( "manage_edit-{$t}_columns", array( __CLASS__, 'term_column' ) );
			add_filter( "manage_{$t}_custom_column", array( __CLASS__, 'term_column_value' ), 10, 3 );
			add_filter( "manage_edit-{$t}_sortable_columns", array( __CLASS__, 'term_sortable' ) );
			add_action( "{$t}_add_form_fields", array( __CLASS__, 'term_add_field' ) );
			add_action( "{$t}_edit_form_fields", array( __CLASS__, 'term_edit_field' ) );
			add_action( "after-{$t}-table", array( __CLASS__, 'term_sort_link' ) );
		}
	}

	/**
	 * Term list column.
	 *
	 * @param array $columns Columns.
	 * @return array
	 */
	public static function term_column( $columns ) {
		$columns['bptm_order'] = __( 'Order', 'bp-team-member' );
		return $columns;
	}

	/**
	 * Term column value.
	 *
	 * @param string $content Content.
	 * @param string $column  Column.
	 * @param int    $term_id Term.
	 * @return string
	 */
	public static function term_column_value( $content, $column, $term_id ) {
		if ( 'bptm_order' === $column ) {
			$content = esc_html( (string) (int) get_term_meta( $term_id, self::TERM_META, true ) );
		}
		return $content;
	}

	/**
	 * Sortable order column.
	 *
	 * @param array $columns Columns.
	 * @return array
	 */
	public static function term_sortable( $columns ) {
		$columns['bptm_order'] = 'bptm_order';
		return $columns;
	}

	/**
	 * Add-term form field.
	 */
	public static function term_add_field() {
		wp_nonce_field( 'bptm_term_order', self::TERM_NONCE );
		?>
		<div class="form-field term-bptm-order-wrap">
			<label for="bptm-term-order"><?php esc_html_e( 'Order', 'bp-team-member' ); ?></label>
			<input type="number" name="bptm_term_order" id="bptm-term-order" value="" step="1" />
			<p class="description"><?php esc_html_e( 'Position used when terms are sorted by "Custom order". Leave empty to add at the end.', 'bp-team-member' ); ?></p>
		</div>
		<?php
	}

	/**
	 * Edit-term form field.
	 *
	 * @param \WP_Term $term Term.
	 */
	public static function term_edit_field( $term ) {
		?>
		<tr class="form-field term-bptm-order-wrap">
			<th scope="row"><label for="bptm-term-order"><?php esc_html_e( 'Order', 'bp-team-member' ); ?></label></th>
			<td>
				<?php wp_nonce_field( 'bptm_term_order', self::TERM_NONCE ); ?>
				<input type="number" name="bptm_term_order" id="bptm-term-order" value="<?php echo esc_attr( (string) (int) get_term_meta( $term->term_id, self::TERM_META, true ) ); ?>" step="1" />
				<p class="description"><?php esc_html_e( 'Position used when terms are sorted by "Custom order".', 'bp-team-member' ); ?></p>
			</td>
		</tr>
		<?php
	}

	/**
	 * Link to the drag-and-drop page below the term table.
	 *
	 * @param string $taxonomy Taxonomy.
	 */
	public static function term_sort_link( $taxonomy ) {
		foreach ( bptm_taxonomies() as $key => $tax ) {
			if ( $tax['taxonomy'] === $taxonomy && current_user_can( 'edit_others_posts' ) ) {
				echo '<p><a class="button" href="' . esc_url( self::page_url( $key ) ) . '"><span class="dashicons dashicons-sort" style="vertical-align:middle" aria-hidden="true"></span> ' . esc_html__( 'Drag & drop to reorder', 'bp-team-member' ) . '</a></p>';
				return;
			}
		}
	}

	/* --------------------------------------------------------------------- *
	 * Front-end archives
	 * --------------------------------------------------------------------- */

	/**
	 * Member archives & member taxonomy archives use the custom order (like the reference plugin).
	 *
	 * @param \WP_Query $query Query.
	 */
	public static function archive_order( $query ) {
		if ( is_admin() || ! $query->is_main_query() || $query->get( 'orderby' ) ) {
			return;
		}
		$is_ours = $query->is_post_type_archive( CPT::POST_TYPE );
		if ( ! $is_ours && $query->is_tax() ) {
			$is_ours = (bool) array_filter( array_keys( (array) $query->tax_query->queried_terms ), 'bptm_is_member_taxonomy' );
		}
		if ( ! $is_ours ) {
			return;
		}
		$query->set(
			'orderby',
			array(
				'menu_order' => 'ASC',
				'date'       => 'DESC',
			)
		);
	}
}

Ordering::init();
