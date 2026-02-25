/**
 * Layout — EPAM-branded application shell.
 *
 * Minimalist sticky navbar with EPAM logo, user info, role badge,
 * and logout button. High-contrast industrial aesthetic.
 */

import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-surface">
            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-epam-gray-900 px-8 py-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 transition hover:opacity-80"
                >
                    <span className="text-2xl font-bold tracking-tight text-primary">
                        EPAM
                    </span>
                    <span className="text-sm font-light uppercase tracking-[0.25em] text-text-secondary">
                        Innovate
                    </span>
                </button>

                {user && (
                    <div className="flex items-center gap-5">
                        <span className="text-sm text-text-secondary">
                            {user.username}
                        </span>
                        <span
                            className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${user.role === 'evaluator'
                                    ? 'border border-primary/40 text-primary'
                                    : 'border border-text-muted/30 text-text-muted'
                                }`}
                        >
                            {user.role}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="btn-ghost px-4 py-1.5 text-sm"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </nav>

            {/* ── Page Content ── */}
            <main className="mx-auto max-w-7xl px-8 py-10">
                <Outlet />
            </main>
        </div>
    )
}
