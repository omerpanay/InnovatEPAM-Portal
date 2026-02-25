/**
 * DashboardPage — EPAM-branded ideas dashboard.
 */

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useIdeas } from '../hooks/useIdeas'
import IdeaCard from '../components/IdeaCard'
import IdeaForm from '../components/IdeaForm'
import Pagination from '../components/Pagination'
import ErrorBanner from '../components/ErrorBanner'
import { PAGE_SIZE } from '../utils/constants'

export default function DashboardPage() {
    const { user } = useAuth()
    const [skip, setSkip] = useState(0)
    const [mine, setMine] = useState(false)
    const [status, setStatus] = useState('')
    const [showForm, setShowForm] = useState(false)

    const { ideas, total, loading, error, refetch } = useIdeas({
        skip,
        mine,
        status: status || undefined,
    })

    const handleFormSuccess = () => {
        setShowForm(false)
        setSkip(0)
        refetch()
    }

    const statuses = ['', 'submitted', 'accepted', 'rejected']
    const statusLabels: Record<string, string> = {
        '': 'All',
        submitted: 'Submitted',
        accepted: 'Accepted',
        rejected: 'Rejected',
    }

    return (
        <div className="animate-fade-in space-y-8">
            {/* ── Header ── */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                        Ideas
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        {total} idea{total !== 1 && 's'}
                    </p>
                </div>

                {user?.role === 'submitter' && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={showForm ? 'btn-ghost px-6 py-2.5 text-sm' : 'btn-primary px-6 py-2.5 text-sm'}
                    >
                        {showForm ? 'CANCEL' : '+ NEW IDEA'}
                    </button>
                )}
            </div>

            {/* ── Idea Form (inline) ── */}
            {showForm && (
                <IdeaForm
                    onSuccess={handleFormSuccess}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* ── Filters ── */}
            <div className="flex flex-wrap items-center gap-6">
                {/* Status filter tabs */}
                <div className="flex items-center gap-1 border border-border">
                    {statuses.map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                setStatus(s)
                                setSkip(0)
                            }}
                            className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${status === s
                                    ? 'bg-primary text-epam-black'
                                    : 'text-text-muted hover:text-primary'
                                }`}
                        >
                            {statusLabels[s]}
                        </button>
                    ))}
                </div>

                {/* My Ideas toggle */}
                <button
                    onClick={() => {
                        setMine(!mine)
                        setSkip(0)
                    }}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${mine
                            ? 'border border-primary bg-primary/10 text-primary'
                            : 'btn-ghost'
                        }`}
                >
                    My Ideas
                </button>
            </div>

            {/* ── Error ── */}
            <ErrorBanner message={error} />

            {/* ── Idea List ── */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="h-6 w-6 animate-spin border-2 border-primary border-t-transparent" />
                </div>
            ) : ideas.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-lg text-text-muted">No ideas found</p>
                    <p className="mt-2 text-sm text-text-muted">
                        {user?.role === 'submitter' && 'Submit the first idea to get started.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ideas.map((idea) => (
                        <IdeaCard key={idea.id} idea={idea} />
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            <Pagination
                skip={skip}
                limit={PAGE_SIZE}
                total={total}
                onPageChange={setSkip}
            />
        </div>
    )
}
