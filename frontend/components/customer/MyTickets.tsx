'use client';

import { WalletConnect } from '@/components/WalletConnect';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { CONTRACT_ADDRESSES } from '@/config/address';
import { TICKET_ESCROW_ABI, TICKET_NFT_ABI, MOVIE_MANAGER_ABI } from '@/lib/contracts';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useWeb3 } from '@/contexts/Web3Context';
import { readContract, writeContract, waitForTransaction } from '@/lib/contract-helpers';

// Dynamic import for QR code to avoid SSR issues
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  { ssr: false }
);

interface Purchase {
  movieId: bigint;
  showId: bigint;
  buyer: string;
  amount: bigint;
  issued: boolean;
  timestamp: bigint;
  seatNumbers: bigint[];
}

export default function MyTickets() {
  const { address, isConnected } = useWeb3();
  const router = useRouter();
  const [purchases, setPurchases] = useState<{ id: bigint; data: Purchase }[]>([]);
  const [purchaseIds, setPurchaseIds] = useState<bigint[] | null>(null);
  const [ticketIds, setTicketIds] = useState<bigint[] | null>(null);
  const highlightPurchaseId = typeof router.query.purchaseId === 'string' ? router.query.purchaseId : null;

  useEffect(() => {
    if (!address) return;
    const load = async () => {
      try {
        const [pIds, tIds] = await Promise.all([
          readContract(
            CONTRACT_ADDRESSES.ticketEscrow,
            TICKET_ESCROW_ABI,
            'getUserPurchases',
            [address]
          ) as Promise<bigint[]>,
          readContract(
            CONTRACT_ADDRESSES.ticketNFT,
            TICKET_NFT_ABI,
            'getUserTickets',
            [address]
          ) as Promise<bigint[]>,
        ]);
        // Reorder to bring highlighted purchase to the top if provided via query
        let ordered = pIds;
        if (highlightPurchaseId) {
          ordered = [...pIds].sort((a, b) => (a.toString() === highlightPurchaseId ? -1 : b.toString() === highlightPurchaseId ? 1 : 0));
        }
        setPurchaseIds(ordered);
        setTicketIds(tIds);
      } catch (e) {
        console.error('Error loading user tickets/purchases:', e);
      }
    };
    load();
  }, [address, highlightPurchaseId]);

  useEffect(() => {
    async function fetchPurchases() {
      if (!purchaseIds || purchaseIds.length === 0) return;

      const purchaseDetails = await Promise.all(
        purchaseIds.map(async (id) => {
          return { id, data: {} as Purchase };
        })
      );
      
      setPurchases(purchaseDetails);
    }
    fetchPurchases();
  }, [purchaseIds]);

  // Scroll to the highlighted purchase if provided in query
  useEffect(() => {
    if (!highlightPurchaseId) return;
    const el = document.getElementById(`purchase-${highlightPurchaseId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightPurchaseId, purchaseIds]);

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
    <div className="min-h-screen">
      <nav className="p-6 flex justify-between items-center border-b border-white/10 panel">
        <Link href="/customer">
          <h1 className="text-2xl font-bold cursor-pointer text-gradient hover:scale-105 transition">🎬 MOVIEX</h1>
        </Link>
        <WalletConnect />
      </nav>

      <main className="container mx-auto px-6 py-8">
        <motion.h2 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-8 text-gradient">🎫 My Tickets</motion.h2>

        <div className="mb-8">
          <motion.h3 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold mb-4 text-gradient">NFT Tickets</motion.h3>
          {ticketIds && (ticketIds as bigint[]).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(ticketIds as bigint[]).map((ticketId, idx) => (
                <Link key={ticketId.toString()} href={`/ticket/${ticketId}`}>
                  <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring' }} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-violet-400 cursor-pointer transition">
                    <p className="text-xl font-bold">Ticket #{ticketId.toString()}</p>
                    <p className="text-sm text-gray-300 mt-2">Click to view details</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No NFT tickets yet</p>
          )}
        </div>

        <div>
          <motion.h3 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold mb-4 text-gradient">Pending Purchases</motion.h3>
          {purchaseIds && (purchaseIds as bigint[]).length > 0 ? (
            <div className="space-y-4">
              {(purchaseIds as bigint[]).map((purchaseId) => (
                <PurchaseCard key={purchaseId.toString()} purchaseId={purchaseId} highlight={highlightPurchaseId === purchaseId.toString()} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No purchases found</p>
          )}
        </div>
      </main>
    </div>
  );
}

function PurchaseCard({ purchaseId, highlight = false }: { purchaseId: bigint; highlight?: boolean }) {
  const { address } = useWeb3();
  const [isRefunding, setIsRefunding] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [ticketIssued, setTicketIssued] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const [alertShown, setAlertShown] = useState<{[key: string]: boolean}>({});
  const [forceQR, setForceQR] = useState(false);
  const [refundHash, setRefundHash] = useState<string | null>(null);
  const [issueHash, setIssueHash] = useState<string | null>(null);
  const [issueSuccess, setIssueSuccess] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [refundErrorMsg, setRefundErrorMsg] = useState<Error | null>(null);
  const [issueErrorMsg, setIssueErrorMsg] = useState<Error | null>(null);
  const [purchase, setPurchase] = useState<any | null>(null);
  const [movie, setMovie] = useState<any | null>(null);
  const [show, setShow] = useState<any | null>(null);

  useEffect(() => {
    const loadPurchase = async () => {
      try {
        const p = await readContract(
          CONTRACT_ADDRESSES.ticketEscrow,
          TICKET_ESCROW_ABI,
          'getPurchase',
          [purchaseId]
        );
        setPurchase(p);
      } catch (e) {
        console.error('Error loading purchase:', e);
      }
    };
    loadPurchase();
  }, [purchaseId]);

  useEffect(() => {
    const loadRelated = async () => {
      if (!purchase) return;
      try {
        const [m, s] = await Promise.all([
          readContract(
            CONTRACT_ADDRESSES.movieManager,
            MOVIE_MANAGER_ABI,
            'getMovie',
            [(purchase as any).movieId]
          ),
          readContract(
            CONTRACT_ADDRESSES.movieManager,
            MOVIE_MANAGER_ABI,
            'getShow',
            [(purchase as any).showId]
          ),
        ]);
        setMovie(m);
        setShow(s);
      } catch (e) {
        console.error('Error loading movie/show:', e);
      }
    };
    loadRelated();
  }, [purchase]);

  // Manual ticket issuance (user-triggered only)
  const handleIssueTicket = async () => {
    if (!purchase || !movie || !show || !address) return;
    
    const purchaseData = purchase as any;
    const movieData = movie as any;
    const showData = show as any;
    
    // Skip if already issued or refunded
    if (purchaseData.issued || Number(purchaseData.amount) === 0) return;
    
    setIsIssuing(true);
    
    try {
      // Generate ticket data with QR code
      const ticketData = {
        purchaseId: purchaseId.toString(),
        movieId: purchaseData.movieId.toString(),
        showId: purchaseData.showId.toString(),
        movieTitle: movieData.title,
        showtime: Number(showData.showtime) * 1000,
        buyer: address,
        seats: purchaseData.seatNumbers?.map((s: bigint) => s.toString()).join(', ') || '',
        purchaseDate: Number(purchaseData.timestamp) * 1000,
        amount: `${(Number(purchaseData.amount) / 1e6).toFixed(2)} PYUSD`,
      };

      // Generate QR code data
      const qrString = JSON.stringify(ticketData);
      setQrData(qrString);

      // Upload ticket data to IPFS (dynamically import ipfs service)
      const { ipfsService } = await import('@/lib/ipfs-pinata');
      const ticketURI = await ipfsService.uploadJSON(ticketData);
      console.log('✅ Ticket data uploaded to IPFS:', ticketURI);

      // Issue NFT ticket on-chain with increased gas limit
      const tx = await writeContract(
        CONTRACT_ADDRESSES.ticketEscrow,
        TICKET_ESCROW_ABI,
        'issueTicket',
        [purchaseId, ticketURI]
      );
      setIssueHash(tx.hash);
      await waitForTransaction(tx.hash);
      setIssueSuccess(true);

    } catch (error) {
      console.error('❌ Failed to issue ticket:', error);
      setIsIssuing(false);
      alert(`❌ Failed to issue ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle successful ticket issuance
  useEffect(() => {
    if (issueSuccess && !alertShown['issueSuccess']) {
      setTicketIssued(true);
      setIsIssuing(false);
      alert('🎉 Ticket issued successfully! NFT minted.');
      setAlertShown(prev => ({ ...prev, issueSuccess: true }));
    }
  }, [issueSuccess, alertShown]);

  // Handle issue ticket error
  useEffect(() => {
    if (issueErrorMsg && !alertShown['issueError']) {
      console.error('❌ Issue ticket error:', issueErrorMsg);
      
      // Parse specific error messages
      let errorMessage = 'Failed to issue ticket';
      if (issueErrorMsg.message?.includes('Ticket already issued')) {
        errorMessage = 'This ticket has already been issued';
      } else if (issueErrorMsg.message?.includes('Not the buyer')) {
        errorMessage = 'You are not the buyer of this ticket';
      } else if (issueErrorMsg.message?.includes('PYUSD transfer')) {
        errorMessage = 'PYUSD transfer failed. The escrow may not have enough balance. Please contact support.';
      }
      
      alert(`❌ ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
      setIsIssuing(false);
      setAlertShown(prev => ({ ...prev, issueError: true }));
    }
  }, [issueErrorMsg, alertShown]);

  // Handle successful refund
  useEffect(() => {
    if (refundSuccess && refundHash && !alertShown['refundSuccess']) {
      console.log('✅ Refund processed successfully!', refundHash);
      setIsRefunding(false);
      setAlertShown(prev => ({ ...prev, refundSuccess: true }));
      alert(`✅ Refund Successful!\n\n50% of your payment has been returned.\n\nTransaction: ${refundHash}`);
      // Reload the page to refresh purchase data
      setTimeout(() => window.location.reload(), 1000);
    }
  }, [refundSuccess, refundHash, alertShown]);

  // Handle refund transaction error
  useEffect(() => {
    if (refundErrorMsg && !alertShown['refundTxError']) {
      console.error('❌ Refund transaction failed:', refundErrorMsg);
      alert(`❌ Refund Failed!\n\n${refundErrorMsg.message}\n\nPlease try again.`);
      setIsRefunding(false);
      setAlertShown(prev => ({ ...prev, refundTxError: true }));
    }
  }, [refundErrorMsg, alertShown]);

  // Handle refund contract error
  useEffect(() => {
    if (refundErrorMsg && !alertShown['refundError']) {
      console.error('❌ Refund error:', refundErrorMsg);
      alert(`❌ Error: ${refundErrorMsg.message}`);
      setIsRefunding(false);
      setAlertShown(prev => ({ ...prev, refundError: true }));
    }
  }, [refundErrorMsg, alertShown]);

  const handleRefund = async () => {
    if (!purchase || !show) return;
    
    const purchaseData = purchase as any;
    const showData = show as any;
    const showtimeDate = new Date(Number(showData.showtime) * 1000);
    const now = new Date();

    if (showtimeDate < now) {
      alert('⚠️ Cannot refund: Show has already started!');
      return;
    }

    const refundAmount = (Number(purchaseData.amount) / 1e6) / 2;
    const confirm = window.confirm(
      `Request Refund?\n\nYou will receive: ${refundAmount.toFixed(2)} PYUSD (50%)\n\nContinue?`
    );

    if (!confirm) return;

    setIsRefunding(true);
    try {
      const tx = await writeContract(
        CONTRACT_ADDRESSES.ticketEscrow,
        TICKET_ESCROW_ABI,
        'requestRefund',
        [purchaseId]
      );
      setRefundHash(tx.hash);
      await waitForTransaction(tx.hash);
      setRefundSuccess(true);
    } catch (e: any) {
      setRefundErrorMsg(e);
      setIsRefunding(false);
    }
  };

  if (!purchase || !movie) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-yellow-500 animate-pulse">
        <p>Loading purchase...</p>
      </div>
    );
  }

  const purchaseData = purchase as any;
  const movieData = movie as any;
  const showData = show as any;
  const issued = purchaseData.issued || ticketIssued;
  const isRefunded = Number(purchaseData.amount) === 0;

  return (
  <motion.div id={`purchase-${purchaseId.toString()}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className={`panel p-6 ${highlight ? 'ring-2 ring-cyan-400' : ''} ${isRefunded ? 'border-red-500/70' : issued ? 'border-green-500/70' : 'border-yellow-500/70'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-bold text-gradient">{movieData.title}</h4>
          <p className="text-sm text-gray-400">Purchase #{purchaseId.toString()}</p>
        </div>
        <p className="text-2xl font-bold">{(Number(purchaseData.amount) / 1e6).toFixed(2)} PYUSD</p>
      </div>
      
      <div className="space-y-2 text-sm mb-4">
        <p>🕐 Showtime: {showData ? new Date(Number(showData.showtime) * 1000).toLocaleString() : 'Loading...'}</p>
        <p>🪑 Seats: {purchaseData.seatNumbers?.map((s: bigint) => s.toString()).join(', ')}</p>
        <p>📅 Purchase Date: {new Date(Number(purchaseData.timestamp) * 1000).toLocaleString()}</p>
        <p className="font-bold">
          {isRefunded ? '❌ REFUNDED' : 
           issued ? '✅ Ticket Issued - NFT Minted' : 
           isIssuing ? '⏳ Issuing Ticket...' : 
           '⏳ Pending'}
        </p>
      </div>

      {/* Show QR Code ONLY when ticket is issued (not while issuing) AND within 3 hours of showtime */}
      {issued && !isIssuing && qrData && (() => {
        const currentTime = Math.floor(Date.now() / 1000);
        const showtime = Number(showData?.showtime || 0);
        const threeHoursInSeconds = 3 * 60 * 60;
        const qrAccessWindow = showtime - threeHoursInSeconds;
        const canShowQR = forceQR || currentTime >= qrAccessWindow;

        if (!canShowQR) {
          const minutesUntilQR = Math.ceil((qrAccessWindow - currentTime) / 60);
          return (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-4 text-center">
              <p className="font-bold">🔒 QR Code Locked</p>
              <p className="text-sm mt-2">Available {minutesUntilQR} minutes before showtime</p>
              <p className="text-xs text-gray-400 mt-1">Showtime: {new Date(showtime * 1000).toLocaleString()}</p>
             
            </div>
          );
        }

        return (
          <div className="bg-white p-4 rounded-lg mb-4">
            <div className="flex justify-center">
              <QRCodeSVG value={qrData} size={200} />
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">Show this QR code at theater entrance</p>
          </div>
        );
      })()}

      {/* Action buttons - Hide Issue Ticket if already issued, Hide Refund if QR is visible */}
      {(() => {
        // Calculate if QR code is currently visible
        const currentTime = Math.floor(Date.now() / 1000);
        const showtime = Number(showData?.showtime || 0);
        const threeHoursInSeconds = 3 * 60 * 60;
        const thirtyMinutesInSeconds = 30 * 60;
        const qrAccessWindow = showtime - threeHoursInSeconds;
        const ticketIssueWindow = showtime - thirtyMinutesInSeconds; // Ticket can be issued 30 mins before
        const qrIsVisible = issued && !isIssuing && currentTime >= qrAccessWindow;
        const canIssueTicket = currentTime >= ticketIssueWindow; // Check if within 30 min window

        // Don't show buttons if refunded
        if (isRefunded) return null;

        return (
          <div className="space-y-2">
            {/* Issue Ticket Button - Only show if not issued AND within 30 mins of showtime */}
            {!issued && !isIssuing && purchaseData.amount > 0 && (
              <>
                {!canIssueTicket ? (
                  <div className="w-full bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 text-center">
                    <p className="font-bold text-sm">🔒 Ticket Release Locked</p>
                    <p className="text-xs mt-1">
                      Ticket will be available {Math.ceil((ticketIssueWindow - currentTime) / 60)} minutes before showtime
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Release time: {new Date(ticketIssueWindow * 1000).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleIssueTicket}
                    disabled={isIssuing}
                    className="w-full btn-accent disabled:bg-gray-600 py-2 rounded-lg font-semibold"
                  >
                    {isIssuing ? '⏳ Generating Ticket...' : '📲 Issue Ticket (Get QR Code)'}
                  </button>
                )}
              </>
            )}
            
            {/* Refund Button - Hide ONLY when QR code is visible */}
            {!qrIsVisible && purchaseData.amount > 0 && (
              <button
                onClick={handleRefund}
                disabled={isRefunding}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-2 rounded-lg font-semibold"
              >
                {isRefunding ? '⏳ Processing...' : '💸 Request Refund before generating Qr (50%)'}
              </button>
            )}
          </div>
        );
      })()}

      {isRefunded && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-center">
          <p className="font-bold">❌ REFUNDED</p>
          <p className="text-sm">50% returned to you</p>
        </div>
      )}

      {isIssuing && (
        <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3 text-center">
          <p className="font-bold">⏳ Generating your ticket...</p>
          <p className="text-sm">Uploading to IPFS and minting NFT</p>
        </div>
      )}
    </motion.div>
  );
}
