import { motion } from "framer-motion";
import { Film, Tv, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import type { WatchStatus } from "@/hooks/useWatchlist";

const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  plan_to_watch: "Plan to Watch",
  on_hold: "On Hold",
  dropped: "Dropped",
};

const STATUS_VARIANTS: Record<WatchStatus, "default" | "secondary" | "destructive" | "outline"> = {
  watching: "default",
  completed: "secondary",
  plan_to_watch: "outline",
  on_hold: "outline",
  dropped: "destructive",
};

interface MovieCardProps {
  title: string;
  year?: string | null;
  poster?: string | null;
  type: string;
  imdbId: string;
  isInWatchlist?: boolean;
  rating?: number | null;
  status?: WatchStatus;
  onAdd?: () => void;
  onRate?: (rating: number) => void;
  onClick?: () => void;
}

export default function MovieCard({
  title,
  year,
  poster,
  type,
  isInWatchlist,
  rating,
  status,
  onAdd,
  onRate,
  onClick,
}: MovieCardProps) {
  const hasPoster = poster && poster !== "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-card border border-border"
      onClick={onClick}
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
        {hasPoster ? (
          <img
            src={poster}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {type === "series" ? (
              <Tv className="h-12 w-12 text-muted-foreground" />
            ) : (
              <Film className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-sm font-semibold text-foreground line-clamp-2">{title}</p>
        <p className="text-xs text-muted-foreground">{year} · {type}</p>
        {onRate && (
          <div className="mt-1">
            <StarRating rating={rating ?? null} onChange={onRate} />
          </div>
        )}
        {onAdd && (
          <Button
            size="sm"
            variant={isInWatchlist ? "secondary" : "default"}
            className="mt-2 w-full"
            onClick={(e) => {
              e.stopPropagation();
              if (!isInWatchlist) onAdd();
            }}
          >
            {isInWatchlist ? <><Check className="h-3 w-3 mr-1" /> Watched</> : <><Plus className="h-3 w-3 mr-1" /> Add</>}
          </Button>
        )}
      </div>

      {/* Status badge */}
      {status && (
        <div className="absolute top-2 left-2">
          <Badge variant={STATUS_VARIANTS[status]} className="text-[10px] px-1.5 py-0">
            {STATUS_LABELS[status]}
          </Badge>
        </div>
      )}

      {/* Always-visible title below poster */}
      <div className="p-2">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{year}</p>
          {rating != null && rating > 0 && (
            <StarRating rating={rating} readOnly size="sm" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
