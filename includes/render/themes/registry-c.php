<?php
/**
 * Theme registry C: compact "Sidebar" themes for widget areas and narrow columns
 * (used by the classic widget, [bp_team_sidebar] and the block).
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sidebar theme definitions.
 *
 * @return array
 */
function bptm_sidebar_themes() {
	$fields = array( 'thumbnail', 'name', 'designation', 'details', 'social', 'ribbon', 'featured_badge', 'skills', 'company', 'address', 'land_phone', 'cell_phone', 'email', 'location', 'language', 'specialty', 'gender', 'zip', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five', 'acf_fields', 'vcard', 'read_more' );
	$on     = array( 'thumbnail', 'name', 'designation', 'social' );
	$vis    = array();
	foreach ( $fields as $field ) {
		$vis[ $field ] = in_array( $field, $on, true );
	}
	$base = array(
		'group'       => 'sidebar',
		'layout'      => 'list',
		'carousel'    => false,
		'filter'      => true,
		'forced_link' => null,
		'forced_view' => null,
		'visibility'  => $vis,
		'template'    => 'themes/sidebar',
		'grouped'     => false,
		'pagination'  => true,
	);
	return array(
		'sidebar-1' => array_merge( $base, array( 'label' => __( 'Sidebar 1 - Framed Photo', 'bp-team-member' ) ) ),
		'sidebar-2' => array_merge( $base, array( 'label' => __( 'Sidebar 2 - Round Avatar', 'bp-team-member' ) ) ),
		'sidebar-3' => array_merge( $base, array( 'label' => __( 'Sidebar 3 - Compact Rows', 'bp-team-member' ) ) ),
	);
}

add_filter(
	'bptm_themes',
	function ( $themes ) {
		if ( ! is_array( $themes ) ) {
			$themes = array();
		}
		return $themes + bptm_sidebar_themes();
	},
	7
);
