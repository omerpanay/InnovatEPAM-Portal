/**
 * RegisterPage — EPAM-branded registration form.
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ErrorBanner from '../components/ErrorBanner'
import type { RegisterRequest } from '../types'

export default function RegisterPage() {
    const { register: registerUser } = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterRequest>()

    const onSubmit = async (data: RegisterRequest) => {
        setError(null)
        try {
            await registerUser(data)
            navigate('/')
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { detail?: string } } })?.response?.data
                    ?.detail ?? 'Registration failed. Please try again.'
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
                    <p className="mt-3 text-sm text-text-muted">Create your account</p>
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
                        <label htmlFor="username" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            className="epam-input w-full px-4 py-3 text-sm"
                            placeholder="johndoe"
                            {...register('username', {
                                required: 'Username is required',
                                minLength: { value: 3, message: 'Username must be at least 3 characters' },
                            })}
                        />
                        {errors.username && (
                            <p className="mt-1 text-xs text-danger">{errors.username.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className="epam-input w-full px-4 py-3 text-sm"
                            placeholder="••••••••"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                            })}
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
                        {isSubmitting ? 'Creating account…' : 'CREATE ACCOUNT'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary transition hover:text-primary-hover">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}
