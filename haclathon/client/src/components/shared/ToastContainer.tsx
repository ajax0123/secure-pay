import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'danger' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

const styles: Record<ToastType, string> = {
  success: 'border-success/50 bg-success/10 text-green-200',
  error: 'border-danger/50 bg-danger/10 text-red-200',
  warning: 'border-warning/50 bg-warning/10 text-amber-200',
  danger: 'border-danger/50 bg-danger/10 text-red-200',
  info: 'border-primary/50 bg-primary/10 text-indigo-200'
};

const iconForType = (type: ToastType) => {
  if (type === 'success') return <CheckCircle2 className="h-4 w-4" />;
  if (type === 'warning') return <AlertTriangle className="h-4 w-4" />;
  if (type === 'danger' || type === 'error') return <XCircle className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ type: ToastType; message: string }>;
      const payload = customEvent.detail;
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev, { id, type: payload.type, message: payload.message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 4500);
    };

    window.addEventListener('app-toast', onToast);
    return () => window.removeEventListener('app-toast', onToast);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[340px] max-w-[90vw] flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className={`pointer-events-auto rounded-xl border p-3 shadow-lg backdrop-blur ${styles[toast.type]}`}>
          <div className="flex items-start gap-2 text-sm">
            {iconForType(toast.type)}
            <p>{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
