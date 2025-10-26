# 🎬 MOVIEX - Decentralized Movie Ticketing Platform

A complete Web3 movie ticketing system built on Ethereum with PYUSD payments, NFT tickets, and real-time analytics powered by Envio.

## 🌟 Features

- **🎫 NFT-Based Tickets**: Each ticket is an ERC-721 NFT with unique metadata
- **💰 PYUSD Payments**: Pay for tickets using PayPal's PYUSD stablecoin
- **🔐 Secure Escrow**: Smart contract-based payment escrow system
- **📊 Real-time Analytics**: Theater owner dashboard powered by Envio indexer
- **🎨 Modern UI**: Beautiful gradient design with Framer Motion animations
- **🔄 Refund System**: Automated refunds before showtime
- **📱 QR Code Tickets**: Digital tickets with QR codes for easy verification
- **🎭 Age Verification**: On-chain age restriction enforcement

## 🏗️ Architecture

```
├── blockchain/          # Hardhat smart contracts
│   ├── contracts/      # Solidity contracts
│   └── scripts/        # Deployment scripts
├── envio-indexer/      # Envio GraphQL indexer
│   └── src/           # Event handlers
├── frontend/           # Next.js application
│   ├── components/    # React components
│   ├── pages/         # Next.js pages
│   └── lib/           # Utilities & contracts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask wallet
- Sepolia testnet ETH
- PYUSD tokens (testnet)

### Installation

```bash
# Clone the repository
git clone https://github.com/AZAR2305/eth.git
cd eth

# Install blockchain dependencies
cd blockchain
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install Envio indexer dependencies
cd ../envio-indexer
pnpm install
```

### Environment Setup

1. **Blockchain** - Create `blockchain/.env`:
```env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
ETHERSCAN_API_KEY=your_etherscan_key
```

2. **Frontend** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_MOVIE_MANAGER_ADDRESS=deployed_contract_address
NEXT_PUBLIC_TICKET_ESCROW_ADDRESS=deployed_contract_address
NEXT_PUBLIC_TICKET_NFT_ADDRESS=deployed_contract_address
NEXT_PUBLIC_AGE_VERIFICATION_ADDRESS=deployed_contract_address
NEXT_PUBLIC_PYUSD_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_ENVIO_GRAPHQL_URL=http://localhost:8080/v1/graphql
```

## 📦 Smart Contracts

Deployed on Ethereum Sepolia testnet:

- **MovieManager**: Manages movies and shows
- **TicketEscrow**: Handles PYUSD payments and refunds
- **TicketNFT**: ERC-721 NFT tickets
- **AgeVerification**: On-chain age verification
- **MockPYUSD**: PYUSD token contract (Sepolia)

See [blockchain/README.md](./blockchain/README.md) for detailed contract documentation.

## 🎨 Frontend

Built with:
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **ethers.js** - Ethereum interaction
- **Reown AppKit** - Wallet connection
- **Recharts** - Analytics charts
- **Pinata** - IPFS file storage

See [frontend/README.md](./frontend/README.md) for setup details.

## 📊 Indexer

Real-time event indexing with Envio:
- Indexes MovieAdded, ShowAdded, TicketPurchased, RefundProcessed events
- GraphQL API for querying indexed data
- Powers theater owner analytics dashboard

See [envio-indexer/README.md](./envio-indexer/README.md) for configuration.

## 🎭 User Flows

### Customer Flow
1. Connect wallet
2. Browse available movies and shows
3. Select seats and purchase tickets with PYUSD
4. Receive NFT ticket (issued 30 mins before showtime)
5. View QR code (available 3 hours before showtime)
6. Request refund (if before QR code availability)

### Theater Owner Flow
1. Register as theater owner
2. Add movies with metadata (uploaded to IPFS)
3. Create shows with pricing and seat configuration
4. View real-time analytics and revenue
5. Verify tickets by scanning QR codes

## 💳 Payment System

- **Token**: PYUSD (PayPal USD stablecoin)
- **Process**:
  1. Customer approves PYUSD spending
  2. Escrow contract holds payment
  3. Theater owner can withdraw after showtime
  4. Automated refunds before showtime (90/10 split)

## 🔐 Security Features

- Smart contract-based escrow
- Time-locked ticket issuance
- Age verification for restricted content
- Role-based access control
- Reentrancy protection

## 🛠️ Development

```bash
# Start blockchain node (separate terminal)
cd blockchain
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Start Envio indexer (separate terminal)
cd envio-indexer
pnpm dev

# Start frontend (separate terminal)
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## 📝 Testing

```bash
# Test smart contracts
cd blockchain
npx hardhat test

# Run specific script
npx hardhat run scripts/check-movies.js --network sepolia
```

## 🌐 Deployment

### Smart Contracts (Sepolia)
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network sepolia
```

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Indexer (Docker)
```bash
cd envio-indexer
docker-compose up -d
```

## 📚 Documentation

- [Smart Contracts](./blockchain/README.md) - Contract details and deployment
- [Frontend](./frontend/README.md) - UI components and pages
- [Envio Indexer](./envio-indexer/README.md) - Event indexing setup

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **GitHub**: https://github.com/AZAR2305/eth
- **Deployed App**: https://eth-moviex.vercel.app/
- **Demo Video**: [Coming soon]

## 🙏 Acknowledgments

- **PayPal** - PYUSD stablecoin integration
- **Envio** - Real-time blockchain indexing
- **Hardhat** - Ethereum development environment
- **Pinata** - IPFS pinning service

---

**Built with ❤️ using Web3 technologies**
