"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateAccountStatusAction } from "@/app/actions";
import { Check, X } from "lucide-react";

export function ApprovalActionsClient({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);

  async function handleAction(status: "approved" | "rejected") {
    setLoading(status);
    await adminUpdateAccountStatusAction(userId, status);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      {currentStatus !== "approved" && (
        <button
          type="button"
          onClick={() => handleAction("approved")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-50 text-white dark:text-zinc-950 text-xs font-medium transition-colors"
        >
          <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
          {loading === "approved" ? "..." : "อนุมัติ"}
        </button>
      )}
      {currentStatus !== "rejected" && (
        <button
          type="button"
          onClick={() => handleAction("rejected")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-xs font-medium transition-colors"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          {loading === "rejected" ? "..." : "ปฏิเสธ"}
        </button>
      )}
    </div>
  );
}
