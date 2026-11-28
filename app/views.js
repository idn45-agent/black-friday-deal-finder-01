// Page rendering. Every card, list and detail page is built here from the
// deal data — the HTML file only holds the shell. Prices, discounts and
// verdicts all come from score.js, so the screen can never disagree with
// the data.

import { CHECKED_LABEL, deals } from './data.js';
import {
  VERDICT_LABEL,
  dealTotals,
  discountPct,
  dollarsSaved,
  formatMoney,
  listCategories,
  listStores,
  sameProduct,
} from './score.js';
import { SORTS, filterSummary } from './filters.js';

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function verdictBadge(signal) {
  return '<span class="verdict verdict-' + signal + '">' + VERDICT_LABEL[signal] + '</span>';
}

export function storeChip(store) {
  return '<span class="store">' + esc(store) + '</span>';
}

// One deal card: product, store, verdict, sale price, usual price, cut,
// dollars saved, the honest evidence, where the price was read, and the
// store link. The card title links to its detail page; the heart and the
// store link are separate controls inside it.
export function dealCard(deal, saved) {
  const pct = discountPct(deal);
  const save = dollarsSaved(deal);
  const heart = saved ? '♥ Saved' : '♡ Save';
  return (
    '<article class="card">' +
    '<div class="card-top">' +
    storeChip(deal.store) +
    '<span class="cat">' + esc(deal.category) + '</span>' +
    '<button class="save" data-save="' + deal.id + '" aria-pressed="' + saved + '">' + heart + '</button>' +
    '</div>' +
    '<h3 class="card-title"><a href="#/deal/' + deal.id + '">' + esc(deal.title) + '</a></h3>' +
    '<div class="card-verdict">' + verdictBadge(deal.signal) + '</div>' +
    '<div class="price-row">' +
    '<span class="price">' + formatMoney(deal.price, deal.monthly) + '</span>' +
    '<span class="was">' + formatMoney(deal.was, deal.monthly) + '</span>' +
    '<span class="pct">−' + pct + '%</span>' +
    '</div>' +
    '<p class="save-line">You save ' + formatMoney(save, deal.monthly) + '</p>' +
    '<p class="evidence">' + esc(deal.evidence) + '</p>' +
    '<p class="provenance">Checked ' + esc(CHECKED_LABEL) + ' · ' + esc(deal.source) + '</p>' +
    '<a class="deal-link" href="' + esc(deal.url) + '" target="_blank" rel="noopener">View deal at ' + esc(deal.store) + ' →</a>' +
    '</article>'
  );
}

// The stats strip under the masthead: how many deals, how many stores,
// how much a shopper saves in total, the average cut, and when prices
// were checked.
export function renderStats() {
  const t = dealTotals(deals);
  return (
    '<div class="stat"><strong>' + t.total + '</strong><span>deals checked</span></div>' +
    '<div class="stat"><strong>' + t.stores + '</strong><span>stores</span></div>' +
    '<div class="stat"><strong>' + t.newLows + '</strong><span>new all-time lows</span></div>' +
    '<div class="stat"><strong>' + t.avgPct + '%</strong><span>average discount</span></div>' +
    '<div class="stat"><strong>$' + t.saved.toLocaleString('en-US') + '</strong><span>total savings</span></div>' +
    '<div class="stat stat-checked"><strong>' + esc(CHECKED_LABEL) + '</strong><span>prices checked</span></div>'
  );
}

// Search box, category chips, store and discount filters, sort order and
// the saved-only toggle. Every control works; there is no placeholder.
export function renderToolbar(state) {
  const cats = ['All', ...listCategories(deals)];
  const stores = ['All', ...listStores(deals)];
  const chips = cats
    .map(
      (c) =>
        '<button class="chip' + (state.category === c ? ' active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>',
    )
    .join('');
  const storeOptions = stores
    .map((s) => '<option value="' + esc(s) + '"' + (state.store === s ? ' selected' : '') + '>' + esc(s) + '</option>')
    .join('');
  const sortOptions = Object.entries(SORTS)
    .map(([v, l]) => '<option value="' + v + '"' + (state.sort === v ? ' selected' : '') + '>' + esc(l) + '</option>')
    .join('');
  return (
    '<div class="toolbar-row">' +
    '<label class="search-box">Search <input id="q" type="search" placeholder="Try “airpods”, “OLED” or “vacuum”…" value="' + esc(state.query) + '"></label>' +
    '<label class="field">Store <select id="store">' + storeOptions + '</select></label>' +
    '<label class="field">Discount <select id="minpct">' +
    [0, 30, 40, 50, 60].map((p) => '<option value="' + p + '"' + (state.minPct === p ? ' selected' : '') + '>' + (p === 0 ? 'Any discount' : p + '% or more') + '</option>').join('') +
    '</select></label>' +
    '<label class="field">Sort <select id="sort">' + sortOptions + '</select></label>' +
    '<button id="saved-only" class="toggle' + (state.savedOnly ? ' active' : '') + '" aria-pressed="' + state.savedOnly + '">♥ Saved only</button>' +
    '</div>' +
    '<div class="chips">' + chips + '</div>'
  );
}

// The deal list: a results line, then the grid of cards, then an empty
// state with a way back when nothing matches.
export function renderList(visible, state, savedIds) {
  const summary = filterSummary(state, visible.length, deals.length);
  if (visible.length === 0) {
    return (
      '<p class="results-line">' + esc(summary) + '</p>' +
      '<div class="empty"><h2>No deals match that search</h2>' +
      '<p>Try a different word, a lower discount, or another store.</p>' +
      '<button id="clear-filters">Show all ' + deals.length + ' deals</button></div>'
    );
  }
  return (
    '<p class="results-line">' + esc(summary) + '</p>' +
    '<div class="grid">' + visible.map((d) => dealCard(d, savedIds.has(d.id))).join('') + '</div>'
  );
}

// One deal, whole page: the price block, the verdict with its evidence,
// the source and check time, the store link, the same product at other
// stores, and related deals in the same category.
export function renderDetail(deal, savedIds) {
  const pct = discountPct(deal);
  const save = dollarsSaved(deal);
  const others = sameProduct(deal, deals);
  const compare =
    others.length === 0
      ? '<p class="compare-none">No other store in this finder lists the same product — this is the only price we checked for it.</p>'
      : '<table class="compare"><thead><tr><th>Store</th><th>Price</th><th>Discount</th><th></th></tr></thead><tbody>' +
        [deal, ...others]
          .sort((a, b) => a.price - b.price)
          .map(
            (d) =>
              '<tr' + (d.id === deal.id ? ' class="this-row"' : '') + '><td>' + esc(d.store) + (d.id === deal.id ? ' (this deal)' : '') + '</td><td>' + formatMoney(d.price, d.monthly) + '</td><td>−' + discountPct(d) + '%</td><td><a href="' + esc(d.url) + '" target="_blank" rel="noopener">View →</a></td></tr>',
          )
          .join('') +
        '</tbody></table>';
  const related = deals
    .filter((d) => d.category === deal.category && d.id !== deal.id)
    .sort((a, b) => discountPct(b) - discountPct(a))
    .slice(0, 3);
  return (
    '<p class="back"><a href="#/">← All deals</a></p>' +
    '<article class="detail">' +
    '<div class="detail-head">' + storeChip(deal.store) + '<span class="cat">' + esc(deal.category) + '</span>' + verdictBadge(deal.signal) + '</div>' +
    '<h2 class="detail-title">' + esc(deal.title) + '</h2>' +
    '<div class="detail-price">' +
    '<span class="price big">' + formatMoney(deal.price, deal.monthly) + '</span>' +
    '<span class="was big">' + formatMoney(deal.was, deal.monthly) + '</span>' +
    '<span class="pct big">−' + pct + '%</span>' +
    '</div>' +
    '<p class="save-line big">You save ' + formatMoney(save, deal.monthly) + (deal.monthly ? ' every month' : '') + '</p>' +
    '<p class="evidence big">' + esc(deal.evidence) + '</p>' +
    (deal.note ? '<p class="note">' + esc(deal.note) + '</p>' : '') +
    '<p class="provenance">Price checked ' + esc(CHECKED_LABEL) + ' · Source: ' + esc(deal.source) + '</p>' +
    '<div class="detail-actions">' +
    '<a class="deal-link big" href="' + esc(deal.url) + '" target="_blank" rel="noopener">View deal at ' + esc(deal.store) + ' →</a>' +
    '<button class="save big" data-save="' + deal.id + '" aria-pressed="' + savedIds.has(deal.id) + '">' + (savedIds.has(deal.id) ? '♥ Saved' : '♡ Save this deal') + '</button>' +
    '</div>' +
    '<h3>Same product at other stores</h3>' + compare +
    '<h3>More ' + esc(deal.category) + ' deals</h3>' +
    '<div class="grid">' + related.map((d) => dealCard(d, savedIds.has(d.id))).join('') + '</div>' +
    '</article>'
  );
}

export function renderNotFound(id) {
  return (
    '<div class="empty"><h2>No deal with that name</h2>' +
    '<p>“' + esc(id) + '” is not in this finder.</p>' +
    '<p><a href="#/">Back to all deals →</a></p></div>'
  );
}
