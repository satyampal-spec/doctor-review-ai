'use client';

import Link from 'next/link';

const features = [
  {
    icon: '📱',
    title: 'Scan QR Code',
    desc: 'Customer scans the QR code placed at your counter — no app needed.',
  },
  {
    icon: '✅',
    title: 'Quick 3-Step Form',
    desc: 'Rate experience, select what they liked, and how long they have been a customer.',
  },
  {
    icon: '🤖',
    title: 'AI Generates Review',
    desc: 'Our AI crafts 3 authentic, personalised review options — short, medium, and detailed.',
  },
  {
    icon: '⭐',
    title: 'One-Tap to Google',
    desc: 'Customer picks a review, copies it, and posts directly to your Google Business profile.',
  },
];

const categories = [
  { emoji: '🏥', label: 'Doctors & Clinics',    href: '/admin',      color: 'from-blue-500 to-blue-600' },
  { emoji: '🍽️', label: 'Restaurants',           href: '/admin/shop', color: 'from-red-500 to-red-600' },
  { emoji: '👗', label: 'Clothes Shops',          href: '/admin/shop', color: 'from-pink-500 to-pink-600' },
  { emoji: '💊', label: 'Pharmacies',             href: '/admin/shop', color: 'from-green-500 to-green-600' },
  { emoji: '💍', label: 'Jewellery Shops',        href: '/admin/shop', color: 'from-yellow-500 to-yellow-600' },
  { emoji: '👟', label: 'Shoe Shops',             href: '/admin/shop', color: 'from-orange-500 to-orange-600' },
  { emoji: '🚗', label: 'Car Service Centres',    href: '/admin/shop', color: 'from-cyan-500 to-cyan-600' },
  { emoji: '💈', label: 'Barber Shops',           href: '/admin/shop', color: 'from-purple-500 to-purple-600' },
];

const stats = [
  { value: '3x', label: 'More reviews collected' },
  { value: '< 60s', label: 'Patient effort per review' },
  { value: '95%+', label: 'Uniqueness per review' },
  { value: '90%+', label: 'Human-likeness score' },
];

const specialties = [
  'General Physician',
  'Family Physician',
  'Internal Medicine',
  'Diabetologist',
  'Gynecologist',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="font-bold text-xl text-blue-700">ReviewAI Bengaluru</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="btn-secondary text-sm px-4 py-2">
              Dashboard
            </Link>
            <Link href="/admin/shop" className="text-sm px-4 py-2 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all">
              Add Shop
            </Link>
            <Link href="/admin" className="btn-primary text-sm px-4 py-2">
              Add Clinic
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
            <span>🇮🇳</span> Built for Indian Clinics &amp; Doctors
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            More Google Reviews.<br />
            <span className="text-teal-300">Zero Patient Effort.</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Patients scan your QR code, answer 3 quick questions, and our AI generates
            authentic personalised reviews — ready to post in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin" className="btn-primary bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-4">
              Register Your Clinic →
            </Link>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-lg">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-blue-50 border-y border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-blue-700">{s.value}</div>
              <div className="text-sm text-gray-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 text-lg">Four simple steps from clinic to Google review.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={f.title} className="card text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{f.icon}</div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
              </div>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Works for Every Business in Bengaluru</h2>
          <p className="text-gray-500 mb-8">
            Category-specific AI review templates — language tuned for your customers and your business.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((cat) => (
              <Link key={cat.label} href={cat.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white font-semibold text-sm hover:scale-105 transition-transform shadow-md`}>
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-center leading-tight text-xs">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Review sample */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sample AI-Generated Reviews</h2>
          <p className="text-gray-500">Real-sounding, unique, and tailored to the patient's experience.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              label: 'Short (35 words)',
              color: 'bg-teal-50 border-teal-200',
              badge: 'bg-teal-100 text-teal-700',
              text: 'Dr. Sharma quickly identified what others had missed. Clear explanation, minimal tests, and I felt much better within 3 days. Genuinely one of the best GPs I\'ve visited.',
            },
            {
              label: 'Medium (80 words)',
              color: 'bg-blue-50 border-blue-200',
              badge: 'bg-blue-100 text-blue-700',
              text: 'I had been struggling with recurring fever for weeks. From the very first visit, Dr. Sharma took time to understand my complete history, asked the right questions, and gave a clear diagnosis. The treatment plan was practical — no unnecessary tests or expensive medicines. I recovered in under a week. The staff is helpful and the clinic is well-maintained. Highly recommend.',
            },
            {
              label: 'Detailed (130 words)',
              color: 'bg-indigo-50 border-indigo-200',
              badge: 'bg-indigo-100 text-indigo-700',
              text: 'I\'ve been consulting Dr. Sharma for almost two years now and I can say with confidence that he\'s become our family doctor. What I appreciate the most is that he listens — really listens. He doesn\'t rush through consultations or prescribe tests just to fill a prescription pad. When my mother had a sudden health issue last year, he was available over the phone and guided us calmly until we could come in. His explanations are always in simple language, never condescending. The clinic is clean, waiting times are manageable, and the support staff are polite. If you\'re looking for a doctor you can genuinely trust for long-term care, look no further.',
            },
          ].map((r) => (
            <div key={r.label} className={`card border ${r.color}`}>
              <span className={`badge ${r.badge} mb-4 text-xs`}>{r.label}</span>
              <p className="text-gray-700 text-sm leading-relaxed italic">"{r.text}"</p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to grow your clinic's reputation?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Register your clinic in 2 minutes. Get a QR code. Start collecting reviews today.
          </p>
          <Link href="/admin" className="btn-primary bg-white text-blue-700 hover:bg-blue-50 text-lg px-10 py-4">
            Register Your Clinic — It's Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <span className="font-bold text-blue-700">ClinicReview AI</span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ClinicReview AI · Built for Indian healthcare
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
