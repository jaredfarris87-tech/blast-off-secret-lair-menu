# Blast Off Gaming — Secret Lair Menu

A mobile-friendly, browse-only Secret Lair inventory menu for customers scanning an in-store QR code.

**Preview:** https://blast-off-gaming-secret-lair.jaredfarris33.chatgpt.site

## What is included

- 74 Secret Lair drops with 126 in-stock inventory variants.
- Prices, quantities, finishes, collection filters, and search by drop or card name.
- 393 card/token gallery entries with locally hosted artwork and available reverse faces.
- Blast Off Gaming branding, logo, arcade font, and links to the main website.
- No checkout, customer accounts, payment processing, analytics, or backend.

Inventory is a snapshot of the October 25, 2026 catalog export. It is **not synchronized with Square or Wix**. Confirm stock and pricing before launch.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and navigation |
| `style.css` | Layout, responsive styles, and image galleries |
| `brand.css` | Blast Off Gaming branding overrides |
| `app.js` | Search, filters, product details, and image viewer |
| `catalog.json` | Customer-facing inventory and card/image associations |
| `assets/` | Card artwork and product imagery |
| `assets/brand/` | Logo, starfield background, and arcade font |

## Run locally

No package installation or build step is required.

With Python 3 installed, run this from the project directory:

```sh
python3 -m http.server 8080
```

Open http://localhost:8080 in a browser. Use an HTTP server rather than double-clicking `index.html`, because the application fetches `catalog.json`.

## Wix handoff

This is a standalone static website, not a native Wix page or Wix app. The web manager should choose the integration method:

1. Host the directory on a suitable static host and embed its HTTPS URL in a Wix page, after testing frame permissions, mobile sizing, scrolling, and navigation.
2. Host it separately and link to it from Wix, optionally using a business-controlled subdomain.
3. Adapt the experience into native Wix components and a Wix CMS inventory collection.

Embedding guidance: https://support.wix.com/en/article/wix-editor-embedding-a-site-or-a-widget

If embedded inside the main site's header/footer, consider removing the duplicate navigation and footer from this standalone version. Test links so the main Wix site does not open inside the embed.

This repository does not automatically deploy to Wix or update the existing Sites preview. Choose and configure deployment separately. The existing preview remains managed through the original Sites project.

## Updating inventory

`catalog.json` has a `drops` array. Each drop includes:

- `id`: stable identifier used in shareable `#drop=...` URLs.
- `title`, `category`, `cards`, `aliases`, `notes`, and `source`.
- `image`: optional official cover image. When blank, the page displays a preview composed of the first three card images.
- `cardImages`: gallery entries containing `name`, `image`, and optional `backImage`.
- `variants`: entries containing `label`, `kind`, `price`, `qty`, `catalogName`, and `sku`.

Prices are numeric USD values. `kind` is `foil`, `nonfoil`, or `standard` (finish unspecified).

**Important:** The current interface assumes every listed variant is in stock. When an item sells out, remove that variant from the published catalog; do not merely set its quantity to zero. Remove a drop if no variants remain. A future inventory integration should implement automatic stock filtering.

When updating the snapshot, update the `updated` field in `catalog.json` and the visible inventory date text in `index.html` and `app.js`.

The two Grayskull SKUs were explicitly confirmed by the owner:

- `195166343921`: foil, $55.
- `195166343952`: non-foil, $45.

Other unspecified finishes remain marked for confirmation. Do not infer finish from price alone.

## Checks before launch

- Verify prices, stock, and finish labels with the store.
- Test search, finish/category filters, and sorting on mobile.
- Open product galleries; test image enlargement, previous/next controls, and reverse faces.
- Confirm all images, fonts, and navigation links load from the chosen host.
- Decide who maintains inventory and how often.
- Choose a permanent customer URL before printing new QR signs.

## Ownership and assets

The repository is intended for private collaboration with Blast Off Gaming and its web manager. Card artwork and Magic: The Gathering / Secret Lair trademarks belong to their respective owners. No open-source license or redistribution rights for third-party art or fonts are granted by this package.

Official contents-source links are retained per drop in `catalog.json`. Two drops, Back in My Day! and Inked, initially used secondary contents sources; their gallery images were subsequently sourced from official product galleries.

This handoff intentionally excludes authentication tokens, deployment credentials, the original Square catalog's internal cost fields, and Sites-specific account configuration.
