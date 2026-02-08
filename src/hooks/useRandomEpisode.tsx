import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Episode {
  Title: string;
  Episode: string;
  imdbRating: string;
  imdbID: string;
  Released: string;
}

interface SeasonData {
  Season: string;
  Episodes: Episode[];
  totalSeasons?: string;
}

export interface RandomEpisodeResult {
  season: number;
  episode: Episode;
}

export function useRandomEpisode() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RandomEpisodeResult | null>(null);

  const pickRandom = async (imdbId: string, totalSeasons: number) => {
    setIsLoading(true);
    setResult(null);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;

      // Pick a random season
      const randomSeason = Math.floor(Math.random() * totalSeasons) + 1;

      const res = await fetch(
        `${projectUrl}/functions/v1/omdb-proxy?i=${encodeURIComponent(imdbId)}&Season=${randomSeason}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data: SeasonData = await res.json();

      if (data.Episodes && data.Episodes.length > 0) {
        const randomEp = data.Episodes[Math.floor(Math.random() * data.Episodes.length)];
        setResult({ season: randomSeason, episode: randomEp });
      } else {
        toast.error("No episodes found for this season");
      }
    } catch {
      toast.error("Failed to pick a random episode");
    } finally {
      setIsLoading(false);
    }
  };

  return { pickRandom, result, isLoading, clearResult: () => setResult(null) };
}
