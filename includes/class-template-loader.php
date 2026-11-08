<?php
/**
 * Template loader: single member page (6 styles), member archive and taxonomy archives,
 * theme overrides (yourtheme/bp-team-member/{file}), block + classic theme support,
 * generated vCard download.
 *
 * @package BPTM
 */

namespace BPTM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Template loader.
 */
class Template_Loader {

	/**
	 * Footer HTML pre-rendered for block themes.
	 *
	 * @var string
	 */
	protected static $block_footer = '';

	/**
	 * Hooks.
	 */
	public static function init() {
		add_filter( 'template_include', array( __CLASS__, 'template_include' ), 99 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ), 20 );
		add_filter( 'post_type_archive_link', array( __CLASS__, 'archive_link' ), 10, 2 );
		add_filter( 'post_type_archive_title', array( __CLASS__, 'post_type_archive_title' ), 10, 2 );
		add_filter( 'body_class', array( __CLASS__, 'body_class' ) );
		add_action( 'template_redirect', array( __CLASS__, 'maybe_output_vcard' ), 1 );
	}

	/* ------------------------------------------------------------------
	 * Context
	 * ------------------------------------------------------------------ */

	/**
	 * Our taxonomies that currently exist.
	 *
	 * @return array
	 */
	public static function taxonomies() {
		$out = array();
		foreach ( array_keys( Settings::taxonomy_labels() ) as $key ) {
			if ( taxonomy_exists( 'bptm_' . $key ) ) {
				$out[ $key ] = 'bptm_' . $key;
			}
		}
		return $out;
	}

	/**
	 * Is a single member page.
	 *
	 * @return bool
	 */
	public static function is_single() {
		return is_singular( 'bptm_member' );
	}

	/**
	 * Is member archive or member taxonomy archive.
	 *
	 * @return bool
	 */
	public static function is_archive() {
		$taxes = array_values( self::taxonomies() );
		return is_post_type_archive( 'bptm_member' ) || ( $taxes && is_tax( $taxes ) );
	}

	/**
	 * Current single style.
	 *
	 * @return string
	 */
	public static function single_style() {
		$style = (string) Settings::get( 'single_page_style', 'default' );
		$style = (string) apply_filters( 'bptm_single_page_style', $style );
		return array_key_exists( $style, Settings::single_styles() ) ? $style : 'default';
	}

	/* ------------------------------------------------------------------
	 * Template resolution
	 * ------------------------------------------------------------------ */

	/**
	 * Locate a template: child theme, parent theme (bp-team-member/{file}), then plugin.
	 *
	 * @param string $file Relative file, e.g. "single/style-one.php".
	 * @return string Absolute path ('' if missing).
	 */
	public static function locate( $file ) {
		$file   = ltrim( str_replace( array( '..', '\\' ), array( '', '/' ), $file ), '/' );
		$folder = trim( (string) apply_filters( 'bptm_templates_folder', 'bp-team-member' ), '/' );
		$found  = $folder ? locate_template( array( $folder . '/' . $file ) ) : '';
		if ( ! $found && file_exists( BPTM_DIR . 'templates/' . $file ) ) {
			$found = BPTM_DIR . 'templates/' . $file;
		}
		return (string) apply_filters( 'bptm_locate_template', $found, $file );
	}

	/**
	 * Include a single style template with `$v` and `$m` in (local) scope.
	 *
	 * @param string      $style Style id.
	 * @param Single_View $v     View helper.
	 */
	public static function render_style( $style, Single_View $v ) {
		$file = self::locate( 'single/' . $style . '.php' );
		if ( ! $file ) {
			$file = self::locate( 'single/default.php' );
		}
		if ( ! $file ) {
			return;
		}
		$m = $v->m;
		include $file;
	}

	/**
	 * Swap the theme template.
	 *
	 * @param string $template Template.
	 * @return string
	 */
	public static function template_include( $template ) {
		if ( ! apply_filters( 'bptm_use_plugin_templates', true ) ) {
			return $template;
		}
		if ( self::is_single() ) {
			$ours = self::locate( 'single.php' );
		} elseif ( self::is_archive() ) {
			$ours = self::locate( 'archive.php' );
		} else {
			return $template;
		}
		return $ours ? $ours : $template;
	}

	/**
	 * Enqueue block/frontend assets on our pages.
	 */
	public static function enqueue() {
		if ( ! self::is_single() && ! self::is_archive() ) {
			return;
		}
		if ( class_exists( __NAMESPACE__ . '\\Showcase' ) ) {
			Showcase::enqueue_assets();
		}
		// CONTRACT-GAP: bptm-fontawesome is registered by the render area. Fallback only if a vendor copy exists.
		if ( ! wp_style_is( 'bptm-fontawesome', 'registered' ) ) {
			foreach ( array( 'assets/vendor/fontawesome/css/all.min.css', 'assets/vendor/fontawesome/all.min.css' ) as $rel ) {
				if ( file_exists( BPTM_DIR . $rel ) ) {
					wp_enqueue_style( 'bptm-fontawesome', BPTM_URL . $rel, array(), BPTM_VERSION );
					break;
				}
			}
		}
		// Make sure the single/archive CSS is present even if the block style handle is not yet registered.
		if ( ! wp_style_is( 'icb-fold-out-reveal-style', 'registered' ) && file_exists( BPTM_DIR . 'build/view.css' ) ) {
			wp_enqueue_style( 'bptm-view-fallback', BPTM_URL . 'build/view.css', array(), BPTM_VERSION );
		}
	}

	/**
	 * Body classes.
	 *
	 * @param array $classes Classes.
	 * @return array
	 */
	public static function body_class( $classes ) {
		if ( self::is_single() ) {
			$classes[] = 'bptm-single-body';
			$classes[] = 'bptm-single-body--' . self::single_style();
		} elseif ( self::is_archive() ) {
			$classes[] = 'bptm-archive-body';
		}
		return $classes;
	}

	/**
	 * Custom archive page link.
	 *
	 * @param string $link      Link.
	 * @param string $post_type Post type.
	 * @return string
	 */
	public static function archive_link( $link, $post_type ) {
		if ( 'bptm_member' !== $post_type ) {
			return $link;
		}
		$custom = function_exists( 'bptm_archive_page_slug' ) ? bptm_archive_page_slug() : trim( (string) Settings::get( 'archive_page_slug', '' ) );
		if ( '' === $custom ) {
			return $link;
		}
		if ( preg_match( '#^https?://#i', $custom ) ) {
			return esc_url_raw( $custom );
		}
		// A slug is registered as the post type's has_archive (CPT), so core already builds the
		// matching link (nested paths, permalink front base, plain permalinks).
		$obj = get_post_type_object( 'bptm_member' );
		if ( $obj && is_string( $obj->has_archive ) && '' !== $link ) {
			return $link;
		}
		return home_url( user_trailingslashit( ltrim( $custom, '/' ) ) );
	}

	/**
	 * Archive title.
	 *
	 * @return string
	 */
	public static function archive_title() {
		$title = trim( (string) Settings::get( 'archive_page_title', '' ) );
		if ( '' === $title ) {
			$obj   = get_post_type_object( 'bptm_member' );
			$title = $obj ? $obj->labels->name : __( 'Team Members', 'bp-team-member' );
		}
		return $title;
	}

	/**
	 * Filter post type archive title.
	 *
	 * @param string $title     Title.
	 * @param string $post_type Post type.
	 * @return string
	 */
	public static function post_type_archive_title( $title, $post_type = '' ) {
		if ( 'bptm_member' === $post_type ) {
			return self::archive_title();
		}
		return $title;
	}

	/* ------------------------------------------------------------------
	 * Header / footer for classic & block themes
	 * ------------------------------------------------------------------ */

	/**
	 * Output the page header.
	 */
	public static function header() {
		remove_action( 'genesis_sidebar', 'genesis_do_sidebar' );
		if ( ! function_exists( 'wp_is_block_theme' ) || ! wp_is_block_theme() ) {
			get_header();
			return;
		}
		// Render parts before wp_head so their block assets get enqueued in <head>.
		$header             = do_blocks( '<!-- wp:template-part {"slug":"header","tagName":"header"} /-->' );
		self::$block_footer = do_blocks( '<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->' );
		?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div class="wp-site-blocks">
		<?php
		echo $header; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- block markup.
	}

	/**
	 * Output the page footer.
	 */
	public static function footer() {
		if ( ! function_exists( 'wp_is_block_theme' ) || ! wp_is_block_theme() ) {
			get_footer();
			return;
		}
		echo self::$block_footer; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- block markup.
		echo "</div>\n";
		wp_footer();
		echo "</body>\n</html>\n";
	}

	/* ------------------------------------------------------------------
	 * vCard
	 * ------------------------------------------------------------------ */

	/**
	 * Generated vCard URL for a member.
	 *
	 * @param int $id Member id.
	 * @return string
	 */
	public static function vcard_url( $id ) {
		return add_query_arg( 'bptm_vcard', (int) $id, home_url( '/' ) );
	}

	/**
	 * Serve ?bptm_vcard=ID.
	 */
	public static function maybe_output_vcard() {
		if ( empty( $_GET['bptm_vcard'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}
		$id   = absint( $_GET['bptm_vcard'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$post = get_post( $id );
		if ( ! $post || 'bptm_member' !== $post->post_type || 'publish' !== $post->post_status || post_password_required( $post ) ) {
			return;
		}
		$m   = self::member( $post );
		$esc = function ( $v ) {
			return str_replace( array( '\\', "\n", ',', ';' ), array( '\\\\', '\\n', '\\,', '\\;' ), wp_strip_all_tags( (string) $v ) );
		};
		$parts = explode( ' ', $m['name'] );
		$last  = count( $parts ) > 1 ? array_pop( $parts ) : '';
		$lines = array( 'BEGIN:VCARD', 'VERSION:3.0', 'FN:' . $esc( $m['name'] ), 'N:' . $esc( $last ) . ';' . $esc( implode( ' ', $parts ) ) . ';;;' );
		if ( $m['designation'] ) {
			$lines[] = 'TITLE:' . $esc( $m['designation'] );
		}
		if ( $m['company'] ) {
			$lines[] = 'ORG:' . $esc( $m['company'] );
		}
		if ( $m['land_phone'] ) {
			$lines[] = 'TEL;TYPE=WORK,VOICE:' . $esc( $m['land_phone'] );
		}
		if ( $m['cell_phone'] ) {
			$lines[] = 'TEL;TYPE=CELL:' . $esc( $m['cell_phone'] );
		}
		if ( $m['email'] ) {
			$lines[] = 'EMAIL;TYPE=INTERNET:' . $esc( $m['email'] );
		}
		if ( $m['address'] || $m['zip_code'] ) {
			$lines[] = 'ADR;TYPE=WORK:;;' . $esc( $m['address'] ) . ';;;' . $esc( $m['zip_code'] ) . ';';
		}
		$lines[] = 'URL:' . $esc( $m['company_website'] ? $m['company_website'] : $m['permalink'] );
		$lines[] = 'END:VCARD';

		nocache_headers();
		header( 'Content-Type: text/vcard; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="' . sanitize_file_name( $post->post_name ? $post->post_name : 'member-' . $id ) . '.vcf"' );
		echo implode( "\r\n", $lines ) . "\r\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- text/vcard download.
		exit;
	}

	/* ------------------------------------------------------------------
	 * Member data
	 * ------------------------------------------------------------------ */

	/**
	 * Member array: bptm_get_member() when available, otherwise read the contract meta directly.
	 *
	 * @param int|\WP_Post $post Post.
	 * @param string       $size Image size.
	 * @return array
	 */
	public static function member( $post, $size = 'large' ) {
		$post = get_post( $post );
		if ( function_exists( 'bptm_get_member' ) ) {
			$m = bptm_get_member( $post, $size );
			if ( is_array( $m ) && ! empty( $m['id'] ) ) {
				return self::normalize_member( $m, $post );
			}
		}
		$m = array(
			'id'        => $post->ID,
			'name'      => get_the_title( $post ),
			'permalink' => get_permalink( $post ),
			'content'   => null,
			'excerpt'   => $post->post_excerpt,
		);
		foreach ( Importer::meta_map() as $field => $key ) {
			$m[ $field ] = (string) get_post_meta( $post->ID, $key, true );
		}
		$m['featured']  = '1' === $m['featured'];
		$m['image_id']  = (int) get_post_thumbnail_id( $post );
		$m['image_url'] = $m['image_id'] ? (string) wp_get_attachment_image_url( $m['image_id'], $size ) : '';
		$m['image_alt'] = $m['image_id'] ? (string) get_post_meta( $m['image_id'], '_wp_attachment_image_alt', true ) : '';
		$social         = get_post_meta( $post->ID, '_bptm_social', true );
		$skills         = get_post_meta( $post->ID, '_bptm_skills', true );
		$m['social']    = is_array( $social ) ? $social : array();
		$m['skills']    = is_array( $skills ) ? $skills : array();
		$m['terms']     = array();
		foreach ( self::taxonomies() as $key => $taxonomy ) {
			$terms = get_the_terms( $post, $taxonomy );
			if ( $terms && ! is_wp_error( $terms ) ) {
				foreach ( $terms as $t ) {
					$m['terms'][ $key ][] = array(
						'id'     => $t->term_id,
						'name'   => $t->name,
						'slug'   => $t->slug,
						'parent' => $t->parent,
					);
				}
			}
		}
		return self::normalize_member( $m, $post );
	}

	/**
	 * Fill missing keys.
	 *
	 * @param array    $m    Member.
	 * @param \WP_Post $post Post.
	 * @return array
	 */
	protected static function normalize_member( array $m, $post ) {
		$defaults = array(
			'id'        => $post->ID,
			'name'      => get_the_title( $post ),
			'permalink' => get_permalink( $post ),
			'content'   => null,
			'excerpt'   => '',
			'image_id'  => 0,
			'image_url' => '',
			'image_alt' => '',
			'social'    => array(),
			'skills'    => array(),
			'terms'     => array(),
			'featured'  => false,
		);
		foreach ( array_keys( Importer::meta_map() ) as $field ) {
			$defaults[ $field ] = '';
		}
		$m = array_merge( $defaults, $m );
		if ( ! is_array( $m['social'] ) ) {
			$m['social'] = array();
		}
		if ( ! is_array( $m['skills'] ) ) {
			$m['skills'] = array();
		}
		if ( ! is_array( $m['terms'] ) ) {
			$m['terms'] = array();
		}
		return $m;
	}

	/**
	 * Placeholder image URL.
	 *
	 * @return string
	 */
	public static function placeholder_url() {
		if ( function_exists( 'bptm_placeholder_image_url' ) ) {
			$url = bptm_placeholder_image_url();
			if ( $url ) {
				return $url;
			}
		}
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e5e7eb"/><circle cx="200" cy="160" r="72" fill="#cbd5e1"/><ellipse cx="200" cy="380" rx="150" ry="120" fill="#cbd5e1"/></svg>';
		return 'data:image/svg+xml;base64,' . base64_encode( $svg ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
	}
}

/**
 * Presentation helper used by single/archive templates. `$v` in templates.
 */
class Single_View {

	/**
	 * Member.
	 *
	 * @var array
	 */
	public $m;

	/**
	 * Printed ACF positions.
	 *
	 * @var array
	 */
	protected $acf_done = array();

	/**
	 * Constructor.
	 *
	 * @param int|\WP_Post $post Member post.
	 * @param string       $size Image size.
	 */
	public function __construct( $post, $size = 'large' ) {
		$this->m = Template_Loader::member( $post, $size );
	}

	/**
	 * Translation.
	 *
	 * @param string $key Key.
	 * @return string
	 */
	public function t( $key ) {
		return Settings::translation( $key );
	}

	/**
	 * Lazy-load attributes.
	 *
	 * @param bool $eager Above the fold.
	 * @return array [ classes, attrs ]
	 */
	protected function lazy( $eager = false ) {
		if ( Settings::to_bool( Settings::get( 'disable_lazy_load', false ) ) ) {
			return array( (string) Settings::get( 'lazy_load_class', 'skip-lazy' ), array( 'loading' => 'eager' ) );
		}
		return array( '', $eager ? array( 'loading' => 'eager', 'fetchpriority' => 'high' ) : array( 'loading' => 'lazy' ) );
	}

	/**
	 * Member photo.
	 *
	 * @param string $size  Size.
	 * @param string $class Class.
	 * @param bool   $eager Eager load.
	 * @return string
	 */
	public function image( $size = 'large', $class = 'bptm-single__img', $eager = true ) {
		list( $lazy_class, $attrs ) = $this->lazy( $eager );
		$class                      = trim( $class . ' ' . $lazy_class );
		$alt                        = '' !== $this->m['image_alt'] ? $this->m['image_alt'] : $this->m['name'];
		if ( $this->m['image_id'] ) {
			$html = wp_get_attachment_image( $this->m['image_id'], $size, false, array_merge( $attrs, array( 'class' => $class, 'alt' => $alt, 'itemprop' => 'image' ) ) );
			if ( $html ) {
				return $html;
			}
		}
		$src = $this->m['image_url'] ? $this->m['image_url'] : Template_Loader::placeholder_url();
		$out = '<img src="' . esc_url( $src, array( 'http', 'https', 'data' ) ) . '" alt="' . esc_attr( $alt ) . '" class="' . esc_attr( $class ) . '"';
		foreach ( $attrs as $k => $val ) {
			$out .= ' ' . esc_attr( $k ) . '="' . esc_attr( $val ) . '"';
		}
		return $out . ' />';
	}

	/**
	 * Ribbon.
	 *
	 * @return string
	 */
	public function ribbon() {
		if ( '' === trim( (string) $this->m['ribbon'] ) ) {
			return '';
		}
		return '<span class="bptm-single__ribbon">' . esc_html( $this->m['ribbon'] ) . '</span>';
	}

	/**
	 * Name.
	 *
	 * @param string $tag Tag.
	 * @return string
	 */
	public function name( $tag = 'h1' ) {
		$tag = tag_escape( $tag );
		return '<' . $tag . ' class="bptm-single__name" itemprop="name">' . esc_html( $this->m['name'] ) . '</' . $tag . '>';
	}

	/**
	 * Designation.
	 *
	 * @return string
	 */
	public function designation() {
		if ( '' === (string) $this->m['designation'] ) {
			return '';
		}
		return '<div class="bptm-single__designation" itemprop="jobTitle">' . esc_html( $this->m['designation'] ) . '</div>';
	}

	/**
	 * Biography.
	 *
	 * @return string
	 */
	public function content() {
		if ( null !== $this->m['content'] && '' !== $this->m['content'] ) {
			$html = (string) $this->m['content'];
		} else {
			$post = get_post( $this->m['id'] );
			$html = $post ? apply_filters( 'the_content', $post->post_content ) : ''; // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
		}
		if ( '' === trim( wp_strip_all_tags( $html ) ) ) {
			return '';
		}
		return '<div class="bptm-single__content" itemprop="description">' . $html . '</div>';
	}

	/**
	 * Social links.
	 *
	 * @param bool $with_title Show "Follow me on" heading.
	 * @return string
	 */
	public function social( $with_title = true ) {
		if ( empty( $this->m['social'] ) ) {
			return '';
		}
		$items = '';
		foreach ( $this->m['social'] as $row ) {
			if ( empty( $row['icon'] ) || empty( $row['link'] ) ) {
				continue;
			}
			$link = (string) $row['link'];
			if ( is_email( $link ) ) {
				$link = 'mailto:' . $link;
			}
			$icon  = (string) $row['icon'];
			$label = $this->icon_label( $icon );
			$ext   = preg_match( '#^https?://#i', $link ) ? ' target="_blank" rel="noopener noreferrer"' : '';
			$items .= '<li><a href="' . esc_url( $link, array( 'http', 'https', 'mailto', 'tel', 'skype', 'callto', 'sms', 'whatsapp' ) ) . '"' . $ext . ' aria-label="' . esc_attr( $label ) . '" title="' . esc_attr( $label ) . '"><i class="' . esc_attr( $icon ) . '" aria-hidden="true"></i></a></li>';
		}
		if ( '' === $items ) {
			return '';
		}
		$title = $with_title ? '<h3 class="bptm-single__heading">' . esc_html( $this->t( 'follow_me_on' ) ) . '</h3>' : '';
		return '<div class="bptm-single__social-wrap">' . $title . '<ul class="bptm-single__social bptm-social">' . $items . '</ul></div>';
	}

	/**
	 * Human label for an icon class.
	 *
	 * @param string $icon Icon class.
	 * @return string
	 */
	protected function icon_label( $icon ) {
		if ( function_exists( 'bptm_social_icons' ) ) {
			$icons = bptm_social_icons();
			if ( isset( $icons[ $icon ] ) ) {
				return (string) $icons[ $icon ];
			}
		}
		$name = preg_replace( '/^(fa[bsr]?|fa-brands|fa-solid|fa-regular)\s+/', '', $icon );
		$name = preg_replace( '/^fa-/', '', (string) $name );
		$name = preg_replace( '/-(f|in|square|alt)$/', '', (string) $name );
		return ucwords( str_replace( '-', ' ', (string) $name ) );
	}

	/**
	 * Skills with progress bars.
	 *
	 * @param bool $with_title Heading.
	 * @return string
	 */
	public function skills( $with_title = true ) {
		$rows = '';
		foreach ( $this->m['skills'] as $row ) {
			if ( empty( $row['skill'] ) ) {
				continue;
			}
			$pct   = max( 0, min( 100, (int) ( isset( $row['percent'] ) ? $row['percent'] : 0 ) ) );
			$rows .= '<div class="bptm-single__skill">'
				. '<div class="bptm-single__skill-head"><span>' . esc_html( $row['skill'] ) . '</span><b>' . esc_html( $pct ) . '%</b></div>'
				. '<div class="bptm-single__skill-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' . esc_attr( (string) $pct ) . '" aria-label="' . esc_attr( $row['skill'] ) . '"><span style="width:' . esc_attr( (string) $pct ) . '%"></span></div>'
				. '</div>';
		}
		if ( '' === $rows ) {
			return '';
		}
		$title = $with_title ? '<h3 class="bptm-single__heading">' . esc_html( $this->t( 'skills' ) ) . '</h3>' : '';
		return '<div class="bptm-single__skills">' . $title . $rows . '</div>';
	}

	/**
	 * Term names.
	 *
	 * @param string $key Taxonomy key.
	 * @return string
	 */
	public function terms_text( $key ) {
		if ( function_exists( 'bptm_member_term_names' ) ) {
			return (string) bptm_member_term_names( $this->m, $key );
		}
		if ( empty( $this->m['terms'][ $key ] ) ) {
			return '';
		}
		return implode( ', ', wp_list_pluck( $this->m['terms'][ $key ], 'name' ) );
	}

	/**
	 * Meta detail rows.
	 *
	 * @return array list of [ key, label, icon, html ]
	 */
	public function meta_items() {
		$m     = $this->m;
		$items = array();
		$add   = function ( $key, $label, $icon, $html ) use ( &$items ) {
			if ( '' !== trim( wp_strip_all_tags( (string) $html ) ) ) {
				$items[] = array(
					'key'   => $key,
					'label' => $label,
					'icon'  => $icon,
					'html'  => $html,
				);
			}
		};

		$company = esc_html( $m['company'] );
		if ( $m['company'] && $m['company_website'] ) {
			$company = '<a href="' . esc_url( $m['company_website'] ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( $m['company'] ) . '</a>';
		}
		$add( 'company', $this->t( 'company' ), 'fas fa-building', $m['company'] ? '<span itemprop="worksFor">' . $company . '</span>' : '' );
		$add( 'address', $this->t( 'address' ), 'fas fa-location-dot', $m['address'] ? '<span itemprop="address">' . esc_html( $m['address'] ) . '</span>' : '' );

		foreach ( array( 'land_phone' => 'fas fa-phone', 'cell_phone' => 'fas fa-mobile-screen-button' ) as $key => $icon ) {
			if ( ! $m[ $key ] ) {
				continue;
			}
			$val = esc_html( $m[ $key ] );
			if ( Settings::to_bool( Settings::get( $key . '_link', false ) ) ) {
				$val = '<a href="' . esc_url( 'tel:' . preg_replace( '/[^0-9+]/', '', $m[ $key ] ), array( 'tel' ) ) . '">' . $val . '</a>';
			}
			$add( $key, $this->t( $key ), $icon, '<span itemprop="telephone">' . $val . '</span>' );
		}

		if ( $m['email'] ) {
			$val = esc_html( $m['email'] );
			if ( Settings::to_bool( Settings::get( 'email_link', false ) ) ) {
				$query = array();
				if ( $m['email_cc'] ) {
					$query['cc'] = $m['email_cc'];
				}
				if ( $m['email_bcc'] ) {
					$query['bcc'] = $m['email_bcc'];
				}
				$href = 'mailto:' . $m['email'] . ( $query ? '?' . http_build_query( $query, '', '&', PHP_QUERY_RFC3986 ) : '' );
				$val  = '<a href="' . esc_url( $href, array( 'mailto' ) ) . '">' . $val . '</a>';
			}
			$add( 'email', $this->t( 'email' ), 'fas fa-envelope', '<span itemprop="email">' . $val . '</span>' );
		}
		$add( 'zip_code', $this->t( 'zip_code' ), 'fas fa-map-pin', esc_html( $m['zip_code'] ) );

		$term_icons = array(
			'location'  => 'fas fa-earth-americas',
			'language'  => 'fas fa-language',
			'specialty' => 'fas fa-star',
			'gender'    => 'fas fa-venus-mars',
		);
		foreach ( $term_icons as $key => $icon ) {
			$add( $key, $this->t( $key ), $icon, esc_html( $this->terms_text( $key ) ) );
		}
		foreach ( array( 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five' ) as $key ) {
			$label = (string) Settings::get_tax( $key . '_tax_label', '' );
			$add( $key, $label, 'fas fa-circle-info', esc_html( $this->terms_text( $key ) ) );
		}
		return (array) apply_filters( 'bptm_single_meta_items', $items, $m );
	}

	/**
	 * Meta details list.
	 *
	 * @param string $variant list|grid|table.
	 * @return string
	 */
	public function meta_details( $variant = 'list' ) {
		$items = $this->meta_items();
		if ( ! $items ) {
			return $this->acf_at( 'after_meta_details' );
		}
		$out = '<div class="bptm-single__meta bptm-single__meta--' . esc_attr( $variant ) . '">';
		foreach ( $items as $item ) {
			$out .= '<div class="bptm-single__meta-item bptm-single__meta-item--' . esc_attr( $item['key'] ) . '">'
				. '<i class="' . esc_attr( $item['icon'] ) . '" aria-hidden="true"></i>'
				. '<span class="bptm-single__meta-label">' . esc_html( $item['label'] ) . '</span>'
				. '<span class="bptm-single__meta-value">' . $item['html'] . '</span>'
				. '</div>';
		}
		$out .= '</div>';
		return $out . $this->acf_at( 'after_meta_details' );
	}

	/**
	 * vCard button.
	 *
	 * @return string
	 */
	public function vcard() {
		$url = $this->m['vcard'] ? $this->m['vcard'] : Template_Loader::vcard_url( $this->m['id'] );
		return '<a class="bptm-single__vcard" href="' . esc_url( $url ) . '" download><i class="fas fa-address-card" aria-hidden="true"></i> ' . esc_html( $this->t( 'vcard' ) ) . '</a>';
	}

	/**
	 * Group badges.
	 *
	 * @return string
	 */
	public function groups() {
		if ( empty( $this->m['terms']['group'] ) ) {
			return '';
		}
		$out = '<ul class="bptm-single__groups">';
		foreach ( $this->m['terms']['group'] as $term ) {
			$link = get_term_link( (int) $term['id'], 'bptm_group' );
			$out .= '<li>' . ( is_wp_error( $link ) ? esc_html( $term['name'] ) : '<a href="' . esc_url( $link ) . '">' . esc_html( $term['name'] ) . '</a>' ) . '</li>';
		}
		return $out . '</ul>';
	}

	/**
	 * ACF fields for a position (printed once per position).
	 *
	 * @param string $position after_skills|after_description|after_meta_details.
	 * @return string
	 */
	public function acf_at( $position ) {
		if ( isset( $this->acf_done[ $position ] ) ) {
			return '';
		}
		if ( ! Settings::to_bool( Settings::get( 'show_acf_fields', false ) ) || Settings::get( 'acf_fields_position', 'after_skills' ) !== $position ) {
			return '';
		}
		$this->acf_done[ $position ] = true;
		return $this->acf();
	}

	/**
	 * ACF field list.
	 *
	 * @return string
	 */
	public function acf() {
		if ( function_exists( 'bptm_member_acf_fields' ) ) {
			$rows = '';
			foreach ( (array) bptm_member_acf_fields( $this->m['id'] ) as $group ) {
				foreach ( isset( $group['fields'] ) ? (array) $group['fields'] : array() as $field ) {
					if ( empty( $field['html'] ) ) {
						continue;
					}
					$rows .= '<div class="bptm-single__acf-item bptm-single__acf-item--' . esc_attr( isset( $field['name'] ) ? $field['name'] : '' ) . '"><span class="bptm-single__meta-label">' . esc_html( isset( $field['label'] ) ? $field['label'] : '' ) . '</span><span class="bptm-single__meta-value">' . wp_kses_post( $field['html'] ) . '</span></div>';
				}
			}
			return $rows ? '<div class="bptm-single__acf">' . $rows . '</div>' : '';
		}
		if ( ! function_exists( 'get_field_objects' ) ) {
			return '';
		}
		$fields = get_field_objects( $this->m['id'] );
		if ( ! $fields ) {
			return '';
		}
		$rows = '';
		foreach ( $fields as $field ) {
			$value = isset( $field['value'] ) ? $field['value'] : '';
			if ( is_array( $value ) ) {
				if ( isset( $value['url'] ) ) {
					$value = $value['url'];
				} elseif ( isset( $value['label'] ) ) {
					$value = $value['label'];
				} else {
					$flat  = array_filter( array_map( function ( $v ) { return is_scalar( $v ) ? (string) $v : ( isset( $v['label'] ) ? $v['label'] : '' ); }, $value ), 'strlen' );
					$value = implode( ', ', $flat );
				}
			}
			if ( ! is_scalar( $value ) || '' === trim( (string) $value ) ) {
				continue;
			}
			$html  = preg_match( '#^https?://#i', (string) $value ) ? '<a href="' . esc_url( $value ) . '">' . esc_html( $value ) . '</a>' : wp_kses_post( (string) $value );
			$rows .= '<div class="bptm-single__acf-item"><span class="bptm-single__meta-label">' . esc_html( $field['label'] ) . '</span><span class="bptm-single__meta-value">' . $html . '</span></div>';
		}
		return $rows ? '<div class="bptm-single__acf">' . $rows . '</div>' : '';
	}

	/**
	 * Breadcrumb (when enabled).
	 *
	 * @return string
	 */
	public function breadcrumb() {
		if ( ! Settings::to_bool( Settings::get( 'breadcrumb', false ) ) ) {
			return '';
		}
		$items   = array();
		$items[] = array( __( 'Home', 'bp-team-member' ), home_url( '/' ) );
		$archive = get_post_type_archive_link( 'bptm_member' );
		$items[] = array( Template_Loader::archive_title(), $archive ? $archive : '' );
		if ( ! empty( $this->m['terms']['group'][0] ) ) {
			$term = $this->m['terms']['group'][0];
			$link = get_term_link( (int) $term['id'], 'bptm_group' );
			$items[] = array( $term['name'], is_wp_error( $link ) ? '' : $link );
		}
		$items[] = array( $this->m['name'], '' );

		$out = '<nav class="bptm-breadcrumb" aria-label="' . esc_attr__( 'Breadcrumb', 'bp-team-member' ) . '"><ol>';
		$last = count( $items ) - 1;
		foreach ( $items as $i => $item ) {
			if ( $i === $last ) {
				$out .= '<li aria-current="page">' . esc_html( $item[0] ) . '</li>';
			} elseif ( $item[1] ) {
				$out .= '<li><a href="' . esc_url( $item[1] ) . '">' . esc_html( $item[0] ) . '</a></li>';
			} else {
				$out .= '<li>' . esc_html( $item[0] ) . '</li>';
			}
		}
		return $out . '</ol></nav>';
	}

	/**
	 * Previous / next published members in the archive order (Sort Order = menu_order ASC,
	 * then newest first, then ID), instead of WordPress' post-date adjacency.
	 *
	 * @param int $id Current member id.
	 * @return array [ prev WP_Post|null, next WP_Post|null ]
	 */
	public static function adjacent_members( $id ) {
		$ids = get_posts(
			array(
				'post_type'        => 'bptm_member',
				'post_status'      => 'publish',
				'posts_per_page'   => -1,
				'fields'           => 'ids',
				'orderby'          => array(
					'menu_order' => 'ASC',
					'date'       => 'DESC',
					'ID'         => 'DESC',
				),
				'no_found_rows'    => true,
				'suppress_filters' => false,
			)
		);
		$ids = array_map( 'intval', (array) apply_filters( 'bptm_single_adjacent_ids', $ids, $id ) );
		$pos = array_search( (int) $id, $ids, true );
		if ( false === $pos ) {
			return array( null, null );
		}
		$prev = $pos > 0 ? get_post( $ids[ $pos - 1 ] ) : null;
		$next = isset( $ids[ $pos + 1 ] ) ? get_post( $ids[ $pos + 1 ] ) : null;
		return array( $prev, $next );
	}

	/**
	 * Previous / next member navigation (when enabled).
	 *
	 * @return string
	 */
	public function navigation() {
		if ( ! Settings::to_bool( Settings::get( 'next_prev', false ) ) ) {
			return '';
		}
		list( $prev, $next ) = self::adjacent_members( (int) $this->m['id'] );
		if ( ! $prev && ! $next ) {
			return '';
		}
		$cell = function ( $post, $dir ) {
			if ( ! $post ) {
				return '<span class="bptm-single__nav-item bptm-single__nav-item--' . $dir . ' is-empty"></span>';
			}
			$thumb = get_the_post_thumbnail( $post, 'thumbnail', array( 'class' => 'bptm-single__nav-thumb', 'loading' => 'lazy', 'alt' => '' ) );
			$label = 'prev' === $dir ? $this->t( 'prev' ) : $this->t( 'next' );
			$arrow = 'prev' === $dir ? '&larr;' : '&rarr;';
			return '<a class="bptm-single__nav-item bptm-single__nav-item--' . $dir . '" href="' . esc_url( get_permalink( $post ) ) . '" rel="' . $dir . '">'
				. $thumb
				. '<span class="bptm-single__nav-text"><small>' . ( 'prev' === $dir ? $arrow . ' ' : '' ) . esc_html( $label ) . ( 'next' === $dir ? ' ' . $arrow : '' ) . '</small>'
				. '<strong>' . esc_html( get_the_title( $post ) ) . '</strong></span></a>';
		};
		return '<nav class="bptm-single__nav" aria-label="' . esc_attr__( 'Team member navigation', 'bp-team-member' ) . '">' . $cell( $prev, 'prev' ) . $cell( $next, 'next' ) . '</nav>';
	}

	/**
	 * schema.org Person JSON-LD.
	 *
	 * @return string
	 */
	public function schema() {
		$m    = $this->m;
		$data = array(
			'@context' => 'https://schema.org',
			'@type'    => 'Person',
			'name'     => $m['name'],
			'url'      => $m['permalink'],
		);
		if ( $m['designation'] ) {
			$data['jobTitle'] = $m['designation'];
		}
		$img = $m['image_id'] ? wp_get_attachment_image_url( $m['image_id'], 'full' ) : $m['image_url'];
		if ( $img ) {
			$data['image'] = $img;
		}
		if ( $m['email'] ) {
			$data['email'] = $m['email'];
		}
		if ( $m['cell_phone'] || $m['land_phone'] ) {
			$data['telephone'] = $m['cell_phone'] ? $m['cell_phone'] : $m['land_phone'];
		}
		if ( $m['company'] ) {
			$data['worksFor'] = array_filter(
				array(
					'@type' => 'Organization',
					'name'  => $m['company'],
					'url'   => $m['company_website'],
				)
			);
		}
		if ( $m['address'] || $m['zip_code'] ) {
			$data['address'] = array_filter(
				array(
					'@type'         => 'PostalAddress',
					'streetAddress' => $m['address'],
					'postalCode'    => $m['zip_code'],
				)
			);
		}
		$excerpt = $m['excerpt'] ? $m['excerpt'] : wp_trim_words( wp_strip_all_tags( (string) get_post_field( 'post_content', $m['id'] ) ), 40 );
		if ( $excerpt ) {
			$data['description'] = wp_strip_all_tags( $excerpt );
		}
		$same = array();
		foreach ( $m['social'] as $row ) {
			if ( ! empty( $row['link'] ) && preg_match( '#^https?://#i', $row['link'] ) ) {
				$same[] = $row['link'];
			}
		}
		if ( $same ) {
			$data['sameAs'] = $same;
		}
		if ( ! empty( $m['skills'] ) ) {
			$data['knowsAbout'] = array_values( array_filter( wp_list_pluck( $m['skills'], 'skill' ) ) );
		}
		// JSON-LD is not HTML: plain text without tags or entities (&gt;, &#8217;, &hellip;…).
		$plain = function ( $value ) use ( &$plain ) {
			if ( is_array( $value ) ) {
				return array_map( $plain, $value );
			}
			if ( ! is_string( $value ) ) {
				return $value;
			}
			return trim( html_entity_decode( wp_strip_all_tags( $value ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
		};
		foreach ( array( 'name', 'jobTitle', 'description', 'telephone', 'knowsAbout' ) as $key ) {
			if ( isset( $data[ $key ] ) ) {
				$data[ $key ] = $plain( $data[ $key ] );
			}
		}
		foreach ( array( 'worksFor', 'address' ) as $key ) {
			if ( isset( $data[ $key ] ) && is_array( $data[ $key ] ) ) {
				foreach ( array( 'name', 'streetAddress', 'postalCode' ) as $sub ) {
					if ( isset( $data[ $key ][ $sub ] ) ) {
						$data[ $key ][ $sub ] = $plain( $data[ $key ][ $sub ] );
					}
				}
			}
		}
		$data = apply_filters( 'bptm_single_schema', $data, $m );
		return '<script type="application/ld+json">' . wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP ) . '</script>';
	}
}

Template_Loader::init();
