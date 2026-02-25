/**
 * AuthContext — provides authentication state and actions to the entire app.
 *
 * Stores the authenticated user (including JWT token and role) in React
 * context and persists the token in localStorage.
 */

import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import apiClient from '../api/client'
import type {
    AuthUser,
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
} from '../types'

interface AuthContextValue {
    user: AuthUser | null
    loading: boolean
    login: (data: LoginRequest) => Promise<void>
    register: (data: RegisterRequest) => Promise<void>
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/** Decode a JWT payload (base64url → JSON). */
function decodeToken(token: string): Record<string, unknown> {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)

    /* Restore session from localStorage on mount */
    useEffect(() => {
        const token = localStorage.getItem('access_token')
        const savedUser = localStorage.getItem('user')
        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch {
                localStorage.removeItem('access_token')
                localStorage.removeItem('user')
            }
        }
        setLoading(false)
    }, [])

    const persistUser = useCallback((authUser: AuthUser) => {
        localStorage.setItem('access_token', authUser.accessToken)
        localStorage.setItem('user', JSON.stringify(authUser))
        setUser(authUser)
    }, [])

    const login = useCallback(
        async (data: LoginRequest) => {
            const res = await apiClient.post<TokenResponse>('/auth/login', data)
            const token = res.data.access_token
            const claims = decodeToken(token)
            const authUser: AuthUser = {
                id: claims.sub as string,
                email: data.email,
                username: (claims.username as string) ?? data.email,
                role: (claims.role as 'submitter' | 'evaluator') ?? 'submitter',
                accessToken: token,
            }
            persistUser(authUser)
        },
        [persistUser],
    )

    const register = useCallback(
        async (data: RegisterRequest) => {
            const res = await apiClient.post<RegisterResponse>(
                '/auth/register',
                data,
            )
            const authUser: AuthUser = {
                id: res.data.id,
                email: res.data.email,
                username: res.data.username,
                role: res.data.role as 'submitter' | 'evaluator',
                accessToken: res.data.access_token,
            }
            persistUser(authUser)
        },
        [persistUser],
    )

    const logout = useCallback(async () => {
        try {
            await apiClient.post('/auth/logout')
        } catch {
            /* ignore — clear local state regardless */
        }
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        setUser(null)
    }, [])

    const value = useMemo(
        () => ({ user, loading, login, register, logout }),
        [user, loading, login, register, logout],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
