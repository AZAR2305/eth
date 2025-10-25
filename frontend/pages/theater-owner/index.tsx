'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-block cursor-pointer hover:scale-105 transition">
              <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-bold mb-2 text-gradient">
                🎬 MOVIEX
              </motion.h1>
              <p className="text-sm text-gray-400">OnChain Cinema Platform</p>
            </div>
          </Link>
        </div>

        <div className="panel p-8 rounded-3xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-3xl font-bold mb-2 accent-heading">
              Theater Owner Access
            </h2>
            <p className="text-gray-400 text-sm">Enter password to continue</p>
          </div>

          {error && (
            <div className="border border-red-500/50 rounded-xl p-4 mb-6 animate-shake bg-black/50">
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
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full btn-accent py-3 rounded-xl font-bold text-lg"
            >
              🚀 Access Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/">
              <span className="text-sm link-accent cursor-pointer">
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
