import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function POST(request) {
    try {
        const { subject, content, recipientType, csvData, filters, scheduledAt, sendNow } = await request.json()

        if (!subject || !content) {
            return NextResponse.json(
                { error: 'Subject and content are required' },
                { status: 400 }
            )
        }

        // Initialize Supabase with service role for admin access
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        let recipients = []

        // 1. Fetch Recipients
        if (recipientType === 'subscribers') {
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .select('email')
                .eq('is_active', true)

            if (error) throw error
            recipients = data.map(r => r.email)

        } else if (recipientType === 'donors') {
            const { data, error } = await supabase
                .from('donations')
                .select('donor_email')
                .eq('status', 'success')

            if (error) throw error
            recipients = [...new Set(data.map(d => d.donor_email))]

        } else if (recipientType === 'filtered') {
            let query = supabase
                .from('donations')
                .select('donor_email')
                .eq('status', 'success')

            // Apply filters
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

            const { data, error } = await query

            if (error) throw error
            recipients = [...new Set(data.map(d => d.donor_email))]

        } else if (recipientType === 'csv') {
            if (!csvData || !Array.isArray(csvData)) {
                return NextResponse.json(
                    { error: 'Invalid CSV data' },
                    { status: 400 }
                )
            }
            recipients = csvData.map(row => row.email).filter(email => email && email.includes('@'))
        }

        if (recipients.length === 0) {
            return NextResponse.json(
                { error: 'No valid recipients found' },
                { status: 400 }
            )
        }

        // 2. Save campaign to database
        const { data: campaign, error: dbError } = await supabase
            .from('email_campaigns')
            .insert([{
                subject,
                content,
                recipient_type: recipientType,
                filter_min_amount: filters?.minAmount || null,
                filter_campaign_id: filters?.campaignId || null,
                filter_date_from: filters?.dateFrom || null,
                filter_date_to: filters?.dateTo || null,
                scheduled_at: scheduledAt || null,
                status: sendNow ? 'sending' : 'scheduled',
                recipient_count: recipients.length
            }])
            .select()
            .single()

        if (dbError) {
            console.error('Database Error:', dbError)
            // Continue even if DB save fails
        }

        // 3. Handle Scheduling vs Immediate Send
        if (!sendNow && scheduledAt) {
            // Just save to DB - a cron job would handle scheduled sends
            return NextResponse.json({
                message: 'Email scheduled successfully',
                count: recipients.length,
                scheduledAt
            })
        }

        // 4. Send Emails Immediately
        if (!process.env.SENDGRID_API_KEY) {
            console.log('Mock Sending Email:', {
                to: recipients.length + ' recipients',
                subject,
                content: content.substring(0, 50) + '...'
            })

            // Update campaign status
            if (campaign) {
                await supabase
                    .from('email_campaigns')
                    .update({ status: 'sent', sent_at: new Date().toISOString(), sent_count: recipients.length })
                    .eq('id', campaign.id)
            }

            return NextResponse.json({
                message: 'Emails sent successfully (Mock Mode - Set SENDGRID_API_KEY to send real emails)',
                count: recipients.length
            })
        }

        // Send in batches
        const batchSize = 50
        let sentCount = 0

        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize)
            const messages = batch.map(to => ({
                to,
                from: process.env.SENDGRID_FROM_EMAIL || 'noreply@aashapath.org',
                subject,
                html: content,
            }))

            try {
                await sgMail.send(messages)
                sentCount += batch.length
            } catch (error) {
                console.error(`Batch ${i / batchSize + 1} failed:`, error)
            }
        }

        // Update campaign status
        if (campaign) {
            await supabase
                .from('email_campaigns')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                    sent_count: sentCount,
                    failed_count: recipients.length - sentCount
                })
                .eq('id', campaign.id)
        }

        return NextResponse.json({
            message: 'Emails sent successfully',
            count: sentCount
        })

    } catch (error) {
        console.error('Email Campaign Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to send emails' },
            { status: 500 }
        )
    }
}
