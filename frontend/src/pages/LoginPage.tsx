/**
 * LoginPage — EPAM-branded login form.
 *
 * High-contrast dark card, cyan accents, sharp industrial aesthetic.
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ErrorBanner from '../components/ErrorBanner'
import type { LoginRequest } from '../types'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [error, setError] = useState<string | null>(
        searchParams.get('expired') ? 'Session expired. Please log in again.' : null,
    )

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginRequest>()

    const onSubmit = async (data: LoginRequest) => {
        setError(null)
        try {
            await login(data)
            navigate('/')
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { detail?: string } } })?.response?.data
                    ?.detail ?? 'Login failed. Please check your credentials.'
            setError(msg)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="epam-card w-full max-w-md animate-fade-in p-10">
                {/* Header */}
                <div className="mb-10 text-center">
                    <span className="text-3xl font-bold tracking-tight text-primary">EPAM</span>
                    <span className="ml-2 text-sm font-light uppercase tracking-[0.25em] text-text-secondary">
                        Innovate
                    </span>
                    <p className="mt-3 text-sm text-text-muted">Sign in to your account</p>
                </div>

                <ErrorBanner message={error} onDismiss={() => setError(null)} />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className="epam-input w-full px-4 py-3 text-sm"
                            placeholder="you@epam.com"
                            {...register('email', { required: 'Email is required' })}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            className="epam-input w-full px-4 py-3 text-sm"
                            placeholder="••••••••"
                            {...register('password', { required: 'Password is required' })}
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full py-3 text-sm"
                    >
                        {isSubmitting ? 'Signing in…' : 'SIGN IN'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-primary transition hover:text-primary-hover">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    )
}
