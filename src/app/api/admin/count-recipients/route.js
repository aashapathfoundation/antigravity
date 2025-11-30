import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const { recipientType, filters } = await request.json()

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        let count = 0

        if (recipientType === 'subscribers') {
            const { count: subCount, error } = await supabase
                .from('newsletter_subscribers')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true)

            if (error) throw error
            count = subCount || 0

        } else if (recipientType === 'donors' || recipientType === 'filtered') {
            let query = supabase
                .from('donations')
                .select('donor_email', { count: 'exact', head: false })
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
                    // Add one day and set to start of day to include the entire 'to' date
                    const toDate = new Date(filters.dateTo)
                    toDate.setDate(toDate.getDate() + 1)
                    query = query.lt('created_at', toDate.toISOString())
                }
            }

            const { data, error } = await query

            if (error) throw error

            // Count unique emails
            const uniqueEmails = new Set(data.map(d => d.donor_email))
            count = uniqueEmails.size

        }

        return NextResponse.json({ count })

    } catch (error) {
        console.error('Count Recipients Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to count recipients' },
            { status: 500 }
        )
    }
}
