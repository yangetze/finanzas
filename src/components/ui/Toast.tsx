import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, X } from 'lucide-react'

type ToastVariant = 'success' | 'error'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto',
              'animate-in slide-in-from-bottom-2 fade-in duration-200',
              toast.variant === 'success'
                ? 'bg-canvas-soft border-sage/30 text-ink'
                : 'bg-canvas-soft border-coral/30 text-ink',
            )}
          >
            {toast.variant === 'success' ? (
              <CheckCircle className="w-5 h-5 text-sage shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-ui flex-1">{toast.message}</p>
            <button
              onClick={() => remove(toast.id)}
              className="text-ink-faint hover:text-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
