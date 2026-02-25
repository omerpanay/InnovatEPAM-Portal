/**
 * useIdeas — fetches paginated ideas with filtering support.
 *
 * Returns the current idea list, total count, loading state, error,
 * and a refetch function.
 */

import { useCallback, useEffect, useState } from 'react'
import apiClient from '../api/client'
import type { IdeaListItem, PaginatedResponse } from '../types'
import { PAGE_SIZE } from '../utils/constants'

interface UseIdeasParams {
    skip: number
    limit?: number
    mine?: boolean
    status?: string
}

interface UseIdeasReturn {
    ideas: IdeaListItem[]
    total: number
    loading: boolean
    error: string | null
    refetch: () => void
}

export function useIdeas({
    skip,
    limit = PAGE_SIZE,
    mine,
    status,
}: UseIdeasParams): UseIdeasReturn {
    const [ideas, setIdeas] = useState<IdeaListItem[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [trigger, setTrigger] = useState(0)

    const refetch = useCallback(() => setTrigger((t) => t + 1), [])

    useEffect(() => {
        let cancelled = false
        const fetchIdeas = async () => {
            setLoading(true)
            setError(null)
            try {
                const params: Record<string, string | number | boolean> = {
                    skip,
                    limit,
                }
                if (mine) params.mine = true
                if (status) params.idea_status = status

                const res = await apiClient.get<PaginatedResponse<IdeaListItem>>(
                    '/ideas',
                    { params },
                )
                if (!cancelled) {
                    setIdeas(res.data.items)
                    setTotal(res.data.total)
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    const msg =
                        (err as { response?: { data?: { detail?: string } } })?.response
                            ?.data?.detail ?? 'Failed to load ideas.'
                    setError(msg)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetchIdeas()
        return () => {
            cancelled = true
        }
    }, [skip, limit, mine, status, trigger])

    return { ideas, total, loading, error, refetch }
}
