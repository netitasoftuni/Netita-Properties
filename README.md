# Netita Properties - Development Guide

## Project Overview
Netita Properties is a responsive real estate website built with vanilla HTML5, CSS3, and JavaScript. It includes a small local Node/Express server that:

- Serves the static site
- Exposes a JSON API for the bundled property dataset
- Provides an optional AI insights endpoint for analyzing `imoti.net` URLs

---

## Copilot Agents (Repo Guidance)

This repo includes GitHub Copilot instruction + prompt files to keep contributions aligned with the project's strict vanilla architecture.

- Copilot global instructions: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- Project plans: [.github/plans/](.github/plans/) (one plan per file: `YYYY-MM-DD - Title.md`)
- Agent prompts:
   - Backend: [.github/agents/BackendExpertAgent.agent.md](.github/agents/BackendExpertAgent.agent.md)
   - Frontend: [.github/agents/FrontendExpertAgent.agent.md](.github/agents/FrontendExpertAgent.agent.md)
- Copilot prompt templates:
   - Strict code review/explain: [.github/prompts/Explain-Code-Strict.prompt.md](.github/prompts/Explain-Code-Strict.prompt.md)
   - Beginner-friendly code explain: [.github/prompts/Explain-Code-Netita.prompt.md](.github/prompts/Explain-Code-Netita.prompt.md)

```
.github/
│
├── copilot-instructions.md
├── plans/
├── prompts/
│  ├── Explain-Code-Netita.prompt.md
│  └── Explain-Code-Strict.prompt.md
└── agents/
   ├── BackendExpertAgent.agent.md
   └── FrontendExpertAgent.agent.md
```

---

## AI Property Intelligence (imoti.net) — Local API

This project now includes an optional local API endpoint to analyze a public `imoti.net` listing URL and return **insights only**.

**Key constraints (enforced by design):**
- Does **not** store raw HTML pages.
- Does **not** republish listing descriptions or images.
- Extracts only minimal structured numeric fields in-memory and returns computed insights JSON.

### Run locally

Prerequisites:
- Node.js 18+ (required for built-in `fetch`)

Commands:
- Install: `npm install`
- Run site + API: `npm run dev`

Smoke test (PowerShell, server running):
- `npm run smoke`

Optional env vars for the smoke test:
- `NETITA_BASE_URL` (default: `http://localhost:5173`)
- `IMOTI_TEST_URL` (optional; if set, tests `POST /api/imoti/analyze`)

Windows note:
- If PowerShell blocks `npm` scripts, see [server/README_LOCAL_SETUP.md](server/README_LOCAL_SETUP.md).

Open:
- The server prints the exact URL (default is `http://localhost:5173`).
- If port `5173` is busy, it automatically retries `5174`, `5175`, etc.

API:
- `POST /api/imoti/analyze` with JSON body: `{ "url": "https://www.imoti.net/..." }`

---

## Admin Panel (Properties CRUD)

This project includes a minimal Admin page for creating, editing, and deleting properties.

Open (server running):
- `http://localhost:5173/admin.html`

### Authentication (Basic Auth)

Admin access is protected by HTTP Basic Auth **only when** both environment variables are set:
- `ADMIN_USER`
- `ADMIN_PASS`

Windows PowerShell:
- `$env:ADMIN_USER = "admin"`
- `$env:ADMIN_PASS = "change-me"`
- `npm run dev`

Windows CMD:
- `set ADMIN_USER=admin`
- `set ADMIN_PASS=change-me`
- `npm run dev`

Protected endpoints:
- `GET /admin.html`
- `POST /api/properties`
- `PATCH /api/properties/:id`
- `DELETE /api/properties/:id`

### Offline mode (no server)

If you open `admin.html` directly (file://) or the API is unavailable, the Admin page switches to offline mode:
- Reads the initial list from `data/properties.js`
- Saves edits to browser `localStorage`

Note: offline edits do not update `server/data/properties.json` (since the server is not running).

## Properties Dataset API (Local)

The app now loads property listings from the local API:

- `GET /api/properties` — all properties
- `GET /api/properties/:id` — one property
- `POST /api/properties` — create (JSON persistence)
- `PATCH /api/properties/:id` — update (JSON persistence)
- `DELETE /api/properties/:id` — delete (JSON persistence)

### Where the data lives

The server persists properties to a local JSON file:

- [server/data/properties.json](server/data/properties.json)

On first run, if the JSON file does not exist, it is automatically **seeded** from the bundled dataset:

- [data/properties.js](data/properties.js)

To add/edit properties right now (test project / no DB):

Option A (recommended now): use the API routes above (POST/PATCH/DELETE). Changes are saved to [server/data/properties.json](server/data/properties.json).

Option B (seed reset): delete [server/data/properties.json](server/data/properties.json) and restart `npm run dev` to re-seed from [data/properties.js](data/properties.js).

### Frontend flow

- Paste an `https://imoti.net/...` URL into the home page hero search and press **Search**.
- The app routes to `property-details.html?imotiUrl=...` and displays the returned insights.

---

## Phase 1: Project Setup & Foundation ✓ COMPLETED

### Folder Structure Created
```
Netita Properties/
├── index.html              # Home page
├── css/
│   └── style.css          # Main stylesheet with design system
├── js/
│   └── main.js            # Application entry point and modules
├── data/
│   └── properties.js      # Static property database (20 properties)
└── assets/
    ├── images/            # Property images (placeholder)
    └── icons/             # SVG icons (for future use)
```

### Files Created

#### 1. **index.html** - Home Page
- Semantic HTML5 structure
- Meta tags for responsiveness and SEO
- Header with logo, navigation, and mobile hamburger menu
- Hero section with search bar
- Featured properties grid (displays first 6 properties)
- "How It Works" section with 3-step guide
- Call-to-action banner
- Footer with contact info and links
- Script imports in proper order

#### 2. **css/style.css** - Design System & Styles
**Contains:**
- CSS Reset & normalization
- Complete CSS variable system (colors, typography, spacing, shadows)
- Responsive typography scale (xs to 5xl)
- Modular component styles:
  - Header & Navigation
  - Hero section
  - Search bar
  - Property cards with hover effects
  - Grid layouts
  - Buttons (primary, secondary, outline)
  - Footer
  - "How It Works" cards
  - Skeleton loading animation
- Mobile-first responsive breakpoints (768px, 480px)
- Accessibility considerations

**CSS Variables:**
- **Colors:** Primary, secondary, text, background, borders, shadows
- **Typography:** Font families, sizes (16 scale levels), weights, line heights
- **Spacing:** 8-point spacing scale
- **Borders:** Border radius scale (sm to full)
- **Shadows:** sm to xl shadow variants
- **Transitions:** Fast, base, slow animation timings
- **Z-Index:** Layering system for headers, modals, tooltips

#### 3. **js/main.js** - Application Logic
**Modules:**

1. **NavigationHandler**
   - Toggles mobile hamburger menu
   - Updates active nav links based on current page
   - Closes menu on link click

2. **PropertyCardFactory**
   - Creates HTML elements for property cards
   - Includes all property data: price, address, beds, baths, sqft
   - Adds click handlers for navigation to property details
   - Placeholder image fallback

3. **FeaturedPropertiesHandler**
   - Renders first 6 properties on home page
   - Clears skeleton loading states

4. **HeroSearchHandler**
   - Handles hero search bar input
   - Redirects to listings page with search query parameter

5. **Utilities**
   - `debounce()` - Rate-limit function calls
   - `getQueryParams()` - Parse URL query parameters
   - `formatCurrency()` - Format numbers as currency
   - `formatNumber()` - Format numbers with commas

**Initialization:**
- Auto-initializes on DOM ready
- Exposes modules globally via `window.APP` for other pages

#### 4. **data/properties.js** - Property Database
**Contains 20 sample properties with:**
- `id` - Unique property identifier
- `address` - Street address
- `location` - Neighborhood/district
- `price` - Property price
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `sqft` - Square footage
- `image` - Image URL (placeholder)
- `yearBuilt` - Construction year
- `type` - Property type (Studio, Apartment, House, etc.)
- `description` - Property description
- `amenities` - Array of amenities
- `listingDate` - Listing date

---

## How It Works - Phase 1 Architecture

### Data Flow
1. **Server** (`server/server.js`) serves the static site and the API
2. **Properties Data** is fetched from `GET /api/properties` (with a fallback to load `data/properties.js` dynamically when the API is unavailable)
2. **CSS** (`css/style.css`) applies design system and component styles
3. **JavaScript** (`js/main.js`) initializes when DOM is ready
4. Modules render components and handle user interactions

### Component System
- **Modular design** - Each feature has its own module
- **Utilities** - Shared helper functions for all pages
- **Factory pattern** - PropertyCardFactory creates consistent UI elements
- **Global API** - `window.APP` exposes all modules to other pages

### Responsive Design Strategy
- Mobile-first CSS approach
- Flexible grid layouts using CSS Grid
- Breakpoints: Mobile (< 480px), Tablet (< 768px), Desktop (> 768px)
- Touch-friendly button sizes and spacing
- Viewport meta tag for proper mobile scaling

---

## Key Features Implemented in Phase 1

✓ Responsive HTML5 semantic structure  
✓ Complete CSS design system with variables  
✓ Mobile hamburger menu with toggle  
✓ Featured properties grid rendering  
✓ Hero search bar with redirect  
✓ Property card component factory  
✓ Placeholder image fallback handling  
✓ Static property database (20 properties)  
✓ Utility functions (debounce, formatting, query params)  
✓ Mobile-responsive breakpoints  
✓ Footer with contact information  
✓ Skeleton loading states  

---

## Next Steps - Phase 2

The home page foundation is ready. Next phase will add:
- Full header integration with navigation
- Mobile menu animations
- Featured properties rendering
- Hero section interactions

To test Phase 1, simply open `index.html` in your browser.

---

## JavaScript Modules Quick Reference

```javascript
// Navigation
NavigationHandler.init()           // Initialize nav
NavigationHandler.toggleMenu()     // Toggle mobile menu

// Properties
PropertyCardFactory.createCard()   // Create property card element
FeaturedPropertiesHandler.init()   // Render featured properties

// Search
HeroSearchHandler.init()           // Initialize hero search

// Utilities
Utilities.debounce(fn, 300)        // Debounce function
Utilities.getQueryParams()         // Get URL params
Utilities.formatCurrency(value)    // Format as currency
Utilities.formatNumber(value)      // Format with commas

// Global API
window.APP.properties              // All properties data
window.APP.Utilities               // Utilities module
window.APP.PropertyCardFactory     // Card factory
```

---

## Development Notes

- **Frontend** - Pure vanilla JavaScript, HTML5, CSS3
- **Backend (local)** - Node.js + Express (see `npm run dev`)
- **Browser support** - Modern browsers (Chrome, Firefox, Safari, Edge)
- **Data source** - Served via local API (`GET /api/properties`) backed by [data/properties.js](data/properties.js)
- **Image handling** - Placeholder URLs with fallback support
- **Performance** - Minimal, optimized CSS with CSS variables
- **Accessibility** - Semantic HTML, ARIA labels, keyboard navigation support

---

## Ready for Phase 2!

All foundation files are in place and the home page is fully structured. The CSS design system is complete and ready for styling additional pages. The JavaScript module architecture is set up for easy expansion.

Proceed to Phase 2 when ready to add full header styling and interactions.
