'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const HOSPITAL_STOCK_PHOTO = 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80';

// ── Theme ──────────────────────────────────────────────────────
const THEME = {
  primary: '#0ea5e9',
  dark:    '#0369a1',
  gradient:'linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%)',
  light:   '#f0f9ff',
  ring:    '#bae6fd',
};

// ── Liked options (hospital-specific) ─────────────────────────
const LIKED_OPTIONS = [
  { key: 'experienced_doctors', label: 'Experienced doctors',        emoji: '👨‍⚕️' },
  { key: 'quick_diagnosis',     label: 'Quick & accurate diagnosis', emoji: '🔬' },
  { key: 'clean_hygienic',      label: 'Clean & hygienic',          emoji: '✨' },
  { key: 'short_wait',          label: 'Short waiting time',         emoji: '⏱️' },
  { key: 'caring_staff',        label: 'Caring staff & nurses',      emoji: '💙' },
  { key: 'advanced_equipment',  label: 'Advanced equipment',         emoji: '🏥' },
  { key: 'affordable',          label: 'Affordable treatment',       emoji: '💰' },
  { key: 'clear_communication', label: 'Clear communication',        emoji: '💬' },
  { key: 'good_followup',       label: 'Great follow-up care',       emoji: '📋' },
  { key: 'emergency_care',      label: 'Excellent emergency care',   emoji: '🚑' },
  { key: 'comfortable',         label: 'Comfortable environment',    emoji: '🛋️' },
  { key: 'easy_appointment',    label: 'Easy appointments',          emoji: '📅' },
];

const LIKED_PHRASES = {
  experienced_doctors: 'the experienced and highly qualified doctors',
  quick_diagnosis:     'the quick and accurate diagnosis',
  clean_hygienic:      'how clean and hygienic the facility was',
  short_wait:          'the minimal waiting time',
  caring_staff:        'the compassionate and caring nursing staff',
  advanced_equipment:  'the state-of-the-art medical equipment',
  affordable:          'the affordable and transparent treatment cost',
  clear_communication: 'how clearly the doctors explained everything',
  good_followup:       'the thorough follow-up care',
  emergency_care:      'the prompt and efficient emergency care',
  comfortable:         'the clean and comfortable hospital environment',
  easy_appointment:    'how easy and smooth the appointment process was',
};

const RATING_OPTIONS = [
  { key: 'excellent', label: 'Excellent', emoji: '😍', stars: 5, desc: 'Loved everything!' },
  { key: 'good',      label: 'Good',      emoji: '😊', stars: 4, desc: 'Great experience' },
  { key: 'average',   label: 'Average',   emoji: '😐', stars: 3, desc: 'It was okay' },
];

const REVIEW_TYPES = [
  { key: 'short',    label: 'Short',    words: '30–50 words',   emoji: '⚡' },
  { key: 'medium',   label: 'Medium',   words: '70–100 words',  emoji: '✨' },
  { key: 'detailed', label: 'Detailed', words: '100–150 words', emoji: '📝' },
];

// ── SEO-Optimised review templates ────────────────────────────
function buildAspectSentence(liked) {
  const phrases = liked.map(k => LIKED_PHRASES[k]).filter(Boolean);
  if (!phrases.length) return '';
  if (phrases.length === 1) return `I especially appreciated ${phrases[0]}. `;
  if (phrases.length === 2) return `I particularly appreciated ${phrases[0]} and ${phrases[1]}. `;
  const last = phrases[phrases.length - 1];
  return `What stood out to me was ${phrases.slice(0,-1).join(', ')}, and ${last}. `;
}

function generateHospitalReview(hospitalName, location, rating, liked, type, variant, lang) {
  const loc = location || 'Bengaluru';
  const asp = buildAspectSentence(liked);
  const v = variant % 3;

  if (lang === 'kannada') {
    const kannada = {
      short: [
        `${hospitalName} ge hogi tumba satisfied aadhe. Doctorgalu highly experienced, facilities tumba clean. ${liked.includes('affordable') ? 'Treatment cost kuda reasonable.' : ''} Bengaluru alli best hospital antha helbahudu. Definitely recommend maadthene.`,
        `${hospitalName} nalli exceptional experience sikkithu. Expert doctors, caring staff, hygienic environment — yella tumba good. ${liked.includes('quick_diagnosis') ? 'Diagnosis quick aagi sigtu.' : ''} Trusted healthcare beku andre ee hospital ge hogi.`,
        `${hospitalName} nalli visit maadide — thumba impressed aadhe. ${liked.includes('experienced_doctors') ? 'Doctorgalu tumba skilled.' : ''} ${liked.includes('short_wait') ? 'Waiting time kuda kammi.' : ''} ${loc} alli quality healthcare ge best choice.`,
      ],
      medium: [
        `${hospitalName} ge ${loc} nalli hogi nanu tumba khushi aadhe. Doctorgalu patients janara haatra tumba carefully maatnadtare, yava bimari antha clearly helthare. ${asp}Hospital thumba hygienic aagi irutte, modern equipment kuda ide. Treatment cost kuda reasonable — bilkul extra charges illa. ${loc} alli ee tarada trusted healthcare sigala kashta. ${hospitalName} — Bengaluru alli best hospitals olle ide.`,
        `Nanu ${hospitalName} nalli treatment tegolide, experience tumba better aagittu. ${asp}Nursing staff tumba caring aagi serve maadtare. Hospital clean aagi, comfortable aagi irutte. Doctors time tegondu explain maadtare, which gives confidence. Affordable healthcare beku antha alle bandhere — ${hospitalName} perfect choice. Highly recommend maadthene.`,
      ],
      detailed: [
        `${hospitalName} nalli nanna experience share maadbeku antha feel aagide. Ee hospital nalli visit maadidaga ${asp}Doctors highly qualified aagi, treatment kuri clear explanation kottaru. Nurses mattu staff tumba friendly aagi help maadidaru. Hospital facility wise kuda tumba advanced, equipment modern. Cost wise kuda very reasonable — hidden charges enu illa. Emergency case alli kuda prompt response sigtu. ${loc} alli ee level na healthcare sigodu rare. ${hospitalName} Bengaluru nalli best hospital anta confidently helbahudu. Family mattu friends ge definitely recommend maadthene.`,
      ],
    };
    const pool = kannada[type] || kannada.medium;
    return pool[v % pool.length];
  }

  // ── ENGLISH ──
  const en = {
    short: [
      `Visited ${hospitalName} in ${loc} recently and truly impressed. The doctors are exceptionally skilled and the facilities are world-class. ${asp}One of the best hospitals in Bengaluru — highly recommend for quality healthcare.`,
      `Outstanding experience at ${hospitalName}! ${asp}The diagnosis was prompt and accurate, and the staff made me feel at ease throughout. Trusted and affordable healthcare in ${loc}. Strongly recommend.`,
      `Really satisfied with my experience at ${hospitalName} in ${loc}. Professional doctors, minimal waiting time, and a spotlessly clean environment. ${liked.includes('affordable') ? 'Treatment was affordable too.' : ''} Go-to hospital for quality medical care in Bengaluru.`,
    ],
    medium: [
      `I visited ${hospitalName} in ${loc} and had an exceptional healthcare experience. The doctors are highly qualified and took time to explain my condition clearly, which gave me complete confidence in the treatment. ${asp}The facility is clean, well-equipped, and the entire process from registration to diagnosis was smooth and efficient. For quality, trusted, and affordable healthcare in Bengaluru, ${hospitalName} genuinely stands out. Would highly recommend to anyone.`,
      `Had a very positive experience at ${hospitalName}. ${asp}What I appreciated most was how transparent and clear the doctors were — no rushing, no confusion. The hospital is hygienic and well-maintained, and the staff is genuinely caring. It's rare to find this level of quality medical care at such reasonable prices in ${loc}. ${hospitalName} is definitely among the best hospitals in Bengaluru.`,
      `${hospitalName} in ${loc} exceeded my expectations. From the moment I walked in, the staff was welcoming and professional. ${asp}The diagnosis was accurate and quick, and the doctor explained everything in a way that was easy to understand. The facility is modern, clean, and comfortable. Highly recommend ${hospitalName} for anyone seeking trusted healthcare in Bengaluru.`,
    ],
    detailed: [
      `I want to share my experience at ${hospitalName} in ${loc} because it genuinely deserves recognition. From the first point of contact to the final follow-up, everything was handled with great care and professionalism. ${asp}The doctors here are not just highly experienced — they take real time to listen, diagnose carefully, and explain every step of the treatment clearly. The nursing staff is compassionate and attentive. The hospital itself is immaculately clean, well-organised, and equipped with modern medical technology. What also impressed me was the transparency in billing — affordable, with no hidden charges. For anyone in Bengaluru looking for quality, trustworthy, and affordable healthcare, ${hospitalName} is absolutely the right choice. I would not hesitate to recommend it to family and friends.`,
      `My experience at ${hospitalName} was one that I feel compelled to share. ${asp}The level of care and attention I received was outstanding. The doctors are exceptionally skilled and speak to you as a human being — not just a patient. They take the time to explain the diagnosis in simple terms, which is genuinely reassuring. The hospital facility is spotlessly clean, the environment is calm, and the equipment is modern. The waiting time was minimal and the appointment process was smooth. Treatment costs were very reasonable and completely transparent. I have visited other hospitals in ${loc} and Bengaluru before, but ${hospitalName} stands out for its combination of expertise, empathy, and affordability. Highly recommended — 5 stars without hesitation.`,
    ],
  };

  const pool = en[type] || en.medium;
  return pool[v % pool.length];
}

// ── Manual review polisher ─────────────────────────────────────
function polishManualReview(rawText, liked, hospitalName, location) {
  let text = rawText.trim();
  if (!text) return '';

  // Fix doctor name: "dr xyz" / "dr. xyz" → "Dr. Xyz"
  text = text.replace(/\bdr\.?\s*([a-z])/gi, (_, first) => `Dr. ${first.toUpperCase()}`);

  // Fix standalone 'i' → 'I'
  text = text.replace(/\bi\b/g, 'I');

  // Capitalize after sentence-ending punctuation
  text = text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

  // Capitalize very first character
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // Add period at end if missing
  if (!/[.!?]$/.test(text)) text += '.';

  // Fix "he is good" → "He is highly good" (light enhancement only)
  text = text
    .replace(/\bis good\b/gi, 'is very good')
    .replace(/\bvery very\b/gi, 'very')
    .replace(/\bgood doctor\b/gi, 'highly skilled doctor')
    .replace(/\bgood staff\b/gi, 'very caring staff')
    .replace(/\bnice place\b/gi, 'great facility')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Build aspect sentence from liked options
  const asp = buildAspectSentence(liked);

  // Pick a varied intro
  const intros = [
    `I recently visited ${hospitalName} in ${location || 'Bengaluru'} and I'm glad to share my experience.`,
    `Had a positive experience at ${hospitalName} in ${location || 'Bengaluru'} and want to share it.`,
    `I visited ${hospitalName} recently and it was a genuinely good experience.`,
  ];
  const intro = intros[Math.floor(Math.random() * intros.length)];

  // Closing with SEO
  const closings = [
    `I would highly recommend ${hospitalName} to anyone seeking quality and trusted healthcare in Bengaluru.`,
    `If you're looking for reliable and affordable healthcare in Bengaluru, ${hospitalName} is a great choice.`,
    `${hospitalName} is genuinely one of the best hospitals in Bengaluru — highly recommend.`,
  ];
  const closing = closings[Math.floor(Math.random() * closings.length)];

  return `${intro} ${text} ${asp}${closing}`;
}

// ── Helper components ──────────────────────────────────────────
function Stars({ count }) {
  return <span style={{ color: '#fbbf24', fontSize: 18 }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

const ANIM = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn    { 0%{opacity:0;transform:scale(0.88)} 70%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
  @keyframes celebrate{ 0%,100%{transform:scale(1) rotate(0)} 25%{transform:scale(1.4) rotate(-12deg)} 75%{transform:scale(1.4) rotate(12deg)} }
  .anim-up  { animation: fadeInUp 0.45s ease-out both; }
  .anim-pop { animation: popIn 0.35s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-cel { animation: celebrate 0.7s ease-in-out; }
  @media(max-width:640px){
    .review-card { padding:20px !important; }
    .liked-grid  { grid-template-columns:1fr 1fr !important; }
    .type-row    { flex-direction:column !important; }
  }
`;

export default function HospitalReviewPage({ params }) {
  const { shopId } = params;
  const [hospital, setHospital] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Flow state
  const [step, setStep]       = useState(1);
  const [rating, setRating]   = useState(null);
  const [liked, setLiked]     = useState([]);
  const [mode, setMode]       = useState(null);       // 'auto' | 'manual'
  const [reviewType, setReviewType] = useState('medium');
  const [lang, setLang]       = useState('english');
  const [loading, setLoading] = useState(false);

  // Auto mode
  const [generatedReview, setGeneratedReview] = useState('');
  const [variant, setVariant] = useState(0);

  // Manual mode
  const [manualText, setManualText]     = useState('');
  const [polishedReview, setPolishedReview] = useState('');
  const [polishing, setPolishing]       = useState(false);

  const [copied, setCopied] = useState('');

  const GOOGLE_REVIEW_URL = 'https://share.google/iBPK7TfzoXQ9Hi94J';

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('businesses').select('*').eq('id', shopId).single();
      if (error || !data) { setNotFound(true); return; }
      setHospital(data);
      await supabase.from('businesses')
        .update({ scans: (data.scans || 0) + 1 }).eq('id', shopId);
    })();
  }, [shopId]);

  const toggleLiked = (key) =>
    setLiked(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const rev = generateHospitalReview(
      hospital?.shop_name || 'Even Hospital',
      hospital?.location || 'Bengaluru',
      rating, liked, reviewType, variant, lang
    );
    setGeneratedReview(rev);
    setVariant(v => v + 1);
    setLoading(false);
    setStep(4);
    await supabase.from('businesses')
      .update({ reviews_generated: (hospital?.reviews_generated || 0) + 1 })
      .eq('id', shopId);
  };

  const handlePolish = async () => {
    if (!manualText.trim()) return;
    setPolishing(true);
    await new Promise(r => setTimeout(r, 700));
    const polished = polishManualReview(
      manualText,
      liked,
      hospital?.shop_name || 'Even Hospital',
      hospital?.location || 'Bengaluru'
    );
    setPolishedReview(polished);
    setPolishing(false);
    setStep(4);
    await supabase.from('businesses')
      .update({ reviews_generated: (hospital?.reviews_generated || 0) + 1 })
      .eq('id', shopId);
  };

  const activeReview = mode === 'manual' ? polishedReview : generatedReview;

  const copyAndOpen = async () => {
    await navigator.clipboard.writeText(activeReview);
    setCopied('copied');
    setTimeout(() => {
      window.open(GOOGLE_REVIEW_URL, '_blank');
      setCopied('');
    }, 600);
  };

  const copyOnly = async () => {
    await navigator.clipboard.writeText(activeReview);
    setCopied('just_copied');
    setTimeout(() => setCopied(''), 2000);
  };

  const regenerate = () => {
    if (mode === 'manual') {
      const polished = polishManualReview(manualText, liked, hospital?.shop_name, hospital?.location);
      setPolishedReview(polished);
    } else {
      const rev = generateHospitalReview(
        hospital?.shop_name, hospital?.location,
        rating, liked, reviewType, variant, lang
      );
      setGeneratedReview(rev);
      setVariant(v => v + 1);
    }
  };

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f9ff' }}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏥</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>Hospital not found</h2>
        <p style={{ color: '#6b7280', marginTop: 8 }}>Please check the link and try again.</p>
      </div>
    </div>
  );

  if (!hospital) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f9ff' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #bae6fd', borderTopColor: THEME.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const ratingObj = RATING_OPTIONS.find(r => r.key === rating);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0f9ff 0%,#e0f2fe 50%,#f0fdf4 100%)', padding: '0 0 80px', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <style>{ANIM}</style>

      {/* Header */}
      <div style={{ background: THEME.gradient, padding: '0 20px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 0 32px', textAlign: 'center' }}>
          <img
            src={hospital.photo_url || HOSPITAL_STOCK_PHOTO}
            alt={hospital.shop_name}
            style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.6)', marginBottom: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
          />
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.2 }}>{hospital.shop_name}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>
            <span style={{ color: '#4ade80' }}>●</span> Verified Hospital · {hospital.location}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#e0f2fe' }}>
        <div style={{ height: 4, background: THEME.gradient, width: `${(step / 4) * 100}%`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px 0' }}>

        {/* ══ STEP 1: Rating ══ */}
        {step === 1 && (
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(14,165,233,0.1)', border: '1px solid #e0f2fe' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⭐</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>How was your experience?</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>Your feedback helps others find the right care.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {RATING_OPTIONS.map(r => (
                <button key={r.key} onClick={() => { setRating(r.key); setStep(2); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 16, border: `2px solid ${rating === r.key ? THEME.primary : '#e2e8f0'}`, background: rating === r.key ? THEME.light : '#fafafa', cursor: 'pointer', transition: 'all 0.18s', textAlign: 'left' }}>
                  <span style={{ fontSize: 30 }}>{r.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{r.label}</div>
                    <Stars count={r.stars} />
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ STEP 2: What did you like? ══ */}
        {step === 2 && (
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(14,165,233,0.1)', border: '1px solid #e0f2fe' }}>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: THEME.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0 }}>← Back</button>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💙</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>What did you like?</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>Select all that apply — makes your review more helpful.</p>
            </div>
            <div className="liked-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {LIKED_OPTIONS.map(opt => {
                const sel = liked.includes(opt.key);
                return (
                  <button key={opt.key} onClick={() => toggleLiked(opt.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 14, border: `2px solid ${sel ? THEME.primary : '#e2e8f0'}`, background: sel ? THEME.light : '#fafafa', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? THEME.dark : '#374151' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{opt.emoji}</span>
                    {opt.label}
                    {sel && <span style={{ marginLeft: 'auto', color: THEME.primary, fontSize: 14 }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep(3)} disabled={liked.length === 0}
              style={{ width: '100%', padding: '15px', borderRadius: 14, background: liked.length ? THEME.gradient : '#e2e8f0', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: liked.length ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
              Continue → {liked.length > 0 && `(${liked.length} selected)`}
            </button>
          </div>
        )}

        {/* ══ STEP 3: Mode + Content ══ */}
        {step === 3 && (
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(14,165,233,0.1)', border: '1px solid #e0f2fe' }}>
            <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: THEME.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Back</button>

            {/* Mode selector */}
            {!mode && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>✍️</div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>How would you like to review?</h2>
                  <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>Choose how you'd like to share your experience.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <button onClick={() => setMode('auto')}
                    style={{ padding: '20px 22px', borderRadius: 18, border: `2px solid #e0f2fe`, background: THEME.light, cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = THEME.primary}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#e0f2fe'}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✨</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16 }}>Auto-Generate Review</div>
                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>AI writes a perfect SEO-optimised review for you in seconds.</div>
                  </button>
                  <button onClick={() => setMode('manual')}
                    style={{ padding: '20px 22px', borderRadius: 18, border: `2px solid #e0f2fe`, background: '#fafafa', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = THEME.primary}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#e0f2fe'}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✏️</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16 }}>Write My Own</div>
                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Type your experience in your own words — AI will polish the grammar and frame it perfectly.</div>
                  </button>
                </div>
              </>
            )}

            {/* Auto mode */}
            {mode === 'auto' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>← Change mode</button>
                  <span style={{ fontSize: 20 }}>✨</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>Auto-Generate</span>
                </div>

                {/* Language */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Language</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[{ key:'english', label:'English 🇬🇧' }, { key:'kannada', label:'Kannada (Roman) 🌟' }].map(l => (
                      <button key={l.key} onClick={() => setLang(l.key)}
                        style={{ flex: 1, padding: '10px', borderRadius: 12, border: `2px solid ${lang === l.key ? THEME.primary : '#e2e8f0'}`, background: lang === l.key ? THEME.light : '#fafafa', fontWeight: 600, fontSize: 13, color: lang === l.key ? THEME.dark : '#374151', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review type */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Review Length</p>
                  <div className="type-row" style={{ display: 'flex', gap: 10 }}>
                    {REVIEW_TYPES.map(t => (
                      <button key={t.key} onClick={() => setReviewType(t.key)}
                        style={{ flex: 1, padding: '12px 8px', borderRadius: 14, border: `2px solid ${reviewType === t.key ? THEME.primary : '#e2e8f0'}`, background: reviewType === t.key ? THEME.light : '#fafafa', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{t.emoji}</div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: reviewType === t.key ? THEME.dark : '#374151' }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{t.words}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleGenerate} disabled={loading}
                  style={{ width: '100%', padding: '16px', borderRadius: 14, background: THEME.gradient, color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  {loading ? (
                    <><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Generating...</>
                  ) : '✨ Generate My Review'}
                </button>
              </>
            )}

            {/* Manual mode */}
            {mode === 'manual' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>← Change mode</button>
                  <span style={{ fontSize: 20 }}>✏️</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>Write Your Experience</span>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 14, border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 6px', fontWeight: 600 }}>💡 TIP — Just write naturally, even if grammar isn't perfect.</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>e.g. "dr pramod is good he is professional" → AI will structure it properly.</p>
                </div>

                <textarea
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  placeholder="Write your experience here... (doctor's name, what was good, how you felt)"
                  style={{ width: '100%', minHeight: 130, padding: '14px 16px', borderRadius: 14, border: '2px solid #e2e8f0', fontSize: 14, lineHeight: 1.6, color: '#0f172a', background: '#fff', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = THEME.primary}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 20px', textAlign: 'right' }}>{manualText.length} characters</p>

                <button onClick={handlePolish} disabled={!manualText.trim() || polishing}
                  style={{ width: '100%', padding: '16px', borderRadius: 14, background: manualText.trim() ? THEME.gradient : '#e2e8f0', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: manualText.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  {polishing ? (
                    <><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Polishing...</>
                  ) : '✨ Polish & Structure My Review'}
                </button>
              </>
            )}
          </div>
        )}

        {/* ══ STEP 4: Result ══ */}
        {step === 4 && activeReview && (
          <div className="anim-up">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span className="anim-cel" style={{ display: 'inline-block', fontSize: 52 }}>🎉</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '10px 0 4px' }}>
                {mode === 'manual' ? 'Your Review is Ready!' : 'Review Generated!'}
              </h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                {mode === 'manual' ? 'Polished and structured for maximum impact.' : 'Copy it and paste on Google.'}
              </p>
            </div>

            {/* Review card */}
            <div className="review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(14,165,233,0.12)', border: '1px solid #e0f2fe', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: THEME.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                  {(hospital.shop_name || 'H')[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>Your Review</p>
                  <Stars count={ratingObj?.stars || 5} />
                </div>
              </div>
              <p style={{ color: '#374151', lineHeight: 1.75, fontSize: 15, margin: 0 }}>{activeReview}</p>
            </div>

            {/* Action buttons */}
            <button onClick={copyAndOpen}
              style={{ width: '100%', padding: '16px', borderRadius: 14, background: '#16a34a', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity 0.2s' }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.92'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              {copied === 'copied' ? '✅ Copied! Opening Google...' : '📋 Copy & Open Google Review'}
            </button>

            <button onClick={regenerate}
              style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'transparent', color: '#64748b', border: '2px solid #e2e8f0', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}>
              🔄 {mode === 'manual' ? 'Re-Polish' : 'Generate Different Version'}
            </button>

            <button onClick={() => { setStep(3); setMode(null); }}
              style={{ width: '100%', padding: '11px', borderRadius: 14, background: 'transparent', color: '#94a3b8', border: 'none', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
              ← Start Over
            </button>

            {/* How to post */}
            <div style={{ marginTop: 20, background: '#f8fafc', borderRadius: 16, padding: 18, border: '1px solid #e2e8f0' }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#374151', margin: '0 0 10px' }}>📌 How to post on Google:</p>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#64748b', lineHeight: 2 }}>
                <li>Click <strong>"Copy & Open Google Review"</strong> above</li>
                <li>Google review page will open</li>
                <li>Tap the text box and paste (<strong>Ctrl+V / ⌘V</strong>)</li>
                <li>Submit your review ⭐</li>
              </ol>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
