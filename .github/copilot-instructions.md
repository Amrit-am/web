# Copilot Instructions for Quality Lifestyle Admin Codebase

## Overview
This is a Node.js/Express-based e-commerce admin panel. The workspace is organized for both admin and user-facing features, with a focus on product management, authentication, and order handling. The admin dashboard is in the `admin/` directory, with product management in `admin/product management/` and main product logic in `admin/products.html` and related JS files.

## Architecture & Data Flow
- **Frontend:** HTML/CSS/JS (Bootstrap for UI) in `admin/` and root directory. Product management UI is in `admin/products.html`.
- **Backend:** API endpoints (likely Express) at `http://localhost:5000/api/products` for CRUD operations. Image uploads use `/api/upload`.
- **Data:** Products are stored in a database (not shown here), with sample data in `products.json`.
- **Communication:** Frontend fetches data via REST API calls (see `fetchProducts`, `add/edit/delete product` in `products.html`).

## Developer Workflows
- **Start Backend:** Likely `node server.js` or `npm start` from project root. Confirm API port (default: 5000).
- **Frontend:** Open HTML files directly in browser. For admin, use `admin/products.html`.
- **Product CRUD:** All product actions (add, edit, delete, status toggle) are handled via API calls in `products.html`.
- **Image Uploads:** Handled via `/api/upload` endpoint using FormData.

## Project-Specific Patterns
- **Product Table Rendering:** See `renderProducts` in `products.html`. Uses dynamic DOM manipulation.
- **Search:** Client-side filtering of product table rows by text input (`searchInput`).
- **Modal Forms:** Product add/edit uses Bootstrap modal (`productModal`). Form reset and label update handled on modal open.
- **Status Toggle:** Product status (active/inactive) toggled via PATCH to `/api/products/:id/status`.
- **File Organization:**
  - Admin UI: `admin/`
  - Product management: `admin/product management/`
  - Shared assets: `assets/images/`
  - Styles: `styles.css`, `admin/css/style.css`

## External Dependencies
- **Bootstrap:** For UI components.
- **Bootstrap Icons:** For iconography.
- **API:** Assumes Express backend running on port 5000.

## Conventions
- **API URLs:** Hardcoded in JS (`API_URL`). Update if backend port changes.
- **Image Handling:** Prefer image upload, fallback to URL input.
- **Status Badges:** Use Bootstrap badge classes for product status.
- **Event Delegation:** Table actions (edit/delete/toggle) use event delegation on `#productsTable`.

## Key Files
- `admin/products.html`: Main admin product management UI and logic.
- `server.js`: Backend server entry point (not shown, but implied).
- `products.json`: Sample product data.
- `admin/product management/app.js`: Additional product management logic (see if needed).

## Example: Adding a Product
1. Click "Add Product" (opens modal).
2. Fill form, upload image or paste URL.
3. On submit, JS sends POST to API, then refreshes table.

---

**For AI agents:**
- Always update both UI and backend when making product-related changes.
- Use event delegation for table actions.
- Keep API URLs in sync with backend port.
- Follow Bootstrap conventions for UI consistency.

---

If any section is unclear or missing, please provide feedback for further refinement.
