@val external require: string => unit = "require"

let registerContractHandlers = (
  ~contractName,
  ~handlerPathRelativeToRoot,
  ~handlerPathRelativeToConfig,
) => {
  try {
    require(`../${Path.relativePathToRootFromGenerated}/${handlerPathRelativeToRoot}`)
  } catch {
  | exn =>
    let params = {
      "Contract Name": contractName,
      "Expected Handler Path": handlerPathRelativeToConfig,
      "Code": "EE500",
    }
    let logger = Logging.createChild(~params)

    let errHandler = exn->ErrorHandling.make(~msg="Failed to import handler file", ~logger)
    errHandler->ErrorHandling.log
    errHandler->ErrorHandling.raiseExn
  }
}

let makeGeneratedConfig = () => {
  let chains = [
    {
      let contracts = [
        {
          InternalConfig.name: "MovieManager",
          abi: Types.MovieManager.abi,
          addresses: [
            "0x0d9C35FA08D03b1106FceBF0aa097F92C95E8b88"->Address.Evm.fromStringOrThrow
,
          ],
          events: [
            (Types.MovieManager.MovieAdded.register() :> Internal.eventConfig),
            (Types.MovieManager.ShowAdded.register() :> Internal.eventConfig),
          ],
          startBlock: None,
        },
        {
          InternalConfig.name: "TicketEscrow",
          abi: Types.TicketEscrow.abi,
          addresses: [
            "0x5BAFcCD137A7318e2dd1b3c696A035940e9c09E2"->Address.Evm.fromStringOrThrow
,
          ],
          events: [
            (Types.TicketEscrow.RefundProcessed.register() :> Internal.eventConfig),
            (Types.TicketEscrow.TicketPurchased.register() :> Internal.eventConfig),
          ],
          startBlock: None,
        },
      ]
      let chain = ChainMap.Chain.makeUnsafe(~chainId=11155111)
      {
        InternalConfig.maxReorgDepth: 200,
        startBlock: 7365000,
        id: 11155111,
        contracts,
        sources: NetworkSources.evm(~chain, ~contracts=[{name: "MovieManager",events: [Types.MovieManager.MovieAdded.register(), Types.MovieManager.ShowAdded.register()],abi: Types.MovieManager.abi}, {name: "TicketEscrow",events: [Types.TicketEscrow.RefundProcessed.register(), Types.TicketEscrow.TicketPurchased.register()],abi: Types.TicketEscrow.abi}], ~hyperSync=None, ~allEventSignatures=[Types.MovieManager.eventSignatures, Types.TicketEscrow.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[{url: "https://eth-sepolia.g.alchemy.com/v2/demo", sourceFor: Sync, syncConfig: {}}], ~lowercaseAddresses=false)
      }
    },
  ]

  Config.make(
    ~shouldRollbackOnReorg=true,
    ~shouldSaveFullHistory=false,
    ~isUnorderedMultichainMode=true,
    ~chains,
    ~enableRawEvents=false,
    ~batchSize=?Env.batchSize,
    ~preloadHandlers=true,
    ~lowercaseAddresses=false,
    ~shouldUseHypersyncClientDecoder=true,
  )
}

%%private(
  let config: ref<option<Config.t>> = ref(None)
)

let registerAllHandlers = () => {
  let configWithoutRegistrations = makeGeneratedConfig()
  EventRegister.startRegistration(
    ~ecosystem=configWithoutRegistrations.ecosystem,
    ~multichain=configWithoutRegistrations.multichain,
    ~preloadHandlers=configWithoutRegistrations.preloadHandlers,
  )

  registerContractHandlers(
    ~contractName="MovieManager",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )
  registerContractHandlers(
    ~contractName="TicketEscrow",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )

  let generatedConfig = {
    // Need to recreate initial config one more time,
    // since configWithoutRegistrations called register for event
    // before they were ready
    ...makeGeneratedConfig(),
    registrations: Some(EventRegister.finishRegistration()),
  }
  config := Some(generatedConfig)
  generatedConfig
}

let getConfig = () => {
  switch config.contents {
  | Some(config) => config
  | None => registerAllHandlers()
  }
}

let getConfigWithoutRegistrations = makeGeneratedConfig
