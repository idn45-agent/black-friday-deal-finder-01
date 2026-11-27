// HTML for each page, built from the deal data. Every value is escaped
// before it goes into the page. Money is shown in US dollars; a monthly
// price is marked "/mo" wherever it appears.

import { CHECKED_LABEL, deals } from './data.js';

export const CATEGORIES = ['Audio', 'TVs', 'Computing', 'Wearables', 'Home', 'Gaming', 'Streaming'];
export const STORES = [...new Set(deals.map((d) => d.store))].sort();

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const usd = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const saved = (d) => d.was - d.price;
const signalLabel = { 'new-low': 'NEW LOW', strong: 'STRONG DEAL', routine: 'ROUTINE SALE' };

export function priceText(d) {
  return usd(d.price) + (d.monthly ? '/mo' : '');
}

export function sortDeals(list, sort) {
  const copy = [...list];
  if (sort === 'saving') copy.sort((a, b) => saved(b) - saved(a) || percentOff(b) - percentOff(a));
  else if (sort === 'price') copy.sort((a, b) => a.price - b.price || percentOff(b) - percentOff(a));
  else if (sort === 'alpha') copy.sort((a, b) => a.title.localeCompare(b.title));
  else copy.sort((a, b) => percentOff(b) - percentOff(a) || saved(b) - saved(a));
  return copy;
}

export function filterDeals(query, category, store, minOff) {
  const q = query.trim().toLowerCase();
  return deals.filter(
    (d) =>
      (q === '' || `${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) &&
      (category === 'all' || d.category === category) &&
      (store === 'all' || d.store === store) &&
      percentOff(d) >= minOff,
  );
}

export function card(d) {
  const pct = percentOff(d);
  return `<article class="card">
  <div class="card-top"><span class="cat">${escape(d.category)}</span><span class="signal ${escape(d.signal)}">${signalLabel[d.signal]}</span></div>
  <h3><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h3>
  <p class="store">${escape(d.store)}</p>
  <p class="price-row"><span class="price">${priceText(d)}</span> <s>${usd(d.was)}${d.monthly ? '/mo' : ''}</s> <span class="pct">−${pct}%</span></p>
  <p class="save">You save ${usd(saved(d))}${d.monthly ? '/mo' : ''}</p>
  <p class="evidence">${escape(d.evidence)}</p>
  <p class="meta">Checked ${escape(CHECKED_LABEL)}</p>
  <p class="actions"><a class="btn store-btn" href="${escape(d.url)}" target="_blank" rel="noopener">See it at ${escape(d.store)} ↗</a> <a class="btn ghost" href="#/deal/${encodeURIComponent(d.id)}">Details</a></p>
</article>`;
}

export function rows(list) {
  if (list.length === 0) return '<li class="empty">No deal matches those filters. Try clearing the search or lowering the discount.</li>';
  return list.map((d) => `<li>${card(d)}</li>`).join('');
}

export function toolbar(state) {
  const catOptions = ['all', ...CATEGORIES].map((c) => `<option value="${escape(c)}" ${state.category === c ? 'selected' : ''}>${c === 'all' ? 'All categories' : escape(c)}</option>`).join('');
  const storeOptions = ['all', ...STORES].map((s) => `<option value="${escape(s)}" ${state.store === s ? 'selected' : ''}>${s === 'all' ? 'All stores' : escape(s)}</option>`).join('');
  const minOptions = [0, 20, 40, 50, 60].map((m) => `<option value="${m}" ${state.minOff === m ? 'selected' : ''}>${m === 0 ? 'Any discount' : `At least ${m}% off`}</option>`).join('');
  const sortOptions = [
    ['discount', 'Best discount first'],
    ['saving', 'Biggest saving ($) first'],
    ['price', 'Lowest price first'],
    ['alpha', 'Name A–Z'],
  ].map(([v, label]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>${label}</option>`).join('');
  return `<div class="toolbar">
  <label class="search">Search <input id="q" type="search" placeholder="Try “AirPods”, “TV”, “Dyson”…" value="${escape(state.query)}"></label>
  <label>Category <select id="cat">${catOptions}</select></label>
  <label>Store <select id="store">${storeOptions}</select></label>
  <label>Discount <select id="minoff">${minOptions}</select></label>
  <label>Sort <select id="sort">${sortOptions}</select></label>
</div>`;
}

export function listPage(state) {
  const shown = sortDeals(filterDeals(state.query, state.category, state.store, state.minOff), state.sort);
  const totalSaved = deals.reduce((s, d) => s + saved(d), 0);
  const avgOff = Math.round(deals.reduce((s, d) => s + percentOff(d), 0) / deals.length);
  const newLows = deals.filter((d) => d.signal === 'new-low').length;
  return `<section class="hero">
  <p class="kicker">BLACK FRIDAY · 27 NOV 2026 · CYBER MONDAY 30 NOV</p>
  <h1>Real deals, checked today.</h1>
  <p class="lede">Every price below was read on Black Friday itself — at the store or in a deals source that names the store — and each deal carries an honest verdict: a new low, a strong price, or just a routine sale.</p>
  <ul class="stats">
    <li><strong>${deals.length}</strong> deals checked</li>
    <li><strong>${newLows}</strong> new lows</li>
    <li><strong>${avgOff}%</strong> average discount</li>
    <li><strong>${usd(totalSaved)}</strong> total savings</li>
  </ul>
</section>
${toolbar(state)}
<p class="count" id="count">Showing <strong>${shown.length}</strong> of ${deals.length} deals · sorted by ${state.sort === 'discount' ? 'best discount' : state.sort === 'saving' ? 'biggest saving' : state.sort === 'price' ? 'lowest price' : 'name'}</p>
<ul class="grid" id="grid">${rows(shown)}</ul>
<section class="method">
  <h2>How a deal earns its badge</h2>
  <ul>
    <li><span class="signal new-low">NEW LOW</span> — the lowest price this item has reached, with the evidence on its page.</li>
    <li><span class="signal strong">STRONG DEAL</span> — a deep cut on a current model, well below its usual price.</li>
    <li><span class="signal routine">ROUTINE SALE</span> — a real discount, but small or one this item sees often.</li>
  </ul>
  <p>Prices move all day on Black Friday. Always check the final price at the store before you pay. Streaming prices are monthly and renew at full price when the offer ends.</p>
</section>`;
}

export function dealPage(d) {
  const pct = percentOff(d);
  const same = deals.filter((x) => x.id !== d.id && x.title === d.title);
  const compare = same.length
    ? `<p class="compare">Same product elsewhere: ${same.map((x) => `${escape(x.store)} ${priceText(x)} (${percentOff(x)}% off)`).join('; ')}.</p>`
    : '';
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <p class="card-top"><span class="cat">${escape(d.category)}</span><span class="signal ${escape(d.signal)}">${signalLabel[d.signal]}</span></p>
  <h1>${escape(d.title)}</h1>
  <p class="store big">${escape(d.store)}</p>
  <p class="price-row big"><span class="price">${priceText(d)}</span> <s>${usd(d.was)}${d.monthly ? '/mo' : ''}</s> <span class="pct">−${pct}%</span></p>
  <p class="save big">You save ${usd(saved(d))}${d.monthly ? ' every month' : ''}</p>
  <dl>
    <dt>Is it really a deal?</dt><dd><strong>${signalLabel[d.signal]}</strong> — ${escape(d.evidence)}</dd>
    <dt>Price checked</dt><dd>${escape(CHECKED_LABEL)} (08:30 UTC)</dd>
    <dt>Price read in</dt><dd>${escape(d.source)}</dd>
    <dt>What to know</dt><dd>${escape(d.note)}</dd>
  </dl>
  ${compare}
  <p class="actions"><a class="btn store-btn" href="${escape(d.url)}" target="_blank" rel="noopener">See it at ${escape(d.store)} ↗</a></p>
  <p class="warn">Prices change during Black Friday. Confirm the price at the store before you order.</p>
</article>`;
}

export function missing() {
  return `<h1>Deal not found</h1><p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
