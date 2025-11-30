import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function POST(request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // Get all scheduled campaigns that should be sent now
        const now = new Date().toISOString()
        const { data: campaigns, error } = await supabase
            .from('email_campaigns')
            .select('*')
            .eq('status', 'scheduled')
            .lte('scheduled_at', now)

        if (error) throw error

        if (!campaigns || campaigns.length === 0) {
            return NextResponse.json({
                message: 'No scheduled campaigns to process',
                processed: 0
            })
        }

        let processed = 0
        const results = []

        for (const campaign of campaigns) {
            try {
                // Update status to sending
                await supabase
                    .from('email_campaigns')
                    .update({ status: 'sending' })
                    .eq('id', campaign.id)

                // Get recipients
                const recipients = await getRecipients(supabase, campaign)

                if (recipients.length === 0) {
                    await supabase
                        .from('email_campaigns')
                        .update({ status: 'failed', failed_count: 0 })
                        .eq('id', campaign.id)
                    continue
                }

                // Send emails
                const sentCount = await sendEmails(campaign, recipients)

                // Update campaign as sent
                await supabase
                    .from('email_campaigns')
                    .update({
                        status: 'sent',
                        sent_at: new Date().toISOString(),
                        sent_count: sentCount,
                        failed_count: recipients.length - sentCount
                    })
                    .eq('id', campaign.id)

                processed++
                results.push({
                    id: campaign.id,
                    subject: campaign.subject,
                    recipients: sentCount
                })

            } catch (error) {
                console.error(`Failed to process campaign ${campaign.id}:`, error)
                await supabase
                    .from('email_campaigns')
                    .update({ status: 'failed' })
                    .eq('id', campaign.id)
            }
        }

        return NextResponse.json({
            message: `Processed ${processed} scheduled campaigns`,
            processed,
            results
        })

    } catch (error) {
        console.error('Process Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to process scheduled emails' },
            { status: 500 }
        )
    }
}

async function getRecipients(supabase, campaign) {
    let recipients = []

    if (campaign.recipient_type === 'subscribers') {
        const { data } = await supabase
            .from('newsletter_subscribers')
            .select('email')
            .eq('is_active', true)
        recipients = data?.map(r => r.email) || []

    } else if (campaign.recipient_type === 'donors' || campaign.recipient_type === 'filtered') {
        let query = supabase
            .from('donations')
            .select('donor_email')
            .eq('status', 'success')

        if (campaign.recipient_type === 'filtered') {
            if (campaign.filter_min_amount) {
                query = query.gte('amount', campaign.filter_min_amount)
            }
            if (campaign.filter_campaign_id) {
                query = query.eq('campaign_id', campaign.filter_campaign_id)
            }
            if (campaign.filter_date_from) {
                query = query.gte('created_at', campaign.filter_date_from)
            }
            if (campaign.filter_date_to) {
                const toDate = new Date(campaign.filter_date_to)
                toDate.setDate(toDate.getDate() + 1)
                query = query.lt('created_at', toDate.toISOString())
            }
        }

        const { data } = await query
        recipients = [...new Set(data?.map(d => d.donor_email) || [])]
    }

    return recipients.filter(email => email && email.includes('@'))
}

async function sendEmails(campaign, recipients) {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('Mock sending scheduled email:', campaign.subject, 'to', recipients.length, 'recipients')
        return recipients.length
    }

    const batchSize = 50
    let sentCount = 0

    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize)
        const messages = batch.map(to => ({
            to,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@aashapath.org',
            subject: campaign.subject,
            html: campaign.content,
        }))

        try {
            await sgMail.send(messages)
            sentCount += batch.length
        } catch (error) {
            console.error(`Batch ${i / batchSize + 1} failed:`, error)
        }
    }

    return sentCount
}
