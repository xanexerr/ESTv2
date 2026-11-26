"use client";

import React from "react";

export function SortSelectClient({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="sorting"
      defaultValue={defaultValue}
      aria-label="เรียงลำดับสถานประกอบการ"
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="w-full min-h-[44px] sm:min-h-0 sm:h-10 px-3 text-sm bg-paper-bg border border-line-strong rounded-lg text-ink-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
    >
      <option value="newest">เรียง: เพิ่มล่าสุด</option>
      <option value="oldest">เรียง: เพิ่มนานสุด</option>
      <option value="highscore">เรียง: คะแนนรีวิว</option>
      <option value="popular">เรียง: จำนวนนักศึกษา</option>
    </select>
  );
}
