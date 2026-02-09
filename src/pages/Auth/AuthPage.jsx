// src/AuthPage.jsx
import React, { useState } from "react";
import "./AuthPage.css";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import logo from "./LOGO.jpg"; 

export default function AuthPage({ setUserLoggedIn }) {
  const [activeTab, setActiveTab] = useState("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const toggleTab = (tab) => {
    setError("");
    setActiveTab(tab);
    // Clear fields when switching
    setEmail(""); setPassword(""); setFirstName(""); setLastName(""); setPhone("");
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      setUserLoggedIn(true);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const database = getDatabase();

      // ✅ Save extra info in Realtime Database
      await set(ref(database, "users/" + user.uid), {
        firstName,
        lastName,
        phone,
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      setUserLoggedIn(true);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: "'Poppins', sans-serif",
      background: 'linear-gradient(135deg, #000000, #0f0f0f, #1a1a1a, #000000)',
      backgroundSize: 'cover',
      minHeight: '100vh'
    }}>
      <div className="auth-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: '40px',
        padding: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Left Branding Card */}
        <div className="branding-card" style={{
          flex: '1',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '20px',
          padding: '93px 30px',
          maxWidth: '450px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <div className="logo-circle" style={{
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  margin: '0 auto 20px',
  background: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden'
}}>
  <img 
    src={logo} 
    alt="Logo" 
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
</div>
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '20px',
            fontWeight: '700'
          }}>Welcome</h1>
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.6',
            textAlign: 'justify',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            It's all about PRAYAS
          </p>
        </div>

        {/* Right Auth Card */}
        <div className="auth-card" style={{
          flex: '1',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '20px',
          padding: '50px 30px',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)',
          color: 'white'
        }}>
          {/* Tabs */}
          <div className="tabs" style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '30px'
          }}>
            <button
              className={activeTab === "login" ? "active" : ""}
              onClick={() => toggleTab("login")}
              style={{
                background: activeTab === "login" ? 'rgba(255, 255, 255, 0.2)' : 'none',
                border: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                padding: '10px 20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '10px',
                color: 'white',
                boxShadow: activeTab === "login" ? '0 5px 15px rgba(255,255,255,0.2)' : 'none'
              }}
            >
              Login
            </button>
            <button
              className={activeTab === "signup" ? "active" : ""}
              onClick={() => toggleTab("signup")}
              style={{
                background: activeTab === "signup" ? 'rgba(255, 255, 255, 0.2)' : 'none',
                border: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                padding: '10px 20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '10px',
                color: 'white',
                boxShadow: activeTab === "signup" ? '0 5px 15px rgba(255,255,255,0.2)' : 'none'
              }}
            >
              Sign Up
            </button>
          </div>

          {error && <p className="error" style={{
            color: '#ff6b6b',
            fontSize: '0.85rem',
            textAlign: 'center',
            marginBottom: '10px'
          }}>{error}</p>}

          {activeTab === "login" ? (
            <form className="auth-form" onSubmit={handleLogin} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <h2 style={{
                textAlign: 'center',
                fontSize: '28px',
                marginBottom: '10px'
              }}>Sign In</h2>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                type="submit"
                className="gradient-btn"
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#6b73ff',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '16px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = 'black';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#6b73ff';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Login
              </button>

              <div className="login-link" style={{
                fontSize: '0.9rem',
                textAlign: 'center',
                marginTop: '10px'
              }}>
                Don't have an account? 
                <span
                  onClick={() => toggleTab("signup")}
                  style={{
                    color: '#6b73ff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginLeft: '5px'
                  }}
                >
                  Sign Up
                </span>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignup} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <h2 style={{
                textAlign: 'center',
                fontSize: '28px',
                marginBottom: '10px'
              }}>Create Account</h2>

              <div className="name-fields" style={{
                display: 'flex',
                gap: '10px'
              }}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                type="submit"
                className="gradient-btn"
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#6b73ff',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '16px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = 'black';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#6b73ff';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Sign Up
              </button>

              <div className="login-link" style={{
                fontSize: '0.9rem',
                textAlign: 'center',
                marginTop: '10px'
              }}>
                Already have an account? 
                <span
                  onClick={() => toggleTab("login")}
                  style={{
                    color: '#6b73ff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginLeft: '5px'
                  }}
                >
                  Sign In
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}