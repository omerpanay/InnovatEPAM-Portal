/** Authenticated user stored in AuthContext. */
export interface AuthUser {
    id: string
    email: string
    username: string
    role: 'submitter' | 'evaluator'
    accessToken: string
}

/** Abbreviated idea for dashboard cards. */
export interface IdeaListItem {
    id: string
    title: string
    category: string
    status: IdeaStatus
    author_id: string
    created_at: string
}

/** Dashboard metrics for ideas. */
export interface IdeaStats {
    total: number
    submitted: number
    accepted: number
    rejected: number
}

/** Full idea detail. */
export interface IdeaDetail {
    id: string
    title: string
    description: string
    category: string
    status: IdeaStatus
    author_id: string
    attachment_filename: string | null
    created_at: string
    updated_at: string
}

/** Evaluation record. */
export interface Evaluation {
    id: string
    idea_id: string
    evaluator_id: string
    decision: 'accepted' | 'rejected'
    comment: string
    created_at: string
}

/** Paginated API response wrapper. */
export interface PaginatedResponse<T> {
    items: T[]
    total: number
    skip: number
    limit: number
}

/** Login request body. */
export interface LoginRequest {
    email: string
    password: string
}

/** Register request body. */
export interface RegisterRequest {
    email: string
    username: string
    password: string
}

/** Token response from login. */
export interface TokenResponse {
    access_token: string
    token_type: string
}

/** Register response (includes token + user info). */
export interface RegisterResponse {
    id: string
    email: string
    username: string
    role: string
    access_token: string
    token_type: string
}

/** Evaluation request body. */
export interface EvaluationRequest {
    decision: 'accepted' | 'rejected'
    comment: string
}

/** Idea status enum. */
export type IdeaStatus = 'submitted' | 'accepted' | 'rejected'

/** Idea category enum matching backend values. */
export type IdeaCategory =
    | 'process_improvement'
    | 'product_innovation'
    | 'tech_enhancement'
    | 'culture_initiative'
    | 'cost_optimization'
    | 'other'
