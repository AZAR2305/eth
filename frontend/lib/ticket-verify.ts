import { readContract } from '@/lib/contract-helpers';
import { CONTRACT_ADDRESSES } from '@/config/address';
import { TICKET_NFT_ABI, MOVIE_MANAGER_ABI, TICKET_ESCROW_ABI } from '@/lib/contracts';

export type TicketVerification = {
  valid: boolean;
  reason?: string;
  normalized?: {
    tokenId?: string;
    purchaseId?: string;
    movieId?: string;
    showId?: string;
    movieTitle?: string;
    showtimeSec?: number;
    buyer?: string;
    seatNumbers?: string[];
  };
};

export async function verifyTicket(qrPayload: any): Promise<TicketVerification> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const threeHours = 3 * 60 * 60;

    // Helper to enforce time window
    const checkWindow = (showtimeSec: number) => {
      if (!showtimeSec || Number.isNaN(showtimeSec)) {
        return { ok: false, reason: 'Showtime not found' };
      }
      if (now > showtimeSec) return { ok: false, reason: 'Show is already over' };
      if (now < showtimeSec - threeHours) return { ok: false, reason: 'Too early for entry' };
      return { ok: true };
    };

    // Case 1: NFT ticket QR (from TicketDetails)
    if (qrPayload?.tokenId) {
      const tokenId = BigInt(qrPayload.tokenId);
      const onchain = await readContract(
        CONTRACT_ADDRESSES.ticketNFT,
        TICKET_NFT_ABI,
        'tickets',
        [tokenId]
      ) as any;

      if (!onchain) return { valid: false, reason: 'Ticket not found' };
      if (onchain.used) return { valid: false, reason: 'Ticket already used' };
      if (qrPayload.encryptedURI && onchain.encryptedURI !== qrPayload.encryptedURI) {
        return { valid: false, reason: 'QR metadata mismatch' };
      }

      const movie = await readContract(
        CONTRACT_ADDRESSES.movieManager,
        MOVIE_MANAGER_ABI,
        'getMovie',
        [onchain.movieId]
      ) as any;

      if (!movie || !movie.isActive || movie.id?.toString?.() !== onchain.movieId?.toString?.()) {
        return { valid: false, reason: 'Movie mismatch' };
      }

      // Derive showtime for this movie (nearest upcoming; else latest past)
      const shows = await readContract(
        CONTRACT_ADDRESSES.movieManager,
        MOVIE_MANAGER_ABI,
        'getAllShows',
        []
      ) as any[];
      const related = (shows || []).filter(s => s.movieId?.toString?.() === onchain.movieId?.toString?.());
      if (!related.length) return { valid: false, reason: 'No shows for movie' };
      const future = related.filter(s => Number(s.showtime) >= now).sort((a,b) => Number(a.showtime) - Number(b.showtime));
      const past = related.filter(s => Number(s.showtime) < now).sort((a,b) => Number(b.showtime) - Number(a.showtime));
      const picked = (future[0] ?? past[0]);
      const showtimeSec = Number(picked?.showtime || 0);

      const w = checkWindow(showtimeSec);
      if (!w.ok) return { valid: false, reason: w.reason };

      return {
        valid: true,
        normalized: {
          tokenId: qrPayload.tokenId.toString(),
          movieId: onchain.movieId?.toString?.(),
          movieTitle: movie.title,
          showtimeSec,
        }
      };
    }

    // Case 2: Purchase QR (from MyTickets issuance)
    if (qrPayload?.purchaseId || qrPayload?.showId) {
      const purchaseId = qrPayload.purchaseId ? BigInt(qrPayload.purchaseId) : undefined;
      let onchain: any = null;
      if (purchaseId !== undefined) {
        onchain = await readContract(
          CONTRACT_ADDRESSES.ticketEscrow,
          TICKET_ESCROW_ABI,
          'getPurchase',
          [purchaseId]
        ) as any;
      }

      const showId = qrPayload.showId ? BigInt(qrPayload.showId) : (onchain?.showId);
      if (!showId) return { valid: false, reason: 'Show not found' };

      // Ensure issued if purchase flow
      if (onchain && (!onchain.issued || Number(onchain.amount) === 0)) {
        return { valid: false, reason: 'Ticket not issued or refunded' };
      }

      const show = await readContract(
        CONTRACT_ADDRESSES.movieManager,
        MOVIE_MANAGER_ABI,
        'getShow',
        [showId]
      ) as any;

      const movie = await readContract(
        CONTRACT_ADDRESSES.movieManager,
        MOVIE_MANAGER_ABI,
        'getMovie',
        [show.movieId]
      ) as any;

      if (qrPayload.movieId && qrPayload.movieId.toString() !== show.movieId?.toString?.()) {
        return { valid: false, reason: 'Movie mismatch' };
      }

      const showtimeSec = Number(show.showtime || 0);
      const w = checkWindow(showtimeSec);
      if (!w.ok) return { valid: false, reason: w.reason };

      return {
        valid: true,
        normalized: {
          purchaseId: purchaseId?.toString(),
          movieId: show.movieId?.toString?.(),
          showId: showId?.toString?.(),
          movieTitle: movie?.title,
          showtimeSec,
          buyer: onchain?.buyer,
          seatNumbers: (onchain?.seatNumbers || qrPayload.seatNumbers || qrPayload.seats?.split?.(',') || []).map((s: any) => s.toString()),
        }
      };
    }

    return { valid: false, reason: 'Unsupported QR format' };
  } catch (err: any) {
    console.error('verifyTicket error:', err);
    return { valid: false, reason: err?.message || 'Verification error' };
  }
}
