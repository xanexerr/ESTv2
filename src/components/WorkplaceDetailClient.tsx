"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { selectWorkplaceAction } from "@/app/actions";
import { Check, X } from "lucide-react";

export function SelectWorkplaceButton({
  workplaceId,
  workplaceName,
}: {
  workplaceId: number;
  workplaceName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSelect() {
    setLoading(true);
    setErrorMsg(null);
    const res = await selectWorkplaceAction(workplaceId);
    setLoading(false);
    if (res.ok && res.redirectTo) {
      router.push(res.redirectTo);
      router.refresh();
    } else {
      setErrorMsg(res.message);
    }
  }

  return (
    <div className="space-y-2">
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
          {errorMsg}
        </div>
      )}
      <button
        onClick={handleSelect}
        disabled={loading}
        className="w-full min-h-[44px] sm:min-h-0 sm:h-10 inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-60 text-white text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <Check strokeWidth={1.5} aria-hidden="true" className="w-4 h-4" />
        {loading
          ? "กำลังบันทึก..."
          : `เลือก ${workplaceName} เป็นสถานประกอบการของฉัน`}
      </button>
    </div>
  );
}

export function ImageGalleryLightbox({ images }: { images: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (images.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-ink-muted">
        ยังไม่มีรูปภาพที่อัปโหลดสำหรับสถานประกอบการนี้
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(img)}
            className="overflow-hidden rounded-lg border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <img
              src={img}
              alt={`ภาพบรรยากาศฝึกงาน ${i + 1}`}
              className="w-full h-24 object-cover hover:opacity-90 transition-opacity duration-150"
            />
          </button>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 bg-zinc-950/80 flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center gap-3"
          >
            <img
              src={selected}
              alt="ภาพขนาดเต็ม"
              className="max-w-full max-h-[75vh] rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-paper-surface text-ink-primary text-xs font-medium hover:bg-paper-muted transition-colors"
            >
              <X strokeWidth={1.5} className="w-4 h-4" /> ปิดรูปภาพ
            </button>
          </div>
        </div>
      )}
    </>
  );
}
