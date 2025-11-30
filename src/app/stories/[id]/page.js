import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Mock data - in a real app this would come from a database
const stories = [
    {
        id: 1,
        title: "Riya's Journey to Education",
        category: "Education",
        date: "March 15, 2024",
        author: "Sarah Jenkins",
        image: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        content: `
            <p>Riya grew up in a small village where education for girls was often considered a luxury. Despite her keen intelligence and hunger for learning, her family's financial struggles meant she often had to miss school to help in the fields.</p>
            
            <p>The Aasha Path Foundation's 'Shiksha' initiative identified Riya's potential during a community visit. We provided her with a full scholarship, covering her tuition, books, and uniform. But our support went beyond just financial aid. We provided counseling to her parents, helping them understand the long-term value of educating their daughter.</p>
            
            <p>"I never thought I would be able to finish school," Riya says, her eyes shining. "Now, I dream of becoming a teacher so I can help other girls like me."</p>
            
            <p>Today, Riya is not only top of her class but also mentors younger girls in her village, proving that when you educate a girl, you educate a community. Her success has inspired five other families in her village to send their daughters back to school.</p>
        `
    },
    {
        id: 2,
        title: "Clean Water for Rampur",
        category: "Community Development",
        date: "February 28, 2024",
        author: "David Kumar",
        image: "https://images.unsplash.com/photo-1533658608304-20b6d2746409?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        content: `
            <p>For years, the women of Rampur walked five kilometers every day to fetch water. This grueling task took hours and often meant that young girls couldn't attend school. The water they collected was often contaminated, leading to frequent outbreaks of waterborne diseases.</p>
            
            <p>Thanks to the generous donations from our 'Jal Jeevan' campaign, we installed a solar-powered water filtration system right in the village square. The project involved the entire community, with local youth trained to maintain the system.</p>
            
            <p>Now, 200 families have access to clean, safe drinking water 24/7. The impact has been immediate: waterborne diseases have dropped by 80%, and school attendance among girls has risen significantly. The time saved is now used for education and income-generating activities.</p>
        `
    },
    {
        id: 3,
        title: "Empowering Sunita",
        category: "Women Empowerment",
        date: "January 10, 2024",
        author: "Priya Singh",
        image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        content: `
            <p>Sunita, a mother of three, struggled to make ends meet as a daily wage laborer. Her income was irregular, and she constantly worried about feeding her children. She joined our 'Saksham' vocational training program, where she learned tailoring and embroidery.</p>
            
            <p>The training was rigorous, but Sunita was determined. With a micro-grant from the foundation, she bought her first sewing machine. She started by doing repairs and small alterations for neighbors.</p>
            
            <p>Six months later, Sunita runs a small boutique from her home, employing two other women from her neighborhood. She creates beautiful garments that are sold in local markets and online. She is now financially independent and able to provide quality education for her children. "I am not just earning money," she says. "I am earning respect."</p>
        `
    }
]

export async function generateMetadata({ params }) {
    const story = stories.find(s => s.id === parseInt(params.id))
    if (!story) return { title: 'Story Not Found' }

    return {
        title: `${story.title} | Success Stories`,
        description: story.content.substring(0, 160).replace(/<[^>]*>?/gm, '')
    }
}

export default function StoryDetailPage({ params }) {
    const story = stories.find(s => s.id === parseInt(params.id))

    if (!story) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Image */}
            <div className="relative h-[60vh] w-full">
                <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                            {story.category}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                            {story.title}
                        </h1>
                        <div className="flex items-center gap-6 text-gray-300 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {story.date}
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {story.author}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-20 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <Link
                        href="/stories"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Stories
                    </Link>

                    <div
                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6"
                        dangerouslySetInnerHTML={{ __html: story.content }}
                    />

                    {/* Share Section */}
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Share2 className="w-5 h-5" /> Share this story
                        </h3>
                        <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                <Facebook className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-400 hover:bg-blue-400 hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
