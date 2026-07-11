import React from "react";

function Slider({ users = [], currentSocketId, selectedUser, onSelectUser }) {
    // Filter out the current user so they don't see themselves
    const otherUsers = users.filter(u => u.socketId !== currentSocketId);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#1E293B]">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center justify-between">
                    Online Users
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-xs py-1 px-2.5 rounded-full font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        {otherUsers.length}
                    </span>
                </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {otherUsers.length === 0 ? (
                    <div className="text-center py-10 px-4 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No one else is online right now.</p>
                    </div>
                ) : (
                    otherUsers.map((user) => {
                        const isSelected = selectedUser?.socketId === user.socketId;
                        const avatarSeed = user.username.replace(/\s+/g, '');
                        
                        return (
                            <button
                                key={user.socketId}
                                onClick={() => onSelectUser(user)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                                    isSelected 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 shadow-sm border border-indigo-100 dark:border-indigo-800/50' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                                }`}
                            >
                                <div className="relative">
                                    <img 
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                                        alt="Avatar" 
                                        className={`w-10 h-10 rounded-full object-cover ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#1E293B]' : 'bg-gray-100 dark:bg-gray-800'}`}
                                    />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#1E293B] rounded-full"></div>
                                </div>
                                <span className={`font-medium text-sm truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {user.username}
                                </span>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Slider;