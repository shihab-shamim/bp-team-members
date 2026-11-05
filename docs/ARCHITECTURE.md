# BP Team Member — Architecture & Contracts

Reference plugin (read-only, GPL-2.0+): `E:\gs-team-members.2.8.4\gs-team-members` ("GS").
Target plugin (this repo): `bp-team-member` ("BP").

Goal: BP reaches feature parity with GS (free + every feature GS markets as PRO), **all free**.
No Freemius, no licensing, no "Pro" badges, no upsell notices, no locked options.
Reimplement in our own code. You may study GS markup/CSS/behaviour for reference, but do not copy
GS images, logos, branding, Freemius code, or promotional pages. Do not use the strings "GS" / "gsteam" in BP.

## Product shape

GS = custom post type + shortcode builder admin page + PHP templates.
BP = the same data layer (CPT + taxonomies + meta boxes + admin tools) but the **builder is a Gutenberg block**.
The block's inspector is the shortcode-builder equivalent; the editor shows a live server-side-rendered preview.
For page builders / classic editor / widgets there is a "Showcase" CPT (`bptm_showcase`) whose content is one
BP block; `[bp_team id="123"]` renders it (equivalent of GS `[gsteam id=1]`).

## Hard rules

- Prefix everything: PHP namespace `BPTM`, functions `bptm_`, constants `BPTM_`, CSS classes `bptm-`, JS global `window.BPTM`, option names `bptm_*`, hooks `bptm_*`, text domain `bp-team-member`.
- Main plugin file stays `test-purpose.php` (renaming would deactivate the plugin). It only requires `includes/bootstrap.php` and registers the block.
- Block name stays `icb/fold-out-reveal` (backward compatibility with already-saved blocks). Legacy attributes `alignment`, `purposeType`, `colors` stay declared. `alignment` = content text alignment.
- PHP ≥ 7.4 compatible, WordPress ≥ 6.3. Escape all output (`esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`), sanitize all input, nonces + `current_user_can()` on every admin action / AJAX / REST write.
- Frontend JS is **vanilla** (no jQuery, no Owl/Isotope/Magnific). Admin-only JS may use jQuery + jQuery UI sortable (bundled with WP) and `wp.media`.
- Admin assets are plain files under `assets/admin/` (not built by webpack). Block/frontend code lives in `src/` and is built by `npm run build` (wp-scripts; `--webpack-copy-php` copies `src/render.php`).
- Never edit a file owned by another work area (see ownership table). If you need something from another area, code against the contract below; if the contract is missing something, add a clearly-marked `// CONTRACT-GAP:` note in your own file and mention it in your final report.

## File ownership

| Area | Owns |
|---|---|
| core (orchestrator, already done) | `test-purpose.php`, `includes/bootstrap.php`, `docs/ARCHITECTURE.md` |
| data | `includes/class-cpt.php`, `includes/class-meta-boxes.php`, `includes/class-admin-columns.php`, `includes/class-ordering.php`, `includes/functions.php`, `includes/class-acf.php`, `assets/admin/meta-boxes.{js,css}`, `assets/admin/ordering.{js,css}` |
| tools | `includes/class-settings.php`, `includes/class-importer.php`, `includes/class-import-export.php`, `includes/class-demo-data.php`, `includes/class-showcase.php`, `includes/class-widget.php`, `includes/class-template-loader.php`, `includes/integrations/*`, `templates/single/*.php`, `templates/archive.php`, `templates/single.php`, `assets/admin/settings.{js,css}`, `assets/admin/tools.{js,css}`, `src/styles/_single.scss`, `src/styles/_archive.scss` |
| render | `includes/render/*.php` (except theme registries), `templates/partials/*.php`, `src/view.js`, `src/frontend/*.js`, `src/style.scss`, `src/styles/_base.scss`, `_filters.scss`, `_carousel.scss`, `_pagination.scss`, `_modal.scss`, `_icons.scss`, `assets/vendor/*` |
| themes-a | `includes/render/themes/registry-a.php`, `templates/themes/{grid-1..grid-6,circle-1..circle-6,horizontal-1..horizontal-9,flip-1..flip-6}.php`, `src/styles/themes/_grid.scss`, `_circle.scss`, `_horizontal.scss`, `_flip.scss` |
| themes-b | `includes/render/themes/registry-b.php`, `templates/themes/{table-*,list-*,grid-7..grid-12,grid-popup,grid-single,grid-filter-*,grid-slider,grid-panel,grid-drawer-*,group-filter-1}.php`, `templates/popups/*.php`, `templates/panels/*.php`, `templates/drawers/*.php`, `src/styles/themes/_table.scss`, `_list.scss`, `_legacy.scss`, `src/styles/_popup-styles.scss`, `_panel-styles.scss`, `_drawer-styles.scss` |
| editor | `src/block.json` (attributes may only be ADDED, never renamed/removed), `src/index.js`, `src/editor.scss`, `src/Components/**`, `src/utils/**` |

Empty stub files for every SCSS partial already exist so the build works before each area is finished.

## Constants (defined in includes/bootstrap.php)

`BPTM_VERSION`, `BPTM_FILE` (main file path), `BPTM_DIR` (trailing slash), `BPTM_URL` (trailing slash).
Legacy `DFORC_*` constants stay defined.

## Data contract (owner: data)

Post type `bptm_member` (public, `show_in_rest` true, supports title, editor, thumbnail, excerpt, page-attributes (menu_order), custom-fields). Rewrite slug from `bptm_get_option('member_slug','team-members')`.

Taxonomies (all `show_in_rest` true, `rest_base` = same as taxonomy name, hierarchical: group yes, others no; each can be disabled / relabelled / given an archive slug via taxonomy settings):

| key | taxonomy | default label |
|---|---|---|
| group | `bptm_group` | Group / Groups |
| tag | `bptm_tag` | Tag / Tags |
| language | `bptm_language` | Language |
| location | `bptm_location` | Location |
| gender | `bptm_gender` | Gender |
| specialty | `bptm_specialty` | Specialty |
| extra_one … extra_five | `bptm_extra_one` … `bptm_extra_five` | Extra One … Extra Five |

Post meta (all registered with `register_post_meta`, `show_in_rest` true):

| key | type | meaning |
|---|---|---|
| `_bptm_designation` | string | job title / role |
| `_bptm_company` | string | |
| `_bptm_company_website` | url | |
| `_bptm_land_phone` | string | |
| `_bptm_cell_phone` | string | |
| `_bptm_email` | email | |
| `_bptm_email_cc` / `_bptm_email_bcc` | string | mailto cc/bcc |
| `_bptm_address` | string | |
| `_bptm_ribbon` | string | ribbon text |
| `_bptm_zip_code` | string | |
| `_bptm_vcard` | url | vCard link |
| `_bptm_custom_page` | url | custom URL (link type "custom") |
| `_bptm_featured` | '1' or '' | featured member |
| `_bptm_flip_image` | int | attachment id (flip themes back side) |
| `_bptm_social` | array of `{icon: string, link: string}` | icon = Font Awesome class e.g. `fab fa-linkedin-in`, `fas fa-envelope` |
| `_bptm_skills` | array of `{skill: string, percent: int}` | |

Helper API in `includes/functions.php` (data owns; everyone may call; guard with `function_exists` not needed):

```php
bptm_taxonomies(): array          // key => ['taxonomy'=>'bptm_group','label'=>..,'plural'=>..,'enabled'=>bool,'archive'=>bool,'slug'=>..]
bptm_get_option(string $key, $default = null)        // preferences (option 'bptm_settings'), merged with defaults from Settings::defaults()
bptm_get_tax_option(string $key, $default = null)    // taxonomy settings (option 'bptm_taxonomy_settings')
bptm_translation(string $key): string                // replaceable front-end strings (see Settings translations list)
bptm_get_member(int|WP_Post $post, string $image_size = 'large'): array
// returns: id, name, permalink, content (filtered post content), excerpt, designation, company, company_website,
// land_phone, cell_phone, email, email_cc, email_bcc, address, ribbon, zip_code, vcard, custom_page, featured(bool),
// image_id, image_url, image_alt, flip_image_id, flip_image_url, social(array), skills(array),
// terms => [ key => [ ['id'=>,'name'=>,'slug'=>,'parent'=>], ... ] ] for every enabled taxonomy key
bptm_member_term_names(array $member, string $key, string $sep = ', '): string
bptm_member_term_slugs(array $member, string $key): array
bptm_social_icons(): array     // icon class => label, the full picker list (≥ 450 brand/solid icons)
bptm_placeholder_image_url(): string
```

## Settings contract (owner: tools)

Option `bptm_settings` (Preferences) defaults — `BPTM\Settings::defaults()`:
`member_slug`=team-members, `replace_custom_slug`=false, `archive_page_slug`='', `archive_page_title`='', `single_page_style`='default' (default|style-one|style-two|style-three|style-four|style-five), `single_link_type`='single_page', `next_prev`=false, `breadcrumb`=false, `search_all_fields`=false, `multilingual`=false, `disable_google_fonts`=false, `show_acf_fields`=false, `acf_fields_position`='after_skills', `disable_lazy_load`=false, `lazy_load_class`='skip-lazy', `land_phone_link`=false, `cell_phone_link`=false, `email_link`=false, `custom_css`='', plus translations.

Translations (keys → default English): `filter_designation` Show All Designation, `search_name` Search By Name, `search_company` Search By Company, `search_zip` Search By Zip, `search_tag` Search By Tag, `company` Company, `address` Address, `land_phone` Land Phone, `cell_phone` Cell Phone, `email` Email, `zip_code` Zip Code, `location` Location, `language` Language, `specialty` Specialty, `gender` Gender, `follow_me_on` Follow Me On, `skills` Skills, `read_on` Read On, `more` More, `vcard` Download vCard, `reset_filters` Reset Filters, `prev` Prev, `next` Next, `load_more` Load More, `no_members` No team member found.

Option `bptm_taxonomy_settings`: for each tax key: `enable_{key}_tax`, `{key}_tax_label`, `{key}_tax_plural_label`, `enable_{key}_tax_archive`, `{key}_tax_archive_slug` (default `bptm-{key}` with `_`→`-`).

## Render contract (owner: render)

`src/render.php` (block render callback file) does:
```php
echo \BPTM\Render\Renderer::render( $attributes, get_block_wrapper_attributes() ); // returns full HTML
```
`Renderer::render(array $attributes, string $wrapper_attrs = '', array $runtime = []): string`
- merges defaults from `src/block.json` (read once via `Renderer::defaults()`), sanitizes,
- builds the query (`BPTM\Render\Query`), builds a `BPTM\Render\Context $ctx`,
- outputs: wrapper div `<div {wrapper_attrs} id="bptm-{uid}" class="… bptm-wrap bptm-theme-{theme}" data-bptm="{json config for JS}">`,
  scoped `<style>` (dynamic CSS from style attributes), filters UI, the items container, pagination, modal containers.
- used by: block, `[bp_team]` shortcode, REST endpoint for AJAX pagination/filter, single template partial reuse.

Theme registry: `apply_filters('bptm_themes', [])` — registry-a.php / registry-b.php each `add_filter('bptm_themes', fn($t) => $t + [...])`.
Each theme entry: `id => ['label'=>..,'group'=>'grid|circle|horizontal|flip|table|list|legacy','layout'=>'grid'|'table'|'list','carousel'=>bool,'filter'=>bool,'forced_link'=>null|'popup'|'single_page'|'panel'|'drawer','forced_view'=>null|'filter'|'carousel','visibility'=>[field=>bool defaults],'template'=>'themes/{id}']`.

Theme template contract: `templates/themes/{id}.php` renders **one member item** and is included with `$m` (member array from `bptm_get_member`) and `$ctx` (Context) in scope. Layout `table` themes may also provide `templates/themes/{id}-head.php` (table `<thead>`), included once. Context helpers (render owns, themes call):

```php
$ctx->attr($key, $default=null)          // sanitized attribute value
$ctx->show($field)                        // visibility check for: thumbnail,name,designation,details,social,ribbon,featured_badge,skills,company,address,land_phone,cell_phone,email,location,language,specialty,gender,zip,extra_one..extra_five,acf_fields,vcard,read_more
$ctx->item_attrs($m, array $extra_classes=[]): string   // class="bptm-item …filter classes…" data-* for filters/search/animation/modal; echo raw (already escaped)
$ctx->link_open($m, string $class=''): string  / $ctx->link_close($m): string  // <a> per link type (single/popup/panel/drawer/custom) or '' when not linked
$ctx->image($m, string $class='bptm-img'): string   // <img> with lazy-load + image filter classes; placeholder if none
$ctx->flip_image($m): string
$ctx->name($m, string $tag='h3'): string        // includes link if name linking on
$ctx->designation($m): string
$ctx->details($m): string                        // trimmed to detailsLength or full HTML when allowHtmlDetails, scroll control
$ctx->social($m, string $style=''): string
$ctx->ribbon($m): string
$ctx->featured_badge($m): string
$ctx->skills($m): string
$ctx->meta_details($m, string $variant='list'): string  // company, address, phones, email, location, language, specialty, gender, zip, extras (each respects show())
$ctx->vcard($m): string
$ctx->read_more($m): string
$ctx->acf($m): string
$ctx->terms_text($m, $key): string
$ctx->modal_payload($m): string  // hidden detail markup used by popup/panel/drawer (render prints these in containers)
```

Popup / panel / drawer detail templates: `templates/popups/{style}.php`, `templates/panels/{style}.php`, `templates/drawers/{style}.php` (owner themes-b) — each renders the detail view of one member with `$m`, `$ctx` in scope. Styles: popup `default, style-one … style-six`; panel `default, style-one … style-five`; drawer `default, style-one … style-five`. Render prints them hidden (`<template>` or `hidden` div with `data-bptm-detail="{id}"`) and frontend JS opens them.

CSS class contract (render owns the base; themes use these):
`.bptm-wrap` (root) · `.bptm-items` (items container; grid uses CSS grid with `--bptm-cols-{d|t|mp|m}` vars and `--bptm-gap`) · `.bptm-item` · `.bptm-img-wrap`, `.bptm-img` · `.bptm-name` · `.bptm-designation` · `.bptm-details` · `.bptm-social` (ul) · `.bptm-ribbon` · `.bptm-featured` · `.bptm-skills` · `.bptm-meta` · `.bptm-readmore`.
CSS custom properties set by the dynamic CSS (themes should use them): `--bptm-name-color`, `--bptm-role-color`, `--bptm-desc-color`, `--bptm-desc-link-color`, `--bptm-info-color`, `--bptm-info-icon-color`, `--bptm-info-bg`, `--bptm-item-bg`, `--bptm-item-bg-hover`, `--bptm-name-bg`, `--bptm-tooltip-bg`, `--bptm-hover-icon-bg`, `--bptm-ribbon-bg`, `--bptm-popup-arrow-color`, `--bptm-accent` (default #4527a4), `--bptm-radius`, `--bptm-item-padding`, `--bptm-shadow`.

Frontend JS (`src/view.js`, render owns): `window.BPTM.init(root = document)` initialises every `.bptm-wrap[data-bptm]` inside root exactly once (idempotent; mark with `data-bptm-ready`). Editor calls it after each server-side render. Features: carousel (vanilla, responsive per breakpoint, autoplay, hover pause, loop, speed, timeout, items to scroll, navs/dots + styles), filters (category tabs incl. child cats, All, multi-select dropdowns with ellipsis, designation/location/language/gender/specialty/extra filters, instant search by name/company/zip/tag, reset), pagination (normal links, AJAX numbered, load-more button, infinite scroll) via REST `bptm/v1/render`, popup/panel/drawer open/close (ESC, overlay click, focus trap, next/prev), flip, scroll animation (IntersectionObserver), description scroll height.

Responsive breakpoints: desktop ≥ 1025px, tablet 768–1024, mobile-portrait (landscape phones) 576–767, mobile < 576.

## Block attributes

See `src/block.json` — that file is the single source of truth for attribute names, types and defaults.
PHP reads defaults from it; the editor reads it via metadata.

## Editor contract (owner: editor)

- Inspector tabs: **Layout** (theme picker with visual thumbnails grouped by family, view type grid/carousel/filter, columns per device, gap, link type + popup/panel/drawer style, thumbnail size, image filters, visibility toggles per field), **Query** (number, order, orderby, taxonomy order, include/exclude terms for every taxonomy, hide empty), **Filter** (all filter/search toggles & texts & styles; only when filter view), **Carousel** (when carousel view), **Pagination**, **Style** (colors, typography ×6 with Google font family list, spacing/radius/shadow, carousel & filter colors), **Advanced** (custom class is native).
- Preview: `@wordpress/server-side-render` with `httpMethod="POST"`, then `window.BPTM.init(previewEl)` (use a MutationObserver/effect on render). Clicks on links inside preview must not navigate.
- PHP localizes `window.bptmEditor` (render owns the PHP side, in `includes/render/class-editor-data.php`): `{ themes: [...registry...], thumbnailSizes: [{label,value}], fonts: [..google font family names..], visibilityFields: [{key,label}], taxonomies: [{key,taxonomy,label,enabled}], hasMembers: bool, adminUrls: {addMember, members, settings} }`.
- Theme thumbnails: small inline SVG/CSS schematic previews (no copied GS images).
- Empty state in editor when no members: message + button to add members / import demo data.

## Assets on non-block pages

`src/style.scss` (→ `build/view.css`, block style handle `icb-fold-out-reveal-style`) also contains single/archive CSS.
The template loader (tools) enqueues that handle + the view script handle (`icb-fold-out-reveal-view-script`) on single member,
member archive and taxonomy archive pages, and wherever `[bp_team]` is used. Font Awesome (render, `assets/vendor/fontawesome/`)
is registered by render as style handle `bptm-fontawesome` and must be enqueued wherever members render.

## Dev environment (for agents)

- Site: http://gs-team-member.local (Local by Flywheel, WP 7.1.4, theme Twenty Twenty-Five, nginx). Admin test login in
  `C:\Users\shiha\AppData\Local\Temp\claude\5a73b6152b8cfd68\256b695e-b54d-41ec-884f-7502522333c2\scratchpad\test-login.txt`.
- PHP CLI wrapper (has mysqli, connects to the site DB): `"/c/Users/shiha/AppData/Local/Temp/claude/5a73b6152b8cfd68/256b695e-b54d-41ec-884f-7502522333c2/scratchpad/php.sh"`.
  Lint: `php.sh -l file.php`. Run WP code: write a script that does `define('WP_USE_THEMES',false); $_SERVER['HTTP_HOST']='gs-team-member.local'; require 'C:/Users/shiha/Local Sites/gs-team-member/app/public/wp-load.php';`.
  Put scratch scripts in the scratchpad directory above, never in the plugin.
- Build: `npm run build` in the plugin dir (other areas may be mid-edit; a failure in a file you don't own is not yours to fix — report it).
- Playwright is installed in the plugin's node_modules (chromium + firefox browsers present); Chrome and Edge are installed too.
- No php `wp` CLI. Git is available but do NOT commit.

## Integration notes (resolved contract gaps)

- Filter bar order: `Render\Filters::order()` reads `bptm_filters_order()` (option `bptm_filters_order`, set on Sort Order > Filters) and maps `search_name|search_company|search_zip|search_tag` to the render keys `search|company|zip|tag`.
- Custom term order: term meta `bptm_order` (class-ordering.php). `taxonomyOrderBy` accepts `order`, `menu_order` or `term_order` for it.
- `window.bptmEditor` also carries `hasAcf` (bool) and `singleLinkType` (Preferences default link type).
- The frontend view script (`icb-fold-out-reveal-view-script`) is enqueued on `enqueue_block_assets` in the editor, so previews have `window.BPTM` without injection (Preview.js keeps injection only as a fallback).
- Editor previews (REST block-renderer requests) salt the instance uid so duplicated blocks never share a DOM id.
- Box style attributes: `itemBg`, `itemBgHover`, `itemPadding`, `itemBorderRadius`, `itemShadow` are delivered only as CSS variables (`--bptm-item-bg`, `--bptm-item-padding`, `--bptm-radius`, `--bptm-shadow`) that each theme applies where its card is drawn; the border (`itemBorderWidth/Color`) is drawn on the card element (`.bptm-item > .bptm-ta-card|.bptm-tb-card`); table rows get the background on their cells.
- Grid columns: `.bptm-items` shows at most `--bptm-cols` columns but never makes cards narrower than `--bptm-min-col` (default 150px), so blocks in narrow content columns drop to fewer columns instead of squashing cards.
- Touch devices: items with `.bptm-tap-reveal` (grid/circle themes) and flip themes reveal their hover state on first tap (`is-flipped`), second tap follows links.

## Parity additions (gap stage)

- **Quick rendering without a Showcase** (`includes/class-quick.php`): `[bp_team theme="" number="" group="" exclude_group="" columns="" columns_tablet="" columns_mobile="" orderby="" order="" link="" view="grid|carousel|filter" popup_style="" panel_style="" drawer_style="" gap="" pagination="normal|ajax|button|scroll" per_page="" class=""]`; with `id` these override the showcase. Filter `bptm_quick_attributes`.
- **Sidebar list**: `[bp_team_sidebar total_mem="" group_mem=""]` (also accepts every quick attribute) and themes `sidebar-1..3` (registry `includes/render/themes/registry-c.php`, template `templates/themes/sidebar.php`, CSS `src/styles/themes/_sidebar.scss`, editor family "Sidebar / Widget").
- **Classic widget** (`includes/class-widget.php`): title, total members, group, theme, columns, order by, order, member link — or a saved Showcase (old instances with only `showcase` keep working).
- **Page-builder modules** (`includes/integrations/builders.php` + `builders/`): WPBakery (`vc_map` of `[bp_team]`), Divi (`et_pb_bptm_team`, visual builder via server render), Beaver Builder, Oxygen (`OxyEl`), tagDiv Composer (`td_bptm_team`). Each loads only when its builder API exists; `bptm_integration_{wpbakery|divi|beaver|oxygen|tagdiv}` filters turn them off. `Quick::is_builder_preview()` adds an inline `BPTM.init` for markup injected by builder canvases.
- **Developer hooks** (actions receive `($member|null, $ctx)`, callbacks echo): `bptm_before_team_members`, `bptm_after_team_members`, `bptm_before_member_content`, `bptm_after_member_content` (inside the item root / first-last cell for tables), `bptm_after_member_thumbnail`, `bptm_after_member_thumbnail_popup`, `bptm_after_member_name`, `bptm_after_member_designation`, `bptm_after_member_details`, `bptm_after_member_social_links`, `bptm_after_member_skills`, `bptm_after_member_ribbon`, `bptm_after_member_meta_details`, `bptm_before_cats_filters`, `bptm_before_filters`, `bptm_before_{search|company_search|zip_search|tag_search|designation|location|language|gender|specialty|extra_*}_filter`, `bptm_before_pagination`, `bptm_after_pagination`, `bptm_before_navigation`, `bptm_after_navigation`, `bptm_after_no_team_found`. Filters: `bptm_member_thumbnail_html`, `bptm_member_thumbnail_size`, `bptm_member_thumbnail_classes` (+ `bptm_member_secondary_*` for flip images), `bptm_member_name_html`, `bptm_member_social_links`, `bptm_member_skills`, `bptm_member_email_link` (only when email linking is on), `bptm_meta_rows`, `bptm_member`.
- **Template overrides**: `Renderer::locate()` and `Template_Loader::locate()` both use `bptm_templates_folder` (default `bp-team-member`) and pass the relative file (with `.php`) to `bptm_locate_template`.
- **Drawer shell** carries `bptm-drawer--{drawerStyle}` so a drawer style can restyle its shell (style-one: white elevated card).
- **Translations**: `BPTM\I18n` loads the `bp-team-member` text domain from `languages/` and points the editor script's JSON translations there. `languages/bp-team-member.pot` covers PHP, JS (`build/index.js` reference for `wp i18n make-json`) and block.json strings; `npm run i18n-pot` regenerates it with WP-CLI.
