import { Heart, Users, Target, Award, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'About Us | Aasha Path Foundation',
    description: 'Learn about Aasha Path Foundation\'s mission to empower communities through education, healthcare, and sustainable development initiatives across India.',
}

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">About Aasha Path Foundation</h1>
                        <p className="text-lg md:text-xl text-blue-100">
                            Lighting the path of hope for communities across India through compassionate action and sustainable development
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    Aasha Path Foundation was born from a simple yet powerful belief: that every individual deserves access to basic
                                    necessities, quality education, and healthcare services regardless of their socio-economic background.
                                </p>
                                <p>
                                    Founded with the vision of creating sustainable change in underserved communities, we have dedicated ourselves
                                    to bridging the gap between privilege and need. What started as a small grassroots initiative has grown into
                                    a comprehensive organization touching thousands of lives across India.
                                </p>
                                <p>
                                    Our name, "Aasha Path" (Path of Hope), reflects our core philosophy—creating pathways of opportunity and hope
                                    for those who need it most. Through our various programs in education, healthcare, women's empowerment, and
                                    community development, we strive to create lasting, meaningful change.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 shadow-xl">
                                <div className="space-y-6">
                                    <StatCard number="10,000+" label="Lives Impacted" />
                                    <StatCard number="50+" label="Active Projects" />
                                    <StatCard number="100+" label="Volunteers" />
                                    <StatCard number="25+" label="Partner Organizations" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
                        <p className="text-gray-600 mt-4">The principles that guide everything we do</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ValueCard
                            icon={<Heart className="w-8 h-8" />}
                            title="Compassion"
                            description="We approach every individual and community with empathy, respect, and genuine care for their well-being."
                        />
                        <ValueCard
                            icon={<Users className="w-8 h-8" />}
                            title="Community"
                            description="We believe in the power of collective action and work hand-in-hand with communities for sustainable change."
                        />
                        <ValueCard
                            icon={<Target className="w-8 h-8" />}
                            title="Impact"
                            description="We focus on creating measurable, long-lasting impact that transforms lives and builds stronger communities."
                        />
                        <ValueCard
                            icon={<Award className="w-8 h-8" />}
                            title="Integrity"
                            description="We maintain the highest standards of transparency, accountability, and ethical conduct in all our operations."
                        />
                    </div>
                </div>
            </section>

            {/* What We Do */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">What We Do</h2>
                        <p className="text-gray-600 mt-4">Our comprehensive approach to community development</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <ProgramCard
                            title="Education"
                            description="Providing quality education, scholarships, and learning resources to underprivileged children and youth."
                        />
                        <ProgramCard
                            title="Healthcare"
                            description="Organizing health camps, medical aid programs, and awareness campaigns in underserved areas."
                        />
                        <ProgramCard
                            title="Women Empowerment"
                            description="Supporting women through skill development, entrepreneurship training, and livelihood programs."
                        />
                        <ProgramCard
                            title="Livelihood Support"
                            description="Creating sustainable income opportunities through vocational training and microenterprise development."
                        />
                        <ProgramCard
                            title="Environmental Conservation"
                            description="Promoting sustainable practices, tree plantation drives, and environmental awareness initiatives."
                        />
                        <ProgramCard
                            title="Emergency Relief"
                            description="Providing immediate assistance during natural disasters and humanitarian crises."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">Join Us in Making a Difference</h2>
                    <p className="text-lg text-blue-100 mb-8">
                        Together, we can create lasting change and build a brighter future for communities in need
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/donate" className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Donate Now <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/volunteer" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                            Become a Volunteer
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

function StatCard({ number, label }) {
    return (
        <div className="text-center p-4 bg-white rounded-xl shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-1">{number}</div>
            <div className="text-sm text-gray-600">{label}</div>
        </div>
    )
}

function ValueCard({ icon, title, description }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

function ProgramCard({ title, description }) {
    return (
        <div className="bg-gray-50 p-6 rounded-xl hover:bg-blue-50 transition-colors border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}
