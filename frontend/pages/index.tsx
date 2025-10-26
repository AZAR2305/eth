import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen ">
      {/* Hero Light Beam */}
      <div className="hero-light"></div>

      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 pointer-events-none"></div>

      <nav className="relative z-10 p-6 flex flex-col md:flex-row justify-between items-center border-b border-white/10">
        <h1 className="text-4xl font-bold mb-4 md:mb-0 text-gradient">🎬 MOVIEX</h1>
        <WalletConnect />
      </nav>

      <main className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* Hero Section */}
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold">
              ⛓️ OnChain Cinema Platform
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 text-gradient">
            Fully Decentralized Movie Ticketing
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Buy tickets with PYUSD. Encrypted NFT tickets. On-chain verification. Experience cinema on the blockchain.
          </p>
  </motion.div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-16">
          <Link href="/customer">
            <div className="panel p-6 md:p-8 hover:bg-white/10 transition-all cursor-pointer">
              <div className="text-5xl md:text-6xl mb-4">🎫</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gradient">Customer Portal</h3>
              <p className="text-gray-300">
                Browse movies, buy tickets with PYUSD, and get your NFT tickets instantly
              </p>
              <div className="mt-4 flex items-center text-gradient font-semibold">
                <span>Enter Portal</span>
                <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          <Link href="/theater-owner">
            <div className="panel p-6 md:p-8 hover:bg-white/10 transition-all cursor-pointer">
              <div className="text-5xl md:text-6xl mb-4">🎬</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gradient">Theater Owner</h3>
              <p className="text-gray-300">
                Add movies, create showtimes, manage tickets, and view analytics
              </p>
              <div className="mt-4 flex items-center text-gradient font-semibold">
                <span>Access Dashboard</span>
                <span className="ml-2">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* About Section */}
        <div className="max-w-6xl mx-auto mb-16">
            <div className="panel p-6 md:p-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gradient">🚀 About MOVIEX</h3>
            <p className="text-gray-300 text-lg mb-6 text-center max-w-3xl mx-auto">
              MOVIEX is a revolutionary blockchain-based cinema platform that brings transparency, security, and innovation to the movie ticketing industry.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="panel p-6 hover:border-cyan-400/60 transition">
                <div className="text-4xl mb-4">🔐</div>
                <h4 className="text-xl font-bold mb-2 text-gradient">Secure NFT Tickets</h4>
                <p className="text-gray-400 text-sm">
                  Each ticket is a unique NFT with encrypted data, ensuring authenticity and preventing fraud
                </p>
              </div>

              <div className="panel p-6 hover:border-cyan-400/60 transition">
                <div className="text-4xl mb-4">💰</div>
                <h4 className="text-xl font-bold mb-2 text-gradient">PYUSD Payments</h4>
                <p className="text-gray-400 text-sm">
                  Fast, secure payments with PYUSD stablecoin through smart contract escrow
                </p>
              </div>

              <div className="panel p-6 hover:border-cyan-400/60 transition">
                <div className="text-4xl mb-4">⛓️</div>
                <h4 className="text-xl font-bold mb-2 text-gradient">100% On-Chain</h4>
                <p className="text-gray-400 text-sm">
                  All transactions verified on Ethereum blockchain with complete transparency
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
            <div className="mt-12 md:mt-16 grid md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          <div className="panel p-6 text-center hover:border-cyan-400/50 transition">
            <div className="text-3xl md:text-4xl mb-2">📱</div>
            <h4 className="font-bold mb-2 text-gradient">QR Scanning</h4>
            <p className="text-xs md:text-sm text-gray-400">Easy ticket verification</p>
          </div>
          
          <div className="panel p-6 text-center hover:border-cyan-400/50 transition">
            <div className="text-3xl md:text-4xl mb-2">💸</div>
            <h4 className="font-bold mb-2 text-gradient">Smart Escrow</h4>
            <p className="text-xs md:text-sm text-gray-400">Automated refunds</p>
          </div>

          <div className="panel p-6 text-center hover:border-cyan-400/50 transition">
            <div className="text-3xl md:text-4xl mb-2">📊</div>
            <h4 className="font-bold mb-2 text-gradient">Real-time Analytics</h4>
            <p className="text-xs md:text-sm text-gray-400">Live ticket data</p>
          </div>

          <div className="panel p-6 text-center hover:border-cyan-400/50 transition">
            <div className="text-3xl md:text-4xl mb-2">🎨</div>
            <h4 className="font-bold mb-2 text-gradient">NFT Collectibles</h4>
            <p className="text-xs md:text-sm text-gray-400">Keep movie memories</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm mb-4">Built on Ethereum Sepolia Testnet</p>
          <div className="flex justify-center gap-4">
            <Link href="/customer">
              <button className="px-6 py-3 btn-accent rounded-xl font-bold transition">
                🎫 Buy Tickets
              </button>
            </Link>
            <Link href="/theater-owner">
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold border border-white/10 transition">
                🎬 Manage Theater
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 mt-16 text-center text-gray-500 text-sm">
        <p>© 2024 MOVIEX - Decentralized Cinema Platform</p>
        <p className="mt-2">Powered by Ethereum Blockchain 🔗</p>
      </footer>
    </div>
  );
}
