import React, { useState } from "react";
import "./LoginPage.css";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username:"", password:"", email:"", name:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({...f, [e.target.name]: e.target.value}));

  const submit = async () => {
    setError("");
    if (!form.username || !form.password) { setError("Please fill all fields"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    onLogin({
      username: form.username,
      name: form.name || form.username,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random()*70)+1}`,
      bio: "Welcome to ScrollFeed! 🚀",
      followers: Math.floor(Math.random()*5000),
      following: Math.floor(Math.random()*500),
      posts: Math.floor(Math.random()*100),
    });
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-phone-mockup">
          <div className="phone-screen">
            {Array.from({length:4}).map((_,i) => (
              <div key={i} className="phone-post">
                <img src={`https://picsum.photos/seed/${i*33+1}/300/300`} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-logo">
            <span className="login-logo-icon">⚡</span>
            <span className="login-logo-text">ScrollFeed</span>
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="login-form">
            {mode === "signup" && (
              <>
                <input className="login-input" name="name" placeholder="Full Name" value={form.name} onChange={handle} />
                <input className="login-input" name="email" placeholder="Email" type="email" value={form.email} onChange={handle} />
              </>
            )}
            <input className="login-input" name="username" placeholder="Username" value={form.username} onChange={handle} />
            <input className="login-input" name="password" placeholder="Password" type="password" value={form.password} onChange={handle} onKeyDown={e => e.key === "Enter" && submit()} />

            <button className="login-btn" onClick={submit} disabled={loading}>
              {loading ? <span className="login-spinner" /> : mode === "login" ? "Log In" : "Sign Up"}
            </button>

            {mode === "login" && (
              <div className="login-divider"><span>OR</span></div>
            )}

            {mode === "login" && (
              <button className="login-demo-btn" onClick={() => onLogin({
                username: "riyaz7799",
                name: "Mohammad Riyaz",
                avatar: "https://i.pravatar.cc/150?img=33",
                bio: "Building cool stuff 🚀 | Frontend Dev",
                followers: 1247,
                following: 389,
                posts: 42,
              })}>
                🚀 Continue as Demo User
              </button>
            )}
          </div>

          <div className="login-switch-card">
            {mode === "login" ? (
              <p>Don't have an account? <button onClick={() => setMode("signup")}>Sign up</button></p>
            ) : (
              <p>Have an account? <button onClick={() => setMode("login")}>Log in</button></p>
            )}
          </div>

          {mode === "login" && (
            <p className="login-app-links">Get the app</p>
          )}
        </div>
      </div>
    </div>
  );
}