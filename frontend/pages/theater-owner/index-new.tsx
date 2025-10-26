import { WalletConnect } from '@/components/WalletConnect';
import { CONTRACT_ADDRESSES } from '@/config/address';
import { MOVIE_MANAGER_ABI } from '@/lib/contracts';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ipfsService } from '@/lib/ipfs-pinata';
import { useWeb3 } from '@/contexts/Web3Context';
import { readContract, writeContract, waitForTransaction, parseUnits } from '@/lib/contract-helpers';

interface ShowTime {
  time: string;
  seats: string;
}

export default function TheaterOwnerDashboard() {
  const { address, isConnected } = useWeb3();
  const [mounted, setMounted] = useState(false);
  
  // Movie form state
  const [step, setStep] = useState<'movie' | 'shows'>('movie');
  const [movieId, setMovieId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    ageRestriction: '0',
    ticketPrice: '',
    description: '',
    posterImage: null as File | null,
  });
  
  // Multiple showtimes
  const [showtimes, setShowtimes] = useState<ShowTime[]>([
    { time: '', seats: '50' }
  ]);
  
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [posterPreview, setPosterPreview] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [txStartTime, setTxStartTime] = useState<number>(0);
  
  // Alert tracking to prevent loops
  const [alertShown, setAlertShown] = useState<{[key: string]: boolean}>({});

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  // Local tx state
  const [addMovieHash, setAddMovieHash] = useState<string>('');
  const [addMovieLoading, setAddMovieLoading] = useState(false);
  const [movieError, setMovieError] = useState<Error | null>(null);
  const [isMoviePending, setIsMoviePending] = useState(false);
  const [addMovieSuccess, setAddMovieSuccess] = useState(false);

  const [showError, setShowError] = useState<Error | null>(null);
  const [isShowTxError, setIsShowTxError] = useState(false);

  // Fetch user's movies
  const [allMovies, setAllMovies] = useState<any[] | null>(null);
  const refetchMovies = async () => {
    try {
      const movies = await readContract(
        CONTRACT_ADDRESSES.movieManager,
        MOVIE_MANAGER_ABI,
        'getAllMovies',
        []
      );
      setAllMovies(movies as any[]);
    } catch (e) {
      console.error('Error fetching movies:', e);
      setAllMovies([]);
    }
  };

  useEffect(() => {
    if (isConnected) refetchMovies();
  }, [isConnected]);

  const userMovies = allMovies ? (allMovies as any[]).filter(m => m.owner.toLowerCase() === address?.toLowerCase() && m.active) : [];

  // Debug log movies whenever they change
  useEffect(() => {
    console.log('📽️ All Movies:', allMovies);
    console.log('👤 User Address:', address);
    console.log('🎬 User Movies:', userMovies);
  }, [allMovies, address, userMovies]);

  // Refetch movies when switching to shows tab
  useEffect(() => {
    if (step === 'shows') {
      console.log('🔄 Switched to shows tab - refetching movies...');
      refetchMovies();
    }
  }, [step, refetchMovies]);

  // Show live status updates
  useEffect(() => {
    if (isMoviePending) {
      setUploadStatus('📝 Waiting for MetaMask approval...');
    }
  }, [isMoviePending]);

  useEffect(() => {
    if (addMovieHash && addMovieLoading) {
      setTxHash(addMovieHash);
      setTxStartTime(Date.now());
      setUploadStatus(`⏳ Confirming transaction... Hash: ${addMovieHash.slice(0, 10)}...${addMovieHash.slice(-8)}`);
      console.log('🔗 Transaction hash:', addMovieHash);
      console.log('🔍 View on Etherscan:', `https://sepolia.etherscan.io/tx/${addMovieHash}`);
    }
  }, [addMovieHash, addMovieLoading]);

  useEffect(() => {
    if (movieError && !alertShown['movieTxError']) {
      console.error('❌ Transaction failed:', movieError);
      setUploadStatus(`❌ Transaction failed: ${movieError.message}`);
      alert(`❌ Transaction Failed!\n\n${movieError.message}\n\nPlease try again.`);
      setUploading(false);
      setAlertShown(prev => ({ ...prev, movieTxError: true }));
    }
  }, [movieError, alertShown]);

  useEffect(() => {
    if (movieError && !alertShown['movieError']) {
      console.error('❌ Movie error:', movieError);
      alert(`❌ Error: ${movieError.message}`);
      setUploadStatus('');
      setUploading(false);
      setAlertShown(prev => ({ ...prev, movieError: true }));
    }
  }, [movieError, alertShown]);

  // Handle show transaction errors
  useEffect(() => {
    if (isShowTxError && showError && !alertShown['showTxError']) {
      console.error('❌ Show transaction failed:', showError);
      alert(`❌ Show Transaction Failed!\n\n${showError.message}\n\nPlease try again.`);
      setUploadStatus('');
      setUploading(false);
      setAlertShown(prev => ({ ...prev, showTxError: true }));
    }
  }, [isShowTxError, showError, alertShown]);

  useEffect(() => {
    if (showError && !alertShown['showError']) {
      console.error('❌ Show error:', showError);
      alert(`❌ Error adding show: ${showError.message}`);
      setUploadStatus('');
      setUploading(false);
      setAlertShown(prev => ({ ...prev, showError: true }));
    }
  }, [showError, alertShown]);

  // Handle poster image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, posterImage: file });
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  // Add/remove showtimes
  const addShowtime = () => {
    setShowtimes([...showtimes, { time: '', seats: '50' }]);
  };

  const removeShowtime = (index: number) => {
    setShowtimes(showtimes.filter((_, i) => i !== index));
  };

  const updateShowtime = (index: number, field: 'time' | 'seats', value: string) => {
    const updated = [...showtimes];
    updated[index][field] = value;
    setShowtimes(updated);
  };

  // Step 1: Add Movie
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.posterImage) {
      alert('Please upload a poster image!');
      return;
    }

    setUploading(true);
    setUploadStatus('📤 Step 1/3: Uploading poster image to IPFS...');

    try {
      // Upload poster image
      const posterCID = await ipfsService.uploadFile(formData.posterImage);
      console.log('✅ Poster uploaded:', posterCID);

      // Step 2: Upload metadata to IPFS
      setUploadStatus('📤 Step 2/3: Uploading metadata to IPFS...');
      const metadata = {
        title: formData.title,
        description: formData.description,
        ageRestriction: parseInt(formData.ageRestriction),
        posterImage: `https://ipfs.io/ipfs/${posterCID}`,
        createdAt: Date.now(),
      };

      const metadataURI = await ipfsService.uploadJSON(metadata);
      console.log('✅ Metadata uploaded:', metadataURI);
      
      // Step 3: Add movie to blockchain
      setUploadStatus('⛓️ Step 3/3: Adding movie to blockchain...');
      
      try {
        setIsMoviePending(true);
        const tx = await writeContract(
          CONTRACT_ADDRESSES.movieManager,
          MOVIE_MANAGER_ABI,
          'addMovie',
          [
            formData.title,
            parseInt(formData.ageRestriction),
            metadataURI,
          ]
        );
        setAddMovieHash(tx.hash);
        setAddMovieLoading(true);
        await waitForTransaction(tx.hash);
        setAddMovieSuccess(true);
      } catch (e: any) {
        setMovieError(e);
      } finally {
        setIsMoviePending(false);
        setAddMovieLoading(false);
      }

    } catch (error: any) {
      console.error('Error:', error);
      alert(`Failed: ${error.message}`);
      setUploadStatus('');
      setUploading(false);
    }
  };

  // Step 2: Add Shows
  const handleAddShows = async () => {
    if (!movieId) {
      alert('Please select a movie first!');
      return;
    }

    if (!formData.ticketPrice || parseFloat(formData.ticketPrice) <= 0) {
      alert('Please enter a valid ticket price greater than 0!');
      return;
    }

    const validShowtimes = showtimes.filter(st => st.time && st.seats);
    if (validShowtimes.length === 0) {
      alert('Please add at least one showtime!');
      return;
    }

    setUploading(true);
    const txHashes: string[] = [];

    try {
      for (let i = 0; i < validShowtimes.length; i++) {
        const showtime = validShowtimes[i];
        setUploadStatus(`⏳ Adding show ${i + 1}/${validShowtimes.length}...`);

        const showtimeUnix = Math.floor(new Date(showtime.time).getTime() / 1000);
        const priceInPYUSD = parseUnits(formData.ticketPrice, 6);
        const nowUnix = Math.floor(Date.now() / 1000);

        // Validation
        console.log('🎬 Adding show:', {
          movieId,
          showtimeUnix,
          showtimeDate: new Date(showtimeUnix * 1000).toLocaleString(),
          nowUnix,
          nowDate: new Date().toLocaleString(),
          isFuture: showtimeUnix > nowUnix,
          ticketPrice: formData.ticketPrice,
          priceInPYUSD: priceInPYUSD.toString(),
          seats: showtime.seats,
        });

        if (showtimeUnix <= nowUnix) {
          throw new Error(`Showtime must be in the future! Selected: ${new Date(showtimeUnix * 1000).toLocaleString()}`);
        }

        try {
          const tx = await writeContract(
            CONTRACT_ADDRESSES.movieManager,
            MOVIE_MANAGER_ABI,
            'addShow',
            [
              BigInt(movieId),
              BigInt(showtimeUnix),
              priceInPYUSD,
              BigInt(showtime.seats),
            ]
          );
          
          txHashes.push(tx.hash);
          console.log(`✅ Show ${i + 1} transaction sent: ${tx.hash}`);
          
          // Immediate feedback after MetaMask approval
          setUploadStatus(`✅ Show ${i + 1}/${validShowtimes.length} transaction approved! Processing...`);
          
          // Don't wait for confirmation - process in background
          waitForTransaction(tx.hash).then(() => {
            console.log(`✅ Show ${i + 1} confirmed on blockchain!`);
          }).catch(err => {
            console.error(`❌ Show ${i + 1} failed:`, err);
          });
          
        } catch (err: any) {
          setShowError(err);
          throw err;
        }
      }

      // Immediate success message after last MetaMask approval
      setUploadStatus(`🎉 All ${validShowtimes.length} show(s) submitted successfully!`);
      
      // Quick success alert and reset
      setTimeout(() => {
        alert(`✅ Success! ${validShowtimes.length} show(s) added!\n\nTransactions processing on blockchain.\nView in Analytics in 10-20 seconds.`);
        setStep('movie');
        setShowtimes([{ time: '', seats: '50' }]);
        setUploadStatus('');
        setUploading(false);
        
        // Trigger refresh after short delay
        setTimeout(() => refetchMovies(), 1500);
      }, 300);

    } catch (error: any) {
      console.error('Error:', error);
      alert(`Failed: ${error.message}`);
      setUploading(false);
      setUploadStatus('');
    }
  };

  // Handle movie creation success
  useEffect(() => {
    if (addMovieSuccess && addMovieHash && !alertShown['movieSuccess']) {
      console.log('✅✅✅ MOVIE TRANSACTION CONFIRMED! ✅✅✅');
      console.log('Transaction hash:', addMovieHash);
      
      setUploadStatus('✅ Movie confirmed! Refreshing...');
      setAlertShown(prev => ({ ...prev, movieSuccess: true }));
      
      // Force immediate refetch multiple times to ensure it updates
  refetchMovies();
      setTimeout(() => refetchMovies(), 1000);
      setTimeout(() => refetchMovies(), 3000);
      
      // Show success message ONCE
      setTimeout(() => {
        const successMsg = `🎉 SUCCESS!\n\nMovie added to blockchain!\n\nTransaction: ${addMovieHash}\n\nNow add showtimes for this movie.`;
        alert(successMsg);
        console.log('✅ Switching to Add Showtimes tab');
        
        // Switch to shows tab and clear status
        setStep('shows');
        setUploading(false);
        setUploadStatus('');
        setTxHash('');
        setTxStartTime(0);
        
        // Reset form but KEEP ticketPrice for shows
        setFormData({
          title: '',
          ageRestriction: '0',
          ticketPrice: formData.ticketPrice, // Preserve for shows
          description: '',
          posterImage: null,
        });
        setPosterPreview('');
        
        // Force one final refetch after tab switch
        setTimeout(() => refetchMovies(), 500);
      }, 1500);
    }
  }, [addMovieSuccess, addMovieHash, refetchMovies, formData.ticketPrice]);

  // Prevent hydration mismatch - wait for client-side mount
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 pointer-events-none"></div>

      <nav className="relative z-10 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center border-b border-white/10 gap-4">
        <Link href="/">
          <h1 className="text-xl md:text-2xl font-bold cursor-pointer text-gradient hover:scale-105 transition">🎬 MOVIEX Theater</h1>
        </Link>
        <div className="flex gap-2 md:gap-4 items-center flex-wrap justify-center">
          <Link href="/theater-owner/analytics" className="link-accent text-sm md:text-base">
            📊 Analytics
          </Link>
          <Link href="/theater-owner/verify-ticket" className="link-accent text-sm md:text-base">
            📷 Scan Tickets
          </Link>
          <WalletConnect />
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-4xl">
  <motion.h2 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-gradient">Theater Owner Dashboard</motion.h2>

        {/* Step Indicator */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-6 md:mb-8">
          <button
            onClick={() => setStep('movie')}
            className={`flex-1 py-2 md:py-3 rounded-lg font-semibold transition text-sm md:text-base ${step === 'movie' ? 'bg-cyan-600' : 'bg-white/10 hover:bg-white/20'}`}
          >
            1️⃣ Add Movie
          </button>
          <button
            onClick={() => setStep('shows')}
            className={`flex-1 py-2 md:py-3 rounded-lg font-semibold transition text-sm md:text-base ${step === 'shows' ? 'bg-cyan-600' : 'bg-white/10 hover:bg-white/20'}`}
          >
            2️⃣ Add Showtimes {userMovies.length > 0 && `(${userMovies.length})`}
          </button>
        </div>

        {/* Live Status Box */}
        {uploadStatus && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            uploadStatus.includes('✅') ? 'bg-green-500/20 border-green-500' :
            uploadStatus.includes('❌') ? 'bg-red-500/20 border-red-500' :
            uploadStatus.includes('⏳') ? 'bg-yellow-500/20 border-yellow-500' :
            'bg-blue-500/20 border-blue-500'
          }`}>
            <div className="font-bold text-lg">{uploadStatus}</div>
            {txHash && (
              <a 
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline mt-2 block hover:text-blue-300"
              >
                🔍 View on Etherscan →
              </a>
            )}
            {addMovieLoading && (
              <div className="mt-2 text-sm">
                ⏰ Waiting for blockchain confirmation... This may take 10-30 seconds.
              </div>
            )}
          </div>
        )}

        {step === 'movie' ? (
          /* ADD MOVIE FORM */
          <div className="panel p-8">
            <h3 className="text-2xl font-bold mb-6 text-gradient">Add New Movie</h3>

            <form onSubmit={handleAddMovie} className="space-y-4">
              {/* Poster Image */}
              <div>
                <label className="block mb-2 font-semibold">🖼️ Movie Poster</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleImageChange}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-cyan-600 file:text-white hover:border-cyan-500 transition"
                />
                {posterPreview && (
                  <img src={posterPreview} alt="Preview" className="mt-4 max-w-xs rounded-lg" />
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block mb-2 font-semibold text-gray-300">🎬 Movie Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                  placeholder="Enter movie title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2 font-semibold text-gray-300">📝 Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                  rows={3}
                  placeholder="Enter movie description"
                />
              </div>

              {/* Age Restriction */}
              <div>
                <label className="block mb-2 font-semibold text-gray-300">🔞 Age Restriction</label>
                <select
                  value={formData.ageRestriction}
                  onChange={(e) => setFormData({ ...formData, ageRestriction: e.target.value })}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                >
                  <option value="0" className="bg-gray-900">No Restriction</option>
                  <option value="12" className="bg-gray-900">12+</option>
                  <option value="18" className="bg-gray-900">18+</option>
                </select>
              </div>

              {/* Ticket Price */}
              <div>
                <label className="block mb-2 font-semibold text-gray-300">💰 Ticket Price (PYUSD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                  placeholder="10.00"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full btn-accent disabled:bg-gray-600 py-4 rounded-lg font-bold text-xl"
              >
                {uploading ? uploadStatus || 'Processing...' : '🎬 Add Movie'}
              </button>
            </form>
          </div>
        ) : (
          /* ADD SHOWS FORM */
          <div className="panel p-8">
            <h3 className="text-2xl font-bold mb-6 text-gradient">Add Showtimes</h3>

            {/* Select Movie */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-300">🎬 Select Movie</label>
              <select
                value={movieId}
                onChange={(e) => setMovieId(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
              >
                <option value="" className="bg-gray-900">-- Choose Movie --</option>
                {userMovies.map((movie: any) => (
                  <option key={movie.id.toString()} value={movie.id.toString()} className="bg-gray-900">
                    {movie.title} (ID: {movie.id.toString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Showtimes */}
            <div className="space-y-4 mb-6">
              {showtimes.map((showtime, index) => (
                <div key={index} className="panel p-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold">Showtime {index + 1}</label>
                    {showtimes.length > 1 && (
                      <button
                        onClick={() => removeShowtime(index)}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm"
                      >
                        ❌ Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm text-gray-300">📅 Date & Time</label>
                      <input
                        type="datetime-local"
                        value={showtime.time}
                        onChange={(e) => updateShowtime(index, 'time', e.target.value)}
                        className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm text-gray-300">💺 Total Seats</label>
                      <input
                        type="number"
                        value={showtime.seats}
                        onChange={(e) => updateShowtime(index, 'seats', e.target.value)}
                        className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                        placeholder="50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ticket Price for ALL Shows */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-300">💰 Ticket Price (PYUSD) - Same for all shows</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 outline-none transition"
                placeholder="10.00"
              />
              <p className="text-sm text-gray-400 mt-1">Enter price per ticket in PYUSD (e.g., 10.00)</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={addShowtime}
                className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold"
              >
                ➕ Add Another Showtime
              </button>
              <button
                onClick={handleAddShows}
                disabled={uploading || !movieId || !formData.ticketPrice || parseFloat(formData.ticketPrice) <= 0}
                className="flex-1 btn-accent disabled:bg-gray-600 py-3 rounded-lg font-semibold"
              >
                {uploading ? uploadStatus : '🎭 Add All Shows'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
