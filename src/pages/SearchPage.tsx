import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useOmdbSearch } from "@/hooks/useOmdbSearch";
import { useWatchlist } from "@/hooks/useWatchlist";
import MovieCard from "@/components/MovieCard";
import MovieDetailDialog from "@/components/MovieDetailDialog";
import Header from "@/components/Header";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { results, isSearching, search, detail, isLoadingDetail, getDetail, setDetail } = useOmdbSearch();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      search(query);
    },
    [query, search]
  );

  const openDetail = (imdbId: string) => {
    getDetail(imdbId);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl text-foreground mb-6">SEARCH</h1>
        <form onSubmit={handleSearch} className="relative max-w-xl mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search movies & series..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            maxLength={100}
          />
        </form>

        {isSearching && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((r) => (
              <MovieCard
                key={r.imdbID}
                title={r.Title}
                year={r.Year}
                poster={r.Poster}
                type={r.Type}
                imdbId={r.imdbID}
                isInWatchlist={isInWatchlist(r.imdbID)}
                onAdd={() =>
                  addToWatchlist({
                    imdb_id: r.imdbID,
                    title: r.Title,
                    year: r.Year,
                    poster_url: r.Poster !== "N/A" ? r.Poster : undefined,
                    media_type: r.Type,
                  })
                }
                onClick={() => openDetail(r.imdbID)}
              />
            ))}
          </div>
        )}

        {!isSearching && results.length === 0 && query && (
          <p className="text-center text-muted-foreground py-12">No results found. Try a different search.</p>
        )}
      </main>

      <MovieDetailDialog
        detail={detail}
        isLoading={isLoadingDetail}
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setDetail(null); }}
        isInWatchlist={detail ? isInWatchlist(detail.imdbID) : false}
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
