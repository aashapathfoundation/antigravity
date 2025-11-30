import { Shield, Lock, Eye, FileText, Database, Mail } from 'lucide-react'

export const metadata = {
    title: 'Privacy Policy | Aasha Path Foundation',
    description: 'Privacy Policy for Aasha Path Foundation. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 space-y-10">

                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-blue-600" />
                            Introduction
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            At Aasha Path Foundation, we are committed to protecting your privacy and ensuring the security of your personal information.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
                            or engage with our services. By accessing our website, you consent to the data practices described in this statement.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Database className="w-6 h-6 text-blue-600" />
                            Information We Collect
                        </h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed">
                            <p>We may collect personal information that you voluntarily provide to us when you:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Make a donation</li>
                                <li>Register as a volunteer</li>
                                <li>Subscribe to our newsletter</li>
                                <li>Contact us via email or forms</li>
                            </ul>
                            <p className="mt-4">This information may include:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Name and contact details (email, phone number, address)</li>
                                <li>Payment information (processed securely by third-party payment gateways)</li>
                                <li>Identification documents (for tax exemption certificates)</li>
                            </ul>
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Eye className="w-6 h-6 text-blue-600" />
                            How We Use Your Information
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">We use the information we collect to:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Process your donations and issue tax receipts</li>
                            <li>Communicate with you about our campaigns, impact, and events</li>
                            <li>Respond to your inquiries and provide support</li>
                            <li>Improve our website and services</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    {/* Data Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock className="w-6 h-6 text-blue-600" />
                            Data Security
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            We implement appropriate technical and organizational security measures to protect your personal information
                            against unauthorized access, alteration, disclosure, or destruction. However, please note that no method of
                            transmission over the Internet or electronic storage is 100% secure.
                        </p>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            Cookies
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on your device
                            that help us analyze website traffic and remember your preferences. You can control cookie settings through your
                            browser preferences.
                        </p>
                    </section>

                    {/* Contact Us */}
                    <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Contact Us
                        </h2>
                        <p className="text-gray-600 mb-4">
                            If you have any questions or concerns about our Privacy Policy, please contact us at:
                        </p>
                        <div className="space-y-2 text-gray-700">
                            <p><span className="font-semibold">Email:</span> aashapathfoundation@gmail.com</p>
                            <p><span className="font-semibold">Phone:</span> +91 7247320711</p>
                            <p><span className="font-semibold">Address:</span> New Delhi, India 110001</p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    )
}
