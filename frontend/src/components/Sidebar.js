import React from "react";
import "./Sidebar.css";

const NAV = [
  { icon:"🏠", label:"Home", page:"home" },
  { icon:"🔍", label:"Search", page:"search" },
  { icon:"🎬", label:"Reels", page:"reels" },
  { icon:"💬", label:"Messages", page:"messages" },
  { icon:"❤️", label:"Notifications", page:"notifications" },
  { icon:"➕", label:"Create", page:"create" },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">⚡</span>
        <span className="sidebar-logo-text">ScrollFeed</span>
      </div>
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.label}
            className={`sidebar-nav-item ${activePage === item.page ? "active" : ""}`}
            onClick={() => onNavigate(item.page)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-profile">
        <img src="https://i.pravatar.cc/150?img=33" alt="Profile" className="sidebar-avatar" />
        <div className="sidebar-profile-info">
          <span className="sidebar-username">you</span>
          <span className="sidebar-name">Your Profile</span>
        </div>
      </div>
    </aside>
  );
}