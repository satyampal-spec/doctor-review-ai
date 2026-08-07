'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// ── Theme (keyed by business sub_type, same pattern as the hospital page) ──
const THEMES = {
  default: {
    primary: '#4338ca',
    dark:    '#3730a3',
    gradient:'linear-gradient(135deg,#4338ca 0%,#3730a3 100%)',
    light:   '#eef2ff',
    ring:    '#c7d2fe',
  },
};

// ── Liked options — mined from real Google reviews for a passport/CSC
// service agency (SOC Enterprises, Bhopal): transparent pricing, WhatsApp
// status updates, a trusted named staff member, "one-stop solution",
// resolving document/name-mismatch issues, tatkal turnaround. ─────────
const LIKED_OPTIONS = [
  { key: 'fast_processing',    label: 'Fast & timely processing',        emoji: '🚀' },
  { key: 'transparent_pricing',label: 'Transparent, honest pricing',     emoji: '💰' },
  { key: 'helpful_staff',      label: 'Patient, helpful staff',          emoji: '🤝' },
  { key: 'whatsapp_updates',   label: 'Kept me updated on WhatsApp',     emoji: '📱' },
  { key: 'tatkal_service',     label: 'Got my urgent/Tatkal passport sorted', emoji: '⚡' },
  { key: 'document_help',      label: 'Sorted my document/name-mismatch issues', emoji: '📄' },
  { key: 'one_stop_solution',  label: 'One-stop solution for everything',emoji: '🏢' },
  { key: 'easy_booking',       label: 'Easy appointment booking',        emoji: '📅' },
  { key: 'clean_office',       label: 'Clean, organized office',         emoji: '✨' },
  { key: 'smooth_tracking',    label: 'Smooth application tracking',     emoji: '🔍' },
  { key: 'trusted_team',       label: 'A team I can fully trust',        emoji: '💙' },
];

const LIKED_PHRASES = {
  fast_processing:     'how fast and efficiently my passport process was completed',
  transparent_pricing: 'how transparent and honest they were about the pricing, with no hidden charges',
  helpful_staff:       'how patient and helpful the staff were with all my questions',
  whatsapp_updates:    'how they kept me updated on WhatsApp throughout the process',
  tatkal_service:      'how quickly they got my urgent Tatkal passport sorted',
  document_help:       'how smoothly they sorted out my document and name-mismatch issues',
  one_stop_solution:   'being a genuine one-stop solution for everything I needed',
  easy_booking:        'how easy it was to book an appointment',
  clean_office:        'the clean, well-organized office',
  smooth_tracking:     'how smoothly they helped me track my application',
  trusted_team:        'how much I trust this team, they handled everything so professionally',
};

const RATING_OPTIONS = [
  { key: 'excellent', label: 'Excellent', emoji: '😍', stars: 5, desc: 'Loved everything!' },
  { key: 'good',      label: 'Good',      emoji: '😊', stars: 4, desc: 'Great experience' },
  { key: 'average',   label: 'Average',   emoji: '😐', stars: 3, desc: 'It was okay' },
];

// ── Which service the customer used — from the business's own service list.
const SERVICES = [
  { key: 'new_passport',  label: 'New Passport Application',       emoji: '📘', phrase: 'a new passport application' },
  { key: 'tatkal',        label: 'Tatkal Passport (24hr)',         emoji: '⚡', phrase: 'a Tatkal passport, done within 24 hours' },
  { key: 'renewal',       label: 'Passport Renewal',               emoji: '🔄', phrase: 'a passport renewal' },
  { key: 'name_mismatch', label: 'Name Mismatch / Document Issue', emoji: '📝', phrase: 'help resolving a name mismatch in my documents' },
  { key: 'correction',    label: 'Passport Correction',            emoji: '✏️', phrase: 'a passport correction' },
  { key: 'minor_passport',label: 'Minor Passport',                 emoji: '👶', phrase: "my child's passport" },
  { key: 'expediting',    label: 'Passport Expediting',            emoji: '🚀', phrase: 'quick processing of my passport' },
  { key: 'documentation', label: 'Documentation Assistance',       emoji: '📄', phrase: 'help with my documentation' },
  { key: 'tracking',      label: 'Application Tracking',           emoji: '🔍', phrase: 'help tracking my application' },
  { key: 'visa',          label: 'Travel Visa Services',           emoji: '🛂', phrase: 'travel visa assistance' },
  { key: 'emergency',     label: 'Emergency Appointment',          emoji: '🚨', phrase: 'an emergency appointment' },
];

function buildServiceSentence(specKey, r) {
  const spec = SERVICES.find(s => s.key === specKey);
  if (!spec) return '';
  const templates = [
    `I came in for ${spec.phrase}. `,
    `I visited for ${spec.phrase}. `,
    `I needed ${spec.phrase}. `,
  ];
  return pick(templates, r);
}

// ── Seeded RNG (same variant → same review always) ────────────
function seeded(seed) {
  let s = ((seed + 1) * 2654435761) >>> 0;
  return () => { s ^= s<<13; s ^= s>>17; s ^= s<<5; return (s>>>0)/4294967296; };
}
const pick = (a, r) => a[Math.floor(r() * a.length)];

// ── Aspect sentence (varied connectors) ───────────────────────
function buildAspectSentence(liked, r) {
  const phrases = liked.map(k => LIKED_PHRASES[k]).filter(Boolean);
  if (!phrases.length) return '';
  const OPS  = ['I especially appreciated ','I particularly valued ','What stood out most was ','I was genuinely impressed by ','I really appreciated ','A real highlight was '];
  const JOIN = [' and ',' as well as ',' along with '];
  const MOPS = ['What stood out was ','I particularly appreciated ','The highlights for me were ','I was most impressed by ','Notably, I appreciated '];
  const op = r ? pick(OPS,r) : OPS[0];
  if (phrases.length===1) return `${op}${phrases[0]}. `;
  if (phrases.length===2) return `${op}${phrases[0]}${r?pick(JOIN,r):' and '}${phrases[1]}. `;
  const s = r ? pick(MOPS,r) : MOPS[0];
  return `${s}${phrases.slice(0,-1).join(', ')}, and ${phrases[phrases.length-1]}. `;
}

// ── Location: never the raw full address (house/shop no., street, pincode)
// — derives a clean "area, city" from whatever's in the last few comma
// segments, so this works for any city, not just one hardcoded one.
function displayLoc(loc, r) {
  const base = (loc || '').trim();
  const isJunk = (s) => /^\d+$/.test(s) || /^(no\.?|#|shop)\b/i.test(s);
  const stripPin = (s) => s.replace(/\s*\d{5,6}\s*$/, '').trim();
  const cleaned = base.split(',').map(s => s.trim()).filter(Boolean).filter(p => !isJunk(p)).map(stripPin).filter(Boolean);
  if (!cleaned.length) return 'the area';
  const city = cleaned.length >= 2 ? cleaned[cleaned.length - 2] : cleaned[0];
  const area = cleaned.length >= 3 ? cleaned[cleaned.length - 3] : cleaned[0];
  return pick([
    `${area}, ${city}`,
    city,
    `${area} area, ${city}`,
    `${city} city`,
    area,
  ], r);
}

// ── Review generator ────────────────────────────────────────────
function generateMPOnlineReview(bizName, location, liked, type, variant, service) {
  const r   = seeded(variant);
  const n   = bizName || 'this office';
  const loc = displayLoc(location, r);
  const asp = buildAspectSentence(liked, r);
  const spec = buildServiceSentence(service, r);

  const SO = [
    `Visited ${n} in ${loc} recently, truly impressed.`,
    `Outstanding experience at ${n}. Highly recommend.`,
    `Really glad I chose ${n} for my passport work.`,
    `Just had a great experience at ${n} in ${loc}.`,
    `Can't recommend ${n} enough, absolutely excellent.`,
    `My visit to ${n} in ${loc} was seamless.`,
    `Got my passport work done at ${n}, the service was outstanding.`,
    `First time at ${n} and I am thoroughly impressed.`,
    `Quick visit to ${n} but completely sorted.`,
    `Had my documents handled at ${n} recently, very pleased.`,
    `Consulted ${n} last week, brilliant experience.`,
    `My family's passport work was handled at ${n}, excellent service.`,
    `Came to ${n} in ${loc} with high expectations, they exceeded them.`,
    `${n} in ${loc}, genuinely one of the best passport service experiences I've had.`,
    `So relieved I chose ${n} for my passport process.`,
  ];
  const SM = [
    `The team is professional and the process was completely hassle-free. ${asp}`,
    `Quick processing, transparent pricing, and a genuinely helpful team. ${asp}`,
    `Efficient staff, smooth documentation, and clear communication throughout. ${asp}`,
    `Fast turnaround, honest pricing, and a team that actually cares. ${asp}`,
    `Experienced staff, smooth process, and zero confusion. ${asp}`,
    `Well-organized office, short wait times, and very reasonable charges. ${asp}`,
    `${asp}Every staff member was helpful and professional from start to finish.`,
    `The entire experience was smooth, professional, and reassuring. ${asp}`,
    `${asp}Clean office, courteous staff, and completely transparent charges.`,
    `Well-run office, knowledgeable team, and very friendly staff. ${asp}`,
  ];
  const SC = [
    `One of the best passport service centers in ${loc}, highly recommend.`,
    `Definitely my go-to for passport work in ${loc}.`,
    `5 stars without any hesitation.`,
    `Strongly recommend to family and friends in ${loc}.`,
    `Best decision for passport services in ${loc}.`,
    `Would absolutely come back and recommend to everyone.`,
    `${n} sets the standard for passport services in ${loc}.`,
    `If you need reliable passport help in ${loc}, this is the place to go.`,
    `One of the best travel and passport agencies in ${loc}, hands down.`,
    `Top choice for passport and visa services in ${loc}.`,
    `If you're in ${loc} and need a team you can trust with your documents, this is it.`,
  ];
  if (type==='short') return `${pick(SO,r)} ${spec}${pick(SM,r)} ${pick(SC,r)}`;

  const MO = [
    `I visited ${n} in ${loc} and had a genuinely smooth passport experience.`,
    `My experience at ${n} was outstanding from start to finish.`,
    `I was referred to ${n} in ${loc} and couldn't be happier with the decision.`,
    `I visited ${n} for a routine passport renewal and left thoroughly impressed.`,
    `Got my father's passport work done at ${n} in ${loc}, the service was exceptional.`,
    `After hearing so many good things about ${n}, I decided to go there.`,
    `I visited ${n} for the first time last month and was very pleasantly surprised.`,
    `Needed urgent passport help and went to ${n}, excellent decision.`,
    `I have tried several agents in ${loc}, but ${n} stands apart.`,
    `When my family needed passport help, we chose ${n} in ${loc}.`,
    `I chose ${n} in ${loc} for my documentation and it was absolutely the right call.`,
    `Recently consulted ${n} and the experience far exceeded my expectations.`,
  ];
  const MM = [
    `The team is highly knowledgeable and took time to explain the entire process clearly, giving me complete confidence. ${asp}The office is well-organized, and the entire process from documentation to submission was smooth and efficient.`,
    `The entire team was professional, warm, and efficient. ${asp}From the first visit to the final follow-up, everything was handled with genuine care.`,
    `What impressed me most was the transparency, no hidden charges, clear communication at every step. ${asp}The office is well-organised and easy to find.`,
    `They speak to you like a person, not just another file. ${asp}They listen carefully, explain clearly, and never rush you.`,
    `The office is clean, well-organised, and the team is genuinely on top of things. ${asp}The service is efficient without ever feeling rushed.`,
    `The staff was especially patient and attentive. ${asp}They went out of their way to make sure my documents were in order.`,
    `I was struck by how efficiently the process moved, minimal waiting, smooth steps, and very kind staff. ${asp}`,
    `The team member I dealt with was extremely knowledgeable and thorough without rushing. ${asp}This level of service is genuinely rare.`,
    `${asp}What sets ${n} apart is the combination of expertise, honesty, and affordability, all under one roof.`,
    `The documentation review was quick, the team was on time, and the process was thorough. ${asp}No unnecessary steps, no surprise charges whatsoever.`,
  ];
  const MC = [
    `For reliable, transparent, and affordable passport services in ${loc}, ${n} genuinely stands out. Highly recommend.`,
    `${n} is definitely among the best passport agents in ${loc}. Would not hesitate to return or recommend.`,
    `I would recommend ${n} to anyone looking for reliable, expert passport help in ${loc}.`,
    `If you need passport or visa help in ${loc}, ${n} is absolutely the right choice.`,
    `Five stars, ${n} earns every one for their service, professionalism, and transparency.`,
    `${n} is genuinely one of ${loc}'s finest passport service centers. Strongly recommend to everyone.`,
    `I will be returning to ${n} for all future passport and visa needs. Highly recommended.`,
    `For anyone seeking a team that genuinely cares, ${n} in ${loc} is the answer.`,
    `${n} is easily one of the best passport service providers in ${loc}, I'd recommend it to anyone nearby.`,
    `If you're searching for a trusted passport agent in ${loc}, ${n} is the one to choose.`,
  ];
  if (type!=='detailed') return `${pick(MO,r)} ${spec}${pick(MM,r)} ${pick(MC,r)}`;

  const DO = [
    `I want to share my experience at ${n} because it genuinely deserves recognition.`,
    `My experience at ${n} compelled me to write this review for others navigating passport work.`,
    `I recently visited ${n} in ${loc} and felt I should share my experience for others.`,
    `After receiving exceptional help at ${n}, I felt I owed it to others to leave this review.`,
    `I visited ${n} in ${loc} recently and the experience was so positive I had to write about it.`,
    `Having used ${n} for my passport process, I can confidently say this is one of ${loc}'s finest agencies.`,
    `I rarely write reviews but my experience at ${n} was exceptional enough to make me do so.`,
    `My family has been using ${n} in ${loc} and the standard of service is consistently excellent.`,
  ];
  const DM = [
    `From the first point of contact to the final submission, everything was handled with great care and professionalism. ${asp}The team here isn't just experienced, they take real time to listen, explain every step clearly, and follow up without being asked. The office is well-organised and easy to navigate. What also impressed me was the transparency in pricing, affordable, with no hidden charges.`,
    `${asp}The level of service and attention I received was outstanding. The team is exceptionally knowledgeable and speaks to you like a person, not just another application. They take time to explain the process in simple terms, which is genuinely reassuring. The office is clean, the environment is calm, and everything moves efficiently. The waiting time was minimal and the whole process was smooth.`,
    `The staff at ${n} are what make it stand out. ${asp}They are thorough, patient, and extremely knowledgeable about even the trickiest document issues. The whole team mirrors that dedication, attentive, kind, and professional. Pricing is transparent and very reasonable compared to other agents in ${loc}.`,
    `${asp}I have used several agents in ${loc} over the years, but ${n} is on a different level entirely. The process is modern, the staff is highly trained, and the overall experience is carefully thought out. The team spends quality time with each customer and the communication is excellent. There were no unexpected charges and no unnecessary back-and-forth.`,
    `What sets ${n} apart is its culture of genuine care. ${asp}Everyone I interacted with, from the front desk to the senior team, was professional, courteous, and focused on getting my work done right. The office is clean, the process is efficient, and the expertise is excellent. I was particularly impressed by how transparent they are about timelines and costs.`,
    `I visited ${n} with a fairly complicated document issue and left feeling genuinely taken care of. ${asp}The team was thorough, spending real time understanding my situation before explaining the fix in detail. I had tried other agents in ${loc} before, but the quality of service at ${n} is significantly better.`,
    `${asp}The professionalism at ${n} is truly commendable. From the moment you walk in, there's a clear sense that the team is focused on getting your work done right, not just processing another file. The team is experienced and empathetic. The office is clean and modern. What also stood out was that the pricing was completely transparent, exactly what was quoted, no surprises at all.`,
    `My experience at ${n} restored my faith in getting government-related work done without hassle. ${asp}The team member who handled my case was not only highly skilled but also took time to ensure I completely understood every step. The office is well-maintained, the follow-up was consistent, and the overall experience was calm and reassuring.`,
  ];
  const DC = [
    `For anyone in ${loc} looking for reliable, trustworthy, and affordable passport services, ${n} is absolutely the right choice. I would not hesitate to recommend it to family and friends.`,
    `I have used other agents in ${loc} before, but ${n} stands out for its unique combination of expertise, honesty, and affordability. Highly recommended, 5 stars without hesitation.`,
    `${n} sets a benchmark for passport service quality in ${loc}. Whether a routine renewal or a complex document issue, you are in very safe and capable hands here.`,
    `I strongly recommend ${n} to anyone in ${loc} looking for reliable, patient, and expert passport help. It genuinely restores your confidence in getting government work done.`,
    `Five stars is not enough for ${n}. The quality of service, the professionalism of the team, and the affordability make it genuinely one of the best passport agencies in ${loc}.`,
    `If you are in ${loc} and need passport help you can truly trust, ${n} is the answer. The team is exceptional and the service is genuine. Highly recommend without reservation.`,
    `${n} is genuinely one of the best passport and travel service providers in ${loc}. Between the expertise and the way the whole team treats you, it's an easy recommendation for anyone in the area.`,
  ];
  return `${pick(DO,r)} ${spec}${pick(DM,r)} ${pick(DC,r)}`;
}

// ── Manual review polisher ─────────────────────────────────────
function cleanTypedText(rawText) {
  let text = rawText.trim();
  if (!text) return '';
  text = text.replace(/\bi\b/g, 'I');
  text = text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!/[.!?]$/.test(text)) text += '.';
  text = text
    .replace(/\bis good\b/gi, 'is very good')
    .replace(/\bvery very\b/gi, 'very')
    .replace(/\bgood staff\b/gi, 'very helpful staff')
    .replace(/\bnice place\b/gi, 'great office')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return text;
}

function polishWrittenReview(rawText, bizName, location, variant) {
  const text = cleanTypedText(rawText);
  if (!text) return '';
  const name = bizName || 'this office';
  const r = seeded(variant ?? 0);
  const loc = displayLoc(location, r);
  const closings = [
    `Would recommend ${name} to anyone in ${loc}.`,
    `Overall, a great experience at ${name} in ${loc}.`,
    `Glad I chose ${name}, would recommend it to anyone in ${loc}.`,
  ];
  const mentionsName = bizName && text.toLowerCase().includes(bizName.toLowerCase().split(' ')[0].toLowerCase());
  return mentionsName ? text : `${text} ${pick(closings, r)}`;
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
  }
`;

export default function MPOnlineReviewPage({ params }) {
  const { shopId } = params;
  const [biz, setBiz] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Flow: rating defaults to 5-star (no UI step), starts at service selection.
  const [step, setStep]       = useState(2);
  const [rating, setRating]   = useState('excellent');
  const [service, setService] = useState(null);
  const [liked, setLiked]     = useState([]);
  const [loading, setLoading] = useState(false);

  const [manualText, setManualText] = useState('');
  const [keeping, setKeeping]       = useState(false);
  const [polishing, setPolishing]   = useState(false);
  const [resultType, setResultType] = useState(null); // 'raw' | 'polished' | 'auto'
  const [resultText, setResultText] = useState('');
  const [variant, setVariant] = useState(0);

  const [copied, setCopied] = useState('');

  const GOOGLE_REVIEW_URL = biz?.google_profile_url || '#';
  const theme = THEMES[biz?.sub_type] || THEMES.default;

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('businesses').select('*').eq('id', shopId).single();
      if (error || !data) { setNotFound(true); return; }
      setBiz(data);
      await supabase.from('businesses')
        .update({ scans: (data.scans || 0) + 1 }).eq('id', shopId);
    })();
  }, [shopId]);

  const toggleLiked = (key) =>
    setLiked(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);

  const bumpReviewsGenerated = async () => {
    const { data: fresh } = await supabase.from('businesses').select('reviews_generated').eq('id', shopId).single();
    await supabase.from('businesses')
      .update({ reviews_generated: (fresh?.reviews_generated || 0) + 1 })
      .eq('id', shopId);
  };

  const handleKeepRaw = async () => {
    if (!manualText.trim()) return;
    setKeeping(true);
    await new Promise(r => setTimeout(r, 500));
    setResultText(cleanTypedText(manualText));
    setResultType('raw');
    setKeeping(false);
    setStep(5);
    await bumpReviewsGenerated();
  };

  const handlePolish = async () => {
    if (!manualText.trim()) return;
    setPolishing(true);
    await new Promise(r => setTimeout(r, 700));
    setResultText(polishWrittenReview(manualText, biz?.shop_name, biz?.location, variant));
    setVariant(v => v + 1);
    setResultType('polished');
    setPolishing(false);
    setStep(5);
    await bumpReviewsGenerated();
  };

  const handleAutoGenerate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setResultText(generateMPOnlineReview(biz?.shop_name, biz?.location, liked, 'medium', variant, service));
    setVariant(v => v + 1);
    setResultType('auto');
    setLoading(false);
    setStep(5);
    await bumpReviewsGenerated();
  };

  const copyAndOpen = async () => {
    await navigator.clipboard.writeText(resultText);
    setCopied('copied');
    const { data: fresh } = await supabase.from('businesses').select('reviews_submitted').eq('id', shopId).single();
    await supabase.from('businesses').update({ reviews_submitted: (fresh?.reviews_submitted || 0) + 1 }).eq('id', shopId);
    setTimeout(() => {
      window.open(GOOGLE_REVIEW_URL, '_blank');
      setCopied('');
    }, 600);
  };

  const regenerate = () => {
    if (resultType === 'polished') {
      setResultText(polishWrittenReview(manualText, biz?.shop_name, biz?.location, variant));
      setVariant(v => v + 1);
    } else if (resultType === 'auto') {
      setResultText(generateMPOnlineReview(biz?.shop_name, biz?.location, liked, 'medium', variant, service));
      setVariant(v => v + 1);
    }
  };

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2ff' }}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛂</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>Business not found</h2>
        <p style={{ color: '#6b7280', marginTop: 8 }}>Please check the link and try again.</p>
      </div>
    </div>
  );

  if (!biz) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2ff' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #c7d2fe', borderTopColor: theme.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const ratingObj = RATING_OPTIONS.find(r => r.key === rating);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#eef2ff 0%,#e0e7ff 50%,#f5f3ff 100%)', padding: '0 0 80px', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <style>{ANIM}</style>

      {/* Header */}
      <div style={{ background: theme.gradient, padding: '0 20px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 0 32px', textAlign: 'center' }}>
          {biz.photo_url ? (
            <img
              src={biz.photo_url}
              alt={biz.shop_name}
              style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.6)', marginBottom: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            />
          ) : (
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.6)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <span style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: 1 }}>🛂</span>
            </div>
          )}
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.2 }}>{biz.shop_name}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: 600, maxWidth: '100%' }}>
            <span style={{ color: '#4ade80', flexShrink: 0 }}>●</span>
            <span style={{ minWidth: 0, overflowWrap: 'break-word' }}>Verified Business · {biz.location}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#e0e7ff' }}>
        <div style={{ height: 4, background: theme.gradient, width: `${((step - 1) / 4) * 100}%`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px 0' }}>

        {/* ══ STEP 2: Which service did you use? ══ */}
        {step === 2 && (
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(67,56,202,0.1)', border: '1px solid #e0e7ff' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛂</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>Which service did you use?</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>This helps make your review more specific.</p>
            </div>

            <div className="liked-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {SERVICES.map(opt => {
                const sel = service === opt.key;
                return (
                  <button key={opt.key} onClick={() => setService(opt.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 14, border: `2px solid ${sel ? theme.primary : '#e2e8f0'}`, background: sel ? theme.light : '#fafafa', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? theme.dark : '#374151' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{opt.emoji}</span>
                    <span style={{ minWidth: 0, flex: 1, overflowWrap: 'break-word' }}>{opt.label}</span>
                    {sel && <span style={{ flexShrink: 0, color: theme.primary, fontSize: 14 }}>✓</span>}
                  </button>
                );
              })}
            </div>

            <button onClick={() => setStep(3)} disabled={!service}
              style={{ width: '100%', padding: '15px', borderRadius: 14, background: service ? theme.gradient : '#e2e8f0', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: service ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
              Continue →
            </button>
          </div>
        )}

        {/* ══ STEP 3: What did you like? ══ */}
        {step === 3 && (
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(67,56,202,0.1)', border: '1px solid #e0e7ff' }}>
            <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: theme.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0 }}>← Back</button>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💙</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>What did you like?</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>Select all that apply, makes your review more helpful.</p>
            </div>
            <div className="liked-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {LIKED_OPTIONS.map(opt => {
                const sel = liked.includes(opt.key);
                return (
                  <button key={opt.key} onClick={() => toggleLiked(opt.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 14, border: `2px solid ${sel ? theme.primary : '#e2e8f0'}`, background: sel ? theme.light : '#fafafa', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? theme.dark : '#374151' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{opt.emoji}</span>
                    <span style={{ minWidth: 0, flex: 1, overflowWrap: 'break-word' }}>{opt.label}</span>
                    {sel && <span style={{ flexShrink: 0, color: theme.primary, fontSize: 14 }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep(4)} disabled={liked.length === 0}
              style={{ width: '100%', padding: '15px', borderRadius: 14, background: liked.length ? theme.gradient : '#e2e8f0', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: liked.length ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
              Continue → {liked.length > 0 && `(${liked.length} selected)`}
            </button>
          </div>
        )}

        {/* ══ STEP 4: Write your experience ══ */}
        {step === 4 && (
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(67,56,202,0.1)', border: '1px solid #e0e7ff' }}>
            <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: theme.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Back</button>

            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✏️</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>Write your review here</h2>
            </div>

            <textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="What was your experience like? (what stood out, how you felt)"
              style={{ width: '100%', minHeight: 130, padding: '14px 16px', borderRadius: 14, border: '2px solid #e2e8f0', fontSize: 14, lineHeight: 1.6, color: '#0f172a', background: '#fff', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = theme.primary}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 20px', textAlign: 'right' }}>{manualText.length} characters</p>

            <button onClick={handleKeepRaw} disabled={!manualText.trim() || keeping || polishing}
              style={{ width: '100%', padding: '16px', borderRadius: 14, background: manualText.trim() ? theme.gradient : '#e2e8f0', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: manualText.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
              {keeping ? (
                <><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Preparing...</>
              ) : 'Keep It As I Wrote It'}
            </button>

            <button onClick={handlePolish} disabled={!manualText.trim() || keeping || polishing}
              style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'transparent', color: manualText.trim() ? theme.dark : '#94a3b8', border: `2px solid ${manualText.trim() ? theme.primary : '#e2e8f0'}`, fontWeight: 700, fontSize: 14, cursor: manualText.trim() ? 'pointer' : 'not-allowed', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {polishing ? (
                <><div style={{ width: 18, height: 18, border: `3px solid ${theme.ring}`, borderTopColor: theme.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Polishing...</>
              ) : '✨ Polish My Review'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 16px' }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            <button onClick={handleAutoGenerate} disabled={loading || keeping || polishing}
              style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#fafafa', color: '#374151', border: '2px solid #e2e8f0', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {loading ? (
                <><div style={{ width: 18, height: 18, border: '3px solid rgba(0,0,0,0.1)', borderTopColor: theme.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Generating...</>
              ) : '🎯 Auto-Generate Review (Based on My Selections)'}
            </button>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '8px 0 0', textAlign: 'center' }}>Writes a review from what you picked earlier — no need to type anything above.</p>
          </div>
        )}

        {/* ══ STEP 5: Result ══ */}
        {step === 5 && resultText && (
          <div className="anim-up">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span className="anim-cel" style={{ display: 'inline-block', fontSize: 52 }}>🎉</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '10px 0 4px' }}>Your Review is Ready!</h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>Copy it and paste on Google.</p>
            </div>

            <div className="review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(67,56,202,0.12)', border: '1px solid #e0e7ff', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                  {(biz.shop_name || 'B')[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>Your Review</p>
                  <Stars count={ratingObj?.stars || 5} />
                </div>
              </div>
              <p style={{ color: '#374151', lineHeight: 1.75, fontSize: 15, margin: '0 0 20px' }}>{resultText}</p>
              <button onClick={copyAndOpen}
                style={{ width: '100%', padding: '16px', borderRadius: 14, background: '#16a34a', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity 0.2s' }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.92'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                {copied === 'copied' ? '✅ Copied! Opening Google...' : '📋 Copy & Open Google Review'}
              </button>
            </div>

            {resultType !== 'raw' && (
              <button onClick={regenerate}
                style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'transparent', color: '#64748b', border: '2px solid #e2e8f0', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}>
                🔄 Generate Different Version
              </button>
            )}

            <button onClick={() => { setStep(4); setResultType(null); }}
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
