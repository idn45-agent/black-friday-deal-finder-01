// Search, filter and sort state. One plain object holds what the shopper
// asked for; applyFilters turns it into the visible list. Nothing here
// touches the page — views.js does the rendering.

import { dealScore, discountPct, dollarsSaved } from './score.js';

export function defaultFilterState() {
  return { query: '', category: 'All', store: 'All', minPct: 0, sort: 'best', savedOnly: false };
}

export const SORTS = {
  best: 'Best deals first',
  pct: 'Biggest discount %',
  saved: 'Biggest $ saved',
  price: 'Lowest price',
  name: 'Name A–Z',
};

const SORT_FNS = {
  best: (a, b) => dealScore(b) - dealScore(a),
  pct: (a, b) => discountPct(b) - discountPct(a) || dollarsSaved(b) - dollarsSaved(a),
  saved: (a, b) => dollarsSaved(b) - dollarsSaved(a) || discountPct(b) - discountPct(a),
  price: (a, b) => a.price - b.price,
  name: (a, b) => a.title.localeCompare(b.title),
};

export function applyFilters(deals, state, savedIds) {
  const q = state.query.trim().toLowerCase();
  const visible = deals.filter((d) => {
    if (state.savedOnly && !savedIds.has(d.id)) return false;
    if (state.category !== 'All' && d.category !== state.category) return false;
    if (state.store !== 'All' && d.store !== state.store) return false;
    if (discountPct(d) < state.minPct) return false;
    if (q) {
      const hay = (d.title + ' ' + d.store + ' ' + d.category).toLowerCase();
      if (!q.split(/\s+/).every((word) => hay.includes(word))) return false;
    }
    return true;
  });
  return [...visible].sort(SORT_FNS[state.sort] || SORT_FNS.best);
}

// A one-line summary of what is showing, for the results count.
export function filterSummary(state, shown, total) {
  const parts = [];
  if (state.query) parts.push('matching “' + state.query + '”');
  if (state.category !== 'All') parts.push('in ' + state.category);
  if (state.store !== 'All') parts.push('at ' + state.store);
  if (state.minPct > 0) parts.push(state.minPct + '% off or more');
  if (state.savedOnly) parts.push('saved only');
  const what = parts.length ? parts.join(', ') : 'all deals';
  return shown + ' of ' + total + ' deals — ' + what;
}
