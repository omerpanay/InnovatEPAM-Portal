import { useEffect, useState } from 'react'
import apiClient from '../api/client'
import type { IdeaStats } from '../types'

export function useIdeaStats() {
    const [stats, setStats] = useState<IdeaStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        const fetchStats = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await apiClient.get<IdeaStats>('/ideas/stats')
                if (!cancelled) setStats(res.data)
            } catch (err: unknown) {
                if (!cancelled) {
                    const msg =
                        (err as { response?: { data?: { detail?: string } } })?.response
                            ?.data?.detail ?? 'Failed to load stats.'
                    setError(msg)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetchStats()
        return () => {
            cancelled = true
        }
    }, [])

    return { stats, loading, error }
}
