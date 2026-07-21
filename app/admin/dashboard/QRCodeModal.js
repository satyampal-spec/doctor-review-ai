'use client';

import { useEffect, useRef } from 'react';

// entity = { name, subtitle, url, color, downloadName, message }
export default function QRCodeModal({ entity, onClose }) {
  const canvasRef = useRef(null);
  const { name, subtitle, url, color = '#1d4ed8', downloadName = 'qr', message = 'Get Your Automated Review' } = entity || {};

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

  // Wraps text across centered lines within maxWidth. Returns the y position
  // after the last line so callers can stack more content beneath it.
  const wrapText = (ctx, text, centerX, startY, maxWidth, lineHeight) => {
    const words = (text || '').split(' ');
    let line = '';
    let y = startY;
    for (let i = 0; i < words.length; i++) {
      const test = line ? `${line} ${words[i]}` : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, centerX, y);
        line = words[i];
        y += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) { ctx.fillText(line, centerX, y); y += lineHeight; }
    return y;
  };

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Downloads a clean printable card: just the doctor/clinic/shop name, the
  // QR code, and a short encouraging message. Deliberately excludes the
  // physical address and the raw review link — patients scanning it don't
  // need to read a URL, and it looks a lot cleaner on a printed counter card.
  const downloadQR = async () => {
    if (!url) return;
    const QRCode = (await import('qrcode')).default;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 480, margin: 1, color: { dark: color, light: '#ffffff' } });

    const qrImg = new window.Image();
    qrImg.onload = () => {
      const W = 640, H = 800;
      const card = document.createElement('canvas');
      card.width = W;
      card.height = H;
      const ctx = card.getContext('2d');

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      // Top color band — name only
      const bandH = 150;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, W, bandH);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = '700 34px -apple-system, "Segoe UI", sans-serif';
      wrapText(ctx, name || 'Scan & Review', W / 2, bandH / 2 - 8, W - 100, 42);

      // QR code
      const qrSize = 400;
      const qrX = (W - qrSize) / 2;
      const qrY = bandH + 60;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      roundRect(ctx, qrX - 24, qrY - 24, qrSize + 48, qrSize + 48, 28);
      ctx.fill();
      ctx.stroke();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Message only — no address, no URL text
      ctx.fillStyle = '#111827';
      ctx.font = '800 28px -apple-system, "Segoe UI", sans-serif';
      wrapText(ctx, `✨ ${message}`, W / 2, qrY + qrSize + 70, W - 100, 36);

      const link = document.createElement('a');
      link.download = `${downloadName}.png`;
      link.href = card.toDataURL('image/png');
      link.click();
    };
    qrImg.src = qrDataUrl;
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
          The downloaded card shows only the name and a short message, no address or link text.
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
