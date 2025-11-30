"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Heart, User, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About Us', href: '/about' },
        { name: 'Our Mission', href: '/mission' },
        { name: 'Campaigns', href: '/campaigns' },
        { name: 'Contact', href: '/contact' },
    ]

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logo.jpg" alt="Aasha Path Foundation" className="h-12 w-auto" />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/donate"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
                        >
                            <Heart className="w-4 h-4 fill-current" />
                            Donate Now
                        </Link>

                        {user ? (
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="hidden lg:inline">Profile</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                <LogIn className="w-5 h-5" />
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-blue-600 focus:outline-none"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={cn(
                    "md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg transition-all duration-300 ease-in-out origin-top",
                    isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
                )}
            >
                <div className="px-4 pt-2 pb-6 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="pt-4 space-y-3">
                        <Link
                            href="/donate"
                            className="block w-full text-center bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold shadow-md active:scale-95 transition-transform"
                            onClick={() => setIsOpen(false)}
                        >
                            Donate Now
                        </Link>
                        {user ? (
                            <Link
                                href="/profile"
                                className="block w-full text-center bg-gray-100 text-gray-700 px-5 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                View Profile
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="block w-full text-center border border-gray-200 text-gray-700 px-5 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
