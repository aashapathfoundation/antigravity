"use client"

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, Heart, Target, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CampaignsPage() {
    const supabase = createClient()
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCampaigns()

        // Real-time subscription
        const channel = supabase
            .channel('public-campaigns-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'campaigns'
                },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        setCampaigns((prev) =>
                            prev.map((c) => (c.id === payload.new.id ? payload.new : c))
                        )
                    } else if (payload.eventType === 'INSERT') {
                        if (payload.new.is_active) {
                            setCampaigns((prev) => [payload.new, ...prev])
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setCampaigns((prev) => prev.filter((c) => c.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchCampaigns = async () => {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            setCampaigns(data || [])
        } catch (error) {
            console.error('Error fetching campaigns:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-blue-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Our Active <span className="text-blue-300">Campaigns</span>
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Join us in our mission to create lasting change. Choose a cause close to your heart and help us make a difference today.
                    </p>
                </div>
            </section>

            {/* Campaigns Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {campaigns.map((campaign) => (
                        <Link
                            key={campaign.id}
                            href={`/campaigns/${campaign.id}`}
                            className="block group h-full"
                        >
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full border border-gray-100">
                                <div className="relative h-56 bg-gray-200 overflow-hidden">
                                    {campaign.image_url ? (
                                        <img
                                            src={campaign.image_url}
                                            alt={campaign.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                                            <Heart className="w-16 h-16" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {campaign.title}
                                        </h3>
                                        <div
                                            className="text-gray-600 text-sm line-clamp-3 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: campaign.description }}
                                        />
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-blue-600">Raised: ₹{Number(campaign.raised_amount || 0).toLocaleString()}</span>
                                                <span className="text-gray-500">Goal: ₹{Number(campaign.goal_amount).toLocaleString()}</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>{Math.round((campaign.raised_amount / campaign.goal_amount) * 100)}% Funded</span>
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Supporters</span>
                                            </div>
                                        </div>

                                        <div
                                            className="block w-full py-3 px-4 bg-gray-900 group-hover:bg-blue-600 text-white text-center font-semibold rounded-xl transition-colors duration-300 flex items-center justify-center gap-2"
                                        >
                                            View Details
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {campaigns.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Target className="w-10 h-10 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Campaigns</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            We are currently planning our next initiatives. Please check back soon or make a general donation to support our cause.
                        </p>
                        <Link
                            href="/donate"
                            className="inline-flex items-center gap-2 mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
                        >
                            General Donation <Heart className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </section>
        </div>
    )
}
