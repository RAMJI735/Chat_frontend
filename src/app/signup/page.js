'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
    const router = useRouter();
    const { register, isAuthenticated, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDark, setIsDark] = useState(false);

    // Sync dark mode state with <html>
    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    // Redirect to home if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace('/');
        }
    }, [authLoading, isAuthenticated, router]);

    // If checking session or already authenticated, do not show signup form
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Calculate password strength (0 to 4)
    const getPasswordStrength = (pwd) => {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 6) score += 1;
        if (pwd.length >= 10) score += 1;
        if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
        return score;
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const cleanUsername = formData.username.trim();
        if (!cleanUsername) {
            setErrorMessage('Please choose a username');
            return;
        }

        if (cleanUsername.length < 3 || cleanUsername.length > 30) {
            setErrorMessage('Username must be between 3 and 30 characters');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
            setErrorMessage('Username can only contain letters, numbers, and underscores');
            return;
        }

        if (formData.email) {
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(formData.email.trim())) {
                setErrorMessage('Please provide a valid email address');
                return;
            }
        }

        if (!formData.password || formData.password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await register({
                username: cleanUsername,
                email: formData.email.trim() || undefined,
                fullName: formData.fullName.trim() || undefined,
                password: formData.password,
            });
            router.push('/');
        } catch (err) {
            console.error('Registration error:', err);
            setErrorMessage(err.message || 'Registration failed. Please try a different username.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 relative bg-base-200/50 overflow-y-auto touch-scroll py-6 sm:py-10 transition-colors duration-300">
            {/* Background glowing decorations */}
            <div className="absolute top-1/3 -left-20 w-72 sm:w-80 h-72 sm:h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none transform -translate-y-1/2"></div>
            <div className="absolute bottom-1/4 -right-20 w-72 sm:w-80 h-72 sm:h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none transform translate-y-1/2"></div>

            {/* 🌙 Theme Toggle */}
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
                    <svg className="w-5 h-5 text-base-content" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                )}
            </button>

            {/* Signup Card */}
            <div className="card w-full max-w-sm sm:max-w-md bg-base-100/90 backdrop-blur-xl shadow-2xl border border-base-300 z-10 transition-all duration-300 my-auto">
                <div className="card-body p-5 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-3 sm:mb-4">
                        <div className="inline-flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-2 text-primary-content">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h1 className="text-xl sm:text-3xl font-extrabold text-base-content tracking-tight">
                            Create Account
                        </h1>
                        <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
                            Join SocketChat to connect with people globally
                        </p>
                    </div>

                    {/* DaisyUI Alert Error */}
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                        {/* Username */}
                        <div>
                            <label className="label py-0.5">
                                <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/70">
                                    Username <span className="text-error">*</span>
                                </span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                                    <span className="text-sm font-semibold">@</span>
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="cool_chatter"
                                    maxLength={30}
                                    className="input input-bordered w-full pl-9 text-sm focus:input-primary bg-base-200/40 h-11 min-h-[44px]"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Full Name & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                                <label className="label py-0.5">
                                    <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/70">
                                        Full Name
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Alex Carter"
                                    className="input input-bordered w-full text-sm focus:input-primary bg-base-200/40 h-11 min-h-[44px]"
                                />
                            </div>

                            <div>
                                <label className="label py-0.5">
                                    <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/70">
                                        Email
                                    </span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="alex@example.com"
                                    className="input input-bordered w-full text-sm focus:input-primary bg-base-200/40 h-11 min-h-[44px]"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label py-0.5">
                                <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/70">
                                    Password <span className="text-error">*</span>
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="At least 6 characters"
                                    className="input input-bordered w-full pr-11 text-sm focus:input-primary bg-base-200/40 h-11 min-h-[44px]"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content transition-colors h-full"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Password Strength using DaisyUI Progress */}
                            {formData.password && (
                                <div className="mt-1 flex items-center gap-1.5">
                                    <progress 
                                        className={`progress w-full h-1.5 ${
                                            passwordStrength <= 1
                                                ? 'progress-error'
                                                : passwordStrength <= 2
                                                ? 'progress-warning'
                                                : 'progress-success'
                                        }`} 
                                        value={passwordStrength * 25} 
                                        max="100"
                                    ></progress>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="label py-0.5">
                                <span className="label-text text-xs font-semibold uppercase tracking-wider text-base-content/70">
                                    Confirm Password <span className="text-error">*</span>
                                </span>
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                className="input input-bordered w-full text-sm focus:input-primary bg-base-200/40 h-11 min-h-[44px]"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-1.5 sm:pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full shadow-md shadow-primary/20 text-sm sm:text-base h-11 min-h-[44px]"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Creating Account...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-base-300 text-center space-y-2">
                        <p className="text-xs sm:text-sm text-base-content/70">
                            Already have an account?{' '}
                            <Link 
                                href="/login" 
                                className="link link-primary font-semibold"
                            >
                                Log In
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
