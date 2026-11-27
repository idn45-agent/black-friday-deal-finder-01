// DealBeacon: a Black Friday deal finder. The deals live in data.js, so the
// site needs no network to show them; each deal links out to its store.
// Routes: #/ the list (search + filters + sort), #/deal/<id> one deal.
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { deals, CHECKED_LABEL } from './data.js';
import { listPage, dealPage, missing, rows, sortDeals, filterDeals } from './views.js';

const app = document.getElementById('app');

const state = { query: '', category: 'all', store: 'all', minOff: 0, sort: 'discount' };

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : 'Not found'} | DealBeacon`;
    app.innerHTML = found ? dealPage(found) : missing();
  } else {
    document.title = 'DealBeacon — Black Friday deals, checked today';
    app.innerHTML = listPage(state);
    const grid = document.getElementById('grid');
    const count = document.getElementById('count');
    const refresh = () => {
      const shown = sortDeals(filterDeals(state.query, state.category, state.store, state.minOff), state.sort);
      grid.innerHTML = rows(shown);
      const sortLabel = state.sort === 'discount' ? 'best discount' : state.sort === 'saving' ? 'biggest saving' : state.sort === 'price' ? 'lowest price' : 'name';
      count.innerHTML = `Showing <strong>${shown.length}</strong> of ${deals.length} deals · sorted by ${sortLabel}`;
    };
    document.getElementById('q').addEventListener('input', (e) => { state.query = e.target.value; refresh(); });
    document.getElementById('cat').addEventListener('change', (e) => { state.category = e.target.value; refresh(); });
    document.getElementById('store').addEventListener('change', (e) => { state.store = e.target.value; refresh(); });
    document.getElementById('minoff').addEventListener('change', (e) => { state.minOff = Number(e.target.value); refresh(); });
    document.getElementById('sort').addEventListener('change', (e) => { state.sort = e.target.value; refresh(); });
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
