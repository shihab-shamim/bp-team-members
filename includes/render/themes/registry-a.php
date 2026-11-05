<?php
/**
 * Theme registry A: Grid, Circle, Horizontal and Flip item themes.
 *
 * Registers 26 item templates (templates/themes/{id}.php) through the
 * `bptm_themes` filter and provides a few tiny template helpers used only by
 * those templates (prefixed `bptm_ta_`).
 *
 * @package BPTM
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Every visibility field known to the render Context.
 *
 * @return string[]
 */
function bptm_ta_visibility_fields() {
	return array(
		'thumbnail',
		'name',
		'designation',
		'details',
		'social',
		'ribbon',
		'featured_badge',
		'skills',
		'company',
		'address',
		'land_phone',
		'cell_phone',
		'email',
		'location',
		'language',
		'specialty',
		'gender',
		'zip',
		'extra_one',
		'extra_two',
		'extra_three',
		'extra_four',
		'extra_five',
		'acf_fields',
		'vcard',
		'read_more',
	);
}

/**
 * Build a complete visibility defaults map: listed fields on, all others off.
 *
 * @param string[] $on Fields visible by default.
 * @return array<string,bool>
 */
function bptm_ta_visibility( array $on ) {
	$map = array();
	foreach ( bptm_ta_visibility_fields() as $field ) {
		$map[ $field ] = in_array( $field, $on, true );
	}
	return $map;
}

/**
 * Theme definitions for this registry.
 *
 * @return array<string,array>
 */
function bptm_ta_themes() {
	$base = array( 'thumbnail', 'name', 'designation' );

	// id => [ label, group, visible-by-default fields (beyond thumbnail/name/designation) ].
	$defs = array(
		'grid-1'       => array( __( 'Grid 1', 'bp-team-member' ), 'grid', array( 'social' ) ),
		'grid-2'       => array( __( 'Grid 2', 'bp-team-member' ), 'grid', array( 'details', 'social', 'ribbon', 'featured_badge', 'cell_phone' ) ),
		'grid-3'       => array( __( 'Grid 3', 'bp-team-member' ), 'grid', array( 'social', 'ribbon', 'featured_badge' ) ),
		'grid-4'       => array( __( 'Grid 4', 'bp-team-member' ), 'grid', array( 'social', 'ribbon', 'featured_badge' ) ),
		'grid-5'       => array( __( 'Grid 5', 'bp-team-member' ), 'grid', array( 'social', 'ribbon', 'featured_badge' ) ),
		'grid-6'       => array( __( 'Grid 6', 'bp-team-member' ), 'grid', array( 'social', 'ribbon', 'featured_badge' ) ),
		'circle-1'     => array( __( 'Circle 1', 'bp-team-member' ), 'circle', array( 'details', 'social' ) ),
		'circle-2'     => array( __( 'Circle 2', 'bp-team-member' ), 'circle', array( 'details', 'social', 'cell_phone' ) ),
		'circle-3'     => array( __( 'Circle 3', 'bp-team-member' ), 'circle', array( 'social' ) ),
		'circle-4'     => array( __( 'Circle 4', 'bp-team-member' ), 'circle', array( 'details', 'social', 'cell_phone' ) ),
		'circle-5'     => array( __( 'Circle 5', 'bp-team-member' ), 'circle', array( 'details', 'social' ) ),
		'circle-6'     => array( __( 'Circle 6', 'bp-team-member' ), 'circle', array( 'details', 'social', 'ribbon', 'featured_badge' ) ),
		'horizontal-1' => array( __( 'Horizontal 1', 'bp-team-member' ), 'horizontal', array( 'details', 'social' ) ),
		'horizontal-2' => array( __( 'Horizontal 2', 'bp-team-member' ), 'horizontal', array( 'details', 'cell_phone' ) ),
		'horizontal-3' => array( __( 'Horizontal 3', 'bp-team-member' ), 'horizontal', array( 'details', 'ribbon', 'featured_badge', 'address' ) ),
		'horizontal-4' => array( __( 'Horizontal 4', 'bp-team-member' ), 'horizontal', array( 'details', 'social' ) ),
		'horizontal-5' => array( __( 'Horizontal 5', 'bp-team-member' ), 'horizontal', array( 'details', 'email' ) ),
		'horizontal-6' => array( __( 'Horizontal 6', 'bp-team-member' ), 'horizontal', array( 'details', 'social', 'ribbon', 'featured_badge' ) ),
		'horizontal-7' => array( __( 'Horizontal 7', 'bp-team-member' ), 'horizontal', array( 'details', 'social', 'ribbon', 'featured_badge' ) ),
		'horizontal-8' => array( __( 'Horizontal 8', 'bp-team-member' ), 'horizontal', array( 'details', 'social', 'ribbon', 'featured_badge' ) ),
		'horizontal-9' => array( __( 'Horizontal 9', 'bp-team-member' ), 'horizontal', array( 'details', 'social', 'ribbon', 'featured_badge' ) ),
		'flip-1'       => array( __( 'Flip 1', 'bp-team-member' ), 'flip', array( 'details', 'social', 'ribbon', 'featured_badge', 'cell_phone' ) ),
		'flip-2'       => array( __( 'Flip 2', 'bp-team-member' ), 'flip', array( 'details', 'social', 'email' ) ),
		'flip-3'       => array( __( 'Flip 3', 'bp-team-member' ), 'flip', array( 'details', 'social', 'ribbon', 'featured_badge', 'address' ) ),
		'flip-4'       => array( __( 'Flip 4', 'bp-team-member' ), 'flip', array( 'social', 'cell_phone', 'email' ) ),
		'flip-5'       => array( __( 'Flip 5', 'bp-team-member' ), 'flip', array( 'ribbon', 'featured_badge' ) ),
		'flip-6'       => array( __( 'Flip 6', 'bp-team-member' ), 'flip', array( 'ribbon', 'featured_badge', 'email', 'land_phone', 'cell_phone' ) ),
	);

	$themes = array();
	foreach ( $defs as $id => $def ) {
		$themes[ $id ] = array(
			'label'       => $def[0],
			'group'       => $def[1],
			'layout'      => 'grid',
			'carousel'    => true,
			'filter'      => true,
			'forced_link' => null,
			'forced_view' => null,
			'visibility'  => bptm_ta_visibility( array_merge( $base, $def[2] ) ),
			'template'    => 'themes/' . $id,
		);
	}

	return $themes;
}

add_filter(
	'bptm_themes',
	function ( $themes ) {
		if ( ! is_array( $themes ) ) {
			$themes = array();
		}
		return $themes + bptm_ta_themes();
	},
	5
);

/**
 * Return one visibility-guarded part of a member from the render Context.
 *
 * Maps a visibility field to its Context helper and returns '' when the field
 * is hidden or the helper is unavailable. Output is already escaped by Context.
 *
 * @param object $ctx   Render context (BPTM\Render\Context).
 * @param array  $m     Member array from bptm_get_member().
 * @param string $field Visibility field key.
 * @param mixed  ...$args Extra arguments for the Context helper.
 * @return string
 */
function bptm_ta_part( $ctx, array $m, $field, ...$args ) {
	$map = array(
		'name'           => 'name',
		'designation'    => 'designation',
		'details'        => 'details',
		'social'         => 'social',
		'ribbon'         => 'ribbon',
		'featured_badge' => 'featured_badge',
		'skills'         => 'skills',
		'acf_fields'     => 'acf',
		'vcard'          => 'vcard',
		'read_more'      => 'read_more',
	);

	if ( ! isset( $map[ $field ] ) || ! is_object( $ctx ) || ! method_exists( $ctx, $map[ $field ] ) ) {
		return '';
	}
	if ( method_exists( $ctx, 'show' ) && ! $ctx->show( $field ) ) {
		return '';
	}

	$method = $map[ $field ];
	return trim( (string) $ctx->$method( $m, ...$args ) );
}

/**
 * Member image (respecting thumbnail visibility).
 *
 * Context::image() wraps the image in the member link itself when the block's
 * "Link Image" option is on, so this only chooses the source.
 *
 * @param object $ctx  Render context.
 * @param array  $m    Member.
 * @param bool   $link Allow the member link around the image.
 * @param bool   $flip Use the flip (back side) image instead, falling back to the main image.
 * @return string
 */
function bptm_ta_image( $ctx, array $m, $link = true, $flip = false ) {
	if ( ! is_object( $ctx ) || ( method_exists( $ctx, 'show' ) && ! $ctx->show( 'thumbnail' ) ) ) {
		return '';
	}

	$img = '';
	if ( $flip && method_exists( $ctx, 'flip_image' ) ) {
		$img = trim( (string) $ctx->flip_image( $m ) );
	}
	if ( '' === $img && method_exists( $ctx, 'image' ) ) {
		$img = trim( (string) $ctx->image( $m, 'bptm-img', (bool) $link ) );
	}

	return $img;
}

/**
 * Secondary member content block: meta details, skills, ACF, vCard, read more.
 *
 * Context places the ACF block itself according to acfFieldsPosition (after
 * description / meta details / skills) and prints it only once per member, so
 * the trailing acf() call only catches positions not covered above.
 *
 * @param object $ctx     Render context.
 * @param array  $m       Member.
 * @param string $variant meta_details() variant.
 * @return string
 */
function bptm_ta_extras( $ctx, array $m, $variant = 'icons' ) {
	if ( ! is_object( $ctx ) ) {
		return '';
	}

	$parts = array(
		method_exists( $ctx, 'meta_details' ) ? trim( (string) $ctx->meta_details( $m, $variant ) ) : '',
		bptm_ta_part( $ctx, $m, 'skills' ),
		bptm_ta_part( $ctx, $m, 'acf_fields' ),
		bptm_ta_part( $ctx, $m, 'vcard' ),
		bptm_ta_part( $ctx, $m, 'read_more' ),
	);

	$html = implode( '', array_filter( $parts, 'strlen' ) );

	return '' === $html ? '' : '<div class="bptm-ta-extras">' . $html . '</div>';
}

/**
 * All common parts of one member, each already visibility-checked and escaped.
 *
 * @param object $ctx      Render context.
 * @param array  $m        Member.
 * @param string $name_tag Heading tag for the name.
 * @return array{img:string,name:string,role:string,desc:string,social:string,badges:string,extras:string}
 */
function bptm_ta_parts( $ctx, array $m, $name_tag = 'h3' ) {
	return array(
		'img'    => bptm_ta_image( $ctx, $m ),
		'name'   => bptm_ta_part( $ctx, $m, 'name', $name_tag ),
		'role'   => bptm_ta_part( $ctx, $m, 'designation' ),
		'desc'   => bptm_ta_part( $ctx, $m, 'details' ),
		'social' => bptm_ta_part( $ctx, $m, 'social' ),
		'badges' => bptm_ta_part( $ctx, $m, 'ribbon' ) . bptm_ta_part( $ctx, $m, 'featured_badge' ),
		'extras' => bptm_ta_extras( $ctx, $m ),
	);
}

/**
 * Extra item classes common to all registry-A themes.
 *
 * @param object $ctx    Render context.
 * @param array  $m      Member.
 * @param string $id     Theme id, e.g. grid-1.
 * @param string $family Theme family.
 * @return string[]
 */
function bptm_ta_classes( $ctx, array $m, $id, $family ) {
	$classes = array( 'bptm-ta', 'bptm-ta-' . $family, 'bptm-ta-' . $id );

	// Grid / circle designs reveal parts on hover. The theme CSS also treats
	// `.is-flipped` / `.is-active` as the hover state, so frontend tap handling
	// (as done for the flip family) can target items carrying this class.
	if ( in_array( $family, array( 'grid', 'circle' ), true ) ) {
		$classes[] = 'bptm-tap-reveal';
	}

	if ( is_object( $ctx ) && method_exists( $ctx, 'show' ) && ! $ctx->show( 'thumbnail' ) ) {
		$classes[] = 'bptm-ta-no-thumb';
	}

	return $classes;
}
