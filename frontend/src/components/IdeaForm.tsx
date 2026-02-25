/**
 * IdeaForm — EPAM-styled idea creation form.
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import apiClient from '../api/client'
import ErrorBanner from './ErrorBanner'
import {
    CATEGORY_LABELS,
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES,
} from '../utils/constants'
import type { IdeaCategory } from '../types'

interface IdeaFormData {
    title: string
    description: string
    category: IdeaCategory
}

interface IdeaFormProps {
    onSuccess: () => void
    onCancel: () => void
}

export default function IdeaForm({ onSuccess, onCancel }: IdeaFormProps) {
    const [file, setFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IdeaFormData>()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null
        setFileError(null)

        if (selected) {
            const ext = '.' + selected.name.split('.').pop()?.toLowerCase()
            if (!ALLOWED_FILE_TYPES.includes(ext)) {
                setFileError(`Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}`)
                setFile(null)
                return
            }
            if (selected.size > MAX_FILE_SIZE) {
                setFileError('File size must be 5 MB or less.')
                setFile(null)
                return
            }
        }
        setFile(selected)
    }

    const onSubmit = async (data: IdeaFormData) => {
        setSubmitError(null)
        try {
            const formData = new FormData()
            formData.append('title', data.title)
            formData.append('description', data.description)
            formData.append('category', data.category)
            if (file) formData.append('attachment', file)

            await apiClient.post('/ideas', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            onSuccess()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { detail?: string } } })?.response?.data
                    ?.detail ?? 'Failed to submit idea.'
            setSubmitError(msg)
        }
    }

    return (
        <div className="epam-card animate-slide-up p-8">
            <h2 className="mb-6 text-xl font-bold text-text-primary">
                New Idea
            </h2>

            <ErrorBanner message={submitError} onDismiss={() => setSubmitError(null)} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label htmlFor="title" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        className="epam-input w-full px-4 py-3 text-sm"
                        placeholder="Your innovative idea…"
                        {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && (
                        <p className="mt-1 text-xs text-danger">{errors.title.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="description" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={4}
                        className="epam-input w-full px-4 py-3 text-sm"
                        placeholder="Describe your idea in detail…"
                        {...register('description', { required: 'Description is required' })}
                    />
                    {errors.description && (
                        <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="category" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
                        Category
                    </label>
                    <select
                        id="category"
                        className="epam-input w-full px-4 py-3 text-sm"
                        {...register('category', { required: 'Category is required' })}
                    >
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
                        Attachment (optional)
                    </label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept={ALLOWED_FILE_TYPES.join(',')}
                        className="w-full text-sm text-text-muted file:mr-3 file:border file:border-border file:bg-surface-elevated file:px-4 file:py-2 file:text-sm file:font-semibold file:text-text-secondary file:transition hover:file:border-primary hover:file:text-primary"
                    />
                    {fileError && (
                        <p className="mt-1 text-xs text-danger">{fileError}</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-ghost px-6 py-2.5 text-sm"
                    >
                        CANCEL
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !!fileError}
                        className="btn-primary px-6 py-2.5 text-sm"
                    >
                        {isSubmitting ? 'SUBMITTING…' : 'SUBMIT'}
                    </button>
                </div>
            </form>
        </div>
    )
}
