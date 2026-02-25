/**
 * IdeaDetailPage — EPAM-styled idea detail view.
 */

import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import { useAuth } from '../hooks/useAuth'
import StatusBadge from '../components/StatusBadge'
import EvaluationPanel from '../components/EvaluationPanel'
import ErrorBanner from '../components/ErrorBanner'
import { CATEGORY_LABELS, API_BASE_URL } from '../utils/constants'
import type { IdeaDetail, Evaluation } from '../types'

export default function IdeaDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [idea, setIdea] = useState<IdeaDetail | null>(null)
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchIdea = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await apiClient.get<IdeaDetail>(`/ideas/${id}`)
            setIdea(res.data)

            try {
                const evalRes = await apiClient.get<Evaluation>(
                    `/ideas/${id}/evaluation`,
                )
                setEvaluation(evalRes.data)
            } catch {
                setEvaluation(null)
            }
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status
            if (status === 404) {
                setError('Idea not found.')
            } else {
                const msg =
                    (err as { response?: { data?: { detail?: string } } })?.response?.data
                        ?.detail ?? 'Failed to load idea.'
                setError(msg)
            }
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchIdea()
    }, [fetchIdea])

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-6 w-6 animate-spin border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (error || !idea) {
        return (
            <div className="py-12 text-center">
                <ErrorBanner message={error ?? 'Idea not found.'} />
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 text-sm text-primary transition hover:opacity-70"
                >
                    ← BACK TO IDEAS
                </button>
            </div>
        )
    }

    const showEvalPanel =
        user?.role === 'evaluator' && idea.status === 'submitted' && !evaluation

    return (
        <div className="animate-fade-in">
            {/* Back Link */}
            <button
                onClick={() => navigate('/')}
                className="mb-8 text-xs font-semibold uppercase tracking-widest text-text-muted transition hover:text-primary"
            >
                ← Back to Ideas
            </button>

            {/* Main Card */}
            <div className="epam-card space-y-8 p-10">
                {/* Title + Status */}
                <div className="flex items-start justify-between gap-6">
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">{idea.title}</h1>
                    <StatusBadge status={idea.status} />
                </div>

                {/* Meta Row */}
                <div className="flex flex-wrap gap-6 text-xs font-medium uppercase tracking-widest text-text-muted">
                    <span>{CATEGORY_LABELS[idea.category] ?? idea.category}</span>
                    <span className="text-border">|</span>
                    <span>{idea.author_id.slice(0, 8)}…</span>
                    <span className="text-border">|</span>
                    <span>
                        {new Date(idea.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Description */}
                <div>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                        Description
                    </h2>
                    <p className="whitespace-pre-wrap leading-relaxed text-text-secondary">
                        {idea.description}
                    </p>
                </div>

                {/* Attachment */}
                {idea.attachment_filename && (
                    <div>
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                            Attachment
                        </h2>
                        <a
                            href={`${API_BASE_URL}/ideas/${idea.id}/attachment`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary transition hover:opacity-70"
                        >
                            ↓ {idea.attachment_filename}
                        </a>
                    </div>
                )}

                {/* Evaluation Result */}
                {evaluation && (
                    <div className="border border-border bg-surface-elevated p-6">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
                            Evaluation
                        </h2>
                        <div className="flex items-center gap-4">
                            <StatusBadge status={evaluation.decision} />
                            <span className="text-xs text-text-muted">
                                by {evaluation.evaluator_id.slice(0, 8)}… on{' '}
                                {new Date(evaluation.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                            {evaluation.comment}
                        </p>
                    </div>
                )}
            </div>

            {/* Evaluation Panel (evaluator only) */}
            {showEvalPanel && (
                <EvaluationPanel ideaId={idea.id} onSuccess={fetchIdea} />
            )}
        </div>
    )
}
