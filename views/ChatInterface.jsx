'use client'
import React, { useState, useEffect, useRef } from 'react';

export function ChatInterface({ socket, currentUser, selectedUser, onBack }) {
    const avatarSeed = selectedUser.username.replace(/\s+/g, '');
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Clear messages when switching users
    useEffect(() => {
        setMessages([]);
        setIsTyping(false);
    }, [selectedUser.socketId]);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (data) => {
            // Only add message if it's from the currently selected user
            if (data.senderId === selectedUser.socketId) {
                setMessages((prevMessages) => [...prevMessages, {
                    id: Date.now() + Math.random(),
                    text: data.text,
                    sender: 'other',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        };

        const handleTyping = (data) => {
            if (data.senderId === selectedUser.socketId) {
                setIsTyping(true);
            }
        };

        const handleStopTyping = (data) => {
            if (data.senderId === selectedUser.socketId) {
                setIsTyping(false);
            }
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("typing", handleTyping);
        socket.on("stop_typing", handleStopTyping);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("typing", handleTyping);
            socket.off("stop_typing", handleStopTyping);
        };
    }, [socket, selectedUser.socketId]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        
        if (socket) {
            socket.emit("typing", { senderId: socket.id, receiverId: selectedUser.socketId });
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stop_typing", { senderId: socket.id, receiverId: selectedUser.socketId });
            }, 2000);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            const newMsg = {
                id: Date.now() + Math.random(),
                text: inputValue,
                sender: 'me',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages([...messages, newMsg]);
            
            if (socket) {
                socket.emit("send_message", { text: inputValue, senderId: socket.id, receiverId: selectedUser.socketId });
                socket.emit("stop_typing", { senderId: socket.id, receiverId: selectedUser.socketId });
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            }
            
            setInputValue('');
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#f8fafc] dark:bg-[#0F172A]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-800 shadow-sm z-10">
                <div className="flex items-center gap-3 md:gap-4">
                    {/* Mobile Back Button */}
                    <button 
                        onClick={onBack}
                        className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Back to users list"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="relative">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                            alt="User avatar"
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-indigo-500 object-cover bg-indigo-50"
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 border-2 border-white dark:border-[#1E293B] rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{selectedUser.username}</h2>
                        <p className="text-sm text-green-500 font-medium">Online</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                        <p>No messages yet. Send a message to start the conversation!</p>
                    </div>
                )}
                
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-sm ${msg.sender === 'me'
                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                : 'bg-white dark:bg-[#1E293B] text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-800'
                                }`}
                        >
                            <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 px-1">{msg.time}</span>
                    </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex flex-col items-start">
                        <div className="bg-white dark:bg-[#1E293B] px-5 py-4 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 px-1">{selectedUser.username} is typing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder={`Message ${selectedUser.username}...`}
                            className="w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className={`p-3 rounded-full flex items-center justify-center transition-all ${inputValue.trim()
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </form>
            </div>
        </div>
    )
}

