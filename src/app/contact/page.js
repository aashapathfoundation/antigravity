"use client"

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null) // 'success' | 'error' | null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatus(null)

        try {
            // Here we would typically send this to an API or Supabase
            // For now, we'll simulate a success response
            // You can implement the actual backend logic later
            await new Promise(resolve => setTimeout(resolve, 1000))

            setStatus('success')
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (error) {
            console.error('Error sending message:', error)
            setStatus('error')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-blue-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Have questions about our work or want to get involved? We'd love to hear from you.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Contact Information */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Info</h2>
                            <div className="space-y-6">
                                <ContactItem
                                    icon={<MapPin className="w-6 h-6" />}
                                    title="Visit Us"
                                    content="New Delhi, India 110001"
                                />
                                <ContactItem
                                    icon={<Phone className="w-6 h-6" />}
                                    title="Call Us"
                                    content="+91 7247320711"
                                    href="tel:+917247320711"
                                />
                                <ContactItem
                                    icon={<Mail className="w-6 h-6" />}
                                    title="Email Us"
                                    content="aashapathfoundation@gmail.com"
                                    href="mailto:aashapathfoundation@gmail.com"
                                />
                                <ContactItem
                                    icon={<Clock className="w-6 h-6" />}
                                    title="Office Hours"
                                    content="Mon - Sat: 9:00 AM - 6:00 PM"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                            <h3 className="text-xl font-bold text-blue-900 mb-4">Join Our Community</h3>
                            <p className="text-blue-700 mb-6">
                                Stay updated with our latest initiatives and impact stories.
                            </p>
                            <div className="flex gap-4">
                                {/* Social Media Links Placeholder */}
                                <SocialButton label="Facebook" />
                                <SocialButton label="Twitter" />
                                <SocialButton label="Instagram" />
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
                            <p className="text-gray-500 mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                        placeholder="Write your message here..."
                                    />
                                </div>

                                {status === 'success' && (
                                    <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        Message sent successfully! We'll get back to you soon.
                                    </div>
                                )}

                                {status === 'error' && (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                                        Something went wrong. Please try again later.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            Send Message
                                            <Send className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ContactItem({ icon, title, content, href }) {
    const Wrapper = href ? 'a' : 'div'
    return (
        <Wrapper
            href={href}
            className={`flex items-start gap-4 ${href ? 'hover:text-blue-600 transition-colors group' : ''}`}
        >
            <div className={`w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0 ${href ? 'group-hover:bg-blue-100 group-hover:scale-110 transition-all' : ''}`}>
                {icon}
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-600">{content}</p>
            </div>
        </Wrapper>
    )
}

function SocialButton({ label }) {
    return (
        <button className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
            {label}
        </button>
    )
}
