"use client";

import React, { useEffect, useState } from 'react';
import { registerToast, unregisterToast } from '@/lib/toast';

type Toast = { id: string; type: 'success' | 'error' | 'info'; message: string };

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function handler(t: { type: Toast['type']; message: string }) {
      const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
      setToasts((prev) => [...prev, { id, type: t.type, message: t.message }]);
      // auto remove
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 4000);
    }

    registerToast(handler);
    return () => unregisterToast();
  }, []);

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded shadow px-4 py-2 text-sm break-words ${t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
