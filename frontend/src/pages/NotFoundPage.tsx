/**
 * NotFoundPage — EPAM-styled 404 page.
 */

import { Link } from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="animate-fade-in text-center">
                <p className="text-7xl font-bold tracking-tight text-primary">404</p>
                <p className="mt-4 text-lg text-text-muted">Page not found</p>
                <Link
                    to="/"
                    className="btn-ghost mt-8 inline-block px-6 py-2.5 text-sm"
                >
                    ← BACK TO IDEAS
                </Link>
            </div>
        </div>
    )
}
