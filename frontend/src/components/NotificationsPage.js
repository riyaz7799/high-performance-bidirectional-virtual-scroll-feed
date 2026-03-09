import React, { useState } from "react";
import "./NotificationsPage.css";

const NOTIFS = [
  { id:1, type:"like", user:"Alyssa Murphy", avatar:"https://i.pravatar.cc/150?img=1", text:"liked your post", time:"2 minutes ago", postImg:"https://picsum.photos/seed/10/60/60", read:false },
  { id:2, type:"comment", user:"Brian Kuhic", avatar:"https://i.pravatar.cc/150?img=2", text:'commented: "This is amazing! 🔥"', time:"15 minutes ago", postImg:"https://picsum.photos/seed/20/60/60", read:false },
  { id:3, type:"follow", user:"Carla Stone", avatar:"https://i.pravatar.cc/150?img=3", text:"started following you", time:"1 hour ago", postImg:null, read:false },
  { id:4, type:"like", user:"David Park", avatar:"https://i.pravatar.cc/150?img=4", text:"liked your photo", time:"3 hours ago", postImg:"https://picsum.photos/seed/30/60/60", read:true },
  { id:5, type:"mention", user:"Elena Ross", avatar:"https://i.pravatar.cc/150?img=5", text:"mentioned you in a comment", time:"5 hours ago", postImg:"https://picsum.photos/seed/40/60/60", read:true },
  { id:6, type:"follow", user:"Frank Liu", avatar:"https://i.pravatar.cc/150?img=6", text:"started following you", time:"1 day ago", postImg:null, read:true },
  { id:7, type:"like", user:"Grace Kim", avatar:"https://i.pravatar.cc/150?img=7", text:"liked your reel", time:"1 day ago", postImg:"https://picsum.photos/seed/50/60/60", read:true },
  { id:8, type:"comment", user:"Henry Walsh", avatar:"https://i.pravatar.cc/150?img=8", text:'commented: "Love this! ❤️"', time:"2 days ago", postImg:"https://picsum.photos/seed/60/60/60", read:true },
  { id:9, type:"like", user:"Iris Chen", avatar:"https://i.pravatar.cc/150?img=9", text:"and 24 others liked your post", time:"2 days ago", postImg:"https://picsum.photos/seed/70/60/60", read:true },
  { id:10, type:"follow", user:"Jake Brown", avatar:"https://i.pravatar.cc/150?img=10", text:"started following you", time:"3 days ago", postImg:null, read:true },
];

const TYPE_ICON = { like:"❤️", comment:"💬", follow:"👤", mention:"@" };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(NOTIFS);
  const [filter, setFilter] = useState("all");
  const [following, setFollowing] = useState({});

  const markAllRead = () => setNotifs(n => n.map(x => ({...x, read:true})));
  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = filter === "all" ? notifs : notifs.filter(n => n.type === filter);

  return (
    <div className="notifs-page">
      <div className="notifs-header">
        <h2>Notifications</h2>
        {unreadCount > 0 && (
          <button className="mark-read-btn" onClick={markAllRead}>
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <div className="notifs-filters">
        {["all","like","comment","follow","mention"].map(f => (
          <button
            key={f}
            className={`notif-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : TYPE_ICON[f] + " " + f.charAt(0).toUpperCase() + f.slice(1) + "s"}
          </button>
        ))}
      </div>

      <div className="notifs-list">
        {filtered.length === 0 && (
          <div className="notifs-empty">
            <span>🔔</span>
            <p>No notifications yet</p>
          </div>
        )}
        {filtered.map(notif => (
          <div key={notif.id} className={`notif-item ${!notif.read ? "unread" : ""}`}
            onClick={() => setNotifs(n => n.map(x => x.id === notif.id ? {...x, read:true} : x))}>
            <div className="notif-avatar-wrap">
              <img src={notif.avatar} alt="" className="notif-avatar" />
              <span className="notif-type-icon">{TYPE_ICON[notif.type]}</span>
            </div>
            <div className="notif-content">
              <p className="notif-text">
                <strong>{notif.user}</strong> {notif.text}
              </p>
              <span className="notif-time">{notif.time}</span>
            </div>
            {notif.postImg && <img src={notif.postImg} alt="" className="notif-post-thumb" />}
            {notif.type === "follow" && (
              <button
                className={`notif-follow-btn ${following[notif.id] ? "following" : ""}`}
                onClick={e => { e.stopPropagation(); setFollowing(f => ({...f, [notif.id]: !f[notif.id]})); }}
              >
                {following[notif.id] ? "Following" : "Follow"}
              </button>
            )}
            {!notif.read && <div className="notif-unread-dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}