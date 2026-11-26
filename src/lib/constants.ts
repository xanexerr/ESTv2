export interface WorkTypeMeta {
  key: string;
  label: string;
  dotColor: string;
}

export const WORK_TYPES: WorkTypeMeta[] = [
  { key: "เขียนโปรแกรม", label: "เขียนโปรแกรม", dotColor: "#136F73" },
  { key: "ทำกราฟิก", label: "ทำกราฟิก", dotColor: "#D97706" },
  { key: "ระบบเครือข่าย", label: "ระบบเครือข่าย", dotColor: "#2563EB" },
  { key: "ทำเว็บไซต์", label: "ทำเว็บไซต์", dotColor: "#0891B2" },
  { key: "ด้านบริการ", label: "ด้านบริการ", dotColor: "#7C3AED" },
];

export function getWorkTypeMeta(type?: string | null): WorkTypeMeta {
  const clean = (type || "").trim();
  const found = WORK_TYPES.find((t) => t.key === clean);
  if (found) return found;
  return {
    key: clean || "อื่นๆ",
    label: clean || "อื่นๆ",
    dotColor: "#71717A",
  };
}

export function getRoleLabel(role?: string | null): string {
  switch (role) {
    case "admin":
      return "ผู้ดูแลระบบ";
    case "teacher":
      return "ครู / อาจารย์";
    case "student":
      return "นักศึกษา";
    default:
      return "ผู้เยี่ยมชม";
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

export type WorkModeValue = "onsite" | "remote" | "hybrid";

export const WORK_MODES: { value: WorkModeValue; label: string; desc: string }[] = [
  { value: "onsite", label: "Onsite", desc: "เข้าทำงานที่สถานประกอบการ" },
  { value: "hybrid", label: "Hybrid", desc: "ผสมผสานเข้าออฟฟิศและทำงานทางไกล" },
  { value: "remote", label: "Remote", desc: "ทำงานทางไกล 100%" },
];

export function getWorkModeLabel(mode?: string | null): string {
  switch (mode) {
    case "remote":
      return "Remote";
    case "hybrid":
      return "Hybrid";
    default:
      return "Onsite";
  }
}

/**
 * Generates a 10-digit User ID:
 * [2 digits BE year][2 digits University code][2 digits Faculty code][4 digits running number]
 * e.g. academicYear="2569", uniCode="01", facultyCode="01" -> "6901010001"
 */
export function generateNextUserCode(
  academicYear: string,
  uniCode: string,
  facultyCode: string,
  existingUserIds: string[]
): string {
  const digits = academicYear.replace(/\D/g, "");
  const yy = (digits.length >= 2 ? digits.slice(-2) : digits.padStart(2, "0"));
  const uu = uniCode.replace(/\D/g, "").padStart(2, "0").slice(-2);
  const ff = facultyCode.replace(/\D/g, "").padStart(2, "0").slice(-2);
  const prefix = `${yy}${uu}${ff}`;

  let maxRun = 0;
  for (const id of existingUserIds) {
    if (id.startsWith(prefix) && id.length === 10) {
      const n = Number(id.slice(6));
      if (Number.isInteger(n) && n > maxRun) {
        maxRun = n;
      }
    }
  }
  const nextRun = String(maxRun + 1).padStart(4, "0");
  return `${prefix}${nextRun}`;
}

export const THAI_PROVINCES: string[] = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "กาฬสินธุ์",
  "กำแพงเพชร",
  "ขอนแก่น",
  "จันทบุรี",
  "ฉะเชิงเทรา",
  "ชลบุรี",
  "ชัยนาท",
  "ชัยภูมิ",
  "ชุมพร",
  "เชียงราย",
  "เชียงใหม่",
  "ตรัง",
  "ตราด",
  "ตาก",
  "นครนายก",
  "นครปฐม",
  "นครพนม",
  "นครราชสีมา",
  "นครศรีธรรมราช",
  "นครสวรรค์",
  "นนทบุรี",
  "นราธิวาส",
  "น่าน",
  "บึงกาฬ",
  "บุรีรัมย์",
  "ปทุมธานี",
  "ประจวบคีรีขันธ์",
  "ปราจีนบุรี",
  "ปัตตานี",
  "พระนครศรีอยุธยา",
  "พะเยา",
  "พังงา",
  "พัทลุง",
  "พิจิตร",
  "พิษณุโลก",
  "เพชรบุรี",
  "เพชรบูรณ์",
  "แพร่",
  "ภูเก็ต",
  "มหาสารคาม",
  "มุกดาหาร",
  "แม่ฮ่องสอน",
  "ยโสธร",
  "ยะลา",
  "ร้อยเอ็ด",
  "ระนอง",
  "ระยอง",
  "ราชบุรี",
  "ลพบุรี",
  "ลำปาง",
  "ลำพูน",
  "เลย",
  "ศรีสะเกษ",
  "สกลนคร",
  "สงขลา",
  "สตูล",
  "สมุทรปราการ",
  "สมุทรสงคราม",
  "สมุทรสาคร",
  "สระแก้ว",
  "สระบุรี",
  "สิงห์บุรี",
  "สุโขทัย",
  "สุพรรณบุรี",
  "สุราษฎร์ธานี",
  "สุรินทร์",
  "หนองคาย",
  "หนองบัวลำภู",
  "อ่างทอง",
  "อำนาจเจริญ",
  "อุดรธานี",
  "อุตรดิตถ์",
  "อุทัยธานี",
  "อุบลราชธานี",
];
