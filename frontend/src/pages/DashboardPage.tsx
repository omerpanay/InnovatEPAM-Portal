/**
 * DashboardPage — EPAM-branded ideas dashboard.
 */

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useIdeas } from '../hooks/useIdeas'
import { useIdeaStats } from '../hooks/useIdeaStats'
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
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)

    const { stats } = useIdeaStats()

    const { ideas, total, loading, error, refetch } = useIdeas({
        skip,
        mine,
        status: status || undefined,
        search: search || undefined,
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

            {/* ── Stats Row ── */}
            {stats && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-reveal delay-100">
                    <div className="epam-card border-l-4 border-l-primary p-5 text-center transition hover:shadow-glow hover:-translate-y-1">
                        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted">Total Ideas</div>
                        <div className="mt-2 text-3xl font-bold text-text-primary">{stats.total}</div>
                    </div>
                    <div className="epam-card p-5 text-center transition hover:-translate-y-1">
                        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted">Submitted</div>
                        <div className="mt-2 text-3xl font-bold text-text-primary shadow-sm">{stats.submitted}</div>
                    </div>
                    <div className="epam-card p-5 text-center transition hover:-translate-y-1">
                        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted">Accepted</div>
                        <div className="mt-2 text-3xl font-bold text-success">{stats.accepted}</div>
                    </div>
                    <div className="epam-card p-5 text-center transition hover:-translate-y-1">
                        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted">Rejected</div>
                        <div className="mt-2 text-3xl font-bold text-danger">{stats.rejected}</div>
                    </div>
                </div>
            )}

            {/* ── Idea Form (inline) ── */}
            {showForm && (
                <IdeaForm
                    onSuccess={handleFormSuccess}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* ── Filters & Search ── */}
            <div className="flex flex-wrap items-center gap-6 animate-reveal delay-200">

                {/* Search Input */}
                <div className="w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search ideas..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setSkip(0)
                        }}
                        className="epam-input w-full bg-surface-elevated"
                    />
                </div>

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
                                ? 'bg-primary text-white shadow-[0_0_12px_rgba(0,174,239,0.4)]'
                                : 'text-text-muted hover:bg-surface-elevated hover:text-primary'
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
                    {ideas.map((idea, index) => (
                        <IdeaCard key={idea.id} idea={idea} index={index} />
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
