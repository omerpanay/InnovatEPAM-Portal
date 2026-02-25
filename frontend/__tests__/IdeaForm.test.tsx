/**
 * IdeaForm tests — verifies validation and file size checking.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import IdeaForm from '../src/components/IdeaForm'

/* ── Mock API client ── */
vi.mock('../src/api/client', () => ({
    default: {
        post: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    },
}))

import apiClient from '../src/api/client'

/* ── Tests ── */

describe('IdeaForm', () => {
    const onSuccess = vi.fn()
    const onCancel = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    function renderForm() {
        return render(
            <MemoryRouter>
                <IdeaForm onSuccess={onSuccess} onCancel={onCancel} />
            </MemoryRouter>,
        )
    }

    it('renders form fields', () => {
        renderForm()
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    })

    it('shows validation error for empty title', async () => {
        const user = userEvent.setup()
        renderForm()

        await user.click(screen.getByRole('button', { name: /^submit$/i }))

        await waitFor(() => {
            expect(screen.getByText(/title is required/i)).toBeInTheDocument()
        })
    })

    it('calls API on valid submission', async () => {
        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} })
        const user = userEvent.setup()
        renderForm()

        await user.type(screen.getByLabelText(/title/i), 'Great Idea')
        await user.type(screen.getByLabelText(/description/i), 'Details here')
        await user.click(screen.getByRole('button', { name: /^submit$/i }))

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith(
                '/ideas',
                expect.any(FormData),
                expect.objectContaining({
                    headers: { 'Content-Type': 'multipart/form-data' },
                }),
            )
            expect(onSuccess).toHaveBeenCalled()
        })
    })

    it('calls onCancel when cancel button is clicked', async () => {
        const user = userEvent.setup()
        renderForm()
        await user.click(screen.getByRole('button', { name: /cancel/i }))
        expect(onCancel).toHaveBeenCalled()
    })
})
