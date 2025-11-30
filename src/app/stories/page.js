import { Quote, ArrowRight, Calendar, User } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Success Stories | Aasha Path Foundation',
    description: 'Read inspiring stories of change and impact from the communities we serve.',
}

export default function StoriesPage() {
    const stories = [
        {
            id: 1,
            title: "Riya's Journey to Education",
            category: "Education",
            date: "March 15, 2024",
            author: "Sarah Jenkins",
            image: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            excerpt: "How a scholarship program transformed the life of a bright young girl from a remote village, opening doors to a future she never dreamed possible.",
            content: "Riya grew up in a small village where education for girls was often considered a luxury. Despite her keen intelligence and hunger for learning, her family's financial struggles meant she often had to miss school to help in the fields. The Aasha Path Foundation's 'Shiksha' initiative identified Riya's potential during a community visit. We provided her with a full scholarship, covering her tuition, books, and uniform. Today, Riya is not only top of her class but also mentors younger girls in her village, proving that when you educate a girl, you educate a community."
        },
        {
            id: 2,
            title: "Clean Water for Rampur",
            category: "Community Development",
            date: "February 28, 2024",
            author: "David Kumar",
            image: "https://images.unsplash.com/photo-1533658608304-20b6d2746409?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            excerpt: "The installation of a solar-powered water pump has brought health and prosperity to a drought-prone village.",
            content: "For years, the women of Rampur walked five kilometers every day to fetch water. This grueling task took hours and often meant that young girls couldn't attend school. Thanks to the generous donations from our 'Jal Jeevan' campaign, we installed a solar-powered water filtration system right in the village square. Now, 200 families have access to clean, safe drinking water 24/7. The impact has been immediate: waterborne diseases have dropped by 80%, and school attendance among girls has risen significantly."
        },
        {
            id: 3,
            title: "Empowering Sunita",
            category: "Women Empowerment",
            date: "January 10, 2024",
            author: "Priya Singh",
            image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            excerpt: "From a daily wage laborer to a successful entrepreneur, read Sunita's inspiring story of resilience.",
            content: "Sunita, a mother of three, struggled to make ends meet as a daily wage laborer. She joined our 'Saksham' vocational training program, where she learned tailoring and embroidery. With a micro-grant from the foundation, she bought her first sewing machine. Six months later, Sunita runs a small boutique from her home, employing two other women from her neighborhood. She is now financially independent and able to provide quality education for her children."
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-white py-20 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm">Impact Stories</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-6">Voices of Change</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Real stories of real people whose lives have been transformed by your generosity and support.
                    </p>
                </div>
            </section>

            {/* Stories Grid */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stories.map((story) => (
                            <article key={story.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={story.image}
                                        alt={story.title}
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-blue-600">
                                        {story.category}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {story.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {story.author}
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                        {story.title}
                                    </h2>
                                    <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                                        {story.excerpt}
                                    </p>
                                    <Link
                                        href={`/stories/${story.id}`}
                                        className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors mt-auto"
                                    >
                                        Read Full Story <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="py-20 bg-blue-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Quote className="w-12 h-12 text-blue-300 mx-auto mb-6 opacity-50" />
                    <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
                        "The smallest act of kindness is worth more than the grandest intention. Every donation, every volunteer hour, creates a ripple of hope that transforms lives."
                    </blockquote>
                    <cite className="not-italic font-semibold text-blue-100 block">
                        - Founder, Aasha Path Foundation
                    </cite>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gray-900 text-center">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-white mb-6">Create Your Own Impact Story</h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        Join us in our mission to bring hope and change to those who need it most.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/donate" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
                            Make a Donation
                        </Link>
                        <Link href="/volunteer" className="bg-transparent border border-gray-700 text-white hover:bg-gray-800 px-8 py-4 rounded-lg font-semibold transition-colors">
                            Become a Volunteer
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
