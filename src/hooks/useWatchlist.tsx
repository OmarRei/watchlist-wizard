import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { z } from "zod";

const watchlistItemSchema = z.object({
  imdb_id: z.string().regex(/^tt\d{7,8}$/, "Invalid IMDB ID"),
  title: z.string().min(1, "Title required").max(500, "Title too long"),
  year: z.string().regex(/^\d{4}(-\d{4})?$/).optional(),
  poster_url: z.string().url().max(2000).optional(),
  media_type: z.enum(["movie", "series", "episode"]),
});

export interface WatchlistItem {
  id: string;
  imdb_id: string;
  title: string;
  year: string | null;
  poster_url: string | null;
  media_type: string;
  created_at: string;
  rating: number | null;
}

export function useWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WatchlistItem[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (item: { imdb_id: string; title: string; year?: string; poster_url?: string; media_type: string }) => {
      const validated = watchlistItemSchema.parse({
        ...item,
        year: item.year || undefined,
        poster_url: item.poster_url || undefined,
      });
      const { error } = await supabase.from("watchlist").insert({
        user_id: user!.id,
        imdb_id: validated.imdb_id,
        title: validated.title,
        year: validated.year || null,
        poster_url: validated.poster_url || null,
        media_type: validated.media_type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Added to watchlist");
    },
    onError: (err: Error) => {
      if (err.message.includes("duplicate")) {
        toast.info("Already in your watchlist");
      } else {
        toast.error("Failed to add");
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (imdbId: string) => {
      const { error } = await supabase.from("watchlist").delete().eq("imdb_id", imdbId).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Removed from watchlist");
    },
    onError: () => toast.error("Failed to remove"),
  });

  const rateMutation = useMutation({
    mutationFn: async ({ imdbId, rating }: { imdbId: string; rating: number | null }) => {
      const { error } = await supabase
        .from("watchlist")
        .update({ rating: rating === 0 ? null : rating })
        .eq("imdb_id", imdbId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
    onError: () => toast.error("Failed to update rating"),
  });

  const isInWatchlist = (imdbId: string) => {
    return query.data?.some((item) => item.imdb_id === imdbId) ?? false;
  };

  const getRating = (imdbId: string) => {
    return query.data?.find((item) => item.imdb_id === imdbId)?.rating ?? null;
  };

  return {
    watchlist: query.data ?? [],
    isLoading: query.isLoading,
    addToWatchlist: addMutation.mutate,
    removeFromWatchlist: removeMutation.mutate,
    rateItem: rateMutation.mutate,
    isInWatchlist,
    getRating,
    isAdding: addMutation.isPending,
  };
}
