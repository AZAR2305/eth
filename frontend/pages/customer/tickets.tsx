'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const MyTicketsContent = dynamic(
  () => import('@/components/customer/MyTickets'),
  { 
    loading: () => (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading Tickets...</div>
      </div>
    ),
    ssr: false 
  }
);

export default function MyTickets() {
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

  return <MyTicketsContent />;
}
