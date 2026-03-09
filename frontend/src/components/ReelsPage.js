import React, { useState } from "react";
import "./ReelsPage.css";

const REELS = Array.from({length: 10}, (_, i) => ({
  id: i+1,
  thumbnail: `https://picsum.photos/seed/${i*23+7}/400/700`,
  author: `creator_${100 + i * 7}`,
  authorAvatar: `https://i.pravatar.cc/150?img=${i+20}`,
  description: ["Amazing sunset view 🌅", "City nights ✨", "Nature vibes 🌿", "Travel diaries ✈️", "Weekend adventures 🏕️", "Urban exploration 🏙️", "Ocean waves 🌊", "Mountain peaks 🏔️", "Street food tour 🍜", "Festival lights 🎆"][i],
  likes: Math.floor(Math.random() * 200000) + 1000,
  comments: Math.floor(Math.random() * 5000) + 100,
  audio: `Original Audio - creator_${100 + i * 7}`,
}));

export default function ReelsPage() {
  const [current, setCurrent] = useState(0);
  const [liked, setLiked] = useState({});

  const reel = REELS[current];

  return (
    <div className="reels-page">
      <div className="reels-container">
        <div className="reel-card">
          <img src={reel.thumbnail} alt="Reel" className="reel-bg" />
          <div className="reel-overlay" />

          <div className="reel-top">
            <span className="reel-title">⚡ Reels</span>
            <button className="reel-camera">📷</button>
          </div>

          <div className="reel-bottom">
            <div className="reel-info">
              <div className="reel-author">
                <img src={reel.authorAvatar} alt="" className="reel-avatar" />
                <span className="reel-author-name">@{reel.author}</span>
                <button className="reel-follow-btn">Follow</button>
              </div>
              <p className="reel-desc">{reel.description}</p>
              <div className="reel-audio">🎵 {reel.audio}</div>
            </div>

            <div className="reel-actions">
              <button className={`reel-action ${liked[reel.id] ? "liked" : ""}`}
                onClick={() => setLiked(l => ({...l, [reel.id]: !l[reel.id]}))}>
                <span className="reel-action-icon">{liked[reel.id] ? "❤️" : "🤍"}</span>
                <span>{((reel.likes + (liked[reel.id]?1:0))/1000).toFixed(0)}K</span>
              </button>
              <button className="reel-action">
                <span className="reel-action-icon">💬</span>
                <span>{(reel.comments/1000).toFixed(1)}K</span>
              </button>
              <button className="reel-action">
                <span className="reel-action-icon">↗️</span>
                <span>Share</span>
              </button>
              <button className="reel-action">
                <span className="reel-action-icon">⋯</span>
              </button>
            </div>
          </div>

          <button className="reel-play-center">▶</button>
        </div>

        <div className="reels-nav">
          <button className="reel-nav-btn" onClick={() => setCurrent(c => Math.max(0, c-1))} disabled={current === 0}>↑</button>
          <span className="reel-counter">{current+1}/{REELS.length}</span>
          <button className="reel-nav-btn" onClick={() => setCurrent(c => Math.min(REELS.length-1, c+1))} disabled={current === REELS.length-1}>↓</button>
        </div>
      </div>
    </div>
  );
}