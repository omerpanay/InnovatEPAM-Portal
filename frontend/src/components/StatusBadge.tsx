/**
 * StatusBadge — EPAM-styled status indicator.
 */

import { STATUS_COLORS } from '../utils/constants'

interface StatusBadgeProps {
    status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const colors = STATUS_COLORS[status] ?? {
        bg: 'bg-epam-gray-600/20',
        text: 'text-epam-gray-400',
    }

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${colors.bg} ${colors.text}`}
        >
            {status}
        </span>
    )
}
