'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ScanTicketContent() {
  const { address, isConnected } = useWeb3();
  const [ticketData, setTicketData] = useState<any>(null);
  const [manualInput, setManualInput] = useState('');

  const validateTicket = () => {
    if (!ticketData) return;

    const showtime = new Date(ticketData.showtime);
    const now = new Date();
    
    if (now < showtime) {
      alert('❌ Show has not started yet!');
      return;
    }

    alert('✅ Ticket validated! Entry granted.');
    setTicketData(null);
  };

  const handleManualInput = () => {
    try {
      const data = JSON.parse(manualInput);
      setTicketData(data);
      setManualInput('');
    } catch (e) {
      alert('Invalid ticket data format');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <h2 className="text-4xl font-bold mb-6 text-gradient">Connect Your Wallet</h2>
          <WalletConnect />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="p-6 flex justify-between items-center border-b border-white/10 bg-black/50 backdrop-blur-md panel">
        <Link href="/theater-owner">
          <h1 className="text-2xl font-bold cursor-pointer text-gradient hover:scale-105 transition">🎬 MOVIEX Theater</h1>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/theater-owner" className="link-accent">Dashboard</Link>
          <Link href="/theater-owner/analytics" className="link-accent">Analytics</Link>
          <WalletConnect />
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <motion.h2 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-8 text-center text-gradient">🎫 Validate Ticket</motion.h2>

        {!ticketData && (
          <div className="panel p-8">
            <h3 className="text-xl font-bold mb-4">Manual Ticket Validation</h3>
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder='Paste ticket data JSON here...'
              className="w-full bg-black/40 border border-white/20 rounded-lg p-4 text-white mb-4 min-h-[200px] font-mono text-sm"
            />
            <button
              onClick={handleManualInput}
              className="w-full btn-accent py-3 font-bold"
            >
              Validate Ticket
            </button>
          </div>
        )}

        {ticketData && (
          <div className="panel p-8">
            <h3 className="text-2xl font-bold mb-4 text-green-400">✅ Ticket Data</h3>
            
            <div className="space-y-2 mb-6 text-gray-300">
              <p><strong>Movie:</strong> {ticketData.movieTitle}</p>
              <p><strong>Showtime:</strong> {new Date(ticketData.showtime).toLocaleString()}</p>
              <p><strong>Seats:</strong> {ticketData.seats?.join(', ')}</p>
              <p><strong>Buyer:</strong> {ticketData.buyer?.slice(0, 10)}...{ticketData.buyer?.slice(-8)}</p>
              <p><strong>Purchase ID:</strong> {ticketData.purchaseId}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={validateTicket}
                className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold"
              >
                ✅ Validate & Grant Entry
              </button>
              <button
                onClick={() => setTicketData(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-bold"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
