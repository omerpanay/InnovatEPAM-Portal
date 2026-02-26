/**
 * AdminPage — User list with role management for evaluators.
 */

import { useEffect, useState, useCallback } from 'react'
import apiClient from '../api/client'
import { useToast } from '../hooks/useToast'
import ErrorBanner from '../components/ErrorBanner'

interface UserItem {
    id: string
    email: string
    username: string
    role: string
    created_at: string
}

export default function AdminPage() {
    const { showToast } = useToast()
    const [users, setUsers] = useState<UserItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await apiClient.get('/users', { params: { limit: 100 } })
            setUsers(res.data.items)
            setTotal(res.data.total)
        } catch (err: unknown) {
            setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to load users')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'submitter' ? 'evaluator' : 'submitter'
        try {
            await apiClient.patch(`/users/${userId}/role`, { role: newRole })
            showToast(`Role changed to ${newRole}`)
            fetchUsers()
        } catch (err: unknown) {
            showToast(
                (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to change role',
                'error'
            )
        }
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">{total} user{total !== 1 && 's'}</p>
                </div>
            </div>

            <ErrorBanner message={error} />

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="h-6 w-6 animate-spin border-2 border-primary border-t-transparent" />
                </div>
            ) : (
                <div className="epam-card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs font-semibold uppercase tracking-widest text-text-muted">
                                <th className="px-6 py-4 text-left">Username</th>
                                <th className="px-6 py-4 text-left">Email</th>
                                <th className="px-6 py-4 text-left">Role</th>
                                <th className="px-6 py-4 text-left">Joined</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-border/50 transition hover:bg-surface-elevated">
                                    <td className="px-6 py-4 font-medium text-text-primary">{u.username}</td>
                                    <td className="px-6 py-4 text-text-secondary">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block rounded-sm px-2 py-0.5 text-xs font-semibold uppercase ${u.role === 'evaluator'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-surface-elevated text-text-muted'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleRole(u.id, u.role)}
                                            className="text-xs font-semibold uppercase tracking-wider text-primary transition hover:opacity-70"
                                        >
                                            {u.role === 'submitter' ? 'PROMOTE' : 'DEMOTE'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
