export interface WorkTypeMeta {
  key: string;
  label: string;
  color: string;
  bg: string;
  badgeClass: string;
  iconName: "code" | "palette" | "network" | "globe" | "headset" | "building";
}

export const WORK_TYPES: WorkTypeMeta[] = [
  {
    key: "เขียนโปรแกรม",
    label: "เขียนโปรแกรม",
    color: "#136F73",
    bg: "rgba(19, 111, 115, 0.12)",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    iconName: "code",
  },
  {
    key: "ทำกราฟิก",
    label: "ทำกราฟิก",
    color: "#D97706",
    bg: "rgba(245, 158, 11, 0.14)",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    iconName: "palette",
  },
  {
    key: "ระบบเครือข่าย",
    label: "ระบบเครือข่าย",
    color: "#2563EB",
    bg: "rgba(37, 99, 235, 0.12)",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    iconName: "network",
  },
  {
    key: "ทำเว็บไซต์",
    label: "ทำเว็บไซต์",
    color: "#0891B2",
    bg: "rgba(8, 145, 178, 0.12)",
    badgeClass: "bg-cyan-50 text-cyan-800 border-cyan-200",
    iconName: "globe",
  },
  {
    key: "ด้านบริการ",
    label: "ด้านบริการ",
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.12)",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    iconName: "headset",
  },
];

export function getWorkTypeMeta(type?: string | null): WorkTypeMeta {
  const clean = (type || "").trim();
  const found = WORK_TYPES.find((t) => t.key === clean);
  if (found) return found;
  return {
    key: clean || "อื่นๆ",
    label: clean || "อื่นๆ",
    color: "#475569",
    bg: "rgba(71, 85, 105, 0.12)",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    iconName: "building",
  };
}

export function getRoleLabel(role?: string | null): string {
  switch (role) {
    case "admin":
      return "ผู้ดูแลระบบ";
    case "teacher":
      return "ครู / อาจารย์";
    case "student":
      return "นักเรียน / นักศึกษา";
    default:
      return "ผู้ใช้งานทั่วไป";
  }
}

export function normalizeImagePath(img?: string | null): string | null {
  if (!img) return null;
  let clean = img.trim();
  if (!clean) return null;
  clean = clean.replace(/^(\.\.\/|\.\/)+/, "");
  if (clean.startsWith("/img/")) return clean;
  if (clean.startsWith("img/")) return "/" + clean;
  return "/img/" + clean.replace(/^\/+/, "");
}
