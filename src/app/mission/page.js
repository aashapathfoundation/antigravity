import { Target, Eye, Lightbulb, Globe, GraduationCap, HeartPulse, Sprout, Users2 } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Our Mission | Aasha Path Foundation',
    description: 'Discover the mission and vision of Aasha Path Foundation - empowering communities through education, healthcare, and sustainable development.',
}

export default function MissionPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Mission & Vision</h1>
                        <p className="text-lg md:text-xl text-purple-100">
                            Building a future where every individual has access to opportunities, healthcare, education, and dignity
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
                            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                To empower underprivileged communities across India by providing access to quality education, healthcare,
                                livelihood opportunities, and sustainable development programs that create lasting positive change and break
                                the cycle of poverty.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl">
                            <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                                <Eye className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                A society where every individual, regardless of their socio-economic background, has equal opportunities to
                                thrive, access to basic necessities, and the ability to live a life of dignity, purpose, and fulfillment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strategic Goals */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Our Strategic Goals</h2>
                        <p className="text-gray-600 mt-4">The pillars of our mission to create sustainable change</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <GoalCard
                            icon={<GraduationCap className="w-8 h-8" />}
                            title="Education for All"
                            description="Ensure every child has access to quality education and learning opportunities"
                            color="blue"
                        />
                        <GoalCard
                            icon={<HeartPulse className="w-8 h-8" />}
                            title="Healthcare Access"
                            description="Provide essential healthcare services and medical support to underserved communities"
                            color="red"
                        />
                        <GoalCard
                            icon={<Users2 className="w-8 h-8" />}
                            title="Women Empowerment"
                            description="Enable women to become economically independent and socially empowered"
                            color="purple"
                        />
                        <GoalCard
                            icon={<Sprout className="w-8 h-8" />}
                            title="Sustainable Development"
                            description="Promote environmentally sustainable practices and green initiatives"
                            color="green"
                        />
                    </div>
                </div>
            </section>

            {/* Our Approach */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Lightbulb className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Our Approach</h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                            We believe in sustainable, community-driven change that addresses root causes and creates long-term impact
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <ApproachCard
                            number="01"
                            title="Community Engagement"
                            description="We work directly with communities, understanding their unique needs and involving them in every step of program design and implementation."
                        />
                        <ApproachCard
                            number="02"
                            title="Holistic Solutions"
                            description="Our programs address multiple aspects of community development simultaneously, from education and health to livelihood and environment."
                        />
                        <ApproachCard
                            number="03"
                            title="Measurable Impact"
                            description="We set clear goals, track progress meticulously, and ensure accountability through regular monitoring and evaluation."
                        />
                    </div>
                </div>
            </section>

            {/* Impact Areas */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                            <Globe className="w-8 h-8 text-purple-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Our Focus Areas</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <FocusArea
                            title="Child Welfare & Education"
                            points={[
                                "Scholarships and educational materials for underprivileged children",
                                "After-school tutoring and mentorship programs",
                                "Infrastructure development in rural schools",
                                "Digital literacy and computer education initiatives"
                            ]}
                        />
                        <FocusArea
                            title="Healthcare & Nutrition"
                            points={[
                                "Free medical camps in remote and underserved areas",
                                "Health awareness and preventive care programs",
                                "Nutrition support for malnourished children",
                                "Mental health counseling and support services"
                            ]}
                        />
                        <FocusArea
                            title="Women's Empowerment"
                            points={[
                                "Vocational training and skill development programs",
                                "Microfinance and entrepreneurship support",
                                "Leadership development and capacity building",
                                "Support for gender equality and women's rights"
                            ]}
                        />
                        <FocusArea
                            title="Community Development"
                            points={[
                                "Clean water and sanitation projects",
                                "Renewable energy and environmental conservation",
                                "Disaster relief and emergency response",
                                "Rural infrastructure and connectivity improvement"
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">Be Part of Our Mission</h2>
                    <p className="text-lg text-blue-100 mb-8">
                        Your support helps us reach more communities and create greater impact
                    </p>
                    <Link href="/donate" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Support Our Mission
                    </Link>
                </div>
            </section>
        </div>
    )
}

function GoalCard({ icon, title, description, color }) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600',
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className={`w-14 h-14 rounded-lg flexitems-center justify-center mb-4 ${colorClasses[color]}`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

function ApproachCard({ number, title, description }) {
    return (
        <div className="relative bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
            <div className="text-5xl font-bold text-blue-100 mb-4">{number}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

function FocusArea({ title, points }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
            <ul className="space-y-3">
                {points.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                        <span className="text-gray-600">{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
