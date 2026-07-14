import React from "react";

function Slider({ users = [], currentSocketId, selectedUser, onSelectUser, isConnected = true, unreadCounts = {} }) {
    // Filter out the current user so they don't see themselves
    const otherUsers = users.filter(u => u.socketId !== currentSocketId);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#1E293B]">
            {/* Connection status bar (mobile-friendly) */}
            <div className={`px-4 py-2 text-center text-xs font-medium transition-colors duration-300 ${
                isConnected 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
            }`}>
                <div className="flex items-center justify-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                    {isConnected ? 'Connected' : 'Reconnecting...'}
                </div>
            </div>

            {/* Header */}
            <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center justify-between">
                    Online Users
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-xs py-1 px-2.5 rounded-full font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        {otherUsers.length}
                    </span>
                </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-0.5 md:space-y-1">
                {otherUsers.length === 0 ? (
                    <div className="text-center py-8 md:py-10 px-4 flex flex-col items-center">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-7 h-7 md:w-8 md:h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No one else is online right now.</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Share this app with friends to start chatting!</p>
                    </div>
                ) : (
                    otherUsers.map((user) => {
                        const isSelected = selectedUser?.socketId === user.socketId;
                        const avatarSeed = user.username.replace(/\s+/g, '');
                        const unread = unreadCounts[user.socketId] || 0;
                        
                        return (
                            <button
                                key={user.socketId}
                                onClick={() => onSelectUser(user)}
                                className={`w-full flex items-center gap-3 p-2.5 md:p-3 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                                    isSelected 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 shadow-sm border border-indigo-100 dark:border-indigo-800/50' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                                }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <img 
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                                        alt="Avatar" 
                                        loading="lazy"
                                        className={`w-9 h-9 md:w-10 md:h-10 rounded-full object-cover ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#1E293B]' : 'bg-gray-100 dark:bg-gray-800'}`}
                                    />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#1E293B] rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0 flex items-center gap-2">
                                    <span className={`font-medium text-sm truncate block ${
                                        isSelected 
                                        ? 'text-indigo-700 dark:text-indigo-300' 
                                        : unread > 0 
                                        ? 'text-gray-900 dark:text-white font-semibold' 
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                        {user.username}
                                    </span>
                                    {unread > 0 && !isSelected && (
                                        <span className="flex-shrink-0 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 animate-pulse">
                                            {unread > 99 ? '99+' : unread}
                                        </span>
                                    )}
                                </div>
                                {/* Tap indicator for mobile */}
                                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 md:hidden flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Slider;