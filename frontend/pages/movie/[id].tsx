'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const MovieDetailsContent = dynamic(
  () => import('@/components/movie/MovieDetails'),
  { 
    loading: () => (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading Movie Details...</div>
      </div>
    ),
    ssr: false 
  }
);

export default function MoviePage() {
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

  return <MovieDetailsContent />;
}