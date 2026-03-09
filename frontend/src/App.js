import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import VirtualFeed from "./components/VirtualFeed";
import SearchPage from "./components/SearchPage";
import ReelsPage from "./components/ReelsPage";
import MessagesPage from "./components/MessagesPage";
import NotificationsPage from "./components/NotificationsPage";
import ProfilePage from "./components/ProfilePage";
import LoginPage from "./components/LoginPage";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [theme, setTheme] = useState("dark");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme === "light" ? "light" : "");
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={(user) => { setCurrentUser(user); setIsLoggedIn(true); }} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "search": return <SearchPage />;
      case "reels": return <ReelsPage />;
      case "messages": return <MessagesPage />;
      case "notifications": return <NotificationsPage />;
      case "profile": return <ProfilePage user={currentUser} />;
      default: return <VirtualFeed />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={currentUser}
      />
      <main className="app-main">
        {renderPage()}
      </main>
      {activePage === "home" && (
        <aside className="app-right-panel">
          <div className="right-panel-user">
            <img src={currentUser?.avatar} alt="" className="right-panel-avatar" />
            <div className="right-panel-user-info">
              <span className="right-panel-username">{currentUser?.username}</span>
              <span className="right-panel-name">{currentUser?.name}</span>
            </div>
            <button className="right-panel-switch">Switch</button>
          </div>
          <div className="right-suggestions-header">
            <span className="suggestions-title">Suggested for you</span>
            <button className="see-all-btn">See All</button>
          </div>
          {Array.from({length:5}).map((_,i) => (
            <SuggestionItem key={i} index={i} />
          ))}
          <div className="right-panel-footer">
            <p>About · Help · Privacy · Terms · Locations</p>
            <p>© 2026 ScrollFeed</p>
          </div>
        </aside>
      )}
    </div>
  );
}

function SuggestionItem({ index }) {
  const [following, setFollowing] = useState(false);
  const names = ["alex_photo", "travel.diaries", "foodie_world", "tech.daily", "art.studio"];
  const subs = ["Followed by riyaz", "New to ScrollFeed", "Popular creator", "Suggested for you", "You might know"];
  return (
    <div className="suggestion-item">
      <img src={`https://i.pravatar.cc/150?img=${index+15}`} alt="" className="suggestion-avatar" />
      <div className="suggestion-info">
        <span className="suggestion-username">{names[index]}</span>
        <span className="suggestion-sub">{subs[index]}</span>
      </div>
      <button
        className={`suggestion-follow ${following ? "following" : ""}`}
        onClick={() => setFollowing(f => !f)}
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}