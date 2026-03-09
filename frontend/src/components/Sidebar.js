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

export default function Sidebar({ activePage, onNavigate, theme, onToggleTheme, user }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => onNavigate("home")} style={{cursor:"pointer"}}>
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
            {item.page === "notifications" && (
              <span className="nav-badge">3</span>
            )}
            {item.page === "messages" && (
              <span className="nav-badge">5</span>
            )}
          </button>
        ))}

        <button className="sidebar-nav-item" onClick={onToggleTheme}>
          <span className="nav-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
          <span className="nav-label">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </nav>

      <button className="sidebar-profile" onClick={() => onNavigate("profile")}>
        <img src={user?.avatar || "https://i.pravatar.cc/150?img=33"} alt="Profile" className="sidebar-avatar" />
        <div className="sidebar-profile-info">
          <span className="sidebar-username">{user?.username || "you"}</span>
          <span className="sidebar-name">View Profile</span>
        </div>
      </button>
    </aside>
  );
}