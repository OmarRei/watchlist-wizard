

# Professional Features for WatchLog

Adding three major features: watch status tracking, a statistics dashboard, and a profile page.

---

## 1. Watch Status Tracking

Add a `status` column to the `watchlist` table so each item can be categorized:
- **Watching** -- currently in progress
- **Completed** -- finished watching
- **Plan to Watch** -- on the to-do list
- **On Hold** -- paused
- **Dropped** -- abandoned

The watchlist page will get a status filter (tabs or dropdown) and each movie card will show its status badge. The detail dialog will have a status selector dropdown.

## 2. Statistics Dashboard

A new `/stats` page accessible from the header, showing:
- Total items by status (watching, completed, etc.)
- Genre breakdown (pie chart via Recharts, pulled from OMDB detail data stored locally)
- Ratings distribution (bar chart)
- Movies vs Series count
- Total items in watchlist

Stats will be computed client-side from the existing watchlist data and cached OMDB details.

## 3. Profile Page

A new `/profile` page showing:
- User email and account creation date
- Avatar (using initials-based avatar from Radix)
- Watchlist summary stats (total items, average rating)
- Quick links to watchlist and search

No new database table needed -- profile data comes from the auth session.

---

## Technical Details

### Database Migration

Add a `status` column to the `watchlist` table:

```sql
ALTER TABLE public.watchlist
ADD COLUMN status text NOT NULL DEFAULT 'plan_to_watch';
```

Existing items will default to `plan_to_watch`. No RLS changes needed since existing policies already cover all CRUD by user_id.

### New Files
- `src/pages/StatsPage.tsx` -- statistics dashboard with Recharts charts
- `src/pages/ProfilePage.tsx` -- user profile page

### Modified Files
- `src/integrations/supabase/types.ts` -- will auto-update after migration
- `src/hooks/useWatchlist.tsx` -- add `status` field to queries, mutations, and the `WatchlistItem` interface; add `updateStatus` mutation
- `src/components/MovieCard.tsx` -- show status badge on card
- `src/components/MovieDetailDialog.tsx` -- add status selector dropdown
- `src/components/Header.tsx` -- add Stats and Profile nav links
- `src/pages/Index.tsx` -- add status filter tab/dropdown
- `src/App.tsx` -- add routes for `/stats` and `/profile`

### Stats Page Charts (using existing Recharts dependency)
- Pie chart for status breakdown
- Bar chart for ratings distribution
- Pie chart for movies vs series split

