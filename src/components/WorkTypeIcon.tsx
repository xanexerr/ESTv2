import React from "react";
import { Star } from "lucide-react";
import { getWorkTypeMeta } from "@/lib/constants";

/**
 * Quiet category label with a 6px status dot (replaces multi-colored icon tiles)
 */
export function WorkTypeBadge({ type }: { type?: string | null }) {
  const meta = getWorkTypeMeta(type);
  return (
    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-paper-muted text-ink-secondary border border-line">
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        aria-hidden="true"
        style={{ backgroundColor: meta.dotColor }}
      />
      {meta.label}
    </span>
  );
}

/**
 * Consistent 16px / 1.5-stroke star rating display with screen-reader label
 */
export function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const val = Number(rating) || 0;
  const iconClass = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <span
      role="img"
      aria-label={`คะแนน ${val.toFixed(1)} จาก 5.0`}
      className="inline-flex items-center gap-0.5"
      title={`${val.toFixed(1)} / 5.0`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = val >= i - 0.25;
        return (
          <Star
            key={i}
            aria-hidden="true"
            strokeWidth={1.5}
            className={`${iconClass} ${
              filled
                ? "text-amber-500 fill-amber-500"
                : "text-zinc-300 fill-transparent"
            }`}
          />
        );
      })}
    </span>
  );
}
