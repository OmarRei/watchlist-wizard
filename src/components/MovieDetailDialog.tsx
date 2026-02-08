import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Trash2, Plus, Film, Tv, Loader2, Shuffle } from "lucide-react";
import { useRandomEpisode } from "@/hooks/useRandomEpisode";
import type { OmdbDetail } from "@/hooks/useOmdbSearch";

interface Props {
  detail: OmdbDetail | null;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isInWatchlist: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

export default function MovieDetailDialog({
  detail,
  isLoading,
  open,
  onOpenChange,
  isInWatchlist,
  onAdd,
  onRemove,
}: Props) {
  const { pickRandom, result: randomEp, isLoading: isPickingEp, clearResult } = useRandomEpisode();

  if (!detail && !isLoading) return null;

  const isSeries = detail?.Type === "series";
  const totalSeasons = detail?.totalSeasons ? parseInt(detail.totalSeasons) : 0;

  const handleClose = (o: boolean) => {
    onOpenChange(o);
    if (!o) clearResult();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : detail ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl text-foreground">{detail.Title}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col sm:flex-row gap-6 mt-4">
              {detail.Poster && detail.Poster !== "N/A" ? (
                <img
                  src={detail.Poster}
                  alt={detail.Title}
                  className="w-48 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-48 h-72 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {isSeries ? <Tv className="h-12 w-12 text-muted-foreground" /> : <Film className="h-12 w-12 text-muted-foreground" />}
                </div>
              )}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap gap-2">
                  {detail.Genre?.split(", ").map((g) => (
                    <Badge key={g} variant="secondary">{g}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {detail.imdbRating && detail.imdbRating !== "N/A" && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary fill-primary" /> {detail.imdbRating}
                    </span>
                  )}
                  {detail.Runtime && detail.Runtime !== "N/A" && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {detail.Runtime}
                    </span>
                  )}
                  <span>{detail.Year}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{detail.Plot}</p>
                {detail.Director && detail.Director !== "N/A" && (
                  <p className="text-xs text-muted-foreground"><strong>Director:</strong> {detail.Director}</p>
                )}
                {detail.Actors && detail.Actors !== "N/A" && (
                  <p className="text-xs text-muted-foreground"><strong>Cast:</strong> {detail.Actors}</p>
                )}

                {/* Random Episode Picker for series */}
                {isSeries && totalSeasons > 0 && (
                  <div className="pt-2 space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => pickRandom(detail.imdbID, totalSeasons)}
                      disabled={isPickingEp}
                      className="w-full"
                    >
                      {isPickingEp ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Shuffle className="h-4 w-4 mr-2" />
                      )}
                      Random Episode
                    </Button>
                    {randomEp && (
                      <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                        <p className="font-semibold text-foreground">
                          S{String(randomEp.season).padStart(2, "0")}E{String(randomEp.episode.Episode).padStart(2, "0")} — {randomEp.episode.Title}
                        </p>
                        {randomEp.episode.imdbRating && randomEp.episode.imdbRating !== "N/A" && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="h-3 w-3 text-primary fill-primary" /> {randomEp.episode.imdbRating}
                          </p>
                        )}
                        {randomEp.episode.Released && randomEp.episode.Released !== "N/A" && (
                          <p className="text-xs text-muted-foreground">Released: {randomEp.episode.Released}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  {isInWatchlist ? (
                    <Button variant="destructive" onClick={onRemove}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove from Watchlist
                    </Button>
                  ) : (
                    <Button onClick={onAdd}>
                      <Plus className="h-4 w-4 mr-2" /> Add to Watchlist
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
