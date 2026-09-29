'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
    getAuthToken, 
    setAuthToken, 
    getStoredUser, 
    setStoredUser, 
    clearAuth, 
    isTokenExpired,
    getTokenRemainingTimeMs,
    apiLogin, 
    apiRegister, 
    apiGetMe 
} from '../utils/auth';

const AuthContext = createContext({
    user: null,
    token: null,
    loading: true,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    isAuthenticated: false,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const expiryTimerRef = useRef(null);

    // 🚪 Explicit Logout
    const logout = useCallback(() => {
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
            expiryTimerRef.current = null;
        }
        clearAuth();
        setUser(null);
        setToken(null);
    }, []);

    // ⏱️ Schedule automatic logout when token expires
    const scheduleAutoLogout = useCallback((jwtToken) => {
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
            expiryTimerRef.current = null;
        }

        const remainingMs = getTokenRemainingTimeMs(jwtToken);
        if (remainingMs <= 0) {
            logout();
            return;
        }

        // Limit timeout to 2^31 - 1 (~24.8 days) which is JS setTimeout limit
        const timeoutMs = Math.min(remainingMs, 2147483647);
        expiryTimerRef.current = setTimeout(() => {
            console.warn('[Auth] Token expired automatically. Logging out.');
            logout();
        }, timeoutMs);
    }, [logout]);

    // Initial check for stored token & session on mount/refresh
    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            try {
                const storedToken = getAuthToken();
                const storedUser = getStoredUser();

                if (storedToken) {
                    // Check if token has already expired
                    if (isTokenExpired(storedToken)) {
                        console.info('[Auth] Stored token has expired. Logging out.');
                        clearAuth();
                        if (isMounted) {
                            setToken(null);
                            setUser(null);
                        }
                        return;
                    }

                    // Active valid token found: restore immediately so user doesn't see login screen
                    if (isMounted) {
                        setToken(storedToken);
                        if (storedUser) {
                            setUser(storedUser);
                        }
                    }

                    // Schedule automatic logout when the token expires
                    scheduleAutoLogout(storedToken);

                    // Silently verify & update session from server
                    try {
                        const response = await apiGetMe(storedToken);
                        if (isMounted && response?.success && response?.user) {
                            setUser(response.user);
                            setStoredUser(response.user);
                        }
                    } catch (verifyError) {
                        const status = verifyError.status;
                        const msg = (verifyError.message || '').toLowerCase();
                        const isUnauthorized = status === 401 || status === 403 || 
                                               msg.includes('expired') || msg.includes('invalid') || 
                                               msg.includes('unauthorized');

                        if (isUnauthorized) {
                            console.warn('[Auth] Server rejected token session:', verifyError.message);
                            logout();
                        } else {
                            // If backend is temporarily slow or network glitch, retain existing valid cached session!
                            console.info('[Auth] Server check skipped/offline, maintaining active session:', verifyError.message);
                        }
                    }
                } else {
                    if (isMounted) {
                        setUser(null);
                        setToken(null);
                    }
                }
            } catch (err) {
                console.error('[Auth] Init error:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        return () => {
            isMounted = false;
            if (expiryTimerRef.current) {
                clearTimeout(expiryTimerRef.current);
            }
        };
    }, [scheduleAutoLogout, logout]);

    // 🔑 Login
    const login = useCallback(async (identifier, password) => {
        setLoading(true);
        try {
            const data = await apiLogin(identifier, password);
            if (data.success && data.token) {
                setToken(data.token);
                setUser(data.user);
                setAuthToken(data.token);
                setStoredUser(data.user);
                scheduleAutoLogout(data.token);
                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    }, [scheduleAutoLogout]);

    // 📝 Register
    const register = useCallback(async (userData) => {
        setLoading(true);
        try {
            const data = await apiRegister(userData);
            if (data.success && data.token) {
                setToken(data.token);
                setUser(data.user);
                setAuthToken(data.token);
                setStoredUser(data.user);
                scheduleAutoLogout(data.token);
                return data;
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    }, [scheduleAutoLogout]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!token && !!user && !isTokenExpired(token),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

