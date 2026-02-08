-- Add rating column (1-5 stars, nullable)
ALTER TABLE public.watchlist ADD COLUMN rating smallint;

-- Add UPDATE policy so users can set ratings
CREATE POLICY "Users can update own watchlist"
ON public.watchlist
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Validation trigger to ensure rating is 1-5 when set
CREATE OR REPLACE FUNCTION public.validate_watchlist_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating IS NOT NULL AND (NEW.rating < 1 OR NEW.rating > 5) THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_watchlist_rating_trigger
BEFORE INSERT OR UPDATE ON public.watchlist
FOR EACH ROW
EXECUTE FUNCTION public.validate_watchlist_rating();