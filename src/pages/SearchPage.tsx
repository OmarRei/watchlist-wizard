import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, TrendingUp } from "lucide-react";
import { useOmdbSearch } from "@/hooks/useOmdbSearch";
import { useWatchlist } from "@/hooks/useWatchlist";
import MovieCard from "@/components/MovieCard";
import AdCard from "@/components/AdCard";
import MovieDetailDialog from "@/components/MovieDetailDialog";
import Header from "@/components/Header";

const AD_INTERVAL = 8;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isTrending, setIsTrending] = useState(true);
  const { results, isSearching, search, detail, isLoadingDetail, getDetail, setDetail, getTrending } = useOmdbSearch();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    getTrending();
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        setIsTrending(false);
        search(query);
      } else {
        setIsTrending(true);
        getTrending();
      }
    },
    [query, search, getTrending]
  );

  const openDetail = (imdbId: string) => {
    getDetail(imdbId);
    setDialogOpen(true);
  };

  const renderGrid = () => {
    const items: React.ReactNode[] = [];
    results.forEach((r, i) => {
      // Insert ad every AD_INTERVAL cards
      if (i > 0 && i % AD_INTERVAL === 0) {
        items.push(<AdCard key={`ad-${i}`} />);
      }
      items.push(
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
      );
    });
    return items;
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
          <>
            {isTrending && (
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl text-foreground">Trending & Popular</h2>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {renderGrid()}
            </div>
          </>
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
