/* TypeScript file generated from Handlers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const HandlersJS = require('./Handlers.res.js');

import type {HandlerTypes_eventConfig as Types_HandlerTypes_eventConfig} from './Types.gen';

import type {MovieManager_MovieAdded_eventFilters as Types_MovieManager_MovieAdded_eventFilters} from './Types.gen';

import type {MovieManager_MovieAdded_event as Types_MovieManager_MovieAdded_event} from './Types.gen';

import type {MovieManager_ShowAdded_eventFilters as Types_MovieManager_ShowAdded_eventFilters} from './Types.gen';

import type {MovieManager_ShowAdded_event as Types_MovieManager_ShowAdded_event} from './Types.gen';

import type {TicketEscrow_RefundProcessed_eventFilters as Types_TicketEscrow_RefundProcessed_eventFilters} from './Types.gen';

import type {TicketEscrow_RefundProcessed_event as Types_TicketEscrow_RefundProcessed_event} from './Types.gen';

import type {TicketEscrow_TicketPurchased_eventFilters as Types_TicketEscrow_TicketPurchased_eventFilters} from './Types.gen';

import type {TicketEscrow_TicketPurchased_event as Types_TicketEscrow_TicketPurchased_event} from './Types.gen';

import type {chain as Types_chain} from './Types.gen';

import type {contractRegistrations as Types_contractRegistrations} from './Types.gen';

import type {fnWithEventConfig as Types_fnWithEventConfig} from './Types.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandlerWithLoader as Internal_genericHandlerWithLoader} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {genericLoaderArgs as Internal_genericLoaderArgs} from 'envio/src/Internal.gen';

import type {genericLoader as Internal_genericLoader} from 'envio/src/Internal.gen';

import type {handlerContext as Types_handlerContext} from './Types.gen';

import type {loaderContext as Types_loaderContext} from './Types.gen';

import type {onBlockArgs as Envio_onBlockArgs} from 'envio/src/Envio.gen';

import type {onBlockOptions as Envio_onBlockOptions} from 'envio/src/Envio.gen';

export const MovieManager_MovieAdded_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_MovieManager_MovieAdded_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_MovieManager_MovieAdded_eventFilters>> = HandlersJS.MovieManager.MovieAdded.contractRegister as any;

export const MovieManager_MovieAdded_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_MovieManager_MovieAdded_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_MovieManager_MovieAdded_eventFilters>> = HandlersJS.MovieManager.MovieAdded.handler as any;

export const MovieManager_MovieAdded_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_MovieManager_MovieAdded_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_MovieManager_MovieAdded_event,Types_handlerContext,loaderReturn>>,Types_MovieManager_MovieAdded_eventFilters>) => void = HandlersJS.MovieManager.MovieAdded.handlerWithLoader as any;

export const MovieManager_ShowAdded_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_MovieManager_ShowAdded_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_MovieManager_ShowAdded_eventFilters>> = HandlersJS.MovieManager.ShowAdded.contractRegister as any;

export const MovieManager_ShowAdded_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_MovieManager_ShowAdded_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_MovieManager_ShowAdded_eventFilters>> = HandlersJS.MovieManager.ShowAdded.handler as any;

export const MovieManager_ShowAdded_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_MovieManager_ShowAdded_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_MovieManager_ShowAdded_event,Types_handlerContext,loaderReturn>>,Types_MovieManager_ShowAdded_eventFilters>) => void = HandlersJS.MovieManager.ShowAdded.handlerWithLoader as any;

export const TicketEscrow_RefundProcessed_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_TicketEscrow_RefundProcessed_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_TicketEscrow_RefundProcessed_eventFilters>> = HandlersJS.TicketEscrow.RefundProcessed.contractRegister as any;

export const TicketEscrow_RefundProcessed_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_TicketEscrow_RefundProcessed_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_TicketEscrow_RefundProcessed_eventFilters>> = HandlersJS.TicketEscrow.RefundProcessed.handler as any;

export const TicketEscrow_RefundProcessed_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_TicketEscrow_RefundProcessed_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_TicketEscrow_RefundProcessed_event,Types_handlerContext,loaderReturn>>,Types_TicketEscrow_RefundProcessed_eventFilters>) => void = HandlersJS.TicketEscrow.RefundProcessed.handlerWithLoader as any;

export const TicketEscrow_TicketPurchased_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_TicketEscrow_TicketPurchased_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_TicketEscrow_TicketPurchased_eventFilters>> = HandlersJS.TicketEscrow.TicketPurchased.contractRegister as any;

export const TicketEscrow_TicketPurchased_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_TicketEscrow_TicketPurchased_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_TicketEscrow_TicketPurchased_eventFilters>> = HandlersJS.TicketEscrow.TicketPurchased.handler as any;

export const TicketEscrow_TicketPurchased_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_TicketEscrow_TicketPurchased_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_TicketEscrow_TicketPurchased_event,Types_handlerContext,loaderReturn>>,Types_TicketEscrow_TicketPurchased_eventFilters>) => void = HandlersJS.TicketEscrow.TicketPurchased.handlerWithLoader as any;

/** Register a Block Handler. It'll be called for every block by default. */
export const onBlock: (_1:Envio_onBlockOptions<Types_chain>, _2:((_1:Envio_onBlockArgs<Types_handlerContext>) => Promise<void>)) => void = HandlersJS.onBlock as any;

export const TicketEscrow: { RefundProcessed: {
  handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_TicketEscrow_RefundProcessed_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_TicketEscrow_RefundProcessed_event,Types_handlerContext,loaderReturn>>,Types_TicketEscrow_RefundProcessed_eventFilters>) => void; 
  handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_TicketEscrow_RefundProcessed_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_TicketEscrow_RefundProcessed_eventFilters>>; 
  contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_TicketEscrow_RefundProcessed_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_TicketEscrow_RefundProcessed_eventFilters>>
}; TicketPurchased: {
  handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_TicketEscrow_TicketPurchased_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_TicketEscrow_TicketPurchased_event,Types_handlerContext,loaderReturn>>,Types_TicketEscrow_TicketPurchased_eventFilters>) => void; 
  handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_TicketEscrow_TicketPurchased_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_TicketEscrow_TicketPurchased_eventFilters>>; 
  contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_TicketEscrow_TicketPurchased_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_TicketEscrow_TicketPurchased_eventFilters>>
} } = HandlersJS.TicketEscrow as any;

export const MovieManager: { MovieAdded: {
  handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_MovieManager_MovieAdded_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_MovieManager_MovieAdded_event,Types_handlerContext,loaderReturn>>,Types_MovieManager_MovieAdded_eventFilters>) => void; 
  handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_MovieManager_MovieAdded_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_MovieManager_MovieAdded_eventFilters>>; 
  contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_MovieManager_MovieAdded_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_MovieManager_MovieAdded_eventFilters>>
}; ShowAdded: {
  handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_MovieManager_ShowAdded_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_MovieManager_ShowAdded_event,Types_handlerContext,loaderReturn>>,Types_MovieManager_ShowAdded_eventFilters>) => void; 
  handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_MovieManager_ShowAdded_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_MovieManager_ShowAdded_eventFilters>>; 
  contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_MovieManager_ShowAdded_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_MovieManager_ShowAdded_eventFilters>>
} } = HandlersJS.MovieManager as any;
