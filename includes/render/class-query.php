<?php
/**
 * Member query builder.
 *
 * @package BPTM
 */

namespace BPTM\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds and runs the WP_Query for one block instance.
 */
class Query {

	/**
	 * Hard cap of members per request (protects the public REST endpoint).
	 */
	const MAX_PER_REQUEST = 200;

	/**
	 * Attribute => taxonomy key (include). `excludeGroups` handled separately.
	 */
	const INCLUDE_MAP = array(
		'includeGroups'      => 'group',
		'includeTags'        => 'tag',
		'includeLocations'   => 'location',
		'includeLanguages'   => 'language',
		'includeSpecialties' => 'specialty',
		'includeGenders'     => 'gender',
		'includeExtraOne'    => 'extra_one',
		'includeExtraTwo'    => 'extra_two',
		'includeExtraThree'  => 'extra_three',
		'includeExtraFour'   => 'extra_four',
		'includeExtraFive'   => 'extra_five',
	);

	/**
	 * Filter keys accepted from the frontend (ajax filter) that map to taxonomies.
	 */
	const FILTER_TAX = array( 'group', 'location', 'language', 'gender', 'specialty', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five' );

	/**
	 * Attributes.
	 *
	 * @var array
	 */
	public $atts;

	/**
	 * Runtime (page, offset, perPage, filters, seed).
	 *
	 * @var array
	 */
	public $runtime;

	/**
	 * Pagination mode: '' (none) | normal-pagination | ajax-pagination | load-more-button | load-more-scroll.
	 *
	 * @var string
	 */
	public $mode = '';

	/**
	 * Current page (1-based) for numbered modes.
	 *
	 * @var int
	 */
	public $page = 1;

	/**
	 * Items per page / per load.
	 *
	 * @var int
	 */
	public $per_page = -1;

	/**
	 * Offset of the first returned item.
	 *
	 * @var int
	 */
	public $offset = 0;

	/**
	 * Total matching members (respecting numberOfMembers cap).
	 *
	 * @var int
	 */
	public $total = 0;

	/**
	 * The WP_Query.
	 *
	 * @var \WP_Query|null
	 */
	public $wp_query = null;

	/**
	 * Query var used for normal pagination links.
	 *
	 * @var string
	 */
	public $page_var = '';

	/**
	 * Constructor.
	 *
	 * @param array  $atts     Sanitized attributes.
	 * @param array  $runtime  Runtime overrides.
	 * @param array  $theme    Theme entry.
	 * @param string $uid      Instance uid.
	 * @param string $view     grid|carousel|filter.
	 */
	public function __construct( array $atts, array $runtime, array $theme, $uid, $view ) {
		$this->atts     = $atts;
		$this->runtime  = $runtime;
		$this->page_var = 'bptm-page-' . $uid;
		$this->mode     = self::pagination_mode( $atts, $theme, $view );
	}

	/**
	 * Which pagination mode applies.
	 *
	 * @param array  $atts  Attributes.
	 * @param array  $theme Theme.
	 * @param string $view  View.
	 * @return string
	 */
	public static function pagination_mode( array $atts, array $theme, $view ) {
		if ( empty( $atts['paginationEnabled'] ) || 'carousel' === $view || ! empty( $theme['grouped'] ) || ( isset( $theme['pagination'] ) && ! $theme['pagination'] ) ) {
			return '';
		}
		$type = (string) $atts['paginationType'];
		if ( ! in_array( $type, array( 'normal-pagination', 'ajax-pagination', 'load-more-button', 'load-more-scroll' ), true ) ) {
			$type = 'normal-pagination';
		}
		if ( 'filter' === $view ) {
			// Client-side filtering works on the full set, so it cannot be paginated.
			if ( 'ajax-filter' !== $atts['filterType'] ) {
				return '';
			}
			// Ajax filtering re-renders through REST, so numbered links become ajax links.
			if ( 'normal-pagination' === $type ) {
				$type = 'ajax-pagination';
			}
		}
		return $type;
	}

	/**
	 * Build WP_Query args.
	 *
	 * @return array
	 */
	public function args() {
		$a   = $this->atts;
		$rt  = $this->runtime;
		$num = (int) $a['numberOfMembers'];

		$orderby = in_array( $a['orderBy'], array( 'date', 'ID', 'title', 'rand', 'menu_order', 'modified', 'name' ), true ) ? $a['orderBy'] : 'date';
		$order   = 'ASC' === strtoupper( (string) $a['order'] ) ? 'ASC' : 'DESC';

		$args = array(
			'post_type'           => 'bptm_member',
			'post_status'         => 'publish',
			'has_password'        => false,
			'ignore_sticky_posts' => true,
			'no_found_rows'       => false,
			'suppress_filters'    => false,
			'tax_query'           => array( 'relation' => 'AND' ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			'meta_query'          => array(), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
		);

		if ( 'rand' === $orderby ) {
			$seed            = isset( $rt['seed'] ) ? absint( $rt['seed'] ) : 0;
			$args['orderby'] = $seed && $this->mode ? 'RAND(' . $seed . ')' : 'rand';
		} elseif ( 'menu_order' === $orderby ) {
			$args['orderby'] = array(
				'menu_order' => $order,
				'title'      => 'ASC',
			);
		} else {
			$args['orderby'] = array(
				$orderby => $order,
				'ID'     => $order,
			);
		}
		if ( ! is_array( $args['orderby'] ) ) {
			$args['order'] = $order;
		}

		if ( ! empty( $a['enableFeaturing'] ) ) {
			$args['bptm_featured_first'] = true;
		}

		// Include / exclude terms.
		$taxes = function_exists( 'bptm_taxonomies' ) ? bptm_taxonomies() : array();
		foreach ( self::INCLUDE_MAP as $attr => $key ) {
			$terms = self::term_values( isset( $a[ $attr ] ) ? $a[ $attr ] : array() );
			if ( empty( $terms ) ) {
				continue;
			}
			$tax = self::tax_name( $key, $taxes );
			if ( ! $tax ) {
				continue;
			}
			$args['tax_query'][] = self::tax_clause( $tax, $terms, 'IN' );
		}
		$exclude = self::term_values( isset( $a['excludeGroups'] ) ? $a['excludeGroups'] : array() );
		if ( $exclude && ( $tax = self::tax_name( 'group', $taxes ) ) ) { // phpcs:ignore Generic.CodeAnalysis.AssignmentInCondition.Found,Squiz.PHP.DisallowMultipleAssignments.FoundInControlStructure
			$args['tax_query'][] = self::tax_clause( $tax, $exclude, 'NOT IN' );
		}

		// Frontend filters (ajax filter mode).
		$this->apply_filters( $args, isset( $rt['filters'] ) && is_array( $rt['filters'] ) ? $rt['filters'] : array(), $taxes );

		// Pagination.
		$per_page = -1;
		$offset   = 0;
		$page     = 1;
		switch ( $this->mode ) {
			case 'normal-pagination':
			case 'ajax-pagination':
				$per_page = max( 1, (int) $a['perPage'] );
				$page     = isset( $rt['page'] ) ? max( 1, absint( $rt['page'] ) ) : 0;
				if ( ! $page ) {
					// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only pagination query var.
					$page = isset( $_GET[ $this->page_var ] ) ? max( 1, absint( wp_unslash( $_GET[ $this->page_var ] ) ) ) : 1;
				}
				$offset = ( $page - 1 ) * $per_page;
				break;
			case 'load-more-button':
			case 'load-more-scroll':
				if ( isset( $rt['offset'] ) ) {
					$offset   = absint( $rt['offset'] );
					$per_page = 'load-more-button' === $this->mode ? (int) $a['loadPerClick'] : (int) $a['perLoad'];
				} else {
					$per_page = (int) $a['initialItems'];
				}
				$per_page = max( 1, $per_page );
				break;
			default:
				$per_page = $num > 0 ? $num : -1;
		}

		if ( isset( $rt['perPage'] ) && (int) $rt['perPage'] > 0 && $this->mode ) {
			$per_page = (int) $rt['perPage'];
		}

		// numberOfMembers caps the total even when paginating.
		if ( $num > 0 && $this->mode ) {
			if ( $offset >= $num ) {
				$args['post__in'] = array( 0 );
			} else {
				$per_page = min( $per_page, $num - $offset );
			}
		}

		// Public REST requests are capped; server-side renders may show everything.
		$cap = ! empty( $rt['rest'] ) ? self::MAX_PER_REQUEST : (int) apply_filters( 'bptm_max_members', 1000 );
		if ( $per_page < 0 || $per_page > $cap ) {
			$per_page = $cap;
		}

		$args['posts_per_page'] = $per_page;
		if ( $offset > 0 ) {
			$args['offset'] = $offset;
		}

		$this->page     = $page;
		$this->per_page = $per_page;
		$this->offset   = $offset;

		if ( count( $args['tax_query'] ) <= 1 ) {
			unset( $args['tax_query'] );
		}
		if ( empty( $args['meta_query'] ) ) {
			unset( $args['meta_query'] );
		}

		return apply_filters( 'bptm_query_args', $args, $this->atts, $this->runtime );
	}

	/**
	 * Apply frontend filters to args.
	 *
	 * @param array $args    Args (by ref).
	 * @param array $filters Filters.
	 * @param array $taxes   Taxonomies.
	 */
	private function apply_filters( array &$args, array $filters, array $taxes ) {
		foreach ( self::FILTER_TAX as $key ) {
			if ( empty( $filters[ $key ] ) ) {
				continue;
			}
			$slugs = array_values( array_filter( array_map( 'sanitize_title', (array) $filters[ $key ] ) ) );
			$tax   = self::tax_name( $key, $taxes );
			if ( $slugs && $tax ) {
				$args['tax_query'][] = array(
					'taxonomy'         => $tax,
					'field'            => 'slug',
					'terms'            => $slugs,
					'include_children' => true,
				);
			}
		}

		if ( ! empty( $filters['designation'] ) ) {
			$vals = array_values( array_filter( array_map( 'sanitize_text_field', (array) $filters['designation'] ) ) );
			if ( $vals ) {
				$args['meta_query'][] = array(
					'key'     => '_bptm_designation',
					'value'   => $vals,
					'compare' => 'IN',
				);
			}
		}

		$search = isset( $filters['search'] ) ? sanitize_text_field( (string) $filters['search'] ) : '';
		if ( '' !== $search ) {
			$args['bptm_search'] = $search;
		}
		foreach ( array(
			'company' => '_bptm_company',
			'zip'     => '_bptm_zip_code',
		) as $key => $meta ) {
			$val = isset( $filters[ $key ] ) ? sanitize_text_field( (string) $filters[ $key ] ) : '';
			if ( '' !== $val ) {
				$args['meta_query'][] = array(
					'key'     => $meta,
					'value'   => $val,
					'compare' => 'LIKE',
				);
			}
		}
		$tag = isset( $filters['tag'] ) ? sanitize_text_field( (string) $filters['tag'] ) : '';
		$tax = self::tax_name( 'tag', $taxes );
		if ( '' !== $tag && $tax ) {
			$ids = get_terms(
				array(
					'taxonomy'   => $tax,
					'hide_empty' => false,
					'name__like' => $tag,
					'fields'     => 'ids',
				)
			);
			if ( is_wp_error( $ids ) || empty( $ids ) ) {
				$args['post__in'] = array( 0 );
			} else {
				$args['tax_query'][] = array(
					'taxonomy' => $tax,
					'field'    => 'term_id',
					'terms'    => array_map( 'intval', $ids ),
				);
			}
		}
	}

	/**
	 * Normalise a term list (ids or slugs; arrays of objects with value/id).
	 *
	 * @param mixed $raw Raw.
	 * @return array
	 */
	public static function term_values( $raw ) {
		if ( is_string( $raw ) ) {
			$raw = explode( ',', $raw );
		}
		$out = array();
		foreach ( (array) $raw as $v ) {
			if ( is_array( $v ) ) {
				$v = isset( $v['value'] ) ? $v['value'] : ( isset( $v['id'] ) ? $v['id'] : '' );
			}
			if ( is_numeric( $v ) ) {
				$out[] = (int) $v;
			} elseif ( is_string( $v ) && '' !== trim( $v ) ) {
				$out[] = sanitize_title( $v );
			}
		}
		return array_values( array_unique( array_filter( $out ) ) );
	}

	/**
	 * Tax clause supporting ids or slugs.
	 *
	 * @param string $tax      Taxonomy.
	 * @param array  $terms    Terms.
	 * @param string $operator Operator.
	 * @return array
	 */
	private static function tax_clause( $tax, array $terms, $operator ) {
		$ids   = array_values( array_filter( $terms, 'is_int' ) );
		$slugs = array_values( array_diff( $terms, $ids ) );
		if ( $ids && $slugs ) {
			foreach ( $slugs as $slug ) {
				$t = get_term_by( 'slug', $slug, $tax );
				if ( $t ) {
					$ids[] = (int) $t->term_id;
				}
			}
			$slugs = array();
		}
		return array(
			'taxonomy'         => $tax,
			'field'            => $ids ? 'term_id' : 'slug',
			'terms'            => $ids ? $ids : $slugs,
			'operator'         => $operator,
			'include_children' => true,
		);
	}

	/**
	 * Taxonomy name for a key (only if enabled + registered).
	 *
	 * @param string $key   Key.
	 * @param array  $taxes bptm_taxonomies().
	 * @return string
	 */
	public static function tax_name( $key, array $taxes = array() ) {
		if ( empty( $taxes ) && function_exists( 'bptm_taxonomies' ) ) {
			$taxes = bptm_taxonomies();
		}
		$tax = isset( $taxes[ $key ]['taxonomy'] ) ? $taxes[ $key ]['taxonomy'] : 'bptm_' . $key;
		if ( isset( $taxes[ $key ]['enabled'] ) && ! $taxes[ $key ]['enabled'] ) {
			return '';
		}
		return taxonomy_exists( $tax ) ? $tax : '';
	}

	/**
	 * Run the query.
	 *
	 * @return \WP_Query
	 */
	public function run() {
		$args           = $this->args();
		$this->wp_query = new \WP_Query( $args );
		$found          = (int) $this->wp_query->found_posts;
		$num            = (int) $this->atts['numberOfMembers'];
		$this->total    = $num > 0 ? min( $found, $num ) : $found;
		return $this->wp_query;
	}

	/**
	 * Total pages for numbered modes.
	 *
	 * @return int
	 */
	public function max_pages() {
		$pp = (int) $this->atts['perPage'];
		if ( isset( $this->runtime['perPage'] ) && (int) $this->runtime['perPage'] > 0 ) {
			$pp = (int) $this->runtime['perPage'];
		}
		return $pp > 0 ? (int) ceil( $this->total / $pp ) : 1;
	}

	/**
	 * More items after the current batch?
	 *
	 * @return bool
	 */
	public function has_more() {
		$count = $this->wp_query ? count( $this->wp_query->posts ) : 0;
		return ( $this->offset + $count ) < $this->total;
	}

	/**
	 * Global SQL hooks: featured-first ordering and name / all-fields search.
	 */
	public static function hooks() {
		add_filter( 'posts_clauses', array( __CLASS__, 'clauses' ), 20, 2 );
	}

	/**
	 * Modify SQL clauses for our query vars.
	 *
	 * @param array     $clauses Clauses.
	 * @param \WP_Query $query   Query.
	 * @return array
	 */
	public static function clauses( $clauses, $query ) {
		global $wpdb;
		if ( ! $query instanceof \WP_Query ) {
			return $clauses;
		}
		if ( $query->get( 'bptm_featured_first' ) ) {
			$clauses['join']   .= " LEFT JOIN {$wpdb->postmeta} AS bptm_feat ON ({$wpdb->posts}.ID = bptm_feat.post_id AND bptm_feat.meta_key = '_bptm_featured')";
			$existing           = trim( (string) $clauses['orderby'] );
			$clauses['orderby'] = "(CASE WHEN bptm_feat.meta_value = '1' THEN 0 ELSE 1 END) ASC" . ( '' !== $existing ? ', ' . $existing : '' );
			if ( empty( $clauses['groupby'] ) ) {
				$clauses['groupby'] = "{$wpdb->posts}.ID";
			}
		}
		$search = (string) $query->get( 'bptm_search' );
		if ( '' !== $search ) {
			$like = '%' . $wpdb->esc_like( $search ) . '%';
			$all  = function_exists( 'bptm_get_option' ) && bptm_get_option( 'search_all_fields', false );
			if ( $all ) {
				$taxes = array();
				if ( function_exists( 'bptm_taxonomies' ) ) {
					foreach ( bptm_taxonomies() as $t ) {
						$taxes[] = $t['taxonomy'];
					}
				}
				$taxes     = $taxes ? $taxes : array( 'bptm_group', 'bptm_tag' );
				$tax_in    = implode( ',', array_map( array( __CLASS__, 'quote' ), $taxes ) );
				$meta_keys = implode( ',', array_map( array( __CLASS__, 'quote' ), array( '_bptm_designation', '_bptm_company', '_bptm_company_website', '_bptm_land_phone', '_bptm_cell_phone', '_bptm_email', '_bptm_address', '_bptm_zip_code' ) ) );
				// phpcs:disable WordPress.DB.PreparedSQLPlaceholders,WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- lists are quoted with esc_sql above.
				$clauses['where'] .= $wpdb->prepare(
					" AND ( {$wpdb->posts}.post_title LIKE %s OR {$wpdb->posts}.post_content LIKE %s
					OR EXISTS ( SELECT 1 FROM {$wpdb->postmeta} bptm_pm WHERE bptm_pm.post_id = {$wpdb->posts}.ID AND bptm_pm.meta_key IN ({$meta_keys}) AND bptm_pm.meta_value LIKE %s )
					OR EXISTS ( SELECT 1 FROM {$wpdb->term_relationships} bptm_tr INNER JOIN {$wpdb->term_taxonomy} bptm_tt ON bptm_tt.term_taxonomy_id = bptm_tr.term_taxonomy_id INNER JOIN {$wpdb->terms} bptm_t ON bptm_t.term_id = bptm_tt.term_id WHERE bptm_tr.object_id = {$wpdb->posts}.ID AND bptm_tt.taxonomy IN ({$tax_in}) AND bptm_t.name LIKE %s ) )",
					$like,
					$like,
					$like,
					$like
				);
				// phpcs:enable
			} else {
				$clauses['where'] .= $wpdb->prepare( " AND {$wpdb->posts}.post_title LIKE %s", $like );
			}
		}
		return $clauses;
	}

	/**
	 * SQL-quote a string.
	 *
	 * @param string $s String.
	 * @return string
	 */
	public static function quote( $s ) {
		return "'" . esc_sql( $s ) . "'";
	}
}

Query::hooks();
