'use client';

import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';
import AnimatedBackground from '@/components/AnimatedBackground';
import React from 'react';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative bg-black text-white overflow-hidden">
      <AnimatedBackground />
      <div className="hero-light"></div>

      <main className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12">
        {children}
      </main>

      <footer className="relative z-10 border-t border-white/10 py-8 mt-16 text-center text-gray-500 text-sm">
        <p>© 2024 MOVIEX - Decentralized Cinema Platform</p>
        <p className="mt-2">Powered by Ethereum Blockchain</p>
      </footer>
    </div>
  );
}
