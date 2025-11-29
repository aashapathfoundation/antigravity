"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, Users, Globe, BookOpen } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt="Helping children"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Lighting the Path of <br />
            <span className="text-blue-400">Hope & Possibility</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto"
          >
            We are dedicated to empowering underprivileged communities through education, healthcare, and sustainable development.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/donate"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
            >
              Donate Now <Heart className="w-5 h-5 fill-current" />
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              Learn More <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <StatCard number="5000+" label="Lives Impacted" icon={<Users className="w-8 h-8" />} />
            <StatCard number="50+" label="Villages Served" icon={<Globe className="w-8 h-8" />} />
            <StatCard number="1200+" label="Children Educated" icon={<BookOpen className="w-8 h-8" />} />
            <StatCard number="100%" label="Transparency" icon={<Heart className="w-8 h-8" />} />
          </div>
        </div>
      </section>

      {/* Mission Preview */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Mission</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We focus on three key pillars to create lasting change in society.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <MissionCard
              title="Education for All"
              description="Providing quality education and learning resources to children in remote areas."
              icon="🎓"
            />
            <MissionCard
              title="Healthcare Access"
              description="Organizing medical camps and providing essential healthcare services to the needy."
              icon="🏥"
            />
            <MissionCard
              title="Women Empowerment"
              description="Skill development programs to help women become financially independent."
              icon="👩‍👧"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ number, label, icon }) {
  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:transform hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-center mb-4 text-blue-200">{icon}</div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-blue-100 font-medium">{label}</div>
    </div>
  )
}

function MissionCard({ title, description, icon }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
      <div className="text-4xl mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
      <Link href="/mission" className="inline-flex items-center text-blue-600 font-semibold mt-6 hover:text-blue-700">
        Read More <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </div>
  )
}
