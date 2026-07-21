'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { generateShopReview, CATEGORY_CONFIG } from '@/lib/shopReviewGenerator';

const CONFIG = CATEGORY_CONFIG.clinic;

// ── Theme ──────────────────────────────────────────────────────
const THEME = {
  primary: '#0d9488',
  dark:    '#0f766e',
  gradient:'linear-gradient(135deg,#0d9488 0%,#0f766e 100%)',
  light:   '#f0fdfa',
  ring:    '#99f6e4',
};

const LIKED_OPTIONS = CONFIG.likedOptions;

// Used to weave the patient's selected highlights into a manually-written review
const LIKED_PHRASES = {
  experienced_doctor:    "how experienced the doctor is",
  quick_diagnosis:       'how quick and accurate the diagnosis was',
  clean_hygienic:        'how clean and hygienic the clinic was',
  short_wait:            'the minimal waiting time',
  caring_staff:          'the caring and friendly staff',
  affordable:            'the fair and affordable consultation fees',
  clear_communication:   'how clearly everything was explained',
  good_followup:         'the thorough follow-up care',
  easy_appointment:      'how easy it was to book an appointment',
  modern_equipment:      'the modern diagnostic equipment',
  no_unnecessary_tests:  'not being sent for unnecessary tests',
  comfortable:           'how comfortable and calm the clinic environment was',
};

const RATING_OPTIONS = [
  { key: 'excellent', label: 'Excellent', emoji: '😍', stars: 5, desc: 'Loved everything!' },
  { key: 'good',      label: 'Good',      emoji: '😊', stars: 4, desc: 'Great experience' },
  { key: 'average',   label: 'Average',   emoji: '😐', stars: 3, desc: 'It was okay' },
];

const DURATION_OPTIONS = CONFIG.durationOptions;

const REVIEW_TYPES = [
  { key: 'short',    label: 'Short',    words: '30–50 words',   emoji: '⚡' },
  { key: 'medium',   label: 'Medium',   words: '70–100 words',  emoji: '✨' },
  { key: 'detailed', label: 'Detailed', words: '100–150 words', emoji: '📝' },
];

// ── Aspect sentence builder for manual mode (varied connectors) ──
const pickRandom = (a) => a[Math.floor(Math.random() * a.length)];

function buildAspectSentence(liked) {
  const phrases = liked.map((k) => LIKED_PHRASES[k]).filter(Boolean);
  if (!phrases.length) return '';
  const OPS = ['I especially appreciated ', 'I particularly valued ', 'What stood out most was ', 'I was genuinely impressed by ', 'A real highlight was '];
  const MOPS = ['What stood out was ', 'I particularly appreciated ', 'The highlights for me were ', 'I was most impressed by '];
  const op = pickRandom(OPS);
  if (phrases.length === 1) return `${op}${phrases[0]}. `;
  if (phrases.length === 2) return `${op}${phrases[0]} and ${phrases[1]}. `;
  const s = pickRandom(MOPS);
  return `${s}${phrases.slice(0, -1).join(', ')}, and ${phrases[phrases.length - 1]}. `;
}

// ── Manual review polisher, wraps the patient's own words with a proper
//    intro, the selected highlights, and a closing, instead of just fixing typos.
//    Always uses the clinic's actual sub-type (Dental Clinic, Skin Clinic, etc.)
//    rather than ever hardcoding a generic label. ──
function polishManualClinicReview(rawText, liked, shopName, subType, location) {
  let text = rawText.trim();
  if (!text) return '';

  // Fix doctor name: "dr xyz" / "dr. xyz" → "Dr. Xyz"
  text = text.replace(/\bdr\.?\s*([a-z])/gi, (_, first) => `Dr. ${first.toUpperCase()}`);

  // Fix standalone 'i' → 'I'
  text = text.replace(/\bi\b/g, 'I');
  text = text.replace(/\bi'm\b/gi, "I'm").replace(/\bi've\b/gi, "I've").replace(/\bi'll\b/gi, "I'll").replace(/\bi'd\b/gi, "I'd");

  // Capitalize after sentence-ending punctuation, and the very first character
  text = text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // Add period at end if missing
  if (!/[.!?]$/.test(text)) text += '.';

  // Light enhancement of common flat phrases
  text = text
    .replace(/\bis good\b/gi, 'is very good')
    .replace(/\bvery very\b/gi, 'very')
    .replace(/\bgood doctor\b/gi, 'highly skilled doctor')
    .replace(/\bgood staff\b/gi, 'very caring staff')
    .replace(/\bnice clinic\b/gi, 'well-maintained clinic')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const asp = buildAspectSentence(liked);
  const name = shopName || 'this clinic';
  const loc = location || 'Bengaluru';
  const kind = subType || 'clinic';

  const intros = [
    `I recently visited ${name}, a ${kind.toLowerCase()} in ${loc}, and wanted to share my experience.`,
    `Had a positive experience at ${name} in ${loc} and wanted to share it.`,
    `I visited ${name} recently and it was a genuinely good experience.`,
  ];
  const closings = [
    `I would highly recommend ${name} to anyone in ${loc} looking for a trusted ${kind.toLowerCase()}.`,
    `If you're looking for a reliable clinic in ${loc}, ${name} is a great choice.`,
    `${name} is genuinely one of the better clinics I've visited, highly recommend.`,
  ];

  return `${pickRandom(intros)} ${text} ${asp}${pickRandom(closings)}`;
}

function Stars({ count }) {
  return <span style={{ color: '#fbbf24', fontSize: 18 }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

const ANIM = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn    { 0%{opacity:0;transform:scale(0.88)} 70%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
  @keyframes celebrate{ 0%,100%{transform:scale(1) rotate(0)} 25%{transform:scale(1.4) rotate(-12deg)} 75%{transform:scale(1.4) rotate(12deg)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .anim-up  { animation: fadeInUp 0.45s ease-out both; }
  .anim-pop { animation: popIn 0.35s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-cel { animation: celebrate 0.7s ease-in-out; }
  @media(max-width:640px){
    .review-card { padding:20px !important; }
    .liked-grid  { grid-template-columns:1fr !important; }
    .type-row    { flex-direction:column !important; }
    .dur-grid    { grid-template-columns:1fr !important; }
  }
`;

export default function ClinicReviewPage({ params }) {
  const { shopId } = params;
  const [shop, setShop] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Flow state
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(null);
  const [liked, setLiked] = useState([]);
  const [duration, setDuration] = useState(null);
  const [mode, setMode] = useState(null); // 'auto' | 'manual'
  const [reviewType, setReviewType] = useState('medium');
  const [loading, setLoading] = useState(false);

  // Auto mode
  const [generatedReview, setGeneratedReview] = useState('');
  const [variant, setVariant] = useState(0);

  // Manual mode
  const [manualText, setManualText] = useState('');
  const [polishedReview, setPolishedReview] = useState('');
  const [polishing, setPolishing] = useState(false);

  const [copied, setCopied] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('businesses').select('*').eq('id', shopId).single();
      if (error || !data) { setNotFound(true); return; }
      setShop(data);
      await supabase.from('businesses').update({ scans: (data.scans || 0) + 1 }).eq('id', shopId);
    })();
  }, [shopId]);

  const toggleLiked = (key) =>
    setLiked((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const googleUrl =
    shop?.google_profile_url ||
    `https://www.google.com/search?q=${encodeURIComponent((shop?.shop_name || '') + ' ' + (shop?.location || '') + ' reviews')}`;

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const { data: fresh } = await supabase.from('businesses').select('reviews_generated').eq('id', shopId).single();
    const currentVariant = fresh?.reviews_generated || shop?.reviews_generated || 0;

    const result = generateShopReview({
      shopName: shop?.shop_name || 'This clinic',
      ownerName: shop?.owner_name || '',
      businessType: 'clinic',
      subType: shop?.sub_type || '',
      location: shop?.location || '',
      rating, liked, duration,
      variant: currentVariant,
    });

    setGeneratedReview(result.reviews.english[reviewType]);
    setVariant(currentVariant + 1);
    setLoading(false);
    setStep(4);
    await supabase.from('businesses').update({ reviews_generated: currentVariant + 1 }).eq('id', shopId);
  };

  const handlePolish = async () => {
    if (!manualText.trim()) return;
    setPolishing(true);
    await new Promise((r) => setTimeout(r, 700));
    const polished = polishManualClinicReview(manualText, liked, shop?.shop_name, shop?.sub_type, shop?.location);
    setPolishedReview(polished);
    setPolishing(false);
    setStep(4);
    const { data: fresh } = await supabase.from('businesses').select('reviews_generated').eq('id', shopId).single();
    await supabase.from('businesses').update({ reviews_generated: (fresh?.reviews_generated || 0) + 1 }).eq('id', shopId);
  };

  const activeReview = mode === 'manual' ? polishedReview : generatedReview;

  const copyAndOpen = async () => {
    await navigator.clipboard.writeText(activeReview);
    setCopied('copied');
    setTimeout(() => { window.open(googleUrl, '_blank'); setCopied(''); }, 600);
  };

  const regenerate = () => {
    if (mode === 'manual') {
      setPolishedReview(polishManualClinicReview(manualText, liked, shop?.shop_name, shop?.sub_type, shop?.location));
    } else {
      const result = generateShopReview({
        shopName: shop?.shop_name || 'This clinic',
        ownerName: shop?.owner_name || '',
        businessType: 'clinic',
        subType: shop?.sub_type || '',
        location: shop?.location || '',
        rating, liked, duration,
        variant,
      });
      setGeneratedReview(result.reviews.english[reviewType]);
      setVariant((v) => v + 1);
    }
  };

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdfa' }}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🩺</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>Clinic not found</h2>
        <p style={{ color: '#6b7280', marginTop: 8 }}>Please check the link and try again.</p>
      </div>
    </div>
  );

  if (!shop) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdfa' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #99f6e4', borderTopColor: THEME.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{ANIM}</style>
    </div>
  );

  const ratingObj = RATING_OPTIONS.find((r) => r.key === rating);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0fdfa 0%,#e6fffa 50%,#f0fdf4 100%)', padding: '0 0 80px', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <style>{ANIM}</style>

      {/* Header */}
      <div style={{ background: THEME.gradient, padding: '0 20px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 0 32px', textAlign: 'center' }}>
          {shop.photo_url ? (
            <img src={shop.photo_url} alt={shop.shop_name}
              style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.6)', marginBottom: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} />
          ) : (
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.6)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <span style={{ fontSize: 34 }}>🩺</span>
            </div>
          )}
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.2 }}>{shop.shop_name}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: 600, maxWidth: '100%' }}>
            <span style={{ color: '#4ade80', flexShrink: 0 }}>●</span>
            <span style={{ minWidth: 0, overflowWrap: 'break-word' }}>{shop.sub_type ? `${shop.sub_type} · ` : ''}{shop.location}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#ccfbf1' }}>
        <div style={{ height: 4, background: THEME.gradient, width: `${(step / 4) * 100}%`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px 0' }}>

        {/* ══ STEP 1: Rating ══ */}
        {step === 1 && (
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(13,148,136,0.1)', border: '1px solid #ccfbf1' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⭐</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>How was your visit?</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>Your feedback helps other patients find good care.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {RATING_OPTIONS.map((r) => (
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

        {/* ══ STEP 2: What did you like ══ */}
        {step === 2 && (
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(13,148,136,0.1)', border: '1px solid #ccfbf1' }}>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: THEME.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0 }}>← Back</button>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💙</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>What did you like?</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>Select all that apply, makes your review more helpful.</p>
            </div>
            <div className="liked-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {LIKED_OPTIONS.map((opt) => {
                const sel = liked.includes(opt.key);
                return (
                  <button key={opt.key} onClick={() => toggleLiked(opt.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 14, border: `2px solid ${sel ? THEME.primary : '#e2e8f0'}`, background: sel ? THEME.light : '#fafafa', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? THEME.dark : '#374151' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{opt.emoji}</span>
                    <span style={{ minWidth: 0, flex: 1, overflowWrap: 'break-word' }}>{opt.label}</span>
                    {sel && <span style={{ flexShrink: 0, color: THEME.primary, fontSize: 14 }}>✓</span>}
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
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(13,148,136,0.1)', border: '1px solid #ccfbf1' }}>
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
                    style={{ padding: '20px 22px', borderRadius: 18, border: '2px solid #ccfbf1', background: THEME.light, cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✨</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16 }}>Auto-Generate Review</div>
                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>AI writes a perfect, SEO-optimised review for you in seconds.</div>
                  </button>
                  <button onClick={() => setMode('manual')}
                    style={{ padding: '20px 22px', borderRadius: 18, border: '2px solid #ccfbf1', background: '#fafafa', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✏️</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16 }}>Write My Own</div>
                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Type your experience in your own words, we'll fix the grammar and turn it into a full, well-formed review.</div>
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

                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>How long have you been visiting?</p>
                  <div className="dur-grid" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                    {DURATION_OPTIONS.map((opt) => {
                      const sel = duration === opt.key;
                      return (
                        <button key={opt.key} onClick={() => setDuration(opt.key)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, border: `2px solid ${sel ? THEME.primary : '#e2e8f0'}`, background: sel ? THEME.light : '#fafafa', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? THEME.dark : '#374151' }}>
                          <span>{opt.label}</span>
                          {sel && <span style={{ color: THEME.primary }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Review Length</p>
                  <div className="type-row" style={{ display: 'flex', gap: 10 }}>
                    {REVIEW_TYPES.map((t) => (
                      <button key={t.key} onClick={() => setReviewType(t.key)}
                        style={{ flex: 1, padding: '12px 8px', borderRadius: 14, border: `2px solid ${reviewType === t.key ? THEME.primary : '#e2e8f0'}`, background: reviewType === t.key ? THEME.light : '#fafafa', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{t.emoji}</div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: reviewType === t.key ? THEME.dark : '#374151' }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{t.words}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleGenerate} disabled={loading || !duration}
                  style={{ width: '100%', padding: '16px', borderRadius: 14, background: THEME.gradient, color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: (loading || !duration) ? 'not-allowed' : 'pointer', opacity: (loading || !duration) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
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
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 6px', fontWeight: 600 }}>💡 TIP, Just write naturally, even if grammar isn't perfect.</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>e.g. "dr is good very caring" → we'll turn it into a full review using what you liked in step 2.</p>
                </div>

                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Write your experience here... (doctor's name, what was good, how you felt)"
                  style={{ width: '100%', minHeight: 130, padding: '14px 16px', borderRadius: 14, border: '2px solid #e2e8f0', fontSize: 14, lineHeight: 1.6, color: '#0f172a', background: '#fff', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
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

            <div className="review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(13,148,136,0.12)', border: '1px solid #ccfbf1', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: THEME.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                  {(shop.shop_name || 'C')[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>Your Review</p>
                  <Stars count={ratingObj?.stars || 5} />
                </div>
              </div>
              <p style={{ color: '#374151', lineHeight: 1.75, fontSize: 15, margin: 0 }}>{activeReview}</p>
            </div>

            <button onClick={copyAndOpen}
              style={{ width: '100%', padding: '16px', borderRadius: 14, background: '#16a34a', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
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
