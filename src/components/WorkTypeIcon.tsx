import React from "react";
import {
  Star,
  LayoutGrid,
  Code2,
  Palette,
  Network,
  Globe,
  Headphones,
  Briefcase,
} from "lucide-react";
import { getWorkTypeMeta } from "@/lib/constants";

/**
 * Icon corresponding to each internship work type category
 */
export function WorkTypeCategoryIcon({
  type,
  className = "w-4 h-4 flex-shrink-0",
}: {
  type?: string | null;
  className?: string;
}) {
  const clean = (type || "").trim();
  switch (clean) {
    case "":
    case "ทั้งหมด":
      return <LayoutGrid strokeWidth={1.75} className={className} aria-hidden="true" />;
    case "เขียนโปรแกรม":
      return <Code2 strokeWidth={1.75} className={className} aria-hidden="true" />;
    case "ทำกราฟิก":
      return <Palette strokeWidth={1.75} className={className} aria-hidden="true" />;
    case "ระบบเครือข่าย":
      return <Network strokeWidth={1.75} className={className} aria-hidden="true" />;
    case "ทำเว็บไซต์":
      return <Globe strokeWidth={1.75} className={className} aria-hidden="true" />;
    case "ด้านบริการ":
      return <Headphones strokeWidth={1.75} className={className} aria-hidden="true" />;
    default:
      return <Briefcase strokeWidth={1.75} className={className} aria-hidden="true" />;
  }
}

/**
 * Category label badge with icon
 */
export function WorkTypeBadge({ type }: { type?: string | null }) {
  const meta = getWorkTypeMeta(type);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-paper-muted text-ink-secondary border border-line">
      <WorkTypeCategoryIcon type={meta.key} className="w-3.5 h-3.5 flex-shrink-0" />
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
