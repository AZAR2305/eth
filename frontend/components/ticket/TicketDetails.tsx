'use client';

import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import { WalletConnect } from '@/components/WalletConnect';
import { CONTRACT_ADDRESSES } from '@/config/address';
import { TICKET_NFT_ABI, MOVIE_MANAGER_ABI } from '@/lib/contracts';
import { readContract } from '@/lib/contract-helpers';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

interface Ticket {
  movieId: bigint;
  encryptedURI: string;
  used: boolean;
}

interface Movie {
  id: bigint;
  title: string;
  ageRestriction: bigint;
  metadataURI: string;
  owner: string;
  active: boolean;
}

interface Show {
  id: bigint;
  movieId: bigint;
  showtime: bigint;
  ticketPrice: bigint;
  totalSeats: bigint;
  availableSeats: bigint;
  active: boolean;
}

export default function TicketDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { address, isConnected } = useWeb3();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState<Show | null>(null);

  useEffect(() => {
  if (!id || !isConnected) return;

    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch ticket
        const ticketData = await readContract(
          CONTRACT_ADDRESSES.ticketNFT,
          TICKET_NFT_ABI,
          'tickets',
          [BigInt(id as string)]
        );
        setTicket(ticketData as Ticket);

        // Fetch movie
        if (ticketData) {
          const movieData = await readContract(
            CONTRACT_ADDRESSES.movieManager,
            MOVIE_MANAGER_ABI,
            'getMovie',
            [(ticketData as Ticket).movieId]
          );
          setMovie(movieData as Movie);

          // Fetch shows for this movie to derive showtime
          const allShows = await readContract(
            CONTRACT_ADDRESSES.movieManager,
            MOVIE_MANAGER_ABI,
            'getAllShows',
            []
          ) as Show[];
          const relatedShows = allShows.filter(s => s.movieId === (ticketData as Ticket).movieId);
          // Heuristic: pick the nearest future showtime relative to now; if none future, pick the latest past
          const now = Math.floor(Date.now() / 1000);
          const future = relatedShows.filter(s => Number(s.showtime) >= now).sort((a,b) => Number(a.showtime) - Number(b.showtime));
          const past = relatedShows.filter(s => Number(s.showtime) < now).sort((a,b) => Number(b.showtime) - Number(a.showtime));
          setShow((future[0] ?? past[0]) || null);
        }
      } catch (error) {
        console.error('Error fetching ticket data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, isConnected]);

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

  if (!ticket || !movie) {
    return <div className="min-h-screen bg-black text-white p-8">
      {loading ? 'Loading...' : 'Ticket not found'}
    </div>;
  }

  return (
    <div className="min-h-screen">
      <nav className="p-6 flex justify-between items-center border-b border-white/10 panel">
        <Link href="/customer/tickets">
          <h1 className="text-2xl font-bold cursor-pointer text-gradient">🎬 MOVIEX</h1>
        </Link>
        <WalletConnect />
      </nav>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel p-8">
          <h1 className="text-3xl font-bold mb-6 text-gradient">Ticket #{id}</h1>
          
          <div className="space-y-3 mb-8">
            <p className="text-lg"><strong>Movie:</strong> <span className="text-gradient">{movie.title}</span></p>
            <p className="text-lg"><strong>Showtime:</strong> {show ? new Date(Number(show.showtime) * 1000).toLocaleString() : 'Unknown'}</p>
            <p className="text-lg"><strong>Status:</strong> {ticket.used ? 'Used ✓' : 'Valid ✓'}</p>
          </div>

          {/* Show QR only within the last 3 hours before showtime, and hide after showtime */}
          {(() => {
            const now = Math.floor(Date.now() / 1000);
            const showtime = show ? Number(show.showtime) : 0;
            const threeHours = 3 * 60 * 60;
            const windowOpens = showtime - threeHours;
            const canShowQR = showtime ? now >= windowOpens && now <= showtime : true;

            if (showtime && now < windowOpens) {
              const minutesLeft = Math.ceil((windowOpens - now) / 60);
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-8 text-center">
                  <p className="font-bold">🔒 Ticket unlocks 3 hours before showtime</p>
                  <p className="text-sm mt-2">Available in {minutesLeft} minutes</p>
                  {show && (
                    <p className="text-xs text-gray-300 mt-1">Showtime: {new Date(Number(show.showtime) * 1000).toLocaleString()}</p>
                  )}
                </motion.div>
              );
            }

            if (showtime && now > showtime) {
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-8 text-center">
                  <p className="font-bold">⏱️ Ticket no longer available after showtime</p>
                  {show && <p className="text-sm mt-2">Showtime: {new Date(Number(show.showtime) * 1000).toLocaleString()}</p>}
                </motion.div>
              );
            }

            if (!canShowQR) return null;

            const qrPayload = JSON.stringify({
              type: 'ticket',
              tokenId: id,
              movieId: movie.id?.toString?.() ?? undefined,
              owner: (ticket as any).owner,
              encryptedURI: (ticket as any).encryptedURI,
            });

            return (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-4 rounded-lg mb-8">
                <div className="flex justify-center">
                  <QRCodeSVG value={qrPayload} size={200} />
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">Show this QR at the theater entrance</p>
              </motion.div>
            );
          })()}

          <div className="panel p-6">
            <p className="text-center text-lg">Present this ticket at the theater entrance</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
