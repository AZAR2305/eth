// This file is to dynamically generate TS types
// which we can't get using GenType
// Use @genType.import to link the types back to ReScript code

import type { Logger, EffectCaller } from "envio";
import type * as Entities from "./db/Entities.gen.ts";

export type LoaderContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  /**
   * True when the handlers run in preload mode - in parallel for the whole batch.
   * Handlers run twice per batch of events, and the first time is the "preload" run
   * During preload entities aren't set, logs are ignored and exceptions are silently swallowed.
   * Preload mode is the best time to populate data to in-memory cache.
   * After preload the handler will run for the second time in sequential order of events.
   */
  readonly isPreload: boolean;
  /**
   * Per-chain state information accessible in event handlers and block handlers.
   * Each chain ID maps to an object containing chain-specific state:
   * - isReady: true when the chain has completed initial sync and is processing live events,
   *            false during historical synchronization
   */
  readonly chains: {
    [chainId: string]: {
      readonly isReady: boolean;
    };
  };
  readonly MovieManager_MovieAdded: {
    /**
     * Load the entity MovieManager_MovieAdded from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.MovieManager_MovieAdded_t | undefined>,
    /**
     * Load the entity MovieManager_MovieAdded from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.MovieManager_MovieAdded_t>,
    readonly getWhere: Entities.MovieManager_MovieAdded_indexedFieldOperations,
    /**
     * Returns the entity MovieManager_MovieAdded from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.MovieManager_MovieAdded_t) => Promise<Entities.MovieManager_MovieAdded_t>,
    /**
     * Set the entity MovieManager_MovieAdded in the storage.
     */
    readonly set: (entity: Entities.MovieManager_MovieAdded_t) => void,
    /**
     * Delete the entity MovieManager_MovieAdded from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly MovieManager_ShowAdded: {
    /**
     * Load the entity MovieManager_ShowAdded from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.MovieManager_ShowAdded_t | undefined>,
    /**
     * Load the entity MovieManager_ShowAdded from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.MovieManager_ShowAdded_t>,
    readonly getWhere: Entities.MovieManager_ShowAdded_indexedFieldOperations,
    /**
     * Returns the entity MovieManager_ShowAdded from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.MovieManager_ShowAdded_t) => Promise<Entities.MovieManager_ShowAdded_t>,
    /**
     * Set the entity MovieManager_ShowAdded in the storage.
     */
    readonly set: (entity: Entities.MovieManager_ShowAdded_t) => void,
    /**
     * Delete the entity MovieManager_ShowAdded from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly TicketEscrow_RefundProcessed: {
    /**
     * Load the entity TicketEscrow_RefundProcessed from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.TicketEscrow_RefundProcessed_t | undefined>,
    /**
     * Load the entity TicketEscrow_RefundProcessed from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.TicketEscrow_RefundProcessed_t>,
    readonly getWhere: Entities.TicketEscrow_RefundProcessed_indexedFieldOperations,
    /**
     * Returns the entity TicketEscrow_RefundProcessed from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.TicketEscrow_RefundProcessed_t) => Promise<Entities.TicketEscrow_RefundProcessed_t>,
    /**
     * Set the entity TicketEscrow_RefundProcessed in the storage.
     */
    readonly set: (entity: Entities.TicketEscrow_RefundProcessed_t) => void,
    /**
     * Delete the entity TicketEscrow_RefundProcessed from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly TicketEscrow_TicketPurchased: {
    /**
     * Load the entity TicketEscrow_TicketPurchased from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.TicketEscrow_TicketPurchased_t | undefined>,
    /**
     * Load the entity TicketEscrow_TicketPurchased from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.TicketEscrow_TicketPurchased_t>,
    readonly getWhere: Entities.TicketEscrow_TicketPurchased_indexedFieldOperations,
    /**
     * Returns the entity TicketEscrow_TicketPurchased from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.TicketEscrow_TicketPurchased_t) => Promise<Entities.TicketEscrow_TicketPurchased_t>,
    /**
     * Set the entity TicketEscrow_TicketPurchased in the storage.
     */
    readonly set: (entity: Entities.TicketEscrow_TicketPurchased_t) => void,
    /**
     * Delete the entity TicketEscrow_TicketPurchased from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};

export type HandlerContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  /**
   * Per-chain state information accessible in event handlers and block handlers.
   * Each chain ID maps to an object containing chain-specific state:
   * - isReady: true when the chain has completed initial sync and is processing live events,
   *            false during historical synchronization
   */
  readonly chains: {
    [chainId: string]: {
      readonly isReady: boolean;
    };
  };
  readonly MovieManager_MovieAdded: {
    /**
     * Load the entity MovieManager_MovieAdded from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.MovieManager_MovieAdded_t | undefined>,
    /**
     * Load the entity MovieManager_MovieAdded from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.MovieManager_MovieAdded_t>,
    /**
     * Returns the entity MovieManager_MovieAdded from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.MovieManager_MovieAdded_t) => Promise<Entities.MovieManager_MovieAdded_t>,
    /**
     * Set the entity MovieManager_MovieAdded in the storage.
     */
    readonly set: (entity: Entities.MovieManager_MovieAdded_t) => void,
    /**
     * Delete the entity MovieManager_MovieAdded from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly MovieManager_ShowAdded: {
    /**
     * Load the entity MovieManager_ShowAdded from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.MovieManager_ShowAdded_t | undefined>,
    /**
     * Load the entity MovieManager_ShowAdded from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.MovieManager_ShowAdded_t>,
    /**
     * Returns the entity MovieManager_ShowAdded from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.MovieManager_ShowAdded_t) => Promise<Entities.MovieManager_ShowAdded_t>,
    /**
     * Set the entity MovieManager_ShowAdded in the storage.
     */
    readonly set: (entity: Entities.MovieManager_ShowAdded_t) => void,
    /**
     * Delete the entity MovieManager_ShowAdded from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly TicketEscrow_RefundProcessed: {
    /**
     * Load the entity TicketEscrow_RefundProcessed from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.TicketEscrow_RefundProcessed_t | undefined>,
    /**
     * Load the entity TicketEscrow_RefundProcessed from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.TicketEscrow_RefundProcessed_t>,
    /**
     * Returns the entity TicketEscrow_RefundProcessed from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.TicketEscrow_RefundProcessed_t) => Promise<Entities.TicketEscrow_RefundProcessed_t>,
    /**
     * Set the entity TicketEscrow_RefundProcessed in the storage.
     */
    readonly set: (entity: Entities.TicketEscrow_RefundProcessed_t) => void,
    /**
     * Delete the entity TicketEscrow_RefundProcessed from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly TicketEscrow_TicketPurchased: {
    /**
     * Load the entity TicketEscrow_TicketPurchased from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.TicketEscrow_TicketPurchased_t | undefined>,
    /**
     * Load the entity TicketEscrow_TicketPurchased from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.TicketEscrow_TicketPurchased_t>,
    /**
     * Returns the entity TicketEscrow_TicketPurchased from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.TicketEscrow_TicketPurchased_t) => Promise<Entities.TicketEscrow_TicketPurchased_t>,
    /**
     * Set the entity TicketEscrow_TicketPurchased in the storage.
     */
    readonly set: (entity: Entities.TicketEscrow_TicketPurchased_t) => void,
    /**
     * Delete the entity TicketEscrow_TicketPurchased from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};
