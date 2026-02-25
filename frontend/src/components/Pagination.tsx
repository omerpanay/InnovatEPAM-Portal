/**
 * Pagination — EPAM-styled page controls.
 */

interface PaginationProps {
    skip: number
    limit: number
    total: number
    onPageChange: (newSkip: number) => void
}

export default function Pagination({
    skip,
    limit,
    total,
    onPageChange,
}: PaginationProps) {
    const currentPage = Math.floor(skip / limit) + 1
    const totalPages = Math.max(1, Math.ceil(total / limit))

    if (totalPages <= 1) return null

    const goTo = (page: number) => onPageChange((page - 1) * limit)

    const pages: number[] = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)
    for (let i = start; i <= end; i++) pages.push(i)

    return (
        <div className="flex items-center justify-center gap-1 pt-8">
            <button
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-30"
            >
                ← Prev
            </button>

            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`px-3 py-1.5 text-sm transition ${p === currentPage
                            ? 'bg-primary font-semibold text-epam-black'
                            : 'text-text-muted hover:text-primary'
                        }`}
                >
                    {p}
                </button>
            ))}

            <button
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-30"
            >
                Next →
            </button>
        </div>
    )
}
