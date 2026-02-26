/**
 * ConfirmDialog — EPAM-styled modal confirmation dialog.
 */

interface ConfirmDialogProps {
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'primary'
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'CONFIRM',
    cancelLabel = 'CANCEL',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="epam-card w-full max-w-md space-y-6 p-8 animate-fade-in">
                <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                <p className="text-sm text-text-secondary">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="btn-ghost px-5 py-2.5 text-sm"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition ${variant === 'danger'
                                ? 'bg-danger text-white hover:bg-danger/80'
                                : 'btn-primary'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
