import React, { useState } from "react";
import "./ProfilePage.css";

const GRID_POSTS = Array.from({length: 42}, (_, i) => ({
  id: i+1,
  image: `https://picsum.photos/seed/${i*11+5}/300/300`,
  likes: Math.floor(Math.random()*10000),
  comments: Math.floor(Math.random()*500),
}));

export default function ProfilePage({ user }) {
  const [activeTab, setActiveTab] = useState("posts");
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(user);
  const [editForm, setEditForm] = useState(user);
  const [selectedPost, setSelectedPost] = useState(null);

  const saveProfile = () => { setProfile(editForm); setEditing(false); };

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrap">
            <img src={profile.avatar} alt="" className="profile-avatar" />
            <div className="profile-avatar-ring" />
          </div>
        </div>
        <div className="profile-info">
          <div className="profile-top-row">
            <h2 className="profile-username">{profile.username}</h2>
            <button className="profile-edit-btn" onClick={() => setEditing(true)}>Edit Profile</button>
            <button className="profile-settings-btn">⚙️</button>
          </div>
          <div className="profile-stats">
            <div className="profile-stat"><span className="stat-num">{profile.posts}</span><span className="stat-label">posts</span></div>
            <div className="profile-stat"><span className="stat-num">{profile.followers?.toLocaleString()}</span><span className="stat-label">followers</span></div>
            <div className="profile-stat"><span className="stat-num">{profile.following}</span><span className="stat-label">following</span></div>
          </div>
          <div className="profile-bio">
            <strong>{profile.name}</strong>
            <p>{profile.bio}</p>
            <a href="#!" className="profile-link">🔗 scrollfeed.app/{profile.username}</a>
          </div>
        </div>
      </div>

      {/* Story Highlights */}
      <div className="profile-highlights">
        {["Travel", "Food", "Tech", "Life", "New"].map((h, i) => (
          <div key={h} className="highlight-item">
            <div className="highlight-circle">
              {i < 4
                ? <img src={`https://picsum.photos/seed/${i*20+1}/80/80`} alt="" />
                : <span className="highlight-plus">+</span>
              }
            </div>
            <span className="highlight-label">{h}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className={`profile-tab ${activeTab==="posts"?"active":""}`} onClick={() => setActiveTab("posts")}>
          <span>⊞</span> Posts
        </button>
        <button className={`profile-tab ${activeTab==="reels"?"active":""}`} onClick={() => setActiveTab("reels")}>
          <span>🎬</span> Reels
        </button>
        <button className={`profile-tab ${activeTab==="saved"?"active":""}`} onClick={() => setActiveTab("saved")}>
          <span>🔖</span> Saved
        </button>
        <button className={`profile-tab ${activeTab==="tagged"?"active":""}`} onClick={() => setActiveTab("tagged")}>
          <span>🏷️</span> Tagged
        </button>
      </div>

      {/* Grid */}
      <div className="profile-grid">
        {GRID_POSTS.map(post => (
          <div key={post.id} className="profile-grid-item" onClick={() => setSelectedPost(post)}>
            <img src={post.image} alt="" loading="lazy" />
            <div className="profile-grid-overlay">
              <span>❤️ {(post.likes/1000).toFixed(1)}K</span>
              <span>💬 {post.comments}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(false)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Edit Profile</h3>
              <button onClick={() => setEditing(false)}>✕</button>
            </div>
            <div className="edit-avatar-section">
              <img src={editForm.avatar} alt="" className="edit-avatar" />
              <button className="edit-avatar-btn">Change Photo</button>
            </div>
            <div className="edit-form">
              {[["name","Name"],["username","Username"],["bio","Bio"]].map(([field, label]) => (
                <div key={field} className="edit-field">
                  <label>{label}</label>
                  {field === "bio"
                    ? <textarea className="edit-input" value={editForm[field]||""} onChange={e => setEditForm(f=>({...f,[field]:e.target.value}))} rows={3} />
                    : <input className="edit-input" value={editForm[field]||""} onChange={e => setEditForm(f=>({...f,[field]:e.target.value}))} />
                  }
                </div>
              ))}
            </div>
            <div className="edit-actions">
              <button className="edit-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
              <button className="edit-save-btn" onClick={saveProfile}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="post-modal" onClick={e => e.stopPropagation()}>
            <img src={selectedPost.image} alt="" className="post-modal-img" />
            <div className="post-modal-info">
              <div className="post-modal-header">
                <img src={profile.avatar} alt="" className="post-modal-avatar" />
                <span className="post-modal-username">{profile.username}</span>
                <button className="post-modal-close" onClick={() => setSelectedPost(null)}>✕</button>
              </div>
              <div className="post-modal-actions">
                <button>❤️ {(selectedPost.likes/1000).toFixed(1)}K</button>
                <button>💬 {selectedPost.comments}</button>
                <button>↗️ Share</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}