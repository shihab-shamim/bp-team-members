<?php
/**
 * Theme registry access (registries are provided by registry-a.php / registry-b.php via the `bptm_themes` filter).
 *
 * @package BPTM
 */

namespace BPTM\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Themes registry wrapper.
 */
class Themes {

	const DEFAULT_THEME = 'grid-5';

	/**
	 * Cache.
	 *
	 * @var array|null
	 */
	private static $cache = null;

	/**
	 * Normalise one registry entry.
	 *
	 * @param string $id    Theme id.
	 * @param array  $entry Raw entry.
	 * @return array
	 */
	public static function normalize( $id, $entry ) {
		$entry = is_array( $entry ) ? $entry : array();
		$entry = wp_parse_args(
			$entry,
			array(
				'label'       => ucwords( str_replace( '-', ' ', $id ) ),
				'group'       => 'grid',
				'layout'      => 'grid',
				'carousel'    => true,
				'filter'      => true,
				'forced_link' => null,
				'forced_view' => null,
				'visibility'  => array(),
				'template'    => 'themes/' . $id,
				'grouped'     => false,
				'pagination'  => true,
			)
		);
		if ( ! in_array( $entry['layout'], array( 'grid', 'table', 'list' ), true ) ) {
			$entry['layout'] = 'grid';
		}
		if ( ! in_array( $entry['forced_link'], array( null, 'popup', 'single_page', 'panel', 'drawer' ), true ) ) {
			$entry['forced_link'] = null;
		}
		if ( ! in_array( $entry['forced_view'], array( null, 'filter', 'carousel' ), true ) ) {
			$entry['forced_view'] = null;
		}
		$entry['id']         = $id;
		$entry['carousel']   = (bool) $entry['carousel'];
		$entry['filter']     = (bool) $entry['filter'];
		$entry['grouped']    = (bool) $entry['grouped'];
		$entry['pagination'] = (bool) $entry['pagination'];
		$entry['visibility'] = is_array( $entry['visibility'] ) ? $entry['visibility'] : array();
		return $entry;
	}

	/**
	 * All registered themes (normalised).
	 *
	 * @return array id => entry
	 */
	public static function all() {
		if ( null !== self::$cache && did_action( 'init' ) ) {
			return self::$cache;
		}
		$raw = apply_filters( 'bptm_themes', array() );
		$out = array();
		if ( is_array( $raw ) ) {
			foreach ( $raw as $id => $entry ) {
				$id = sanitize_key( $id );
				if ( '' !== $id ) {
					$out[ $id ] = self::normalize( $id, $entry );
				}
			}
		}
		if ( empty( $out ) ) {
			// CONTRACT-GAP: no registry loaded yet (themes areas) - expose a default so rendering never breaks.
			$out[ self::DEFAULT_THEME ] = self::normalize( self::DEFAULT_THEME, array( 'label' => 'Grid 5' ) );
		}
		if ( did_action( 'init' ) ) {
			self::$cache = $out;
		}
		return $out;
	}

	/**
	 * Get one theme (falls back to the default / first registered theme).
	 *
	 * @param string $id Theme id.
	 * @return array
	 */
	public static function get( $id ) {
		$all = self::all();
		$id  = sanitize_key( (string) $id );
		if ( isset( $all[ $id ] ) ) {
			return $all[ $id ];
		}
		if ( isset( $all[ self::DEFAULT_THEME ] ) ) {
			return $all[ self::DEFAULT_THEME ];
		}
		return reset( $all );
	}
}
