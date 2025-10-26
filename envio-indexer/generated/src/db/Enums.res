module ContractType = {
  @genType
  type t = 
    | @as("MovieManager") MovieManager
    | @as("TicketEscrow") TicketEscrow

  let name = "CONTRACT_TYPE"
  let variants = [
    MovieManager,
    TicketEscrow,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module EntityType = {
  @genType
  type t = 
    | @as("MovieManager_MovieAdded") MovieManager_MovieAdded
    | @as("MovieManager_ShowAdded") MovieManager_ShowAdded
    | @as("TicketEscrow_RefundProcessed") TicketEscrow_RefundProcessed
    | @as("TicketEscrow_TicketPurchased") TicketEscrow_TicketPurchased
    | @as("dynamic_contract_registry") DynamicContractRegistry

  let name = "ENTITY_TYPE"
  let variants = [
    MovieManager_MovieAdded,
    MovieManager_ShowAdded,
    TicketEscrow_RefundProcessed,
    TicketEscrow_TicketPurchased,
    DynamicContractRegistry,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

let allEnums = ([
  ContractType.config->Internal.fromGenericEnumConfig,
  EntityType.config->Internal.fromGenericEnumConfig,
])
