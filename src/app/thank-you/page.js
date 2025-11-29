"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Home } from 'lucide-react'
import * as fbq from '@/lib/fpixel'

export default function ThankYouPage() {
    useEffect(() => {
        // Fire the Donate/Purchase event
        // We can pass value if we had it in query params or context, for now just firing the event
        fbq.event('Donate', { currency: 'INR', value: 1000 }) // Example value, ideally dynamic
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Thank You!</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Your donation has been received successfully. Your generosity helps us continue our mission.
                </p>
                <div className="space-y-4">
                    <Link
                        href="/"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
