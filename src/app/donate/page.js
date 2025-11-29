"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { Heart, ShieldCheck, Lock, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

function DonationForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const campaignId = searchParams.get('campaign')

    const [amount, setAmount] = useState(1000)
    const [customAmount, setCustomAmount] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    })
    const [loading, setLoading] = useState(false)
    const [campaign, setCampaign] = useState(null)

    useEffect(() => {
        if (campaignId) {
            fetchCampaign()
        }
    }, [campaignId])

    const fetchCampaign = async () => {
        const { data } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .single()

        if (data) setCampaign(data)
    }

    const handleAmountSelect = (val) => {
        setAmount(val)
        setCustomAmount('')
    }

    const handleCustomAmountChange = (e) => {
        const val = e.target.value
        setCustomAmount(val)
        if (val) setAmount(Number(val))
    }

    const handleDonate = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Create Order
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            })
            const order = await response.json()

            if (!response.ok) {
                throw new Error(`Order creation failed: ${order.error || 'Unknown error'}`)
            }

            // 2. Save initial donation record to Supabase
            const { data: donation, error: dbError } = await supabase
                .from('donations')
                .insert([
                    {
                        amount,
                        donor_name: formData.name,
                        donor_email: formData.email,
                        donor_phone: formData.phone,
                        razorpay_order_id: order.id,
                        status: 'pending',
                        campaign_id: campaignId || null // Link to campaign if exists
                    }
                ])
                .select()
                .single()

            if (dbError) throw dbError

            // 3. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Aasha Path Foundation",
                description: campaign ? `Donation for ${campaign.title}` : "Donation for a cause",
                order_id: order.id,
                handler: async function (response) {
                    // Payment Success
                    // Verify payment on backend
                    const verifyRes = await fetch('/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            donation_id: donation.id
                        }),
                    })

                    if (verifyRes.ok) {
                        // Client side update for immediate feedback (backend also handles it)
                        await supabase
                            .from('donations')
                            .update({ status: 'success', razorpay_payment_id: response.razorpay_payment_id })
                            .eq('id', donation.id)

                        router.push('/thank-you')
                    } else {
                        alert('Payment verification failed')
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                theme: {
                    color: "#2563eb",
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error('Donation error:', error)
            alert(`Something went wrong: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                {campaign ? (
                    <>
                        <div className="mb-6 flex justify-center">
                            <Link href={`/campaigns/${campaignId}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-medium">
                                <ArrowLeft className="w-4 h-4" /> Back to Campaign
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Donate to <span className="text-blue-600">{campaign.title}</span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Your contribution will directly support this cause.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Make a Difference Today</h1>
                        <p className="mt-4 text-lg text-gray-600">Your contribution can light up a life. 100% of your donation goes to the cause.</p>
                    </>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden md:flex">
                {/* Left Side - Info */}
                <div className="bg-blue-600 p-8 md:w-1/3 text-white flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Why Donate?</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                                <span className="text-blue-100">Secure & Transparent Payments</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Heart className="w-6 h-6 flex-shrink-0" />
                                <span className="text-blue-100">Tax Benefits under 80G</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Lock className="w-6 h-6 flex-shrink-0" />
                                <span className="text-blue-100">Your data is safe with us</span>
                            </li>
                        </ul>
                    </div>
                    <div className="mt-8">
                        <p className="text-sm text-blue-200">Questions? Call us at</p>
                        <p className="font-bold">+91 98765 43210</p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 md:w-2/3">
                    <form onSubmit={handleDonate} className="space-y-6">

                        {/* Amount Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount (INR)</label>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[500, 1000, 2500, 5000].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => handleAmountSelect(val)}
                                        className={`py-2 px-4 rounded-lg border ${amount === val && !customAmount
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 text-gray-700 hover:border-blue-500'
                                            }`}
                                    >
                                        ₹{val}
                                    </button>
                                ))}
                                <div className="col-span-2 sm:col-span-1">
                                    <input
                                        type="number"
                                        placeholder="Custom Amount"
                                        value={customAmount}
                                        onChange={handleCustomAmountChange}
                                        className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Processing...' : `Donate ₹${amount}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function DonationPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
                <DonationForm />
            </Suspense>
        </div>
    )
}
