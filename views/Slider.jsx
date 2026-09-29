'use client';

import React from 'react';

function Slider({ 
    onlineCount = 1,
    matchState = 'idle',
    currentUser = '',
    authUser = null,
    onStartMatch,
    onNextPartner,
    onCancelSearch,
    onLeaveChat,
    onCloseMobile
}) {
    const userAvatar = authUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser || "me")}`;

    return (
        <div className="h-full flex flex-col bg-base-100 border-r border-base-300 select-none overflow-hidden">
            {/* ⚡ Live Connection & Header */}
            <div className="p-3.5 sm:p-4 border-b border-base-300 safe-top flex-shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                        Live Network
                    </span>

                    <div className="flex items-center gap-1.5">
                        <span className="badge badge-success badge-sm gap-1 font-semibold py-2 px-2.5">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            {onlineCount} Online
                        </span>

                        {/* Mobile Close Button */}
                        {onCloseMobile && (
                            <button
                                type="button"
                                onClick={onCloseMobile}
                                className="md:hidden btn btn-ghost btn-circle btn-xs text-base-content/70 ml-1"
                                aria-label="Close menu"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-[11px] sm:text-xs text-base-content/60">
                    Anonymous 1-on-1 random stranger matchmaking.
                </p>
            </div>

            {/* Matchmaking Controls */}
            <div className="p-3.5 sm:p-4 border-b border-base-300 space-y-2 flex-shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 block mb-1">
                    Match Controls
                </span>

                {matchState === 'idle' && (
                    <button 
                        onClick={() => {
                            if (onCloseMobile) onCloseMobile();
                            onStartMatch();
                        }}
                        className="btn btn-primary w-full shadow-md shadow-primary/20 gap-2 h-11 min-h-[44px]"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Find Stranger</span>
                    </button>
                )}

                {matchState === 'searching' && (
                    <div className="space-y-2">
                        <div className="p-3 rounded-2xl bg-base-200/80 border border-base-300 text-center flex flex-col items-center gap-1">
                            <span className="loading loading-spinner loading-md text-primary"></span>
                            <span className="text-xs font-semibold text-base-content">Looking for partner...</span>
                        </div>
                        <button 
                            onClick={onCancelSearch}
                            className="btn btn-outline btn-error btn-sm w-full h-10 min-h-[40px]"
                        >
                            Cancel Search
                        </button>
                    </div>
                )}

                {(matchState === 'connected' || matchState === 'partner_left') && (
                    <div className="space-y-2">
                        <button 
                            onClick={() => {
                                if (onCloseMobile) onCloseMobile();
                                onNextPartner();
                            }}
                            className="btn btn-warning w-full gap-2 shadow-xs h-11 min-h-[44px]"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                            <span>Next Stranger (Esc)</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Guidelines & Shortcuts Info */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs touch-scroll">
                <div>
                    <h3 className="font-bold text-base-content uppercase tracking-wider mb-2 text-[11px] text-base-content/70">
                        Keyboard Shortcuts
                    </h3>
                    <div className="space-y-1.5 text-base-content/70">
                        <div className="flex items-center justify-between bg-base-200/50 p-2 rounded-xl">
                            <span>Send Message</span>
                            <kbd className="kbd kbd-xs">Enter</kbd>
                        </div>
                        <div className="flex items-center justify-between bg-base-200/50 p-2 rounded-xl">
                            <span>Next / Skip</span>
                            <kbd className="kbd kbd-xs">Esc</kbd>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-base-content uppercase tracking-wider mb-2 text-[11px] text-base-content/70">
                        Safety Rules
                    </h3>
                    <ul className="space-y-2 text-base-content/60 text-[11px] sm:text-xs">
                        <li className="flex items-start gap-1.5">
                            <span className="text-primary font-bold">•</span>
                            <span>Do not share passwords or private personal info.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="text-primary font-bold">•</span>
                            <span>Be polite and respectful to everyone you meet.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="text-primary font-bold">•</span>
                            <span>Tap Next whenever you want to switch partners.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Current User Profile Footer */}
            {currentUser && (
                <div className="p-3 border-t border-base-300 bg-base-200/50 flex items-center justify-between gap-2.5 safe-bottom flex-shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="avatar online">
                            <div className="w-8 h-8 rounded-full ring-1 ring-primary/40">
                                <img src={userAvatar} alt={currentUser} />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-base-content truncate">
                                {authUser?.fullName || currentUser}
                            </p>
                            <p className="text-[10px] text-primary font-medium truncate">
                                @{currentUser} {authUser ? '✓' : '(Guest)'}
                            </p>
                        </div>
                    </div>

                    {onLeaveChat && (
                        <button
                            onClick={onLeaveChat}
                            title="Exit to Main Menu"
                            className="btn btn-ghost btn-circle btn-sm text-base-content/50 hover:text-error"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default Slider;