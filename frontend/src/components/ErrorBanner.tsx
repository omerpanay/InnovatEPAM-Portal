/**
 * ErrorBanner — EPAM-styled dismissible error message.
 */

interface ErrorBannerProps {
    message: string | null
    onDismiss?: () => void
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
    if (!message) return null

    return (
        <div className="mb-4 flex items-center justify-between border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger animate-fade-in">
            <span>{message}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="ml-4 text-danger transition hover:opacity-70"
                    aria-label="Dismiss error"
                >
                    ✕
                </button>
            )}
        </div>
    )
}
