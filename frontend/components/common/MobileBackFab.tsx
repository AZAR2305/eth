'use client';

import { useRouter } from 'next/router';
import { useCallback } from 'react';

export function MobileBackFab() {
  const router = useRouter();

  const onBack = useCallback(() => {
    // If we have history, go back; otherwise go home
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <button
      onClick={onBack}
      aria-label="Go Back"
      className="fixed bottom-4 left-4 z-50 md:hidden px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur hover:bg-white/20 transition"
    >
      ← Back
    </button>
  );
}
