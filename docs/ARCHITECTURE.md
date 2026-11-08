# BP Team Member — Architecture & Contracts

Reference plugin (read-only, GPL-2.0+): `E:\gs-team-members.2.8.4\gs-team-members` ("GS").
Target plugin (this repo): `bp-team-member` ("BP").

Goal: BP reaches feature parity with GS (free + every feature GS markets as PRO), **all free**.
No Freemius, no licensing, no "Pro" badges, no upsell notices, no locked options.
Reimplement in our own code. You may study GS markup/CSS/behaviour for reference, but do not copy
GS images, logos, branding, Freemius code, or promotional pages. Do not use the strings "GS" / "gsteam" in BP.

## Product shape (v3: browser rendering)

BP = **the block is the only data source and the only renderer input**: team members are stored in the block's
`members` attribute and edited in the block inspector. The block is rendered **in the browser, with React, from the
block attributes** — in the editor (instant preview, no server round-trip) and on the front end (the same component).
No team-member markup is produced on the server: PHP only prints a mount wrapper carrying the attributes.

There is no member post type, no taxonomies, no single/archive member pages (see "v2 data model").
For page builders / classic editor / widgets there is a "Showcase" CPT (`bptm_showcase`, admin menu "BP Team Member")
whose content is one BP block; `[bp_team id="123"]` renders it.

## Hard rules

- Prefix everything: PHP namespace `BPTM`, functions `bptm_`, constants `BPTM_`, CSS classes `bptm-`, JS global `window.BPTM` / `window.bptmData`, option names `bptm_*`, hooks `bptm_*`, text domain `bp-team-member`.
- Main plugin file stays `test-purpose.php` (renaming would deactivate the plugin). It only requires `includes/bootstrap.php` and registers the block.
- Block name stays `icb/fold-out-reveal` (backward compatibility with already-saved blocks). Legacy attributes `alignment`, `purposeType`, `colors` stay declared. `alignment` = content text alignment. Attributes may only be ADDED, never renamed/removed.
- PHP ≥ 7.4, WordPress ≥ 6.3. Escape all PHP output, sanitize all input, nonces + `current_user_can()` on every admin action.
- **Attributes are untrusted input.** The React renderer sanitizes everything itself (see "Security").
- Frontend React comes from WordPress (`wp-element`); no other runtime libraries (no jQuery, Owl, Isotope …). Admin-only JS may use jQuery + `wp.media`.
- Admin assets are plain files under `assets/admin/`. Block code lives in `src/` and is built by `npm run build` (wp-scripts; `--webpack-copy-php` copies `src/render.php`).
- `../bpl-tools` is a shared package: never edit it.
- The editing tool chain used by agents turns `\uXXXX` escapes into literal characters: do not write `\u` escapes in JS sources (use `\s`, `\x..`, or `String.fromCharCode`).

## File map

| Area | Files |
|---|---|
| bootstrap | `test-purpose.php`, `includes/bootstrap.php` (loads `includes/functions.php`, then `includes/*.php`, `includes/integrations/*.php`) |
| block glue (PHP) | `src/render.php` → `includes/class-block.php` (`BPTM\Block`): mount wrapper, data bridge, assets, custom CSS |
| shared renderer (JS) | `src/Components/Common/Team/*` — used by the editor preview and the front end |
| front end entry | `src/view.js` (mounts `<TeamMembers>` with `createRoot`), `src/style.scss` + `src/styles/**` (all CSS) |
| editor | `src/index.js`, `src/Components/Backend/**`, `src/utils/**`, `src/editor.scss`, `src/block.json` |
| data helpers | `includes/functions.php` (options, translations, sanitizers), `includes/data/social-icons.php`, `includes/data/google-fonts.php` |
| tools | `includes/class-settings.php`, `class-showcase.php`, `class-quick.php`, `class-widget.php`, `class-i18n.php`, `includes/integrations/*`, `assets/admin/*`, `languages/*` |

## Constants (includes/bootstrap.php)

`BPTM_VERSION`, `BPTM_FILE` (main file path), `BPTM_DIR` (trailing slash), `BPTM_URL` (trailing slash). Legacy `DFORC_*` constants stay defined.

## Server side (PHP)

`src/render.php` → `\BPTM\Block::render( $attributes, get_block_wrapper_attributes() )` returns:

```html
<div class="wp-block-icb-fold-out-reveal alignwide …" id="bptm-{uid}|{anchor}" data-bptm-uid="{uid}"
     data-attributes="{JSON of the attributes that differ from block.json defaults}">
  <noscript><ul class="bptm-noscript"><li><strong>Name</strong> – Designation</li>…</ul></noscript>
</div>
```

- `''` when the block has no members (the editor shows its own empty state).
- `uid` = first 8 hex chars of md5( attributes JSON ), de-duplicated per request (`-2`, `-3` …). It is stable across
  page loads, so the normal-pagination query var `bptm-page-{uid}` deep-links.
- JSON is encoded with `JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT` and then `esc_attr()`'d.
- `Block::render()` calls `Block::enqueue_frontend()`: block style, Font Awesome (`bptm-fontawesome`, a dependency of the
  block style), the view script (`icb-fold-out-reveal-view-script`) with the data bridge, and the preference custom CSS.
  This also makes shortcodes, showcases, the widget and page-builder modules work (they all end in `render_block()` /
  `Block::render()`). Filter `bptm_render_html( $html, $attributes, $uid )`.

Data bridge (`wp_add_inline_script( …, 'before' )` on the view script and on the editor script):

```js
window.bptmData = {
  pluginUrl,                      // BPTM_URL — relative member image URLs resolve against it
  translations: { key: string },  // all bptm_translation_defaults() keys, multilingual mode resolved by bptm_translation()
  prefs: { land_phone_link, cell_phone_link, email_link, disable_google_fonts, disable_lazy_load, lazy_load_class, search_all_fields },
  // editor only:
  fonts: [ 'Arial', …, Google families ], thumbnailSizes: [ { value, label } ], adminUrls: { settings, translations, showcases },
}
```

Filter: `bptm_script_data( $data, $is_editor )`. The JS falls back to `window.bptmEditor` (older builds) and to built-in
English strings / a plugin URL derived from the script URL when the bridge is missing.

Other PHP pieces: `Block::defaults()` / `Block::schema()` (from `build/block.json`), `Block::theme_labels()` (id => label
for the widget / builder selects; filter `bptm_theme_labels`), `Block::fonts()` (filter `bptm_fonts`),
`Block::enqueue_custom_css()` (once per page; `Settings::enqueue_custom_css()` on `wp_enqueue_scripts` cooperates via the
`bptm_custom_css_printed` action), `I18n` registers JSON script translations for **both** the editor and the view script.

There is no REST route any more (`bptm/v1/render` was removed) and no PHP templates (`templates/` was removed).

## Shared renderer (`src/Components/Common/Team/`)

`<TeamMembers attributes uid domId isEditor host wrapperClass />` renders exactly the markup the former PHP renderer
printed (same elements and class names, so `build/view.css` applies unchanged):

| Module | Content |
|---|---|
| `registry.js` | Theme registry (64 themes: id, label, group, layout grid/table/list, carousel, filter, forced_link, forced_view, grouped, pagination, card visibility defaults), visibility keys/groups/devices, detail styles, carousel nav icons. Single source for editor + front end. |
| `model.js` | Attribute sanitizing (defaults from `block.json`, type coercion, enums, clamps), member objects (`memberFromItem`, port of `bptm_member_from_item`), images, view / link type / pagination mode, visibility resolution, query (includes/excludes by term names, order default/title/rand + legacy mapping, featured first, number cap), filter data, client and "ajax" filter matching. |
| `context.js` | Port of the former PHP Context: `show()`, `vis_classes()`, link props, item props (filter data attributes, schema.org), image, name, designation, details, social, ribbon, featured badge, skills, meta rows / meta details, vCard, read more. |
| `themes.js` | Item templates of all themes (registry A grid/circle/horizontal/flip, registry B tables/lists/legacy grids, sidebar), table head + border style. |
| `details.js` | 19 detail templates (popup default + style-one…six, panel default + one…five, drawer default + one…five) and the detail payload wrapper. |
| `css.js` | Scoped dynamic CSS (columns, gaps, all colour variables, box, image radius, alignment, description height, 6 typographies with responsive sizes and hover colours), Google Fonts URL. |
| `Filters.js`, `Pagination.js` | Filter UI (category tabs, searches, dropdowns, multi-select + ellipsis, reset, status) and pagination UI. |
| `carousel.js` | Carousel engine + `useCarousel()`; React renders slides and clones, the engine translates the track, builds dots, autoplay / hover & focus pause / loop / rewind / swipe / keys / resize. |
| `modal.js` | `useModal()`, `usePortal()`, `ModalShell` (popup / panel left·right·center / drawer). |
| `effects.js` | Scroll-in animation (only items that never animated), tap-to-reveal / flip on touch, equal details height, scrollable descriptions, Google font `<link>` (deduplicated, skipped with `disable_google_fonts`). |
| `sanitize.js`, `bridge.js`, `socialIcons.json` | Sanitizers, bridge accessors, icon labels (generated from `includes/data/social-icons.php`). |

Behaviour (all client side): filters ("normal" = hide non-matching items; "ajax" = filter the list before pagination,
same semantics as the former REST filter), pagination (normal = client page state reflected in `?bptm-page-{uid}=n` via
`history.pushState` + `popstate`, deep links work; ajax = page state only; load-more button; infinite scroll),
carousel, popup / panel / drawer (ESC, overlay, same-card drawer toggle, prev / next / arrow keys, focus trap, focus
restore, scroll lock), flip / tap reveal, equal heights. Every listener, portal, focus trap, font link and style uses the
root element's `ownerDocument` / `defaultView`, so it all works inside the editor canvas iframe.

Custom DOM events on the block root: `bptm:open` ({ id, type }), `bptm:close`.

`src/view.js`: `window.BPTM.init( root = document )` mounts every not-yet-mounted
`.wp-block-icb-fold-out-reveal[data-attributes]` inside `root` (`createRoot( wrapper )`; React then owns the wrapper's
children and keeps its classes = server wrapper classes + `bptm-*` classes). Page builders call it after injecting
markup (`Quick::builder_init_script()`, Elementor widget). `window.BPTM.get( el )` → `{ attributes }`.

## Security

Attributes are untrusted. React escapes all text. Details with `allowHtmlDetails` are parsed with `DOMParser` (inert
document) and rebuilt from a whitelist (`p, br, strong, b, em, i, u, a[href|target|rel], ul, ol, li, span, h3–h6,
blockquote`; script/style/iframe/… dropped with their content, other tags unwrapped, `target=_blank` gets `rel=noopener`)
into React elements — `dangerouslySetInnerHTML` is never used. URLs: `esc_url_raw` port, only http(s) / mailto / tel /
relative for links (social links also skype, callto, sms, viber, whatsapp); `javascript:`, `data:`, `vbscript:` … give
no href. Image URLs: http(s) or plugin-relative (no `..`). Social icon classes must match the Font Awesome whitelist
(`fa|fab|fas|far|fa-brands|fa-solid|fa-regular` + `fa-{name}`), otherwise the link is dropped. Numbers are clamped.
Dynamic CSS only accepts validated colours, lengths, keywords and `[A-Za-z0-9 _-]` font names; `<` is stripped.

## Editor

- Inspector tabs: General (Team Members via bpl-tools ItemsPanel, theme picker, view & columns, linking, image, visibility),
  Query, Filter, Carousel / Pagination, Style.
- `src/Components/Backend/Preview.js` renders `<TeamMembers isEditor>` (ids derived from the clientId); every attribute
  change re-renders instantly with React reconciliation (no server request, no remount, no flicker). Links and form
  submits inside the preview (and in portalled popups) never navigate; after 1.5 s the preview gets `is-settled` so
  re-mounted cards never replay the entrance animation.
- `src/utils/editorData.js` reads themes / visibility fields / social icons from the shared modules and fonts, image
  sizes, admin URLs, translations, plugin URL from `window.bptmData` (fallback `window.bptmEditor`).
- Image control: selecting a media item stores `{ id, url, alt, sizes: { thumbnail: { url }, medium: { url }, large: { url }, full: { url }, … } }`
  so the front end honours `thumbnailSize` without the server (fallback: `url`).

## Responsive breakpoints

Desktop ≥ 1025px, tablet 768–1024, mobile-portrait (landscape phones) 576–767, mobile < 576.

## Block attributes

See `src/block.json` — the single source of truth for attribute names, types and defaults (the JS renderer imports it).

## Settings (Preferences / Translations)

Admin menu "BP Team Member": Showcases, Add New Showcase, Preferences (`page=bptm-preferences`), Translations
(`page=bptm-translations`). Option `bptm_settings`: `search_all_fields`, `multilingual`, `disable_google_fonts`,
`disable_lazy_load`, `lazy_load_class` (default `skip-lazy`), `land_phone_link`, `cell_phone_link`, `email_link`,
`custom_css`, plus translations (keys → default English): `filter_designation` … `no_members` (see `bptm_translation_defaults()`).
All of them reach the renderer through the data bridge.

## Shortcodes, widget, builders

- `[bp_team id="123"]` (showcase, optional attribute overrides), `[bp_team …attrs]` (quick list of the block's default
  sample members: `theme number group exclude_group columns columns_tablet columns_mobile orderby order link view
  popup_style panel_style drawer_style gap pagination per_page class`), `[bp_team_sidebar total_mem group_mem …]`
  (themes `sidebar-1..3`). Filter `bptm_quick_attributes`.
- Classic widget (`includes/class-widget.php`): title + saved Showcase (legacy quick-list instances keep rendering).
- Page-builder modules (`includes/integrations/*`): Elementor, WPBakery, Divi, Beaver Builder, Oxygen, tagDiv Composer;
  `bptm_integration_{builder}` filters turn them off; builder canvases call `window.BPTM.init()` for injected markup.

## v2 data model: members live in the block

The block is the ONLY data source. The former `bptm_member` post type, taxonomies, meta boxes, ordering, importer,
demo data, single/archive templates and ACF fields were removed (DB rows left untouched).

Attribute `members` (array, default = 10 sample members in src/block.json). Item shape:
```
{ id: string (stable unique, [A-Za-z0-9_-]; new/duplicated items get a fresh id),
  name, designation, details (plain text; blank lines = paragraphs; HTML only when allowHtmlDetails),
  image: {id:int, url:string, alt:string, sizes?: {size: {url}}}, flipImage: {id,url,alt,sizes?},
  company, companyWebsite, landPhone, cellPhone, email, emailCc, emailBcc, address, ribbon, zipCode, vcard (url), customUrl,
  featured: bool, social: [{icon:'fab fa-…', link}], skills: [{skill, percent:0-100}],
  group, tags, language, location, gender, specialty, extraOne … extraFive   // comma-separated text values
}
```
- Image URLs that are not absolute (no scheme, no leading `/`) are relative to the plugin root (`bptmData.pluginUrl`).
  With `image.id` > 0 the renderer uses `image.sizes[thumbnailSize].url` when present, else `url`; empty → placeholder.
- Query: `orderBy` 'default' (array order) | 'title' | 'rand' (seeded per page view); legacy 'name' → 'title',
  'date'/'ID'/'menu_order'/'modified' → 'default'. `order` DESC reverses. `numberOfMembers`, `enableFeaturing` (featured
  first), include*/exclude* arrays hold term NAMES (case-insensitive; legacy numeric ids are ignored).
- Filters: tabs / dropdowns are built from the distinct values of the members' text fields (group = category tabs;
  `taxonomyOrderBy` 'name' | 'default' (first-seen order), `taxonomyOrder`).
- Link types: `default` → popup; `single_page` (legacy) → custom (member customUrl; no link when empty); forced single
  themes → popup; drawer in carousels / tables → popup.

## Removed with the move to browser rendering (v3)

`includes/render/*` (Renderer, Context, Query, Filters, Style, Fonts, Assets, Rest, Editor_Data, Visibility, Themes and
the theme registries), `templates/**`, `src/frontend/*` (vanilla behaviours), the REST route `bptm/v1/render`, the
`window.bptmEditor` localization (replaced by `window.bptmData`). The former PHP render hooks (`bptm_before_team_members`,
`bptm_after_member_*`, `bptm_member_*_html`, `bptm_meta_rows`, `bptm_query_members`, `bptm_themes`, template overrides
via `bptm_locate_template` …) no longer exist, because no member markup is produced in PHP.

## Dev environment (for agents)

- Site: http://gs-team-member.local (Local, WP 7.1.x, Twenty Twenty-Five, nginx).
- PHP CLI: `php.exe` from Local's lightning-services (`-d extension=mysqli -d mysqli.default_port=10083 -d mysqli.default_host=127.0.0.1`);
  WP bootstrap in scripts: `define('WP_USE_THEMES',false); $_SERVER['HTTP_HOST']='gs-team-member.local'; require '…/wp-load.php';`.
  Put scratch scripts in the session scratch folder, never in the plugin.
- Build: `npm run build` in the plugin dir. Playwright is in the plugin's node_modules (Chrome / Edge channels, Firefox).
- No `wp` CLI. Git is available but do NOT commit.
