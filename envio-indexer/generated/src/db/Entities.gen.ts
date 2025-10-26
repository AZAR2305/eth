/* TypeScript file generated from Entities.res by genType. */

/* eslint-disable */
/* tslint:disable */

export type id = string;

export type whereOperations<entity,fieldType> = { readonly eq: (_1:fieldType) => Promise<entity[]>; readonly gt: (_1:fieldType) => Promise<entity[]> };

export type MovieManager_MovieAdded_t = {
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly id: id; 
  readonly movieId: bigint; 
  readonly owner: string; 
  readonly title: string; 
  readonly transactionHash: string
};

export type MovieManager_MovieAdded_indexedFieldOperations = {};

export type MovieManager_ShowAdded_t = {
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly id: id; 
  readonly movieId: bigint; 
  readonly showId: bigint; 
  readonly showtime: bigint; 
  readonly ticketPrice: bigint; 
  readonly transactionHash: string
};

export type MovieManager_ShowAdded_indexedFieldOperations = {};

export type TicketEscrow_RefundProcessed_t = {
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly buyer: string; 
  readonly customerAmount: bigint; 
  readonly id: id; 
  readonly purchaseId: bigint; 
  readonly theaterOwnerAmount: bigint; 
  readonly transactionHash: string
};

export type TicketEscrow_RefundProcessed_indexedFieldOperations = {};

export type TicketEscrow_TicketPurchased_t = {
  readonly amount: bigint; 
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly buyer: string; 
  readonly id: id; 
  readonly purchaseId: bigint; 
  readonly seatNumbers: bigint[]; 
  readonly showId: bigint; 
  readonly transactionHash: string
};

export type TicketEscrow_TicketPurchased_indexedFieldOperations = {};
