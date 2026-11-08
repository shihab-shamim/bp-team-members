# BPL Tools — AI Developer Usage Guide (`use.md`)

This guide is a verified, practical reference manual for AI coding agents and human developers building WordPress Gutenberg blocks and Admin Dashboards using the internal `bpl-tools` library.

All prop names, signatures, default values, and component architectures documented herein have been audited directly against the `bpl-tools` source code.

---

## Table of Contents
1. [Architecture & Setup](#1-architecture--setup)
2. [Core Gutenberg Block Inspector Integration (`edit.js`)](#2-core-gutenberg-block-inspector-integration-editjs)
3. [Styling & CSS Compilation Engine (`getCSS.js` & `generateCSS.js`)](#3-styling--css-compilation-engine-getcssjs--generatecssjs)
4. [Component-by-Component Usage Guide](#4-component-by-component-usage-guide)
   - 4.1 [Typography & Text Controls](#41-typography--text-controls)
   - 4.2 [Dimensions & Spacing Controls](#42-dimensions--spacing-controls)
   - 4.3 [Color & Background Controls](#43-color--background-controls)
   - 4.4 [Advanced Visual & Motion Controls](#44-advanced-visual--motion-controls)
   - 4.5 [Buttons, Toggles & Group Controls](#45-buttons-toggles--group-controls)
   - 4.6 [Icon & Media Controls](#46-icon--media-controls)
   - 4.7 [Repeater & List Controls (`ItemsPanel`)](#47-repeater--list-controls-itemspanel)
   - 4.8 [UI Display, Badges & Feedback Controls](#48-ui-display-badges--feedback-controls)
   - 4.9 [Advanced Tab Suite (`Advanced`)](#49-advanced-tab-suite-advanced)
5. [Monetization & Pro Feature Gating (`ProControls`)](#55-monetization--pro-feature-gating-procontrols)
6. [WordPress Admin Dashboard Framework (`Admin`)](#6-wordpress-admin-dashboard-framework-admin)
7. [Hooks Reference](#7-hooks-reference)
8. [Template Library Integration](#8-template-library-integration)
9. [Pure Utility Functions Quick Reference](#9-pure-utility-functions-quick-reference)
10. [Common Pitfalls, Antipatterns & Best Practices](#10-common-pitfalls-antipatterns--best-practices)

---

## 1. Architecture & Setup

### 1.1 Import Conventions & Path Resolution
`bpl-tools` is an internal shared library located alongside sibling plugins. It is imported via relative filesystem paths:

```javascript
// From a block edit file (e.g. src/blocks/my-block/edit.js):
import {
  Dimension,
  ColorControl,
  HexColorControl,
  Typography,
  Background,
  BtnGroup,
  Device
} from '../../../../bpl-tools/Components';

// Media components (named exports):
import {
  InlineMediaUpload,
  InlineDetailMediaUpload,
  MediaArea,
  MediaPlaceholder,
  MediaEditControl
} from '../../../../bpl-tools/Components/MediaControl/MediaControl';

// Advanced panel suite and compiler:
import Advanced from '../../../../bpl-tools/Advanced';
import generateCSS from '../../../../bpl-tools/Advanced/generateCSS';

// Pro upsell wrappers:
import { BControlPro, BtnGroupPro, ProModal } from '../../../../bpl-tools/ProControls';

// Hooks:
import { useDeviceWidth, usePremiumInEditor, useWPAjax, useIframeAssetSync } from '../../../../bpl-tools/hooks';

// Utilities:
import { updateData, produce, MimeTypeChecker } from '../../../../bpl-tools/utils/functions';
import { isExist, sanitizeURL, sanitizeHTML, SVGSanitizer } from '../../../../bpl-tools/utils/common';
import { getTypoCSS, getBoxCSS, getAdvBGCSS, isValidCSS } from '../../../../bpl-tools/utils/getCSS';
```

### 1.2 Stylesheet Compilation
In your block's `editor.scss` or your plugin admin's `main.scss`:
```scss
@import "../../../../bpl-tools/bpl-tools.scss";
```

### 1.3 WordPress Peer Dependencies
Components rely on standard WordPress packages (`@wordpress/components`, `@wordpress/block-editor`, `@wordpress/element`, `@wordpress/data`, `@wordpress/i18n`, `@wordpress/compose`) and external runtime libraries (`immer`, `react-router-dom`, `react-ace`, `@dnd-kit/core`).

---

## 2. Core Gutenberg Block Inspector Integration (`edit.js`)

Below is the production-ready pattern for wiring `bpl-tools` controls into Gutenberg's `edit.js`:

```javascript
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useEffect } from '@wordpress/element';

// Components from bpl-tools
import {
  Dimension,
  ColorControl,
  Typography,
  Background,
  BtnGroup,
  Device
} from '../../../../bpl-tools/Components';
import Advanced from '../../../../bpl-tools/Advanced';
import generateCSS from '../../../../bpl-tools/Advanced/generateCSS';
import { useDeviceWidth, useIframeAssetSync, usePremiumInEditor } from '../../../../bpl-tools/hooks';

export default function Edit({ attributes, setAttributes, clientId }) {
  const {
    blockId,
    contentPadding,
    titleColor,
    titleTypography,
    cardBg,
    align,
    advancedSettings
  } = attributes;

  // 1. Ensure unique block DOM ID
  useEffect(() => {
    if (!blockId) {
      setAttributes({ blockId: `bpl-block-${clientId.slice(0, 8)}` });
    }
  }, [clientId, blockId]);

  // 2. Synchronize iframe assets for WP 6.3+ editor canvas
  useIframeAssetSync();

  // 3. Responsive preview device sync
  const { device } = useDeviceWidth();

  // 4. Pro status check
  const isPremium = usePremiumInEditor();

  // 5. Compile Advanced CSS (id, advanced, isBackend = true, isFirstChild = true)
  const compiledCSS = generateCSS(blockId, advancedSettings, true);

  const blockProps = useBlockProps({
    id: blockId,
    className: `${blockId} bpl-custom-block`
  });

  return (
    <>
      <style>{compiledCSS}</style>

      <InspectorControls>
        {/* Device Switcher */}
        <div style={{ padding: '12px 16px 0' }}>
          <Device />
        </div>

        {/* Layout & Alignment */}
        <PanelBody title={__('Layout & Alignment', 'my-plugin')} initialOpen={true}>
          <BtnGroup
            label={__('Alignment', 'my-plugin')}
            value={align}
            defaultValue="left"
            onChange={(val) => setAttributes({ align: val })}
            options={[
              { label: 'Left', value: 'left', icon: 'editor-alignleft' },
              { label: 'Center', value: 'center', icon: 'editor-aligncenter' },
              { label: 'Right', value: 'right', icon: 'editor-alignright' }
            ]}
          />

          <Dimension
            title={__('Padding', 'my-plugin')}
            dimension={contentPadding}
            onChange={(val) => setAttributes({ contentPadding: val })}
            enabled={['padding', 'margin', 'width']}
          />
        </PanelBody>

        {/* Typography & Colors */}
        <PanelBody title={__('Typography & Colors', 'my-plugin')} initialOpen={false}>
          <ColorControl
            label={__('Title Color', 'my-plugin')}
            value={titleColor}
            defaultColor="#333333"
            onChange={(val) => setAttributes({ titleColor: val })}
          />

          <Typography
            label={__('Title Typography', 'my-plugin')}
            typography={titleTypography}
            onChange={(val) => setAttributes({ titleTypography: val })}
          />

          <Background
            label={__('Card Background', 'my-plugin')}
            value={cardBg}
            onChange={(bg) => setAttributes({ cardBg: bg })}
          />
        </PanelBody>

        {/* Advanced Tab Suite */}
        <Advanced
          advanced={advancedSettings}
          onChange={(val) => setAttributes({ advancedSettings: val })}
          id={clientId}
          isPremium={isPremium}
        />
      </InspectorControls>

      <div {...blockProps}>
        <div className="bpl-block-inner">
          <h2 className="bpl-title">{__('Block Content Preview', 'my-plugin')}</h2>
        </div>
      </div>
    </>
  );
}
```

---

## 3. Styling & CSS Compilation Engine (`getCSS.js` & `generateCSS.js`)

### 3.1 `generateCSS(id, advanced, isBackend = false, isFirstChild = true)`
Compiles the entire `advanced` configuration tree into scoped CSS.
- `id` *(string)*: Unique identifier used in the generated selector.
- `advanced` *(object)*: Contains `{ dimension, transform, background, borderShadow, mask, animation, visibility, responsive, position, floating, motion, css }`.
- `isBackend` *(boolean, default `false`)*: When `true`, scopes selectors to `#{id}>div>div:first-child` (or without `:first-child` if `isFirstChild=false`) and sets responsive hidden blocks to `opacity: 0.5`. On frontend (`false`), scopes to `#{id}>div` and sets hidden blocks to `display: none`.
- `isFirstChild` *(boolean, default `true`)*: Controls `:first-child` pseudo-class scoping in the editor.

```javascript
import generateCSS from '../../../../bpl-tools/Advanced/generateCSS';

// In edit.js:
const editorCSS = generateCSS(blockId, attributes.advancedSettings, true);

// In render.php or PHP block callback:
// Advanced/style.js automatically executes generateCSS on the frontend by reading [data-bblocks-advanced]
```

### 3.2 Functions Exported by `utils/getCSS.js`
All functions in `utils/getCSS.js` are pure utility compilers:

```javascript
import {
  isValidCSS,
  getBackgroundCSS,
  getBorderCSS,
  getBorderBoxCSS,
  getColorsCSS,
  getIconCSS,
  getMultiShadowCSS,
  getSeparatorCSS,
  getShadowCSS,
  getSpaceCSS,
  getTypoCSS,
  getBoxCSS,
  getGradientCSS,
  getAdvBGCSS,
  getOverlayCSS,
  getTransformCSS,
  getMaskCSS
} from '../../../../bpl-tools/utils/getCSS';

// 1. Shorthand padding/margin box string
const paddingCSS = getBoxCSS(attributes.padding); // e.g. { top: '10px', right: '5px' } -> "10px 5px 0 0"

// 2. Responsive typography compiler
const typoData = getTypoCSS('.my-block-title', attributes.titleTypography);
// Returns: { googleFontLink: "@import url(...);", styles: ".my-block-title { font-size: 24px; } ..." }

// 3. Responsive advanced background
const bgCSS = getAdvBGCSS(attributes.background?.normal, '.my-container');

// 4. Separator divider rule
const dividerCSS = getSeparatorCSS(attributes.divider);

// 5. Box / Text Shadow
const shadowCSS = getMultiShadowCSS(attributes.shadowList, 'box');
```

---

## 4. Component-by-Component Usage Guide

### 4.1 Typography & Text Controls

#### `Typography`
- **File:** `Components/Typography/Typography.js`
- **Exact Props:** `typography` *(required, object)*, `onChange` *(required, func)*, `label` *(string, default 'Typography')*, `className` *(string, default 'mt20')*, `defaults` *(object)*.
- **Attributes Schema:** `{ fontFamily, fontWeight, fontSize, fontStyle, textTransform, textDecoration, lineHeight, letterSpace }`.
```javascript
import { Typography } from '../../../../bpl-tools/Components';

<Typography
  label={__('Heading Typography', 'my-plugin')}
  typography={attributes.headingTypography}
  onChange={(newTypo) => setAttributes({ headingTypography: newTypo })}
/>
```

#### `TinyEditor`
- **File:** `Components/TinyEditor/TinyEditor.js`
- **Exact Props:** `value` *(string)*, `onChange` *(required, func)*, `height` *(string, default '180px')*, `media_button` *(bool, default true)*, `quicktags` *(bool, default true)*, `className` *(string)*.
```javascript
import { TinyEditor } from '../../../../bpl-tools/Components';

<TinyEditor
  value={attributes.bio}
  onChange={(content) => setAttributes({ bio: content })}
  height="220px"
  media_button={false}
/>
```

#### `BlockContentEditor` & `BlockContentModal`
- **File:** `Components/BlockContentEditor/BlockContentEditor.js`
- **Exact Props:** `value` *(string)*, `onChange` *(func)*, `area` *({ width, height, background })*, `settings` *(object)*.
- **Modal Props:** `isOpen` *(bool)*, `onClose` *(func)*, `title` *(string)*, `value`, `onChange`.
```javascript
import BlockContentEditor, { BlockContentModal } from '../../../../bpl-tools/Components/BlockContentEditor/BlockContentEditor';

<BlockContentModal
  isOpen={isContentModalOpen}
  onClose={() => setContentModalOpen(false)}
  title={__('Edit Card Markup', 'my-plugin')}
  value={attributes.rawContent}
  onChange={(html) => setAttributes({ rawContent: html })}
/>
```

#### `CustomCodeEditor`
- **File:** `Components/CustomCodeEditor/CustomCodeEditor.js`
- **Exact Props:** `value` *(string)*, `onChange` *(func)*, `height` *(string, default '300px')*, `width` *(string, default '100%')*, `wrap` *(bool, default false)*.
```javascript
import { CustomCodeEditor } from '../../../../bpl-tools/Components';

<CustomCodeEditor
  value={attributes.customCss}
  onChange={(css) => setAttributes({ customCss: css })}
  height="200px"
  wrap={true}
/>
```

#### `DynamicTag`
- **File:** `Components/DynamicTag/DynamicTag.js`
- **Exact Props:** `tagName` *(string, e.g. 'h1', 'h2', 'div', 'p')*, `...props`.
```javascript
import { DynamicTag } from '../../../../bpl-tools/Components';

<DynamicTag tagName={attributes.titleTag || 'h2'} className="bpl-title">
  {attributes.titleText}
</DynamicTag>
```

#### `Label`
- **File:** `Components/Label/Label.js`
- **Exact Props:** `htmlFor` *(string)*, `className` *(string, default 'mt20 mb5')*, `children` *(node)*.
```javascript
import { Label } from '../../../../bpl-tools/Components';

<Label htmlFor="my-input-id">{__('Custom Field Label', 'my-plugin')}</Label>
```

---

### 4.2 Dimensions & Spacing Controls

#### `Dimension`
- **File:** `Components/Dimension/Dimension.js`
- **Exact Props:** `dimension` *(required, object)*, `onChange` *(required, func)*, `title` *(string, default __('Dimension'))*, `enabled` *(array, e.g. `['padding', 'margin', 'width', 'minWidth', 'maxWidth', 'height', 'minHeight']`)*. Automatically connects to device view state via `withSelect`.
```javascript
import { Dimension } from '../../../../bpl-tools/Components';

<Dimension
  title={__('Box Dimensions', 'my-plugin')}
  dimension={attributes.boxDimensions}
  onChange={(val) => setAttributes({ boxDimensions: val })}
  enabled={['padding', 'margin', 'width']}
/>
```

#### `BoxControl`
- **File:** `Components/BoxControl/BoxControl.js`
- **Exact Props:** `values` *(object: `{ top, right, bottom, left }`)*, `onChange` *(func)*, `label` *(string)*, `resetValues` *(object)*, `units` *(array)*, `sides` *(array)*, `disableUnits` *(bool, default false)*, `className` *(string)*.
```javascript
import { BoxControl } from '../../../../bpl-tools/Components';

<BoxControl
  label={__('Card Margin', 'my-plugin')}
  values={attributes.cardMargin}
  onChange={(newMargin) => setAttributes({ cardMargin: newMargin })}
  units={['px', 'rem', '%']}
  sides={['top', 'bottom']}
/>
```

---

### 4.3 Color & Background Controls

#### `ColorControl` & `HexColorControl`
- **File:** `Components/ColorControl/ColorControl.js`
- **Exact Props:** `value` *(string)*, `onChange` *(func)*, `label` *(string, default 'Color:')*, `defaultColor` *(string, enables reset button)*, `disableAlpha` *(bool, default false)*, `className` *(string)*.
- `ColorControl` returns `rgba(r, g, b, a)`. `HexColorControl` returns `#rrggbbaa`.
```javascript
import { ColorControl, HexColorControl } from '../../../../bpl-tools/Components';

<ColorControl
  label={__('Overlay Color', 'my-plugin')}
  value={attributes.overlayColor}
  defaultColor="rgba(0, 0, 0, 0.5)"
  onChange={(color) => setAttributes({ overlayColor: color })}
/>

<HexColorControl
  label={__('Text Color', 'my-plugin')}
  value={attributes.textColor}
  defaultColor="#111827"
  onChange={(hex) => setAttributes({ textColor: hex })}
/>
```

#### `ColorsControl`
- **File:** `Components/ColorsControl/ColorsControl.js`
- **Exact Props:** `value` *(object)*, `onChange` *(func)*, `label` *(string)*. Provides Normal and Hover state color tabs.
```javascript
import { ColorsControl } from '../../../../bpl-tools/Components';

<ColorsControl
  label={__('Link Colors', 'my-plugin')}
  value={attributes.linkColors}
  onChange={(val) => setAttributes({ linkColors: val })}
/>
```

#### `Background`
- **File:** `Components/Background/Background.js`
- **Exact Props:** `value` *(object: `{ type, color, gradient, image, position, attachment, repeat, size, overlayColor }`)*, `onChange` *(func)*, `label` *(string, default 'Background')*, `isSolid` *(bool, default true)*, `isGradient` *(bool, default true)*, `isImage` *(bool, default true)*, `gradients` *(array)*.
```javascript
import { Background } from '../../../../bpl-tools/Components';

<Background
  label={__('Hero Background', 'my-plugin')}
  value={attributes.heroBackground}
  onChange={(bg) => setAttributes({ heroBackground: bg })}
  isSolid={true}
  isGradient={true}
  isImage={true}
/>
```

#### `AdvBackground`
- **File:** `Components/AdvBackground/AdvBackground.js`
- **Exact Props:** `name` *(string, default 'Background')*, `value` *(object: `{ type, color, gradient, img, video }`)*, `onChange` *(func)*, `isVideo` *(bool, default false)*, `device` *(string)*.
```javascript
import { AdvBackground } from '../../../../bpl-tools/Components';

<AdvBackground
  name={__('Container Background', 'my-plugin')}
  value={attributes.containerBg}
  onChange={(val) => setAttributes({ containerBg: val })}
  isVideo={true}
/>
```

#### `SolidBackground` & `Gradient`
- **Files:** `Components/SolidBackground/SolidBackground.js`, `Components/Gradient/Gradient.js`
```javascript
import { SolidBackground, Gradient } from '../../../../bpl-tools/Components';

<SolidBackground
  label={__('Background Color', 'my-plugin')}
  value={attributes.bgColor}
  onChange={(col) => setAttributes({ bgColor: col })}
/>

<Gradient
  value={attributes.grad}
  onChange={(newGrad) => setAttributes({ grad: newGrad })}
/>
```

#### `OverlayControl`
- **File:** `Components/OverlayControl/OverlayControl.js`
- **Exact Props:** `value` *(object: `{ isEnabled, colors, opacity, blend, filter, blur, brightness, contrast, saturation, hue, position, zIndex }`)*, `onChange` *(func)*.
```javascript
import { OverlayControl } from '../../../../bpl-tools/Components';

<OverlayControl
  value={attributes.overlaySettings}
  onChange={(val) => setAttributes({ overlaySettings: val })}
/>
```

---

### 4.4 Advanced Visual & Motion Controls

#### `AdvFloating`
- **File:** `Components/AdvFloating/AdvFloating.js`
- **Exact Props:** `floating` *(object: `{ isEnabled, translate, rotate, scale }`)*, `onChange` *(func)*.
```javascript
import { AdvFloating } from '../../../../bpl-tools/Components';

<AdvFloating
  floating={attributes.floatingEffect}
  onChange={(val) => setAttributes({ floatingEffect: val })}
/>
```

#### `AdvMotionEffects`
- **File:** `Components/AdvMotionEffects/AdvMotionEffects.js`
- **Exact Props:** `motion` *(object: `{ isEnable, vertical, horizontal, transparency, blur, rotate, scale, effectsRelativeTo, effectOn, isMouseEffect, mouseTrack, tilt, sticky }`)*, `onChange` *(func)*.
```javascript
import { AdvMotionEffects } from '../../../../bpl-tools/Components';

<AdvMotionEffects
  motion={attributes.motionEffect}
  onChange={(val) => setAttributes({ motionEffect: val })}
/>
```

#### `AdvPosition`
- **File:** `Components/AdvPosition/AdvPosition.js`
- **Exact Props:** `position` *(object: `{ desktop, tablet, mobile }`)*, `onChange` *(func)*.
```javascript
import { AdvPosition } from '../../../../bpl-tools/Components';

<AdvPosition
  position={attributes.positionConfig}
  onChange={(val) => setAttributes({ positionConfig: val })}
/>
```

#### `AdvTransform`
- **File:** `Components/AdvTransform/AdvTransform.js`
- **Exact Props:** `value` *(object: `{ rotate, scale, skew, offset, flipX, flipY }`)*, `onChange` *(func)*, `device` *(string)*.
```javascript
import { AdvTransform } from '../../../../bpl-tools/Components';

<AdvTransform
  value={attributes.transformSettings}
  onChange={(val) => setAttributes({ transformSettings: val })}
/>
```

#### `Mask`
- **File:** `Components/Mask/Mask.js`
- **Exact Props:** `mask` *(object: `{ isMask, shape, size, position, repeat }`)*, `onChange` *(func)*.
```javascript
import { Mask } from '../../../../bpl-tools/Components';

<Mask
  mask={attributes.maskSettings}
  onChange={(val) => setAttributes({ maskSettings: val })}
/>
```

#### `SeparatorControl`
- **File:** `Components/SeparatorControl/SeparatorControl.js`
- **Exact Props:** `separator` *(object: `{ width, height, style, color }`)*, `onChange` *(func)*, `label` *(string, default 'Separator')*, `className` *(string, default 'mt20')*.
```javascript
import { SeparatorControl } from '../../../../bpl-tools/Components';

<SeparatorControl
  label={__('Card Divider', 'my-plugin')}
  separator={attributes.divider}
  onChange={(val) => setAttributes({ divider: val })}
/>
```

#### `ShadowControl`
- **File:** `Components/ShadowControl/ShadowControl.js`
- **Exact Props:** `value` *(array of shadow objects)*, `onChange` *(func)*, `label` *(string, default 'Shadow')*, `className` *(string, default 'mt20')*.
```javascript
import { ShadowControl } from '../../../../bpl-tools/Components';

<ShadowControl
  label={__('Box Shadow', 'my-plugin')}
  value={attributes.boxShadows}
  onChange={(val) => setAttributes({ boxShadows: val })}
/>
```

---

### 4.5 Buttons, Toggles & Group Controls

#### `BtnGroup`
- **File:** `Components/BtnGroup/BtnGroup.js`
- **Exact Props:** `options` *(array of `{ value, label, icon?, def? }`)*, `value` *(string)*, `onChange` *(func)*, `label` *(string)*, `defaultValue` *(string)*, `labelPosition` *('left' | 'top')*, `isIcon` *(bool)*, `size` *('compact' | 'small' | 'default')*.
```javascript
import { BtnGroup } from '../../../../bpl-tools/Components';

<BtnGroup
  label={__('Text Alignment', 'my-plugin')}
  value={attributes.textAlign}
  defaultValue="left"
  onChange={(val) => setAttributes({ textAlign: val })}
  options={[
    { label: 'Left', value: 'left', icon: 'editor-alignleft' },
    { label: 'Center', value: 'center', icon: 'editor-aligncenter' },
    { label: 'Right', value: 'right', icon: 'editor-alignright' }
  ]}
  isIcon={true}
/>
```

#### `BButtonGroup`
- **File:** `Components/BButtonGroup/BButtonGroup.js`
- **Exact Props:** `options` *(array of `{ value, label }`)*, `value` *(string)*, `onChange` *(func)*, `label` *(string)*, `borderRadius` *(string)*, `activeBg` *(string)*, `activeColor` *(string)*.
```javascript
import { BButtonGroup } from '../../../../bpl-tools/Components';

<BButtonGroup
  label={__('Display Mode', 'my-plugin')}
  value={attributes.mode}
  onChange={(val) => setAttributes({ mode: val })}
  options={[
    { value: 'grid', label: 'Grid' },
    { value: 'carousel', label: 'Carousel' }
  ]}
  activeBg="#146EF5"
  activeColor="#ffffff"
/>
```

#### `Button`
- **File:** `Components/Button/Button.js`
- **Exact Props:** `onClick` *(func)*, `href` *(string)*, `target` *(string)*, `variant` *('primary' | 'secondary' | 'tertiary')*, `size` *('small' | 'medium')*, `disabled` *(bool)*, `children` *(node)*. Renders `<button>` when `onClick` is passed, `<a>` when `href` is passed.
```javascript
import { Button } from '../../../../bpl-tools/Components';

<Button variant="primary" onClick={() => console.log('Clicked')}>
  {__('Save Settings', 'my-plugin')}
</Button>
```

#### `MultiSelectControl` & `SelectPureControl`
- **Files:** `Components/MultiSelectControl/MultiSelectControl.js`, `Components/SelectPureControl/SelectPureControl.js`
```javascript
import { MultiSelectControl, SelectPureControl } from '../../../../bpl-tools/Components';

<MultiSelectControl
  value={attributes.selectedTags}
  onChange={(tags) => setAttributes({ selectedTags: tags })}
  options={[
    { label: 'React', value: 'react' },
    { label: 'WordPress', value: 'wordpress' },
    { label: 'Gutenberg', value: 'gutenberg' }
  ]}
  limit={5}
/>
```

#### `SelectTokenField`
- **File:** `Components/SelectTokenField/SelectTokenField.js`
- **Exact Props:** `options` *(array of `{ value, label }`)*, `value` *(string|array)*, `defaultValue` *(string|array)*, `onChange` *(func)*, `multiple` *(bool, default true)*.
```javascript
import { SelectTokenField } from '../../../../bpl-tools/Components';

<SelectTokenField
  options={categoryOptions}
  value={attributes.categories}
  onChange={(val) => setAttributes({ categories: val })}
  multiple={true}
/>
```

#### `SortableControl`
- **File:** `Components/SortableControl/SortableControl.js`
- **Exact Props:** `value` *(array)*, `property` *(string, display label property)*, `onChange` *(func)*, `label` *(string)*.
```javascript
import { SortableControl } from '../../../../bpl-tools/Components';

<SortableControl
  label={__('Reorder Elements', 'my-plugin')}
  value={attributes.cardElements}
  property="title"
  onChange={(newOrder) => setAttributes({ cardElements: newOrder })}
/>
```

---

### 4.6 Icon & Media Controls

#### `IconControl` & `IconLibrary`
- **Files:** `Components/IconControl/IconControl.js`, `Components/IconLibrary/IconLibrary.js`
- **IconControl Props:** `value` *(`{ class, fontSize, colorType, color, gradient }`)*, `onChange` *(func)*, `label` *(string)*, `isSize` *(bool)*, `isColor` *(bool)*.
- **IconLibrary Props:** `value` *(string)*, `onChange` *(func)*, `label` *(string)*.
```javascript
import { IconControl, IconLibrary } from '../../../../bpl-tools/Components';

<IconControl
  label={__('Card Icon', 'my-plugin')}
  value={attributes.iconSettings}
  onChange={(val) => setAttributes({ iconSettings: val })}
  isSize={true}
  isColor={true}
/>

<IconLibrary
  value={attributes.iconClass}
  onChange={(icon) => setAttributes({ iconClass: icon })}
/>
```

#### `MediaControl` Suite
- **File:** `Components/MediaControl/MediaControl.js`
- `MediaControl.js` exports 5 distinct specialized subcomponents:
  1. `InlineMediaUpload`: URL text input with media upload button. Returns string URL.
  2. `InlineDetailMediaUpload`: URL text input with media upload button. Returns `{ id, url, alt, title, caption }`.
  3. `MediaArea`: Square or rectangular image preview container with hover upload/delete buttons and MIME validation.
  4. `MediaPlaceholder`: Canvas placeholder state for empty blocks (Upload button + paste URL field).
  5. `MediaEditControl`: Block toolbar group button for inline image replacing.

```javascript
import {
  InlineMediaUpload,
  InlineDetailMediaUpload,
  MediaArea,
  MediaPlaceholder,
  MediaEditControl
} from '../../../../bpl-tools/Components/MediaControl/MediaControl';

// 1. Inspector Inline URL + Picker:
<InlineMediaUpload
  label={__('Image URL', 'my-plugin')}
  value={attributes.imageUrl}
  onChange={(url) => setAttributes({ imageUrl: url })}
  types={['image']}
/>

// 2. Inspector Image Preview Thumbnail Area:
<MediaArea
  label={__('Choose Avatar', 'my-plugin')}
  value={attributes.avatar}
  onChange={(val) => setAttributes({ avatar: val })}
  width="80px"
  height="80px"
  types={['image']}
/>

// 3. Canvas Block Toolbar Replace Button:
<MediaEditControl
  label={__('Replace Photo', 'my-plugin')}
  value={attributes.photo}
  onChange={(photo) => setAttributes({ photo })}
/>

// 4. Canvas Empty Placeholder State:
{!attributes.imageUrl && (
  <MediaPlaceholder
    onChange={(val) => setAttributes({ imageUrl: val.url })}
    type="image"
  />
)}
```

---

### 4.7 Repeater & List Controls (`ItemsPanel`)

#### `ItemsPanel`
- **File:** `Components/ItemsPanel/ItemsPanel.js`
- **Exact Props:**
  - `value` *(array)*: Array of items when managing state independently.
  - `onChange` *(func)*: Setter when using `value`.
  - `attributes` *(object)*: Block attributes object when managing block attributes directly.
  - `setAttributes` *(func)*: Gutenberg `setAttributes` function.
  - `arrKey` *(string)*: Attribute key within `attributes` holding the items array.
  - `newItem` *(object)*: Default schema template used when creating a new item.
  - `ItemSettings` *(component)*: React component rendered inside each expanded accordion item: receives `(item, index)`.
  - `itemLabel` *(string, default 'Item')*: Label prefix.
  - `minItem` *(number, default 1)*: Minimum items required before delete is disabled.
  - `handleCopy`, `handleDelete`, `handleAdd` *(optional callbacks)*: Override default item duplication, deletion, and addition.

```javascript
import { ItemsPanel } from '../../../../bpl-tools/Components';
import { TextControl } from '@wordpress/components';

const MemberSettings = ({ item, index, updateItem }) => (
  <div style={{ padding: '8px 0' }}>
    <TextControl
      label={__('Name', 'my-plugin')}
      value={item.name}
      onChange={(val) => updateItem('name', val)}
    />
    <TextControl
      label={__('Designation', 'my-plugin')}
      value={item.role}
      onChange={(val) => updateItem('role', val)}
    />
  </div>
);

export default function TeamBlock({ attributes, setAttributes }) {
  return (
    <ItemsPanel
      title={__('Team Members', 'my-plugin')}
      attributes={attributes}
      setAttributes={setAttributes}
      arrKey="members"
      newItem={{ name: 'New Member', role: 'Staff' }}
      ItemSettings={MemberSettings}
      itemLabel={__('Member', 'my-plugin')}
      minItem={1}
    />
  );
}
```

---

### 4.8 UI Display, Badges & Feedback Controls

#### `Badge`
- **File:** `Components/Badge/index.js`
- **Exact Props:** `label` *(string, default 'NEW')*, `icon` *(element)*, `size` *('small' | 'regular' | 'medium')*, `color`, `background`, `borderColor`, `className`.
```javascript
import { Badge } from '../../../../bpl-tools/Components';

<Badge label="PRO" size="small" color="#ffffff" background="#146EF5" />
```

#### `Notice`
- **File:** `Components/Notice/index.js`
- **Exact Props:** `status` *('info' | 'success' | 'warning' | 'danger' | 'premium')*, `isIcon` *(bool, default false)*, `className`, `children` *(node)*.
```javascript
import { Notice } from '../../../../bpl-tools/Components';

<Notice status="warning" isIcon={true}>
  {__('Please configure your license key to enable live syncing.', 'my-plugin')}
</Notice>
```

#### `Loading`
- **File:** `Components/Loading/Loading.js`
- **Exact Props:** `text` *(string, default 'Loading...')*, `orientation` *('horizontal' | 'vertical')*, `iconSize`, `iconThickness`, `textSize`.
```javascript
import { Loading } from '../../../../bpl-tools/Components';

<Loading text={__('Fetching templates...', 'my-plugin')} orientation="vertical" />
```

#### `BplBlockPreview`
- **File:** `Components/BplBlockPreview/BplBlockPreview.js`
- **Exact Props:** `blocks` *(required, array)*, `clientId` *(string)*, `value` *(object)*, `minHeight` *(string)*, `minWidth` *(string)*, `viewportWidth` *(number, default 1600)*, `replaceBlock` *(func)*.
```javascript
import { BplBlockPreview } from '../../../../bpl-tools/Components';

<BplBlockPreview
  blocks={presetBlockList}
  replaceBlock={(content) => handlePresetInsert(content)}
/>
```

#### `HelpPanel` & `HelpTooltip`
- **Files:** `Components/HelpPanel/HelpPanel.js`, `Components/HelpTooltip/HelpTooltip.js`
```javascript
import { HelpPanel, HelpTooltip } from '../../../../bpl-tools/Components';

<HelpTooltip text={__('Choose between flexbox grid or masonry layout.', 'my-plugin')} />

<HelpPanel
  slug="gs-team-member"
  docsLink="https://example.com/documentation"
/>
```

#### `BBlocksAds`
- **File:** `Components/Utility/BBlocksAds.js`
- **Exact Props:** None (stateless promotional banner).
```javascript
import { BBlocksAds } from '../../../../bpl-tools/Components';

<BBlocksAds />
```

---

### 4.9 Advanced Tab Suite (`Advanced`)

- **File:** `Advanced/index.js`
- **Exact Props:**
  - `advanced` *(required, object)*: Combined advanced state tree.
  - `onChange` *(required, func)*: Handler receiving the updated advanced tree.
  - `enabled` *(optional, object)*: Controls which sections and features appear. Defaults to all standard features.
  - `id` *(optional, string)*: DOM ID passed to the Animation section.
  - `isPremium` *(optional, bool, default false)*: Unlocks Motion Effects, Floating, Position, Transform, and Mask.

```javascript
import Advanced from '../../../../bpl-tools/Advanced';

<Advanced
  advanced={attributes.advancedSettings}
  onChange={(val) => setAttributes({ advancedSettings: val })}
  id={clientId}
  isPremium={isPremium}
  enabled={{
    dimension: ['padding', 'margin', 'width'],
    background: ['normal', 'hover', 'overlay'],
    borderShadow: ['normal', 'hover', 'border', 'shadow'],
    transform: true,
    floating: true,
    motion: true,
    position: true,
    mask: true,
    animation: true,
    visibility: ['zIndex', 'overflow'],
    responsive: true,
    css: true
  }}
/>
```

---

## 5. Monetization & Pro Feature Gating (`ProControls`)

### 5.1 Checking Pro Status in Editor
```javascript
import { usePremiumInEditor } from '../../../../bpl-tools/hooks';

export default function Inspector() {
  const isPremium = usePremiumInEditor();
  // Reads window.bPlLicenseActivation or Freemius state directly
}
```

### 5.2 Gating Any Control with `BControlPro`
`BControlPro` intercepts user clicks on disabled features and triggers the `ProModal`:
```javascript
import { useState } from '@wordpress/element';
import { ToggleControl } from '@wordpress/components';
import { BControlPro, ProModal } from '../../../../bpl-tools/ProControls';

export default function ProFeatureWrapper({ attributes, setAttributes }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isPremium = false;

  return (
    <>
      <BControlPro
        isPremium={isPremium}
        onClickProBadge={() => setIsModalOpen(true)}
      >
        <ToggleControl
          label={__('Enable 3D Tilt Parallax', 'my-plugin')}
          checked={attributes.tiltParallax}
          onChange={(val) => setAttributes({ tiltParallax: val })}
        />
      </BControlPro>

      <ProModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={__('Unlock 3D Parallax & Pro Blocks', 'my-plugin')}
        description={__('Upgrade to Pro to enable advanced motion graphics.', 'my-plugin')}
        pricingUrl="https://example.com/pricing"
      />
    </>
  );
}
```

### 5.3 Pro Segmented Buttons (`BtnGroupPro`)
```javascript
import { BtnGroupPro } from '../../../../bpl-tools/ProControls';

<BtnGroupPro
  label={__('Card Hover Animation', 'my-plugin')}
  value={attributes.hoverAnimation}
  onChange={(val) => setAttributes({ hoverAnimation: val })}
  isPremium={isPremium}
  onProClick={() => setIsModalOpen(true)}
  options={[
    { label: 'None', value: 'none' },
    { label: 'Fade', value: 'fade' },
    { label: 'Zoom (Pro)', value: 'zoom', isPro: true }
  ]}
/>
```

### 5.4 Pro Radio & Select Controls (`RadioControlPro` & `SelectControlPro`)
```javascript
import { RadioControlPro, SelectControlPro } from '../../../../bpl-tools/ProControls';

// Gated radio selection
<RadioControlPro
  label={__('Layout Style', 'my-plugin')}
  selected={attributes.style}
  options={[
    { label: 'Basic List', value: 'list' },
    { label: '3D Carousel', value: 'carousel', isPro: true }
  ]}
  onChange={(val) => setAttributes({ style: val })}
  isPremium={isPremium}
  onProClick={() => setIsModalOpen(true)}
/>

// Gated dropdown selection
<SelectControlPro
  label={__('Hover Effect', 'my-plugin')}
  value={attributes.hoverEffect}
  options={[
    { label: 'None', value: 'none' },
    { label: 'Flip Card', value: 'flip', isPro: true }
  ]}
  onChange={(val) => setAttributes({ hoverEffect: val })}
  isPremium={isPremium}
  onProClick={() => setIsModalOpen(true)}
/>
```

### 5.5 Promotional Banners & Modals (`AboutProModal`, `AdvertiseCard`, `ProAds`, `FrontShortCode`, `PremiumPanel`, `PremiumBadge`)
```javascript
import {
  AboutProModal,
  AdvertiseCard,
  ProAds,
  FrontShortCode,
  PremiumPanel,
  PremiumBadge
} from '../../../../bpl-tools/ProControls';

// 1. Feature comparison modal
<AboutProModal
  isOpen={isAboutOpen}
  onClose={() => setIsAboutOpen(false)}
  features={[
    { title: 'Unlimited Team Members', pro: true, free: false },
    { title: 'Custom SVG Icons', pro: true, free: true }
  ]}
  pricingUrl="https://example.com/pricing"
/>

// 2. Promotional sidebar card
<AdvertiseCard
  title={__('Upgrade to Pro', 'my-plugin')}
  description={__('Get access to all 50+ blocks and priority support.', 'my-plugin')}
  url="https://example.com/pricing"
/>

// 3. Compact Pro Ads banner
<ProAds
  title={__('Save 20% on Lifetime Plan', 'my-plugin')}
  url="https://example.com/pricing"
/>

// 4. Standalone Pro Badge & Panel
<PremiumBadge text="PRO" />

<PremiumPanel title={__('Premium Styling', 'my-plugin')} isPremium={isPremium}>
  <p>{__('Advanced gradient and clip-path filters.', 'my-plugin')}</p>
</PremiumPanel>

// 5. Shortcode display generator
<FrontShortCode
  shortcode={`[gs_team id="${attributes.blockId}"]`}
  label={__('Embed Shortcode', 'my-plugin')}
/>
```

---

## 6. WordPress Admin Dashboard Framework (`Admin`)

`bpl-tools/Admin` provides a complete single-page dashboard architecture based on `react-router-dom` and `HashRouter`.

### 6.1 Complete Admin `App.js` Example
```javascript
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import Header from '../../../../bpl-tools/Admin/Header';
import Overview from '../../../../bpl-tools/Admin/Overview';
import Blocks from '../../../../bpl-tools/Admin/Blocks';
import Demos from '../../../../bpl-tools/Admin/Demos';
import Pricing from '../../../../bpl-tools/Admin/Pricing';
import Activation from '../../../../bpl-tools/Admin/Activation';
import Settings from '../../../../bpl-tools/Admin/Settings';
import OurPlugins from '../../../../bpl-tools/Admin/OurPlugins';
import Onboarding from '../../../../bpl-tools/Admin/Onboarding';

export default function AdminApp() {
  const isPremium = false;

  return (
    <HashRouter>
      <div className="bpl-admin-wrapper">
        <Header
          name="GS Team Member"
          version="2.1.0"
          isPremium={isPremium}
          media={{ logo: 'https://example.com/logo.svg' }}
          displayOurPlugins={true}
        />

        <div className="bpl-admin-content">
          <Switch>
            <Route path="/overview" component={() => (
              <Overview
                name="GS Team Member"
                slug="gs-team-member"
                media={{ thumbnail: 'https://example.com/thumb.jpg' }}
                pages={{ docs: 'https://example.com/docs', landing: 'https://example.com' }}
              />
            )} />

            <Route path="/blocks" component={() => (
              <Blocks
                isPremium={isPremium}
                allBlocks={[
                  { name: 'team-grid', title: 'Team Grid', description: 'Grid display', icon: 'grid-view' },
                  { name: 'team-slider', title: 'Team Slider', description: 'Touch carousel', icon: 'slides', isPro: true }
                ]}
                disabledBlocks={[]}
                onChange={(updatedDisabledList) => console.log(updatedDisabledList)}
                status="success"
              />
            )} />

            <Route path="/pricing" component={() => (
              <Pricing
                pricingInfo={{
                  pluginId: '1234',
                  planId: '5678',
                  licenses: [1, 5, 25],
                  cycles: ['annual', 'lifetime'],
                  button: { text: 'Upgrade Now' }
                }}
                options={{}}
              />
            )} />

            <Route path="/activation" component={() => (
              <Activation
                name="GS Team Member"
                slug="gs-team-member"
                version="2.1.0"
                media={{ logo: 'https://example.com/logo.svg' }}
                freemius={{ product_id: '1234', public_key: 'pk_xxxxxxxx' }}
                licenseActiveNonce={window.bPlLicenseActivation?.nonce}
              />
            )} />

            <Route path="/settings" component={() => (
              <Settings
                name="GS Team Member"
                deleteDataOnUninstall={false}
                uninstallNonce={window.bPlLicenseActivation?.nonce}
                ajaxAction="gstm_save_uninstall_settings"
              />
            )} />

            <Route path="/our-plugins" component={OurPlugins} />
            <Redirect to="/overview" />
          </Switch>
        </div>
      </div>
    </HashRouter>
  );
}
```

---

## 7. Hooks Reference

### 7.1 `useDeviceWidth()`
- **File:** `hooks/useDeviceWidth.js`
- **Returns:** `{ device, setDevice }`. Synchronizes with WordPress core preview state (`desktop`, `tablet`, `mobile`).

### 7.2 `useIframeAssetSync()`
- **File:** `hooks/useIframeAssetSync.js`
- **Usage:** Injects and mirrors parent document head assets (`<link rel="stylesheet">`, Google Fonts, custom styles) into `iframe[name="editor-canvas"]` for WordPress 6.3+.

### 7.3 `useOutsideDetect(ref, callback)`
- **File:** `hooks/useOutsideDetect.js`
- **Usage:** Listens for mousedown outside `ref.current` and invokes `callback()`. Ideal for popovers, flyouts, and dropdowns.

### 7.4 `usePremium()` & `usePremiumInEditor()`
- **Files:** `hooks/usePremium.js`, `hooks/usePremiumInEditor.js`
- **Usage:** Returns boolean indicating if active site / editor instance is running Pro.

### 7.5 `useWPAjax(action, options)`
- **File:** `hooks/useWPAjax.js`
- **Returns:** `{ data, loading, error, request }`. Executes WordPress `admin-ajax.php` actions with nonce verification.

### 7.6 `useWPOptionQuery(optionName)`
- **File:** `hooks/useWPOptionQuery.js`
- **Returns:** `{ option, setOption, loading }`. Reads and writes options stored in `wp_options` via WordPress REST API.

### 7.7 `useAnimation(element, animation)`
- **File:** `hooks/useAnimation.js`
- **Usage:** Attaches AOS (Animate On Scroll) attributes (`data-aos`, `data-aos-duration`, `data-aos-delay`) to a DOM element, initialises `window.AOS.init()`, and mounts an `IntersectionObserver` in the backend editor for instant previewing.

### 7.8 `useRenderedBlocks()`
- **File:** `hooks/useRenderedBlocks.js`
- **Usage:** Subscribes to the block editor data store and returns a list of all currently rendered blocks on the canvas, enabling blocks to inspect their siblings or count active instances.

---

## 8. Template Library Integration

- **File:** `TemplateLibrary/index.js`
- **Usage Pattern:**
```javascript
import TemplateLibrary from '../../../../bpl-tools/TemplateLibrary';

<TemplateLibrary
  prefix="gstm"
  logo={<img src="https://example.com/logo.svg" alt="GS" />}
  buttonLabel={__('Templates', 'my-plugin')}
  modalTitle={__('GS Template Library', 'my-plugin')}
  nonce={window.gstmData?.nonce}
  isPremium={isPremium}
  textDomain="my-plugin"
  ajaxActionMain="gstm_templates_main"
  ajaxActionTemplates="gstm_templates"
  ajaxActionImport="gstm_template_import"
  ajaxActionCounts="gstm_template_counts"
  pricingUrl="https://example.com/pricing"
  importButtonLabel={__('Import Template', 'my-plugin')}
  types={['patterns', 'pages']}
/>
```

---

## 9. Pure Utility Functions Quick Reference

### 9.1 Data Validation & Sanitization (`utils/common.js`)
- `isExist(value)`: Strict non-empty check. Returns `false` for `undefined`, `null`, `''`, `[]`, `{}`, and `0`.
- `escapeHTML(input)`: Replaces disallowed HTML tags with entities while allowing safe formatting tags (`b`, `strong`, `i`, `em`, `span`, `a`, `br`).
- `sanitizeURL(url, allowedProtocols)`: Strips control characters; validates protocol against `http:`, `https:`, `mailto:`, `tel:`.
- `sanitizeHTML(input)`: Parses via DOMParser, removing unauthorized tags and script attributes.
- `sanitizeInput(input)`: Strips `<`, `>`, `javascript:`, and `on*` inline events.
- `SVGSanitizer`: Full XML parser class that purges script tags, remote URLs, and inline handlers from SVGs.
- `sanitizeSVG(svg)`: Singleton helper executing `svgSanitizer.sanitize(svg)`.

### 9.2 State & Object Mutation Helpers (`utils/functions.js`)
- `produce(baseState, recipe)`: Immer's immutable state producer.
- `updateData(attr, value, ...props)`: Deeply updates nested properties inside an immutable state object:
  ```javascript
  const next = updateData(attributes, '#ff0000', 'advancedSettings', 'background', 'color');
  ```
- `updateAttributes(attributes, setAttributes)`: Higher-order wrapper:
  ```javascript
  const updateAttr = updateAttributes(attributes, setAttributes);
  updateAttr('cardSettings', 'center', 'align');
  ```
- `getBoxValue(object)`: Joins object values with spaces (`{ top: '10px', right: '5px' }` -> `'10px 5px'`).
- `getImageSizes(image, imageSizes)`: Formats WordPress media attachment sizes into `{ label, value }` dropdown options.
- `tabController()`: Attaches click handlers to `.bPlPanelBody:not(.itemPanelBody)` headings to enforce single-expanded accordion behavior.
- `randomNumber(number)`: Returns integer random number between `0` and `number`.
- `debounce(fn, delay)`: Execution debouncer with timer reset.
- `getRandomColor()`: Generates random hex color strings.
- `MimeTypeChecker`: Comprehensive static class validating extensions and MIME types (`isValidMimeType`, `isImage`, `isVideo`, `isAudio`, `isDocument`, `validateFile`).

### 9.3 Preset Breakpoints & Colors (`utils/data.js` & `utils/options.js`)
- `deskBreakpoint`: `@media only screen and (min-width: 1025px)`
- `tabBreakpoint`: `@media only screen and (max-width: 1024px)`
- `mobileBreakpoint`: `@media only screen and (max-width: 640px)`
- Color Presets: `primaryColor` (`#146EF5`), `secondaryColor` (`#FF7A00`), `titleColor` (`#070127`), `contentColor` (`#485781`).

---

## 10. Common Pitfalls, Antipatterns & Best Practices

| Pitfall / Anti-Pattern | Root Cause | Correct Implementation |
| :--- | :--- | :--- |
| **Passing `value` instead of `dimension` or `typography`** | Prop names in `Dimension`, `Typography`, `SeparatorControl`, and `Mask` are strictly named after their domain (`dimension={...}`, `typography={...}`, `separator={...}`, `mask={...}`). | Check the component API table in Section 4 and use exact prop keys. |
| **Passing reversed parameters to `generateCSS`** | `generateCSS` signature is `(id, advanced, isBackend, isFirstChild)`. Reversing arguments outputs broken CSS selectors. | Always pass `blockId` (or `clientId`) first: `generateCSS(blockId, advancedSettings, true)`. |
| **Mutating nested state directly** (`attributes.dimension.padding.top = '10px'`) | Direct mutation bypasses React reconciliation and Gutenberg's dirty tracking. | Always use `updateData(attributes, '10px', 'dimension', 'padding', 'top')` or `produce()`. |
| **Omitting default attribute objects in `block.json`** | Components reading nested properties (e.g. `dimension?.padding?.desktop`) crash if attributes default to `undefined`. | Always define full default object structures in `block.json`. |
| **Manually synchronizing device viewports** | Manually creating local device states gets out of sync with WordPress's native device switchers. | Render `<Device />` without props; it automatically synchronizes with `@wordpress/data` `core/edit-post`. |
| **Modifying `bpl-tools` source files directly** | `bpl-tools` is shared across sibling plugins; changes break other plugins in the repository. | Treat `bpl-tools` as read-only. Customize via props and attributes. |

---

*This document serves as the verified operational guide for AI coding agents implementing features with `bpl-tools`. Refer to `explore.md` for architectural and technical specifications.*
