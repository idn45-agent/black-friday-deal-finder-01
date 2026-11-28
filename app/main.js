// The Deal Ledger: a Black Friday deal finder. The deals live in data.js,
// so the site needs no network to show them; each deal links out to its
// store. Routes: #/ the list (search + filters + sort), #/deal/<id> one
// deal. Saved deals live in localStorage on this browser only.
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { deals } from './data.js';
import { applyFilters, defaultFilterState } from './filters.js';
import { renderDetail, renderList, renderNotFound, renderStats, renderToolbar } from './views.js';

const SAVE_KEY = 'deal-ledger-saved-v2';

const statsEl = document.getElementById('stats');
const toolbarEl = document.getElementById('toolbar');
const viewEl = document.getElementById('view');

const state = defaultFilterState();

export function loadSaved() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function storeSaved(saved) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify([...saved]));
  } catch {
    // A browser that blocks storage still shows the site; saving just
    // does not persist.
  }
}

const savedIds = loadSaved();

function toggleSave(id) {
  if (savedIds.has(id)) savedIds.delete(id);
  else savedIds.add(id);
  storeSaved(savedIds);
}

function render() {
  window.__shotReady = false;
  statsEl.innerHTML = renderStats();
  toolbarEl.innerHTML = renderToolbar(state);
  const match = location.hash.match(/^#\/deal\/([^/?#]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = (found ? found.title : 'Not found') + ' | The Deal Ledger';
    viewEl.innerHTML = found ? renderDetail(found, savedIds) : renderNotFound(match[1]);
  } else {
    document.title = 'The Deal Ledger — Black Friday deals, checked 27–28 Nov 2026';
    viewEl.innerHTML = renderList(applyFilters(deals, state, savedIds), state, savedIds);
  }
  wireControls();
  window.__shotReady = true;
}

function wireControls() {
  const q = document.getElementById('q');
  if (q) {
    q.addEventListener('input', () => {
      state.query = q.value;
      refreshListOnly();
    });
  }
  const store = document.getElementById('store');
  if (store) store.addEventListener('change', () => {
    state.store = store.value;
    render();
  });
  const minpct = document.getElementById('minpct');
  if (minpct) minpct.addEventListener('change', () => {
    state.minPct = Number(minpct.value);
    render();
  });
  const sort = document.getElementById('sort');
  if (sort) sort.addEventListener('change', () => {
    state.sort = sort.value;
    render();
  });
  const savedOnly = document.getElementById('saved-only');
  if (savedOnly) savedOnly.addEventListener('click', () => {
    state.savedOnly = !state.savedOnly;
    render();
  });
  toolbarEl.querySelectorAll('[data-cat]').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.category = chip.getAttribute('data-cat');
      render();
    });
  });
  const clear = document.getElementById('clear-filters');
  if (clear) clear.addEventListener('click', () => {
    Object.assign(state, defaultFilterState());
    render();
  });
  viewEl.querySelectorAll('[data-save]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      toggleSave(btn.getAttribute('data-save'));
      render();
    });
  });
}

// Typing in the search box re-renders the list but keeps the focus in the
// box: rebuilding the toolbar would drop it.
function refreshListOnly() {
  viewEl.innerHTML = renderList(applyFilters(deals, state, savedIds), state, savedIds);
  viewEl.querySelectorAll('[data-save]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      toggleSave(btn.getAttribute('data-save'));
      render();
    });
  });
}

window.addEventListener('hashchange', render);
render();
