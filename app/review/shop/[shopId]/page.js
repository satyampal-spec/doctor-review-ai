'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateShopReview, CATEGORY_CONFIG } from '@/lib/shopReviewGenerator';
import { supabase } from '@/lib/supabase';

const RATING_OPTIONS = [
  { key: 'excellent', label: 'Excellent', emoji: '😍', stars: 5, desc: 'Loved everything!' },
  { key: 'good',      label: 'Good',      emoji: '😊', stars: 4, desc: 'Had a great experience' },
  { key: 'average',   label: 'Average',   emoji: '😐', stars: 3, desc: 'It was okay' },
];

const LANG_TABS = [
  { key: 'english', label: 'English',        flag: '🇬🇧' },
  { key: 'kannada', label: 'Kannada (Roman)', flag: '🌟' },
];

const REVIEW_TYPES = [
  { key: 'short',    label: 'Short',    words: '30–50 words',   emoji: '⚡' },
  { key: 'medium',   label: 'Medium',   words: '70–100 words',  emoji: '✨' },
  { key: 'detailed', label: 'Detailed', words: '100–150 words', emoji: '📝' },
];

const THEMES = {
  clothes:       { primary: '#db2777', gradient: 'linear-gradient(135deg,#db2777 0%,#be185d 100%)', light: '#fdf2f8', ring: '#f9a8d4' },
  pharmacy:      { primary: '#16a34a', gradient: 'linear-gradient(135deg,#16a34a 0%,#15803d 100%)', light: '#f0fdf4', ring: '#86efac' },
  jewellery:     { primary: '#d97706', gradient: 'linear-gradient(135deg,#d97706 0%,#b45309 100%)', light: '#fffbeb', ring: '#fcd34d' },
  shoes:         { primary: '#ea580c', gradient: 'linear-gradient(135deg,#ea580c 0%,#c2410c 100%)', light: '#fff7ed', ring: '#fdba74' },
  'car-service': { primary: '#2563eb', gradient: 'linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)', light: '#eff6ff', ring: '#93c5fd' },
  barber:        { primary: '#9333ea', gradient: 'linear-gradient(135deg,#9333ea 0%,#7c3aed 100%)', light: '#faf5ff', ring: '#d8b4fe' },
  restaurant:    { primary: '#dc2626', gradient: 'linear-gradient(135deg,#dc2626 0%,#b91c1c 100%)', light: '#fef2f2', ring: '#fca5a5' },
};

const DEFAULT_THEME = THEMES['barber'];

function Stars({ count }) {
  return <span className="text-yellow-400 text-lg">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

function dbToShop(row) {
  return {
    id: row.id,
    shopName: row.shop_name,
    ownerName: row.owner_name || '',
    businessType: row.business_type,
    subType: row.sub_type || '',
    location: row.location,
    googleProfileUrl: row.google_profile_url || '',
    photoUrl: row.photo_url || '',
    stats: {
      scans: row.scans || 0,
      reviewsGenerated: row.reviews_generated || 0,
      reviewsSubmitted: row.reviews_submitted || 0,
    },
  };
}

const ANIM_CSS = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(28px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.88); }
    70%  { transform: scale(1.04); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes celebrate {
    0%,100% { transform: scale(1) rotate(0deg); }
    25%      { transform: scale(1.4) rotate(-12deg); }
    75%      { transform: scale(1.4) rotate(12deg); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 var(--ring-color); }
    70%  { box-shadow: 0 0 0 10px transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }
  .anim-fadeInUp    { animation: fadeInUp 0.45s ease-out both; }
  .anim-slideInRight{ animation: slideInRight 0.4s ease-out both; }
  .anim-popIn       { animation: popIn 0.35s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-celebrate   { animation: celebrate 0.7s ease-in-out; }
`;

export default function ShopReviewPage({ params }) {
  const { shopId } = params;
  const router = useRouter();
  const [shop, setShop]       = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [config, setConfig]   = useState(null);
  const [theme, setTheme]     = useState(DEFAULT_THEME);

  const [step, setStep]       = useState(1);
  const [rating, setRating]   = useState(null);
  const [liked, setLiked]     = useState([]);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);

  const [reviews, setReviews] = useState(null);
  const [scores, setScores]   = useState(null);
  const [reviewVariant, setReviewVariant] = useState(0);
  const [activeLang, setActiveLang] = useState('english');
  const [copied, setCopied]   = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', shopId)
        .single();
      if (error || !data) { setNotFound(true); return; }
      // Hospitals have their own dedicated review page
      if (data.business_type === 'hospital') {
        router.replace(`/review/hospital/${shopId}`);
        return;
      }
      const shopData = dbToShop(data);
      setShop(shopData);
      setConfig(CATEGORY_CONFIG[shopData.businessType]);
      setTheme(THEMES[shopData.businessType] || DEFAULT_THEME);
      await supabase
        .from('businesses')
        .update({ scans: (data.scans || 0) + 1 })
        .eq('id', shopId);
    }
    load();
  }, [shopId]);

  const toggleLiked = (key) =>
    setLiked((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const generate = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const { data: fresh } = await supabase
          .from('businesses')
          .select('reviews_generated')
          .eq('id', shopId)
          .single();
        const currentVariant = fresh?.reviews_generated || shop.stats.reviewsGenerated || 0;

        const result = generateShopReview({
          shopName: shop.shopName,
          ownerName: shop.ownerName,
          businessType: shop.businessType,
          subType: shop.subType,
          location: shop.location,
          rating, liked, duration,
          variant: currentVariant,
        });
        setReviews(result.reviews);
        setScores(result.scores);
        setReviewVariant(currentVariant + 1);

        await supabase
          .from('businesses')
          .update({ reviews_generated: currentVariant + 1 })
          .eq('id', shopId);
      } catch {
        alert('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 900);
  };

  const copyAndOpen = (type, text) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 3000);
    supabase
      .from('businesses')
      .update({ reviews_submitted: (shop.stats.reviewsSubmitted || 0) + 1 })
      .eq('id', shopId);
    const googleUrl =
      shop.googleProfileUrl ||
      `https://www.google.com/search?q=${encodeURIComponent((shop.shopName || '') + ' ' + (shop.location || '') + ' review')}`;
    setTimeout(() => window.open(googleUrl, '_blank'), 400);
  };

  const resetForm = () => {
    setReviews(null); setStep(1); setRating(null); setLiked([]); setDuration(null); setCopied('');
  };

  // ── Not found ──
  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#f8fafc 0%,#e0e7ff 100%)' }}>
      <style>{ANIM_CSS}</style>
      <div className="anim-popIn bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-white/70">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Shop Not Found</h2>
        <p className="text-gray-500 text-sm">This QR code may be expired or the shop has been removed.</p>
      </div>
    </div>
  );

  if (!shop || !config) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#f8fafc 0%,#e0e7ff 100%)' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );

  // ── Hero ──
  const Hero = () => (
    <div className="relative overflow-hidden rounded-3xl mb-6 shadow-2xl" style={{ minHeight: 200 }}>
      {shop.photoUrl ? (
        <>
          <img src={shop.photoUrl} alt={shop.shopName} className="w-full h-52 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        </>
      ) : (
        <div className="h-52 w-full relative overflow-hidden" style={{ background: theme.gradient }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-5 right-6 text-7xl opacity-20">{config.icon}</div>
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <div className="flex items-end gap-3">
          <span className="text-5xl drop-shadow-lg">{config.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.35)' }}>
                <span style={{ color: '#4ade80' }}>✓</span> Verified Business
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white leading-tight drop-shadow-md">{shop.shopName}</h1>
            <p className="text-white/75 text-sm mt-0.5 truncate">{config.label} · {shop.location}</p>
            {shop.subType && <p className="text-white/55 text-xs mt-0.5">{shop.subType}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step Progress Bar ──
  const StepBar = () => {
    const steps = [{ n: 1, label: 'Rate' }, { n: 2, label: 'Liked' }, { n: 3, label: 'Duration' }];
    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-400"
                style={s.n < step
                  ? { background: theme.gradient, color: '#fff', boxShadow: `0 0 0 3px ${theme.ring}` }
                  : s.n === step
                  ? { background: theme.gradient, color: '#fff', boxShadow: `0 0 0 4px ${theme.ring}, 0 0 18px ${theme.ring}80` }
                  : { background: '#f1f5f9', color: '#94a3b8' }
                }>
                {s.n < step ? '✓' : s.n}
              </div>
              <span className="text-xs font-semibold"
                style={{ color: s.n <= step ? theme.primary : '#94a3b8' }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-16 h-1 mx-2 mb-5 rounded-full transition-all duration-500 overflow-hidden"
                style={{ background: '#e2e8f0' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: step > s.n ? '100%' : '0%', background: theme.gradient }} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const glassCard = {
    backdropFilter: 'blur(24px)',
    background: 'rgba(255,255,255,0.88)',
    borderRadius: 24,
    padding: 24,
    border: '1px solid rgba(255,255,255,0.75)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.09)',
  };

  // ── Results Screen ──
  if (reviews) {
    const langReviews = reviews[activeLang] || reviews.english;
    return (
      <div className="min-h-screen pb-10"
        style={{ background: `linear-gradient(160deg,${theme.light} 0%,#f8fafc 45%,#f0f4ff 100%)` }}>
        <style>{ANIM_CSS}</style>
        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* Celebration */}
          <div className="text-center mb-7 anim-fadeInUp">
            <div className="text-6xl mb-3 inline-block anim-celebrate">🎉</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Your Reviews Are Ready!</h1>
            <p className="text-gray-500 text-sm mb-3">Pick language → choose a review → copy & paste on Google</p>
            {reviewVariant > 0 && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg"
                style={{ background: theme.gradient, boxShadow: `0 4px 18px ${theme.ring}` }}>
                🔄 Unique review #{reviewVariant} · {shop.shopName}
              </span>
            )}
          </div>

          {/* AI Scores */}
          {scores && (
            <div className="mb-5 anim-fadeInUp" style={{ animationDelay: '0.08s' }}>
              <div style={{ ...glassCard, padding: 16 }}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">AI Quality Scores</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Authentic', val: scores.authenticity },
                    { label: 'Human',     val: scores.humanLikeness },
                    { label: 'Unique',    val: scores.uniqueness },
                    { label: 'Safe',      val: scores.googleSafe },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl py-2.5 px-1" style={{ background: theme.light }}>
                      <div className="text-lg font-extrabold" style={{ color: theme.primary }}>{s.val}%</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Language tabs */}
          <div className="flex gap-2 mb-5 p-1.5 anim-fadeInUp" style={{ animationDelay: '0.12s', ...glassCard, padding: '6px' }}>
            {LANG_TABS.map((lt) => (
              <button key={lt.key} onClick={() => setActiveLang(lt.key)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={activeLang === lt.key
                  ? { background: theme.gradient, color: '#fff', boxShadow: `0 2px 12px ${theme.ring}` }
                  : { color: '#9ca3af' }}>
                <span>{lt.flag}</span><span>{lt.label}</span>
              </button>
            ))}
          </div>

          {/* Review cards */}
          <div className="space-y-4 mb-5">
            {REVIEW_TYPES.map((rt, i) => {
              const text = langReviews[rt.key];
              const wc = text?.trim().split(/\s+/).length || 0;
              const isCopied = copied === `${activeLang}-${rt.key}`;
              return (
                <div key={rt.key} className="anim-slideInRight" style={{ animationDelay: `${0.18 + i * 0.1}s` }}>
                  <div style={glassCard}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rt.emoji}</span>
                        <span className="font-bold text-gray-800">{rt.label}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{wc} words</span>
                      </div>
                      <Stars count={RATING_OPTIONS.find((r) => r.key === rating)?.stars || 5} />
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">"{text}"</p>
                    <button
                      onClick={() => copyAndOpen(`${activeLang}-${rt.key}`, text)}
                      className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
                      style={isCopied
                        ? { background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: '0 4px 16px #86efac80' }
                        : { background: theme.gradient, boxShadow: `0 4px 20px ${theme.ring}80` }}>
                      {isCopied ? '✓ Copied! Opening Google...' : '📋 Copy & Open Google Reviews'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="mb-4 p-4 rounded-2xl anim-fadeInUp" style={{ animationDelay: '0.5s', background: '#fffbeb', border: '1px solid #fcd34d' }}>
            <h4 className="font-bold text-amber-800 mb-2 text-sm">📋 How to post your review</h4>
            <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
              <li>Tap the Copy button — review copies to clipboard</li>
              <li>Google opens automatically in a new tab</li>
              <li>Click "Write a review", paste it, give 5 stars & submit</li>
            </ol>
          </div>

          <button onClick={resetForm}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-gray-600 bg-white/80 border-2 border-gray-100 hover:bg-white transition-all"
            style={{ backdropFilter: 'blur(12px)' }}>
            ← Start Over
          </button>
        </div>
      </div>
    );
  }

  // ── Main Form ──
  return (
    <div className="min-h-screen pb-10"
      style={{ background: `linear-gradient(160deg,${theme.light} 0%,#f8fafc 40%,#f0f4ff 100%)` }}>
      <style>{ANIM_CSS}</style>
      <div className="max-w-lg mx-auto px-4 pt-6">

        <Hero />
        <StepBar />

        {/* Step 1: Rating */}
        {step === 1 && (
          <div className="anim-popIn" style={glassCard}>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1 text-center">How was your experience?</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Tap to select your overall impression</p>
            <div className="space-y-3">
              {RATING_OPTIONS.map((opt) => (
                <button key={opt.key}
                  onClick={() => { setRating(opt.key); setStep(2); }}
                  className="w-full flex items-center gap-4 text-left transition-all duration-200 active:scale-95"
                  style={{
                    padding: '16px 20px',
                    borderRadius: 18,
                    border: rating === opt.key ? `2px solid ${theme.primary}` : '2px solid #f1f5f9',
                    background: rating === opt.key ? theme.light : '#ffffff',
                    boxShadow: rating === opt.key
                      ? `0 0 0 4px ${theme.ring}55, 0 4px 20px rgba(0,0,0,0.06)`
                      : '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.18s ease',
                  }}>
                  <span className="text-4xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                  </div>
                  <Stars count={opt.stars} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: What did you like */}
        {step === 2 && (
          <div className="anim-popIn" style={glassCard}>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1 text-center">What did you like most?</h2>
            <p className="text-gray-400 text-sm text-center mb-5">Select all that apply</p>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {config.likedOptions.map((opt) => {
                const sel = liked.includes(opt.key);
                return (
                  <button key={opt.key}
                    onClick={() => toggleLiked(opt.key)}
                    className="flex items-center gap-2 text-left transition-all duration-150 active:scale-95"
                    style={{
                      padding: '12px 14px',
                      borderRadius: 16,
                      border: sel ? `2px solid ${theme.primary}` : '2px solid #f1f5f9',
                      background: sel ? theme.gradient : '#ffffff',
                      boxShadow: sel ? `0 4px 16px ${theme.ring}60` : '0 1px 4px rgba(0,0,0,0.04)',
                    }}>
                    <span className="text-xl shrink-0">{opt.emoji}</span>
                    <span className={`text-sm font-semibold leading-tight flex-1 ${sel ? 'text-white' : 'text-gray-700'}`}>
                      {opt.label}
                    </span>
                    {sel && <span className="text-white text-xs font-bold shrink-0">✓</span>}
                  </button>
                );
              })}
            </div>
            <div className="text-center mb-4 min-h-[24px]">
              {liked.length === 0
                ? <span className="text-xs text-gray-400">Select at least one to continue</span>
                : <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white"
                    style={{ background: theme.gradient }}>
                    {liked.length} selected ✓
                  </span>
              }
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-white border-2 border-gray-100 transition-all hover:border-gray-200">
                ← Back
              </button>
              <button onClick={() => setStep(3)} disabled={liked.length === 0}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40"
                style={{
                  background: liked.length > 0 ? theme.gradient : '#e2e8f0',
                  boxShadow: liked.length > 0 ? `0 4px 16px ${theme.ring}80` : 'none',
                }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Duration */}
        {step === 3 && (
          <div className="anim-popIn" style={glassCard}>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1 text-center">How long have you been a customer?</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Helps personalise your review</p>
            <div className="space-y-2.5 mb-6">
              {config.durationOptions.map((opt) => {
                const sel = duration === opt.key;
                return (
                  <button key={opt.key}
                    onClick={() => setDuration(opt.key)}
                    className="w-full text-left transition-all duration-150 active:scale-95"
                    style={{
                      padding: '15px 20px',
                      borderRadius: 16,
                      border: sel ? `2px solid ${theme.primary}` : '2px solid #f1f5f9',
                      background: sel ? theme.gradient : '#ffffff',
                      boxShadow: sel ? `0 4px 16px ${theme.ring}60` : '0 1px 4px rgba(0,0,0,0.04)',
                      color: sel ? '#ffffff' : '#374151',
                      fontWeight: sel ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <span>{opt.label}</span>
                    {sel && <span className="text-white font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-white border-2 border-gray-100 transition-all hover:border-gray-200">
                ← Back
              </button>
              <button onClick={generate} disabled={!duration || loading}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40"
                style={{
                  background: duration && !loading ? theme.gradient : '#e2e8f0',
                  boxShadow: duration && !loading ? `0 4px 20px ${theme.ring}` : 'none',
                }}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Generating...
                  </span>
                ) : '✨ Generate My Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
