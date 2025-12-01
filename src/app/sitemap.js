import { supabase } from '@/lib/supabaseClient'

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aashapathfoundation.org'

    // Static routes
    const routes = [
        '',
        '/about',
        '/mission',
        '/campaigns',
        '/contact',
        '/donate',
        '/login',
        '/signup',
        '/privacy',
        '/volunteer',
        '/success-stories',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic routes (Campaigns)
    try {
        const { data: campaigns } = await supabase
            .from('campaigns')
            .select('id, created_at')

        const campaignRoutes = campaigns?.map((campaign) => ({
            url: `${baseUrl}/campaigns/${campaign.id}`,
            lastModified: new Date(campaign.created_at), // Using created_at as fallback
            changeFrequency: 'weekly',
            priority: 0.9,
        })) || []

        return [...routes, ...campaignRoutes]
    } catch (error) {
        console.error('Sitemap generation error:', error)
        return routes
    }
}
