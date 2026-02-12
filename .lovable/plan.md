

# Watch Hub -- Enhanced Search, Google AdSense Ads, and Rebranding

Three changes: improve the search page with trending content, integrate Google AdSense ads styled like movie cards, and rename the project from "WatchLog" to "Watch Hub".

---

## 1. Improved Search Page with Trending Content

When the search page loads (and no search has been performed), it will display a curated "Trending" section showing popular movies and series. This uses the existing `getTrending` function in `useOmdbSearch.tsx`, which fetches results for popular titles.

**Changes:**
- Load trending content automatically on mount via `useEffect`
- Show a "Trending" heading when displaying default results
- Expand the curated list of popular searches to include more diverse, well-known titles (e.g., Stranger Things, Oppenheimer, Dune, The Bear, Squid Game, etc.)
- Fetch 2-3 results per title instead of just the first, for a richer grid (up to 20 results)

## 2. Google AdSense Integration

Ads will be integrated in two places, styled to blend with the movie card grid:

- **Search results grid**: An ad unit inserted every 8-10 cards
- **Watchlist grid**: An ad unit inserted periodically

Each ad will be wrapped in a container that matches the movie card dimensions (same aspect ratio and rounded corners) so it looks native.

**Setup required from you:**
- You need a Google AdSense account and your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)
- After approval, you'll also need **Ad Slot IDs** for each ad unit
- Until then, placeholder containers will show where ads will appear

**Changes:**
- Add the AdSense script tag to `index.html`
- Create an `AdCard` component that matches the `MovieCard` dimensions and styling
- Insert `AdCard` components at regular intervals in the search and watchlist grids

## 3. Rename to "Watch Hub"

All references to "WatchLog" / "Watching Hub" will be updated to "Watch Hub":

- `index.html`: title, meta tags, author, OG/Twitter tags
- `src/components/Header.tsx`: logo text
- `src/pages/Auth.tsx`: login page branding

---

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `index.html` | Add AdSense script; update all title/meta to "Watch Hub" |
| `src/components/Header.tsx` | Change "WATCHLOG" to "WATCH HUB" |
| `src/pages/Auth.tsx` | Change "WATCHLOG" to "WATCH HUB" |
| `src/pages/SearchPage.tsx` | Add `useEffect` to call `getTrending` on mount; insert `AdCard` in grid |
| `src/hooks/useOmdbSearch.tsx` | Expand popular searches list; fetch more results per title |
| `src/pages/Index.tsx` | Insert `AdCard` in watchlist grid |

### New Files

| File | Purpose |
|------|---------|
| `src/components/AdCard.tsx` | Google AdSense ad unit styled to match MovieCard dimensions |

### AdCard Component Design

The `AdCard` will:
- Use the same `motion.div` wrapper, rounded corners, and aspect ratio as `MovieCard`
- Contain a Google AdSense `<ins>` element inside
- Show a subtle "Ad" label in the corner
- Fall back to a minimal placeholder if AdSense hasn't loaded

### AdSense Setup

You will need to provide your Google AdSense Publisher ID. I'll prompt you for it during implementation so it can be added to `index.html` as:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX" crossorigin="anonymous"></script>
```

Since the Publisher ID is a **public** key (it's meant to be in client-side HTML), it's safe to store directly in the codebase.

