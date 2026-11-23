"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { selectWorkplaceAction } from "@/app/actions";
import { CheckCircle2, X, Images } from "lucide-react";

export function SelectWorkplaceButton({
  workplaceId,
  workplaceName,
}: {
  workplaceId: number;
  workplaceName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSelect() {
    setLoading(true);
    const res = await selectWorkplaceAction(workplaceId);
    setLoading(false);
    if (res.ok && res.redirectTo) {
      router.push(res.redirectTo);
      router.refresh();
    } else {
      alert(res.message);
    }
  }

  return (
    <button
      onClick={handleSelect}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold shadow-sm transition"
    >
      <CheckCircle2 className="w-5 h-5" />
      {loading
        ? "กำลังบันทึก..."
        : `เลือก ${workplaceName} เป็นสถานประกอบการของฉัน`}
    </button>
  );
}

export function ImageGalleryLightbox({ images }: { images: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (images.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-xs">
        <Images className="w-8 h-8 mx-auto mb-2 opacity-50" />
        ยังไม่มีรูปภาพที่อัปโหลดสำหรับสถานประกอบการนี้
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(img)}
            className="overflow-hidden rounded-lg border border-slate-200 group"
          >
            <img
              src={img}
              alt={`Workplace image ${i + 1}`}
              className="w-full h-28 object-cover group-hover:scale-105 transition duration-200"
            />
          </button>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
          >
            <img
              src={selected}
              alt="Full preview"
              className="max-w-full max-h-[75vh] rounded-xl shadow-2xl object-contain"
            />
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-slate-800 text-sm font-semibold shadow-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" /> ปิดรูปภาพ
            </button>
          </div>
        </div>
      )}
    </>
  );
}
