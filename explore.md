# BPL Tools — Deep Technical Exploration & Architecture Reference Manual

> **Package:** `bpl-tools`  
> **Version:** `1.0.1`  
> **License:** `GPL-2.0-or-later`  
> **Author:** bPlugins LLC  
> **Target Environment:** WordPress 6.5+, PHP 7.1+, Node.js 18.x+, `@wordpress/scripts` 30.x+, React 18+

---

## Table of Contents

1. [Executive Summary & Architecture Overview](#1-executive-summary--architecture-overview)
2. [Complete Directory & File Structure](#2-complete-directory--file-structure)
3. [Gutenberg Editor Components (`Components/`)](#3-gutenberg-editor-components-components)
   - [3.1 Layout & Responsive Controls](#31-layout--responsive-controls)
   - [3.2 Color & Background Controls](#32-color--background-controls)
   - [3.3 Typography & Text Controls](#33-typography--text-controls)
   - [3.4 Media & Content Controls](#34-media--content-controls)
   - [3.5 Icon & Shape Controls](#35-icon--shape-controls)
   - [3.6 Selection & Input Controls](#36-selection--input-controls)
   - [3.7 UI Display, Badges & Feedback Controls](#37-ui-display-badges--feedback-controls)
   - [3.8 Advanced Visual & Effect Controls](#38-advanced-visual--effect-controls)
   - [3.9 Deprecated Legacy Controls](#39-deprecated-legacy-controls)
4. [Advanced Block Controls System (`Advanced/`)](#4-advanced-block-controls-system-advanced)
   - [4.1 Architecture & Schema](#41-architecture--schema)
   - [4.2 Section Components](#42-section-components)
   - [4.3 Dynamic CSS & Animation Engine (`generateCSS.js` & `style.js`)](#43-dynamic-css--animation-engine-generatecssjs--stylejs)
5. [Pro Controls & Upsell Ecosystem (`ProControls/`)](#5-pro-controls--upsell-ecosystem-procontrols)
6. [WordPress Admin Dashboard Framework (`Admin/`)](#6-wordpress-admin-dashboard-framework-admin)
   - [6.1 Dashboard Layout & Header](#61-dashboard-layout--header)
   - [6.2 Welcome & Onboarding Experience](#62-welcome--onboarding-experience)
   - [6.3 Feature & Block Management](#63-feature--block-management)
   - [6.4 Freemius Licensing & Activation](#64-freemius-licensing--activation)
   - [6.5 Dynamic Pricing & Feature Comparison](#65-dynamic-pricing--feature-comparison)
   - [6.6 Plugin Directory Cross-Promotion (`OurPlugins`)](#66-plugin-directory-cross-promotion-ourplugins)
   - [6.7 Settings & Data Cleanup Management](#67-settings--data-cleanup-management)
7. [Alternative Dashboard Architectures (`ModernAdmin/` & `LagacyAdmin/`)](#7-alternative-dashboard-architectures-modernadmin--lagacyadmin)
8. [Template Library System (`TemplateLibrary/`)](#8-template-library-system-templatelibrary)
9. [React Hooks Inventory (`hooks/`)](#9-react-hooks-inventory-hooks)
10. [Utility Library & Pure Helpers (`utils/`)](#10-utility-library--pure-helpers-utils)
    - [10.1 Data Sanitization & Security (`common.js`)](#101-data-sanitization--security-commonjs)
    - [10.2 State & Object Mutation Helpers (`functions.js`)](#102-state--object-mutation-helpers-functionsjs)
    - [10.3 CSS Generation & Formatting (`getCSS.js`)](#103-css-generation--formatting-getcssjs)
    - [10.4 Preset Data & Breakpoints (`data.js` & `options.js`)](#104-preset-data--breakpoints-datajs--optionsjs)
    - [10.5 Iconography (`icons.js`)](#105-iconography-iconsjs)
11. [Build Tooling & Internationalization (`i18n/`)](#11-build-tooling--internationalization-i18n)
12. [Cross-Component Dependencies & Technical Rules](#12-cross-component-dependencies--technical-rules)

---

## 1. Executive Summary & Architecture Overview

`bpl-tools` is a shared internal JavaScript/React/SCSS library powering the Gutenberg block plugins published by **bPlugins LLC** (e.g., *Advanced Post Block*, *B Blocks*, *Content Slider*, *Countdown Time*, *Html5 Audio/Video Player*, *PDF Poster*, *3D Viewer*).

### Nature of the Library
- **Not a standalone WordPress plugin:** It contains no main PHP plugin header. It is designed to be co-located inside `wp-content/plugins/bpl-tools` and consumed via **relative file-system imports** (`../../../../bpl-tools/...`) by sibling plugin repositories.
- **Pure Client-Side Toolkit:** Contains React 18 components, custom hooks, SCSS styling, and pure utility functions that integrate directly with `@wordpress/components`, `@wordpress/block-editor`, `@wordpress/data`, `@wordpress/core-data`, and Freemius.
- **Three Core Pillars:**
  1. **Gutenberg Block Controls (`Components/`, `Advanced/`, `ProControls/`):** Inspector controls for styling blocks with responsive device switching (`desktop`, `tablet`, `mobile`), CSS generation, and premium feature gating.
  2. **Admin Dashboard Framework (`Admin/`, `ModernAdmin/`, `LagacyAdmin/`):** Complete single-page application (SPA) dashboards built with `react-router-dom` (HashRouter), providing activation, feature toggling, demos, pricing, settings, and guided onboarding.
  3. **Cloud Template Library (`TemplateLibrary/`):** Modal interface allowing users to preview and import pre-made Gutenberg patterns and page templates directly from the bPlugins cloud repository into the active block editor canvas.

---

## 2. Complete Directory & File Structure

```
bpl-tools/
├── Admin/                     # Modern standard WordPress Admin Dashboard SPA
│   ├── Activation/            # License activation & deactivation UI
│   ├── Blocks/                # Block toggle manager (Activate/Deactivate All)
│   ├── Demos/                 # Live demo iframe/image preview gallery
│   ├── FeatureCompare/        # Free vs Pro feature breakdown table
│   ├── FSCheckoutButton/      # Freemius popup checkout launcher
│   ├── FSCheckoutForm/        # Freemius embedded checkout iframe
│   ├── Header/                # Dashboard top header with brand and navigation
│   ├── MultiPlanPricing/      # Multi-tier pricing table with license switcher
│   ├── Onboarding/            # Full-screen guided setup wizard
│   │   └── fields/            # Wizard field components (choice, color, toggle, help)
│   ├── OurPlugins/            # Live WordPress.org plugin directory browser
│   ├── Overview/              # Welcome overview with banner, quick links, and video
│   ├── Pricing/               # Single-plan multi-license dynamic pricing table
│   ├── Settings/              # Danger Zone data wipe on uninstall toggle
│   ├── Welcome/               # Modular composite Welcome tab (Overview, GettingStarted, Info, Changelog, ProAds)
│   ├── lib/fs.js              # Freemius Checkout JavaScript SDK loader
│   ├── utils/                 # Dashboard icons and video helpers
│   ├── index.js               # Entry point exporting Admin components
│   └── style.scss             # Master admin dashboard stylesheet
├── Advanced/                  # Block Inspector "Advanced" tab system
│   ├── Animation.js           # AOS animation settings
│   ├── Background.js          # Normal & hover background and overlay
│   ├── BorderShadow.js        # Border, border radius, and box shadow
│   ├── CustomCSS.js           # Monokai Ace code editor for custom CSS
│   ├── Responsive.js          # Breakpoint visibility switches (Hide on Desktop/Tablet/Mobile)
│   ├── Transform.js           # 2D/3D rotate, offset, scale, skew, flip
│   ├── Visibility.js          # Z-index per device and overflow
│   ├── generateCSS.js         # Comprehensive CSS compiler from state to stylesheet
│   ├── style.js               # Frontend bootstrap script reading data-bblocks-advanced
│   ├── index.js               # Composite Advanced Inspector panel
│   └── readme.md              # Advanced attribute JSON schema
├── Components/                # Gutenberg Block Inspector & Canvas Components
│   ├── AdvBackground/         # Responsive color, gradient, image, and video background
│   ├── AdvFloating/           # Keyframe floating animations (translate, rotate, scale)
│   ├── AdvMotionEffects/      # Scroll timelines, mouse tracking, 3D tilt, and sticky positioning
│   ├── AdvPosition/           # Absolute/Fixed/Relative offset coordinates per device
│   ├── AdvTransform/          # Transform popup controls per device
│   ├── Background/            # Standard background control (solid, gradient, image)
│   ├── Badge/                 # Status tag badge (NEW, PRO, BETA)
│   ├── BButtonGroup/          # Sliding pill button group selector
│   ├── BlockContentEditor/    # Embedded nested Gutenberg canvas editor & modal
│   ├── BoxControl/            # Linked/unlinked 4-side dimension control
│   ├── BplBlockPreview/       # Block variations preview with live canvas replacement
│   ├── BtnGroup/              # WordPress ButtonGroup wrapper with icon/text options
│   ├── Button/                # Generic dual-nature button/anchor element
│   ├── ColorControl/          # RGBA & Hex popup color picker with theme palette
│   ├── ColorsControl/         # Dual color + background picker
│   ├── CustomCodeEditor/      # AceEditor wrapper for CSS/HTML code
│   ├── CustomPopover/         # Flyout popover with automatic reset button
│   ├── Deprecated/            # Legacy components preserved for backwards compatibility
│   │   ├── BDevice/           # Legacy device switcher
│   │   ├── BorderControl/     # Legacy border options
│   │   ├── ImageControl/      # Legacy image selector controls
│   │   ├── ShadowControl/     # Legacy shadow inputs
│   │   └── SpaceControl/      # Legacy margin/padding inputs
│   ├── Device/                # WordPress Core device switcher (Desktop, Tablet, Mobile)
│   ├── Dimension/             # Responsive width, height, padding, and margin panel
│   ├── DynamicTag/            # Polymorphic HTML tag renderer
│   ├── Gradient/              # Multi-stop linear and radial gradient builder
│   ├── HelpPanel/             # Standard sidebar documentation and support links
│   ├── HelpTooltip/           # Help icon with tooltip popup
│   ├── IconControl/           # Searchable FontAwesome icon selector with size and color
│   ├── IconLibrary/           # Async-loaded SVG icon browser (3,000+ icons)
│   ├── ItemsPanel/            # Repeater list manager with duplicate/remove/sort
│   ├── Label/                 # Standard form label component
│   ├── Loading/               # Animated spinner with status text
│   ├── Mask/                  # CSS image and shape clipping mask
│   ├── MediaControl/          # Inline, detail, placeholder, and area media uploaders
│   ├── MultiSelectControl/    # Tag-based multi-selection pill control
│   ├── Notice/                # Status alert box (info, success, warning, danger, premium)
│   ├── OverlayControl/        # CSS backdrop and blend-mode overlay
│   ├── PanelSelectControl/    # Collapsible token item selector
│   ├── SelectPureControl/     # Vanilla select-pure dropdown wrapper
│   ├── SelectTokenField/      # Tokenized multiselect and autocomplete input
│   ├── SeparatorControl/      # Horizontal divider line style control
│   ├── ShadowControl/         # Multi-shadow builder with inset and blur
│   ├── SolidBackground/       # Dual solid/gradient quick picker
│   ├── SortableControl/       # Drag-and-drop sortable list powered by @dnd-kit
│   ├── TinyEditor/            # WordPress wp.editor / TinyMCE WYSIWYG instance
│   ├── Typography/            # Google Fonts search, font-weight, size, and style
│   ├── Utility/               # Promotional cross-sell links
│   ├── index.js               # Main components export index
│   └── style.scss             # Shared component stylesheets
├── ModernAdmin/               # Transitional modern admin dashboard
├── LagacyAdmin/               # Deprecated legacy dashboard preserved for old releases
├── ProControls/               # Premium gated controls & upgrade triggers
│   ├── AboutProModal/         # Classic Pro feature modal
│   ├── AdvertiseCard/         # Sidebar pro conversion banner
│   ├── BControlPro/           # HOC wrapper adding Pro badge and intercepting clicks
│   ├── BtnGroupPro/           # Button group with individual gated pro options
│   ├── FrontShortCode/        # Copy-to-clipboard shortcode bar
│   ├── PremiumPanel/          # Premium panel body with badge & CTA
│   ├── ProAds/                # Dynamic rotating banner ads
│   ├── ProModal/              # High-converting modern Pro feature modal
│   ├── RadioControlPro/       # RadioControl with pro option locks
│   ├── SelectControlPro/      # SelectControl with pro option tags
│   ├── index.js               # ProControls exports
│   └── style.scss             # ProControls styles
├── TemplateLibrary/           # Cloud template & pattern importer modal
│   ├── Components/            # Modal, Portal, Sidebar, and Template Grid
│   ├── hooks/                 # Hooks for categories, templates, favorites, counts
│   ├── index.js               # Main TemplateLibrary button and modal
│   └── style.scss             # Template library stylesheet
├── hooks/                     # Standalone React hooks
│   ├── useAnimation.js        # AOS animation trigger hook
│   ├── useDeviceWidth.js      # Window viewport breakpoint detector
│   ├── useIframeAssetSync.js  # Editor canvas stylesheet synchronization
│   ├── useOutsideDetect.js    # Click-outside detection hook
│   ├── usePremium.js          # License status query via WP AJAX
│   ├── usePremiumInEditor.js  # Editor-scoped license validator
│   ├── useRenderedBlocks.js   # Server-side block rendering cache via REST API
│   ├── useWPAjax.js           # Generic wp.ajax wrapper with state management
│   ├── useWPOptionQuery.js    # WP REST API Settings model reader
│   └── index.js               # Hooks export index
├── utils/                     # Utility scripts and shared data
│   ├── common.js              # Sanitizers (SVG, HTML, URL, Input) & existence checkers
│   ├── data.js                # Breakpoints, theme color palettes, and default gradient
│   ├── functions.js           # Immutability helpers (updateData), debounce, MimeTypeChecker
│   ├── getCSS.js              # High-performance CSS generators from attribute objects
│   ├── icons.js               # Comprehensive SVG icon collection
│   └── options.js             # Select options, unit presets, and gradient presets
├── i18n/                      # Internationalization build tools
│   ├── babel-plugin-text-domain.js # Babel plugin to inject plugin text-domains
│   ├── normalize-js-pot.js    # POT generator mapping bpl-tools strings to bundles
│   └── readme.md              # i18n build workflow documentation
├── docs/                      # HTML implementation and migration guides
├── package.json               # Package configuration and dependencies
└── webpack.config.js          # Webpack and ESLint configuration
```

---

## 3. Gutenberg Editor Components (`Components/`)

### 3.1 Layout & Responsive Controls

#### `Device`
- **Location:** `Components/Device/Device.js`
- **Purpose:** Synchronizes and switches the active device preview mode between Desktop, Tablet, and Mobile across the WordPress block editor.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `className` | `string` | `''` | Extra CSS class names. |
  | `style` | `object` | `{}` | Inline CSS styling. |
  | `position` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout orientation. `'horizontal'` shows all 3 devices in a row; `'vertical'` shows the active device with a dropdown menu. |
  | `device` | `string` | *(from store)* | Active device override (`desktop`, `tablet`, `mobile`). |
  | `setDevice` | `function` | *(from dispatch)* | Callback to update device type. |
  | `onChange` | `function` | `() => {}` | Optional change callback receiving `targetDevice.name`. |
- **Internal Behavior:** Subscribes to `core/editor` (or `core/edit-post`) via `withSelect` to retrieve `getDeviceType()`. Uses `withDispatch` to invoke `setDeviceType()` on the core editor store. When in vertical mode, listens for outside clicks and `Escape` key events across both the main window document and the `iframe[name="editor-canvas"]` document.

#### `Dimension`
- **Location:** `Components/Dimension/Dimension.js`
- **Purpose:** Comprehensive Inspector control for responsive sizing (width, minWidth, maxWidth, height, minHeight, maxHeight) and spacing (padding, margin).
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `dimension` | `object` | `{}` | Dimension state object containing `{ padding, margin, width, height }`. |
  | `onChange` | `function` | *(required)* | Callback receiving updated dimension object. |
  | `title` | `string` | `__('Dimension')` | Title of the wrapping `PanelBody`. |
  | `enabled` | `string[]` | *(required)* | Array of enabled sub-controls: `['padding', 'margin', 'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight']`. |
  | `device` | `string` | *(injected)* | Current device type (`desktop`, `tablet`, `mobile`) injected via `withSelect`. |
- **Internal Behavior:** Each input renders an inline `Device` trigger. Changes are immutably merged into the state via `updateData(dimension, val, path...)`. Uses `BoxControl` for 4-sided padding and margin.

#### `BoxControl`
- **Location:** `Components/BoxControl/BoxControl.js`
- **Purpose:** 4-sided dimension input (Top, Right, Bottom, Left) with link/unlink toggle and reset capability.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `className` | `string` | `''` | Additional CSS class. |
  | `label` | `string` | `undefined` | Optional section label. |
  | `values` | `object` | `{}` | Object with `{ top, right, bottom, left }` values. |
  | `onChange` | `function` | `() => {}` | Callback receiving updated `{ top, right, bottom, left }`. |
  | `resetValues` | `object` | `undefined` | Object with fallback values. When provided and values differ, displays a reset icon. |
  | `units` | `array` | `px, %, em, rem, vw, vh` | Available unit options. |
  | `sides` | `string[]` | `['top', 'right', 'bottom', 'left']` | Custom sides to display (e.g., `['horizontal', 'vertical']`). |
  | `style` | `object` | `{}` | Inline CSS styling. |
  | `disableUnits`| `boolean` | `false` | Whether to disable unit selection in inputs. |
- **Internal Behavior:** Internal `link` state links all 4 dimensions so changing one value simultaneously updates all four sides.

---

### 3.2 Color & Background Controls

#### `ColorControl` & `HexColorControl`
- **Location:** `Components/ColorControl/ColorControl.js`
- **Purpose:** Color picker rendered inside a compact WordPress `Dropdown` popover with theme palette swatches.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `className` | `string` | `''` | CSS class for container row. |
  | `label` | `string` | `__('Color:')` | Control label. |
  | `value` | `string` | `''` | Current color value (`rgba(...)` or `#hex`). |
  | `onChange` | `function` | *(required)* | Callback receiving new color string. |
  | `defaultColor`| `string` | `undefined` | Fallback color. Displays a reset button if current color differs. |
  | `disableAlpha`| `boolean` | `false` | Disables opacity/alpha slider when `true`. |
- **Exported Variations:**
  - `ColorControl`: Outputs RGBA format: `rgba(r, g, b, a)`.
  - `HexColorControl`: Outputs 6 or 8-digit Hex format: `#rrggbbaa`.

#### `ColorsControl`
- **Location:** `Components/ColorsControl/ColorsControl.js`
- **Purpose:** Combined text color and background control (solid or gradient) with preview indicators.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `className` | `string` | `''` | Container class. |
  | `label` | `string` | `__('Colors:')` | Label displayed beside color indicator dots. |
  | `labelPosition`| `'left' \| 'top'` | `'left'` | Label positioning. |
  | `value` | `object` | *(required)* | State object: `{ color, bgType, bg, gradient }`. |
  | `onChange` | `function` | *(required)* | Callback receiving updated state object. |
  | `defaults` | `object` | `{}` | Defaults: `{ color: '#333', bgType: 'solid', bg: '', gradient }`. |
  | `gradients` | `array` | *(theme)* | Array of gradient objects (retrieved from `core/block-editor`). |

#### `SolidBackground`
- **Location:** `Components/SolidBackground/SolidBackground.js`
- **Purpose:** Quick picker switching between a solid color and a gradient background with checkerboard transparency preview.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `label` | `string` | `__('Color')` | Label. |
  | `value` | `string` | `undefined` | Solid color string or CSS gradient string. |
  | `onChange` | `function` | `() => {}` | Callback receiving new color/gradient string. |
  | `className` | `string` | `''` | Additional class name. |
  | `gradients` | `array` | *(theme)* | Theme gradients array injected via `withSelect`. |

#### `Gradient`
- **Location:** `Components/Gradient/Gradient.js`
- **Purpose:** Multi-stop linear and radial gradient builder allowing arbitrary color additions, stop positions, center coordinates, and rotation angles.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `value` | `object` | `{}` | `{ type, radialType, colors, centerPositions, angel }`. |
  | `onChange` | `function` | *(required)* | Callback receiving updated gradient configuration. |
- **State Structure:**
  - `type`: `'linear' | 'radial'`
  - `radialType`: `'ellipse' | 'circle'`
  - `colors`: Array of `{ color: string, position: number }` (0-100)
  - `centerPositions`: `{ x: number, y: number }` (0-100)
  - `angel`: `number` (0-360 degrees)

#### `Background`
- **Location:** `Components/Background/Background.js`
- **Purpose:** Standard popover background control supporting Solid, Gradient, and Image with image position, repeat, attachment, size, and overlay color.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `className` | `string` | `''` | Class name. |
  | `label` | `string` | `__('Background')` | Control label. |
  | `value` | `object` | `{}` | `{ type, color, gradient, image, position, attachment, repeat, size, overlayColor }`. |
  | `onChange` | `function` | *(required)* | Change callback. |
  | `defaults` | `object` | `{}` | Default fallback values. |
  | `isSolid` | `boolean` | `true` | Enable solid color mode. |
  | `isGradient`| `boolean` | `true` | Enable gradient mode. |
  | `isImage` | `boolean` | `true` | Enable image upload mode. |
  | `gradients` | `array` | *(theme)* | Gradients list from `core/block-editor`. |

#### `AdvBackground`
- **Location:** `Components/AdvBackground/AdvBackground.js`
- **Purpose:** Advanced responsive background tab panel supporting Solid, Gradient, Image (with device-specific positioning, attachment, repeat, custom unit sizes), and Video (with loop and URL).
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `name` | `string` | `__('Background')` | Control header title. |
  | `value` | `object` | `{}` | State: `{ type, color, gradient, img, video }`. |
  | `onChange` | `function` | *(required)* | Change handler. |
  | `isVideo` | `boolean` | `false` | Whether to show the Video tab option. |
  | `device` | `string` | *(injected)* | Active device injected via `withSelect('core/editor')`. |

---

### 3.3 Typography & Text Controls

#### `Typography`
- **Location:** `Components/Typography/Typography.js`
- **Purpose:** Full typography inspector featuring 1,000+ searchable Google Fonts, variant weights, responsive font sizes, font styles, text transforms, text decorations, line height, and letter spacing.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `className` | `string` | `''` | Container class. |
  | `label` | `string` | `__('Typography:')` | Dropdown trigger label. |
  | `value` | `object` | `{}` | Typography state object. |
  | `onChange` | `function` | *(required)* | Change callback. |
  | `defaults` | `object` | `{}` | Fallback defaults. |
  | `isFamily` | `boolean` | `true` | Whether to display font-family search and Google font loader. |
- **State Schema:**
  ```js
  {
    fontFamily: 'Default',
    fontCategory: 'sans-serif',
    fontWeight: 400,
    fontVariant: '400',
    isUploadFont: true,
    fontSize: { desktop: '16px', tablet: '14px', mobile: '12px' },
    fontStyle: 'normal',
    textTransform: 'uppercase',
    textDecoration: 'none',
    lineHeight: '1.5em',
    letterSpace: '0px'
  }
  ```

#### `TinyEditor`
- **Location:** `Components/TinyEditor/TinyEditor.js`
- **Purpose:** Mounts a fully functional WordPress classic TinyMCE WYSIWYG editor instance inside an inspector or modal.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `value` | `string` | `''` | HTML string content. |
  | `onChange` | `function` | *(required)* | Change callback receiving HTML string. |
  | `media_button`| `boolean` | `true` | Whether to display the WordPress "Add Media" button. |
  | `quicktags` | `boolean` | `true` | Whether to enable the Text/HTML tab. |
  | `height` | `string` | `'180px'` | Height of the editor area. |
  | `className` | `string` | `undefined` | Wrapper class name. |
- **Internal Behavior:** Generates an isolated random element ID. Initializes using `wp.editor.initialize(id, settings)`. Attaches listeners to TinyMCE events (`keyup`, `change`, `input`, `paste`, `blur`) and thoroughly cleans up via `wp.editor.remove(id)` on component unmount.

---

### 3.4 Media & Content Controls

#### `MediaControl` Suite
- **Location:** `Components/MediaControl/MediaControl.js`
- **Exported Sub-Components:**
  1. **`InlineMediaUpload`:** Text input for direct URL entry accompanied by an upload button opening the WordPress media modal.
     - Props: `className`, `label`, `value` (string URL), `types` (default `['image']`), `onChange(url)`, `placeholder`.
  2. **`InlineDetailMediaUpload`:** Similar to `InlineMediaUpload`, but manages full media metadata objects.
     - Props: `value` (`{ id, url, alt, title, caption }`), `onChange(mediaObj)`.
  3. **`MediaArea`:** Square or custom-dimension clickable preview box showing the selected image, placeholder upload icon, and hover delete button. Supports SVG previewing via data URI.
     - Props: `className`, `label`, `value` (`{ id, url, alt, title }`), `types` (default `['image/*']`), `onChange`, `default`, `height` (`'50px'`), `width` (`'50px'`), `style`, `onClick`, `isSvgEnabled`.
  4. **`MediaPlaceholder`:** Large Gutenberg-style initial placeholder box with drag/drop upload button and manual URL text input.
     - Props: `className`, `onChange({ id, url, alt, title })`, `icon`, `type`, `typeName`, `placeholder`.
  5. **`MediaEditControl`:** Toolbar button added to block header controls that re-opens the media library to replace an existing image or gallery.
     - Props: `label`, `icon`, `types`, `value`, `onChange`, `isMultiple` (boolean).

#### `BlockContentEditor` & `BlockContentModal`
- **Location:** `Components/BlockContentEditor/BlockContentEditor.js`
- **Purpose:** Full nested Gutenberg editor canvas allowing blocks to store serialized block markup inside a single string attribute (ideal for popups, tabs, accordions, and sliders).
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `value` | `string` | `''` | Serialized Gutenberg block markup. |
  | `onChange` | `function` | *(required)* | Callback receiving serialized string. |
  | `className` | `string` | `''` | Outer wrapper CSS class. |
  | `area` | `object` | `undefined` | Visual boundary simulator: `{ width, height, background, padding, border, radius }`. |
  | `settings` | `object` | `{}` | Custom block editor settings override. Supports `settings.styles` for iframe CSS injection. |
  | `isOpen` | `boolean` | *(Modal only)* | Controls modal visibility. |
  | `onClose` | `function` | *(Modal only)* | Callback invoked on modal close. |
  | `title` | `string` | `__('Edit Content')` | Modal window title. |
- **Internal Behavior:** Uses `BlockEditorProvider`, `BlockList`, `BlockCanvas`, `BlockInspector`, and `ShortcutProvider`. Inherits theme and block assets from `core/block-editor`. Automatically maintains a trailing default block target for typing and strips it before calling `serialize()`.

#### `BplBlockPreview`
- **Location:** `Components/BplBlockPreview/BplBlockPreview.js`
- **Purpose:** Displays interactive layout/pattern preset buttons that show a hover popover with a live `BlockPreview` canvas. Clicking replaces the active block content on the main canvas.
- **Props:** `blocks` (array of `{ label, value, content }`), `clientId`, `value`, `minHeight`, `minWidth`, `viewportWidth` (`1600`).
- **Internal Mechanism:** Connects to `core/block-editor` using `withDispatch` to invoke `replaceBlock(clientId, parse(content))`.

---

### 3.5 Icon & Shape Controls

#### `IconControl`
- **Location:** `Components/IconControl/IconControl.js`
- **Purpose:** Popover selector for FontAwesome 4/5 icons with real-time search, icon size slider, and solid/gradient icon color picker.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `className` | `string` | `''` | Additional class. |
  | `label` | `string` | `__('Select Icon:')` | Label. |
  | `value` | `object` | `{}` | `{ class, fontSize, colorType, color, gradient }`. |
  | `onChange` | `function` | *(required)* | Change handler. |
  | `defaults` | `object` | `{}` | Defaults fallback. |
  | `isSize` | `boolean` | `true` | Show size slider. |
  | `isColor` | `boolean` | `true` | Show color picker. |

#### `IconLibrary`
- **Location:** `Components/IconLibrary/IconLibrary.js`
- **Purpose:** Heavyweight SVG icon browser containing 3,000+ icons across FontAwesome, Bootstrap, and Lucid icon packs.
- **Props:** `className`, `label`, `value` (raw SVG string), `onChange(svgString)`.
- **Performance Architecture:** Does **not** statically bundle the ~3.2MB JSON datasets. Instead, loads icon sets on-demand via dynamic `import()` chunks (`bpl-icons-fontawesome`, `bpl-icons-bootstrap`, `bpl-icons-lucid`) the first time the modal is opened. Renders icons with virtual pagination using `IntersectionObserver` on a sentinel element (100 items per page) and debounced search filtering.

#### `Mask`
- **Location:** `Components/Mask/Mask.js`
- **Purpose:** Applies CSS clipping masks (`-webkit-mask-image`) to elements using SVG presets (Circle, Flower, Sketch, Triangle, Blob, Hexagon) or custom SVG uploads.
- **Props:** `mask` (`{ isMask, shape, size, position, repeat }`), `onChange`.

---

### 3.6 Selection & Input Controls

#### `BtnGroup`
- **Location:** `Components/BtnGroup/BtnGroup.js`
- **Purpose:** Horizontal button group supporting text labels, tooltips, or Dashicons/SVGs.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `label` | `string` | `''` | Field label. |
  | `labelPosition`| `'left' \| 'top'` | `'left'` | Label position. |
  | `value` | `string` | *(required)* | Currently selected value. |
  | `defaultValue` | `string` | `''` | Deselect value when clicking an active button. |
  | `onChange` | `function` | *(required)* | Receives `(value, def)`. |
  | `options` | `object[]` | *(required)* | Array of `{ value, label, icon?, def? }`. |
  | `isIcon` | `boolean` | `false` | Render icons instead of text. |
  | `isTextIcon` | `boolean` | `false` | Render icons as plain text. |
  | `size` | `'compact' \| 'small' \| 'default'` | `'compact'` | Button size. |

#### `BButtonGroup`
- **Location:** `Components/BButtonGroup/BButtonGroup.js`
- **Purpose:** Stylized button group with an animated sliding background pill indicating the selected item.
- **Props:** `options`, `label`, `value`, `defaultValue`, `onChange`, `borderRadius` (`'30px'`), `height`, `paddingX`, `paddingY`, `fontSize`, `fontWeight`, `activeBg`, `activeColor`, `inactiveColor`, `hoverBg`, `hoverColor`, `style`.

#### `SelectTokenField`
- **Location:** `Components/SelectTokenField/SelectTokenField.js`
- **Purpose:** Searchable tokenized selection input supporting single-select and multi-select modes with removable pill tags.
- **Props:** `multiple` (`true`), `defaultValue`, `value`, `onChange`, `options` (`[{ value, label }]`).

#### `MultiSelectControl`
- **Location:** `Components/MultiSelectControl/MultiSelectControl.js`
- **Purpose:** Tag-list selector opening an anchored WordPress `Popover` of checkboxes with configurable selection limits.
- **Props:** `value` (`string[]`), `onChange(array)`, `limit` (`10`), `options` (`[{ value, label }]`).

#### `SelectPureControl`
- **Location:** `Components/SelectPureControl/SelectPureControl.js`
- **Purpose:** Wrapper around the vanilla `select-pure` DOM library providing multiselect and autocomplete.
- **Props:** `className`, `label`, `value`, `onChange`, `options`.

#### `PanelSelectControl`
- **Location:** `Components/PanelSelectControl/PanelSelectControl.js`
- **Purpose:** Compact inline tag selector with add/remove buttons and a dropdown search popover.
- **Props:** `value` (`string[]`), `options` (`string[]`), `onChange`, `className`.

#### `SortableControl`
- **Location:** `Components/SortableControl/SortableControl.js`
- **Purpose:** Drag-and-drop sortable list powered by `@dnd-kit/core` and `@dnd-kit/sortable`.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `className` | `string` | `''` | Container class. |
  | `label` | `string` | `__('Sort:')` | Header label. |
  | `value` | `array` | `[]` | Array of items (objects or strings) to reorder. |
  | `property` | `string` | `undefined` | Property name to display when items are objects. |
  | `onChange` | `function` | *(required)* | Callback receiving the reordered array. |

---

### 3.7 UI Display, Badges & Feedback Controls

#### `Badge`
- **Location:** `Components/Badge/index.js`
- **Purpose:** Small visual tag component for labeling items as NEW, PRO, BETA, or custom statuses.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `className` | `string` | `''` | Extra class. |
  | `label` | `string` | `'NEW'` | Text displayed in badge. |
  | `icon` | `element` | `null` | Optional icon rendered before label. |
  | `size` | `'small' \| 'regular' \| 'medium'` | `'small'` | Size variation. |
  | `color` | `string` | `'#ff7a00'` | Text/icon color. |
  | `background` | `string` | `'#ff7a0020'` | Background color. |
  | `borderColor`| `string` | `'#ff7a0030'` | Border color. |

#### `Notice`
- **Location:** `Components/Notice/index.js`
- **Purpose:** Alert notice banner supporting predefined color themes and SVG status icons.
- **Props:**
  | Prop | Type | Default | Description |
  |---|---|---|---|
  | `className` | `string` | `'mt10'` | CSS class. |
  | `status` | `'info' \| 'success' \| 'warning' \| 'danger' \| 'premium'` | `'info'` | Color and semantic status. |
  | `isIcon` | `boolean` | `false` | Whether to show the status icon. |
  | `children` | `node` | *(required)* | Notice content text or elements. |

#### `Button`
- **Location:** `Components/Button/Button.js`
- **Purpose:** Dual-nature action button that renders an HTML `<button>` when `onClick` is provided (or `href` is omitted) and an `<a>` anchor link when `href` is supplied.
- **Props:** `type`, `href`, `target`, `onClick`, `className`, `variant` (`'primary' | 'secondary' | 'tertiary'`), `size` (`'small' | 'medium'`), `disabled`, `children`.

#### `Loading`
- **Location:** `Components/Loading/Loading.js`
- **Purpose:** Centered circular loading spinner with optional text.
- **Props:** `className`, `text` (`__('Loading...')`), `orientation` (`'horizontal' | 'vertical'`), `iconSize` (`'2rem'`), `iconThickness` (`'4px'`), `textSize` (`'18px'`).

#### `Label`
- **Location:** `Components/Label/Label.js`
- **Purpose:** Standardized form label with default margins.
- **Props:** `className` (`'mt20 mb5'`), `htmlFor`, `children`.

#### `HelpTooltip`
- **Location:** `Components/HelpTooltip/HelpTooltip.js`
- **Purpose:** Question mark circle SVG icon wrapped in a WordPress `Tooltip` for contextual help.
- **Props:** `text` (string).

#### `HelpPanel`
- **Location:** `Components/HelpPanel/HelpPanel.js`
- **Purpose:** Sidebar `PanelBody` rendering quick links to documentation, support, reviews, and related plugins.
- **Props:** `slug` (plugin slug), `docsLink` (documentation URL).

#### `DynamicTag`
- **Location:** `Components/DynamicTag/DynamicTag.js`
- **Purpose:** Polymorphic component rendering whatever HTML tag name is passed via `tagName` (e.g. `'h1'`, `'h2'`, `'div'`, `'span'`).
- **Props:** `tagName: string`, `...props`.

#### `BBlocksAds`
- **Location:** `Components/Utility/BBlocksAds.js`
- **Purpose:** Renders an inline promotional text with an interpolated link to the bBlocks plugin bundle: `"Need more block like this? Check out bBlocks"`.
- **Props:** None (stateless promotional label).

---

### 3.8 Advanced Visual & Effect Controls

#### `ShadowControl`
- **Location:** `Components/ShadowControl/ShadowControl.js`
- **Purpose:** Multi-layer box-shadow and text-shadow builder with horizontal/vertical offsets, blur radius, spread, color, and inset toggling.
- **Props:** `className`, `label` (`__('Shadow')`), `value` (array of shadow objects), `onChange`, `type` (`'box' | 'text'`), `defaults`.

#### `SeparatorControl`
- **Location:** `Components/SeparatorControl/SeparatorControl.js`
- **Purpose:** Controls width, height, border-style, and color for divider elements.
- **Props:** `className`, `label`, `value` (`{ width, height, style, color }`), `onChange`, `defaults`.

#### `OverlayControl`
- **Location:** `Components/OverlayControl/OverlayControl.js`
- **Purpose:** Generates CSS overlay layers (`::after`) with background colors/gradients, opacity, CSS blend modes (multiply, screen, overlay), and CSS filters (blur, brightness, contrast, saturation, hue-rotate).
- **Props:** `value` (`{ isEnabled, colors, opacity, blend, filter, blur, brightness, contrast, saturation, hue, position, zIndex }`), `onChange`.

#### `AdvPosition`
- **Location:** `Components/AdvPosition/AdvPosition.js`
- **Purpose:** Sets CSS positioning (`static`, `relative`, `absolute`, `fixed`) with device-specific horizontal (left/right) and vertical (top/bottom) unit offsets.
- **Props:** `position` (object), `onChange`, `device` (injected via `withSelect`).

#### `AdvTransform`
- **Location:** `Components/AdvTransform/AdvTransform.js`
- **Purpose:** Inspector flyout controls for 2D/3D rotate (x, y, z), offset coordinates, proportional/axis scale, skew angles, and horizontal/vertical flip flags per device.
- **Props:** `value`, `onChange`, `device`.

#### `AdvFloating`
- **Location:** `Components/AdvFloating/AdvFloating.js`
- **Purpose:** Configures infinite alternating floating CSS keyframe animations for translate, rotate, and scale.
- **Props:** `floating` (`{ isEnabled, translate, rotate, scale }`), `onChange`.
- **Keyframe Generation:** Uses discrete CSS properties (`translate`, `transform`, `scale`) so all three properties animate concurrently without colliding.

#### `AdvMotionEffects`
- **Location:** `Components/AdvMotionEffects/AdvMotionEffects.js`
- **Purpose:** Advanced scroll animations using Modern CSS Scroll-Driven Animations (`animation-timeline: view()` or `scroll()`), interactive mouse tracking & 3D tilt, and responsive sticky positioning.
- **Props:** `motion` (object), `onChange`, `device`.

#### `CustomCodeEditor`
- **Location:** `Components/CustomCodeEditor/CustomCodeEditor.js`
- **Purpose:** Monokai-themed Ace code editor with autocompletion, line numbers, and 600ms debounce for custom CSS/HTML entry.
- **Props:** `value`, `onChange`, `height` (`'300px'`), `width` (`'100%'`), `wrap` (`false`).

#### `CustomPopover`
- **Location:** `Components/CustomPopover/CustomPopover.js`
- **Purpose:** Generic button trigger opening a WordPress `Popover` with an automatic "Reset to Default" button when values differ from `resetValues`.
- **Props:** `icon`, `btnText`, `children`, `value`, `label`, `resetValues`, `onClick`.

#### `ItemsPanel`
- **Location:** `Components/ItemsPanel/ItemsPanel.js`
- **Purpose:** Repeater manager for lists of items (e.g., slides, accordion items, social links) supporting 3 layout designs: `'single'`, `'all'` (accordions), and `'sortable'`.
- **Props:** `value`, `onChange`, `attributes`, `setAttributes`, `arrKey`, `newItem`, `ItemSettings` (React component), `itemLabel`, `activeIndex`, `setActiveIndex`, `design`, `handleCopy`, `handleDelete`, `handleAdd`.

---

### 3.9 Deprecated Legacy Controls

Located in `Components/Deprecated/` and maintained strictly for backwards compatibility with older block versions:
- **`BDevice`:** Early iteration of the device switcher.
- **`BorderControl`:** Legacy border width, style, color, radius, and side switcher.
- **`ImageHolderControl`, `ChangeImageData`, `ImageEditControl`, `ImagePlaceholder`:** Early media library wrappers.
- **`ShadowControl` (Deprecated):** Early single-shadow input.
- **`SpaceControl`:** Legacy 2-sided and 4-sided margin/padding input.

---

## 4. Advanced Block Controls System (`Advanced/`)

### 4.1 Architecture & Schema
The `Advanced` component (`Advanced/index.js`) unifies all standard block styling into a single Gutenberg Inspector tab matching industry-standard page builder capabilities (Elementor, Divi).

#### Attribute Data Schema (`advanced` attribute)
```json
{
  "dimension": {
    "padding": { "desktop": {}, "tablet": {}, "mobile": {} },
    "margin": { "desktop": {}, "tablet": {}, "mobile": {} },
    "width": { "width": {}, "min": {}, "max": {} },
    "height": { "height": {}, "min": {}, "max": {} }
  },
  "position": { "desktop": {}, "tablet": {}, "mobile": {} },
  "floating": { "isEnabled": false, "translate": {}, "rotate": {}, "scale": {} },
  "motion": { "isEnable": false, "vertical": {}, "horizontal": {}, "transparency": {}, "blur": {}, "rotate": {}, "scale": {}, "sticky": {} },
  "transform": { "normal": {}, "hover": {}, "transition": 200 },
  "background": { "normal": {}, "hover": {}, "overlay": {}, "hoverOverlay": {}, "transition": 0.4 },
  "borderShadow": { "normal": {}, "hover": {}, "transition": 0.4 },
  "mask": { "isMask": false, "shape": {}, "size": {}, "position": {}, "repeat": "no-repeat" },
  "animation": { "type": "", "duration": 1, "delay": 0 },
  "visibility": { "zIndex": { "desktop": "", "tablet": "", "mobile": "" }, "overflow": "" },
  "responsive": { "desktop": false, "tablet": false, "mobile": false },
  "css": ""
}
```

### 4.2 Section Components

| Component | File | Description |
|---|---|---|
| `Advanced` | `Advanced/index.js` | Top-level inspector wrapper managing all sections via the `enabled` prop map. |
| `Animation` | `Advanced/Animation.js` | AOS (Animate On Scroll) animation type, duration, and delay. |
| `Background` | `Advanced/Background.js` | Normal and hover backgrounds with overlays and transition speed. |
| `BorderShadow` | `Advanced/BorderShadow.js` | Borders (via `BorderBoxControl`), border-radius, and box-shadow. |
| `CustomCSS` | `Advanced/CustomCSS.js` | AceEditor code box for arbitrary CSS rules. |
| `Responsive` | `Advanced/Responsive.js` | Toggles to hide the block on Desktop, Tablet, or Mobile. |
| `Transform` | `Advanced/Transform.js` | 2D/3D transformations for normal and hover states. |
| `Visibility` | `Advanced/Visibility.js` | Z-Index per device and CSS overflow (`hidden`, `visible`, `auto`, `scroll`). |

### 4.3 Dynamic CSS & Animation Engine (`generateCSS.js` & `style.js`)

#### `generateCSS(id, advanced, isBackend = false, isFirstChild = true)`
- **Function:** Pure function that compiles the entire `advanced` state tree into clean, responsive CSS text.
- **Selector Resolution:**
  - Editor (backend): `#{id}>div>div:first-child`
  - Frontend: `#{id}>div`
- **Output:**
  - Responsive media queries (`deskBreakpoint`, `tabBreakpoint`, `mobileBreakpoint`).
  - Normal and `:hover` states with transitions.
  - Keyframe generation for floating animations (`@keyframes advFloat...`).
  - Modern CSS Scroll-Driven animations (`@supports (animation-timeline: scroll())`).
  - Native JavaScript smooth mouse tracking loop using `requestAnimationFrame`.
  - Injects AOS data attributes (`data-aos`, `data-aos-duration`, `data-aos-delay`).

#### `Advanced/style.js`
- **Frontend Execution:** Runs on `DOMContentLoaded`. Scans the DOM for all elements matching `[data-bblocks-advanced]`. Parses the JSON data attribute, executes `generateCSS()`, initializes AOS animations via `window.AOS.init()`, removes the data attribute, and appends a consolidated `<style>` tag to `<head>`.

---

## 5. Pro Controls & Upsell Ecosystem (`ProControls/`)

Controls designed to display premium features inside free blocks and prompt users to upgrade.

| Component | File | Behavior & API |
|---|---|---|
| `BControlPro` | `BControlPro/BControlPro.js` | **Higher Order Component:** Wraps any control (e.g. `ToggleControl`, `RangeControl`). If `isPremium=false`, appends a `Pro` badge to the label, adds `bplProIdentifier`, and intercepts changes to trigger `setIsProModalOpen(true)` instead of `onChange`. |
| `BtnGroupPro` | `BtnGroupPro/BtnGroupPro.js` | Button group where specific option values (passed in `proValues`) trigger `setIsProModalOpen(true)` when clicked by free users. |
| `SelectControlPro`| `SelectControlPro/SelectControlPro.js` | Standard select dropdown that tags gated options with ` - Pro`. Selecting a gated option opens the Pro modal. |
| `RadioControlPro` | `RadioControlPro/RadioControlPro.js` | RadioControl with automatic Pro badge and modal trigger. |
| `ProModal` | `ProModal/index.js` | High-converting popup modal showcasing up to 6 pro features, lock illustrations, and an "Upgrade Now" button. |
| `AboutProModal` | `AboutProModal/AboutProModal.js` | Classic upgrade modal with custom feature bullets passed as `children`. |
| `PremiumPanel` | `PremiumPanel/index.js` | Inspector panel containing crown icon, feature description, and direct link to pricing. |
| `PremiumBadge` | `PremiumPanel/PremiumBadge.js` | Orange/gold "Pro" badge with crown icon. |
| `ProAds` | `ProAds/index.js` | Dynamically selects and renders one of 4 styled ads (`lifetime`, `powerup`, `agency`, `membership`). |
| `AdvertiseCard` | `AdvertiseCard/index.js` | Card switching between "Go for Pro Plan" (free) and "Stuck!! Get Support" (premium). |
| `FrontShortCode` | `FrontShortCode/FrontShortCode.js` | Read-only input displaying the block's shortcode with a one-click clipboard copy button. Only renders when editing the target CPT. |

---

## 6. WordPress Admin Dashboard Framework (`Admin/`)

The `Admin` directory contains an end-to-end dashboard application mounted to a host DOM node rendered by WordPress PHP.

### 6.1 Dashboard Layout & Header
- **`Header` (`Admin/Header/index.js`):** Top bar displaying the plugin logo, plugin title, version badge, responsive hamburger navigation, "Our Plugins" link, and "Upgrade Pro" button.
- **Routing:** Consuming plugins wrap routes using `HashRouter` (`react-router-dom`) so navigation operates seamlessly without page reloads.

### 6.2 Welcome & Onboarding Experience
- **`Welcome` (`Admin/Welcome/index.js`):** Composite landing page featuring:
  - `Overview`: Hero banner, video player modal, quick action buttons ("Start Now", "Read Documentation").
  - `GettingStarted`: Tabbed workflow instructions (Gutenberg vs ShortCode steps).
  - `Changelog`: Filterable release history entries with color-coded badges (`new`, `update`, `fix`).
  - `ProAds`: Upgrade banner for free users.
  - `Info`: Cards for Documentation, Rating on WordPress.org, Support, and Facebook Community.
- **`Onboarding` (`Admin/Onboarding/index.js`):** Full-screen wizard launched upon plugin activation. Features progress dots, field validation, and auto-saves values via AJAX on each step.

### 6.3 Feature & Block Management
- **`Blocks` (`Admin/Blocks/index.js`):** Enables/disables individual blocks or block groups. Includes real-time search, "Activate All", "Deactivate All" (respecting `required: true` core blocks), and saves via AJAX with a floating status `Toast`.
- **`BlocksCard` (`Admin/Blocks/Card.js`):** Condensed card summary of enabled blocks rendered inside the Welcome page.

### 6.4 Freemius Licensing & Activation
- **`Activation` (`Admin/Activation/index.js`):** Complete license key input, activation, masking (`••••••••`), clipboard copy, and deactivation modal.
- **Custom Hook `useLicense`:** Connects to the host plugin's `LicenseActivation.php` AJAX bridge using actions `bPlActivateLicense`, `bPlDeactivateLicense`, and `bPlGetLicenseStatus`.
- **`FSCheckoutButton` & `FSCheckoutForm`:** Wrappers integrating the Freemius checkout JavaScript SDK (`Admin/lib/fs.js`).

### 6.5 Dynamic Pricing & Feature Comparison
- **`Pricing` (`Admin/Pricing/index.js`):** Fetches live plan data from `https://api.bplugins.com/wp-json/bpl/v1/products/{pluginId}`. Renders billing cycle toggles (Monthly, Yearly with savings calculation, Lifetime), site license tiers, feature check-lists, trust badges, and accordion FAQs.
- **`MultiPlanPricing` (`Admin/MultiPlanPricing/index.js`):** Variant supporting multiple simultaneous premium plan IDs with an interactive license switcher.
- **`FeatureCompare` (`Admin/FeatureCompare/index.js`):** Side-by-side searchable comparison matrix detailing Free vs Pro capabilities.

### 6.6 Plugin Directory Cross-Promotion (`OurPlugins`)
- **`OurPlugins` (`Admin/OurPlugins/index.js`):** Makes an unauthenticated live query to the official WordPress.org API (`api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[author]=bplugins`).
- **Capabilities:** Lists active install counts, star ratings, descriptions, and provides **one-click direct installation and activation** using the WordPress REST API (`/wp/v2/plugins`).

### 6.7 Settings & Data Cleanup Management
- **`Settings` (`Admin/Settings/index.js`):** Danger Zone management tab allowing administrators to toggle whether all custom post types, settings, and metadata should be permanently erased from the database when the plugin is uninstalled. Requires typing `"DELETE"` in a modal to confirm.

---

## 7. Alternative Dashboard Architectures (`ModernAdmin/` & `LagacyAdmin/`)

- **`ModernAdmin/`:** An intermediate modern dashboard release. Kept in the repository for backwards compatibility with plugins that have not migrated to `Admin/`.
- **`LagacyAdmin/`:** The original classic dashboard implementation. Uses static pricing objects and earlier CSS grid structures. Kept strictly for legacy plugins.

---

## 8. Template Library System (`TemplateLibrary/`)

A turnkey cloud template and pattern importer modal.

### Architecture
- **Trigger:** Renders a button in the Gutenberg header toolbar.
- **Portal:** Mounts into `document.body` via `Portal.js` so it renders above all WordPress admin UI.
- **Remote Endpoints:** Connects to `templates.bplugins.com` through local WordPress AJAX proxies:
  1. `{prefix}_templates_main`: Retrieves category taxonomies.
  2. `{prefix}_templates`: Retrieves paginated patterns and pages.
  3. `{prefix}_template_import`: Downloads remote image assets into the local media library, rewrites URLs, and returns parsed block markup.
  4. `{prefix}_template_counts`: Retrieves Free and Pro count badges.
  5. `{prefix}_template_favorites`: Saves/retrieves user favorite pattern IDs.
- **Block Insertion:** On import completion, executes:
  ```js
  const blocks = parse(rewrittenContent);
  wp.data.dispatch('core/block-editor').insertBlocks(blocks);
  ```

---

## 9. React Hooks Inventory (`hooks/`)

| Hook | File | Signature | Purpose |
|---|---|---|---|
| `useWPAjax` | `hooks/useWPAjax.js` | `(action, params = {}, set = true) => { data, saveData, refetch, isLoading, isError, error }` | Wraps `wp.ajax.post()` with reactive state tracking. |
| `useWPOptionQuery` | `hooks/useWPOptionQuery.js` | `(key) => { data, isLoading, isError, error }` | Reads WordPress options via `wp.api.models.Settings`. |
| `usePremium` | `hooks/usePremium.js` | `(pipeAction, nonce) => { isPremium, isLoading }` | Verifies premium license status via AJAX. |
| `usePremiumInEditor` | `hooks/usePremiumInEditor.js` | `(utilsAction, pipeAction) => { isPremium, isLoading }` | Resolves option nonces first, then validates premium status in the editor. |
| `useRenderedBlocks` | `hooks/useRenderedBlocks.js` | `(path, contents = []) => { htmls, css }` | Server-side block rendering cache via plugin REST routes with debouncing. |
| `useDeviceWidth` | `hooks/useDeviceWidth.js` | `() => { device: 'desktop' \| 'tablet' \| 'mobile' }` | Responsive window resize observer. |
| `useIframeAssetSync` | `hooks/useIframeAssetSync.js`| `(prefixes = []) => void` | Synchronizes styles, scripts, and font links into the Gutenberg editor canvas iframe. |
| `useOutsideDetect` | `hooks/useOutsideDetect.js` | `(callback) => { ref, btnRef }` | Detects clicks outside target ref elements. |
| `useAnimation` | `hooks/useAnimation.js` | `(element, animation) => void` | Attaches and initializes AOS animation attributes on DOM nodes. |

---

## 10. Utility Library & Pure Helpers (`utils/`)

### 10.1 Data Sanitization & Security (`common.js`)
- `isExist(value)`: Strict verification checking whether a value is defined, non-null, non-empty string/array/object, and non-zero.
- `escapeHTML(input = '')`: Replaces disallowed HTML tags with `&lt;` / `&gt;` entities while preserving safe formatting tags (`b`, `strong`, `i`, `em`, `span`, `a`, `br`) and sanitizing their attributes (`style`, `href`, `target`, `rel`, `class`).
- `sanitizeURL(inputUrl, allowedProtocols)`: Strips control characters and validates protocols (`http:`, `https:`, `mailto:`, `tel:`). Blocks `javascript:` and unknown schemes; returns `null` or safe URL string.
- `sanitizeHTML(input)`: Parses string through `DOMParser` and strips all tags except safe formatting tags (`b`, `strong`, `i`, `em`, `span`, `a`, `br`) and safe attributes (`style`, `href`, `target`, `rel`, `class`).
- `sanitizeInput(input)`: Strips angle brackets (`<`, `>`), `javascript:` protocols, and inline event handlers (`on\w+=`).
- `SVGSanitizer` & `svgSanitizer` / `sanitizeSVG(svg)`: Full DOM XML SVG security sanitizer class and singleton instance. Strips `<script>`, event attributes (`on*`), remote URLs, external fragments, and CSS script expressions.

### 10.2 State & Object Mutation Helpers (`functions.js`)
- `produce(baseState, recipe)`: Direct re-export of Immer's `produce` for structural sharing and immutable drafts.
- `getBoxValue(object)`: Joins all values of an object with spaces (e.g. `{ top: '10px', right: '5px' }` -> `'10px 5px'`).
- `getImageSizes(image, imageSizes)`: Formats WordPress media object attachment sizes into `{ label, value }` dropdown options.
- `tabController()`: Utility that attaches click handlers to accordion panels (`.bPlPanelBody:not(.itemPanelBody) > h2 > button`) to enforce single-open accordion behavior.
- `updateData(attr, value, ...props)`: Immutably sets deeply nested properties inside an object using `immer` without mutating the source.
- `updateAttributes(attributes, setAttributes)`: Higher-order wrapper creating an updater function bound to a block's `setAttributes`: `(object, val, ...props) => setAttributes(...)`.
- `debounce(fn, delay)`: Classic execution debouncer returning a wrapped function with timer reset.
- `getRandomColor()`: Generates random hex color strings (`#xxxxxx`).
- `randomNumber(number)`: Returns integer random number between `0` and `number`.
- `MimeTypeChecker`: Comprehensive MIME type and file extension validator supporting wildcards (`image/*`), file sizes, static helpers (`isImage`, `isVideo`, `isAudio`, `isDocument`), and error reporting via `validateFile()`.

### 10.3 CSS Generation & Formatting (`getCSS.js`)
- `isValidCSS(property, value)`: Returns `${property}: ${value};` if `value` exists via `isExist()`, else `''`.
- `getBackgroundCSS(bg, isSolid, isGradient, isImage)`: Builds complete CSS background string for standard backgrounds (solid, gradient, image with blend mode).
- `getBorderCSS(border)`: Builds 4-sided border or directional border CSS rules and border-radius.
- `getBorderBoxCSS(border)`: Builds 4-sided border definitions from `{ top, right, bottom, left }` objects or flat borders.
- `getColorsCSS(colors)`: Formats text and background colors (solid or gradient).
- `getIconCSS(icon, isSize, isColor)`: Handles icon font-size and clip-path text gradients.
- `getMultiShadowCSS(shadows, type = 'box')`: Compiles array of shadows (with `isInset`, offsets, blur, spread, color) into comma-separated CSS string.
- `getSeparatorCSS(separator)`: Generates divider rules: `width` and `border-top: ${height} ${style} ${color}`.
- `getShadowCSS(shadow, type = 'box')`: Compiles single shadow object into CSS `box-shadow` or `text-shadow` rule.
- `getSpaceCSS(space)`: Formats 2-directional or 4-directional spacing values (`${vertical} ${horizontal}` or `${top} ${right} ${bottom} ${left}`).
- `getTypoCSS(selector, typo, isFamily)`: Returns `{ googleFontLink, styles }` containing Google Font `@import` link and media-queried desktop, tablet (`tabBreakpoint`), and mobile (`mobileBreakpoint`) rules.
- `getBoxCSS(box)`: Formats `{ top, right, bottom, left }` into shorthand `'top right bottom left'`.
- `getGradientCSS(gradient)`: Generates linear (`linear-gradient(deg, ...)`) or radial (`radial-gradient(...)`) CSS gradients.
- `getAdvBGCSS(bg, selector, isHover)`: Generates responsive background CSS for advanced panels with tablet and mobile media queries.
- `getOverlayCSS(overlay, selector, isHover)`: Generates `::after` overlay styling with opacity, blend-modes, and CSS filters.
- `getTransformCSS(transform, selector, isHover)`: Compiles responsive 2D/3D matrix transforms (rotate, scale, skew, offset, flipX, flipY).
- `getMaskCSS(mask)`: Builds `-webkit-mask-*` properties using built-in SVG shapes (`circle`, `flower`, `sketch`, `triangle`, `blob`, `hexagon`) or custom shape URLs.

### 10.4 Preset Data & Breakpoints (`data.js` & `options.js`)
- **Breakpoints:**
  - `deskBreakpoint`: `@media only screen and (min-width: 1025px)`
  - `tabBreakpoint`: `@media only screen and (max-width: 1024px)`
  - `mobileBreakpoint`: `@media only screen and (max-width: 640px)`
- **Color Presets:** `primaryColor` (`#146EF5`), `secondaryColor` (`#FF7A00`), `titleColor` (`#070127`), `contentColor` (`#485781`).
- **Options Presets:** `borderStyles`, `sides`, `gradients`, `bgTypes`, `overflows`, `animationTypes`, `pxUnit()`, `remUnit()`, `emUnit()`, `perUnit()`, `vwUnit()`, `vhUnit()`.

---

## 11. Build Tooling & Internationalization (`i18n/`)

Solves the WordPress Gutenberg translation problem for shared code:
1. **`i18n/babel-plugin-text-domain.js`:** Custom Babel plugin that injects the consumer plugin's text-domain into all un-scoped `__()`, `_x()`, `_n()`, and `_nx()` calls originating from `bpl-tools`.
2. **`i18n/normalize-js-pot.js`:** Node.js build script that normalizes extracted JavaScript POT files so all bpl-tools strings map to the consumer plugin's compiled bundle (`build/index.js`), enabling `wp i18n make-json` to generate valid translation JSON files.

---

## 12. Cross-Component Dependencies & Technical Rules

1. **Host Prerequisites:** Any consuming plugin must enqueue `wp-util` (for `wp.ajax`) and `wp-api` (if using `useWPOptionQuery`) as script dependencies.
2. **Editor Canvas Styles:** Because WordPress 6.3+ renders the block canvas inside an `<iframe>`, all generated styles and dynamic CSS must either be passed via `BlockCanvas` styles, injected into `head` of the iframe, or synchronized using `useIframeAssetSync`.
3. **Immutability Requirement:** Gutenberg attributes must **never** be mutated directly. Always use `updateData()` or produce new object references when calling `setAttributes()`.
4. **License Distinction:**
   - `hasPro`: The Pro plugin file is installed on the server (used to display the Activation tab).
   - `isPremium`: The user has an active, valid license key verified by Freemius (used to unlock Pro UI features and hide pricing).

