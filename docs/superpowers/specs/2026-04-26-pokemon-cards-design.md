# Pokemon Card Store — Design Spec
**Date:** 2026-04-26
**Status:** Approved

## Overview

Transform the existing aFFiRM t-shirt store into a Pokemon card store. Keep the existing visual style (3D R3F carousel on desktop, Swiper coverflow on mobile, dark/light theme). Add a role-based dashboard, card filtering/search on the storefront, and an admin panel that uses the pokemontcg.io API to add cards.

---

## 1. Data Model (localStorage)

### `affirm_cards` — store inventory
```js
{
  id: string,          // pokemontcg.io card id (e.g. "base1-4")
  name: string,        // from API
  image: string,       // from API (card.images.large)
  set: string,         // from API (set.name)
  series: string,      // from API (set.series)
  rarity: string,      // from API
  types: string[],     // from API
  price: number,       // manual (admin sets)
  condition: string,   // manual: NM | LP | MP | HP | D
  stock: number,       // manual (admin sets)
  addedAt: number,     // timestamp
}
```

### `affirm_orders` — order log
```js
{
  id: string,
  userId: string,      // hardcoded user id
  cardId: string,
  cardName: string,
  quantity: number,
  price: number,
  status: string,      // pending | confirmed | shipped | completed
  notes: string,
  createdAt: number,   // timestamp
}
```

### Hardcoded accounts (no passwords — MVP role selector)
```js
const ACCOUNTS = [
  { id: 'admin',    role: 'admin', name: 'Admin' },
  { id: 'customer', role: 'user',  name: 'Customer' },
]
```

---

## 2. Auth & Navigation

### Auth modal
- Triggered by "Dashboard" navbar button when not logged in
- Shows two large buttons: **Admin** and **Customer**
- Selecting one sets auth state (React state only — resets on page reload)
- On select: closes modal, switches `activeSection` to `'dashboard'`

### Navbar changes
- Add **Dashboard** button (right side of existing nav items)
- When logged in: show username + **Logout** button
- Logout clears auth state and returns to `'shop'` section

### Section routing (state-based, existing pattern)
| `activeSection` | Renders |
|---|---|
| `shop` | Pokemon card carousel + search/filter |
| `gallery` | Inventory card showcase carousel |
| `dashboard` | Role-based dashboard (admin or user view) |

---

## 3. Storefront

### Shop section
- Replaces hardcoded `products` array with `affirm_cards` from localStorage
- **Desktop**: existing 3D R3F carousel — card images (from `card.images.large`) used as textures
- **Mobile**: existing Swiper coverflow carousel
- **Product detail panel** (shown on card focus/click): name, set, rarity, condition, price, stock, "Contact to Buy" button (scrolls to Footer)

### Search & filter UI
- Positioned above the carousel
- **Search input**: filters visible cards by name (real-time, case-insensitive)
- **3 dropdowns**: Set, Rarity, Type — populated dynamically from current inventory values (not hardcoded)
- All filters are AND-combined (a card must match all active filters)
- **Desktop**: search input + 3 dropdowns displayed inline in a row
- **Mobile**: single "Filter" toggle button that expands a panel containing search + dropdowns

### Gallery section
- Replaces static image array with `affirm_cards` from localStorage (images only)
- Same Swiper coverflow component, renders `card.images.large` instead of art photos
- Clicking a gallery card navigates to `'shop'` section (no specific card pre-selection)

---

## 4. Admin Dashboard

### Inventory tab
1. **Search bar** — queries pokemontcg.io API (`https://api.pokemontcg.io/v2/cards?q=name:*{query}*`), debounced 500ms
2. **Results grid** — card image, name, set, rarity; clicking a result opens the Add Card form
3. **Add Card form** — pre-filled from API: name, image, set, rarity, types; manual fields: price (number), condition (select: NM/LP/MP/HP/D), stock (number); Submit saves to localStorage
4. **Inventory list** — below search: cards currently in inventory with image, name, price, stock, condition, and a Delete button

### Orders tab
1. **Log Order button** — opens form: user (select hardcoded users), card (select from inventory), quantity, price, status, notes; Submit appends to `affirm_orders` in localStorage
2. **Orders table** — all orders: user, card name, qty, price, status (inline editable dropdown), date, notes; status changes saved to localStorage immediately

---

## 5. Customer Dashboard

- Single read-only view of orders where `userId` matches logged-in customer
- Shows: card image (small), card name, quantity, price, status badge (color-coded), date, notes
- Status badge colors: pending=yellow, confirmed=blue, shipped=purple, completed=green
- Empty state: "No orders yet — contact us to buy cards"

---

## 6. New Files / Components

| File | Purpose |
|---|---|
| `src/contexts/AuthContext.jsx` | Auth state: current user, login/logout |
| `src/hooks/useLocalStorage.js` | Generic localStorage hook |
| `src/hooks/usePokemonTCG.js` | Debounced API search against pokemontcg.io |
| `src/components/AuthModal.jsx` | Role-selector modal |
| `src/components/dashboard/AdminDashboard.jsx` | Admin view wrapper (Inventory + Orders tabs) |
| `src/components/dashboard/InventoryTab.jsx` | API search + add card + inventory list |
| `src/components/dashboard/OrdersTab.jsx` | Log order + orders table |
| `src/components/dashboard/CustomerDashboard.jsx` | Customer order history |
| `src/components/CardFilters.jsx` | Search input + filter dropdowns (desktop inline, mobile collapsible) |

### Modified files
| File | Change |
|---|---|
| `src/App.jsx` | Add AuthContext, dashboard section, auth modal trigger |
| `src/components/navbar.jsx` | Add Dashboard button, login state display, logout |
| `src/components/ProductCarousel.jsx` | Replace hardcoded products with localStorage cards + wire CardFilters |
| `src/components/MobileCarousel.jsx` | Update product item renderer for Pokemon card fields |
| `src/components/GalleryCarousel.jsx` | Replace static images with inventory card images |

---

## 7. External API

**pokemontcg.io v2** — no API key required for basic usage (100 req/day free without key, 20,000/day with free key).

- Search: `GET https://api.pokemontcg.io/v2/cards?q=name:*{query}*&pageSize=20`
- Response fields used: `id`, `name`, `images.large`, `set.name`, `set.series`, `rarity`, `types`

---

## 8. Out of Scope (MVP)

- Real authentication / passwords
- Payment processing
- Backend / database
- Card price history
- Multiple customer accounts
- Email notifications
