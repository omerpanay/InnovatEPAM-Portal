/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 *
 * Shows a loading spinner while the auth state is being restored from
 * localStorage on first render.
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-400 border-t-transparent" />
            </div>
        )
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />
}
