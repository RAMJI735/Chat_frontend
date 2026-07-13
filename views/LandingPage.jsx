'use client'
import React, { useState, useEffect } from 'react'
import Slider from './Slider';
import { ChatInterface } from './ChatInterface';

function LandingPage({ socket, currentUser }) {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (!socket) return;

        const onConnect = () => {
            socket.emit("join", currentUser);
        };

        if (socket.connected) {
            onConnect();
        }

        socket.on("connect", onConnect);

        const fetchOnlineUsers = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
                const res = await fetch(`${baseUrl}/api/users/online`);
                if (res.ok) {
                    const data = await res.json();
                    setOnlineUsers(data);
                }
            } catch (error) {
                console.error("Failed to fetch online users via API", error);
            }
        };

        fetchOnlineUsers();

        socket.on("online_users", () => {
            fetchOnlineUsers();
        });

        socket.on("user_online", (user) => {
            fetchOnlineUsers();
        });

        socket.on("user_offline", (user) => {
            fetchOnlineUsers();
            // Automatically deselect if the user goes offline
            setSelectedUser((currentSelected) => {
                if (currentSelected?.socketId === user.socketId) {
                    return null;
                }
                return currentSelected;
            });
        });

        return () => {
            socket.off("connect", onConnect);
            socket.off("online_users");
            socket.off("user_online");
            socket.off("user_offline");
        };
    }, [socket, currentUser]);

    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-[#0F172A] overflow-hidden">
            {/* Sidebar (Slider) */}
            <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E293B] shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-20 ${selectedUser ? 'hidden md:block' : 'block'}`}>
                <Slider 
                    users={onlineUsers} 
                    currentSocketId={socket?.id} 
                    selectedUser={selectedUser} 
                    onSelectUser={setSelectedUser} 
                />
            </div>
            
            {/* Main Chat Area */}
            <div className={`flex-1 flex-col relative bg-transparent z-10 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                {selectedUser ? (
                    <ChatInterface 
                        socket={socket} 
                        currentUser={currentUser} 
                        selectedUser={selectedUser} 
                        onBack={() => setSelectedUser(null)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <div className="w-24 h-24 mb-6 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30">
                            <svg className="w-10 h-10 text-indigo-400 dark:text-indigo-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Welcome, {currentUser}</h2>
                        <p className="text-sm">Select a user from the sidebar to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    )
}
    
export default LandingPage