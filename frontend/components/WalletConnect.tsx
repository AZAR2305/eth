'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';

export function WalletConnect() {
  const { address, isConnected, connect, disconnect } = useWeb3();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="px-6 py-2 bg-neutral-700 text-white rounded-lg font-medium">
        Loading...
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono bg-white/10 px-3 py-2 rounded-lg">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-6 py-2 btn-accent font-medium"
    >
      Connect Wallet
    </button>
  );
}
