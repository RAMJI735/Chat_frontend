'use client'
import React, { useState, useEffect, useRef } from 'react';

export function ChatInterface({ socket, selectedUser, messages, onSendMessage, onBack }) {
    const avatarSeed = selectedUser.username.replace(/\s+/g, '');
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Auto-focus input when switching users
    useEffect(() => {
        inputRef.current?.focus();
    }, [selectedUser.socketId]);

    // ✅ Still listen for typing events locally (they're per-chat)
    useEffect(() => {
        if (!socket) return;

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

        socket.on("typing", handleTyping);
        socket.on("stop_typing", handleStopTyping);

        return () => {
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
            onSendMessage(inputValue);
            socket?.emit("stop_typing", { senderId: socket.id, receiverId: selectedUser.socketId });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setInputValue('');
            inputRef.current?.focus();
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#f8fafc] dark:bg-[#0F172A]">
            {/* Header — more compact on mobile */}
            <div className="flex items-center justify-between px-2 md:px-6 py-2 md:py-4 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 safe-top">
                <div className="flex items-center gap-1.5 md:gap-4 min-w-0 flex-1">
                    {/* Mobile Back Button — bigger touch target */}
                    <button 
                        onClick={onBack}
                        className="md:hidden p-2 -ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:bg-gray-200 dark:active:bg-gray-700 flex-shrink-0"
                        aria-label="Back to users list"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="relative flex-shrink-0">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                            alt="User avatar"
                            className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-indigo-500 object-cover bg-indigo-50"
                        />
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 md:w-3 md:h-3 bg-green-500 border-2 border-white dark:border-[#1E293B] rounded-full"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm md:text-lg font-semibold text-gray-800 dark:text-white truncate">{selectedUser.username}</h2>
                        <p className="text-[10px] md:text-sm text-green-500 font-medium">Online</p>
                    </div>
                </div>
            </div>

            {/* Messages Area — more padding on sides for mobile */}
            <div className="flex-1 overflow-y-auto px-2 md:px-6 py-3 md:py-6 space-y-3 md:space-y-6 scroll-smooth">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8 md:mt-10 px-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                            <svg className="w-6 h-6 md:w-7 md:h-7 text-indigo-400 dark:text-indigo-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <p className="text-xs md:text-base">No messages yet. Send a message to start the conversation!</p>
                    </div>
                )}
                
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`max-w-[90%] md:max-w-[70%] px-3 md:px-5 py-2 md:py-3 rounded-2xl shadow-sm ${
                                msg.sender === 'me'
                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                : 'bg-white dark:bg-[#1E293B] text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-800'
                            }`}
                        >
                            <p className="text-sm md:text-[15px] leading-relaxed break-words">{msg.text}</p>
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1 px-1">{msg.time}</span>
                    </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex flex-col items-start">
                        <div className="bg-white dark:bg-[#1E293B] px-3 md:px-5 py-2.5 md:py-4 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1 px-1">{selectedUser.username} is typing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area — safe area bottom for mobile */}
            <div className="p-2 md:p-4 pt-1.5 md:pt-4 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 safe-bottom">
                <form onSubmit={handleSend} className="flex items-center gap-1.5 md:gap-3">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder={`Message ${selectedUser.username}...`}
                            className="w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-full pl-4 md:pl-5 pr-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                            autoComplete="off"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className={`p-2 md:p-3 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                            inputValue.trim()
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                        aria-label="Send message"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </form>
            </div>
        </div>
    )
}
