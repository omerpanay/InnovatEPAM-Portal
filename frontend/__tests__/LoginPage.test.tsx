/**
 * LoginPage tests — verifies render, form validation, and submit flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../src/pages/LoginPage'
import { AuthContext } from '../src/context/AuthContext'
import type { AuthUser, LoginRequest, RegisterRequest } from '../src/types'

/* ── Helpers ── */

const mockLogin = vi.fn()
const mockRegister = vi.fn()
const mockLogout = vi.fn()

function renderPage(user: AuthUser | null = null) {
    return render(
        <AuthContext.Provider
            value={{
                user,
                loading: false,
                login: mockLogin as (data: LoginRequest) => Promise<void>,
                register: mockRegister as (data: RegisterRequest) => Promise<void>,
                logout: mockLogout,
            }}
        >
            <MemoryRouter initialEntries={['/login']}>
                <LoginPage />
            </MemoryRouter>
        </AuthContext.Provider>,
    )
}

/* ── Tests ── */

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the login form with email and password fields', () => {
        renderPage()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('shows validation errors for empty fields', async () => {
        const user = userEvent.setup()
        renderPage()

        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument()
            expect(screen.getByText(/password is required/i)).toBeInTheDocument()
        })
    })

    it('calls login with valid credentials', async () => {
        mockLogin.mockResolvedValueOnce(undefined)
        const user = userEvent.setup()
        renderPage()

        await user.type(screen.getByLabelText(/email/i), 'test@example.com')
        await user.type(screen.getByLabelText(/password/i), 'securepass123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'securepass123',
            })
        })
    })

    it('displays an error message on login failure', async () => {
        mockLogin.mockRejectedValueOnce({
            response: { data: { detail: 'Invalid credentials' } },
        })
        const user = userEvent.setup()
        renderPage()

        await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
        await user.type(screen.getByLabelText(/password/i), 'wrongpass')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
        })
    })

    it('has a link to the registration page', () => {
        renderPage()
        expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute(
            'href',
            '/register',
        )
    })
})
