/**
 * ProfilePage — User profile management with password change.
 * 
 * Redesigned with a modern, high-contrast EPAM aesthetic.
 * Utilizes a split-pane layout for a premium SaaS feel.
 */

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import apiClient from '../api/client'
import { useToast } from '../hooks/useToast'
import ErrorBanner from '../components/ErrorBanner'

export default function ProfilePage() {
    const { user, setUser } = useAuth()
    const { showToast } = useToast()

    const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'security'

    // Profile form
    const [username, setUsername] = useState(user?.username ?? '')
    const email = user?.email ?? ''
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileError, setProfileError] = useState<string | null>(null)

    // Password form
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [pwLoading, setPwLoading] = useState(false)
    const [pwError, setPwError] = useState<string | null>(null)

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setProfileLoading(true)
        setProfileError(null)
        try {
            const res = await apiClient.patch('/users/me', { username })
            if (user) {
                setUser({ ...user, username: res.data.username })
            }
            showToast('Profile updated successfully')
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to update profile'
            setProfileError(msg)
        } finally {
            setProfileLoading(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setPwError(null)
        if (newPassword !== confirmPassword) {
            setPwError('Passwords do not match')
            return
        }
        if (newPassword.length < 6) {
            setPwError('New password must be at least 6 characters')
            return
        }
        setPwLoading(true)
        try {
            await apiClient.post('/users/me/password', {
                old_password: oldPassword,
                new_password: newPassword,
            })
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
            showToast('Password changed successfully')
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to change password'
            setPwError(msg)
        } finally {
            setPwLoading(false)
        }
    }

    return (
        <div className="animate-reveal max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">Account Settings</h1>
                <p className="text-text-secondary text-sm">Manage your personal preferences and security protocols.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                {/* ── Left Sidebar (Navigation & Identity) ── */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">

                    {/* Identity Card */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 items-center justify-center rounded-none bg-primary/10 border-l-4 border-l-primary flex shadow-glow">
                            <span className="text-2xl font-bold text-primary uppercase">
                                {user?.username?.[0] || user?.email?.[0] || 'U'}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-white truncate">{user?.username}</h2>
                            <p className="text-xs text-text-muted truncate">{user?.email}</p>
                            <span className={`mt-2 inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${user?.role === 'evaluator' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface-elevated text-text-muted border border-border'}`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <nav className="flex flex-col gap-2 border-t border-border pt-6">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-widest transition-all text-left ${activeTab === 'profile'
                                ? 'bg-primary text-white shadow-glow translate-x-1'
                                : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            Personal Info
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-widest transition-all text-left ${activeTab === 'security'
                                ? 'bg-primary text-white shadow-glow translate-x-1'
                                : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                            </svg>
                            Security Settings
                        </button>
                    </nav>

                    {/* Support Block */}
                    <div className="mt-auto pt-8">
                        <div className="bg-surface-elevated/30 p-4 border border-border/30">
                            <p className="text-xs text-text-muted uppercase tracking-widest font-semibold mb-2">Need Help?</p>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Contact your system administrator for role changes or account deletion.
                            </p>
                        </div>
                    </div>
                </aside>

                {/* ── Right Content Area ── */}
                <main className="flex-1 min-w-0">

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-white">Personal Information</h3>
                                <p className="text-sm text-text-secondary mt-1">Update your display name and basic details.</p>
                            </div>

                            <hr className="border-border" />

                            <form onSubmit={handleProfileUpdate} className="max-w-xl space-y-6">
                                <ErrorBanner message={profileError} />

                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="epam-input w-full bg-surface-elevated border-transparent text-text-muted cursor-not-allowed opacity-70"
                                        title="Email cannot be changed"
                                    />
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Primary identifier (read-only)</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="epam-input w-full bg-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                        required
                                    />
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={profileLoading || username === user?.username}
                                        className="btn-primary px-8 py-3 text-sm font-semibold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover-lift"
                                    >
                                        {profileLoading ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="animate-fade-in space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-white">Security & Password</h3>
                                <p className="text-sm text-text-secondary mt-1">Ensure your account is using a long, random password to stay secure.</p>
                            </div>

                            <hr className="border-border" />

                            <form onSubmit={handlePasswordChange} className="max-w-xl space-y-6">
                                <ErrorBanner message={pwError} />

                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="epam-input w-full bg-surface focus:border-danger focus:ring-1 focus:ring-danger transition-colors"
                                        required
                                    />
                                </div>

                                <div className="pt-4 space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="epam-input w-full bg-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold uppercase tracking-widest text-text-muted">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="epam-input w-full bg-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={pwLoading || !oldPassword || !newPassword || !confirmPassword}
                                        className="btn-ghost px-8 py-3 text-sm font-semibold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover-lift"
                                    >
                                        {pwLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
