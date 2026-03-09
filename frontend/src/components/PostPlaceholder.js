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
