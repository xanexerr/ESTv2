/**
 * UNINFO — Full 3-Page Figma Generator (User Stories + 16:9 Editable Wireframes + 16:9 Hi-Fi UI)
 *
 * Synced with current UNINFO Next.js codebase:
 *  - Brand: [ UNINFO ] | Title: UNINFO | No /about page | No Footer
 *  - +2pt Typography Scale (Anuphan / fallback Inter)
 *  - Enlarged Navbar (76px): [ UNINFO ]  Career Reviews | Internships | Class Review | My Career
 *  - Auth-First Gate: Login/Register -> Choose University + Evidence -> Admin Approval
 *  - University-Scoped Content:
 *      • Career Reviews: university alumni/student workplace reviews
 *      • Internships: shown only when students from that university interned & added data
 *      • Class Review: university courses; write review only in own major & passed courses (A-D, S)
 *      • My Career: all non-universal role-specific features (Student, Teacher, Admin, Profile)
 *
 * How to run in Figma Desktop:
 *  Plugins -> Development -> Import plugin from manifest... -> figma-plugin/manifest.json
 */

(async () => {
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

  function hex(h) {
    const c = h.replace("#", "");
    return {
      r: parseInt(c.slice(0, 2), 16) / 255,
      g: parseInt(c.slice(2, 4), 16) / 255,
      b: parseInt(c.slice(4, 6), 16) / 255,
    };
  }
  function solid(h, opacity = 1) {
    return [{ type: "SOLID", color: hex(h), opacity }];
  }

  function findOrCreatePage(name) {
    const found = figma.root.children.find((p) => p.name === name);
    if (found) return found;
    const p = figma.createPage();
    p.name = name;
    return p;
  }

  function box({
    name = "Frame",
    dir = "VERTICAL",
    gap = 12,
    padX = 0,
    padY = 0,
    fill = null,
    stroke = null,
    dashed = false,
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
      f.strokeWeight = 1.2;
      if (dashed) f.dashPattern = [6, 4];
    }
    f.cornerRadius = radius;
    if (width !== null && height !== null) {
      f.resize(width, height);
      f.layoutSizingHorizontal = "FIXED";
      f.layoutSizingVertical = "FIXED";
    } else if (width !== null) {
      f.resize(width, 100);
      f.primaryAxisSizingMode = dir === "VERTICAL" ? "AUTO" : "FIXED";
      f.counterAxisSizingMode = dir === "VERTICAL" ? "FIXED" : "AUTO";
    }
    return f;
  }

  function txt(content, size = 16, weight = "Regular", color = "#09090B", wrap = false) {
    const t = figma.createText();
    t.fontName = { family: SANS_FONT, style: weight };
    t.characters = String(content);
    t.fontSize = size;
    t.fills = solid(color);
    if (wrap) t.textAutoResize = "HEIGHT";
    return t;
  }

  function addFill(parent, child) {
    parent.appendChild(child);
    child.layoutSizingHorizontal = "FILL";
    if (child.type === "TEXT") {
      child.textAutoResize = "HEIGHT";
      child.layoutSizingVertical = "HUG";
    }
    return child;
  }

  function pill(label, bg, fg, stroke = null) {
    const p = box({
      name: `Tag_${label}`,
      dir: "HORIZONTAL",
      padX: 11,
      padY: 4,
      fill: bg,
      stroke,
      radius: 999,
      alignCross: "CENTER",
    });
    p.appendChild(txt(label, 14, "Semi Bold", fg));
    return p;
  }

  const LIGHT = {
    name: "Light", bg: "#FAFAFA", surface: "#FFFFFF", surfaceMuted: "#F4F4F5",
    inkPrimary: "#09090B", inkSecondary: "#3F3F46", inkMuted: "#52525B",
    line: "#E4E4E7", lineStrong: "#D4D4D8", brand: "#09090B", brandText: "#FFFFFF",
    sky: "#0284C7", skyBg: "#F0F9FF", emerald: "#059669", emeraldBg: "#ECFDF5", emeraldBorder: "#A7F3D0",
  };
  const DARK = {
    name: "Dark", bg: "#09090B", surface: "#111113", surfaceMuted: "#18181B",
    inkPrimary: "#FAFAFA", inkSecondary: "#D4D4D8", inkMuted: "#A1A1AA",
    line: "#27272A", lineStrong: "#3F3F46", brand: "#FAFAFA", brandText: "#09090B",
    sky: "#38BDF8", skyBg: "#082F49", emerald: "#34D399", emeraldBg: "#052E16", emeraldBorder: "#065F46",
  };

  // =========================================================================
  // PAGE 1: 01 — User Stories & IA Flow
  // =========================================================================
  const storiesPage = findOrCreatePage("01 — User Stories & IA Flow");
  await figma.setCurrentPageAsync(storiesPage);
  for (const ch of [...storiesPage.children]) ch.remove();

  const board = box({
    name: "UNINFO_User_Stories_Board",
    dir: "VERTICAL",
    gap: 24,
    padX: 40,
    padY: 40,
    fill: "#FAFAFA",
    stroke: "#D4D4D8",
    radius: 20,
    width: 1920,
  });
  board.x = 100;
  board.y = 0;

  const bHead = box({ name: "BoardHeader", dir: "VERTICAL", gap: 8 });
  addFill(board, bHead);
  addFill(bHead, txt("UNINFO — User Stories & Acceptance Criteria (Updated Spec)", 29, "Bold", "#09090B", true));
  addFill(bHead, txt("Auth-First (Login/Register ก่อน) • ไม่มีหน้าติดต่อผู้พัฒนา/Admin และไม่มี Footer • ขนาดตัวอักษร +2pt • เมนูบน: [UNINFO] Career Reviews | Internships | Class Review | My Career", 17, "Regular", "#52525B", true));

  const ROLE_COLS = [
    {
      role: "1. Auth Gate & Onboarding",
      bg: "#F4F4F5", fg: "#18181B",
      stories: [
        { id: "US-01", wf: "WF-01", title: "บังคับเข้าสู่ระบบ / สมัครสมาชิกก่อน", story: "เข้าหน้าใดก็ตามโดยไม่ Login → Redirect ไป /login ทันที (ไม่มี Footer และไม่มีหน้าติดต่อ)", ac: "• ป้องกันทุก Route ด้วย Middleware\n• เปิด /login และ /register เป็นหน้าแรก" },
        { id: "US-02", wf: "WF-01", title: "สมัครโดยเลือกมหาวิทยาลัย + แนบหลักฐาน", story: "เลือกมหาวิทยาลัย/คณะ/สาขา + แนบไฟล์หลักฐาน ออกรหัส 10 หลัก และรอ Admin Approve ก่อน Login", ac: "• ออกรหัส 10 หลัก (YY+UNI+FAC+XXXX)\n• สถานะ Pending จนกว่า Admin กดอนุมัติ" },
      ],
    },
    {
      role: "2. Universal Navbar (ข้อมูลมหาลัยตนเอง)",
      bg: "#ECFDF5", fg: "#065F46",
      stories: [
        { id: "US-03", wf: "WF-02", title: "Career Reviews เฉพาะมหาวิทยาลัยตนเอง", story: "ดูรีวิวสายอาชีพและบริษัทที่นักศึกษาจากมหาวิทยาลัยของฉันเคยฝึกงานหรือรีวิวไว้", ac: "• กรองประเภทงาน Work Mode และดู Top 3\n• แสดงเฉพาะข้อมูลของมหาวิทยาลัยตนเอง" },
        { id: "US-04", wf: "WF-03", title: "Internships แสดงเมื่อมีรุ่นพี่เคยฝึกและเพิ่มข้อมูล", story: "แสดงสถานที่ฝึกงานต่อเมื่อเคยมีนักศึกษาในมหาวิทยาลัยนั้นไปฝึกและเพิ่มข้อมูลเข้าระบบแล้ว", ac: "• นักศึกษาเพิ่มสถานที่ฝึกงานที่เคยไปได้\n• เมื่อเพิ่มแล้ว นักศึกษาสถาบันเดียวกันจะมองเห็น" },
        { id: "US-05", wf: "WF-04", title: "Class Review เฉพาะมหาลัย & วิชาที่ผ่าน", story: "ดูรายวิชาของมหาวิทยาลัยตนเอง และเขียนรีวิวได้เฉพาะสาขาตนที่เป็นวิชาเรียนผ่านแล้วเท่านั้น", ac: "• แสดงรายวิชาในมหาวิทยาลัยของตนเอง\n• บันทึกเกรดผ่าน (A–D, S) ก่อนปลดล็อกรีวิว" },
      ],
    },
    {
      role: "3. My Career (ฟังก์ชันเฉพาะบทบาท)",
      bg: "#EFF6FF", fg: "#1E40AF",
      stories: [
        { id: "US-06", wf: "WF-05", title: "Student Workspace ใน My Career", story: "รวมรอบฝึกงาน, Daily Logbook, สถานประกอบการของฉัน, รีวิวบริษัท และโปรไฟล์ไว้ใน My Career", ac: "• ย้ายฟังก์ชันไม่ Universal เข้า /my-career ทั้งหมด\n• Navbar บนขยายใหญ่ เหลือ 4 เมนูหลัก" },
        { id: "US-07", wf: "WF-05", title: "Teacher Workspace ใน My Career", story: "อาจารย์เข้าตรวจรายงานนักศึกษาและดูแลสถานประกอบการแนะนำผ่าน My Career", ac: "• แจ้งจำนวนรายงานรอตรวจบนการ์ด\n• ทางลัดสู่ /teacher/reports และ /teacher/workplaces" },
      ],
    },
    {
      role: "4. Admin Console",
      bg: "#FEF3C7", fg: "#92400E",
      stories: [
        { id: "US-08", wf: "WF-07", title: "ตรวจหลักฐานและอนุมัติบัญชี", story: "ตรวจสอบไฟล์หลักฐานบัตรนักศึกษา/อาจารย์ และกด Approve / Reject", ac: "• แสดง badge จำนวนรอตรวจใน Admin Sidebar\n• กลับหน้า My Career ได้จาก Sidebar" },
        { id: "US-09", wf: "WF-07", title: "จัดการบริษัท ผู้ใช้ และความคิดเห็น", story: "Admin จัดการ CRUD ข้อมูลทุกมหาวิทยาลัยได้ครบผ่าน Sidebar", ac: "• ดูภาพรวมทุกมหาวิทยาลัยได้เต็มรูปแบบ" },
      ],
    },
  ];

  const cRow = box({ name: "RoleColumns", dir: "HORIZONTAL", gap: 18 });
  addFill(board, cRow);
  for (const colData of ROLE_COLS) {
    const col = box({ name: colData.role, dir: "VERTICAL", gap: 14, padX: 16, padY: 16, fill: "#FFFFFF", stroke: "#E4E4E7", radius: 14, width: 445 });
    cRow.appendChild(col);
    const ch = box({ name: "Header", dir: "HORIZONTAL", padX: 12, padY: 10, fill: colData.bg, radius: 10 });
    addFill(col, ch);
    addFill(ch, txt(colData.role, 16, "Bold", colData.fg, true));
    for (const st of colData.stories) {
      const card = box({ name: `${st.id}_${st.title}`, dir: "VERTICAL", gap: 10, padX: 16, padY: 16, fill: "#FAFAFA", stroke: "#E4E4E7", radius: 12 });
      addFill(col, card);
      const top = box({ name: "Meta", dir: "HORIZONTAL", gap: 6, alignMain: "SPACE_BETWEEN", alignCross: "CENTER" });
      addFill(card, top);
      top.appendChild(pill(st.id, "#09090B", "#FFFFFF"));
      top.appendChild(pill(`→ ${st.wf}`, "#E4E4E7", "#18181B"));
      addFill(card, txt(st.title, 16, "Bold", "#09090B", true));
      addFill(card, txt(st.story, 15, "Regular", "#3F3F46", true));
      addFill(card, txt(st.ac, 14, "Medium", "#52525B", true));
    }
  }

  // =========================================================================
  // PAGE 2: 02 — Editable Wireframes (1440x810 16:9)
  // =========================================================================
  const wfPage = findOrCreatePage("02 — Editable Wireframes (1440px)");
  await figma.setCurrentPageAsync(wfPage);
  for (const ch of [...wfPage.children]) ch.remove();

  function wfInput(label, placeholder) {
    const wrap = box({ name: `Input_${label}`, dir: "VERTICAL", gap: 4 });
    wrap.appendChild(txt(label, 14, "Semi Bold", "#52525B"));
    const field = box({ name: "Field", dir: "HORIZONTAL", padX: 12, padY: 10, fill: "#FFFFFF", stroke: "#A1A1AA", radius: 6 });
    addFill(wrap, field);
    field.appendChild(txt(placeholder, 14, "Regular", "#71717A"));
    return wrap;
  }

  function wfBtn(label, filled = true) {
    const b = box({ name: `Btn_${label}`, dir: "HORIZONTAL", padX: 16, padY: 10, fill: filled ? "#18181B" : "#FFFFFF", stroke: filled ? null : "#A1A1AA", radius: 8, alignMain: "CENTER", alignCross: "CENTER" });
    b.appendChild(txt(label, 15, "Semi Bold", filled ? "#FFFFFF" : "#18181B"));
    return b;
  }

  function buildWfNav(parent, active, loggedIn = true) {
    const nav = box({ name: "WF_UNINFO_Navbar", dir: "HORIZONTAL", gap: 20, padX: 36, padY: 16, fill: "#FAFAFA", stroke: "#D4D4D8", alignMain: "SPACE_BETWEEN", alignCross: "CENTER" });
    addFill(parent, nav);
    const left = box({ name: "Left", dir: "HORIZONTAL", gap: 24, alignCross: "CENTER" });
    const logo = box({ name: "UNINFO_Logo", dir: "HORIZONTAL", padX: 16, padY: 9, fill: "#18181B", radius: 10 });
    logo.appendChild(txt("UNINFO", 17, "Bold", "#FFFFFF"));
    left.appendChild(logo);
    if (loggedIn) {
      const links = box({ name: "NavLinks", dir: "HORIZONTAL", gap: 8 });
      for (const tab of ["Career Reviews", "Internships", "Class Review", "My Career"]) {
        const act = tab === active;
        const it = box({ name: `Nav_${tab}`, dir: "HORIZONTAL", padX: 16, padY: 9, fill: act ? "#18181B" : null, stroke: act ? null : "#D4D4D8", radius: 8 });
        it.appendChild(txt(tab, 16, act ? "Bold" : "Medium", act ? "#FFFFFF" : "#18181B"));
        links.appendChild(it);
      }
      left.appendChild(links);
    }
    nav.appendChild(left);
    const right = box({ name: "Right", dir: "HORIZONTAL", gap: 10 });
    right.appendChild(wfBtn(loggedIn ? "ออกจากระบบ" : "เข้าสู่ระบบ / สมัคร", !loggedIn));
    nav.appendChild(right);
  }

  function makeWf16x9(name, route, stories, x, y) {
    const s = box({ name, dir: "VERTICAL", gap: 0, fill: "#FFFFFF", stroke: "#A1A1AA", radius: 12, width: 1440, height: 810 });
    s.clipsContent = true; s.x = x; s.y = y;
    const meta = box({ name: "Wireframe_MetaBar", dir: "HORIZONTAL", gap: 10, padX: 20, padY: 8, fill: "#E4E4E7", stroke: "#A1A1AA", alignMain: "SPACE_BETWEEN", alignCross: "CENTER" });
    addFill(s, meta);
    meta.appendChild(txt(`${name}  •  ${route}  •  1440×810 (16:9) • +2pt • No Footer`, 14, "Bold", "#18181B"));
    const tags = box({ name: "Tags", dir: "HORIZONTAL", gap: 6 });
    for (const id of stories) tags.appendChild(pill(id, "#DBEAFE", "#1D4ED8"));
    meta.appendChild(tags);
    return s;
  }

  // WF-01: Auth Gate
  {
    const s = makeWf16x9("WF-01_Login_And_Register_Gate", "/login & /register", ["US-01", "US-02"], 100, 0);
    buildWfNav(s, "", false);
    const body = box({ name: "Body", dir: "HORIZONTAL", gap: 28, padX: 100, padY: 28 });
    addFill(s, body);
    const login = box({ name: "LoginCard", dir: "VERTICAL", gap: 14, padX: 24, padY: 24, fill: "#FAFAFA", stroke: "#A1A1AA", radius: 12, width: 460 });
    body.appendChild(login);
    login.appendChild(txt("เข้าสู่ระบบ UNINFO (ขั้นตอนแรก)", 20, "Bold", "#18181B"));
    addFill(login, wfInput("รหัสผู้ใช้ / Username", "650001 หรือ 6901010001"));
    addFill(login, wfInput("รหัสผ่าน", "••••••••"));
    addFill(login, wfBtn("เข้าสู่ระบบ → Career Reviews", true));

    const reg = box({ name: "RegisterCard", dir: "VERTICAL", gap: 12, padX: 24, padY: 24, fill: "#FAFAFA", stroke: "#A1A1AA", radius: 12 });
    addFill(body, reg);
    reg.appendChild(txt("สมัครสมาชิก (เลือกมหาลัย + แนบหลักฐาน รอ Admin Approve)", 20, "Bold", "#18181B"));
    addFill(reg, wfInput("มหาวิทยาลัย → คณะ → สาขา", "เลือกมหาวิทยาลัย / คณะ / สาขา ▼"));
    addFill(reg, wfInput("ชื่อ-นามสกุล & รหัสผ่าน", "กรอกข้อมูลส่วนตัว..."));
    addFill(reg, wfInput("หลักฐานยืนยันตัวตน", "[Upload บัตรนักศึกษา / บัตรอาจารย์]"));
    addFill(reg, wfBtn("ส่งคำขอ (Pending รอ Admin Approve)", false));
  }

  // WF-02: Career Reviews
  {
    const s = makeWf16x9("WF-02_Career_Reviews", "/career-reviews", ["US-03"], 100 + 1520, 0);
    buildWfNav(s, "Career Reviews", true);
    const body = box({ name: "Body", dir: "VERTICAL", gap: 16, padX: 48, padY: 22 });
    addFill(s, body);
    const scope = box({ name: "ScopeBanner", dir: "HORIZONTAL", padX: 16, padY: 10, fill: "#F4F4F5", stroke: "#A1A1AA", dashed: true, radius: 8, alignMain: "SPACE_BETWEEN", alignCross: "CENTER" });
    addFill(body, scope);
    scope.appendChild(txt("🎓 Career Reviews ของมหาวิทยาลัย: [ มหาวิทยาลัยของฉัน ]", 15, "Semi Bold", "#18181B"));
    scope.appendChild(wfBtn("+ เพิ่มข้อมูลที่ฝึกงาน", false));
    const filterIcons = box({ name: "CategoryIconFilters", dir: "HORIZONTAL", gap: 8 });
    for (const cat of ["⊞ ทั้งหมด", "</> เขียนโปรแกรม", "🎨 ทำกราฟิก", "🕸 ระบบเครือข่าย", "🌐 ทำเว็บไซต์", "🎧 ด้านบริการ"]) {
      filterIcons.appendChild(pill(cat, cat.includes("ทั้งหมด") ? "#18181B" : "#F4F4F5", cat.includes("ทั้งหมด") ? "#FFFFFF" : "#18181B", "#D4D4D8"));
    }
    body.appendChild(filterIcons);
    const grid = box({ name: "Cards", dir: "HORIZONTAL", gap: 16 });
    addFill(body, grid);
    for (let i = 1; i <= 3; i++) {
      const c = box({ name: `Card_0${i}`, dir: "VERTICAL", gap: 10, padX: 18, padY: 18, fill: "#FAFAFA", stroke: "#A1A1AA", radius: 10 });
      addFill(grid, c);
      c.appendChild(txt(`[ประเภทงาน] [Work Mode] [จังหวัด]`, 13, "Medium", "#71717A"));
      c.appendChild(txt(`บริษัทจากรุ่นพี่ในสถาบัน #${i}`, 17, "Bold", "#18181B"));
      c.appendChild(txt("★ 4.8 • N รีวิว • [ดูรายละเอียด →]", 14, "Medium", "#18181B"));
    }
  }

  // WF-03: Internships
  {
    const s = makeWf16x9("WF-03_Internships_University_Data", "/internships", ["US-04"], 100 + 1520 * 2, 0);
    buildWfNav(s, "Internships", true);
    const body = box({ name: "Body", dir: "VERTICAL", gap: 16, padX: 48, padY: 22 });
    addFill(s, body);
    const hero = box({ name: "Hero", dir: "HORIZONTAL", padX: 20, padY: 16, fill: "#FAFAFA", stroke: "#A1A1AA", radius: 10, alignMain: "SPACE_BETWEEN", alignCross: "CENTER" });
    addFill(body, hero);
    hero.appendChild(txt("Internships — แสดงเฉพาะที่นักศึกษามหาลัยเคยไปฝึก & เพิ่ม data เข้าระบบ", 18, "Bold", "#18181B"));
    hero.appendChild(wfBtn("+ เพิ่มสถานที่ฝึกงานใหม่", true));
    const grid = box({ name: "Grid", dir: "HORIZONTAL", gap: 16 });
    addFill(body, grid);
    for (let i = 1; i <= 2; i++) {
      const c = box({ name: `Intern_${i}`, dir: "VERTICAL", gap: 8, padX: 20, padY: 18, fill: "#FAFAFA", stroke: "#A1A1AA", radius: 10 });
      addFill(grid, c);
      c.appendChild(txt(`บริษัทฝึกงานที่รุ่นพี่เคยไป #${i}`, 18, "Bold", "#18181B"));
      c.appendChild(txt("ตำแหน่งที่เคยฝึก: [Full-Stack] • นักศึกษาสถาบันนี้เคยฝึก N ครั้ง", 14, "Medium", "#52525B"));
    }
  }

  // WF-04: Class Review
  {
    const s = makeWf16x9("WF-04_Class_Review", "/courses", ["US-05"], 100 + 1520 * 3, 0);
    buildWfNav(s, "Class Review", true);
    const body = box({ name: "Body", dir: "VERTICAL", gap: 16, padX: 48, padY: 22 });
    addFill(s, body);
    body.appendChild(txt("Class Review — มหาวิทยาลัยตนเอง (เขียนรีวิวได้เฉพาะสาขาตนและวิชาที่ผ่านแล้ว)", 19, "Bold", "#18181B"));
    const cols = box({ name: "Cols", dir: "HORIZONTAL", gap: 18 });
    addFill(body, cols);
    const left = box({ name: "Left", dir: "VERTICAL", gap: 10, padX: 18, padY: 18, fill: "#FAFAFA", stroke: "#A1A1AA", radius: 10 });
    addFill(cols, left);
    left.appendChild(txt("240-211 โครงสร้างข้อมูลและอัลกอริทึม  [✓ ผ่านแล้ว เกรด B+]", 17, "Bold", "#18181B"));
    left.appendChild(txt("เนื้อหา 5.0/5  |  ภาระงาน 4.0/5  |  ความยากเกรด 3.5/5", 15, "Medium", "#52525B"));
    const right = box({ name: "Right_Guard", dir: "VERTICAL", gap: 10, padX: 18, padY: 18, fill: "#FAFAFA", stroke: "#A1A1AA", radius: 10, width: 470 });
    cols.appendChild(right);
    right.appendChild(txt("1. ต่างสาขา → ล็อกฟอร์ม  |  2. ยังไม่ผ่าน → กรอกเกรด (A–D, S) ก่อนรีวิว", 14, "Semi Bold", "#18181B"));
    addFill(right, wfBtn("ส่งรีวิวรายวิชา", true));
  }

  // WF-05: My Career
  {
    const s = makeWf16x9("WF-05_My_Career_Hub", "/my-career", ["US-06", "US-07"], 100, 900);
    buildWfNav(s, "My Career", true);
    const body = box({ name: "Body", dir: "VERTICAL", gap: 16, padX: 48, padY: 22 });
    addFill(s, body);
    body.appendChild(txt("My Career — ศูนย์รวมฟังก์ชันที่ไม่ใช่ Universal ตามบทบาท (Student / Teacher / Admin)", 19, "Bold", "#18181B"));
    const row = box({ name: "Cards", dir: "HORIZONTAL", gap: 16 });
    addFill(body, row);
    for (const t of ["รอบฝึกงาน & Logbook", "สถานประกอบการของฉัน & รีวิว", "Teacher Reports / Admin Console"]) {
      const c = box({ name: t, dir: "VERTICAL", gap: 8, padX: 18, padY: 18, fill: "#FAFAFA", stroke: "#A1A1AA", radius: 10 });
      addFill(row, c);
      c.appendChild(txt(t, 16, "Bold", "#18181B"));
      c.appendChild(txt("คลิกเพื่อเปิดหน้าจัดการเฉพาะบทบาท →", 14, "Regular", "#52525B"));
    }
  }

  // WF-06: Workplace Detail
  {
    const s = makeWf16x9("WF-06_Workplace_Detail", "/workplaces/[id]", ["US-03", "US-04"], 100 + 1520, 900);
    buildWfNav(s, "Career Reviews", true);
    const body = box({ name: "Body", dir: "VERTICAL", gap: 16, padX: 48, padY: 22 });
    addFill(s, body);
    body.appendChild(txt("← กลับหน้า Career Reviews  |  รายละเอียดบริษัท ซอฟต์แวร์โซลูชั่น จำกัด", 19, "Bold", "#18181B"));
    addFill(body, wfBtn("✓ เลือกเป็นสถานประกอบการฝึกงานของฉัน", true));
  }

  // WF-07: Admin Sidebar
  {
    const s = makeWf16x9("WF-07_Admin_Approvals_Sidebar", "/admin/approvals", ["US-08", "US-09"], 100 + 1520 * 2, 900);
    const split = box({ name: "AdminSplitLayout", dir: "HORIZONTAL", gap: 0 });
    addFill(s, split);
    split.layoutSizingVertical = "FILL";
    const sb = box({ name: "UNINFO_Admin_Sidebar", dir: "VERTICAL", gap: 10, padX: 18, padY: 24, fill: "#FAFAFA", stroke: "#D4D4D8", width: 270 });
    split.appendChild(sb);
    sb.layoutSizingVertical = "FILL";
    sb.appendChild(txt("UNINFO Admin", 18, "Bold", "#18181B"));
    for (const m of ["[●] อนุมัติบัญชีผู้ใช้", "[ ] สถานประกอบการ", "[ ] ผู้ใช้งาน", "[ ] ความคิดเห็น", "← กลับ My Career"]) {
      const it = box({ name: m, dir: "HORIZONTAL", padX: 12, padY: 10, fill: m.startsWith("[●]") ? "#E4E4E7" : "#FFFFFF", stroke: "#D4D4D8", radius: 8 });
      addFill(sb, it);
      it.appendChild(txt(m, 14, "Medium", "#18181B"));
    }
    const main = box({ name: "Main", dir: "VERTICAL", gap: 16, padX: 32, padY: 28 });
    addFill(split, main);
    main.appendChild(txt("อนุมัติคำขอสมัครสมาชิก (ตรวจหลักฐานก่อนเข้าใช้งาน)", 20, "Bold", "#18181B"));
  }

  // =========================================================================
  // PAGE 3: 03 — UNINFO Hi-Fi UI (1280x720 16:9 Light & Dark)
  // =========================================================================
  const uiPage = findOrCreatePage("03 — UNINFO Hi-Fi UI (16:9)");
  await figma.setCurrentPageAsync(uiPage);
  for (const ch of [...uiPage.children]) ch.remove();

  function buildUiNav(parent, T, active, loggedIn = true) {
    const h = box({ name: "UNINFO_Navbar", dir: "HORIZONTAL", gap: 20, padX: 28, padY: 16, fill: T.surface, stroke: T.line, alignMain: "SPACE_BETWEEN", alignCross: "CENTER" });
    addFill(parent, h);
    const left = box({ name: "Left", dir: "HORIZONTAL", gap: 24, alignCross: "CENTER" });
    const logo = box({ name: "UNINFO_Logo", dir: "HORIZONTAL", padX: 16, padY: 9, fill: T.brand, radius: 10 });
    logo.appendChild(txt("UNINFO", 17, "Bold", T.brandText));
    left.appendChild(logo);
    if (loggedIn) {
      const links = box({ name: "NavLinks", dir: "HORIZONTAL", gap: 8 });
      for (const tab of ["Career Reviews", "Internships", "Class Review", "My Career"]) {
        const act = tab === active;
        const it = box({ name: `Nav_${tab}`, dir: "HORIZONTAL", padX: 16, padY: 9, fill: act ? T.brand : null, radius: 10 });
        it.appendChild(txt(tab, 16, act ? "Semi Bold" : "Medium", act ? T.brandText : T.inkSecondary));
        links.appendChild(it);
      }
      left.appendChild(links);
    }
    h.appendChild(left);
    const right = box({ name: "Right", dir: "HORIZONTAL", gap: 10, alignCross: "CENTER" });
    right.appendChild(pill(T.name, T.surfaceMuted, T.inkSecondary, T.line));
    const btn = box({ name: "AuthBtn", dir: "HORIZONTAL", padX: 16, padY: 9, fill: loggedIn ? T.surface : T.brand, stroke: loggedIn ? T.lineStrong : null, radius: 10 });
    btn.appendChild(txt(loggedIn ? "ออกจากระบบ" : "เข้าสู่ระบบ", 15, "Semi Bold", loggedIn ? T.inkPrimary : T.brandText));
    right.appendChild(btn);
    h.appendChild(right);
  }

  const uiSpecs = [
    ["01_Login_Gate", "", false, "เข้าสู่ระบบ UNINFO", "Auth-First: เข้าสู่ระบบหรือสมัครสมาชิก (เลือกมหาลัย + แนบหลักฐาน รอ Admin Approve)"],
    ["02_Career_Reviews", "Career Reviews", true, "Career Reviews — มหาวิทยาลัยของฉัน", "รีวิวสายอาชีพและบริษัทจากนักศึกษามหาวิทยาลัยของตนเอง (No About / No Footer)"],
    ["03_Internships", "Internships", true, "Internships — แหล่งฝึกงานเฉพาะสถาบัน", "แสดงเฉพาะสถานที่ที่มีนักศึกษามหาวิทยาลัยนั้นเคยฝึกงานและเพิ่ม data เข้าระบบแล้ว"],
    ["04_Class_Review", "Class Review", true, "Class Review — รีวิวรายวิชา", "แสดงรายวิชาของมหาลัยตน — รีวิวได้เฉพาะสาขาตนที่เป็นวิชาผ่านแล้ว (A–D, S)"],
    ["05_My_Career_Hub", "My Career", true, "My Career — พื้นที่ทำงานเฉพาะบทบาท", "รวมรอบฝึกงาน, Daily Logbook, สถานประกอบการของฉัน, Teacher, Admin และโปรไฟล์"],
  ];

  [LIGHT, DARK].forEach((T, rIdx) => {
    uiSpecs.forEach(([name, active, authed, title, sub], cIdx) => {
      const s = box({ name: `${name}_${T.name}`, dir: "VERTICAL", gap: 0, fill: T.bg, stroke: T.lineStrong, radius: 16, width: 1280, height: 720 });
      s.clipsContent = true;
      s.x = 100 + cIdx * 1360;
      s.y = rIdx * 820;
      buildUiNav(s, T, active, authed);
      const body = box({ name: "Main", dir: "VERTICAL", gap: 14, padX: 36, padY: 28 });
      addFill(s, body);
      addFill(body, txt(title, 23, "Bold", T.inkPrimary, true));
      addFill(body, txt(sub, 16, "Regular", T.inkSecondary, true));
    });
  });

  figma.notify(`UNINFO 3-Page Design & Wireframes Generated (${SANS_FONT}, 16:9, +2pt)!`);
  figma.closePlugin();
})();
