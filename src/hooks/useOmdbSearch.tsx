import { useState, useRef } from "react";
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
  totalSeasons?: string;
}

export function useOmdbSearch() {
  const [results, setResults] = useState<OmdbSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [detail, setDetail] = useState<OmdbDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);
  const detailAbortRef = useRef<AbortController | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    // Cancel previous search request
    searchAbortRef.current?.abort();
    searchAbortRef.current = new AbortController();
    
    setIsSearching(true);
    
    // Set a timeout to cancel the search after 10 seconds
    const timeoutId = setTimeout(() => {
      searchAbortRef.current?.abort();
    }, 10000);
    
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
          signal: searchAbortRef.current.signal,
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
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Search cancelled");
      } else {
        console.error("Search error:", err);
        toast.error("Search failed");
        setResults([]);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsSearching(false);
    }
  };

  const getDetail = async (imdbId: string) => {
    // Cancel previous detail request
    detailAbortRef.current?.abort();
    detailAbortRef.current = new AbortController();
    
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
          signal: detailAbortRef.current.signal,
        }
      );
      const json = await res.json();
      if (json.Title) {
        setDetail(json);
      } else {
        setDetail(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      toast.error("Failed to load details");
      setDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getTrending = async () => {
    // Since OMDB doesn't have a dedicated trending endpoint, we'll search for popular titles
    const popularSearches = ["The Office", "Breaking Bad", "Inception", "The Matrix", "Interstellar"];
    
    // Cancel previous search request
    searchAbortRef.current?.abort();
    searchAbortRef.current = new AbortController();
    
    setIsSearching(true);
    
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      
      // Search for each popular title and combine results
      const allResults: OmdbSearchResult[] = [];
      
      for (const title of popularSearches) {
        try {
          const res = await fetch(
            `${projectUrl}/functions/v1/omdb-proxy?s=${encodeURIComponent(title)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              signal: searchAbortRef.current.signal,
            }
          );
          const json = await res.json();
          if (json.Search && Array.isArray(json.Search)) {
            // Add first result from each search to create a diverse mix
            allResults.push(json.Search[0]);
          }
        } catch (err) {
          // Continue with other searches if one fails
          console.log(`Failed to fetch ${title}`, err);
        }
      }
      
      // Remove duplicates by IMDB ID and limit to 10 results
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.imdbID, item])).values()
      ).slice(0, 10);
      
      setResults(uniqueResults);
    } catch (err: unknown) {
      if (!(err instanceof Error && err.name === "AbortError")) {
        console.error("Failed to load trending:", err);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return { results, isSearching, search, detail, isLoadingDetail, getDetail, setDetail, setResults, getTrending };
}
