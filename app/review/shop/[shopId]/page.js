'use client';

import { useState, useEffect } from 'react';
import { generateShopReview, CATEGORY_CONFIG } from '@/lib/shopReviewGenerator';
import { supabase } from '@/lib/supabase';

const RATING_OPTIONS = [
  { key: 'excellent', label: 'Excellent', emoji: '😍', stars: 5 },
  { key: 'good',      label: 'Good',      emoji: '😊', stars: 4 },
  { key: 'average',   label: 'Average',   emoji: '😐', stars: 3 },
];

const LANG_TABS = [
  { key: 'english', label: 'English',         flag: '🇬🇧' },
  { key: 'kannada', label: 'Kannada (Roman)',  flag: '🌟' },
];

const REVIEW_TYPES = [
  { key: 'short',    label: 'Short',    words: '30–50 words',   color: 'border-teal-200 bg-teal-50',     badge: 'bg-teal-100 text-teal-700' },
  { key: 'medium',   label: 'Medium',   words: '70–100 words',  color: 'border-blue-200 bg-blue-50',     badge: 'bg-blue-100 text-blue-700' },
  { key: 'detailed', label: 'Detailed', words: '100–150 words', color: 'border-indigo-200 bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700' },
];

function Stars({ count }) {
  return <span className="text-yellow-400">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            n < current ? 'step-done' : n === current ? 'step-active' : 'step-pending'}`}>
            {n < current ? '✓' : n}
          </div>
          {n < 3 && <div className={`w-12 h-0.5 ${n < current ? 'bg-teal-400' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
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
    websiteUrl: row.website_url || '',
    stats: {
      scans: row.scans || 0,
      reviewsGenerated: row.reviews_generated || 0,
      reviewsSubmitted: row.reviews_submitted || 0,
    },
  };
}

export default function ShopReviewPage({ params }) {
  const { shopId } = params;
  const [shop, setShop] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [config, setConfig] = useState(null);

  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(null);
  const [liked, setLiked] = useState([]);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);

  const [reviews, setReviews] = useState(null);
  const [scores, setScores] = useState(null);
  const [reviewVariant, setReviewVariant] = useState(0);
  const [activeLang, setActiveLang] = useState('english');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', shopId)
        .single();
      if (error || !data) { setNotFound(true); return; }
      const shopData = dbToShop(data);
      setShop(shopData);
      setConfig(CATEGORY_CONFIG[shopData.businessType]);
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
        // Re-fetch latest reviews_generated so the variant is always current
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
          rating,
          liked,
          duration,
          variant: currentVariant, // ← seeds the template engine
        });
        setReviews(result.reviews);
        setScores(result.scores);
        setReviewVariant(currentVariant + 1); // what this review counts as

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-sm w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Shop Not Found</h2>
        <p className="text-gray-500 text-sm">This QR code may be expired or the shop has been removed.</p>
      </div>
    </div>
  );

  if (!shop || !config) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 text-lg">Loading...</div>
    </div>
  );

  // ── Results screen ──
  if (reviews) {
    const langReviews = reviews[activeLang] || reviews.english;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">✨</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Reviews Are Ready!</h1>
            <p className="text-gray-500 text-sm">Pick a language → choose a review → copy it → it opens Google automatically.</p>
            {reviewVariant > 0 && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-xs text-indigo-700 font-medium">
                🔄 Unique review #{reviewVariant} generated for {shop.shopName}
              </div>
            )}
          </div>

          {scores && (
            <div className="card mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">AI Quality Scores</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Authenticity', val: scores.authenticity },
                  { label: 'Human-Like', val: scores.humanLikeness },
                  { label: 'Uniqueness', val: scores.uniqueness },
                  { label: 'Google Safe', val: scores.googleSafe },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                    <div className={`text-xl font-extrabold ${s.val >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>{s.val}%</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-5 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            {LANG_TABS.map((lt) => (
              <button
                key={lt.key}
                onClick={() => setActiveLang(lt.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeLang === lt.key ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span>{lt.flag}</span>
                <span>{lt.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4 mb-5">
            {REVIEW_TYPES.map((rt) => {
              const text = langReviews[rt.key];
              const wc = text?.trim().split(/\s+/).length || 0;
              const isCopied = copied === `${activeLang}-${rt.key}`;
              return (
                <div key={rt.key} className={`card border ${rt.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${rt.badge} text-xs`}>{rt.label}</span>
                      <span className="text-xs text-gray-400">{wc} words</span>
                    </div>
                    <Stars count={RATING_OPTIONS.find((r) => r.key === rating)?.stars || 5} />
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">"{text}"</p>
                  <button
                    onClick={() => copyAndOpen(`${activeLang}-${rt.key}`, text)}
                    className={`w-full btn-primary text-sm py-3 ${isCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                  >
                    {isCopied ? '✓ Copied! Opening Google...' : '📋 Copy & Open Google Reviews'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="card bg-amber-50 border border-amber-200 mb-4">
            <h4 className="font-semibold text-amber-800 mb-2">📋 How to post your review</h4>
            <ol className="text-sm text-amber-700 space-y-1.5 list-decimal list-inside">
              <li>Tap the button above — review copies to clipboard</li>
              <li>Google opens automatically in a new tab</li>
              <li>Click "Write a review", paste your review, give 5 stars</li>
              <li>Hit Submit — done! 🎉</li>
            </ol>
          </div>

          <button onClick={resetForm} className="w-full btn-secondary text-sm">
            ← Start Over
          </button>
        </div>
      </div>
    );
  }

  // ── Shop header ──
  const ShopHeader = () => (
    <div className="card text-center mb-6">
      <div className="text-3xl mb-2">{config.icon}</div>
      <h2 className="text-xl font-bold text-gray-900">{shop.shopName}</h2>
      <p className="text-gray-500 text-sm">{config.label} · {shop.location}</p>
      {shop.subType && <p className="text-xs text-gray-400 mt-1">{shop.subType}</p>}
    </div>
  );

  const accentColor = {
    clothes: 'border-pink-500 bg-pink-50 text-pink-800',
    pharmacy: 'border-green-500 bg-green-50 text-green-800',
    jewellery: 'border-yellow-500 bg-yellow-50 text-yellow-800',
    shoes: 'border-orange-500 bg-orange-50 text-orange-800',
    'car-service': 'border-blue-500 bg-blue-50 text-blue-800',
    barber: 'border-purple-500 bg-purple-50 text-purple-800',
  }[shop.businessType] || 'border-blue-500 bg-blue-50 text-blue-800';

  const btnColor = {
    clothes: 'bg-pink-600 hover:bg-pink-700',
    pharmacy: 'bg-green-600 hover:bg-green-700',
    jewellery: 'bg-yellow-600 hover:bg-yellow-700',
    shoes: 'bg-orange-600 hover:bg-orange-700',
    'car-service': 'bg-blue-600 hover:bg-blue-700',
    barber: 'bg-purple-600 hover:bg-purple-700',
  }[shop.businessType] || 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        <ShopHeader />
        <StepIndicator current={step} />

        {/* Step 1: Rating */}
        {step === 1 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">How was your experience?</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Your overall impression</p>
            <div className="space-y-3">
              {RATING_OPTIONS.map((opt) => (
                <button key={opt.key}
                  onClick={() => { setRating(opt.key); setStep(2); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left hover:shadow-sm ${
                    rating === opt.key ? `${accentColor} border-opacity-80` : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                  <span className="text-3xl">{opt.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{opt.label}</div>
                    <Stars count={opt.stars} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: What did you like */}
        {step === 2 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">What did you like most?</h2>
            <p className="text-gray-400 text-sm text-center mb-5">Select all that apply</p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {config.likedOptions.map((opt) => (
                <button key={opt.key}
                  onClick={() => toggleLiked(opt.key)}
                  className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all text-left text-sm ${
                    liked.includes(opt.key)
                      ? `border-purple-500 bg-purple-50 text-purple-800 font-semibold`
                      : 'border-gray-100 bg-white text-gray-700 hover:border-purple-200'}`}>
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mb-4">
              {liked.length === 0 ? 'Select at least one option' : `${liked.length} selected`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
              <button onClick={() => setStep(3)} disabled={liked.length === 0}
                className={`flex-1 text-sm font-semibold py-3 px-4 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${btnColor}`}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Duration */}
        {step === 3 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">How long have you been a customer?</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Helps personalise your review</p>
            <div className="space-y-3 mb-6">
              {config.durationOptions.map((opt) => (
                <button key={opt.key}
                  onClick={() => setDuration(opt.key)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-medium ${
                    duration === opt.key
                      ? `${accentColor} border-opacity-80`
                      : 'border-gray-100 bg-white text-gray-700 hover:border-gray-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
              <button onClick={generate} disabled={!duration || loading}
                className={`flex-1 text-sm font-semibold py-3 px-4 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${btnColor}`}>
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
