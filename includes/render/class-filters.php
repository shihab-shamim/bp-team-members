<?php
/**
 * Filter data helpers (category tabs, dropdown options).
 *
 * @package BPTM
 */

namespace BPTM\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Filters helper.
 */
class Filters {

	/**
	 * Dropdown filters: key => [attribute toggle, include attribute, type].
	 */
	const DROPDOWNS = array(
		'designation' => array( 'filterByDesignation', '', 'meta' ),
		'location'    => array( 'filterByLocation', 'includeLocations', 'tax' ),
		'language'    => array( 'filterByLanguage', 'includeLanguages', 'tax' ),
		'gender'      => array( 'filterByGender', 'includeGenders', 'tax' ),
		'specialty'   => array( 'filterBySpecialty', 'includeSpecialties', 'tax' ),
		'extra_one'   => array( 'filterByExtraOne', 'includeExtraOne', 'tax' ),
		'extra_two'   => array( 'filterByExtraTwo', 'includeExtraTwo', 'tax' ),
		'extra_three' => array( 'filterByExtraThree', 'includeExtraThree', 'tax' ),
		'extra_four'  => array( 'filterByExtraFour', 'includeExtraFour', 'tax' ),
		'extra_five'  => array( 'filterByExtraFive', 'includeExtraFive', 'tax' ),
	);

	/**
	 * Search inputs: key => [attribute toggle, translation key].
	 */
	const SEARCHES = array(
		'search'  => array( 'searchByName', 'search_name' ),
		'company' => array( 'searchByCompany', 'search_company' ),
		'zip'     => array( 'searchByZip', 'search_zip' ),
		'tag'     => array( 'searchByTag', 'search_tag' ),
	);

	/**
	 * Order of filter controls.
	 *
	 * @return string[]
	 */
	public static function order() {
		$order = array( 'search', 'company', 'zip', 'tag', 'designation', 'location', 'language', 'gender', 'specialty', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five' );
		// Sort Order > Filters admin page (class-ordering.php) stores keys like `search_name`; map them to ours.
		$saved = function_exists( 'bptm_filters_order' ) ? bptm_filters_order() : array();
		if ( is_array( $saved ) && $saved ) {
			$map   = array(
				'search_name'    => 'search',
				'search_company' => 'company',
				'search_zip'     => 'zip',
				'search_tag'     => 'tag',
			);
			$saved = array_map(
				static function ( $k ) use ( $map ) {
					return isset( $map[ $k ] ) ? $map[ $k ] : $k;
				},
				$saved
			);
			$saved = array_values( array_intersect( $saved, $order ) );
			$order = array_values( array_unique( array_merge( $saved, $order ) ) );
		}
		return apply_filters( 'bptm_filters_order', $order );
	}

	/**
	 * Terms of a taxonomy for filters, honouring taxonomy order/hide-empty settings and the include list.
	 *
	 * @param string  $key          Tax key.
	 * @param Context $ctx          Context.
	 * @param string  $include_attr Include attribute.
	 * @return \WP_Term[]
	 */
	public static function terms( $key, Context $ctx, $include_attr = '' ) {
		$tax = Query::tax_name( $key );
		if ( ! $tax ) {
			return array();
		}
		$orderby = (string) $ctx->attr( 'taxonomyOrderBy', 'name' );
		$order   = 'DESC' === $ctx->attr( 'taxonomyOrder', 'ASC' ) ? 'DESC' : 'ASC';
		$custom  = in_array( $orderby, array( 'order', 'menu_order', 'term_order' ), true );
		$hide    = (bool) $ctx->attr( 'taxonomyHideEmpty', false );
		$args    = array(
			'taxonomy'   => $tax,
			// Core term counts include password-protected members, so emptiness is computed below from visible members.
			'hide_empty' => false,
			'orderby'    => $custom ? 'name' : ( in_array( $orderby, array( 'name', 'term_id', 'slug', 'count' ), true ) ? $orderby : 'name' ),
			'order'      => $order,
		);
		// Includes may be term ids or slugs: normalise to ids so parent/ancestor checks work for both.
		$include = $include_attr ? self::term_ids( Query::term_values( $ctx->attr( $include_attr, array() ) ), $tax ) : array();
		$terms   = get_terms( $args );
		if ( is_wp_error( $terms ) ) {
			return array();
		}
		if ( $hide ) {
			$used  = self::visible_term_ids( $tax );
			$terms = array_values(
				array_filter(
					$terms,
					static function ( $t ) use ( $used ) {
						return isset( $used[ (int) $t->term_id ] );
					}
				)
			);
		}
		if ( $include ) {
			$terms = array_values(
				array_filter(
					$terms,
					static function ( $t ) use ( $include, $tax ) {
						if ( in_array( (int) $t->term_id, $include, true ) ) {
							return true;
						}
						// Children of an included parent stay available.
						foreach ( get_ancestors( $t->term_id, $tax, 'taxonomy' ) as $a ) {
							if ( in_array( (int) $a, $include, true ) ) {
								return true;
							}
						}
						return false;
					}
				)
			);
		}
		if ( 'group' === $key ) {
			$exclude = self::term_ids( Query::term_values( $ctx->attr( 'excludeGroups', array() ) ), $tax );
			if ( $exclude ) {
				$terms = array_values(
					array_filter(
						$terms,
						static function ( $t ) use ( $exclude ) {
							return ! in_array( (int) $t->term_id, $exclude, true );
						}
					)
				);
			}
		}
		if ( $custom ) {
			// Custom term order = term meta `bptm_order` written by the Sort Order page (class-ordering.php).
			usort(
				$terms,
				static function ( $a, $b ) use ( $order ) {
					$oa = self::term_order( $a );
					$ob = self::term_order( $b );
					if ( $oa === $ob ) {
						return strcasecmp( $a->name, $b->name );
					}
					return 'DESC' === $order ? $ob <=> $oa : $oa <=> $ob;
				}
			);
		}
		return apply_filters( 'bptm_filter_terms', $terms, $key, $ctx );
	}

	/**
	 * Normalise a list of term ids / slugs to term ids (unknown slugs are dropped).
	 *
	 * @param array  $values Ids (int) or slugs (string).
	 * @param string $tax    Taxonomy.
	 * @return int[]
	 */
	public static function term_ids( array $values, $tax ) {
		$ids = array();
		foreach ( $values as $v ) {
			if ( is_int( $v ) || ctype_digit( (string) $v ) ) {
				$ids[] = (int) $v;
				continue;
			}
			$term = get_term_by( 'slug', (string) $v, $tax );
			if ( $term && ! is_wp_error( $term ) ) {
				$ids[] = (int) $term->term_id;
			}
		}
		return array_values( array_unique( array_filter( $ids ) ) );
	}

	/**
	 * Term ids of a taxonomy that have at least one visible member (published, not password protected),
	 * plus their ancestors (a parent whose members are only in child terms is not empty, like core hide_empty).
	 *
	 * @param string $tax Taxonomy.
	 * @return array term_id => true
	 */
	public static function visible_term_ids( $tax ) {
		static $cache = array();
		if ( isset( $cache[ $tax ] ) ) {
			return $cache[ $tax ];
		}
		$ids  = get_posts(
			array(
				'post_type'        => 'bptm_member',
				'post_status'      => 'publish',
				'has_password'     => false,
				'posts_per_page'   => -1,
				'fields'           => 'ids',
				'no_found_rows'    => true,
				'suppress_filters' => true,
			)
		);
		$used = array();
		if ( $ids ) {
			$term_ids = wp_get_object_terms( array_map( 'intval', $ids ), $tax, array( 'fields' => 'ids' ) );
			if ( ! is_wp_error( $term_ids ) ) {
				$hier = is_taxonomy_hierarchical( $tax );
				foreach ( $term_ids as $tid ) {
					$used[ (int) $tid ] = true;
					if ( $hier ) {
						foreach ( get_ancestors( (int) $tid, $tax, 'taxonomy' ) as $a ) {
							$used[ (int) $a ] = true;
						}
					}
				}
			}
		}
		$cache[ $tax ] = $used;
		return $used;
	}

	/**
	 * Custom order value of a term.
	 *
	 * @param \WP_Term $t Term.
	 * @return int
	 */
	private static function term_order( $t ) {
		$v = get_term_meta( $t->term_id, 'bptm_order', true );
		if ( '' !== $v && false !== $v ) {
			return (int) $v;
		}
		return isset( $t->term_order ) ? (int) $t->term_order : 0;
	}

	/**
	 * Build a parent => children tree.
	 *
	 * @param \WP_Term[] $terms Terms.
	 * @return array List of ['term' => WP_Term, 'children' => [...]] for roots.
	 */
	public static function tree( array $terms ) {
		$by_id = array();
		foreach ( $terms as $t ) {
			$by_id[ $t->term_id ] = array(
				'term'     => $t,
				'children' => array(),
			);
		}
		$roots = array();
		foreach ( $terms as $t ) {
			if ( $t->parent && isset( $by_id[ $t->parent ] ) ) {
				$by_id[ $t->parent ]['children'][] = &$by_id[ $t->term_id ];
			} else {
				$roots[] = &$by_id[ $t->term_id ];
			}
		}
		return $roots;
	}

	/**
	 * Distinct designations of all members in the block's base query.
	 *
	 * @param Context $ctx Context.
	 * @return string[]
	 */
	public static function designations( Context $ctx ) {
		$atts                      = $ctx->atts;
		$atts['paginationEnabled'] = false;
		$q                         = new Query( $atts, array(), $ctx->theme, $ctx->uid, 'grid' );
		$args                      = $q->args();
		$args['fields']            = 'ids';
		$args['no_found_rows']     = true;
		$ids                       = get_posts( $args );
		if ( empty( $ids ) ) {
			return array();
		}
		$vals = array();
		foreach ( $ids as $id ) {
			$d = trim( (string) get_post_meta( (int) $id, '_bptm_designation', true ) );
			if ( '' !== $d ) {
				$vals[ sanitize_title( $d ) ] = $d;
			}
		}
		natcasesort( $vals );
		return $vals;
	}
}
