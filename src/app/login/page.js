'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, loading: authLoading } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDark, setIsDark] = useState(false);

    // Sync dark mode state with <html>
    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    // If already authenticated, redirect to home immediately
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace('/');
        }
    }, [authLoading, isAuthenticated, router]);

    // If checking session or already authenticated, do not show login form
    if (authLoading || isAuthenticated) {
        return (
            <div className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center p-4 bg-base-200/50">
                <div className="card w-full max-w-sm bg-base-100/90 backdrop-blur-xl shadow-2xl border border-base-300 p-8 flex flex-col items-center justify-center space-y-3.5">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="text-xs sm:text-sm text-base-content/70 font-medium animate-pulse">
                        {isAuthenticated ? 'Already logged in. Redirecting...' : 'Verifying session...'}
                    </p>
                </div>
            </div>
        );
    }

    const toggleDark = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
        }
        localStorage.setItem('socketchat-theme', next ? 'dark' : 'light');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!identifier.trim()) {
            setErrorMessage('Please enter your username or email');
            return;
        }

        if (!password) {
            setErrorMessage('Please enter your password');
            return;
        }

        setLoading(true);
        try {
            await login(identifier.trim(), password);
            router.push('/');
        } catch (err) {
            console.error('Login error:', err);
            setErrorMessage(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 relative bg-base-200/50 overflow-y-auto touch-scroll py-8 transition-colors duration-300">
            {/* Background decorative glowing orbs */}
            <div className="absolute top-1/4 -left-20 w-72 sm:w-80 h-72 sm:h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none transform -translate-y-1/2"></div>
            <div className="absolute bottom-1/4 -right-20 w-72 sm:w-80 h-72 sm:h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none transform translate-y-1/2"></div>

            {/* 🌙 Theme Toggle Button (DaisyUI btn-ghost btn-circle) */}
            <button
                type="button"
                onClick={toggleDark}
                className="absolute top-3 right-3 sm:top-5 sm:right-5 safe-top btn btn-ghost btn-circle bg-base-100/70 backdrop-blur-md shadow-xs border border-base-300 z-50 text-base-content h-10 w-10 min-h-[40px]"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDark ? (
                    <svg className="w-5 h-5 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                )}
            </button>

            {/* Login Card (DaisyUI Card) */}
            <div className="card w-full max-w-sm sm:max-w-md bg-base-100/90 backdrop-blur-xl shadow-2xl border border-base-300 z-10 transition-all duration-300 my-auto">
                <div className="card-body p-5 sm:p-8">
                    {/* Header Section */}
                    <div className="text-center mb-4 sm:mb-5">
                        <div className="inline-flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-2.5 text-primary-content">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h1 className="text-xl sm:text-3xl font-extrabold text-base-content tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
                            Log in to join your real-time chats
                        </p>
                    </div>

                    {/* DaisyUI Alert Error Banner */}
                    {errorMessage && (
                        <div role="alert" className="alert alert-error shadow-xs mb-3 text-xs sm:text-sm py-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="flex-1">{errorMessage}</span>
                            <button 
                                type="button" 
                                onClick={() => setErrorMessage('')}
                                className="btn btn-ghost btn-xs btn-circle"
                                aria-label="Dismiss error"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        {/* Identifier Field */}
                        <div>
                            <label className="label py-0.5 sm:py-1">
                                <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/70">
                                    Username or Email
                                </span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="e.g. alex or alex@example.com"
                                    className="input input-bordered w-full pl-10 text-sm focus:input-primary bg-base-200/40 h-11 min-h-[44px]"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="label py-0.5 sm:py-1">
                                <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/70">
                                    Password
                                </span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="input input-bordered w-full pl-10 pr-11 text-sm focus:input-primary bg-base-200/40 h-11 min-h-[44px]"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content transition-colors h-full"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button (DaisyUI btn-primary) */}
                        <div className="pt-1 sm:pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full shadow-md shadow-primary/20 text-sm sm:text-base h-11 min-h-[44px]"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Logging in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer Navigation */}
                    <div className="mt-5 pt-3.5 border-t border-base-300 text-center space-y-2.5">
                        <p className="text-xs sm:text-sm text-base-content/70">
                            Don&apos;t have an account?{' '}
                            <Link 
                                href="/signup" 
                                className="link link-primary font-semibold"
                            >
                                Sign Up
                            </Link>
                        </p>
                        <div>
                            <Link 
                                href="/" 
                                className="inline-flex items-center gap-1.5 text-xs text-base-content/50 hover:text-base-content transition-colors py-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to guest chat
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
