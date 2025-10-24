'use client';

import { Web3Provider } from '@/contexts/Web3Context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  );
}