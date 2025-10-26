/***** TAKE NOTE ******
This is a hack to get genType to work!

In order for genType to produce recursive types, it needs to be at the 
root module of a file. If it's defined in a nested module it does not 
work. So all the MockDb types and internal functions are defined in TestHelpers_MockDb
and only public functions are recreated and exported from this module.

the following module:
```rescript
module MyModule = {
  @genType
  type rec a = {fieldB: b}
  @genType and b = {fieldA: a}
}
```

produces the following in ts:
```ts
// tslint:disable-next-line:interface-over-type-literal
export type MyModule_a = { readonly fieldB: b };

// tslint:disable-next-line:interface-over-type-literal
export type MyModule_b = { readonly fieldA: MyModule_a };
```

fieldB references type b which doesn't exist because it's defined
as MyModule_b
*/

module MockDb = {
  @genType
  let createMockDb = TestHelpers_MockDb.createMockDb
}

@genType
module Addresses = {
  include TestHelpers_MockAddresses
}

module EventFunctions = {
  //Note these are made into a record to make operate in the same way
  //for Res, JS and TS.

  /**
  The arguements that get passed to a "processEvent" helper function
  */
  @genType
  type eventProcessorArgs<'event> = {
    event: 'event,
    mockDb: TestHelpers_MockDb.t,
    @deprecated("Set the chainId for the event instead")
    chainId?: int,
  }

  @genType
  type eventProcessor<'event> = eventProcessorArgs<'event> => promise<TestHelpers_MockDb.t>

  /**
  A function composer to help create individual processEvent functions
  */
  let makeEventProcessor = (~register) => args => {
    let {event, mockDb, ?chainId} =
      args->(Utils.magic: eventProcessorArgs<'event> => eventProcessorArgs<Internal.event>)

    // Have the line here, just in case the function is called with
    // a manually created event. We don't want to break the existing tests here.
    let _ =
      TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    TestHelpers_MockDb.makeProcessEvents(mockDb, ~chainId=?chainId)([event->(Utils.magic: Internal.event => Types.eventLog<unknown>)])
  }

  module MockBlock = {
    @genType
    type t = {
      hash?: string,
      number?: int,
      timestamp?: int,
    }

    let toBlock = (_mock: t) => {
      hash: _mock.hash->Belt.Option.getWithDefault("foo"),
      number: _mock.number->Belt.Option.getWithDefault(0),
      timestamp: _mock.timestamp->Belt.Option.getWithDefault(0),
    }->(Utils.magic: Types.AggregatedBlock.t => Internal.eventBlock)
  }

  module MockTransaction = {
    @genType
    type t = {
      hash?: string,
    }

    let toTransaction = (_mock: t) => {
      hash: _mock.hash->Belt.Option.getWithDefault("foo"),
    }->(Utils.magic: Types.AggregatedTransaction.t => Internal.eventTransaction)
  }

  @genType
  type mockEventData = {
    chainId?: int,
    srcAddress?: Address.t,
    logIndex?: int,
    block?: MockBlock.t,
    transaction?: MockTransaction.t,
  }

  /**
  Applies optional paramters with defaults for all common eventLog field
  */
  let makeEventMocker = (
    ~params: Internal.eventParams,
    ~mockEventData: option<mockEventData>,
    ~register: unit => Internal.eventConfig,
  ): Internal.event => {
    let {?block, ?transaction, ?srcAddress, ?chainId, ?logIndex} =
      mockEventData->Belt.Option.getWithDefault({})
    let block = block->Belt.Option.getWithDefault({})->MockBlock.toBlock
    let transaction = transaction->Belt.Option.getWithDefault({})->MockTransaction.toTransaction
    let config = RegisterHandlers.getConfig()
    let event: Internal.event = {
      params,
      transaction,
      chainId: switch chainId {
      | Some(chainId) => chainId
      | None =>
        switch config.defaultChain {
        | Some(chainConfig) => chainConfig.id
        | None =>
          Js.Exn.raiseError(
            "No default chain Id found, please add at least 1 chain to your config.yaml",
          )
        }
      },
      block,
      srcAddress: srcAddress->Belt.Option.getWithDefault(Addresses.defaultAddress),
      logIndex: logIndex->Belt.Option.getWithDefault(0),
    }
    // Since currently it's not possible to figure out the event config from the event
    // we store a reference to the register function by event in a weak map
    let _ = TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    event
  }
}


module MovieManager = {
  module MovieAdded = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.MovieManager.MovieAdded.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.MovieManager.MovieAdded.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("movieId")
      movieId?: bigint,
      @as("title")
      title?: string,
      @as("owner")
      owner?: Address.t,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?movieId,
        ?title,
        ?owner,
        ?mockEventData,
      } = args

      let params = 
      {
       movieId: movieId->Belt.Option.getWithDefault(0n),
       title: title->Belt.Option.getWithDefault("foo"),
       owner: owner->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
      }
->(Utils.magic: Types.MovieManager.MovieAdded.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.MovieManager.MovieAdded.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.MovieManager.MovieAdded.event)
    }
  }

  module ShowAdded = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.MovieManager.ShowAdded.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.MovieManager.ShowAdded.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("showId")
      showId?: bigint,
      @as("movieId")
      movieId?: bigint,
      @as("showtime")
      showtime?: bigint,
      @as("ticketPrice")
      ticketPrice?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?showId,
        ?movieId,
        ?showtime,
        ?ticketPrice,
        ?mockEventData,
      } = args

      let params = 
      {
       showId: showId->Belt.Option.getWithDefault(0n),
       movieId: movieId->Belt.Option.getWithDefault(0n),
       showtime: showtime->Belt.Option.getWithDefault(0n),
       ticketPrice: ticketPrice->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.MovieManager.ShowAdded.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.MovieManager.ShowAdded.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.MovieManager.ShowAdded.event)
    }
  }

}


module TicketEscrow = {
  module RefundProcessed = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TicketEscrow.RefundProcessed.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TicketEscrow.RefundProcessed.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("purchaseId")
      purchaseId?: bigint,
      @as("buyer")
      buyer?: Address.t,
      @as("customerAmount")
      customerAmount?: bigint,
      @as("theaterOwnerAmount")
      theaterOwnerAmount?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?purchaseId,
        ?buyer,
        ?customerAmount,
        ?theaterOwnerAmount,
        ?mockEventData,
      } = args

      let params = 
      {
       purchaseId: purchaseId->Belt.Option.getWithDefault(0n),
       buyer: buyer->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       customerAmount: customerAmount->Belt.Option.getWithDefault(0n),
       theaterOwnerAmount: theaterOwnerAmount->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.TicketEscrow.RefundProcessed.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TicketEscrow.RefundProcessed.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TicketEscrow.RefundProcessed.event)
    }
  }

  module TicketPurchased = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.TicketEscrow.TicketPurchased.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.TicketEscrow.TicketPurchased.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("purchaseId")
      purchaseId?: bigint,
      @as("showId")
      showId?: bigint,
      @as("buyer")
      buyer?: Address.t,
      @as("amount")
      amount?: bigint,
      @as("seatNumbers")
      seatNumbers?: array<bigint>,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?purchaseId,
        ?showId,
        ?buyer,
        ?amount,
        ?seatNumbers,
        ?mockEventData,
      } = args

      let params = 
      {
       purchaseId: purchaseId->Belt.Option.getWithDefault(0n),
       showId: showId->Belt.Option.getWithDefault(0n),
       buyer: buyer->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       amount: amount->Belt.Option.getWithDefault(0n),
       seatNumbers: seatNumbers->Belt.Option.getWithDefault([]),
      }
->(Utils.magic: Types.TicketEscrow.TicketPurchased.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.TicketEscrow.TicketPurchased.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.TicketEscrow.TicketPurchased.event)
    }
  }

}

