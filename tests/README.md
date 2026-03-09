\# 🧪 Tests



This directory contains tests verifying all 12 core requirements.



---



\## 📁 Files



| File | Tests | Requirements |

|------|-------|-------------|

| `api.test.js` | API endpoint, pagination, health check | Req 3, 4 |

| `virtualScroll.test.js` | DOM structure, virtual scroll, test IDs | Req 4, 5, 6, 7, 8, 9, 11, 12 |



---



\## 🚀 Running API Tests



Make sure the app is running first:

```bash

docker-compose up --build

```



Then run API tests:

```bash

cd tests

node api.test.js

```



Expected output:

```

🧪 Running API Tests...

==================================================



📋 Health Check

&nbsp; ✅ PASS — GET /health returns 200

&nbsp; ✅ PASS — GET /health returns status: ok



📋 Requirement 3 — GET /posts Endpoint

&nbsp; ✅ PASS — GET /posts returns 200 status

&nbsp; ✅ PASS — Response has 'data' array

&nbsp; ✅ PASS — Response has 'nextCursor' field

&nbsp; ...



🏁 Results: 17 passed, 0 failed

🎉 ALL TESTS PASSED!

```



---



\## 🌐 Running Frontend Tests



Open browser at `http://localhost:3000`, open \*\*DevTools Console\*\* (F12), paste the contents of `virtualScroll.test.js` and press Enter.



Expected output:

```

🧪 Running Virtual Scroll Tests...

==================================================



📋 Requirement 5 — Virtual Container

&nbsp; ✅ PASS — scroll-container exists in DOM

&nbsp; ✅ PASS — scroll-container has overflow-y: auto or scroll

&nbsp; ✅ PASS — sizer-element exists inside scroll-container

&nbsp; ✅ PASS — sizer-element height is greater than viewport height



📋 Requirement 4 — Initial Post Count

&nbsp; ✅ PASS — Between 1 and 30 post-items in DOM



📋 Requirement 6 — DOM Node Limit

&nbsp; ✅ PASS — post-item count does not exceed 40



📋 Requirement 9 — Height Measurements

&nbsp; ✅ PASS — window.getPostMeasurements is a function

&nbsp; ✅ PASS — getPostMeasurements returns an object

&nbsp; ✅ PASS — getPostMeasurements returns at least 1 entry

&nbsp; ✅ PASS — All measurement values are positive numbers



📋 Requirements 7 \& 8 — API Fetch Tracking

&nbsp; ✅ PASS — window.getLastApiRequest is a function

&nbsp; ✅ PASS — getLastApiRequest returns an object with required fields

&nbsp; ✅ PASS — Request type is fetch-next or fetch-previous



📋 Requirement 11 — Post Test IDs

&nbsp; ✅ PASS — post-item exists in DOM

&nbsp; ✅ PASS — post-item contains post-author

&nbsp; ✅ PASS — post-item contains post-content

&nbsp; ✅ PASS — post-item contains post-media

&nbsp; ✅ PASS — post-author has non-empty text

&nbsp; ✅ PASS — post-content has non-empty text



📋 Requirement 12 — Placeholders

&nbsp; ✅ PASS — post-placeholder CSS class has min-height >= 80px



🏁 Results: 18 passed, 0 failed

🎉 ALL TESTS PASSED!

```

