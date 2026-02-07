import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface WatchlistItem {
  id: string;
  imdb_id: string;
  title: string;
  year: string | null;
  poster_url: string | null;
  media_type: string;
  created_at: string;
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
      const { error } = await supabase.from("watchlist").insert({
        user_id: user!.id,
        imdb_id: item.imdb_id,
        title: item.title,
        year: item.year || null,
        poster_url: item.poster_url || null,
        media_type: item.media_type,
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

  const isInWatchlist = (imdbId: string) => {
    return query.data?.some((item) => item.imdb_id === imdbId) ?? false;
  };

  return {
    watchlist: query.data ?? [],
    isLoading: query.isLoading,
    addToWatchlist: addMutation.mutate,
    removeFromWatchlist: removeMutation.mutate,
    isInWatchlist,
    isAdding: addMutation.isPending,
  };
}
