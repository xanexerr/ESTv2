import React from "react";
import { Code, Palette, Network, Globe, Headset, Building2, Star } from "lucide-react";
import { getWorkTypeMeta } from "@/lib/constants";

export function WorkTypeIcon({
  type,
  className = "w-5 h-5",
}: {
  type?: string | null;
  className?: string;
}) {
  const meta = getWorkTypeMeta(type);
  switch (meta.iconName) {
    case "code":
      return <Code className={className} />;
    case "palette":
      return <Palette className={className} />;
    case "network":
      return <Network className={className} />;
    case "globe":
      return <Globe className={className} />;
    case "headset":
      return <Headset className={className} />;
    default:
      return <Building2 className={className} />;
  }
}

export function WorkTypeBadge({ type }: { type?: string | null }) {
  const meta = getWorkTypeMeta(type);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
    >
      <WorkTypeIcon type={type} className="w-3.5 h-3.5" />
      {meta.label}
    </span>
  );
}

export function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const val = Number(rating) || 0;
  const iconClass =
    size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";

  return (
    <span className="inline-flex items-center gap-0.5" title={`${val.toFixed(1)} / 5.0`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = val >= i - 0.25;
        return (
          <Star
            key={i}
            className={`${iconClass} ${
              filled
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300 fill-slate-100"
            }`}
          />
        );
      })}
    </span>
  );
}
