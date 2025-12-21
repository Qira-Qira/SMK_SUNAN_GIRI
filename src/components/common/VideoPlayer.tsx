"use client";

import { useEffect, useRef, useState } from 'react';

type VideoItem = {
  id?: string;
  title?: string;
  link?: string;
  url?: string;
  videoUrl?: string;
};

function toEmbed(link?: string | null, autoplay = false) {
  if (!link) return null;
  try {
    const u = new URL(link);
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;
    }
  } catch (e) {
    // ignore
  }
  const m = (link || '').match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;
  return null;
}

// Prefetch helper: preconnects and inserts a prefetch link for the embed
export function prefetchEmbed(embedSrc?: string | null) {
  if (!embedSrc) return;
  try {
    // avoid duplicating
    const key = `prefetched:${embedSrc}`;
    if ((window as any)[key]) return;
    (window as any)[key] = true;

    // preconnect to youtube domains
    const domains = ['https://www.youtube.com', 'https://www.googlevideo.com', 'https://www.youtube-nocookie.com'];
    domains.forEach((d) => {
      if (!document.querySelector(`link[rel="preconnect"][href="${d}"]`)) {
        const l = document.createElement('link');
        l.rel = 'preconnect';
        l.href = d;
        l.crossOrigin = 'anonymous';
        document.head.appendChild(l);
      }
    });

    // add a prefetch for the embed URL
    if (!document.querySelector(`link[rel="prefetch"][href="${embedSrc}"]`)) {
      const p = document.createElement('link');
      p.rel = 'prefetch';
      p.href = embedSrc;
      p.as = 'document';
      document.head.appendChild(p);
    }
  } catch (e) {
    // ignore
  }
}

export default function VideoPlayer({ video, onClose }: { video: VideoItem; onClose(): void }) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);

    // store previous focus and focus the close button after open
    prevActiveRef.current = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => {
      setVisible(true);
      // focus close button when visible
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
    });

    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    // wait for animation to finish
    window.setTimeout(() => {
      setShouldRender(false);
      // restore previous focus
      try { prevActiveRef.current?.focus?.(); } catch (e) { /* ignore */ }
      onClose();
    }, 220);
  };

  // trap focus inside modal
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;
    return () => {
      // cleanup if unmounted
    };
  }, [shouldRender]);

  const src = toEmbed(video.link || video.url || video.videoUrl || '', true);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} aria-modal="true" role="dialog">
      <div className={`absolute inset-0 bg-black transition-opacity duration-200 ${visible ? 'opacity-60' : 'opacity-0'}`} aria-hidden="true"></div>
      <div ref={containerRef} className={`relative w-full max-w-4xl mx-4 transform transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="bg-white rounded overflow-hidden shadow-lg">
          <div className="aspect-video">
            {src ? (
              <iframe
                src={visible ? src : undefined}
                title={video.title || 'Video'}
                className="w-full h-full"
                frameBorder={0}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full p-6">Tidak dapat memutar video ini.</div>
            )}
          </div>
            <div className="p-3 flex items-center justify-between">
            <div className="text-sm font-medium text-emerald-900">{video.title}</div>
            <button ref={closeBtnRef} onClick={handleClose} className="text-emerald-600 hover:underline">Tutup</button>
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">{visible ? 'Video terbuka' : ''}</div>
    </div>
  );
}
