/**
 * DashboardPage tests — verifies list render, filters, and empty state.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../src/pages/DashboardPage'
import { AuthContext } from '../src/context/AuthContext'
import type { AuthUser, LoginRequest, RegisterRequest } from '../src/types'

/* ── Mock API client ── */
vi.mock('../src/api/client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    },
}))

import apiClient from '../src/api/client'

const mockUser: AuthUser = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    role: 'submitter',
    accessToken: 'fake-token',
}

function renderPage(user: AuthUser = mockUser) {
    return render(
        <AuthContext.Provider
            value={{
                user,
                loading: false,
                login: vi.fn() as (data: LoginRequest) => Promise<void>,
                register: vi.fn() as (data: RegisterRequest) => Promise<void>,
                logout: vi.fn(),
            }}
        >
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        </AuthContext.Provider>,
    )
}

/* ── Tests ── */

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading spinner initially', () => {
        vi.mocked(apiClient.get).mockReturnValue(new Promise(() => { })) // never resolves
        renderPage()
        expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('renders idea cards when data loads', async () => {
        vi.mocked(apiClient.get).mockResolvedValueOnce({
            data: {
                items: [
                    {
                        id: 'idea-1',
                        title: 'Test Idea',
                        category: 'process_improvement',
                        status: 'submitted',
                        author_id: 'user-1',
                        created_at: '2026-02-25T12:00:00Z',
                    },
                ],
                total: 1,
                skip: 0,
                limit: 20,
            },
        })

        renderPage()

        await waitFor(() => {
            expect(screen.getByText('Test Idea')).toBeInTheDocument()
        })
    })

    it('shows empty state when no ideas', async () => {
        vi.mocked(apiClient.get).mockResolvedValueOnce({
            data: { items: [], total: 0, skip: 0, limit: 20 },
        })

        renderPage()

        await waitFor(() => {
            expect(screen.getByText(/no ideas found/i)).toBeInTheDocument()
        })
    })

    it('shows "New Idea" button for submitters', async () => {
        vi.mocked(apiClient.get).mockResolvedValueOnce({
            data: { items: [], total: 0, skip: 0, limit: 20 },
        })

        renderPage()

        await waitFor(() => {
            expect(screen.getByText(/new idea/i)).toBeInTheDocument()
        })
    })

    it('hides "New Idea" button for evaluators', async () => {
        vi.mocked(apiClient.get).mockResolvedValueOnce({
            data: { items: [], total: 0, skip: 0, limit: 20 },
        })

        renderPage({ ...mockUser, role: 'evaluator' })

        await waitFor(() => {
            expect(screen.queryByText(/new idea/i)).not.toBeInTheDocument()
        })
    })

    it('calls API with idea_status param when status filter is clicked', async () => {
        // First load
        vi.mocked(apiClient.get).mockResolvedValue({
            data: { items: [], total: 0, skip: 0, limit: 20 },
        })

        const user = userEvent.setup()
        renderPage()

        await waitFor(() => {
            expect(screen.getByText(/no ideas found/i)).toBeInTheDocument()
        })

        // Click "Submitted" filter
        await user.click(screen.getByText('Submitted'))

        await waitFor(() => {
            // The second call should include idea_status param
            const lastCall = vi.mocked(apiClient.get).mock.calls.at(-1)
            expect(lastCall?.[1]?.params).toEqual(
                expect.objectContaining({ idea_status: 'submitted' }),
            )
        })
    })
})
