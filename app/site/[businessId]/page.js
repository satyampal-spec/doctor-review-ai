'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const STOCK = {
  clinic:        'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1400&q=80',
  pharmacy:      'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1400&q=80',
  restaurant:    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80',
  barber:        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1400&q=80',
  clothes:       'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=80',
  jewellery:     'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400&q=80',
  shoes:         'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80',
  'car-service': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1400&q=80',
};

const THEMES = {
  clinic:        { p: '#0ea5e9', d: '#0369a1', l: '#f0f9ff', g: 'linear-gradient(135deg,#0ea5e9,#0369a1)', r: '#bae6fd' },
  pharmacy:      { p: '#10b981', d: '#047857', l: '#ecfdf5', g: 'linear-gradient(135deg,#10b981,#047857)', r: '#6ee7b7' },
  restaurant:    { p: '#f59e0b', d: '#b45309', l: '#fffbeb', g: 'linear-gradient(135deg,#f59e0b,#d97706)', r: '#fcd34d' },
  barber:        { p: '#8b5cf6', d: '#6d28d9', l: '#f5f3ff', g: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', r: '#c4b5fd' },
  clothes:       { p: '#ec4899', d: '#be185d', l: '#fdf2f8', g: 'linear-gradient(135deg,#ec4899,#be185d)', r: '#f9a8d4' },
  jewellery:     { p: '#d97706', d: '#92400e', l: '#fffbeb', g: 'linear-gradient(135deg,#f59e0b,#d97706)', r: '#fcd34d' },
  shoes:         { p: '#f97316', d: '#c2410c', l: '#fff7ed', g: 'linear-gradient(135deg,#f97316,#c2410c)', r: '#fdba74' },
  'car-service': { p: '#3b82f6', d: '#1d4ed8', l: '#eff6ff', g: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', r: '#93c5fd' },
};

const DEFAULT_THEME = THEMES.clinic;

const WA_MSGS = {
  clinic:        (n) => `Hi ${n}! I'd like to book an appointment.`,
  pharmacy:      (n) => `Hi ${n}! I'd like to order medicines.`,
  restaurant:    (n) => `Hi ${n}! I'd like to reserve a table.`,
  barber:        (n) => `Hi ${n}! I'd like to book a haircut appointment.`,
  clothes:       (n) => `Hi ${n}! I'd like to check your latest collection.`,
  jewellery:     (n) => `Hi ${n}! I'd like to enquire about your jewellery.`,
  shoes:         (n) => `Hi ${n}! I'd like to check your footwear collection.`,
  'car-service': (n) => `Hi ${n}! I'd like to book a car service.`,
};

const WA_LABELS = {
  clinic: 'Book Appointment', pharmacy: 'Order on WhatsApp',
  restaurant: 'Reserve a Table', barber: 'Book Appointment',
  clothes: 'Shop on WhatsApp', jewellery: 'Enquire Now',
  shoes: 'Shop Now', 'car-service': 'Book Service',
};

const ABOUT_HEADINGS = {
  clinic: 'Trusted Healthcare,\nRight Here in Bengaluru',
  pharmacy: 'Your Neighbourhood\nPharmacy',
  restaurant: 'A Dining Experience\nLike No Other',
  barber: 'Where Style\nMeets Craft',
  clothes: 'Fashion That\nSpeaks for Itself',
  jewellery: 'Timeless Jewellery,\nCrafted for You',
  shoes: 'Step Into\nSomething Special',
  'car-service': 'Expert Care\nfor Your Vehicle',
};

const CTA_TEXTS = {
  clinic: 'Book your appointment in seconds — no waiting on hold.',
  pharmacy: 'Order medicines from home. Delivered fast, trusted always.',
  restaurant: 'Reserve your table and arrive to a perfect experience.',
  barber: 'Book your next appointment in seconds, no calls needed.',
  clothes: 'Browse our collection and get styled — all on WhatsApp.',
  jewellery: 'Find your perfect piece. Enquire now, no pressure.',
  shoes: 'Find your perfect pair. Shop now on WhatsApp.',
  'car-service': 'Get your car serviced by experts. Book now.',
};

// Scroll reveal hook
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0, y = 36, className = '' }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function WAIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function Badge({ label, theme }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-5"
      style={{ background: theme.l, color: theme.p }}>
      {label}
    </span>
  );
}

export default function BusinessSite({ params }) {
  const { businessId } = params;
  const [biz, setBiz]   = useState(null);
  const [site, setSite] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  const theme = THEMES[biz?.business_type] || DEFAULT_THEME;

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 64);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: b, error } = await supabase.from('businesses').select('*').eq('id', businessId).single();
      if (error || !b) { setNotFound(true); return; }
      setBiz(b);
      const { data: s } = await supabase.from('business_websites').select('*').eq('business_id', businessId).single();
      setSite(s);
    })();
  }, [businessId]);

  const wa = (msg) => {
    const num = site?.whatsapp_number?.replace(/\D/g, '');
    if (!num) return;
    const text = encodeURIComponent(msg || WA_MSGS[biz?.business_type]?.(biz?.shop_name) || `Hi ${biz?.shop_name}!`);
    window.open(`https://wa.me/91${num}?text=${text}`, '_blank');
  };

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileOpen(false); };

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="text-7xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-500">This business page doesn't exist yet.</p>
      </div>
    </div>
  );

  if (!biz || !site) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );

  const extra      = site.extra || {};
  const gallery    = (site.gallery_urls || []).filter(Boolean);
  const heroPhoto  = gallery[0] || biz.photo_url || STOCK[biz.business_type] || STOCK.clinic;
  const about2Photo= gallery[1] || biz.photo_url || STOCK[biz.business_type];
  const services   = extra.services || [];
  const menu       = extra.menu || [];
  const highlights = extra.highlights || [];
  const isRest     = biz.business_type === 'restaurant';
  const type       = biz.business_type;

  const navItems = [
    { id: 'about',    label: 'About' },
    { id: 'services', label: isRest ? 'Menu' : 'Services' },
    ...(gallery.length > 1 ? [{ id: 'gallery', label: 'Gallery' }] : []),
    ...(site.timings ? [{ id: 'timings', label: 'Hours' }] : []),
    { id: 'contact',  label: 'Contact' },
  ];

  const waMsg = WA_MSGS[type]?.(biz.shop_name) || `Hi ${biz.shop_name}!`;
  const waLabel = WA_LABELS[type] || 'Chat on WhatsApp';

  return (
    <div className="bg-white overflow-x-hidden font-sans">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        @keyframes heroUp    { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes heroBadge { from { opacity:0; transform:translateY(16px) scale(0.9); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes waFloat   { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-7px); } }
        @keyframes waPulse   { 0%,100%{ box-shadow:0 0 0 0 rgba(37,211,102,0.45); } 70%{ box-shadow:0 0 0 14px transparent; } }
        @keyframes shimmer   { 0%{ background-position:-200% 0; } 100%{ background-position:200% 0; } }
        .hero-1 { animation: heroBadge 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .hero-2 { animation: heroUp    1.0s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
        .hero-3 { animation: heroUp    1.0s cubic-bezier(0.16,1,0.3,1) 0.65s both; }
        .hero-4 { animation: heroUp    1.0s cubic-bezier(0.16,1,0.3,1) 0.85s both; }
        .wa-btn { animation: waFloat 3s ease-in-out infinite, waPulse 2s infinite; }
        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-4px; left:0; right:0; height:2px; background:currentColor; transform:scaleX(0); transition:transform 0.2s; }
        .nav-link:hover::after { transform:scaleX(1); }
        .card-hover { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
        img { max-width:100%; }
      `}</style>

      {/* ── Floating WhatsApp ── */}
      <button onClick={() => wa(waMsg)} className="wa-btn fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: '#25D366', boxShadow: '0 6px 28px rgba(37,211,102,0.5)' }} aria-label="WhatsApp">
        <WAIcon size={26} />
      </button>

      {/* ── Navbar ── */}
      <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
          background: navScrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(20px)' : 'none',
          borderBottom: navScrolled ? '1px solid rgba(0,0,0,0.07)' : 'none',
          boxShadow: navScrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: navScrolled ? theme.d : '#fff', transition: 'color 0.3s', letterSpacing: '-0.01em' }}>
            {biz.shop_name}
          </span>
          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden md:flex">
            {navItems.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="nav-link text-sm font-semibold transition-all"
                style={{ color: navScrolled ? '#374151' : 'rgba(255,255,255,0.9)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {n.label}
              </button>
            ))}
            <button onClick={() => wa(waMsg)}
              style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 100, padding: '9px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'opacity 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
              <WAIcon size={15} /> {waLabel}
            </button>
          </div>
          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" style={{ background: 'none', border: 'none', fontSize: 22, color: navScrolled ? '#111' : '#fff', cursor: 'pointer' }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #f3f4f6', padding: '12px 24px 20px' }}>
            {navItems.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 0', fontSize: 15, fontWeight: 600, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f9fafb' }}>
                {n.label}
              </button>
            ))}
            <button onClick={() => { wa(waMsg); setMobileOpen(false); }}
              style={{ width: '100%', marginTop: 12, background: '#25D366', color: '#fff', border: 'none', borderRadius: 14, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {waLabel} →
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={heroPhoto} alt={biz.shop_name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.6) 55%, rgba(0,0,0,0.88) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '120px 24px 80px', maxWidth: 800, margin: '0 auto' }}>
          <div className="hero-1">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', marginBottom: 24 }}>
              <span style={{ color: '#4ade80' }}>●</span> Verified Business · Bengaluru
            </span>
          </div>
          <h1 className="hero-2" style={{ fontSize: 'clamp(2.4rem,7vw,5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 20 }}>
            {biz.shop_name}
          </h1>
          <p className="hero-3" style={{ fontSize: 'clamp(1.1rem,2.5vw,1.45rem)', color: 'rgba(255,255,255,0.78)', fontWeight: 300, lineHeight: 1.5, marginBottom: 14 }}>
            {site.tagline || `Premium ${biz.business_type} in ${biz.location}`}
          </p>
          <p className="hero-3" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 44 }}>📍 {biz.location}{extra.cuisine ? ` · ${extra.cuisine}` : ''}{extra.veg_type === 'veg' ? ' · 🌿 Pure Veg' : ''}</p>
          <div className="hero-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
            <button onClick={() => wa(waMsg)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 34px', borderRadius: 100, background: '#25D366', color: '#fff', fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(37,211,102,0.45)', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.04)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <WAIcon size={20} /> {waLabel}
            </button>
            <button onClick={() => scrollTo('about')}
              style={{ padding: '16px 34px', borderRadius: 100, background: 'transparent', color: '#fff', fontSize: 16, fontWeight: 600, border: '2px solid rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
              Explore ↓
            </button>
          </div>
        </div>
        {/* Scroll cue */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4 }}>
          <span style={{ fontSize: 11, color: '#fff', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>Scroll</span>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)' }} />
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" style={{ padding: '100px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64, alignItems: 'center' }}>
          <Reveal>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: -16, left: -16, width: 80, height: 80, borderRadius: '50%', background: theme.g, opacity: 0.12 }} />
              <img src={about2Photo} alt="About" style={{ width: '100%', height: 380, objectFit: 'cover', borderRadius: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.13)' }} />
              <div style={{ position: 'absolute', bottom: -18, right: -18, width: 110, height: 110, borderRadius: 24, background: theme.g, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>{extra.established_year ? 'Est.' : 'Trusted'}</span>
                <span style={{ fontSize: extra.established_year ? 22 : 28 }}>{extra.established_year || '⭐'}</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <Badge label="About Us" theme={theme} />
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, color: '#111', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 20, whiteSpace: 'pre-line' }}>
              {ABOUT_HEADINGS[type] || biz.shop_name}
            </h2>
            <p style={{ color: '#6b7280', fontSize: 17, lineHeight: 1.75, marginBottom: 24 }}>
              {site.about || `Welcome to ${biz.shop_name}. We are dedicated to providing the finest experience in ${biz.location}, Bengaluru.`}
            </p>
            {extra.qualifications && (
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>🎓 {extra.qualifications}</p>
            )}
            {extra.languages && (
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>🗣️ {extra.languages}</p>
            )}
            {extra.consultation_fee && (
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>💊 Consultation: ₹{extra.consultation_fee}</p>
            )}
            {highlights.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#374151' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: theme.g, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {h}
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── Services / Menu ── */}
      {(services.length > 0 || menu.length > 0) && (
        <section id="services" style={{ padding: '100px 24px', background: '#fafafa' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <Badge label={isRest ? 'Our Menu' : 'Services'} theme={theme} />
                <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, color: '#111', letterSpacing: '-0.02em' }}>
                  {isRest ? 'What We Serve' : 'What We Offer'}
                </h2>
              </div>
            </Reveal>

            {isRest ? (
              /* Menu layout */
              <div style={{ maxWidth: 720, margin: '0 auto' }}>
                {menu.filter(c => c.category).map((cat, ci) => (
                  <Reveal key={ci} delay={ci * 0.08}>
                    <div style={{ marginBottom: 44 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', paddingBottom: 12, marginBottom: 16, borderBottom: `2px solid ${theme.p}`, display: 'inline-block' }}>
                        {cat.category}
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {cat.items?.filter(i => i.name).map((item, ii) => (
                          <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 18px', background: '#fff', borderRadius: 16, border: '1px solid #f3f4f6', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', gap: 12 }}>
                            <div>
                              <p style={{ fontWeight: 700, color: '#111', fontSize: 15, marginBottom: 2 }}>{item.name}</p>
                              {item.desc && <p style={{ color: '#9ca3af', fontSize: 12 }}>{item.desc}</p>}
                            </div>
                            {item.price && <span style={{ color: theme.p, fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', flexShrink: 0 }}>₹{item.price}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            ) : (
              /* Services grid */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {services.filter(s => s.name).map((s, i) => (
                  <Reveal key={i} delay={i * 0.07}>
                    <div className="card-hover" onClick={() => wa(`Hi ${biz.shop_name}! I'm interested in your ${s.name} service.`)}
                      style={{ background: '#fff', borderRadius: 24, padding: '28px 24px', border: '1px solid #f3f4f6', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.g, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16, marginBottom: 18 }}>
                        {i + 1}
                      </div>
                      <h3 style={{ fontWeight: 800, fontSize: 17, color: '#111', marginBottom: 6 }}>{s.name}</h3>
                      {s.desc && <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>{s.desc}</p>}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f9fafb' }}>
                        {s.price ? <span style={{ fontWeight: 900, fontSize: 18, color: theme.p }}>₹{s.price}</span> : <span />}
                        {s.duration && <span style={{ fontSize: 12, color: '#9ca3af', background: '#f9fafb', padding: '3px 10px', borderRadius: 100, fontWeight: 600 }}>{s.duration}</span>}
                      </div>
                      <p style={{ fontSize: 12, color: theme.p, fontWeight: 700, marginTop: 14 }}>Tap to enquire on WhatsApp →</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Gallery ── */}
      {gallery.length > 1 && (
        <section id="gallery" style={{ padding: '100px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <Badge label="Gallery" theme={theme} />
                <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, color: '#111', letterSpacing: '-0.02em' }}>A Look Inside</h2>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto', gap: 14 }}>
              {gallery.slice(0, 6).map((url, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: i === 0 ? '16/9' : '1', gridColumn: i === 0 ? 'span 2' : 'span 1', position: 'relative' }}>
                    <img src={url} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)', display: 'block' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Timings ── */}
      {site.timings && (
        <section id="timings" style={{ padding: '100px 24px', background: '#fafafa' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <Reveal>
              <Badge label="Opening Hours" theme={theme} />
              <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, color: '#111', letterSpacing: '-0.02em', marginBottom: 48 }}>We're Open</h2>
              <div style={{ borderRadius: 28, overflow: 'hidden', boxShadow: '0 20px 80px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6' }}>
                <div style={{ background: theme.g, padding: '40px 32px', textAlign: 'center' }}>
                  <div style={{ fontSize: 52, marginBottom: 8 }}>🕐</div>
                  <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Opening Hours</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Always happy to see you</p>
                </div>
                <div style={{ background: '#fff', padding: '36px 32px' }}>
                  <p style={{ color: '#374151', fontSize: 17, lineHeight: 1.8, fontWeight: 500 }}>{site.timings}</p>
                  {site.address && (
                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f3f4f6' }}>
                      <p style={{ color: '#9ca3af', fontSize: 14 }}>📍 {site.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── CTA / Contact ── */}
      <section id="contact" style={{ padding: '100px 24px', background: theme.g, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ fontSize: 64, marginBottom: 20 }}>💬</div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 18 }}>
              Ready to Connect?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 18, lineHeight: 1.65, marginBottom: 44, fontWeight: 300 }}>
              {CTA_TEXTS[type] || `Reach out to ${biz.shop_name} on WhatsApp.`}
            </p>
            <button onClick={() => wa(waMsg)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '18px 40px', borderRadius: 100, background: '#25D366', color: '#fff', fontSize: 18, fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 12px 48px rgba(0,0,0,0.22)', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <WAIcon size={22} /> {waLabel}
            </button>
            {site.whatsapp_number && (
              <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>+91 {site.whatsapp_number}</p>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0f172a', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: 14, marginBottom: 4 }}>© {new Date().getFullYear()} {biz.shop_name} · {biz.location}, Bengaluru</p>
        <p style={{ color: '#334155', fontSize: 12 }}>Powered by ReviewAI</p>
      </footer>
    </div>
  );
}
