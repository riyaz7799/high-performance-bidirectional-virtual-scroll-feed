\# ⚡ High-Performance Bidirectional Virtual Scroll Feed



A production-grade, Instagram-like social media feed built with React and Node.js/Express, featuring advanced virtual scrolling, dynamic height measurement, and bidirectional infinite loading — capable of handling 1 million+ posts with silky smooth performance.



---



\## 🚀 Quick Start



```bash

git clone https://github.com/riyaz7799/high-performance-bidirectional-virtual-scroll-feed.git

cd high-performance-bidirectional-virtual-scroll-feed

cp .env.example .env

docker-compose up --build

```



Then open \*\*http://localhost:3000\*\* in your browser.



> ✅ That's it! One command runs everything.



---



\## 📸 Features



\### Core Virtual Scroll Engine

\- ⚡ \*\*Virtual Scrolling\*\* — Only ~20 DOM nodes rendered at any time, regardless of dataset size

\- 📏 \*\*Dynamic Height Measurement\*\* — ResizeObserver measures each post's true height after render

\- 🔁 \*\*Bidirectional Loading\*\* — Fetches newer posts scrolling down AND older posts scrolling up

\- 🔒 \*\*Scroll Position Preservation\*\* — Zero viewport jumping when new posts prepend to the top

\- 🗃️ \*\*Height Caching\*\* — Measured heights cached for instant layout recalculation



\### App Pages

\- 🏠 \*\*Home Feed\*\* — Instagram-like virtual scroll feed

\- 🔍 \*\*Search\*\* — Topic filters + explore grid

\- 🎬 \*\*Reels\*\* — TikTok-style full-screen reels

\- 💬 \*\*Messages\*\* — Real-time chat UI

\- 🔔 \*\*Notifications\*\* — Filterable notification feed

\- 👤 \*\*Profile\*\* — Grid view, story highlights, edit profile



\### UI/UX

\- 🌙 \*\*Dark / Light Mode\*\* — Toggle with smooth transition

\- 🔐 \*\*Login / Signup\*\* — Auth screens with demo user

\- 📱 \*\*Responsive\*\* — Mobile-friendly sidebar collapses

\- ✨ \*\*Shimmer Skeletons\*\* — Placeholder loading animations

\- ❤️ \*\*Interactive Posts\*\* — Like, save, share buttons



---



\## 🏗️ Architecture



```

high-performance-bidirectional-virtual-scroll-feed/

├── docker-compose.yml          # Orchestrates frontend + API

├── .env.example                # Environment variable template

├── README.md

├── api/

│   ├── server.js               # Express mock API (1M posts)

│   ├── package.json

│   └── Dockerfile

└── frontend/

&nbsp;   ├── Dockerfile

&nbsp;   ├── package.json

&nbsp;   └── src/

&nbsp;       ├── App.js              # Root with theme + routing

&nbsp;       ├── components/

&nbsp;       │   ├── VirtualFeed.js  # Core virtual scroll component

&nbsp;       │   ├── PostItem.js     # Individual post with ResizeObserver

&nbsp;       │   ├── PostPlaceholder.js

&nbsp;       │   ├── Sidebar.js

&nbsp;       │   ├── LoginPage.js

&nbsp;       │   ├── ProfilePage.js

&nbsp;       │   ├── SearchPage.js

&nbsp;       │   ├── ReelsPage.js

&nbsp;       │   ├── MessagesPage.js

&nbsp;       │   └── NotificationsPage.js

&nbsp;       ├── hooks/

&nbsp;       │   └── useVirtualFeed.js   # All virtual scroll logic

&nbsp;       └── utils/

&nbsp;           ├── api.js              # API calls + window hooks

&nbsp;           ├── heights.js          # Height cache

&nbsp;           └── format.js           # Number/time formatting

```



---



\## 🔧 How It Works



\### Virtual Scrolling

Instead of rendering all posts in the DOM, only the items visible in the viewport (plus a small buffer) are rendered. A \*\*sizer element\*\* with the total estimated height creates the scrollable space, and posts are absolutely positioned within it.



```

┌─────────────────────────────┐

│   scroll-container          │ ← overflow-y: auto

│  ┌───────────────────────┐  │

│  │   sizer-element       │  │ ← height = totalEstimatedHeight

│  │   (e.g. 500,000px)    │  │

│  │                       │  │

│  │   \[post at top=0]     │  │ ← absolute positioned

│  │   \[post at top=612]   │  │

│  │   \[post at top=1243]  │  │

│  │   ... only ~20 posts  │  │

│  │   rendered at once    │  │

│  └───────────────────────┘  │

└─────────────────────────────┘

```



\### Dynamic Height Measurement

1\. \*\*Estimate\*\* — New posts get a default estimated height (e.g., 400px)

2\. \*\*Render\*\* — Post renders with estimated space

3\. \*\*Measure\*\* — ResizeObserver fires with actual height

4\. \*\*Cache\*\* — Real height stored in `heightCache`

5\. \*\*Recalculate\*\* — All offsets recomputed instantly



\### Bidirectional Loading

\- \*\*Scroll Down\*\* → `cursor = lastPostId` (positive) → fetches next batch

\- \*\*Scroll Up\*\* → `cursor = -firstPostId` (negative) → fetches previous batch



\### Scroll Position Preservation

When posts are prepended to the top:

```javascript

const heightAdded = scrollHeightAfter - scrollHeightBefore;

container.scrollTop = scrollTopBefore + heightAdded;

```

This keeps the viewed content perfectly in place.



---



\## 🌐 API Reference



\### `GET /posts`



Fetch a paginated batch of posts.



| Parameter | Type | Description |

|-----------|------|-------------|

| `limit` | number | Posts per page (default: 20, max: 50) |

| `cursor` | number | Positive = fetch forward, Negative = fetch backward |



\*\*Response:\*\*

```json

{

&nbsp; "data": \[

&nbsp;   {

&nbsp;     "id": 500000,

&nbsp;     "author": "john\_doe",

&nbsp;     "authorFullName": "John Doe",

&nbsp;     "authorAvatar": "https://i.pravatar.cc/150?img=1",

&nbsp;     "content": "Post text content here...",

&nbsp;     "media": {

&nbsp;       "type": "image",

&nbsp;       "urls": \["https://picsum.photos/seed/1/800/600"]

&nbsp;     },

&nbsp;     "likes": 1234,

&nbsp;     "comments": 56,

&nbsp;     "shares": 12,

&nbsp;     "timestamp": "2026-03-01T12:00:00.000Z",

&nbsp;     "location": "Mumbai"

&nbsp;   }

&nbsp; ],

&nbsp; "nextCursor": 500020,

&nbsp; "direction": "forward",

&nbsp; "total": 1000000

}

```



\### `GET /health`

Returns `{ "status": "ok" }` — used by Docker healthcheck.



---



\## 🧪 Testing Hooks



These window functions are available in the browser console for verification:



```javascript

// Get details of the last API request made by the feed

window.getLastApiRequest()

// → { type: 'fetch-next', cursor: 500019, limit: 20, timestamp: '...' }

// → { type: 'fetch-previous', cursor: -499980, limit: 20, timestamp: '...' }



// Get measured heights for all rendered posts

window.getPostMeasurements()

// → { 499983: 601.89, 499984: 623.78, 500000: 450.12, ... }

```



---



\## ✅ Requirements Checklist



| # | Requirement | Status |

|---|-------------|--------|

| 1 | Single `docker-compose up` command | ✅ |

| 2 | `.env.example` with all variables | ✅ |

| 3 | `GET /posts` with cursor pagination | ✅ |

| 4 | Initial 20 posts, 1-30 DOM nodes | ✅ |

| 5 | `scroll-container` + `sizer-element` | ✅ |

| 6 | Max 40 DOM nodes after 100+ posts | ✅ |

| 7 | Fetch next on scroll down | ✅ |

| 8 | Fetch previous on scroll up | ✅ |

| 9 | `window.getPostMeasurements()` | ✅ |

| 10 | Scroll position preserved on prepend | ✅ |

| 11 | `post-author`, `post-content`, `post-media` test-ids | ✅ |

| 12 | Placeholder with `min-height: 80px` | ✅ |



---



\## 🛠️ Tech Stack



| Layer | Technology |

|-------|-----------|

| Frontend | React 18, TanStack Virtual |

| Styling | Custom CSS with CSS Variables |

| API | Node.js + Express |

| Mock Data | Faker.js |

| Images | picsum.photos, pravatar.cc |

| Container | Docker + Docker Compose |



---



\## ⚙️ Environment Variables



Copy `.env.example` to `.env` and configure:



```env

\# API Server

PORT=8080

NODE\_ENV=development



\# Frontend

REACT\_APP\_API\_URL=http://localhost:8080



\# Docker Compose

FRONTEND\_PORT=3000

API\_PORT=8080

```



---



\## 🎨 Design Decisions



\*\*Why ResizeObserver over getBoundingClientRect?\*\*

ResizeObserver fires automatically whenever an element's size changes (e.g., when an image loads), making it perfect for dynamic content without polling.



\*\*Why custom hook `useVirtualFeed`?\*\*

Centralizes all scroll logic, state, and side effects in one place, keeping the component clean and making the logic reusable and testable.



\*\*Why cursor-based pagination over offset-based?\*\*

Cursor pagination is stable — new posts being added won't cause duplicate or skipped items, unlike offset which shifts with insertions.



\*\*Why `requestAnimationFrame` for scroll anchoring?\*\*

DOM updates after `setState` are batched. Using `rAF` ensures we adjust `scrollTop` only after the browser has painted the new layout.



---



\## 👨‍💻 Author



\*\*Mohammad Riyaz\*\*

GitHub: \[@riyaz7799](https://github.com/riyaz7799)



---



\## 📄 License



MIT License — free to use and modify.

