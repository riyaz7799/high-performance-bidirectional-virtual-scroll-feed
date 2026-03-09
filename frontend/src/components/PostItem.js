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
      for (const e of entries) {
        const h = e.contentRect.height;
        if (h > 0) onHeightMeasured(post.id, h);
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [post.id, onHeightMeasured]);

  const hasMedia = post.media?.type !== "none" && post.media?.urls?.length > 0;
  const isMulti = post.media?.type === "image" && post.media.urls.length > 1;

  return (
    <div
      ref={ref}
      className="post-item fade-in"
      data-test-id="post-item"
      data-post-id={post.id}
    >
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
        <button className="post-more" aria-label="More options">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
      </div>

      <div className="post-content" data-test-id="post-content">{post.content}</div>

      <div className="post-media" data-test-id="post-media">
        {hasMedia && post.media.type === "image" && (
          <div className={`post-images ${isMulti ? "post-images-grid" : ""}`}>
            {post.media.urls.map((url, i) => (
              <div key={i} className="post-image-wrap">
                {!imgLoaded[i] && <div className="post-image-skeleton shimmer" />}
                <img
                  src={url}
                  alt={`Post media ${i + 1}`}
                  className={`post-image ${imgLoaded[i] ? "loaded" : ""}`}
                  loading="lazy"
                  onLoad={() => setImgLoaded((s) => ({ ...s, [i]: true }))}
                />
              </div>
            ))}
          </div>
        )}
        {hasMedia && post.media.type === "video" && (
          <div className="post-video-wrap">
            <img src={post.media.urls[0]} alt="Video thumbnail" className="post-image loaded" loading="lazy" />
            <div className="post-play-btn">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        )}
        {hasMedia && post.media.type === "link" && (
          <div className="post-link-preview">
            <span>🔗</span>
            <span className="post-link-url">{post.media.urls[0]}</span>
          </div>
        )}
      </div>

      <div className="post-actions">
        <button className={`post-action-btn ${liked ? "liked" : ""}`} onClick={() => { setLiked(l => !l); setLikeCount(c => liked ? c-1 : c+1); }} aria-label="Like">
          <svg width="20" height="20" viewBox="0 0 24 24" fill={liked?"#e1306c":"none"} stroke={liked?"#e1306c":"currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{formatCount(likeCount)}</span>
        </button>
        <button className="post-action-btn" aria-label="Comment">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>{formatCount(post.comments)}</span>
        </button>
        <button className="post-action-btn" aria-label="Share">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          <span>{formatCount(post.shares)}</span>
        </button>
        <button className={`post-action-btn post-save-btn ${saved?"saved":""}`} onClick={() => setSaved(s => !s)} aria-label="Save">
          <svg width="20" height="20" viewBox="0 0 24 24" fill={saved?"#f5f5f5":"none"} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}