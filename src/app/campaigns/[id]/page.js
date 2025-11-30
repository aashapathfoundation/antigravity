"use client"

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Heart, Users, Calendar, Share2, ShieldCheck } from 'lucide-react'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CampaignDetailsPage({ params }) {
    const [campaign, setCampaign] = useState(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchCampaign() {
            const { id } = await params
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', id)
                .single()

            if (error || !data) {
                notFound()
            }

            setCampaign(data)
            setLoading(false)

            // Set up real-time subscription for this specific campaign
            const channel = supabase
                .channel(`campaign-${id}-realtime`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'campaigns',
                        filter: `id=eq.${id}`
                    },
                    (payload) => {
                        // Update campaign data when raised_amount changes
                        setCampaign(payload.new)
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }

        fetchCampaign()
    }, [params])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!campaign) {
        notFound()
    }

    // Calculate progress
    const progress = Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero / Image Section */}
            <div className="relative h-[400px] md:h-[500px] w-full bg-gray-900">
                {campaign.image_url ? (
                    <>
                        <img
                            src={campaign.image_url}
                            alt={campaign.title}
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-700">
                        <Heart className="w-32 h-32 opacity-20" />
                    </div>
                )}

                <div className="absolute top-6 left-4 md:left-8">
                    <Link
                        href="/campaigns"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                            {campaign.title}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-gray-300 text-sm md:text-base">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> Created {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" /> {Math.floor(Math.random() * 100) + 10} Supporters
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">About this Campaign</h2>
                            <div
                                className="prose prose-blue max-w-none text-gray-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: campaign.description }}
                            />
                        </div>
                    </div>

                    {/* Sidebar / Donation Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
                            <div className="mb-6">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="text-3xl font-bold text-gray-900">
                                        ₹{Number(campaign.raised_amount || 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500 mb-1">
                                        raised of ₹{Number(campaign.goal_amount).toLocaleString()}
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
                                    <span>{Math.round(progress)}% Funded</span>
                                    <span>{campaign.is_active ? 'Active' : 'Completed'}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Link
                                    href={`/donate?campaign=${campaign.id}`}
                                    className={`block w-full py-4 px-6 text-center text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${campaign.is_active
                                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                        : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                    onClick={(e) => !campaign.is_active && e.preventDefault()}
                                >
                                    {campaign.is_active ? 'Donate Now' : 'Campaign Closed'}
                                </Link>

                                <div className="grid grid-cols-4 gap-2">
                                    <button
                                        onClick={() => {
                                            const url = window.location.href
                                            const text = `Check out this campaign: ${campaign.title}`
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
                                        }}
                                        className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors flex items-center justify-center"
                                        title="Share on WhatsApp"
                                    >
                                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const url = window.location.href
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
                                        }}
                                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center"
                                        title="Share on Facebook"
                                    >
                                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            const url = window.location.href
                                            const text = `Check out this campaign: ${campaign.title}`
                                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
                                        }}
                                        className="p-3 bg-sky-50 text-sky-500 rounded-xl hover:bg-sky-100 transition-colors flex items-center justify-center"
                                        title="Share on Twitter"
                                    >
                                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href)
                                            alert('Link copied to clipboard!')
                                        }}
                                        className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center"
                                        title="Copy Link"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <ShieldCheck className="w-5 h-5 text-green-500" />
                                    <span>Donations are secure and encrypted</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
