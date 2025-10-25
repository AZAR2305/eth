'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { WalletConnect } from '@/components/WalletConnect';
import QRScanner from '@/components/QRScanner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { verifyTicket } from '@/lib/ticket-verify';

// Dynamic import to avoid SSR issues
const QRScannerDynamic = dynamic(() => import('@/components/QRScanner'), { 
  ssr: false,
  loading: () => <div className="text-center py-8">Loading scanner...</div>
});

export default function VerifyTicket() {
  const { address, isConnected } = useWeb3();
  const [scanning, setScanning] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleScanSuccess = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      const result = await verifyTicket(data);
      if (!result.valid) {
        setError(result.reason || 'Invalid ticket');
        setTicketData(null);
        return;
      }
      setTicketData(result.normalized || null);
      setScanning(false);
      setError('');
    } catch (err) {
      console.error('❌ Error parsing QR code:', err);
      setError('Invalid QR code format. Please scan a valid ticket.');
      setTicketData(null);
    }
  };

  const handleScanError = (error: string) => {
    console.warn('Scan error:', error);
  };

  const startNewScan = () => {
    setScanning(true);
    setTicketData(null);
    setError('');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 accent-heading">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Theater owners only</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="p-4 md:p-6 flex justify-between items-center border-b border-white/10 bg-black/50 backdrop-blur-md">
        <Link href="/theater-owner">
          <h1 className="text-xl md:text-2xl font-bold cursor-pointer text-gradient hover:scale-105 transition">🎬 MOVIEX Theater</h1>
        </Link>
        <WalletConnect />
      </nav>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-2 text-gradient">🎫 Verify Tickets</h2>
          <p className="text-gray-400 text-sm md:text-lg">Scan customer QR codes at theater entrance</p>
        </motion.div>

        {error && (
          <div className="border border-red-500/50 rounded-xl p-4 mb-6 bg-black/50">
            <p className="text-red-300">❌ {error}</p>
          </div>
        )}

        {!scanning && !ticketData && (
          <div className="panel p-6 md:p-8 text-center">
            <div className="text-6xl md:text-8xl mb-4">📷</div>
            <h3 className="text-xl md:text-2xl font-bold mb-4">Ready to Scan</h3>
            <p className="text-gray-400 mb-6 text-sm md:text-base">
              Click the button below to open the camera and scan a customer's ticket QR code
            </p>
            <button
              onClick={startNewScan}
              className="btn-accent px-6 md:px-8 py-3 md:py-4 text-base md:text-lg w-full md:w-auto"
            >
              📷 Start Scanning
            </button>
          </div>
        )}

        {scanning && !ticketData && (
          <div className="panel p-4 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">Scanning QR Code...</h3>
            <QRScannerDynamic 
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
            <button
              onClick={() => setScanning(false)}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 px-4 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base transition"
            >
              Cancel
            </button>
          </div>
        )}

        {ticketData && (
          <div className="panel p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="text-6xl md:text-8xl mb-4 animate-bounce">✅</div>
              <h3 className="text-2xl md:text-3xl font-bold text-green-400 mb-2">Valid Ticket!</h3>
              <p className="text-gray-400 text-sm md:text-base">Entry approved</p>
            </div>

            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Movie</p>
                <p className="text-lg md:text-xl font-bold">{ticketData.movieTitle || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                  <p className="text-xs md:text-sm text-gray-400 mb-1">Ticket ID</p>
                  <p className="text-base md:text-lg font-bold">
                    {ticketData.tokenId ? `NFT #${ticketData.tokenId}` : (ticketData.purchaseId ? `Purchase #${ticketData.purchaseId}` : '—')}
                  </p>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                  <p className="text-xs md:text-sm text-gray-400 mb-1">Seats</p>
                  <p className="text-base md:text-lg font-bold">{ticketData.seatNumbers?.join(', ') || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Showtime</p>
                <p className="text-base md:text-lg font-bold">
                  {ticketData.showtimeSec ? new Date(ticketData.showtimeSec * 1000).toLocaleString() : '—'}
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Amount Paid</p>
                <p className="text-base md:text-lg font-bold text-green-400">{ticketData.amount || '—'}</p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Buyer</p>
                <p className="text-xs md:text-sm font-mono break-all">{ticketData.buyer || '—'}</p>
              </div>
            </div>

            <button
              onClick={startNewScan}
              className="mt-6 w-full btn-accent px-6 py-3 md:py-4 text-base md:text-lg"
            >
              Scan Next Ticket
            </button>
          </div>
        )}

        <div className="mt-6 md:mt-8 text-center">
          <Link 
            href="/theater-owner"
            className="link-accent text-sm md:text-base"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
