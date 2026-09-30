// API & Authentication Utility for SocketChat

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chat-backend-lyart-psi.vercel.app';

/**
 * Checks if a JWT token is expired client-side
 * @param {string} token 
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
    if (!token || typeof token !== 'string') return true;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const parsed = JSON.parse(jsonPayload);
        if (!parsed || !parsed.exp) return false;
        // Buffer by 5 seconds to prevent edge-case race conditions
        const currentTime = Math.floor(Date.now() / 1000);
        return parsed.exp <= (currentTime + 5);
    } catch {
        return true;
    }
};

/**
 * Returns remaining milliseconds until token expiration
 * @param {string} token 
 * @returns {number}
 */
export const getTokenRemainingTimeMs = (token) => {
    if (!token || typeof token !== 'string') return 0;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return 0;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const parsed = JSON.parse(jsonPayload);
        if (!parsed || !parsed.exp) return Infinity;
        const remainingSeconds = parsed.exp - Math.floor(Date.now() / 1000);
        return Math.max(0, remainingSeconds * 1000);
    } catch {
        return 0;
    }
};

export const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    try {
        const token = localStorage.getItem('socketchat_token');
        if (token && isTokenExpired(token)) {
            clearAuth();
            return null;
        }
        return token;
    } catch {
        return null;
    }
};

export const setAuthToken = (token) => {
    if (typeof window === 'undefined') return;
    try {
        if (token) {
            localStorage.setItem('socketchat_token', token);
        } else {
            localStorage.removeItem('socketchat_token');
        }
    } catch (e) {
        console.error('Failed to set auth token:', e);
    }
};

export const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    try {
        const item = localStorage.getItem('socketchat_user');
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
};

export const setStoredUser = (user) => {
    if (typeof window === 'undefined') return;
    try {
        if (user) {
            localStorage.setItem('socketchat_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('socketchat_user');
        }
    } catch (e) {
        console.error('Failed to set stored user:', e);
    }
};

export const clearAuth = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem('socketchat_token');
        localStorage.removeItem('socketchat_user');
    } catch (e) {
        console.error('Failed to clear auth:', e);
    }
};

// 🔑 API Calls

/**
 * Sign in existing user with username/email & password
 */
export const apiLogin = async (identifier, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(data.message || 'Login failed. Please check your credentials.');
        error.status = res.status;
        throw error;
    }
    return data;
};

/**
 * Register new user
 */
export const apiRegister = async (userData) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(data.message || 'Registration failed. Please check your information.');
        error.status = res.status;
        throw error;
    }
    return data;
};

/**
 * Fetch current authenticated user session (supports token & cookies)
 */
export const apiGetMe = async (token) => {
    const authToken = token || getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };

    if (authToken) {
        if (isTokenExpired(authToken)) {
            clearAuth();
            const error = new Error('Session token has expired');
            error.status = 401;
            throw error;
        }
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(data.message || 'Failed to authenticate user session');
        error.status = res.status;
        throw error;
    }
    return data;
};

/**
 * Invalidate server session, clear httpOnly cookie, and mark user offline
 */
export const apiLogout = async () => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers,
            credentials: 'include',
        });
        return await res.json().catch(() => ({ success: true }));
    } catch (e) {
        console.warn('apiLogout request error:', e);
        return { success: false };
    }
};

/**
 * Request random online match via REST API (complementary to socket find_match)
 */
export const apiMatch = async () => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/api/auth/match`, {
        method: 'POST',
        headers,
        credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(data.message || 'No online users found');
        error.status = res.status;
        throw error;
    }
    return data;
};

