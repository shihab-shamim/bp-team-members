<?php
/**
 * Member list table columns, sorting, taxonomy filter dropdowns and featured toggle.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin list columns for bptm_member.
 */
class Admin_Columns {

	/**
	 * Hook everything.
	 */
	public static function init() {
		add_filter( 'manage_bptm_member_posts_columns', array( __CLASS__, 'columns' ) );
		add_action( 'manage_bptm_member_posts_custom_column', array( __CLASS__, 'column_content' ), 10, 2 );
		add_filter( 'manage_edit-bptm_member_sortable_columns', array( __CLASS__, 'sortable' ) );
		add_action( 'pre_get_posts', array( __CLASS__, 'sort_query' ) );
		add_action( 'restrict_manage_posts', array( __CLASS__, 'filters' ), 10, 2 );
		add_action( 'wp_ajax_bptm_toggle_featured', array( __CLASS__, 'ajax_toggle_featured' ) );
		add_action( 'admin_head-edit.php', array( __CLASS__, 'styles' ) );
		add_action( 'admin_footer-edit.php', array( __CLASS__, 'script' ) );
	}

	/**
	 * Is the current screen the member list?
	 *
	 * @return bool
	 */
	private static function is_list_screen() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		return $screen && 'edit-' . CPT::POST_TYPE === $screen->id;
	}

	/**
	 * Column headers.
	 *
	 * @param array $columns Columns.
	 * @return array
	 */
	public static function columns( $columns ) {
		$new = array();
		if ( isset( $columns['cb'] ) ) {
			$new['cb'] = $columns['cb'];
		}
		$new['bptm_photo']       = '<span class="screen-reader-text">' . esc_html__( 'Photo', 'bp-team-member' ) . '</span>';
		$new['title']            = __( 'Member Name', 'bp-team-member' );
		$new['bptm_designation'] = __( 'Designation', 'bp-team-member' );
		$new['bptm_featured']    = '<span class="dashicons dashicons-star-filled" aria-hidden="true" title="' . esc_attr__( 'Featured', 'bp-team-member' ) . '"></span><span class="screen-reader-text">' . esc_html__( 'Featured', 'bp-team-member' ) . '</span>';

		// Taxonomy columns (WP adds them via show_admin_column) in our order with current labels.
		foreach ( bptm_taxonomies() as $tax ) {
			$col = 'taxonomy-' . $tax['taxonomy'];
			if ( isset( $columns[ $col ] ) ) {
				$new[ $col ] = $tax['plural'];
			}
		}

		foreach ( $columns as $key => $label ) {
			if ( ! isset( $new[ $key ] ) && 'date' !== $key ) {
				$new[ $key ] = $label;
			}
		}
		$new['bptm_order'] = __( 'Order', 'bp-team-member' );
		if ( isset( $columns['date'] ) ) {
			$new['date'] = $columns['date'];
		}
		return $new;
	}

	/**
	 * Column content.
	 *
	 * @param string $column  Column.
	 * @param int    $post_id Post ID.
	 */
	public static function column_content( $column, $post_id ) {
		switch ( $column ) {
			case 'bptm_photo':
				$thumb = get_post_thumbnail_id( $post_id );
				$src   = $thumb ? wp_get_attachment_image_url( $thumb, 'thumbnail' ) : '';
				if ( ! $src ) {
					$src = bptm_placeholder_image_url();
				}
				$link = get_edit_post_link( $post_id );
				if ( $link ) {
					echo '<a href="' . esc_url( $link ) . '" tabindex="-1" aria-hidden="true">';
				}
				echo '<img class="bptm-col-photo" src="' . esc_url( $src ) . '" width="44" height="44" alt="" loading="lazy" />';
				if ( $link ) {
					echo '</a>';
				}
				break;

			case 'bptm_designation':
				$des = (string) get_post_meta( $post_id, '_bptm_designation', true );
				echo '' !== $des ? esc_html( $des ) : '<span aria-hidden="true">&mdash;</span>';
				$company = (string) get_post_meta( $post_id, '_bptm_company', true );
				if ( '' !== $company ) {
					echo '<br /><small class="bptm-col-company">' . esc_html( $company ) . '</small>';
				}
				break;

			case 'bptm_featured':
				$on = '1' === (string) get_post_meta( $post_id, '_bptm_featured', true );
				if ( current_user_can( 'edit_post', $post_id ) ) {
					printf(
						'<button type="button" class="button-link bptm-featured-toggle%1$s" data-post="%2$d" data-nonce="%3$s" aria-pressed="%4$s" title="%5$s"><span class="dashicons %6$s" aria-hidden="true"></span><span class="screen-reader-text">%5$s</span></button>',
						$on ? ' is-on' : '',
						(int) $post_id,
						esc_attr( wp_create_nonce( 'bptm_toggle_featured_' . $post_id ) ),
						$on ? 'true' : 'false',
						esc_attr__( 'Toggle featured', 'bp-team-member' ),
						$on ? 'dashicons-star-filled' : 'dashicons-star-empty'
					);
				} else {
					echo '<span class="dashicons ' . ( $on ? 'dashicons-star-filled' : 'dashicons-star-empty' ) . '" aria-hidden="true"></span>';
				}
				break;

			case 'bptm_order':
				echo (int) get_post_field( 'menu_order', $post_id );
				break;
		}
	}

	/**
	 * Sortable columns.
	 *
	 * @param array $columns Columns.
	 * @return array
	 */
	public static function sortable( $columns ) {
		$columns['bptm_designation'] = 'bptm_designation';
		$columns['bptm_featured']    = array( 'bptm_featured', true ); // First click: featured first.
		$columns['bptm_order']       = 'menu_order';
		return $columns;
	}

	/**
	 * Apply sorting for custom columns; default list order is the drag-and-drop order.
	 *
	 * @param \WP_Query $query Query.
	 */
	public static function sort_query( $query ) {
		if ( ! is_admin() || ! $query->is_main_query() || CPT::POST_TYPE !== $query->get( 'post_type' ) ) {
			return;
		}
		if ( ! self::is_list_screen() ) {
			return;
		}
		// Taxonomy dropdown filters for taxonomies without a public query var.
		$tax_query = array();
		foreach ( bptm_taxonomies() as $tax ) {
			$obj = get_taxonomy( $tax['taxonomy'] );
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only list filter.
			if ( ! $obj || $obj->query_var || empty( $_GET[ $tax['taxonomy'] ] ) ) {
				continue;
			}
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$slug = sanitize_title( wp_unslash( $_GET[ $tax['taxonomy'] ] ) );
			if ( '' !== $slug && '0' !== $slug ) {
				$tax_query[] = array(
					'taxonomy' => $tax['taxonomy'],
					'field'    => 'slug',
					'terms'    => $slug,
				);
			}
		}
		if ( $tax_query ) {
			$existing = $query->get( 'tax_query' );
			$query->set( 'tax_query', array_merge( is_array( $existing ) ? $existing : array(), $tax_query ) );
		}

		$orderby = $query->get( 'orderby' );
		if ( 'bptm_designation' === $orderby || 'bptm_featured' === $orderby ) {
			// An EXISTS / NOT EXISTS meta_query pair joins postmeta without limiting the key, so members
			// without the key were sorted by an arbitrary other meta value. Join exactly one row instead.
			$query->set( 'bptm_admin_sort', $orderby );
			$query->set( 'orderby', 'none' );
			add_filter( 'posts_clauses', array( __CLASS__, 'sort_clauses' ), 10, 2 );
		} elseif ( empty( $orderby ) ) {
			$query->set(
				'orderby',
				array(
					'menu_order' => 'ASC',
					'date'       => 'DESC',
				)
			);
		}
	}

	/**
	 * ORDER BY for the Designation / Featured columns, reading exactly the column's meta key
	 * (correlated subquery: no join, so no duplicate rows and no arbitrary meta values).
	 * Featured: featured members form one group (first for DESC, last for ASC), then title A-Z.
	 * Designation: members without one always last, then title A-Z.
	 *
	 * @param array     $clauses Query clauses.
	 * @param \WP_Query $query   Query.
	 * @return array
	 */
	public static function sort_clauses( $clauses, $query ) {
		$sort = $query->get( 'bptm_admin_sort' );
		if ( ! in_array( $sort, array( 'bptm_designation', 'bptm_featured' ), true ) ) {
			return $clauses;
		}
		global $wpdb;
		$order = 'ASC' === strtoupper( (string) $query->get( 'order' ) ) ? 'ASC' : 'DESC';
		$key   = 'bptm_featured' === $sort ? '_bptm_featured' : '_bptm_designation';
		$value = $wpdb->prepare( "( SELECT MAX( bptm_sort.meta_value ) FROM {$wpdb->postmeta} AS bptm_sort WHERE bptm_sort.post_id = {$wpdb->posts}.ID AND bptm_sort.meta_key = %s )", $key ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$tie   = "{$wpdb->posts}.post_title ASC, {$wpdb->posts}.ID ASC";
		if ( 'bptm_featured' === $sort ) {
			$clauses['orderby'] = "( COALESCE( {$value}, '' ) = '1' ) {$order}, {$tie}";
		} else {
			$clauses['orderby'] = "( COALESCE( {$value}, '' ) = '' ) ASC, {$value} {$order}, {$tie}";
		}
		return $clauses;
	}

	/**
	 * Taxonomy filter dropdowns above the list.
	 *
	 * @param string $post_type Post type.
	 * @param string $which     top|bottom.
	 */
	public static function filters( $post_type, $which = 'top' ) {
		if ( CPT::POST_TYPE !== $post_type || 'top' !== $which ) {
			return;
		}
		foreach ( bptm_taxonomies() as $tax ) {
			if ( ! $tax['enabled'] || ! taxonomy_exists( $tax['taxonomy'] ) ) {
				continue;
			}
			if ( ! wp_count_terms( array( 'taxonomy' => $tax['taxonomy'], 'hide_empty' => false ) ) ) {
				continue;
			}
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only list filter.
			$selected = isset( $_GET[ $tax['taxonomy'] ] ) ? sanitize_title( wp_unslash( $_GET[ $tax['taxonomy'] ] ) ) : '';
			echo '<label class="screen-reader-text" for="bptm-filter-' . esc_attr( $tax['taxonomy'] ) . '">' . esc_html( $tax['plural'] ) . '</label>';
			wp_dropdown_categories(
				array(
					/* translators: %s: taxonomy plural label */
					'show_option_all' => sprintf( __( 'All %s', 'bp-team-member' ), $tax['plural'] ),
					'taxonomy'        => $tax['taxonomy'],
					'name'            => $tax['taxonomy'],
					'id'              => 'bptm-filter-' . $tax['taxonomy'],
					'value_field'     => 'slug',
					'selected'        => $selected,
					'hierarchical'    => is_taxonomy_hierarchical( $tax['taxonomy'] ),
					'hide_empty'      => false,
					'show_count'      => true,
					'orderby'         => 'term_order',
				)
			);
		}
	}

	/**
	 * AJAX: toggle the featured flag.
	 */
	public static function ajax_toggle_featured() {
		$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
		if ( ! $post_id || CPT::POST_TYPE !== get_post_type( $post_id ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid member.', 'bp-team-member' ) ), 400 );
		}
		check_ajax_referer( 'bptm_toggle_featured_' . $post_id, 'nonce' );
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			wp_send_json_error( array( 'message' => __( 'You are not allowed to edit this member.', 'bp-team-member' ) ), 403 );
		}
		$on = '1' !== (string) get_post_meta( $post_id, '_bptm_featured', true );
		if ( $on ) {
			update_post_meta( $post_id, '_bptm_featured', '1' );
		} else {
			delete_post_meta( $post_id, '_bptm_featured' );
		}
		wp_send_json_success( array( 'featured' => $on ) );
	}

	/**
	 * Inline list styles.
	 */
	public static function styles() {
		if ( ! self::is_list_screen() ) {
			return;
		}
		?>
		<style id="bptm-admin-columns">
			.post-type-bptm_member .column-bptm_photo { width: 52px; }
			.post-type-bptm_member .bptm-col-photo { width: 44px; height: 44px; object-fit: cover; border-radius: 50%; display: block; background: #f0f0f1; }
			.post-type-bptm_member .column-bptm_featured { width: 36px; text-align: center; }
			.post-type-bptm_member .column-bptm_order { width: 60px; }
			.post-type-bptm_member .bptm-featured-toggle { color: #a7aaad; cursor: pointer; }
			.post-type-bptm_member .bptm-featured-toggle.is-on, .post-type-bptm_member th .dashicons-star-filled { color: #dba617; }
			.post-type-bptm_member .bptm-featured-toggle.is-busy { opacity: .5; pointer-events: none; }
			.post-type-bptm_member .bptm-col-company { color: #646970; }
		</style>
		<?php
	}

	/**
	 * Inline toggle script.
	 */
	public static function script() {
		if ( ! self::is_list_screen() ) {
			return;
		}
		?>
		<script id="bptm-admin-columns-js">
		( function () {
			document.addEventListener( 'click', function ( e ) {
				var btn = e.target.closest ? e.target.closest( '.bptm-featured-toggle' ) : null;
				if ( ! btn ) { return; }
				e.preventDefault();
				btn.classList.add( 'is-busy' );
				var body = new URLSearchParams();
				body.append( 'action', 'bptm_toggle_featured' );
				body.append( 'post_id', btn.getAttribute( 'data-post' ) );
				body.append( 'nonce', btn.getAttribute( 'data-nonce' ) );
				fetch( window.ajaxurl, { method: 'POST', credentials: 'same-origin', body: body } )
					.then( function ( r ) { return r.json(); } )
					.then( function ( res ) {
						if ( res && res.success ) {
							var on = !! res.data.featured;
							btn.classList.toggle( 'is-on', on );
							btn.setAttribute( 'aria-pressed', on ? 'true' : 'false' );
							var icon = btn.querySelector( '.dashicons' );
							icon.className = 'dashicons ' + ( on ? 'dashicons-star-filled' : 'dashicons-star-empty' );
						}
					} )
					.finally( function () { btn.classList.remove( 'is-busy' ); } );
			} );
		}() );
		</script>
		<?php
	}
}

Admin_Columns::init();
