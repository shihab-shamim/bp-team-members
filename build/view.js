/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Components/Common/Team/Filters.js":
/*!***********************************************!*\
  !*** ./src/Components/Common/Team/Filters.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CatFilters: () => (/* binding */ CatFilters),
/* harmony export */   DROPDOWNS: () => (/* binding */ DROPDOWNS),
/* harmony export */   FILTER_ORDER: () => (/* binding */ FILTER_ORDER),
/* harmony export */   FilterControls: () => (/* binding */ FilterControls),
/* harmony export */   SEARCHES: () => (/* binding */ SEARCHES),
/* harmony export */   catTerms: () => (/* binding */ catTerms),
/* harmony export */   filterControls: () => (/* binding */ filterControls)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bridge */ "./src/Components/Common/Team/bridge.js");
/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./model */ "./src/Components/Common/Team/model.js");
/* harmony import */ var _sanitize__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./sanitize */ "./src/Components/Common/Team/sanitize.js");
/**
 * Filter UI: category tabs, search inputs, dropdowns (single or accessible multi-select with ellipsis),
 * reset button and live status (ports of templates/partials/cat-filters.php + filters.php and the
 * former vanilla filter behaviour). State lives in TeamMembers; this component only renders it.
 */





const SEARCHES = {
  search: ['searchByName', 'search_name'],
  company: ['searchByCompany', 'search_company'],
  zip: ['searchByZip', 'search_zip'],
  tag: ['searchByTag', 'search_tag']
};
const DROPDOWNS = {
  designation: ['filterByDesignation', '', 'field'],
  location: ['filterByLocation', 'includeLocations', 'terms'],
  language: ['filterByLanguage', 'includeLanguages', 'terms'],
  gender: ['filterByGender', 'includeGenders', 'terms'],
  specialty: ['filterBySpecialty', 'includeSpecialties', 'terms'],
  extra_one: ['filterByExtraOne', 'includeExtraOne', 'terms'],
  extra_two: ['filterByExtraTwo', 'includeExtraTwo', 'terms'],
  extra_three: ['filterByExtraThree', 'includeExtraThree', 'terms'],
  extra_four: ['filterByExtraFour', 'includeExtraFour', 'terms'],
  extra_five: ['filterByExtraFive', 'includeExtraFive', 'terms']
};
const FILTER_ORDER = ['search', 'company', 'zip', 'tag', 'designation', 'location', 'language', 'gender', 'specialty', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five'];

/** Category tabs data. */
const catTerms = (atts, pool) => (0,_model__WEBPACK_IMPORTED_MODULE_3__.filterTerms)('group', atts, pool, 'includeGroups');

/**
 * Controls to render: [{ type: search|select, key, label, options: [{ value, label, raw }] }].
 *
 * @param {Object}   atts Attributes.
 * @param {Object[]} pool Members.
 * @return {Object[]} Controls.
 */
const filterControls = (atts, pool) => {
  const out = [];
  FILTER_ORDER.forEach(key => {
    if (SEARCHES[key]) {
      if (atts[SEARCHES[key][0]]) {
        out.push({
          type: 'search',
          key,
          label: (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)(SEARCHES[key][1])
        });
      }
      return;
    }
    const [toggle, include, kind] = DROPDOWNS[key];
    if (!atts[toggle]) {
      return;
    }
    let options;
    let label;
    if ('field' === kind) {
      options = (0,_model__WEBPACK_IMPORTED_MODULE_3__.designations)(pool).map(([slug, lbl]) => ({
        value: slug,
        label: lbl,
        raw: lbl
      }));
      label = (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)('filter_designation');
    } else {
      options = (0,_model__WEBPACK_IMPORTED_MODULE_3__.filterTerms)(key, atts, pool, include).map(x => ({
        value: x.slug,
        label: x.name,
        raw: x.slug
      }));
      label = (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)(key);
    }
    if (options.length) {
      out.push({
        type: 'select',
        key,
        label,
        options
      });
    }
  });
  return out;
};
const MultiSelect = ({
  id,
  label,
  options,
  value,
  onChange,
  ellipsis,
  openKey,
  setOpenKey,
  fieldKey
}) => {
  const wrapRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const toggleRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const open = openKey === fieldKey;
  const names = options.filter(o => value.includes(o.value)).map(o => o.label);
  let text = label;
  if (names.length) {
    text = ellipsis || names.length <= 2 ? names.join(', ') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)( /* translators: %d: number of selected options */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('%d selected', 'bp-team-member'), names.length);
  }
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!open || !wrapRef.current) {
      return undefined;
    }
    const doc = wrapRef.current.ownerDocument;
    const onDoc = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenKey(null);
      }
    };
    doc.addEventListener('click', onDoc);
    return () => doc.removeEventListener('click', onDoc);
  }, [open, setOpenKey]);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-ms' + (ellipsis ? ' bptm-ms--ellipsis' : '') + (open ? ' is-open' : ''),
    ref: wrapRef,
    onKeyDown: e => {
      if ('Escape' === e.key && open) {
        e.stopPropagation();
        setOpenKey(null);
        if (toggleRef.current) {
          toggleRef.current.focus();
        }
      } else if ('ArrowDown' === e.key && !open && e.target === toggleRef.current) {
        e.preventDefault();
        setOpenKey(fieldKey);
        const w = wrapRef.current;
        (w.ownerDocument.defaultView || window).requestAnimationFrame(() => {
          const first = w.querySelector('.bptm-ms-menu input');
          if (first) {
            first.focus();
          }
        });
      }
    }
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
    type: 'button',
    className: 'bptm-ms-toggle bptm-select',
    'aria-haspopup': 'listbox',
    'aria-expanded': open ? 'true' : 'false',
    'aria-controls': id + '-ms',
    'aria-label': label,
    title: names.length ? names.join(', ') : undefined,
    ref: toggleRef,
    onClick: () => setOpenKey(open ? null : fieldKey)
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
    className: 'bptm-ms-label' + (names.length ? '' : ' is-placeholder')
  }, text), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
    className: 'fas fa-angle-down bptm-ms-caret',
    'aria-hidden': 'true'
  })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-ms-menu',
    id: id + '-ms',
    role: 'group',
    'aria-label': label,
    hidden: !open
  }, options.map((o, k) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('label', {
    className: 'bptm-ms-option',
    key: o.value,
    style: {
      '--bptm-depth': '0'
    }
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('input', {
    type: 'checkbox',
    value: o.value,
    'data-index': String(k + 1),
    checked: value.includes(o.value),
    onChange: e => onChange(e.target.checked ? [...value, o.value] : value.filter(v => v !== o.value))
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', null, o.label)))));
};
const SearchInput = ({
  id,
  fieldKey,
  label,
  value,
  onChange,
  delay
}) => {
  const [local, setLocal] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(value);
  const timer = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const ref = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setLocal(value);
  }, [value]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => () => timer.current && clearTimeout(timer.current), []);
  const commit = (v, now) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    if (now) {
      onChange(v);
      return;
    }
    timer.current = setTimeout(() => onChange(v), delay);
  };
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('input', {
    type: 'search',
    id,
    className: 'bptm-search',
    'data-bptm-search': fieldKey,
    placeholder: label,
    autoComplete: 'off',
    ref,
    value: local,
    onChange: e => {
      setLocal(e.target.value);
      commit(e.target.value, false);
    },
    onKeyDown: e => {
      if ('Enter' === e.key) {
        e.preventDefault();
        commit(e.target.value, true);
      }
    }
  });
};

/**
 * Category tabs.
 *
 * @param {Object} props Props.
 * @return {Element|null} Tabs.
 */
const CatFilters = ({
  atts,
  terms,
  group,
  onGroup
}) => {
  if (!terms.length) {
    return null;
  }
  const all = !!atts.filterAllEnabled;
  const style = (0,_sanitize__WEBPACK_IMPORTED_MODULE_4__.htmlClass)(atts.filterStyle || 'default');
  const pos = (0,_sanitize__WEBPACK_IMPORTED_MODULE_4__.htmlClass)(atts.filterCatPosition || 'center');
  const allText = String(atts.filterAllText || '').trim() ? atts.filterAllText : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('All', 'bp-team-member');
  const items = [];
  if (all) {
    items.push({
      slug: '*',
      name: allText
    });
  }
  terms.forEach(x => items.push(x));
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('nav', {
    className: 'bptm-cats-wrap bptm-cats-pos-' + pos,
    'aria-label': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.sprintf)( /* translators: %s: group label */(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Filter by %s', 'bp-team-member'), (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.termLabel)('group'))
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('ul', {
    className: 'bptm-cats bptm-cats--' + style
  }, items.map(x => {
    const active = group === x.slug;
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('li', {
      className: 'bptm-cat-item' + (active ? ' is-active' : ''),
      key: x.slug
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
      type: 'button',
      className: 'bptm-cat',
      'data-filter': x.slug,
      'aria-pressed': active ? 'true' : 'false',
      onClick: e => {
        e.preventDefault();
        onGroup(x.slug);
      }
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', null, x.name)));
  })));
};

/**
 * Search / dropdown controls + reset + status.
 *
 * @param {Object} props Props.
 * @return {Element|null} Controls.
 */
const FilterControls = ({
  atts,
  uid,
  controls,
  state,
  onSelect,
  onSearch,
  onReset,
  resetVisible,
  status,
  ajax
}) => {
  const [openKey, setOpenKey] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const multi = !!atts.enableMultiSelect;
  const reset = !!atts.enableClearFilters;
  if (!controls.length && !reset) {
    return null;
  }
  const cols = 'three' === atts.filterColumns ? 3 : 2;
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-filters bptm-filter-cols-' + cols + (multi ? ' bptm-filters--multi' : ''),
    role: 'search'
  }, controls.length ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-filters-grid'
  }, controls.map(c => {
    const fid = 'bptm-f-' + uid + '-' + c.key;
    let field;
    if ('search' === c.type) {
      field = [(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
        key: 'i',
        className: 'bptm-search-icon fas fa-magnifying-glass',
        'aria-hidden': 'true'
      }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(SearchInput, {
        key: 's',
        id: fid,
        fieldKey: c.key,
        label: c.label,
        value: state.searches[c.key] || '',
        onChange: v => onSearch(c.key, v),
        delay: ajax ? 350 : 120
      })];
    } else {
      const value = state.selects[c.key] || [];
      const select = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('select', {
        key: 'sel',
        id: fid,
        className: 'bptm-select',
        'data-bptm-filter': c.key,
        'data-placeholder': c.label,
        ...(multi ? {
          multiple: true,
          hidden: true,
          tabIndex: -1,
          value,
          onChange: () => {}
        } : {
          value: value[0] || '*',
          onChange: e => onSelect(c.key, '*' === e.target.value ? [] : [e.target.value])
        })
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('option', {
        value: '*'
      }, c.label), c.options.map(o => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('option', {
        key: o.value,
        value: o.value,
        'data-value': o.raw,
        'data-depth': '0'
      }, o.label)));
      field = multi ? [select, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(MultiSelect, {
        key: 'ms',
        id: fid,
        fieldKey: c.key,
        label: c.label,
        options: c.options,
        value,
        ellipsis: !!atts.multiSelectEllipsis,
        openKey,
        setOpenKey,
        onChange: v => onSelect(c.key, v)
      })] : [select];
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      key: c.key,
      className: 'bptm-filter bptm-filter--' + c.type + ' bptm-filter-' + c.key.replace(/_/g, '-')
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('label', {
      className: 'screen-reader-text',
      htmlFor: multi && 'select' === c.type ? '' : fid
    }, c.label), ...field);
  })) : null, reset ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-reset-wrap'
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
    type: 'button',
    className: 'bptm-reset',
    hidden: !resetVisible,
    onClick: onReset
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
    className: 'fas fa-rotate-left',
    'aria-hidden': 'true'
  }), ' ', (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', null, (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)('reset_filters')))) : null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-filter-status screen-reader-text',
    'aria-live': 'polite'
  }, status));
};

/***/ }),

/***/ "./src/Components/Common/Team/Pagination.js":
/*!**************************************************!*\
  !*** ./src/Components/Common/Team/Pagination.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Infinite: () => (/* binding */ Infinite),
/* harmony export */   LoadMore: () => (/* binding */ LoadMore),
/* harmony export */   Numbered: () => (/* binding */ Numbered),
/* harmony export */   pageUrl: () => (/* binding */ pageUrl)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bridge */ "./src/Components/Common/Team/bridge.js");
/**
 * Pagination UI (port of templates/partials/pagination.php): numbered links,
 * load-more button and the infinite-scroll sentinel. Paging itself is client-side state.
 */




/**
 * Page link URL: the current URL with `var=n` (page 1 drops it); '?…' in the editor.
 *
 * @param {Object}  win      Window.
 * @param {string}  pageVar  Query var.
 * @param {number}  n        Page.
 * @param {boolean} isEditor Editor.
 * @return {string} URL.
 */
const pageUrl = (win, pageVar, n, isEditor) => {
  if (isEditor || !win || !win.location || !/^https?:$/.test(win.location.protocol)) {
    return 1 === n ? '?' : '?' + encodeURIComponent(pageVar) + '=' + n;
  }
  try {
    const u = new win.URL(win.location.href);
    u.hash = '';
    u.searchParams.delete(pageVar);
    if (n > 1) {
      u.searchParams.set(pageVar, String(n));
    }
    return u.toString();
  } catch (e) {
    return 1 === n ? '?' : '?' + encodeURIComponent(pageVar) + '=' + n;
  }
};
const Numbered = ({
  page,
  max,
  pageVar,
  win,
  isEditor,
  onPage
}) => {
  const cur = Math.min(Math.max(1, page), Math.max(1, max));
  const pages = [];
  for (let i = 1; i <= max; i++) {
    if (1 === i || max === i || Math.abs(i - cur) <= 1) {
      pages.push(i);
    } else if ('…' !== pages[pages.length - 1]) {
      pages.push('…');
    }
  }
  const link = (n, cls, extra, children) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', {
    className: cls,
    href: pageUrl(win, pageVar, n, isEditor),
    'data-page': String(n),
    onClick: e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || 1 === e.button) {
        return;
      }
      e.preventDefault();
      onPage(n, e.currentTarget);
    },
    ...extra
  }, children);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('nav', {
    className: 'bptm-pagination bptm-pagination--normal',
    'aria-label': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Team members pages', 'bp-team-member'),
    hidden: max <= 1
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('ul', {
    className: 'bptm-pages'
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('li', null, cur > 1 ? link(cur - 1, 'bptm-page bptm-page-prev', {
    rel: 'prev',
    'aria-label': (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)('prev')
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
    className: 'fas fa-angle-left',
    'aria-hidden': 'true'
  })) : (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
    className: 'bptm-page bptm-page-prev is-disabled',
    'aria-hidden': 'true'
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
    className: 'fas fa-angle-left'
  }))), pages.map((p, i) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('li', {
    key: i
  }, '…' === p ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
    className: 'bptm-page bptm-page-dots',
    'aria-hidden': 'true'
  }, '…') : p === cur ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
    className: 'bptm-page is-current',
    'aria-current': 'page'
  }, String(p)) : link(p, 'bptm-page', {}, String(p)))), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('li', null, cur < max ? link(cur + 1, 'bptm-page bptm-page-next', {
    rel: 'next',
    'aria-label': (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)('next')
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
    className: 'fas fa-angle-right',
    'aria-hidden': 'true'
  })) : (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
    className: 'bptm-page bptm-page-next is-disabled',
    'aria-hidden': 'true'
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
    className: 'fas fa-angle-right'
  })))));
};
const LoadMore = ({
  text,
  more,
  onMore
}) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
  className: 'bptm-loadmore-wrap',
  hidden: !more
}, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
  type: 'button',
  className: 'bptm-loadmore',
  onClick: e => {
    e.preventDefault();
    onMore();
  }
}, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
  className: 'bptm-loadmore-text'
}, text), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
  className: 'bptm-spinner',
  'aria-hidden': 'true'
})));
const Infinite = ({
  more,
  sentinelRef
}) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
  className: 'bptm-infinite',
  hidden: !more,
  ref: sentinelRef
}, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
  className: 'bptm-spinner',
  'aria-hidden': 'true'
}), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
  className: 'screen-reader-text'
}, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Loading more members', 'bp-team-member')));

/***/ }),

/***/ "./src/Components/Common/Team/TeamMembers.js":
/*!***************************************************!*\
  !*** ./src/Components/Common/Team/TeamMembers.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _registry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./registry */ "./src/Components/Common/Team/registry.js");
/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./model */ "./src/Components/Common/Team/model.js");
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./context */ "./src/Components/Common/Team/context.js");
/* harmony import */ var _themes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./themes */ "./src/Components/Common/Team/themes.js");
/* harmony import */ var _details__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./details */ "./src/Components/Common/Team/details.js");
/* harmony import */ var _css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./css */ "./src/Components/Common/Team/css.js");
/* harmony import */ var _carousel__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./carousel */ "./src/Components/Common/Team/carousel.js");
/* harmony import */ var _modal__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./modal */ "./src/Components/Common/Team/modal.js");
/* harmony import */ var _Filters__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Filters */ "./src/Components/Common/Team/Filters.js");
/* harmony import */ var _Pagination__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Pagination */ "./src/Components/Common/Team/Pagination.js");
/* harmony import */ var _effects__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./effects */ "./src/Components/Common/Team/effects.js");
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./bridge */ "./src/Components/Common/Team/bridge.js");
/* harmony import */ var _sanitize__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./sanitize */ "./src/Components/Common/Team/sanitize.js");
/**
 * <TeamMembers />: the whole block, rendered in the browser from the block attributes.
 * Used by the editor preview (isEditor) and the front end (src/view.js, `host` = the server wrapper div).
 *
 * Markup and class names match the former PHP renderer, so build/view.css applies unchanged.
 */















const EMPTY_FILTERS = {
  group: null,
  selects: {},
  searches: {}
};
const readPageFromUrl = (win, pageVar) => {
  try {
    const v = new win.URL(win.location.href).searchParams.get(pageVar);
    const n = parseInt(v, 10);
    return n > 0 ? n : 1;
  } catch (e) {
    return 1;
  }
};
const TeamMembers = ({
  attributes,
  uid,
  domId,
  isEditor = false,
  host = null,
  wrapperClass = ''
}) => {
  const ownRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const hostRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(host);
  hostRef.current = host;
  const rootRef = host ? hostRef : ownRef;
  const seed = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(Math.floor(Math.random() * 999998) + 1);
  const seen = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(new Set());
  const win = rootRef.current && rootRef.current.ownerDocument.defaultView || ('undefined' !== typeof window ? window : null);

  /* ---------------- Data ---------------- */
  const atts = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_model__WEBPACK_IMPORTED_MODULE_3__.sanitizeAttributes)(attributes), [attributes]);
  const theme = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_registry__WEBPACK_IMPORTED_MODULE_2__.getThemeDef)(atts.theme), [atts.theme]);
  const view = (0,_model__WEBPACK_IMPORTED_MODULE_3__.resolveView)(atts, theme);
  const linkType = (0,_model__WEBPACK_IMPORTED_MODULE_3__.resolveLinkType)(atts, theme, view);
  const mode = (0,_model__WEBPACK_IMPORTED_MODULE_3__.paginationMode)(atts, theme, view);
  const vis = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_model__WEBPACK_IMPORTED_MODULE_3__.resolveVisibility)(atts.visibility, theme), [atts.visibility, theme]);
  const members = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_model__WEBPACK_IMPORTED_MODULE_3__.buildMembers)(atts), [atts]);
  const {
    base,
    pool
  } = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_model__WEBPACK_IMPORTED_MODULE_3__.queryPool)(atts, members, seed.current), [atts, members]);
  const pageVar = 'bptm-page-' + uid;
  const baseCtx = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_context__WEBPACK_IMPORTED_MODULE_4__.makeContext)({
    atts,
    theme,
    uid,
    view,
    linkType,
    vis,
    isEditor
  }), [atts, theme, uid, view, linkType, vis, isEditor]);
  const cloneCtx = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => baseCtx.asClone(), [baseCtx]);
  const renderItem = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_themes__WEBPACK_IMPORTED_MODULE_5__.itemRenderer)(theme), [theme]);

  /* ---------------- Filters ---------------- */
  const isFilter = 'filter' === view;
  const ajaxFilter = isFilter && 'ajax-filter' === atts.filterType;
  const terms = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => isFilter ? (0,_Filters__WEBPACK_IMPORTED_MODULE_10__.catTerms)(atts, pool) : [], [isFilter, atts, pool]);
  const controls = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => isFilter ? (0,_Filters__WEBPACK_IMPORTED_MODULE_10__.filterControls)(atts, pool) : [], [isFilter, atts, pool]);
  const [fstate, setFstate] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(EMPTY_FILTERS);
  const [changedOnce, setChangedOnce] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const firstGroup = atts.filterAllEnabled || !terms.length ? '*' : terms[0].slug;
  let group = fstate.group;
  if (null === group || '*' === group && !atts.filterAllEnabled || '*' !== group && !terms.some(x => x.slug === group)) {
    group = firstGroup;
  }
  const selects = {};
  controls.forEach(c => {
    if ('select' === c.type && fstate.selects[c.key]) {
      const v = fstate.selects[c.key].filter(x => c.options.some(o => o.value === x));
      if (v.length) {
        selects[c.key] = v;
      }
    }
  });
  const searches = {};
  controls.forEach(c => {
    if ('search' === c.type && fstate.searches[c.key] && fstate.searches[c.key].trim()) {
      searches[c.key] = fstate.searches[c.key].trim();
    }
  });
  const clientState = {
    ...('*' !== group ? {
      group
    } : {}),
    ...selects,
    ...searches
  };
  const filterActive = Object.keys(clientState).filter(k => !('group' === k && !atts.filterAllEnabled && group === firstGroup)).length > 0;

  /* ---------------- Pagination ---------------- */
  const [page, setPage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(() => !isEditor && win && 'normal-pagination' === mode ? readPageFromUrl(win, pageVar) : 1);
  const [loads, setLoads] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
  const resetPaging = () => {
    setPage(1);
    setLoads(0);
  };

  /* ---------------- List ---------------- */
  let list = pool;
  let hiddenIds = null;
  if (isFilter && !ajaxFilter) {
    hiddenIds = new Set();
    pool.forEach(m => {
      if (!(0,_model__WEBPACK_IMPORTED_MODULE_3__.clientMatches)(m, clientState)) {
        hiddenIds.add(m.id);
      }
    });
  } else if (ajaxFilter && Object.keys(clientState).length) {
    const serverState = {
      ...clientState
    };
    if (serverState.group) {
      serverState.group = [serverState.group];
    }
    if (serverState.designation) {
      serverState.designation = serverState.designation.map(slug => {
        const c = controls.find(x => 'designation' === x.key);
        const o = c ? c.options.find(x => x.value === slug) : null;
        return o ? o.raw : slug;
      });
    }
    list = (0,_model__WEBPACK_IMPORTED_MODULE_3__.orderMembers)(atts, (0,_model__WEBPACK_IMPORTED_MODULE_3__.applyRuntimeFilters)(base, serverState), seed.current);
    const num = Math.trunc(Number(atts.numberOfMembers)) || 0;
    if (num > 0) {
      list = list.slice(0, num);
    }
  }
  const total = list.length;
  let shown = list;
  let maxPages = 1;
  let curPage = 1;
  let more = false;
  if ('normal-pagination' === mode) {
    const pp = Math.max(1, atts.perPage);
    maxPages = Math.max(1, Math.ceil(total / pp));
    curPage = Math.min(Math.max(1, page), maxPages);
    shown = list.slice((curPage - 1) * pp, curPage * pp);
    maxPages = pp > 0 ? Math.ceil(total / pp) : 1;
  } else if ('load-more-button' === mode || 'load-more-scroll' === mode) {
    const step = 'load-more-button' === mode ? atts.loadPerClick : atts.perLoad;
    const count = Math.max(1, atts.initialItems) + loads * Math.max(1, step);
    shown = list.slice(0, count);
    more = count < total;
  }
  const shownCount = hiddenIds ? shown.filter(m => !hiddenIds.has(m.id)).length : shown.length;

  /* ---------------- Modal ---------------- */
  const modalOn = ['popup', 'panel', 'drawer'].includes(linkType);
  const modal = (0,_modal__WEBPACK_IMPORTED_MODULE_9__.useModal)({
    type: linkType,
    rootRef
  });
  const openId = modal.state.visible ? modal.state.id : null;
  const openable = shown.filter(m => (!hiddenIds || !hiddenIds.has(m.id)) && ['popup', 'panel', 'drawer'].includes(baseCtx.memberLinkType(m))).map(m => m.id);
  const [drawerAt, setDrawerAt] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(-1);
  const drawerItemRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);

  /* ---------------- Classes ---------------- */
  const baseClass = String(wrapperClass || (0,_context__WEBPACK_IMPORTED_MODULE_4__.cx)('wp-block-tsb-team-members', atts.className)).split(/\s+/).map(_sanitize__WEBPACK_IMPORTED_MODULE_14__.htmlClass).filter(Boolean).join(' ');
  const rootClass = (0,_context__WEBPACK_IMPORTED_MODULE_4__.cx)(baseClass, 'bptm-wrap', 'bptm-theme-' + theme.id, 'bptm-group-' + (0,_sanitize__WEBPACK_IMPORTED_MODULE_14__.htmlClass)(theme.group), 'bptm-layout-' + theme.layout, 'bptm-view-' + view, 'bptm-link-' + linkType, 'bptm-align-' + (0,_sanitize__WEBPACK_IMPORTED_MODULE_14__.htmlClass)(atts.alignment), 'none' !== atts.imageFilter ? 'bptm-imgfx-' + atts.imageFilter : '', 'none' !== atts.hoverImageFilter ? 'bptm-imghfx-' + atts.hoverImageFilter : '', atts.enableScrollAnimation ? 'bptm-has-anim' : '', atts.detailsAreaHeight ? 'bptm-equal-details' : '', theme.grouped ? 'bptm-grouped' : '', 'bptm-js', modalOn && 'drawer' !== linkType && openId && !modal.state.closing ? 'bptm-modal-open-host' : '');
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    if (host) {
      if (host.className !== rootClass) {
        host.className = rootClass;
      }
      host.setAttribute('data-bptm-uid', uid);
      if (domId && host.id !== domId) {
        host.id = domId;
      }
    }
  });

  /* ---------------- Effects ---------------- */
  const css = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_css__WEBPACK_IMPORTED_MODULE_7__.dynamicCss)(atts, domId, uid), [atts, domId, uid]);
  (0,_effects__WEBPACK_IMPORTED_MODULE_12__.useFontLink)(rootRef, (0,_css__WEBPACK_IMPORTED_MODULE_7__.googleFontsUrl)(atts));
  (0,_effects__WEBPACK_IMPORTED_MODULE_12__.useScrollAnimation)(rootRef, seen.current);
  (0,_effects__WEBPACK_IMPORTED_MODULE_12__.useTapReveal)(rootRef);
  const carouselCfg = 'carousel' === view ? {
    autoplay: !!atts.carouselAutoplay,
    hoverPause: !!atts.carouselAutoplayHoverPause,
    loop: !!atts.carouselLoop,
    speed: atts.carouselSpeed,
    timeout: atts.carouselAutoplayTimeout,
    scroll: atts.carouselItemsToScroll,
    navs: !!atts.carouselNavsEnabled,
    dots: !!atts.carouselDotsEnabled,
    cols: {
      d: Math.max(1, parseInt(atts.columns && atts.columns.desktop, 10) || 4),
      t: Math.max(1, parseInt(atts.columns && atts.columns.tablet, 10) || 3),
      mp: Math.max(1, parseInt(atts.columns && atts.columns.mobilePortrait, 10) || 2),
      m: Math.max(1, parseInt(atts.columns && atts.columns.mobile, 10) || 1)
    },
    gap: atts.columnGap
  } : null;
  const stageRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const clones = (0,_carousel__WEBPACK_IMPORTED_MODULE_8__.useCarousel)(stageRef, 'carousel' === view && shown.length > 0, carouselCfg || {}, {
    slide: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Go to slide %d', 'bp-team-member')
  });

  /* ---------------- Drawer placement ---------------- */
  const containerEl = () => rootRef.current ? rootRef.current.querySelector('.bptm-stage .bptm-items') || rootRef.current.querySelector('.bptm-items') : null;
  const placeDrawer = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(item => {
    const c = item ? item.parentElement : null;
    if (!c) {
      return;
    }
    const top = item.offsetTop;
    let last = item;
    let n = item.nextElementSibling;
    while (n) {
      if (n.classList.contains('bptm-item') && !n.classList.contains('bptm-drawer') && !n.hidden) {
        if (Math.abs(n.offsetTop - top) > 2) {
          break;
        }
        last = n;
      }
      n = n.nextElementSibling;
    }
    const kids = Array.from(c.children).filter(k => !k.classList.contains('bptm-drawer'));
    drawerItemRef.current = item;
    setDrawerAt(kids.indexOf(last));
  }, []);
  const step = dir => {
    if (openable.length < 2) {
      return;
    }
    let i = openable.indexOf(modal.state.id);
    i = (i + dir + openable.length) % openable.length;
    const id = openable[i];
    const c = containerEl();
    const item = c ? c.querySelector(':scope > .bptm-item[data-bptm-id="' + id + '"]:not(.bptm-clone)') : null;
    if ('drawer' === linkType && item) {
      placeDrawer(item);
    }
    modal.open(id, null);
    const root = rootRef.current;
    if (root) {
      root.dispatchEvent(new (root.ownerDocument.defaultView || window).CustomEvent('bptm:open', {
        bubbles: true,
        detail: {
          id,
          type: linkType
        }
      }));
    }
  };

  // Open triggers (native listener so it also works when React renders into the server wrapper).
  const latest = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)();
  latest.current = {
    modal,
    linkType,
    placeDrawer
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }
    const onClick = e => {
      const a = e.target.closest && e.target.closest('[data-bptm-open]');
      if (!a || !root.contains(a) || a.closest('.bptm-modal, .bptm-drawer')) {
        return;
      }
      const L = latest.current;
      const id = a.getAttribute('data-bptm-id');
      if (!id || a.getAttribute('data-bptm-open') !== L.linkType) {
        return;
      }
      e.preventDefault();
      const item = a.closest('.bptm-item');
      if ('drawer' === L.linkType && L.modal.state.id === id && L.modal.state.visible && !L.modal.state.closing) {
        L.modal.close();
        root.dispatchEvent(new (root.ownerDocument.defaultView || window).CustomEvent('bptm:close', {
          bubbles: true
        }));
        return;
      }
      if ('drawer' === L.linkType && item) {
        L.placeDrawer(item);
      }
      L.modal.open(id, a);
      root.dispatchEvent(new (root.ownerDocument.defaultView || window).CustomEvent('bptm:open', {
        bubbles: true,
        detail: {
          id,
          type: L.linkType
        }
      }));
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [host]);

  // Close the detail when its member disappears (filters, paging, editor changes).
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (openId && !openable.includes(openId) && !modal.state.closing) {
      modal.close();
    }
  });

  // Drawer arrow position + re-placement after layout changes.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    if ('drawer' !== linkType || !openId) {
      return;
    }
    const c = containerEl();
    const shell = modal.shellRef.current;
    const item = c ? c.querySelector(':scope > .bptm-item[data-bptm-id="' + openId + '"]:not(.bptm-clone)') : null;
    if (!c || !shell || !item) {
      return;
    }
    const cr = c.getBoundingClientRect();
    const ir = item.getBoundingClientRect();
    shell.style.setProperty('--bptm-drawer-arrow', Math.round(ir.left + ir.width / 2 - cr.left) + 'px');
  });
  (0,_effects__WEBPACK_IMPORTED_MODULE_12__.useLayoutHelpers)(rootRef, () => {
    if ('drawer' === linkType && openId && drawerItemRef.current) {
      if (drawerItemRef.current.hidden || !drawerItemRef.current.isConnected) {
        modal.close();
      } else {
        placeDrawer(drawerItemRef.current);
      }
    }
  });

  // Filter-in animation for items that become visible again.
  const prevHidden = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    const prev = prevHidden.current;
    prevHidden.current = hiddenIds;
    if (!prev || !hiddenIds || !rootRef.current) {
      return;
    }
    prev.forEach(id => {
      if (!hiddenIds.has(id)) {
        rootRef.current.querySelectorAll('.bptm-items > .bptm-item[data-bptm-id="' + id + '"]').forEach(el => {
          el.classList.remove('bptm-filter-in');
          void el.offsetWidth; // eslint-disable-line no-void
          el.classList.add('bptm-filter-in');
        });
      }
    });
    if ('drawer' === linkType && openId && hiddenIds.has(openId)) {
      modal.close();
    } else if ('drawer' === linkType && openId && drawerItemRef.current && drawerItemRef.current.isConnected) {
      placeDrawer(drawerItemRef.current);
    }
  });

  /* ---------------- Pagination behaviour ---------------- */
  const goPage = n => {
    setPage(n);
    const root = rootRef.current;
    if (!isEditor && 'normal-pagination' === mode && 'filter' !== view && win && win.history && 'function' === typeof win.history.pushState) {
      try {
        win.history.pushState({
          bptmPage: n
        }, '', (0,_Pagination__WEBPACK_IMPORTED_MODULE_11__.pageUrl)(win, pageVar, n, false));
      } catch (e) {
        // Ignore (sandboxed documents).
      }
    }
    if (root) {
      (root.ownerDocument.defaultView || window).requestAnimationFrame(() => {
        const r = root.getBoundingClientRect();
        if (r.top < 0) {
          root.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
        const first = root.querySelector('.bptm-items [data-bptm-open], .bptm-items a');
        if (first) {
          first.focus({
            preventScroll: true
          });
        }
      });
    }
  };
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (isEditor || !win || 'normal-pagination' !== mode || 'filter' === view) {
      return undefined;
    }
    const onPop = () => setPage(readPageFromUrl(win, pageVar));
    win.addEventListener('popstate', onPop);
    return () => win.removeEventListener('popstate', onPop);
  }, [isEditor, win, mode, view, pageVar]);
  const sentinelRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const moreRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(more);
  moreRef.current = more;
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const s = sentinelRef.current;
    if ('load-more-scroll' !== mode || !s || !more) {
      return undefined;
    }
    const w = s.ownerDocument.defaultView || window;
    if ('function' !== typeof w.IntersectionObserver) {
      const onClick = () => setLoads(n => n + 1);
      s.addEventListener('click', onClick);
      return () => s.removeEventListener('click', onClick);
    }
    const io = new w.IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting && moreRef.current) {
          setLoads(n => n + 1);
        }
      });
    }, {
      rootMargin: '0px 0px 300px 0px'
    });
    io.observe(s);
    return () => io.disconnect();
  }, [mode, more, shown.length]);

  /* ---------------- Filter handlers ---------------- */
  const touch = () => {
    setChangedOnce(true);
    if (ajaxFilter) {
      resetPaging();
    }
  };
  const onGroup = slug => {
    setFstate(s => ({
      ...s,
      group: slug
    }));
    touch();
  };
  const onSelect = (key, values) => {
    setFstate(s => ({
      ...s,
      selects: {
        ...s.selects,
        [key]: values
      }
    }));
    touch();
  };
  const onSearch = (key, value) => {
    setFstate(s => ({
      ...s,
      searches: {
        ...s.searches,
        [key]: value
      }
    }));
    touch();
  };
  const onReset = () => {
    setFstate({
      group: firstGroup,
      selects: {},
      searches: {}
    });
    touch();
  };

  /* ---------------- Render: items ---------------- */
  const curId = openId && !modal.state.closing ? openId : null;
  const decorate = (el, m, extraKey = '') => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.cloneElement)(el, {
    key: extraKey + m.id,
    className: (0,_context__WEBPACK_IMPORTED_MODULE_4__.cx)(el.props.className, seen.current.has(m.id) && el.props.className.indexOf('bptm-anim') !== -1 ? 'bptm-in' : '', curId === m.id ? 'is-current' : ''),
    ...(hiddenIds && hiddenIds.has(m.id) ? {
      hidden: true
    } : {})
  });
  const itemEls = [];
  if (theme.grouped) {
    const groups = (0,_model__WEBPACK_IMPORTED_MODULE_3__.filterTerms)('group', atts, pool, 'includeGroups').map(g => ({
      ...g,
      members: []
    }));
    const other = [];
    shown.forEach(m => {
      let placed = false;
      (m.terms.group || []).forEach(x => {
        const g = groups.find(gg => gg.slug === x.slug);
        if (g) {
          g.members.push(m);
          placed = true;
        }
      });
      if (!placed) {
        other.push(m);
      }
    });
    const all = groups.filter(g => g.members.length);
    if (other.length) {
      all.push({
        slug: '',
        name: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Others', 'bp-team-member'),
        members: other
      });
    }
    let idx = 0;
    all.forEach(g => {
      const allHidden = hiddenIds && g.members.every(m => hiddenIds.has(m.id));
      itemEls.push((0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
        key: 'g-' + g.slug,
        className: 'bptm-group-title',
        'data-group': g.slug,
        hidden: !!allHidden
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('h3', null, g.name)));
      g.members.forEach(m => {
        baseCtx.index = idx++;
        itemEls.push(decorate(renderItem(baseCtx, m), m, 'g-' + g.slug + '-'));
      });
    });
  } else {
    shown.forEach((m, i) => {
      baseCtx.index = i;
      itemEls.push(decorate(renderItem(baseCtx, m), m));
    });
  }
  const showDrawerInline = 'drawer' === linkType && modal.state.visible && drawerAt >= 0 && drawerAt < itemEls.length;
  const detailMember = modal.state.id ? pool.find(m => m.id === modal.state.id) || list.find(m => m.id === modal.state.id) : null;
  const shell = modalOn ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_modal__WEBPACK_IMPORTED_MODULE_9__.ModalShell, {
    key: 'shell',
    type: linkType,
    uid,
    panelPosition: atts.panelPosition,
    drawerStyle: atts.drawerStyle,
    modal,
    navHidden: !!modal.state.visible && openable.length < 2,
    onStep: step,
    detailStyle: (0,_details__WEBPACK_IMPORTED_MODULE_6__.detailStyle)(atts, linkType),
    content: detailMember ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_details__WEBPACK_IMPORTED_MODULE_6__.DetailPayload, {
      ctx: baseCtx,
      m: detailMember,
      type: linkType
    }) : null
  }) : null;
  if (showDrawerInline) {
    itemEls.splice(drawerAt + 1, 0, shell);
  }
  let itemsBlock;
  if (!shown.length && (!ajaxFilter || !Object.keys(clientState).length)) {
    itemsBlock = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-stage'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-no-members',
      role: 'status'
    }, (0,_bridge__WEBPACK_IMPORTED_MODULE_13__.t)('no_members')));
  } else if ('table' === theme.layout) {
    const empty = !shown.length ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('tr', {
      className: 'bptm-no-members-row',
      key: 'empty'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('td', {
      colSpan: 20
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-no-members',
      role: 'status'
    }, (0,_bridge__WEBPACK_IMPORTED_MODULE_13__.t)('no_members')))) : null;
    itemsBlock = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-stage bptm-table-wrap'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('table', {
      className: 'bptm-table'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_themes__WEBPACK_IMPORTED_MODULE_5__.TableHead, {
      ctx: baseCtx,
      id: theme.id
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('tbody', {
      className: 'bptm-items',
      'aria-live': 'polite'
    }, empty || itemEls)));
  } else if ('carousel' === view) {
    const navs = !!atts.carouselNavsEnabled;
    const dots = !!atts.carouselDotsEnabled;
    const icons = _registry__WEBPACK_IMPORTED_MODULE_2__.NAV_ICONS[atts.carouselNavsStyle] || _registry__WEBPACK_IMPORTED_MODULE_2__.NAV_ICONS.default;
    const n = shown.length;
    const before = [];
    const after = [];
    for (let k = 0; k < clones && n; k++) {
      const bi = ((n - clones + k) % n + n) % n;
      [[before, bi, 'cb'], [after, k % n, 'ca']].forEach(([arr, idx, pre]) => {
        cloneCtx.index = idx;
        const el = renderItem(cloneCtx, shown[idx]);
        arr.push((0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.cloneElement)(el, {
          key: pre + k,
          className: (0,_context__WEBPACK_IMPORTED_MODULE_4__.cx)(el.props.className, 'bptm-clone'),
          'aria-hidden': 'true'
        }));
      });
    }
    itemsBlock = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: (0,_context__WEBPACK_IMPORTED_MODULE_4__.cx)('bptm-stage bptm-carousel', 'bptm-navs-' + atts.carouselNavsStyle, 'bptm-dots-' + atts.carouselDotsStyle, navs && 'bptm-has-navs', dots && 'bptm-has-dots'),
      role: 'region',
      'aria-roledescription': 'carousel',
      'aria-label': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Team members', 'bp-team-member'),
      ref: stageRef
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-carousel-viewport'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-items bptm-carousel-track'
    }, before, itemEls, after)), navs ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-carousel-navs'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
      type: 'button',
      className: 'bptm-nav bptm-nav-prev',
      'aria-label': (0,_bridge__WEBPACK_IMPORTED_MODULE_13__.t)('prev')
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
      className: icons[0],
      'aria-hidden': 'true'
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
      type: 'button',
      className: 'bptm-nav bptm-nav-next',
      'aria-label': (0,_bridge__WEBPACK_IMPORTED_MODULE_13__.t)('next')
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
      className: icons[1],
      'aria-hidden': 'true'
    }))) : null, dots ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-carousel-dots',
      role: 'tablist',
      'aria-label': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Choose slide', 'bp-team-member')
    }) : null);
  } else {
    const inner = !shown.length ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-no-members',
      role: 'status'
    }, (0,_bridge__WEBPACK_IMPORTED_MODULE_13__.t)('no_members')) : itemEls;
    const noResults = hiddenIds && !shownCount ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-no-members bptm-no-results',
      role: 'status'
    }, (0,_bridge__WEBPACK_IMPORTED_MODULE_13__.t)('no_members')) : null;
    itemsBlock = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-stage'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: (0,_context__WEBPACK_IMPORTED_MODULE_4__.cx)('bptm-items', 'list' === theme.layout ? 'bptm-items--list' : ''),
      'aria-live': 'polite'
    }, inner), noResults);
  }

  /* ---------------- Render: pagination ---------------- */
  let pagination = null;
  if (mode) {
    if ('normal-pagination' === mode) {
      pagination = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_Pagination__WEBPACK_IMPORTED_MODULE_11__.Numbered, {
        page: curPage,
        max: maxPages,
        pageVar,
        win,
        isEditor,
        onPage: goPage
      });
    } else if ('load-more-button' === mode) {
      pagination = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_Pagination__WEBPACK_IMPORTED_MODULE_11__.LoadMore, {
        text: String(atts.loadButtonText || '').trim() || (0,_bridge__WEBPACK_IMPORTED_MODULE_13__.t)('load_more'),
        more,
        onMore: () => setLoads(n => n + 1)
      });
    } else {
      pagination = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_Pagination__WEBPACK_IMPORTED_MODULE_11__.Infinite, {
        more,
        sentinelRef
      });
    }
  }

  /* ---------------- Render: modal ---------------- */
  const portalEl = (0,_modal__WEBPACK_IMPORTED_MODULE_9__.usePortal)(rootRef, modalOn && 'drawer' !== linkType, rootClass, uid, isEditor);
  let modalEl = null;
  if (modalOn && 'drawer' !== linkType) {
    modalEl = portalEl ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createPortal)(shell, portalEl) : null;
  } else if ('drawer' === linkType && !showDrawerInline) {
    modalEl = shell;
  }
  const children = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, css ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('style', {
    className: 'bptm-dynamic-css'
  }, css) : null, isFilter ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_Filters__WEBPACK_IMPORTED_MODULE_10__.CatFilters, {
    atts,
    terms,
    group,
    onGroup
  }) : null, isFilter ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_Filters__WEBPACK_IMPORTED_MODULE_10__.FilterControls, {
    atts,
    uid,
    controls,
    state: {
      selects,
      searches: fstate.searches
    },
    onSelect,
    onSearch,
    onReset,
    resetVisible: filterActive,
    ajax: ajaxFilter,
    status: changedOnce || !atts.filterAllEnabled && terms.length ? shownCount ? String(hiddenIds ? shownCount : total) : (0,_bridge__WEBPACK_IMPORTED_MODULE_13__.t)('no_members') : ''
  }) : null, itemsBlock, pagination, modalEl);
  if (host) {
    return children;
  }
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    id: domId,
    className: rootClass,
    'data-bptm-uid': uid,
    ref: ownRef
  }, children);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TeamMembers);

/***/ }),

/***/ "./src/Components/Common/Team/bridge.js":
/*!**********************************************!*\
  !*** ./src/Components/Common/Team/bridge.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bridge: () => (/* binding */ bridge),
/* harmony export */   knownFonts: () => (/* binding */ knownFonts),
/* harmony export */   pluginUrl: () => (/* binding */ pluginUrl),
/* harmony export */   pref: () => (/* binding */ pref),
/* harmony export */   t: () => (/* binding */ t),
/* harmony export */   termLabel: () => (/* binding */ termLabel)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Data PHP hands to the scripts (no rendering happens on the server):
 * window.bptmData = { pluginUrl, translations, prefs, fonts (editor), thumbnailSizes (editor), adminUrls (editor) }.
 * Older editor builds localized window.bptmEditor; it is read as a fallback.
 */

const raw = () => {
  if ('undefined' === typeof window) {
    return {};
  }
  const d = window.bptmData && 'object' === typeof window.bptmData ? window.bptmData : null;
  if (d) {
    return d;
  }
  return window.bptmEditor && 'object' === typeof window.bptmEditor ? window.bptmEditor : {};
};
const bridge = () => raw();

/** Built-in English defaults of the replaceable front-end strings (used when the bridge is missing). */
const DEFAULT_TRANSLATIONS = () => ({
  filter_designation: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Show All Designation', 'bp-team-member'),
  search_name: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Search By Name', 'bp-team-member'),
  search_company: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Search By Company', 'bp-team-member'),
  search_zip: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Search By Zip', 'bp-team-member'),
  search_tag: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Search By Tag', 'bp-team-member'),
  company: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Company', 'bp-team-member'),
  address: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Address', 'bp-team-member'),
  land_phone: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Land Phone', 'bp-team-member'),
  cell_phone: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cell Phone', 'bp-team-member'),
  email: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Email', 'bp-team-member'),
  zip_code: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Zip Code', 'bp-team-member'),
  group: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Group', 'bp-team-member'),
  tag: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Tag', 'bp-team-member'),
  location: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Location', 'bp-team-member'),
  language: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Language', 'bp-team-member'),
  specialty: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Specialty', 'bp-team-member'),
  gender: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Gender', 'bp-team-member'),
  extra_one: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Extra One', 'bp-team-member'),
  extra_two: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Extra Two', 'bp-team-member'),
  extra_three: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Extra Three', 'bp-team-member'),
  extra_four: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Extra Four', 'bp-team-member'),
  extra_five: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Extra Five', 'bp-team-member'),
  follow_me_on: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Follow Me On', 'bp-team-member'),
  skills: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Skills', 'bp-team-member'),
  read_on: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Read On', 'bp-team-member'),
  more: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('More', 'bp-team-member'),
  vcard: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Download vCard', 'bp-team-member'),
  reset_filters: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Reset Filters', 'bp-team-member'),
  prev: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Prev', 'bp-team-member'),
  next: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Next', 'bp-team-member'),
  load_more: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Load More', 'bp-team-member'),
  no_members: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('No team member found.', 'bp-team-member')
});
let defaults = null;

/**
 * Replaceable front-end string (Settings → Translations; multilingual mode is resolved by PHP).
 *
 * @param {string} key Key.
 * @return {string} Text ('' never: falls back to the default, then the key).
 */
const t = key => {
  const tr = raw().translations;
  let v = tr && 'object' === typeof tr ? tr[key] : undefined;
  if (v && 'object' === typeof v) {
    v = v.value || v.label;
  }
  if ('string' === typeof v && '' !== v.trim()) {
    return v;
  }
  if (!defaults) {
    defaults = DEFAULT_TRANSLATIONS();
  }
  return defaults[key] || String(key);
};

/** Label of a term key (group, tag, location, … extra_five). */
const termLabel = key => {
  const v = t(key);
  return v && v !== key ? v : String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
const isOn = v => {
  if ('boolean' === typeof v) {
    return v;
  }
  if ('number' === typeof v) {
    return v > 0;
  }
  if ('string' === typeof v) {
    return ['on', 'yes', 'true', '1'].includes(v.trim().toLowerCase());
  }
  return !!v;
};
const PREF_DEFAULTS = {
  land_phone_link: false,
  cell_phone_link: false,
  email_link: false,
  disable_google_fonts: false,
  disable_lazy_load: false,
  lazy_load_class: 'skip-lazy',
  search_all_fields: false
};

/**
 * Preference value (booleans normalised; lazy_load_class stays a string).
 *
 * @param {string} key Key.
 * @return {*} Value.
 */
const pref = key => {
  const prefs = raw().prefs && 'object' === typeof raw().prefs ? raw().prefs : {};
  const v = Object.prototype.hasOwnProperty.call(prefs, key) ? prefs[key] : PREF_DEFAULTS[key];
  if ('lazy_load_class' === key) {
    return 'string' === typeof v ? v : 'skip-lazy';
  }
  return isOn(v);
};

// Fallback plugin URL derived from this bundle's URL (…/bp-team-member/build/view.js|index.js),
// read at module load while document.currentScript still points at it.
const SCRIPT_SRC = 'undefined' !== typeof document && document.currentScript ? document.currentScript.src || '' : '';
const SCRIPT_PLUGIN_URL = /\/build\/[^/]*$/.test(SCRIPT_SRC) ? SCRIPT_SRC.replace(/build\/[^/?#]*([?#].*)?$/, '') : '';

/** Plugin root URL with a trailing slash. */
const pluginUrl = () => {
  const url = raw().pluginUrl;
  if (url && 'string' === typeof url && /^(https?:)?\/\//i.test(url)) {
    return url.replace(/\/?$/, '/');
  }
  return SCRIPT_PLUGIN_URL;
};

/** Google font families known to the editor (empty on the front end). */
const knownFonts = () => Array.isArray(raw().fonts) ? raw().fonts : [];

/***/ }),

/***/ "./src/Components/Common/Team/carousel.js":
/*!************************************************!*\
  !*** ./src/Components/Common/Team/carousel.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deviceKey: () => (/* binding */ deviceKey),
/* harmony export */   useCarousel: () => (/* binding */ useCarousel)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Carousel engine (port of the former vanilla carousel): responsive slides per view, autoplay with
 * hover / focus pause, loop (clones) or rewind, speed, timeout, items to scroll, navs, dots, swipe,
 * keyboard. React renders the slides and their clones; the engine only measures, translates the track
 * and keeps classes / attributes in sync. Everything uses the element's own window / document, so it
 * works inside the block editor canvas iframe.
 */

const sprintf = (str, n) => String(str || '').replace(/%d|%s/, String(n));
const debounce = (win, fn, wait) => {
  let tm;
  const f = (...args) => {
    win.clearTimeout(tm);
    tm = win.setTimeout(() => fn(...args), wait);
  };
  f.cancel = () => win.clearTimeout(tm);
  return f;
};
const deviceKey = win => {
  const w = win.innerWidth || win.document.documentElement.clientWidth;
  if (w >= 1025) {
    return 'd';
  }
  if (w >= 768) {
    return 't';
  }
  if (w >= 576) {
    return 'mp';
  }
  return 'm';
};
class Engine {
  constructor(stage, cfg, i18n, onClones) {
    this.stage = stage;
    this.doc = stage.ownerDocument;
    this.win = this.doc.defaultView || window;
    this.cfg = cfg;
    this.i18n = i18n || {};
    this.onClones = onClones;
    this.index = 0;
    this.pos = 0;
    this.clones = 0;
    this.hovering = false;
    this.focused = false;
    this.timer = null;
    this.sig = '';
    this.dotsCount = -1;
    this.bind();
  }
  get viewport() {
    return this.stage.querySelector('.bptm-carousel-viewport');
  }
  get track() {
    return this.stage.querySelector('.bptm-carousel-track');
  }
  slides() {
    const tr = this.track;
    return tr ? Array.from(tr.children).filter(el => el.classList.contains('bptm-item') && !el.classList.contains('bptm-clone')) : [];
  }
  perView() {
    const c = this.cfg.cols || {};
    const v = Math.max(1, parseInt(c[deviceKey(this.win)], 10) || 1);
    const vp = this.viewport;
    const width = vp ? vp.clientWidth : 0;
    if (!width) {
      return v;
    }
    const min = this.minSlideWidth();
    const gap = this.gapPx();
    const fit = Math.floor((width + gap) / (min + gap));
    return Math.max(1, Math.min(v, fit));
  }
  minSlideWidth() {
    const style = this.win.getComputedStyle(this.stage.closest('.bptm-wrap') || this.stage);
    const raw = style.getPropertyValue('--bptm-carousel-min').trim() || style.getPropertyValue('--bptm-min-col').trim();
    const px = raw ? this.toPx(raw) : 0;
    return px > 0 ? px : 150;
  }
  toPx(value) {
    const m = /^(-?[\d.]+)(px|rem|em)?$/i.exec(value);
    if (m) {
      const n = parseFloat(m[1]);
      const unit = (m[2] || 'px').toLowerCase();
      if ('px' === unit) {
        return n;
      }
      const el = 'rem' === unit ? this.doc.documentElement : this.stage;
      return n * (parseFloat(this.win.getComputedStyle(el).fontSize) || 16);
    }
    const probe = this.doc.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;height:0;padding:0;border:0;width:' + value;
    this.viewport.appendChild(probe);
    const w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
  }
  get active() {
    return this.count > this.pv;
  }
  get step() {
    return Math.max(1, Math.min(parseInt(this.cfg.scroll, 10) || 1, this.pv));
  }
  get loop() {
    return !!this.cfg.loop && this.active;
  }
  get maxIndex() {
    return Math.max(0, this.count - this.pv);
  }

  /**
   * Called after every React commit. Re-measures; when the layout changed, asks React for the right
   * number of clones (returns false while a re-render is pending) and re-positions.
   *
   * @param {number} rendered Clones currently rendered on each side.
   * @return {boolean} Settled.
   */
  sync(rendered) {
    this.count = this.slides().length;
    this.pv = this.perView();
    const need = this.loop ? this.pv + this.step : 0;
    if (need !== rendered) {
      this.onClones(need);
      return false;
    }
    this.clones = rendered;
    const sig = [this.count, this.pv, this.clones, JSON.stringify(this.cfg)].join('|');
    this.stage.classList.toggle('is-static', !this.active);
    this.stage.style.setProperty('--bptm-per-view', String(this.pv));
    if (sig !== this.sig) {
      this.sig = sig;
      this.index = Math.min(this.index, this.loop ? this.count - 1 : this.maxIndex);
      this.buildDots();
      this.go(this.index, false);
      this.restart();
    } else {
      this.updateUI();
    }
    return true;
  }
  bind() {
    const s = this.stage;
    this.onPrev = () => {
      this.prev();
      this.restart();
    };
    this.onNext = () => {
      this.next();
      this.restart();
    };
    this.onClick = e => {
      if (e.target.closest('.bptm-nav-prev')) {
        this.onPrev();
      } else if (e.target.closest('.bptm-nav-next')) {
        this.onNext();
      } else {
        const dot = e.target.closest('.bptm-dot');
        if (dot && dot.parentElement && dot.parentElement.classList.contains('bptm-carousel-dots')) {
          const p = Array.from(dot.parentElement.children).indexOf(dot);
          this.go(this.loop ? p * this.step : Math.min(p * this.step, this.maxIndex));
          this.restart();
        }
      }
    };
    this.onTransitionEnd = e => {
      if (e.target === this.track && 'transform' === e.propertyName) {
        this.settle();
      }
    };
    this.onEnter = () => {
      this.hovering = true;
    };
    this.onLeave = () => {
      this.hovering = false;
    };
    this.onFocusIn = () => {
      this.focused = true;
    };
    this.onFocusOut = e => {
      if (!s.contains(e.relatedTarget)) {
        this.focused = false;
      }
    };
    this.onKey = e => {
      if (e.target.matches && e.target.matches('input, select, textarea')) {
        return;
      }
      const rtl = this.isRTL();
      if ('ArrowLeft' === e.key) {
        e.preventDefault();
        (rtl ? this.onNext : this.onPrev)();
      } else if ('ArrowRight' === e.key) {
        e.preventDefault();
        (rtl ? this.onPrev : this.onNext)();
      }
    };
    s.addEventListener('click', this.onClick);
    s.addEventListener('transitionend', this.onTransitionEnd);
    s.addEventListener('mouseenter', this.onEnter);
    s.addEventListener('mouseleave', this.onLeave);
    s.addEventListener('focusin', this.onFocusIn);
    s.addEventListener('focusout', this.onFocusOut);
    s.addEventListener('keydown', this.onKey);
    this.bindSwipe();
    let rw = this.win.innerWidth;
    this.onResize = () => {
      if (!s.isConnected) {
        return;
      }
      const pv = this.perView();
      if (pv !== this.pv) {
        this.sig = '';
        this.sync(this.clones);
      } else if (this.win.innerWidth !== rw) {
        this.go(this.index, false);
      }
      rw = this.win.innerWidth;
    };
    if ('function' === typeof this.win.ResizeObserver) {
      this.ro = new this.win.ResizeObserver(() => this.onResize());
      this.ro.observe(this.viewport);
    }
    this.onWinResize = debounce(this.win, () => this.onResize(), 120);
    this.win.addEventListener('resize', this.onWinResize);
    this.mqls = [];
    if ('function' === typeof this.win.matchMedia) {
      ['(min-width: 1025px)', '(min-width: 768px)', '(min-width: 576px)'].forEach(q => {
        const mql = this.win.matchMedia(q);
        if ('function' === typeof mql.addEventListener) {
          mql.addEventListener('change', this.onWinResize);
        }
        this.mqls.push(mql);
      });
    }
    this.onVisibility = () => {
      if (this.doc.hidden) {
        this.stop();
      } else {
        this.restart();
      }
    };
    this.doc.addEventListener('visibilitychange', this.onVisibility);
  }
  bindSwipe() {
    const vp = this.viewport;
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dragging = false;
    let moved = false;
    let pid = null;
    this.onDown = e => {
      if (!this.active || 'mouse' === e.pointerType && 0 !== e.button) {
        return;
      }
      if (e.target.closest('input, select, textarea, button')) {
        return;
      }
      dragging = true;
      moved = false;
      dx = 0;
      startX = e.clientX;
      startY = e.clientY;
      pid = e.pointerId;
    };
    this.onMove = e => {
      if (!dragging || e.pointerId !== pid) {
        return;
      }
      const x = e.clientX - startX;
      const y = e.clientY - startY;
      if (!moved) {
        if (Math.abs(x) < 6) {
          return;
        }
        if (Math.abs(y) > Math.abs(x)) {
          dragging = false;
          return;
        }
        moved = true;
        this.stage.classList.add('is-dragging');
        try {
          this.viewport.setPointerCapture(pid);
        } catch (err) {
          // Ignore.
        }
      }
      dx = x;
      this.translate(this.offsetFor(this.pos) + dx, false);
    };
    this.onUp = () => {
      if (!dragging) {
        return;
      }
      dragging = false;
      this.stage.classList.remove('is-dragging');
      if (!moved) {
        return;
      }
      const threshold = Math.min(80, this.slideWidth() / 4);
      const rtl = this.isRTL();
      if (dx < -threshold) {
        (rtl ? this.onPrev : this.onNext)();
      } else if (dx > threshold) {
        (rtl ? this.onNext : this.onPrev)();
      } else {
        this.go(this.index, true);
      }
      const block = ev => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      this.viewport.addEventListener('click', block, {
        capture: true,
        once: true
      });
      this.win.setTimeout(() => this.viewport && this.viewport.removeEventListener('click', block, {
        capture: true
      }), 50);
    };
    this.onDragStart = e => e.preventDefault();
    vp.addEventListener('pointerdown', this.onDown);
    vp.addEventListener('pointermove', this.onMove);
    vp.addEventListener('pointerup', this.onUp);
    vp.addEventListener('pointercancel', this.onUp);
    vp.addEventListener('dragstart', this.onDragStart);
    this.swipeVp = vp;
  }
  isRTL() {
    return 'rtl' === this.win.getComputedStyle(this.stage).direction;
  }
  slideWidth() {
    const first = this.track && this.track.firstElementChild;
    return first ? first.getBoundingClientRect().width : 0;
  }
  gapPx() {
    const tr = this.track;
    const g = tr ? parseFloat(this.win.getComputedStyle(tr).columnGap) : NaN;
    return isNaN(g) ? Number(this.cfg.gap) || 0 : g;
  }
  offsetFor(pos) {
    const px = pos * (this.slideWidth() + this.gapPx());
    return this.isRTL() ? px : -px;
  }
  reduced() {
    return 'function' === typeof this.win.matchMedia && this.win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  translate(x, animate) {
    const tr = this.track;
    if (!tr) {
      return;
    }
    const speed = this.reduced() ? 0 : Math.max(0, parseInt(this.cfg.speed, 10) || 0);
    tr.style.transitionDuration = animate ? speed + 'ms' : '0ms';
    tr.style.transform = 'translate3d(' + x + 'px,0,0)';
    if (animate && 0 === speed) {
      this.win.requestAnimationFrame(() => this.settle());
    }
  }
  go(i, animate = true) {
    if (!this.active) {
      this.index = 0;
      this.pos = 0;
      this.translate(0, false);
      this.updateUI();
      return;
    }
    if (this.loop) {
      const min = -this.clones;
      const max = this.count + this.clones - this.pv;
      i = Math.max(min, Math.min(max, i));
      this.pos = i + this.clones;
    } else {
      i = Math.max(0, Math.min(this.maxIndex, i));
      this.pos = i;
    }
    this.index = i;
    this.translate(this.offsetFor(this.pos), animate);
    this.updateUI();
  }
  settle() {
    if (!this.loop) {
      return;
    }
    if (this.index < 0 || this.index >= this.count) {
      const norm = (this.index % this.count + this.count) % this.count;
      this.go(norm, false);
      void this.track.offsetWidth; // eslint-disable-line no-void
    }
  }
  next() {
    if (!this.active) {
      return;
    }
    if (this.loop) {
      this.settle();
      this.go(this.index + this.step);
    } else if (this.index >= this.maxIndex) {
      this.go(0);
    } else {
      this.go(this.index + this.step);
    }
  }
  prev() {
    if (!this.active) {
      return;
    }
    if (this.loop) {
      this.settle();
      this.go(this.index - this.step);
    } else if (this.index <= 0) {
      this.go(this.maxIndex);
    } else {
      this.go(this.index - this.step);
    }
  }
  pageCount() {
    if (!this.active) {
      return 0;
    }
    return this.loop ? Math.ceil(this.count / this.step) : Math.ceil(this.maxIndex / this.step) + 1;
  }
  currentPage() {
    if (this.loop) {
      const norm = (this.index % this.count + this.count) % this.count;
      return Math.min(this.pageCount() - 1, Math.floor(norm / this.step));
    }
    if (this.index >= this.maxIndex) {
      return this.pageCount() - 1;
    }
    return Math.floor(this.index / this.step);
  }

  /** Dots live in a React-rendered, childless container: React never touches its children. */
  buildDots() {
    const dots = this.stage.querySelector('.bptm-carousel-dots');
    if (!dots) {
      return;
    }
    const pages = this.pageCount();
    dots.hidden = pages <= 1;
    if (pages === this.dotsCount && dots.children.length === pages) {
      return;
    }
    this.dotsCount = pages;
    dots.textContent = '';
    for (let p = 0; p < pages; p++) {
      const b = this.doc.createElement('button');
      b.type = 'button';
      b.className = 'bptm-dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', sprintf(this.i18n.slide || 'Go to slide %d', p + 1));
      dots.appendChild(b);
    }
  }
  updateUI() {
    const navs = this.stage.querySelector('.bptm-carousel-navs');
    if (navs) {
      navs.hidden = !this.active;
    }
    const dots = this.stage.querySelector('.bptm-carousel-dots');
    if (dots) {
      dots.hidden = this.pageCount() <= 1;
      const page = this.currentPage();
      Array.from(dots.children).forEach((d, p) => {
        const on = p === page;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    const tr = this.track;
    if (!tr) {
      return;
    }
    Array.from(tr.children).forEach((el, k) => {
      if (!el.classList.contains('bptm-item')) {
        return;
      }
      const visible = k >= this.pos && k < this.pos + this.pv;
      el.classList.toggle('is-visible', visible);
      if (el.classList.contains('bptm-clone')) {
        el.setAttribute('inert', '');
        return;
      }
      if (visible) {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      } else {
        el.setAttribute('inert', '');
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }
  stop() {
    if (this.timer) {
      this.win.clearInterval(this.timer);
      this.timer = null;
    }
  }
  restart() {
    this.stop();
    if (!this.cfg.autoplay || !this.active) {
      return;
    }
    const timeout = Math.max(500, parseInt(this.cfg.timeout, 10) || 2500);
    const speed = Math.max(0, parseInt(this.cfg.speed, 10) || 0);
    this.timer = this.win.setInterval(() => {
      if (!this.stage.isConnected) {
        this.stop();
        return;
      }
      if (this.doc.hidden || this.focused || this.cfg.hoverPause && this.hovering || this.stage.closest('.bptm-modal-open-host')) {
        return;
      }
      this.next();
    }, timeout + speed);
  }
  destroy() {
    this.stop();
    const s = this.stage;
    s.removeEventListener('click', this.onClick);
    s.removeEventListener('transitionend', this.onTransitionEnd);
    s.removeEventListener('mouseenter', this.onEnter);
    s.removeEventListener('mouseleave', this.onLeave);
    s.removeEventListener('focusin', this.onFocusIn);
    s.removeEventListener('focusout', this.onFocusOut);
    s.removeEventListener('keydown', this.onKey);
    const vp = this.swipeVp;
    if (vp) {
      vp.removeEventListener('pointerdown', this.onDown);
      vp.removeEventListener('pointermove', this.onMove);
      vp.removeEventListener('pointerup', this.onUp);
      vp.removeEventListener('pointercancel', this.onUp);
      vp.removeEventListener('dragstart', this.onDragStart);
    }
    if (this.ro) {
      this.ro.disconnect();
    }
    this.onWinResize.cancel();
    this.win.removeEventListener('resize', this.onWinResize);
    this.mqls.forEach(mql => 'function' === typeof mql.removeEventListener && mql.removeEventListener('change', this.onWinResize));
    this.doc.removeEventListener('visibilitychange', this.onVisibility);
  }
}

/**
 * Carousel hook: returns the number of clones React must render on each side.
 *
 * @param {Object}  ref     Ref of the `.bptm-carousel` stage element.
 * @param {boolean} enabled View is carousel.
 * @param {Object}  cfg     Engine config.
 * @param {Object}  i18n    Strings.
 * @return {number} Clones per side.
 */
const useCarousel = (ref, enabled, cfg, i18n) => {
  const [clones, setClones] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
  const engine = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const clonesRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(clones);
  clonesRef.current = clones;

  // Create / destroy with the stage element.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    if (!enabled || !ref.current) {
      return undefined;
    }
    const eng = new Engine(ref.current, cfg, i18n, n => {
      if (n !== clonesRef.current) {
        setClones(n);
      }
    });
    engine.current = eng;
    return () => {
      eng.destroy();
      engine.current = null;
    };
  }, [enabled]);

  // After every commit: keep config current and re-sync (cheap when nothing changed).
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    const eng = engine.current;
    if (!eng || !enabled) {
      return;
    }
    eng.cfg = cfg;
    eng.i18n = i18n;
    if (eng.stage !== ref.current && ref.current) {
      eng.destroy();
      engine.current = new Engine(ref.current, cfg, i18n, eng.onClones);
    }
    engine.current.sync(clonesRef.current);
  });
  return enabled ? clones : 0;
};

/***/ }),

/***/ "./src/Components/Common/Team/context.js":
/*!***********************************************!*\
  !*** ./src/Components/Common/Team/context.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cx: () => (/* binding */ cx),
/* harmony export */   join: () => (/* binding */ join),
/* harmony export */   makeContext: () => (/* binding */ makeContext)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _model__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./model */ "./src/Components/Common/Team/model.js");
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./bridge */ "./src/Components/Common/Team/bridge.js");
/* harmony import */ var _sanitize__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./sanitize */ "./src/Components/Common/Team/sanitize.js");
/* harmony import */ var _socialIcons_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./socialIcons.json */ "./src/Components/Common/Team/socialIcons.json");
/* harmony import */ var _registry__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./registry */ "./src/Components/Common/Team/registry.js");
/**
 * Render context (port of the former PHP Context): one per instance + visibility group.
 * Helpers return React nodes, or null when the part is hidden / empty (templates test truthiness,
 * exactly like the PHP templates tested for '').
 */







const cx = (...parts) => parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

/** Fragment of non-empty parts (null when every part is empty). */
const join = (...parts) => {
  const list = parts.flat().filter(p => null !== p && undefined !== p && false !== p && '' !== p);
  if (!list.length) {
    return null;
  }
  return list.length === 1 ? list[0] : (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, ...list.map((p, i) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
    key: i
  }, p)));
};
const LINK_HREF_PROTOCOLS = ['http', 'https', 'mailto', 'tel', 'skype', 'callto', 'sms', 'viber', 'whatsapp'];

/**
 * Create a context.
 *
 * @param {Object} base { atts, theme, uid, view, linkType, vis, isEditor }.
 * @param {string} group Visibility group: initial | popup | panel | drawer.
 * @return {Object} Context.
 */
const makeContext = (base, group = 'initial') => {
  const ctx = {
    ...base,
    group: _registry__WEBPACK_IMPORTED_MODULE_6__.VIS_GROUPS.includes(group) ? group : 'initial'
  };
  const {
    atts
  } = ctx;
  const ip = name => ctx.clone ? {} : {
    itemProp: name
  };
  ctx.withGroup = g => makeContext(base, g);
  ctx.asClone = () => makeContext({
    ...base,
    clone: true
  }, ctx.group);
  ctx.isDetail = () => 'initial' !== ctx.group;
  ctx.attr = (k, d) => Object.prototype.hasOwnProperty.call(atts, k) ? atts[k] : d;
  ctx.show = field => {
    const g = ctx.vis[ctx.group] || {};
    if (!g[field]) {
      return 'initial' !== ctx.group;
    }
    return (0,_model__WEBPACK_IMPORTED_MODULE_2__.anyDevice)(g[field]);
  };
  ctx.vis_classes = (field, extra = '') => {
    const g = ctx.vis[ctx.group] || {};
    return cx(extra, (0,_model__WEBPACK_IMPORTED_MODULE_2__.hideClasses)(g[field]));
  };

  /* ---------------- Links ---------------- */
  ctx.memberLinkType = m => 'custom' === ctx.linkType && !m.custom_page ? 'none' : ctx.linkType;
  ctx.modalEnabled = () => ['popup', 'panel', 'drawer'].includes(ctx.linkType);
  ctx.hasLink = m => 'none' !== ctx.memberLinkType(m) && !ctx.isDetail();
  ctx.detailId = m => 'bptm-detail-' + ctx.uid + '-' + (m.id || 'm0');
  const isInternal = u => {
    const mm = /^(?:[a-z][a-z0-9+.-]*:)?\/\/([^/?#]+)/i.exec(u);
    if (!mm) {
      return true;
    }
    const host = 'undefined' !== typeof window ? window.location.host : '';
    return mm[1].toLowerCase() === String(host).toLowerCase();
  };

  /** Props of the member link (null when not linked). */
  ctx.linkProps = (m, cls = '') => {
    if (!ctx.hasLink(m)) {
      return null;
    }
    const type = ctx.memberLinkType(m);
    const p = {
      className: cx('bptm-link', cls)
    };
    if (['popup', 'panel', 'drawer'].includes(type)) {
      p.href = '#' + ctx.detailId(m);
      p.className += ' bptm-open';
      p['data-bptm-open'] = type;
      p['data-bptm-id'] = m.id;
      p.role = 'button';
      p['aria-haspopup'] = 'drawer' === type ? 'true' : 'dialog';
      p['aria-controls'] = ctx.detailId(m);
    } else {
      p.href = _sanitize__WEBPACK_IMPORTED_MODULE_4__.url(m.custom_page, LINK_HREF_PROTOCOLS);
      if (!isInternal(m.custom_page) || '_blank' === atts.linkTarget) {
        p.target = '_blank';
        p.rel = 'noopener';
      }
    }
    return p;
  };
  ctx.wrapLink = (m, children, cls = '') => {
    const p = ctx.linkProps(m, cls);
    return p ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', p, children) : children;
  };

  /* ---------------- Item wrapper ---------------- */
  /** Props for the item root (classes, filter data, schema). */
  ctx.itemProps = (m, extra = []) => {
    const classes = ['bptm-item', ...extra];
    if (m.featured) {
      classes.push('bptm-is-featured');
    }
    if (atts.enableScrollAnimation && 'carousel' !== ctx.view) {
      classes.push('bptm-anim');
    }
    const type = ctx.memberLinkType(m);
    if ('none' !== type) {
      classes.push('bptm-linked-' + type);
    }
    const p = {
      className: [...new Set(classes.filter(Boolean))].join(' '),
      'data-bptm-id': m.id,
      'data-name': _sanitize__WEBPACK_IMPORTED_MODULE_4__.lower(m.name)
    };
    if ('carousel' !== ctx.view) {
      p['data-designation'] = '' !== m.designation ? _sanitize__WEBPACK_IMPORTED_MODULE_4__.termSlug(m.designation) : '';
      p['data-company'] = _sanitize__WEBPACK_IMPORTED_MODULE_4__.lower(m.company);
      p['data-zip'] = _sanitize__WEBPACK_IMPORTED_MODULE_4__.lower(m.zip_code);
      p['data-tags'] = (m.terms.tag || []).map(x => _sanitize__WEBPACK_IMPORTED_MODULE_4__.lower(x.name)).join('|');
      ['group', 'location', 'language', 'gender', 'specialty', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five'].forEach(k => {
        const slugs = (0,_model__WEBPACK_IMPORTED_MODULE_2__.termSlugs)(m, k);
        if (slugs.length) {
          p['data-' + k.replace(/_/g, '-')] = slugs.join(' ');
        }
      });
      if ((0,_bridge__WEBPACK_IMPORTED_MODULE_3__.pref)('search_all_fields')) {
        p['data-search'] = _sanitize__WEBPACK_IMPORTED_MODULE_4__.lower((0,_model__WEBPACK_IMPORTED_MODULE_2__.searchText)(m));
      }
    }
    if (!ctx.clone) {
      p.itemScope = true;
      p.itemType = 'https://schema.org/Person';
    }
    return p;
  };

  /* ---------------- Images ---------------- */
  const noLazyClasses = () => {
    const out = [];
    String((0,_bridge__WEBPACK_IMPORTED_MODULE_3__.pref)('lazy_load_class') || '').trim().split(/[\s,]+/).forEach(c => {
      c = _sanitize__WEBPACK_IMPORTED_MODULE_4__.htmlClass(c);
      if (c && !out.includes(c)) {
        out.push(c);
      }
    });
    return out;
  };
  const imgTag = (u, alt, cls, itemprop) => {
    const p = {
      className: '',
      alt: _sanitize__WEBPACK_IMPORTED_MODULE_4__.stripTags(alt)
    };
    let classes = cls.split(/\s+/).filter(Boolean).map(_sanitize__WEBPACK_IMPORTED_MODULE_4__.htmlClass).join(' ');
    if ((0,_bridge__WEBPACK_IMPORTED_MODULE_3__.pref)('disable_lazy_load')) {
      classes = cx(classes, noLazyClasses().join(' '));
      p.loading = 'eager';
      p['data-no-lazy'] = '1';
    } else {
      p.loading = (ctx.index || 0) < 4 && 'carousel' !== ctx.view && !ctx.isDetail() ? 'eager' : 'lazy';
      p.decoding = 'async';
    }
    p.className = classes;
    if (itemprop && !ctx.clone) {
      p.itemProp = itemprop;
    }
    if (!u) {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
        className: p.className + ' bptm-img-placeholder bptm-img-empty',
        role: 'img',
        'aria-label': p.alt
      });
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('img', {
      src: u,
      ...p
    });
  };

  /** Thumbnail (wrapped in the member link when "Link Image" is on). */
  ctx.image = (m, cls = 'bptm-img', linkable = true) => {
    if (!ctx.show('thumbnail')) {
      return null;
    }
    let img = imgTag(m.image_url, m.image_alt || m.name, cls, 'image');
    const vc = ctx.vis_classes('thumbnail');
    if (vc) {
      img = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
        className: 'bptm-vis ' + vc
      }, img);
    }
    if (linkable && atts.linkPreviewImage && ctx.hasLink(m)) {
      img = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', ctx.linkProps(m, 'bptm-img-link'), img);
    }
    return img;
  };

  /** Flip (back side) image; null when the member has none. */
  ctx.flipImage = (m, cls = 'bptm-img bptm-flip-img') => {
    if (!m.flip_image_id && !m.flip_image_url) {
      return null;
    }
    return imgTag(m.flip_image_url, m.name, cls, '');
  };

  /* ---------------- Text parts ---------------- */
  ctx.name = (m, tag = 'h3') => {
    if (!ctx.show('name') || '' === m.name) {
      return null;
    }
    tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'span', 'td', 'strong'].includes(tag) ? tag : 'h3';
    const inner = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', ip('name'), m.name);
    const lp = ctx.linkProps(m, 'bptm-name-link');
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(tag, {
      className: ctx.vis_classes('name', 'bptm-name')
    }, lp ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', lp, inner) : inner);
  };
  ctx.designation = (m, tag = 'div') => {
    if (!ctx.show('designation') || '' === m.designation) {
      return null;
    }
    tag = ['div', 'p', 'span', 'td', 'h4', 'h5', 'h6'].includes(tag) ? tag : 'div';
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(tag, {
      className: ctx.vis_classes('designation', 'bptm-designation'),
      ...ip('jobTitle')
    }, m.designation);
  };
  ctx.details = m => {
    if (!ctx.show('details')) {
      return null;
    }
    let classes = 'bptm-details';
    if (atts.descScrollControl) {
      classes += ' bptm-scroll';
    }
    let inner;
    if (ctx.isDetail() || atts.allowHtmlDetails) {
      let nodes = m.content || [];
      if ('' === _sanitize__WEBPACK_IMPORTED_MODULE_4__.nodesText(nodes).trim()) {
        nodes = '' !== m.excerpt ? _sanitize__WEBPACK_IMPORTED_MODULE_4__.textParagraphs(m.excerpt) : [];
      }
      if ('' === _sanitize__WEBPACK_IMPORTED_MODULE_4__.nodesText(nodes).trim()) {
        return null;
      }
      inner = _sanitize__WEBPACK_IMPORTED_MODULE_4__.nodesToReact(nodes);
    } else {
      let txt = '' !== m.excerpt.trim() ? m.excerpt : _sanitize__WEBPACK_IMPORTED_MODULE_4__.nodesText(m.content || []);
      txt = _sanitize__WEBPACK_IMPORTED_MODULE_4__.decodeEntities(_sanitize__WEBPACK_IMPORTED_MODULE_4__.stripTags(txt.replace(/\[\/?[a-z][^\]]*\]/gi, ''))).replace(/[\s]+/g, ' ').trim();
      if ('' === txt) {
        return null;
      }
      const max = Math.trunc(Number(atts.detailsLength)) || 0;
      const chars = Array.from(txt);
      let p;
      if (max > 0 && chars.length > max) {
        const cut = chars.slice(0, max).join('').replace(/\s+$/, '') + '…';
        const lp = ctx.linkProps(m, 'bptm-more');
        p = lp ? [cut, ' ', (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', {
          ...lp,
          key: 'more'
        }, (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)('more'))] : [cut];
      } else {
        p = [txt];
      }
      inner = [(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('p', {
        key: 'p'
      }, ...p)];
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: ctx.vis_classes('details', classes),
      ...ip('description')
    }, ...inner);
  };

  /* ---------------- Social ---------------- */
  ctx.social = (m, style = '') => {
    if (!ctx.show('social') || !m.social.length) {
      return null;
    }
    const items = [];
    m.social.forEach(s => {
      if (!s.icon) {
        return;
      }
      const href = (0,_model__WEBPACK_IMPORTED_MODULE_2__.socialHref)(s);
      if ('' === href) {
        return;
      }
      const icon = s.icon.replace(/[^a-z0-9 _-]/gi, '');
      let label = _socialIcons_json__WEBPACK_IMPORTED_MODULE_5__[s.icon];
      if (!label) {
        let l = icon;
        ['fa-brands', 'fa-solid', 'fa-regular', 'fab', 'fas', 'far', 'fa-', '-'].forEach(x => {
          l = l.split(x).join(' ');
        });
        label = l.trim().replace(/(^|[\s])([a-z])/g, (mm, a, b) => a + b.toUpperCase());
      }
      const slug = _sanitize__WEBPACK_IMPORTED_MODULE_4__.htmlClass(icon.split('fa-').join('').replace(/\b(fab|fas|far|fa-brands|fa-solid|fa-regular)\b/g, '').trim());
      items.push([href, icon, label, slug]);
    });
    if (!items.length) {
      return null;
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('ul', {
      className: ctx.vis_classes('social', 'bptm-social' + (style ? ' bptm-social--' + _sanitize__WEBPACK_IMPORTED_MODULE_4__.htmlClass(style) : ''))
    }, items.map(([href, icon, label, slug], i) => {
      const safe = _sanitize__WEBPACK_IMPORTED_MODULE_4__.url(href, LINK_HREF_PROTOCOLS);
      const web = /^https?:\/\//i.test(href);
      const ap = {
        className: 'bptm-social-link bptm-social-' + slug,
        href: safe,
        ...(web ? {
          target: '_blank',
          rel: 'noopener nofollow'
        } : {}),
        ...ip('sameAs'),
        'aria-label': label,
        title: label
      };
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('li', {
        className: 'bptm-social-item',
        key: i
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', ap, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
        className: icon,
        'aria-hidden': 'true'
      })));
    }));
  };
  ctx.ribbon = m => {
    if (!ctx.show('ribbon') || '' === m.ribbon.trim()) {
      return null;
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
      className: ctx.vis_classes('ribbon', 'bptm-ribbon')
    }, m.ribbon);
  };
  ctx.featuredBadge = m => {
    if (!m.featured || !atts.enableFeaturing || !ctx.show('featured_badge')) {
      return null;
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
      className: ctx.vis_classes('featured_badge', 'bptm-featured'),
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Featured', 'bp-team-member')
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
      className: 'fas fa-award',
      'aria-hidden': 'true'
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
      className: 'screen-reader-text'
    }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Featured', 'bp-team-member')));
  };
  ctx.skills = (m, title = null) => {
    if (!ctx.show('skills') || !m.skills.length) {
      return null;
    }
    const list = m.skills.filter(s => '' !== s.skill.trim() && s.percent > 0);
    if (!list.length) {
      return null;
    }
    const showTitle = null === title ? ctx.isDetail() : !!title;
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: ctx.vis_classes('skills', 'bptm-skills')
    }, showTitle ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('h4', {
      className: 'bptm-skills-title'
    }, (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)('skills')) : null, list.map((s, i) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-skill',
      key: i
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-skill-head'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
      className: 'bptm-skill-name'
    }, s.skill.trim()), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
      className: 'bptm-skill-value'
    }, s.percent + '%')), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-skill-bar',
      role: 'progressbar',
      'aria-label': s.skill.trim(),
      'aria-valuenow': String(s.percent),
      'aria-valuemin': '0',
      'aria-valuemax': '100'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
      className: 'bptm-skill-fill',
      style: {
        '--bptm-skill': s.percent + '%'
      }
    })))));
  };

  /* ---------------- Meta ---------------- */
  const breakable = txt => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
    className: 'bptm-email-text'
  }, String(txt).split(/(@|\.)/).map((part, i) => {
    if ('@' === part) {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        key: i
      }, '@', (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('wbr'));
    }
    if ('.' === part) {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        key: i
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('wbr'), '.');
    }
    return part;
  }));
  const phone = (num, prefKey) => {
    num = String(num || '').trim();
    if ('' === num) {
      return null;
    }
    const txt = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', ip('telephone'), num);
    if ((0,_bridge__WEBPACK_IMPORTED_MODULE_3__.pref)(prefKey)) {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', {
        href: _sanitize__WEBPACK_IMPORTED_MODULE_4__.url('tel:' + num.replace(/[^\d+]/g, ''), ['tel'])
      }, txt);
    }
    return txt;
  };
  ctx.mailto = m => {
    const q = [];
    if (m.email_cc) {
      q.push('cc=' + encodeURIComponent(m.email_cc).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()));
    }
    if (m.email_bcc) {
      q.push('bcc=' + encodeURIComponent(m.email_bcc).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()));
    }
    return 'mailto:' + m.email + (q.length ? '?' + q.join('&') : '');
  };
  const emailValue = m => {
    if ('' === m.email) {
      return null;
    }
    const txt = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', ip('email'), breakable(m.email));
    if (!(0,_bridge__WEBPACK_IMPORTED_MODULE_3__.pref)('email_link')) {
      return txt;
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', {
      href: _sanitize__WEBPACK_IMPORTED_MODULE_4__.url(ctx.mailto(m), ['mailto'])
    }, txt);
  };

  /** Visible meta rows in display order: [{ field, label, value (node), icon, classes }]. */
  ctx.metaRows = m => {
    const rows = [];
    const texts = {
      address: m.address,
      land_phone: String(m.land_phone || '').trim(),
      cell_phone: String(m.cell_phone || '').trim(),
      email: m.email,
      zip: m.zip_code
    };
    const add = (field, label, value, icon, empty) => {
      if (empty || null === value || !ctx.show(field)) {
        return;
      }
      const text = 'string' === typeof value ? value : texts[field] || '';
      rows.push({
        field,
        label,
        value,
        icon,
        text: String(text).trim(),
        classes: ctx.vis_classes(field, 'bptm-meta-item bptm-meta-' + field.replace(/_/g, '-'))
      });
    };
    let company = null;
    if ('' !== m.company || '' !== m.company_website) {
      const txt = '' !== m.company ? m.company : m.company_website.replace(/^https?:\/\//, '');
      texts.company = txt;
      company = '' !== m.company_website ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', {
        href: _sanitize__WEBPACK_IMPORTED_MODULE_4__.url(m.company_website),
        target: '_blank',
        rel: 'nofollow noopener'
      }, '' !== m.company ? txt : breakable(txt)) : txt;
      company = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', ip('worksFor'), company);
    }
    add('company', (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)('company'), company, 'fas fa-briefcase', null === company);
    add('address', (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)('address'), '' !== m.address ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', ip('address'), m.address) : null, 'fas fa-location-dot');
    add('land_phone', (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)('land_phone'), phone(m.land_phone, 'land_phone_link'), 'fas fa-phone');
    add('cell_phone', (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)('cell_phone'), phone(m.cell_phone, 'cell_phone_link'), 'fas fa-mobile-screen');
    add('email', (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)('email'), emailValue(m), 'fas fa-envelope');
    const icons = {
      location: 'fas fa-map-pin',
      language: 'fas fa-language',
      specialty: 'fas fa-star',
      gender: 'fas fa-venus-mars'
    };
    ['location', 'language', 'specialty', 'gender'].forEach(k => {
      const v = (0,_model__WEBPACK_IMPORTED_MODULE_2__.termNames)(m, k);
      add(k, (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)(k), '' !== v.trim() ? v : null, icons[k]);
    });
    add('zip', (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)('zip_code'), '' !== m.zip_code ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', ip('postalCode'), m.zip_code) : null, 'fas fa-map-location-dot');
    ['extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five'].forEach(k => {
      const v = (0,_model__WEBPACK_IMPORTED_MODULE_2__.termNames)(m, k);
      add(k, (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)(k), '' !== v.trim() ? v : null, 'fas fa-circle-info');
    });
    return rows;
  };
  ctx.metaDetails = (m, variant = 'list') => {
    const rows = ctx.metaRows(m);
    if (!rows.length) {
      return null;
    }
    variant = ['list', 'icons', 'inline', 'table'].includes(variant) ? variant : 'list';
    if ('table' === variant) {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('table', {
        className: 'bptm-meta bptm-meta--table'
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('tbody', null, rows.map(r => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('tr', {
        className: r.classes,
        key: r.field
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('th', {
        scope: 'row',
        className: 'bptm-meta-label'
      }, r.label), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('td', {
        className: 'bptm-meta-value'
      }, r.value)))));
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('ul', {
      className: 'bptm-meta bptm-meta--' + variant
    }, rows.map(r => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('li', {
      className: r.classes,
      key: r.field
    }, 'list' !== variant ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
      className: 'bptm-meta-icon ' + r.icon,
      'aria-hidden': 'true'
    }) : null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
      className: 'bptm-meta-label' + ('list' !== variant ? ' screen-reader-text' : '')
    }, r.label), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
      className: 'bptm-meta-value'
    }, r.value))));
  };
  ctx.vcard = m => {
    if (!m.vcard || !ctx.show('vcard')) {
      return null;
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', {
      className: ctx.vis_classes('vcard', 'bptm-vcard'),
      href: _sanitize__WEBPACK_IMPORTED_MODULE_4__.url(m.vcard),
      download: ''
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
      className: 'fas fa-address-card',
      'aria-hidden': 'true'
    }), ' ', (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', null, (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)('vcard')));
  };
  ctx.readMore = (m, txt = '') => {
    if (!ctx.show('read_more') || !ctx.hasLink(m)) {
      return null;
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: ctx.vis_classes('read_more', 'bptm-readmore')
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', ctx.linkProps(m, 'bptm-readmore-btn'), txt || (0,_bridge__WEBPACK_IMPORTED_MODULE_3__.t)('read_on')));
  };
  ctx.termsText = (m, k, sep = ', ') => (0,_model__WEBPACK_IMPORTED_MODULE_2__.termNames)(m, k, sep);
  return ctx;
};


/***/ }),

/***/ "./src/Components/Common/Team/css.js":
/*!*******************************************!*\
  !*** ./src/Components/Common/Team/css.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   COLOR_VARS: () => (/* binding */ COLOR_VARS),
/* harmony export */   color: () => (/* binding */ color),
/* harmony export */   dynamicCss: () => (/* binding */ dynamicCss),
/* harmony export */   fontFamily: () => (/* binding */ fontFamily),
/* harmony export */   googleFontsUrl: () => (/* binding */ googleFontsUrl),
/* harmony export */   length: () => (/* binding */ length),
/* harmony export */   usedFonts: () => (/* binding */ usedFonts)
/* harmony export */ });
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bridge */ "./src/Components/Common/Team/bridge.js");
/**
 * Scoped dynamic CSS generated from the block's style attributes (port of the former PHP Style class).
 * Every value is validated (colours, lengths, font names, keywords) so attributes cannot break out of
 * the <style> element; '<' is stripped from the final text as a last guard.
 */

const COLOR_VARS = {
  nameColor: '--bptm-name-color',
  nameBg: '--bptm-name-bg',
  roleColor: '--bptm-role-color',
  descriptionColor: '--bptm-desc-color',
  descriptionLinkColor: '--bptm-desc-link-color',
  infoColor: '--bptm-info-color',
  infoIconColor: '--bptm-info-icon-color',
  infoBg: '--bptm-info-bg',
  itemBg: '--bptm-item-bg',
  itemBgHover: '--bptm-item-bg-hover',
  tooltipBg: '--bptm-tooltip-bg',
  hoverIconBg: '--bptm-hover-icon-bg',
  ribbonBg: '--bptm-ribbon-bg',
  pgColor: '--bptm-pg-color',
  pgBg: '--bptm-pg-bg',
  pgBorderColor: '--bptm-pg-border',
  pgHoverColor: '--bptm-pg-hover-color',
  pgHoverBg: '--bptm-pg-hover-bg',
  pgHoverBorderColor: '--bptm-pg-hover-border',
  pgActiveColor: '--bptm-pg-active-color',
  pgActiveBg: '--bptm-pg-active-bg',
  pgActiveBorderColor: '--bptm-pg-active-border',
  lmColor: '--bptm-lm-color',
  lmBg: '--bptm-lm-bg',
  lmBorderColor: '--bptm-lm-border',
  lmHoverColor: '--bptm-lm-hover-color',
  lmHoverBg: '--bptm-lm-hover-bg',
  pgLoaderColor: '--bptm-pg-loader-color',
  popupBg: '--bptm-modal-bg',
  popupCloseColor: '--bptm-close-color',
  popupCloseBg: '--bptm-close-bg',
  popupCloseHoverColor: '--bptm-close-hover-color',
  popupCloseHoverBg: '--bptm-close-hover-bg',
  popupArrowColor: '--bptm-popup-arrow-color',
  popupNavBg: '--bptm-popup-nav-bg',
  popupNavBorderColor: '--bptm-popup-nav-border',
  popupNavHoverColor: '--bptm-popup-nav-hover-color',
  popupNavHoverBg: '--bptm-popup-nav-hover-bg',
  popupNavHoverBorderColor: '--bptm-popup-nav-hover-border',
  accentColor: '--bptm-accent',
  sliderNavColor: '--bptm-nav-color',
  sliderNavBg: '--bptm-nav-bg',
  sliderNavHoverColor: '--bptm-nav-hover-color',
  sliderNavHoverBg: '--bptm-nav-hover-bg',
  sliderDotColor: '--bptm-dot-color',
  sliderDotHoverColor: '--bptm-dot-active-color',
  filterTextColor: '--bptm-filter-color',
  filterActiveTextColor: '--bptm-filter-active-color',
  filterBgColor: '--bptm-filter-bg',
  filterActiveBgColor: '--bptm-filter-active-bg',
  filterBorderColor: '--bptm-filter-border',
  filterActiveBorderColor: '--bptm-filter-active-border',
  itemBorderColor: '--bptm-item-border-color'
};
const TYPO = {
  nameTypography: ['--bptm-name', ['.bptm-name', '.bptm-name a'], ['.bptm-item:hover .bptm-name', '.bptm-item:hover .bptm-name a']],
  roleTypography: ['--bptm-role', ['.bptm-designation'], ['.bptm-item:hover .bptm-designation']],
  detailsTypography: ['--bptm-desc', ['.bptm-details', '.bptm-details p'], ['.bptm-item:hover .bptm-details', '.bptm-item:hover .bptm-details p']],
  infoTypography: ['--bptm-info', ['.bptm-meta', '.bptm-meta a', '.bptm-meta-value'], ['.bptm-meta-item:hover', '.bptm-meta-item:hover a']],
  ribbonTypography: ['--bptm-ribbon', ['.bptm-ribbon'], ['.bptm-item:hover .bptm-ribbon']],
  readmoreTypography: ['--bptm-readmore', ['.bptm-readmore a', '.bptm-more', '.bptm-readmore-btn'], ['.bptm-readmore a:hover', '.bptm-more:hover', '.bptm-readmore-btn:hover']],
  popupNavTypography: ['--bptm-popup-nav', ['.bptm-modal-nav button span'], ['.bptm-modal-nav button:hover span']]
};
const SHADOWS = {
  none: 'none',
  sm: '0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.06)',
  md: '0 6px 18px rgba(15,23,42,.10)',
  lg: '0 14px 40px rgba(15,23,42,.14)',
  xl: '0 24px 60px rgba(15,23,42,.18)'
};
const MEDIA = {
  tablet: '@media (max-width:1024px)',
  mobilePortrait: '@media (max-width:767px)',
  mobile: '@media (max-width:575px)'
};
const isNum = v => 'number' === typeof v && isFinite(v) || 'string' === typeof v && '' !== v.trim() && isFinite(Number(v.trim()));

/** CSS colour or ''. */
const color = c => {
  if (null === c || undefined === c || 'object' === typeof c) {
    return '';
  }
  c = String(c).trim();
  if ('' === c) {
    return '';
  }
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(c)) {
    return c;
  }
  if (/^(rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s/+-]+\)$/i.test(c)) {
    return c;
  }
  if (/^var\(--[a-z0-9-]+(\s*,\s*[#a-z0-9(),.%\s-]+)?\)$/i.test(c)) {
    return c;
  }
  if (/^(linear|radial)-gradient\([#a-z0-9(),.%\s-]+\)$/i.test(c)) {
    return c;
  }
  if (/^[a-z]{3,20}$/i.test(c)) {
    return c.toLowerCase();
  }
  return '';
};

/** CSS length (bare numbers get `unit`) or ''. */
const length = (v, unit = 'px') => {
  if (isNum(v)) {
    return String(Number(v)) + unit;
  }
  if (null === v || undefined === v || 'object' === typeof v || 'boolean' === typeof v) {
    return '';
  }
  v = String(v).trim();
  if ('' === v) {
    return '';
  }
  if (/^-?\d*\.?\d+(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|pt)$/i.test(v)) {
    return v.toLowerCase();
  }
  if (/^(calc|clamp|min|max)\([0-9a-z.%+\-*/,\s()]+\)$/i.test(v)) {
    return v;
  }
  return ['auto', 'normal', 'inherit', 'initial', 'none'].includes(v) ? v : '';
};
const cleanFamily = f => String(null === f || undefined === f || 'object' === typeof f ? '' : f).replace(/[^a-zA-Z0-9 _-]/g, '').trim();
const fontFamily = f => {
  f = cleanFamily(f);
  if ('' === f || 'default' === f.toLowerCase()) {
    return '';
  }
  return "'" + f + "', sans-serif";
};
const tget = (t, camel, snake) => {
  if (undefined !== t[camel] && null !== t[camel] && '' !== t[camel]) {
    return t[camel];
  }
  return undefined !== t[snake] && null !== t[snake] && '' !== t[snake] ? t[snake] : null;
};
const obj = v => v && 'object' === typeof v && !Array.isArray(v) ? v : {};

/** Font families used by the typography attributes. */
const usedFonts = atts => {
  const out = [];
  Object.keys(TYPO).forEach(k => {
    const t = obj(atts[k]);
    // bpl-tools Typography "Load Google Font" toggle: off = use the family without loading it.
    const f = false === t.isUploadFont ? '' : tget(t, 'fontFamily', 'font_family');
    const c = f ? cleanFamily(f) : '';
    if (c && !out.includes(c)) {
      out.push(c);
    }
  });
  return out;
};
const SYSTEM = ['Arial', 'Tahoma', 'Verdana', 'Helvetica', 'Times New Roman', 'Trebuchet MS', 'Georgia', 'Courier New', 'system-ui', 'sans-serif', 'serif', 'monospace', 'inherit'];

/**
 * Google Fonts stylesheet URL for the used families ('' when none / disabled).
 *
 * @param {Object} atts Attributes.
 * @return {string} URL.
 */
const googleFontsUrl = atts => {
  if ((0,_bridge__WEBPACK_IMPORTED_MODULE_0__.pref)('disable_google_fonts')) {
    return '';
  }
  const known = (0,_bridge__WEBPACK_IMPORTED_MODULE_0__.knownFonts)();
  const fams = usedFonts(atts).filter(f => '' !== f && !SYSTEM.includes(f) && 'default' !== f.toLowerCase() && (!known.length || known.includes(f))).sort();
  if (!fams.length) {
    return '';
  }
  // The v1 CSS API tolerates weights a family does not have (css2 rejects the whole request).
  return 'https://fonts.googleapis.com/css?family=' + fams.map(f => f.replace(/ /g, '+') + ':300,400,500,600,700,800,400italic,700italic').join('|') + '&display=swap';
};
const cssId = id => 'undefined' !== typeof window && window.CSS && 'function' === typeof window.CSS.escape ? window.CSS.escape(id) : String(id).replace(/[^A-Za-z0-9_-]/g, '');

/**
 * Dynamic CSS of one instance.
 *
 * @param {Object} atts  Sanitized attributes.
 * @param {string} domId Wrapper id.
 * @param {string} uid   Instance uid (modal scope).
 * @return {string} CSS.
 */
const dynamicCss = (atts, domId, uid) => {
  const scopes = ['#' + cssId(domId), '.bptm-modal[data-bptm-for="' + String(uid).replace(/[^A-Za-z0-9_-]/g, '') + '"]'];
  const vars = [];
  const setVar = (k, v) => {
    const i = vars.findIndex(x => x[0] === k);
    if (i >= 0) {
      vars[i][1] = v;
    } else {
      vars.push([k, v]);
    }
  };
  const rules = {
    '': new Map()
  };
  Object.values(MEDIA).forEach(m => {
    rules[m] = new Map();
  });
  const add = (media, selectors, decl) => {
    const full = [];
    selectors.forEach(sel => scopes.forEach(sc => full.push('' === sel ? sc : sc + ' ' + sel)));
    const k = full.join(',');
    if (!rules[media].has(k)) {
      rules[media].set(k, []);
    }
    rules[media].get(k).push(decl);
  };
  const cols = obj(atts.columns);
  [['desktop', 'd'], ['tablet', 't'], ['mobilePortrait', 'mp'], ['mobile', 'm']].forEach(([k, s]) => {
    const n = Math.trunc(Number(cols[k]));
    if (n > 0) {
      setVar('--bptm-cols-' + s, String(Math.min(12, n)));
    }
  });
  if (undefined !== atts.columnGap && '' !== atts.columnGap) {
    setVar('--bptm-gap', length(atts.columnGap));
  }
  if (undefined !== atts.rowGap && '' !== atts.rowGap) {
    setVar('--bptm-row-gap', length(atts.rowGap));
  }
  Object.keys(COLOR_VARS).forEach(a => {
    const c = color(atts[a]);
    if (c) {
      setVar(COLOR_VARS[a], c);
    }
  });
  const direct = {
    nameColor: [['.bptm-name', '.bptm-name a'], 'color'],
    nameBg: [['.bptm-name'], 'background'],
    roleColor: [['.bptm-designation'], 'color'],
    descriptionColor: [['.bptm-details', '.bptm-details p'], 'color'],
    descriptionLinkColor: [['.bptm-details a', '.bptm-more'], 'color'],
    infoColor: [['.bptm-meta', '.bptm-meta a'], 'color'],
    infoIconColor: [['.bptm-meta-icon'], 'color'],
    infoLabelColor: [['.bptm-meta-label'], 'color'],
    ribbonBg: [['.bptm-ribbon'], 'background']
  };
  Object.keys(direct).forEach(a => {
    const c = color(atts[a]);
    if (c) {
      add('', direct[a][0], direct[a][1] + ':' + c);
    }
  });
  // Featured badge (cards + popup / panel / drawer): scoped rules beat every theme's own badge styles.
  {
    const badge = ['.bptm-featured'];
    const badgeIcon = ['.bptm-featured i'];
    const fc = color(atts.featuredColor);
    if (fc) {
      add('', badge, 'color:' + fc);
      add('', badgeIcon, 'color:' + fc);
    }
    const fb = color(atts.featuredBg);
    if (fb) {
      add('', badge, 'background:' + fb);
    }
    const fbw = length(atts.featuredBorderWidth);
    const fbc = color(atts.featuredBorderColor);
    if (fbw || fbc) {
      add('', badge, 'border-style:solid');
      add('', badge, 'border-width:' + (fbw || '1px'));
    }
    if (fbc) {
      add('', badge, 'border-color:' + fbc);
    }
    const fs = length(atts.featuredSize);
    if (fs) {
      add('', badge, 'width:' + fs);
      add('', badge, 'height:' + fs);
    }
    const fis = length(atts.featuredIconSize);
    if (fis) {
      add('', badge, 'font-size:' + fis);
      add('', badgeIcon, 'font-size:' + fis);
    }
    const fr = length(atts.featuredRadius);
    if (fr) {
      add('', badge, 'border-radius:' + fr);
    }
  }

  // Social icons (cards + popup / panel / drawer): scoped rules beat every theme's own social styles.
  {
    const link = ['.bptm-social .bptm-social-link'];
    const icon = ['.bptm-social .bptm-social-link i'];
    const hov = ['.bptm-social .bptm-social-link:hover', '.bptm-social .bptm-social-link:focus-visible'];
    const hovIcon = ['.bptm-social .bptm-social-link:hover i', '.bptm-social .bptm-social-link:focus-visible i'];
    const ic = color(atts.socialIconColor);
    if (ic) {
      add('', link, 'color:' + ic);
      add('', icon, 'color:' + ic);
    }
    const bg = color(atts.socialBg);
    if (bg) {
      add('', link, 'background:' + bg);
      setVar('--bptm-social-bg', bg);
    }
    const bc = color(atts.socialBorderColor);
    const bw = length(atts.socialBorderWidth);
    if (bw) {
      add('', link, 'border-width:' + bw);
      add('', link, 'border-style:solid');
    }
    if (bc) {
      add('', link, 'border-color:' + bc);
      if (!bw) {
        add('', link, 'border-style:solid');
      }
    }
    const hc = color(atts.socialIconHoverColor);
    if (hc) {
      add('', hov, 'color:' + hc);
      add('', hovIcon, 'color:' + hc);
    }
    const hb = color(atts.socialHoverBg);
    if (hb) {
      add('', hov, 'background:' + hb);
      setVar('--bptm-social-hover-bg', hb);
    }
    const hbc = color(atts.socialHoverBorderColor);
    if (hbc) {
      add('', hov, 'border-color:' + hbc);
    }
    const size = length(atts.socialSize);
    if (size) {
      setVar('--bptm-social-size', size);
      add('', link, 'width:' + size);
      add('', link, 'height:' + size);
      add('', link, 'min-width:' + size);
    }
    const is = length(atts.socialIconSize);
    if (is) {
      add('', link, 'font-size:' + is);
      add('', icon, 'font-size:' + is);
    }
    const rad = length(atts.socialRadius);
    if (rad) {
      add('', link, 'border-radius:' + rad);
    }
    const gap = length(atts.socialGap);
    if (gap) {
      add('', ['.bptm-social'], 'gap:' + gap);
    }
  }
  let c = color(atts.itemBg);
  if (c) {
    add('', ['tr.bptm-item > td'], 'background:' + c);
  }
  c = color(atts.itemBgHover);
  if (c) {
    add('', ['tr.bptm-item:hover > td'], 'background:' + c);
  }
  const card = ['.bptm-item > .bptm-ta-card', '.bptm-item > .bptm-tb-card'];
  const pad = obj(atts.itemPadding);
  if (Object.keys(pad).length) {
    const p = ['top', 'right', 'bottom', 'left'].map(side => {
      const v = undefined !== pad[side] ? length(pad[side]) : '';
      return '' === v ? '0' : v;
    });
    const anySet = Object.keys(pad).some(k => '' !== String(null === pad[k] || undefined === pad[k] || 'object' === typeof pad[k] ? '' : pad[k]));
    if ('0 0 0 0' !== p.join(' ') || anySet) {
      setVar('--bptm-item-padding', p.join(' '));
    }
  }
  [['popupCloseIconSize', '--bptm-close-icon-size'], ['popupCloseSize', '--bptm-close-size'], ['popupCloseRadius', '--bptm-close-radius']].forEach(([a, v]) => {
    const len = length(atts[a]);
    if (len) {
      setVar(v, len);
    }
  });
  // Pagination (numbers + load more): sizes and padding.
  [['pgBorderWidth', '--bptm-pg-border-width'], ['pgBorderRadius', '--bptm-pg-radius'], ['lmBorderWidth', '--bptm-lm-border-width'], ['lmBorderRadius', '--bptm-lm-radius']].forEach(([a, v]) => {
    const len = length(atts[a]);
    if (len) {
      setVar(v, len);
    }
  });
  const boxValue = box => {
    const b = obj(box);
    if (!Object.keys(b).length) {
      return '';
    }
    return ['top', 'right', 'bottom', 'left'].map(side => {
      const v = undefined !== b[side] ? length(b[side]) : '';
      return '' === v ? '0' : v;
    }).join(' ');
  };
  const pgPad = boxValue(atts.pgPadding);
  if (pgPad) {
    setVar('--bptm-pg-padding', pgPad);
    setVar('--bptm-pg-height', 'auto');
  }
  const lmPad = boxValue(atts.lmPadding);
  if (lmPad) {
    setVar('--bptm-lm-padding', lmPad);
  }
  if (color(atts.lmHoverBg) || color(atts.lmHoverColor)) {
    setVar('--bptm-lm-hover-filter', 'none');
  }
  const navIcon = length(atts.popupNavIconSize);
  if (navIcon) {
    add('', ['.bptm-modal-nav button i'], 'font-size:' + navIcon);
  }
  const navR = length(atts.popupNavRadius);
  if (navR) {
    setVar('--bptm-popup-nav-radius', navR);
  }
  const r = length(atts.itemBorderRadius);
  if (r) {
    setVar('--bptm-radius', r);
  }
  const sh = 'string' === typeof atts.itemShadow ? atts.itemShadow.trim() : '';
  if (sh) {
    const val = SHADOWS[sh] || (/^[#a-z0-9(),.%\s-]+$/i.test(sh) ? sh : '');
    if (val) {
      setVar('--bptm-shadow', val);
    }
  }
  const bw = length(atts.itemBorderWidth);
  const bc = color(atts.itemBorderColor);
  if (bw || bc) {
    if (r) {
      add('', card, 'border-radius:' + r);
    }
    add('', card, 'border:' + (bw || '1px') + ' solid ' + (bc || 'currentColor'));
  }
  const ir = length(atts.imageBorderRadius);
  if (ir) {
    setVar('--bptm-img-radius', ir);
    add('', ['.bptm-img', '.bptm-img-wrap'], 'border-radius:' + ir);
  }
  if (atts.alignment && ['left', 'center', 'right', 'start', 'end'].includes(atts.alignment)) {
    setVar('--bptm-align', atts.alignment);
  }
  const mh = length(atts.maxScrollHeight);
  if (mh) {
    setVar('--bptm-desc-max-h', mh);
  }
  Object.keys(TYPO).forEach(a => {
    const t = obj(atts[a]);
    if (!Object.keys(t).length) {
      return;
    }
    const [prefix, els, hover] = TYPO[a];
    const decl = [];
    const fam = fontFamily(tget(t, 'fontFamily', 'font_family'));
    if (fam) {
      decl.push(['font-family', fam]);
    }
    const w = tget(t, 'fontWeight', 'weight');
    if (null !== w && /^(\d{3}|normal|bold|lighter|bolder)$/.test(String(w))) {
      decl.push(['font-weight', String(w)]);
    }
    const st = tget(t, 'fontStyle', 'style');
    if (null !== st && ['normal', 'italic', 'oblique'].includes(st)) {
      decl.push(['font-style', st]);
    }
    const tt = tget(t, 'textTransform', 'transform');
    if (null !== tt && ['none', 'uppercase', 'lowercase', 'capitalize'].includes(tt)) {
      decl.push(['text-transform', tt]);
    }
    const td = tget(t, 'textDecoration', 'decoration');
    if (null !== td && ['none', 'underline', 'overline', 'line-through'].includes(td)) {
      decl.push(['text-decoration', td]);
    }
    const lh = tget(t, 'lineHeight', 'line_height');
    if (null !== lh && 'object' !== typeof lh) {
      const lhv = isNum(lh) ? String(Number(lh)) : length(lh);
      if (lhv) {
        decl.push(['line-height', lhv]);
      }
    }
    const ls = tget(t, 'letterSpacing', 'letter_spacing');
    if (null !== ls && 'object' !== typeof ls) {
      const lsv = length(ls);
      if (lsv) {
        decl.push(['letter-spacing', lsv]);
      }
    }
    const col = color(tget(t, 'color', 'color'));
    if (col) {
      decl.push(['color', col]);
    }
    const size = tget(t, 'fontSize', 'size');
    const resp = {};
    if (size && 'object' === typeof size && !Array.isArray(size)) {
      ['desktop', 'tablet', 'mobilePortrait', 'mobile'].forEach(d => {
        const alias = 'mobilePortrait' === d && undefined !== size.mobile_landscape ? size.mobile_landscape : null;
        let v = undefined !== size[d] ? size[d] : alias;
        v = null === v ? '' : length(v);
        if (v) {
          resp[d] = v;
        }
      });
      if (resp.desktop) {
        decl.push(['font-size', resp.desktop]);
      }
    } else if (null !== size) {
      const v = length(size);
      if (v) {
        decl.push(['font-size', v]);
      }
    }
    decl.forEach(([prop, val]) => {
      setVar(prefix + '-' + prop, val);
      add('', els, prop + ':' + val);
    });
    Object.keys(resp).forEach(d => {
      if ('desktop' !== d) {
        add(MEDIA[d], els, 'font-size:' + resp[d]);
      }
    });
    const hc = color(tget(t, 'hoverColor', 'hover_color'));
    if (hc) {
      add('', hover, 'color:' + hc);
    }
  });
  let css = '';
  if (vars.length) {
    css += scopes.join(',') + '{' + vars.map(([k, v]) => k + ':' + v).join(';') + '}';
  }
  ['', ...Object.values(MEDIA)].forEach(media => {
    if (!rules[media].size) {
      return;
    }
    let block = '';
    rules[media].forEach((decls, sel) => {
      block += sel + '{' + [...new Set(decls)].join(';') + '}';
    });
    css += '' === media ? block : media + '{' + block + '}';
  });
  return css.replace(/<\//g, '').replace(/</g, '');
};

/***/ }),

/***/ "./src/Components/Common/Team/details.js":
/*!***********************************************!*\
  !*** ./src/Components/Common/Team/details.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DetailPayload: () => (/* binding */ DetailPayload),
/* harmony export */   detailStyle: () => (/* binding */ detailStyle)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./context */ "./src/Components/Common/Team/context.js");
/* harmony import */ var _themes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./themes */ "./src/Components/Common/Team/themes.js");
/* harmony import */ var _registry__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./registry */ "./src/Components/Common/Team/registry.js");
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./bridge */ "./src/Components/Common/Team/bridge.js");
/* harmony import */ var _sanitize__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./sanitize */ "./src/Components/Common/Team/sanitize.js");
/**
 * Detail views for popup / panel / drawer (ports of templates/{popups,panels,drawers}/*.php)
 * and the detail payload wrapper (former Context::modal_payload()).
 */







const div = (className, ...children) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
  className
}, ...children);
const detailSocial = (ctx, m, label = true) => {
  const social = (0,_themes__WEBPACK_IMPORTED_MODULE_3__.tbPart)(ctx, m, 'social');
  if (!social) {
    return null;
  }
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: ctx.vis_classes('social', 'bptm-dv-social')
  }, label ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('h4', {
    className: 'bptm-dv-heading'
  }, (0,_bridge__WEBPACK_IMPORTED_MODULE_5__.t)('follow_me_on')) : null, social);
};
const ALL = ['img', 'flip', 'badges', 'name', 'role', 'desc', 'social', 'social_plain', 'meta', 'skills'];

/** Parts of a detail view (bptm_tb_detail_parts()). */
const parts = (ctx, m, use) => {
  use = use ? ALL.filter(k => use.includes(k)) : ALL;
  const out = {};
  [...ALL, 'tail'].forEach(k => {
    out[k] = null;
  });
  use.forEach(k => {
    switch (k) {
      case 'img':
        {
          const img = (0,_themes__WEBPACK_IMPORTED_MODULE_3__.tbImage)(ctx, m, false);
          out.img = img ? div('bptm-img-wrap bptm-dv-img', img) : null;
          break;
        }
      case 'flip':
        out.flip = ctx.show('thumbnail') ? ctx.flipImage(m) : null;
        break;
      case 'badges':
        out.badges = (0,_themes__WEBPACK_IMPORTED_MODULE_3__.tbBadges)(ctx, m);
        break;
      case 'name':
        out.name = (0,_themes__WEBPACK_IMPORTED_MODULE_3__.tbPlainName)(ctx, m, 'h2', 'bptm-dv-name');
        break;
      case 'role':
        out.role = (0,_themes__WEBPACK_IMPORTED_MODULE_3__.tbPlainDesignation)(ctx, m, 'bptm-dv-role');
        break;
      case 'desc':
        {
          const d = (0,_themes__WEBPACK_IMPORTED_MODULE_3__.tbPart)(ctx, m, 'details');
          out.desc = d ? div('bptm-dv-desc', d) : null;
          break;
        }
      case 'social':
        out.social = detailSocial(ctx, m);
        break;
      case 'social_plain':
        out.social_plain = detailSocial(ctx, m, false);
        break;
      case 'meta':
        {
          const meta = ctx.metaDetails(m, 'list');
          out.meta = meta ? div('bptm-dv-meta', meta) : null;
          break;
        }
      case 'skills':
        {
          const sk = (0,_themes__WEBPACK_IMPORTED_MODULE_3__.tbPart)(ctx, m, 'skills');
          out.skills = sk ? div('bptm-dv-skills', sk) : null;
          break;
        }
    }
  });
  out.badges_block = out.badges ? div('bptm-dv-badges', out.badges) : null;
  if (out.badges_block && !out.img && use.includes('name')) {
    out.name = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(out.badges_block, out.name);
  }
  const tail = (0,_themes__WEBPACK_IMPORTED_MODULE_3__.tbPart)(ctx, m, 'vcard');
  out.tail = tail ? div('bptm-dv-tail', tail) : null;
  return out;
};
const rootClass = (ctx, kind, style, extra = []) => {
  const c = ['bptm-dv', 'bptm-dv-' + kind, 'bptm-dv-' + kind + '--' + style, ...extra];
  if (!ctx.show('thumbnail')) {
    c.push('bptm-dv--no-img');
  }
  return c.map(_sanitize__WEBPACK_IMPORTED_MODULE_6__.htmlClass).join(' ');
};
const mediaDiv = d => d.img ? div('bptm-dv-media', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.img, d.badges)) : null;

/** Templates: kind => style => ( ctx, m ) => element. */
const T = {
  popup: {
    default: (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'social_plain', 'desc', 'meta', 'skills']);
      const cols = 'one' === ctx.attr('popupColumns', 'two') ? 'one' : 'two';
      if ('one' === cols) {
        return div(rootClass(ctx, 'popup', 'default', ['bptm-dv--cols-one']), mediaDiv(d), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.social_plain, d.desc, d.meta, d.skills, d.tail)));
      }
      return div(rootClass(ctx, 'popup', 'default', ['bptm-dv--cols-two']), div('bptm-dv-side', mediaDiv(d), d.meta), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.social_plain, d.desc, d.skills, d.tail)));
    },
    'style-one': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'desc', 'social', 'meta', 'skills']);
      return div(rootClass(ctx, 'popup', 'style-one'), div('bptm-dv-side', mediaDiv(d)), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.desc, d.social, d.meta, d.skills, d.tail)));
    },
    'style-two': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'desc', 'meta', 'social', 'skills']);
      return div(rootClass(ctx, 'popup', 'style-two'), div('bptm-dv-side', mediaDiv(d)), div('bptm-dv-body bptm-dv-body--scroll', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.desc, d.meta, d.social, d.skills, d.tail)));
    },
    'style-three': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'desc', 'meta', 'skills', 'social']);
      return div(rootClass(ctx, 'popup', 'style-three'), div('bptm-dv-side', mediaDiv(d), (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.desc)), div('bptm-dv-body', d.meta ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('h4', {
        className: 'bptm-dv-heading'
      }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Contact Info', 'bp-team-member')) : null, d.meta, (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.skills, d.social, d.tail)));
    },
    'style-four': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'desc', 'social', 'meta', 'skills']);
      return div(rootClass(ctx, 'popup', 'style-four'), div('bptm-dv-side', mediaDiv(d)), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.desc, d.social, d.meta, d.skills, d.tail)));
    },
    'style-five': (ctx, m) => split(ctx, m, 'popup', 'style-five'),
    'style-six': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'social_plain', 'desc', 'meta', 'skills', 'flip']);
      const cols = 'one' === ctx.attr('popupColumns', 'two') ? 'one' : 'two';
      if ('one' === cols) {
        return div(rootClass(ctx, 'popup', 'style-six', ['bptm-dv--cols-one']), mediaDiv(d), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.social_plain, d.desc, d.meta, d.skills, d.tail)));
      }
      return div(rootClass(ctx, 'popup', 'style-six', ['bptm-dv--cols-two']), div('bptm-dv-side', mediaDiv(d)), div('bptm-dv-body', div('bptm-dv-head', div('bptm-dv-head-text', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role)), d.flip ? div('bptm-dv-avatar', d.flip) : null), (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.desc, d.social_plain, d.meta, d.skills, d.tail)));
    }
  },
  panel: {
    default: (ctx, m) => {
      const d = parts(ctx, m, ['social_plain', 'name', 'role', 'img', 'badges', 'desc', 'meta', 'skills']);
      return div(rootClass(ctx, 'panel', 'default'), d.social_plain ? div('bptm-panel-strip', d.social_plain) : null, div('bptm-panel-main', d.name ? div('bptm-panel-titlebar', d.name) : null, d.role ? div('bptm-panel-rolebar', d.role) : null, mediaDiv(d), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.desc, d.meta, d.skills, d.tail))));
    },
    'style-one': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'desc', 'social', 'meta', 'skills']);
      return div(rootClass(ctx, 'panel', 'style-one'), mediaDiv(d), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.desc, d.social, d.meta, d.skills, d.tail)));
    },
    'style-two': (ctx, m) => {
      const d = parts(ctx, m, ['name', 'role', 'img', 'badges', 'desc', 'meta', 'social', 'skills']);
      return div(rootClass(ctx, 'panel', 'style-two'), d.name || d.role ? div('bptm-panel-band', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role)) : null, mediaDiv(d), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.desc, d.meta, d.social, d.skills, d.tail)));
    },
    'style-three': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'desc', 'meta', 'social', 'skills']);
      return div(rootClass(ctx, 'panel', 'style-three'), mediaDiv(d), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.desc, d.meta, d.social, d.skills, d.tail)));
    },
    'style-four': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'desc', 'meta', 'social', 'skills']);
      return div(rootClass(ctx, 'panel', 'style-four'), mediaDiv(d), d.name || d.role ? div('bptm-panel-band', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role)) : null, div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.desc, d.meta, d.social, d.skills, d.tail)));
    },
    'style-five': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'social_plain', 'desc', 'meta', 'skills']);
      return div(rootClass(ctx, 'panel', 'style-five'), mediaDiv(d), div('bptm-dv-body', div('bptm-dv-head', div('bptm-dv-head-text', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role)), d.social_plain), (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.desc, d.meta, d.skills, d.tail)));
    }
  },
  drawer: {
    default: (ctx, m) => ident(ctx, m, 'default', ['img', 'badges', 'name', 'role', 'desc', 'meta', 'social_plain', 'skills'], d => (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.meta, d.social_plain, d.skills, d.tail)),
    'style-one': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'desc', 'social', 'meta', 'skills']);
      return div(rootClass(ctx, 'drawer', 'style-one'), div('bptm-dv-side', mediaDiv(d)), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.desc, d.social, d.meta, d.skills, d.tail)));
    },
    'style-two': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'desc', 'meta', 'social', 'skills']);
      return div(rootClass(ctx, 'drawer', 'style-two'), div('bptm-dv-side', mediaDiv(d)), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.desc, d.meta, d.social, d.skills, d.tail)));
    },
    'style-three': (ctx, m) => ident(ctx, m, 'style-three', ['img', 'badges', 'meta', 'social', 'skills', 'name', 'role', 'desc'], d => (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.meta, d.social, d.skills, d.tail)),
    'style-four': (ctx, m) => {
      const d = parts(ctx, m, ['img', 'badges', 'name', 'role', 'desc', 'social', 'meta', 'skills']);
      return div(rootClass(ctx, 'drawer', 'style-four'), div('bptm-dv-side', mediaDiv(d)), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.desc, d.social, d.meta, d.skills, d.tail)));
    },
    'style-five': (ctx, m) => split(ctx, m, 'drawer', 'style-five')
  }
};

/** Popup / drawer style-five: media side + top text + two split columns. */
function split(ctx, m, kind, style) {
  const d = parts(ctx, m, ['meta', 'social', 'skills', 'img', 'badges', 'name', 'role', 'desc']);
  const left = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.meta, d.social);
  const right = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.skills, d.tail);
  return div(rootClass(ctx, kind, style), div('bptm-dv-side', mediaDiv(d)), div('bptm-dv-body', div('bptm-dv-top', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role, d.desc)), left || right ? div('bptm-dv-split', left ? div('bptm-dv-split-col', left) : null, right ? div('bptm-dv-split-col', right) : null) : null));
}

/** Drawer default / style-three: small avatar beside the name, aside column. */
function ident(ctx, m, style, use, right) {
  const d = parts(ctx, m, use);
  const r = right(d);
  const id = d.img ? div('bptm-dv-ident', d.img, div('bptm-dv-ident-text', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.badges_block, d.name, d.role))) : (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(d.name, d.role);
  return div(rootClass(ctx, 'drawer', style), div('bptm-dv-body', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(id, d.desc)), r ? div('bptm-dv-aside', r) : null);
}

/**
 * Style used for a detail type.
 *
 * @param {Object} atts Attributes.
 * @param {string} type popup|panel|drawer.
 * @return {string} Style.
 */
const detailStyle = (atts, type) => {
  const key = {
    popup: 'popupStyle',
    panel: 'panelStyle',
    drawer: 'drawerStyle'
  }[type];
  const s = String(atts[key] || 'default');
  return _registry__WEBPACK_IMPORTED_MODULE_4__.DETAIL_STYLES[type].includes(s) ? s : 'default';
};

/**
 * Detail payload of one member (open in a popup / panel / drawer).
 *
 * @param {Object} props { ctx (initial group), m, type }.
 * @return {Element|null} Element.
 */
const DetailPayload = ({
  ctx,
  m,
  type
}) => {
  if (!['popup', 'panel', 'drawer'].includes(type)) {
    return null;
  }
  const style = detailStyle(ctx.atts, type);
  const dctx = ctx.withGroup(type);
  const inner = (T[type][style] || T[type].default)(dctx, m);
  let classes = 'bptm-detail bptm-detail--' + type + ' bptm-' + type + '-' + style;
  if ('popup' === type) {
    classes += ' bptm-popup-cols-' + ('one' === ctx.attr('popupColumns') ? 'one' : 'two');
  }
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    id: ctx.detailId(m),
    className: classes,
    'data-bptm-detail': m.id,
    'data-bptm-type': type,
    'data-bptm-style': style,
    itemScope: true,
    itemType: 'https://schema.org/Person'
  }, inner);
};

/***/ }),

/***/ "./src/Components/Common/Team/effects.js":
/*!***********************************************!*\
  !*** ./src/Components/Common/Team/effects.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   equalize: () => (/* binding */ equalize),
/* harmony export */   scrollables: () => (/* binding */ scrollables),
/* harmony export */   useFontLink: () => (/* binding */ useFontLink),
/* harmony export */   useLayoutHelpers: () => (/* binding */ useLayoutHelpers),
/* harmony export */   useScrollAnimation: () => (/* binding */ useScrollAnimation),
/* harmony export */   useTapReveal: () => (/* binding */ useTapReveal)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Item effects: scroll-in animation, tap-to-reveal / flip on touch devices, equal description heights,
 * scrollable descriptions, Google font links. All use the root element's own window / document.
 */

const winOf = el => el && el.ownerDocument && el.ownerDocument.defaultView || window;

/**
 * Scroll animation: `.bptm-anim` items get `.bptm-in` once they enter the viewport. Ids that already
 * animated are remembered (so re-renders keep them visible and never replay the animation).
 *
 * @param {Object} rootRef Root ref.
 * @param {Set}    seen    Ids that are in (mutable, owned by the component).
 */
const useScrollAnimation = (rootRef, seen) => {
  const io = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const items = Array.from(root.querySelectorAll('.bptm-anim:not(.bptm-in)'));
    if (!items.length) {
      return;
    }
    const win = winOf(root);
    const reduced = 'function' === typeof win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || 'function' !== typeof win.IntersectionObserver) {
      items.forEach(el => {
        el.classList.add('bptm-in');
        seen.add(el.getAttribute('data-bptm-id'));
      });
      return;
    }
    if (!io.current) {
      io.current = new win.IntersectionObserver(entries => {
        let n = 0;
        entries.forEach(en => {
          if (en.isIntersecting) {
            const el = en.target;
            el.style.setProperty('--bptm-anim-delay', Math.min(n, 8) * 70 + 'ms');
            n++;
            el.classList.add('bptm-in');
            seen.add(el.getAttribute('data-bptm-id'));
            io.current.unobserve(el);
          }
        });
      }, {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05
      });
    }
    items.forEach(el => io.current.observe(el));
  });
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => () => {
    if (io.current) {
      io.current.disconnect();
      io.current = null;
    }
  }, []);
};

/**
 * Touch devices have no hover: the first tap on a flip / tap-reveal card reveals it, links stay usable once revealed.
 *
 * @param {Object} rootRef Root ref.
 */
const useTapReveal = rootRef => {
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }
    const win = winOf(root);
    const coarse = () => 'function' === typeof win.matchMedia && win.matchMedia('(hover: none)').matches;
    const onClick = e => {
      const flipGroup = root.classList.contains('bptm-group-flip');
      const item = e.target.closest('.bptm-item');
      if (!item || !root.contains(item) || !coarse()) {
        return;
      }
      if (!flipGroup && !item.classList.contains('bptm-tap-reveal')) {
        return;
      }
      if (!item.classList.contains('is-flipped')) {
        e.preventDefault();
        e.stopPropagation();
        root.querySelectorAll('.bptm-item.is-flipped').forEach(el => el.classList.remove('is-flipped'));
        item.classList.add('is-flipped');
      } else if (!e.target.closest('a, button')) {
        item.classList.remove('is-flipped');
      }
    };
    const onKey = e => {
      const item = e.target.closest && e.target.closest('.bptm-item');
      if (root.classList.contains('bptm-group-flip') && item && ('Enter' === e.key || ' ' === e.key) && e.target === item) {
        e.preventDefault();
        item.classList.toggle('is-flipped');
      }
    };
    root.addEventListener('click', onClick, true);
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('click', onClick, true);
      root.removeEventListener('keydown', onKey);
    };
  }, [rootRef]);
};

/** Equalise description heights across visible items (per grid row; every slide in a carousel). */
const equalize = root => {
  if (!root || !root.classList.contains('bptm-equal-details')) {
    if (root) {
      root.querySelectorAll('.bptm-items > .bptm-item .bptm-details').forEach(el => {
        if (el.style.minHeight) {
          el.style.minHeight = '';
        }
      });
    }
    return;
  }
  const carousel = root.classList.contains('bptm-view-carousel');
  const rows = new Map();
  root.querySelectorAll('.bptm-items > .bptm-item').forEach(it => {
    const el = it.hidden ? null : it.querySelector('.bptm-details');
    if (!el) {
      return;
    }
    el.style.minHeight = '';
    const k = carousel ? 0 : it.offsetTop;
    if (!rows.has(k)) {
      rows.set(k, []);
    }
    rows.get(k).push(el);
  });
  rows.forEach(row => {
    const max = Math.max(...row.map(el => el.offsetHeight));
    if (max > 0 && row.length > 1) {
      row.forEach(el => {
        el.style.minHeight = max + 'px';
      });
    }
  });
};

/** Scroll-controlled descriptions that overflow get keyboard access and a shadow hint. */
const scrollables = scope => {
  // Cards only (as before): not carousel clones, not popup / panel / drawer details.
  scope.querySelectorAll('.bptm-item:not(.bptm-clone) .bptm-details.bptm-scroll').forEach(el => {
    if (el.closest('.bptm-drawer, .bptm-modal, .bptm-clone')) {
      return;
    }
    const over = el.scrollHeight > el.clientHeight + 2;
    el.classList.toggle('is-scrollable', over);
    if (over) {
      el.setAttribute('tabindex', '0');
      if (!el.bptmScrollBound) {
        el.bptmScrollBound = true;
        el.addEventListener('scroll', () => el.classList.toggle('is-end', el.scrollTop + el.clientHeight >= el.scrollHeight - 2), {
          passive: true
        });
      }
    } else {
      el.removeAttribute('tabindex');
    }
  });
};

/**
 * Layout helpers after every commit + on resize / load / font load.
 *
 * @param {Object}   rootRef Root ref.
 * @param {Function} extra   Extra callback on resize (drawer relayout).
 */
const useLayoutHelpers = (rootRef, extra) => {
  const extraRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(extra);
  extraRef.current = extra;
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    const root = rootRef.current;
    if (root) {
      scrollables(root);
      equalize(root);
    }
  });
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }
    const win = winOf(root);
    let tm = 0;
    const run = () => {
      win.clearTimeout(tm);
      tm = win.setTimeout(() => {
        if (!root.isConnected) {
          return;
        }
        equalize(root);
        scrollables(root);
        if (extraRef.current) {
          extraRef.current();
        }
      }, 150);
    };
    win.addEventListener('resize', run);
    const onLoad = () => equalize(root);
    if ('complete' !== root.ownerDocument.readyState) {
      win.addEventListener('load', onLoad, {
        once: true
      });
    }
    // Lazy images / fonts change heights after the first paint.
    const onImg = e => {
      if (e.target && 'IMG' === e.target.tagName) {
        run();
      }
    };
    root.addEventListener('load', onImg, true);
    if (root.ownerDocument.fonts && root.ownerDocument.fonts.ready) {
      root.ownerDocument.fonts.ready.then(() => root.isConnected && equalize(root));
    }
    return () => {
      win.clearTimeout(tm);
      win.removeEventListener('resize', run);
      win.removeEventListener('load', onLoad);
      root.removeEventListener('load', onImg, true);
    };
  }, [rootRef]);
};

/**
 * Google Fonts stylesheet link in the root's document <head> (deduplicated by URL across blocks).
 *
 * @param {Object} rootRef Root ref.
 * @param {string} url     Stylesheet URL ('' = none).
 */
const useFontLink = (rootRef, url) => {
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const root = rootRef.current;
    if (!root || !url) {
      return;
    }
    const doc = root.ownerDocument;
    let hsh = 0;
    for (let i = 0; i < url.length; i++) {
      hsh = Math.imul(31, hsh) + url.charCodeAt(i) | 0;
    }
    const id = 'bptm-gf-' + (hsh >>> 0).toString(16) + '-css';
    if (doc.getElementById(id)) {
      return;
    }
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.id = id;
    link.href = url;
    link.media = 'all';
    (doc.head || doc.documentElement).appendChild(link);
  }, [rootRef, url]);
};

/***/ }),

/***/ "./src/Components/Common/Team/modal.js":
/*!*********************************************!*\
  !*** ./src/Components/Common/Team/modal.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ModalShell: () => (/* binding */ ModalShell),
/* harmony export */   createPortal: () => (/* reexport safe */ _wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createPortal),
/* harmony export */   focusables: () => (/* binding */ focusables),
/* harmony export */   lockScroll: () => (/* binding */ lockScroll),
/* harmony export */   unlockScroll: () => (/* binding */ unlockScroll),
/* harmony export */   useModal: () => (/* binding */ useModal),
/* harmony export */   usePortal: () => (/* binding */ usePortal)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bridge */ "./src/Components/Common/Team/bridge.js");
/**
 * Popup / panel (dialog shells portalled to <body>) and the inline drawer shell.
 * ESC + overlay close, focus trap, focus restore, body scroll lock, prev / next across openable
 * members, arrow keys. Uses the root element's own document / window (editor canvas iframe safe).
 */



const CLOSE_SVG = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('svg', {
  viewBox: '0 0 24 24',
  width: '20',
  height: '20',
  'aria-hidden': 'true',
  focusable: 'false'
}, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('path', {
  d: 'M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 1 0-1.4 1.4l4.9 4.9-4.9 4.9a1 1 0 1 0 1.4 1.4l4.9-4.9 4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4z',
  fill: 'currentColor'
}));
const FOCUSABLE = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
const focusables = ctx => Array.from(ctx.querySelectorAll(FOCUSABLE)).filter(el => !el.closest('[hidden], [inert]') && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));

/* Body scroll lock, reference counted per document. */
const locks = new WeakMap();
const lockScroll = doc => {
  const n = (locks.get(doc) || 0) + 1;
  locks.set(doc, n);
  if (n > 1) {
    return;
  }
  const html = doc.documentElement;
  const win = doc.defaultView || window;
  html.style.setProperty('--bptm-scrollbar', win.innerWidth - html.clientWidth + 'px');
  html.classList.add('bptm-scroll-lock');
};
const unlockScroll = doc => {
  const n = Math.max(0, (locks.get(doc) || 0) - 1);
  locks.set(doc, n);
  if (0 === n) {
    doc.documentElement.classList.remove('bptm-scroll-lock');
    doc.documentElement.style.removeProperty('--bptm-scrollbar');
  }
};

/**
 * Portal container (`.bptm-wrap.bptm-portal` at the end of <body>) keeping the root's theme classes.
 *
 * @param {Object}  rootRef  Root element ref.
 * @param {boolean} enabled  Popup / panel in use.
 * @param {string}  classes  Root classes.
 * @param {string}  uid      Instance uid.
 * @param {boolean} isEditor Editor canvas (links never navigate).
 * @return {Element|null} Container.
 */
const usePortal = (rootRef, enabled, classes, uid, isEditor) => {
  const [el, setEl] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    const root = rootRef.current;
    if (!enabled || !root) {
      return undefined;
    }
    const doc = root.ownerDocument;
    const portal = doc.createElement('div');
    portal.setAttribute('data-bptm-portal', uid);
    const win = doc.defaultView || window;
    if ('rtl' === win.getComputedStyle(root).direction) {
      portal.setAttribute('dir', 'rtl');
    }
    const stop = e => {
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (a) {
        e.preventDefault();
      }
    };
    if (isEditor) {
      portal.addEventListener('click', stop);
    }
    (doc.body || doc.documentElement).appendChild(portal);
    setEl(portal);
    return () => {
      portal.removeEventListener('click', stop);
      portal.remove();
      setEl(null);
    };
  }, [enabled, uid]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    if (el) {
      const keep = String(classes).split(/\s+/).filter(c => /^bptm-(wrap|theme-|group-|layout-|link-|align-|imgfx-|imghfx-)/.test(c) || 'wp-block-tsb-team-members' === c);
      el.className = keep.concat(['bptm-portal']).join(' ');
    }
  });
  return el;
};

/**
 * Modal controller state + behaviour.
 *
 * @param {Object} opts { type, rootRef, openable: () => string[], onRequestDrawerPlace }.
 * @return {Object} API.
 */
const useModal = ({
  type,
  rootRef
}) => {
  const [state, setState] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    id: null,
    visible: false,
    isOpen: false
  });
  const shellRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const lastFocus = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const closeTimer = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  // Set while closing so the focus trap lets focus go back to the trigger.
  const closing = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
  const stateRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(state);
  stateRef.current = state;
  const doc = () => rootRef.current ? rootRef.current.ownerDocument : document;
  const win = () => doc().defaultView || window;
  const open = (id, trigger) => {
    if (trigger) {
      lastFocus.current = trigger;
    }
    closing.current = false;
    if (closeTimer.current) {
      win().clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    const wasOpen = stateRef.current.visible && stateRef.current.isOpen;
    setState({
      id,
      visible: true,
      isOpen: wasOpen
    });
  };
  const close = () => {
    const s = stateRef.current;
    if (!s.visible || null === s.id) {
      return;
    }
    const shell = shellRef.current;
    const dur = shell ? parseFloat(win().getComputedStyle(shell).getPropertyValue('--bptm-modal-speed')) || 0 : 0;
    const reduced = 'function' === typeof win().matchMedia && win().matchMedia('(prefers-reduced-motion: reduce)').matches;
    const back = lastFocus.current && lastFocus.current.isConnected ? lastFocus.current : null;
    const closedId = s.id;
    closing.current = true;
    if (dur > 0 && !reduced) {
      setState({
        id: closedId,
        visible: true,
        isOpen: false,
        closing: true
      });
      closeTimer.current = win().setTimeout(() => {
        closeTimer.current = null;
        setState({
          id: null,
          visible: false,
          isOpen: false
        });
      }, dur);
    } else {
      setState({
        id: null,
        visible: false,
        isOpen: false
      });
    }
    const root = rootRef.current;
    const fallback = root ? root.querySelector('.bptm-item[data-bptm-id="' + String(closedId).replace(/["\\]/g, '') + '"] [data-bptm-open]') : null;
    const target = back || fallback;
    if (target) {
      target.focus({
        preventScroll: true
      });
    }
    lastFocus.current = null;
  };

  // Enter transition: add `is-open` two frames after the shell became visible.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (state.visible && !state.isOpen && !state.closing && null !== state.id) {
      const w = win();
      let r2 = 0;
      const r1 = w.requestAnimationFrame(() => {
        r2 = w.requestAnimationFrame(() => setState(s => s.visible && !s.closing ? {
          ...s,
          isOpen: true
        } : s));
      });
      return () => {
        w.cancelAnimationFrame(r1);
        w.cancelAnimationFrame(r2);
      };
    }
    return undefined;
  }, [state.visible, state.isOpen, state.closing, state.id]);

  // Scroll lock + host class for dialogs; document-level ESC / focus containment.
  const active = state.visible && !state.closing;
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!active || !rootRef.current) {
      return undefined;
    }
    const d = doc();
    const root = rootRef.current;
    if ('drawer' !== type) {
      lockScroll(d);
      root.classList.add('bptm-modal-open-host');
      const onFocus = e => {
        const shell = shellRef.current;
        if (shell && !closing.current && !shell.contains(e.target)) {
          const c = shell.querySelector('.bptm-modal-content');
          if (c) {
            c.focus();
          }
        }
      };
      const onKey = e => {
        if ('Escape' === e.key) {
          close();
        }
      };
      d.addEventListener('focusin', onFocus);
      d.addEventListener('keydown', onKey);
      return () => {
        d.removeEventListener('focusin', onFocus);
        d.removeEventListener('keydown', onKey);
        root.classList.remove('bptm-modal-open-host');
        unlockScroll(d);
      };
    }
    const onDrawerKey = e => {
      if ('Escape' !== e.key || e.defaultPrevented) {
        return;
      }
      if (d.querySelector('.bptm-modal.is-open:not([hidden])')) {
        return;
      }
      close();
    };
    d.addEventListener('keydown', onDrawerKey);
    return () => d.removeEventListener('keydown', onDrawerKey);
  }, [active, type]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => () => {
    if (closeTimer.current) {
      win().clearTimeout(closeTimer.current);
    }
  }, []);
  return {
    state,
    open,
    close,
    shellRef
  };
};

/**
 * Popup / panel dialog shell or drawer shell.
 *
 * @param {Object} props Props.
 * @return {Element} Shell.
 */
const ModalShell = ({
  type,
  uid,
  panelPosition,
  drawerStyle,
  modal,
  content,
  navHidden,
  onStep,
  detailStyle
}) => {
  const {
    state,
    close,
    shellRef
  } = modal;
  const contentRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const shown = state.visible;

  // Focus the content when a member opens / changes; reset scroll.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!shown || null === state.id || state.closing) {
      return;
    }
    const c = contentRef.current;
    if (!c) {
      return;
    }
    c.scrollTop = 0;
    const dialog = shellRef.current && shellRef.current.querySelector('.bptm-modal-dialog');
    if (dialog) {
      dialog.scrollTop = 0;
    }
    c.focus({
      preventScroll: 'drawer' === type
    });
    if ('drawer' === type && shellRef.current) {
      const w = shellRef.current.ownerDocument.defaultView || window;
      const r = shellRef.current.getBoundingClientRect();
      if (r.bottom > w.innerHeight || r.top < 0) {
        shellRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [state.id, shown]);
  const onClick = e => {
    if (e.target.closest('[data-bptm-close]')) {
      e.preventDefault();
      close();
    } else if (e.target.closest('[data-bptm-prev]')) {
      e.preventDefault();
      onStep(-1);
    } else if (e.target.closest('[data-bptm-next]')) {
      e.preventDefault();
      onStep(1);
    }
  };
  const onKeyDown = e => {
    if ('Escape' === e.key) {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }
    const shell = shellRef.current;
    if (!shell) {
      return;
    }
    const w = shell.ownerDocument.defaultView || window;
    if (('ArrowLeft' === e.key || 'ArrowRight' === e.key) && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) {
      const rtl = 'rtl' === w.getComputedStyle(shell).direction;
      const dir = 'ArrowRight' === e.key ? 1 : -1;
      onStep(rtl ? -dir : dir);
      return;
    }
    if ('Tab' === e.key && 'drawer' !== type) {
      const dialog = shell.querySelector('.bptm-modal-dialog') || shell;
      const f = focusables(dialog);
      if (!f.length) {
        e.preventDefault();
        return;
      }
      const first = f[0];
      const last = f[f.length - 1];
      const activeEl = shell.ownerDocument.activeElement;
      if (e.shiftKey && (activeEl === first || !dialog.contains(activeEl))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  const styleAttr = shown && null !== state.id ? {
    'data-bptm-style': detailStyle
  } : {};
  const contentEl = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-modal-content',
    tabIndex: -1,
    ref: contentRef
  }, content);
  if ('drawer' === type) {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-drawer bptm-drawer--' + String(drawerStyle || 'default').replace(/[^A-Za-z0-9_-]/g, '') + (state.isOpen ? ' is-open' : ''),
      'data-bptm-for': uid,
      role: 'region',
      'aria-label': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Member details', 'bp-team-member'),
      hidden: !shown,
      ref: shellRef,
      onClick,
      onKeyDown,
      ...styleAttr
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-drawer-arrow',
      'aria-hidden': 'true'
    }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-drawer-inner'
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
      type: 'button',
      className: 'bptm-modal-close',
      'data-bptm-close': '',
      'aria-label': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Close', 'bp-team-member')
    }, CLOSE_SVG), contentEl, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-modal-nav',
      hidden: navHidden
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
      type: 'button',
      className: 'bptm-modal-prev',
      'data-bptm-prev': '',
      'aria-label': (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)('prev')
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
      className: 'fas fa-angle-left',
      'aria-hidden': 'true'
    })), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
      type: 'button',
      className: 'bptm-modal-next',
      'data-bptm-next': '',
      'aria-label': (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)('next')
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
      className: 'fas fa-angle-right',
      'aria-hidden': 'true'
    })))));
  }
  let side = '';
  if ('panel' === type) {
    side = ' bptm-panel-' + (['left', 'right', 'center'].includes(panelPosition) ? panelPosition : 'right');
  }
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-modal bptm-modal--' + type + side + (state.isOpen ? ' is-open' : ''),
    'data-bptm-for': uid,
    hidden: !shown,
    ref: shellRef,
    onClick,
    onKeyDown,
    ...styleAttr
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-modal-overlay',
    'data-bptm-close': ''
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-modal-dialog',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Member details', 'bp-team-member')
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
    type: 'button',
    className: 'bptm-modal-close',
    'data-bptm-close': '',
    'aria-label': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Close', 'bp-team-member')
  }, CLOSE_SVG), contentEl, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-modal-nav',
    hidden: navHidden
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
    type: 'button',
    className: 'bptm-modal-prev',
    'data-bptm-prev': '',
    'aria-label': (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)('prev')
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
    className: 'fas fa-angle-left',
    'aria-hidden': 'true'
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', null, (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)('prev'))), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('button', {
    type: 'button',
    className: 'bptm-modal-next',
    'data-bptm-next': '',
    'aria-label': (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)('next')
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', null, (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.t)('next')), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
    className: 'fas fa-angle-right',
    'aria-hidden': 'true'
  })))));
};


/***/ }),

/***/ "./src/Components/Common/Team/model.js":
/*!*********************************************!*\
  !*** ./src/Components/Common/Team/model.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FILTER_TAX: () => (/* binding */ FILTER_TAX),
/* harmony export */   INCLUDE_MAP: () => (/* binding */ INCLUDE_MAP),
/* harmony export */   MAX_MEMBERS: () => (/* binding */ MAX_MEMBERS),
/* harmony export */   TERM_FIELDS: () => (/* binding */ TERM_FIELDS),
/* harmony export */   anyDevice: () => (/* binding */ anyDevice),
/* harmony export */   applyRuntimeFilters: () => (/* binding */ applyRuntimeFilters),
/* harmony export */   buildMembers: () => (/* binding */ buildMembers),
/* harmony export */   cleanMembers: () => (/* binding */ cleanMembers),
/* harmony export */   clientMatches: () => (/* binding */ clientMatches),
/* harmony export */   defaults: () => (/* binding */ defaults),
/* harmony export */   designations: () => (/* binding */ designations),
/* harmony export */   filterTerms: () => (/* binding */ filterTerms),
/* harmony export */   getThemeDef: () => (/* reexport safe */ _registry__WEBPACK_IMPORTED_MODULE_1__.getThemeDef),
/* harmony export */   hideClasses: () => (/* binding */ hideClasses),
/* harmony export */   isOn: () => (/* binding */ isOn),
/* harmony export */   memberFromItem: () => (/* binding */ memberFromItem),
/* harmony export */   normOrderBy: () => (/* binding */ normOrderBy),
/* harmony export */   orderMembers: () => (/* binding */ orderMembers),
/* harmony export */   paginationMode: () => (/* binding */ paginationMode),
/* harmony export */   placeholderUrl: () => (/* binding */ placeholderUrl),
/* harmony export */   queryPool: () => (/* binding */ queryPool),
/* harmony export */   resolveImage: () => (/* binding */ resolveImage),
/* harmony export */   resolveLinkType: () => (/* binding */ resolveLinkType),
/* harmony export */   resolveView: () => (/* binding */ resolveView),
/* harmony export */   resolveVisibility: () => (/* binding */ resolveVisibility),
/* harmony export */   sanitizeAttributes: () => (/* binding */ sanitizeAttributes),
/* harmony export */   searchText: () => (/* binding */ searchText),
/* harmony export */   socialHref: () => (/* binding */ socialHref),
/* harmony export */   socialLink: () => (/* binding */ socialLink),
/* harmony export */   splitTerms: () => (/* binding */ splitTerms),
/* harmony export */   termMatches: () => (/* binding */ termMatches),
/* harmony export */   termNames: () => (/* binding */ termNames),
/* harmony export */   termSlugs: () => (/* binding */ termSlugs),
/* harmony export */   termValues: () => (/* binding */ termValues),
/* harmony export */   visibilityDefaults: () => (/* binding */ visibilityDefaults)
/* harmony export */ });
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../block.json */ "./src/block.json");
/* harmony import */ var _registry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./registry */ "./src/Components/Common/Team/registry.js");
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bridge */ "./src/Components/Common/Team/bridge.js");
/* harmony import */ var _sanitize__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sanitize */ "./src/Components/Common/Team/sanitize.js");
/**
 * Pure data layer (ports of the former PHP Renderer::sanitize, bptm_member_from_item, Query, Filters,
 * Visibility and Context link logic). Everything here works on untrusted block attributes.
 */




const MAX_MEMBERS = 500;
const SCHEMA = _block_json__WEBPACK_IMPORTED_MODULE_0__.attributes || {};
const ENUMS = {
  filterType: ['normal-filter', 'ajax-filter'],
  linkType: ['default', 'popup', 'panel', 'drawer', 'custom', 'none', 'single_page'],
  linkTarget: ['_self', '_blank'],
  popupColumns: ['two', 'one'],
  panelPosition: ['right', 'left', 'center'],
  imageFilter: ['none', 'blur', 'brightness', 'contrast', 'grayscale', 'hue_rotate', 'invert', 'opacity', 'saturate', 'sepia'],
  hoverImageFilter: ['none', 'blur', 'brightness', 'contrast', 'grayscale', 'hue_rotate', 'invert', 'opacity', 'saturate', 'sepia'],
  orderBy: ['default', 'title', 'rand', 'name', 'date', 'ID', 'menu_order', 'modified'],
  order: ['ASC', 'DESC'],
  taxonomyOrderBy: ['name', 'default', 'slug', 'term_id', 'order', 'count', 'menu_order', 'term_order'],
  taxonomyOrder: ['ASC', 'DESC'],
  filterColumns: ['two', 'three'],
  filterCatPosition: ['center', 'left', 'right'],
  filterStyle: ['default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five'],
  paginationType: ['normal-pagination', 'load-more-button', 'load-more-scroll'],
  carouselNavsStyle: ['default', 'style-one', 'style-two', 'style-three'],
  carouselDotsStyle: ['default', 'style-one', 'style-two', 'style-three'],
  alignment: ['center', 'left', 'right']
};
const clone = v => v && 'object' === typeof v ? JSON.parse(JSON.stringify(v)) : v;
const isNumeric = v => 'number' === typeof v && isFinite(v) || 'string' === typeof v && '' !== v.trim() && isFinite(Number(v));
const toBool = v => {
  if ('boolean' === typeof v) {
    return v;
  }
  if ('string' === typeof v) {
    return !['false', '0', ''].includes(v.toLowerCase());
  }
  return !!v;
};

/** bptm_is_on(). */
const isOn = v => {
  if ('boolean' === typeof v) {
    return v;
  }
  if ('number' === typeof v) {
    return v > 0;
  }
  if ('string' === typeof v) {
    return isNumeric(v) ? Number(v) > 0 : ['on', 'yes', 'true', '1'].includes(v.trim().toLowerCase());
  }
  return !!v;
};
const cleanKey = k => String(k).replace(/[^A-Za-z0-9_-]/g, '');

/** Structural clean-up of nested values: scalar leaves, max depth (strings sanitized). */
const cleanDeep = (v, depth = 0) => {
  if (Array.isArray(v)) {
    return depth > 4 ? [] : v.map(x => cleanDeep(x, depth + 1));
  }
  if (v && 'object' === typeof v) {
    const out = {};
    if (depth > 4) {
      return out;
    }
    Object.keys(v).forEach(k => {
      const ck = cleanKey(k);
      if ('' !== ck) {
        out[ck] = cleanDeep(v[k], depth + 1);
      }
    });
    return out;
  }
  if ('boolean' === typeof v || 'number' === typeof v || null === v) {
    return v;
  }
  return _sanitize__WEBPACK_IMPORTED_MODULE_3__.text(v);
};

/** Members: list of plain objects, string leaves capped at 20000 chars, max 3 levels. */
const cleanRaw = (obj, depth) => {
  const out = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach(k => {
    const v = obj[k];
    const ck = Array.isArray(obj) ? k : cleanKey(k);
    if ('' === ck) {
      return;
    }
    if (v && 'object' === typeof v) {
      if (depth < 3) {
        out[ck] = cleanRaw(v, depth + 1);
      }
    } else if ('string' === typeof v) {
      out[ck] = v.length > 20000 ? v.slice(0, 20000) : v;
    } else if ('boolean' === typeof v || 'number' === typeof v || null === v) {
      out[ck] = v;
    }
  });
  return Array.isArray(obj) ? out.filter(x => undefined !== x) : out;
};
const cleanMembers = val => {
  if ('string' === typeof val) {
    try {
      val = JSON.parse(val);
    } catch (e) {
      val = [];
    }
  }
  if (!Array.isArray(val)) {
    return [];
  }
  return val.slice(0, MAX_MEMBERS).filter(m => m && 'object' === typeof m && !Array.isArray(m)).map(m => cleanRaw(m, 0));
};

/** Default attribute values from block.json. */
const defaults = () => {
  const out = {};
  Object.keys(SCHEMA).forEach(k => {
    const def = SCHEMA[k];
    if (Object.prototype.hasOwnProperty.call(def, 'default')) {
      out[k] = clone(def.default);
    } else {
      var _boolean$number$integ;
      out[k] = (_boolean$number$integ = {
        boolean: false,
        number: 0,
        integer: 0,
        array: [],
        object: {}
      }[def.type]) !== null && _boolean$number$integ !== void 0 ? _boolean$number$integ : '';
    }
  });
  return out;
};

/**
 * Merge defaults, coerce types, validate enums and clamp numbers (Renderer::sanitize()).
 *
 * @param {Object} atts Raw attributes.
 * @return {Object} Sanitized attributes.
 */
const sanitizeAttributes = atts => {
  atts = atts && 'object' === typeof atts ? atts : {};
  const out = defaults();
  Object.keys(atts).forEach(k => {
    const v = atts[k];
    if ('members' === k) {
      out.members = cleanMembers(v);
      return;
    }
    if (!SCHEMA[k]) {
      if (['className', 'anchor', 'align'].includes(k) && 'string' === typeof v) {
        out[k] = _sanitize__WEBPACK_IMPORTED_MODULE_3__.text(v);
      }
      return;
    }
    const type = Array.isArray(SCHEMA[k].type) ? SCHEMA[k].type[0] : SCHEMA[k].type;
    switch (type) {
      case 'boolean':
        out[k] = toBool(v);
        break;
      case 'number':
        out[k] = isNumeric(v) ? Number(v) : out[k];
        break;
      case 'integer':
        out[k] = isNumeric(v) ? Math.trunc(Number(v)) : out[k];
        break;
      case 'array':
        if (Array.isArray(v)) {
          out[k] = cleanDeep(v);
        } else {
          out[k] = 'string' === typeof v && '' !== v ? v.split(',').map(s => s.trim()) : [];
        }
        break;
      case 'object':
        out[k] = v && 'object' === typeof v && !Array.isArray(v) ? cleanDeep(v) : out[k];
        break;
      default:
        out[k] = null !== v && 'object' !== typeof v && undefined !== v ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.text(v) : out[k];
    }
  });
  Object.keys(ENUMS).forEach(k => {
    if (!ENUMS[k].includes(out[k])) {
      const d = SCHEMA[k] && SCHEMA[k].default;
      out[k] = ENUMS[k].includes(d) ? d : ENUMS[k][0];
    }
  });
  ['popupStyle', 'panelStyle', 'drawerStyle', 'thumbnailSize', 'theme'].forEach(k => {
    out[k] = _sanitize__WEBPACK_IMPORTED_MODULE_3__.key(out[k]);
  });
  if ('' === out.thumbnailSize) {
    out.thumbnailSize = 'large';
  }
  out.numberOfMembers = Math.trunc(Number(out.numberOfMembers)) || 0;
  ['perPage', 'initialItems', 'loadPerClick', 'perLoad', 'carouselItemsToScroll'].forEach(k => {
    out[k] = Math.max(1, Math.trunc(Number(out[k])) || 0);
  });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  out.carouselSpeed = clamp(Math.trunc(Number(out.carouselSpeed)) || 0, 100, 10000);
  out.carouselAutoplayTimeout = clamp(Math.trunc(Number(out.carouselAutoplayTimeout)) || 0, 500, 60000);
  out.detailsLength = Math.max(0, Math.trunc(Number(out.detailsLength)) || 0);
  out.columnGap = clamp(Number(out.columnGap) || 0, 0, 200);
  out.rowGap = clamp(Number(out.rowGap) || 0, 0, 200);
  return out;
};

/* ------------------------------------------------------------------ */
/* View / link / pagination decisions                                  */
/* ------------------------------------------------------------------ */

/** grid | carousel | filter (Renderer::view()). */
const resolveView = (atts, theme) => {
  if ('carousel' === theme.forced_view) {
    return 'carousel';
  }
  if ('filter' === theme.forced_view) {
    return 'filter';
  }
  if (atts.carouselEnabled && theme.carousel && 'table' !== theme.layout && !theme.grouped) {
    return 'carousel';
  }
  if (atts.filterEnabled && theme.filter) {
    return 'filter';
  }
  return 'grid';
};

/** popup | panel | drawer | custom | none (Context::resolve_link_type()). */
const resolveLinkType = (atts, theme, view) => {
  if (!atts.nameIsLinked) {
    return 'none';
  }
  let type = String(atts.linkType || '');
  let forced = String(theme.forced_link || '');
  if ('single_page' === forced) {
    forced = 'popup';
  }
  if (forced && ('default' === type || ['panel', 'drawer'].includes(forced))) {
    type = forced;
  }
  if ('default' === type || '' === type) {
    type = 'popup';
  }
  if ('single_page' === type) {
    type = 'custom';
  }
  if (!['popup', 'panel', 'drawer', 'custom', 'none'].includes(type)) {
    type = 'popup';
  }
  if ('drawer' === type && ('carousel' === view || 'table' === theme.layout)) {
    type = 'popup';
  }
  return type;
};

/** '' | normal-pagination | load-more-button | load-more-scroll (Query::pagination_mode()). */
const paginationMode = (atts, theme, view) => {
  if (!atts.paginationEnabled || 'carousel' === view || theme.grouped || false === theme.pagination) {
    return '';
  }
  let type = String(atts.paginationType);
  if (!ENUMS.paginationType.includes(type)) {
    type = 'normal-pagination';
  }
  if ('filter' === view) {
    if ('ajax-filter' !== atts.filterType) {
      return '';
    }
  }
  return type;
};
const normOrderBy = o => {
  o = String(o);
  if ('name' === o) {
    return 'title';
  }
  return ['title', 'rand'].includes(o) ? o : 'default';
};

/* ------------------------------------------------------------------ */
/* Visibility                                                          */
/* ------------------------------------------------------------------ */

/** Default visibility per group for a theme. */
const visibilityDefaults = theme => {
  const initial = {};
  _registry__WEBPACK_IMPORTED_MODULE_1__.VIS_KEYS.forEach(k => {
    initial[k] = _registry__WEBPACK_IMPORTED_MODULE_1__.CORE_FIELDS.includes(k);
  });
  const reg = theme.visibility || {};
  if (Array.isArray(reg)) {
    reg.forEach(k => {
      if (k in initial) {
        initial[k] = true;
      }
    });
  } else {
    Object.keys(reg).forEach(k => {
      if (k in initial) {
        initial[k] = !!reg[k];
      }
    });
  }
  const overlay = {};
  _registry__WEBPACK_IMPORTED_MODULE_1__.VIS_KEYS.forEach(k => {
    overlay[k] = 'read_more' !== k;
  });
  return {
    initial,
    popup: overlay,
    panel: overlay,
    drawer: overlay
  };
};
const deviceMap = (value, fallback) => {
  const out = {};
  if (value && 'object' === typeof value && !Array.isArray(value)) {
    const v = {
      ...value
    };
    if (undefined !== v.mobile_landscape && undefined === v.mobilePortrait) {
      v.mobilePortrait = v.mobile_landscape;
    }
    _registry__WEBPACK_IMPORTED_MODULE_1__.VIS_DEVICES.forEach(d => {
      out[d] = undefined !== v[d] && null !== v[d] ? toBool(v[d]) : fallback;
    });
    return out;
  }
  _registry__WEBPACK_IMPORTED_MODULE_1__.VIS_DEVICES.forEach(d => {
    out[d] = null === value || undefined === value ? !!fallback : toBool(value);
  });
  return out;
};

/** group => field => device => bool (Visibility::resolve()). */
const resolveVisibility = (attr, theme) => {
  const defs = visibilityDefaults(theme);
  attr = attr && 'object' === typeof attr && !Array.isArray(attr) ? attr : {};
  const grouped = {};
  _registry__WEBPACK_IMPORTED_MODULE_1__.VIS_GROUPS.forEach(g => {
    if (attr[g] && 'object' === typeof attr[g] && !Array.isArray(attr[g])) {
      grouped[g] = {
        ...attr[g]
      };
    }
  });
  Object.keys(attr).forEach(k => {
    if (!_registry__WEBPACK_IMPORTED_MODULE_1__.VIS_GROUPS.includes(k)) {
      grouped.initial = grouped.initial || {};
      grouped.initial[k] = attr[k];
    }
  });
  const out = {};
  _registry__WEBPACK_IMPORTED_MODULE_1__.VIS_GROUPS.forEach(g => {
    out[g] = {};
    Object.keys(defs[g]).forEach(f => {
      const rawV = grouped[g] ? grouped[g][f] : undefined;
      out[g][f] = deviceMap(rawV, defs[g][f]);
    });
  });
  return out;
};
const anyDevice = map => !!map && _registry__WEBPACK_IMPORTED_MODULE_1__.VIS_DEVICES.some(d => true === map[d]);
const HIDE = {
  desktop: 'bptm-hide-desktop',
  tablet: 'bptm-hide-tablet',
  mobilePortrait: 'bptm-hide-mobile-portrait',
  mobile: 'bptm-hide-mobile'
};
const hideClasses = map => map ? _registry__WEBPACK_IMPORTED_MODULE_1__.VIS_DEVICES.filter(d => false === map[d]).map(d => HIDE[d]).join(' ') : '';

/* ------------------------------------------------------------------ */
/* Members                                                             */
/* ------------------------------------------------------------------ */

const TERM_FIELDS = {
  group: 'group',
  tags: 'tag',
  language: 'language',
  location: 'location',
  gender: 'gender',
  specialty: 'specialty',
  extraOne: 'extra_one',
  extraTwo: 'extra_two',
  extraThree: 'extra_three',
  extraFour: 'extra_four',
  extraFive: 'extra_five'
};
const FILTER_TAX = ['group', 'location', 'language', 'gender', 'specialty', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five'];

/** bptm_split_terms(). */
const splitTerms = value => {
  if (Array.isArray(value)) {
    value = value.filter(x => 'string' === typeof x || 'number' === typeof x).join(',');
  }
  if ('string' !== typeof value && 'number' !== typeof value) {
    return [];
  }
  const seen = new Map();
  String(value).split(',').forEach(part => {
    const name = _sanitize__WEBPACK_IMPORTED_MODULE_3__.text(part);
    if ('' === name) {
      return;
    }
    const slug = _sanitize__WEBPACK_IMPORTED_MODULE_3__.termSlug(name);
    if (!seen.has(slug)) {
      seen.set(slug, {
        id: slug,
        name,
        slug,
        parent: 0
      });
    }
  });
  return [...seen.values()];
};

/**
 * Resolve an image value for a size: { id, url, alt } (+ optional sizes map stored by the editor).
 * Relative URLs (no scheme, no leading "/") are relative to the plugin root.
 *
 * @param {Object} image Raw image.
 * @param {string} size  Image size.
 * @return {Object} { id, url, alt }.
 */
const resolveImage = (image, size) => {
  image = image && 'object' === typeof image && !Array.isArray(image) ? image : {};
  let id = isNumeric(image.id) ? Math.max(0, Math.trunc(Number(image.id))) : 0;
  let u = 'string' === typeof image.url ? image.url.trim() : '';
  const alt = 'string' === typeof image.alt || 'number' === typeof image.alt ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.text(image.alt) : '';
  let sizes = image.sizes && 'object' === typeof image.sizes && !Array.isArray(image.sizes) ? image.sizes : null;
  // Bundled sample photos (assets/img/team/name.jpg) ship -150x150 / -300x300 copies; blocks saved
  // before the sizes map existed get it derived here.
  if (!sizes && /^assets\/img\/team\/[a-z0-9-]+\.jpg$/i.test(u)) {
    const base = u.replace(/\.jpg$/i, '');
    sizes = {
      thumbnail: {
        url: base + '-150x150.jpg'
      },
      medium: {
        url: base + '-300x300.jpg'
      }
    };
  }
  if (sizes) {
    const s = sizes[size] || ('full' !== size ? null : sizes.full);
    const su = s && 'object' === typeof s ? s.url : s;
    if ('string' === typeof su && '' !== su.trim()) {
      u = su.trim();
    }
  }
  if ('' !== u && !/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(u)) {
    const parts = u.replace(/\\/g, '/').split('/').filter(seg => '' !== seg && '.' !== seg && '..' !== seg).map(seg => {
      let dec = seg;
      try {
        dec = decodeURIComponent(seg);
      } catch (e) {
        dec = seg;
      }
      return encodeURIComponent(dec).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
    });
    u = parts.length ? (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.pluginUrl)() + parts.join('/') : '';
    id = 0;
  }
  u = '' !== u ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.url(u, _sanitize__WEBPACK_IMPORTED_MODULE_3__.WEB) : '';
  if ('' === u) {
    id = 0;
  }
  return {
    id,
    url: u,
    alt
  };
};
const placeholderUrl = () => (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.pluginUrl)() + 'assets/img/placeholder.svg';

/**
 * Member object used by every template (bptm_member_from_item()).
 *
 * @param {Object}  item      Raw item.
 * @param {string}  size      Image size.
 * @param {boolean} allowHtml Rich details.
 * @param {number}  index     Position.
 * @return {Object|null} Member.
 */
const memberFromItem = (item, size, allowHtml, index) => {
  if (!item || 'object' !== typeof item || Array.isArray(item)) {
    return null;
  }
  const txt = k => 'string' === typeof item[k] || 'number' === typeof item[k] ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.text(item[k]) : '';
  const lnk = k => 'string' === typeof item[k] && '' !== item[k].trim() ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.url(item[k].trim()) : '';
  let id = _sanitize__WEBPACK_IMPORTED_MODULE_3__.itemId(item.id);
  if ('' === id) {
    id = 'm' + (index + 1);
  }
  const name = txt('name');
  const rawDetails = 'string' === typeof item.details ? item.details.replace(/\r\n?/g, '\n') : '';
  let content = null; // Clean node list (paragraphs).
  if (allowHtml) {
    content = '' !== rawDetails.trim() ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.cleanHtml(rawDetails) : [];
  } else {
    const plain = _sanitize__WEBPACK_IMPORTED_MODULE_3__.decodeEntities(_sanitize__WEBPACK_IMPORTED_MODULE_3__.stripTags(rawDetails));
    content = '' !== plain.trim() ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.textParagraphs(plain) : [];
  }
  const excerpt = _sanitize__WEBPACK_IMPORTED_MODULE_3__.decodeEntities(_sanitize__WEBPACK_IMPORTED_MODULE_3__.stripTags(rawDetails)).replace(/\s+/g, ' ').trim();
  const image = resolveImage(item.image, size);
  const flip = resolveImage(item.flipImage, size);
  const terms = {};
  Object.keys(TERM_FIELDS).forEach(f => {
    terms[TERM_FIELDS[f]] = splitTerms(item[f]);
  });
  const social = [];
  (Array.isArray(item.social) ? item.social : []).forEach(row => {
    if (!row || 'object' !== typeof row) {
      return;
    }
    const icon = _sanitize__WEBPACK_IMPORTED_MODULE_3__.iconClass(row.icon);
    const link = socialLink('string' === typeof row.link || 'number' === typeof row.link ? String(row.link) : '', icon);
    if (icon && link) {
      social.push({
        icon,
        link
      });
    }
  });
  const skills = [];
  (Array.isArray(item.skills) ? item.skills : []).forEach(row => {
    if (!row || 'object' !== typeof row) {
      return;
    }
    const skill = 'string' === typeof row.skill || 'number' === typeof row.skill ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.text(row.skill) : '';
    if ('' === skill) {
      return;
    }
    const pct = isNumeric(row.percent) ? Math.round(Number(row.percent)) : 0;
    skills.push({
      skill,
      percent: Math.max(0, Math.min(100, pct))
    });
  });
  return {
    id,
    name,
    slug: _sanitize__WEBPACK_IMPORTED_MODULE_3__.termSlug(name),
    content,
    excerpt,
    designation: txt('designation'),
    company: txt('company'),
    company_website: lnk('companyWebsite'),
    land_phone: txt('landPhone'),
    cell_phone: txt('cellPhone'),
    email: _sanitize__WEBPACK_IMPORTED_MODULE_3__.email(item.email),
    email_cc: _sanitize__WEBPACK_IMPORTED_MODULE_3__.emailList(item.emailCc),
    email_bcc: _sanitize__WEBPACK_IMPORTED_MODULE_3__.emailList(item.emailBcc),
    address: txt('address'),
    ribbon: txt('ribbon'),
    zip_code: txt('zipCode'),
    vcard: lnk('vcard'),
    custom_page: lnk('customUrl'),
    featured: isOn(item.featured),
    image_id: image.id,
    image_url: '' !== image.url ? image.url : placeholderUrl(),
    image_alt: '' !== image.alt ? image.alt : name,
    flip_image_id: flip.id,
    flip_image_url: flip.url,
    social,
    skills,
    terms,
    menu_order: index
  };
};
const isPhoneIcon = icon => /(?:^|\s)fa-(?:phone(?:-[a-z0-9-]+)?|square-phone(?:-[a-z0-9-]+)?|mobile(?:-[a-z0-9-]+)?)(?:\s|$)/.test(String(icon).toLowerCase());

/** bptm_sanitize_social_link(). */
const socialLink = (link, icon) => {
  link = String(link || '').trim();
  if ('' === link) {
    return '';
  }
  if (_sanitize__WEBPACK_IMPORTED_MODULE_3__.isEmail(link)) {
    link = 'mailto:' + link;
  } else if (/^\+?[0-9 ().-]{5,}$/.test(link) && isPhoneIcon(icon)) {
    link = 'tel:' + link.replace(/[^0-9+]/g, '');
  }
  return _sanitize__WEBPACK_IMPORTED_MODULE_3__.url(link, ['http', 'https', 'ftp', 'ftps', 'mailto', 'news', 'irc', 'irc6', 'ircs', 'gopher', 'nntp', 'feed', 'telnet', 'mms', 'rtsp', 'sms', 'svn', 'tel', 'fax', 'xmpp', 'webcal', 'urn', 'skype', 'whatsapp', 'viber', 'tg', 'callto']);
};

/** Href for a social entry (Context::social_href()). */
const socialHref = s => {
  const icon = s.icon || '';
  let link = String(s.link || '').trim();
  if ('' === link) {
    return '';
  }
  if (-1 !== icon.indexOf('envelope') && _sanitize__WEBPACK_IMPORTED_MODULE_3__.isEmail(link)) {
    return 'mailto:' + link;
  }
  if (/fa-(phone|mobile)/.test(icon) && /^[+\d][\d\s().-]+$/.test(link)) {
    return 'tel:' + link.replace(/[^\d+]/g, '');
  }
  if (-1 !== icon.indexOf('whatsapp') && /^[+\d][\d\s().-]+$/.test(link)) {
    return 'https://wa.me/' + link.replace(/\D/g, '');
  }
  if (-1 !== icon.indexOf('skype') && !/^[a-z]+:/i.test(link)) {
    return 'skype:' + link + '?chat';
  }
  if (!/^[a-z][a-z0-9+.-]*:/i.test(link)) {
    link = 'https://' + link.replace(/^\/+/, '');
  }
  return link;
};

/** All member objects of the block (ids made unique). */
const buildMembers = atts => {
  const items = Array.isArray(atts.members) ? atts.members.slice(0, MAX_MEMBERS) : [];
  const size = atts.thumbnailSize || 'large';
  const html = !!atts.allowHtmlDetails;
  const seen = new Set();
  const out = [];
  items.forEach((item, index) => {
    const m = memberFromItem(item, size, html, index);
    if (!m) {
      return;
    }
    const base = m.id;
    let id = base;
    let n = 1;
    while (seen.has(id)) {
      n++;
      id = base + '-' + n;
    }
    seen.add(id);
    m.id = id;
    out.push(m);
  });
  return out;
};
const termNames = (m, k, sep = ', ') => (m.terms[k] || []).map(t => t.name).join(sep);
const termSlugs = (m, k) => (m.terms[k] || []).map(t => t.slug);

/* ------------------------------------------------------------------ */
/* Query                                                               */
/* ------------------------------------------------------------------ */

const INCLUDE_MAP = {
  includeGroups: 'group',
  includeTags: 'tag',
  includeLocations: 'location',
  includeLanguages: 'language',
  includeSpecialties: 'specialty',
  includeGenders: 'gender',
  includeExtraOne: 'extra_one',
  includeExtraTwo: 'extra_two',
  includeExtraThree: 'extra_three',
  includeExtraFour: 'extra_four',
  includeExtraFive: 'extra_five'
};

/** Include / exclude list → term names (legacy numeric ids ignored). */
const termValues = rawList => {
  if ('string' === typeof rawList) {
    rawList = rawList.split(',');
  }
  const out = [];
  (Array.isArray(rawList) ? rawList : []).forEach(v => {
    if (v && 'object' === typeof v) {
      v = undefined !== v.value ? v.value : undefined !== v.name ? v.name : v.label;
    }
    if ('string' !== typeof v) {
      return;
    }
    v = _sanitize__WEBPACK_IMPORTED_MODULE_3__.text(v);
    if ('' !== v && !out.includes(v)) {
      out.push(v);
    }
  });
  return out;
};
const termMatches = (term, values) => {
  const name = _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(term.name);
  return values.some(v => _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(v) === name || _sanitize__WEBPACK_IMPORTED_MODULE_3__.termSlug(v) === term.slug);
};
const memberHas = (m, k, values) => (m.terms[k] || []).some(t => termMatches(t, values));
const contains = (hay, needle) => '' === needle || -1 !== _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(hay).indexOf(needle);

/** Text searched by "search in all fields". */
const searchText = m => {
  const hay = [m.designation, m.company, m.company_website, m.email, m.land_phone, m.cell_phone, m.address, m.zip_code, m.ribbon, m.excerpt];
  Object.keys(m.terms).forEach(k => m.terms[k].forEach(t => hay.push(t.name)));
  m.skills.forEach(s => hay.push(s.skill));
  return hay.filter(x => '' !== String(x)).join(' ');
};
const applyIncludes = (atts, members) => {
  Object.keys(INCLUDE_MAP).forEach(attr => {
    const values = termValues(atts[attr]);
    if (values.length) {
      members = members.filter(m => memberHas(m, INCLUDE_MAP[attr], values));
    }
  });
  const exclude = termValues(atts.excludeGroups);
  if (exclude.length) {
    members = members.filter(m => !memberHas(m, 'group', exclude));
  }
  return members;
};

/** Order + featured first (Query::order()). `seed` keeps the random order stable per instance. */
const orderMembers = (atts, members, seed) => {
  const orderby = normOrderBy(atts.orderBy);
  let desc = 'DESC' === String(atts.order).toUpperCase();
  let list = members.slice();
  if ('title' === orderby) {
    const coll = 'undefined' !== typeof Intl ? new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base'
    }) : null;
    list.sort((a, b) => {
      const c = coll ? coll.compare(a.name, b.name) : a.name.localeCompare(b.name);
      return 0 !== c ? c : a.menu_order - b.menu_order;
    });
  } else if ('rand' === orderby) {
    const h = id => {
      let x = 2166136261 ^ seed;
      const s = String(seed) + '|' + id;
      for (let i = 0; i < s.length; i++) {
        x ^= s.charCodeAt(i);
        x = Math.imul(x, 16777619) >>> 0;
      }
      return x;
    };
    list.sort((a, b) => h(a.id) - h(b.id));
    desc = false;
  }
  if (desc) {
    list.reverse();
  }
  if (atts.enableFeaturing) {
    list = [...list.filter(m => m.featured), ...list.filter(m => !m.featured)];
  }
  return list;
};

/**
 * Server-style filters (former "ajax filter" REST path): applied to the base list before pagination.
 *
 * @param {Object[]} members Members.
 * @param {Object}   f       Filter state { group, designation, location…: string[], search, company, zip, tag }.
 * @return {Object[]} Members.
 */
const applyRuntimeFilters = (members, f) => {
  FILTER_TAX.forEach(k => {
    const vals = (f[k] || []).map(v => _sanitize__WEBPACK_IMPORTED_MODULE_3__.termSlug(String(v))).filter(Boolean);
    if (vals.length) {
      members = members.filter(m => termSlugs(m, k).some(s => vals.includes(s)));
    }
  });
  if (f.designation && f.designation.length) {
    const want = f.designation.map(v => _sanitize__WEBPACK_IMPORTED_MODULE_3__.termSlug(String(v)));
    members = members.filter(m => want.includes(_sanitize__WEBPACK_IMPORTED_MODULE_3__.termSlug(m.designation)));
  }
  const search = f.search ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(String(f.search).trim()) : '';
  if (search) {
    const all = (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.pref)('search_all_fields');
    members = members.filter(m => contains(m.name, search) || all && contains(searchText(m), search));
  }
  [['company', 'company'], ['zip', 'zip_code']].forEach(([k, field]) => {
    const v = f[k] ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(String(f[k]).trim()) : '';
    if (v) {
      members = members.filter(m => '' !== m[field] && contains(m[field], v));
    }
  });
  const tag = f.tag ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(String(f.tag).trim()) : '';
  if (tag) {
    members = members.filter(m => (m.terms.tag || []).some(t => contains(t.name, tag)));
  }
  return members;
};

/**
 * Client-side ("normal filter") match, same semantics as the former data-attribute matching.
 *
 * @param {Object} m Member.
 * @param {Object} s State { group: slug, designation: [slug], <tax>: [slug], search, company, zip, tag }.
 * @return {boolean} Match.
 */
const clientMatches = (m, s) => {
  if (s.group && !termSlugs(m, 'group').map(_sanitize__WEBPACK_IMPORTED_MODULE_3__.lower).includes(s.group)) {
    return false;
  }
  if (s.designation && s.designation.length && !s.designation.includes('' !== m.designation ? _sanitize__WEBPACK_IMPORTED_MODULE_3__.termSlug(m.designation) : '')) {
    return false;
  }
  for (const k of FILTER_TAX) {
    if ('group' === k || !s[k] || !s[k].length) {
      continue;
    }
    const have = termSlugs(m, k).map(_sanitize__WEBPACK_IMPORTED_MODULE_3__.lower);
    if (!s[k].some(v => have.includes(_sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(String(v))))) {
      return false;
    }
  }
  if (s.search) {
    const q = _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(s.search);
    const inName = -1 !== _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(m.name).indexOf(q);
    const inAll = (0,_bridge__WEBPACK_IMPORTED_MODULE_2__.pref)('search_all_fields') && -1 !== _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(searchText(m)).indexOf(q);
    if (!inName && !inAll) {
      return false;
    }
  }
  if (s.company && -1 === _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(m.company).indexOf(_sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(s.company))) {
    return false;
  }
  if (s.zip && -1 === _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(m.zip_code).indexOf(_sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(s.zip))) {
    return false;
  }
  if (s.tag) {
    const q = _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(s.tag);
    if (!(m.terms.tag || []).some(t => -1 !== _sanitize__WEBPACK_IMPORTED_MODULE_3__.lower(t.name).indexOf(q))) {
      return false;
    }
  }
  return true;
};

/**
 * Members before frontend filters / pagination: includes applied, ordered, capped.
 *
 * @param {Object}   atts    Sanitized attributes.
 * @param {Object[]} members All members.
 * @param {number}   seed    Random seed.
 * @return {Object} { base, pool }.
 */
const queryPool = (atts, members, seed) => {
  const base = applyIncludes(atts, members);
  let pool = orderMembers(atts, base, seed);
  const num = Math.trunc(Number(atts.numberOfMembers)) || 0;
  if (num > 0) {
    pool = pool.slice(0, num);
  }
  return {
    base,
    pool
  };
};

/** Distinct terms of a key across the pool (Filters::terms()). */
const filterTerms = (key, atts, pool, includeAttr = '') => {
  const include = includeAttr ? termValues(atts[includeAttr]) : [];
  const exclude = 'group' === key ? termValues(atts.excludeGroups) : [];
  const terms = new Map();
  pool.forEach(m => {
    (m.terms[key] || []).forEach(t => {
      if (terms.has(t.slug)) {
        terms.get(t.slug).count++;
        return;
      }
      if (include.length && !termMatches(t, include) || exclude.length && termMatches(t, exclude)) {
        return;
      }
      terms.set(t.slug, {
        slug: t.slug,
        name: t.name,
        count: 1
      });
    });
  });
  let list = [...terms.values()];
  if (['name', 'slug'].includes(atts.taxonomyOrderBy)) {
    const coll = 'undefined' !== typeof Intl ? new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base'
    }) : null;
    list.sort((a, b) => coll ? coll.compare(a.name, b.name) : a.name.localeCompare(b.name));
  }
  if ('DESC' === atts.taxonomyOrder) {
    list = list.reverse();
  }
  return list;
};

/** Distinct designations (slug => label), natural case-insensitive order. */
const designations = pool => {
  const vals = new Map();
  pool.forEach(m => {
    const d = m.designation.trim();
    if ('' !== d) {
      const slug = _sanitize__WEBPACK_IMPORTED_MODULE_3__.termSlug(d);
      if (!vals.has(slug)) {
        vals.set(slug, d);
      }
    }
  });
  const coll = 'undefined' !== typeof Intl ? new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base'
  }) : null;
  return [...vals.entries()].sort((a, b) => coll ? coll.compare(a[1], b[1]) : a[1].localeCompare(b[1]));
};


/***/ }),

/***/ "./src/Components/Common/Team/registry.js":
/*!************************************************!*\
  !*** ./src/Components/Common/Team/registry.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CORE_FIELDS: () => (/* binding */ CORE_FIELDS),
/* harmony export */   DEFAULT_THEME: () => (/* binding */ DEFAULT_THEME),
/* harmony export */   DETAIL_STYLES: () => (/* binding */ DETAIL_STYLES),
/* harmony export */   META_FIELDS: () => (/* binding */ META_FIELDS),
/* harmony export */   NAV_ICONS: () => (/* binding */ NAV_ICONS),
/* harmony export */   VIS_DEVICES: () => (/* binding */ VIS_DEVICES),
/* harmony export */   VIS_GROUPS: () => (/* binding */ VIS_GROUPS),
/* harmony export */   VIS_KEYS: () => (/* binding */ VIS_KEYS),
/* harmony export */   getThemeDef: () => (/* binding */ getThemeDef),
/* harmony export */   getThemeList: () => (/* binding */ getThemeList),
/* harmony export */   themeFamily: () => (/* binding */ themeFamily)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Theme registry, visibility fields and detail styles (single source for the editor and the front end).
 *
 * Ported from the former PHP registries (includes/render/themes/registry-{a,b,c}.php).
 * Each theme: { id, label, group, layout: grid|table|list, carousel, filter, forced_link, forced_view,
 * grouped, pagination, visibility: { field: bool } (card defaults) }.
 */

const DEFAULT_THEME = 'grid-5';
const VIS_KEYS = ['thumbnail', 'name', 'designation', 'details', 'social', 'ribbon', 'featured_badge', 'skills', 'company', 'address', 'land_phone', 'cell_phone', 'email', 'location', 'language', 'specialty', 'gender', 'zip', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five', 'vcard', 'read_more'];

/** Fields shown on cards by default when a registry entry does not list them. */
const CORE_FIELDS = ['thumbnail', 'name', 'designation', 'details', 'social', 'ribbon', 'featured_badge', 'read_more'];
const VIS_GROUPS = ['initial', 'popup', 'panel', 'drawer'];
const VIS_DEVICES = ['desktop', 'tablet', 'mobilePortrait', 'mobile'];

/** Meta / contact fields in display order. */
const META_FIELDS = ['company', 'address', 'land_phone', 'cell_phone', 'email', 'location', 'language', 'specialty', 'gender', 'zip', 'extra_one', 'extra_two', 'extra_three', 'extra_four', 'extra_five'];
const DETAIL_STYLES = {
  popup: ['default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five', 'style-six'],
  panel: ['default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five'],
  drawer: ['default', 'style-one', 'style-two', 'style-three', 'style-four', 'style-five']
};
const visMap = on => {
  const map = {};
  VIS_KEYS.forEach(k => {
    map[k] = on.includes(k);
  });
  return map;
};
const labels = () => ({
  'grid-1': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 1', 'bp-team-member'),
  'grid-2': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 2', 'bp-team-member'),
  'grid-3': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 3', 'bp-team-member'),
  'grid-4': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 4', 'bp-team-member'),
  'grid-5': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 5', 'bp-team-member'),
  'grid-6': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 6', 'bp-team-member'),
  'circle-1': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Circle 1', 'bp-team-member'),
  'circle-2': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Circle 2', 'bp-team-member'),
  'circle-3': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Circle 3', 'bp-team-member'),
  'circle-4': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Circle 4', 'bp-team-member'),
  'circle-5': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Circle 5', 'bp-team-member'),
  'circle-6': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Circle 6', 'bp-team-member'),
  'horizontal-1': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal 1', 'bp-team-member'),
  'horizontal-2': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal 2', 'bp-team-member'),
  'horizontal-3': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal 3', 'bp-team-member'),
  'horizontal-4': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal 4', 'bp-team-member'),
  'horizontal-5': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal 5', 'bp-team-member'),
  'horizontal-6': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal 6', 'bp-team-member'),
  'horizontal-7': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal 7', 'bp-team-member'),
  'horizontal-8': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal 8', 'bp-team-member'),
  'horizontal-9': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Horizontal 9', 'bp-team-member'),
  'flip-1': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Flip 1', 'bp-team-member'),
  'flip-2': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Flip 2', 'bp-team-member'),
  'flip-3': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Flip 3', 'bp-team-member'),
  'flip-4': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Flip 4', 'bp-team-member'),
  'flip-5': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Flip 5', 'bp-team-member'),
  'flip-6': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Flip 6', 'bp-team-member'),
  'table-1': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Table 1', 'bp-team-member'),
  'table-2': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Table 2', 'bp-team-member'),
  'table-3': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Table 3', 'bp-team-member'),
  'table-4': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Table 4', 'bp-team-member'),
  'table-5': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Table 5', 'bp-team-member'),
  'list-1': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('List 1', 'bp-team-member'),
  'list-2': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('List 2', 'bp-team-member'),
  'list-3': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('List 3', 'bp-team-member'),
  'list-4': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('List 4', 'bp-team-member'),
  'list-5': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('List 5', 'bp-team-member'),
  'grid-7': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 7', 'bp-team-member'),
  'grid-8': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 8', 'bp-team-member'),
  'grid-9': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 9', 'bp-team-member'),
  'grid-10': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 10 (Greyscale)', 'bp-team-member'),
  'grid-11': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 11', 'bp-team-member'),
  'grid-12': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid 12', 'bp-team-member'),
  'grid-popup': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid Popup', 'bp-team-member'),
  'grid-single': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid Single', 'bp-team-member'),
  'grid-filter-single': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid Filter Single', 'bp-team-member'),
  'grid-filter-popup': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid Filter Popup', 'bp-team-member'),
  'grid-slider': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid Slider', 'bp-team-member'),
  'grid-filter-selected': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid Filter - Selected Groups', 'bp-team-member'),
  'grid-filter-vcard': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid Filter with vCard', 'bp-team-member'),
  'grid-panel': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid Panel Slide', 'bp-team-member'),
  'grid-drawer-1': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid Drawer 1', 'bp-team-member'),
  'grid-drawer-2': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Grid Drawer 2', 'bp-team-member'),
  'table-6': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Table 6 - Underline', 'bp-team-member'),
  'table-7': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Table 7 - Box Border', 'bp-team-member'),
  'table-8': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Table 8 - Odd Even', 'bp-team-member'),
  'table-9': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Table 9 - Filter', 'bp-team-member'),
  'table-10': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Table 10 - Filter Dense', 'bp-team-member'),
  'list-6': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('List 6', 'bp-team-member'),
  'list-7': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('List 7', 'bp-team-member'),
  'group-filter-1': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Group Filter 1', 'bp-team-member'),
  'sidebar-1': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Sidebar 1 - Framed Photo', 'bp-team-member'),
  'sidebar-2': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Sidebar 2 - Round Avatar', 'bp-team-member'),
  'sidebar-3': (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Sidebar 3 - Compact Rows', 'bp-team-member')
});
const B = ['thumbnail', 'name', 'designation'];
const R = ['ribbon', 'featured_badge'];

/** Raw definitions: id => [ group, layout, visible fields, overrides ]. */
const DEFS = [
// Registry A: grid / circle / horizontal / flip (layout grid, carousel + filter).
['grid-1', 'grid', 'grid', [...B, 'social']], ['grid-2', 'grid', 'grid', [...B, 'details', 'social', 'ribbon', 'featured_badge', 'cell_phone']], ['grid-3', 'grid', 'grid', [...B, 'social', ...R]], ['grid-4', 'grid', 'grid', [...B, 'social', ...R]], ['grid-5', 'grid', 'grid', [...B, 'social', ...R]], ['grid-6', 'grid', 'grid', [...B, 'social', ...R]], ['circle-1', 'circle', 'grid', [...B, 'details', 'social']], ['circle-2', 'circle', 'grid', [...B, 'details', 'social', 'cell_phone']], ['circle-3', 'circle', 'grid', [...B, 'social']], ['circle-4', 'circle', 'grid', [...B, 'details', 'social', 'cell_phone']], ['circle-5', 'circle', 'grid', [...B, 'details', 'social']], ['circle-6', 'circle', 'grid', [...B, 'details', 'social', ...R]], ['horizontal-1', 'horizontal', 'grid', [...B, 'details', 'social']], ['horizontal-2', 'horizontal', 'grid', [...B, 'details', 'cell_phone']], ['horizontal-3', 'horizontal', 'grid', [...B, 'details', ...R, 'address']], ['horizontal-4', 'horizontal', 'grid', [...B, 'details', 'social']], ['horizontal-5', 'horizontal', 'grid', [...B, 'details', 'email']], ['horizontal-6', 'horizontal', 'grid', [...B, 'details', 'social', ...R]], ['horizontal-7', 'horizontal', 'grid', [...B, 'details', 'social', ...R]], ['horizontal-8', 'horizontal', 'grid', [...B, 'details', 'social', ...R]], ['horizontal-9', 'horizontal', 'grid', [...B, 'details', 'social', ...R]], ['flip-1', 'flip', 'grid', [...B, 'details', 'social', ...R, 'cell_phone']], ['flip-2', 'flip', 'grid', [...B, 'details', 'social', 'email']], ['flip-3', 'flip', 'grid', [...B, 'details', 'social', ...R, 'address']], ['flip-4', 'flip', 'grid', [...B, 'social', 'cell_phone', 'email']], ['flip-5', 'flip', 'grid', [...B, ...R]], ['flip-6', 'flip', 'grid', [...B, ...R, 'email', 'land_phone', 'cell_phone']],
// Registry B: tables, lists, legacy grids.
['table-1', 'table', 'table', [...B, 'details', 'social'], {
  filter: false
}], ['table-2', 'table', 'table', [...B, 'details', 'social'], {
  filter: false
}], ['table-3', 'table', 'table', [...B, 'details', 'social'], {
  filter: false
}], ['table-4', 'table', 'table', [...B, 'details', 'social'], {
  filter: false
}], ['table-5', 'table', 'table', [...B, 'details', 'social'], {
  filter: false
}], ['list-1', 'list', 'list', [...B, 'details', 'social']], ['list-2', 'list', 'list', [...B, 'details', 'cell_phone']], ['list-3', 'list', 'list', [...B, 'details', 'email']], ['list-4', 'list', 'list', [...B, 'details', 'email', 'address']], ['list-5', 'list', 'list', [...B, 'details', 'social']], ['grid-7', 'grid', 'grid', [...B, 'details', 'social', ...R]], ['grid-8', 'grid', 'grid', [...B]], ['grid-9', 'grid', 'grid', [...B, ...R]], ['grid-10', 'grid', 'grid', [...B, 'details', 'social', ...R]], ['grid-11', 'grid', 'grid', [...B]], ['grid-12', 'grid', 'grid', [...B, 'social', 'read_more', ...R]], ['grid-popup', 'legacy', 'grid', [...B, ...R], {
  forced_link: 'popup'
}], ['grid-single', 'legacy', 'grid', [...B, ...R], {
  forced_link: 'popup'
}], ['grid-filter-single', 'legacy', 'grid', [...B, ...R, 'cell_phone', 'email'], {
  forced_link: 'popup',
  forced_view: 'filter',
  carousel: false,
  pagination: false
}], ['grid-filter-popup', 'legacy', 'grid', [...B, ...R], {
  forced_link: 'popup',
  forced_view: 'filter',
  carousel: false,
  pagination: false
}], ['grid-slider', 'legacy', 'grid', [...B, 'details', 'social', ...R], {
  forced_view: 'carousel',
  filter: false,
  pagination: false
}], ['grid-filter-selected', 'legacy', 'grid', [...B, ...R], {
  forced_link: 'popup',
  forced_view: 'filter',
  carousel: false,
  pagination: false
}], ['grid-filter-vcard', 'legacy', 'grid', [...B, 'cell_phone', 'email', 'vcard'], {
  forced_view: 'filter',
  carousel: false,
  pagination: false
}], ['grid-panel', 'legacy', 'grid', [...B, ...R], {
  forced_link: 'panel',
  pagination: false
}], ['grid-drawer-1', 'legacy', 'grid', [...B, ...R], {
  forced_link: 'drawer',
  carousel: false,
  pagination: false
}], ['grid-drawer-2', 'legacy', 'grid', [...B, ...R], {
  forced_link: 'drawer',
  carousel: false,
  pagination: false
}], ['table-6', 'table', 'table', [...B, 'details', 'social'], {
  pagination: false
}], ['table-7', 'table', 'table', [...B, 'details', 'social'], {
  pagination: false
}], ['table-8', 'table', 'table', [...B, 'details', 'social'], {
  pagination: false
}], ['table-9', 'table', 'table', ['name', 'designation', 'cell_phone', 'email'], {
  forced_view: 'filter',
  pagination: false
}], ['table-10', 'table', 'table', ['name', 'cell_phone', 'email'], {
  forced_view: 'filter',
  pagination: false
}], ['list-6', 'list', 'list', [...B, 'details', 'social', ...R]], ['list-7', 'list', 'list', [...B, 'details', 'social', ...R]], ['group-filter-1', 'legacy', 'grid', [...B, 'cell_phone', 'email'], {
  forced_view: 'filter',
  grouped: true,
  carousel: false,
  pagination: false
}],
// Registry C: sidebar.
['sidebar-1', 'sidebar', 'list', [...B, 'social'], {
  carousel: false
}], ['sidebar-2', 'sidebar', 'list', [...B, 'social'], {
  carousel: false
}], ['sidebar-3', 'sidebar', 'list', [...B, 'social'], {
  carousel: false
}]];

/** Which item renderer family a theme uses: ta (registry A), tb (registry B) or sidebar. */
const themeFamily = id => {
  if (/^(grid-[1-6]|circle-\d|horizontal-\d|flip-\d)$/.test(id)) {
    return 'ta';
  }
  if (/^sidebar-\d$/.test(id)) {
    return 'sidebar';
  }
  return 'tb';
};
let cache = null;

/**
 * All themes, normalised (array, registry order).
 *
 * @return {Object[]} Themes.
 */
const getThemeList = () => {
  if (cache) {
    return cache;
  }
  const L = labels();
  cache = DEFS.map(([id, group, layout, vis, over = {}]) => {
    const flow = 'table' === layout || 'list' === layout;
    return {
      id,
      value: id,
      label: L[id] || id,
      group,
      layout,
      carousel: !flow,
      filter: true,
      forced_link: null,
      forced_view: null,
      grouped: false,
      pagination: true,
      visibility: visMap(vis),
      ...over
    };
  });
  return cache;
};

/**
 * One theme (falls back to the default theme).
 *
 * @param {string} id Theme id.
 * @return {Object} Theme.
 */
const getThemeDef = id => {
  const list = getThemeList();
  const key = String(id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return list.find(t => t.id === key) || list.find(t => t.id === DEFAULT_THEME);
};

/** Carousel nav icons per style. */
const NAV_ICONS = {
  'style-one': ['fas fa-chevron-left', 'fas fa-chevron-right'],
  'style-two': ['fas fa-arrow-left-long', 'fas fa-arrow-right-long'],
  'style-three': ['fas fa-angles-left', 'fas fa-angles-right'],
  default: ['fas fa-angle-left', 'fas fa-angle-right']
};

/***/ }),

/***/ "./src/Components/Common/Team/sanitize.js":
/*!************************************************!*\
  !*** ./src/Components/Common/Team/sanitize.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Fragment: () => (/* reexport safe */ _wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Fragment),
/* harmony export */   LINK_PROTOCOLS: () => (/* binding */ LINK_PROTOCOLS),
/* harmony export */   WEB: () => (/* binding */ WEB),
/* harmony export */   cleanHtml: () => (/* binding */ cleanHtml),
/* harmony export */   decodeEntities: () => (/* binding */ decodeEntities),
/* harmony export */   email: () => (/* binding */ email),
/* harmony export */   emailList: () => (/* binding */ emailList),
/* harmony export */   htmlClass: () => (/* binding */ htmlClass),
/* harmony export */   iconClass: () => (/* binding */ iconClass),
/* harmony export */   isEmail: () => (/* binding */ isEmail),
/* harmony export */   itemId: () => (/* binding */ itemId),
/* harmony export */   key: () => (/* binding */ key),
/* harmony export */   lower: () => (/* binding */ lower),
/* harmony export */   nodesText: () => (/* binding */ nodesText),
/* harmony export */   nodesToReact: () => (/* binding */ nodesToReact),
/* harmony export */   stripTags: () => (/* binding */ stripTags),
/* harmony export */   termSlug: () => (/* binding */ termSlug),
/* harmony export */   text: () => (/* binding */ text),
/* harmony export */   textParagraphs: () => (/* binding */ textParagraphs),
/* harmony export */   url: () => (/* binding */ url)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Sanitizers for untrusted block attributes (ports of the WordPress / BPTM PHP helpers the
 * server renderer used). Text is rendered by React (always escaped); HTML details go through a
 * DOMParser-based whitelist and are converted to React elements (never dangerouslySetInnerHTML).
 */


/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

let decoderDoc = null;

/**
 * Decode HTML entities (&amp; → &). Uses an inert DOMParser document (scripts never run there).
 *
 * @param {string} s String.
 * @return {string} Decoded.
 */
const decodeEntities = s => {
  s = String(s);
  if (-1 === s.indexOf('&')) {
    return s;
  }
  if ('undefined' === typeof window || 'function' !== typeof window.DOMParser) {
    return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
  }
  if (!decoderDoc) {
    decoderDoc = new window.DOMParser().parseFromString('<!doctype html><textarea></textarea>', 'text/html');
  }
  const ta = decoderDoc.querySelector('textarea');
  ta.innerHTML = s.replace(/</g, '&lt;');
  return ta.value;
};

/**
 * wp_strip_all_tags(): removes script/style blocks and every tag.
 *
 * @param {string} s String.
 * @return {string} Text.
 */
const stripTags = s => String(s).replace(/<(script|style)[^>]*?>[\s\S]*?<\/\1\s*>/gi, '').replace(/<\/?[a-zA-Z!?][^>]*(>|$)/g, '');

/**
 * sanitize_text_field() + entity decoding (PHP printed esc_html() of it, which shows entities decoded).
 *
 * @param {*} v Value.
 * @return {string} Clean single-line text.
 */
const text = v => {
  if (null === v || undefined === v || 'boolean' === typeof v || 'object' === typeof v) {
    return '';
  }
  let s = stripTags(String(v));
  s = s.replace(/[\r\n\t ]+/g, ' ');
  let prev;
  do {
    prev = s;
    s = s.replace(/%[a-f0-9]{2}/gi, '');
  } while (prev !== s);
  return decodeEntities(s.replace(/\s+/g, ' ').trim());
};

/** Lowercase helper (mb_strtolower). */
const lower = s => String(s).toLowerCase();

/* ------------------------------------------------------------------ */
/* Slugs / ids / classes                                               */
/* ------------------------------------------------------------------ */

const hash8 = s => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ('0000000' + h.toString(16)).slice(-8);
};

/**
 * sanitize_title() port ("Product Design" → "product-design"); values that sanitize to nothing get a hash slug.
 *
 * @param {string} name Name.
 * @return {string} Slug.
 */
const termSlug = name => {
  name = String(name || '');
  let s = stripTags(name);
  s = s.normalize ? s.normalize('NFD').replace(/\p{M}/gu, '') : s;
  s = s.replace(/ß/g, 'ss').replace(/æ/gi, 'ae').replace(/ø/gi, 'o').replace(/đ/gi, 'd').replace(/ł/gi, 'l').replace(/œ/gi, 'oe');
  s = s.toLowerCase();
  s = s.replace(/&.+?;/g, '').replace(/\./g, '-');
  s = Array.from(s).map(ch => ch.charCodeAt(0) > 127 ? encodeURIComponent(ch).toLowerCase() : ch).join('');
  s = s.replace(/[^%a-z0-9 _-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  if ('' === s && '' !== name.trim()) {
    s = 'v-' + hash8(name);
  }
  return s;
};

/** bptm_sanitize_item_id(): [A-Za-z0-9_-], max 64. */
const itemId = id => 'string' === typeof id || 'number' === typeof id ? String(id).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64) : '';

/** sanitize_html_class(). */
const htmlClass = c => String(c || '').replace(/%[a-fA-F0-9][a-fA-F0-9]/g, '').replace(/[^A-Za-z0-9_-]/g, '');

/** sanitize_key(). */
const key = k => String(k || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
const FA_STYLE = ['fa', 'fab', 'fas', 'far', 'fa-brands', 'fa-solid', 'fa-regular'];

/**
 * bptm_sanitize_icon_class(): only Font Awesome style classes and `fa-{name}` classes; anything else drops the value.
 *
 * @param {*} icon Raw.
 * @return {string} Class string or ''.
 */
const iconClass = icon => {
  if ('string' !== typeof icon) {
    return '';
  }
  const parts = icon.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const out = [];
  let hasIcon = false;
  for (const c of parts) {
    if (FA_STYLE.includes(c)) {
      out.push(c);
    } else if (/^fa-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c)) {
      out.push(c);
      hasIcon = true;
    } else {
      return '';
    }
  }
  return hasIcon ? [...new Set(out)].join(' ') : '';
};

/* ------------------------------------------------------------------ */
/* Emails / URLs                                                       */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

/** is_email() (simplified, strict). */
const isEmail = v => 'string' === typeof v && v.length >= 6 && v.length <= 254 && EMAIL_RE.test(v) && !/\.\./.test(v);

/** sanitize_email() + is_email(): '' when invalid. */
const email = v => {
  const s = 'string' === typeof v ? v.trim() : '';
  return isEmail(s) ? s : '';
};

/** bptm_sanitize_email_list(): comma-separated valid addresses. */
const emailList = v => {
  const parts = ('string' === typeof v || 'number' === typeof v ? String(v) : '').split(/[;,\s]+/).filter(Boolean);
  return [...new Set(parts.filter(isEmail))].join(',');
};
const WEB = ['http', 'https'];
const LINK_PROTOCOLS = ['http', 'https', 'mailto', 'tel', 'skype', 'callto', 'sms', 'viber', 'whatsapp'];
const ALLOWED = ['http', 'https', 'ftp', 'ftps', 'mailto', 'news', 'irc', 'irc6', 'ircs', 'gopher', 'nntp', 'feed', 'telnet', 'mms', 'rtsp', 'sms', 'svn', 'tel', 'fax', 'xmpp', 'webcal', 'urn'];

/**
 * esc_url_raw() port: '' for disallowed protocols (javascript:, data:, vbscript: …); scheme-less
 * host-like values get http://; relative paths, queries and fragments pass.
 *
 * @param {*}        v         Raw URL.
 * @param {string[]} protocols Allowed protocols.
 * @return {string} URL.
 */
const url = (v, protocols = ALLOWED) => {
  if ('string' !== typeof v) {
    return '';
  }
  let u = v.trim().replace(/ /g, '%20');
  u = Array.from(u).filter(ch => ch.charCodeAt(0) > 127 || /[a-z0-9\-~+_.?#=!&;,/:%@$|*'()[\]]/i.test(ch)).join('');
  if ('' === u) {
    return '';
  }
  if (-1 !== u.indexOf(':')) {
    const m = /^([a-z][a-z0-9+.-]*):/i.exec(u);
    // Anything before the first ":" must be an allowed protocol (blocks javascript:, data:, vbscript: …).
    if (!m || !protocols.includes(m[1].toLowerCase())) {
      return /^[/#?]/.test(u) && !/^\/\/[^/]*:/.test(u) ? u : '';
    }
    return u;
  }
  if (/^[/#?]/.test(u) || /^[a-z0-9-]+?\.php/i.test(u)) {
    return u;
  }
  const http = protocols.includes('http') ? 'http://' : '';
  return http ? http + u : '';
};

/* ------------------------------------------------------------------ */
/* Rich details (allowHtmlDetails)                                     */
/* ------------------------------------------------------------------ */

const ALLOWED_TAGS = {
  p: [],
  br: [],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  a: ['href', 'target', 'rel'],
  ul: [],
  ol: [],
  li: [],
  span: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  blockquote: []
};
const BLOCK_TAGS = ['p', 'ul', 'ol', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li'];
const DROP_WITH_CONTENT = ['script', 'style', 'template', 'iframe', 'object', 'embed', 'noscript', 'svg', 'math', 'head', 'title', 'textarea', 'select'];
let parser = null;

/**
 * Parse untrusted HTML into an inert document.
 *
 * @param {string} html HTML.
 * @return {Element|null} Body.
 */
const parse = html => {
  if ('undefined' === typeof window || 'function' !== typeof window.DOMParser) {
    return null;
  }
  if (!parser) {
    parser = new window.DOMParser();
  }
  return parser.parseFromString('<!doctype html><body>' + String(html) + '</body>', 'text/html').body;
};

/**
 * Whitelisted node list (plain objects): { tag, attrs, children } | string.
 *
 * @param {Node} node DOM node.
 * @return {Array} Clean nodes.
 */
const cleanNodes = node => {
  const out = [];
  node.childNodes.forEach(c => {
    if (3 === c.nodeType) {
      out.push(c.nodeValue);
      return;
    }
    if (1 !== c.nodeType) {
      return;
    }
    const tag = c.tagName.toLowerCase();
    if (DROP_WITH_CONTENT.includes(tag)) {
      return;
    }
    const children = cleanNodes(c);
    if (!Object.prototype.hasOwnProperty.call(ALLOWED_TAGS, tag)) {
      out.push(...children); // Unwrap unknown tags, keep their (clean) content.
      return;
    }
    const attrs = {};
    ALLOWED_TAGS[tag].forEach(name => {
      const v = c.getAttribute(name);
      if (null === v) {
        return;
      }
      if ('href' === name) {
        const h = url(v, LINK_PROTOCOLS);
        if (h) {
          attrs.href = h;
        }
      } else if ('target' === name) {
        if (/^_(blank|self|parent|top)$/.test(v)) {
          attrs.target = v;
        }
      } else if ('rel' === name) {
        const rel = v.toLowerCase().split(/\s+/).filter(r => /^[a-z-]+$/.test(r)).join(' ');
        if (rel) {
          attrs.rel = rel;
        }
      }
    });
    if ('a' === tag && '_blank' === attrs.target) {
      const rel = new Set((attrs.rel || '').split(' ').filter(Boolean));
      rel.add('noopener');
      attrs.rel = [...rel].join(' ');
    }
    out.push({
      tag,
      attrs,
      children
    });
  });
  return out;
};
const isBlock = n => n && 'object' === typeof n && BLOCK_TAGS.includes(n.tag);

/**
 * wpautop()-like grouping: runs of inline content become paragraphs (blank lines split them,
 * single newlines become <br>); block elements stay as they are.
 *
 * @param {Array} nodes Clean nodes.
 * @return {Array} Nodes.
 */
const autop = nodes => {
  const out = [];
  let run = [];
  const flush = () => {
    // Split the inline run on blank lines inside text nodes.
    const paras = [[]];
    run.forEach(n => {
      if ('string' === typeof n) {
        const parts = n.replace(/\r\n?/g, '\n').split(/\n[ \t]*\n+/);
        parts.forEach((p, i) => {
          if (i > 0) {
            paras.push([]);
          }
          paras[paras.length - 1].push(p);
        });
      } else {
        paras[paras.length - 1].push(n);
      }
    });
    paras.forEach(p => {
      // Trim leading/trailing whitespace of the paragraph.
      while (p.length && 'string' === typeof p[0] && '' === p[0].trim()) {
        p.shift();
      }
      while (p.length && 'string' === typeof p[p.length - 1] && '' === p[p.length - 1].trim()) {
        p.pop();
      }
      if (!p.length) {
        return;
      }
      if ('string' === typeof p[0]) {
        p[0] = p[0].replace(/^\s+/, '');
      }
      if ('string' === typeof p[p.length - 1]) {
        p[p.length - 1] = p[p.length - 1].replace(/\s+$/, '');
      }
      const children = [];
      p.forEach(n => {
        if ('string' === typeof n && /\n/.test(n)) {
          n.split('\n').forEach((line, i) => {
            if (i > 0) {
              children.push({
                tag: 'br',
                attrs: {},
                children: []
              });
            }
            children.push(line);
          });
        } else {
          children.push(n);
        }
      });
      out.push({
        tag: 'p',
        attrs: {},
        children
      });
    });
    run = [];
  };
  nodes.forEach(n => {
    if (isBlock(n)) {
      flush();
      // wpautop() also wraps the inline content of a blockquote in paragraphs.
      out.push('blockquote' === n.tag ? {
        ...n,
        children: autop(n.children)
      } : n);
    } else {
      run.push(n);
    }
  });
  flush();
  return out;
};

/**
 * Clean node tree for rich details.
 *
 * @param {string} html Untrusted HTML.
 * @return {Array} Clean nodes (paragraph-grouped).
 */
const cleanHtml = html => {
  const body = parse(html);
  if (!body) {
    return autop([stripTags(html)]);
  }
  return autop(cleanNodes(body));
};

/** Plain text of clean nodes. */
const nodesText = nodes => nodes.map(n => 'string' === typeof n ? n : nodesText(n.children)).join('');

/**
 * React elements from clean nodes.
 *
 * @param {Array}  nodes Clean nodes.
 * @param {string} kp    Key prefix.
 * @return {Array} Elements.
 */
const nodesToReact = (nodes, kp = 'n') => nodes.map((n, i) => {
  if ('string' === typeof n) {
    return n;
  }
  const props = {
    key: kp + i,
    ...n.attrs
  };
  if ('br' === n.tag) {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('br', props);
  }
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(n.tag, props, ...nodesToReact(n.children, kp + i + '-'));
});

/**
 * Plain text → paragraphs (wpautop(esc_html())): blank lines split paragraphs, single newlines become <br>.
 *
 * @param {string} plain Text.
 * @return {Array} Clean nodes.
 */
const textParagraphs = plain => autop([String(plain)]);


/***/ }),

/***/ "./src/Components/Common/Team/themes.js":
/*!**********************************************!*\
  !*** ./src/Components/Common/Team/themes.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TableHead: () => (/* binding */ TableHead),
/* harmony export */   itemRenderer: () => (/* binding */ itemRenderer),
/* harmony export */   tbBadges: () => (/* binding */ tbBadges),
/* harmony export */   tbContacts: () => (/* binding */ tbContacts),
/* harmony export */   tbExtras: () => (/* binding */ tbExtras),
/* harmony export */   tbImage: () => (/* binding */ tbImage),
/* harmony export */   tbPart: () => (/* binding */ tbPart),
/* harmony export */   tbPlainDesignation: () => (/* binding */ tbPlainDesignation),
/* harmony export */   tbPlainName: () => (/* binding */ tbPlainName)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./context */ "./src/Components/Common/Team/context.js");
/* harmony import */ var _registry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./registry */ "./src/Components/Common/Team/registry.js");
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./bridge */ "./src/Components/Common/Team/bridge.js");
/* harmony import */ var _css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./css */ "./src/Components/Common/Team/css.js");
/**
 * Item templates of all themes (ports of templates/themes/*.php). Same markup and class names as the
 * former PHP templates so the theme CSS applies unchanged.
 */






const div = (className, ...children) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
  className
}, ...children);

/* ================================================================== */
/* Registry A helpers (grid / circle / horizontal / flip)              */
/* ================================================================== */

const taPart = (ctx, m, field, ...args) => {
  if (!ctx.show(field)) {
    return null;
  }
  switch (field) {
    case 'name':
      return ctx.name(m, ...args);
    case 'designation':
      return ctx.designation(m);
    case 'details':
      return ctx.details(m);
    case 'social':
      return ctx.social(m, ...args);
    case 'ribbon':
      return ctx.ribbon(m);
    case 'featured_badge':
      return ctx.featuredBadge(m);
    case 'skills':
      return ctx.skills(m);
    case 'vcard':
      return ctx.vcard(m);
    case 'read_more':
      return ctx.readMore(m);
  }
  return null;
};
const taImage = (ctx, m, link = true, flip = false) => {
  if (!ctx.show('thumbnail')) {
    return null;
  }
  let img = flip ? ctx.flipImage(m) : null;
  if (!img) {
    img = ctx.image(m, 'bptm-img', link);
  }
  return img;
};
const taExtras = (ctx, m, variant = 'icons') => {
  const html = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(ctx.metaDetails(m, variant), taPart(ctx, m, 'skills'), taPart(ctx, m, 'vcard'), taPart(ctx, m, 'read_more'));
  return html ? div('bptm-ta-extras', html) : null;
};
const taParts = (ctx, m, nameTag = 'h3') => ({
  img: taImage(ctx, m),
  name: taPart(ctx, m, 'name', nameTag),
  role: taPart(ctx, m, 'designation'),
  desc: taPart(ctx, m, 'details'),
  social: taPart(ctx, m, 'social'),
  badges: (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(taPart(ctx, m, 'ribbon'), taPart(ctx, m, 'featured_badge')),
  extras: taExtras(ctx, m)
});
const taClasses = (ctx, id, family) => {
  const c = ['bptm-ta', 'bptm-ta-' + family, 'bptm-ta-' + id];
  if ('grid' === family || 'circle' === family) {
    c.push('bptm-tap-reveal');
  }
  if (!ctx.show('thumbnail')) {
    c.push('bptm-ta-no-thumb');
  }
  return c;
};
const overlay = () => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
  className: 'bptm-ta-overlay',
  'aria-hidden': 'true'
});
const badgesDiv = b => b ? div('bptm-ta-badges', b) : null;
const taItem = (ctx, m, cls, ...children) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', ctx.itemProps(m, cls), div('bptm-ta-card', ...children));
const gridTheme = id => (ctx, m) => {
  const p = taParts(ctx, m);
  const cls = taClasses(ctx, id, 'grid');
  const wrap = (...c) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: ctx.vis_classes('thumbnail', 'bptm-img-wrap')
  }, ...c);
  switch (id) {
    case 'grid-1':
      return taItem(ctx, m, cls, p.img ? wrap(p.img, overlay(), p.social ? div('bptm-ta-hover', p.social) : null) : null, badgesDiv(p.badges), div('bptm-ta-info', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role, p.desc), !p.img && p.social ? p.social : null, p.extras));
    case 'grid-2':
      return taItem(ctx, m, cls, p.img ? wrap(p.img, overlay(), p.social ? div('bptm-ta-hover', p.social) : null, badgesDiv(p.badges)) : badgesDiv(p.badges), div('bptm-ta-info', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role, p.desc, p.extras), !p.img && p.social ? p.social : null));
    case 'grid-3':
      return taItem(ctx, m, cls, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
        className: ctx.vis_classes('thumbnail', 'bptm-ta-media')
      }, p.img ? wrap(p.img, overlay()) : null, p.social ? div('bptm-ta-share', p.social, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
        className: 'bptm-ta-share-btn',
        'aria-hidden': 'true'
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
        className: 'fas fa-share-alt'
      }))) : null), badgesDiv(p.badges), div('bptm-ta-info', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role, p.desc, p.extras)));
    case 'grid-4':
    case 'grid-5':
      {
        const hover = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.desc, p.extras, p.social);
        // Grid 5 reveals the row with a grid-row (0fr → 1fr) animation: the inner wrapper clips while it
        // grows, and the scroll box inside it keeps the 300px cap (so no scrollbar flashes mid-animation).
        const hoverRow = hover && 'grid-5' === id ? div('bptm-ta-hover', div('bptm-ta-hover-inner', div('bptm-ta-hover-scroll', hover))) : hover && div('bptm-ta-hover', hover);
        return taItem(ctx, m, cls, p.img ? wrap(p.img, overlay()) : null, badgesDiv(p.badges), div('bptm-ta-info', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role), hoverRow || null));
      }
    default:
      // grid-6
      return taItem(ctx, m, cls, p.img ? wrap(p.img) : null, badgesDiv(p.badges), div('bptm-ta-info', div('bptm-ta-info-inner', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role, p.desc, p.extras, p.social))));
  }
};
const circleTheme = id => (ctx, m) => {
  const p = taParts(ctx, m);
  const n = Number(id.slice(-1));
  let hover = null;
  if (n >= 2 && n <= 4) {
    hover = p.social;
  } else if (n >= 5) {
    hover = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.desc, p.social);
  }
  let info;
  if (1 === n) {
    info = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role, p.desc, p.extras, p.social);
  } else if (n <= 4) {
    info = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role, p.desc, p.extras);
  } else {
    info = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role, p.extras);
  }
  return taItem(ctx, m, taClasses(ctx, id, 'circle'), p.img ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: ctx.vis_classes('thumbnail', 'bptm-ta-media')
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: ctx.vis_classes('thumbnail', 'bptm-img-wrap')
  }, p.img, overlay(), hover ? div('bptm-ta-hover', hover) : null)) : null, badgesDiv(p.badges), div('bptm-ta-info', info, !p.img && hover ? div('bptm-ta-static', hover) : null));
};
const horizontalTheme = id => (ctx, m) => {
  const p = taParts(ctx, m);
  return taItem(ctx, m, taClasses(ctx, id, 'horizontal'), p.img ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: ctx.vis_classes('thumbnail', 'bptm-ta-media')
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: ctx.vis_classes('thumbnail', 'bptm-img-wrap')
  }, p.img)) : null, div('bptm-ta-info', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role, p.desc, p.extras, p.social)), badgesDiv(p.badges));
};
const flipTheme = id => (ctx, m) => {
  const p = taParts(ctx, m);
  const cls = taClasses(ctx, id, 'flip');
  const wrap = img => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: ctx.vis_classes('thumbnail', 'bptm-img-wrap')
  }, img);
  if ('flip-5' === id) {
    const avatar = taImage(ctx, m, false);
    const panel = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role, p.desc, p.extras, p.social);
    return taItem(ctx, m, cls, p.img ? wrap(p.img) : null, badgesDiv(p.badges), div('bptm-ta-info', div('bptm-ta-info-inner', avatar ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-ta-avatar',
      'aria-hidden': 'true'
    }, avatar) : null, panel)));
  }
  if ('flip-6' === id) {
    const backImg = taImage(ctx, m, false, true);
    const back = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role, p.desc, p.extras, p.social);
    if (p.img && back) {
      cls.push('bptm-ta-has-flip');
    }
    const nameText = p.name ? m.name : '';
    const roleText = p.role ? m.designation : '';
    return taItem(ctx, m, cls, ...(p.img ? [div('bptm-ta-flipbox', div('bptm-ta-face bptm-ta-front', wrap(p.img), p.name || p.role ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-ta-caption',
      'aria-hidden': 'true'
    }, nameText ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
      className: 'bptm-ta-caption-name'
    }, nameText) : null, roleText ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
      className: 'bptm-ta-caption-role'
    }, roleText) : null) : null, badgesDiv(p.badges)), back ? div('bptm-ta-face bptm-ta-back', (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
      className: 'bptm-ta-back-img',
      'aria-hidden': 'true'
    }, backImg), div('bptm-ta-back-inner', back)) : null)] : [badgesDiv(p.badges), div('bptm-ta-info', div('bptm-ta-static', back))]));
  }
  // flip-1 … flip-4.
  const back = 'flip-4' === id ? (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role, p.desc, p.extras, p.social) : (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.desc, p.extras, p.social);
  const info = 'flip-4' === id ? null : (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(p.name, p.role);
  if (p.img && back) {
    cls.push('bptm-ta-has-flip');
  }
  return taItem(ctx, m, cls, p.img ? div('bptm-ta-flipbox', div('bptm-ta-face bptm-ta-front', wrap(p.img), badgesDiv(p.badges)), back ? div('bptm-ta-face bptm-ta-back', div('bptm-ta-back-inner', back)) : null) : badgesDiv(p.badges), info || !p.img && back ? div('bptm-ta-info', info, !p.img ? div('bptm-ta-static', back) : null) : null);
};

/* ================================================================== */
/* Registry B helpers (tables / lists / legacy)                        */
/* ================================================================== */

const tbPart = taPart;
const tbBadges = (ctx, m) => (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(taPart(ctx, m, 'ribbon'), taPart(ctx, m, 'featured_badge'));
const tbImage = (ctx, m, link = true, force = false) => {
  if (!ctx.show('thumbnail')) {
    return null;
  }
  if (force) {
    const img = ctx.image(m, 'bptm-img', false);
    return img ? ctx.wrapLink(m, img, 'bptm-img-link') : null;
  }
  return ctx.image(m, 'bptm-img', link);
};
const tbPlainName = (ctx, m, tag = 'h3', cls = '') => {
  if (!ctx.show('name') || !m.name) {
    return null;
  }
  tag = ['h2', 'h3', 'h4', 'div', 'span'].includes(tag) ? tag : 'h3';
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)(tag, {
    className: ctx.vis_classes('name', (0,_context__WEBPACK_IMPORTED_MODULE_2__.cx)('bptm-name', cls))
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', ctx.clone ? {} : {
    itemProp: 'name'
  }, m.name));
};
const tbPlainDesignation = (ctx, m, cls = '') => {
  if (!ctx.show('designation') || !m.designation) {
    return null;
  }
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: ctx.vis_classes('designation', (0,_context__WEBPACK_IMPORTED_MODULE_2__.cx)('bptm-designation', cls)),
    ...(ctx.clone ? {} : {
      itemProp: 'jobTitle'
    })
  }, m.designation);
};
const metaRowMap = (ctx, m) => {
  const map = {};
  ctx.metaRows(m).forEach(r => {
    map[r.field] = r;
  });
  return map;
};
const tbContact = (rows, field, withLabel) => {
  const row = rows[field];
  if (!row) {
    return null;
  }
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: 'bptm-contact bptm-contact--' + field.replace(/_/g, '-') + ' ' + row.classes,
    key: field
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
    className: row.icon,
    'aria-hidden': 'true'
  }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
    className: 'bptm-contact-text'
  }, withLabel ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
    className: 'bptm-contact-label'
  }, row.label + ':') : null, withLabel ? ' ' : null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
    className: 'bptm-contact-value'
  }, row.value)));
};
const tbContacts = (ctx, m, fields = null, cls = 'bptm-contacts', withLabel = false) => {
  const rows = metaRowMap(ctx, m);
  const list = (fields || _registry__WEBPACK_IMPORTED_MODULE_3__.META_FIELDS).map(f => tbContact(rows, f, withLabel)).filter(Boolean);
  return list.length ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: cls
  }, ...list) : null;
};
const tbExtras = (ctx, m, exclude = []) => {
  const html = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(tbContacts(ctx, m, _registry__WEBPACK_IMPORTED_MODULE_3__.META_FIELDS.filter(f => !exclude.includes(f)), 'bptm-contacts bptm-meta', true), exclude.includes('skills') ? null : taPart(ctx, m, 'skills'), exclude.includes('vcard') ? null : taPart(ctx, m, 'vcard'), exclude.includes('read_more') ? null : taPart(ctx, m, 'read_more'));
  return html ? div('bptm-tb-extras', html) : null;
};
const tbClasses = (ctx, id, family, extra = []) => {
  const c = ['bptm-tb', 'bptm-tb-' + family, 'bptm-tb-' + id, ...extra];
  if (!ctx.show('thumbnail')) {
    c.push('bptm-tb-no-thumb');
  }
  return c;
};
const tbItem = (ctx, m, cls, ...children) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', ctx.itemProps(m, cls), div('bptm-tb-card', ...children));
const media = (...c) => div('bptm-img-wrap bptm-tb-media', ...c);

/** grid-7 / grid-slider: hover card. */
const tbHoverCard = id => (ctx, m) => {
  const img = tbImage(ctx, m);
  const hover = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(taPart(ctx, m, 'details'), taPart(ctx, m, 'social'));
  return tbItem(ctx, m, tbClasses(ctx, id, 'legacy', ['bptm-tb-hovercard']), img ? media(img, tbBadges(ctx, m), hover ? div('bptm-tb-hover', div('bptm-tb-hover-inner', hover)) : null) : null, div('bptm-tb-info', img ? null : (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(tbBadges(ctx, m), hover), taPart(ctx, m, 'name', 'h3'), taPart(ctx, m, 'designation'), tbExtras(ctx, m)));
};

/** grid-popup / grid-single / grid-filter-popup / grid-filter-selected / grid-panel / grid-drawer-2: overlay card. */
const OVERLAY_ICON = {
  'grid-popup': 'fas fa-expand-alt',
  'grid-single': 'fas fa-external-link-alt',
  'grid-filter-popup': 'fas fa-expand-alt',
  'grid-filter-selected': 'fas fa-expand-alt',
  'grid-panel': 'fas fa-arrow-right',
  'grid-drawer-2': 'fas fa-chevron-down'
};
const tbOverlayCard = id => (ctx, m) => {
  const img = tbImage(ctx, m, false);
  const caption = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(tbPlainName(ctx, m, 'h3'), tbPlainDesignation(ctx, m));
  const lp = ctx.linkProps(m, 'bptm-tb-cover-link');
  const inner = media(img, lp ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
    className: 'bptm-tb-indicator',
    'aria-hidden': 'true'
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
    className: OVERLAY_ICON[id]
  })) : null, caption ? div('bptm-tb-caption', caption) : null);
  return tbItem(ctx, m, tbClasses(ctx, id, 'legacy', ['bptm-tb-overlay-card']), lp ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('a', lp, inner) : inner, tbBadges(ctx, m), (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(taPart(ctx, m, 'details'), tbExtras(ctx, m), taPart(ctx, m, 'social')));
};

/** grid-filter-single / group-filter-1: banner card. */
const tbBannerCard = id => (ctx, m) => {
  const img = tbImage(ctx, m, true, true);
  const caption = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(taPart(ctx, m, 'name', 'h3'), taPart(ctx, m, 'designation'));
  const fields = ['cell_phone', 'email'];
  return tbItem(ctx, m, tbClasses(ctx, id, 'legacy', ['bptm-tb-banner-card']), media(img, tbBadges(ctx, m), caption ? div('bptm-tb-caption', caption) : null), tbContacts(ctx, m, fields, 'bptm-contacts bptm-tb-contact-box'), taPart(ctx, m, 'details'), taPart(ctx, m, 'social'), tbExtras(ctx, m, fields));
};

/** grid-10 / grid-11 / grid-drawer-1: simple card. */
const tbSimpleCard = (id, force = false) => (ctx, m) => {
  const img = force ? tbImage(ctx, m, true, true) : tbImage(ctx, m);
  return tbItem(ctx, m, tbClasses(ctx, id, 'legacy'), img ? media(img, tbBadges(ctx, m)) : null, div('bptm-tb-info', img ? null : tbBadges(ctx, m), taPart(ctx, m, 'name', 'h3'), taPart(ctx, m, 'designation'), taPart(ctx, m, 'details'), taPart(ctx, m, 'social'), tbExtras(ctx, m)));
};
const TB = {
  'grid-7': tbHoverCard('grid-7'),
  'grid-slider': tbHoverCard('grid-slider'),
  'grid-8': (ctx, m) => {
    const img = tbImage(ctx, m, true, true);
    const tip = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(taPart(ctx, m, 'name', 'h3'), taPart(ctx, m, 'designation'));
    return tbItem(ctx, m, tbClasses(ctx, 'grid-8', 'legacy'), img ? media(img, tbBadges(ctx, m)) : null, tip ? div('bptm-tb-tip', tip) : null, (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(taPart(ctx, m, 'details'), tbExtras(ctx, m), taPart(ctx, m, 'social')));
  },
  'grid-9': (ctx, m) => {
    const img = tbImage(ctx, m, true, true);
    const info = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(taPart(ctx, m, 'name', 'h3'), taPart(ctx, m, 'designation'));
    return tbItem(ctx, m, tbClasses(ctx, 'grid-9', 'legacy'), media((0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(img, tbBadges(ctx, m)), info ? div('bptm-tb-infocard', info) : null), (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(taPart(ctx, m, 'details'), tbExtras(ctx, m), taPart(ctx, m, 'social')));
  },
  'grid-10': tbSimpleCard('grid-10'),
  'grid-11': tbSimpleCard('grid-11'),
  'grid-drawer-1': tbSimpleCard('grid-drawer-1', true),
  'grid-12': (ctx, m) => {
    const img = tbImage(ctx, m);
    const more = taPart(ctx, m, 'read_more');
    const social = taPart(ctx, m, 'social');
    return tbItem(ctx, m, tbClasses(ctx, 'grid-12', 'legacy'), img ? media(img, tbBadges(ctx, m)) : null, div('bptm-tb-info', div('bptm-tb-info-top', img ? null : tbBadges(ctx, m), taPart(ctx, m, 'name', 'h3'), taPart(ctx, m, 'designation'), taPart(ctx, m, 'details'), tbExtras(ctx, m, ['read_more'])), more || social ? div('bptm-tb-foot', (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(more, social)) : null));
  },
  'grid-popup': tbOverlayCard('grid-popup'),
  'grid-single': tbOverlayCard('grid-single'),
  'grid-filter-popup': tbOverlayCard('grid-filter-popup'),
  'grid-filter-selected': tbOverlayCard('grid-filter-selected'),
  'grid-panel': tbOverlayCard('grid-panel'),
  'grid-drawer-2': tbOverlayCard('grid-drawer-2'),
  'grid-filter-single': tbBannerCard('grid-filter-single'),
  'group-filter-1': tbBannerCard('group-filter-1'),
  'grid-filter-vcard': (ctx, m) => {
    const img = tbImage(ctx, m, true, true);
    const fields = ['cell_phone', 'email'];
    const vcard = taPart(ctx, m, 'vcard');
    return tbItem(ctx, m, tbClasses(ctx, 'grid-filter-vcard', 'legacy'), img ? media(img, tbBadges(ctx, m)) : null, div('bptm-tb-info', img ? null : tbBadges(ctx, m), taPart(ctx, m, 'name', 'h3'), taPart(ctx, m, 'designation'), tbContacts(ctx, m, fields, 'bptm-contacts bptm-tb-contacts'), taPart(ctx, m, 'details'), taPart(ctx, m, 'social'), tbExtras(ctx, m, [...fields, 'vcard']), vcard ? div('bptm-tb-vcard', vcard) : null));
  }
};
const LIST_CONTACTS = {
  'list-2': ['cell_phone'],
  'list-3': ['email'],
  'list-4': ['email', 'address']
};
const listTheme = id => (ctx, m) => {
  const fields = LIST_CONTACTS[id] || [];
  const img = tbImage(ctx, m, true, true);
  const badges = tbBadges(ctx, m);
  return tbItem(ctx, m, tbClasses(ctx, id, 'list'), img ? media((0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(img, badges)) : null, div('bptm-tb-info', img ? null : badges, taPart(ctx, m, 'name', 'h3'), taPart(ctx, m, 'designation'), taPart(ctx, m, 'details'), tbContacts(ctx, m, fields, 'bptm-contacts bptm-tb-contacts'), taPart(ctx, m, 'social'), tbExtras(ctx, m, fields)));
};

/* ================================================================== */
/* Tables                                                              */
/* ================================================================== */

const columnDefs = () => ({
  thumbnail: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Image', 'bp-team-member'), 'thumbnail'],
  name: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Name', 'bp-team-member'), 'name'],
  designation: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Position', 'bp-team-member'), 'designation'],
  details: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Description', 'bp-team-member'), 'details'],
  company: [(0,_bridge__WEBPACK_IMPORTED_MODULE_4__.t)('company'), 'company'],
  email: [(0,_bridge__WEBPACK_IMPORTED_MODULE_4__.t)('email'), 'email'],
  cell_phone: [(0,_bridge__WEBPACK_IMPORTED_MODULE_4__.t)('cell_phone'), 'cell_phone'],
  land_phone: [(0,_bridge__WEBPACK_IMPORTED_MODULE_4__.t)('land_phone'), 'land_phone'],
  address: [(0,_bridge__WEBPACK_IMPORTED_MODULE_4__.t)('address'), 'address'],
  location: [(0,_bridge__WEBPACK_IMPORTED_MODULE_4__.termLabel)('location'), 'location'],
  social: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Social', 'bp-team-member'), 'social']
});
const tableColumns = id => ['table-9', 'table-10'].includes(id) ? ['thumbnail', 'name', 'designation', 'company', 'email', 'cell_phone', 'land_phone', 'address', 'location', 'social'] : ['thumbnail', 'name', 'designation', 'company', 'details', 'email', 'cell_phone', 'land_phone', 'address', 'location', 'social'];
const visibleColumns = (ctx, id) => {
  const defs = columnDefs();
  const out = tableColumns(id).filter(c => defs[c] && ctx.show(defs[c][1]));
  return out.length ? out : ['name'];
};
const colsClass = n => {
  if (n >= 10) {
    return 'bptm-tb-cols-xl';
  }
  if (n >= 8) {
    return 'bptm-tb-cols-l';
  }
  if (n >= 6) {
    return 'bptm-tb-cols-m';
  }
  return 'bptm-tb-cols-s';
};

/** Table head: optional border <style> + <thead>. */
const TableHead = ({
  ctx,
  id
}) => {
  const defs = columnDefs();
  const cols = visibleColumns(ctx, id);
  const uid = String(ctx.uid || '').replace(/[^A-Za-z0-9_-]/g, '');
  const bw = (0,_css__WEBPACK_IMPORTED_MODULE_5__.length)(ctx.attr('itemBorderWidth', ''));
  const bc = (0,_css__WEBPACK_IMPORTED_MODULE_5__.color)(ctx.attr('itemBorderColor', ''));
  let style = null;
  if (uid && (bw || bc)) {
    const br = (0,_css__WEBPACK_IMPORTED_MODULE_5__.length)(ctx.attr('itemBorderRadius', ''));
    let vars = '--bptm-tb-bw:' + (bw || '1px') + ';--bptm-tb-bc:' + (bc || 'currentColor') + ';';
    if (br) {
      vars += '--bptm-tb-br:' + br + ';';
    }
    vars = vars.replace(/[<>{}]/g, '');
    style = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('style', {
      key: 's'
    }, '.bptm-wrap:has(.bptm-thead[data-bptm-uid="' + uid + '"]){' + vars + '}');
  }
  return [style, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('thead', {
    key: 'h',
    className: 'bptm-thead',
    'data-bptm-cols': String(cols.length),
    ...(uid ? {
      'data-bptm-uid': uid
    } : {})
  }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('tr', null, cols.map(c => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('th', {
    key: c,
    scope: 'col',
    className: ctx.vis_classes(defs[c][1], 'bptm-th bptm-col-' + c.replace(/_/g, '-'))
  }, defs[c][0]))))];
};
const tableCell = (ctx, m, col, id, extra) => {
  const defs = columnDefs();
  const label = defs[col] ? defs[col][0] : '';
  let inner = null;
  let sort = '';
  switch (col) {
    case 'thumbnail':
      {
        const img = tbImage(ctx, m, true, true);
        inner = img ? div('bptm-img-wrap', img) : null;
        break;
      }
    case 'name':
      inner = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(taPart(ctx, m, 'name', 'h3'), tbBadges(ctx, m), tbExtras(ctx, m, tableColumns(id)));
      sort = m.name || '';
      break;
    case 'designation':
      inner = taPart(ctx, m, 'designation');
      sort = m.designation || '';
      break;
    case 'details':
      inner = taPart(ctx, m, 'details');
      break;
    case 'social':
      inner = taPart(ctx, m, 'social');
      break;
    default:
      {
        const row = ctx.metaRows(m).find(r => r.field === col);
        if (row) {
          inner = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
            className: 'bptm-contact bptm-contact--' + col.replace(/_/g, '-')
          }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('i', {
            className: row.icon,
            'aria-hidden': 'true'
          }), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('span', {
            className: 'bptm-contact-value'
          }, row.value));
          sort = row.text || '';
        }
      }
  }
  const content = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(inner, extra);
  const field = defs[col] ? defs[col][1] : col;
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('td', {
    key: col,
    className: ctx.vis_classes(field, 'bptm-td bptm-col-' + col.replace(/_/g, '-') + (inner ? '' : ' bptm-td-empty')),
    'data-label': label,
    ...('' !== sort ? {
      'data-sort-value': sort
    } : {})
  }, content);
};
const tableRow = id => (ctx, m) => {
  const cols = visibleColumns(ctx, id);
  // Tables 9 / 10 have no Description column: the description goes at the end of the name cell (or the first cell).
  let descCol = null;
  let desc = null;
  if (['table-9', 'table-10'].includes(id)) {
    desc = taPart(ctx, m, 'details');
    descCol = cols.includes('name') ? 'name' : cols[0];
  }
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('tr', ctx.itemProps(m, tbClasses(ctx, id, 'table', ['bptm-trow', colsClass(cols.length)])), cols.map(c => tableCell(ctx, m, c, id, c === descCol ? desc : null)));
};

/* ================================================================== */
/* Sidebar                                                             */
/* ================================================================== */

const sidebarTheme = id => (ctx, m) => {
  const img = ctx.image(m, 'bptm-img');
  const badges = (0,_context__WEBPACK_IMPORTED_MODULE_2__.join)(ctx.ribbon(m), ctx.featuredBadge(m));
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', ctx.itemProps(m, ['bptm-sb', 'bptm-sb-' + id, img ? 'bptm-sb-has-img' : 'bptm-sb-no-img']), div('bptm-sb-card bptm-tb-card', img ? (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createElement)('div', {
    className: ctx.vis_classes('thumbnail', 'bptm-img-wrap bptm-sb-media')
  }, img) : null, div('bptm-sb-info', badges, ctx.name(m, 'h4'), ctx.designation(m), ctx.details(m), ctx.metaDetails(m, 'icons'), ctx.skills(m), ctx.social(m, 'small'), ctx.vcard(m), ctx.readMore(m))));
};

/* ================================================================== */

/**
 * Item renderer of a theme: ( ctx, member ) => element.
 *
 * @param {Object} theme Theme.
 * @return {Function} Renderer.
 */
const itemRenderer = theme => {
  const id = theme.id;
  if ('table' === theme.layout) {
    return tableRow(id);
  }
  const fam = (0,_registry__WEBPACK_IMPORTED_MODULE_3__.themeFamily)(id);
  if ('sidebar' === fam) {
    return sidebarTheme(id);
  }
  if ('ta' === fam) {
    if (/^grid-/.test(id)) {
      return gridTheme(id);
    }
    if (/^circle-/.test(id)) {
      return circleTheme(id);
    }
    if (/^horizontal-/.test(id)) {
      return horizontalTheme(id);
    }
    return flipTheme(id);
  }
  if (/^list-/.test(id)) {
    return listTheme(id);
  }
  return TB[id] || TB['grid-10'];
};

/***/ }),

/***/ "./src/style.scss":
/*!************************!*\
  !*** ./src/style.scss ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "./src/Components/Common/Team/socialIcons.json":
/*!*****************************************************!*\
  !*** ./src/Components/Common/Team/socialIcons.json ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"fab fa-42-group":"42.group","fab fa-500px":"500px","fab fa-accessible-icon":"Accessible Icon","fab fa-accusoft":"Accusoft","fab fa-adn":"App.net","fab fa-adversal":"Adversal","fab fa-affiliatetheme":"affiliatetheme","fab fa-airbnb":"Airbnb","fab fa-algolia":"Algolia","fab fa-alipay":"Alipay","fab fa-amazon-pay":"Amazon Pay","fab fa-amazon":"Amazon","fab fa-amilia":"Amilia","fab fa-android":"Android","fab fa-angellist":"AngelList","fab fa-angrycreative":"Angry Creative","fab fa-angular":"Angular","fab fa-app-store-ios":"iOS App Store","fab fa-app-store":"App Store","fab fa-apper":"Apper Systems AB","fab fa-apple-pay":"Apple Pay","fab fa-apple":"Apple","fab fa-artstation":"Artstation","fab fa-asymmetrik":"Asymmetrik, Ltd.","fab fa-atlassian":"Atlassian","fab fa-audible":"Audible","fab fa-autoprefixer":"Autoprefixer","fab fa-avianex":"avianex","fab fa-aviato":"Aviato","fab fa-aws":"Amazon Web Services (AWS)","fab fa-bandcamp":"Bandcamp","fab fa-battle-net":"Battle.net","fab fa-behance":"Behance","fab fa-bilibili":"Bilibili","fab fa-bimobject":"BIMobject","fab fa-bitbucket":"Bitbucket","fab fa-bitcoin":"Bitcoin","fab fa-bity":"Bity","fab fa-black-tie":"Font Awesome Black Tie","fab fa-blackberry":"BlackBerry","fab fa-blogger-b":"Blogger B","fab fa-blogger":"Blogger","fab fa-bluesky":"Bluesky","fab fa-bluetooth-b":"Bluetooth","fab fa-bluetooth":"Bluetooth","fab fa-bootstrap":"Bootstrap","fab fa-bots":"Bots","fab fa-brave-reverse":"Brave Reverse","fab fa-brave":"Brave","fab fa-btc":"BTC","fab fa-buffer":"Buffer","fab fa-buromobelexperte":"Büromöbel-Experte GmbH & Co. KG.","fab fa-buy-n-large":"Buy n Large","fab fa-buysellads":"BuySellAds","fab fa-canadian-maple-leaf":"Canadian Maple Leaf","fab fa-cc-amazon-pay":"Amazon Pay Credit Card","fab fa-cc-amex":"Cc Amex","fab fa-cc-apple-pay":"Apple Pay Credit Card","fab fa-cc-diners-club":"Diner\'s Club Credit Card","fab fa-cc-discover":"Discover Credit Card","fab fa-cc-jcb":"JCB Credit Card","fab fa-cc-mastercard":"MasterCard Credit Card","fab fa-cc-paypal":"Paypal Credit Card","fab fa-cc-stripe":"Stripe Credit Card","fab fa-cc-visa":"Visa Credit Card","fab fa-centercode":"Centercode","fab fa-centos":"Centos","fab fa-chrome":"Chrome","fab fa-chromecast":"Chromecast","fab fa-cloudflare":"Cloudflare","fab fa-cloudscale":"cloudscale.ch","fab fa-cloudsmith":"Cloudsmith","fab fa-cloudversify":"cloudversify","fab fa-cmplid":"Cmplid","fab fa-codepen":"Codepen","fab fa-codiepie":"Codie Pie","fab fa-confluence":"Confluence","fab fa-connectdevelop":"Connect Develop","fab fa-contao":"Contao","fab fa-cotton-bureau":"Cotton Bureau","fab fa-cpanel":"cPanel","fab fa-creative-commons-by":"Creative Commons Attribution","fab fa-creative-commons-nc-eu":"Creative Commons Noncommercial (Euro Sign)","fab fa-creative-commons-nc-jp":"Creative Commons Noncommercial (Yen Sign)","fab fa-creative-commons-nc":"Creative Commons Noncommercial","fab fa-creative-commons-nd":"Creative Commons No Derivative Works","fab fa-creative-commons-pd-alt":"Alternate Creative Commons Public Domain","fab fa-creative-commons-pd":"Creative Commons Public Domain","fab fa-creative-commons-remix":"Creative Commons Remix","fab fa-creative-commons-sa":"Creative Commons Share Alike","fab fa-creative-commons-sampling-plus":"Creative Commons Sampling +","fab fa-creative-commons-sampling":"Creative Commons Sampling","fab fa-creative-commons-share":"Creative Commons Share","fab fa-creative-commons-zero":"Creative Commons CC0","fab fa-creative-commons":"Creative Commons","fab fa-critical-role":"Critical Role","fab fa-css3-alt":"Alternate CSS3 Logo","fab fa-css3":"CSS 3 Logo","fab fa-cuttlefish":"Cuttlefish","fab fa-d-and-d-beyond":"D&D Beyond","fab fa-d-and-d":"Dungeons & Dragons","fab fa-dailymotion":"dailymotion","fab fa-dashcube":"DashCube","fab fa-debian":"Debian","fab fa-deezer":"Deezer","fab fa-delicious":"Delicious","fab fa-deploydog":"deploy.dog","fab fa-deskpro":"Deskpro","fab fa-dev":"DEV","fab fa-deviantart":"deviantART","fab fa-dhl":"DHL","fab fa-diaspora":"Diaspora","fab fa-digg":"Digg Logo","fab fa-digital-ocean":"Digital Ocean","fab fa-discord":"Discord","fab fa-discourse":"Discourse","fab fa-dochub":"DocHub","fab fa-docker":"Docker","fab fa-draft2digital":"Draft2digital","fab fa-dribbble":"Dribbble","fab fa-dropbox":"Dropbox","fab fa-drupal":"Drupal Logo","fab fa-dyalog":"Dyalog","fab fa-earlybirds":"Earlybirds","fab fa-ebay":"eBay","fab fa-edge-legacy":"Edge Legacy Browser","fab fa-edge":"Edge Browser","fab fa-elementor":"Elementor","fab fa-ello":"Ello","fab fa-ember":"Ember","fab fa-empire":"Galactic Empire","fab fa-envira":"Envira Gallery","fab fa-erlang":"Erlang","fab fa-ethereum":"Ethereum","fab fa-etsy":"Etsy","fab fa-evernote":"Evernote","fab fa-expeditedssl":"ExpeditedSSL","fab fa-facebook-f":"Facebook F","fab fa-facebook-messenger":"Facebook Messenger","fab fa-facebook":"Facebook","fab fa-fantasy-flight-games":"Fantasy Flight-games","fab fa-fedex":"FedEx","fab fa-fedora":"Fedora","fab fa-figma":"Figma","fab fa-firefox-browser":"Firefox Browser","fab fa-firefox":"Firefox","fab fa-first-order-alt":"Alternate First Order","fab fa-first-order":"First Order","fab fa-firstdraft":"firstdraft","fab fa-flickr":"Flickr","fab fa-flipboard":"Flipboard","fab fa-fly":"Fly","fab fa-font-awesome":"Font Awesome","fab fa-fonticons-fi":"Fonticons Fi","fab fa-fonticons":"Fonticons","fab fa-fort-awesome-alt":"Alternate Fort Awesome","fab fa-fort-awesome":"Fort Awesome","fab fa-forumbee":"Forumbee","fab fa-foursquare":"Foursquare","fab fa-free-code-camp":"freeCodeCamp","fab fa-freebsd":"FreeBSD","fab fa-fulcrum":"Fulcrum","fab fa-galactic-republic":"Galactic Republic","fab fa-galactic-senate":"Galactic Senate","fab fa-get-pocket":"Get Pocket","fab fa-gg-circle":"GG Currency Circle","fab fa-gg":"GG Currency","fab fa-git-alt":"Git Alt","fab fa-git":"Git","fab fa-github-alt":"Alternate GitHub","fab fa-github":"GitHub","fab fa-gitkraken":"GitKraken","fab fa-gitlab":"GitLab","fab fa-gitter":"Gitter","fab fa-glide-g":"Glide G","fab fa-glide":"Glide","fab fa-gofore":"Gofore","fab fa-golang":"Go","fab fa-goodreads-g":"Goodreads G","fab fa-goodreads":"Goodreads","fab fa-google-drive":"Google Drive","fab fa-google-pay":"Google Pay","fab fa-google-play":"Google Play","fab fa-google-plus-g":"Google Plus G","fab fa-google-plus":"Google Plus","fab fa-google-scholar":"Google Scholar","fab fa-google-wallet":"Google Wallet","fab fa-google":"Google Logo","fab fa-gratipay":"Gratipay (Gittip)","fab fa-grav":"Grav","fab fa-gripfire":"Gripfire, Inc.","fab fa-grunt":"Grunt","fab fa-guilded":"Guilded","fab fa-gulp":"Gulp","fab fa-hacker-news":"Hacker News","fab fa-hackerrank":"Hackerrank","fab fa-hashnode":"Hashnode","fab fa-hips":"Hips","fab fa-hire-a-helper":"HireAHelper","fab fa-hive":"Hive Blockchain Network","fab fa-hooli":"Hooli","fab fa-hornbill":"Hornbill","fab fa-hotjar":"Hotjar","fab fa-houzz":"Houzz","fab fa-html5":"HTML 5 Logo","fab fa-hubspot":"HubSpot","fab fa-ideal":"iDeal","fab fa-imdb":"IMDB","fab fa-instagram":"Instagram","fab fa-instalod":"InstaLOD","fab fa-intercom":"Intercom","fab fa-internet-explorer":"Internet-explorer","fab fa-invision":"InVision","fab fa-ioxhost":"ioxhost","fab fa-itch-io":"itch.io","fab fa-itunes-note":"Itunes Note","fab fa-itunes":"iTunes","fab fa-java":"Java","fab fa-jedi-order":"Jedi Order","fab fa-jenkins":"Jenkis","fab fa-jira":"Jira","fab fa-joget":"Joget","fab fa-joomla":"Joomla Logo","fab fa-js":"JavaScript (JS)","fab fa-jsfiddle":"jsFiddle","fab fa-jxl":"Jxl","fab fa-kaggle":"Kaggle","fab fa-keybase":"Keybase","fab fa-keycdn":"KeyCDN","fab fa-kickstarter-k":"Kickstarter K","fab fa-kickstarter":"Kickstarter","fab fa-korvue":"KORVUE","fab fa-laravel":"Laravel","fab fa-lastfm":"last.fm","fab fa-leanpub":"Leanpub","fab fa-less":"Less","fab fa-letterboxd":"Letterboxd","fab fa-line":"Line","fab fa-linkedin-in":"LinkedIn In","fab fa-linkedin":"LinkedIn","fab fa-linode":"Linode","fab fa-linux":"Linux","fab fa-lyft":"lyft","fab fa-magento":"Magento","fab fa-mailchimp":"Mailchimp","fab fa-mandalorian":"Mandalorian","fab fa-markdown":"Markdown","fab fa-mastodon":"Mastodon","fab fa-maxcdn":"MaxCDN","fab fa-mdb":"Material Design for Bootstrap","fab fa-medapps":"MedApps","fab fa-medium":"Medium","fab fa-medrt":"MRT","fab fa-meetup":"Meetup","fab fa-megaport":"Megaport","fab fa-mendeley":"Mendeley","fab fa-meta":"Meta","fab fa-microblog":"Micro.blog","fab fa-microsoft":"Microsoft","fab fa-mintbit":"Mintbit","fab fa-mix":"Mix","fab fa-mixcloud":"Mixcloud","fab fa-mixer":"Mixer","fab fa-mizuni":"Mizuni","fab fa-modx":"MODX","fab fa-monero":"Monero","fab fa-napster":"Napster","fab fa-neos":"Neos","fab fa-nfc-directional":"NFC Directional","fab fa-nfc-symbol":"Nfc Symbol","fab fa-nimblr":"Nimblr","fab fa-node-js":"Node.js JS","fab fa-node":"Node.js","fab fa-npm":"npm","fab fa-ns8":"NS8","fab fa-nutritionix":"Nutritionix","fab fa-octopus-deploy":"Octopus Deploy","fab fa-odnoklassniki":"Odnoklassniki","fab fa-odysee":"Odysee","fab fa-old-republic":"Old Republic","fab fa-opencart":"OpenCart","fab fa-openid":"OpenID","fab fa-opensuse":"Opensuse","fab fa-opera":"Opera","fab fa-optin-monster":"Optin Monster","fab fa-orcid":"ORCID","fab fa-osi":"Open Source Initiative","fab fa-padlet":"Padlet","fab fa-page4":"page4 Corporation","fab fa-pagelines":"Pagelines","fab fa-palfed":"Palfed","fab fa-patreon":"Patreon","fab fa-paypal":"Paypal","fab fa-perbyte":"PerByte","fab fa-periscope":"Periscope","fab fa-phabricator":"Phabricator","fab fa-phoenix-framework":"Phoenix Framework","fab fa-phoenix-squadron":"Phoenix Squadron","fab fa-php":"PHP","fab fa-pied-piper-alt":"Alternate Pied Piper Logo (Old)","fab fa-pied-piper-hat":"Pied Piper Hat (Old)","fab fa-pied-piper-pp":"Pied Piper PP Logo (Old)","fab fa-pied-piper":"Pied Piper Logo","fab fa-pinterest-p":"Pinterest P","fab fa-pinterest":"Pinterest","fab fa-pix":"Pix","fab fa-pixiv":"Pixiv","fab fa-playstation":"PlayStation","fab fa-product-hunt":"Product Hunt","fab fa-pushed":"Pushed","fab fa-python":"Python","fab fa-qq":"QQ","fab fa-quinscape":"QuinScape","fab fa-quora":"Quora","fab fa-r-project":"R Project","fab fa-raspberry-pi":"Raspberry Pi","fab fa-ravelry":"Ravelry","fab fa-react":"React","fab fa-reacteurope":"ReactEurope","fab fa-readme":"ReadMe","fab fa-rebel":"Rebel Alliance","fab fa-red-river":"red river","fab fa-reddit-alien":"Reddit Alien","fab fa-reddit":"Reddit","fab fa-redhat":"Redhat","fab fa-renren":"Renren","fab fa-replyd":"replyd","fab fa-researchgate":"Researchgate","fab fa-resolving":"Resolving","fab fa-rev":"Rev.io","fab fa-rocketchat":"Rocket.Chat","fab fa-rockrms":"Rockrms","fab fa-rust":"Rust","fab fa-safari":"Safari","fab fa-salesforce":"Salesforce","fab fa-sass":"Sass","fab fa-schlix":"SCHLIX","fab fa-screenpal":"Screenpal","fab fa-scribd":"Scribd","fab fa-searchengin":"Searchengin","fab fa-sellcast":"Sellcast","fab fa-sellsy":"Sellsy","fab fa-servicestack":"Servicestack","fab fa-shirtsinbulk":"Shirts in Bulk","fab fa-shoelace":"Shoelace","fab fa-shopify":"Shopify","fab fa-shopware":"Shopware","fab fa-signal-messenger":"Signal Messenger","fab fa-simplybuilt":"SimplyBuilt","fab fa-sistrix":"SISTRIX","fab fa-sith":"Sith","fab fa-sitrox":"Sitrox","fab fa-sketch":"Sketch","fab fa-skyatlas":"skyatlas","fab fa-skype":"Skype","fab fa-slack":"Slack Logo","fab fa-slideshare":"Slideshare","fab fa-snapchat":"Snapchat","fab fa-soundcloud":"SoundCloud","fab fa-sourcetree":"Sourcetree","fab fa-space-awesome":"Space Awesome","fab fa-speakap":"Speakap","fab fa-speaker-deck":"Speaker Deck","fab fa-spotify":"Spotify","fab fa-square-behance":"Square Behance","fab fa-square-dribbble":"Square Dribbble","fab fa-square-facebook":"Square Facebook","fab fa-square-font-awesome-stroke":"Square Font Awesome Stroke","fab fa-square-font-awesome":"Square Font Awesome","fab fa-square-git":"Square Git","fab fa-square-github":"Square Github","fab fa-square-gitlab":"Square Gitlab","fab fa-square-google-plus":"Square Google Plus","fab fa-square-hacker-news":"Square Hacker News","fab fa-square-instagram":"Square Instagram","fab fa-square-js":"Square Js","fab fa-square-lastfm":"Square Lastfm","fab fa-square-letterboxd":"Square Letterboxd","fab fa-square-odnoklassniki":"Square Odnoklassniki","fab fa-square-pied-piper":"Pied Piper Square Logo (Old)","fab fa-square-pinterest":"Square Pinterest","fab fa-square-reddit":"Square Reddit","fab fa-square-snapchat":"Snapchat Square","fab fa-square-steam":"Square Steam","fab fa-square-threads":"Square Threads","fab fa-square-tumblr":"Square Tumblr","fab fa-square-twitter":"Square Twitter","fab fa-square-upwork":"Square Upwork","fab fa-square-viadeo":"Square Viadeo","fab fa-square-vimeo":"Square Vimeo","fab fa-square-web-awesome-stroke":"Square Web Awesome Stroke","fab fa-square-web-awesome":"Square Web Awesome","fab fa-square-whatsapp":"Square Whatsapp","fab fa-square-x-twitter":"Square X Twitter","fab fa-square-xing":"Square Xing","fab fa-square-youtube":"Square Youtube","fab fa-squarespace":"Squarespace","fab fa-stack-exchange":"Stack Exchange","fab fa-stack-overflow":"Stack Overflow","fab fa-stackpath":"Stackpath","fab fa-staylinked":"StayLinked","fab fa-steam-symbol":"Steam Symbol","fab fa-steam":"Steam","fab fa-sticker-mule":"Sticker Mule","fab fa-strava":"Strava","fab fa-stripe-s":"Stripe S","fab fa-stripe":"Stripe","fab fa-stubber":"Stubber","fab fa-studiovinari":"Studio Vinari","fab fa-stumbleupon-circle":"StumbleUpon Circle","fab fa-stumbleupon":"StumbleUpon Logo","fab fa-superpowers":"Superpowers","fab fa-supple":"Supple","fab fa-suse":"Suse","fab fa-swift":"Swift","fab fa-symfony":"Symfony","fab fa-teamspeak":"Teamspeak","fab fa-telegram":"Telegram","fab fa-tencent-weibo":"Tencent Weibo","fab fa-the-red-yeti":"The Red Yeti","fab fa-themeco":"Themeco","fab fa-themeisle":"ThemeIsle","fab fa-think-peaks":"Think Peaks","fab fa-threads":"Threads","fab fa-tiktok":"TikTok","fab fa-trade-federation":"Trade Federation","fab fa-trello":"Trello","fab fa-tumblr":"Tumblr","fab fa-twitch":"Twitch","fab fa-twitter":"Twitter","fab fa-typo3":"Typo3","fab fa-uber":"Uber","fab fa-ubuntu":"Ubuntu","fab fa-uikit":"UIkit","fab fa-umbraco":"Umbraco","fab fa-uncharted":"Uncharted Software","fab fa-uniregistry":"Uniregistry","fab fa-unity":"Unity 3D","fab fa-unsplash":"Unsplash","fab fa-untappd":"Untappd","fab fa-ups":"UPS","fab fa-upwork":"Upwork","fab fa-usb":"USB","fab fa-usps":"United States Postal Service","fab fa-ussunnah":"us-Sunnah Foundation","fab fa-vaadin":"Vaadin","fab fa-viacoin":"Viacoin","fab fa-viadeo":"Viadeo","fab fa-viber":"Viber","fab fa-vimeo-v":"Vimeo","fab fa-vimeo":"Vimeo","fab fa-vine":"Vine","fab fa-vk":"VK","fab fa-vnv":"VNV","fab fa-vuejs":"Vue.js","fab fa-watchman-monitoring":"Watchman Monitoring","fab fa-waze":"Waze","fab fa-web-awesome":"Web Awesome","fab fa-webflow":"Webflow","fab fa-weebly":"Weebly","fab fa-weibo":"Weibo","fab fa-weixin":"Weixin (WeChat)","fab fa-whatsapp":"What\'s App","fab fa-whmcs":"WHMCS","fab fa-wikipedia-w":"Wikipedia W","fab fa-windows":"Windows","fab fa-wirsindhandwerk":"wirsindhandwerk","fab fa-wix":"Wix","fab fa-wizards-of-the-coast":"Wizards of the Coast","fab fa-wodu":"Wodu","fab fa-wolf-pack-battalion":"Wolf Pack Battalion","fab fa-wordpress-simple":"Wordpress Simple","fab fa-wordpress":"WordPress Logo","fab fa-wpbeginner":"WPBeginner","fab fa-wpexplorer":"WPExplorer","fab fa-wpforms":"WPForms","fab fa-wpressr":"wpressr","fab fa-x-twitter":"X Twitter","fab fa-xbox":"Xbox","fab fa-xing":"Xing","fab fa-y-combinator":"Y Combinator","fab fa-yahoo":"Yahoo Logo","fab fa-yammer":"Yammer","fab fa-yandex-international":"Yandex International","fab fa-yandex":"Yandex","fab fa-yarn":"Yarn","fab fa-yelp":"Yelp","fab fa-yoast":"Yoast","fab fa-youtube":"YouTube","fab fa-zhihu":"Zhihu","fas fa-address-book":"Address Book","fas fa-address-card":"Address Card","fas fa-at":"At","fas fa-blog":"Blog","fas fa-book":"Book","fas fa-book-open":"Book Open","fas fa-briefcase":"Briefcase","fas fa-building":"Building","fas fa-building-user":"Building User","fas fa-bullhorn":"Bullhorn","fas fa-calendar":"Calendar","fas fa-calendar-days":"Calendar Days","fas fa-camera":"Camera","fas fa-certificate":"Certificate","fas fa-chalkboard-user":"Chalkboard User","fas fa-circle-user":"Circle User","fas fa-circle-info":"Circle Info","fas fa-comment":"Comment","fas fa-comments":"Comments","fas fa-comment-dots":"Comment Dots","fas fa-code":"Code","fas fa-compass":"Compass","fas fa-desktop":"Desktop","fas fa-download":"Download","fas fa-earth-americas":"Earth Americas","fas fa-earth-europe":"Earth Europe","fas fa-envelope":"Envelope","fas fa-envelope-open":"Envelope Open","fas fa-envelope-open-text":"Envelope Open Text","fas fa-fax":"Fax","fas fa-file":"File","fas fa-file-lines":"File Lines","fas fa-file-pdf":"File Pdf","fas fa-flag":"Flag","fas fa-gift":"Gift","fas fa-globe":"Globe","fas fa-graduation-cap":"Graduation Cap","fas fa-hashtag":"Hashtag","fas fa-headset":"Headset","fas fa-heart":"Heart","fas fa-house":"House","fas fa-id-badge":"Id Badge","fas fa-id-card":"Id Card","fas fa-image":"Image","fas fa-inbox":"Inbox","fas fa-info":"Info","fas fa-key":"Key","fas fa-laptop":"Laptop","fas fa-laptop-code":"Laptop Code","fas fa-language":"Language","fas fa-link":"Link","fas fa-location-arrow":"Location Arrow","fas fa-location-dot":"Location Dot","fas fa-lock":"Lock","fas fa-map":"Map","fas fa-map-location-dot":"Map Location Dot","fas fa-map-pin":"Map Pin","fas fa-message":"Message","fas fa-microphone":"Microphone","fas fa-mobile":"Mobile","fas fa-mobile-screen":"Mobile Screen","fas fa-mobile-screen-button":"Mobile Screen Button","fas fa-music":"Music","fas fa-newspaper":"Newspaper","fas fa-paper-plane":"Paper Plane","fas fa-paperclip":"Paperclip","fas fa-pen":"Pen","fas fa-pen-nib":"Pen Nib","fas fa-pencil":"Pencil","fas fa-phone":"Phone","fas fa-phone-flip":"Phone Flip","fas fa-phone-volume":"Phone Volume","fas fa-photo-film":"Photo Film","fas fa-podcast":"Podcast","fas fa-print":"Print","fas fa-quote-left":"Quote Left","fas fa-rss":"Rss","fas fa-school":"School","fas fa-share":"Share","fas fa-share-nodes":"Share Nodes","fas fa-square-envelope":"Square Envelope","fas fa-square-phone":"Square Phone","fas fa-square-phone-flip":"Square Phone Flip","fas fa-square-rss":"Square Rss","fas fa-square-share-nodes":"Square Share Nodes","fas fa-star":"Star","fas fa-store":"Store","fas fa-tag":"Tag","fas fa-tags":"Tags","fas fa-trophy":"Trophy","fas fa-tv":"Tv","fas fa-user":"User","fas fa-user-doctor":"User Doctor","fas fa-user-graduate":"User Graduate","fas fa-user-tie":"User Tie","fas fa-users":"Users","fas fa-video":"Video","fas fa-wifi":"Wifi","fas fa-award":"Award","fas fa-bolt":"Bolt","fas fa-bookmark":"Bookmark","fas fa-chart-line":"Chart Line","fas fa-cloud":"Cloud","fas fa-cube":"Cube","fas fa-database":"Database","fas fa-feather":"Feather","fas fa-gamepad":"Gamepad","fas fa-handshake":"Handshake","fas fa-lightbulb":"Lightbulb","fas fa-palette":"Palette","fas fa-puzzle-piece":"Puzzle Piece","fas fa-rocket":"Rocket","fas fa-shield":"Shield","fas fa-shop":"Shop","fas fa-signature":"Signature","fas fa-suitcase":"Suitcase","fas fa-ticket":"Ticket","fas fa-wrench":"Wrench"}');

/***/ }),

/***/ "./src/block.json":
/*!************************!*\
  !*** ./src/block.json ***!
  \************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"tsb/team-members","version":"1.0.0","title":"Team Builder – Grid, List, Carousel & Popup","category":"widgets","description":"Showcase your team beautifully with grid, list, carousel and popup layouts.","keywords":["Team Members","team","member","staff"],"textdomain":"bp-team-member","attributes":{"align":{"type":"string","default":"wide"},"alignment":{"type":"string","default":"center"},"purposeType":{"type":"string","default":"test"},"colors":{"type":"object","default":{"color":"black","bg":"#B1C5A4"}},"members":{"type":"array","default":[{"id":"m1","name":"Sophia Nguyen","designation":"Lead Product Designer","details":"Sophia has spent more than a decade working on product design and design systems. Colleagues know Sophia as a calm problem solver who enjoys mentoring new team members and sharing knowledge across departments.\\n\\nOutside of work Sophia enjoys hiking, photography and good coffee. Ask about the latest side project!","image":{"id":0,"url":"assets/img/team/sophia-nguyen.jpg","alt":"Sophia Nguyen","sizes":{"thumbnail":{"url":"assets/img/team/sophia-nguyen-150x150.jpg","width":150,"height":150},"medium":{"url":"assets/img/team/sophia-nguyen-300x300.jpg","width":300,"height":300},"large":{"url":"assets/img/team/sophia-nguyen.jpg","width":600,"height":600},"full":{"url":"assets/img/team/sophia-nguyen.jpg","width":600,"height":600}}},"flipImage":{"id":0,"url":"","alt":""},"company":"Northwind Collective","companyWebsite":"https://example.com","landPhone":"+1 555 0104","cellPhone":"+1 555 0205","email":"sophia.nguyen@example.com","emailCc":"","emailBcc":"","address":"24 Harbor Avenue, San Francisco","ribbon":"Top Rated","zipCode":"10084","vcard":"","customUrl":"","featured":false,"social":[{"icon":"fab fa-dribbble","link":"https://dribbble.com/sophia.nguyen"},{"icon":"fab fa-behance","link":"https://www.behance.net/sophia.nguyen"},{"icon":"fab fa-linkedin-in","link":"https://www.linkedin.com/in/sophia.nguyen"},{"icon":"fas fa-envelope","link":"mailto:sophia.nguyen@example.com"}],"skills":[{"skill":"UI Design","percent":96},{"skill":"Prototyping","percent":88},{"skill":"User Research","percent":82}],"group":"Design","tags":"Creative, UX","language":"English, Vietnamese","location":"San Francisco","gender":"Female","specialty":"Design","extraOne":"","extraTwo":"","extraThree":"","extraFour":"","extraFive":""},{"id":"m2","name":"Olivia Bennett","designation":"Chief Executive Officer","details":"Olivia has spent more than a decade working on company strategy and growth. Colleagues know Olivia as a calm problem solver who enjoys mentoring new team members and sharing knowledge across departments.\\n\\nOutside of work Olivia enjoys hiking, photography and good coffee. Ask about the latest side project!","image":{"id":0,"url":"assets/img/team/olivia-bennett.jpg","alt":"Olivia Bennett","sizes":{"thumbnail":{"url":"assets/img/team/olivia-bennett-150x150.jpg","width":150,"height":150},"medium":{"url":"assets/img/team/olivia-bennett-300x300.jpg","width":300,"height":300},"large":{"url":"assets/img/team/olivia-bennett.jpg","width":600,"height":600},"full":{"url":"assets/img/team/olivia-bennett.jpg","width":600,"height":600}}},"flipImage":{"id":0,"url":"","alt":""},"company":"Northwind Collective","companyWebsite":"https://example.com","landPhone":"+1 555 0100","cellPhone":"+1 555 0201","email":"olivia.bennett@example.com","emailCc":"","emailBcc":"","address":"10 Harbor Avenue, New York","ribbon":"CEO","zipCode":"10010","vcard":"","customUrl":"","featured":true,"social":[{"icon":"fab fa-linkedin-in","link":"https://www.linkedin.com/in/olivia.bennett"},{"icon":"fab fa-x-twitter","link":"https://x.com/olivia.bennett"},{"icon":"fab fa-facebook-f","link":"https://www.facebook.com/olivia.bennett"},{"icon":"fas fa-envelope","link":"mailto:olivia.bennett@example.com"}],"skills":[{"skill":"Leadership","percent":95},{"skill":"Strategy","percent":90},{"skill":"Public Speaking","percent":85}],"group":"Management","tags":"Leadership","language":"English, French","location":"New York","gender":"Female","specialty":"Strategy","extraOne":"","extraTwo":"","extraThree":"","extraFour":"","extraFive":""},{"id":"m3","name":"Liam Carter","designation":"Chief Technology Officer","details":"Liam has spent more than a decade working on scalable web platforms. Colleagues know Liam as a calm problem solver who enjoys mentoring new team members and sharing knowledge across departments.\\n\\nOutside of work Liam enjoys hiking, photography and good coffee. Ask about the latest side project!","image":{"id":0,"url":"assets/img/team/liam-carter.jpg","alt":"Liam Carter","sizes":{"thumbnail":{"url":"assets/img/team/liam-carter-150x150.jpg","width":150,"height":150},"medium":{"url":"assets/img/team/liam-carter-300x300.jpg","width":300,"height":300},"large":{"url":"assets/img/team/liam-carter.jpg","width":600,"height":600},"full":{"url":"assets/img/team/liam-carter.jpg","width":600,"height":600}}},"flipImage":{"id":0,"url":"","alt":""},"company":"Northwind Collective","companyWebsite":"https://example.com","landPhone":"+1 555 0102","cellPhone":"+1 555 0203","email":"liam.carter@example.com","emailCc":"","emailBcc":"","address":"17 Harbor Avenue, Berlin","ribbon":"CTO","zipCode":"10047","vcard":"","customUrl":"","featured":true,"social":[{"icon":"fab fa-linkedin-in","link":"https://www.linkedin.com/in/liam.carter"},{"icon":"fab fa-github","link":"https://github.com/liam.carter"},{"icon":"fab fa-x-twitter","link":"https://x.com/liam.carter"},{"icon":"fas fa-envelope","link":"mailto:liam.carter@example.com"}],"skills":[{"skill":"Architecture","percent":92},{"skill":"PHP","percent":88},{"skill":"Cloud","percent":80}],"group":"Engineering","tags":"Backend, Leadership","language":"English, German","location":"Berlin","gender":"Male","specialty":"Development","extraOne":"","extraTwo":"","extraThree":"","extraFour":"","extraFive":""},{"id":"m4","name":"Noah Williams","designation":"Senior Frontend Developer","details":"Noah has spent more than a decade working on frontend engineering and accessibility. Colleagues know Noah as a calm problem solver who enjoys mentoring new team members and sharing knowledge across departments.\\n\\nOutside of work Noah enjoys hiking, photography and good coffee. Ask about the latest side project!","image":{"id":0,"url":"assets/img/team/noah-williams.jpg","alt":"Noah Williams","sizes":{"thumbnail":{"url":"assets/img/team/noah-williams-150x150.jpg","width":150,"height":150},"medium":{"url":"assets/img/team/noah-williams-300x300.jpg","width":300,"height":300},"large":{"url":"assets/img/team/noah-williams.jpg","width":600,"height":600},"full":{"url":"assets/img/team/noah-williams.jpg","width":600,"height":600}}},"flipImage":{"id":0,"url":"","alt":""},"company":"Northwind Collective","companyWebsite":"https://example.com","landPhone":"+1 555 0106","cellPhone":"+1 555 0207","email":"noah.williams@example.com","emailCc":"","emailBcc":"","address":"31 Harbor Avenue, London","ribbon":"","zipCode":"10121","vcard":"","customUrl":"","featured":false,"social":[{"icon":"fab fa-github","link":"https://github.com/noah.williams"},{"icon":"fab fa-x-twitter","link":"https://x.com/noah.williams"},{"icon":"fab fa-linkedin-in","link":"https://www.linkedin.com/in/noah.williams"},{"icon":"fas fa-envelope","link":"mailto:noah.williams@example.com"}],"skills":[{"skill":"JavaScript","percent":94},{"skill":"React","percent":90},{"skill":"CSS","percent":86}],"group":"Engineering","tags":"Frontend, JavaScript","language":"English","location":"London","gender":"Male","specialty":"Development","extraOne":"","extraTwo":"","extraThree":"","extraFour":"","extraFive":""},{"id":"m5","name":"Emma Rodriguez","designation":"Marketing Manager","details":"Emma has spent more than a decade working on brand storytelling and digital marketing. Colleagues know Emma as a calm problem solver who enjoys mentoring new team members and sharing knowledge across departments.\\n\\nOutside of work Emma enjoys hiking, photography and good coffee. Ask about the latest side project!","image":{"id":0,"url":"assets/img/team/emma-rodriguez.jpg","alt":"Emma Rodriguez","sizes":{"thumbnail":{"url":"assets/img/team/emma-rodriguez-150x150.jpg","width":150,"height":150},"medium":{"url":"assets/img/team/emma-rodriguez-300x300.jpg","width":300,"height":300},"large":{"url":"assets/img/team/emma-rodriguez.jpg","width":600,"height":600},"full":{"url":"assets/img/team/emma-rodriguez.jpg","width":600,"height":600}}},"flipImage":{"id":0,"url":"","alt":""},"company":"Northwind Collective","companyWebsite":"https://example.com","landPhone":"+1 555 0108","cellPhone":"+1 555 0209","email":"emma.rodriguez@example.com","emailCc":"","emailBcc":"","address":"38 Harbor Avenue, Madrid","ribbon":"New","zipCode":"10158","vcard":"","customUrl":"","featured":false,"social":[{"icon":"fab fa-instagram","link":"https://www.instagram.com/emma.rodriguez"},{"icon":"fab fa-facebook-f","link":"https://www.facebook.com/emma.rodriguez"},{"icon":"fab fa-x-twitter","link":"https://x.com/emma.rodriguez"},{"icon":"fas fa-envelope","link":"mailto:emma.rodriguez@example.com"}],"skills":[{"skill":"SEO","percent":85},{"skill":"Content Strategy","percent":90},{"skill":"Analytics","percent":78}],"group":"Marketing","tags":"Content, Social Media","language":"English, Spanish","location":"Madrid","gender":"Female","specialty":"Marketing","extraOne":"","extraTwo":"","extraThree":"","extraFour":"","extraFive":""},{"id":"m6","name":"James Okafor","designation":"Backend Engineer","details":"James has spent more than a decade working on APIs, databases and automation. Colleagues know James as a calm problem solver who enjoys mentoring new team members and sharing knowledge across departments.\\n\\nOutside of work James enjoys hiking, photography and good coffee. Ask about the latest side project!","image":{"id":0,"url":"assets/img/team/james-okafor.jpg","alt":"James Okafor","sizes":{"thumbnail":{"url":"assets/img/team/james-okafor-150x150.jpg","width":150,"height":150},"medium":{"url":"assets/img/team/james-okafor-300x300.jpg","width":300,"height":300},"large":{"url":"assets/img/team/james-okafor.jpg","width":600,"height":600},"full":{"url":"assets/img/team/james-okafor.jpg","width":600,"height":600}}},"flipImage":{"id":0,"url":"","alt":""},"company":"Northwind Collective","companyWebsite":"https://example.com","landPhone":"+1 555 0110","cellPhone":"+1 555 0211","email":"james.okafor@example.com","emailCc":"","emailBcc":"","address":"45 Harbor Avenue, Lagos","ribbon":"","zipCode":"10195","vcard":"","customUrl":"","featured":false,"social":[{"icon":"fab fa-github","link":"https://github.com/james.okafor"},{"icon":"fab fa-linkedin-in","link":"https://www.linkedin.com/in/james.okafor"},{"icon":"fas fa-envelope","link":"mailto:james.okafor@example.com"}],"skills":[{"skill":"Node.js","percent":88},{"skill":"Databases","percent":84},{"skill":"DevOps","percent":75}],"group":"Engineering","tags":"API, Backend","language":"English, Yoruba","location":"Lagos","gender":"Male","specialty":"Development","extraOne":"","extraTwo":"","extraThree":"","extraFour":"","extraFive":""},{"id":"m7","name":"Ava Schmidt","designation":"HR Specialist","details":"Ava has spent more than a decade working on people operations and company culture. Colleagues know Ava as a calm problem solver who enjoys mentoring new team members and sharing knowledge across departments.\\n\\nOutside of work Ava enjoys hiking, photography and good coffee. Ask about the latest side project!","image":{"id":0,"url":"assets/img/team/ava-schmidt.jpg","alt":"Ava Schmidt","sizes":{"thumbnail":{"url":"assets/img/team/ava-schmidt-150x150.jpg","width":150,"height":150},"medium":{"url":"assets/img/team/ava-schmidt-300x300.jpg","width":300,"height":300},"large":{"url":"assets/img/team/ava-schmidt.jpg","width":600,"height":600},"full":{"url":"assets/img/team/ava-schmidt.jpg","width":600,"height":600}}},"flipImage":{"id":0,"url":"","alt":""},"company":"Northwind Collective","companyWebsite":"https://example.com","landPhone":"+1 555 0112","cellPhone":"+1 555 0213","email":"ava.schmidt@example.com","emailCc":"","emailBcc":"","address":"52 Harbor Avenue, Berlin","ribbon":"","zipCode":"10232","vcard":"","customUrl":"","featured":false,"social":[{"icon":"fab fa-linkedin-in","link":"https://www.linkedin.com/in/ava.schmidt"},{"icon":"fab fa-facebook-f","link":"https://www.facebook.com/ava.schmidt"},{"icon":"fas fa-envelope","link":"mailto:ava.schmidt@example.com"}],"skills":[{"skill":"Recruiting","percent":90},{"skill":"Communication","percent":95},{"skill":"Coaching","percent":80}],"group":"Operations","tags":"Culture, People","language":"English, German","location":"Berlin","gender":"Female","specialty":"Human Resources","extraOne":"","extraTwo":"","extraThree":"","extraFour":"","extraFive":""},{"id":"m8","name":"Lucas Martin","designation":"Customer Success Lead","details":"Lucas has spent more than a decade working on customer success and onboarding. Colleagues know Lucas as a calm problem solver who enjoys mentoring new team members and sharing knowledge across departments.\\n\\nOutside of work Lucas enjoys hiking, photography and good coffee. Ask about the latest side project!","image":{"id":0,"url":"assets/img/team/lucas-martin.jpg","alt":"Lucas Martin","sizes":{"thumbnail":{"url":"assets/img/team/lucas-martin-150x150.jpg","width":150,"height":150},"medium":{"url":"assets/img/team/lucas-martin-300x300.jpg","width":300,"height":300},"large":{"url":"assets/img/team/lucas-martin.jpg","width":600,"height":600},"full":{"url":"assets/img/team/lucas-martin.jpg","width":600,"height":600}}},"flipImage":{"id":0,"url":"","alt":""},"company":"Northwind Collective","companyWebsite":"https://example.com","landPhone":"+1 555 0114","cellPhone":"+1 555 0215","email":"lucas.martin@example.com","emailCc":"","emailBcc":"","address":"59 Harbor Avenue, Paris","ribbon":"Lead","zipCode":"10269","vcard":"","customUrl":"","featured":true,"social":[{"icon":"fab fa-linkedin-in","link":"https://www.linkedin.com/in/lucas.martin"},{"icon":"fab fa-x-twitter","link":"https://x.com/lucas.martin"},{"icon":"fab fa-youtube","link":"https://www.youtube.com/@lucas.martin"},{"icon":"fas fa-envelope","link":"mailto:lucas.martin@example.com"}],"skills":[{"skill":"Customer Care","percent":96},{"skill":"Training","percent":85},{"skill":"Product Knowledge","percent":88}],"group":"Support","tags":"Customer, Leadership","language":"English, French","location":"Paris","gender":"Male","specialty":"Support","extraOne":"","extraTwo":"","extraThree":"","extraFour":"","extraFive":""},{"id":"m9","name":"Mia Tanaka","designation":"UX Researcher","details":"Mia has spent more than a decade working on user research and usability testing. Colleagues know Mia as a calm problem solver who enjoys mentoring new team members and sharing knowledge across departments.\\n\\nOutside of work Mia enjoys hiking, photography and good coffee. Ask about the latest side project!","image":{"id":0,"url":"assets/img/team/mia-tanaka.jpg","alt":"Mia Tanaka","sizes":{"thumbnail":{"url":"assets/img/team/mia-tanaka-150x150.jpg","width":150,"height":150},"medium":{"url":"assets/img/team/mia-tanaka-300x300.jpg","width":300,"height":300},"large":{"url":"assets/img/team/mia-tanaka.jpg","width":600,"height":600},"full":{"url":"assets/img/team/mia-tanaka.jpg","width":600,"height":600}}},"flipImage":{"id":0,"url":"","alt":""},"company":"Northwind Collective","companyWebsite":"https://example.com","landPhone":"+1 555 0116","cellPhone":"+1 555 0217","email":"mia.tanaka@example.com","emailCc":"","emailBcc":"","address":"66 Harbor Avenue, Tokyo","ribbon":"","zipCode":"10306","vcard":"","customUrl":"","featured":false,"social":[{"icon":"fab fa-linkedin-in","link":"https://www.linkedin.com/in/mia.tanaka"},{"icon":"fab fa-dribbble","link":"https://dribbble.com/mia.tanaka"},{"icon":"fab fa-instagram","link":"https://www.instagram.com/mia.tanaka"},{"icon":"fas fa-envelope","link":"mailto:mia.tanaka@example.com"}],"skills":[{"skill":"Interviews","percent":92},{"skill":"Usability Testing","percent":89},{"skill":"Data Analysis","percent":76}],"group":"Design","tags":"Research, UX","language":"English, Japanese","location":"Tokyo","gender":"Female","specialty":"Design","extraOne":"","extraTwo":"","extraThree":"","extraFour":"","extraFive":""},{"id":"m10","name":"Ethan Brooks","designation":"Sales Executive","details":"Ethan has spent more than a decade working on business development and partnerships. Colleagues know Ethan as a calm problem solver who enjoys mentoring new team members and sharing knowledge across departments.\\n\\nOutside of work Ethan enjoys hiking, photography and good coffee. Ask about the latest side project!","image":{"id":0,"url":"assets/img/team/ethan-brooks.jpg","alt":"Ethan Brooks","sizes":{"thumbnail":{"url":"assets/img/team/ethan-brooks-150x150.jpg","width":150,"height":150},"medium":{"url":"assets/img/team/ethan-brooks-300x300.jpg","width":300,"height":300},"large":{"url":"assets/img/team/ethan-brooks.jpg","width":600,"height":600},"full":{"url":"assets/img/team/ethan-brooks.jpg","width":600,"height":600}}},"flipImage":{"id":0,"url":"","alt":""},"company":"Northwind Collective","companyWebsite":"https://example.com","landPhone":"+1 555 0118","cellPhone":"+1 555 0219","email":"ethan.brooks@example.com","emailCc":"","emailBcc":"","address":"73 Harbor Avenue, Toronto","ribbon":"","zipCode":"10343","vcard":"","customUrl":"","featured":false,"social":[{"icon":"fab fa-linkedin-in","link":"https://www.linkedin.com/in/ethan.brooks"},{"icon":"fab fa-facebook-f","link":"https://www.facebook.com/ethan.brooks"},{"icon":"fab fa-x-twitter","link":"https://x.com/ethan.brooks"},{"icon":"fas fa-envelope","link":"mailto:ethan.brooks@example.com"}],"skills":[{"skill":"Negotiation","percent":91},{"skill":"CRM","percent":84},{"skill":"Presentations","percent":87}],"group":"Sales","tags":"Business, Customer","language":"English","location":"Toronto","gender":"Male","specialty":"Sales","extraOne":"","extraTwo":"","extraThree":"","extraFour":"","extraFive":""}]},"theme":{"type":"string","default":"grid-5"},"carouselEnabled":{"type":"boolean","default":false},"filterEnabled":{"type":"boolean","default":false},"filterType":{"type":"string","default":"normal-filter"},"columns":{"type":"object","default":{"desktop":4,"tablet":3,"mobilePortrait":2,"mobile":1}},"columnGap":{"type":"number","default":30},"rowGap":{"type":"number","default":30},"linkType":{"type":"string","default":"default"},"nameIsLinked":{"type":"boolean","default":true},"linkPreviewImage":{"type":"boolean","default":false},"linkTarget":{"type":"string","default":"_self"},"popupStyle":{"type":"string","default":"default"},"popupColumns":{"type":"string","default":"two"},"panelStyle":{"type":"string","default":"default"},"panelPosition":{"type":"string","default":"right"},"drawerStyle":{"type":"string","default":"default"},"thumbnailSize":{"type":"string","default":"large"},"imageFilter":{"type":"string","default":"none"},"hoverImageFilter":{"type":"string","default":"none"},"visibility":{"type":"object","default":{}},"detailsLength":{"type":"number","default":100},"allowHtmlDetails":{"type":"boolean","default":false},"descScrollControl":{"type":"boolean","default":true},"maxScrollHeight":{"type":"string","default":""},"detailsAreaHeight":{"type":"boolean","default":false},"enableScrollAnimation":{"type":"boolean","default":true},"enableFeaturing":{"type":"boolean","default":false},"showAcfFields":{"type":"boolean","default":false},"acfFieldsPosition":{"type":"string","default":"after_skills"},"numberOfMembers":{"type":"number","default":-1},"orderBy":{"type":"string","default":"default"},"order":{"type":"string","default":"ASC"},"taxonomyOrderBy":{"type":"string","default":"name"},"taxonomyOrder":{"type":"string","default":"ASC"},"taxonomyHideEmpty":{"type":"boolean","default":false},"includeGroups":{"type":"array","default":[]},"excludeGroups":{"type":"array","default":[]},"includeTags":{"type":"array","default":[]},"includeLocations":{"type":"array","default":[]},"includeLanguages":{"type":"array","default":[]},"includeSpecialties":{"type":"array","default":[]},"includeGenders":{"type":"array","default":[]},"includeExtraOne":{"type":"array","default":[]},"includeExtraTwo":{"type":"array","default":[]},"includeExtraThree":{"type":"array","default":[]},"includeExtraFour":{"type":"array","default":[]},"includeExtraFive":{"type":"array","default":[]},"searchByName":{"type":"boolean","default":true},"searchByZip":{"type":"boolean","default":true},"searchByTag":{"type":"boolean","default":false},"searchByCompany":{"type":"boolean","default":false},"filterByDesignation":{"type":"boolean","default":true},"filterByLocation":{"type":"boolean","default":true},"filterByLanguage":{"type":"boolean","default":true},"filterByGender":{"type":"boolean","default":true},"filterBySpecialty":{"type":"boolean","default":true},"filterByExtraOne":{"type":"boolean","default":false},"filterByExtraTwo":{"type":"boolean","default":false},"filterByExtraThree":{"type":"boolean","default":false},"filterByExtraFour":{"type":"boolean","default":false},"filterByExtraFive":{"type":"boolean","default":false},"enableClearFilters":{"type":"boolean","default":false},"enableMultiSelect":{"type":"boolean","default":false},"multiSelectEllipsis":{"type":"boolean","default":false},"filterAllEnabled":{"type":"boolean","default":true},"enableChildCats":{"type":"boolean","default":false},"filterAllText":{"type":"string","default":"All"},"filterColumns":{"type":"string","default":"two"},"filterCatPosition":{"type":"string","default":"center"},"filterStyle":{"type":"string","default":"default"},"paginationEnabled":{"type":"boolean","default":false},"paginationType":{"type":"string","default":"normal-pagination"},"initialItems":{"type":"number","default":6},"perPage":{"type":"number","default":6},"loadPerClick":{"type":"number","default":3},"perLoad":{"type":"number","default":3},"loadButtonText":{"type":"string","default":"Load More"},"carouselAutoplay":{"type":"boolean","default":true},"carouselAutoplayHoverPause":{"type":"boolean","default":true},"carouselLoop":{"type":"boolean","default":true},"carouselSpeed":{"type":"number","default":1000},"carouselAutoplayTimeout":{"type":"number","default":2500},"carouselItemsToScroll":{"type":"number","default":1},"carouselNavsEnabled":{"type":"boolean","default":true},"carouselDotsEnabled":{"type":"boolean","default":true},"carouselNavsStyle":{"type":"string","default":"default"},"carouselDotsStyle":{"type":"string","default":"default"},"nameColor":{"type":"string","default":""},"nameBg":{"type":"string","default":""},"roleColor":{"type":"string","default":""},"descriptionColor":{"type":"string","default":""},"descriptionLinkColor":{"type":"string","default":""},"infoColor":{"type":"string","default":""},"infoIconColor":{"type":"string","default":""},"infoLabelColor":{"type":"string","default":""},"infoBg":{"type":"string","default":""},"itemBg":{"type":"string","default":""},"itemBgHover":{"type":"string","default":""},"tooltipBg":{"type":"string","default":""},"hoverIconBg":{"type":"string","default":""},"ribbonBg":{"type":"string","default":""},"popupBg":{"type":"string","default":""},"popupCloseColor":{"type":"string","default":""},"popupCloseBg":{"type":"string","default":""},"popupCloseHoverColor":{"type":"string","default":""},"popupCloseHoverBg":{"type":"string","default":""},"popupCloseIconSize":{"type":"string","default":"20px"},"popupCloseSize":{"type":"string","default":"40px"},"popupCloseRadius":{"type":"string","default":"50%"},"popupArrowColor":{"type":"string","default":""},"popupNavBg":{"type":"string","default":""},"popupNavBorderColor":{"type":"string","default":""},"popupNavHoverColor":{"type":"string","default":""},"popupNavHoverBg":{"type":"string","default":""},"popupNavHoverBorderColor":{"type":"string","default":""},"popupNavRadius":{"type":"string","default":"50px"},"popupNavIconSize":{"type":"string","default":"14px"},"popupNavTypography":{"type":"object","default":{}},"accentColor":{"type":"string","default":""},"sliderNavColor":{"type":"string","default":""},"sliderNavBg":{"type":"string","default":""},"sliderNavHoverColor":{"type":"string","default":""},"sliderNavHoverBg":{"type":"string","default":""},"sliderDotColor":{"type":"string","default":""},"sliderDotHoverColor":{"type":"string","default":""},"filterTextColor":{"type":"string","default":""},"filterActiveTextColor":{"type":"string","default":""},"filterBgColor":{"type":"string","default":""},"filterActiveBgColor":{"type":"string","default":""},"filterBorderColor":{"type":"string","default":""},"filterActiveBorderColor":{"type":"string","default":""},"nameTypography":{"type":"object","default":{}},"roleTypography":{"type":"object","default":{}},"detailsTypography":{"type":"object","default":{}},"infoTypography":{"type":"object","default":{}},"ribbonTypography":{"type":"object","default":{}},"readmoreTypography":{"type":"object","default":{}},"itemPadding":{"type":"object","default":{}},"itemBorderRadius":{"type":"string","default":""},"itemShadow":{"type":"string","default":""},"itemShadowList":{"type":"array","default":[]},"itemBorderColor":{"type":"string","default":""},"itemBorderWidth":{"type":"string","default":""},"imageBorderRadius":{"type":"string","default":""},"pgColor":{"type":"string","default":""},"pgBg":{"type":"string","default":""},"pgBorderColor":{"type":"string","default":""},"pgHoverColor":{"type":"string","default":""},"pgHoverBg":{"type":"string","default":""},"pgHoverBorderColor":{"type":"string","default":""},"pgActiveColor":{"type":"string","default":""},"pgActiveBg":{"type":"string","default":""},"pgActiveBorderColor":{"type":"string","default":""},"pgBorderWidth":{"type":"string","default":""},"pgBorderRadius":{"type":"string","default":""},"lmColor":{"type":"string","default":""},"lmBg":{"type":"string","default":""},"lmBorderColor":{"type":"string","default":""},"lmHoverColor":{"type":"string","default":""},"lmHoverBg":{"type":"string","default":""},"lmBorderWidth":{"type":"string","default":""},"lmBorderRadius":{"type":"string","default":""},"pgLoaderColor":{"type":"string","default":""},"pgPadding":{"type":"object","default":{}},"lmPadding":{"type":"object","default":{}},"socialIconColor":{"type":"string","default":""},"socialIconHoverColor":{"type":"string","default":""},"socialBg":{"type":"string","default":""},"socialHoverBg":{"type":"string","default":""},"socialBorderColor":{"type":"string","default":""},"socialHoverBorderColor":{"type":"string","default":""},"socialIconSize":{"type":"string","default":""},"socialSize":{"type":"string","default":""},"socialBorderWidth":{"type":"string","default":""},"socialRadius":{"type":"string","default":""},"socialGap":{"type":"string","default":""},"featuredColor":{"type":"string","default":""},"featuredBg":{"type":"string","default":""},"featuredBorderColor":{"type":"string","default":""},"featuredBorderWidth":{"type":"string","default":""},"featuredSize":{"type":"string","default":""},"featuredIconSize":{"type":"string","default":""},"featuredRadius":{"type":"string","default":""}},"supports":{"align":["wide","full"],"html":false,"anchor":true,"customClassName":true},"example":{"attributes":{}},"editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./view.css","render":"file:./render.php","viewScript":"file:./view.js"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.scss */ "./src/style.scss");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Components_Common_Team_TeamMembers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Components/Common/Team/TeamMembers */ "./src/Components/Common/Team/TeamMembers.js");
/**
 * Team Builder – Grid, List, Carousel & Popup front end (block viewScript + style).
 *
 * src/render.php prints only a wrapper `<div class="wp-block-tsb-team-members …" data-bptm-uid data-attributes="{json}">`;
 * this script renders the block in the browser from those attributes with React (the same component the editor uses).
 *
 * window.BPTM.init( root = document ) mounts every not-yet-mounted block inside root (page builders call it
 * after injecting markup). window.BPTM.get( el ) returns { attributes } of a mounted block.
 */



const SELECTOR = '.wp-block-tsb-team-members[data-attributes]';
const mounted = new Map();
const randomUid = () => Math.random().toString(16).slice(2, 10);
function mount(el) {
  if (mounted.has(el)) {
    return;
  }
  let attributes = {};
  try {
    attributes = JSON.parse(el.getAttribute('data-attributes') || '{}') || {};
  } catch (e) {
    attributes = {};
  }
  if (!attributes || 'object' !== typeof attributes || Array.isArray(attributes)) {
    attributes = {};
  }
  const uid = String(el.getAttribute('data-bptm-uid') || randomUid()).replace(/[^a-z0-9-]/gi, '').toLowerCase() || randomUid();
  const domId = el.id || 'bptm-' + uid;
  const wrapperClass = el.className;
  const root = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createRoot)(el);
  mounted.set(el, {
    root,
    attributes
  });
  root.render((0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(_Components_Common_Team_TeamMembers__WEBPACK_IMPORTED_MODULE_2__["default"], {
    attributes,
    uid,
    domId,
    host: el,
    wrapperClass
  }));
}
function init(scope) {
  // Roots whose element left the document (builder previews re-render): unmount.
  mounted.forEach((rec, el) => {
    if (!el.isConnected) {
      rec.root.unmount();
      mounted.delete(el);
    }
  });
  const ctx = scope && 'function' === typeof scope.querySelectorAll ? scope : document;
  const els = Array.from(ctx.querySelectorAll(SELECTOR));
  if (ctx.matches && ctx.matches(SELECTOR)) {
    els.unshift(ctx);
  }
  els.forEach(el => {
    try {
      mount(el);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Team Builder – Grid, List, Carousel & Popup:', e);
    }
  });
  return els;
}
const api = window.BPTM && 'object' === typeof window.BPTM ? window.BPTM : {};
api.init = init;
api.get = el => {
  const rec = mounted.get(el);
  return rec ? {
    attributes: rec.attributes
  } : null;
};
window.BPTM = api;
if ('loading' === document.readyState) {
  document.addEventListener('DOMContentLoaded', () => init(document));
} else {
  init(document);
}
/******/ })()
;
//# sourceMappingURL=view.js.map