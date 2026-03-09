# Create folders
New-Item -ItemType Directory -Force -Path "api"
New-Item -ItemType Directory -Force -Path "frontend\src\components"
New-Item -ItemType Directory -Force -Path "frontend\src\hooks"
New-Item -ItemType Directory -Force -Path "frontend\src\utils"
New-Item -ItemType Directory -Force -Path "frontend\src\styles"
New-Item -ItemType Directory -Force -Path "frontend\public"

# ── api\package.json ──
@'
{
  "name": "virtual-scroll-feed-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "@faker-js/faker": "^8.4.1",
    "cors": "^2.8.5",
    "express": "^4.18.2"
  }
}
'@ | Set-Content "api\package.json"

# ── api\Dockerfile ──
@'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=10s \
  CMD curl -f http://localhost:8080/health || exit 1
CMD ["node", "server.js"]
'@ | Set-Content "api\Dockerfile"

# ── api\.dockerignore ──
@'
node_modules
npm-debug.log
.env
'@ | Set-Content "api\.dockerignore"

# ── api\server.js ──
@'
const express = require("express");
const cors = require("cors");
const { faker } = require("@faker-js/faker");

const app = express();
const PORT = process.env.PORT || 8080;
const TOTAL_POSTS = 1000000;

app.use(cors());
app.use(express.json());

function generatePost(id) {
  faker.seed(id * 9973);
  const mediaType = faker.helpers.arrayElement(["image","image","image","video","link","none","none"]);
  const imageCount = mediaType === "image" ? faker.number.int({ min: 1, max: 4 }) : 0;
  return {
    id,
    author: faker.internet.username(),
    authorAvatar: `https://i.pravatar.cc/150?img=${(id % 70) + 1}`,
    authorFullName: faker.person.fullName(),
    content: faker.helpers.arrayElement([
      faker.lorem.sentence({ min: 5, max: 20 }),
      faker.lorem.paragraph({ min: 1, max: 3 }),
      faker.lorem.sentences({ min: 2, max: 5 }),
    ]),
    media: {
      type: mediaType,
      urls: imageCount > 0
        ? Array.from({ length: imageCount }, (_, i) => `https://picsum.photos/seed/${id * 13 + i}/800/600`)
        : mediaType === "video" ? [`https://picsum.photos/seed/${id}/800/450`]
        : mediaType === "link" ? [`https://example.com/article/${id}`]
        : [],
    },
    likes: faker.number.int({ min: 0, max: 50000 }),
    comments: faker.number.int({ min: 0, max: 5000 }),
    shares: faker.number.int({ min: 0, max: 1000 }),
    timestamp: faker.date.recent({ days: 30 }).toISOString(),
    location: faker.helpers.maybe(() => faker.location.city(), { probability: 0.3 }),
  };
}

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/posts", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const cursor = req.query.cursor !== undefined ? parseInt(req.query.cursor) : null;
  let startId, direction = "forward";

  if (cursor === null) {
    startId = 500000;
  } else if (cursor < 0) {
    direction = "backward";
    startId = Math.abs(cursor) - 1;
  } else {
    startId = cursor + 1;
  }

  let posts = [];
  if (direction === "forward") {
    for (let i = startId; i < startId + limit && i <= TOTAL_POSTS; i++) posts.push(generatePost(i));
  } else {
    for (let i = startId; i > startId - limit && i >= 1; i--) posts.push(generatePost(i));
    posts.reverse();
  }

  const nextCursor = direction === "forward"
    ? (posts.length > 0 && posts[posts.length-1].id < TOTAL_POSTS ? posts[posts.length-1].id : null)
    : (posts.length > 0 && posts[0].id > 1 ? -posts[0].id : null);

  res.json({ data: posts, nextCursor, direction, total: TOTAL_POSTS });
});

app.listen(PORT, "0.0.0.0", () => console.log(`API running on port ${PORT}`));
'@ | Set-Content "api\server.js"

# ── frontend\Dockerfile ──
@'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV PORT=3000
ENV CHOKIDAR_USEPOLLING=true
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1
CMD ["npm", "start"]
'@ | Set-Content "frontend\Dockerfile"

# ── frontend\.dockerignore ──
@'
node_modules
build
.env
'@ | Set-Content "frontend\.dockerignore"

# ── frontend\package.json ──
@'
{
  "name": "virtual-scroll-feed-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@tanstack/react-virtual": "^3.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "date-fns": "^3.3.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  },
  "eslintConfig": { "extends": ["react-app"] },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version"]
  }
}
'@ | Set-Content "frontend\package.json"

# ── frontend\public\index.html ──
@'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ScrollFeed</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
'@ | Set-Content "frontend\public\index.html"

# ── frontend\src\index.js ──
@'
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import App from "./App";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<React.StrictMode><App /></React.StrictMode>);
'@ | Set-Content "frontend\src\index.js"

# ── frontend\src\styles\global.css ──
@'
:root {
  --bg-primary: #000000;
  --bg-secondary: #121212;
  --bg-card: #1a1a1a;
  --bg-hover: #222222;
  --border: #2a2a2a;
  --border-light: #333333;
  --text-primary: #f5f5f5;
  --text-secondary: #a0a0a0;
  --text-muted: #666666;
  --accent: #e1306c;
  --gradient: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  --font-display: "Playfair Display", serif;
  --font-body: "DM Sans", sans-serif;
  --radius: 12px;
  --radius-sm: 8px;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; background: var(--bg-primary); color: var(--text-primary); font-family: var(--font-body); font-size: 14px; -webkit-font-smoothing: antialiased; overflow: hidden; }
#root { height: 100%; display: flex; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 4px; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes heartBeat { 0%,100% { transform: scale(1); } 25% { transform: scale(1.3); } 75% { transform: scale(1.15); } }
.shimmer { background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.fade-in { animation: fadeIn 0.3s ease forwards; }
button { cursor: pointer; border: none; background: none; font-family: var(--font-body); }
img { display: block; max-width: 100%; }
'@ | Set-Content "frontend\src\styles\global.css"

# ── frontend\src\utils\api.js ──
@'
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
let lastApiRequest = null;
export function getLastApiRequest() { return lastApiRequest; }
export async function fetchPosts({ cursor, limit = 20 } = {}) {
  const params = new URLSearchParams({ limit });
  if (cursor !== undefined && cursor !== null) params.set("cursor", cursor);
  const type = cursor === undefined || cursor === null ? "initial" : cursor < 0 ? "fetch-previous" : "fetch-next";
  lastApiRequest = { type, cursor: cursor ?? null, limit, timestamp: Date.now() };
  const response = await fetch(`${API_URL}/posts?${params}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
if (typeof window !== "undefined") window.getLastApiRequest = getLastApiRequest;
'@ | Set-Content "frontend\src\utils\api.js"

# ── frontend\src\utils\heights.js ──
@'
const heightCache = new Map();
const DEFAULT_HEIGHT = 400;
export function getEstimatedHeight(post) {
  if (heightCache.has(post.id)) return heightCache.get(post.id);
  let h = 120;
  const wordCount = post.content?.split(" ").length || 0;
  h += Math.ceil(wordCount / 8) * 22;
  if (post.media?.type === "image") h += post.media.urls.length > 1 ? 320 : 380;
  else if (post.media?.type === "video") h += 320;
  h += 60;
  return Math.max(h, DEFAULT_HEIGHT);
}
export function measureHeight(postId, height) { if (height > 0) heightCache.set(postId, height); }
export function getCachedHeight(postId) { return heightCache.get(postId) || DEFAULT_HEIGHT; }
export function getPostMeasurements() {
  const result = {};
  heightCache.forEach((h, id) => { result[id] = h; });
  return result;
}
if (typeof window !== "undefined") window.getPostMeasurements = getPostMeasurements;
'@ | Set-Content "frontend\src\utils\heights.js"

# ── frontend\src\utils\format.js ──
@'
export function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}
export function formatTime(iso) {
  const diff = Math.floor((new Date() - new Date(iso)) / 1000);
  if (diff < 60) return diff + "s";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  return Math.floor(diff / 86400) + "d";
}
'@ | Set-Content "frontend\src\utils\format.js"

# ── frontend\src\hooks\useVirtualFeed.js ──
@'
import { useState, useEffect, useRef, useCallback } from "react";
import { fetchPosts } from "../utils/api";
import { getEstimatedHeight, measureHeight, getCachedHeight } from "../utils/heights";

const BATCH_SIZE = 20;
const BUFFER = 5;
const THRESHOLD = 300;

export function useVirtualFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState({ top: false, bottom: false, initial: true });
  const [cursors, setCursors] = useState({ next: null, prev: null });
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 15 });
  const [totalHeight, setTotalHeight] = useState(0);
  const [offsets, setOffsets] = useState([]);
  const scrollRef = useRef(null);
  const fetchingRef = useRef({ top: false, bottom: false });
  const postsRef = useRef([]);
  postsRef.current = posts;

  const recalcLayout = useCallback((list) => {
    let offset = 0;
    const newOffsets = list.map((p) => { const o = offset; offset += getCachedHeight(p.id) || getEstimatedHeight(p); return o; });
    setOffsets(newOffsets);
    setTotalHeight(offset);
    return newOffsets;
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const result = await fetchPosts({ limit: BATCH_SIZE });
        setPosts(result.data);
        setCursors({ next: result.nextCursor, prev: result.data.length > 0 ? -result.data[0].id : null });
        recalcLayout(result.data);
      } catch (e) { console.error(e); }
      finally { setLoading((l) => ({ ...l, initial: false })); }
    }
    init();
  }, [recalcLayout]);

  const fetchNext = useCallback(async () => {
    if (fetchingRef.current.bottom || cursors.next === null) return;
    fetchingRef.current.bottom = true;
    setLoading((l) => ({ ...l, bottom: true }));
    try {
      const result = await fetchPosts({ cursor: cursors.next, limit: BATCH_SIZE });
      if (!result.data.length) return;
      setPosts((prev) => { const ids = new Set(prev.map((p) => p.id)); const merged = [...prev, ...result.data.filter((p) => !ids.has(p.id))]; recalcLayout(merged); return merged; });
      setCursors((c) => ({ ...c, next: result.nextCursor }));
    } catch (e) { console.error(e); }
    finally { fetchingRef.current.bottom = false; setLoading((l) => ({ ...l, bottom: false })); }
  }, [cursors.next, recalcLayout]);

  const fetchPrev = useCallback(async () => {
    if (fetchingRef.current.top || cursors.prev === null) return;
    fetchingRef.current.top = true;
    setLoading((l) => ({ ...l, top: true }));
    const container = scrollRef.current;
    const heightBefore = container?.scrollHeight || 0;
    const topBefore = container?.scrollTop || 0;
    try {
      const result = await fetchPosts({ cursor: cursors.prev, limit: BATCH_SIZE });
      if (!result.data.length) return;
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const newPosts = result.data.filter((p) => !ids.has(p.id));
        if (!newPosts.length) return prev;
        const merged = [...newPosts, ...prev];
        recalcLayout(merged);
        requestAnimationFrame(() => { if (container) container.scrollTop = topBefore + (container.scrollHeight - heightBefore); });
        return merged;
      });
      setCursors((c) => ({ ...c, prev: result.data.length > 0 ? -result.data[0].id : null }));
    } catch (e) { console.error(e); }
    finally { fetchingRef.current.top = false; setLoading((l) => ({ ...l, top: false })); }
  }, [cursors.prev, recalcLayout]);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const cur = postsRef.current;
    if (scrollTop < THRESHOLD) fetchPrev();
    if (scrollHeight - scrollTop - clientHeight < THRESHOLD) fetchNext();
    let start = 0, end = cur.length;
    for (let i = 0; i < offsets.length; i++) { if (offsets[i] + (getCachedHeight(cur[i]?.id) || 400) >= scrollTop - 500) { start = Math.max(0, i - BUFFER); break; } }
    for (let i = start; i < offsets.length; i++) { if (offsets[i] > scrollTop + clientHeight + 500) { end = Math.min(cur.length, i + BUFFER); break; } }
    setVisibleRange({ start, end });
  }, [fetchNext, fetchPrev, offsets]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let ticking = false;
    const onScroll = () => { if (!ticking) { requestAnimationFrame(() => { handleScroll(); ticking = false; }); ticking = true; } };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const onHeightMeasured = useCallback((postId, height) => {
    measureHeight(postId, height);
    setPosts((prev) => { recalcLayout(prev); return prev; });
  }, [recalcLayout]);

  return { posts, loading, visibleRange, totalHeight, offsets, scrollRef, onHeightMeasured };
}
'@ | Set-Content "frontend\src\hooks\useVirtualFeed.js"

# ── frontend\src\components\PostPlaceholder.js ──
@'
import React from "react";
import "./PostPlaceholder.css";
export default function PostPlaceholder() {
  return (
    <div className="post-placeholder" data-test-id="post-placeholder">
      <div className="ph-header">
        <div className="ph-avatar shimmer" />
        <div className="ph-meta">
          <div className="ph-line shimmer" style={{width:"120px",height:"12px"}} />
          <div className="ph-line shimmer" style={{width:"80px",height:"10px",marginTop:"6px"}} />
        </div>
      </div>
      <div className="ph-body">
        <div className="ph-line shimmer" style={{width:"100%",height:"12px"}} />
        <div className="ph-line shimmer" style={{width:"85%",height:"12px",marginTop:"8px"}} />
        <div className="ph-line shimmer" style={{width:"70%",height:"12px",marginTop:"8px"}} />
      </div>
      <div className="ph-image shimmer" />
    </div>
  );
}
'@ | Set-Content "frontend\src\components\PostPlaceholder.js"

# ── frontend\src\components\PostPlaceholder.css ──
@'
.post-placeholder { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 12px; padding: 16px; min-height: 80px; }
.ph-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.ph-avatar { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; }
.ph-line { border-radius: 4px; display: block; }
.ph-body { margin-bottom: 16px; }
.ph-image { width: 100%; height: 200px; border-radius: var(--radius-sm); }
'@ | Set-Content "frontend\src\components\PostPlaceholder.css"

# ── frontend\src\components\PostItem.css ──
@'
.post-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 12px; overflow: hidden; transition: border-color 0.2s; }
.post-item:hover { border-color: var(--border-light); }
.post-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px 10px; }
.post-avatar-wrap { position: relative; flex-shrink: 0; }
.post-avatar-ring { position: absolute; inset: -2px; border-radius: 50%; background: var(--gradient); z-index: 0; }
.post-avatar { width: 38px; height: 38px; border-radius: 50%; position: relative; z-index: 1; border: 2px solid var(--bg-card); object-fit: cover; }
.post-meta { flex: 1; min-width: 0; }
.post-author { display: block; font-weight: 600; font-size: 13px; color: var(--text-primary); }
.post-submeta { display: flex; align-items: center; gap: 4px; margin-top: 1px; }
.post-fullname, .post-location { font-size: 11px; color: var(--text-muted); }
.post-time { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }
.post-more { color: var(--text-muted); padding: 4px; border-radius: 50%; transition: background 0.2s; }
.post-more:hover { background: var(--bg-hover); color: var(--text-primary); }
.post-content { padding: 4px 16px 12px; font-size: 14px; color: var(--text-primary); line-height: 1.6; word-break: break-word; }
.post-images { width: 100%; }
.post-images-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 2px; }
.post-image-wrap { position: relative; overflow: hidden; background: var(--bg-secondary); }
.post-image-skeleton { position: absolute; inset: 0; z-index: 1; }
.post-image { width: 100%; opacity: 0; transition: opacity 0.3s; aspect-ratio: 4/3; object-fit: cover; }
.post-image.loaded { opacity: 1; }
.post-images:not(.post-images-grid) .post-image { aspect-ratio: 1; }
.post-video-wrap { position: relative; cursor: pointer; }
.post-play-btn { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); }
.post-link-preview { margin: 0 16px 12px; display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--bg-secondary); border-radius: var(--radius-sm); border: 1px solid var(--border); }
.post-link-url { font-size: 12px; color: #405de6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.post-actions { display: flex; align-items: center; padding: 8px 12px 12px; gap: 4px; }
.post-action-btn { display: flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 13px; font-weight: 500; transition: background 0.15s, color 0.15s; }
.post-action-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.post-action-btn.liked { color: var(--accent); animation: heartBeat 0.4s ease; }
.post-save-btn { margin-left: auto; }
'@ | Set-Content "frontend\src\components\PostItem.css"

# ── frontend\src\components\PostItem.js ──
@'
import React, { useEffect, useRef, useState } from "react";
import { formatCount, formatTime } from "../utils/format";
import "./PostItem.css";

export default function PostItem({ post, onHeightMeasured }) {
  const ref = useRef(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [imgLoaded, setImgLoaded] = useState({});

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) { const h = e.contentRect.height; if (h > 0) onHeightMeasured(post.id, h); }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [post.id, onHeightMeasured]);

  const hasMedia = post.media?.type !== "none" && post.media?.urls?.length > 0;
  const isMulti = post.media?.type === "image" && post.media.urls.length > 1;

  return (
    <div ref={ref} className="post-item fade-in" data-test-id="post-item" data-test-id-specific={`post-item-${post.id}`}>
      <div className="post-header">
        <div className="post-avatar-wrap">
          <div className="post-avatar-ring" />
          <img className="post-avatar" src={post.authorAvatar} alt={post.author} loading="lazy" />
        </div>
        <div className="post-meta">
          <span className="post-author" data-test-id="post-author">{post.author}</span>
          <div className="post-submeta">
            <span className="post-fullname">{post.authorFullName}</span>
            {post.location && <><span>·</span><span className="post-location">📍 {post.location}</span></>}
          </div>
        </div>
        <div className="post-time">{formatTime(post.timestamp)}</div>
        <button className="post-more">⋮</button>
      </div>
      <div className="post-content" data-test-id="post-content">{post.content}</div>
      <div className="post-media" data-test-id="post-media">
        {hasMedia && post.media.type === "image" && (
          <div className={`post-images ${isMulti ? "post-images-grid" : ""}`}>
            {post.media.urls.map((url, i) => (
              <div key={i} className="post-image-wrap">
                {!imgLoaded[i] && <div className="post-image-skeleton shimmer" />}
                <img src={url} alt="" className={`post-image ${imgLoaded[i] ? "loaded" : ""}`} loading="lazy" onLoad={() => setImgLoaded((s) => ({ ...s, [i]: true }))} />
              </div>
            ))}
          </div>
        )}
        {hasMedia && post.media.type === "video" && (
          <div className="post-video-wrap">
            <img src={post.media.urls[0]} alt="video" className="post-image loaded" loading="lazy" />
            <div className="post-play-btn"><svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
        )}
        {hasMedia && post.media.type === "link" && (
          <div className="post-link-preview"><span>🔗</span><span className="post-link-url">{post.media.urls[0]}</span></div>
        )}
      </div>
      <div className="post-actions">
        <button className={`post-action-btn ${liked ? "liked" : ""}`} onClick={() => { setLiked((l) => !l); setLikeCount((c) => liked ? c-1 : c+1); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={liked?"#e1306c":"none"} stroke={liked?"#e1306c":"currentColor"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>{formatCount(likeCount)}</span>
        </button>
        <button className="post-action-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>{formatCount(post.comments)}</span>
        </button>
        <button className="post-action-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <span>{formatCount(post.shares)}</span>
        </button>
        <button className={`post-action-btn post-save-btn ${saved?"saved":""}`} onClick={() => setSaved((s) => !s)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={saved?"#f5f5f5":"none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
    </div>
  );
}
'@ | Set-Content "frontend\src\components\PostItem.js"

# ── frontend\src\components\Sidebar.css ──
@'
.sidebar { width: 240px; flex-shrink: 0; height: 100vh; background: var(--bg-primary); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 20px 12px; }
.sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 8px 12px 28px; }
.sidebar-logo-icon { font-size: 24px; }
.sidebar-logo-text { font-family: var(--font-display); font-size: 22px; font-weight: 700; background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.sidebar-nav-item { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: var(--radius); color: var(--text-secondary); font-size: 14px; font-weight: 400; transition: background 0.15s, color 0.15s; width: 100%; }
.sidebar-nav-item:hover { background: var(--bg-secondary); color: var(--text-primary); }
.sidebar-nav-item.active { color: var(--text-primary); font-weight: 600; }
.nav-icon { font-size: 20px; width: 24px; text-align: center; }
.sidebar-profile { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--radius); cursor: pointer; }
.sidebar-profile:hover { background: var(--bg-secondary); }
.sidebar-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.sidebar-username { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.sidebar-name { font-size: 11px; color: var(--text-muted); }
@media (max-width: 900px) { .sidebar { width: 72px; } .sidebar-logo-text, .nav-label, .sidebar-profile-info { display: none; } .sidebar-nav-item, .sidebar-profile { justify-content: center; padding: 12px; } }
'@ | Set-Content "frontend\src\components\Sidebar.css"

# ── frontend\src\components\Sidebar.js ──
@'
import React from "react";
import "./Sidebar.css";
const NAV = [{ icon:"🏠", label:"Home", active:true },{ icon:"🔍", label:"Search" },{ icon:"🎬", label:"Reels" },{ icon:"💬", label:"Messages" },{ icon:"❤️", label:"Notifications" },{ icon:"➕", label:"Create" }];
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><span className="sidebar-logo-icon">⚡</span><span className="sidebar-logo-text">ScrollFeed</span></div>
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button key={item.label} className={`sidebar-nav-item ${item.active?"active":""}`}>
            <span className="nav-icon">{item.icon}</span><span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-profile">
        <img src="https://i.pravatar.cc/150?img=33" alt="Profile" className="sidebar-avatar" />
        <div className="sidebar-profile-info"><span className="sidebar-username">you</span><span className="sidebar-name">Your Profile</span></div>
      </div>
    </aside>
  );
}
'@ | Set-Content "frontend\src\components\Sidebar.js"

# ── frontend\src\components\VirtualFeed.css ──
@'
.feed-scroll-container { flex: 1; height: 100vh; overflow-y: auto; overflow-x: hidden; position: relative; }
.feed-sizer { position: relative; width: 100%; min-height: 100vh; }
.feed-item-wrapper { padding: 0 20px; max-width: 640px; margin: 0 auto; left: 0; right: 0; }
.feed-loading-top { display: flex; justify-content: center; padding: 16px; position: sticky; top: 0; z-index: 10; background: linear-gradient(to bottom, var(--bg-primary) 60%, transparent); }
.feed-loading-bottom { display: flex; justify-content: center; padding: 24px; }
.feed-spinner { width: 28px; height: 28px; border: 2px solid var(--border-light); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
.feed-loading-initial { padding: 20px; max-width: 600px; margin: 0 auto; }
'@ | Set-Content "frontend\src\components\VirtualFeed.css"

# ── frontend\src\components\VirtualFeed.js ──
@'
import React, { useCallback } from "react";
import { useVirtualFeed } from "../hooks/useVirtualFeed";
import { getEstimatedHeight } from "../utils/heights";
import PostItem from "./PostItem";
import PostPlaceholder from "./PostPlaceholder";
import "./VirtualFeed.css";

export default function VirtualFeed() {
  const { posts, loading, visibleRange, totalHeight, offsets, scrollRef, onHeightMeasured } = useVirtualFeed();
  const handleHeight = useCallback((id, h) => onHeightMeasured(id, h), [onHeightMeasured]);

  if (loading.initial) {
    return (
      <div style={{flex:1,height:"100vh",overflowY:"auto"}} data-test-id="scroll-container">
        <div data-test-id="sizer-element" style={{minHeight:"100vh"}}>
          <div className="feed-loading-initial">{Array.from({length:5}).map((_,i) => <PostPlaceholder key={i} />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-scroll-container" data-test-id="scroll-container" ref={scrollRef}>
      <div className="feed-sizer" data-test-id="sizer-element" style={{height:`${totalHeight}px`}}>
        {loading.top && <div className="feed-loading-top"><div className="feed-spinner" /></div>}
        {posts.slice(visibleRange.start, visibleRange.end).map((post, idx) => {
          const absIdx = visibleRange.start + idx;
          const top = offsets[absIdx] || 0;
          return (
            <div key={post.id} className="feed-item-wrapper" style={{position:"absolute",top:`${top}px`,width:"100%"}}>
              <PostItem post={post} onHeightMeasured={handleHeight} />
            </div>
          );
        })}
        {loading.bottom && <div className="feed-loading-bottom" style={{position:"absolute",bottom:0,width:"100%"}}><div className="feed-spinner" /></div>}
      </div>
    </div>
  );
}
'@ | Set-Content "frontend\src\components\VirtualFeed.js"

# ── frontend\src\App.css ──
@'
.app { display: flex; height: 100vh; width: 100%; background: var(--bg-primary); }
.app-main { flex: 1; min-width: 0; display: flex; flex-direction: column; border-right: 1px solid var(--border); }
.app-right-panel { width: 320px; flex-shrink: 0; padding: 24px 20px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; }
.suggestions-title { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
.suggestion-item { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.suggestion-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.suggestion-info { flex: 1; display: flex; flex-direction: column; }
.suggestion-username { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.suggestion-sub { font-size: 11px; color: var(--text-muted); }
.suggestion-follow { font-size: 13px; font-weight: 600; color: #405de6; }
.right-panel-footer { margin-top: auto; }
.right-panel-footer p { font-size: 11px; color: var(--text-muted); line-height: 1.8; }
@media (max-width: 1100px) { .app-right-panel { display: none; } }
'@ | Set-Content "frontend\src\App.css"

# ── frontend\src\App.js ──
@'
import React from "react";
import Sidebar from "./components/Sidebar";
import VirtualFeed from "./components/VirtualFeed";
import "./App.css";
export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="app-main"><VirtualFeed /></main>
      <aside className="app-right-panel">
        <div>
          <h3 className="suggestions-title">Suggested for you</h3>
          {Array.from({length:5}).map((_,i) => (
            <div key={i} className="suggestion-item">
              <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="" className="suggestion-avatar" />
              <div className="suggestion-info"><span className="suggestion-username">user_{1000+i*37}</span><span className="suggestion-sub">Suggested for you</span></div>
              <button className="suggestion-follow">Follow</button>
            </div>
          ))}
        </div>
        <div className="right-panel-footer"><p>© 2026 ScrollFeed · About · Help · Privacy</p></div>
      </aside>
    </div>
  );
}
'@ | Set-Content "frontend\src\App.js"

# ── docker-compose.yml ──
@'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8080
      - CHOKIDAR_USEPOLLING=true
      - WDS_SOCKET_PORT=0
    depends_on:
      api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
'@ | Set-Content "docker-compose.yml"

# ── .env.example ──
@'
PORT=8080
NODE_ENV=development
REACT_APP_API_URL=http://localhost:8080
FRONTEND_PORT=3000
API_PORT=8080
'@ | Set-Content ".env.example"

Write-Host ""
Write-Host "✅ All files created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run: docker-compose up --build" -ForegroundColor Cyan