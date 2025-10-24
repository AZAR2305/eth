'use client';

import { useRouter } from 'next/router';
import { WalletConnect } from '@/components/WalletConnect';
import { CONTRACT_ADDRESSES } from '@/config/address';
import { MOVIE_MANAGER_ABI, TICKET_ESCROW_ABI, PYUSD_ABI, AGE_VERIFICATION_ABI } from '@/lib/contracts';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { readContract, writeContract, waitForTransaction } from '@/lib/contract-helpers';

interface Show {
  id: bigint;
  movieId: bigint;
  showtime: bigint;
  ticketPrice: bigint;
  totalSeats: bigint;
  availableSeats: bigint;
  active: boolean;
}

interface Movie {
  id: bigint;
  title: string;
  ageRestriction: number;
  metadataURI: string;
  owner: string;
  active: boolean;
}

export default function MovieDetails() {
  const router = useRouter();
  const { id: movieId, showId } = router.query;
  const { address, isConnected } = useWeb3();
  const [purchasing, setPurchasing] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<Set<number>>(new Set());
  const [bookedSeats, setBookedSeats] = useState<Set<number>>(new Set());
  const [alertShown, setAlertShown] = useState<{[key: string]: boolean}>({});
  const [show, setShow] = useState<Show | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showLoading, setShowLoading] = useState(true);
  const [movieLoading, setMovieLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [allowance, setAllowance] = useState<bigint | null>(null);
  const [pyusdBalance, setPyusdBalance] = useState<bigint | null>(null);
  const [approving, setApproving] = useState(false);

  console.log('🎬 Router query:', { movieId, showId });

  // Load show details
  useEffect(() => {
    const loadShow = async () => {
      if (!showId) return;
      try {
        setShowLoading(true);
        const s = await readContract(
          CONTRACT_ADDRESSES.movieManager,
          MOVIE_MANAGER_ABI,
          'getShow',
          [BigInt(showId as string)]
        );
        setShow(s);
      } catch (e) {
        console.error('Error loading show:', e);
      } finally {
        setShowLoading(false);
      }
    };
    loadShow();
  }, [showId]);

  // Load movie once show is available
  useEffect(() => {
    const loadMovie = async () => {
      if (!show) return;
      try {
        setMovieLoading(true);
        const m = await readContract(
          CONTRACT_ADDRESSES.movieManager,
          MOVIE_MANAGER_ABI,
          'getMovie',
          [show.movieId]
        );
        setMovie(m);
      } catch (e) {
        console.error('Error loading movie:', e);
      } finally {
        setMovieLoading(false);
      }
    };
    loadMovie();
  }, [show]);

  // Load user verification, allowance and balance
  useEffect(() => {
    const loadUserData = async () => {
      if (!address) return;
      try {
        const [verified, allow, balance] = await Promise.all([
          readContract(
            CONTRACT_ADDRESSES.ageVerification,
            AGE_VERIFICATION_ABI,
            'isVerified',
            [address]
          ) as Promise<boolean>,
          readContract(
            CONTRACT_ADDRESSES.pyusd,
            PYUSD_ABI,
            'allowance',
            [address, CONTRACT_ADDRESSES.ticketEscrow]
          ) as Promise<bigint>,
          readContract(
            CONTRACT_ADDRESSES.pyusd,
            PYUSD_ABI,
            'balanceOf',
            [address]
          ) as Promise<bigint>,
        ]);
        setIsVerified(!!verified);
        setAllowance(allow);
        setPyusdBalance(balance);
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    };
    loadUserData();
  }, [address]);

  console.log('💰 PYUSD Balance:', pyusdBalance ? `${Number(pyusdBalance) / 1e6} PYUSD` : 'Loading...');
  console.log('🔐 Allowance:', allowance ? `${Number(allowance) / 1e6} PYUSD` : 'Loading...');

  // Dynamically fetch booked seats from chain using isSeatTaken, and refresh periodically
  useEffect(() => {
    let interval: any;
    const loadBookedSeats = async () => {
      if (!show || !showId) return;
      try {
        const totalSeats = Number(show.totalSeats);
        const checks = Array.from({ length: totalSeats }, (_, i) => i + 1).map(async (seatNum) => {
          const taken = await readContract(
            CONTRACT_ADDRESSES.ticketEscrow,
            TICKET_ESCROW_ABI,
            'isSeatTaken',
            [BigInt(showId as string), BigInt(seatNum)]
          ) as boolean;
          return taken ? seatNum : null;
        });
        const results = await Promise.all(checks);
        const reserved = new Set<number>(results.filter((n): n is number => !!n));
        setBookedSeats(reserved);
      } catch (e) {
        console.error('Error loading booked seats:', e);
      }
    };

    // initial load + periodic refresh
    loadBookedSeats();
    interval = setInterval(() => {
      // also refresh show data to update availableSeats etc.
      (async () => {
        try {
          const s = await readContract(
            CONTRACT_ADDRESSES.movieManager,
            MOVIE_MANAGER_ABI,
            'getShow',
            [BigInt(showId as string)]
          );
          setShow(s);
        } catch (e) {
          console.warn('Refresh show error:', e);
        }
        await loadBookedSeats();
      })();
    }, 10000);

    return () => clearInterval(interval);
  }, [show, showId]);

  const handleSeatClick = (seatNumber: number) => {
    if (bookedSeats.has(seatNumber)) return;
    
    const newSelected = new Set(selectedSeats);
    if (newSelected.has(seatNumber)) {
      newSelected.delete(seatNumber);
    } else {
      if (newSelected.size >= 6) {
        alert('Maximum 6 seats per purchase');
        return;
      }
      newSelected.add(seatNumber);
    }
    setSelectedSeats(newSelected);
  };

  const handleBuyTicket = async () => {
    if (!show || !movie || !address || selectedSeats.size === 0) {
      alert('Please select at least one seat!');
      return;
    }

    if (movie.ageRestriction === 18 && !isVerified) {
      setNeedsVerification(true);
      return;
    }

    setPurchasing(true);

    try {
      const totalCost = show.ticketPrice * BigInt(selectedSeats.size);
      const currentAllowance = allowance || BigInt(0);
      const balance = pyusdBalance || BigInt(0);

      if (balance < totalCost) {
        alert(`Insufficient PYUSD balance. Need ${Number(totalCost) / 1e6} PYUSD`);
        setPurchasing(false);
        return;
      }

      if (currentAllowance < totalCost) {
        console.log('Approving PYUSD...');
        setApproving(true);
        const tx = await writeContract(
          CONTRACT_ADDRESSES.pyusd,
          PYUSD_ABI,
          'approve',
          [CONTRACT_ADDRESSES.ticketEscrow, totalCost]
        );
        await waitForTransaction(tx.hash);
        setApproving(false);
        alert('✅ PYUSD approved! Now buying ticket...');
        // refresh allowance
        if (address) {
          const allow = await readContract(
            CONTRACT_ADDRESSES.pyusd,
            PYUSD_ABI,
            'allowance',
            [address, CONTRACT_ADDRESSES.ticketEscrow]
          );
          setAllowance(allow);
        }
      }

      const buyTx = await writeContract(
        CONTRACT_ADDRESSES.ticketEscrow,
        TICKET_ESCROW_ABI,
        'buyTicket',
        [BigInt(showId as string), Array.from(selectedSeats).map(BigInt)]
      );
      await waitForTransaction(buyTx.hash);
      alert('🎉 Ticket purchased successfully!');
      router.push('/customer/tickets');
    } catch (error: any) {
      console.error('Error buying tickets:', error);
      alert(`Failed to buy tickets: ${error.message}`);
      setPurchasing(false);
    }
  };

  const renderSeats = () => {
    if (!show) return null;
    
    const totalSeats = Number(show.totalSeats);
    const rows = Math.ceil(totalSeats / 10);
    const seats = [];

    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < 10; col++) {
        const seatNum = row * 10 + col + 1;
        if (seatNum > totalSeats) break;

        const isBooked = bookedSeats.has(seatNum);
        const isSelected = selectedSeats.has(seatNum);

        rowSeats.push(
          <button
            key={seatNum}
            onClick={() => handleSeatClick(seatNum)}
            disabled={isBooked}
            className={`w-12 h-12 rounded-lg font-bold transition ${
              isBooked ? 'bg-gray-700 cursor-not-allowed' :
              isSelected ? 'bg-green-500 hover:bg-green-600' :
              'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {seatNum}
          </button>
        );
      }
      seats.push(
        <div key={row} className="flex gap-2 justify-center">
          {rowSeats}
        </div>
      );
    }

    return seats;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6">Connect Your Wallet</h2>
          <WalletConnect />
        </div>
      </div>
    );
  }

  if (showLoading || movieLoading || !show || !movie) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <nav className="p-6 flex justify-between items-center border-b border-white/10 mb-8">
          <Link href="/customer">
            <h1 className="text-2xl font-bold cursor-pointer text-cyan-300">🎬 MOVIEX</h1>
          </Link>
          <WalletConnect />
        </nav>
        <div className="text-center text-2xl">
          {showLoading || movieLoading ? '⏳ Loading show details from blockchain...' : '❌ Show not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="p-6 flex justify-between items-center border-b border-white/10">
        <Link href="/customer">
          <h1 className="text-2xl font-bold cursor-pointer text-cyan-300">🎬 MOVIEX</h1>
        </Link>
        <WalletConnect />
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="panel p-8 mb-6">
          <h1 className="text-4xl font-bold mb-4 text-cyan-300">{movie.title}</h1>
          <div className="space-y-2 text-lg">
            <p>🕐 <strong>Showtime:</strong> {new Date(Number(show.showtime) * 1000).toLocaleString()}</p>
            <p>💰 <strong>Price:</strong> {Number(show.ticketPrice) / 1e6} PYUSD per seat</p>
            <p>🎫 <strong>Available:</strong> {Number(show.availableSeats)} / {Number(show.totalSeats)} seats</p>
            {movie.ageRestriction > 0 && (
              <p className="text-yellow-400">🔞 <strong>Age Restriction:</strong> {movie.ageRestriction}+</p>
            )}
          </div>
        </div>

        {needsVerification && (
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 mb-6">
            <p className="text-xl font-bold mb-2">⚠️ Age Verification Required</p>
            <p>This movie requires age verification. Please verify your age first.</p>
          </div>
        )}

        <div className="panel p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-cyan-300">Select Your Seats</h2>
          <div className="space-y-2 mb-6">
            {renderSeats()}
          </div>
          <div className="flex gap-4 justify-center text-sm mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-cyan-600 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-700 rounded"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="mb-4 pb-4 border-b border-white/20">
            <p className="text-sm text-gray-400">Your PYUSD Balance</p>
            <p className="text-xl font-bold text-green-400">
              {pyusdBalance ? `${(Number(pyusdBalance) / 1e6).toFixed(2)} PYUSD` : 'Loading...'}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg">Selected Seats: <strong>{selectedSeats.size}</strong></p>
              <p className="text-2xl font-bold">
                Total Cost: {selectedSeats.size > 0 ? (Number(show.ticketPrice) * selectedSeats.size / 1e6).toFixed(2) : '0'} PYUSD
              </p>
              {selectedSeats.size > 0 && pyusdBalance && (
                <p className="text-sm text-gray-400 mt-1">
                  After purchase: {((Number(pyusdBalance) - (Number(show.ticketPrice) * selectedSeats.size)) / 1e6).toFixed(2)} PYUSD
                </p>
              )}
            </div>
            <button
              onClick={handleBuyTicket}
              disabled={purchasing || approving || selectedSeats.size === 0}
              className="btn-accent disabled:bg-gray-600 px-8 py-4 rounded-lg font-bold text-xl"
            >
              {approving ? '⏳ Approving PYUSD...' : purchasing ? '⏳ Processing...' : '🎟️ Buy Tickets'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
