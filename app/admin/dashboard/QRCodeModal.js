'use client';

import { useEffect, useRef } from 'react';

// entity = { name, subtitle, url, color, downloadName }
export default function QRCodeModal({ entity, onClose }) {
  const canvasRef = useRef(null);
  const { name, subtitle, url, color = '#1d4ed8', downloadName = 'qr' } = entity || {};

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    async function drawQR() {
      const QRCode = (await import('qrcode')).default;
      if (cancelled || !canvasRef.current) return;
      await QRCode.toCanvas(canvasRef.current, url, {
        width: 240,
        margin: 2,
        color: { dark: color, light: '#ffffff' },
      });
    }
    drawQR();
    return () => { cancelled = true; };
  }, [url, color]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${downloadName}.png`;
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
        <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-gray-500 text-sm mb-6">{subtitle}</p>

        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl border" style={{ background: `${color}15`, borderColor: `${color}30` }}>
            <canvas ref={canvasRef} />
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-2 font-mono break-all">{url}</p>
        <p className="text-xs text-gray-400 mb-6">
          Print this QR and place it at your counter — customers scan to leave a Google review.
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
