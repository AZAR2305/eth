open Table
open Enums.EntityType
type id = string

type internalEntity = Internal.entity
module type Entity = {
  type t
  let index: int
  let name: string
  let schema: S.t<t>
  let rowsSchema: S.t<array<t>>
  let table: Table.table
  let entityHistory: EntityHistory.t<t>
}
external entityModToInternal: module(Entity with type t = 'a) => Internal.entityConfig = "%identity"
external entityModsToInternal: array<module(Entity)> => array<Internal.entityConfig> = "%identity"
external entitiesToInternal: array<'a> => array<Internal.entity> = "%identity"

@get
external getEntityId: internalEntity => string = "id"

exception UnexpectedIdNotDefinedOnEntity
let getEntityIdUnsafe = (entity: 'entity): id =>
  switch Utils.magic(entity)["id"] {
  | Some(id) => id
  | None =>
    UnexpectedIdNotDefinedOnEntity->ErrorHandling.mkLogAndRaise(
      ~msg="Property 'id' does not exist on expected entity object",
    )
  }

//shorthand for punning
let isPrimaryKey = true
let isNullable = true
let isArray = true
let isIndex = true

@genType
type whereOperations<'entity, 'fieldType> = {
  eq: 'fieldType => promise<array<'entity>>,
  gt: 'fieldType => promise<array<'entity>>
}

module MovieManager_MovieAdded = {
  let name = (MovieManager_MovieAdded :> string)
  let index = 0
  @genType
  type t = {
    blockNumber: bigint,
    blockTimestamp: bigint,
    id: id,
    movieId: bigint,
    owner: string,
    title: string,
    transactionHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    id: s.field("id", S.string),
    movieId: s.field("movieId", BigInt.schema),
    owner: s.field("owner", S.string),
    title: s.field("title", S.string),
    transactionHash: s.field("transactionHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "movieId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "owner", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "title", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "transactionHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module MovieManager_ShowAdded = {
  let name = (MovieManager_ShowAdded :> string)
  let index = 1
  @genType
  type t = {
    blockNumber: bigint,
    blockTimestamp: bigint,
    id: id,
    movieId: bigint,
    showId: bigint,
    showtime: bigint,
    ticketPrice: bigint,
    transactionHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    id: s.field("id", S.string),
    movieId: s.field("movieId", BigInt.schema),
    showId: s.field("showId", BigInt.schema),
    showtime: s.field("showtime", BigInt.schema),
    ticketPrice: s.field("ticketPrice", BigInt.schema),
    transactionHash: s.field("transactionHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "movieId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "showId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "showtime", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "ticketPrice", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "transactionHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module TicketEscrow_RefundProcessed = {
  let name = (TicketEscrow_RefundProcessed :> string)
  let index = 2
  @genType
  type t = {
    blockNumber: bigint,
    blockTimestamp: bigint,
    buyer: string,
    customerAmount: bigint,
    id: id,
    purchaseId: bigint,
    theaterOwnerAmount: bigint,
    transactionHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    buyer: s.field("buyer", S.string),
    customerAmount: s.field("customerAmount", BigInt.schema),
    id: s.field("id", S.string),
    purchaseId: s.field("purchaseId", BigInt.schema),
    theaterOwnerAmount: s.field("theaterOwnerAmount", BigInt.schema),
    transactionHash: s.field("transactionHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "buyer", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "customerAmount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "purchaseId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "theaterOwnerAmount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "transactionHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module TicketEscrow_TicketPurchased = {
  let name = (TicketEscrow_TicketPurchased :> string)
  let index = 3
  @genType
  type t = {
    amount: bigint,
    blockNumber: bigint,
    blockTimestamp: bigint,
    buyer: string,
    id: id,
    purchaseId: bigint,
    seatNumbers: array<bigint>,
    showId: bigint,
    transactionHash: string,
  }

  let schema = S.object((s): t => {
    amount: s.field("amount", BigInt.schema),
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    buyer: s.field("buyer", S.string),
    id: s.field("id", S.string),
    purchaseId: s.field("purchaseId", BigInt.schema),
    seatNumbers: s.field("seatNumbers", S.array(BigInt.schema)),
    showId: s.field("showId", BigInt.schema),
    transactionHash: s.field("transactionHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "amount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "buyer", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "purchaseId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "seatNumbers", 
      Numeric,
      ~fieldSchema=S.array(BigInt.schema),
      
      
      ~isArray,
      
      
      ),
      mkField(
      "showId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "transactionHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

let userEntities = [
  module(MovieManager_MovieAdded),
  module(MovieManager_ShowAdded),
  module(TicketEscrow_RefundProcessed),
  module(TicketEscrow_TicketPurchased),
]->entityModsToInternal

let allEntities =
  userEntities->Js.Array2.concat(
    [module(InternalTable.DynamicContractRegistry)]->entityModsToInternal,
  )

let byName =
  allEntities
  ->Js.Array2.map(entityConfig => {
    (entityConfig.name, entityConfig)
  })
  ->Js.Dict.fromArray
