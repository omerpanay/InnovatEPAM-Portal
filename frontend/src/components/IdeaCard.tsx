/**
 * IdeaCard — EPAM-styled idea card for dashboard.
 */

import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { CATEGORY_LABELS } from '../utils/constants'
import type { IdeaListItem } from '../types'

interface IdeaCardProps {
    idea: IdeaListItem
}

export default function IdeaCard({ idea }: IdeaCardProps) {
    const navigate = useNavigate()

    return (
        <button
            onClick={() => navigate(`/ideas/${idea.id}`)}
            className="epam-card animate-slide-up w-full cursor-pointer p-6 text-left"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-text-primary">
                        {idea.title}
                    </h3>
                    <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
                        {CATEGORY_LABELS[idea.category] ?? idea.category}
                    </p>
                </div>
                <StatusBadge status={idea.status} />
            </div>

            <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs text-text-muted">
                    {new Date(idea.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}
                </p>
            </div>
        </button>
    )
}
