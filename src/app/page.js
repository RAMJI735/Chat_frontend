'use client'
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import LandingPage from '../../views/LandingPage';

function page() {
  const [username, SetUsername] = useState("");
  const [socket, setSocket] = useState(null);
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = () => {
    if (username.trim()) {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
        const newSocket = io(socketUrl);
        setSocket(newSocket);
        setIsJoined(true);
    }
  };

  useEffect(() => {
    return () => {
        if (socket) socket.disconnect();
    }
  }, [socket]);

  if (isJoined && socket) {
      return <LandingPage socket={socket} currentUser={username} />
  }

  return (
    <div className='flex flex-col justify-center items-center w-full h-screen bg-gray-50 dark:bg-[#0F172A]'>
      <div className="bg-white dark:bg-[#1E293B] p-8 rounded-2xl shadow-lg flex flex-col items-center border border-gray-100 dark:border-gray-800">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
        </div>
        <h1 className='text-3xl font-bold mb-2 text-gray-800 dark:text-white'>SocketChat</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center text-sm">Enter a unique username to join the global chat room.</p>
        
        <input 
            className='border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl px-5 py-3 mb-4 w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-100 transition-all shadow-sm' 
            type="text" 
            placeholder="Your Username" 
            value={username} 
            onChange={(e) => SetUsername(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        />
        <button 
            onClick={handleJoin}
            className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 w-72 font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            disabled={!username.trim()}
        >
            Start Chatting
        </button>
      </div>
    </div>
  )
}

export default page