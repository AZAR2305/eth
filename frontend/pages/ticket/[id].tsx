'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const TicketDetailsContent = dynamic(
  () => import('@/components/ticket/TicketDetails'),
  {
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-xl">Loading Ticket...</div>
      </div>
    ),
    ssr: false,
  }
);

export default function TicketPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return <TicketDetailsContent />;
}
