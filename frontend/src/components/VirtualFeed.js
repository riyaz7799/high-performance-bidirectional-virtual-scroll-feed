import React, { useCallback } from "react";
import { useVirtualFeed } from "../hooks/useVirtualFeed";
import PostItem from "./PostItem";
import PostPlaceholder from "./PostPlaceholder";
import "./VirtualFeed.css";

export default function VirtualFeed() {
  const { posts, loading, visibleRange, totalHeight, offsets, scrollRef, onHeightMeasured } = useVirtualFeed();
  const handleHeight = useCallback((id, h) => onHeightMeasured(id, h), [onHeightMeasured]);

  if (loading.initial) {
    return (
      <div
        className="feed-scroll-container"
        data-test-id="scroll-container"
        style={{ overflowY: "auto" }}
      >
        <div
          data-test-id="sizer-element"
          style={{ minHeight: "100vh", position: "relative" }}
        >
          <div className="feed-loading-initial">
            {Array.from({ length: 5 }).map((_, i) => (
              <PostPlaceholder key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="feed-scroll-container"
      data-test-id="scroll-container"
      ref={scrollRef}
    >
      <div
        className="feed-sizer"
        data-test-id="sizer-element"
        style={{ height: `${totalHeight}px` }}
      >
        {loading.top && (
          <div className="feed-loading-top">
            <div className="feed-spinner" />
          </div>
        )}

        {posts.slice(visibleRange.start, visibleRange.end).map((post, idx) => {
          const absIdx = visibleRange.start + idx;
          const top = offsets[absIdx] || 0;
          return (
            <div
              key={post.id}
              className="feed-item-wrapper"
              data-test-id={`post-item-${post.id}`}
              style={{ position: "absolute", top: `${top}px`, width: "100%" }}
            >
              <PostItem post={post} onHeightMeasured={handleHeight} />
            </div>
          );
        })}

        {loading.bottom && (
          <div
            className="feed-loading-bottom"
            style={{ position: "absolute", bottom: 0, width: "100%" }}
          >
            <div className="feed-spinner" />
          </div>
        )}
      </div>
    </div>
  );
}