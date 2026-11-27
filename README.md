# DealBeacon — Black Friday Deal Finder

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Black Friday 2026](https://img.shields.io/badge/Black%20Friday-2026-orange.svg)
![Deals checked](https://img.shields.io/badge/deals-33%20checked-brightgreen.svg)

A static, offline deal finder for Black Friday 2026 (and Cyber Monday), built for the [make.fun bounty **black-friday-deal-finder-01**](https://make.fun/bounty/black-friday-deal-finder-01).

## What it is

33 real deals, each price checked on Black Friday itself — 27 Nov 2026, 16:30 WITA — at the store or in a deals source that names the store. Every deal shows its product, store, sale price, usual price, discount, a link to the product at that store, when the price was checked, where the price was read, and an honest verdict: **NEW LOW**, **STRONG DEAL**, or **ROUTINE SALE**, with the evidence for it.

Search, category, store and discount filters all work, and deals sort best-first by discount, biggest dollar saving, or lowest price. The same product listed at two stores is compared on its detail page. The site is plain static files under `app/` — no build step, no network requests, works on desktop and phone.

## Run it

```sh
node serve.ts   # then open http://127.0.0.1:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts` library.

## License

MIT — see [LICENSE](LICENSE).
