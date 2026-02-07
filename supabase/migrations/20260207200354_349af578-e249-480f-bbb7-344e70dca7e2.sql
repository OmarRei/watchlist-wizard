
-- Create watchlist table
CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  imdb_id TEXT NOT NULL,
  title TEXT NOT NULL,
  year TEXT,
  poster_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'movie',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one entry per user per imdb_id
ALTER TABLE public.watchlist ADD CONSTRAINT watchlist_user_imdb_unique UNIQUE (user_id, imdb_id);

-- Enable RLS
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Users can only see their own watchlist
CREATE POLICY "Users can view own watchlist"
ON public.watchlist FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their own watchlist
CREATE POLICY "Users can insert own watchlist"
ON public.watchlist FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own watchlist
CREATE POLICY "Users can delete own watchlist"
ON public.watchlist FOR DELETE
USING (auth.uid() = user_id);
