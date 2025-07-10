'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { useState, createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider>
        {children}

        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            className={cn(
              'glass-panel p-4 shadow-xl animate-slide-in',
              'fixed bottom-4 right-4 max-w-sm w-full z-50'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {toast.type === 'success' && '✓'}
                {toast.type === 'error' && '✗'}
                {toast.type === 'warning' && '⚠'}
                {toast.type === 'info' && 'ℹ'}
              </div>

              <div className="flex-1">
                <ToastPrimitive.Title
                  className={cn(
                    'font-semibold mb-1',
                    toast.type === 'success' && 'text-success',
                    toast.type === 'error' && 'text-error',
                    toast.type === 'warning' && 'text-warning',
                    toast.type === 'info' && 'text-primary'
                  )}
                >
                  {toast.title}
                </ToastPrimitive.Title>

                {toast.description && (
                  <ToastPrimitive.Description className="text-small text-muted">
                    {toast.description}
                  </ToastPrimitive.Description>
                )}
              </div>

              <ToastPrimitive.Close className="btn btn-ghost btn-sm">
                ×
              </ToastPrimitive.Close>
            </div>
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
