/* TypeScript file generated from Types.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {HandlerContext as $$handlerContext} from './Types.ts';

import type {HandlerWithOptions as $$fnWithEventConfig} from './bindings/OpaqueTypes.ts';

import type {LoaderContext as $$loaderContext} from './Types.ts';

import type {MovieManager_MovieAdded_t as Entities_MovieManager_MovieAdded_t} from '../src/db/Entities.gen';

import type {MovieManager_ShowAdded_t as Entities_MovieManager_ShowAdded_t} from '../src/db/Entities.gen';

import type {SingleOrMultiple as $$SingleOrMultiple_t} from './bindings/OpaqueTypes';

import type {TicketEscrow_RefundProcessed_t as Entities_TicketEscrow_RefundProcessed_t} from '../src/db/Entities.gen';

import type {TicketEscrow_TicketPurchased_t as Entities_TicketEscrow_TicketPurchased_t} from '../src/db/Entities.gen';

import type {entityHandlerContext as Internal_entityHandlerContext} from 'envio/src/Internal.gen';

import type {eventOptions as Internal_eventOptions} from 'envio/src/Internal.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericEvent as Internal_genericEvent} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandlerWithLoader as Internal_genericHandlerWithLoader} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {genericLoaderArgs as Internal_genericLoaderArgs} from 'envio/src/Internal.gen';

import type {genericLoader as Internal_genericLoader} from 'envio/src/Internal.gen';

import type {logger as Envio_logger} from 'envio/src/Envio.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

export type id = string;
export type Id = id;

export type contractRegistrations = {
  readonly log: Envio_logger; 
  readonly addMovieManager: (_1:Address_t) => void; 
  readonly addTicketEscrow: (_1:Address_t) => void
};

export type entityLoaderContext<entity,indexedFieldOperations> = {
  readonly get: (_1:id) => Promise<(undefined | entity)>; 
  readonly getOrThrow: (_1:id, message:(undefined | string)) => Promise<entity>; 
  readonly getWhere: indexedFieldOperations; 
  readonly getOrCreate: (_1:entity) => Promise<entity>; 
  readonly set: (_1:entity) => void; 
  readonly deleteUnsafe: (_1:id) => void
};

export type loaderContext = $$loaderContext;

export type entityHandlerContext<entity> = Internal_entityHandlerContext<entity>;

export type handlerContext = $$handlerContext;

export type movieManager_MovieAdded = Entities_MovieManager_MovieAdded_t;
export type MovieManager_MovieAdded = movieManager_MovieAdded;

export type movieManager_ShowAdded = Entities_MovieManager_ShowAdded_t;
export type MovieManager_ShowAdded = movieManager_ShowAdded;

export type ticketEscrow_RefundProcessed = Entities_TicketEscrow_RefundProcessed_t;
export type TicketEscrow_RefundProcessed = ticketEscrow_RefundProcessed;

export type ticketEscrow_TicketPurchased = Entities_TicketEscrow_TicketPurchased_t;
export type TicketEscrow_TicketPurchased = ticketEscrow_TicketPurchased;

export type Transaction_t = { readonly hash: string };

export type Block_t = {
  readonly number: number; 
  readonly timestamp: number; 
  readonly hash: string
};

export type AggregatedBlock_t = {
  readonly hash: string; 
  readonly number: number; 
  readonly timestamp: number
};

export type AggregatedTransaction_t = { readonly hash: string };

export type eventLog<params> = Internal_genericEvent<params,Block_t,Transaction_t>;
export type EventLog<params> = eventLog<params>;

export type SingleOrMultiple_t<a> = $$SingleOrMultiple_t<a>;

export type HandlerTypes_args<eventArgs,context> = { readonly event: eventLog<eventArgs>; readonly context: context };

export type HandlerTypes_contractRegisterArgs<eventArgs> = Internal_genericContractRegisterArgs<eventLog<eventArgs>,contractRegistrations>;

export type HandlerTypes_contractRegister<eventArgs> = Internal_genericContractRegister<HandlerTypes_contractRegisterArgs<eventArgs>>;

export type HandlerTypes_loaderArgs<eventArgs> = Internal_genericLoaderArgs<eventLog<eventArgs>,loaderContext>;

export type HandlerTypes_loader<eventArgs,loaderReturn> = Internal_genericLoader<HandlerTypes_loaderArgs<eventArgs>,loaderReturn>;

export type HandlerTypes_handlerArgs<eventArgs,loaderReturn> = Internal_genericHandlerArgs<eventLog<eventArgs>,handlerContext,loaderReturn>;

export type HandlerTypes_handler<eventArgs,loaderReturn> = Internal_genericHandler<HandlerTypes_handlerArgs<eventArgs,loaderReturn>>;

export type HandlerTypes_loaderHandler<eventArgs,loaderReturn,eventFilters> = Internal_genericHandlerWithLoader<HandlerTypes_loader<eventArgs,loaderReturn>,HandlerTypes_handler<eventArgs,loaderReturn>,eventFilters>;

export type HandlerTypes_eventConfig<eventFilters> = Internal_eventOptions<eventFilters>;

export type fnWithEventConfig<fn,eventConfig> = $$fnWithEventConfig<fn,eventConfig>;

export type handlerWithOptions<eventArgs,loaderReturn,eventFilters> = fnWithEventConfig<HandlerTypes_handler<eventArgs,loaderReturn>,HandlerTypes_eventConfig<eventFilters>>;

export type contractRegisterWithOptions<eventArgs,eventFilters> = fnWithEventConfig<HandlerTypes_contractRegister<eventArgs>,HandlerTypes_eventConfig<eventFilters>>;

export type MovieManager_chainId = 11155111;

export type MovieManager_MovieAdded_eventArgs = {
  readonly movieId: bigint; 
  readonly title: string; 
  readonly owner: Address_t
};

export type MovieManager_MovieAdded_block = Block_t;

export type MovieManager_MovieAdded_transaction = Transaction_t;

export type MovieManager_MovieAdded_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: MovieManager_MovieAdded_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: MovieManager_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: MovieManager_MovieAdded_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: MovieManager_MovieAdded_block
};

export type MovieManager_MovieAdded_loaderArgs = Internal_genericLoaderArgs<MovieManager_MovieAdded_event,loaderContext>;

export type MovieManager_MovieAdded_loader<loaderReturn> = Internal_genericLoader<MovieManager_MovieAdded_loaderArgs,loaderReturn>;

export type MovieManager_MovieAdded_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<MovieManager_MovieAdded_event,handlerContext,loaderReturn>;

export type MovieManager_MovieAdded_handler<loaderReturn> = Internal_genericHandler<MovieManager_MovieAdded_handlerArgs<loaderReturn>>;

export type MovieManager_MovieAdded_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<MovieManager_MovieAdded_event,contractRegistrations>>;

export type MovieManager_MovieAdded_eventFilter = { readonly movieId?: SingleOrMultiple_t<bigint>; readonly owner?: SingleOrMultiple_t<Address_t> };

export type MovieManager_MovieAdded_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: MovieManager_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type MovieManager_MovieAdded_eventFiltersDefinition = 
    MovieManager_MovieAdded_eventFilter
  | MovieManager_MovieAdded_eventFilter[];

export type MovieManager_MovieAdded_eventFilters = 
    MovieManager_MovieAdded_eventFilter
  | MovieManager_MovieAdded_eventFilter[]
  | ((_1:MovieManager_MovieAdded_eventFiltersArgs) => MovieManager_MovieAdded_eventFiltersDefinition);

export type MovieManager_ShowAdded_eventArgs = {
  readonly showId: bigint; 
  readonly movieId: bigint; 
  readonly showtime: bigint; 
  readonly ticketPrice: bigint
};

export type MovieManager_ShowAdded_block = Block_t;

export type MovieManager_ShowAdded_transaction = Transaction_t;

export type MovieManager_ShowAdded_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: MovieManager_ShowAdded_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: MovieManager_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: MovieManager_ShowAdded_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: MovieManager_ShowAdded_block
};

export type MovieManager_ShowAdded_loaderArgs = Internal_genericLoaderArgs<MovieManager_ShowAdded_event,loaderContext>;

export type MovieManager_ShowAdded_loader<loaderReturn> = Internal_genericLoader<MovieManager_ShowAdded_loaderArgs,loaderReturn>;

export type MovieManager_ShowAdded_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<MovieManager_ShowAdded_event,handlerContext,loaderReturn>;

export type MovieManager_ShowAdded_handler<loaderReturn> = Internal_genericHandler<MovieManager_ShowAdded_handlerArgs<loaderReturn>>;

export type MovieManager_ShowAdded_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<MovieManager_ShowAdded_event,contractRegistrations>>;

export type MovieManager_ShowAdded_eventFilter = { readonly showId?: SingleOrMultiple_t<bigint>; readonly movieId?: SingleOrMultiple_t<bigint> };

export type MovieManager_ShowAdded_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: MovieManager_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type MovieManager_ShowAdded_eventFiltersDefinition = 
    MovieManager_ShowAdded_eventFilter
  | MovieManager_ShowAdded_eventFilter[];

export type MovieManager_ShowAdded_eventFilters = 
    MovieManager_ShowAdded_eventFilter
  | MovieManager_ShowAdded_eventFilter[]
  | ((_1:MovieManager_ShowAdded_eventFiltersArgs) => MovieManager_ShowAdded_eventFiltersDefinition);

export type TicketEscrow_chainId = 11155111;

export type TicketEscrow_RefundProcessed_eventArgs = {
  readonly purchaseId: bigint; 
  readonly buyer: Address_t; 
  readonly customerAmount: bigint; 
  readonly theaterOwnerAmount: bigint
};

export type TicketEscrow_RefundProcessed_block = Block_t;

export type TicketEscrow_RefundProcessed_transaction = Transaction_t;

export type TicketEscrow_RefundProcessed_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TicketEscrow_RefundProcessed_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TicketEscrow_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TicketEscrow_RefundProcessed_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TicketEscrow_RefundProcessed_block
};

export type TicketEscrow_RefundProcessed_loaderArgs = Internal_genericLoaderArgs<TicketEscrow_RefundProcessed_event,loaderContext>;

export type TicketEscrow_RefundProcessed_loader<loaderReturn> = Internal_genericLoader<TicketEscrow_RefundProcessed_loaderArgs,loaderReturn>;

export type TicketEscrow_RefundProcessed_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TicketEscrow_RefundProcessed_event,handlerContext,loaderReturn>;

export type TicketEscrow_RefundProcessed_handler<loaderReturn> = Internal_genericHandler<TicketEscrow_RefundProcessed_handlerArgs<loaderReturn>>;

export type TicketEscrow_RefundProcessed_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TicketEscrow_RefundProcessed_event,contractRegistrations>>;

export type TicketEscrow_RefundProcessed_eventFilter = { readonly purchaseId?: SingleOrMultiple_t<bigint>; readonly buyer?: SingleOrMultiple_t<Address_t> };

export type TicketEscrow_RefundProcessed_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TicketEscrow_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TicketEscrow_RefundProcessed_eventFiltersDefinition = 
    TicketEscrow_RefundProcessed_eventFilter
  | TicketEscrow_RefundProcessed_eventFilter[];

export type TicketEscrow_RefundProcessed_eventFilters = 
    TicketEscrow_RefundProcessed_eventFilter
  | TicketEscrow_RefundProcessed_eventFilter[]
  | ((_1:TicketEscrow_RefundProcessed_eventFiltersArgs) => TicketEscrow_RefundProcessed_eventFiltersDefinition);

export type TicketEscrow_TicketPurchased_eventArgs = {
  readonly purchaseId: bigint; 
  readonly showId: bigint; 
  readonly buyer: Address_t; 
  readonly amount: bigint; 
  readonly seatNumbers: bigint[]
};

export type TicketEscrow_TicketPurchased_block = Block_t;

export type TicketEscrow_TicketPurchased_transaction = Transaction_t;

export type TicketEscrow_TicketPurchased_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TicketEscrow_TicketPurchased_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TicketEscrow_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TicketEscrow_TicketPurchased_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TicketEscrow_TicketPurchased_block
};

export type TicketEscrow_TicketPurchased_loaderArgs = Internal_genericLoaderArgs<TicketEscrow_TicketPurchased_event,loaderContext>;

export type TicketEscrow_TicketPurchased_loader<loaderReturn> = Internal_genericLoader<TicketEscrow_TicketPurchased_loaderArgs,loaderReturn>;

export type TicketEscrow_TicketPurchased_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TicketEscrow_TicketPurchased_event,handlerContext,loaderReturn>;

export type TicketEscrow_TicketPurchased_handler<loaderReturn> = Internal_genericHandler<TicketEscrow_TicketPurchased_handlerArgs<loaderReturn>>;

export type TicketEscrow_TicketPurchased_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TicketEscrow_TicketPurchased_event,contractRegistrations>>;

export type TicketEscrow_TicketPurchased_eventFilter = {
  readonly purchaseId?: SingleOrMultiple_t<bigint>; 
  readonly showId?: SingleOrMultiple_t<bigint>; 
  readonly buyer?: SingleOrMultiple_t<Address_t>
};

export type TicketEscrow_TicketPurchased_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TicketEscrow_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TicketEscrow_TicketPurchased_eventFiltersDefinition = 
    TicketEscrow_TicketPurchased_eventFilter
  | TicketEscrow_TicketPurchased_eventFilter[];

export type TicketEscrow_TicketPurchased_eventFilters = 
    TicketEscrow_TicketPurchased_eventFilter
  | TicketEscrow_TicketPurchased_eventFilter[]
  | ((_1:TicketEscrow_TicketPurchased_eventFiltersArgs) => TicketEscrow_TicketPurchased_eventFiltersDefinition);

export type chainId = number;

export type chain = 11155111;
