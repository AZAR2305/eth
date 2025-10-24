'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { WalletConnect } from '@/components/WalletConnect';
import QRScanner from '@/components/QRScanner';
import Link from 'next/link';
import dynamic from 'next/dynamic';

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

  const handleScanSuccess = (decodedText: string) => {
    try {
      console.log('📱 Scanned data:', decodedText);
      
      // Parse ticket data
      const data = JSON.parse(decodedText);
      console.log('✅ Parsed ticket:', data);
      
      // Validate ticket structure
      if (!data.ticketId || !data.movieTitle || !data.showtime) {
        throw new Error('Invalid ticket format');
      }
      
      setTicketData(data);
      setScanning(false);
      setError('');
      
      // Play success sound (optional)
      if (typeof window !== 'undefined') {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSF1xe7glEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEoPDlOq5O+zYBoGPJPY88p2KwUme8rx3I4+CRZiturqpVITC0mi4PK8aB8FM4nU8tGAMQYeb8Lv45pEDBBUquXvsmAdCECY3PLEcSYEKn/M8duLOQgZZrrq6aRSEgxLpODxu2keCzCFzvPWgzQGHG3A7eSaSw4OUKfj8LdjHAY5kdby0H4uBSR4yO/dkD8JEl+26+ukURAPTKPg8bxrHwU0iNTy0oI0BRxuwO7mnEsODlGn4/C4ZBsGOpHX88l4LgUkecjv3I9CCRJfturqpVMSDEuk4PK8aiAEM4nU89OBMwYcbcDu5ZpKDg5Rp+PwuGUbBjuR1/PJdy8FJHnI79yPQgkSX7bq6qVTEgxLpODyvGsgBTSJ1PLTgTMHHGzB7uWaSg4OUKfj8LllHAY6kNfyyXcuBSR4yO/cj0IJFV616uqlUhIMTKPg8bxqHwUziNTy04IzBhxswO7lm0sODlCn4/C5ZRwGOpDX8sl3LgUkeMjv3I9CCRVfterpplITDEyk4PG8ah8FM4jU8tOCMwYcbMDu5ZtLDw5Qp+PwuWUcBjqQ1/LJdy4FJHjI79yPQgkVX7bq6aZSEwxMpODxvGofBTOI1PLTgjMGHGzA7uWbSw8OUKfj8LllHAY6kNfyyXcuBSR4yO/cj0IJFV+26ummUhMMTKTg8bxqHwUziNTy04IzBhxswO7lm0sPDlCn4/C5ZRwGOpDX8sl3LgUkeMjv3I9CCRVfterpplITDEyk4PG8ah8FM4jU8tOCMwYcbMDu5ZtLDw5Qp+PwuWUcBjqQ1/LJdy4FJHjI79yPQgkVX7bq6aZSEwxMpODxvGofBTOI1PLTgjMGHGzA7uWbSw8OUKfj8LllHAY6kNfyyXcuBSR4yO/cj0IJFV+26ummUhMMTKTg8bxqHwUziNTy04IzBhxswO7lm0sPDlCn4/C5ZRwGOpDX8sl3LgUkeMjv3I9CCRVfterpplITDEyk4PG8ah8FM4jU8tOCMwYcbMDu5ZtLDw5Qp+PwuWUcBjqQ1/LJdy4FJHjI79yPQgkVX7bq6aZSEwxMpODxvGofBTOI1PLTgjMGHGzA7uWbSw8OUKfj8LllHAY6kNfyyXcuBSR4yO/cj0IJFV+26ummUhMMTKTg8bxqHwUziNTy04IzBhxswO7lm0sPDlCn4/C5ZRwGOpDX8sl3LgUkeMjv3I9CCRVfterpplITDEyk4PG8ah8FM4jU8tOCMwYcbMDu5ZtLDw5Qp+PwuWUcBjqQ1/LJdy4FJHjI79yPQgkVX7bq6aZSEwxMpODxvGofBTOI1PLTgjMGHGzA7uWbSw8=');
        audio.play().catch(() => {});
      }
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
          <h1 className="text-xl md:text-2xl font-bold cursor-pointer text-cyan-300 hover:scale-105 transition">🎬 MOVIEX Theater</h1>
        </Link>
        <WalletConnect />
      </nav>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <div className="mb-6 md:mb-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-2 accent-heading">🎫 Verify Tickets</h2>
          <p className="text-gray-400 text-sm md:text-lg">Scan customer QR codes at theater entrance</p>
        </div>

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
                <p className="text-lg md:text-xl font-bold">{ticketData.movieTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                  <p className="text-xs md:text-sm text-gray-400 mb-1">Ticket ID</p>
                  <p className="text-base md:text-lg font-bold">#{ticketData.ticketId}</p>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                  <p className="text-xs md:text-sm text-gray-400 mb-1">Seats</p>
                  <p className="text-base md:text-lg font-bold">{ticketData.seatNumbers?.join(', ') || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Showtime</p>
                <p className="text-base md:text-lg font-bold">
                  {new Date(ticketData.showtime).toLocaleString()}
                </p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Amount Paid</p>
                <p className="text-base md:text-lg font-bold text-green-400">{ticketData.amount}</p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                <p className="text-xs md:text-sm text-gray-400 mb-1">Buyer</p>
                <p className="text-xs md:text-sm font-mono break-all">{ticketData.buyer}</p>
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
