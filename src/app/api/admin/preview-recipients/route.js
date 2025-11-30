import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const { recipientType, filters } = await request.json()

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        let donors = []

        if (recipientType === 'filtered' || recipientType === 'donors') {
            let query = supabase
                .from('donations')
                .select('donor_name, donor_email, amount, created_at, campaign_id')
                .eq('status', 'success')

            // Apply filters
            if (recipientType === 'filtered') {
                if (filters.minAmount) {
                    query = query.gte('amount', filters.minAmount)
                }
                if (filters.campaignId) {
                    query = query.eq('campaign_id', filters.campaignId)
                }
                if (filters.dateFrom) {
                    query = query.gte('created_at', new Date(filters.dateFrom).toISOString())
                }
                if (filters.dateTo) {
                    const toDate = new Date(filters.dateTo)
                    toDate.setDate(toDate.getDate() + 1)
                    query = query.lt('created_at', toDate.toISOString())
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false })

            if (error) throw error

            // Aggregate by email
            const donorMap = new Map()
            data.forEach(donation => {
                const email = donation.donor_email
                if (donorMap.has(email)) {
                    const existing = donorMap.get(email)
                    existing.total += donation.amount
                    existing.count += 1
                } else {
                    donorMap.set(email, {
                        name: donation.donor_name,
                        email: email,
                        total: donation.amount,
                        count: 1
                    })
                }
            })

            donors = Array.from(donorMap.values())
                .sort((a, b) => b.total - a.total) // Sort by total donated
                .slice(0, 100) // Limit to 100 for preview
        }

        return NextResponse.json({ donors })

    } catch (error) {
        console.error('Preview Recipients Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to preview recipients' },
            { status: 500 }
        )
    }
}
