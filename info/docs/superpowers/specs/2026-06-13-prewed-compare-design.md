# Wedding Vendor Comparison Website — Design Spec
**Date:** 2026-06-13
**Published at:** `yourusername.github.io/prewed`

---

## 1. Purpose

A static comparison website to help compare wedding photography vendors across prewedding and wedding day packages. Supports both single-vendor (bundle) and cross-vendor (mix-and-match) comparisons. Designed for a decision-making audience that hasn't yet decided what they want — all options shown, all filters configurable.

---

## 2. Repository Structure

```
prewed/                         ← GitHub repo root
├── index.html                  ← single-page app entry point
├── css/
│   └── style.css               ← all styling
├── js/
│   └── app.js                  ← all application logic
├── data/
│   └── vendors.json            ← structured vendor data parsed from txt files
└── README.md
```

Deployed via GitHub Pages from the `main` branch root.
No build step. No frameworks. Pure HTML + CSS + vanilla JS.

---

## 3. Data Model

### 3.1 Package Entry (prewedding or wedding)

```json
{
  "id": "galilea-full-day-wedding",
  "vendor": "Galilea",
  "package": "Full Day Wedding",
  "type": "wedding",
  "location": ["Bali"],
  "price": 30000000,
  "duration_hrs": 15,
  "photographers": 2,
  "videographers": 2,
  "edited_photos": 400,
  "raw_files": true,
  "video_highlight_min": 10,
  "video_teaser_min": 1,
  "video_sde": true,
  "drone": false,
  "mua": false,
  "stylist": false,
  "album": "30x20cm, 40 pages",
  "crew_transport_included": true,
  "crew_accommodation_included": true,
  "delivery_photos_weeks": null,
  "delivery_video_weeks": null,
  "exclusions": ["meals", "location fees", "couple transport"],
  "attention_flags": [],
  "notes": "Free Same Day Edit video + 6 rolls analog film included."
}
```

### 3.2 Bundle Entry

```json
{
  "id": "galilea-asmaradana",
  "vendor": "Galilea",
  "package": "Asmaradana Package",
  "type": "bundle",
  "price": 42000000,
  "prewedding": { ...same fields as a prewedding package... },
  "wedding": { ...same fields as a wedding package... },
  "savings": 0,
  "attention_flags": [],
  "notes": "NEW package."
}
```

### 3.3 Attention Flags

Sourced from `attention.txt`. Each package that has a flag carries a short string in `attention_flags[]`, e.g.:
- `"price_list_possibly_outdated"` → biggest_moment, rawproject
- `"promo_may_be_expired"` → pattivana
- `"limited_offer"` → mantara, mnln
- `"open_trip_dates_passed"` → galilea

These render as a ⚠️ icon in the table with a tooltip.

### 3.4 Vendors Covered

12 vendors: bare_ods, biggest_moment, eclat, galilea, mantara, memography, mnln, pattivana, perpetual, pl_photo, rawproject, slowhand

---

## 4. Page Layout

Single HTML page. Three zones:

```
┌─────────────────────────────────────────────┐
│  HEADER — logo/title + filter bar (sticky)  │
├─────────────────────────────────────────────┤
│  TAB BAR: [Prewedding] [Wedding] [Bundles]  │
├─────────────────────────────────────────────┤
│                                             │
│  COMPARISON TABLE (scrollable)              │
│  Rows = packages, filtered by active tab    │
│  Each row has [+ Add to Tray] button        │
│                                             │
├─────────────────────────────────────────────┤
│  COMPARE TRAY (pinned bottom, collapsible)  │
│  Combo 1: [Prewed pkg] + [Wedding pkg]      │
│  Combo 2: [Bundle]                          │
│  [Compare Now →]                            │
└─────────────────────────────────────────────┘
```

---

## 5. Filter Bar

Sticky below the header. Filters apply to the active tab's table.

| Filter | UI Element | Applies To |
|--------|------------|------------|
| Location | Multi-select chips: Bali / Jakarta / Surabaya / Overseas / Other | All tabs |
| Price range | Dual-handle slider (IDR 0 – IDR 110,000,000) | All tabs |
| Media type | 3-way toggle: Photo only / Video only / Photo+Video | Prewed, Wedding |
| MUA included | Toggle (on/off) | Prewed |
| Drone included | Toggle (on/off) | Prewed, Wedding |
| Album included | Toggle (on/off) | Wedding, Bundle |
| Raw files | Toggle (on/off) | All tabs |
| Min edited photos | Number input | All tabs |
| Sort by | Dropdown: Price ↑, Price ↓, Photos ↑, Duration ↑ | All tabs |
| Show flagged | Toggle: hide ⚠️ items | All tabs |

Active filter count shown as a badge. "Clear all" resets everything.

---

## 6. Comparison Tables

### 6.1 Prewedding Table Columns

| Column | Display |
|--------|---------|
| Vendor | Text, bold |
| Package | Text |
| Location | Chips |
| Price | IDR formatted |
| Duration | e.g. "12 hrs" |
| Photographers | Number |
| Videographers | Number |
| Edited Photos | Number |
| Raw Files | ✓ / ✗ |
| Video | e.g. "3 min highlight + 1 min teaser" |
| Drone | ✓ / ✗ |
| MUA | ✓ / ✗ |
| Stylist | ✓ / ✗ |
| Crew costs | e.g. "Transport + Accom included" |
| Flags | ⚠️ icon with tooltip |
| Add | [+ Prewed] button |

### 6.2 Wedding Day Table Columns

| Column | Display |
|--------|---------|
| Vendor | Text, bold |
| Package | Text |
| Location | Chips |
| Price | IDR formatted |
| Duration | e.g. "15 hrs (full day)" |
| Photographers | Number |
| Videographers | Number |
| Edited Photos | Number |
| Raw Files | ✓ / ✗ |
| Video | e.g. "SDE + 10 min highlight" |
| Drone | ✓ / ✗ |
| Album | e.g. "30x20cm, 40 pages" or ✗ |
| SDE | ✓ / ✗ |
| Crew costs | Included / excluded |
| Flags | ⚠️ icon with tooltip |
| Add | [+ Wedding] button |

### 6.3 Bundles Table Columns

| Column | Display |
|--------|---------|
| Vendor | Text |
| Package | Text |
| Total Price | IDR formatted |
| Savings | e.g. "Save IDR 4,500,000" (green) |
| Prewed Duration | hrs |
| Wedding Duration | hrs |
| Total Edited Photos | Prewed + Wedding summed |
| Video (Prewed) | Summary |
| Video (Wedding) | Summary |
| MUA | ✓ / ✗ |
| Drone | ✓ / ✗ |
| Album | text or ✗ |
| Flags | ⚠️ |
| Add | [+ Bundle] button |

---

## 7. Compare Tray

Pinned to bottom of viewport. Hidden when empty, visible when ≥1 combo is building.

### 7.1 Combo Slots

- Max 3 combos simultaneously.
- Each combo is a column in the tray.
- A combo is built by:
  - Clicking [+ Prewed] on a prewedding package → fills slot A of active combo
  - Clicking [+ Wedding] on a wedding package → fills slot B of active combo
  - OR clicking [+ Bundle] → fills both slots with one bundle
- Each combo shows: vendor name(s), total price, and a × remove button.
- [+ New Combo] button to start a second/third combo.

### 7.2 Actions

- [Compare Now →] → opens full-screen comparison modal
- [Clear Tray] → resets all combos

---

## 8. Combo Comparison Modal

Full-screen overlay. One column per combo (max 3). Rows cover every comparable attribute.

### 8.1 Row Groups

**Pricing**
- Total price (highlighted, large)
- Prewedding price
- Wedding price
- Savings vs separate booking (if bundle)

**Prewedding**
- Vendor
- Package
- Duration
- Photographers
- Videographers
- Edited photos
- Raw files
- Video (highlight + teaser durations)
- Drone
- MUA
- Stylist
- Location

**Wedding Day**
- Vendor (may differ from prewed vendor)
- Package
- Duration
- Photographers
- Videographers
- Edited photos
- Raw files
- Video (SDE + highlight + teaser)
- Drone
- Album
- SDE

**Combined Totals**
- Total edited photos (prewed + wedding)
- Total video deliverables (all clips)

**Logistics**
- Crew transport included?
- Crew accommodation included?
- Exclusions (what client pays for)
- Delivery timelines

**Flags & Notes**
- Attention flags with full text
- Additional notes

### 8.2 Highlighting

- Best value per row highlighted in green
- Worst value per row highlighted in light red
- Applies to: price, photos count, video duration, crew size

---

## 9. Styling

- Clean, minimal aesthetic — white background, dark text, light borders
- Font: system-ui (no external font dependency)
- Color palette:
  - Accent: soft rose/blush (#d4a0a0 or similar) — fits wedding theme
  - ✓ icons: green
  - ✗ icons: light gray
  - ⚠️ flags: amber
  - Best value highlight: light green bg
  - Worst value: light red bg
- Mobile: tables horizontally scrollable, tray collapses to icon

---

## 10. GitHub Pages Deployment

- Repo name: `prewed` → published at `https://<username>.github.io/prewed`
- Branch: `main`, source: root `/`
- No build step — index.html served directly
- Setup steps for user:
  1. Create repo `prewed` on GitHub (public)
  2. Push all files
  3. In repo Settings → Pages → Source: Deploy from branch `main` / `/ (root)`
  4. Site live in ~60 seconds

---

## 11. Out of Scope

- User accounts / login
- Saving comparisons across sessions (no backend)
- Editing vendor data in the UI
- Multi-language support
- Booking / contact forms

---

## 12. Open Questions

- None — all design decisions confirmed with user.
