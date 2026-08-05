'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const HOSPITAL_STOCK_PHOTO = 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80';

// ── Theme (keyed by business sub_type; default preserves the original
// sky-blue look for Even Hospitals and anything without a sub_type) ────
const GOOGLE_COLORS = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853' };
const THEMES = {
  default: {
    primary: '#0ea5e9',
    dark:    '#0369a1',
    gradient:'linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%)',
    light:   '#f0f9ff',
    ring:    '#bae6fd',
  },
  altius: {
    primary: GOOGLE_COLORS.blue,
    dark:    '#1a73e8',
    gradient:`linear-gradient(135deg,${GOOGLE_COLORS.blue} 0%,#1a73e8 100%)`,
    light:   '#e8f0fe',
    ring:    '#aecbfa',
    accents: [GOOGLE_COLORS.blue, GOOGLE_COLORS.red, GOOGLE_COLORS.yellow, GOOGLE_COLORS.green],
  },
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
  { key: 'safe_delivery',       label: 'Safe delivery & maternity care', emoji: '👶' },
  { key: 'laparoscopic_skill',  label: 'Skilled laparoscopic surgeons', emoji: '🩹' },
  { key: 'smooth_insurance',    label: 'Hassle-free insurance & discharge', emoji: '📄' },
  { key: 'trusted_doctor',      label: 'A doctor I can fully trust',    emoji: '🤝' },
];

const LIKED_PHRASES = {
  experienced_doctors: 'the experienced and highly qualified doctors',
  quick_diagnosis:     'the quick and accurate diagnosis',
  clean_hygienic:      'how clean and hygienic the facility was',
  short_wait:          'how quickly registration and consultation moved, barely any waiting around',
  caring_staff:        'the compassionate and caring nursing staff',
  advanced_equipment:  'the state-of-the-art medical equipment',
  affordable:          'how economical and reasonable the treatment cost was',
  clear_communication: 'how the doctor took the time to explain everything and patiently answered every question I had',
  good_followup:       'how the doctor followed up afterward and was always available for my questions',
  emergency_care:      'the prompt and efficient emergency care',
  comfortable:         'the clean, homely, and comfortable hospital environment',
  easy_appointment:    'how easy and smooth the appointment process was',
  safe_delivery:       'how safe and well cared for I felt through the entire delivery',
  laparoscopic_skill:  'the skill of the laparoscopic surgical team',
  smooth_insurance:    'how smooth the insurance approval and discharge process was',
  trusted_doctor:      "how much I trust the doctor, it genuinely feels like having a doctor in the family",
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

// ── Visit type + specialization (which department the patient came for) ──
// Ordered by real patient volume for Even-EHBR / Altius HBR Layout, per
// kx_billing_records (Metabase, hospital location='Even-EHBR').
const VISIT_TYPES = [
  { key: 'opd', label: 'OPD / Consultation', emoji: '🚶' },
  { key: 'ip',  label: 'Admitted (IP)',      emoji: '🛏️' },
];

const SPECIALIZATIONS = [
  { key: 'obg',               label: 'Gynaecology & Maternity',       emoji: '🤰', phrase: 'gynaecology and maternity care' },
  { key: 'internal_medicine', label: 'Internal Medicine / GP',        emoji: '🩺', phrase: 'a general medicine consultation' },
  { key: 'general_surgery',   label: 'General / Laparoscopic Surgery',emoji: '🔪', phrase: 'a surgical procedure' },
  { key: 'orthopedics',       label: 'Orthopaedics',                  emoji: '🦴', phrase: 'orthopaedic care' },
  { key: 'cardiology',        label: 'Cardiology',                    emoji: '❤️', phrase: 'cardiac care' },
  { key: 'pediatrics',        label: 'Paediatrics',                   emoji: '🧒', phrase: "my child's paediatric care" },
  { key: 'neurology',         label: 'Neurology / Neurosurgery',      emoji: '🧠', phrase: 'neurology care' },
  { key: 'urology',           label: 'Urology',                       emoji: '🩻', phrase: 'urology care' },
  { key: 'nephrology',        label: 'Nephrology',                    emoji: '💧', phrase: 'nephrology care' },
  { key: 'emergency',         label: 'Emergency Care',                emoji: '🚑', phrase: 'emergency care' },
  { key: 'ent',                label: 'ENT',                          emoji: '👂', phrase: 'an ENT consultation' },
  { key: 'oncology',          label: 'Oncology',                      emoji: '🎗️', phrase: 'oncology care' },
  { key: 'other',             label: 'General Checkup',               emoji: '➕', phrase: 'a general health checkup' },
];

// ── Specialization sentence (woven in right after the opening line) ────
function buildSpecialtySentence(specKey, visitType, r) {
  const spec = SPECIALIZATIONS.find(s => s.key === specKey);
  if (!spec) return '';
  const phrase = spec.phrase;
  const IP = [
    `I was admitted here for ${phrase}. `,
    `I came in and was admitted for ${phrase}. `,
    `My admission was for ${phrase}. `,
  ];
  const OPD = [
    `I visited for ${phrase}. `,
    `I came in as an outpatient for ${phrase}. `,
    `My consultation here was for ${phrase}. `,
  ];
  return pick(visitType === 'ip' ? IP : OPD, r);
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

// ── Location: full address only 2 in 10 times ─────────────────
// Derives variants from the business's own `location` field so every hospital
// on this shared page gets its own area name, not a hardcoded one.
// Never emits the raw full address (house/building no., street, pincode) —
// only a clean area name + city, since no real patient writes a full postal
// address inside a review. Picks the address segment just before the city
// name (skipping house-number-only segments like "511" or "No. 28").
function displayLoc(loc, r) {
  const base = (loc || 'Bengaluru').trim();
  const parts = base.split(',').map(s => s.trim()).filter(Boolean);
  const isJunk = (s) => /^\d+$/.test(s) || /^(no\.?|#)\s*\d*$/i.test(s);
  const cityIdx = parts.findIndex(p => /bengaluru|bangalore/i.test(p));
  let area = null;
  for (let i = (cityIdx > 0 ? cityIdx : parts.length) - 1; i >= 0; i--) {
    if (!isJunk(parts[i])) { area = parts[i]; break; }
  }
  if (!area) area = 'Bengaluru';
  return pick([
    `${area}, Bengaluru`,
    'Bengaluru',
    `${area} area, Bengaluru`,
    'Bengaluru city',
    `${area}, Bangalore`,
  ], r);
}

// ── 3000+ unique review generator ─────────────────────────────
function generateHospitalReview(hospitalName, location, rating, liked, type, variant, lang, specialization, visitType) {
  const r   = seeded(variant);
  const n   = hospitalName || 'Even Hospitals';
  const loc = displayLoc(location || 'Bengaluru', r);
  const asp = buildAspectSentence(liked, r);
  const spec = buildSpecialtySentence(specialization, visitType, r);

  // ── KANNADA ─────────────────────────────────────────────────
  if (lang === 'kannada') {
    const KSO = [
      `${n} ge hogi tumba satisfied aadhe.`,`${n} nalli exceptional experience sikkithu.`,
      `${n} nalli visit maadide, thumba impressed aadhe.`,`${n} ge hogi tumba khushi aadhe.`,
      `Nanna patient anubhava ${n} nalli tumba olle aaythu.`,`${n} ge hogalu decide maadide, best decision.`,
      `Maatu keliddu satya, ${n} tumba olle hospital.`,`${n} nalli doctors tumba experienced.`,
      `${n} ge recent agi hogi satisfied aadhe.`,`${n} nalli care sikkiddu tumba outstanding.`,
    ];
    const KSM = [
      `Doctors highly experienced, facilities tumba clean. ${asp}`,
      `Expert doctors, caring staff, hygienic environment, yella tumba good. ${asp}`,
      `Diagnosis quick aagi sigtu. ${asp}Doctors patients jote carefully maatnadtare.`,
      `${asp}Hospital thumba hygienic, modern equipment kuda ide.`,
      `Treatment cost kuda reasonable, bilkul extra charges illa. ${asp}`,
      `Staff tumba friendly, doctors thorough examination maadtare. ${asp}`,
      `Wait time kammi, facilities modern, doctors experienced. ${asp}`,
      `${asp}Nurses tumba caring, doctors tumba knowledgeable.`,
    ];
    const KSC = [
      `Bengaluru alli best hospital antha helbahudu. Definitely recommend maadthene.`,
      `Trusted healthcare beku andre ee hospital ge hogi. Highly recommend.`,
      `Bengaluru alli quality healthcare ge best choice, ${n}.`,
      `5 stars kodthene, ${n} deserve maadthene.`,
      `Family mattu friends ge definitely suggest maadthene.`,
      `Bengaluru alli ee tarada hospital sigodu rare. Tumba recommend.`,
    ];
    const KMO = [
      `${n} ge ${loc} nalli hogi nanu tumba khushi aadhe.`,
      `Nanu ${n} nalli treatment tegolide, experience tumba better aagittu.`,
      `${n} ge hogalu decide maadide, best decision tumba.`,
      `${loc} nalli ${n} nalli consult maadide, tumba satisfied.`,
      `Nanna family member ge ${n} nalli treatment, excellent experience.`,
      `${n} guri keliddu, hogi confirmed aagide, tumba olle hospital.`,
    ];
    const KMM = [
      `Doctorgalu patients janara haatra tumba carefully maatnadtare. ${asp}Hospital thumba hygienic, modern equipment kuda ide.`,
      `${asp}Nursing staff tumba caring. Hospital clean, comfortable. Doctors time tegondu explain maadtare.`,
      `Treatment cost kuda reasonable, bilkul extra charges illa. ${asp}Facilities tumba advanced, doctors highly qualified.`,
      `${asp}Registration quick, doctors time ge sigthare. Yella process smooth aagi nadte.`,
      `Doctors tumba experienced, diagnosis accurate. ${asp}Hospital hygienic, staff tumba helpful.`,
      `${asp}Emergency situations alli kuda prompt response sigtu. ${n} mele trust ide.`,
    ];
    const KMC = [
      `Bengaluru alli ee tarada trusted healthcare sigola kashta. ${n}, best hospital.`,
      `Affordable healthcare beku antha alle bandhere, ${n} perfect choice. Highly recommend.`,
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
    `Visited ${n} in ${loc} recently, truly impressed.`,
    `Outstanding experience at ${n}. Highly recommend.`,
    `Really glad I chose ${n} for my healthcare needs.`,
    `Just had a great experience at ${n} in ${loc}.`,
    `Can't recommend ${n} enough, absolutely excellent.`,
    `My visit to ${n} in ${loc} was exceptional.`,
    `Brought my father to ${n}, the care was outstanding.`,
    `First time at ${n} and I am thoroughly impressed.`,
    `Quick visit to ${n} but completely satisfied.`,
    `Had treatment done at ${n} recently, very pleased.`,
    `Consulted at ${n} last week, brilliant experience.`,
    `My family member was treated at ${n}, excellent care.`,
    `Came to ${n} in ${loc} with high expectations, they exceeded them.`,
    `${n} in ${loc}, genuinely one of the best hospital experiences I've had.`,
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
    `One of the best hospitals in Bengaluru, highly recommend.`,
    `Definitely my go-to hospital for healthcare in Bengaluru.`,
    `5 stars without any hesitation.`,
    `Strongly recommend to family and friends in Bengaluru.`,
    `Best decision for quality healthcare in Bengaluru.`,
    `Would absolutely come back and recommend to everyone.`,
    `${n} sets the standard for healthcare in Bengaluru.`,
    `If you need great healthcare in Bengaluru, this is the place to go.`,
    `One of the best multi-speciality hospitals in ${loc}, hands down.`,
    `Top choice for quality healthcare in ${loc}.`,
    `If you're in ${loc} and need a hospital you can trust, this is it.`,
  ];
  if (type==='short') return `${pick(SO,r)} ${spec}${pick(SM,r)} ${pick(SC,r)}`;

  // ── ENGLISH MEDIUM (12×10×8 = 960 unique) ───────────────────
  const MO = [
    `I visited ${n} in ${loc} and had an exceptional healthcare experience.`,
    `My experience at ${n} was genuinely outstanding from start to finish.`,
    `I was referred to ${n} in ${loc} and couldn't be happier with the decision.`,
    `I visited ${n} for a routine checkup and left thoroughly impressed.`,
    `Took my mother to ${n} in ${loc}, the care she received was exceptional.`,
    `After hearing so many good things about ${n}, I decided to consult there.`,
    `I visited ${n} for the first time last month and was very pleasantly surprised.`,
    `Needed medical attention urgently and went to ${n}, excellent decision.`,
    `I have visited several hospitals in Bengaluru, but ${n} stands apart.`,
    `When my family needed quality medical care, we chose ${n} in ${loc}.`,
    `I chose ${n} in ${loc} for my treatment and it was absolutely the right call.`,
    `Recently consulted at ${n} and the experience far exceeded my expectations.`,
  ];
  const MM = [
    `The doctors are highly qualified and took time to explain my condition clearly, giving me complete confidence in the treatment. ${asp}The facility is clean, modern, and the entire process from registration to diagnosis was smooth and efficient.`,
    `The entire team was professional, warm, and efficient. ${asp}From registration to discharge, everything was handled with exceptional care and precision.`,
    `What impressed me most was the transparency, no hidden charges, clear communication at every step. ${asp}The hospital is immaculate and very well-organised.`,
    `The doctors speak to you as a person, not just a patient. ${asp}They listen carefully, diagnose precisely, and explain everything in simple, clear terms.`,
    `The facility is immaculately clean, well-organised, and equipped with modern medical technology. ${asp}The staff is professional and the service is genuinely efficient.`,
    `The nursing staff was especially caring and attentive. ${asp}They went out of their way to make my family member comfortable throughout the entire stay.`,
    `I was struck by how efficiently the hospital is run, minimal waiting, smooth processes, and very kind staff. ${asp}`,
    `The specialist I consulted was extremely knowledgeable and gave a thorough examination without rushing. ${asp}This level of care is genuinely rare.`,
    `${asp}What sets ${n} apart is the combination of expertise, compassion, and affordability, all under one roof.`,
    `The registration was quick, the doctor was on time, and the treatment was thorough. ${asp}No unnecessary procedures, no surprise charges whatsoever.`,
  ];
  const MC = [
    `For quality, trusted, and affordable healthcare in Bengaluru, ${n} genuinely stands out. Highly recommend.`,
    `${n} is definitely among the best hospitals in Bengaluru. Would not hesitate to return or recommend.`,
    `I would recommend ${n} to anyone looking for reliable, expert healthcare in Bengaluru.`,
    `If you need quality medical care in Bengaluru, ${n} is absolutely the right choice.`,
    `Five stars, ${n} earns every one for their care, professionalism, and transparency.`,
    `${n} is genuinely one of Bengaluru's finest hospitals. Strongly recommend to everyone.`,
    `I will be returning to ${n} for all future healthcare needs. Highly recommended.`,
    `For anyone seeking a hospital that genuinely cares, ${n} in Bengaluru is the answer.`,
    `${n} is easily one of the best multi-speciality hospitals in ${loc}, I'd recommend it to anyone nearby.`,
    `If you're searching for a trusted, well-equipped hospital in ${loc}, ${n} is the one to choose.`,
  ];
  if (type!=='detailed') return `${pick(MO,r)} ${spec}${pick(MM,r)} ${pick(MC,r)}`;

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
    `From the first point of contact to the final follow-up, everything was handled with great care and professionalism. ${asp}The doctors here are not just highly experienced, they take real time to listen, diagnose carefully, and explain every step of treatment clearly. The nursing staff is compassionate and attentive. The facility is immaculately clean, well-organised, and equipped with modern technology. What also impressed me was the transparency in billing, affordable, with no hidden charges.`,
    `${asp}The level of care and attention I received was outstanding. The doctors are exceptionally skilled and speak to you as a human being, not just a patient. They take time to explain the diagnosis in simple terms, which is genuinely reassuring. The hospital is spotlessly clean, the environment is calm, and equipment is modern. The waiting time was minimal and the appointment process was smooth. Treatment costs were very reasonable and completely transparent.`,
    `The doctors at ${n} are what make it stand out. ${asp}They are thorough, patient, and extremely knowledgeable. The nursing staff mirrors that dedication, attentive, kind, and professional. The hospital environment is hygienic and comfortable. Emergency response is quick and effective. Billing is transparent and very reasonable compared to other hospitals in Bengaluru.`,
    `${asp}I have been to many hospitals in Bengaluru over the years, but ${n} is on a different level entirely. The infrastructure is modern, the staff is highly trained, and the overall patient experience is carefully thought out. Doctors spend quality time with each patient and the communication is excellent. There were no unexpected charges and no unnecessary procedures recommended.`,
    `What sets ${n} apart is its culture of genuine care. ${asp}Every person I interacted with, from the reception staff to the senior doctors, was professional, courteous, and focused on patient wellbeing. The facility is clean, the processes are efficient, and the medical expertise is excellent. I was particularly impressed by how transparent they are about treatment plans and costs.`,
    `I visited ${n} for a serious concern and left feeling genuinely cared for. ${asp}The doctors were thorough, spending significant time understanding my history before explaining the diagnosis in detail. The nursing staff was compassionate and responsive. The hospital itself is modern, hygienic, and well-maintained. I had visited other hospitals in ${loc} before, but the quality of care at ${n} is significantly better.`,
    `${asp}The professionalism at ${n} is truly commendable. From the moment you walk in, there is a clear sense that the hospital is focused on patient wellbeing above everything else. Doctors are experienced and empathetic. Staff is helpful and courteous. The facility is clean and modern. What also stood out was that the billing was completely transparent, exactly what was quoted, no surprises at all.`,
    `My experience at ${n} restored my faith in healthcare in Bengaluru. ${asp}The specialist who treated me was not only highly skilled but also took time to ensure I completely understood my diagnosis and treatment plan. The hospital is extremely well-maintained, the nursing care is attentive, and the overall environment is calm and reassuring.`,
  ];
  const DC = [
    `For anyone in Bengaluru looking for quality, trustworthy, and affordable healthcare, ${n} is absolutely the right choice. I would not hesitate to recommend it to family and friends.`,
    `I have visited other hospitals in ${loc} and Bengaluru before, but ${n} stands out for its unique combination of expertise, empathy, and affordability. Highly recommended, 5 stars without hesitation.`,
    `${n} sets a benchmark for healthcare quality in Bengaluru. Whether a routine consultation or a complex procedure, you are in very safe and capable hands here.`,
    `I strongly recommend ${n} to anyone in Bengaluru looking for reliable, compassionate, and expert medical care. It genuinely restores your confidence in healthcare.`,
    `Five stars is not enough for ${n}. The quality of care, the professionalism of the staff, and the affordability of treatment make it genuinely one of the best hospitals in Bengaluru.`,
    `If you are in Bengaluru and need healthcare you can truly trust, ${n} is the answer. The team is exceptional and the care is genuine. Highly recommend without reservation.`,
    `${n} is genuinely one of the best multi-speciality hospitals in ${loc}. Between the medical expertise and the way the whole team treats you, it's an easy recommendation for anyone in the area.`,
  ];
  return `${pick(DO,r)} ${spec}${pick(DM,r)} ${pick(DC,r)}`;
}

// ── Manual review polisher ─────────────────────────────────────
// Mechanical grammar/capitalization cleanup only — no added sentences.
// Used as-is for "keep it as I wrote it", and as the base for polishing.
function cleanTypedText(rawText) {
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

  return text;
}

// Wraps the patient's own (cleaned) text with an intro/closing, seeded by
// `variant` so repeated calls with different variants give reproducible,
// distinct output — same seeding pattern as generateHospitalReview().
function polishManualReview(rawText, liked, hospitalName, location, specialization, visitType, variant) {
  const text = cleanTypedText(rawText);
  if (!text) return '';

  const r = seeded(variant ?? 0);
  const asp = buildAspectSentence(liked, r);
  const loc = location || 'Bengaluru';
  const spec = SPECIALIZATIONS.find(s => s.key === specialization);
  const specClause = spec ? (visitType === 'ip' ? ` I was admitted here for ${spec.phrase}.` : ` I came in for ${spec.phrase}.`) : '';

  const intros = [
    `I recently visited ${hospitalName} in ${loc} and I'm glad to share my experience.`,
    `Had a positive experience at ${hospitalName} in ${loc} and want to share it.`,
    `I visited ${hospitalName} recently and it was a genuinely good experience.`,
    `Sharing my recent experience at ${hospitalName} in ${loc}.`,
    `I want to write about my visit to ${hospitalName} in ${loc}.`,
    `Just came back from ${hospitalName} in ${loc} and wanted to share how it went.`,
  ];
  const intro = pick(intros, r) + specClause;

  // Closing with SEO — mixes generic trust language with keyword-rich
  // (hospital name + category + location) phrasing that helps local search.
  const closings = [
    `I would highly recommend ${hospitalName} to anyone seeking quality and trusted healthcare in ${loc}.`,
    `If you're looking for reliable and affordable healthcare in ${loc}, ${hospitalName} is a great choice.`,
    `${hospitalName} is genuinely one of the best hospitals in ${loc}, highly recommend.`,
    `One of the best multi-speciality hospitals in ${loc}, I'd recommend it without hesitation.`,
    `For anyone searching for a trusted hospital in ${loc}, ${hospitalName} is the right choice.`,
    `Overall a great experience, would recommend ${hospitalName} to anyone in ${loc}.`,
    `${hospitalName} has earned my trust, and I'd point anyone in ${loc} their way.`,
  ];
  const closing = pick(closings, r);

  return `${intro} ${text} ${asp}${closing}`;
}

// Generates `count` distinct polished variants of the same typed text,
// retrying with new seeds until enough unique outputs are collected (capped
// so a pathological case can't loop forever).
function generatePolishedVariants(rawText, liked, hospitalName, location, specialization, visitType, startVariant, count) {
  const texts = [];
  const seen = new Set();
  let v = startVariant;
  let attempts = 0;
  while (texts.length < count && attempts < count * 8) {
    const text = polishManualReview(rawText, liked, hospitalName, location, specialization, visitType, v);
    if (text && !seen.has(text)) { seen.add(text); texts.push(text); }
    v++; attempts++;
  }
  return { texts, nextVariant: v };
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
  // Skips the star-rating step (kept below, unused) — flow now starts
  // directly at specialization, defaulting to a 5-star "excellent" rating.
  const [step, setStep]       = useState(2);
  const [rating, setRating]   = useState('excellent');
  const [visitType, setVisitType]         = useState(null); // 'opd' | 'ip'
  const [specialization, setSpecialization] = useState(null);
  const [liked, setLiked]     = useState([]);
  const [loading, setLoading] = useState(false);

  // Content step: the patient always types their own experience, then
  // either keeps it as-is or has it polished into several distinct
  // options. No more "auto-generate from nothing" mode.
  const [manualText, setManualText]   = useState('');
  const [polishing, setPolishing]     = useState(false);
  const [resultType, setResultType]   = useState(null); // 'raw' | 'polished'
  const [rawReview, setRawReview]     = useState('');
  const [polishedReviews, setPolishedReviews] = useState(null); // [{key,label,text}]
  const [variant, setVariant] = useState(0);
  const POLISH_COUNT = 4;

  const [copied, setCopied] = useState('');

  // Bug fix: this used to be hardcoded to Even Hospitals' own review link for
  // every hospital using this page. Any other hospital client would send their
  // patients to Even Hospitals' Google review box instead of their own. Now it
  // reads each business's own link (set in the admin "Google Business Profile
  // URL" field), falling back to Even Hospitals' link only if that's empty.
  const GOOGLE_REVIEW_URL = hospital?.google_profile_url || 'https://share.google/iBPK7TfzoXQ9Hi94J';

  // Per-business theme, selected via the business's sub_type (e.g. 'altius').
  const theme = THEMES[hospital?.sub_type] || THEMES.default;

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

  // Same "bump reviews_generated" pattern used by both result paths below —
  // fetches the current count fresh right before writing (see bug-fix note
  // further down for why: a stale captured count would silently lose
  // increments across concurrent visitors/clicks).
  const bumpReviewsGenerated = async () => {
    const { data: fresh } = await supabase.from('businesses').select('reviews_generated').eq('id', shopId).single();
    await supabase.from('businesses')
      .update({ reviews_generated: (fresh?.reviews_generated || 0) + 1 })
      .eq('id', shopId);
  };

  const handleKeepRaw = async () => {
    if (!manualText.trim()) return;
    setPolishing(true);
    await new Promise(r => setTimeout(r, 500));
    setRawReview(cleanTypedText(manualText));
    setResultType('raw');
    setPolishing(false);
    setStep(5);
    await bumpReviewsGenerated();
  };

  const handlePolishMulti = async () => {
    if (!manualText.trim()) return;
    setPolishing(true);
    await new Promise(r => setTimeout(r, 900));
    const name = hospital?.shop_name || 'Even Hospital';
    const loc  = hospital?.location || 'Bengaluru';
    const { texts, nextVariant } = generatePolishedVariants(
      manualText, liked, name, loc, specialization, visitType, variant, POLISH_COUNT
    );
    setPolishedReviews(texts.map((text, i) => ({ key: `option${i + 1}`, label: `Option ${i + 1}`, text })));
    setVariant(nextVariant);
    setResultType('polished');
    setPolishing(false);
    setStep(5);
    await bumpReviewsGenerated();
  };

  // id identifies which card was just copied ('manual', or a review-type
  // key like 'short'/'medium'/'detailed') so only that card's button flips
  // to the "Copied!" state, not all of them at once.
  const copyAndOpen = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    // Bug fix: this page never tracked "Submitted" at all, so the dashboard
    // always showed 0 regardless of how many people copied and opened Google,
    // even though we obviously can't know if they actually hit Post on Google's
    // side once they leave this page.
    const { data: fresh } = await supabase.from('businesses').select('reviews_submitted').eq('id', shopId).single();
    await supabase.from('businesses').update({ reviews_submitted: (fresh?.reviews_submitted || 0) + 1 }).eq('id', shopId);
    setTimeout(() => {
      window.open(GOOGLE_REVIEW_URL, '_blank');
      setCopied('');
    }, 600);
  };

  // Only meaningful for the polished path — the raw path is a deterministic
  // cleanup of exactly what the patient typed, so there's nothing to reroll.
  const regeneratePolished = () => {
    const name = hospital?.shop_name;
    const loc  = hospital?.location;
    const { texts, nextVariant } = generatePolishedVariants(
      manualText, liked, name, loc, specialization, visitType, variant, POLISH_COUNT
    );
    setPolishedReviews(texts.map((text, i) => ({ key: `option${i + 1}`, label: `Option ${i + 1}`, text })));
    setVariant(nextVariant);
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
      <div style={{ width: 40, height: 40, border: '4px solid #bae6fd', borderTopColor: theme.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const ratingObj = RATING_OPTIONS.find(r => r.key === rating);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0f9ff 0%,#e0f2fe 50%,#f0fdf4 100%)', padding: '0 0 80px', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <style>{ANIM}</style>

      {/* Header */}
      <div style={{ background: theme.gradient, padding: '0 20px' }}>
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: 600, maxWidth: '100%' }}>
            <span style={{ color: '#4ade80', flexShrink: 0 }}>●</span>
            <span style={{ minWidth: 0, overflowWrap: 'break-word' }}>Verified Hospital · {hospital.location}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#e0f2fe' }}>
        <div style={{ height: 4, background: theme.gradient, width: `${((step - 1) / 4) * 100}%`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
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
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 16, border: `2px solid ${rating === r.key ? theme.primary : '#e2e8f0'}`, background: rating === r.key ? theme.light : '#fafafa', cursor: 'pointer', transition: 'all 0.18s', textAlign: 'left' }}>
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

        {/* ══ STEP 2: What did you come in for? ══ */}
        {step === 2 && (
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(14,165,233,0.1)', border: '1px solid #e0f2fe' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🩺</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>What did you visit us for?</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>This helps make your review more specific.</p>
            </div>

            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Visit type</p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
              {VISIT_TYPES.map(v => (
                <button key={v.key} onClick={() => setVisitType(v.key)}
                  style={{ flex: 1, padding: '12px 8px', borderRadius: 14, border: `2px solid ${visitType === v.key ? theme.primary : '#e2e8f0'}`, background: visitType === v.key ? theme.light : '#fafafa', cursor: 'pointer', transition: 'all 0.15s', fontWeight: 700, fontSize: 13, color: visitType === v.key ? theme.dark : '#374151' }}>
                  <span style={{ fontSize: 18, marginRight: 6 }}>{v.emoji}</span>{v.label}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Department / specialization</p>
            <div className="liked-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {SPECIALIZATIONS.map(opt => {
                const sel = specialization === opt.key;
                return (
                  <button key={opt.key} onClick={() => setSpecialization(opt.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 14, border: `2px solid ${sel ? theme.primary : '#e2e8f0'}`, background: sel ? theme.light : '#fafafa', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? theme.dark : '#374151' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{opt.emoji}</span>
                    <span style={{ minWidth: 0, flex: 1, overflowWrap: 'break-word' }}>{opt.label}</span>
                    {sel && <span style={{ flexShrink: 0, color: theme.primary, fontSize: 14 }}>✓</span>}
                  </button>
                );
              })}
            </div>

            <button onClick={() => setStep(3)} disabled={!visitType || !specialization}
              style={{ width: '100%', padding: '15px', borderRadius: 14, background: (visitType && specialization) ? theme.gradient : '#e2e8f0', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: (visitType && specialization) ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
              Continue →
            </button>
          </div>
        )}

        {/* ══ STEP 3: What did you like? ══ */}
        {step === 3 && (
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(14,165,233,0.1)', border: '1px solid #e0f2fe' }}>
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
          <div className="anim-up review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(14,165,233,0.1)', border: '1px solid #e0f2fe' }}>
            <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: theme.primary, fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Back</button>

            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✏️</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>Write your review here</h2>
            </div>

            <textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="What was your experience like? (doctor's name, what stood out, how you felt)"
              style={{ width: '100%', minHeight: 130, padding: '14px 16px', borderRadius: 14, border: '2px solid #e2e8f0', fontSize: 14, lineHeight: 1.6, color: '#0f172a', background: '#fff', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = theme.primary}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 20px', textAlign: 'right' }}>{manualText.length} characters</p>

            <button onClick={handlePolishMulti} disabled={!manualText.trim() || polishing}
              style={{ width: '100%', padding: '16px', borderRadius: 14, background: manualText.trim() ? theme.gradient : '#e2e8f0', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: manualText.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
              {polishing ? (
                <><div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Polishing...</>
              ) : `✨ Polish Into ${POLISH_COUNT} Options`}
            </button>

            <button onClick={handleKeepRaw} disabled={!manualText.trim() || polishing}
              style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'transparent', color: manualText.trim() ? theme.dark : '#94a3b8', border: `2px solid ${manualText.trim() ? theme.primary : '#e2e8f0'}`, fontWeight: 700, fontSize: 14, cursor: manualText.trim() ? 'pointer' : 'not-allowed' }}>
              Keep It As I Wrote It
            </button>
          </div>
        )}

        {/* ══ STEP 5: Result ══ */}
        {step === 5 && (resultType === 'raw' ? rawReview : polishedReviews) && (
          <div className="anim-up">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span className="anim-cel" style={{ display: 'inline-block', fontSize: 52 }}>🎉</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '10px 0 4px' }}>
                {resultType === 'raw' ? 'Your Review is Ready!' : 'Your Reviews Are Ready!'}
              </h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                {resultType === 'raw' ? 'Exactly as you wrote it, cleaned up and ready to post.' : 'Pick whichever version fits best, then copy and paste on Google.'}
              </p>
            </div>

            {resultType === 'raw' ? (
              <div className="review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(14,165,233,0.12)', border: '1px solid #e0f2fe', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                    {(hospital.shop_name || 'H')[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>Your Review</p>
                    <Stars count={ratingObj?.stars || 5} />
                  </div>
                </div>
                <p style={{ color: '#374151', lineHeight: 1.75, fontSize: 15, margin: '0 0 20px' }}>{rawReview}</p>
                <button onClick={() => copyAndOpen(rawReview, 'raw')}
                  style={{ width: '100%', padding: '16px', borderRadius: 14, background: '#16a34a', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.92'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                  {copied === 'raw' ? '✅ Copied! Opening Google...' : '📋 Copy & Open Google Review'}
                </button>
              </div>
            ) : (
              polishedReviews.map(rev => (
                <div key={rev.key} className="review-card" style={{ background: '#fff', borderRadius: 24, padding: 28, boxShadow: '0 8px 40px rgba(14,165,233,0.12)', border: '1px solid #e0f2fe', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                      {(hospital.shop_name || 'H')[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>{rev.label}</p>
                      <Stars count={ratingObj?.stars || 5} />
                    </div>
                  </div>
                  <p style={{ color: '#374151', lineHeight: 1.75, fontSize: 15, margin: '0 0 20px' }}>{rev.text}</p>
                  <button onClick={() => copyAndOpen(rev.text, rev.key)}
                    style={{ width: '100%', padding: '16px', borderRadius: 14, background: '#16a34a', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.92'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                    {copied === rev.key ? '✅ Copied! Opening Google...' : `📋 Copy ${rev.label} & Open Google`}
                  </button>
                </div>
              ))
            )}

            {resultType === 'polished' && (
              <button onClick={regeneratePolished}
                style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'transparent', color: '#64748b', border: '2px solid #e2e8f0', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}>
                🔄 Generate Different Options
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
                <li>{resultType === 'polished' ? 'Pick a version and click' : 'Click'} <strong>"Copy & Open Google"</strong></li>
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
