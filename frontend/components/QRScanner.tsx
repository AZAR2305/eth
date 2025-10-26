'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanError?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const html5QrcodeScanner = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      /* verbose= */ false
    );

    html5QrcodeScanner.render(
      (decodedText, decodedResult) => {
        console.log('✅ QR Code scanned:', decodedText);
        onScanSuccess(decodedText, decodedResult);
        // Stop scanning after successful scan
        html5QrcodeScanner.clear();
      },
      (errorMessage) => {
        // Handle scan errors silently (camera is scanning continuously)
        if (onScanError && !errorMessage.includes('NotFoundException')) {
          console.warn('QR Scan error:', errorMessage);
        }
      }
    );

    setScanner(html5QrcodeScanner);

    // Cleanup
    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(err => {
          console.error('Error clearing scanner:', err);
        });
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        id="qr-reader" 
        className="rounded-lg overflow-hidden border-2 border-purple-500"
      />
      <p className="text-center text-sm text-gray-400 mt-4">
        📷 Point your camera at a QR code
      </p>
    </div>
  );
}
