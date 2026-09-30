'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Slider from './Slider';
import { ChatInterface } from './ChatInterface';
import { API_URL } from '@/utils/auth';

function LandingPage({ socket, currentUser, authUser, onLeaveChat }) {
    // 🎲 Matchmaking State: 'idle' | 'searching' | 'connected' | 'partner_left'
    const [matchState, setMatchState] = useState('idle');
    const [matchId, setMatchId] = useState(null);
    const [partner, setPartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const [onlineCount, setOnlineCount] = useState(1);
    const [waitingMessage, setWaitingMessage] = useState('Looking for online users to connect...');
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    // Refs to avoid stale state in asynchronous socket listeners
    const matchIdRef = useRef(null);
    const partnerRef = useRef(null);

    // Synchronize refs with state
    useEffect(() => {
        matchIdRef.current = matchId;
    }, [matchId]);

    useEffect(() => {
        partnerRef.current = partner;
    }, [partner]);

    // Initial fetch of online count from REST API
    useEffect(() => {
        fetch(`${API_URL}/api/users/online`, { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                if (data.success && typeof data.onlineCount === 'number') {
                    setOnlineCount(data.onlineCount);
                }
            })
            .catch(() => {});
    }, []);

    // ⚡ Socket Events Integration
    useEffect(() => {
        if (!socket) return;

        const joinPayload = {
            userId: authUser?.id || authUser?._id,
            username: currentUser || authUser?.username
        };

        if (socket.connected) {
            socket.emit("join", joinPayload);
        }

        const onConnect = () => {
            socket.emit("join", joinPayload);
        };

        const onJoined = (data) => {
            console.log("Joined chat session:", data);
        };

        const onOnlineCount = ({ onlineCount: count }) => {
            if (typeof count === 'number') {
                setOnlineCount(count);
            }
        };

        const onWaitingForPartner = (data) => {
            setMatchState('searching');
            setWaitingMessage(data?.message || 'Looking for online users to connect...');
            setPartner(null);
            setMatchId(null);
            matchIdRef.current = null;
            partnerRef.current = null;
        };

        // Backend emits { matchId: match._id, user: { _id, username, avatar, country } }
        const onMatchFound = (data) => {
            const currentMatchId = data?.matchId || data?.roomId;
            const matchedPartner = data?.user || data?.partner;

            setMatchId(currentMatchId);
            matchIdRef.current = currentMatchId;
            setPartner(matchedPartner);
            partnerRef.current = matchedPartner;
            setMatchState('connected');
            setIsPartnerTyping(false);
            setIsMobileDrawerOpen(false); // Close mobile drawer when match is found

            // Ensure socket is joined to the match room
            if (currentMatchId) {
                socket.emit("join_match", { matchId: currentMatchId });
            }

            setMessages([
                {
                    id: 'sys_' + Date.now(),
                    text: `🎉 You are connected to ${matchedPartner?.username || 'a stranger'}! Say hello.`,
                    sender: 'system',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        };

        const onPartnerLeft = (data) => {
            setMatchState('partner_left');
            setIsPartnerTyping(false);
            setMessages((prev) => [
                ...prev,
                {
                    id: 'sys_' + Date.now(),
                    text: data?.message || 'Stranger skipped the chat.',
                    sender: 'system',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        };

        const onPartnerDisconnected = (data) => {
            setMatchState('partner_left');
            setIsPartnerTyping(false);
            setMessages((prev) => [
                ...prev,
                {
                    id: 'sys_' + Date.now(),
                    text: data?.message || 'Stranger disconnected.',
                    sender: 'system',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        };

        const onSearchCancelled = () => {
            setMatchState('idle');
            setPartner(null);
            setMatchId(null);
            matchIdRef.current = null;
            partnerRef.current = null;
        };

        const onChatLeft = () => {
            setMatchState('idle');
            setPartner(null);
            setMatchId(null);
            matchIdRef.current = null;
            partnerRef.current = null;
            setMessages([]);
        };

        const onReceiveMessage = (data) => {
            const text = data?.text || data?.message || '';
            if (!text) return;
            const msg = {
                id: Date.now() + Math.random(),
                text,
                sender: 'partner',
                time: new Date(data?.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, msg]);
        };

        const onTyping = () => {
            setIsPartnerTyping(true);
        };

        const onStopTyping = () => {
            setIsPartnerTyping(false);
        };

        const onErrorMessage = (data) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: 'sys_' + Date.now(),
                    text: `⚠️ ${data?.message || 'Server error'}`,
                    sender: 'system',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        };

        socket.on("connect", onConnect);
        socket.on("joined", onJoined);
        socket.on("online_count", onOnlineCount);
        socket.on("waiting_for_partner", onWaitingForPartner);
        socket.on("match_found", onMatchFound);
        socket.on("partner_left", onPartnerLeft);
        socket.on("partner_disconnected", onPartnerDisconnected);
        socket.on("search_cancelled", onSearchCancelled);
        socket.on("chat_left", onChatLeft);
        socket.on("receive_message", onReceiveMessage);
        socket.on("typing", onTyping);
        socket.on("stop_typing", onStopTyping);
        socket.on("error_message", onErrorMessage);

        return () => {
            socket.off("connect", onConnect);
            socket.off("joined", onJoined);
            socket.off("online_count", onOnlineCount);
            socket.off("waiting_for_partner", onWaitingForPartner);
            socket.off("match_found", onMatchFound);
            socket.off("partner_left", onPartnerLeft);
            socket.off("partner_disconnected", onPartnerDisconnected);
            socket.off("search_cancelled", onSearchCancelled);
            socket.off("chat_left", onChatLeft);
            socket.off("receive_message", onReceiveMessage);
            socket.off("typing", onTyping);
            socket.off("stop_typing", onStopTyping);
            socket.off("error_message", onErrorMessage);
        };
    }, [socket, currentUser, authUser]);

    // 🚀 Actions Triggered by User
    const handleStartMatch = useCallback(() => {
        if (!socket) return;
        setMatchState('searching');
        setWaitingMessage('Looking for online users to connect...');
        setPartner(null);
        setMatchId(null);
        matchIdRef.current = null;
        partnerRef.current = null;
        setMessages([]);
        setIsMobileDrawerOpen(false);

        socket.emit("find_match", {
            userId: authUser?.id || authUser?._id
        });
    }, [socket, authUser]);

    const handleNextPartner = useCallback(() => {
        if (!socket) return;
        const currentId = matchIdRef.current || matchId;
        if (currentId) {
            socket.emit("next_partner", { matchId: currentId });
        }
        setMatchState('searching');
        setWaitingMessage('Skipping to next stranger...');
        setPartner(null);
        setMatchId(null);
        matchIdRef.current = null;
        partnerRef.current = null;
        setIsMobileDrawerOpen(false);

        // Immediately search for next partner
        socket.emit("find_match", {
            userId: authUser?.id || authUser?._id
        });
    }, [socket, matchId, authUser]);

    const handleCancelSearch = useCallback(() => {
        if (!socket) return;
        socket.emit("cancel_search");
        setMatchState('idle');
        setWaitingMessage('Looking for online users to connect...');
    }, [socket]);

    const handleLeaveChat = useCallback(() => {
        if (!socket) return;
        const currentId = matchIdRef.current || matchId;
        if (currentId) {
            socket.emit("leave_chat", { matchId: currentId });
            socket.emit("leave_match", { matchId: currentId });
        }
        setMatchState('idle');
        setPartner(null);
        setMatchId(null);
        matchIdRef.current = null;
        partnerRef.current = null;
        setMessages([]);
        setIsMobileDrawerOpen(false);
    }, [socket, matchId]);

    const handleSendMessage = useCallback((text) => {
        if (!socket || !text) return;
        const currentId = matchIdRef.current || matchId;
        const currentPartner = partnerRef.current || partner;

        const msg = {
            id: Date.now() + Math.random(),
            text,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, msg]);

        socket.emit("send_message", {
            matchId: currentId,
            text,
            message: text,
            receiverSocketId: currentPartner?.socketId,
            receiverId: currentPartner?._id || currentPartner?.id
        });
    }, [socket, matchId, partner]);

    const handleSendTyping = useCallback(() => {
        if (!socket) return;
        const currentId = matchIdRef.current || matchId;
        const currentPartner = partnerRef.current || partner;
        socket.emit("typing", {
            matchId: currentId,
            receiverSocketId: currentPartner?.socketId,
            receiverId: currentPartner?._id || currentPartner?.id
        });
    }, [socket, matchId, partner]);

    const handleSendStopTyping = useCallback(() => {
        if (!socket) return;
        const currentId = matchIdRef.current || matchId;
        const currentPartner = partnerRef.current || partner;
        socket.emit("stop_typing", {
            matchId: currentId,
            receiverSocketId: currentPartner?.socketId,
            receiverId: currentPartner?._id || currentPartner?.id
        });
    }, [socket, matchId, partner]);

    return (
        <div className="flex h-screen h-[100dvh] w-full bg-base-200/40 overflow-hidden relative">
            {/* 🖥️ Desktop Permanent Sidebar (hidden on mobile) */}
            <div className="hidden md:block w-80 flex-shrink-0 h-full border-r border-base-300 z-20">
                <Slider 
                    onlineCount={onlineCount}
                    matchState={matchState}
                    currentUser={currentUser}
                    authUser={authUser}
                    onStartMatch={handleStartMatch}
                    onNextPartner={handleNextPartner}
                    onCancelSearch={handleCancelSearch}
                    onLeaveChat={onLeaveChat}
                />
            </div>

            {/* 📱 Mobile Slide-over Drawer with Backdrop Blur */}
            {isMobileDrawerOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div 
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
                    />

                    {/* Drawer Content */}
                    <div className="relative w-[85%] max-w-xs h-full bg-base-100 shadow-2xl z-10 animate-slideRight">
                        <Slider 
                            onlineCount={onlineCount}
                            matchState={matchState}
                            currentUser={currentUser}
                            authUser={authUser}
                            onStartMatch={handleStartMatch}
                            onNextPartner={handleNextPartner}
                            onCancelSearch={handleCancelSearch}
                            onLeaveChat={onLeaveChat}
                            onCloseMobile={() => setIsMobileDrawerOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full">
                {/* 📱 Mobile Top Navbar when not in active chat */}
                {matchState !== 'connected' && matchState !== 'partner_left' && (
                    <div className="md:hidden flex items-center justify-between px-3 py-2.5 bg-base-100 border-b border-base-300 safe-top flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsMobileDrawerOpen(true)}
                                className="btn btn-ghost btn-circle btn-sm text-base-content/80"
                                aria-label="Open menu"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <span className="font-extrabold text-sm text-base-content tracking-tight">
                                SocketChat
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="badge badge-success badge-sm gap-1 font-semibold py-1.5 px-2">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                {onlineCount} Online
                            </span>

                            {onLeaveChat && (
                                <button
                                    onClick={onLeaveChat}
                                    title="Exit"
                                    className="btn btn-ghost btn-circle btn-xs text-base-content/60"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* State 1: IDLE / Ready to Start Matching */}
                {matchState === 'idle' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center overflow-y-auto touch-scroll">
                        <div className="card w-full max-w-sm sm:max-w-lg bg-base-100 shadow-xl border border-base-300 p-5 sm:p-10 flex flex-col items-center my-auto">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4 sm:mb-5 shadow-inner">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                            </div>

                            <h1 className="text-xl sm:text-3xl font-extrabold text-base-content tracking-tight mb-1 sm:mb-2">
                                Meet Someone Random
                            </h1>
                            <p className="text-xs sm:text-sm text-base-content/60 max-w-xs sm:max-w-sm mb-5 sm:mb-6">
                                Instant, private, 1-on-1 real-time chat with strangers all around the world.
                            </p>

                            <button
                                onClick={handleStartMatch}
                                className="btn btn-primary btn-md sm:btn-lg w-full max-w-xs shadow-xl shadow-primary/30 text-sm sm:text-base font-bold gap-2 h-12 min-h-[48px]"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Start Random Chat</span>
                            </button>

                            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-base-300 w-full flex items-center justify-around text-[11px] sm:text-xs text-base-content/60">
                                <div>
                                    <span className="font-bold text-base-content block text-xs sm:text-sm">{onlineCount}</span>
                                    <span>Online Now</span>
                                </div>
                                <div className="border-r border-base-300 h-5 sm:h-6"></div>
                                <div>
                                    <span className="font-bold text-success block text-xs sm:text-sm">Instant</span>
                                    <span>Matchmaking</span>
                                </div>
                                <div className="border-r border-base-300 h-5 sm:h-6"></div>
                                <div>
                                    <span className="font-bold text-primary block text-xs sm:text-sm">Private</span>
                                    <span>Anonymous</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* State 2: SEARCHING / In Matchmaking Queue */}
                {matchState === 'searching' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fadeIn overflow-y-auto touch-scroll">
                        <div className="card w-full max-w-sm sm:max-w-md bg-base-100 shadow-xl border border-base-300 p-6 sm:p-8 flex flex-col items-center my-auto">
                            {/* Animated Radar Pulse */}
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-5 sm:mb-6">
                                <span className="absolute w-full h-full rounded-full bg-primary/20 animate-ping"></span>
                                <span className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/30 animate-pulse"></span>
                                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center text-primary-content shadow-lg shadow-primary/40">
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <h2 className="text-lg sm:text-xl font-bold text-base-content mb-1">
                                Looking for a Stranger...
                            </h2>
                            <p className="text-xs sm:text-sm text-base-content/60 max-w-xs mb-5 sm:mb-6">
                                {waitingMessage}
                            </p>

                            <button
                                onClick={handleCancelSearch}
                                className="btn btn-outline btn-error btn-sm sm:btn-md px-6 h-10 min-h-[40px]"
                            >
                                Cancel Search
                            </button>
                        </div>
                    </div>
                )}

                {/* State 3: CONNECTED or PARTNER LEFT */}
                {(matchState === 'connected' || matchState === 'partner_left') && (
                    <ChatInterface 
                        partner={partner}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onNextPartner={handleNextPartner}
                        onLeaveChat={handleLeaveChat}
                        isTyping={isPartnerTyping}
                        matchState={matchState}
                        onSendTyping={handleSendTyping}
                        onSendStopTyping={handleSendStopTyping}
                        onOpenMenu={() => setIsMobileDrawerOpen(true)}
                    />
                )}
            </div>
        </div>
    );
}

export default LandingPage;