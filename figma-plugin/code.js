/**
 * ESTv2 — Multi-University Internship & Course Review Platform
 * Figma Design System, Local Variables (Light / Dark) & Hi-Fi UI Generator
 *
 * Synced with current codebase:
 *  - Monochrome Black & White theme (Light #FAFAFA/#FFFFFF/#09090B + Dark #09090B/#111113/#FAFAFA)
 *  - Font: Anuphan (auto-fallback to Inter if Anuphan is not installed in Figma)
 *  - 6 Current Screens (Light Mode Row + Dark Mode Row):
 *      01. Home Discovery (/) — Work Mode, Province, Top 3 Strip, Cards/Table toggle
 *      02. Course Reviews (/courses) — 5-level cascade, 3-metric bars, own-major & passed-course guard
 *      03. Workplace Detail (/workplaces/[id]) — Work Mode, Reviews, Rating Summary
 *      04. Student Internships & Logbook (/student/internships, /student/logbook)
 *      05. Register (/register) — 10-digit ID, University/Faculty/Major cascade, Evidence upload
 *      06. Admin Portal (/admin/approvals) — Dedicated Left Sidebar + Pending Approval Queue
 *
 * How to run in Figma:
 *  Plugins -> Development -> Import plugin from manifest... -> select figma-plugin/manifest.json
 *  Then run "ESTv2 — Monochrome UI & Design System Generator"
 */

(async () => {
  // 1. Load Fonts (prefer Anuphan, fallback cleanly to Inter)
  async function resolveFontFamily(preferred, fallback) {
    const styles = ["Regular", "Medium", "Semi Bold", "Bold"];
    try {
      for (const style of styles) {
        await figma.loadFontAsync({ family: preferred, style });
      }
      return preferred;
    } catch {
      for (const style of styles) {
        await figma.loadFontAsync({ family: fallback, style });
      }
      return fallback;
    }
  }

  const SANS_FONT = await resolveFontFamily("Anuphan", "Inter");

  // Helper: Hex -> Figma RGB
  function hex(h) {
    const clean = h.replace("#", "");
    return {
      r: parseInt(clean.substring(0, 2), 16) / 255,
      g: parseInt(clean.substring(2, 4), 16) / 255,
      b: parseInt(clean.substring(4, 6), 16) / 255,
    };
  }

  function solid(h, opacity = 1) {
    return [{ type: "SOLID", color: hex(h), opacity }];
  }

  // Monochrome Design Tokens (matches src/app/globals.css)
  const THEMES = {
    light: {
      name: "Light",
      bg: "#FAFAFA",
      surface: "#FFFFFF",
      surfaceMuted: "#F4F4F5",
      inkPrimary: "#09090B",
      inkSecondary: "#3F3F46",
      inkMuted: "#52525B",
      line: "#E4E4E7",
      lineStrong: "#D4D4D8",
      brand: "#09090B",
      brandText: "#FFFFFF",
      brandHover: "#27272A",
      brandSubtle: "#F4F4F5",
      emerald: "#059669",
      emeraldBg: "#ECFDF5",
      emeraldBorder: "#A7F3D0",
      sky: "#0284C7",
      skyBg: "#F0F9FF",
      amber: "#D97706",
      amberBg: "#FFFBEB",
      amberBorder: "#FDE68A",
      danger: "#DC2626",
      dangerBg: "#FEF2F2",
    },
    dark: {
      name: "Dark",
      bg: "#09090B",
      surface: "#111113",
      surfaceMuted: "#18181B",
      inkPrimary: "#FAFAFA",
      inkSecondary: "#D4D4D8",
      inkMuted: "#A1A1AA",
      line: "#27272A",
      lineStrong: "#3F3F46",
      brand: "#FAFAFA",
      brandText: "#09090B",
      brandHover: "#E4E4E7",
      brandSubtle: "#27272A",
      emerald: "#34D399",
      emeraldBg: "#052E16",
      emeraldBorder: "#065F46",
      sky: "#38BDF8",
      skyBg: "#082F49",
      amber: "#FBBF24",
      amberBg: "#451A03",
      amberBorder: "#92400E",
      danger: "#F87171",
      dangerBg: "#450A0A",
    },
  };

  // Create or update Figma Local Variable Collection (Light / Dark)
  try {
    const existing = figma.variables
      .getLocalVariableCollections()
      .find((c) => c.name === "ESTv2 Monochrome Tokens");
    const collection =
      existing || figma.variables.createVariableCollection("ESTv2 Monochrome Tokens");

    const lightModeId = collection.modes[0].modeId;
    collection.renameMode(lightModeId, "Light");
    let darkModeId = collection.modes[1] ? collection.modes[1].modeId : null;
    if (!darkModeId) {
      darkModeId = collection.addMode("Dark");
    }

    const tokenKeys = [
      "bg",
      "surface",
      "surfaceMuted",
      "inkPrimary",
      "inkSecondary",
      "inkMuted",
      "line",
      "lineStrong",
      "brand",
      "brandText",
      "brandHover",
      "brandSubtle",
    ];

    const existingVars = figma.variables.getLocalVariables("COLOR");
    for (const key of tokenKeys) {
      let variable = existingVars.find(
        (v) => v.variableCollectionId === collection.id && v.name === `color/${key}`
      );
      if (!variable) {
        variable = figma.variables.createVariable(`color/${key}`, collection, "COLOR");
      }
      variable.setValueForMode(lightModeId, hex(THEMES.light[key]));
      variable.setValueForMode(darkModeId, hex(THEMES.dark[key]));
    }
  } catch (err) {
    console.warn("Variable creation skipped (plan/mode limit):", err);
  }

  // Helper: Auto-Layout Frame
  function createBox({
    name = "Frame",
    dir = "VERTICAL",
    gap = 12,
    padX = 0,
    padY = 0,
    fill = null,
    stroke = null,
    strokeWeight = 1,
    radius = 0,
    width = null,
    height = null,
    alignMain = "MIN",
    alignCross = "MIN",
  }) {
    const f = figma.createFrame();
    f.name = name;
    f.layoutMode = dir;
    f.itemSpacing = gap;
    f.paddingLeft = padX;
    f.paddingRight = padX;
    f.paddingTop = padY;
    f.paddingBottom = padY;
    f.primaryAxisAlignItems = alignMain;
    f.counterAxisAlignItems = alignCross;
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "AUTO";
    f.fills = fill ? solid(fill) : [];
    if (stroke) {
      f.strokes = solid(stroke);
      f.strokeWeight = strokeWeight;
    }
    f.cornerRadius = radius;
    if (width !== null && height !== null) {
      f.resize(width, height);
    } else if (width !== null) {
      f.resize(width, 100);
      f.primaryAxisSizingMode = dir === "VERTICAL" ? "AUTO" : "FIXED";
      f.counterAxisSizingMode = dir === "VERTICAL" ? "FIXED" : "AUTO";
    }
    return f;
  }

  function createText(content, size = 14, weight = "Regular", color = "#09090B") {
    const t = figma.createText();
    t.fontName = { family: SANS_FONT, style: weight };
    t.characters = String(content);
    t.fontSize = size;
    t.fills = solid(color);
    return t;
  }

  function appendFill(parent, child) {
    parent.appendChild(child);
    child.layoutSizingHorizontal = "FILL";
    return child;
  }

  function createBadge(text, bgColor, textColor, borderColor = null) {
    const b = createBox({
      name: `Badge_${text}`,
      dir: "HORIZONTAL",
      padX: 10,
      padY: 4,
      fill: bgColor,
      stroke: borderColor,
      radius: 999,
      alignCross: "CENTER",
    });
    b.appendChild(createText(text, 11, "Semi Bold", textColor));
    return b;
  }

  function createButton(label, T, variant = "primary") {
    const isPrimary = variant === "primary";
    const btn = createBox({
      name: `Btn_${label}`,
      dir: "HORIZONTAL",
      padX: 16,
      padY: 10,
      fill: isPrimary ? T.brand : T.surface,
      stroke: isPrimary ? null : T.lineStrong,
      radius: 8,
      alignMain: "CENTER",
      alignCross: "CENTER",
    });
    btn.appendChild(
      createText(label, 13, "Semi Bold", isPrimary ? T.brandText : T.inkPrimary)
    );
    return btn;
  }

  // Shared Sticky EST Navbar (matches src/components/Navbar.tsx)
  function buildNavbar(parent, T, activeTab = "สถานประกอบการ", role = "student") {
    const header = createBox({
      name: "Navbar",
      dir: "HORIZONTAL",
      gap: 16,
      padX: 28,
      padY: 12,
      fill: T.surface,
      stroke: T.line,
      alignMain: "SPACE_BETWEEN",
      alignCross: "CENTER",
    });
    appendFill(parent, header);

    const left = createBox({ name: "NavLeft", dir: "HORIZONTAL", gap: 20, alignCross: "CENTER" });
    const brand = createBox({ name: "Brand", dir: "HORIZONTAL", gap: 8, alignCross: "CENTER" });
    const mark = createBox({
      name: "EST_Mark",
      dir: "HORIZONTAL",
      padX: 8,
      padY: 5,
      fill: T.brand,
      radius: 6,
      alignMain: "CENTER",
      alignCross: "CENTER",
    });
    mark.appendChild(createText("EST", 11, "Bold", T.brandText));
    brand.appendChild(mark);
    brand.appendChild(createText("EST", 14, "Semi Bold", T.inkPrimary));
    left.appendChild(brand);

    const tabs =
      role === "guest"
        ? ["สถานประกอบการ", "รีวิวรายวิชา", "ติดต่อ"]
        : [
            "สถานประกอบการ",
            "รีวิวรายวิชา",
            "รอบฝึกงาน",
            "บันทึกงาน",
            "สถานประกอบการของฉัน",
            "ติดต่อ",
          ];

    const navLinks = createBox({ name: "NavLinks", dir: "HORIZONTAL", gap: 4, alignCross: "CENTER" });
    tabs.forEach((tab) => {
      const active = tab === activeTab;
      const item = createBox({
        name: `Nav_${tab}`,
        dir: "HORIZONTAL",
        padX: 12,
        padY: 6,
        fill: active ? T.surfaceMuted : null,
        radius: 8,
      });
      item.appendChild(
        createText(tab, 13, active ? "Semi Bold" : "Medium", active ? T.inkPrimary : T.inkSecondary)
      );
      navLinks.appendChild(item);
    });
    left.appendChild(navLinks);
    header.appendChild(left);

    const right = createBox({ name: "NavRight", dir: "HORIZONTAL", gap: 10, alignCross: "CENTER" });
    right.appendChild(
      createBadge(T.name === "Light" ? "☀ Light" : "☾ Dark", T.surfaceMuted, T.inkSecondary, T.line)
    );
    if (role === "guest") {
      right.appendChild(createText("สมัครสมาชิก", 13, "Medium", T.inkSecondary));
      right.appendChild(createButton("เข้าสู่ระบบ", T, "primary"));
    } else {
      right.appendChild(createText("สมชาย ใจดี (นักศึกษา)", 13, "Medium", T.inkPrimary));
      right.appendChild(createText("ออกจากระบบ", 13, "Medium", T.inkMuted));
    }
    header.appendChild(right);
  }

  // =========================================================================
  // 00. DESIGN SYSTEM TOKENS SPEC CARD
  // =========================================================================
  function buildDesignSystemFrame(xPos, yPos) {
    const T = THEMES.light;
    const frame = createBox({
      name: "00_ESTv2_Design_System_Monochrome",
      dir: "VERTICAL",
      gap: 20,
      padX: 32,
      padY: 32,
      fill: T.bg,
      stroke: T.lineStrong,
      radius: 16,
      width: 1280,
    });
    frame.x = xPos;
    frame.y = yPos;

    frame.appendChild(
      createText("ESTv2 Design System — Monochrome Black & White + Anuphan", 22, "Bold", T.inkPrimary)
    );
    frame.appendChild(
      createText(
        `Typography: ${SANS_FONT} + IBM Plex Mono  •  Themes: Light & Dark Mode (Local Variables created)`,
        13,
        "Regular",
        T.inkMuted
      )
    );

    const row = createBox({ name: "ThemeComparison", dir: "HORIZONTAL", gap: 20 });
    appendFill(frame, row);

    [THEMES.light, THEMES.dark].forEach((theme) => {
      const card = createBox({
        name: `Palette_${theme.name}`,
        dir: "VERTICAL",
        gap: 12,
        padX: 20,
        padY: 20,
        fill: theme.bg,
        stroke: theme.lineStrong,
        radius: 14,
      });
      appendFill(row, card);
      card.appendChild(createText(`${theme.name} Mode Tokens`, 16, "Bold", theme.inkPrimary));

      const swatches = createBox({ name: "Swatches", dir: "HORIZONTAL", gap: 10 });
      appendFill(card, swatches);
      [
        ["bg", theme.bg],
        ["surface", theme.surface],
        ["muted", theme.surfaceMuted],
        ["brand", theme.brand],
        ["inkSec", theme.inkSecondary],
      ].forEach(([label, hexVal]) => {
        const sw = createBox({
          name: `Swatch_${label}`,
          dir: "VERTICAL",
          gap: 6,
          padX: 10,
          padY: 10,
          fill: theme.surface,
          stroke: theme.line,
          radius: 10,
        });
        appendFill(swatches, sw);
        const chip = createBox({
          name: "Color",
          fill: hexVal,
          stroke: theme.lineStrong,
          radius: 6,
          width: 72,
          height: 32,
        });
        sw.appendChild(chip);
        sw.appendChild(createText(label, 11, "Semi Bold", theme.inkPrimary));
        sw.appendChild(createText(hexVal, 10, "Regular", theme.inkMuted));
      });
    });

    return frame;
  }

  // =========================================================================
  // 01. HOME DISCOVERY (/)
  // =========================================================================
  function buildHomeScreen(T, xPos, yPos) {
    const screen = createBox({
      name: `01_Home_Discovery_${T.name}`,
      dir: "VERTICAL",
      gap: 0,
      fill: T.bg,
      stroke: T.lineStrong,
      radius: 16,
      width: 1280,
    });
    screen.x = xPos;
    screen.y = yPos;

    buildNavbar(screen, T, "สถานประกอบการ", "student");

    const body = createBox({
      name: "MainContainer",
      dir: "VERTICAL",
      gap: 20,
      padX: 36,
      padY: 28,
    });
    appendFill(screen, body);

    // Compact 8/4 Search + Top Rated Strip
    const topStrip = createBox({ name: "HeaderSearchAndTopRated", dir: "HORIZONTAL", gap: 16 });
    appendFill(body, topStrip);

    const searchCard = createBox({
      name: "SearchCard",
      dir: "VERTICAL",
      gap: 14,
      padX: 20,
      padY: 20,
      fill: T.surface,
      stroke: T.line,
      radius: 14,
    });
    appendFill(topStrip, searchCard);
    searchCard.appendChild(createText("ค้นหาสถานประกอบการฝึกงาน", 20, "Bold", T.inkPrimary));
    searchCard.appendChild(
      createText(
        "รวบรวมสถานประกอบการจริง พร้อมรูปแบบการทำงาน (Onsite / Hybrid / Remote) จังหวัด และรีวิวจากนักศึกษา",
        13,
        "Regular",
        T.inkMuted
      )
    );

    const searchRow = createBox({ name: "SearchInputs", dir: "HORIZONTAL", gap: 8, alignCross: "CENTER" });
    appendFill(searchCard, searchRow);
    const input = createBox({
      name: "SearchInput",
      dir: "HORIZONTAL",
      padX: 12,
      padY: 10,
      fill: T.bg,
      stroke: T.lineStrong,
      radius: 8,
    });
    input.appendChild(createText("ค้นหาชื่อบริษัท ลักษณะงาน หรือที่อยู่...", 13, "Regular", T.inkMuted));
    appendFill(searchRow, input);
    searchRow.appendChild(createButton("ค้นหา", T, "primary"));

    const pillRow = createBox({ name: "WorkTypePills", dir: "HORIZONTAL", gap: 8 });
    ["ทั้งหมด", "เขียนโปรแกรม", "ทำกราฟิก", "ระบบเครือข่าย", "ทำเว็บไซต์", "ด้านบริการ"].forEach(
      (cat, idx) => {
        pillRow.appendChild(
          createBadge(
            cat,
            idx === 0 ? T.brand : T.surfaceMuted,
            idx === 0 ? T.brandText : T.inkSecondary
          )
        );
      }
    );
    searchCard.appendChild(pillRow);

    const topRatedCard = createBox({
      name: "TopRatedStrip",
      dir: "VERTICAL",
      gap: 10,
      padX: 18,
      padY: 18,
      fill: T.surface,
      stroke: T.line,
      radius: 14,
      width: 390,
    });
    topStrip.appendChild(topRatedCard);
    topRatedCard.appendChild(createText("★ คะแนนรีวิวสูงสุด (Top 3)", 14, "Semi Bold", T.inkPrimary));
    [
      "#1 สตูดิโอ ครีเอทีฟ ดีไซน์  •  ★ 5.0",
      "#2 บริษัท ซอฟต์แวร์โซลูชั่น จำกัด  •  ★ 4.8",
      "#3 เน็ตเวิร์ค แอนด์ ซิสเต็มส์ เซอร์วิส  •  ★ 4.5",
    ].forEach((line) => {
      const r = createBox({
        name: "TopRow",
        dir: "HORIZONTAL",
        padX: 12,
        padY: 8,
        fill: T.bg,
        stroke: T.line,
        radius: 8,
        alignMain: "SPACE_BETWEEN",
      });
      appendFill(topRatedCard, r);
      r.appendChild(createText(line, 12, "Medium", T.inkPrimary));
      r.appendChild(createText("→", 12, "Semi Bold", T.inkMuted));
    });

    // Workplace Cards Row
    const cardsRow = createBox({ name: "WorkplaceGrid", dir: "HORIZONTAL", gap: 16 });
    appendFill(body, cardsRow);
    [
      {
        name: "บริษัท ซอฟต์แวร์โซลูชั่น จำกัด",
        type: "เขียนโปรแกรม",
        mode: "Hybrid",
        province: "สงขลา",
        desc: "พัฒนาเว็บแอปพลิเคชันและระบบหลังบ้านด้วย Next.js, TypeScript และ PostgreSQL",
        meta: "★ 4.8  •  2 รีวิว  •  3 คนเลือก",
      },
      {
        name: "ดิจิทัล เว็บ เอเจนซี่",
        type: "ทำเว็บไซต์",
        mode: "Remote 100%",
        province: "ทำงานระยะไกล",
        desc: "รับทำเว็บไซต์องค์กร ระบบ E-Commerce ด้วย React, Next.js และออกแบบ UI/UX",
        meta: "★ 4.0  •  1 รีวิว  •  1 คนเลือก",
      },
      {
        name: "สตูดิโอ ครีเอทีฟ ดีไซน์",
        type: "ทำกราฟิก",
        mode: "Onsite",
        province: "สงขลา",
        desc: "ออกแบบสื่อสิ่งพิมพ์ โลโก้ แบนเนอร์ และกราฟิกโซเชียลมีเดียด้วย Figma",
        meta: "★ 5.0  •  1 รีวิว  •  1 คนเลือก",
      },
    ].forEach((wp) => {
      const card = createBox({
        name: `Card_${wp.name}`,
        dir: "VERTICAL",
        gap: 10,
        padX: 18,
        padY: 18,
        fill: T.surface,
        stroke: T.line,
        radius: 14,
      });
      appendFill(cardsRow, card);

      const badges = createBox({ name: "Badges", dir: "HORIZONTAL", gap: 6 });
      badges.appendChild(createBadge(wp.type, T.surfaceMuted, T.inkPrimary));
      badges.appendChild(createBadge(wp.mode, T.skyBg, T.sky));
      badges.appendChild(createBadge(wp.province, T.bg, T.inkMuted, T.line));
      card.appendChild(badges);

      card.appendChild(createText(wp.name, 15, "Semi Bold", T.inkPrimary));
      card.appendChild(createText(wp.desc, 12, "Regular", T.inkSecondary));
      card.appendChild(createText(wp.meta, 12, "Medium", T.inkMuted));
    });

    return screen;
  }

  // =========================================================================
  // 02. COURSE REVIEWS (/courses) — Own University/Faculty/Major + Passed Only
  // =========================================================================
  function buildCourseReviewsScreen(T, xPos, yPos) {
    const screen = createBox({
      name: `02_Course_Reviews_${T.name}`,
      dir: "VERTICAL",
      gap: 0,
      fill: T.bg,
      stroke: T.lineStrong,
      radius: 16,
      width: 1280,
    });
    screen.x = xPos;
    screen.y = yPos;

    buildNavbar(screen, T, "รีวิวรายวิชา", "student");

    const body = createBox({
      name: "MainContainer",
      dir: "VERTICAL",
      gap: 16,
      padX: 36,
      padY: 24,
    });
    appendFill(screen, body);

    const head = createBox({
      name: "PageHeader",
      dir: "HORIZONTAL",
      alignMain: "SPACE_BETWEEN",
      alignCross: "CENTER",
    });
    appendFill(body, head);
    const titleBox = createBox({ name: "Titles", dir: "VERTICAL", gap: 4 });
    titleBox.appendChild(createText("รีวิวรายวิชามหาวิทยาลัย", 20, "Bold", T.inkPrimary));
    titleBox.appendChild(
      createText(
        "ดูรีวิวได้ทุกสถาบัน • เขียนรีวิวได้เฉพาะมหาวิทยาลัย คณะ สาขาของตนเอง และวิชาที่เรียนผ่านแล้วเท่านั้น",
        12,
        "Regular",
        T.inkMuted
      )
    );
    head.appendChild(titleBox);
    head.appendChild(createButton("+ เพิ่มรายวิชาใหม่", T, "secondary"));

    // Affiliation Bar
    const affBar = createBox({
      name: "StudentAffiliationBar",
      dir: "HORIZONTAL",
      padX: 16,
      padY: 10,
      fill: T.surface,
      stroke: T.line,
      radius: 12,
      alignMain: "SPACE_BETWEEN",
      alignCross: "CENTER",
    });
    appendFill(body, affBar);
    affBar.appendChild(
      createText(
        "🎓 สังกัดของคุณ: มหาวิทยาลัยสงขลานครินทร์ / คณะวิศวกรรมศาสตร์ / วิศวกรรมคอมพิวเตอร์  ·  บันทึกผ่านแล้ว 3 วิชา",
        12,
        "Medium",
        T.inkPrimary
      )
    );
    affBar.appendChild(createBadge("อยู่ในสาขาของคุณ", T.emeraldBg, T.emerald, T.emeraldBorder));

    // 5-Level Cascading Filter Bar
    const filterBar = createBox({
      name: "CascadingFilterBar",
      dir: "HORIZONTAL",
      gap: 10,
      padX: 16,
      padY: 14,
      fill: T.surface,
      stroke: T.line,
      radius: 14,
    });
    appendFill(body, filterBar);
    [
      ["1. มหาวิทยาลัย", "มหาวิทยาลัยสงขลานครินทร์ ▼"],
      ["2. คณะ", "คณะวิศวกรรมศาสตร์ ▼"],
      ["3. สาขา", "วิศวกรรมคอมพิวเตอร์ ▼"],
      ["4. ชั้นปี", "ทุกชั้นปี ▼"],
      ["5. รายวิชา (4)", "✓ 240-211 โครงสร้างข้อมูลฯ ▼"],
    ].forEach(([lbl, val]) => {
      const col = createBox({ name: `Filter_${lbl}`, dir: "VERTICAL", gap: 4 });
      appendFill(filterBar, col);
      col.appendChild(createText(lbl, 11, "Medium", T.inkMuted));
      const sel = createBox({
        name: "Select",
        dir: "HORIZONTAL",
        padX: 10,
        padY: 8,
        fill: T.bg,
        stroke: T.lineStrong,
        radius: 8,
      });
      appendFill(col, sel);
      sel.appendChild(createText(val, 12, "Medium", T.inkPrimary));
    });

    // Two Columns (7 / 5)
    const cols = createBox({ name: "CourseColumns", dir: "HORIZONTAL", gap: 18 });
    appendFill(body, cols);

    // Left Column: Course Summary + 3 Metrics + Reviews
    const left = createBox({ name: "LeftCol", dir: "VERTICAL", gap: 14 });
    appendFill(cols, left);

    const summary = createBox({
      name: "CourseSummaryCard",
      dir: "VERTICAL",
      gap: 14,
      padX: 20,
      padY: 20,
      fill: T.surface,
      stroke: T.line,
      radius: 14,
    });
    appendFill(left, summary);

    const metaBadges = createBox({ name: "CourseBadges", dir: "HORIZONTAL", gap: 8 });
    metaBadges.appendChild(createBadge("240-211", T.surfaceMuted, T.inkPrimary));
    metaBadges.appendChild(createBadge("ชั้นปีที่ 2", T.surfaceMuted, T.inkSecondary));
    metaBadges.appendChild(createBadge("✓ ผ่านแล้ว (เกรด B+)", T.emeraldBg, T.emerald, T.emeraldBorder));
    summary.appendChild(metaBadges);

    summary.appendChild(
      createText("โครงสร้างข้อมูลและอัลกอริทึม (Data Structures & Algorithms)", 16, "Bold", T.inkPrimary)
    );

    const metricsRow = createBox({ name: "ThreeMetrics", dir: "HORIZONTAL", gap: 10 });
    appendFill(summary, metricsRow);
    [
      ["เนื้อหา", "5.0 / 5.0", T.emerald],
      ["ภาระงาน", "4.0 / 5.0", T.sky],
      ["ความยากเก็บเกรด", "3.5 / 5.0", T.amber],
    ].forEach(([lbl, score, color]) => {
      const m = createBox({
        name: `Metric_${lbl}`,
        dir: "VERTICAL",
        gap: 6,
        padX: 12,
        padY: 12,
        fill: T.bg,
        stroke: T.line,
        radius: 10,
      });
      appendFill(metricsRow, m);
      m.appendChild(createText(lbl, 11, "Medium", T.inkSecondary));
      m.appendChild(createText(score, 15, "Bold", T.inkPrimary));
      const bar = createBox({ name: "Bar", fill: color, radius: 999, width: 120, height: 6 });
      m.appendChild(bar);
    });

    const revCard = createBox({
      name: "ReviewCard",
      dir: "VERTICAL",
      gap: 8,
      padX: 16,
      padY: 14,
      fill: T.surface,
      stroke: T.line,
      radius: 14,
    });
    appendFill(left, revCard);
    revCard.appendChild(createText("สมชาย ใจดี  •  ปี 2568 / เทอม 1", 12, "Semi Bold", T.inkPrimary));
    revCard.appendChild(
      createText("เนื้อหา 5/5  •  ภาระงาน 4/5  •  ความยากเก็บเกรด 3/5", 11, "Medium", T.inkMuted)
    );
    revCard.appendChild(
      createText(
        "เนื้อหาเข้มข้นมาก นำไปใช้ตอนสอบสัมภาษณ์ฝึกงานได้จริง แนะนำให้ฝึกทำโจทย์ทุกสัปดาห์",
        13,
        "Regular",
        T.inkSecondary
      )
    );

    // Right Column: Review Form + Guard States Reference
    const right = createBox({ name: "RightCol_ReviewPanel", dir: "VERTICAL", gap: 12, width: 440 });
    cols.appendChild(right);

    const formCard = createBox({
      name: "WriteReviewCard",
      dir: "VERTICAL",
      gap: 12,
      padX: 20,
      padY: 18,
      fill: T.surface,
      stroke: T.line,
      radius: 14,
    });
    appendFill(right, formCard);
    formCard.appendChild(createText("เขียนรีวิววิชา 240-211", 15, "Bold", T.inkPrimary));
    formCard.appendChild(
      createBadge("✓ ผ่านวิชานี้แล้ว · เกรด B+ (ปี 2568 เทอม 1)", T.emeraldBg, T.emerald, T.emeraldBorder)
    );
    formCard.appendChild(createText("เนื้อหา: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5* ]", 12, "Medium", T.inkSecondary));
    formCard.appendChild(createText("ภาระงาน: [ 1 ] [ 2 ] [ 3* ] [ 4 ] [ 5 ]", 12, "Medium", T.inkSecondary));
    formCard.appendChild(createText("ความยากเก็บเกรด: [ 1 ] [ 2 ] [ 3* ] [ 4 ] [ 5 ]", 12, "Medium", T.inkSecondary));
    appendFill(formCard, createButton("ส่งรีวิวรายวิชา", T, "primary"));

    // Guard States Spec Box (shows the other 2 student states right in Figma)
    const guardSpec = createBox({
      name: "StudentGuardStates",
      dir: "VERTICAL",
      gap: 8,
      padX: 16,
      padY: 14,
      fill: T.surface,
      stroke: T.line,
      radius: 14,
    });
    appendFill(right, guardSpec);
    guardSpec.appendChild(createText("เงื่อนไขสิทธิ์การรีวิวของนักศึกษา (Server-Enforced)", 12, "Bold", T.inkPrimary));
    guardSpec.appendChild(
      createText("🔒 ต่างมหาวิทยาลัย/คณะ/สาขา → ล็อกฟอร์ม + ปุ่ม 'ไปยังรายวิชาในสาขาของฉัน'", 11, "Regular", T.inkSecondary)
    );
    guardSpec.appendChild(
      createText("📝 ในสาขาแต่ยังไม่ผ่าน → แสดงฟอร์มบันทึกเกรดที่ผ่าน (A, B+, B, C+, C, D+, D, S) ก่อนปลดล็อก", 11, "Regular", T.inkSecondary)
    );

    return screen;
  }

  // =========================================================================
  // 03. WORKPLACE DETAIL (/workplaces/[id])
  // =========================================================================
  function buildWorkplaceDetailScreen(T, xPos, yPos) {
    const screen = createBox({
      name: `03_Workplace_Detail_${T.name}`,
      dir: "VERTICAL",
      gap: 0,
      fill: T.bg,
      stroke: T.lineStrong,
      radius: 16,
      width: 1280,
    });
    screen.x = xPos;
    screen.y = yPos;

    buildNavbar(screen, T, "สถานประกอบการ", "student");

    const body = createBox({ name: "MainContainer", dir: "VERTICAL", gap: 18, padX: 36, padY: 28 });
    appendFill(screen, body);
    body.appendChild(createText("← กลับหน้ารายชื่อสถานประกอบการ", 13, "Medium", T.inkSecondary));

    const cols = createBox({ name: "DetailCols", dir: "HORIZONTAL", gap: 20 });
    appendFill(body, cols);

    const left = createBox({
      name: "CompanyDetailCard",
      dir: "VERTICAL",
      gap: 14,
      padX: 24,
      padY: 24,
      fill: T.surface,
      stroke: T.line,
      radius: 16,
    });
    appendFill(cols, left);

    const bRow = createBox({ name: "Badges", dir: "HORIZONTAL", gap: 8 });
    bRow.appendChild(createBadge("เขียนโปรแกรม", T.surfaceMuted, T.inkPrimary));
    bRow.appendChild(createBadge("Hybrid", T.skyBg, T.sky));
    bRow.appendChild(createBadge("จ.สงขลา", T.bg, T.inkMuted, T.line));
    left.appendChild(bRow);

    left.appendChild(createText("บริษัท ซอฟต์แวร์โซลูชั่น จำกัด", 22, "Bold", T.inkPrimary));
    left.appendChild(
      createText(
        "พัฒนาเว็บแอปพลิเคชันและระบบหลังบ้านด้วย Next.js, TypeScript และฐานข้อมูล PostgreSQL",
        14,
        "Regular",
        T.inkSecondary
      )
    );
    left.appendChild(
      createText("โทร: 074-123456  •  ที่อยู่: 123 ถ.กาญจนวนิช อ.หาดใหญ่ จ.สงขลา", 12, "Medium", T.inkMuted)
    );
    appendFill(left, createButton("✓ เลือกเป็นสถานประกอบการฝึกงานของฉัน", T, "primary"));

    const right = createBox({
      name: "RatingSummaryCard",
      dir: "VERTICAL",
      gap: 8,
      padX: 24,
      padY: 24,
      fill: T.surface,
      stroke: T.line,
      radius: 16,
      width: 340,
      alignCross: "CENTER",
    });
    cols.appendChild(right);
    right.appendChild(createText("คะแนนรีวิวเฉลี่ย", 12, "Medium", T.inkMuted));
    right.appendChild(createText("4.8 / 5.0", 34, "Bold", T.inkPrimary));
    right.appendChild(createText("★★★★★ (2 ความคิดเห็น)", 13, "Semi Bold", T.amber));

    return screen;
  }

  // =========================================================================
  // 04. STUDENT INTERNSHIPS & LOGBOOK (/student/internships, /student/logbook)
  // =========================================================================
  function buildLogbookScreen(T, xPos, yPos) {
    const screen = createBox({
      name: `04_Student_Internships_Logbook_${T.name}`,
      dir: "VERTICAL",
      gap: 0,
      fill: T.bg,
      stroke: T.lineStrong,
      radius: 16,
      width: 1280,
    });
    screen.x = xPos;
    screen.y = yPos;

    buildNavbar(screen, T, "บันทึกงาน", "student");

    const body = createBox({ name: "MainContainer", dir: "VERTICAL", gap: 18, padX: 36, padY: 28 });
    appendFill(screen, body);

    const head = createBox({ name: "Header", dir: "HORIZONTAL", alignMain: "SPACE_BETWEEN", alignCross: "CENTER" });
    appendFill(body, head);
    head.appendChild(createText("บันทึกการทำงานรายวัน & รายงานสรุปรอบฝึกงาน", 20, "Bold", T.inkPrimary));
    head.appendChild(createBadge("รอบที่ 2 (Active) · ส่งรายงานรายสัปดาห์", T.emeraldBg, T.emerald, T.emeraldBorder));

    const cols = createBox({ name: "LogbookCols", dir: "HORIZONTAL", gap: 18 });
    appendFill(body, cols);

    const logsCard = createBox({
      name: "DailyLogsList",
      dir: "VERTICAL",
      gap: 10,
      padX: 20,
      padY: 20,
      fill: T.surface,
      stroke: T.line,
      radius: 14,
    });
    appendFill(cols, logsCard);
    logsCard.appendChild(createText("บันทึกการทำงานรายวัน (Daily Logbook)", 15, "Bold", T.inkPrimary));
    [
      "2026-11-18 (สัปดาห์ 2 • 8 ชม.) — แก้บั๊กการแสดงผลบนมือถือ 390px และเชื่อมอัปโหลดไฟล์  [Next.js, TypeScript]",
      "2026-11-17 (สัปดาห์ 2 • 8 ชม.) — ปรับปรุง Dark Mode และตรวจสอบ Contrast WCAG 2.1 AA  [Tailwind CSS, Figma]",
      "2026-11-16 (สัปดาห์ 2 • 8 ชม.) — พัฒนาหน้า Dashboard พร้อมตัวกรองและค้นหา  [Next.js, Prisma]",
    ].forEach((entry) => {
      const item = createBox({
        name: "LogItem",
        dir: "HORIZONTAL",
        padX: 14,
        padY: 12,
        fill: T.bg,
        stroke: T.line,
        radius: 10,
      });
      appendFill(logsCard, item);
      item.appendChild(createText(entry, 12, "Regular", T.inkPrimary));
    });

    const repCard = createBox({
      name: "PeriodReportsCard",
      dir: "VERTICAL",
      gap: 10,
      padX: 20,
      padY: 20,
      fill: T.surface,
      stroke: T.line,
      radius: 14,
      width: 420,
    });
    cols.appendChild(repCard);
    repCard.appendChild(createText("รายงานสรุปรอบส่งอาจารย์", 15, "Bold", T.inkPrimary));
    repCard.appendChild(createBadge("สัปดาห์ที่ 1 · ตรวจแล้ว (Reviewed)", T.emeraldBg, T.emerald, T.emeraldBorder));
    repCard.appendChild(
      createText("ความเห็นอาจารย์: ทำได้ดีมากครับ สัปดาห์หน้าลองเน้นเรื่อง Performance เพิ่มเติม", 12, "Regular", T.inkSecondary)
    );
    repCard.appendChild(createBadge("สัปดาห์ที่ 2 · ส่งแล้วรอตรวจ (Submitted)", T.amberBg, T.amber, T.amberBorder));
    appendFill(repCard, createButton("+ บันทึกงานวันนี้", T, "primary"));

    return screen;
  }

  // =========================================================================
  // 05. REGISTER (/register) — 10-Digit ID & University/Faculty/Major Cascade
  // =========================================================================
  function buildRegisterScreen(T, xPos, yPos) {
    const screen = createBox({
      name: `05_Register_10Digit_ID_${T.name}`,
      dir: "VERTICAL",
      gap: 0,
      fill: T.bg,
      stroke: T.lineStrong,
      radius: 16,
      width: 1280,
    });
    screen.x = xPos;
    screen.y = yPos;

    buildNavbar(screen, T, "", "guest");

    const body = createBox({
      name: "CenterContainer",
      dir: "VERTICAL",
      gap: 16,
      padX: 320,
      padY: 32,
      alignCross: "CENTER",
    });
    appendFill(screen, body);

    const card = createBox({
      name: "RegisterCard",
      dir: "VERTICAL",
      gap: 14,
      padX: 28,
      padY: 28,
      fill: T.surface,
      stroke: T.line,
      radius: 16,
    });
    appendFill(body, card);

    card.appendChild(createText("สมัครสมาชิก EST Platform", 20, "Bold", T.inkPrimary));
    card.appendChild(
      createText(
        "ระบบจะสร้างรหัสผู้ใช้ 10 หลักอัตโนมัติ (ปี + รหัสมหาวิทยาลัย + รหัสคณะ + ลำดับ) และรอผู้ดูแลอนุมัติ",
        12,
        "Regular",
        T.inkMuted
      )
    );

    [
      "มหาวิทยาลัย: มหาวิทยาลัยสงขลานครินทร์ (01)",
      "คณะ: คณะวิศวกรรมศาสตร์ (01)  |  สาขา: วิศวกรรมคอมพิวเตอร์ (COE)",
      "ชื่อ-นามสกุล: ณัฐพล รหัสสิบหลัก  |  ปีการศึกษา: 2569",
      "หลักฐานยืนยันตัวตน: แนบภาพบัตรนักศึกษา / บัตรอาจารย์ (JPG, PNG, PDF)",
    ].forEach((field) => {
      const f = createBox({
        name: "Field",
        dir: "HORIZONTAL",
        padX: 12,
        padY: 10,
        fill: T.bg,
        stroke: T.lineStrong,
        radius: 8,
      });
      appendFill(card, f);
      f.appendChild(createText(field, 12, "Medium", T.inkPrimary));
    });

    card.appendChild(createBadge("ตัวอย่างรหัสผู้ใช้ที่ได้: 6901010002 (รอตรวจสอบ)", T.surfaceMuted, T.inkPrimary));
    appendFill(card, createButton("ส่งคำขอสมัครสมาชิก", T, "primary"));

    return screen;
  }

  // =========================================================================
  // 06. ADMIN DASHBOARD (/admin/approvals) — Dedicated Left Sidebar Layout
  // =========================================================================
  function buildAdminScreen(T, xPos, yPos) {
    const screen = createBox({
      name: `06_Admin_Portal_Sidebar_${T.name}`,
      dir: "HORIZONTAL",
      gap: 0,
      fill: T.bg,
      stroke: T.lineStrong,
      radius: 16,
      width: 1280,
    });
    screen.x = xPos;
    screen.y = yPos;

    // Left Sidebar
    const sidebar = createBox({
      name: "AdminSidebar",
      dir: "VERTICAL",
      gap: 10,
      padX: 18,
      padY: 22,
      fill: T.surface,
      stroke: T.line,
      width: 240,
    });
    screen.appendChild(sidebar);
    sidebar.appendChild(createText("EST  Admin", 16, "Bold", T.inkPrimary));
    sidebar.appendChild(createText("ผู้ดูแลระบบ (admin)", 11, "Regular", T.inkMuted));

    [
      ["อนุมัติบัญชีผู้ใช้ (1)", true],
      ["สถานประกอบการ", false],
      ["จัดการผู้ใช้งาน", false],
      ["ความคิดเห็น / รีวิว", false],
      ["← กลับหน้าเว็บไซต์", false],
    ].forEach(([label, active]) => {
      const item = createBox({
        name: `Side_${label}`,
        dir: "HORIZONTAL",
        padX: 12,
        padY: 9,
        fill: active ? T.surfaceMuted : null,
        radius: 8,
      });
      appendFill(sidebar, item);
      item.appendChild(
        createText(label, 13, active ? "Semi Bold" : "Medium", active ? T.inkPrimary : T.inkSecondary)
      );
    });

    // Main Content
    const main = createBox({
      name: "AdminMainContent",
      dir: "VERTICAL",
      gap: 18,
      padX: 28,
      padY: 28,
    });
    appendFill(screen, main);

    main.appendChild(createText("คำขอสมัครสมาชิกรอตรวจสอบ (Approvals)", 20, "Bold", T.inkPrimary));

    const stats = createBox({ name: "KPIStats", dir: "HORIZONTAL", gap: 14 });
    appendFill(main, stats);
    [
      ["รออนุมัติ", "1 บัญชี"],
      ["สถานประกอบการ", "5 แห่ง"],
      ["ผู้ใช้งานทั้งหมด", "8 บัญชี"],
      ["รีวิวรายวิชา", "4 รายการ"],
    ].forEach(([lbl, val]) => {
      const sc = createBox({
        name: `KPI_${lbl}`,
        dir: "VERTICAL",
        gap: 4,
        padX: 16,
        padY: 14,
        fill: T.surface,
        stroke: T.line,
        radius: 12,
      });
      appendFill(stats, sc);
      sc.appendChild(createText(lbl, 11, "Medium", T.inkMuted));
      sc.appendChild(createText(val, 20, "Bold", T.inkPrimary));
    });

    const table = createBox({
      name: "PendingTable",
      dir: "VERTICAL",
      gap: 10,
      padX: 18,
      padY: 18,
      fill: T.surface,
      stroke: T.line,
      radius: 14,
    });
    appendFill(main, table);
    table.appendChild(createText("รายการรอตรวจสอบหลักฐาน", 14, "Semi Bold", T.inkPrimary));
    const row = createBox({
      name: "PendingRow",
      dir: "HORIZONTAL",
      padX: 14,
      padY: 12,
      fill: T.bg,
      stroke: T.line,
      radius: 10,
      alignMain: "SPACE_BETWEEN",
      alignCross: "CENTER",
    });
    appendFill(table, row);
    row.appendChild(
      createText("670199  •  ธนกร รอตรวจสอบ  •  นักศึกษา  •  ดูหลักฐานแนบ", 13, "Medium", T.inkPrimary)
    );
    const acts = createBox({ name: "Actions", dir: "HORIZONTAL", gap: 8 });
    acts.appendChild(createBadge("อนุมัติ", T.emeraldBg, T.emerald, T.emeraldBorder));
    acts.appendChild(createBadge("ปฏิเสธ", T.dangerBg, T.danger));
    row.appendChild(acts);

    return screen;
  }

  // Find clear X position on current page
  let startX = 0;
  for (const child of figma.currentPage.children) {
    startX = Math.max(startX, child.x + child.width + 200);
  }

  const COL_GAP = 1360;
  const created = [];

  // Row 0: Design System Spec
  created.push(buildDesignSystemFrame(startX, 0));

  // Row 1: Light Mode (6 Current Screens)
  const lightY = 380;
  created.push(buildHomeScreen(THEMES.light, startX + COL_GAP * 0, lightY));
  created.push(buildCourseReviewsScreen(THEMES.light, startX + COL_GAP * 1, lightY));
  created.push(buildWorkplaceDetailScreen(THEMES.light, startX + COL_GAP * 2, lightY));
  created.push(buildLogbookScreen(THEMES.light, startX + COL_GAP * 3, lightY));
  created.push(buildRegisterScreen(THEMES.light, startX + COL_GAP * 4, lightY));
  created.push(buildAdminScreen(THEMES.light, startX + COL_GAP * 5, lightY));

  // Row 2: Dark Mode (6 Current Screens)
  const darkY = 1280;
  created.push(buildHomeScreen(THEMES.dark, startX + COL_GAP * 0, darkY));
  created.push(buildCourseReviewsScreen(THEMES.dark, startX + COL_GAP * 1, darkY));
  created.push(buildWorkplaceDetailScreen(THEMES.dark, startX + COL_GAP * 2, darkY));
  created.push(buildLogbookScreen(THEMES.dark, startX + COL_GAP * 3, darkY));
  created.push(buildRegisterScreen(THEMES.dark, startX + COL_GAP * 4, darkY));
  created.push(buildAdminScreen(THEMES.dark, startX + COL_GAP * 5, darkY));

  figma.viewport.scrollAndZoomIntoView(created);
  figma.notify(
    `ESTv2 Updated: 1 Design System + 12 Screens (6 Light + 6 Dark) using ${SANS_FONT}!`
  );
  figma.closePlugin();
})();
