"use client"

import { useState, useEffect } from 'react'
import { Mail, Send, CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export default function EmailCampaignsDashboard() {
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [filter, setFilter] = useState('all')
    const [stats, setStats] = useState({
        total: 0,
        sent: 0,
        scheduled: 0,
        totalRecipients: 0
    })
    const [processMessage, setProcessMessage] = useState('')

    useEffect(() => {
        fetchCampaigns()
    }, [filter])

    const fetchCampaigns = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/email-campaigns?filter=${filter}`)
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to fetch campaigns')

            const campaigns = data.campaigns || []
            setCampaigns(campaigns)

            setStats({
                total: campaigns.length,
                sent: campaigns.filter(c => c.status === 'sent').length,
                scheduled: campaigns.filter(c => c.status === 'scheduled').length,
                totalRecipients: campaigns.reduce((sum, c) => sum + (c.sent_count || c.recipient_count || 0), 0)
            })
        } catch (error) {
            console.error('Fetch Campaigns Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const processScheduledEmails = async () => {
        setProcessing(true)
        setProcessMessage('')
        try {
            const res = await fetch('/api/admin/process-scheduled-emails', {
                method: 'POST'
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to process emails')

            setProcessMessage(data.message)
            await fetchCampaigns()
        } catch (error) {
            console.error('Process Error:', error)
            setProcessMessage('Error: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        })
    }

    const getStatusBadge = (status) => {
        const styles = {
            sent: 'bg-green-100 text-green-800',
            scheduled: 'bg-blue-100 text-blue-800',
            sending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
            draft: 'bg-gray-100 text-gray-800'
        }

        const icons = {
            sent: <CheckCircle className="w-3 h-3" />,
            scheduled: <Clock className="w-3 h-3" />,
            sending: <Send className="w-3 h-3" />,
            failed: <XCircle className="w-3 h-3" />,
            draft: <Mail className="w-3 h-3" />
        }

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
                        <p className="text-gray-600 mt-2">Manage and track your email campaigns</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {stats.scheduled > 0 && (
                            <button
                                onClick={processScheduledEmails}
                                disabled={processing}
                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Process Scheduled ({stats.scheduled})
                                    </>
                                )}
                            </button>
                        )}
                        <Link
                            href="/admin/email"
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
                        >
                            <Mail className="w-5 h-5" />
                            Create Campaign
                        </Link>
                    </div>
                </div>

                {/* Process Message */}
                {processMessage && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {processMessage}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={<Mail className="w-6 h-6" />} label="Total Campaigns" value={stats.total} color="blue" />
                    <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Sent" value={stats.sent} color="green" />
                    <StatCard icon={<Clock className="w-6 h-6" />} label="Scheduled" value={stats.scheduled} color="yellow" />
                    <StatCard icon={<Users className="w-6 h-6" />} label="Total Recipients" value={stats.totalRecipients.toLocaleString()} color="purple" />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'sent', 'scheduled', 'sending', 'failed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Campaigns List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : campaigns.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Recipient Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Recipients</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Scheduled/Sent</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {campaigns.map(campaign => (
                                        <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{campaign.subject}</div>
                                                <div className="text-sm text-gray-500 mt-1 line-clamp-1" dangerouslySetInnerHTML={{ __html: campaign.content.substring(0, 100) + '...' }} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm capitalize text-gray-600">{campaign.recipient_type}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {campaign.sent_count || campaign.recipient_count || 0}
                                                </div>
                                                {campaign.failed_count > 0 && (
                                                    <div className="text-xs text-red-600">{campaign.failed_count} failed</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(campaign.status)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {campaign.sent_at ? formatDate(campaign.sent_at) : campaign.scheduled_at ? formatDate(campaign.scheduled_at) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(campaign.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No campaigns found</p>
                            <Link href="/admin/email" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium">
                                Create your first campaign
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600'
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-2">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    {icon}
                </div>
                <h3 className="text-sm font-medium text-gray-500">{label}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
    )
}
