# ⚡ High-Performance Bidirectional Virtual Scroll Feed

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Faker](https://img.shields.io/badge/Faker.js-Mock_Data-FF6B6B?style=for-the-badge)

**A production-grade Instagram-like social feed — virtual scrolling 1,000,000 posts with zero performance loss.**

[🚀 Quick Start](#-quick-start) • [✅ Requirements](#-all-12-requirements-satisfied) • [🏗️ Architecture](#️-architecture) • [🌐 API Docs](#-api-reference) • [🧪 Testing](#-testing-hooks)

</div>

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/riyaz7799/high-performance-bidirectional-virtual-scroll-feed.git
cd high-performance-bidirectional-virtual-scroll-feed

# 2. Setup environment
cp .env.example .env

# 3. Run everything with ONE command 🎉
docker-compose up --build
```

> 🌐 Open **http://localhost:3000** — that's it!

---

## ✅ All 12 Requirements Satisfied

| # | Requirement | Implementation | Status |
|---|-------------|----------------|--------|
| 1 | **Docker Compose** — Single command startup | `docker-compose up --build` runs both services with healthchecks | ✅ |
| 2 | **Environment Variables** — `.env.example` at root | All variables documented with defaults | ✅ |
| 3 | **Mock API** — `GET /posts` with cursor pagination | 1,000,000 posts, positive/negative cursor support | ✅ |
| 4 | **Initial Load** — 20 posts on startup | `BATCH_SIZE=20`, 1-30 `data-test-id="post-item"` in DOM | ✅ |
| 5 | **Virtual Container** — scroll-container + sizer-element | `overflow-y: auto`, dynamic sizer height | ✅ |
| 6 | **DOM Limit** — Max 40 nodes after 100+ posts | Virtual windowing keeps ~20 items rendered | ✅ |
| 7 | **Fetch Next** — Load more on scroll down | Positive cursor triggers `fetch-next` | ✅ |
| 8 | **Fetch Previous** — Load older on scroll up | Negative cursor triggers `fetch-previous` | ✅ |
| 9 | **Height Measurement** — `window.getPostMeasurements()` | ResizeObserver caches every post height | ✅ |
| 10 | **Scroll Preservation** — No viewport jump on prepend | `scrollTop` adjusted by `heightAdded` after prepend | ✅ |
| 11 | **Post Test IDs** — author, content, media | All `data-test-id` attributes on every post | ✅ |
| 12 | **Placeholders** — `min-height: 80px` shimmer | Shimmer skeleton before height is measured | ✅ |

---

## 🧪 Testing Hooks

Open browser console at `http://localhost:3000` and run:

```javascript
// ✅ Requirement 7 & 8 — Verify API fetch direction
window.getLastApiRequest()
// → { type: 'fetch-next',     cursor: 500019,  limit: 20, timestamp: '...' }
// → { type: 'fetch-previous', cursor: -499980, limit: 20, timestamp: '...' }

// ✅ Requirement 9 — Verify height measurement cache
window.getPostMeasurements()
// → { 499983: 601.89, 499984: 623.78, 500000: 450.12, ... }
```

---

## 🏗️ Architecture

```
high-performance-bidirectional-virtual-scroll-feed/
│
├── 📄 docker-compose.yml          ← Orchestrates frontend + API
├── 📄 .env.example                ← Environment variable template
├── 📄 README.md
│
├── 📁 api/
│   ├── server.js                  ← Express API — serves 1M posts
│   ├── package.json
│   └── Dockerfile
│
└── 📁 frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.js                 ← Root — theme + routing
        ├── components/
        │   ├── VirtualFeed.js     ← Core virtual scroll component ⭐
        │   ├── PostItem.js        ← Post with ResizeObserver
        │   ├── PostPlaceholder.js ← Shimmer skeleton (80px min)
        │   ├── Sidebar.js         ← Navigation + theme toggle
        │   ├── LoginPage.js       ← Auth screens
        │   ├── ProfilePage.js     ← User profile + grid
        │   ├── SearchPage.js      ← Explore + search
        │   ├── ReelsPage.js       ← TikTok-style reels
        │   ├── MessagesPage.js    ← Chat UI
        │   └── NotificationsPage.js
        ├── hooks/
        │   └── useVirtualFeed.js  ← All scroll + fetch logic ⭐
        └── utils/
            ├── api.js             ← API calls + window hooks
            ├── heights.js         ← Height cache
            └── format.js          ← Formatters
```

---

## ⚙️ How Virtual Scrolling Works

```
┌──────────────────────────────────────┐
│         scroll-container             │  ← overflow-y: auto
│  ┌────────────────────────────────┐  │
│  │         sizer-element          │  │  ← height = total estimated height
│  │         (~500,000px tall)      │  │     (represents ALL 1M posts)
│  │                                │  │
│  │  [post]  ← absolute top: 0px  │  │  ← Only ~20 posts
│  │  [post]  ← absolute top: 612px│  │     rendered in DOM
│  │  [post]  ← absolute top: 1243px│ │     at any time ✅
│  │  ...                           │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Dynamic Height Flow
```
1. Post enters viewport
       ↓
2. Render with estimated height (400px default)
       ↓
3. ResizeObserver fires → measures true height
       ↓
4. Cache height: { postId: 623.78 }
       ↓
5. Recalculate all offsets → update sizer height
```

### Scroll Position Preservation (Req #10)
```javascript
// Before prepending new posts:
const scrollHeightBefore = container.scrollHeight;
const scrollTopBefore    = container.scrollTop;

// After new posts render:
const heightAdded = container.scrollHeight - scrollHeightBefore;
container.scrollTop = scrollTopBefore + heightAdded; // ← zero jump! ✅
```

---

## 🌐 API Reference

### `GET /posts`

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | `number` | Posts per page (default: `20`, max: `50`) |
| `cursor` | `number` | Positive → fetch forward · Negative → fetch backward · Absent → start from middle |

**Example Requests:**
```bash
# Initial load
GET /posts?limit=20

# Scroll down (fetch next)
GET /posts?limit=20&cursor=500020

# Scroll up (fetch previous)
GET /posts?limit=20&cursor=-499980
```

**Response Schema:**
```json
{
  "data": [
    {
      "id": 500000,
      "author": "john_doe",
      "authorFullName": "John Doe",
      "authorAvatar": "https://i.pravatar.cc/150?img=1",
      "content": "Post text content here...",
      "media": {
        "type": "image | video | link | none",
        "urls": ["https://picsum.photos/seed/1/800/600"]
      },
      "likes": 1234,
      "comments": 56,
      "shares": 12,
      "timestamp": "2026-03-01T12:00:00.000Z",
      "location": "Mumbai"
    }
  ],
  "nextCursor": 500020,
  "direction": "forward",
  "total": 1000000
}
```

### `GET /health`
```json
{ "status": "ok", "timestamp": "2026-03-09T10:00:00.000Z" }
```

---

## 📱 App Pages

| Page | Description |
|------|-------------|
| 🏠 **Home** | Virtual scroll feed — core feature |
| 🔍 **Search** | Topic filters + explore image grid |
| 🎬 **Reels** | TikTok-style full-screen video reels |
| 💬 **Messages** | Real-time chat interface |
| 🔔 **Notifications** | Filterable notification feed |
| 👤 **Profile** | Post grid, story highlights, edit profile |

---

## ⚙️ Environment Variables

```env
# .env.example

# API Server
PORT=8080
NODE_ENV=development

# Frontend
REACT_APP_API_URL=http://localhost:8080

# Docker Compose
FRONTEND_PORT=3000
API_PORT=8080
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Virtual Scroll | TanStack Virtual + Custom Hook | Windowing engine |
| Styling | Custom CSS + CSS Variables | Dark/Light theming |
| API | Node.js + Express | Mock data server |
| Mock Data | Faker.js | 1M realistic posts |
| Images | picsum.photos + pravatar.cc | Post media + avatars |
| Containers | Docker + Docker Compose | One-command deployment |

---

## 💡 Key Design Decisions

**ResizeObserver over getBoundingClientRect**
Fires automatically when content size changes (e.g. image loads), no polling needed.

**Custom `useVirtualFeed` hook**
Centralizes all scroll logic in one place — clean component, fully reusable logic.

**Cursor-based over offset pagination**
Stable against insertions — no duplicate or skipped posts when new content arrives.

**requestAnimationFrame for scroll anchoring**
Ensures `scrollTop` adjusts only after the browser paints the new layout.

---

## 👨‍💻 Author

**Mohammad Riyaz**
🐙 GitHub: [@riyaz7799](https://github.com/riyaz7799)

---

<div align="center">

</div>