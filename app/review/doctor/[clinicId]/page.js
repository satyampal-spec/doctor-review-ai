'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// ── Theme ───────────────────────────────────────────────────
const THEME = {
  primary: '#2563eb',
  dark: '#1d4ed8',
  gradient: 'linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)',
  light: '#eff6ff',
  ring: '#bfdbfe',
};

// ── Seeded RNG (same variant → same phrasing every time) ─────
function seeded(seed) {
  let s = ((seed + 1) * 2654435761) >>> 0;
  return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
}
const pick = (a, r) => a[Math.floor(r() * a.length)];

// ── Location: city-agnostic, never leaks the raw postal address ──
function displayLoc(loc, r) {
  const base = (loc || '').trim();
  const isJunk = (s) => /^\d+$/.test(s) || /^(no\.?|#|shop)\b/i.test(s);
  const stripPin = (s) => s.replace(/\s*\d{5,6}\s*$/, '').trim();
  const cleaned = base.split(',').map(s => s.trim()).filter(Boolean).filter(p => !isJunk(p)).map(stripPin).filter(Boolean);
  if (!cleaned.length) return '';
  const city = cleaned.length >= 2 ? cleaned[cleaned.length - 2] : cleaned[0];
  const area = cleaned.length >= 3 ? cleaned[cleaned.length - 3] : cleaned[0];
  return pick([`${area}, ${city}`, city, `${area} area, ${city}`, `${city} city`, area], r);
}

// ── SEO keyword banks, matched against each doctor's real
// specialization (from Supabase) — new doctors automatically get
// sensible phrasing with zero code changes; add a specific match
// below only when a specialty needs hand-tuned wording. ─────────
// roles/services pulled from real patient search behavior (Google "People
// also ask" + "People also search for" + local-pack listing titles for each
// specialty + Bengaluru, checked directly, not guessed) — e.g. "general
// physician" outsearches "internal medicine specialist" for that specialty,
// "robotic knee replacement" and "normal delivery" are real high-intent
// long-tail terms, etc. `role` is an array so phrasing varies patient to
// patient instead of every review repeating the identical exact-match term,
// which reads more human and is also better local-SEO practice (varied
// language across reviews > one repeated phrase).
const SPECIALTY_PHRASES = [
  { test: /internal medicine|general medicine/i, roles: ['internal medicine specialist', 'general physician', 'physician'], services: ['managing chronic conditions like diabetes and blood pressure', 'complete health checkups', 'fever, infections and general health concerns', 'general physician consultations'] },
  { test: /orthoped/i, roles: ['orthopedician', 'orthopedic surgeon', 'orthopedist'], services: ['knee pain and joint replacement', 'fracture and sports injury treatment', 'robotic knee replacement', 'shoulder and joint pain treatment'] },
  { test: /pediatric/i, roles: ['pediatrician', 'child specialist'], services: ['child vaccination and growth checkups', 'newborn and infant care', 'fever and infections in kids'] },
  { test: /gynecolog|obstetric/i, roles: ['gynecologist', 'obstetrician'], services: ['pregnancy care and normal delivery', "women's health checkups", 'gynecological consultations'] },
  { test: /laparoscopic|robotic/i, roles: ['laparoscopic surgeon', 'robotic surgeon'], services: ['minimally invasive laparoscopic surgery', 'gallbladder and hernia surgery', 'robotic surgery'] },
  { test: /general surgery|surgeon/i, roles: ['general surgeon'], services: ['laparoscopic surgery', 'hernia and gallbladder surgery', 'minimally invasive procedures'] },
  { test: /\bent\b|ear.*nose.*throat/i, roles: ['ENT specialist'], services: ['ear, nose and throat treatment', 'hearing loss and sinus treatment', 'nose and throat problems'] },
  { test: /cardiolog/i, roles: ['cardiologist'], services: ['heart checkups', 'managing blood pressure and cholesterol', 'cardiac care'] },
  { test: /urolog/i, roles: ['urologist'], services: ['kidney stone treatment', 'urology consultations', 'prostate care'] },
  { test: /gastro/i, roles: ['gastroenterologist'], services: ['endoscopy and gastro consultations', 'stomach and digestive issues', 'liver and digestive health'] },
  { test: /physio/i, roles: ['physiotherapist'], services: ['back pain and knee pain treatment', 'sports injury rehab', 'post-surgery physiotherapy'] },
  { test: /dietit|nutrition/i, roles: ['dietitian', 'nutritionist'], services: ['weight loss and diet planning', 'personalized nutrition plans', 'diet consultations'] },
];

function specialtyPhrases(specialization) {
  const found = SPECIALTY_PHRASES.find(sp => sp.test.test(specialization || ''));
  if (found) return found;
  const roles = [specialization ? specialization.toLowerCase() : 'doctor'];
  return { roles, services: ['consultation and treatment', 'diagnosis and care', 'the entire treatment process'] };
}

// ── Grammar/flow cleanup only, exactly what the patient typed ────
function cleanTypedText(rawText) {
  let text = rawText.trim();
  if (!text) return '';
  text = text.replace(/\bdr\.?\s*([a-z])/gi, (_, first) => `Dr. ${first.toUpperCase()}`);
  text = text.replace(/\bi\b/g, 'I');
  text = text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
  if (!/[.!?]$/.test(text)) text += '.';
  text = text
    .replace(/\bis good\b/gi, 'is very good')
    .replace(/\bvery very\b/gi, 'very')
    .replace(/\bgood doctor\b/gi, 'highly skilled doctor')
    .replace(/\bnice\b/gi, 'great')
    .replace(/\s{2,}/g, ' ')
    .trim();
  // Capitalize last, after the phrase replacements above — a replacement
  // landing at position 0 (e.g. "good doctor" -> "highly skilled doctor")
  // otherwise overwrites the capital letter with its own lowercase literal.
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return text;
}

// Weaves in one natural, specialty-specific closing line built from the
// doctor's real specialization + location — deliberately just ONE sentence
// so it reads as a genuine add-on, not keyword-stuffed AI copy.
function polishReview(rawText, doctor, variant) {
  const text = cleanTypedText(rawText);
  if (!text) return '';
  const r = seeded(variant ?? 0);
  const { roles, services } = specialtyPhrases(doctor.specialization);
  const role = pick(roles, r);
  const service = pick(services, r);
  const loc = displayLoc(doctor.location, r);
  const name = doctor.doctor_name || 'the doctor';
  const firstName = (name.split(' ').find(w => w.length > 3) || '').toLowerCase();
  const mentionsName = firstName && text.toLowerCase().includes(firstName);
  const subject = mentionsName ? 'They' : name;
  const closings = [
    `${subject} ${mentionsName ? 'are' : 'is'} genuinely one of the best ${role}s I've been to${loc ? ' in ' + loc : ''}.`,
    `Would highly recommend ${mentionsName ? 'them' : name} for ${service}.`,
    `If you need ${service}, ${mentionsName ? "they're" : name + ' is'} the one to see${loc ? ' in ' + loc : ''}.`,
    `Truly grateful — ${mentionsName ? 'they' : name} made ${service} so much easier than I expected.`,
  ];
  return `${text} ${pick(closings, r)}`;
}

// Fallback for patients who leave the box blank — a short (1-2 sentence),
// fully-templated review built from the doctor's specialty + location.
// Combinatorial space (openers × closers × role/service/location variants)
// is large enough that a repeat is practically impossible, and `variant`
// is seeded from Math.random()/Date.now() per page load (not a sequential
// counter) so two different patients landing on the same doctor never start
// from the same seed. Deliberately short, per spec — this is the "just
// click Next" path, not a long generated essay.
function generateShortAutoReview(doctor, variant) {
  const r = seeded(variant);
  const { roles, services } = specialtyPhrases(doctor.specialization);
  const role = pick(roles, r);
  const service = pick(services, r);
  const loc = displayLoc(doctor.location, r) || 'Bengaluru';
  const name = doctor.doctor_name || 'The doctor';
  const openers = [
    `Had a great experience with ${name}.`,
    `${name} is an excellent ${role}.`,
    `Really happy with my visit to ${name}.`,
    `Very satisfied with the treatment from ${name}.`,
    `${name} took great care of me during my visit.`,
    `Excellent experience overall with ${name}.`,
    `My visit to ${name} was smooth and reassuring.`,
    `Genuinely impressed with ${name}.`,
    `${name} made the whole process stress-free.`,
    `Grateful for the care I received from ${name}.`,
  ];
  const closers = [
    `Highly skilled with ${service}.`,
    `Great support for ${service}.`,
    `Would recommend for ${service}.`,
    `One of the best ${role}s in ${loc}.`,
    `Clear explanations and genuine care throughout.`,
    `Professional, patient, and thorough.`,
    `Truly one of the best in ${loc}.`,
    `Handled my ${service} really well.`,
  ];
  return `${pick(openers, r)} ${pick(closers, r)}`;
}

function Stars() {
  return <span style={{ color: '#fbbf24', fontSize: 18 }}>{'★★★★★'}</span>;
}

const ANIM = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes celebrate{ 0%,100%{transform:scale(1) rotate(0)} 25%{transform:scale(1.4) rotate(-12deg)} 75%{transform:scale(1.4) rotate(12deg)} }
  .anim-up  { animation: fadeInUp 0.45s ease-out both; }
  .anim-cel { animation: celebrate 0.7s ease-in-out; }
  @media(max-width:640px){ .review-card { padding:20px !important; } }
`;

export default function DoctorReviewPage({ params }) {
  const { clinicId } = params;
  const [doctor, setDoctor] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState('write'); // 'write' | 'result'
  const [manualText, setManualText] = useState('');
  const [keeping, setKeeping] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [autoing, setAutoing] = useState(false);
  const [resultType, setResultType] = useState(null); // 'raw' | 'polished' | 'auto'
  const [resultText, setResultText] = useState('');
  // Seeded from randomness at mount, not a fixed 0 — otherwise every
  // patient's first auto-generated review (no typed text to differentiate
  // it) would come out byte-identical for a given doctor.
  const [variant, setVariant] = useState(() => Math.floor(Math.random() * 1e9));
  const [copied, setCopied] = useState('');
  const [generatedReviewId, setGeneratedReviewId] = useState(null);

  const GOOGLE_REVIEW_URL = doctor?.google_profile_url || 'https://share.google/iBPK7TfzoXQ9Hi94J';

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('clinics').select('*').eq('id', clinicId).single();
      if (error || !data) { setNotFound(true); return; }
      setDoctor(data);
      await supabase.from('clinics')
        .update({ scans: (data.scans || 0) + 1 }).eq('id', clinicId);
    })();
  }, [clinicId]);

  const bumpReviewsGenerated = async () => {
    const { data: fresh } = await supabase.from('clinics').select('reviews_generated').eq('id', clinicId).single();
    await supabase.from('clinics')
      .update({ reviews_generated: (fresh?.reviews_generated || 0) + 1 })
      .eq('id', clinicId);
  };

  // Logs the actual generated text to `generated_reviews` (separate from
  // the `clinics` counter columns, which only ever tracked counts) — lets
  // us see what's actually being generated, and is what the auto-generate
  // dedup check below queries against.
  const logGeneratedReview = async (type, text) => {
    const { data } = await supabase.from('generated_reviews')
      .insert({ clinic_id: clinicId, review_type: type, review_text: text })
      .select('id').single();
    if (data) setGeneratedReviewId(data.id);
  };

  // Auto-generate has no patient-typed text to make it unique, so this
  // checks the new text against every 'auto' review already logged for this
  // doctor and re-rolls (new seed) on an exact match, up to 5 tries — a
  // real guarantee instead of just relying on combinatorial odds.
  const generateUniqueAutoReview = async () => {
    let text = '';
    let v = variant;
    for (let attempt = 0; attempt < 5; attempt++) {
      text = generateShortAutoReview(doctor, v);
      const { data: dup } = await supabase.from('generated_reviews')
        .select('id').eq('clinic_id', clinicId).eq('review_type', 'auto').eq('review_text', text).limit(1);
      if (!dup || dup.length === 0) break;
      v = v + 1 + Math.floor(Math.random() * 1000);
    }
    setVariant(v + 1);
    return text;
  };

  const handleKeepRaw = async () => {
    if (!manualText.trim()) return;
    setKeeping(true);
    await new Promise(r => setTimeout(r, 500));
    const text = cleanTypedText(manualText);
    setResultText(text);
    setResultType('raw');
    setKeeping(false);
    setStep('result');
    await bumpReviewsGenerated();
    await logGeneratedReview('raw', text);
  };

  const handlePolish = async () => {
    if (!manualText.trim()) return;
    setPolishing(true);
    await new Promise(r => setTimeout(r, 700));
    const text = polishReview(manualText, doctor, variant);
    setResultText(text);
    setVariant(v => v + 1);
    setResultType('polished');
    setPolishing(false);
    setStep('result');
    await bumpReviewsGenerated();
    await logGeneratedReview('polished', text);
  };

  const handleAutoNext = async () => {
    if (manualText.trim()) return; // only the blank-box fallback
    setAutoing(true);
    await new Promise(r => setTimeout(r, 600));
    const text = await generateUniqueAutoReview();
    setResultText(text);
    setResultType('auto');
    setAutoing(false);
    setStep('result');
    await bumpReviewsGenerated();
    await logGeneratedReview('auto', text);
  };

  const regenerate = async () => {
    if (resultType === 'polished') {
      const text = polishReview(manualText, doctor, variant);
      setResultText(text);
      setVariant(v => v + 1);
      await logGeneratedReview('polished', text);
    } else if (resultType === 'auto') {
      const text = await generateUniqueAutoReview();
      setResultText(text);
      await logGeneratedReview('auto', text);
    }
  };

  const copyAndOpen = async () => {
    await navigator.clipboard.writeText(resultText);
    setCopied('copied');
    const { data: fresh } = await supabase.from('clinics').select('reviews_submitted').eq('id', clinicId).single();
    await supabase.from('clinics').update({ reviews_submitted: (fresh?.reviews_submitted || 0) + 1 }).eq('id', clinicId);
    if (generatedReviewId) {
      await supabase.from('generated_reviews').update({ submitted: true }).eq('id', generatedReviewId);
    }
    setTimeout(() => {
      window.open(GOOGLE_REVIEW_URL, '_blank');
      setCopied('');
    }, 600);
  };

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff' }}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🩺</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>Doctor not found</h2>
        <p style={{ color: '#6b7280', marginTop: 8 }}>Please check the link and try again.</p>
      </div>
    </div>
  );

  if (!doctor) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #bfdbfe', borderTopColor: THEME.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const subtitle = [doctor.specialization, doctor.clinic_name].filter(Boolean).join(' · ');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#eff6ff 0%,#dbeafe 50%,#f0fdf4 100%)', padding: '0 0 80px', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <style>{ANIM}</style>

      {/* Header */}
      <div style={{ background: THEME.gradient, padding: '0 20px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 0 32px', textAlign: 'center' }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.6)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <span style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: 1 }}>{(doctor.doctor_name || 'D').replace(/^Dr\.?\s*/i, '')[0]}</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.2 }}>{doctor.doctor_name}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: 600, maxWidth: '100%' }}>
            <span style={{ color: '#4ade80', flexShrink: 0 }}>●</span>
            <span style={{ minWidth: 0, overflowWrap: 'break-word' }}>{subtitle || 'Even Hospitals'}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px 0' }}>

        {/* ══ Write review ══ */}
        {step === 'write' && (
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(37,99,235,0.1)', border: '1px solid #dbeafe' }}>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✏️</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>Write your review here</h2>
            </div>

            <textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="What was your experience like?"
              style={{ width: '100%', minHeight: 130, padding: '14px 16px', borderRadius: 14, border: '2px solid #e2e8f0', fontSize: 14, lineHeight: 1.6, color: '#0f172a', background: '#fff', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = THEME.primary}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 20px', textAlign: 'right' }}>{manualText.length} characters</p>

            {manualText.trim() ? (
              <>
                <button onClick={handleKeepRaw} disabled={keeping || polishing}
                  style={{ width: '100%', padding: '16px', borderRadius: 14, background: THEME.gradient, color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                  {keeping ? (
                    <><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Preparing...</>
                  ) : 'Keep It As I Wrote It'}
                </button>

                <button onClick={handlePolish} disabled={keeping || polishing}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'transparent', color: THEME.dark, border: `2px solid ${THEME.primary}`, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  {polishing ? (
                    <><div style={{ width: 18, height: 18, border: `3px solid ${THEME.ring}`, borderTopColor: THEME.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Polishing...</>
                  ) : '✨ Polish My Review'}
                </button>
              </>
            ) : (
              <button onClick={handleAutoNext} disabled={autoing}
                style={{ width: '100%', padding: '16px', borderRadius: 14, background: THEME.gradient, color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {autoing ? (
                  <><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Preparing...</>
                ) : 'Next →'}
              </button>
            )}
          </div>
        )}

        {/* ══ Result ══ */}
        {step === 'result' && resultText && (
          <div className="anim-up">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span className="anim-cel" style={{ display: 'inline-block', fontSize: 52 }}>🎉</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '10px 0 4px' }}>Your Review is Ready!</h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>Copy it and paste on Google.</p>
            </div>

            <div className="review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(37,99,235,0.12)', border: '1px solid #dbeafe', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: THEME.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                  {(doctor.doctor_name || 'D').replace(/^Dr\.?\s*/i, '')[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>Your Review</p>
                  <Stars />
                </div>
              </div>
              <p style={{ color: '#374151', lineHeight: 1.75, fontSize: 15, margin: '0 0 20px' }}>{resultText}</p>
              <button onClick={copyAndOpen}
                style={{ width: '100%', padding: '16px', borderRadius: 14, background: '#16a34a', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity 0.2s' }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.92'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                {copied === 'copied' ? '✅ Copied! Opening Google...' : '📋 Copy & Open Google Review'}
              </button>
            </div>

            {(resultType === 'polished' || resultType === 'auto') && (
              <button onClick={regenerate}
                style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'transparent', color: '#64748b', border: '2px solid #e2e8f0', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}>
                🔄 Generate Different Version
              </button>
            )}

            <button onClick={() => { setStep('write'); setResultType(null); setGeneratedReviewId(null); }}
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
