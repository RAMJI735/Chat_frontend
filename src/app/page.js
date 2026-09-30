'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../../views/LandingPage';

export default function Home() {
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Sync dark mode state with <html> on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  // When user is authenticated, pre-fill username
  useEffect(() => {
    if (isAuthenticated && user?.username) {
      setUsername(user.username);
    }
  }, [isAuthenticated, user]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('socketchat-theme', next ? 'dark' : 'light');
  };

  const handleJoin = async (userToJoin) => {
    const nameToUse = (userToJoin || username || "").trim();
    if (nameToUse && !isConnecting) {
      setIsConnecting(true);
      try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
        const newSocket = io(socketUrl, {
          withCredentials: true,
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000
        });
        setSocket(newSocket);
        setIsJoined(true);
        setIsConnecting(false);
      } catch (error) {
        console.error("Failed to connect:", error);
        setIsConnecting(false);
      }
    }
  };

  const handleLeaveChat = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setIsJoined(false);
    setIsConnecting(false);
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  if (isJoined && socket) {
    return (
      <LandingPage 
        socket={socket} 
        currentUser={username} 
        authUser={user}
        onLeaveChat={handleLeaveChat}
      />
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen min-h-[100dvh] w-full bg-base-200/50 p-4 sm:p-6 relative overflow-y-auto touch-scroll transition-colors duration-300">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 -left-20 w-72 sm:w-80 h-72 sm:h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none transform -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 -right-20 w-72 sm:w-80 h-72 sm:h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none transform translate-y-1/2"></div>

      {/* 🌙 Theme Toggle Button (DaisyUI btn-ghost btn-circle) */}
      <button
        type="button"
        onClick={toggleDark}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 safe-top btn btn-ghost btn-circle bg-base-100/70 backdrop-blur-md shadow-xs border border-base-300 z-50 text-base-content h-10 w-10 min-h-[40px]"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <svg className="w-5 h-5 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-base-content" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </button>

      {/* Main Container Card */}
      <div className="card w-full max-w-sm sm:max-w-md bg-base-100/90 backdrop-blur-xl shadow-2xl border border-base-300 z-10 transition-all duration-300 my-auto">
        <div className="card-body p-5 sm:p-8 flex flex-col items-center">
          {/* Brand Header */}
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/25 text-primary-content">
            <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 text-base-content tracking-tight text-center">
            Random Chat - Talk to Strangers Online
          </h1>
          <p className="text-base-content/60 mb-5 sm:mb-6 text-center text-xs sm:text-sm">
            Meet new people and start random 1-on-1 conversations online. Chat with strangers instantly from anywhere in the world.
          </p>

          {/* State 0: Checking active session (Prevents flash of login screen on refresh) */}
          {authLoading ? (
            <div className="w-full flex flex-col items-center justify-center py-8 sm:py-10 space-y-3.5">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-xs sm:text-sm text-base-content/60 font-medium animate-pulse">
                Restoring your session...
              </p>
            </div>
          ) : isAuthenticated && user ? (
            /* State 1: User is Logged In */
            <div className="w-full flex flex-col items-center space-y-3.5">
              <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-base-200/60 border border-base-300 flex items-center gap-3">
                <div className="avatar online flex-shrink-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}`}
                      alt={user.username}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-base-content text-sm sm:text-base truncate">
                      {user.fullName || user.username}
                    </h3>
                    <span className="badge badge-success badge-xs uppercase font-bold">
                      Online
                    </span>
                  </div>
                  <p className="text-xs text-primary font-medium truncate">
                    @{user.username}
                  </p>
                  {user.email && (
                    <p className="text-[11px] text-base-content/50 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => handleJoin(user.username)}
                disabled={isConnecting}
                className="btn btn-primary w-full shadow-md shadow-primary/25 text-sm sm:text-base flex items-center justify-center gap-2 h-11 min-h-[44px]"
              >
                {isConnecting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    Connecting to Chat...
                  </span>
                ) : (
                  <>
                    <span>Enter Chat as @{user.username}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              <button
                onClick={logout}
                className="btn btn-ghost btn-xs text-base-content/60 hover:text-error transition-colors flex items-center gap-1.5 py-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out / switch account
              </button>
            </div>
          ) : (
            /* State 2: Not logged in — Provide Login / Signup buttons + Guest option */
            <div className="w-full space-y-3.5">
              {/* Primary Action Buttons: Log In & Sign Up */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="btn btn-primary text-xs sm:text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 h-11 min-h-[44px]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-outline text-xs sm:text-sm border-base-300 hover:border-primary flex items-center justify-center gap-1.5 h-11 min-h-[44px]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Sign Up
                </Link>
              </div>

              {/* DaisyUI Divider */}
              <div className="divider text-[11px] text-base-content/40 uppercase font-medium my-0.5">
                or continue as guest
              </div>

              {/* Quick Guest Join */}
              <div className="space-y-2.5 pt-0.5">
                <input 
                  className="input input-bordered w-full text-sm focus:input-primary bg-base-200/40 h-11 min-h-[44px]" 
                  type="text" 
                  placeholder="Choose guest username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  autoComplete="off"
                  maxLength={30}
                />
                
                <button 
                  onClick={() => handleJoin()}
                  disabled={!username.trim() || isConnecting}
                  className="btn btn-neutral w-full text-sm h-11 min-h-[44px]"
                >
                  {isConnecting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      Connecting...
                    </span>
                  ) : (
                    'Join as Guest'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Homepage SEO Content */}
      <section className="w-full max-w-2xl mt-8 mb-6 px-4 text-center z-10">
        <h2 className="text-xl font-bold mb-3 text-base-content">
          Random Chat Online
        </h2>

        <p className="text-sm text-base-content/60 leading-6">
          Random Chat Anyone lets you meet new people and have real-time
          conversations online. Start a random chat, talk to strangers,
          and make new connections from anywhere in the world.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-3 text-base-content">
          How Random Chat Works
        </h2>

        <p className="text-sm text-base-content/60 leading-6">
          Choose a username and join the chat. Start a real-time 1-on-1
          conversation and meet someone new online.
        </p>
      </section>
      
      {/* Footer */}
      <div className="flex items-center gap-2 sm:gap-3 text-base-content/40 text-[11px] sm:text-xs mt-4 sm:mt-6 text-center safe-bottom">
        <span>Free</span>
        <span>&bull;</span>
        <span>Real-time</span>
        <span>&bull;</span>
        <span>Mobile Optimized</span>
      </div>
    </div>
  );
}