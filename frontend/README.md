# 🎬 MOVIEX Frontend - Next.js Application

Modern, responsive web application for the MOVIEX blockchain ticketing platform, built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## 🌟 Features

### Customer Experience
- 🎫 **Browse Movies** - View available movies with rich metadata
- 📅 **Show Selection** - See scheduled showtimes and pricing
- 💳 **PYUSD Payments** - Secure stablecoin ticket purchases
- 🎟️ **NFT Tickets** - Receive ERC-721 ticket NFTs
- 📱 **QR Codes** - Time-based QR codes for venue entry
- 💰 **Refunds** - Request refunds before showtime

### Theater Owner Tools
- 🎥 **Movie Management** - Add movies with IPFS metadata
- ⏰ **Show Scheduling** - Create multiple shows per movie
- 💸 **Dynamic Pricing** - Update ticket prices per show
- 📊 **Analytics Dashboard** - Real-time sales and revenue tracking
- ✅ **Ticket Verification** - QR code scanning for entry

## 🏗️ Tech Stack

- **Framework**: Next.js 14.2.33 (Pages Router)
- **Language**: TypeScript 5.6.3
- **Styling**: Tailwind CSS 3.4.17
- **Animations**: Framer Motion 11.15.0
- **Wallet**: Reown AppKit 1.6.2
- **Blockchain**: ethers.js 6.13.4
- **Storage**: Pinata (IPFS)
- **Indexer**: Envio (GraphQL)
- **Charts**: Recharts 2.14.1
- **QR Codes**: react-qr-code 2.0.15

## 📁 Project Structure

```
frontend/
├── pages/                    # Next.js pages (routes)
│   ├── _app.tsx             # App wrapper with providers
│   ├── index.tsx            # Landing page
│   ├── customer/
│   │   ├── movies.tsx       # Browse movies
│   │   └── tickets.tsx      # My tickets
│   ├── movie/
│   │   └── [movieId].tsx    # Movie details + shows
│   ├── ticket/
│   │   └── [tokenId].tsx    # Ticket detail + QR
│   └── theater-owner/
│       ├── dashboard.tsx    # Theater dashboard
│       ├── add-movie.tsx    # Add new movie
│       └── analytics.tsx    # Sales analytics
│
├── components/              # React components
│   ├── Header.tsx           # Navigation bar
│   ├── SiteShell.tsx        # Page layout wrapper
│   ├── AnimatedBackground.tsx # Background effects
│   ├── WalletConnect.tsx    # Wallet connection
│   ├── Providers.tsx        # Context providers
│   ├── ErrorBoundary.tsx    # Error handling
│   ├── customer/            # Customer components
│   ├── theater/             # Theater owner components
│   ├── movie/               # Movie components
│   └── ticket/              # Ticket components
│
├── lib/                     # Utility libraries
│   ├── contracts.ts         # Contract instances
│   ├── contract-helpers.ts  # Contract interaction helpers
│   ├── ethers.ts            # ethers.js setup
│   ├── web3.ts              # Web3 configuration
│   ├── envio.ts             # Envio GraphQL client
│   ├── ipfs-pinata.ts       # IPFS upload/fetch
│   └── ticket-verify.ts     # QR verification logic
│
├── contexts/                # React contexts
│   └── Web3Context.tsx      # Wallet state management
│
├── config/                  # Configuration
│   └── address.ts           # Contract addresses
│
├── types/                   # TypeScript types
│   └── ethers-contracts/    # Auto-generated contract types
│
└── styles/                  # Global styles
    └── globals.css          # Tailwind + custom CSS
```

## 🚀 Quick Start

### Prerequisites

```bash
node --version  # v18+ required
npm --version   # v9+ required
```

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create `.env.local`:

```env
# Wallet Connect (Reown AppKit)
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id_here

# Pinata (IPFS)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token

# Envio Indexer
NEXT_PUBLIC_ENVIO_URL=http://localhost:8080/v1/graphql

# Network
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
```

**Get API Keys**:
- **Reown**: [cloud.reown.com](https://cloud.reown.com/) (free)
- **Pinata**: [pinata.cloud](https://www.pinata.cloud/) (free tier)

### Contract Addresses

Update `config/address.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  MOVIE_MANAGER: '0xYourMovieManagerAddress',
  TICKET_ESCROW: '0xYourTicketEscrowAddress',
  TICKET_NFT: '0xYourTicketNFTAddress',
  AGE_VERIFICATION: '0xYourAgeVerificationAddress',
  PYUSD: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia PYUSD
};
```

### Development

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel deploy
```

## 🔗 Wallet Integration

### Reown AppKit (WalletConnect v2)

The app uses Reown AppKit for multi-wallet support:

```typescript
// lib/web3.ts
import { createAppKit } from '@reown/appkit/react';
import { sepolia } from '@reown/appkit/networks';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;

const wagmiAdapter = new WagmiAdapter({
  networks: [sepolia],
  projectId,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia],
  projectId,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
});
```

**Supported Wallets**:
- MetaMask
- Coinbase Wallet
- WalletConnect
- Rainbow
- Trust Wallet
- And 300+ more!

### Connect Button

```tsx
import { WalletConnect } from '@/components/WalletConnect';

export default function Page() {
  return <WalletConnect />;
}
```

## 💳 PYUSD Payment Integration

### PayPal USD (PYUSD) on Sepolia

The platform uses PYUSD stablecoin for payments:

```typescript
// PYUSD Contract
const PYUSD_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const PYUSD_DECIMALS = 6; // Important: 6 decimals, not 18!

// Example: $10 USD = 10_000_000 smallest units
const price = BigInt(10 * 10 ** 6); // 10 PYUSD
```

### Purchase Flow

1. **Approve PYUSD**: Customer approves TicketEscrow to spend PYUSD
2. **Buy Ticket**: Customer calls `buyTicket()` with show and seats
3. **NFT Minted**: TicketNFT minted to customer's wallet
4. **QR Issued**: QR code becomes available 3 hours before showtime

```typescript
// lib/contract-helpers.ts
export async function buyTicket(
  showId: number,
  seatNumbers: number[],
  totalPrice: bigint
) {
  const signer = await getSigner();
  
  // 1. Approve PYUSD
  const pyusd = getPYUSDContract(signer);
  await pyusd.approve(CONTRACT_ADDRESSES.TICKET_ESCROW, totalPrice);
  
  // 2. Buy ticket
  const escrow = getTicketEscrowContract(signer);
  const tx = await escrow.buyTicket(showId, seatNumbers);
  await tx.wait();
}
```

## 📦 IPFS Integration (Pinata)

### Upload Metadata

```typescript
// lib/ipfs-pinata.ts
export async function uploadToPinata(data: any): Promise<string> {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataContent: data,
      pinataMetadata: { name: 'movie-metadata' },
    }),
  });

  const result = await response.json();
  return `ipfs://${result.IpfsHash}`;
}
```

### Fetch Metadata

```typescript
export async function fetchFromIPFS(ipfsUri: string): Promise<any> {
  const hash = ipfsUri.replace('ipfs://', '');
  const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
  
  const response = await fetch(url);
  return response.json();
}
```

### Movie Metadata Format

```json
{
  "title": "Inception",
  "description": "A mind-bending thriller...",
  "genre": "Sci-Fi",
  "duration": "148 minutes",
  "rating": "PG-13",
  "image": "ipfs://QmImageHash",
  "trailer": "https://youtube.com/...",
  "cast": ["Leonardo DiCaprio", "Ellen Page"],
  "director": "Christopher Nolan"
}
```

## 📊 Envio GraphQL Integration

### Query Client

```typescript
// lib/envio.ts
const ENVIO_URL = process.env.NEXT_PUBLIC_ENVIO_URL!;

export async function queryEnvio<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const response = await fetch(ENVIO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}
```

### Example Queries

**Fetch Movies**:
```typescript
const QUERY = `
  query GetMovies($owner: String!) {
    MovieManager_MovieAdded(
      where: { owner: { _ilike: $owner } }
      order_by: { movieId: desc }
    ) {
      movieId
      title
      owner
      blockTimestamp
    }
  }
`;

const data = await queryEnvio(QUERY, { owner: address });
```

**Fetch Purchases**:
```typescript
const QUERY = `
  query GetPurchases($showId: BigInt!) {
    TicketEscrow_TicketPurchased(
      where: { showId: { _eq: $showId } }
    ) {
      purchaseId
      buyer
      amount
      seatNumbers
    }
  }
`;

const purchases = await queryEnvio(QUERY, { showId: '1' });
```

## 🎟️ Ticket & QR System

### Time-Based Access

```typescript
// lib/ticket-verify.ts
export function canViewQR(showtime: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const threeHoursBefore = showtime - (3 * 60 * 60);
  return now >= threeHoursBefore;
}

export function canGetTicket(showtime: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const thirtyMinutesBefore = showtime - (30 * 60);
  return now >= thirtyMinutesBefore;
}
```

### QR Code Component

```tsx
// components/ticket/QRDisplay.tsx
import QRCode from 'react-qr-code';

export function QRDisplay({ tokenId, showtime }: Props) {
  const canView = canViewQR(showtime);
  
  if (!canView) {
    return <p>QR available 3 hours before show</p>;
  }

  return (
    <QRCode
      value={JSON.stringify({ tokenId, showtime })}
      size={256}
    />
  );
}
```

### Verification (Theater Owner)

```tsx
// components/theater/QRScanner.tsx
import { QRScanner } from '@/components/QRScanner';

export function VerifyTicket() {
  const handleScan = async (data: string) => {
    const { tokenId } = JSON.parse(data);
    
    // Verify on-chain
    const contract = getTicketNFTContract();
    const owner = await contract.ownerOf(tokenId);
    
    // Mark as used
    await contract.useTicket(tokenId);
  };

  return <QRScanner onScan={handleScan} />;
}
```

## 🎨 Styling & Animations

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
};
```

### Framer Motion Page Transitions

```tsx
// pages/_app.tsx
import { motion, AnimatePresence } from 'framer-motion';

function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.route}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Component {...pageProps} />
      </motion.div>
    </AnimatePresence>
  );
}
```

## 🔒 Security Features

### Contract Interaction Safety

```typescript
// lib/contract-helpers.ts
export async function safeContractCall<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    console.error(errorMessage, error);
    
    // Parse error message
    if (error.reason) throw new Error(error.reason);
    if (error.data?.message) throw new Error(error.data.message);
    
    throw new Error(errorMessage);
  }
}
```

### Input Validation

```typescript
export function validateSeatNumbers(seats: number[]): void {
  if (seats.length === 0) {
    throw new Error('Select at least one seat');
  }
  
  if (seats.some(s => s < 1 || s > 100)) {
    throw new Error('Invalid seat number');
  }
  
  if (new Set(seats).size !== seats.length) {
    throw new Error('Duplicate seats selected');
  }
}
```

## 📱 Responsive Design

All pages are mobile-optimized:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards automatically stack on mobile */}
</div>
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Lint code
npm run lint

# Build test
npm run build
```

## 🐛 Troubleshooting

### Wallet Not Connecting

```bash
# Clear cache
rm -rf .next
npm run dev
```

### IPFS Upload Fails

Check Pinata credentials in `.env.local`:
```env
NEXT_PUBLIC_PINATA_JWT=your_jwt_token_here
```

### Contract Calls Failing

1. Check wallet has Sepolia ETH
2. Verify contract addresses in `config/address.ts`
3. Ensure Envio indexer is running

### Envio Data Not Loading

```bash
# Check indexer status
curl http://localhost:8080/health

# Restart indexer
cd ../envio-indexer
docker-compose restart
```

## 📚 Key Libraries

- **@reown/appkit**: Wallet connection (WalletConnect v2)
- **ethers**: Blockchain interactions
- **framer-motion**: Page transitions & animations
- **recharts**: Analytics charts
- **react-qr-code**: QR code generation
- **date-fns**: Date formatting

## 🚀 Performance Optimization

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic with Next.js
- **Lazy Loading**: Dynamic imports for heavy components
- **Caching**: SWR for data fetching
- **Minification**: Production builds are optimized

## 📖 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Reown AppKit Docs](https://docs.reown.com/appkit/overview)
- [ethers.js Docs](https://docs.ethers.org/v6/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

---

**Built with ❤️ using Next.js 14 and TypeScript**
