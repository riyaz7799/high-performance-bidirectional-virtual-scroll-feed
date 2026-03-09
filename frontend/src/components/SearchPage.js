import React, { useState } from "react";
import "./SearchPage.css";

const TOPICS = ["Nature","Travel","Food","Tech","Art","Music","Sports","Fashion","Science","Gaming"];

const RESULTS = Array.from({length: 20}, (_, i) => ({
  id: i+1,
  image: `https://picsum.photos/seed/${i*17+3}/300/300`,
  author: `user_${1000 + i * 13}`,
  likes: Math.floor(Math.random() * 50000),
}));

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search posts, users, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearched(true)}
          />
          {query && (
            <button className="search-clear" onClick={() => { setQuery(""); setSearched(false); }}>✕</button>
          )}
        </div>
        {!searched && (
          <button className="search-btn" onClick={() => setSearched(true)}>Search</button>
        )}
      </div>

      {!searched ? (
        <>
          <h2 className="search-section-title">Explore Topics</h2>
          <div className="search-topics">
            {TOPICS.map((t, i) => (
              <button key={t} className="topic-chip" style={{"--i": i}} onClick={() => { setQuery(t); setSearched(true); }}>
                {t}
              </button>
            ))}
          </div>
          <h2 className="search-section-title">Trending</h2>
          <div className="search-grid">
            {RESULTS.map((r) => (
              <div key={r.id} className="search-grid-item">
                <img src={r.image} alt="" loading="lazy" />
                <div className="search-grid-overlay">
                  <span>❤️ {(r.likes/1000).toFixed(1)}K</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="search-section-title">Results for "{query}"</h2>
          <div className="search-grid">
            {RESULTS.map((r) => (
              <div key={r.id} className="search-grid-item">
                <img src={r.image} alt="" loading="lazy" />
                <div className="search-grid-overlay">
                  <span>❤️ {(r.likes/1000).toFixed(1)}K</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}