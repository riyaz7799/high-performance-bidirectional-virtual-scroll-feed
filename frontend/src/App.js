import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import VirtualFeed from "./components/VirtualFeed";
import SearchPage from "./components/SearchPage";
import ReelsPage from "./components/ReelsPage";
import MessagesPage from "./components/MessagesPage";
import NotificationsPage from "./components/NotificationsPage";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("home");

  const renderPage = () => {
    switch (activePage) {
      case "search": return <SearchPage />;
      case "reels": return <ReelsPage />;
      case "messages": return <MessagesPage />;
      case "notifications": return <NotificationsPage />;
      default: return (
        <>
          <VirtualFeed />
        </>
      );
    }
  };

  return (
    <div className="app">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="app-main">
        {renderPage()}
      </main>
      {activePage === "home" && (
        <aside className="app-right-panel">
          <div>
            <h3 className="suggestions-title">Suggested for you</h3>
            {Array.from({length:5}).map((_,i) => (
              <div key={i} className="suggestion-item">
                <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="" className="suggestion-avatar" />
                <div className="suggestion-info">
                  <span className="suggestion-username">user_{1000+i*37}</span>
                  <span className="suggestion-sub">Suggested for you</span>
                </div>
                <button className="suggestion-follow">Follow</button>
              </div>
            ))}
          </div>
          <div className="right-panel-footer"><p>© 2026 ScrollFeed · About · Help · Privacy</p></div>
        </aside>
      )}
    </div>
  );
}