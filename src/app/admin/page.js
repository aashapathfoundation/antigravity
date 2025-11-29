"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { DollarSign, Users, TrendingUp, Activity, Calendar, ArrowUp, ArrowDown, Target, Clock, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const FILTER_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
]

export default function AdminDashboard() {
    const supabase = createClient()
    const [dateRange, setDateRange] = useState('today')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0])
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [showCustomPicker, setShowCustomPicker] = useState(false)
    const [stats, setStats] = useState({
        totalDonations: 0,
        totalRaised: 0,
        activeCampaigns: 0,
        totalCampaigns: 0,
        totalDonors: 0,
        successRate: 0,
        avgDonation: 0,
        growth: 0
    })
    const [trendData, setTrendData] = useState([])
    const [campaignData, setCampaignData] = useState([])
    const [statusData, setStatusData] = useState([])
    const [recentDonations, setRecentDonations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()

        const donationsChannel = supabase
            .channel('dashboard-donations')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, () => {
                fetchDashboardData()
            })
            .subscribe()

        const campaignsChannel = supabase
            .channel('dashboard-campaigns')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => {
                fetchDashboardData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(donationsChannel)
            supabase.removeChannel(campaignsChannel)
        }
    }, [dateRange, customStartDate, customEndDate])

    const handleSelectFilter = (filter) => {
        setDateRange(filter)
        setShowFilterDropdown(false)
        if (filter === 'custom') {
            setShowCustomPicker(true)
        } else {
            setShowCustomPicker(false)
        }
    }

    const handleApplyCustomDate = () => {
        if (customStartDate && customEndDate) {
            setDateRange('custom')
            setShowCustomPicker(false)
            setShowFilterDropdown(false)
        }
    }

    const getFilterLabel = () => {
        const option = FILTER_OPTIONS.find(opt => opt.value === dateRange)
        return option ? option.label : 'Today'
    }

    const fetchDashboardData = async () => {
        try {
            let startDate, endDate

            if (dateRange === 'custom' && customStartDate && customEndDate) {
                startDate = new Date(customStartDate)
                startDate.setHours(0, 0, 0, 0)
                endDate = new Date(customEndDate)
                endDate.setHours(23, 59, 59, 999)
            } else if (dateRange === 'today') {
                startDate = new Date()
                startDate.setHours(0, 0, 0, 0)
                endDate = new Date()
                endDate.setHours(23, 59, 59, 999)
            } else {
                endDate = new Date()
                endDate.setHours(23, 59, 59, 999)
                startDate = new Date()
                startDate.setDate(startDate.getDate() - parseInt(dateRange))
                startDate.setHours(0, 0, 0, 0)
            }

            const { data: allDonations } = await supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false })

            const filteredDonations = allDonations?.filter(d => {
                const donationDate = new Date(d.created_at)
                return donationDate >= startDate && donationDate <= endDate
            }) || []

            const successfulDonations = filteredDonations.filter(d => d.status === 'success')
            const totalRaised = successfulDonations.reduce((sum, d) => sum + Number(d.amount), 0)
            const uniqueDonors = new Set(successfulDonations.map(d => d.donor_email)).size
            const successRate = filteredDonations.length > 0
                ? ((successfulDonations.length / filteredDonations.length) * 100).toFixed(1)
                : 0
            const avgDonation = successfulDonations.length > 0
                ? (totalRaised / successfulDonations.length).toFixed(0)
                : 0

            const { data: allCampaigns } = await supabase
                .from('campaigns')
                .select('*')

            const activeCampaigns = allCampaigns?.filter(c => c.is_active).length || 0

            const daysDiff = Math.max(Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)), 1)
            const previousStart = new Date(startDate)
            previousStart.setDate(previousStart.getDate() - daysDiff)

            const previousDonations = allDonations?.filter(d => {
                const date = new Date(d.created_at)
                return date >= previousStart && date < startDate && d.status === 'success'
            }) || []

            const previousTotal = previousDonations.reduce((sum, d) => sum + Number(d.amount), 0)
            const growth = previousTotal > 0
                ? (((totalRaised - previousTotal) / previousTotal) * 100).toFixed(1)
                : (totalRaised > 0 ? 100 : 0)

            const trendMap = {}
            const dayCount = daysDiff + 1

            for (let i = 0; i < dayCount; i++) {
                const date = new Date(startDate)
                date.setDate(date.getDate() + i)
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                trendMap[dateStr] = 0
            }

            successfulDonations.forEach(d => {
                const dateStr = new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                if (trendMap[dateStr] !== undefined) {
                    trendMap[dateStr] += Number(d.amount)
                }
            })

            const trendArray = Object.entries(trendMap).map(([date, amount]) => ({ date, amount }))

            const topCampaigns = allCampaigns
                ?.sort((a, b) => (b.raised_amount || 0) - (a.raised_amount || 0))
                .slice(0, 5)
                .map(c => ({
                    name: c.title.substring(0, 20),
                    raised: c.raised_amount || 0,
                    goal: c.goal_amount
                })) || []

            const statusMap = {}
            filteredDonations.forEach(d => {
                statusMap[d.status] = (statusMap[d.status] || 0) + 1
            })

            const statusArray = Object.entries(statusMap).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }))

            const recent = allDonations?.slice(0, 10) || []

            setStats({
                totalDonations: filteredDonations.length,
                totalRaised,
                activeCampaigns,
                totalCampaigns: allCampaigns?.length || 0,
                totalDonors: uniqueDonors,
                successRate: parseFloat(successRate),
                avgDonation: parseFloat(avgDonation),
                growth: parseFloat(growth)
            })

            setTrendData(trendArray)
            setCampaignData(topCampaigns)
            setStatusData(statusArray)
            setRecentDonations(recent)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 px-4 sm:px-0">
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h2>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Real-time insights and analytics</p>
                </div>

                {/* Mobile-friendly Filter Dropdown */}
                <div className="relative w-full sm:w-auto">
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-sm font-medium"
                    >
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-900">{getFilterLabel()}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showFilterDropdown && (
                        <div className="absolute top-full mt-2 w-full sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                            {FILTER_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelectFilter(option.value)}
                                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm ${dateRange === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Date Picker */}
            {showCustomPicker && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Date Range</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                max={customEndDate}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                min={customStartDate}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleApplyCustomDate}
                        disabled={!customStartDate || !customEndDate}
                        className="mt-4 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                        Apply Date Range
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard
                    title="Total Raised"
                    value={`₹${stats.totalRaised.toLocaleString()}`}
                    change={stats.growth}
                    icon={DollarSign}
                    gradient="from-green-500 to-emerald-600"
                />
                <MetricCard
                    title="Total Donations"
                    value={stats.totalDonations}
                    subtitle={`${stats.successRate}% success rate`}
                    icon={TrendingUp}
                    gradient="from-blue-500 to-cyan-600"
                />
                <MetricCard
                    title="Active Campaigns"
                    value={stats.activeCampaigns}
                    subtitle={`of ${stats.totalCampaigns} total`}
                    icon={Target}
                    gradient="from-purple-500 to-pink-600"
                />
                <MetricCard
                    title="Unique Donors"
                    value={stats.totalDonors}
                    subtitle={`₹${stats.avgDonation} avg`}
                    icon={Users}
                    gradient="from-orange-500 to-red-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Donation Trend
                    </h3>
                    <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '13px'
                                    }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                        Status Distribution
                    </h3>
                    <div className="h-64 sm:h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={window.innerWidth < 640 ? 60 : 80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Top Performing Campaigns
                    </h3>
                    <div className="space-y-4">
                        {campaignData.map((campaign, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="font-medium text-gray-900">{campaign.name}</span>
                                    <span className="text-gray-600">₹{campaign.raised.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                                        style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-500">
                                    {((campaign.raised / campaign.goal) * 100).toFixed(1)}% of ₹{campaign.goal.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        Recent Activity
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {recentDonations.map((donation) => (
                            <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${donation.status === 'success' ? 'bg-green-500' :
                                            donation.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                    <div className="min-w-0">
                                        <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{donation.donor_name}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(donation.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className="font-semibold text-xs sm:text-sm text-gray-900">₹{Number(donation.amount).toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 capitalize">{donation.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, change, subtitle, icon: Icon, gradient }) {
    return (
        <div className="relative bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
            <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:scale-110 transition-transform`} />

            <div className="relative">
                <div className={`inline-flex p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${gradient} mb-3 sm:mb-4`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>

                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{value}</p>

                {change !== undefined && (
                    <div className="flex items-center gap-1">
                        {change >= 0 ? (
                            <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        ) : (
                            <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        )}
                        <span className={`text-xs sm:text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(change)}%
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">vs last period</span>
                    </div>
                )}

                {subtitle && (
                    <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
                )}
            </div>
        </div>
    )
}
