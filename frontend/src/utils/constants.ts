/** API base URL — configurable via environment variable. */
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

/** Application route paths. */
export const ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/',
    IDEA_DETAIL: '/ideas/:id',
    PROFILE: '/profile',
    ADMIN: '/admin',
} as const

/** Human-readable category labels. */
export const CATEGORY_LABELS: Record<string, string> = {
    process_improvement: 'Process Improvement',
    product_innovation: 'Product Innovation',
    tech_enhancement: 'Tech Enhancement',
    culture_initiative: 'Culture Initiative',
    cost_optimization: 'Cost Optimization',
    other: 'Other',
}

/** Status badge color mapping — EPAM design system. */
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    submitted: { bg: 'bg-warning-bg', text: 'text-warning' },
    accepted: { bg: 'bg-success-bg', text: 'text-success' },
    rejected: { bg: 'bg-danger-bg', text: 'text-danger' },
}

/** Allowed file extensions for idea attachments. */
export const ALLOWED_FILE_TYPES = ['.pdf', '.png', '.jpg', '.jpeg', '.docx']

/** Maximum file size in bytes (5 MB). */
export const MAX_FILE_SIZE = 5 * 1024 * 1024

/** Default page size for idea listing. */
export const PAGE_SIZE = 20
