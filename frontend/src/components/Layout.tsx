/**
 * Layout — EPAM-branded application shell.
 *
 * Sticky navbar with EPAM logo, navigation links, user info,
 * role badge, and logout button.
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="min-h-screen bg-surface">
            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-epam-gray-900 px-8 py-4">
                <div className="flex items-center gap-8">
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

                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigate('/')}
                            className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${isActive('/')
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-text-muted hover:text-text-primary'
                                }`}
                        >
                            Ideas
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${isActive('/profile')
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-text-muted hover:text-text-primary'
                                }`}
                        >
                            Profile
                        </button>
                        {user?.role === 'evaluator' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${isActive('/admin')
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-text-muted hover:text-text-primary'
                                    }`}
                            >
                                Users
                            </button>
                        )}
                    </div>
                </div>

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
