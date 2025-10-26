
type hyperSyncConfig = {endpointUrl: string}
type hyperFuelConfig = {endpointUrl: string}

@genType.opaque
type rpcConfig = {
  syncConfig: InternalConfig.sourceSync,
}

@genType
type syncSource = HyperSync(hyperSyncConfig) | HyperFuel(hyperFuelConfig) | Rpc(rpcConfig)

@genType.opaque
type aliasAbi = Ethers.abi

type eventName = string

type contract = {
  name: string,
  abi: aliasAbi,
  addresses: array<string>,
  events: array<eventName>,
}

type configYaml = {
  syncSource,
  startBlock: int,
  confirmedBlockThreshold: int,
  contracts: dict<contract>,
  lowercaseAddresses: bool,
}

let publicConfig = ChainMap.fromArrayUnsafe([
  {
    let contracts = Js.Dict.fromArray([
      (
        "MovieManager",
        {
          name: "MovieManager",
          abi: Types.MovieManager.abi,
          addresses: [
            "0x0d9C35FA08D03b1106FceBF0aa097F92C95E8b88",
          ],
          events: [
            Types.MovieManager.MovieAdded.name,
            Types.MovieManager.ShowAdded.name,
          ],
        }
      ),
      (
        "TicketEscrow",
        {
          name: "TicketEscrow",
          abi: Types.TicketEscrow.abi,
          addresses: [
            "0x5BAFcCD137A7318e2dd1b3c696A035940e9c09E2",
          ],
          events: [
            Types.TicketEscrow.RefundProcessed.name,
            Types.TicketEscrow.TicketPurchased.name,
          ],
        }
      ),
    ])
    let chain = ChainMap.Chain.makeUnsafe(~chainId=11155111)
    (
      chain,
      {
        confirmedBlockThreshold: 200,
        syncSource: HyperSync({endpointUrl: "https://11155111.hypersync.xyz"}),
        startBlock: 0,
        contracts,
        lowercaseAddresses: false
      }
    )
  },
])

@genType
let getGeneratedByChainId: int => configYaml = chainId => {
  let chain = ChainMap.Chain.makeUnsafe(~chainId)
  if !(publicConfig->ChainMap.has(chain)) {
    Js.Exn.raiseError(
      "No chain with id " ++ chain->ChainMap.Chain.toString ++ " found in config.yaml",
    )
  }
  publicConfig->ChainMap.get(chain)
}
