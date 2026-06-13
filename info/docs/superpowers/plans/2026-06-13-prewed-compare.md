# Wedding Vendor Comparison Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static vendor comparison website at `yourusername.github.io/prewed` that lets users filter, browse, and compare wedding photography packages across 12 vendors with a combo-builder for mix-and-match comparisons.

**Architecture:** Single-page app with no build step — pure HTML + CSS + vanilla JS loaded via script tags. Vendor data lives in `data/vendors.json`. JS is split into 5 focused files loaded in dependency order.

**Tech Stack:** HTML5, CSS3 (custom properties), vanilla ES5-compatible JavaScript, GitHub Pages (static hosting)

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Page structure, loads all scripts/styles |
| `css/style.css` | All styling — layout, table, tray, modal |
| `data/vendors.json` | All vendor package data (generated from txt files) |
| `js/data.js` | Data loading, filter logic, sort logic — exposes `AppData` |
| `js/table.js` | Table rendering for prewedding/wedding/bundle tabs |
| `js/tray.js` | Compare tray state + DOM rendering |
| `js/modal.js` | Full-screen comparison modal rendering |
| `js/app.js` | Initialization, event binding, tab switching, orchestration |

Scripts loaded in `index.html` in order: `data.js` → `table.js` → `tray.js` → `modal.js` → `app.js`

---

## Task 1: Repo Initialization

**Files:**
- Create: `/Users/bytedance/Desktop/prewed/` (new directory — separate from photos/)
- Create: `prewed/README.md`
- Create: `prewed/css/`, `prewed/js/`, `prewed/data/` directories

- [ ] **Step 1: Create repo directory and subdirectories**

```bash
mkdir -p /Users/bytedance/Desktop/prewed/{css,js,data}
cd /Users/bytedance/Desktop/prewed
git init
```

- [ ] **Step 2: Write README.md**

```markdown
# Prewed Vendor Comparison

A static wedding photography vendor comparison site.

## Local Development

Open `index.html` directly in a browser, or serve with:
```bash
python3 -m http.server 8000
```
Then visit http://localhost:8000

## Deployment

1. Push to GitHub repo named `prewed`
2. Go to repo Settings → Pages → Source: Deploy from branch `main` / `/ (root)`
3. Site live at `https://<username>.github.io/prewed`
```

- [ ] **Step 3: Initial commit**

```bash
cd /Users/bytedance/Desktop/prewed
git add README.md
git commit -m "chore: init repo"
```

---

## Task 2: Generate vendors.json

**Files:**
- Create: `prewed/data/vendors.json`
- Source: read all txt files in `/Users/bytedance/Desktop/photos/`

### Schema

Every package is one object. `type` is one of: `"prewedding"`, `"wedding"`, `"bundle"`.

For `type: "prewedding"` or `type: "wedding"`:
```json
{
  "id": "vendor-package-slug",
  "vendor": "Vendor Display Name",
  "package": "Package Name",
  "type": "prewedding",
  "locations": ["Bali", "Jakarta"],
  "price": 15000000,
  "duration_hrs": 12,
  "photographers": 1,
  "videographers": 1,
  "edited_photos": 200,
  "raw_files": true,
  "video_highlight_min": 3,
  "video_teaser_min": 1,
  "video_sde": false,
  "video_notes": "1 min teaser + 3 min highlight",
  "drone": false,
  "mua": true,
  "stylist": true,
  "album": "30x20cm, 20 pages",
  "crew_transport_included": true,
  "crew_accommodation_included": true,
  "exclusions": ["meals", "location fees", "couple transport"],
  "delivery_photos_weeks": null,
  "delivery_video_weeks": null,
  "attention_flags": [],
  "notes": "Free analog film (3 rolls). DP 30% to book."
}
```

For `type: "bundle"`:
```json
{
  "id": "vendor-bundle-slug",
  "vendor": "Vendor Display Name",
  "package": "Bundle Package Name",
  "type": "bundle",
  "locations": ["Bali"],
  "price": 36000000,
  "savings": 9000000,
  "attention_flags": [],
  "notes": "Save IDR 9,000,000 vs booking separately.",
  "prewedding": {
    "duration_hrs": 12,
    "photographers": 1,
    "videographers": 1,
    "edited_photos": 200,
    "raw_files": true,
    "video_highlight_min": 3,
    "video_teaser_min": 1,
    "video_sde": false,
    "video_notes": "1 min + 3 min video",
    "drone": false,
    "mua": true,
    "stylist": true,
    "album": null,
    "crew_transport_included": true,
    "crew_accommodation_included": true,
    "exclusions": ["meals", "location fees"]
  },
  "wedding": {
    "duration_hrs": 15,
    "photographers": 2,
    "videographers": 1,
    "edited_photos": 300,
    "raw_files": true,
    "video_highlight_min": 7,
    "video_teaser_min": 1,
    "video_sde": false,
    "video_notes": "1 min + 7 min video",
    "drone": false,
    "mua": false,
    "stylist": false,
    "album": "30x20cm, 20 pages",
    "crew_transport_included": true,
    "crew_accommodation_included": true,
    "exclusions": ["meals", "location fees"]
  }
}
```

### Attention Flag Values

Use these exact strings (sourced from attention.txt):
- `"price_list_possibly_outdated"` — biggest_moment (PLSP2023), rawproject (2025 list)
- `"promo_may_be_expired"` — pattivana (Feb 23–28 2026 promo)
- `"limited_offer"` — mantara (early bird), mnln (Nov 2025 booking)
- `"open_trip_dates_passed"` — galilea open trip packages
- `"wedding_only_verify_prewedding_price"` — pattivana (no Bali/Jakarta on Exclusive Behind the Wedding)
- `"missing_wedding_package"` — pl_photo, rawproject (prewedding only shown)

### Null Rules
- If a field is not mentioned in the txt file, set to `null` for numbers/strings, `false` for booleans.
- `edited_photos`: if txt says "200++" use `200`.
- `duration_hrs`: if "half day" and no hours given use `8`, "full day" use `12` for prewed and `15` for wedding unless specified.
- `video_highlight_min`: use the maximum of the range (e.g. "3-5 min" → `5`).

- [ ] **Step 1: Read all vendor txt files**

Read each file in `/Users/bytedance/Desktop/photos/`:
`bare_ods.txt`, `biggest_moment.txt`, `eclat.txt`, `galilea.txt`, `mantara.txt`, `memography.txt`, `mnln.txt`, `pattivana.txt`, `perpetual.txt`, `pl_photo.txt`, `rawproject.txt`, `slowhand.txt`

Also read `attention.txt` for flag context.

- [ ] **Step 2: Write data/vendors.json**

Using the schema above and null rules, produce `prewed/data/vendors.json` as a JSON array of all packages from all 12 vendors. Every distinct package that has a price is one entry. Bundles are `type: "bundle"`. Open trip packages from galilea are separate prewedding entries with `attention_flags: ["open_trip_dates_passed"]`.

Include only packages that have a clear price. Skip add-ons (those go in a separate `"addons"` top-level key, see below).

Top-level structure:
```json
{
  "packages": [ ...all package objects... ],
  "addons": {
    "eclat": [
      { "name": "Mini Studio for Wedding", "price": 5000000 },
      { "name": "Additional Photographer", "price": 3000000 },
      { "name": "Additional Videographer", "price": 3000000 },
      { "name": "Additional Hours", "price": 3000000 },
      { "name": "Same Day Edit", "price": 3000000 },
      { "name": "Premium Canvas 40x60cm", "price": 2000000 },
      { "name": "Premium Canvas 60x90cm", "price": 3000000 },
      { "name": "Eclat Signature Postcard", "price": 2000000 }
    ],
    "perpetual": [ ... ],
    "slowhand": [ ... ]
  }
}
```

- [ ] **Step 3: Validate JSON**

```bash
cd /Users/bytedance/Desktop/prewed
python3 -c "import json; d=json.load(open('data/vendors.json')); print(f'OK: {len(d[\"packages\"])} packages across {len(set(p[\"vendor\"] for p in d[\"packages\"]))} vendors')"
```

Expected output: `OK: N packages across 12 vendors` (N will be 60–100+)

- [ ] **Step 4: Commit**

```bash
cd /Users/bytedance/Desktop/prewed
git add data/vendors.json
git commit -m "feat: add vendor data (vendors.json)"
```

---

## Task 3: index.html

**Files:**
- Create: `prewed/index.html`

- [ ] **Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wedding Vendor Comparison</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>

  <!-- HEADER -->
  <header class="site-header">
    <div class="header-inner">
      <h1 class="site-title">Wedding Vendor Comparison</h1>
      <p class="site-subtitle">Compare prewedding &amp; wedding photography packages</p>
    </div>
  </header>

  <!-- STICKY FILTER BAR -->
  <div class="filter-bar" id="filterBar">
    <div class="filter-bar-inner">

      <!-- Location chips -->
      <div class="filter-group">
        <label class="filter-label">Location</label>
        <div class="chip-group" id="locationChips">
          <button class="chip active" data-location="all">All</button>
          <button class="chip" data-location="Bali">Bali</button>
          <button class="chip" data-location="Jakarta">Jakarta</button>
          <button class="chip" data-location="Surabaya">Surabaya</button>
          <button class="chip" data-location="Overseas">Overseas</button>
        </div>
      </div>

      <!-- Price range -->
      <div class="filter-group">
        <label class="filter-label">Max Price <span id="priceDisplay">Any</span></label>
        <input type="range" id="priceRange" min="0" max="110000000" step="1000000" value="110000000" />
      </div>

      <!-- Media type -->
      <div class="filter-group">
        <label class="filter-label">Media</label>
        <div class="chip-group" id="mediaChips">
          <button class="chip active" data-media="all">All</button>
          <button class="chip" data-media="photo">Photo Only</button>
          <button class="chip" data-media="video">Video Only</button>
          <button class="chip" data-media="combo">Photo + Video</button>
        </div>
      </div>

      <!-- Toggles -->
      <div class="filter-group filter-toggles">
        <label class="toggle-label"><input type="checkbox" id="filterMUA" /> MUA Included</label>
        <label class="toggle-label"><input type="checkbox" id="filterDrone" /> Drone</label>
        <label class="toggle-label"><input type="checkbox" id="filterAlbum" /> Album</label>
        <label class="toggle-label"><input type="checkbox" id="filterRaw" /> Raw Files</label>
        <label class="toggle-label"><input type="checkbox" id="filterHideFlags" /> Hide ⚠️</label>
      </div>

      <!-- Min photos -->
      <div class="filter-group">
        <label class="filter-label">Min Photos</label>
        <input type="number" id="minPhotos" min="0" placeholder="0" />
      </div>

      <!-- Sort -->
      <div class="filter-group">
        <label class="filter-label">Sort</label>
        <select id="sortBy">
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="photos-desc">Most Photos</option>
          <option value="duration-desc">Most Hours</option>
          <option value="vendor-asc">Vendor A–Z</option>
        </select>
      </div>

      <!-- Clear -->
      <div class="filter-group">
        <button class="btn-clear" id="clearFilters">Clear Filters</button>
      </div>

    </div>
  </div>

  <!-- MAIN CONTENT -->
  <main class="main-content">

    <!-- Tab bar -->
    <div class="tab-bar">
      <button class="tab active" data-tab="prewedding">Prewedding</button>
      <button class="tab" data-tab="wedding">Wedding Day</button>
      <button class="tab" data-tab="bundle">Bundles</button>
    </div>

    <!-- Result count -->
    <div class="result-count" id="resultCount">Loading...</div>

    <!-- Table container -->
    <div class="table-wrapper" id="tableWrapper">
      <table class="compare-table" id="compareTable">
        <thead id="tableHead"></thead>
        <tbody id="tableBody"></tbody>
      </table>
    </div>

  </main>

  <!-- COMPARE TRAY -->
  <div class="tray" id="compareTray">
    <div class="tray-inner">
      <div class="tray-combos" id="trayCombos">
        <!-- Rendered by tray.js -->
      </div>
      <div class="tray-actions">
        <button class="btn-add-combo" id="addComboBtn">+ New Combo</button>
        <button class="btn-compare" id="compareNowBtn" disabled>Compare Now →</button>
        <button class="btn-clear-tray" id="clearTrayBtn">Clear</button>
      </div>
    </div>
  </div>

  <!-- COMPARISON MODAL -->
  <div class="modal-overlay" id="modalOverlay" hidden>
    <div class="modal">
      <div class="modal-header">
        <h2>Combo Comparison</h2>
        <button class="modal-close" id="modalClose">✕</button>
      </div>
      <div class="modal-body" id="modalBody">
        <!-- Rendered by modal.js -->
      </div>
    </div>
  </div>

  <!-- Scripts (order matters) -->
  <script src="js/data.js"></script>
  <script src="js/table.js"></script>
  <script src="js/tray.js"></script>
  <script src="js/modal.js"></script>
  <script src="js/app.js"></script>

</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bytedance/Desktop/prewed
git add index.html
git commit -m "feat: add index.html skeleton"
```

---

## Task 4: style.css

**Files:**
- Create: `prewed/css/style.css`

- [ ] **Step 1: Write css/style.css**

```css
/* ===========================
   CSS Custom Properties
   =========================== */
:root {
  --color-bg: #fafaf9;
  --color-surface: #ffffff;
  --color-border: #e5e7eb;
  --color-text: #1f2937;
  --color-text-muted: #6b7280;
  --color-accent: #c9848a;
  --color-accent-light: #f5e6e8;
  --color-green: #16a34a;
  --color-green-light: #dcfce7;
  --color-red-light: #fee2e2;
  --color-amber: #d97706;
  --color-amber-light: #fef3c7;
  --color-blue-light: #eff6ff;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.12);
  --radius: 8px;
  --tray-height: 80px;
  --header-height: 70px;
  --filter-height: 64px;
}

/* ===========================
   Reset & Base
   =========================== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.5;
  padding-bottom: calc(var(--tray-height) + 24px);
}

/* ===========================
   Header
   =========================== */
.site-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 16px 24px;
  height: var(--header-height);
}
.header-inner { max-width: 1400px; margin: 0 auto; }
.site-title { font-size: 20px; font-weight: 700; color: var(--color-accent); }
.site-subtitle { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }

/* ===========================
   Filter Bar
   =========================== */
.filter-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}
.filter-bar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}
.filter-group { display: flex; flex-direction: column; gap: 4px; }
.filter-label { font-size: 11px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

/* Chips */
.chip-group { display: flex; gap: 4px; flex-wrap: wrap; }
.chip {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
  color: var(--color-text);
  transition: all 0.15s;
}
.chip:hover { border-color: var(--color-accent); color: var(--color-accent); }
.chip.active { background: var(--color-accent); border-color: var(--color-accent); color: #fff; }

/* Toggles */
.filter-toggles { flex-direction: row; gap: 12px; align-items: center; flex-wrap: wrap; }
.toggle-label { display: flex; align-items: center; gap: 5px; font-size: 12px; cursor: pointer; white-space: nowrap; }
.toggle-label input[type="checkbox"] { accent-color: var(--color-accent); }

/* Inputs */
#minPhotos {
  width: 70px;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 13px;
}
#priceRange { width: 130px; accent-color: var(--color-accent); }
#sortBy {
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 13px;
  background: #fff;
}

/* Clear button */
.btn-clear {
  padding: 5px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: #fff;
  font-size: 12px;
  cursor: pointer;
  color: var(--color-text-muted);
}
.btn-clear:hover { border-color: var(--color-accent); color: var(--color-accent); }

/* ===========================
   Main Content
   =========================== */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 24px;
}

/* Tab Bar */
.tab-bar { display: flex; gap: 0; border-bottom: 2px solid var(--color-border); margin-bottom: 16px; }
.tab {
  padding: 10px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}
.tab:hover { color: var(--color-accent); }
.tab.active { color: var(--color-accent); border-bottom-color: var(--color-accent); }

/* Result count */
.result-count { font-size: 12px; color: var(--color-text-muted); margin-bottom: 10px; }

/* Table */
.table-wrapper { overflow-x: auto; border-radius: var(--radius); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); }
.compare-table { width: 100%; border-collapse: collapse; background: var(--color-surface); font-size: 13px; }
.compare-table th {
  background: #f9fafb;
  padding: 10px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}
.compare-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}
.compare-table tr:last-child td { border-bottom: none; }
.compare-table tbody tr:hover { background: var(--color-accent-light); }

/* Table cell types */
.cell-vendor { font-weight: 700; color: var(--color-text); }
.cell-package { color: var(--color-text); }
.cell-price { font-weight: 700; font-size: 14px; white-space: nowrap; }
.cell-check-yes { color: var(--color-green); font-size: 16px; }
.cell-check-no { color: var(--color-border); font-size: 16px; }
.cell-savings { color: var(--color-green); font-weight: 600; font-size: 12px; }
.cell-location { display: flex; gap: 4px; flex-wrap: wrap; }
.loc-chip { background: var(--color-blue-light); color: #1d4ed8; padding: 2px 7px; border-radius: 999px; font-size: 11px; font-weight: 500; }
.flag-icon { cursor: help; }

/* Add button */
.btn-add {
  padding: 5px 12px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
}
.btn-add:hover { opacity: 0.85; }
.btn-add.added { background: var(--color-green); }

/* ===========================
   Compare Tray
   =========================== */
.tray {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: var(--color-surface);
  border-top: 2px solid var(--color-accent);
  box-shadow: 0 -4px 16px rgba(0,0,0,0.1);
  min-height: var(--tray-height);
}
.tray-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.tray-combos { display: flex; gap: 12px; flex: 1; flex-wrap: wrap; }

/* Combo slot */
.combo-slot {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 8px 12px;
  min-width: 260px;
  position: relative;
}
.combo-slot.active { border-color: var(--color-accent); }
.combo-slot-label { font-size: 11px; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; }
.combo-pkg {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.combo-pkg-name { font-size: 12px; font-weight: 600; }
.combo-pkg-vendor { font-size: 11px; color: var(--color-text-muted); }
.combo-empty { font-size: 12px; color: var(--color-text-muted); font-style: italic; }
.combo-total { font-size: 13px; font-weight: 700; color: var(--color-accent); margin-left: auto; white-space: nowrap; }
.combo-remove {
  position: absolute;
  top: 4px; right: 4px;
  background: none;
  border: none;
  font-size: 14px;
  color: var(--color-text-muted);
  cursor: pointer;
  line-height: 1;
  padding: 2px;
}
.combo-remove:hover { color: #ef4444; }
.combo-divider { font-size: 11px; color: var(--color-text-muted); align-self: center; }

/* Tray actions */
.tray-actions { display: flex; gap: 8px; flex-shrink: 0; }
.btn-add-combo {
  padding: 8px 14px;
  border: 1px dashed var(--color-border);
  background: none;
  border-radius: var(--radius);
  font-size: 12px;
  cursor: pointer;
  color: var(--color-text-muted);
}
.btn-add-combo:hover { border-color: var(--color-accent); color: var(--color-accent); }
.btn-compare {
  padding: 8px 18px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-compare:hover:not(:disabled) { opacity: 0.85; }
.btn-compare:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-clear-tray {
  padding: 8px 12px;
  border: none;
  background: none;
  font-size: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
}
.btn-clear-tray:hover { color: #ef4444; }

/* ===========================
   Comparison Modal
   =========================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: 40px 16px;
}
.modal-overlay[hidden] { display: none; }
.modal {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 1100px;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}
.modal-header h2 { font-size: 18px; font-weight: 700; }
.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--color-text-muted);
}
.modal-close:hover { color: var(--color-text); }
.modal-body { padding: 28px; overflow-x: auto; }

/* Modal comparison grid */
.comparison-grid {
  display: grid;
  gap: 0;
}
.comparison-grid[data-combos="1"] { grid-template-columns: 200px 1fr; }
.comparison-grid[data-combos="2"] { grid-template-columns: 200px 1fr 1fr; }
.comparison-grid[data-combos="3"] { grid-template-columns: 200px 1fr 1fr 1fr; }

.grid-header-blank { background: transparent; }
.grid-combo-header {
  background: var(--color-accent-light);
  border: 1px solid var(--color-border);
  padding: 14px 16px;
  text-align: center;
}
.grid-combo-header .combo-title { font-size: 13px; font-weight: 700; }
.grid-combo-header .combo-vendors { font-size: 11px; color: var(--color-text-muted); margin-top: 4px; }
.grid-combo-header .combo-price-total { font-size: 20px; font-weight: 800; color: var(--color-accent); margin-top: 6px; }

.grid-row-label {
  background: #f9fafb;
  border: 1px solid var(--color-border);
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
}
.grid-section-label {
  background: var(--color-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
}
.grid-cell {
  border: 1px solid var(--color-border);
  padding: 10px 16px;
  font-size: 13px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.grid-cell.best { background: var(--color-green-light); font-weight: 700; }
.grid-cell.worst { background: var(--color-red-light); }
.grid-cell.na { color: var(--color-text-muted); font-style: italic; }
.grid-flag { background: var(--color-amber-light); }
.grid-flag-text { font-size: 11px; color: var(--color-amber); }
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bytedance/Desktop/prewed
git add css/style.css
git commit -m "feat: add stylesheet"
```

---

## Task 5: js/data.js

**Files:**
- Create: `prewed/js/data.js`

This file exposes a global `AppData` object with all data + filter/sort functions.

- [ ] **Step 1: Write js/data.js**

```javascript
var AppData = (function() {
  var _packages = [];
  var _addons = {};

  function load() {
    return fetch('data/vendors.json')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        _packages = d.packages;
        _addons = d.addons || {};
      });
  }

  // Determine media type of a package
  function mediaType(pkg) {
    var hasCam = pkg.photographers > 0;
    var hasVid = pkg.videographers > 0;
    if (pkg.type === 'bundle') {
      hasCam = (pkg.prewedding && pkg.prewedding.photographers > 0) || (pkg.wedding && pkg.wedding.photographers > 0);
      hasVid = (pkg.prewedding && pkg.prewedding.videographers > 0) || (pkg.wedding && pkg.wedding.videographers > 0);
    }
    if (hasCam && hasVid) return 'combo';
    if (hasCam) return 'photo';
    if (hasVid) return 'video';
    return 'combo';
  }

  function hasLocation(pkg, loc) {
    if (!loc || loc === 'all') return true;
    if (!pkg.locations || pkg.locations.length === 0) return true;
    return pkg.locations.some(function(l) {
      return l.toLowerCase().indexOf(loc.toLowerCase()) !== -1;
    });
  }

  function getPackages(type, filters, sortBy) {
    var result = _packages.filter(function(pkg) {
      if (pkg.type !== type) return false;

      // Location
      if (filters.location && filters.location !== 'all') {
        if (!hasLocation(pkg, filters.location)) return false;
      }

      // Max price
      if (filters.maxPrice && pkg.price > filters.maxPrice) return false;

      // Media type
      if (filters.media && filters.media !== 'all') {
        if (mediaType(pkg) !== filters.media) return false;
      }

      // MUA
      if (filters.mua) {
        var mua = pkg.mua || (pkg.prewedding && pkg.prewedding.mua);
        if (!mua) return false;
      }

      // Drone
      if (filters.drone) {
        var drone = pkg.drone || (pkg.prewedding && pkg.prewedding.drone) || (pkg.wedding && pkg.wedding.drone);
        if (!drone) return false;
      }

      // Album
      if (filters.album) {
        var album = pkg.album || (pkg.wedding && pkg.wedding.album) || (pkg.prewedding && pkg.prewedding.album);
        if (!album) return false;
      }

      // Raw files
      if (filters.raw) {
        var raw = pkg.raw_files || (pkg.prewedding && pkg.prewedding.raw_files) || (pkg.wedding && pkg.wedding.raw_files);
        if (!raw) return false;
      }

      // Min photos
      if (filters.minPhotos && filters.minPhotos > 0) {
        var photos = pkg.edited_photos;
        if (pkg.type === 'bundle') {
          photos = ((pkg.prewedding && pkg.prewedding.edited_photos) || 0) + ((pkg.wedding && pkg.wedding.edited_photos) || 0);
        }
        if (!photos || photos < filters.minPhotos) return false;
      }

      // Hide flags
      if (filters.hideFlags && pkg.attention_flags && pkg.attention_flags.length > 0) return false;

      return true;
    });

    // Sort
    result.sort(function(a, b) {
      switch(sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'photos-desc':
          var pa = a.edited_photos || (a.prewedding ? (a.prewedding.edited_photos||0) : 0) + (a.wedding ? (a.wedding.edited_photos||0) : 0);
          var pb = b.edited_photos || (b.prewedding ? (b.prewedding.edited_photos||0) : 0) + (b.wedding ? (b.wedding.edited_photos||0) : 0);
          return pb - pa;
        case 'duration-desc':
          var da = a.duration_hrs || (a.prewedding ? (a.prewedding.duration_hrs||0) : 0) + (a.wedding ? (a.wedding.duration_hrs||0) : 0);
          var db = b.duration_hrs || (b.prewedding ? (b.prewedding.duration_hrs||0) : 0) + (b.wedding ? (b.wedding.duration_hrs||0) : 0);
          return db - da;
        case 'vendor-asc': return a.vendor.localeCompare(b.vendor);
        default: return a.price - b.price;
      }
    });

    return result;
  }

  function formatPrice(amount) {
    if (!amount) return '—';
    return 'IDR ' + amount.toLocaleString('id-ID');
  }

  function flagTooltip(flag) {
    var map = {
      'price_list_possibly_outdated': 'Price list may be outdated (2023/2025)',
      'promo_may_be_expired': 'Promotional price may have expired (Feb 2026)',
      'limited_offer': 'Limited-time offer — verify availability',
      'open_trip_dates_passed': 'Open trip dates have passed — check for new dates',
      'missing_wedding_package': 'Wedding day packages not shown — contact vendor',
      'wedding_only_verify_prewedding_price': 'Verify Bali/Jakarta pricing for this package'
    };
    return map[flag] || flag;
  }

  return {
    load: load,
    getPackages: getPackages,
    formatPrice: formatPrice,
    flagTooltip: flagTooltip,
    mediaType: mediaType
  };
})();
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bytedance/Desktop/prewed
git add js/data.js
git commit -m "feat: add data loading and filter logic"
```

---

## Task 6: js/table.js

**Files:**
- Create: `prewed/js/table.js`

Renders the comparison table for the active tab. Exposes `TableRenderer`.

- [ ] **Step 1: Write js/table.js**

```javascript
var TableRenderer = (function() {

  var PREWED_COLS = [
    { key: 'vendor',       label: 'Vendor' },
    { key: 'package',      label: 'Package' },
    { key: 'locations',    label: 'Location' },
    { key: 'price',        label: 'Price' },
    { key: 'duration_hrs', label: 'Duration' },
    { key: 'photographers',label: 'Photo' },
    { key: 'videographers',label: 'Video' },
    { key: 'edited_photos',label: 'Edited Photos' },
    { key: 'raw_files',    label: 'Raw Files' },
    { key: 'video_notes',  label: 'Video Deliverables' },
    { key: 'drone',        label: 'Drone' },
    { key: 'mua',          label: 'MUA' },
    { key: 'stylist',      label: 'Stylist' },
    { key: 'crew',         label: 'Crew Costs' },
    { key: 'flags',        label: '⚠️' },
    { key: 'add',          label: '' }
  ];

  var WEDDING_COLS = [
    { key: 'vendor',       label: 'Vendor' },
    { key: 'package',      label: 'Package' },
    { key: 'locations',    label: 'Location' },
    { key: 'price',        label: 'Price' },
    { key: 'duration_hrs', label: 'Duration' },
    { key: 'photographers',label: 'Photo' },
    { key: 'videographers',label: 'Video' },
    { key: 'edited_photos',label: 'Edited Photos' },
    { key: 'raw_files',    label: 'Raw Files' },
    { key: 'video_notes',  label: 'Video Deliverables' },
    { key: 'video_sde',    label: 'SDE' },
    { key: 'drone',        label: 'Drone' },
    { key: 'album',        label: 'Album' },
    { key: 'crew',         label: 'Crew Costs' },
    { key: 'flags',        label: '⚠️' },
    { key: 'add',          label: '' }
  ];

  var BUNDLE_COLS = [
    { key: 'vendor',        label: 'Vendor' },
    { key: 'package',       label: 'Package' },
    { key: 'locations',     label: 'Location' },
    { key: 'price',         label: 'Total Price' },
    { key: 'savings',       label: 'Savings' },
    { key: 'pw_duration',   label: 'Prewed Hrs' },
    { key: 'wd_duration',   label: 'Wedding Hrs' },
    { key: 'total_photos',  label: 'Total Photos' },
    { key: 'pw_video',      label: 'Prewed Video' },
    { key: 'wd_video',      label: 'Wedding Video' },
    { key: 'mua',           label: 'MUA' },
    { key: 'drone',         label: 'Drone' },
    { key: 'album',         label: 'Album' },
    { key: 'flags',         label: '⚠️' },
    { key: 'add',           label: '' }
  ];

  function yes() { return '<span class="cell-check-yes" title="Included">✓</span>'; }
  function no() { return '<span class="cell-check-no" title="Not included">✗</span>'; }
  function bool(val) { return val ? yes() : no(); }

  function locationChips(locs) {
    if (!locs || locs.length === 0) return '<span class="cell-text-muted">—</span>';
    return '<div class="cell-location">' + locs.map(function(l) {
      return '<span class="loc-chip">' + l + '</span>';
    }).join('') + '</div>';
  }

  function crewCosts(pkg) {
    var parts = [];
    if (pkg.crew_transport_included) parts.push('Transport ✓');
    else parts.push('Transport ✗');
    if (pkg.crew_accommodation_included) parts.push('Accom ✓');
    else parts.push('Accom ✗');
    return '<span style="font-size:11px;color:#6b7280">' + parts.join(' · ') + '</span>';
  }

  function flagCell(flags) {
    if (!flags || flags.length === 0) return '';
    return flags.map(function(f) {
      return '<span class="flag-icon" title="' + AppData.flagTooltip(f) + '">⚠️</span>';
    }).join(' ');
  }

  function renderCell(col, pkg, type) {
    switch(col.key) {
      case 'vendor':
        return '<td class="cell-vendor">' + pkg.vendor + '</td>';
      case 'package':
        return '<td class="cell-package">' + pkg.package + '</td>';
      case 'locations':
        return '<td>' + locationChips(pkg.locations) + '</td>';
      case 'price':
        return '<td class="cell-price">' + AppData.formatPrice(pkg.price) + '</td>';
      case 'savings':
        return '<td class="cell-savings">' + (pkg.savings ? 'Save ' + AppData.formatPrice(pkg.savings) : '—') + '</td>';
      case 'duration_hrs':
        return '<td>' + (pkg.duration_hrs ? pkg.duration_hrs + ' hrs' : '—') + '</td>';
      case 'photographers':
        return '<td>' + (pkg.photographers != null ? pkg.photographers : '—') + '</td>';
      case 'videographers':
        return '<td>' + (pkg.videographers != null ? pkg.videographers : '—') + '</td>';
      case 'edited_photos':
        return '<td>' + (pkg.edited_photos != null ? pkg.edited_photos : '—') + '</td>';
      case 'raw_files':
        return '<td>' + bool(pkg.raw_files) + '</td>';
      case 'video_notes':
        return '<td style="font-size:12px;max-width:180px">' + (pkg.video_notes || '—') + '</td>';
      case 'video_sde':
        return '<td>' + bool(pkg.video_sde) + '</td>';
      case 'drone':
        return '<td>' + bool(pkg.drone) + '</td>';
      case 'mua':
        return '<td>' + bool(pkg.mua) + '</td>';
      case 'stylist':
        return '<td>' + bool(pkg.stylist) + '</td>';
      case 'album':
        return '<td style="font-size:12px">' + (pkg.album || no()) + '</td>';
      case 'crew':
        return '<td>' + crewCosts(pkg) + '</td>';
      case 'flags':
        return '<td>' + flagCell(pkg.attention_flags) + '</td>';
      // Bundle-specific
      case 'pw_duration':
        return '<td>' + (pkg.prewedding && pkg.prewedding.duration_hrs ? pkg.prewedding.duration_hrs + ' hrs' : '—') + '</td>';
      case 'wd_duration':
        return '<td>' + (pkg.wedding && pkg.wedding.duration_hrs ? pkg.wedding.duration_hrs + ' hrs' : '—') + '</td>';
      case 'total_photos':
        var tp = ((pkg.prewedding && pkg.prewedding.edited_photos) || 0) + ((pkg.wedding && pkg.wedding.edited_photos) || 0);
        return '<td>' + (tp || '—') + '</td>';
      case 'pw_video':
        return '<td style="font-size:12px">' + (pkg.prewedding && pkg.prewedding.video_notes ? pkg.prewedding.video_notes : '—') + '</td>';
      case 'wd_video':
        return '<td style="font-size:12px">' + (pkg.wedding && pkg.wedding.video_notes ? pkg.wedding.video_notes : '—') + '</td>';
      case 'add':
        var slot = type === 'bundle' ? 'bundle' : type;
        return '<td><button class="btn-add" data-id="' + pkg.id + '" data-slot="' + slot + '" onclick="TrayManager.handleAdd(this)">+ Add</button></td>';
      default:
        return '<td>—</td>';
    }
  }

  function renderBundleMUA(pkg) {
    var v = (pkg.prewedding && pkg.prewedding.mua) || (pkg.wedding && pkg.wedding.mua);
    return '<td>' + bool(v) + '</td>';
  }
  function renderBundleDrone(pkg) {
    var v = (pkg.prewedding && pkg.prewedding.drone) || (pkg.wedding && pkg.wedding.drone);
    return '<td>' + bool(v) + '</td>';
  }
  function renderBundleAlbum(pkg) {
    var v = (pkg.wedding && pkg.wedding.album) || (pkg.prewedding && pkg.prewedding.album);
    return '<td style="font-size:12px">' + (v || no()) + '</td>';
  }

  function render(packages, type) {
    var cols = type === 'prewedding' ? PREWED_COLS : type === 'wedding' ? WEDDING_COLS : BUNDLE_COLS;
    var thead = document.getElementById('tableHead');
    var tbody = document.getElementById('tableBody');

    thead.innerHTML = '<tr>' + cols.map(function(c) {
      return '<th>' + c.label + '</th>';
    }).join('') + '</tr>';

    if (packages.length === 0) {
      tbody.innerHTML = '<tr><td colspan="' + cols.length + '" style="text-align:center;padding:32px;color:#6b7280">No packages match your filters.</td></tr>';
      return;
    }

    tbody.innerHTML = packages.map(function(pkg) {
      return '<tr>' + cols.map(function(col) {
        if (col.key === 'mua' && type === 'bundle') return renderBundleMUA(pkg);
        if (col.key === 'drone' && type === 'bundle') return renderBundleDrone(pkg);
        if (col.key === 'album' && type === 'bundle') return renderBundleAlbum(pkg);
        return renderCell(col, pkg, type);
      }).join('') + '</tr>';
    }).join('');
  }

  return { render: render };
})();
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bytedance/Desktop/prewed
git add js/table.js
git commit -m "feat: add table renderer"
```

---

## Task 7: js/tray.js

**Files:**
- Create: `prewed/js/tray.js`

Manages compare tray state and rendering. Exposes `TrayManager`.

- [ ] **Step 1: Write js/tray.js**

```javascript
var TrayManager = (function() {
  var MAX_COMBOS = 3;
  // Each combo: { prewed: pkg|null, wedding: pkg|null, bundle: pkg|null }
  var combos = [{ prewed: null, wedding: null, bundle: null }];
  var activeComboIndex = 0;
  var _packages = [];

  function init(packages) {
    _packages = packages;
    render();
  }

  function setPackages(packages) {
    _packages = packages;
  }

  function findPkg(id) {
    return _packages.find(function(p) { return p.id === id; });
  }

  function handleAdd(btn) {
    var id = btn.getAttribute('data-id');
    var slot = btn.getAttribute('data-slot'); // 'prewed' | 'wedding' | 'bundle'
    var pkg = findPkg(id);
    if (!pkg) return;

    var combo = combos[activeComboIndex];
    if (slot === 'bundle') {
      combo.bundle = pkg;
      combo.prewed = null;
      combo.wedding = null;
    } else if (slot === 'prewedding') {
      combo.prewed = pkg;
      combo.bundle = null;
    } else if (slot === 'wedding') {
      combo.wedding = pkg;
      combo.bundle = null;
    }
    render();
    updateAddButtons();
  }

  function removeFromCombo(comboIdx, slot) {
    var combo = combos[comboIdx];
    if (!combo) return;
    combo[slot] = null;
    render();
    updateAddButtons();
  }

  function removeCombo(comboIdx) {
    combos.splice(comboIdx, 1);
    if (combos.length === 0) combos = [{ prewed: null, wedding: null, bundle: null }];
    if (activeComboIndex >= combos.length) activeComboIndex = combos.length - 1;
    render();
    updateAddButtons();
  }

  function addCombo() {
    if (combos.length >= MAX_COMBOS) return;
    combos.push({ prewed: null, wedding: null, bundle: null });
    activeComboIndex = combos.length - 1;
    render();
  }

  function clearAll() {
    combos = [{ prewed: null, wedding: null, bundle: null }];
    activeComboIndex = 0;
    render();
    updateAddButtons();
  }

  function getTotalPrice(combo) {
    if (combo.bundle) return combo.bundle.price;
    var p = (combo.prewed ? combo.prewed.price : 0) + (combo.wedding ? combo.wedding.price : 0);
    return p;
  }

  function isComboReady(combo) {
    return combo.bundle || (combo.prewed && combo.wedding) || combo.prewed || combo.wedding;
  }

  function hasAnyReadyCombo() {
    return combos.some(isComboReady);
  }

  function pkgSummary(pkg, role) {
    if (!pkg) return '<span class="combo-empty">No ' + role + ' selected</span>';
    return '<div class="combo-pkg"><span class="combo-pkg-vendor">' + pkg.vendor + '</span><span class="combo-pkg-name">' + pkg.package + '</span></div>';
  }

  function render() {
    var container = document.getElementById('trayCombos');
    var compareBtn = document.getElementById('compareNowBtn');
    var addBtn = document.getElementById('addComboBtn');

    container.innerHTML = combos.map(function(combo, i) {
      var isActive = i === activeComboIndex;
      var total = getTotalPrice(combo);
      var html = '<div class="combo-slot' + (isActive ? ' active' : '') + '" onclick="TrayManager.setActive(' + i + ')">';
      html += '<div style="display:flex;flex-direction:column;gap:6px;flex:1">';
      html += '<span class="combo-slot-label">Combo ' + (i + 1) + (isActive ? ' (active)' : '') + '</span>';

      if (combo.bundle) {
        html += pkgSummary(combo.bundle, 'bundle') + '<span style="font-size:11px;color:#16a34a">Bundle ✓</span>';
      } else {
        html += '<div style="display:flex;gap:8px;align-items:center">';
        html += pkgSummary(combo.prewed, 'prewedding');
        html += '<span class="combo-divider">+</span>';
        html += pkgSummary(combo.wedding, 'wedding day');
        html += '</div>';
      }

      html += '</div>';
      if (total > 0) html += '<span class="combo-total">' + AppData.formatPrice(total) + '</span>';
      if (combos.length > 1) html += '<button class="combo-remove" onclick="event.stopPropagation();TrayManager.removeCombo(' + i + ')">✕</button>';
      html += '</div>';
      return html;
    }).join('');

    compareBtn.disabled = !hasAnyReadyCombo();
    addBtn.disabled = combos.length >= MAX_COMBOS;
  }

  function setActive(i) {
    activeComboIndex = i;
    render();
  }

  function updateAddButtons() {
    // Visual feedback: mark buttons as "added" if pkg is in tray
    var addedIds = {};
    combos.forEach(function(c) {
      if (c.prewed) addedIds[c.prewed.id] = true;
      if (c.wedding) addedIds[c.wedding.id] = true;
      if (c.bundle) addedIds[c.bundle.id] = true;
    });
    document.querySelectorAll('.btn-add').forEach(function(btn) {
      var id = btn.getAttribute('data-id');
      btn.classList.toggle('added', !!addedIds[id]);
      btn.textContent = addedIds[id] ? '✓ Added' : '+ Add';
    });
  }

  function getCombos() { return combos; }

  return {
    init: init,
    setPackages: setPackages,
    handleAdd: handleAdd,
    removeFromCombo: removeFromCombo,
    removeCombo: removeCombo,
    addCombo: addCombo,
    clearAll: clearAll,
    setActive: setActive,
    getCombos: getCombos,
    getTotalPrice: getTotalPrice
  };
})();
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bytedance/Desktop/prewed
git add js/tray.js
git commit -m "feat: add compare tray manager"
```

---

## Task 8: js/modal.js

**Files:**
- Create: `prewed/js/modal.js`

Renders the full-screen combo comparison modal. Exposes `CompareModal`.

- [ ] **Step 1: Write js/modal.js**

```javascript
var CompareModal = (function() {

  function open(combos) {
    var ready = combos.filter(function(c) {
      return c.bundle || c.prewed || c.wedding;
    });
    if (ready.length === 0) return;

    var body = document.getElementById('modalBody');
    body.innerHTML = renderGrid(ready);
    document.getElementById('modalOverlay').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    document.getElementById('modalOverlay').hidden = true;
    document.body.style.overflow = '';
  }

  function val(combo, getter) {
    if (combo.bundle) return getter(combo.bundle, 'bundle');
    return getter(combo, 'mix');
  }

  function getPkg(combo, side) {
    if (combo.bundle) return combo.bundle;
    return side === 'prewed' ? combo.prewed : combo.wedding;
  }

  function numericValues(combos, getter) {
    return combos.map(function(c) { return getter(c); });
  }

  function bestIdx(vals) {
    var max = Math.max.apply(null, vals.filter(function(v) { return v !== null && v !== undefined; }));
    return vals.indexOf(max);
  }
  function worstIdx(vals) {
    var min = Math.min.apply(null, vals.filter(function(v) { return v !== null && v !== undefined; }));
    return vals.indexOf(min);
  }

  function makeRow(label, combos, getter, isHigher, isPrice) {
    var vals = combos.map(getter);
    var numVals = vals.map(function(v) { return typeof v === 'number' ? v : null; });
    var hasNums = numVals.some(function(v) { return v !== null; });

    var best = -1, worst = -1;
    if (hasNums && combos.length > 1) {
      if (isHigher) {
        best = bestIdx(numVals);
        worst = worstIdx(numVals);
      } else {
        best = worstIdx(numVals); // lower is better (e.g. price)
        worst = bestIdx(numVals);
      }
    }

    var html = '<div class="grid-row-label">' + label + '</div>';
    combos.forEach(function(c, i) {
      var v = vals[i];
      var display = v === null || v === undefined ? '<span class="na">—</span>' : v;
      if (isPrice && typeof v === 'number') display = AppData.formatPrice(v);
      var cls = 'grid-cell';
      if (i === best && best !== worst) cls += ' best';
      else if (i === worst && best !== worst) cls += ' worst';
      html += '<div class="' + cls + '">' + display + '</div>';
    });
    return html;
  }

  function makeBoolRow(label, combos, getter) {
    var html = '<div class="grid-row-label">' + label + '</div>';
    combos.forEach(function(c) {
      var v = getter(c);
      html += '<div class="grid-cell">' + (v ? '<span style="color:#16a34a;font-size:18px">✓</span>' : '<span style="color:#d1d5db;font-size:18px">✗</span>') + '</div>';
    });
    return html;
  }

  function makeTextRow(label, combos, getter) {
    var html = '<div class="grid-row-label">' + label + '</div>';
    combos.forEach(function(c) {
      var v = getter(c);
      html += '<div class="grid-cell" style="font-size:12px;text-align:left">' + (v || '—') + '</div>';
    });
    return html;
  }

  function sectionHeader(label, span) {
    var html = '<div class="grid-section-label" style="grid-column:1">' + label + '</div>';
    for (var i = 0; i < span; i++) html += '<div class="grid-section-label"></div>';
    return html;
  }

  function vendorLabel(combo) {
    if (combo.bundle) return combo.bundle.vendor;
    var parts = [];
    if (combo.prewed) parts.push(combo.prewed.vendor + ' (prewed)');
    if (combo.wedding) parts.push(combo.wedding.vendor + ' (wedding)');
    return parts.join(' + ') || '—';
  }

  function renderGrid(combos) {
    var count = combos.length;
    var html = '<div class="comparison-grid" data-combos="' + count + '">';

    // Header row
    html += '<div class="grid-header-blank"></div>';
    combos.forEach(function(c, i) {
      var total = TrayManager.getTotalPrice(c);
      html += '<div class="grid-combo-header">';
      html += '<div class="combo-title">Combo ' + (i + 1) + '</div>';
      html += '<div class="combo-vendors">' + vendorLabel(c) + '</div>';
      if (total) html += '<div class="combo-price-total">' + AppData.formatPrice(total) + '</div>';
      html += '</div>';
    });

    // === PRICING ===
    html += sectionHeader('Pricing', count);
    html += makeRow('Total Price', combos, function(c) { return TrayManager.getTotalPrice(c); }, false, true);
    html += makeRow('Prewed Price', combos, function(c) { return c.bundle ? null : (c.prewed ? c.prewed.price : null); }, false, true);
    html += makeRow('Wedding Price', combos, function(c) { return c.bundle ? null : (c.wedding ? c.wedding.price : null); }, false, true);
    html += makeRow('Savings (bundle)', combos, function(c) { return c.bundle && c.bundle.savings ? AppData.formatPrice(c.bundle.savings) : null; }, true, false);

    // === PREWEDDING ===
    html += sectionHeader('Prewedding', count);
    html += makeTextRow('Vendor', combos, function(c) { return c.bundle ? c.bundle.vendor + ' (bundle)' : (c.prewed ? c.prewed.vendor : '—'); });
    html += makeTextRow('Package', combos, function(c) { return c.bundle ? c.bundle.package : (c.prewed ? c.prewed.package : '—'); });
    html += makeRow('Duration', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p && p.duration_hrs ? p.duration_hrs + ' hrs' : null;
    }, true, false);
    html += makeRow('Photographers', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p ? p.photographers : null;
    }, true, false);
    html += makeRow('Videographers', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p ? p.videographers : null;
    }, true, false);
    html += makeRow('Edited Photos', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p ? p.edited_photos : null;
    }, true, false);
    html += makeBoolRow('Raw Files', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p && p.raw_files;
    });
    html += makeTextRow('Video', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p ? p.video_notes : null;
    });
    html += makeBoolRow('Drone', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p && p.drone;
    });
    html += makeBoolRow('MUA', combos, function(c) {
      var p = c.bundle ? c.bundle.prewedding : c.prewed;
      return p && p.mua;
    });

    // === WEDDING DAY ===
    html += sectionHeader('Wedding Day', count);
    html += makeTextRow('Vendor', combos, function(c) { return c.bundle ? c.bundle.vendor + ' (bundle)' : (c.wedding ? c.wedding.vendor : '—'); });
    html += makeTextRow('Package', combos, function(c) { return c.bundle ? c.bundle.package : (c.wedding ? c.wedding.package : '—'); });
    html += makeRow('Duration', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w && w.duration_hrs ? w.duration_hrs + ' hrs' : null;
    }, true, false);
    html += makeRow('Photographers', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w ? w.photographers : null;
    }, true, false);
    html += makeRow('Videographers', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w ? w.videographers : null;
    }, true, false);
    html += makeRow('Edited Photos', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w ? w.edited_photos : null;
    }, true, false);
    html += makeBoolRow('Raw Files', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w && w.raw_files;
    });
    html += makeTextRow('Video', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w ? w.video_notes : null;
    });
    html += makeBoolRow('SDE', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w && w.video_sde;
    });
    html += makeBoolRow('Drone', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w && w.drone;
    });
    html += makeTextRow('Album', combos, function(c) {
      var w = c.bundle ? c.bundle.wedding : c.wedding;
      return w ? w.album : null;
    });

    // === COMBINED TOTALS ===
    html += sectionHeader('Combined Totals', count);
    html += makeRow('Total Edited Photos', combos, function(c) {
      var pw = c.bundle ? (c.bundle.prewedding && c.bundle.prewedding.edited_photos || 0) : (c.prewed ? c.prewed.edited_photos || 0 : 0);
      var wd = c.bundle ? (c.bundle.wedding && c.bundle.wedding.edited_photos || 0) : (c.wedding ? c.wedding.edited_photos || 0 : 0);
      return pw + wd || null;
    }, true, false);

    // === LOGISTICS ===
    html += sectionHeader('Logistics', count);
    html += makeBoolRow('Crew Transport Incl.', combos, function(c) {
      if (c.bundle) return c.bundle.prewedding && c.bundle.prewedding.crew_transport_included;
      return (c.prewed && c.prewed.crew_transport_included) || (c.wedding && c.wedding.crew_transport_included);
    });
    html += makeBoolRow('Crew Accom. Incl.', combos, function(c) {
      if (c.bundle) return c.bundle.prewedding && c.bundle.prewedding.crew_accommodation_included;
      return (c.prewed && c.prewed.crew_accommodation_included) || (c.wedding && c.wedding.crew_accommodation_included);
    });

    // === FLAGS & NOTES ===
    html += sectionHeader('Flags & Notes', count);
    html += makeTextRow('⚠️ Attention', combos, function(c) {
      var flags = [];
      if (c.bundle && c.bundle.attention_flags) flags = flags.concat(c.bundle.attention_flags);
      if (c.prewed && c.prewed.attention_flags) flags = flags.concat(c.prewed.attention_flags);
      if (c.wedding && c.wedding.attention_flags) flags = flags.concat(c.wedding.attention_flags);
      return flags.length ? flags.map(AppData.flagTooltip).join('; ') : 'None';
    });
    html += makeTextRow('Notes', combos, function(c) {
      var parts = [];
      if (c.bundle && c.bundle.notes) parts.push(c.bundle.notes);
      if (c.prewed && c.prewed.notes) parts.push('[Prewed] ' + c.prewed.notes);
      if (c.wedding && c.wedding.notes) parts.push('[Wedding] ' + c.wedding.notes);
      return parts.join(' | ') || '—';
    });

    html += '</div>'; // end grid
    return html;
  }

  return { open: open, close: close };
})();
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bytedance/Desktop/prewed
git add js/modal.js
git commit -m "feat: add comparison modal"
```

---

## Task 9: js/app.js

**Files:**
- Create: `prewed/js/app.js`

Orchestrates everything: loads data, binds events, handles tab switching.

- [ ] **Step 1: Write js/app.js**

```javascript
(function() {
  var currentTab = 'prewedding';
  var currentFilters = {
    location: 'all',
    maxPrice: 110000000,
    media: 'all',
    mua: false,
    drone: false,
    album: false,
    raw: false,
    hideFlags: false,
    minPhotos: 0
  };
  var currentSort = 'price-asc';
  var allPackages = [];

  function refresh() {
    var packages = AppData.getPackages(currentTab, currentFilters, currentSort);
    TableRenderer.render(packages, currentTab);
    TrayManager.setPackages(allPackages);

    var count = document.getElementById('resultCount');
    count.textContent = packages.length + ' package' + (packages.length !== 1 ? 's' : '') + ' shown';

    // Re-apply added state
    // (tray manager doesn't know about new buttons yet — trigger update)
    document.querySelectorAll('.btn-add').forEach(function(btn) {
      btn.classList.remove('added');
      btn.textContent = '+ Add';
    });
    // Highlight if already in tray
    var addedIds = {};
    TrayManager.getCombos().forEach(function(c) {
      if (c.prewed) addedIds[c.prewed.id] = true;
      if (c.wedding) addedIds[c.wedding.id] = true;
      if (c.bundle) addedIds[c.bundle.id] = true;
    });
    document.querySelectorAll('.btn-add').forEach(function(btn) {
      var id = btn.getAttribute('data-id');
      if (addedIds[id]) {
        btn.classList.add('added');
        btn.textContent = '✓ Added';
      }
    });
  }

  function bindEvents() {
    // Tabs
    document.querySelectorAll('.tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        currentTab = tab.getAttribute('data-tab');
        refresh();
      });
    });

    // Location chips
    document.querySelectorAll('#locationChips .chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        document.querySelectorAll('#locationChips .chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentFilters.location = chip.getAttribute('data-location');
        refresh();
      });
    });

    // Media chips
    document.querySelectorAll('#mediaChips .chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        document.querySelectorAll('#mediaChips .chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentFilters.media = chip.getAttribute('data-media');
        refresh();
      });
    });

    // Price range
    var priceRange = document.getElementById('priceRange');
    var priceDisplay = document.getElementById('priceDisplay');
    priceRange.addEventListener('input', function() {
      var val = parseInt(this.value);
      currentFilters.maxPrice = val;
      priceDisplay.textContent = val >= 110000000 ? 'Any' : AppData.formatPrice(val);
      refresh();
    });

    // Toggles
    document.getElementById('filterMUA').addEventListener('change', function() { currentFilters.mua = this.checked; refresh(); });
    document.getElementById('filterDrone').addEventListener('change', function() { currentFilters.drone = this.checked; refresh(); });
    document.getElementById('filterAlbum').addEventListener('change', function() { currentFilters.album = this.checked; refresh(); });
    document.getElementById('filterRaw').addEventListener('change', function() { currentFilters.raw = this.checked; refresh(); });
    document.getElementById('filterHideFlags').addEventListener('change', function() { currentFilters.hideFlags = this.checked; refresh(); });

    // Min photos
    document.getElementById('minPhotos').addEventListener('input', function() {
      currentFilters.minPhotos = parseInt(this.value) || 0;
      refresh();
    });

    // Sort
    document.getElementById('sortBy').addEventListener('change', function() {
      currentSort = this.value;
      refresh();
    });

    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', function() {
      currentFilters = { location: 'all', maxPrice: 110000000, media: 'all', mua: false, drone: false, album: false, raw: false, hideFlags: false, minPhotos: 0 };
      currentSort = 'price-asc';
      document.getElementById('priceRange').value = 110000000;
      document.getElementById('priceDisplay').textContent = 'Any';
      document.getElementById('minPhotos').value = '';
      document.getElementById('sortBy').value = 'price-asc';
      document.querySelectorAll('#locationChips .chip').forEach(function(c, i) { c.classList.toggle('active', i === 0); });
      document.querySelectorAll('#mediaChips .chip').forEach(function(c, i) { c.classList.toggle('active', i === 0); });
      ['filterMUA','filterDrone','filterAlbum','filterRaw','filterHideFlags'].forEach(function(id) { document.getElementById(id).checked = false; });
      refresh();
    });

    // Tray buttons
    document.getElementById('addComboBtn').addEventListener('click', function() {
      TrayManager.addCombo();
    });
    document.getElementById('clearTrayBtn').addEventListener('click', function() {
      TrayManager.clearAll();
      refresh();
    });
    document.getElementById('compareNowBtn').addEventListener('click', function() {
      CompareModal.open(TrayManager.getCombos());
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', CompareModal.close);
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
      if (e.target === this) CompareModal.close();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') CompareModal.close();
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', function() {
    AppData.load().then(function() {
      allPackages = AppData.getPackages('prewedding', {}, 'price-asc')
        .concat(AppData.getPackages('wedding', {}, 'price-asc'))
        .concat(AppData.getPackages('bundle', {}, 'price-asc'));
      TrayManager.init(allPackages);
      refresh();
      bindEvents();
    }).catch(function(err) {
      document.getElementById('tableBody').innerHTML =
        '<tr><td colspan="16" style="text-align:center;padding:32px;color:#ef4444">Failed to load vendor data: ' + err.message + '</td></tr>';
    });
  });
})();
```

- [ ] **Step 2: Commit**

```bash
cd /Users/bytedance/Desktop/prewed
git add js/app.js
git commit -m "feat: add app orchestration"
```

---

## Task 10: Local Verification

No test runner — verify manually in a browser.

- [ ] **Step 1: Serve the site locally**

```bash
cd /Users/bytedance/Desktop/prewed
python3 -m http.server 8000
```

Open http://localhost:8000 in a browser.

- [ ] **Step 2: Verify checklist**

Run through each check:

| Check | Expected |
|-------|----------|
| Page loads without console errors | ✓ |
| Prewedding tab shows table with rows | ✓ |
| Wedding tab shows different rows | ✓ |
| Bundle tab shows bundle rows | ✓ |
| Price filter slider narrows results | ✓ |
| Location chip "Bali" narrows to Bali vendors | ✓ |
| MUA toggle hides non-MUA packages | ✓ |
| Sort by Price ↓ reorders table | ✓ |
| Clear Filters resets everything | ✓ |
| [+ Add] button on prewedding row → appears in tray | ✓ |
| [+ Add] button on wedding row → appears in same combo | ✓ |
| Tray shows correct total price | ✓ |
| [+ New Combo] adds a second slot | ✓ |
| [Compare Now] opens modal | ✓ |
| Modal shows side-by-side grid | ✓ |
| Best value highlighted green | ✓ |
| ✕ closes modal | ✓ |
| ⚠️ flags appear with tooltip | ✓ |

- [ ] **Step 3: Fix any issues found, then commit**

```bash
cd /Users/bytedance/Desktop/prewed
git add -A
git commit -m "fix: browser verification fixes"
```

---

## Task 11: GitHub Pages Setup

- [ ] **Step 1: Create repo on GitHub**

Go to https://github.com/new and create a **public** repo named `prewed`. Do not add any files (no README, no .gitignore).

- [ ] **Step 2: Push to GitHub**

```bash
cd /Users/bytedance/Desktop/prewed
git remote add origin https://github.com/<YOUR_USERNAME>/prewed.git
git branch -M main
git push -u origin main
```

Replace `<YOUR_USERNAME>` with your actual GitHub username.

- [ ] **Step 3: Enable GitHub Pages**

1. Go to the repo on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select: Deploy from a branch → Branch: `main` → Folder: `/ (root)`
4. Click **Save**

- [ ] **Step 4: Verify deployment**

Wait ~60 seconds, then visit:
```
https://<YOUR_USERNAME>.github.io/prewed
```

The site should load. If you see a 404, wait another minute and refresh.

- [ ] **Step 5: Final commit**

```bash
cd /Users/bytedance/Desktop/prewed
git tag v1.0.0
git push --tags
```

---

## Self-Review Checklist

**Spec coverage:**
- ✓ Sticky filter bar with all 9 filters
- ✓ Three tabs: Prewedding / Wedding / Bundle
- ✓ All table columns per spec (prewed, wedding, bundle)
- ✓ Compare tray with max 3 combos, active combo indicator
- ✓ Combo comparison modal with section groups and best/worst highlighting
- ✓ Attention flags with tooltips
- ✓ No build step, pure static files
- ✓ GitHub Pages deployment instructions
- ✓ All 12 vendors covered via vendors.json task

**Placeholder scan:** None — all tasks contain complete code.

**Type consistency:**
- `AppData.getPackages(type, filters, sort)` — consistent across data.js and app.js
- `TrayManager.handleAdd(btn)` — called via `onclick` in table.js, defined in tray.js
- `CompareModal.open(combos)` — called in app.js, defined in modal.js
- `TrayManager.getCombos()` — called in modal.js and app.js
- `TrayManager.getTotalPrice(combo)` — called in modal.js, defined in tray.js
- All consistent.
