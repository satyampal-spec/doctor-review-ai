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

// ── Location: full address only 2 in 10 times ─────────────────
function displayLoc(loc, r) {
  if (r() < 0.2) return loc;
  return pick([
    'Race Course Road, Bengaluru','Madhava Nagar, Bengaluru','central Bengaluru',
    'Bengaluru','Race Course Road, Bangalore','Madhava Nagar area, Bengaluru',
    'Bengaluru city','Race Course Road area, Bengaluru',
  ], r);
}

// ── 3000+ unique review generator ─────────────────────────────
function generateHospitalReview(hospitalName, location, rating, liked, type, variant, lang) {
  const r   = seeded(variant);
  const n   = hospitalName || 'Even Hospitals';
  const loc = displayLoc(location || 'Bengaluru', r);
  const asp = buildAspectSentence(liked, r);

  // ── KANNADA ─────────────────────────────────────────────────
  if (lang === 'kannada') {
    const KSO = [
      `${n} ge hogi tumba satisfied aadhe.`,`${n} nalli exceptional experience sikkithu.`,
      `${n} nalli visit maadide — thumba impressed aadhe.`,`${n} ge hogi tumba khushi aadhe.`,
      `Nanna patient anubhava ${n} nalli tumba olle aaythu.`,`${n} ge hogalu decide maadide — best decision.`,
      `Maatu keliddu satya — ${n} tumba olle hospital.`,`${n} nalli doctors tumba experienced.`,
      `${n} ge recent agi hogi satisfied aadhe.`,`${n} nalli care sikkiddu tumba outstanding.`,
    ];
    const KSM = [
      `Doctors highly experienced, facilities tumba clean. ${asp}`,
      `Expert doctors, caring staff, hygienic environment — yella tumba good. ${asp}`,
      `Diagnosis quick aagi sigtu. ${asp}Doctors patients jote carefully maatnadtare.`,
      `${asp}Hospital thumba hygienic, modern equipment kuda ide.`,
      `Treatment cost kuda reasonable — bilkul extra charges illa. ${asp}`,
      `Staff tumba friendly, doctors thorough examination maadtare. ${asp}`,
      `Wait time kammi, facilities modern, doctors experienced. ${asp}`,
      `${asp}Nurses tumba caring, doctors tumba knowledgeable.`,
    ];
    const KSC = [
      `Bengaluru alli best hospital antha helbahudu. Definitely recommend maadthene.`,
      `Trusted healthcare beku andre ee hospital ge hogi. Highly recommend.`,
      `Bengaluru alli quality healthcare ge best choice — ${n}.`,
      `5 stars kodthene — ${n} deserve maadthene.`,
      `Family mattu friends ge definitely suggest maadthene.`,
      `Bengaluru alli ee tarada hospital sigodu rare. Tumba recommend.`,
    ];
    const KMO = [
      `${n} ge ${loc} nalli hogi nanu tumba khushi aadhe.`,
      `Nanu ${n} nalli treatment tegolide, experience tumba better aagittu.`,
      `${n} ge hogalu decide maadide — best decision tumba.`,
      `${loc} nalli ${n} nalli consult maadide, tumba satisfied.`,
      `Nanna family member ge ${n} nalli treatment — excellent experience.`,
      `${n} guri keliddu, hogi confirmed aagide — tumba olle hospital.`,
    ];
    const KMM = [
      `Doctorgalu patients janara haatra tumba carefully maatnadtare. ${asp}Hospital thumba hygienic, modern equipment kuda ide.`,
      `${asp}Nursing staff tumba caring. Hospital clean, comfortable. Doctors time tegondu explain maadtare.`,
      `Treatment cost kuda reasonable — bilkul extra charges illa. ${asp}Facilities tumba advanced, doctors highly qualified.`,
      `${asp}Registration quick, doctors time ge sigthare. Yella process smooth aagi nadte.`,
      `Doctors tumba experienced, diagnosis accurate. ${asp}Hospital hygienic, staff tumba helpful.`,
      `${asp}Emergency situations alli kuda prompt response sigtu. ${n} mele trust ide.`,
    ];
    const KMC = [
      `Bengaluru alli ee tarada trusted healthcare sigola kashta. ${n} — best hospital.`,
      `Affordable healthcare beku antha alle bandhere — ${n} perfect choice. Highly recommend.`,
      `${n} ge definitely return maadthene mattu everyone ge recommend maadthene.`,
      `Bengaluru alli quality medical care beku ante ${n} ge hogi.`,
      `5 stars fullaa kodthene. ${n} deserve maadthene ella.`,
      `Friends mattu family ge definitely ${n} suggest maadthene.`,
    ];
    if (type==='short') return `${pick(KSO,r)} ${pick(KSM,r)} ${pick(KSC,r)}`;
    return `${pick(KMO,r)} ${pick(KMM,r)} ${pick(KMC,r)}`;
  }

  // ── ENGLISH SHORT (15×10×8 = 1200 unique) ───────────────────
  const SO = [
    `Visited ${n} in ${loc} recently — truly impressed.`,
    `Outstanding experience at ${n}. Highly recommend.`,
    `Really glad I chose ${n} for my healthcare needs.`,
    `Just had a great experience at ${n} in ${loc}.`,
    `Can't recommend ${n} enough — absolutely excellent.`,
    `My visit to ${n} in ${loc} was exceptional.`,
    `Brought my father to ${n} — the care was outstanding.`,
    `First time at ${n} and I am thoroughly impressed.`,
    `Quick visit to ${n} but completely satisfied.`,
    `Had treatment done at ${n} recently — very pleased.`,
    `Consulted at ${n} last week — brilliant experience.`,
    `My family member was treated at ${n} — excellent care.`,
    `Came to ${n} in ${loc} with high expectations — they exceeded them.`,
    `${n} in ${loc} — genuinely one of the best hospital experiences I've had.`,
    `So relieved I chose ${n} for my treatment.`,
  ];
  const SM = [
    `The doctors are highly skilled and the staff genuinely caring. ${asp}`,
    `Professional doctors, spotlessly clean facility, and minimal waiting time. ${asp}`,
    `Expert doctors, modern equipment, and a compassionate nursing team. ${asp}`,
    `Quick and accurate diagnosis, transparent billing, and a caring team. ${asp}`,
    `Experienced specialists, hygienic rooms, and efficient processes. ${asp}`,
    `Well-qualified doctors, short wait times, and very affordable treatment. ${asp}`,
    `${asp}Every staff member was helpful and professional from start to finish.`,
    `The entire experience was smooth, professional, and very reassuring. ${asp}`,
    `${asp}Clean hospital, caring doctors, and completely transparent billing.`,
    `Modern facility, top-notch doctors, and very friendly staff. ${asp}`,
  ];
  const SC = [
    `One of the best hospitals in Bengaluru — highly recommend.`,
    `Definitely my go-to hospital for healthcare in Bengaluru.`,
    `5 stars without any hesitation.`,
    `Strongly recommend to family and friends in Bengaluru.`,
    `Best decision for quality healthcare in Bengaluru.`,
    `Would absolutely come back and recommend to everyone.`,
    `${n} sets the standard for healthcare in Bengaluru.`,
    `If you need great healthcare in Bengaluru, this is the place to go.`,
  ];
  if (type==='short') return `${pick(SO,r)} ${pick(SM,r)} ${pick(SC,r)}`;

  // ── ENGLISH MEDIUM (12×10×8 = 960 unique) ───────────────────
  const MO = [
    `I visited ${n} in ${loc} and had an exceptional healthcare experience.`,
    `My experience at ${n} was genuinely outstanding from start to finish.`,
    `I was referred to ${n} in ${loc} and couldn't be happier with the decision.`,
    `I visited ${n} for a routine checkup and left thoroughly impressed.`,
    `Took my mother to ${n} in ${loc} — the care she received was exceptional.`,
    `After hearing so many good things about ${n}, I decided to consult there.`,
    `I visited ${n} for the first time last month and was very pleasantly surprised.`,
    `Needed medical attention urgently and went to ${n} — excellent decision.`,
    `I have visited several hospitals in Bengaluru, but ${n} stands apart.`,
    `When my family needed quality medical care, we chose ${n} in ${loc}.`,
    `I chose ${n} in ${loc} for my treatment and it was absolutely the right call.`,
    `Recently consulted at ${n} and the experience far exceeded my expectations.`,
  ];
  const MM = [
    `The doctors are highly qualified and took time to explain my condition clearly, giving me complete confidence in the treatment. ${asp}The facility is clean, modern, and the entire process from registration to diagnosis was smooth and efficient.`,
    `The entire team was professional, warm, and efficient. ${asp}From registration to discharge, everything was handled with exceptional care and precision.`,
    `What impressed me most was the transparency — no hidden charges, clear communication at every step. ${asp}The hospital is immaculate and very well-organised.`,
    `The doctors speak to you as a person, not just a patient. ${asp}They listen carefully, diagnose precisely, and explain everything in simple, clear terms.`,
    `The facility is immaculately clean, well-organised, and equipped with modern medical technology. ${asp}The staff is professional and the service is genuinely efficient.`,
    `The nursing staff was especially caring and attentive. ${asp}They went out of their way to make my family member comfortable throughout the entire stay.`,
    `I was struck by how efficiently the hospital is run — minimal waiting, smooth processes, and very kind staff. ${asp}`,
    `The specialist I consulted was extremely knowledgeable and gave a thorough examination without rushing. ${asp}This level of care is genuinely rare.`,
    `${asp}What sets ${n} apart is the combination of expertise, compassion, and affordability — all under one roof.`,
    `The registration was quick, the doctor was on time, and the treatment was thorough. ${asp}No unnecessary procedures, no surprise charges whatsoever.`,
  ];
  const MC = [
    `For quality, trusted, and affordable healthcare in Bengaluru, ${n} genuinely stands out. Highly recommend.`,
    `${n} is definitely among the best hospitals in Bengaluru. Would not hesitate to return or recommend.`,
    `I would recommend ${n} to anyone looking for reliable, expert healthcare in Bengaluru.`,
    `If you need quality medical care in Bengaluru, ${n} is absolutely the right choice.`,
    `Five stars — ${n} earns every one for their care, professionalism, and transparency.`,
    `${n} is genuinely one of Bengaluru's finest hospitals. Strongly recommend to everyone.`,
    `I will be returning to ${n} for all future healthcare needs. Highly recommended.`,
    `For anyone seeking a hospital that genuinely cares, ${n} in Bengaluru is the answer.`,
  ];
  if (type!=='detailed') return `${pick(MO,r)} ${pick(MM,r)} ${pick(MC,r)}`;

  // ── ENGLISH DETAILED (8×8×6 = 384 unique) ───────────────────
  const DO = [
    `I want to share my experience at ${n} because it genuinely deserves recognition.`,
    `My experience at ${n} compelled me to write this review for others seeking good healthcare.`,
    `I recently visited ${n} in ${loc} and felt I should share my experience for others.`,
    `After receiving exceptional care at ${n}, I felt I owed it to others to leave this review.`,
    `I visited ${n} in ${loc} recently and the experience was so positive I had to write about it.`,
    `Having visited ${n} for my treatment, I can confidently say this is one of Bengaluru's finest hospitals.`,
    `I rarely write reviews but my experience at ${n} was exceptional enough to make me do so.`,
    `My family has been visiting ${n} in ${loc} and the standard of care is consistently excellent.`,
  ];
  const DM = [
    `From the first point of contact to the final follow-up, everything was handled with great care and professionalism. ${asp}The doctors here are not just highly experienced — they take real time to listen, diagnose carefully, and explain every step of treatment clearly. The nursing staff is compassionate and attentive. The facility is immaculately clean, well-organised, and equipped with modern technology. What also impressed me was the transparency in billing — affordable, with no hidden charges.`,
    `${asp}The level of care and attention I received was outstanding. The doctors are exceptionally skilled and speak to you as a human being — not just a patient. They take time to explain the diagnosis in simple terms, which is genuinely reassuring. The hospital is spotlessly clean, the environment is calm, and equipment is modern. The waiting time was minimal and the appointment process was smooth. Treatment costs were very reasonable and completely transparent.`,
    `The doctors at ${n} are what make it stand out. ${asp}They are thorough, patient, and extremely knowledgeable. The nursing staff mirrors that dedication — attentive, kind, and professional. The hospital environment is hygienic and comfortable. Emergency response is quick and effective. Billing is transparent and very reasonable compared to other hospitals in Bengaluru.`,
    `${asp}I have been to many hospitals in Bengaluru over the years, but ${n} is on a different level entirely. The infrastructure is modern, the staff is highly trained, and the overall patient experience is carefully thought out. Doctors spend quality time with each patient and the communication is excellent. There were no unexpected charges and no unnecessary procedures recommended.`,
    `What sets ${n} apart is its culture of genuine care. ${asp}Every person I interacted with — from the reception staff to the senior doctors — was professional, courteous, and focused on patient wellbeing. The facility is clean, the processes are efficient, and the medical expertise is excellent. I was particularly impressed by how transparent they are about treatment plans and costs.`,
    `I visited ${n} for a serious concern and left feeling genuinely cared for. ${asp}The doctors were thorough, spending significant time understanding my history before explaining the diagnosis in detail. The nursing staff was compassionate and responsive. The hospital itself is modern, hygienic, and well-maintained. I had visited other hospitals in ${loc} before, but the quality of care at ${n} is significantly better.`,
    `${asp}The professionalism at ${n} is truly commendable. From the moment you walk in, there is a clear sense that the hospital is focused on patient wellbeing above everything else. Doctors are experienced and empathetic. Staff is helpful and courteous. The facility is clean and modern. What also stood out was that the billing was completely transparent — exactly what was quoted, no surprises at all.`,
    `My experience at ${n} restored my faith in healthcare in Bengaluru. ${asp}The specialist who treated me was not only highly skilled but also took time to ensure I completely understood my diagnosis and treatment plan. The hospital is extremely well-maintained, the nursing care is attentive, and the overall environment is calm and reassuring.`,
  ];
  const DC = [
    `For anyone in Bengaluru looking for quality, trustworthy, and affordable healthcare, ${n} is absolutely the right choice. I would not hesitate to recommend it to family and friends.`,
    `I have visited other hospitals in ${loc} and Bengaluru before, but ${n} stands out for its unique combination of expertise, empathy, and affordability. Highly recommended — 5 stars without hesitation.`,
    `${n} sets a benchmark for healthcare quality in Bengaluru. Whether a routine consultation or a complex procedure, you are in very safe and capable hands here.`,
    `I strongly recommend ${n} to anyone in Bengaluru looking for reliable, compassionate, and expert medical care. It genuinely restores your confidence in healthcare.`,
    `Five stars is not enough for ${n}. The quality of care, the professionalism of the staff, and the affordability of treatment make it genuinely one of the best hospitals in Bengaluru.`,
    `If you are in Bengaluru and need healthcare you can truly trust, ${n} is the answer. The team is exceptional and the care is genuine. Highly recommend without reservation.`,
  ];
  return `${pick(DO,r)} ${pick(DM,r)} ${pick(DC,r)}`;
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
          {hospital.photo_url ? (
            <img
              src={hospital.photo_url}
              alt={hospital.shop_name}
              style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.6)', marginBottom: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            />
          ) : (
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.6)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <span style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: 1 }}>🏥</span>
            </div>
          )}
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
