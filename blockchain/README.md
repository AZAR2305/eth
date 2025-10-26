# 🔗 Blockchain - Smart Contracts

Ethereum smart contracts for the MOVIEX decentralized ticketing platform, built with **Hardhat v3**.

## 📋 Overview

This directory contains all Solidity smart contracts, deployment scripts, and testing utilities for the movie ticketing system.

## 🏗️ Technology Stack

- **Hardhat 3.0+** - Ethereum development environment
- **Solidity 0.8.20** - Smart contract language
- **OpenZeppelin** - Secure contract libraries
- **ethers.js v6** - Ethereum library
- **Sepolia Testnet** - Deployment network

## 📦 Smart Contracts

### 1. MovieManager.sol
**Purpose**: Manages movies and shows

**Key Features**:
- Theater owner registration
- Movie creation with metadata (IPFS)
- Show scheduling with seat allocation
- Age restriction support

**Main Functions**:
```solidity
registerTheaterOwner()
addMovie(string title, uint8 ageRestriction, string metadataURI)
addShow(uint256 movieId, uint256 showtime, uint256 ticketPrice, uint256 totalSeats)
getAllMovies() → Movie[]
getAllShows() → Show[]
```

**Events**:
- `MovieAdded(uint256 movieId, string title, address owner)`
- `ShowAdded(uint256 showId, uint256 movieId, uint256 showtime, uint256 ticketPrice)`

---

### 2. TicketEscrow.sol
**Purpose**: Handles PYUSD payments and refunds

**Key Features**:
- Escrow payment system
- Automated refund logic (90% customer, 10% theater)
- Time-locked withdrawals
- Purchase tracking

**Main Functions**:
```solidity
buyTicket(uint256 showId, uint256[] seatNumbers)
issueTicket(uint256 purchaseId, string ticketDataURI)
processRefund(uint256 purchaseId)
withdraw(uint256[] showIds)
getShowBookingStats(uint256 showId) → (totalBookings, totalRevenue)
```

**Refund Policy**:
- Available until 3 hours before showtime
- 90% refunded to customer
- 10% retained by theater owner

**Events**:
- `TicketPurchased(uint256 purchaseId, uint256 showId, address buyer, uint256 amount, uint256[] seatNumbers)`
- `RefundProcessed(uint256 purchaseId, address buyer, uint256 customerAmount, uint256 theaterOwnerAmount)`

---

### 3. TicketNFT.sol
**Purpose**: ERC-721 NFT tickets

**Key Features**:
- NFT minting for each ticket
- Metadata stored on IPFS
- QR code generation
- Time-locked issuance (30 mins before showtime)

**Main Functions**:
```solidity
issueTicket(address buyer, uint256 purchaseId, string ticketDataURI) → uint256 tokenId
getTicketURI(uint256 tokenId) → string
getUserTickets(address user) → uint256[]
```

**Metadata Structure** (IPFS JSON):
```json
{
  "name": "Movie Ticket #123",
  "description": "Ticket for [Movie Name]",
  "image": "ipfs://...",
  "attributes": [
    {"trait_type": "Movie", "value": "Movie Title"},
    {"trait_type": "Showtime", "value": "2025-10-26 19:00"},
    {"trait_type": "Seats", "value": "A1, A2"},
    {"trait_type": "Purchase ID", "value": "123"}
  ],
  "ticketData": {
    "qrCode": "data:image/png;base64,...",
    "purchaseId": 123,
    "showId": 5
  }
}
```

---

### 4. AgeVerification.sol
**Purpose**: On-chain age verification

**Key Features**:
- Age attestation system
- Verifier role management
- Age check for restricted movies

**Main Functions**:
```solidity
attestAge(address user, uint256 birthYear)
verifyAge(address user, uint8 minimumAge) → bool
revokeAttestation(address user)
```

---

### 5. MockPYUSD.sol
**Purpose**: PYUSD stablecoin mock for testing

**Details**:
- ERC-20 token
- 6 decimals (same as real PYUSD)
- Mintable for testing
- **Sepolia Address**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

## 🚀 Setup

### Prerequisites
```bash
node --version  # v18+
npm --version   # v9+
```

### Installation
```bash
cd blockchain
npm install
```

### Environment Configuration

Create `.env` file:
```env
# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Sepolia RPC URL
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract addresses (after deployment)
MOVIE_MANAGER_ADDRESS=0x...
TICKET_ESCROW_ADDRESS=0x...
TICKET_NFT_ADDRESS=0x...
AGE_VERIFICATION_ADDRESS=0x...
PYUSD_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

## 🛠️ Hardhat 3 Configuration

```javascript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
```

## 📝 Deployment

### Local Network
```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Sepolia Testnet
```bash
# Deploy all contracts
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "constructor args"
```

## 🧪 Testing

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test file
npx hardhat test test/MovieManager.test.js
```

## 📜 Utility Scripts

All scripts are in the `scripts/` directory:

```bash
# Check movies and shows
npx hardhat run scripts/check-movies.js --network sepolia

# Check PYUSD balance
npx hardhat run scripts/check-pyusd.js --network sepolia

# Grant admin role
npx hardhat run scripts/grant-admin-role.js --network sepolia

# Grant minter role (for TicketNFT)
npx hardhat run scripts/grant-minter-role.js --network sepolia

# Register theater owner
npx hardhat run scripts/register-theater-owner.js --network sepolia

# Add movie with shows
npx hardhat run scripts/add-movie-with-shows.js --network sepolia

# Check user tickets
npx hardhat run scripts/check-user-tickets.js --network sepolia

# Check escrow balance
npx hardhat run scripts/check-escrow-balance.js --network sepolia

# System health check
npx hardhat run scripts/system-check.js --network sepolia
```

## 💰 PYUSD Integration (PayPal)

### What is PYUSD?
PYUSD is a USD-backed stablecoin issued by PayPal. It maintains a 1:1 value with USD.

### Contract Details
- **Network**: Ethereum Sepolia Testnet
- **Address**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **Decimals**: 6 (1 PYUSD = 1,000,000 units)
- **Standard**: ERC-20

### Getting Test PYUSD
```bash
# Mint test PYUSD (if using MockPYUSD)
npx hardhat run scripts/get-pyusd.js --network sepolia
```

### Payment Flow
1. User approves TicketEscrow to spend PYUSD
2. User calls `buyTicket()` - PYUSD transferred to escrow
3. Theater owner can withdraw after showtime
4. Refunds processed automatically (90/10 split)

### Integration Code Example
```javascript
// Approve PYUSD spending
const pyusd = new ethers.Contract(PYUSD_ADDRESS, ERC20_ABI, signer);
await pyusd.approve(ESCROW_ADDRESS, amount);

// Buy ticket
const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
await escrow.buyTicket(showId, [seatNumber1, seatNumber2]);
```

## 🔒 Security

- **Access Control**: Role-based permissions (OpenZeppelin)
- **Reentrancy Protection**: `nonReentrant` modifiers
- **Integer Overflow**: Solidity 0.8+ built-in checks
- **Time Locks**: Prevents early withdrawals
- **Input Validation**: Extensive require statements

## 📊 Gas Optimization

- Efficient storage packing
- Minimal external calls
- Batch operations where possible
- View functions for read operations

## 🔍 Contract Verification

After deployment, verify on Etherscan:

```bash
npx hardhat verify --network sepolia \
  DEPLOYED_ADDRESS \
  "Constructor Arg 1" \
  "Constructor Arg 2"
```

## 📈 Deployed Contracts (Sepolia)

| Contract | Address | Verified |
|----------|---------|----------|
| MovieManager | `0x...` | ✅ |
| TicketEscrow | `0x...` | ✅ |
| TicketNFT | `0x...` | ✅ |
| AgeVerification | `0x...` | ✅ |
| PYUSD (Mock) | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | ✅ |

## 🐛 Troubleshooting

### Common Issues

**Issue**: Transaction fails with "insufficient allowance"
```bash
# Solution: Approve PYUSD spending first
npx hardhat run scripts/check-pyusd.js --network sepolia
```

**Issue**: "Not a theater owner" error
```bash
# Solution: Register as theater owner
npx hardhat run scripts/register-theater-owner.js --network sepolia
```

**Issue**: Contract deployment fails
```bash
# Solution: Check gas price and account balance
npx hardhat run scripts/check-wallet-pyusd.js --network sepolia
```

## 📚 Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [PYUSD Documentation](https://www.paypal.com/us/digital-wallet/manage-money/crypto/pyusd)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)

## 🤝 Contributing

When adding new contracts:
1. Follow existing naming conventions
2. Add comprehensive tests
3. Update this README
4. Include NatSpec comments
5. Run `npx hardhat test` before committing

---

**Powered by Hardhat 3 & PayPal PYUSD**
