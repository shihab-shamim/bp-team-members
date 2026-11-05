<?php
/**
 * Public read-only REST route used by AJAX pagination, load more, infinite scroll and ajax filters.
 *
 * POST|GET /wp-json/bptm/v1/render
 *   attributes: object (validated against src/block.json attribute schema)
 *   uid:        string (instance uid, keeps detail ids consistent)
 *   page:       int    (numbered modes)
 *   offset:     int    (load more / infinite scroll)
 *   filters:    object { group, designation, location, language, gender, specialty, extra_one..extra_five: string|string[],
 *                        search, company, zip, tag: string }
 *   seed:       int    (random order seed)
 * Response: { items, details, pagination, found, count, page, maxPages, offset, hasMore, view }
 *
 * @package BPTM
 */

namespace BPTM\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST controller.
 */
class Rest {

	const NS = 'bptm/v1';

	/**
	 * Hooks.
	 */
	public static function hooks() {
		add_action( 'rest_api_init', array( __CLASS__, 'routes' ) );
	}

	/**
	 * Register routes.
	 */
	public static function routes() {
		register_rest_route(
			self::NS,
			'/render',
			array(
				'methods'             => array( \WP_REST_Server::READABLE, \WP_REST_Server::CREATABLE ),
				'callback'            => array( __CLASS__, 'render' ),
				'permission_callback' => '__return_true', // Public, read-only: only published, non-protected members are queried.
				'args'                => array(
					'attributes' => array(
						'type'              => 'object',
						'default'           => array(),
						'validate_callback' => array( __CLASS__, 'validate_attributes' ),
					),
					'uid'        => array(
						'type'              => 'string',
						'default'           => '',
						'sanitize_callback' => static function ( $v ) {
							return substr( preg_replace( '/[^a-z0-9-]/', '', strtolower( (string) $v ) ), 0, 40 );
						},
					),
					'page'       => array(
						'type'    => 'integer',
						'minimum' => 1,
						'maximum' => 10000,
					),
					'offset'     => array(
						'type'    => 'integer',
						'minimum' => 0,
						'maximum' => 100000,
					),
					'seed'       => array(
						'type'    => 'integer',
						'minimum' => 0,
						'maximum' => 999999,
					),
					'filters'    => array(
						'type'              => 'object',
						'default'           => array(),
						'sanitize_callback' => array( __CLASS__, 'sanitize_filters' ),
						'validate_callback' => static function ( $v ) {
							return is_array( $v ) || is_object( $v );
						},
					),
				),
			)
		);
	}

	/**
	 * Validate attributes against the block.json schema (unknown keys are rejected).
	 *
	 * @param mixed $value Value.
	 * @return true|\WP_Error
	 */
	public static function validate_attributes( $value ) {
		if ( ! is_array( $value ) ) {
			return new \WP_Error( 'rest_invalid_param', __( 'Attributes must be an object.', 'bp-team-member' ), array( 'status' => 400 ) );
		}
		$schema = Renderer::schema();
		foreach ( $value as $key => $val ) {
			if ( ! isset( $schema[ $key ] ) ) {
				if ( in_array( $key, array( 'className', 'anchor', 'align', 'lock', 'metadata', 'style' ), true ) ) {
					continue;
				}
				/* translators: %s: attribute name */
				return new \WP_Error( 'rest_invalid_param', sprintf( __( 'Unknown attribute: %s', 'bp-team-member' ), $key ), array( 'status' => 400 ) );
			}
			$def   = $schema[ $key ];
			$check = rest_validate_value_from_schema( $val, array_intersect_key( $def, array_flip( array( 'type', 'enum', 'items', 'properties' ) ) ), $key );
			if ( is_wp_error( $check ) ) {
				return $check;
			}
		}
		return true;
	}

	/**
	 * Sanitize frontend filters.
	 *
	 * @param mixed $value Value.
	 * @return array
	 */
	public static function sanitize_filters( $value ) {
		$value = (array) $value;
		$out   = array();
		foreach ( array_merge( Query::FILTER_TAX, array( 'designation' ) ) as $key ) {
			if ( ! isset( $value[ $key ] ) ) {
				continue;
			}
			$vals = array();
			foreach ( (array) $value[ $key ] as $v ) {
				if ( is_scalar( $v ) ) {
					$v = sanitize_text_field( (string) $v );
					if ( '' !== $v && '*' !== $v ) {
						$vals[] = $v;
					}
				}
			}
			if ( $vals ) {
				$out[ $key ] = array_slice( array_values( array_unique( $vals ) ), 0, 50 );
			}
		}
		foreach ( array( 'search', 'company', 'zip', 'tag' ) as $key ) {
			if ( isset( $value[ $key ] ) && is_scalar( $value[ $key ] ) ) {
				$v = substr( sanitize_text_field( (string) $value[ $key ] ), 0, 100 );
				if ( '' !== $v ) {
					$out[ $key ] = $v;
				}
			}
		}
		return $out;
	}

	/**
	 * Callback.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public static function render( \WP_REST_Request $request ) {
		$runtime = array(
			'rest'    => true,
			'uid'     => (string) $request->get_param( 'uid' ),
			'filters' => (array) $request->get_param( 'filters' ),
		);
		foreach ( array( 'page', 'offset', 'seed' ) as $k ) {
			$v = $request->get_param( $k );
			if ( null !== $v && '' !== $v ) {
				$runtime[ $k ] = (int) $v;
			}
		}
		if ( '' === $runtime['uid'] ) {
			unset( $runtime['uid'] );
		}
		$attributes = (array) $request->get_param( 'attributes' );
		$data       = Renderer::render_part( $attributes, $runtime );
		$response   = rest_ensure_response( $data );
		$response->header( 'Cache-Control', 'no-store' );
		return $response;
	}
}

Rest::hooks();
