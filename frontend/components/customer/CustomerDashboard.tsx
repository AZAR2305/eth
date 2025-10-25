'use client';

import { useWeb3 } from '@/contexts/Web3Context';
import { readContract } from '@/lib/contract-helpers';
import { WalletConnect } from '@/components/WalletConnect';
import { CONTRACT_ADDRESSES } from '@/config/address';
import { MOVIE_MANAGER_ABI } from '@/lib/contracts';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ipfsService } from '@/lib/ipfs-pinata';
import { motion } from 'framer-motion';

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
  ageRestriction: bigint;
  metadataURI: string;
  owner: string;
  active: boolean;
}

export default function CustomerDashboard() {
  const { address, isConnected } = useWeb3();
  const [shows, setShows] = useState<(Show & { movie?: Movie; metadata?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [moviesData, setMoviesData] = useState<Movie[] | null>(null);
  const [showsData, setShowsData] = useState<Show[] | null>(null);

  // Fetch movies and shows from blockchain (works even if wallet is not connected)
  useEffect(() => {

    async function fetchBlockchainData() {
      try {
        const [moviesRaw, showsRaw] = await Promise.all([
          readContract(
            CONTRACT_ADDRESSES.movieManager,
            MOVIE_MANAGER_ABI,
            'getAllMovies',
            []
          ) ,
          readContract(
            CONTRACT_ADDRESSES.movieManager,
            MOVIE_MANAGER_ABI,
            'getAllShows',
            []
          ) 
        ]);
        const movies = moviesRaw.map((m: any) => ({
        id: BigInt(m[0]),
        title: m[1],
        ageRestriction: BigInt(m[2]),
        metadataURI: m[3],
        owner: m[4],
        active: m[5],
      }));

      const shows = showsRaw.map((s: any) => ({
        id: BigInt(s[0]),
        movieId: BigInt(s[1]),
        showtime: BigInt(s[2]),
        ticketPrice: BigInt(s[3]),
        totalSeats: BigInt(s[4]),
        availableSeats: BigInt(s[5]),
        active: s[6],
      }));
        
        setMoviesData(movies);
        setShowsData(shows);
      } catch (error) {
        console.error('Error fetching blockchain data:', error);
        setLoading(false);
      }
    }

    fetchBlockchainData();
  }, []);

  useEffect(() => {
    async function loadShowsWithMovies() {
      if (!showsData || !moviesData) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const currentTime = Math.floor(Date.now() / 1000);
      const threeHoursInSeconds = 3 * 60 * 60;

      const showsWithDetails = await Promise.all(
        showsData
          .filter(show => {
            // Filter: show must be active AND not expired (within 3 hours after showtime)
            if (!show || show.id === undefined || show.movieId === undefined) return false;
            const showExpired = Number(show.showtime) + threeHoursInSeconds < currentTime;
            return !!show.active && !showExpired;
          })
          .map(async (show) => {
            const movie = moviesData.find(m => m && m.id === show.movieId);
            let metadata = null;

            if (movie && movie.metadataURI) {
              try {
                metadata = await ipfsService.getJSON(movie.metadataURI);
              } catch (error) {
                console.error('Failed to fetch metadata:', error);
              }
            }

            return { ...show, movie, metadata };
          })
      );

      setShows(showsWithDetails);
      setLoading(false);
    }

    loadShowsWithMovies();
  }, [showsData, moviesData]);

  // Note: Allow browsing without a connected wallet. Connecting is required only to purchase.

  return (
    <div className="min-h-screen">
      <nav className="relative z-10 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center border-b border-white/10 gap-4 bg-black/50 backdrop-blur-md">
        <div className="flex gap-4 md:gap-6 flex-wrap justify-center">
          <Link href="/" className="text-xl md:text-2xl font-bold text-gradient hover:scale-105 transition">
            🎬 MOVIEX
          </Link>
          <Link href="/customer" className="link-accent transition text-sm md:text-base">📽️ Browse</Link>
          <Link href="/customer/tickets" className="link-accent transition text-sm md:text-base">🎫 My Tickets</Link>
          <Link href="/customer/pyusd-setup" className="text-gradient hover:opacity-80 transition text-sm md:text-base">💰 PYUSD Setup</Link>
        </div>
        <WalletConnect />
      </nav>

      <main className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12">
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8 rounded-xl border border-white/10 panel p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-gradient">Browse showtimes without a wallet</p>
              <p className="text-sm text-gray-400">Connect your wallet to buy tickets and manage your purchases.</p>
            </div>
            <div className="shrink-0">
              <WalletConnect />
            </div>
          </motion.div>
        )}
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-gradient"
        >
          🎞️ Available Showtimes
        </motion.h2>
        
        {loading ? (
          <div className="text-center py-16">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xl text-gradient"
            >
              Loading showtimes from blockchain...
            </motion.p>
          </div>
        ) : shows.length === 0 ? (
          <div className="panel p-12 text-center">
            <p className="text-xl text-gray-400">No showtimes available yet.</p>
            <p className="text-sm text-gray-500 mt-2">Theater owners haven't added any shows yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.filter(s => s && s.id !== undefined && s.movieId !== undefined).map((show, index) => {
              const showIdStr = typeof show.id === 'bigint' ? show.id.toString() : String(show.id);
              const movieIdStr = typeof show.movieId === 'bigint' ? show.movieId.toString() : String(show.movieId);
              return (
              <motion.div
                key={showIdStr}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Link 
                  href={`/movie/${movieIdStr}?showId=${showIdStr}`}
                  className="block"
                >
                  <div className="panel p-6 h-full transition cursor-pointer">
                    {show.metadata?.posterImage && (
                      <motion.img 
                        whileHover={{ scale: 1.05 }}
                        src={ipfsService.gatewayURL(show.metadata.posterImage)} 
                        alt={show.movie?.title || 'Movie'}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    
                    <h3 className="text-2xl font-bold mb-2 text-gradient">{show.movie?.title || 'Unnamed Movie'}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-400">
                        📅 {new Date(Number(show.showtime) * 1000).toLocaleString()}
                      </p>
                      {show.metadata?.description && (
                        <p className="text-sm text-gray-300 line-clamp-2">{show.metadata.description}</p>
                      )}
                      <p className="text-sm text-gray-400">
                        🎫 {Number(show.availableSeats)}/{Number(show.totalSeats)} seats
                      </p>
                      <p className="text-2xl font-bold text-gradient">
                        {(Number(show.ticketPrice) / 1e6).toFixed(2)} PYUSD
                      </p>
                    </div>

                    <div className="btn-accent py-3 px-4 rounded-lg font-semibold text-center transition">
                      Select Seats & Buy 🎫
                    </div>
                  </div>
                </Link>
              </motion.div>
            );})}
          </div>
        )}
      </main>
    </div>
  );
}
