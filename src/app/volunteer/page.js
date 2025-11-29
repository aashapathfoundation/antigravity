import { HandHeart, Clock, MapPin, Users, CheckCircle, ArrowRight, Mail, Phone } from 'lucide-react'

export const metadata = {
    title: 'Volunteer With Us | Aasha Path Foundation',
    description: 'Join Aasha Path Foundation as a volunteer and make a real difference in the lives of underprivileged communities across India.',
}

export default function VolunteerPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative py-20 bg-gradient-to-br from-green-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Volunteer With Us</h1>
                        <p className="text-lg md:text-xl text-green-100">
                            Make a meaningful impact by dedicating your time, skills, and passion to help communities in need
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Volunteer */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Why Volunteer With Us?</h2>
                        <p className="text-gray-600 mt-4">Be part of something bigger than yourself</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <BenefitCard
                            icon={<HandHeart className="w-8 h-8" />}
                            title="Make Real Impact"
                            description="Your contributions directly help improve lives and create lasting change in communities"
                        />
                        <BenefitCard
                            icon={<Users className="w-8 h-8" />}
                            title="Build Connections"
                            description="Meet like-minded individuals and join a community of changemakers"
                        />
                        <BenefitCard
                            icon={<CheckCircle className="w-8 h-8" />}
                            title="Develop Skills"
                            description="Gain valuable experience and develop new skills while giving back to society"
                        />
                    </div>
                </div>
            </section>

            {/* Volunteer Opportunities */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Volunteer Opportunities</h2>
                        <p className="text-gray-600 mt-4">Find the perfect way to contribute your time and skills</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <OpportunityCard
                            title="Education & Tutoring"
                            description="Help children with their studies, teach life skills, or conduct workshops"
                            commitment="4-8 hours/week"
                            location="Various centers in Delhi"
                        />
                        <OpportunityCard
                            title="Healthcare Support"
                            description="Assist in medical camps, help with health awareness programs"
                            commitment="Flexible, event-based"
                            location="Rural & urban areas"
                        />
                        <OpportunityCard
                            title="Women's Empowerment"
                            description="Conduct skill-building workshops, provide career counseling and mentorship"
                            commitment="6-10 hours/week"
                            location="Community centers"
                        />
                        <OpportunityCard
                            title="Event Management"
                            description="Help organize fundraisers, awareness campaigns, and community events"
                            commitment="Project-based"
                            location="Across Delhi NCR"
                        />
                        <OpportunityCard
                            title="Digital & Marketing"
                            description="Manage social media, create content, or design promotional materials"
                            commitment="Remote, flexible"
                            location="Work from home"
                        />
                        <OpportunityCard
                            title="Administrative Support"
                            description="Assist with documentation, data entry, and organizational tasks"
                            commitment="10-15 hours/week"
                            location="Office or remote"
                        />
                    </div>
                </div>
            </section>

            {/* Requirements */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Volunteer Requirements</h2>
                        <div className="space-y-4">
                            <RequirementItem text="Must be at least 18 years of age" />
                            <RequirementItem text="Passionate about social work and community development" />
                            <RequirementItem text="Ability to commit to minimum specified hours per week/month" />
                            <RequirementItem text="Good communication skills and team-oriented mindset" />
                            <RequirementItem text="Respectful of diverse cultures, backgrounds, and perspectives" />
                            <RequirementItem text="Willingness to undergo background verification" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Process */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">How to Apply</h2>
                        <p className="text-gray-600 mt-4">Simple steps to become a volunteer</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        <ProcessStep
                            number="1"
                            title="Apply Online"
                            description="Fill out our volunteer application form"
                        />
                        <ProcessStep
                            number="2"
                            title="Interview"
                            description="Have a brief conversation with our team"
                        />
                        <ProcessStep
                            number="3"
                            title="Orientation"
                            description="Attend orientation and training session"
                        />
                        <ProcessStep
                            number="4"
                            title="Start Volunteering"
                            description="Begin making a difference!"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl">
                        <h2 className="text-3xl font-bold mb-6 text-center">Ready to Make a Difference?</h2>
                        <p className="text-lg text-center mb-8">
                            Join our community of dedicated volunteers and help us create positive change
                        </p>
                        <div className="space-y-6">
                            <div className="flex items-center justify-center gap-4">
                                <Mail className="w-6 h-6" />
                                <a href="mailto:aashapathfoundation@gmail.com" className="text-lg hover:underline">
                                    aashapathfoundation@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <Phone className="w-6 h-6" />
                                <a href="tel:+917247320711" className="text-lg hover:underline">
                                    +91 7247320711
                                </a>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-green-100 mb-4">Or email us with your details and interest areas</p>
                                <a
                                    href="mailto:aashapathfoundation@gmail.com?subject=Volunteer Application"
                                    className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    Apply to Volunteer <ArrowRight className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function BenefitCard({ icon, title, description }) {
    return (
        <div className="bg-gray-50 p-6 rounded-xl hover:bg-green-50 transition-colors border border-gray-200">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

function OpportunityCard({ title, description, commitment, location }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-600">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{commitment}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                </div>
            </div>
        </div>
    )
}

function RequirementItem({ text }) {
    return (
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{text}</span>
        </div>
    )
}

function ProcessStep({ number, title, description }) {
    return (
        <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {number}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}
