import React, { useState, useRef, useEffect } from "react";
import "./MessagesPage.css";

const CHATS = [
  { id:1, name:"Alyssa Murphy", avatar:"https://i.pravatar.cc/150?img=1", lastMsg:"Hey! How are you?", time:"2m", unread:2 },
  { id:2, name:"Brian Kuhic", avatar:"https://i.pravatar.cc/150?img=2", lastMsg:"Did you see that post?", time:"15m", unread:0 },
  { id:3, name:"Carla Stone", avatar:"https://i.pravatar.cc/150?img=3", lastMsg:"Let's catch up soon 🙌", time:"1h", unread:5 },
  { id:4, name:"David Park", avatar:"https://i.pravatar.cc/150?img=4", lastMsg:"Sent a photo", time:"3h", unread:0 },
  { id:5, name:"Elena Ross", avatar:"https://i.pravatar.cc/150?img=5", lastMsg:"Thanks! 😊", time:"1d", unread:0 },
  { id:6, name:"Frank Liu", avatar:"https://i.pravatar.cc/150?img=6", lastMsg:"That was amazing!", time:"2d", unread:1 },
];

const INITIAL_MESSAGES = {
  1: [
    { id:1, from:"them", text:"Hey! How are you?", time:"2m ago" },
    { id:2, from:"me", text:"I'm great! Just scrolling through the feed 😄", time:"1m ago" },
  ],
  2: [
    { id:1, from:"them", text:"Did you see that post?", time:"15m ago" },
  ],
  3: [
    { id:1, from:"them", text:"Let's catch up soon 🙌", time:"1h ago" },
    { id:2, from:"me", text:"Definitely! How about this weekend?", time:"45m ago" },
    { id:3, from:"them", text:"Works for me!", time:"30m ago" },
  ],
};

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(CHATS[0]);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text: input, time: "just now" };
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg]
    }));
    setInput("");
  };

  const chatMessages = messages[activeChat.id] || [];

  return (
    <div className="messages-page">
      <div className="messages-sidebar">
        <div className="messages-header">
          <h2>Messages</h2>
          <button className="new-chat-btn">✏️</button>
        </div>
        <div className="messages-search">
          <input placeholder="🔍 Search messages..." className="msg-search-input" />
        </div>
        <div className="chat-list">
          {CHATS.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${activeChat.id === chat.id ? "active" : ""}`}
              onClick={() => setActiveChat(chat)}
            >
              <div className="chat-avatar-wrap">
                <img src={chat.avatar} alt="" className="chat-avatar" />
                <div className="chat-online-dot" />
              </div>
              <div className="chat-info">
                <div className="chat-name-row">
                  <span className="chat-name">{chat.name}</span>
                  <span className="chat-time">{chat.time}</span>
                </div>
                <div className="chat-last-row">
                  <span className="chat-last-msg">{chat.lastMsg}</span>
                  {chat.unread > 0 && <span className="chat-unread">{chat.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-window">
        <div className="chat-window-header">
          <img src={activeChat.avatar} alt="" className="chat-header-avatar" />
          <div className="chat-header-info">
            <span className="chat-header-name">{activeChat.name}</span>
            <span className="chat-header-status">🟢 Active now</span>
          </div>
          <div className="chat-header-actions">
            <button className="chat-header-btn">📞</button>
            <button className="chat-header-btn">📹</button>
            <button className="chat-header-btn">ℹ️</button>
          </div>
        </div>

        <div className="chat-messages">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`message-bubble ${msg.from === "me" ? "mine" : "theirs"}`}>
              {msg.from === "them" && <img src={activeChat.avatar} alt="" className="msg-avatar" />}
              <div className="message-content">
                <span className="message-text">{msg.text}</span>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-row">
          <button className="chat-input-btn">😊</button>
          <input
            className="chat-input"
            placeholder="Message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button className="chat-input-btn">🖼️</button>
          <button className="chat-send-btn" onClick={sendMessage} disabled={!input.trim()}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}