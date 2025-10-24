'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>('');

  // Get available cameras
  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        // Select back camera by default (usually better for scanning)
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
        setSelectedCamera(backCamera.id);
      }
    }).catch(err => {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Camera access error:', err);
    });
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) {
      setError('No camera selected');
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          console.log('✅ QR Code scanned:', decodedText);
          onScanSuccess(decodedText);
          stopScanning(); // Stop after successful scan
        },
        (errorMessage) => {
          // Error callback (happens continuously while scanning)
          // Don't show these errors as they're normal
        }
      );

      setIsScanning(true);
      setError('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start scanner';
      setError(errorMsg);
      if (onScanError) onScanError(errorMsg);
      console.error('Scanner start error:', err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/10">
      <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center">
        <span className="mr-2">📷</span> QR Code Scanner
      </h3>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!isScanning && cameras.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm mb-2">Select Camera:</label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* QR Scanner Container */}
      <div className="relative mb-4">
        <div 
          id="qr-reader" 
          className="w-full rounded-lg overflow-hidden"
          style={{ minHeight: isScanning ? '300px' : '0' }}
        />
        {!isScanning && (
          <div className="flex items-center justify-center h-64 bg-black/30 rounded-lg border-2 border-dashed border-white/20">
            <div className="text-center">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-gray-400">Click "Start Scanning" to begin</p>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        {!isScanning ? (
          <button
            onClick={startScanning}
            disabled={!selectedCamera}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-3 rounded-lg font-semibold transition"
          >
            📷 Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold transition"
          >
            ⏹️ Stop Scanning
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>Position the QR code within the frame</p>
        <p>Scanner will automatically detect and read the code</p>
      </div>
    </div>
  );
}
