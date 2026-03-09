/**
 * Virtual Scroll Tests
 * Tests all frontend virtual scrolling requirements (5, 6, 7, 8, 9, 10, 11, 12)
 *
 * Run these in the browser console at http://localhost:3000
 * Or use Playwright/Puppeteer for automated testing
 */

// ─────────────────────────────────────────────
// Test Runner
// ─────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS — ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL — ${name}: ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────
// Requirement 5 — Scroll Container + Sizer
// ─────────────────────────────────────────────
function testVirtualContainer() {
  console.log("\n📋 Requirement 5 — Virtual Container");

  test("scroll-container exists in DOM", () => {
    const el = document.querySelector('[data-test-id="scroll-container"]');
    assert(el !== null, "scroll-container not found in DOM");
  });

  test("scroll-container has overflow-y: auto or scroll", () => {
    const el = document.querySelector('[data-test-id="scroll-container"]');
    const style = window.getComputedStyle(el);
    const overflow = style.overflowY;
    assert(
      overflow === "auto" || overflow === "scroll",
      `Expected overflow-y auto/scroll, got '${overflow}'`
    );
  });

  test("sizer-element exists inside scroll-container", () => {
    const container = document.querySelector('[data-test-id="scroll-container"]');
    const sizer = container?.querySelector('[data-test-id="sizer-element"]');
    assert(sizer !== null, "sizer-element not found inside scroll-container");
  });

  test("sizer-element height is greater than viewport height", () => {
    const sizer = document.querySelector('[data-test-id="sizer-element"]');
    const height = sizer?.offsetHeight || 0;
    assert(height > window.innerHeight, `Sizer height ${height}px should be > viewport ${window.innerHeight}px`);
  });
}

// ─────────────────────────────────────────────
// Requirement 4 — Initial Post Count
// ─────────────────────────────────────────────
function testInitialPostCount() {
  console.log("\n📋 Requirement 4 — Initial Post Count");

  test("Between 1 and 30 post-items in DOM", () => {
    const posts = document.querySelectorAll('[data-test-id="post-item"]');
    assert(posts.length >= 1, `Expected at least 1 post, got ${posts.length}`);
    assert(posts.length <= 30, `Expected max 30 posts, got ${posts.length}`);
  });
}

// ─────────────────────────────────────────────
// Requirement 6 — DOM Node Limit
// ─────────────────────────────────────────────
function testDOMLimit() {
  console.log("\n📋 Requirement 6 — DOM Node Limit");

  test("post-item count does not exceed 40", () => {
    const posts = document.querySelectorAll('[data-test-id="post-item"]');
    assert(posts.length <= 40, `Expected max 40 posts in DOM, got ${posts.length}`);
  });
}

// ─────────────────────────────────────────────
// Requirement 9 — Height Measurements
// ─────────────────────────────────────────────
function testHeightMeasurements() {
  console.log("\n📋 Requirement 9 — Height Measurements");

  test("window.getPostMeasurements is a function", () => {
    assert(typeof window.getPostMeasurements === "function", "window.getPostMeasurements is not defined");
  });

  test("getPostMeasurements returns an object", () => {
    const measurements = window.getPostMeasurements();
    assert(typeof measurements === "object" && measurements !== null, "Should return an object");
  });

  test("getPostMeasurements returns at least 1 entry", () => {
    const measurements = window.getPostMeasurements();
    const keys = Object.keys(measurements);
    assert(keys.length >= 1, `Expected at least 1 measurement, got ${keys.length}`);
  });

  test("All measurement values are positive numbers", () => {
    const measurements = window.getPostMeasurements();
    Object.entries(measurements).forEach(([id, height]) => {
      assert(typeof height === "number", `Post ${id}: height should be a number`);
      assert(height > 0, `Post ${id}: height should be > 0, got ${height}`);
    });
  });
}

// ─────────────────────────────────────────────
// Requirement 7 & 8 — Fetch Next/Previous
// ─────────────────────────────────────────────
function testApiRequests() {
  console.log("\n📋 Requirements 7 & 8 — API Fetch Tracking");

  test("window.getLastApiRequest is a function", () => {
    assert(typeof window.getLastApiRequest === "function", "window.getLastApiRequest is not defined");
  });

  test("getLastApiRequest returns an object with required fields", () => {
    const req = window.getLastApiRequest();
    assert(req !== null, "Should return a request object (scroll first if null)");
    if (req) {
      assert("type" in req, "Request missing 'type' field");
      assert("cursor" in req, "Request missing 'cursor' field");
      assert("limit" in req, "Request missing 'limit' field");
    }
  });

  test("Request type is fetch-next or fetch-previous", () => {
    const req = window.getLastApiRequest();
    if (req) {
      assert(
        req.type === "fetch-next" || req.type === "fetch-previous",
        `Expected fetch-next or fetch-previous, got '${req.type}'`
      );
    }
  });
}

// ─────────────────────────────────────────────
// Requirement 11 — Post Test IDs
// ─────────────────────────────────────────────
function testPostStructure() {
  console.log("\n📋 Requirement 11 — Post Test IDs");

  test("post-item exists in DOM", () => {
    const post = document.querySelector('[data-test-id="post-item"]');
    assert(post !== null, "No post-item found in DOM");
  });

  test("post-item contains post-author", () => {
    const post = document.querySelector('[data-test-id="post-item"]');
    const author = post?.querySelector('[data-test-id="post-author"]');
    assert(author !== null, "post-author not found inside post-item");
  });

  test("post-item contains post-content", () => {
    const post = document.querySelector('[data-test-id="post-item"]');
    const content = post?.querySelector('[data-test-id="post-content"]');
    assert(content !== null, "post-content not found inside post-item");
  });

  test("post-item contains post-media", () => {
    const post = document.querySelector('[data-test-id="post-item"]');
    const media = post?.querySelector('[data-test-id="post-media"]');
    assert(media !== null, "post-media not found inside post-item");
  });

  test("post-author has non-empty text", () => {
    const author = document.querySelector('[data-test-id="post-author"]');
    assert(author?.textContent?.trim().length > 0, "post-author should have text content");
  });

  test("post-content has non-empty text", () => {
    const content = document.querySelector('[data-test-id="post-content"]');
    assert(content?.textContent?.trim().length > 0, "post-content should have text content");
  });
}

// ─────────────────────────────────────────────
// Requirement 12 — Placeholders
// ─────────────────────────────────────────────
function testPlaceholders() {
  console.log("\n📋 Requirement 12 — Placeholders");

  // Note: placeholders are visible during initial load only
  // This checks CSS is correct if any are present
  const placeholders = document.querySelectorAll('[data-test-id="post-placeholder"]');

  if (placeholders.length > 0) {
    test("post-placeholder has min-height >= 80px", () => {
      placeholders.forEach((el, i) => {
        const style = window.getComputedStyle(el);
        const minHeight = parseInt(style.minHeight);
        assert(minHeight >= 80, `Placeholder ${i}: min-height should be >= 80px, got ${minHeight}px`);
      });
    });
  } else {
    test("post-placeholder CSS class has min-height >= 80px (checked via stylesheet)", () => {
      // Find rule in stylesheets
      let found = false;
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText?.includes("post-placeholder")) {
              const minH = parseInt(rule.style?.minHeight);
              if (minH >= 80) found = true;
            }
          }
        } catch (e) { /* cross-origin */ }
      }
      assert(found, "Could not verify post-placeholder min-height in stylesheets");
    });
  }
}

// ─────────────────────────────────────────────
// Run All Tests
// ─────────────────────────────────────────────
function runAll() {
  console.log("🧪 Running Virtual Scroll Tests...");
  console.log("=".repeat(50));

  testVirtualContainer();
  testInitialPostCount();
  testDOMLimit();
  testHeightMeasurements();
  testApiRequests();
  testPostStructure();
  testPlaceholders();

  console.log("\n" + "=".repeat(50));
  console.log(`\n🏁 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("🎉 ALL TESTS PASSED!\n");
  } else {
    console.log(`⚠️  ${failed} test(s) failed\n`);
  }
}

runAll();