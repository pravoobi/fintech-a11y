import { createContext, useCallback, useContext, useState } from 'react';

export type ToastSeverity = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  message: string;
  severity?: ToastSeverity;
  /** Auto-dismiss delay in ms. Pass 0 to keep the toast until manually dismissed. Defaults to 5000. */
  duration?: number;
}

export interface ToastItem {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;
function nextId(): string {
  return `toast-${++counter}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const item: ToastItem = {
      id: nextId(),
      message: options.message,
      severity: options.severity ?? 'info',
      duration: options.duration ?? 5000,
    };
    setToasts((prev) => [...prev, item]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): Pick<ToastContextValue, 'toast'> {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return { toast: ctx.toast };
}

/** Internal hook — used by the Toast renderer to access the full context. */
export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToastContext must be used within a <ToastProvider>');
  }
  return ctx;
}
