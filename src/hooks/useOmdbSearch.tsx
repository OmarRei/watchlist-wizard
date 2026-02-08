import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OmdbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbDetail {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  imdbID: string;
  Type: string;
}

export function useOmdbSearch() {
  const [results, setResults] = useState<OmdbSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [detail, setDetail] = useState<OmdbDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(
        `${projectUrl}/functions/v1/omdb-proxy?s=${encodeURIComponent(query.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const json = await res.json();
      if (json.Search) {
        setResults(json.Search);
      } else {
        setResults([]);
        if (json.Error && json.Error !== "Movie not found!") {
          toast.error(json.Error);
        }
      }
    } catch {
      toast.error("Search failed");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getDetail = async (imdbId: string) => {
    setIsLoadingDetail(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(
        `${projectUrl}/functions/v1/omdb-proxy?i=${encodeURIComponent(imdbId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const json = await res.json();
      if (json.Title) {
        setDetail(json);
      } else {
        setDetail(null);
      }
    } catch {
      toast.error("Failed to load details");
      setDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return { results, isSearching, search, detail, isLoadingDetail, getDetail, setDetail, setResults };
}
