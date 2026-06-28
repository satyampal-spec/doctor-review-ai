'use client';

import { useEffect, useRef } from 'react';

export default function QRCodeModal({ clinic, onClose }) {
  const canvasRef = useRef(null);
  const reviewUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/review/${clinic.id}`;

  useEffect(() => {
    let cancelled = false;
    async function drawQR() {
      const QRCode = (await import('qrcode')).default;
      if (cancelled || !canvasRef.current) return;
      await QRCode.toCanvas(canvasRef.current, reviewUrl, {
        width: 240,
        margin: 2,
        color: { dark: '#1d4ed8', light: '#ffffff' },
      });
    }
    drawQR();
    return () => { cancelled = true; };
  }, [reviewUrl]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${clinic.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-1">{clinic.doctorName}</h3>
        <p className="text-gray-500 text-sm mb-6">{clinic.clinicName} · {clinic.location}</p>

        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Print this and place it at your reception counter or on the doctor's desk.
        </p>

        <div className="flex gap-3">
          <button onClick={downloadQR} className="btn-primary flex-1 text-sm">
            ⬇ Download PNG
          </button>
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
