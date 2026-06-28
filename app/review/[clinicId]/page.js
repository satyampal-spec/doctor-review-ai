'use client';

import { useState, useEffect } from 'react';
import { generateReview } from '@/lib/reviewGenerator';
import { supabase, dbToClinic } from '@/lib/supabase';

const LIKED_OPTIONS = [
  { key: 'behavior',   label: "Doctor's behavior",        emoji: '😊' },
  { key: 'diagnosis',  label: 'Accurate diagnosis',        emoji: '🎯' },
  { key: 'recovery',   label: 'Fast recovery',             emoji: '💪' },
  { key: 'explanation',label: 'Clear explanation',         emoji: '💬' },
  { key: 'staff',      label: 'Friendly staff',            emoji: '👥' },
  { key: 'clinic',     label: 'Clean clinic',              emoji: '✨' },
  { key: 'waiting',    label: 'Low waiting time',          emoji: '⏱' },
  { key: 'emergency',  label: 'Emergency support',         emoji: '🚨' },
  { key: 'no_tests',   label: 'No unnecessary tests',      emoji: '🚫' },
  { key: 'affordable', label: 'Affordable fees',           emoji: '💰' },
  { key: 'medicines',  label: 'Explained medicines',       emoji: '💊' },
  { key: 'followup',   label: 'Good follow-up support',    emoji: '📞' },
  { key: 'elderly',    label: 'Great with elderly/kids',   emoji: '👴' },
];

const DURATION_OPTIONS = [
  { key: 'first',  label: 'First visit ever' },
  { key: 'months', label: 'A few months' },
  { key: 'year',   label: '1+ year' },
  { key: 'family', label: 'Family doctor (years)' },
];

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
  { key: 'short',    label: 'Short',    words: '30–50 words',   color: 'border-teal-200 bg-teal-50',    badge: 'bg-teal-100 text-teal-700' },
  { key: 'medium',   label: 'Medium',   words: '70–100 words',  color: 'border-blue-200 bg-blue-50',    badge: 'bg-blue-100 text-blue-700' },
  { key: 'detailed', label: 'Detailed', words: '100–150 words', color: 'border-indigo-200 bg-indigo-50',badge: 'bg-indigo-100 text-indigo-700' },
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

export default function ReviewPage({ params }) {
  const { clinicId } = params;
  const [clinic, setClinic] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(null);
  const [liked, setLiked] = useState([]);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);

  const [reviews, setReviews] = useState(null);
  const [scores, setScores] = useState(null);
  const [activeLang, setActiveLang] = useState('english');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('clinics').select('*').eq('id', clinicId).single();
      if (error || !data) { setNotFound(true); return; }
      setClinic(dbToClinic(data));
      await supabase.from('clinics').update({ scans: (data.scans || 0) + 1 }).eq('id', clinicId);
    }
    load();
  }, [clinicId]);

  const toggleLiked = (key) =>
    setLiked((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const generate = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const result = generateReview({
          doctorName: clinic.doctorName,
          clinicName: clinic.clinicName,
          specialization: clinic.specialization,
          location: clinic.location,
          rating,
          liked,
          duration,
        });
        setReviews(result.reviews);
        setScores(result.scores);
        supabase.from('clinics').update({ reviews_generated: (clinic?.stats?.reviewsGenerated || 0) + 1 }).eq('id', clinicId);
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

    // Track submission
    supabase.from('clinics').update({ reviews_submitted: (clinic?.stats?.reviewsSubmitted || 0) + 1 }).eq('id', clinicId);

    // Auto-open Google Business page
    const googleUrl = clinic?.googleProfileUrl || `https://www.google.com/search?q=${encodeURIComponent((clinic?.doctorName || '') + ' ' + (clinic?.clinicName || '') + ' ' + (clinic?.location || ''))}`;
    setTimeout(() => window.open(googleUrl, '_blank'), 400);
  };

  const resetForm = () => {
    setReviews(null); setStep(1); setRating(null); setLiked([]); setDuration(null); setCopied('');
  };

  // ── Not found ────────────────────────────────────────────────
  if (notFound) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-sm w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Clinic Not Found</h2>
        <p className="text-gray-500 text-sm">This QR code may be expired or the clinic has been removed.</p>
      </div>
    </div>
  );

  if (!clinic) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 text-lg">Loading...</div>
    </div>
  );

  // ── Results screen ───────────────────────────────────────────
  if (reviews) {
    const langReviews = reviews[activeLang] || reviews.english;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-2xl mx-auto px-4 py-10">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">✨</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Reviews Are Ready!</h1>
            <p className="text-gray-500 text-sm">Pick a language → choose a review → copy it → it opens Google automatically.</p>
          </div>

          {/* AI Quality Scores */}
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

          {/* Language Tabs */}
          <div className="flex gap-2 mb-5 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            {LANG_TABS.map((lt) => (
              <button
                key={lt.key}
                onClick={() => setActiveLang(lt.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeLang === lt.key
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span>{lt.flag}</span>
                <span>{lt.label}</span>
              </button>
            ))}
          </div>

          {/* Review Cards */}
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
                    className={`w-full btn-primary text-sm py-3 ${isCopied ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {isCopied ? '✓ Copied! Opening Google...' : '📋 Copy & Open Google Reviews'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Instruction box */}
          <div className="card bg-amber-50 border border-amber-200 mb-4">
            <h4 className="font-semibold text-amber-800 mb-2">📋 What happens when you tap Copy</h4>
            <ol className="text-sm text-amber-700 space-y-1.5 list-decimal list-inside">
              <li>The review is copied to your clipboard</li>
              <li>Google opens automatically in a new tab</li>
              <li>Click "Write a review", paste your review, select 5 stars</li>
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

  // ── Clinic branding header ───────────────────────────────────
  const ClinicHeader = () => (
    <div className="card text-center mb-6">
      <div className="text-3xl mb-2">🏥</div>
      <h2 className="text-xl font-bold text-gray-900">{clinic.doctorName}</h2>
      <p className="text-gray-500 text-sm">{clinic.clinicName} · {clinic.specialization} · {clinic.location}</p>
      {clinic.experience && <p className="text-xs text-gray-400 mt-1">{clinic.experience} years of experience</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        <ClinicHeader />
        <StepIndicator current={step} />

        {/* ── Step 1: Rating ── */}
        {step === 1 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">How was your experience?</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Your overall impression of the visit</p>
            <div className="space-y-3">
              {RATING_OPTIONS.map((opt) => (
                <button key={opt.key}
                  onClick={() => { setRating(opt.key); setStep(2); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left hover:shadow-sm ${
                    rating === opt.key ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
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

        {/* ── Step 2: What did you like ── */}
        {step === 2 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">What did you like most?</h2>
            <p className="text-gray-400 text-sm text-center mb-5">Select all that apply — the more you select, the better your review</p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {LIKED_OPTIONS.map((opt) => (
                <button key={opt.key}
                  onClick={() => toggleLiked(opt.key)}
                  className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all text-left text-sm ${
                    liked.includes(opt.key)
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold'
                      : 'border-gray-100 bg-white text-gray-700 hover:border-blue-200'}`}>
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
                className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Duration ── */}
        {step === 3 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">How long have you been consulting?</h2>
            <p className="text-gray-400 text-sm text-center mb-6">Helps personalise your review</p>
            <div className="space-y-3 mb-6">
              {DURATION_OPTIONS.map((opt) => (
                <button key={opt.key}
                  onClick={() => setDuration(opt.key)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-medium ${
                    duration === opt.key
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-100 bg-white text-gray-700 hover:border-blue-200'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
              <button onClick={generate} disabled={!duration || loading}
                className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed">
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
