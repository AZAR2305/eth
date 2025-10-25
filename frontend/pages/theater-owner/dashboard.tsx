'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const TheaterOwnerContent = dynamic(
  () => import('./index-new'),
  { 
    loading: () => (
      <div className="min-h-screen  items-center justify-center">
        <div className="text-xl">Loading Theater Dashboard...</div>
      </div>
    ),
    ssr: false 
  }
);

export default function TheaterOwnerDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check authentication
    const isAuth = sessionStorage.getItem('theater_owner_auth');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/theater-owner');
    }
  }, [router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">🔐 Verifying access...</div>
      </div>
    );
  }

  return <TheaterOwnerContent />;
}
