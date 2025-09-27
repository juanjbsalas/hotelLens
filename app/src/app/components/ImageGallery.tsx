"use client";
import React from 'react';

export default function ImageGallery({ open, onClose, photos, title }: { open: boolean; onClose: () => void; photos: string[]; title?: string }) {
  const [index, setIndex] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIndex(0);
      setLoaded(false);
    }
  }, [open]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, photos.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, photos.length]);

  // focus management: focus close button on open and trap focus inside
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (open) {
      // focus the close button after open
      setTimeout(() => closeRef.current?.focus(), 0);
    }
  }, [open]);

  React.useEffect(() => {
    function onTab(e: KeyboardEvent) {
      if (!open || e.key !== 'Tab') return;
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
      if (!dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }
    window.addEventListener('keydown', onTab);
    return () => window.removeEventListener('keydown', onTab);
  }, [open]);

  if (!open) return null;

  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const next = () => setIndex((i) => Math.min(i + 1, photos.length - 1));

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-2">
          <div className="text-sm font-medium">{title ?? ''} — {index + 1}/{photos.length}</div>
          <button ref={closeRef} className="px-3 py-1 text-sm" onClick={onClose}>Close</button>
        </div>

        <div className="relative h-[60vh] bg-black flex items-center justify-center">
          <button className="absolute left-2 text-white bg-black/30 rounded-full p-2" onClick={prev} aria-label="previous" disabled={index === 0}>‹</button>
          <img src={photos[index]} alt={`${title ?? 'photo'} ${index + 1}`} className={`max-h-[56vh] max-w-full object-contain ${loaded ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setLoaded(true)} />
          <button className="absolute right-2 text-white bg-black/30 rounded-full p-2" onClick={next} aria-label="next" disabled={index === photos.length - 1}>›</button>
        </div>

        <div className="flex gap-2 p-3 overflow-x-auto bg-white">
          {photos.map((p, i) => (
            <button key={p} className={`w-24 h-16 rounded-md overflow-hidden border ${i === index ? 'ring-2 ring-black' : ''}`} onClick={() => { setIndex(i); setLoaded(false); }} aria-label={`Open photo ${i + 1}`}>
              <img src={p} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
