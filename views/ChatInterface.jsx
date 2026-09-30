'use client';

import React, { useState, useEffect, useRef } from 'react';

export function ChatInterface({ 
    partner, 
    messages = [], 
    onSendMessage, 
    onNextPartner, 
    onLeaveChat, 
    isTyping = false, 
    matchState = 'connected',
    onSendTyping,
    onSendStopTyping,
    onOpenMenu
}) {
    const [inputValue, setInputValue] = useState('');
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const isPartnerActive = matchState === 'connected';
    const avatarSeed = partner?.username ? partner.username.replace(/\s+/g, '') : 'stranger';
    const partnerAvatar = partner?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Auto-focus input on connection (on desktop/tablet, avoid aggressive focus on mobile to prevent unwanted keyboard popup)
    useEffect(() => {
        if (isPartnerActive && window.innerWidth >= 768) {
            inputRef.current?.focus();
        }
    }, [partner?._id, partner?.id, partner?.socketId, isPartnerActive]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (!isPartnerActive) return;

        if (onSendTyping) onSendTyping();

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (onSendStopTyping) onSendStopTyping();
        }, 1500);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (inputValue.trim() && isPartnerActive) {
            onSendMessage(inputValue.trim());
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (onSendStopTyping) onSendStopTyping();
            setInputValue('');
            // Keep focus if on desktop
            if (window.innerWidth >= 768) {
                inputRef.current?.focus();
            }
        }
    };

    // Keyboard shortcut: Esc to Skip/Next
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isPartnerActive) {
                    onNextPartner();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPartnerActive, onNextPartner]);

    return (
        <div className="flex flex-col h-full w-full bg-base-200/40 relative overflow-hidden">
            {/* 📱 Mobile Optimized Top Bar */}
            <div className="px-2.5 sm:px-4 md:px-6 py-2 sm:py-3 bg-base-100 border-b border-base-300 shadow-xs flex items-center justify-between z-10 safe-top flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
                    {/* Menu Button for Mobile */}
                    {onOpenMenu && (
                        <button
                            type="button"
                            onClick={onOpenMenu}
                            className="md:hidden btn btn-ghost btn-circle btn-sm -ml-1 text-base-content/70"
                            aria-label="Open menu and rules"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}

                    <div className={`avatar ${isPartnerActive ? 'online' : 'offline'} flex-shrink-0`}>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-primary/40 ring-offset-base-100 ring-offset-1 sm:ring-offset-2">
                            <img src={partnerAvatar} alt={partner?.username || 'Stranger'} />
                        </div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h2 className="font-bold text-base-content text-xs sm:text-sm md:text-base truncate">
                                {partner?.username || 'Stranger'}
                            </h2>
                            {partner?.country && (
                                <span className="badge badge-xs sm:badge-sm badge-outline text-[9px] sm:text-[10px] hidden xs:inline-flex">
                                    {partner.country}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] sm:text-xs leading-none">
                            {isPartnerActive ? (
                                <span className="text-success font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                                    <span>Connected</span>
                                </span>
                            ) : (
                                <span className="text-error font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-error rounded-full"></span>
                                    <span>Stranger Left</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls (Next & Leave) — Compact & Finger-Friendly */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <button
                        onClick={onNextPartner}
                        className="btn btn-warning btn-sm gap-1 shadow-xs text-xs font-semibold px-2.5 sm:px-3 h-9 min-h-[36px]"
                        title="Skip stranger and find next (Esc)"
                    >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                        <span>Next</span>
                        <kbd className="kbd kbd-xs hidden lg:inline-flex bg-base-100/50">Esc</kbd>
                    </button>

                    <button
                        onClick={onLeaveChat}
                        className="btn btn-ghost btn-sm text-error hover:bg-error/10 px-2 sm:px-3 h-9 min-h-[36px]"
                        title="Stop chat"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="hidden sm:inline">Stop</span>
                    </button>
                </div>
            </div>

            {/* 📱 Messages Area with Smooth Touch Momentum */}
            <div className="flex-1 overflow-y-auto px-2.5 sm:px-4 md:px-6 py-3 sm:py-4 space-y-2.5 sm:space-y-3.5 touch-scroll">
                {/* Intro Notification Banner */}
                <div className="text-center my-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-100 border border-base-300 shadow-xs text-[11px] sm:text-xs text-base-content/70">
                        <span>💬 You are chatting with a stranger. Say Hi!</span>
                    </div>
                </div>

                {messages.map((msg) => {
                    if (msg.sender === 'system') {
                        return (
                            <div key={msg.id} className="text-center my-1.5 animate-fadeIn">
                                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-base-300/60 text-base-content/70 text-[11px] sm:text-xs">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    const isMe = msg.sender === 'me';
                    return (
                        <div 
                            key={msg.id} 
                            className={`chat ${isMe ? 'chat-end' : 'chat-start'} animate-fadeIn`}
                        >
                            <div className="chat-image avatar hidden xs:inline-flex">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-1 ring-base-300">
                                    <img
                                        src={
                                            isMe
                                                ? `https://api.dicebear.com/7.x/bottts/svg?seed=me`
                                                : partnerAvatar
                                        }
                                        alt={isMe ? 'You' : 'Stranger'}
                                    />
                                </div>
                            </div>

                            <div className="chat-header text-[11px] opacity-60 mb-0.5">
                                {isMe ? 'You' : (partner?.username || 'Stranger')}
                                <time className="text-[9px] sm:text-[10px] opacity-60 ml-1">{msg.time}</time>
                            </div>

                            <div 
                                className={`chat-bubble text-xs sm:text-sm md:text-[15px] shadow-xs leading-relaxed break-words max-w-[85%] sm:max-w-[75%] px-3 py-2 sm:px-4 sm:py-2.5 ${
                                    isMe
                                        ? 'chat-bubble-primary text-primary-content'
                                        : 'bg-base-100 text-base-content border border-base-300/70'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    );
                })}

                {/* Partner Typing Indicator */}
                {isTyping && isPartnerActive && (
                    <div className="chat chat-start animate-fadeIn">
                        <div className="chat-image avatar hidden xs:inline-flex">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-1 ring-base-300">
                                <img src={partnerAvatar} alt="Stranger" />
                            </div>
                        </div>
                        <div className="chat-bubble bg-base-100 text-base-content border border-base-300/70 py-1.5 px-3 flex items-center gap-1.5">
                            <span className="text-[11px] sm:text-xs text-base-content/70">{partner?.username || 'Stranger'} is typing</span>
                            <span className="loading loading-dots loading-xs text-primary"></span>
                        </div>
                    </div>
                )}

                {/* Partner Left Alert Banner */}
                {!isPartnerActive && (
                    <div className="p-3 sm:p-4 rounded-2xl bg-base-100 border border-warning/30 shadow-md my-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left animate-fadeIn">
                        <div>
                            <h4 className="font-bold text-base-content text-xs sm:text-sm md:text-base">
                                Stranger has disconnected
                            </h4>
                            <p className="text-[11px] sm:text-xs text-base-content/60">
                                Find a new stranger instantly or return to menu.
                            </p>
                        </div>
                        <button
                            onClick={onNextPartner}
                            className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto shadow-md shadow-primary/20 gap-1.5"
                        >
                            <span>Find Next Stranger</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 📱 Bottom Input Form with Safe Area Inset for iOS */}
            <div className="p-2 sm:p-3 md:p-4 bg-base-100 border-t border-base-300 shadow-sm z-10 safe-bottom-input flex-shrink-0">
                <form onSubmit={handleSend} className="join w-full shadow-xs">
                    <button
                        type="button"
                        onClick={onNextPartner}
                        className="btn btn-outline btn-warning join-item px-2.5 sm:px-3 text-xs sm:text-sm h-11 min-h-[44px]"
                        title="Skip to next (Esc)"
                    >
                        Skip
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        disabled={!isPartnerActive}
                        placeholder={
                            isPartnerActive 
                                ? `Message ${partner?.username || 'Stranger'}...`
                                : 'Stranger left. Click "Find Next"'
                        }
                        className="input input-bordered join-item flex-1 bg-base-200/40 focus:bg-base-100 text-sm focus:input-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed h-11 min-h-[44px]"
                        autoComplete="off"
                        maxLength={1000}
                    />

                    <button
                        type="submit"
                        disabled={!inputValue.trim() || !isPartnerActive}
                        className="btn btn-primary join-item px-3.5 sm:px-5 h-11 min-h-[44px]"
                        aria-label="Send message"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatInterface;
