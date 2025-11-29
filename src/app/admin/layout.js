"use client"

import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { Menu } from 'lucide-react'

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <AdminSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 overflow-auto w-full">
                {/* Mobile Header */}
                <header className="bg-white shadow-sm p-4 flex justify-between items-center lg:justify-end sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-600 hover:text-gray-900"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 hidden sm:block">Admin User</span>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            A
                        </div>
                    </div>
                </header>
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
