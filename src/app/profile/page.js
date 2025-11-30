"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Heart, Clock, Download, LogOut, Loader2 } from 'lucide-react'
import { jsPDF } from 'jspdf'

export default function ProfilePage() {
    const [user, setUser] = useState(null)
    const [donations, setDonations] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error || !user) {
                router.push('/login')
                return
            }

            setUser(user)
            fetchDonations(user.email)
        }

        getUser()
    }, [router])

    const fetchDonations = async (email) => {
        try {
            const { data, error } = await supabase
                .from('donations')
                .select('*, campaigns(title)')
                .eq('donor_email', email)
                .order('created_at', { ascending: false })

            if (error) throw error
            setDonations(data || [])
        } catch (error) {
            console.error('Error fetching donations:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadReceipt = (donation) => {
        const doc = new jsPDF()

        // Add Logo/Header
        doc.setFontSize(22)
        doc.setTextColor(37, 99, 235) // Blue color
        doc.text('Aasha Path Foundation', 105, 20, { align: 'center' })

        doc.setFontSize(12)
        doc.setTextColor(100)
        doc.text('New Delhi, India 110001', 105, 30, { align: 'center' })
        doc.text('Email: aashapathfoundation@gmail.com | Phone: +91 7247320711', 105, 36, { align: 'center' })

        doc.setDrawColor(200)
        doc.line(20, 45, 190, 45)

        // Receipt Details
        doc.setFontSize(16)
        doc.setTextColor(0)
        doc.text('DONATION RECEIPT', 105, 60, { align: 'center' })

        doc.setFontSize(12)
        doc.text(`Receipt No: ${donation.id.slice(0, 8).toUpperCase()}`, 20, 80)
        doc.text(`Date: ${new Date(donation.created_at).toLocaleDateString()}`, 140, 80)

        // Donor Details
        doc.setFillColor(245, 247, 250)
        doc.rect(20, 90, 170, 35, 'F')

        doc.setFontSize(11)
        doc.text('Received with thanks from:', 25, 100)
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text(user?.user_metadata?.full_name || 'Valued Donor', 25, 108)
        doc.setFont(undefined, 'normal')
        doc.text(user?.email || '', 25, 115)

        // Donation Amount
        doc.text('The sum of:', 25, 140)
        doc.setFontSize(14)
        doc.setFont(undefined, 'bold')
        doc.text(`₹ ${donation.amount.toLocaleString()}`, 60, 140)

        // Campaign Info
        doc.setFontSize(12)
        doc.setFont(undefined, 'normal')
        doc.text('Towards Campaign:', 25, 155)
        doc.text(donation.campaigns?.title || 'General Donation', 70, 155)

        // Footer
        doc.line(20, 240, 190, 240)
        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text('This is a computer generated receipt and does not require a physical signature.', 105, 250, { align: 'center' })
        doc.text('Thank you for your generous support!', 105, 256, { align: 'center' })
        doc.text('Aasha Path Foundation is a registered non-profit organization.', 105, 262, { align: 'center' })

        // Save
        doc.save(`Receipt_${donation.id.slice(0, 8)}.pdf`)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <User className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user?.user_metadata?.full_name || 'Valued Donor'}
                            </h1>
                            <p className="text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <Heart className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500">Total Donated</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            ₹{donations.reduce((sum, d) => sum + (d.status === 'success' ? d.amount : 0), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500">Donations Count</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {donations.filter(d => d.status === 'success').length}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <User className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Date(user?.created_at).getFullYear()}
                        </p>
                    </div>
                </div>

                {/* Donation History */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Donation History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {donations.length > 0 ? (
                                    donations.map((donation) => (
                                        <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(donation.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {donation.campaigns?.title || 'General Donation'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                ₹{donation.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${donation.status === 'success'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {donation.status === 'success' && (
                                                    <button
                                                        onClick={() => handleDownloadReceipt(donation)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <Download className="w-4 h-4" /> Receipt
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No donations found. Start your journey of giving today!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
