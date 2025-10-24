'use client';

import { useWeb3 } from '@/contexts/Web3Context';
import { readContract } from '@/lib/contract-helpers';
import { WalletConnect } from '@/components/WalletConnect';
import { CONTRACT_ADDRESSES } from '@/config/address';
import { MOVIE_MANAGER_ABI, TICKET_ESCROW_ABI } from '@/lib/contracts';
import { getTheaterAnalytics, getPurchasesByShow } from '@/lib/envio';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Chart colors
const COLORS = ['#22d3ee', '#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
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
  ageRating: bigint;
  metadataHash: string;
  isActive: boolean;
}
export default function Analytics() {
  const { address, isConnected } = useWeb3();
  const [selectedShow, setSelectedShow] = useState<string>('');
  const [userMovies, setUserMovies] = useState<any[]>([]);
  const [userShows, setUserShows] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [moviesData, setMoviesData] = useState<Movie[] | null>(null);
  const [showsData, setShowsData] = useState<Show[] | null>(null);
  const [bookingStats, setBookingStats] = useState<any | null>(null);

  // Load movies and shows from contract
  useEffect(() => {
    if (!isConnected) return;
    const load = async () => {
      try {
        const [movies, shows] = await Promise.all([
          readContract(
            CONTRACT_ADDRESSES.movieManager,
            MOVIE_MANAGER_ABI,
            'getAllMovies',
            []
          ) as Promise<Movie[]>,
          readContract(
            CONTRACT_ADDRESSES.movieManager,
            MOVIE_MANAGER_ABI,
            'getAllShows',
            []
          ) as Promise<Show[]>,
        ]);
        setMoviesData(movies);
        setShowsData(shows);
      } catch (e) {
        console.error('Error loading movies/shows:', e);
      }
    };
    load();
  }, [isConnected]);

  // Get booking stats from contract (not indexed by Envio)
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedShow) {
        setBookingStats(null);
        return;
      }
      try {
        const stats = await readContract(
          CONTRACT_ADDRESSES.ticketEscrow,
          TICKET_ESCROW_ABI,
          'getShowBookingStats',
          [BigInt(selectedShow)]
        );
        setBookingStats(stats);
      } catch (e) {
        console.error('Error loading booking stats:', e);
        setBookingStats(null);
      }
    };
    fetchStats();
  }, [selectedShow]);

  // Load theater analytics from Envio when address is available
  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }
    
    const loadAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
  console.log('📊 Loading analytics from Envio for:', address);
  console.log('   Envio URL:', process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL || 'http://localhost:8080/v1/graphql');
        
        const data = await getTheaterAnalytics(address);
        
        console.log('✅ Envio data received:', data);
        console.log('   Movies:', data.movies);
        console.log('   Shows from contract:', showsData);
        
        if (!data.movies || data.movies.length === 0) {
          console.log('⚠️ No movies found in Envio for this address');
          setError('No movies found. Create a movie first!');
          setUserMovies([]);
          setUserShows([]);
          setLoading(false);
          return;
        }
        
        // Set movies from Envio
        const movies = data.movies.map((m: any) => ({
          id: BigInt(m.movieId),
          title: m.title,
          owner: m.owner,
          movieId: BigInt(m.movieId),
        }));
        
        console.log('✅ Processed movies:', movies);
        setUserMovies(movies);
        
        // Map shows from contract data (filter by owner's movies)
        if (showsData && (showsData as any[]).length > 0) {
          const movieIds = movies.map(m => m.id.toString());
          console.log('   Movie IDs to filter:', movieIds);
          
          const filteredShows = (showsData as any[]).filter(s => {
            const match = movieIds.includes(s.movieId.toString());
            console.log(`   Show ${s.id}: movieId=${s.movieId}, match=${match}`);
            return match;
          });
          
          console.log('✅ Filtered shows:', filteredShows);
          setUserShows(filteredShows);
          
          if (filteredShows.length === 0) {
            setError('Movies found but no shows. Add shows to your movies!');
          } else {
            setError(''); // Clear error if we have shows
          }
        } else {
          console.log('⚠️ No shows found in contract');
          setUserShows([]);
          setError('No shows found. Add shows to your movies!');
        }
      } catch (error) {
        console.error('❌ Error loading Envio analytics:', error);
        setError(`Failed to load analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [address, showsData]);

  // Load purchases for selected show from Envio
  useEffect(() => {
    if (!selectedShow) {
      setPurchases([]);
      return;
    }

    const loadPurchases = async () => {
      try {
        console.log('🎫 Loading purchases from Envio for show:', selectedShow);
        const data = await getPurchasesByShow(selectedShow);
        console.log('✅ Purchases from Envio:', data);
        
        const purchaseList = data.TicketEscrow_TicketPurchased.map((p: any) => ({
          purchaseId: BigInt(p.purchaseId),
          showId: BigInt(p.showId),
          buyer: p.buyer,
          amount: BigInt(p.amount),
          seatNumbers: p.seatNumbers.map((s: string) => BigInt(s)),
        }));
        
        setPurchases(purchaseList);
      } catch (error) {
        console.error('❌ Error loading purchases from Envio:', error);
        setPurchases([]);
      }
    };

    loadPurchases();
  }, [selectedShow]);

  const selectedShowData = userShows.find(s => s.id.toString() === selectedShow);
  const selectedMovieData = selectedShowData ? userMovies.find(m => m.id.toString() === selectedShowData.movieId.toString()) : null;

  // Prepare chart data
  const movieRevenueData = userShows.map(show => {
    const movie = userMovies.find(m => m.id.toString() === show.movieId.toString());
    const seatsSold = Number(show.totalSeats) - Number(show.availableSeats);
    const revenue = seatsSold * Number(show.ticketPrice) / 1e6;
    
    return {
      name: movie?.title.substring(0, 15) + '...',
      fullName: movie?.title,
      revenue: revenue,
      seatsSold: seatsSold,
      totalSeats: Number(show.totalSeats),
      occupancy: (seatsSold / Number(show.totalSeats)) * 100,
    };
  });

  const showOccupancyData = userShows.map(show => {
    const movie = userMovies.find(m => m.id.toString() === show.movieId.toString());
    const seatsSold = Number(show.totalSeats) - Number(show.availableSeats);
    const occupancy = (seatsSold / Number(show.totalSeats)) * 100;
    
    return {
      name: `${movie?.title.substring(0, 10)}... ${new Date(Number(show.showtime) * 1000).toLocaleDateString()}`,
      occupied: seatsSold,
      available: Number(show.availableSeats),
      occupancyRate: occupancy,
    };
  });

  const totalStats = {
    totalMovies: userMovies.length,
    totalShows: userShows.length,
    totalRevenue: movieRevenueData.reduce((sum, d) => sum + d.revenue, 0),
    totalSeatsSold: movieRevenueData.reduce((sum, d) => sum + d.seatsSold, 0),
    avgOccupancy: movieRevenueData.length > 0 
      ? movieRevenueData.reduce((sum, d) => sum + d.occupancy, 0) / movieRevenueData.length 
      : 0,
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6 accent-heading">Connect Your Wallet</h2>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="p-6 flex justify-between items-center border-b border-white/10 bg-black/50 backdrop-blur-md">
        <Link href="/theater-owner">
          <h1 className="text-2xl font-bold cursor-pointer text-cyan-300 hover:scale-105 transition">🎬 MOVIEX Theater</h1>
        </Link>
        <WalletConnect />
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-5xl font-bold mb-2 accent-heading">📊 Theater Analytics</h2>
          <p className="text-gray-400 text-lg">Real-time insights powered by Envio</p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
            <p className="text-xl text-gray-400">Loading analytics from Envio...</p>
          </div>
        )}

        {!loading && error && (
          <div className="panel border border-red-500/50 p-8 text-center">
            <p className="text-2xl mb-2">⚠️ {error}</p>
            <Link href="/theater-owner">
              <button className="mt-4 btn-accent">Go to Dashboard</button>
            </Link>
          </div>
        )}

        {!loading && !error && userMovies.length > 0 && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="panel p-6 hover:scale-105 transition transform">
                <div className="text-3xl mb-2">🎬</div>
                <h3 className="text-sm text-gray-300 mb-1">Total Movies</h3>
                <p className="text-4xl font-bold text-cyan-300">{totalStats.totalMovies}</p>
              </div>
              <div className="panel p-6 hover:scale-105 transition transform">
                <div className="text-3xl mb-2">🎭</div>
                <h3 className="text-sm text-gray-300 mb-1">Total Shows</h3>
                <p className="text-4xl font-bold text-cyan-300">{totalStats.totalShows}</p>
              </div>
              <div className="panel p-6 hover:scale-105 transition transform">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="text-sm text-gray-300 mb-1">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-400">{totalStats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-400">PYUSD</p>
              </div>
              <div className="panel p-6 hover:scale-105 transition transform">
                <div className="text-3xl mb-2">🪑</div>
                <h3 className="text-sm text-gray-300 mb-1">Seats Sold</h3>
                <p className="text-4xl font-bold text-cyan-300">{totalStats.totalSeatsSold}</p>
              </div>
              <div className="panel p-6 hover:scale-105 transition transform">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="text-sm text-gray-300 mb-1">Avg Occupancy</h3>
                <p className="text-4xl font-bold text-cyan-300">{totalStats.avgOccupancy.toFixed(0)}%</p>
              </div>
            </div>

            {/* Revenue Chart */}
            {movieRevenueData.length > 0 && (
              <div className="panel p-6 mb-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="mr-2">💵</span> Revenue by Movie
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={movieRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#22d3ee20" />
                    <XAxis dataKey="name" stroke="#ffffff80" />
                    <YAxis stroke="#ffffff80" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0b1220', 
                        border: '1px solid #22d3ee',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'revenue') return [`${Number(value).toFixed(2)} PYUSD`, 'Revenue'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#22d3ee" name="Revenue (PYUSD)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Occupancy Chart */}
            {showOccupancyData.length > 0 && (
              <div className="panel p-6 mb-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="mr-2">🪑</span> Seat Occupancy by Show
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={showOccupancyData}>
                    <defs>
                      <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#22d3ee20" />
                    <XAxis dataKey="name" stroke="#ffffff80" />
                    <YAxis stroke="#ffffff80" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0b1220', 
                        border: '1px solid #22d3ee',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="occupied" stroke="#10b981" fillOpacity={1} fill="url(#colorOccupied)" name="Seats Sold" />
                    <Area type="monotone" dataKey="available" stroke="#ef4444" fillOpacity={1} fill="url(#colorAvailable)" name="Available Seats" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Movie Performance Pie Chart */}
            {movieRevenueData.length > 0 && (
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="panel p-6">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="mr-2">🎯</span> Revenue Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={movieRevenueData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name}: ${entry.revenue.toFixed(1)} PYUSD`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {movieRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0b1220', 
                          border: '1px solid #22d3ee',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                        formatter={(value: any) => [`${Number(value).toFixed(2)} PYUSD`, 'Revenue']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="panel p-6">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="mr-2">📊</span> Seats Sold Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={movieRevenueData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name}: ${entry.seatsSold}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="seatsSold"
                      >
                        {movieRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0b1220', 
                          border: '1px solid #22d3ee',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                        formatter={(value: any) => [value, 'Seats Sold']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Show Details Selector */}
            <div className="panel p-6 mb-6">
              <label className="block mb-4 text-xl font-semibold flex items-center">
                <span className="mr-2">🔍</span> Detailed Show Analysis
              </label>
              <select
                value={selectedShow}
                onChange={(e) => setSelectedShow(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white text-lg hover:bg-black/60 transition"
              >
                <option value="">-- Choose Show --</option>
                {userShows.map((show: any) => {
                  const movie = userMovies.find(m => m.id.toString() === show.movieId.toString());
                  return (
                    <option key={show.id.toString()} value={show.id.toString()}>
                      {movie?.title} - {new Date(Number(show.showtime) * 1000).toLocaleString()}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected Show Details */}
            {selectedShow && bookingStats && (
              <>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="panel p-6 hover:scale-105 transition transform">
                    <h3 className="text-lg mb-2 text-blue-300">Total Bookings</h3>
                    <p className="text-5xl font-bold text-blue-400">{(bookingStats as any).totalBookings?.toString() || '0'}</p>
                  </div>
                  <div className="panel p-6 hover:scale-105 transition transform">
                    <h3 className="text-lg mb-2 text-green-300">Revenue</h3>
                    <p className="text-4xl font-bold text-green-400">{(Number((bookingStats as any).totalRevenue || 0) / 1e6).toFixed(2)}</p>
                    <p className="text-sm text-gray-400">PYUSD</p>
                  </div>
                  <div className="panel p-6 hover:scale-105 transition transform">
                    <h3 className="text-lg mb-2 text-purple-300">Seats Sold</h3>
                    <p className="text-5xl font-bold text-cyan-300">{Number(selectedShowData.totalSeats)-Number(selectedShowData.availableSeats) || '0'}</p>
                  </div>
                </div>

                <div className="panel p-6 mb-6">
                  <h3 className="text-2xl font-bold mb-4 flex items-center">
                    <span className="mr-2">🎬</span> Show Details
                  </h3>
                  {selectedMovieData && selectedShowData && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Movie</p>
                        <p className="text-xl font-bold">{selectedMovieData.title}</p>
                      </div>
                      <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Showtime</p>
                        <p className="text-xl font-bold">{new Date(Number(selectedShowData.showtime) * 1000).toLocaleString()}</p>
                      </div>
                      <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Ticket Price</p>
                        <p className="text-xl font-bold">{Number(selectedShowData.ticketPrice) / 1e6} PYUSD</p>
                      </div>
                      <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Capacity</p>
                        <p className="text-xl font-bold">{Number(selectedShowData.totalSeats)} seats</p>
                      </div>
                      <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Available</p>
                        <p className="text-xl font-bold text-green-400">{Number(selectedShowData.availableSeats)} seats</p>
                      </div>
                      <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Occupancy Rate</p>
                        <p className="text-xl font-bold text-cyan-300">
                          {(((Number(selectedShowData.totalSeats) - Number(selectedShowData.availableSeats)) / Number(selectedShowData.totalSeats)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="panel p-6">
                  <h3 className="text-2xl font-bold mb-4 flex items-center">
                    <span className="mr-2">🎫</span> Purchase History
                  </h3>
                  {loading ? (
                    <p className="text-center py-4 text-gray-400">Loading purchases from Envio...</p>
                  ) : purchases.length > 0 ? (
                    <div className="space-y-3">
                      {purchases.map((purchase: any) => (
                        <div key={purchase.purchaseId.toString()} className="bg-black/40 rounded-lg p-4 border border-white/10 hover:border-cyan-400/50 transition">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm text-gray-400">Purchase #{purchase.purchaseId.toString()}</p>
                              <p className="text-lg font-semibold text-cyan-300">
                                {purchase.buyer.slice(0, 6)}...{purchase.buyer.slice(-4)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-400">
                                {(Number(purchase.amount) / 1e6).toFixed(2)} PYUSD
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm mt-3">
                            <div className="bg-black/40 border border-white/10 rounded px-3 py-1">
                              <p className="text-gray-400">Seats</p>
                              <p className="font-semibold text-blue-400">
                                {purchase.seatNumbers?.map((s: bigint) => s.toString()).join(', ') || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🎭</div>
                      <p className="text-xl text-gray-400">No purchases yet for this show</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {!selectedShow && userShows.length > 0 && (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">📊</div>
                <p className="text-2xl text-gray-400 mb-2">Select a show above to view detailed analytics</p>
                <p className="text-gray-500">Purchase history and booking stats will appear here</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}


