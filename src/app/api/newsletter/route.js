import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const { email } = await request.json()

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        // Initialize Supabase client with service role key for admin access
        // We need service role to check for duplicates if RLS prevents reading
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // Check if email already exists
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('id')
            .eq('email', email)
            .single()

        if (existing) {
            return NextResponse.json(
                { message: 'You are already subscribed!' },
                { status: 200 }
            )
        }

        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert([{ email }])

        if (error) throw error

        return NextResponse.json(
            { message: 'Successfully subscribed!' },
            { status: 200 }
        )

    } catch (error) {
        console.error('Newsletter subscription error:', error)
        return NextResponse.json(
            { error: 'Failed to subscribe. Please try again.' },
            { status: 500 }
        )
    }
}
