/**
 * useAuth — convenience hook to consume AuthContext.
 *
 * Throws if used outside an AuthProvider.
 */

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
