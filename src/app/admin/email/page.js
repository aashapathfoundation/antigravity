"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import Papa from 'papaparse'
import { Send, Upload, Users, FileText, Loader2, CheckCircle, AlertCircle, Calendar, Filter, Eye, Clock, X } from 'lucide-react'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

export default function EmailCampaignPage() {
    const [subject, setSubject] = useState('')
    const [content, setContent] = useState('')
    const [recipientType, setRecipientType] = useState('donors') // subscribers, donors, csv, filtered
    const [csvData, setCsvData] = useState([])
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null) // success, error
    const [message, setMessage] = useState('')
    const [csvFileName, setCsvFileName] = useState('')

    // Scheduling
    const [scheduleNow, setScheduleNow] = useState(true)
    const [scheduledDate, setScheduledDate] = useState('')
    const [scheduledTime, setScheduledTime] = useState('')

    // Filters
    const [minAmount, setMinAmount] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [selectedCampaign, setSelectedCampaign] = useState('')
    const [campaigns, setCampaigns] = useState([])

    // Preview
    const [recipientCount, setRecipientCount] = useState(0)
    const [showPreview, setShowPreview] = useState(false)
    const [previewDonors, setPreviewDonors] = useState([])
    const [loadingCount, setLoadingCount] = useState(false)

    const supabase = createClient()

    // Fetch campaigns for filter
    useEffect(() => {
        fetchCampaigns()
    }, [])

    // Update recipient count when filters change
    useEffect(() => {
        if (recipientType === 'filtered' || recipientType === 'donors' || recipientType === 'subscribers') {
            fetchRecipientCount()
        }
    }, [recipientType, minAmount, dateFrom, dateTo, selectedCampaign])

    const fetchCampaigns = async () => {
        const { data } = await supabase
            .from('campaigns')
            .select('id, title')
            .order('created_at', { ascending: false })

        if (data) setCampaigns(data)
    }

    const fetchRecipientCount = async () => {
        setLoadingCount(true)
        try {
            const res = await fetch('/api/admin/count-recipients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientType,
                    filters: {
                        minAmount: minAmount ? parseInt(minAmount) : null,
                        dateFrom: dateFrom || null,
                        dateTo: dateTo || null,
                        campaignId: selectedCampaign || null
                    }
                })
            })

            const data = await res.json()
            setRecipientCount(data.count || 0)
        } catch (error) {
            console.error('Count Error:', error)
        } finally {
            setLoadingCount(false)
        }
    }

    const handlePreviewDonors = async () => {
        setShowPreview(true)
        setLoading(true)
        try {
            const res = await fetch('/api/admin/preview-recipients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientType,
                    filters: {
                        minAmount: minAmount ? parseInt(minAmount) : null,
                        dateFrom: dateFrom || null,
                        dateTo: dateTo || null,
                        campaignId: selectedCampaign || null
                    }
                })
            })

            const data = await res.json()
            setPreviewDonors(data.donors || [])
        } catch (error) {
            console.error('Preview Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        setCsvFileName(file.name)
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                const validRows = results.data.filter(row => row.email && row.email.includes('@'))
                setCsvData(validRows)
                setRecipientCount(validRows.length)
            },
            error: (error) => {
                console.error('CSV Error:', error)
                setStatus('error')
                setMessage('Failed to parse CSV file')
            }
        })
    }

    const handleSend = async () => {
        if (!subject || !content) {
            setStatus('error')
            setMessage('Please provide both subject and content')
            return
        }

        if (recipientType === 'csv' && csvData.length === 0) {
            setStatus('error')
            setMessage('Please upload a valid CSV file with email addresses')
            return
        }

        setLoading(true)
        setStatus(null)
        setMessage('')

        try {
            // Prepare scheduled datetime in IST (UTC+05:30)
            let scheduledDateTime = null
            if (!scheduleNow && scheduledDate && scheduledTime) {
                // Combine date and time and treat as IST
                const istDateTime = new Date(`${scheduledDate}T${scheduledTime}:00+05:30`)
                scheduledDateTime = istDateTime.toISOString()
            }

            const res = await fetch('/api/admin/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    content,
                    recipientType,
                    csvData: recipientType === 'csv' ? csvData : null,
                    filters: recipientType === 'filtered' ? {
                        minAmount: minAmount ? parseInt(minAmount) : null,
                        dateFrom: dateFrom || null,
                        dateTo: dateTo || null,
                        campaignId: selectedCampaign || null
                    } : null,
                    scheduledAt: scheduledDateTime,
                    sendNow: scheduleNow
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to send emails')

            setStatus('success')
            setMessage(scheduleNow
                ? `Successfully sent emails to ${data.count} recipients`
                : `Email scheduled successfully for ${data.count} recipients`)

            // Reset form
            setSubject('')
            setContent('')
            setCsvData([])
            setCsvFileName('')
            setMinAmount('')
            setDateFrom('')
            setDateTo('')
            setSelectedCampaign('')
        } catch (error) {
            console.error('Send Error:', error)
            setStatus('error')
            setMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    }

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'indent',
        'link', 'image', 'video'
    ]

    // Get minimum datetime for scheduling (current IST time)
    const getMinDateTime = () => {
        const now = new Date()
        const istOffset = 5.5 * 60 * 60 * 1000 // UTC+05:30 in milliseconds
        const istNow = new Date(now.getTime() + istOffset)
        return istNow.toISOString().slice(0, 16)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
                    <p className="text-gray-600 mt-2">Create, schedule, and manage rich email campaigns</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Editor Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Enter a catchy subject..."
                            />
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px] flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                            <div className="flex-grow overflow-hidden">
                                <ReactQuill
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    modules={modules}
                                    formats={formats}
                                    className="h-[400px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Settings */}
                    <div className="space-y-6">
                        {/* Scheduling */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                Schedule
                            </h3>

                            <div className="space-y-3">
                                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        checked={scheduleNow}
                                        onChange={() => setScheduleNow(true)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700">Send Now</span>
                                </label>

                                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        checked={!scheduleNow}
                                        onChange={() => setScheduleNow(false)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700">Schedule for Later</span>
                                </label>

                                {!scheduleNow && (
                                    <div className="mt-3 space-y-2 pl-7">
                                        <input
                                            type="date"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                        <input
                                            type="time"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                        <p className="text-xs text-gray-500">Time in IST (UTC+05:30)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recipients */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                Recipients
                            </h3>

                            <div className="space-y-3">
                                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="recipient"
                                        value="subscribers"
                                        checked={recipientType === 'subscribers'}
                                        onChange={(e) => setRecipientType(e.target.value)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700">Newsletter Subscribers</span>
                                </label>

                                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="recipient"
                                        value="donors"
                                        checked={recipientType === 'donors'}
                                        onChange={(e) => setRecipientType(e.target.value)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700">All Donors</span>
                                </label>

                                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="recipient"
                                        value="filtered"
                                        checked={recipientType === 'filtered'}
                                        onChange={(e) => setRecipientType(e.target.value)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700">Filtered Donors</span>
                                </label>

                                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="recipient"
                                        value="csv"
                                        checked={recipientType === 'csv'}
                                        onChange={(e) => setRecipientType(e.target.value)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700">Upload CSV</span>
                                </label>
                            </div>

                            {/* Donor Filters */}
                            {recipientType === 'filtered' && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
                                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                                        <Filter className="w-4 h-4" />
                                        <span className="text-sm">Apply Filters</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Min. Donation Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={minAmount}
                                            onChange={(e) => setMinAmount(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            placeholder="e.g., 1000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Campaign</label>
                                        <select
                                            value={selectedCampaign}
                                            onChange={(e) => setSelectedCampaign(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="">All Campaigns</option>
                                            {campaigns.map(c => (
                                                <option key={c.id} value={c.id}>{c.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>

                                    <button
                                        onClick={handlePreviewDonors}
                                        className="w-full py-2 px-4 bg-white border border-blue-300 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Preview Donors
                                    </button>
                                </div>
                            )}

                            {recipientType === 'csv' && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <label className="block w-full cursor-pointer">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 text-blue-500 mb-2" />
                                            <p className="text-sm text-blue-600 font-medium">
                                                {csvFileName || "Click to upload CSV"}
                                            </p>
                                            <p className="text-xs text-blue-400 mt-1">Standard format required</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                    </label>
                                    {csvData.length > 0 && (
                                        <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            {csvData.length} recipients found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Summary
                            </h3>

                            <div className="space-y-2 text-sm text-gray-600 mb-6">
                                <div className="flex justify-between">
                                    <span>Recipient Group:</span>
                                    <span className="font-medium capitalize">{recipientType}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Recipient Count:</span>
                                    <span className="font-bold text-blue-600 text-lg">
                                        {loadingCount ? <Loader2 className="w-4 h-4 animate-spin inline" /> : recipientCount}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery:</span>
                                    <span className="font-medium">{scheduleNow ? 'Immediate' : 'Scheduled'}</span>
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    {message}
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    {message}
                                </div>
                            )}

                            <button
                                onClick={handleSend}
                                disabled={loading || recipientCount === 0}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {scheduleNow ? 'Sending...' : 'Scheduling...'}
                                    </>
                                ) : (
                                    <>
                                        {scheduleNow ? <Send className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                                        {scheduleNow ? 'Send Campaign' : 'Schedule Campaign'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Donor Preview Modal */}
                {showPreview && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Filtered Donors ({previewDonors.length})</h3>
                                <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                ) : previewDonors.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Donated</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Donations</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {previewDonors.map((donor, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-900">{donor.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{donor.email}</td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{donor.total.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{donor.count}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        No donors match the selected filters
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
