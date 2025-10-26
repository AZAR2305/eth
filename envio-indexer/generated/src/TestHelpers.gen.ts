/* TypeScript file generated from TestHelpers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpersJS = require('./TestHelpers.res.js');

import type {MovieManager_MovieAdded_event as Types_MovieManager_MovieAdded_event} from './Types.gen';

import type {MovieManager_ShowAdded_event as Types_MovieManager_ShowAdded_event} from './Types.gen';

import type {TicketEscrow_RefundProcessed_event as Types_TicketEscrow_RefundProcessed_event} from './Types.gen';

import type {TicketEscrow_TicketPurchased_event as Types_TicketEscrow_TicketPurchased_event} from './Types.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

import type {t as TestHelpers_MockDb_t} from './TestHelpers_MockDb.gen';

/** The arguements that get passed to a "processEvent" helper function */
export type EventFunctions_eventProcessorArgs<event> = {
  readonly event: event; 
  readonly mockDb: TestHelpers_MockDb_t; 
  readonly chainId?: number
};

export type EventFunctions_eventProcessor<event> = (_1:EventFunctions_eventProcessorArgs<event>) => Promise<TestHelpers_MockDb_t>;

export type EventFunctions_MockBlock_t = {
  readonly hash?: string; 
  readonly number?: number; 
  readonly timestamp?: number
};

export type EventFunctions_MockTransaction_t = { readonly hash?: string };

export type EventFunctions_mockEventData = {
  readonly chainId?: number; 
  readonly srcAddress?: Address_t; 
  readonly logIndex?: number; 
  readonly block?: EventFunctions_MockBlock_t; 
  readonly transaction?: EventFunctions_MockTransaction_t
};

export type MovieManager_MovieAdded_createMockArgs = {
  readonly movieId?: bigint; 
  readonly title?: string; 
  readonly owner?: Address_t; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type MovieManager_ShowAdded_createMockArgs = {
  readonly showId?: bigint; 
  readonly movieId?: bigint; 
  readonly showtime?: bigint; 
  readonly ticketPrice?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type TicketEscrow_RefundProcessed_createMockArgs = {
  readonly purchaseId?: bigint; 
  readonly buyer?: Address_t; 
  readonly customerAmount?: bigint; 
  readonly theaterOwnerAmount?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type TicketEscrow_TicketPurchased_createMockArgs = {
  readonly purchaseId?: bigint; 
  readonly showId?: bigint; 
  readonly buyer?: Address_t; 
  readonly amount?: bigint; 
  readonly seatNumbers?: bigint[]; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export const MockDb_createMockDb: () => TestHelpers_MockDb_t = TestHelpersJS.MockDb.createMockDb as any;

export const Addresses_mockAddresses: Address_t[] = TestHelpersJS.Addresses.mockAddresses as any;

export const Addresses_defaultAddress: Address_t = TestHelpersJS.Addresses.defaultAddress as any;

export const MovieManager_MovieAdded_processEvent: EventFunctions_eventProcessor<Types_MovieManager_MovieAdded_event> = TestHelpersJS.MovieManager.MovieAdded.processEvent as any;

export const MovieManager_MovieAdded_createMockEvent: (args:MovieManager_MovieAdded_createMockArgs) => Types_MovieManager_MovieAdded_event = TestHelpersJS.MovieManager.MovieAdded.createMockEvent as any;

export const MovieManager_ShowAdded_processEvent: EventFunctions_eventProcessor<Types_MovieManager_ShowAdded_event> = TestHelpersJS.MovieManager.ShowAdded.processEvent as any;

export const MovieManager_ShowAdded_createMockEvent: (args:MovieManager_ShowAdded_createMockArgs) => Types_MovieManager_ShowAdded_event = TestHelpersJS.MovieManager.ShowAdded.createMockEvent as any;

export const TicketEscrow_RefundProcessed_processEvent: EventFunctions_eventProcessor<Types_TicketEscrow_RefundProcessed_event> = TestHelpersJS.TicketEscrow.RefundProcessed.processEvent as any;

export const TicketEscrow_RefundProcessed_createMockEvent: (args:TicketEscrow_RefundProcessed_createMockArgs) => Types_TicketEscrow_RefundProcessed_event = TestHelpersJS.TicketEscrow.RefundProcessed.createMockEvent as any;

export const TicketEscrow_TicketPurchased_processEvent: EventFunctions_eventProcessor<Types_TicketEscrow_TicketPurchased_event> = TestHelpersJS.TicketEscrow.TicketPurchased.processEvent as any;

export const TicketEscrow_TicketPurchased_createMockEvent: (args:TicketEscrow_TicketPurchased_createMockArgs) => Types_TicketEscrow_TicketPurchased_event = TestHelpersJS.TicketEscrow.TicketPurchased.createMockEvent as any;

export const TicketEscrow: { RefundProcessed: { processEvent: EventFunctions_eventProcessor<Types_TicketEscrow_RefundProcessed_event>; createMockEvent: (args:TicketEscrow_RefundProcessed_createMockArgs) => Types_TicketEscrow_RefundProcessed_event }; TicketPurchased: { processEvent: EventFunctions_eventProcessor<Types_TicketEscrow_TicketPurchased_event>; createMockEvent: (args:TicketEscrow_TicketPurchased_createMockArgs) => Types_TicketEscrow_TicketPurchased_event } } = TestHelpersJS.TicketEscrow as any;

export const Addresses: { mockAddresses: Address_t[]; defaultAddress: Address_t } = TestHelpersJS.Addresses as any;

export const MovieManager: { MovieAdded: { processEvent: EventFunctions_eventProcessor<Types_MovieManager_MovieAdded_event>; createMockEvent: (args:MovieManager_MovieAdded_createMockArgs) => Types_MovieManager_MovieAdded_event }; ShowAdded: { processEvent: EventFunctions_eventProcessor<Types_MovieManager_ShowAdded_event>; createMockEvent: (args:MovieManager_ShowAdded_createMockArgs) => Types_MovieManager_ShowAdded_event } } = TestHelpersJS.MovieManager as any;

export const MockDb: { createMockDb: () => TestHelpers_MockDb_t } = TestHelpersJS.MockDb as any;
