import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number | null;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
  readOnly?: boolean;
}

export default function StarRating({ rating, onChange, size = "sm", readOnly = false }: StarRatingProps) {
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={cn(
            "transition-colors",
            readOnly ? "cursor-default" : "cursor-pointer hover:text-primary"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (!readOnly && onChange) {
              onChange(rating === star ? 0 : star);
            }
          }}
        >
          <Star
            className={cn(
              starSize,
              star <= (rating ?? 0)
                ? "fill-primary text-primary"
                : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}
