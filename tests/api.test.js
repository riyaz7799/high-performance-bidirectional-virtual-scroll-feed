/**
 * API Tests — Mock API Server
 * Tests all GET /posts endpoint requirements
 */

const BASE_URL = "http://localhost:8080";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// ─────────────────────────────────────────────
// Test Runner
// ─────────────────────────────────────────────
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS — ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL — ${name}`);
    console.error(`         ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ─────────────────────────────────────────────
// Test Suite: Health Check
// ─────────────────────────────────────────────
async function testHealth() {
  console.log("\n📋 Health Check");

  await test("GET /health returns 200", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test("GET /health returns status: ok", async () => {
    const data = await fetchJSON(`${BASE_URL}/health`);
    assert(data.status === "ok", `Expected status 'ok', got '${data.status}'`);
  });
}

// ─────────────────────────────────────────────
// Test Suite: Requirement 3 — GET /posts
// ─────────────────────────────────────────────
async function testGetPosts() {
  console.log("\n📋 Requirement 3 — GET /posts Endpoint");

  await test("GET /posts returns 200 status", async () => {
    const res = await fetch(`${BASE_URL}/posts?limit=10`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test("Response has 'data' array", async () => {
    const data = await fetchJSON(`${BASE_URL}/posts?limit=10`);
    assert(Array.isArray(data.data), `'data' should be an array`);
  });

  await test("Response has 'nextCursor' field", async () => {
    const data = await fetchJSON(`${BASE_URL}/posts?limit=10`);
    assert("nextCursor" in data, `Response missing 'nextCursor'`);
  });

  await test("Returns correct number of posts (limit=10)", async () => {
    const data = await fetchJSON(`${BASE_URL}/posts?limit=10`);
    assert(data.data.length === 10, `Expected 10 posts, got ${data.data.length}`);
  });

  await test("Returns correct number of posts (limit=20)", async () => {
    const data = await fetchJSON(`${BASE_URL}/posts?limit=20`);
    assert(data.data.length === 20, `Expected 20 posts, got ${data.data.length}`);
  });

  await test("Each post has required 'id' field (number)", async () => {
    const data = await fetchJSON(`${BASE_URL}/posts?limit=5`);
    data.data.forEach((post, i) => {
      assert(typeof post.id === "number", `Post ${i} missing 'id'`);
    });
  });

  await test("Each post has required 'author' field (string)", async () => {
    const data = await fetchJSON(`${BASE_URL}/posts?limit=5`);
    data.data.forEach((post, i) => {
      assert(typeof post.author === "string", `Post ${i} missing 'author'`);
    });
  });

  await test("Each post has required 'content' field (string)", async () => {
    const data = await fetchJSON(`${BASE_URL}/posts?limit=5`);
    data.data.forEach((post, i) => {
      assert(typeof post.content === "string", `Post ${i} missing 'content'`);
    });
  });

  await test("Each post has required 'media' object", async () => {
    const data = await fetchJSON(`${BASE_URL}/posts?limit=5`);
    data.data.forEach((post, i) => {
      assert(typeof post.media === "object", `Post ${i} missing 'media'`);
      assert("type" in post.media, `Post ${i} media missing 'type'`);
      assert(Array.isArray(post.media.urls), `Post ${i} media missing 'urls' array`);
    });
  });

  await test("Media type is valid enum value", async () => {
    const data = await fetchJSON(`${BASE_URL}/posts?limit=20`);
    const validTypes = ["image", "video", "link", "none"];
    data.data.forEach((post, i) => {
      assert(validTypes.includes(post.media.type), `Post ${i} has invalid media type: ${post.media.type}`);
    });
  });
}

// ─────────────────────────────────────────────
// Test Suite: Cursor Pagination
// ─────────────────────────────────────────────
async function testCursorPagination() {
  console.log("\n📋 Cursor Pagination");

  await test("Positive cursor fetches next batch (forward)", async () => {
    const first = await fetchJSON(`${BASE_URL}/posts?limit=10`);
    const nextCursor = first.nextCursor;
    assert(nextCursor !== null, "nextCursor should not be null");

    const second = await fetchJSON(`${BASE_URL}/posts?limit=10&cursor=${nextCursor}`);
    assert(second.data.length > 0, "Second page should have posts");

    const firstIds = new Set(first.data.map(p => p.id));
    const overlap = second.data.filter(p => firstIds.has(p.id));
    assert(overlap.length === 0, `Pages should not overlap, found ${overlap.length} duplicate(s)`);
  });

  await test("Negative cursor fetches previous batch (backward)", async () => {
    const first = await fetchJSON(`${BASE_URL}/posts?limit=10`);
    const firstPostId = first.data[0].id;
    const negativeCursor = -firstPostId;

    const prev = await fetchJSON(`${BASE_URL}/posts?limit=10&cursor=${negativeCursor}`);
    assert(prev.data.length > 0, "Previous page should have posts");
  });

  await test("Consecutive pages return different posts", async () => {
    const page1 = await fetchJSON(`${BASE_URL}/posts?limit=5`);
    const page2 = await fetchJSON(`${BASE_URL}/posts?limit=5&cursor=${page1.nextCursor}`);
    const page3 = await fetchJSON(`${BASE_URL}/posts?limit=5&cursor=${page2.nextCursor}`);

    const allIds = [
      ...page1.data.map(p => p.id),
      ...page2.data.map(p => p.id),
      ...page3.data.map(p => p.id),
    ];
    const uniqueIds = new Set(allIds);
    assert(uniqueIds.size === allIds.length, "All posts across pages should be unique");
  });

  await test("Posts are deterministic (same ID = same data)", async () => {
    const r1 = await fetchJSON(`${BASE_URL}/posts?limit=1`);
    const r2 = await fetchJSON(`${BASE_URL}/posts?limit=1`);
    assert(r1.data[0].id === r2.data[0].id, "Same request should return same post IDs");
    assert(r1.data[0].author === r2.data[0].author, "Same post should have same author");
  });
}

// ─────────────────────────────────────────────
// Test Suite: Requirement 4 — Initial Load
// ─────────────────────────────────────────────
async function testInitialLoad() {
  console.log("\n📋 Requirement 4 — Initial Load");

  await test("Initial load returns exactly 20 posts", async () => {
    const data = await fetchJSON(`${BASE_URL}/posts?limit=20`);
    assert(data.data.length === 20, `Expected 20 posts, got ${data.data.length}`);
  });

  await test("Initial load starts from middle of dataset (~500000)", async () => {
    const data = await fetchJSON(`${BASE_URL}/posts?limit=20`);
    const firstId = data.data[0].id;
    assert(firstId >= 499990 && firstId <= 500010, `Expected start near 500000, got ${firstId}`);
  });
}

// ─────────────────────────────────────────────
// Run All Tests
// ─────────────────────────────────────────────
async function runAll() {
  console.log("🧪 Running API Tests...");
  console.log("=".repeat(50));

  await testHealth();
  await testGetPosts();
  await testCursorPagination();
  await testInitialLoad();

  console.log("\n" + "=".repeat(50));
  console.log(`\n🏁 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("🎉 ALL TESTS PASSED!\n");
  } else {
    console.log(`⚠️  ${failed} test(s) failed\n`);
    process.exit(1);
  }
}

runAll().catch(console.error);