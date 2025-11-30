"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Info */}
                    <div className="space-y-4">
                        <div className="mb-4">
                            <img src="/logo.jpg" alt="Aasha Path Foundation" className="h-16 w-auto" />
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Empowering communities and lighting up lives through sustainable development and compassionate care. Join us on our path of hope.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <SocialLink href="#" icon={<Facebook className="w-5 h-5" />} />
                            <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
                            <SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
                            <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            <FooterLink href="/about">About Us</FooterLink>
                            <FooterLink href="/mission">Our Mission</FooterLink>
                            <FooterLink href="/campaigns">Active Campaigns</FooterLink>
                            <FooterLink href="/volunteer">Volunteer</FooterLink>
                            <FooterLink href="/privacy">Privacy Policy</FooterLink>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                                <span>New Delhi, India 110001</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span>+91 7247320711</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span>aashapathfoundation@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Newsletter</h4>
                        <p className="text-gray-400 mb-4">Subscribe to get updates on our latest campaigns and impact stories.</p>
                        <NewsletterForm />
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-16 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Aasha Path Foundation. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

function NewsletterForm() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle') // idle, loading, success, error
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('loading')

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Something went wrong')

            setStatus('success')
            setMessage(data.message)
            setEmail('')
        } catch (error) {
            setStatus('error')
            setMessage(error.message)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
            />
            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70"
            >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
            {message && (
                <p className={`text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                </p>
            )}
        </form>
    )
}

function SocialLink({ href, icon }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"
        >
            {icon}
        </a>
    )
}

function FooterLink({ href, children }) {
    return (
        <li>
            <Link href={href} className="hover:text-blue-400 transition-colors">
                {children}
            </Link>
        </li>
    )
}
