import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Types
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string, description?: string) => void;
  removeToast: (id: string) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Component: Individual Toast
const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300); // Wait for animation
  };

  React.useEffect(() => {
    const timer = setTimeout(handleRemove, 5000); // Auto dismiss
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    success: { icon: <CheckCircle2 size={24} className="text-green-500" />, border: 'border-l-green-500', bg: 'bg-white dark:bg-stone-900' },
    error: { icon: <AlertCircle size={24} className="text-red-500" />, border: 'border-l-red-500', bg: 'bg-white dark:bg-stone-900' },
    info: { icon: <Info size={24} className="text-blue-500" />, border: 'border-l-blue-500', bg: 'bg-white dark:bg-stone-900' },
    warning: { icon: <AlertTriangle size={24} className="text-amber-500" />, border: 'border-l-amber-500', bg: 'bg-white dark:bg-stone-900' },
  };

  const style = styles[toast.type];

  return (
    <div
      className={`
        pointer-events-auto w-full max-w-sm rounded-xl shadow-2xl shadow-stone-200/50 dark:shadow-black/50 
        border border-stone-100 dark:border-stone-800 border-l-4 ${style.border} ${style.bg}
        p-4 flex gap-4 items-start transition-all duration-300 transform
        ${isExiting ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0 animate-slide-up'}
      `}
    >
      <div className="shrink-0 pt-0.5">{style.icon}</div>
      <div className="flex-1">
        <h4 className="font-bold text-stone-900 dark:text-white text-sm">{toast.message}</h4>
        {toast.description && (
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button 
        onClick={handleRemove} 
        className="shrink-0 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};

// Provider
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, description?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message, description }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = (msg: string, desc?: string) => addToast('success', msg, desc);
  const error = (msg: string, desc?: string) => addToast('error', msg, desc);
  const info = (msg: string, desc?: string) => addToast('info', msg, desc);
  const warning = (msg: string, desc?: string) => addToast('warning', msg, desc);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-24 right-4 md:right-8 z-[100] flex flex-col gap-3 pointer-events-none w-[calc(100%-2rem)] md:w-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};