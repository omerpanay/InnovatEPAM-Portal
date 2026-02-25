/**
 * EvaluationPanel — EPAM-styled accept/reject form.
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import apiClient from '../api/client'
import ErrorBanner from './ErrorBanner'
import type { EvaluationRequest } from '../types'

interface EvaluationPanelProps {
    ideaId: string
    onSuccess: () => void
}

export default function EvaluationPanel({
    ideaId,
    onSuccess,
}: EvaluationPanelProps) {
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<EvaluationRequest>()

    const onSubmit = async (data: EvaluationRequest) => {
        setError(null)
        try {
            await apiClient.post(`/ideas/${ideaId}/evaluate`, data)
            onSuccess()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { detail?: string } } })?.response?.data
                    ?.detail ?? 'Evaluation failed.'
            setError(msg)
        }
    }

    return (
        <div className="epam-card animate-slide-up mt-8 p-8">
            <h3 className="mb-6 text-lg font-bold text-text-primary">
                Evaluate This Idea
            </h3>

            <ErrorBanner message={error} onDismiss={() => setError(null)} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label htmlFor="decision" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
                        Decision
                    </label>
                    <select
                        id="decision"
                        className="epam-input w-full px-4 py-3 text-sm"
                        {...register('decision', { required: 'Decision is required' })}
                    >
                        <option value="">Select…</option>
                        <option value="accepted">Accept</option>
                        <option value="rejected">Reject</option>
                    </select>
                    {errors.decision && (
                        <p className="mt-1 text-xs text-danger">{errors.decision.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="comment" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
                        Comment
                    </label>
                    <textarea
                        id="comment"
                        rows={3}
                        className="epam-input w-full px-4 py-3 text-sm"
                        placeholder="Provide feedback on this idea…"
                        {...register('comment', { required: 'Comment is required' })}
                    />
                    {errors.comment && (
                        <p className="mt-1 text-xs text-danger">{errors.comment.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-3 text-sm"
                >
                    {isSubmitting ? 'SUBMITTING…' : 'SUBMIT EVALUATION'}
                </button>
            </form>
        </div>
    )
}
