'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function TheaterOwnerLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check if already authenticated
    const isAuth = sessionStorage.getItem('theater_owner_auth');
    if (isAuth === 'true') {
      router.push('/theater-owner/dashboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'POIUYTREWQ') {
      sessionStorage.setItem('theater_owner_auth', 'true');
      router.push('/theater-owner/dashboard');
    } else {
      setError('❌ Invalid password! Access denied.');
      setPassword('');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white flex items-center justify-center px-4">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 animate-pulse"></div>
      
      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-block cursor-pointer hover:scale-105 transition">
              <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                🎬 MOVIEX
              </h1>
              <p className="text-sm text-gray-400">OnChain Cinema Platform</p>
            </div>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Theater Owner Access
            </h2>
            <p className="text-gray-400 text-sm">Enter password to continue</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6 animate-shake">
              <p className="text-red-300 text-center font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                🔑 Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter theater owner password"
                className="w-full bg-black/30 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all"
            >
              🚀 Access Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/">
              <span className="text-sm text-gray-400 hover:text-purple-400 transition cursor-pointer">
                ← Back to Home
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>🔒 Secure theater owner portal</p>
          <p>Contact admin for access credentials</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
