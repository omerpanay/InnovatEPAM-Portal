/**
 * Toast notification system — EPAM-styled.
 * Provides success/error/info toast messages that auto-dismiss.
 */

import { createContext, useState, useCallback, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info';

export type ToastItem = {
    id: number
    message: string
    type: ToastType
}

export interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextType | undefined>(undefined)

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = ++toastId
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 4000)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`animate-fade-in flex items-center gap-3 px-5 py-3 text-sm font-medium shadow-lg transition-all ${toast.type === 'success'
                            ? 'border border-success/30 bg-success-bg text-success'
                            : toast.type === 'error'
                                ? 'border border-danger/30 bg-danger-bg text-danger'
                                : 'border border-primary/30 bg-primary/10 text-primary'
                            }`}
                    >
                        <span>
                            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
                        </span>
                        {toast.message}
                        <button
                            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                            className="ml-2 opacity-50 hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
