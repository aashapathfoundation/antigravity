"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Heart, List, Settings, LogOut, X, Mail, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function AdminSidebar({ onClose }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const links = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Campaigns', href: '/admin/campaigns', icon: List },
        { name: 'Donations', href: '/admin/donations', icon: Heart },
        { name: 'Email Campaigns', href: '/admin/email', icon: Mail },
        { name: 'Email History', href: '/admin/email/campaigns', icon: BarChart3 },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ]

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
        router.refresh()
    }

    const handleLinkClick = () => {
        if (onClose) onClose()
    }

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
            <div className="p-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={handleLinkClick}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    )
}
