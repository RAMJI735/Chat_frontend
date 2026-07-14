'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Slider from './Slider';
import { ChatInterface } from './ChatInterface';

function LandingPage({ socket, currentUser }) {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const hasConnectedBefore = React.useRef(false);
    const hasReceivedInitialList = React.useRef(false);
    const disconnectTimeoutRef = React.useRef(null);

    // 📦 Per-user conversations: { [socketId]: [{ id, text, sender, time }] }
    const [conversations, setConversations] = useState({});
    // 🔴 Unread counts: { [socketId]: number }
    const [unreadCounts, setUnreadCounts] = useState({});

    // Helper to append a message to a specific conversation
    const addMessageToConversation = useCallback((senderSocketId, msg) => {
        setConversations((prev) => ({
            ...prev,
            [senderSocketId]: [...(prev[senderSocketId] || []), msg]
        }));
    }, []);

    useEffect(() => {
        if (!socket) return;

        // If already connected when effect runs, join immediately
        if (socket.connected) {
            setIsConnected(true);
            hasConnectedBefore.current = true;
            socket.emit("join", currentUser);
        }

        const onConnect = () => {
            setIsConnected(true);
            setConnectionError(null);
            hasConnectedBefore.current = true;
            if (disconnectTimeoutRef.current) {
                clearTimeout(disconnectTimeoutRef.current);
                disconnectTimeoutRef.current = null;
            }
            // ⚡ Re-emit join on every (re)connect so the user is always registered
            socket.emit("join", currentUser);
        };

        const onDisconnect = (reason) => {
            setIsConnected(false);
            console.log("Socket disconnected:", reason);
            // If reconnection doesn't happen within 12s, clear stale users
            disconnectTimeoutRef.current = setTimeout(() => {
                setOnlineUsers([]);
            }, 12000);
        };

        const onConnectError = (err) => {
            console.error("Socket connection error:", err.message);
            setConnectionError(err.message || "Connection failed");
        };

        const onReconnectAttempt = () => {
            console.log("Reconnecting...");
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onConnectError);
        socket.io?.on("reconnect_attempt", onReconnectAttempt);

        // ✅ Online user events — only overwrite if we have real data, never clear with empty
        socket.on("online_users", (users) => {
            if (users && users.length > 0) {
                setOnlineUsers(users);
                hasReceivedInitialList.current = true;
            } else if (!hasReceivedInitialList.current) {
                // First response is empty — keep [] (shows loading/empty state)
                setOnlineUsers(users);
                hasReceivedInitialList.current = true;
            }
            // If we get [] after already having users, keep the old list
        });

        socket.on("user_online", (user) => {
            setOnlineUsers((prev) => {
                if (prev.some(u => u.socketId === user.socketId)) return prev;
                return [...prev, user];
            });
        });

        socket.on("user_offline", (user) => {
            setOnlineUsers((prev) => prev.filter((u) => u.socketId !== user.socketId));
            // Auto-deselect if the selected user goes offline
            setSelectedUser((currentSelected) => {
                if (currentSelected?.socketId === user.socketId) return null;
                return currentSelected;
            });
        });

        // 💬 GLOBAL message receiver — works even when no chat is open!
        socket.on("receive_message", (data) => {
            const msg = {
                id: Date.now() + Math.random(),
                text: data.text,
                sender: 'other',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            addMessageToConversation(data.senderId, msg);

            // If message is NOT from the currently selected user, bump unread count
            setSelectedUser((currentSelected) => {
                if (currentSelected?.socketId !== data.senderId) {
                    setUnreadCounts((prev) => ({
                        ...prev,
                        [data.senderId]: (prev[data.senderId] || 0) + 1
                    }));
                }
                return currentSelected; // don't change selection
            });
        });

        return () => {
            if (disconnectTimeoutRef.current) {
                clearTimeout(disconnectTimeoutRef.current);
            }
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onConnectError);
            socket.io?.off("reconnect_attempt", onReconnectAttempt);
            socket.off("online_users");
            socket.off("user_online");
            socket.off("user_offline");
            socket.off("receive_message");
        };
    }, [socket, currentUser, addMessageToConversation]);

    // Select a user and clear their unread badge
    const handleSelectUser = useCallback((user) => {
        setSelectedUser(user);
        setUnreadCounts((prev) => ({
            ...prev,
            [user.socketId]: 0
        }));
    }, []);

    // Send a message from ChatInterface and store it in conversations
    const handleSendMessage = useCallback((text) => {
        if (!socket || !selectedUser) return;
        const msg = {
            id: Date.now() + Math.random(),
            text,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        addMessageToConversation(selectedUser.socketId, msg);
        socket.emit("send_message", {
            text,
            senderId: socket.id,
            receiverId: selectedUser.socketId
        });
    }, [socket, selectedUser, addMessageToConversation]);

    const currentMessages = selectedUser ? (conversations[selectedUser.socketId] || []) : [];

    // Determine connection phase for the status bar
    const connectionPhase = !hasConnectedBefore.current && !isConnected
        ? 'connecting'
        : hasConnectedBefore.current && !isConnected
        ? 'reconnecting'
        : connectionError
        ? 'error'
        : 'connected';

    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-[#0F172A] overflow-hidden">
            {/* Sidebar (Slider) */}
            <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E293B] shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-20 transition-all duration-300 ${selectedUser ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
                <Slider 
                    users={onlineUsers} 
                    currentSocketId={socket?.id} 
                    selectedUser={selectedUser} 
                    onSelectUser={handleSelectUser} 
                    isConnected={isConnected}
                    unreadCounts={unreadCounts}
                    connectionPhase={connectionPhase}
                    connectionError={connectionError}
                />
            </div>
            
            {/* Main Chat Area */}
            <div className={`flex-1 flex-col relative bg-transparent z-10 transition-all duration-300 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                {selectedUser ? (
                    <ChatInterface 
                        socket={socket}
                        selectedUser={selectedUser} 
                        messages={currentMessages}
                        onSendMessage={handleSendMessage}
                        onBack={() => setSelectedUser(null)}
                    />
                ) : (
                    <div className="flex-1 hidden md:flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
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