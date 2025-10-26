
import {
  MovieManager,
  MovieManager_MovieAdded,
  MovieManager_ShowAdded,
  TicketEscrow,
  TicketEscrow_RefundProcessed,
  TicketEscrow_TicketPurchased
} from "../generated";

MovieManager.MovieAdded.handler(async ({ event, context }: { event: any; context: any }) => {
  const entity: MovieManager_MovieAdded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    movieId: event.params.movieId,
    title: event.params.title,
    owner: event.params.owner,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };

  context.MovieManager_MovieAdded.set(entity);
});

MovieManager.ShowAdded.handler(async ({ event, context }: { event: any; context: any }) => {
  const entity: MovieManager_ShowAdded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    showId: event.params.showId,
    movieId: event.params.movieId,
    showtime: event.params.showtime,
    ticketPrice: event.params.ticketPrice,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };

  context.MovieManager_ShowAdded.set(entity);
});

TicketEscrow.RefundProcessed.handler(async ({ event, context }: { event: any; context: any }) => {
  const entity: TicketEscrow_RefundProcessed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    purchaseId: event.params.purchaseId,
    buyer: event.params.buyer,
    customerAmount: event.params.customerAmount,
    theaterOwnerAmount: event.params.theaterOwnerAmount,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };

  context.TicketEscrow_RefundProcessed.set(entity);
});

TicketEscrow.TicketPurchased.handler(async ({ event, context }: { event: any; context: any }) => {
  const entity: TicketEscrow_TicketPurchased = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    purchaseId: event.params.purchaseId,
    showId: event.params.showId,
    buyer: event.params.buyer,
    amount: event.params.amount,
    seatNumbers: event.params.seatNumbers.map((n: any) => BigInt(n)),
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };

  context.TicketEscrow_TicketPurchased.set(entity);
});
// Envio indexer integration for ChainTickets project

// Enable transaction field selection to access transaction hash