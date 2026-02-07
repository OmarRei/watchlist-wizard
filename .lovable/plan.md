
# 🎬 Movie & Series Tracker

A dark, cinematic web app for tracking watched movies and series, powered by the OMDB API.

## Design
- **Dark cinematic theme** inspired by Letterboxd/Netflix — dark backgrounds, movie poster imagery, subtle gradients
- **Responsive layout** that works beautifully on desktop and mobile
- Grid/card-based display with movie posters as the primary visual element

## Pages & Features

### 1. Home / My Watchlist
- Display all watched movies and series in a poster grid
- Filter tabs: **All**, **Movies**, **Series**
- Sort by: date added, title, year
- Empty state with a prompt to search and add content
- Click a card to see details (title, year, plot, IMDb rating, genre)

### 2. Search
- Search bar with real-time results from the OMDB API
- Results show poster, title, year, and type (movie/series)
- One-click "Mark as Watched" button on each result
- Already-watched items are visually indicated

### 3. Movie/Series Detail View
- Full details: poster, plot, genre, director, actors, IMDb rating, runtime
- Option to remove from watched list

## Data & Backend (Lovable Cloud)
- **User authentication** (email sign-up/login) so each user has their own watchlist
- **Database** to store each user's watched items (title, OMDB ID, poster URL, type, date added)
- **Edge function** to proxy OMDB API calls, keeping the API key secure on the server side

## API Key Setup
- You'll need a free OMDB API key from [omdbapi.com](http://www.omdbapi.com/apikey.aspx) — it takes ~30 seconds to get one
- The key will be stored securely as a server-side secret, never exposed to the browser

## Security
- API key stored as a Supabase/Cloud secret, accessed only via edge functions
- Row-level security so users can only see/modify their own watchlist
- Input validation on all search queries
