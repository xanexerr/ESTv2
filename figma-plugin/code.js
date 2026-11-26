/**
 * ESTv2 — HTC Internship Portal Figma Design System, Wireframe & Hi-Fi UI Generator
 *
 * Run this script inside Figma (Plugins -> Development -> Open Console, or import manifest.json)
 * to automatically create:
 *  - Local Color Variables (SeniorStepPass Theme Palette)
 *  - 5 Lo-Fi Wireframe Screens (1280px Auto-Layout frames)
 *  - 5 Hi-Fi UI Mockup Screens (1280px Auto-Layout frames)
 */

(async () => {
  // 1. Load required fonts
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // Helper: RGB from Hex
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

  // Theme Palette
  const COLORS = {
    primary: "#136F73",
    primaryDark: "#0D5255",
    primaryLight: "#E6F3F3",
    amber: "#FFB72B",
    cream: "#F7F8E0",
    bg: "#F4F7F8",
    white: "#FFFFFF",
    slate900: "#0F172A",
    slate700: "#334155",
    slate500: "#64748B",
    slate300: "#CBD5E1",
    slate200: "#E2E8F0",
    slate100: "#F1F5F9",
    emerald: "#16A34A",
    emeraldLight: "#DCFCE7",
    danger: "#DC2626",
    dangerLight: "#FEE2E2",
  };

  // Helper: Create Auto-Layout Frame
  function createBox({
    name = "Frame",
    dir = "VERTICAL",
    gap = 12,
    padX = 0,
    padY = 0,
    fill = null,
    stroke = null,
    dash = null,
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
      f.strokeWeight = 1.5;
      if (dash) f.dashPattern = dash;
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

  // Helper: Create Text Node
  function createText(content, size = 14, weight = "Regular", color = "#0F172A") {
    const t = figma.createText();
    t.fontName = { family: "Inter", style: weight };
    t.characters = String(content);
    t.fontSize = size;
    t.fills = solid(color);
    return t;
  }

  // Helper: Append child and set horizontal fill
  function appendFill(parent, child) {
    parent.appendChild(child);
    child.layoutSizingHorizontal = "FILL";
    return child;
  }

  // Shared Topbar & Navbar Builder
  function buildHeaderNav(parent, isWireframe, activeTab = "หน้าแรก") {
    const topbar = createBox({
      name: "Topbar",
      dir: "HORIZONTAL",
      gap: 16,
      padX: 32,
      padY: 14,
      fill: isWireframe ? COLORS.slate100 : COLORS.primaryDark,
      stroke: isWireframe ? COLORS.slate500 : null,
      dash: isWireframe ? [6, 4] : null,
      alignMain: "SPACE_BETWEEN",
      alignCross: "CENTER",
    });
    appendFill(parent, topbar);

    const brand = createBox({ name: "Brand", dir: "HORIZONTAL", gap: 12, alignCross: "CENTER" });
    const logo = createBox({
      name: "Logo",
      dir: "HORIZONTAL",
      padX: 10,
      padY: 8,
      fill: COLORS.white,
      stroke: isWireframe ? COLORS.slate500 : null,
      radius: 8,
    });
    logo.appendChild(createText("HTC", 13, "Bold", isWireframe ? COLORS.slate700 : COLORS.primary));
    brand.appendChild(logo);

    const brandText = createBox({ name: "BrandText", dir: "VERTICAL", gap: 2 });
    brandText.appendChild(
      createText(
        "ระบบรวบรวมสถานประกอบการฝึกงาน",
        16,
        "Bold",
        isWireframe ? COLORS.slate900 : COLORS.white
      )
    );
    brandText.appendChild(
      createText(
        "แผนกเทคโนโลยีสารสนเทศ วิทยาลัยเทคนิคหาดใหญ่ (HTC Internship Portal)",
        11,
        "Regular",
        isWireframe ? COLORS.slate500 : COLORS.primaryLight
      )
    );
    brand.appendChild(brandText);
    topbar.appendChild(brand);

    const userPill = createBox({
      name: "UserPill",
      dir: "HORIZONTAL",
      gap: 8,
      padX: 14,
      padY: 6,
      fill: isWireframe ? COLORS.white : COLORS.primary,
      stroke: isWireframe ? COLORS.slate500 : COLORS.amber,
      radius: 999,
      alignCross: "CENTER",
    });
    userPill.appendChild(
      createText(
        isWireframe ? "[User: สมชาย ใจดี | นักเรียน]" : "สมชาย ใจดี  •  นักเรียน / นักศึกษา",
        12,
        "Semi Bold",
        isWireframe ? COLORS.slate700 : COLORS.white
      )
    );
    topbar.appendChild(userPill);

    // Sticky Navbar
    const navbar = createBox({
      name: "Navbar",
      dir: "HORIZONTAL",
      gap: 12,
      padX: 32,
      padY: 10,
      fill: COLORS.white,
      stroke: COLORS.slate200,
      alignMain: "SPACE_BETWEEN",
      alignCross: "CENTER",
    });
    appendFill(parent, navbar);

    const navLinks = createBox({ name: "NavLinks", dir: "HORIZONTAL", gap: 8 });
    ["หน้าแรก", "สถานประกอบการของคุณ", "จัดการระบบ (Admin/ครู)", "ติดต่อแอดมิน"].forEach((tab) => {
      const isAct = tab === activeTab;
      const item = createBox({
        name: `Nav_${tab}`,
        dir: "HORIZONTAL",
        padX: 14,
        padY: 8,
        fill: isAct ? (isWireframe ? COLORS.slate200 : COLORS.primaryLight) : null,
        stroke: isWireframe && isAct ? COLORS.slate500 : null,
        radius: 8,
      });
      item.appendChild(
        createText(
          tab,
          13,
          isAct ? "Bold" : "Medium",
          isAct ? (isWireframe ? COLORS.slate900 : COLORS.primary) : COLORS.slate500
        )
      );
      navLinks.appendChild(item);
    });
    navbar.appendChild(navLinks);

    const navRight = createBox({ name: "NavRight", dir: "HORIZONTAL", gap: 10, alignCross: "CENTER" });
    navRight.appendChild(createText("ข้อมูลส่วนตัว", 13, "Medium", COLORS.slate500));
    const logoutBtn = createBox({
      name: "LogoutBtn",
      dir: "HORIZONTAL",
      padX: 14,
      padY: 6,
      fill: isWireframe ? COLORS.white : COLORS.dangerLight,
      stroke: isWireframe ? COLORS.slate500 : COLORS.danger,
      radius: 999,
    });
    logoutBtn.appendChild(
      createText("ออกจากระบบ", 12, "Semi Bold", isWireframe ? COLORS.slate700 : COLORS.danger)
    );
    navRight.appendChild(logoutBtn);
    navbar.appendChild(navRight);
  }

  // =========================================================================
  // SCREEN 1: HOME DISCOVERY (/)
  // =========================================================================
  function buildHomeScreen(isWireframe, xPos, yPos) {
    const screen = createBox({
      name: isWireframe ? "WF_01_Home_Discovery" : "UI_01_Home_Discovery",
      dir: "VERTICAL",
      gap: 0,
      fill: isWireframe ? COLORS.white : COLORS.bg,
      stroke: COLORS.slate300,
      radius: 16,
      width: 1280,
    });
    screen.x = xPos;
    screen.y = yPos;

    buildHeaderNav(screen, isWireframe, "หน้าแรก");

    const body = createBox({
      name: "MainContainer",
      dir: "VERTICAL",
      gap: 24,
      padX: 48,
      padY: 32,
    });
    appendFill(screen, body);

    // Hero Banner
    const hero = createBox({
      name: "HeroDiscovery",
      dir: "VERTICAL",
      gap: 16,
      padX: 32,
      padY: 28,
      fill: isWireframe ? COLORS.slate100 : COLORS.primary,
      stroke: isWireframe ? COLORS.slate500 : null,
      dash: isWireframe ? [6, 4] : null,
      radius: 16,
    });
    appendFill(body, hero);

    hero.appendChild(
      createText(
        "✨ HTC Internship Discovery",
        12,
        "Bold",
        isWireframe ? COLORS.slate700 : COLORS.amber
      )
    );
    hero.appendChild(
      createText(
        "ค้นหาสถานประกอบการฝึกประสบการณ์วิชาชีพ",
        26,
        "Bold",
        isWireframe ? COLORS.slate900 : COLORS.white
      )
    );
    hero.appendChild(
      createText(
        "รวบรวมข้อมูลสถานที่ฝึกงาน รีวิวจากรุ่นพี่ และคะแนนประเมินสำหรับนักศึกษาแผนกเทคโนโลยีสารสนเทศ (พบทั้งหมด 5 แห่ง)",
        13,
        "Regular",
        isWireframe ? COLORS.slate500 : COLORS.primaryLight
      )
    );

    // Search Bar inside Hero
    const searchBar = createBox({
      name: "SearchBar",
      dir: "HORIZONTAL",
      gap: 12,
      padX: 16,
      padY: 12,
      fill: COLORS.white,
      stroke: isWireframe ? COLORS.slate500 : null,
      radius: 12,
      alignCross: "CENTER",
    });
    appendFill(hero, searchBar);

    const searchInput = createBox({
      name: "SearchInput",
      dir: "HORIZONTAL",
      padX: 12,
      padY: 10,
      fill: COLORS.slate100,
      radius: 8,
    });
    searchInput.appendChild(
      createText("🔍 ค้นหาชื่อสถานประกอบการ, ลักษณะงาน, หรือพื้นที่...", 13, "Regular", COLORS.slate500)
    );
    appendFill(searchBar, searchInput);

    ["ประเภทงาน : ทั้งหมด ▼", "เรียงจากที่เพิ่มล่าสุด ▼"].forEach((label) => {
      const sel = createBox({
        name: "Select",
        dir: "HORIZONTAL",
        padX: 14,
        padY: 10,
        fill: COLORS.slate100,
        stroke: COLORS.slate200,
        radius: 8,
      });
      sel.appendChild(createText(label, 13, "Medium", COLORS.slate700));
      searchBar.appendChild(sel);
    });

    const searchBtn = createBox({
      name: "SearchButton",
      dir: "HORIZONTAL",
      padX: 24,
      padY: 10,
      fill: isWireframe ? COLORS.slate700 : COLORS.primaryDark,
      radius: 8,
    });
    searchBtn.appendChild(createText("ค้นหา", 13, "Bold", COLORS.white));
    searchBar.appendChild(searchBtn);

    // Category Pills
    const pillRow = createBox({ name: "CategoryPills", dir: "HORIZONTAL", gap: 8 });
    ["ทั้งหมด", "เขียนโปรแกรม", "ทำกราฟิก", "ระบบเครือข่าย", "ทำเว็บไซต์", "ด้านบริการ"].forEach(
      (cat, idx) => {
        const pill = createBox({
          name: `Pill_${cat}`,
          dir: "HORIZONTAL",
          padX: 14,
          padY: 6,
          fill:
            idx === 0
              ? isWireframe
                ? COLORS.slate700
                : COLORS.amber
              : isWireframe
              ? COLORS.white
              : COLORS.primaryDark,
          stroke: isWireframe ? COLORS.slate500 : null,
          radius: 999,
        });
        pill.appendChild(
          createText(
            cat,
            12,
            "Semi Bold",
            idx === 0
              ? isWireframe
                ? COLORS.white
                : COLORS.slate900
              : isWireframe
              ? COLORS.slate700
              : COLORS.white
          )
        );
        pillRow.appendChild(pill);
      }
    );
    hero.appendChild(pillRow);

    // Top 3 Highlights Row
    const topRow = createBox({ name: "Top3HighlightsRow", dir: "HORIZONTAL", gap: 20 });
    appendFill(body, topRow);

    [
      {
        title: "🏆 แนะนำสูงสุด (Most Recommended) • Top 3 คะแนนรีวิว",
        items: [
          "#1  สตูดิโอ ครีเอทีฟ ดีไซน์ หาดใหญ่  (ทำกราฟิก)  —  ★ 5.0 (1 รีวิว)",
          "#2  บริษัท ซอฟต์แวร์โซลูชั่น จำกัด  (เขียนโปรแกรม)  —  ★ 4.8 (2 รีวิว)",
          "#3  เน็ตเวิร์ค แอนด์ ซิสเต็มส์ เซอร์วิส  (ระบบเครือข่าย)  —  ★ 4.5 (1 รีวิว)",
        ],
      },
      {
        title: "🔥 ยอดนิยม (Most Selected) • Top 3 นักศึกษาเลือก",
        items: [
          "#1  บริษัท ซอฟต์แวร์โซลูชั่น จำกัด  (เขียนโปรแกรม)  —  🎓 2 คนเลือก",
          "#2  สตูดิโอ ครีเอทีฟ ดีไซน์ หาดใหญ่  (ทำกราฟิก)  —  🎓 1 คนเลือก",
          "#3  เน็ตเวิร์ค แอนด์ ซิสเต็มส์ เซอร์วิส  (ระบบเครือข่าย)  —  🎓 1 คนเลือก",
        ],
      },
    ].forEach((boxData) => {
      const topCard = createBox({
        name: "TopHighlightCard",
        dir: "VERTICAL",
        gap: 10,
        padX: 20,
        padY: 16,
        fill: isWireframe ? COLORS.white : COLORS.cream,
        stroke: isWireframe ? COLORS.slate500 : COLORS.amber,
        dash: isWireframe ? [6, 4] : null,
        radius: 14,
      });
      appendFill(topRow, topCard);
      topCard.appendChild(
        createText(boxData.title, 14, "Bold", isWireframe ? COLORS.slate900 : COLORS.primaryDark)
      );
      boxData.items.forEach((line) => {
        const rowItem = createBox({
          name: "RankRow",
          dir: "HORIZONTAL",
          padX: 12,
          padY: 10,
          fill: COLORS.white,
          stroke: COLORS.slate200,
          radius: 10,
          alignMain: "SPACE_BETWEEN",
        });
        appendFill(topCard, rowItem);
        rowItem.appendChild(createText(line, 13, "Medium", COLORS.slate900));
        rowItem.appendChild(
          createText("ดูข้อมูล >", 12, "Semi Bold", isWireframe ? COLORS.slate500 : COLORS.primary)
        );
      });
    });

    // Workplace Cards Grid
    body.appendChild(createText("🏢 รายชื่อสถานประกอบการ", 18, "Bold", COLORS.slate900));

    const cardsRow = createBox({ name: "WorkplaceCardsRow", dir: "HORIZONTAL", gap: 20 });
    appendFill(body, cardsRow);

    [
      {
        name: "บริษัท ซอฟต์แวร์โซลูชั่น จำกัด",
        type: "เขียนโปรแกรม",
        desc: "พัฒนาเว็บแอปพลิเคชันและระบบหลังบ้านด้วย Next.js, TypeScript และฐานข้อมูล PostgreSQL",
        addr: "📍 123 ถ.กาญจนวนิช ต.คอหงส์ อ.หาดใหญ่ จ.สงขลา 90110",
        meta: "★★★★★ 4.8   •   💬 2 รีวิว   •   🎓 2 คนเลือก",
      },
      {
        name: "สตูดิโอ ครีเอทีฟ ดีไซน์ หาดใหญ่",
        type: "ทำกราฟิก",
        desc: "ออกแบบสื่อสิ่งพิมพ์ โลโก้ แบนเนอร์โฆษณา และกราฟิกสำหรับโซเชียลมีเดียด้วย Illustrator & Photoshop",
        addr: "📍 45/2 ถ.เพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่ จ.สงขลา 90110",
        meta: "★★★★★ 5.0   •   💬 1 รีวิว   •   🎓 1 คนเลือก",
      },
    ].forEach((wp) => {
      const card = createBox({
        name: `Card_${wp.name}`,
        dir: "VERTICAL",
        gap: 12,
        padX: 20,
        padY: 18,
        fill: COLORS.white,
        stroke: isWireframe ? COLORS.slate500 : COLORS.slate200,
        dash: isWireframe ? [6, 4] : null,
        radius: 14,
      });
      appendFill(cardsRow, card);

      const headerRow = createBox({
        name: "CardHeader",
        dir: "HORIZONTAL",
        alignMain: "SPACE_BETWEEN",
        alignCross: "CENTER",
      });
      appendFill(card, headerRow);
      headerRow.appendChild(createText(wp.name, 16, "Bold", COLORS.slate900));

      const badge = createBox({
        name: "TypeBadge",
        dir: "HORIZONTAL",
        padX: 10,
        padY: 4,
        fill: isWireframe ? COLORS.slate100 : COLORS.primaryLight,
        radius: 999,
      });
      badge.appendChild(
        createText(wp.type, 11, "Bold", isWireframe ? COLORS.slate700 : COLORS.primary)
      );
      headerRow.appendChild(badge);

      card.appendChild(createText(wp.desc, 13, "Regular", COLORS.slate700));
      card.appendChild(createText(wp.addr, 12, "Regular", COLORS.slate500));

      const footerRow = createBox({
        name: "CardFooter",
        dir: "HORIZONTAL",
        alignMain: "SPACE_BETWEEN",
        alignCross: "CENTER",
      });
      appendFill(card, footerRow);
      footerRow.appendChild(
        createText(wp.meta, 12, "Semi Bold", isWireframe ? COLORS.slate700 : COLORS.primaryDark)
      );

      const detailBtn = createBox({
        name: "DetailBtn",
        dir: "HORIZONTAL",
        padX: 14,
        padY: 6,
        fill: isWireframe ? COLORS.slate700 : COLORS.primary,
        radius: 999,
      });
      detailBtn.appendChild(createText("รายละเอียด →", 12, "Semi Bold", COLORS.white));
      footerRow.appendChild(detailBtn);
    });

    return screen;
  }

  // =========================================================================
  // SCREEN 2: WORKPLACE DETAIL (/workplaces/[id])
  // =========================================================================
  function buildDetailScreen(isWireframe, xPos, yPos) {
    const screen = createBox({
      name: isWireframe ? "WF_02_Workplace_Detail" : "UI_02_Workplace_Detail",
      dir: "VERTICAL",
      gap: 0,
      fill: isWireframe ? COLORS.white : COLORS.bg,
      stroke: COLORS.slate300,
      radius: 16,
      width: 1280,
    });
    screen.x = xPos;
    screen.y = yPos;

    buildHeaderNav(screen, isWireframe, "หน้าแรก");

    const body = createBox({
      name: "MainContainer",
      dir: "VERTICAL",
      gap: 20,
      padX: 48,
      padY: 32,
    });
    appendFill(screen, body);

    body.appendChild(createText("← กลับหน้ารายชื่อสถานประกอบการ", 13, "Semi Bold", COLORS.primary));

    const cols = createBox({ name: "TwoColumns", dir: "HORIZONTAL", gap: 24 });
    appendFill(body, cols);

    // Left Column (8 cols)
    const leftCol = createBox({
      name: "LeftColumn_CompanyInfo",
      dir: "VERTICAL",
      gap: 16,
      padX: 24,
      padY: 24,
      fill: COLORS.white,
      stroke: isWireframe ? COLORS.slate500 : COLORS.slate200,
      dash: isWireframe ? [6, 4] : null,
      radius: 16,
    });
    appendFill(cols, leftCol);

    leftCol.appendChild(
      createText(
        "ประเภทงาน : เขียนโปรแกรม   •   🎓 นักศึกษาเลือกแล้ว 2 คน",
        12,
        "Bold",
        isWireframe ? COLORS.slate700 : COLORS.primary
      )
    );
    leftCol.appendChild(createText("บริษัท ซอฟต์แวร์โซลูชั่น จำกัด", 24, "Bold", COLORS.slate900));
    leftCol.appendChild(
      createText(
        "ลักษณะงาน: พัฒนาเว็บแอปพลิเคชันและระบบหลังบ้านด้วย Next.js, TypeScript, PHP และฐานข้อมูล PostgreSQL",
        14,
        "Regular",
        COLORS.slate700
      )
    );
    leftCol.appendChild(
      createText(
        "📞 เบอร์โทรติดต่อ: 074-123456     |     📍 ที่อยู่: 123 ถ.กาญจนวนิช ต.คอหงส์ อ.หาดใหญ่ จ.สงขลา 90110",
        13,
        "Medium",
        COLORS.slate700
      )
    );

    const selectCta = createBox({
      name: "SelectWorkplaceCTA",
      dir: "HORIZONTAL",
      padX: 20,
      padY: 14,
      fill: isWireframe ? COLORS.slate700 : COLORS.emerald,
      radius: 12,
      alignMain: "CENTER",
    });
    appendFill(leftCol, selectCta);
    selectCta.appendChild(
      createText(
        "✓ เลือก บริษัท ซอฟต์แวร์โซลูชั่น จำกัด เป็นสถานประกอบการของฉัน",
        14,
        "Bold",
        COLORS.white
      )
    );

    leftCol.appendChild(createText("💬 ความคิดเห็นและรีวิวจากรุ่นพี่ (2)", 16, "Bold", COLORS.slate900));
    [
      "สมชาย ใจดี (★★★★★ 5.0): พี่เลี้ยงดูแลดีมาก สอนงานตั้งแต่พื้นฐานจนขึ้นโปรเจกต์จริงได้",
      "กานดา รักเรียน (★★★★☆ 4.5): บรรยากาศการทำงานเป็นกันเอง มีอุปกรณ์และคอมพิวเตอร์พร้อมให้ฝึกงาน",
    ].forEach((rv) => {
      const rvCard = createBox({
        name: "ReviewItem",
        dir: "VERTICAL",
        padX: 16,
        padY: 12,
        fill: COLORS.slate100,
        stroke: COLORS.slate200,
        radius: 10,
      });
      appendFill(leftCol, rvCard);
      rvCard.appendChild(createText(rv, 13, "Regular", COLORS.slate900));
    });

    // Right Column (4 cols)
    const rightCol = createBox({
      name: "RightColumn_RatingAndGallery",
      dir: "VERTICAL",
      gap: 16,
      width: 360,
    });
    cols.appendChild(rightCol);

    const ratingBox = createBox({
      name: "RatingSummaryCard",
      dir: "VERTICAL",
      gap: 8,
      padX: 24,
      padY: 24,
      fill: COLORS.white,
      stroke: isWireframe ? COLORS.slate500 : COLORS.slate200,
      dash: isWireframe ? [6, 4] : null,
      radius: 16,
      alignCross: "CENTER",
    });
    appendFill(rightCol, ratingBox);
    ratingBox.appendChild(createText("คะแนนรีวิวเฉลี่ย", 12, "Bold", COLORS.slate500));
    ratingBox.appendChild(
      createText("4.8 / 5", 36, "Bold", isWireframe ? COLORS.slate900 : COLORS.primary)
    );
    ratingBox.appendChild(
      createText("★★★★★ (จากทั้งหมด 2 ความคิดเห็น)", 13, "Semi Bold", COLORS.amber)
    );

    return screen;
  }

  // =========================================================================
  // SCREEN 3: ADMIN & STUDENT PORTAL OVERVIEW
  // =========================================================================
  function buildAdminAndStudentScreen(isWireframe, xPos, yPos) {
    const screen = createBox({
      name: isWireframe ? "WF_03_Admin_&_Student_Portal" : "UI_03_Admin_&_Student_Portal",
      dir: "VERTICAL",
      gap: 0,
      fill: isWireframe ? COLORS.white : COLORS.bg,
      stroke: COLORS.slate300,
      radius: 16,
      width: 1280,
    });
    screen.x = xPos;
    screen.y = yPos;

    buildHeaderNav(screen, isWireframe, "จัดการระบบ (Admin/ครู)");

    const body = createBox({
      name: "MainContainer",
      dir: "VERTICAL",
      gap: 20,
      padX: 48,
      padY: 32,
    });
    appendFill(screen, body);

    body.appendChild(
      createText(
        "🏢 ระบบจัดการสถานประกอบการ / ผู้ใช้ / ความคิดเห็น (Admin Dashboard)",
        20,
        "Bold",
        COLORS.slate900
      )
    );

    const statRow = createBox({ name: "StatCardsRow", dir: "HORIZONTAL", gap: 16 });
    appendFill(body, statRow);

    [
      { label: "สถานประกอบการทั้งหมด", val: "5 แห่ง" },
      { label: "กำลังแสดงผลบนเว็บไซต์", val: "5 แห่ง" },
      { label: "บัญชีผู้ใช้งานทั้งหมด", val: "7 บัญชี" },
      { label: "ความคิดเห็นและรีวิว", val: "4 รายการ" },
    ].forEach((st) => {
      const sc = createBox({
        name: `Stat_${st.label}`,
        dir: "VERTICAL",
        gap: 6,
        padX: 20,
        padY: 16,
        fill: COLORS.white,
        stroke: isWireframe ? COLORS.slate500 : COLORS.slate200,
        dash: isWireframe ? [6, 4] : null,
        radius: 12,
      });
      appendFill(statRow, sc);
      sc.appendChild(createText(st.label, 12, "Medium", COLORS.slate500));
      sc.appendChild(
        createText(st.val, 22, "Bold", isWireframe ? COLORS.slate900 : COLORS.primary)
      );
    });

    // Data Table
    const tableCard = createBox({
      name: "AdminDataTable",
      dir: "VERTICAL",
      gap: 10,
      padX: 20,
      padY: 18,
      fill: COLORS.white,
      stroke: isWireframe ? COLORS.slate500 : COLORS.slate200,
      dash: isWireframe ? [6, 4] : null,
      radius: 14,
    });
    appendFill(body, tableCard);

    tableCard.appendChild(
      createText(
        "ตารางจัดการสถานประกอบการ (ค้นหา / กรองประเภทงาน / สลับสถานะแสดงผล)",
        14,
        "Bold",
        COLORS.slate900
      )
    );

    [
      "#1  |  บริษัท ซอฟต์แวร์โซลูชั่น จำกัด  |  เขียนโปรแกรม  |  สถานะ: แสดง  |  [รายละเอียด] [แก้ไขข้อมูล]",
      "#2  |  สตูดิโอ ครีเอทีฟ ดีไซน์ หาดใหญ่  |  ทำกราฟิก  |  สถานะ: แสดง  |  [รายละเอียด] [แก้ไขข้อมูล]",
      "#3  |  เน็ตเวิร์ค แอนด์ ซิสเต็มส์ เซอร์วิส  |  ระบบเครือข่าย  |  สถานะ: แสดง  |  [รายละเอียด] [แก้ไขข้อมูล]",
    ].forEach((rowStr) => {
      const tr = createBox({
        name: "TableRow",
        dir: "HORIZONTAL",
        padX: 14,
        padY: 10,
        fill: COLORS.slate100,
        radius: 8,
      });
      appendFill(tableCard, tr);
      tr.appendChild(createText(rowStr, 13, "Medium", COLORS.slate700));
    });

    return screen;
  }

  // Find clear position on current page
  let startX = 0;
  for (const child of figma.currentPage.children) {
    startX = Math.max(startX, child.x + child.width + 200);
  }

  // Build Row 1: Lo-Fi Wireframes
  const wf1 = buildHomeScreen(true, startX, 0);
  const wf2 = buildDetailScreen(true, startX + 1360, 0);
  const wf3 = buildAdminAndStudentScreen(true, startX + 2720, 0);

  // Build Row 2: Hi-Fi UI Mockups (below Wireframes)
  const ui1 = buildHomeScreen(false, startX, 1100);
  const ui2 = buildDetailScreen(false, startX + 1360, 1100);
  const ui3 = buildAdminAndStudentScreen(false, startX + 2720, 1100);

  figma.viewport.scrollAndZoomIntoView([wf1, wf2, wf3, ui1, ui2, ui3]);
})();
