import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { PrismaClient } from "@prisma/client";
import {
  generateNextUserCode,
  THAI_PROVINCES,
} from "../src/lib/constants";

const prisma = new PrismaClient();
const BASE_URL = process.env.QA_BASE_URL || "http://localhost:3000";

interface TestRecord {
  category: "Functional" | "API" | "Performance";
  name: string;
  passed: boolean;
  detail: string;
}

const results: TestRecord[] = [];

async function runCase(
  category: TestRecord["category"],
  name: string,
  fn: () => Promise<string | void> | string | void
) {
  try {
    const detail = (await fn()) || "OK";
    results.push({ category, name, passed: true, detail });
    console.log(`  [PASS] (${category}) ${name} — ${detail}`);
  } catch (err: any) {
    results.push({
      category,
      name,
      passed: false,
      detail: err?.message || String(err),
    });
    console.error(`  [FAIL] (${category}) ${name} — ${err?.message || err}`);
  }
}

async function main() {
  console.log("=== EST Platform QA Test Suite ===\n");

  // 1. FUNCTIONAL TESTS
  await runCase(
    "Functional",
    "10-digit User ID generator (initial & running increment)",
    () => {
      const id1 = generateNextUserCode("2569", "01", "01", []);
      assert.equal(id1, "6901010001");
      assert.equal(id1.length, 10);

      const id2 = generateNextUserCode("2569", "01", "01", [
        "6901010001",
        "6901010002",
        "6902010099",
      ]);
      assert.equal(id2, "6901010003");

      const idOtherFac = generateNextUserCode("2568", "03", "02", [
        "6901010001",
      ]);
      assert.equal(idOtherFac, "6803020001");
      return `${id1} -> ${id2}, ${idOtherFac}`;
    }
  );

  await runCase(
    "Functional",
    "Thai Provinces list has exact 77 unique provinces",
    () => {
      const unique = new Set(THAI_PROVINCES);
      assert.equal(THAI_PROVINCES.length, 77);
      assert.equal(unique.size, 77);
      assert.ok(unique.has("กรุงเทพมหานคร"));
      assert.ok(unique.has("สงขลา"));
      return "77/77 unique";
    }
  );

  await runCase(
    "Functional",
    "DB normalization & workplace workMode/province integrity",
    async () => {
      const [unis, facs, courses, reviews, workplaces, user10] =
        await Promise.all([
          prisma.university.count(),
          prisma.faculty.count(),
          prisma.course.count(),
          prisma.courseReview.count(),
          prisma.workplace.findMany(),
          prisma.user.findUnique({ where: { userId: "6901010001" } }),
        ]);

      assert.ok(unis >= 3, "Expected >= 3 universities");
      assert.ok(facs >= 4, "Expected >= 4 faculties");
      assert.ok(courses >= 5, "Expected >= 5 courses");
      assert.ok(reviews >= 4, "Expected >= 4 course reviews");
      assert.ok(user10, "Expected seeded 10-digit user 6901010001");

      for (const wp of workplaces) {
        if (wp.workMode === "remote") {
          assert.equal(
            wp.province,
            null,
            `Remote workplace #${wp.workplaceId} must have null province`
          );
        } else {
          assert.ok(
            wp.province && THAI_PROVINCES.includes(wp.province),
            `Onsite/Hybrid workplace #${wp.workplaceId} must have valid province`
          );
        }
      }
      return `${unis} unis, ${facs} facs, ${courses} courses, ${reviews} reviews, ${workplaces.length} workplaces verified`;
    }
  );

  // 2. API TESTS
  await runCase("API", "GET /api/universities returns nested hierarchy", async () => {
    const res = await fetch(`${BASE_URL}/api/universities`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.ok(json.count >= 3);
    assert.ok(Array.isArray(json.data[0].faculties));
    assert.ok(Array.isArray(json.data[0].faculties[0].majors));
    return `200 OK (${json.count} universities)`;
  });

  await runCase("API", "GET /api/courses returns 3-metric ratings", async () => {
    const res = await fetch(`${BASE_URL}/api/courses`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    const reviewed = json.data.find((c: any) => c.reviewCount > 0);
    assert.ok(reviewed, "Expected at least one reviewed course");
    assert.ok(typeof reviewed.ratings.content === "number");
    assert.ok(typeof reviewed.ratings.workload === "number");
    assert.ok(typeof reviewed.ratings.gradeDifficulty === "number");
    return `200 OK (${json.count} courses, sample content=${reviewed.ratings.content})`;
  });

  await runCase("API", "GET /api/courses?yearLevel=2 & invalid 400 check", async () => {
    const res = await fetch(`${BASE_URL}/api/courses?yearLevel=2`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.every((c: any) => c.yearLevel === 2));

    const bad = await fetch(`${BASE_URL}/api/courses?yearLevel=99`);
    assert.equal(bad.status, 400);
    return `yearLevel=2 -> ${json.count} items; yearLevel=99 -> 400`;
  });

  await runCase("API", "GET /api/workplaces workMode & province filter + 400 check", async () => {
    const remoteRes = await fetch(`${BASE_URL}/api/workplaces?workMode=remote`);
    assert.equal(remoteRes.status, 200);
    const remoteJson = await remoteRes.json();
    assert.ok(remoteJson.count >= 1);
    assert.ok(
      remoteJson.data.every(
        (w: any) => w.workMode === "remote" && w.province === null
      )
    );

    const hybridRes = await fetch(
      `${BASE_URL}/api/workplaces?workMode=hybrid&province=${encodeURIComponent("สงขลา")}`
    );
    assert.equal(hybridRes.status, 200);
    const hybridJson = await hybridRes.json();
    assert.ok(
      hybridJson.data.every(
        (w: any) => w.workMode === "hybrid" && w.province === "สงขลา"
      )
    );

    const badRes = await fetch(`${BASE_URL}/api/workplaces?workMode=invalid`);
    assert.equal(badRes.status, 400);
    return `remote=${remoteJson.count}, hybrid(สงขลา)=${hybridJson.count}, invalid=400`;
  });

  // 3. PERFORMANCE TESTS (warm requests)
  const perfTargets = [
    { path: "/", maxMs: 800 },
    { path: "/courses", maxMs: 800 },
    { path: "/register", maxMs: 800 },
    { path: "/api/universities", maxMs: 500 },
    { path: "/api/courses", maxMs: 500 },
    { path: "/api/workplaces", maxMs: 500 },
  ];

  for (const target of perfTargets) {
    // Warm up once
    await fetch(`${BASE_URL}${target.path}`);
    await runCase("Performance", `Warm GET ${target.path} < ${target.maxMs}ms`, async () => {
      const t0 = performance.now();
      const res = await fetch(`${BASE_URL}${target.path}`);
      await res.text();
      const elapsed = Math.round(performance.now() - t0);
      assert.equal(res.status, 200);
      assert.ok(
        elapsed < target.maxMs,
        `Took ${elapsed}ms (limit ${target.maxMs}ms)`
      );
      return `${elapsed}ms (HTTP ${res.status})`;
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log(`\n=== QA Summary: ${passedCount}/${results.length} passed ===`);
  await prisma.$disconnect();
  if (passedCount !== results.length) {
    process.exit(1);
  }
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
