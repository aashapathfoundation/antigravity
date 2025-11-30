import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const filter = searchParams.get('filter') || 'all'

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        let query = supabase
            .from('email_campaigns')
            .select('*')
            .order('created_at', { ascending: false })

        if (filter !== 'all') {
            query = query.eq('status', filter)
        }

        const { data, error } = await query

        if (error) throw error

        return NextResponse.json({ campaigns: data || [] })

    } catch (error) {
        console.error('Fetch Campaigns Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch campaigns' },
            { status: 500 }
        )
    }
}
