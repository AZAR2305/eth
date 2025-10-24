'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const ScanTicketContent = dynamic(
  () => import('@/components/theater/ScanTicket'),
  { 
    loading: () => (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading Scanner...</div>
      </div>
    ),
    ssr: false 
  }
);

export default function ScanTicket() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return <ScanTicketContent />;
}
