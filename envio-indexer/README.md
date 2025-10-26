# 📊 Envio Indexer - Real-time Blockchain Indexing## Envio Indexer



High-performance blockchain event indexer for the MOVIEX ticketing platform, powered by **Envio**.*Please refer to the [documentation website](https://docs.envio.dev) for a thorough guide on all [Envio](https://envio.dev) indexer features*



## 🌟 What is Envio?### Run



Envio is a modern blockchain indexing solution that provides:```bash

- ⚡ **Real-time indexing** of smart contract eventspnpm dev

- 🔍 **GraphQL API** for querying indexed data```

- 🚀 **High performance** with PostgreSQL backend

- 🐳 **Docker support** for easy deploymentVisit http://localhost:8080 to see the GraphQL Playground, local password is `testing`.

- 📊 **Multi-chain support** (currently using Ethereum Sepolia)

### Generate files from `config.yaml` or `schema.graphql`

## 🏗️ Architecture

```bash

```pnpm codegen

envio-indexer/```

├── config.yaml              # Envio configuration

├── schema.graphql           # GraphQL schema definition### Pre-requisites

├── src/

│   └── EventHandlers.ts     # Event processing logic- [Node.js (use v18 or newer)](https://nodejs.org/en/download/current)

├── generated/               # Auto-generated code- [pnpm (use v8 or newer)](https://pnpm.io/installation)

└── docker-compose.yaml      # Docker setup- [Docker desktop](https://www.docker.com/products/docker-desktop/)

```

## 📋 Indexed Events

### 1. MovieAdded
**Emitted by**: MovieManager contract  
**Indexed Fields**:
- `movieId` - Unique movie identifier
- `title` - Movie title
- `owner` - Theater owner address
- `blockNumber` - Block number
- `blockTimestamp` - Block timestamp
- `transactionHash` - Transaction hash

**Use Case**: Track all movies added to the platform

---

### 2. ShowAdded
**Emitted by**: MovieManager contract  
**Indexed Fields**:
- `showId` - Unique show identifier
- `movieId` - Associated movie ID
- `showtime` - Unix timestamp of show
- `ticketPrice` - Price in PYUSD (smallest unit)
- `blockNumber` - Block number
- `blockTimestamp` - Block timestamp
- `transactionHash` - Transaction hash

**Use Case**: Track all scheduled shows and pricing

---

### 3. TicketPurchased
**Emitted by**: TicketEscrow contract  
**Indexed Fields**:
- `purchaseId` - Unique purchase identifier
- `showId` - Show for which ticket was purchased
- `buyer` - Customer wallet address
- `amount` - Total PYUSD paid
- `seatNumbers` - Array of seat numbers
- `blockNumber` - Block number
- `blockTimestamp` - Block timestamp
- `transactionHash` - Transaction hash

**Use Case**: Track ticket sales and revenue

---

### 4. RefundProcessed
**Emitted by**: TicketEscrow contract  
**Indexed Fields**:
- `purchaseId` - Purchase being refunded
- `buyer` - Customer receiving refund
- `customerAmount` - Amount refunded to customer (90%)
- `theaterOwnerAmount` - Amount retained by theater (10%)
- `blockNumber` - Block number
- `blockTimestamp` - Block timestamp
- `transactionHash` - Transaction hash

**Use Case**: Track refund transactions

## 🚀 Quick Start

### Prerequisites
```bash
# Install pnpm
npm install -g pnpm

# Check versions
node --version  # v18+
pnpm --version  # v8+
docker --version # (optional, for production)
```

### Installation

```bash
cd envio-indexer

# Install dependencies (correct versions for Envio 2.31)
pnpm install
```

**Important**: This project uses:
- `rescript@11.1.3` (NOT 12.x)
- `rescript-schema@9.3.0` (NOT 9.3.0-rescript12.0)
- `rescript-envsafe@5.0.0`
- `envio@2.31.0`

### Environment Setup

The indexer reads from `config.yaml`. Update contract addresses:

```yaml
# config.yaml
name: moviex-indexer
networks:
  - id: 11155111  # Sepolia chain ID
    rpc_url: https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
    start_block: 7365000  # Deploy block number
    contracts:
      - name: MovieManager
        address: "0xYourMovieManagerAddress"
        abi_file_path: ./abis/MovieManager.json
        handler: ./src/EventHandlers.ts
        events:
          - event: MovieAdded
          - event: ShowAdded
      
      - name: TicketEscrow
        address: "0xYourTicketEscrowAddress"
        abi_file_path: ./abis/TicketEscrow.json
        handler: ./src/EventHandlers.ts
        events:
          - event: TicketPurchased
          - event: RefundProcessed
```

## 🛠️ Development

### Start Indexer (Development Mode)

```bash
# Start with local database
pnpm dev

# Or with Docker
docker-compose up -d
```

The indexer will:
1. Connect to Ethereum Sepolia
2. Sync from `start_block` to latest
3. Process events through handlers
4. Expose GraphQL API at `http://localhost:8080/v1/graphql`

### Event Handlers

Located in `src/EventHandlers.ts`:

```typescript
// MovieAdded event handler
MovieManager.MovieAdded.handler(async ({ event, context }) => {
  const entity: MovieManager_MovieAdded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    movieId: event.params.movieId,
    title: event.params.title,
    owner: event.params.owner,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };

  context.MovieManager_MovieAdded.set(entity);
});
```

### GraphQL Schema

Located in `schema.graphql`:

```graphql
type MovieManager_MovieAdded {
  id: ID!
  movieId: BigInt!
  title: String!
  owner: String!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: String!
}

type MovieManager_ShowAdded {
  id: ID!
  showId: BigInt!
  movieId: BigInt!
  showtime: BigInt!
  ticketPrice: BigInt!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: String!
}

type TicketEscrow_TicketPurchased {
  id: ID!
  purchaseId: BigInt!
  showId: BigInt!
  buyer: String!
  amount: BigInt!
  seatNumbers: [BigInt!]!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: String!
}

type TicketEscrow_RefundProcessed {
  id: ID!
  purchaseId: BigInt!
  buyer: String!
  customerAmount: BigInt!
  theaterOwnerAmount: BigInt!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: String!
}
```

## 🔍 GraphQL Queries

### Query Movies by Owner

```graphql
query GetMoviesByOwner($owner: String!) {
  MovieManager_MovieAdded(
    where: { owner: { _eq: $owner } }
    order_by: { movieId: desc }
  ) {
    id
    movieId
    title
    owner
    blockTimestamp
  }
}
```

### Query Shows for Movies

```graphql
query GetShowsByMovies($movieIds: [BigInt!]!) {
  MovieManager_ShowAdded(
    where: { movieId: { _in: $movieIds } }
    order_by: { showtime: desc }
  ) {
    showId
    movieId
    showtime
    ticketPrice
  }
}
```

### Query Purchases by Show

```graphql
query GetPurchasesByShow($showId: BigInt!) {
  TicketEscrow_TicketPurchased(
    where: { showId: { _eq: $showId } }
    order_by: { purchaseId: desc }
  ) {
    purchaseId
    buyer
    amount
    seatNumbers
    blockTimestamp
  }
}
```

### Query Purchases by Buyer

```graphql
query GetPurchasesByBuyer($buyer: String!) {
  TicketEscrow_TicketPurchased(
    where: { buyer: { _eq: $buyer } }
    order_by: { purchaseId: desc }
  ) {
    purchaseId
    showId
    amount
    seatNumbers
  }
}
```

### Query Theater Analytics

```graphql
query GetTheaterAnalytics($owner: String!) {
  movies: MovieManager_MovieAdded(
    where: { owner: { _ilike: $owner } }
    order_by: { movieId: desc }
  ) {
    movieId
    title
  }
  
  purchases: TicketEscrow_TicketPurchased(
    order_by: { purchaseId: desc }
  ) {
    purchaseId
    showId
    amount
    seatNumbers
  }
  
  refunds: TicketEscrow_RefundProcessed(
    order_by: { purchaseId: desc }
  ) {
    purchaseId
    customerAmount
    theaterOwnerAmount
  }
}
```

## 🌐 API Endpoints

Once running, the indexer exposes:

- **GraphQL Playground**: `http://localhost:8080/v1/graphql`
- **Health Check**: `http://localhost:8080/health`

## 🐳 Docker Deployment

### Production Setup

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop indexer
docker-compose down
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: envio
      POSTGRES_USER: envio
      POSTGRES_PASSWORD: envio
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  indexer:
    image: envio-indexer
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://envio:envio@postgres:5432/envio
    ports:
      - "8080:8080"
    volumes:
      - ./config.yaml:/app/config.yaml
      - ./src:/app/src

volumes:
  postgres_data:
```

## 📊 Frontend Integration

The frontend uses the indexer for real-time data:

```typescript
// lib/envio.ts
const ENVIO_URL = 'http://localhost:8080/v1/graphql';

export async function queryEnvio<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const response = await fetch(ENVIO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

// Usage in components
const data = await queryEnvio<{ movies: Movie[] }>(QUERY, { owner: address });
```

## 🔧 Configuration Options

### config.yaml

```yaml
name: moviex-indexer
description: "MOVIEX ticket sales indexer"

networks:
  - id: 11155111  # Sepolia
    rpc_url: ${SEPOLIA_RPC_URL}
    start_block: 7365000
    contracts:
      - name: MovieManager
        address: ${MOVIE_MANAGER_ADDRESS}
        abi_file_path: ./abis/MovieManager.json
        handler: ./src/EventHandlers.ts
        events:
          - event: MovieAdded
            required_entities:
              - name: MovieManager_MovieAdded
          - event: ShowAdded
            required_entities:
              - name: MovieManager_ShowAdded
```

## 📈 Performance

- **Sync Speed**: ~1000 blocks/second
- **Query Latency**: <100ms (average)
- **Database**: PostgreSQL with optimized indexes
- **Caching**: Built-in query result caching

## 🐛 Troubleshooting

### Indexer Not Syncing

```bash
# Check logs
docker-compose logs indexer

# Verify RPC connection
curl -X POST $SEPOLIA_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### GraphQL Errors

```bash
# Test GraphQL endpoint
curl http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } } }"}'
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker-compose exec postgres psql -U envio -d envio -c "\dt"
```

## 🔄 Reindexing

To reindex from scratch:

```bash
# Stop indexer
docker-compose down

# Remove database volume
docker volume rm envio-indexer_postgres_data

# Restart
docker-compose up -d
```

## 📊 Monitoring

Monitor indexer health:

```bash
# Check sync status
curl http://localhost:8080/health

# View processing metrics
docker-compose logs indexer | grep "Processed"
```

## 🆚 Why Envio?

Compared to The Graph:
- ✅ **Faster** - Up to 10x faster indexing
- ✅ **Simpler** - No subgraph deployment, just TypeScript
- ✅ **Cheaper** - Self-hosted, no query fees
- ✅ **Real-time** - Near-instant updates
- ✅ **Type-safe** - Auto-generated TypeScript types

## 📚 Resources

- [Envio Documentation](https://docs.envio.dev/)
- [GraphQL Tutorial](https://graphql.org/learn/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sepolia Testnet Info](https://sepolia.dev/)

## 🤝 Contributing

To add new events:

1. Update `config.yaml` with new event
2. Add event handler in `src/EventHandlers.ts`
3. Update GraphQL schema in `schema.graphql`
4. Regenerate types: `pnpm codegen`
5. Restart indexer

---

**Powered by Envio - The fastest way to index blockchain data**
