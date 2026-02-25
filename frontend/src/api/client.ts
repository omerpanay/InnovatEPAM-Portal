/**
 * Centralized Axios API client with JWT interceptor and 401 handling.
 *
 * Automatically injects the stored JWT token into every request header
 * and redirects to /login on 401 responses (token expired or invalid).
 */

import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

/* ── Request Interceptor: inject JWT ── */
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

/* ── Response Interceptor: handle 401 ── */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')
            // Only redirect if not already on login/register pages
            if (
                !window.location.pathname.includes('/login') &&
                !window.location.pathname.includes('/register')
            ) {
                window.location.href = '/login?expired=true'
            }
        }
        return Promise.reject(error)
    },
)

export default apiClient
