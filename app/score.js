// Deal arithmetic and verdicts. Every number the site shows is computed here
// from a deal's sale price and usual price — nothing is typed in twice, so
// the discount on screen always matches the two prices.

export const VERDICT_LABEL = {
  'new-low': 'NEW LOW',
  strong: 'STRONG DEAL',
  routine: 'ROUTINE SALE',
};

export const VERDICT_RANK = { 'new-low': 3, strong: 2, routine: 1 };

// Whole-percent discount, rounded down so the site never overstates a cut.
export function discountPct(deal) {
  if (!deal.was || deal.was <= deal.price) return 0;
  return Math.floor(((deal.was - deal.price) / deal.was) * 100);
}

// Dollars saved on one purchase (per month for a monthly deal).
export function dollarsSaved(deal) {
  return Math.max(0, round2(deal.was - deal.price));
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}

// One number that ranks deals for shoppers: the honest verdict first, then
// the size of the cut, then the dollars saved. The default sort uses it.
export function dealScore(deal) {
  return VERDICT_RANK[deal.signal] * 10000 + discountPct(deal) * 100 + Math.min(dollarsSaved(deal), 999);
}

// Money as a shopper reads it: $149, $1,399.99, $4.99/mo.
export function formatMoney(n, monthly) {
  const text =
    '$' +
    n.toLocaleString('en-US', {
      minimumFractionDigits: n % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
  return monthly ? text + '/mo' : text;
}

// Headline numbers for the stats strip.
export function dealTotals(deals) {
  const total = deals.length;
  const stores = new Set(deals.map((d) => d.store)).size;
  const saved = round2(deals.reduce((sum, d) => sum + dollarsSaved(d), 0));
  const avgPct =
    total === 0 ? 0 : Math.round(deals.reduce((sum, d) => sum + discountPct(d), 0) / total);
  const newLows = deals.filter((d) => d.signal === 'new-low').length;
  return { total, stores, saved, avgPct, newLows };
}

// Same product at another store: match on a normalized title (lowercase,
// strip size and store-only words). Used on the detail page so a shopper
// can see where the same thing is cheaper.
export function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sameProduct(deal, deals) {
  const key = normalizeTitle(deal.title);
  return deals.filter((d) => d.id !== deal.id && normalizeTitle(d.title) === key);
}

// Distinct values for the filter controls, in display order.
export function listCategories(deals) {
  return [...new Set(deals.map((d) => d.category))];
}

export function listStores(deals) {
  return [...new Set(deals.map((d) => d.store))].sort();
}
