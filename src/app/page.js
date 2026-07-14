'use client'
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import LandingPage from '../../views/LandingPage';

function page() {
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleJoin = async () => {
    if (username.trim() && !isConnecting) {
        setIsConnecting(true);
        try {
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
            const newSocket = io(socketUrl, {
                // ⚡ Faster reconnection for production
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 10000
            });
            setSocket(newSocket);
            setIsJoined(true);
        } catch (error) {
            console.error("Failed to connect:", error);
            setIsConnecting(false);
        }
    }
  };

  useEffect(() => {
    return () => {
        if (socket) {
            socket.disconnect();
        }
    }
  }, [socket]);

  if (isJoined && socket) {
      return <LandingPage socket={socket} currentUser={username} />
  }

  return (
    <div className='flex flex-col justify-center items-center w-full h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-[#0F172A] dark:to-[#0a0f1e] p-4'>
      <div className="bg-white/80 dark:bg-[#1E293B]/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg flex flex-col items-center border border-gray-100 dark:border-gray-800 w-full max-w-sm transition-all duration-300">
        {/* Logo */}
        <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-5 md:mb-6">
            <svg className="w-7 h-7 md:w-8 md:h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
        </div>
        
        <h1 className='text-2xl md:text-3xl font-bold mb-1 text-gray-800 dark:text-white'>SocketChat</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 md:mb-8 text-center text-xs md:text-sm">Enter a username to join the global chat room.</p>
        
        <input 
            className='border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl px-4 md:px-5 py-2.5 md:py-3 mb-3 md:mb-4 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-100 transition-all shadow-sm text-sm md:text-base' 
            type="text" 
            placeholder="Your username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            autoComplete="off"
            maxLength={30}
            autoFocus
        />
        
        <button 
            onClick={handleJoin}
            disabled={!username.trim() || isConnecting}
            className='bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl px-6 py-2.5 md:py-3 w-full font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-sm md:text-base'
        >
            {isConnecting ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting...
                </span>
            ) : (
                'Start Chatting'
            )}
        </button>
      </div>
      
      {/* Footer */}
      <p className="text-gray-400 dark:text-gray-600 text-xs mt-8 text-center">
        Free &bull; Real-time &bull; Global
      </p>
    </div>
  )
}

export default page