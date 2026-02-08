import { useState } from "react";
import { Link } from "react-router-dom";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useOmdbSearch } from "@/hooks/useOmdbSearch";
import MovieCard from "@/components/MovieCard";
import MovieDetailDialog from "@/components/MovieDetailDialog";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Film, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterType = "all" | "movie" | "series";
type SortType = "date" | "title" | "year" | "rating";

export default function Index() {
  const { watchlist, isLoading, removeFromWatchlist, addToWatchlist, rateItem } = useWatchlist();
  const { detail, isLoadingDetail, getDetail, setDetail } = useOmdbSearch();
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("date");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = watchlist
    .filter((item) => filter === "all" || item.media_type === filter)
    .sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "year") return (b.year ?? "").localeCompare(a.year ?? "");
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const openDetail = (imdbId: string) => {
    getDetail(imdbId);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-4xl text-foreground">MY WATCHLIST</h1>
          <div className="flex items-center gap-3">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="movie">Movies</TabsTrigger>
                <TabsTrigger value="series">Series</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={sort} onValueChange={(v) => setSort(v as SortType)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Added</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Film className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl text-foreground mb-2">NO MOVIES YET</h2>
            <p className="text-muted-foreground mb-6">Search and add movies or series to your watchlist</p>
            <Button asChild>
              <Link to="/search"><Search className="h-4 w-4 mr-2" /> Search Movies</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((item) => (
              <MovieCard
                key={item.id}
                title={item.title}
                year={item.year}
                poster={item.poster_url}
                type={item.media_type}
                imdbId={item.imdb_id}
                rating={item.rating}
                onRate={(r) => rateItem({ imdbId: item.imdb_id, rating: r })}
                onClick={() => openDetail(item.imdb_id)}
              />
            ))}
          </div>
        )}
      </main>

      <MovieDetailDialog
        detail={detail}
        isLoading={isLoadingDetail}
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setDetail(null); }}
        isInWatchlist={detail ? watchlist.some((w) => w.imdb_id === detail.imdbID) : false}
        onAdd={() => {
          if (detail) {
            addToWatchlist({
              imdb_id: detail.imdbID,
              title: detail.Title,
              year: detail.Year,
              poster_url: detail.Poster !== "N/A" ? detail.Poster : undefined,
              media_type: detail.Type,
            });
          }
        }}
        onRemove={() => {
          if (detail) removeFromWatchlist(detail.imdbID);
        }}
      />
    </div>
  );
}
