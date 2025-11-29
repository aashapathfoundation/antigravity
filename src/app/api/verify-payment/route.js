import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for secure updates
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Fallback for demo, but ideally SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donation_id } = await request.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // 1. Update donation status
            const { data: donation, error: updateError } = await supabaseAdmin
                .from('donations')
                .update({
                    status: 'success',
                    razorpay_payment_id: razorpay_payment_id
                })
                .eq('id', donation_id)
                .select()
                .single();

            if (updateError) throw updateError;

            // 2. If donation is linked to a campaign, update campaign funds
            if (donation.campaign_id) {
                console.log(`[VERIFY-PAYMENT] Donation linked to campaign ${donation.campaign_id}, amount: ${donation.amount}`);

                // Fetch current raised amount
                const { data: campaign, error: fetchError } = await supabaseAdmin
                    .from('campaigns')
                    .select('raised_amount')
                    .eq('id', donation.campaign_id)
                    .single();

                if (fetchError) {
                    console.error('[VERIFY-PAYMENT] Error fetching campaign:', fetchError);
                } else if (campaign) {
                    const newAmount = (campaign.raised_amount || 0) + donation.amount;
                    console.log(`[VERIFY-PAYMENT] Current: ₹${campaign.raised_amount || 0}, Adding: ₹${donation.amount}, New total: ₹${newAmount}`);

                    const { error: updateCampaignError } = await supabaseAdmin
                        .from('campaigns')
                        .update({ raised_amount: newAmount })
                        .eq('id', donation.campaign_id);

                    if (updateCampaignError) {
                        console.error('[VERIFY-PAYMENT] Error updating campaign:', updateCampaignError);
                    } else {
                        console.log(`[VERIFY-PAYMENT] Successfully updated campaign ${donation.campaign_id} to ₹${newAmount}`);
                    }
                }
            } else {
                console.log('[VERIFY-PAYMENT] Donation not linked to any campaign');
            }

            return NextResponse.json({ status: 'success', message: 'Payment verified' });
        } else {
            return NextResponse.json({ status: 'failure', message: 'Invalid signature' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json({ error: 'Error verifying payment' }, { status: 500 });
    }
}
