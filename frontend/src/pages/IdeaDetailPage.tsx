/**
 * IdeaDetailPage — EPAM-styled idea detail view with edit/delete actions.
 */

import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import StatusBadge from '../components/StatusBadge'
import EvaluationPanel from '../components/EvaluationPanel'
import ErrorBanner from '../components/ErrorBanner'
import ConfirmDialog from '../components/ConfirmDialog'
import { CATEGORY_LABELS } from '../utils/constants'
import type { IdeaDetail, Evaluation } from '../types'

export default function IdeaDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [idea, setIdea] = useState<IdeaDetail | null>(null)
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Edit mode
    const [editing, setEditing] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [editSaving, setEditSaving] = useState(false)

    // Delete dialog
    const [showDelete, setShowDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const fetchIdea = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await apiClient.get<IdeaDetail>(`/ideas/${id}`)
            setIdea(res.data)
            setEditTitle(res.data.title)
            setEditDesc(res.data.description)

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

    const handleEdit = async () => {
        if (!idea) return
        setEditSaving(true)
        try {
            const formData = new FormData()
            formData.append('title', editTitle)
            formData.append('description', editDesc)
            await apiClient.patch(`/ideas/${idea.id}`, formData)
            showToast('Idea updated successfully')
            setEditing(false)
            fetchIdea()
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to update idea'
            showToast(msg, 'error')
        } finally {
            setEditSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!idea) return
        setDeleting(true)
        try {
            await apiClient.delete(`/ideas/${idea.id}`)
            showToast('Idea deleted')
            navigate('/')
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to delete idea'
            showToast(msg, 'error')
        } finally {
            setDeleting(false)
            setShowDelete(false)
        }
    }

    const canModify = idea && user && idea.author_id === user.id && idea.status === 'submitted'

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
        <div className="animate-reveal">
            {/* Back Link */}
            <button
                onClick={() => navigate('/')}
                className="print:hidden mb-8 text-xs font-semibold uppercase tracking-widest text-text-muted transition hover:text-primary"
            >
                ← Back to Ideas
            </button>

            {/* Main Card */}
            <div className="epam-card space-y-8 p-10">
                {/* Title + Status + Actions */}
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                        {editing ? (
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="epam-input w-full text-2xl font-bold"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold tracking-tight text-text-primary">{idea.title}</h1>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={idea.status} />

                        {/* PDF Export Button */}
                        <button
                            onClick={() => window.print()}
                            className="print:hidden px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary border border-border transition hover:bg-surface-elevated hover:text-white flex items-center gap-2"
                            title="Save as PDF or Print"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            EXPORT PDF
                        </button>

                        {canModify && !editing && (
                            <>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="print:hidden px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary border border-primary/30 transition hover:bg-primary/10"
                                >
                                    EDIT
                                </button>
                                <button
                                    onClick={() => setShowDelete(true)}
                                    className="print:hidden px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-danger border border-danger/30 transition hover:bg-danger/10"
                                >
                                    DELETE
                                </button>
                            </>
                        )}
                    </div>
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
                    {editing ? (
                        <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={6}
                            className="epam-input w-full"
                        />
                    ) : (
                        <p className="whitespace-pre-wrap leading-relaxed text-text-secondary">
                            {idea.description}
                        </p>
                    )}
                </div>

                {/* Edit actions */}
                {editing && (
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setEditing(false)
                                setEditTitle(idea.title)
                                setEditDesc(idea.description)
                            }}
                            className="btn-ghost px-5 py-2.5 text-sm"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleEdit}
                            disabled={editSaving}
                            className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
                        >
                            {editSaving ? 'SAVING...' : 'SAVE'}
                        </button>
                    </div>
                )}

                {/* Attachment */}
                {idea.attachment_filename && (
                    <div className="print:hidden">
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                            Attachment
                        </h2>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await apiClient.get(`/ideas/${idea.id}/attachment`, {
                                        responseType: 'blob'
                                    });
                                    const url = window.URL.createObjectURL(new Blob([res.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', idea.attachment_filename!);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    window.URL.revokeObjectURL(url);
                                } catch {
                                    showToast('Failed to download attachment', 'error');
                                }
                            }}
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:opacity-70 border border-primary/30 px-4 py-2 bg-primary/5 rounded-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {idea.attachment_filename}
                        </button>
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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showDelete}
                title="Delete Idea"
                message={`Are you sure you want to delete "${idea.title}"? This action cannot be undone.`}
                confirmLabel={deleting ? 'DELETING...' : 'DELETE'}
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setShowDelete(false)}
            />
        </div>
    )
}
