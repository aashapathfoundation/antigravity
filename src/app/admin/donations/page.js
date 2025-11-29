"use client"

import { useState, useEffect } from 'react'
import { Download, Search, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DonationsPage() {
    const supabase = createClient()
    const [donations, setDonations] = useState([])
    const [filteredDonations, setFilteredDonations] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDonations()

        // Real-time subscription
        const channel = supabase
            .channel('donations-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'donations'
                },
                (payload) => {
                    console.log('Real-time change received!', payload)
                    if (payload.eventType === 'INSERT') {
                        setDonations((prev) => [payload.new, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setDonations((prev) =>
                            prev.map((d) => (d.id === payload.new.id ? payload.new : d))
                        )
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    useEffect(() => {
        if (searchTerm) {
            const filtered = donations.filter(d =>
                d.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.donor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.id?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredDonations(filtered)
        } else {
            setFilteredDonations(donations)
        }
    }, [searchTerm, donations])

    const fetchDonations = async () => {
        try {
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            setDonations(data || [])
            setFilteredDonations(data || [])
        } catch (error) {
            console.error('Error fetching donations:', error)
        } finally {
            setLoading(false)
        }
    }

    const exportCSV = () => {
        const csvContent = [
            ['ID', 'Donor', 'Email', 'Amount', 'Date', 'Status'],
            ...filteredDonations.map(d => [
                d.id.substring(0, 8),
                d.donor_name,
                d.donor_email,
                d.amount,
                new Date(d.created_at).toLocaleDateString(),
                d.status
            ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `donations_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        Donations
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </h2>
                    <p className="text-gray-500 mt-1">Real-time donation tracking</p>
                </div>
                <button
                    onClick={exportCSV}
                    className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center font-medium shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Search/Filter */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search donors, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredDonations.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {searchTerm ? 'No donations found matching your search.' : 'No donations yet.'}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Donor</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredDonations.map((donation) => (
                                        <tr key={donation.id} className="hover:bg-gray-50/50 transition-colors animate-in fade-in duration-300">
                                            <td className="px-6 py-4 text-gray-500 font-mono text-sm">
                                                {donation.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{donation.donor_name}</td>
                                            <td className="px-6 py-4 text-gray-600">{donation.donor_email}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">₹{Number(donation.amount).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(donation.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${donation.status === 'success'
                                                    ? 'bg-green-100 text-green-800'
                                                    : donation.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {filteredDonations.map((donation) => (
                                <div key={donation.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{donation.donor_name}</p>
                                            <p className="text-sm text-gray-600">{donation.donor_email}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${donation.status === 'success'
                                            ? 'bg-green-100 text-green-800'
                                            : donation.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mt-3">
                                        <span className="text-gray-500 font-mono text-xs">
                                            {donation.id.substring(0, 8)}
                                        </span>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900">
                                                ₹{Number(donation.amount).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(donation.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
