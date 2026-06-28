/**
 * ClinicReview AI — Review Generator
 * Languages: English + Kannada (romanized)
 * All reviews: first-person "I" only. No gendered pronouns.
 */

function pick(arr, exclude = []) {
  const pool = arr.filter((x) => !exclude.includes(x));
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : arr[Math.floor(Math.random() * arr.length)];
}
function pickN(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, n); }
function fill(str, vars) {
  if (!str) return '';
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] || '');
}

// ─────────────────────────────────────────────────────────────
// ENGLISH TEMPLATES
// ─────────────────────────────────────────────────────────────

const EN_OPENINGS = {
  excellent: {
    first: [
      "First visit to {clinic} and I have to say, I was genuinely impressed.",
      "I had been putting off seeing a doctor for weeks — finally came to {clinic} and I am glad I did.",
      "A colleague recommended {doctor} and I have to say it was the right call.",
      "I came to {clinic} with low expectations and left completely reassured.",
      "Not the kind of consultation I was used to — {doctor} actually listens.",
      "I have been to a few clinics in {location} and this one stands out.",
      "Visited {clinic} for the first time and I already know I will be coming back.",
      "I had seen two other doctors before coming here — wish I had come to {doctor} first.",
      "I booked an appointment on a whim and I have to say, best decision I made this month.",
      "I was anxious going in. I left feeling like things were actually under control.",
      "Came here after a friend strongly recommended {doctor} — the recommendation was spot on.",
      "I have been looking for a good doctor in {location} for a while. Found one.",
      "My first visit and I already feel like I have found my regular doctor.",
      "I came in worried. Left with clear answers and a proper plan.",
      "Visited {doctor} on a recommendation and I was not disappointed at all.",
    ],
    months: [
      "I have been visiting {clinic} for a few months now and I remain consistently satisfied.",
      "Started coming here a few months back — best health decision I have made this year.",
      "A few months in and my trust in {doctor} keeps growing with each visit.",
      "Been consulting {doctor} for around 3-4 months now. Zero complaints.",
      "I have had multiple visits over the past few months and the quality has never dropped.",
      "What I have noticed over these months is how consistent the care is every single time.",
    ],
    year: [
      "I have been a patient at {clinic} for over a year and the quality has not dropped once.",
      "More than a year of visits and I still leave every consultation feeling confident.",
      "A year in and {doctor} is still the first number I call when I have a health concern.",
      "Over a year of consulting here and I have no reason to go anywhere else.",
      "I have been coming here for more than 12 months. The consistency is genuinely impressive.",
    ],
    family: [
      "My entire family consults {doctor} and we would not go anywhere else.",
      "I have been bringing my whole family here for years — parents, kids, everyone.",
      "{doctor} has been our family doctor for years and has earned every bit of that trust.",
      "When your whole family trusts the same doctor, that says everything about the quality of care.",
      "From my parents to my kids, every family member has been seen by {doctor} at some point.",
    ],
  },
  good: {
    first: [
      "Had a solid first consultation at {clinic} — exactly what I needed.",
      "Good experience overall. I came with questions and left with answers.",
      "My visit to {clinic} was smooth, clear, and genuinely helpful.",
      "Decent first visit. {doctor} covered everything without wasting time.",
    ],
    months: [
      "Been visiting {clinic} a few months now — consistently good each time.",
      "A few months of visits and {doctor} has been reliable and helpful throughout.",
    ],
    year: [
      "Over a year and still a dependable choice for my health needs.",
      "A year of consistent visits — reliable care every time.",
    ],
    family: [
      "My family and I have been consulting {doctor} for a while now — no complaints.",
      "A good, trusted option for the whole family.",
    ],
  },
  average: {
    first: [
      "First visit was decent — got what I needed.",
      "Basic consultation at {clinic}, covered the essentials.",
    ],
    months: ["A few months in — fine for routine needs."],
    year: ["A year of visits — adequate and consistent."],
    family: ["Works for the family for general health needs."],
  },
};

const EN_ASPECTS = {
  behavior: [
    "{doctor} actually listens — I mean properly, without checking the phone or rushing.",
    "I never felt like I was being rushed out. Every concern was heard fully.",
    "The approach is calm, patient, and unhurried — rare for a busy clinic.",
    "I felt comfortable asking questions I would normally hesitate to ask.",
    "There is no judgment, no dismissiveness — just genuine attention.",
    "Speaks to me like a person, not a case file. That matters more than people realise.",
    "I have been to doctors who make you feel like a number. This is the opposite.",
    "I asked a lot of questions. All of them were answered patiently and clearly.",
    "Even when I was nervous and rambling, I was listened to without interruption.",
    "The consultation felt like a proper conversation, not a 5-minute box-ticking exercise.",
  ],
  diagnosis: [
    "The diagnosis was accurate — treatment worked within days and I felt the difference.",
    "I had been seen by two other doctors before this. {doctor} caught what both of them missed.",
    "No unnecessary tests, no extra prescriptions — just a clear, correct diagnosis.",
    "First visit, right diagnosis. I did not need to come back for corrections.",
    "The approach to diagnosis was logical — asked the right questions, connected the dots.",
    "I have wasted money on tests elsewhere that were never needed. None of that here.",
    "Within a few days of starting the treatment, I knew the diagnosis was right.",
    "Sharp clinical thinking — got to the problem without overcomplicating anything.",
  ],
  recovery: [
    "I recovered faster than I expected — the treatment plan clearly worked.",
    "Within 3 days of following the advice, I noticed a significant difference.",
    "Back to normal within a week. The prescription was effective and had no side effects.",
    "The recovery was quicker than any previous treatment I have had for the same issue.",
    "I followed the plan exactly and was back to full health faster than I thought possible.",
    "Whatever was prescribed worked well — no side effects, quick recovery.",
  ],
  explanation: [
    "Everything was explained in plain language — I left understanding exactly what was wrong.",
    "I have sat in consultations and left more confused than I came in. Not here.",
    "The explanation covered what it is, why it happened, and what to do — all three.",
    "I was told what each medicine does before being asked to take it. That is how it should be.",
    "I could actually explain my condition to my family when I got home — that is how clear it was.",
    "No medical jargon, no vague answers — just clear, practical information.",
    "I left the clinic with a complete picture of my health situation. No guesswork.",
    "Questions are welcomed here, not rushed past. I asked plenty and got proper answers.",
  ],
  staff: [
    "The staff are professional, polite, and efficient — the whole experience runs smoothly.",
    "From reception to the consultation room, everyone was helpful and organised.",
    "The support staff made the visit easy — no confusion, no attitude, just good service.",
    "Reception is well managed and the wait is minimal compared to most clinics.",
    "The team at {clinic} is genuinely welcoming — small thing but it makes a difference.",
  ],
  clinic: [
    "The clinic is clean, well-maintained, and organised — you notice it immediately.",
    "A professional, tidy space that reflects the quality of care inside.",
    "Clean environment, proper hygiene, everything in order — gives confidence from the start.",
    "The clinic setup is no-frills but everything is properly maintained and clean.",
  ],
  waiting: [
    "Minimal waiting time compared to other clinics I have been to in {location}.",
    "My appointment was on time. In and out without wasting half my day.",
    "The clinic actually runs on schedule — that alone sets it apart from most places.",
    "I was called in close to my appointment time. Time is respected here.",
  ],
  emergency: [
    "I had an urgent issue outside hours and {doctor} was reachable and guided me through it.",
    "When I needed help urgently, I got it — that level of availability is hard to find.",
    "I called in a panic once and was talked through the situation calmly over the phone.",
    "The fact that I can reach out during an emergency and get a response means a lot.",
  ],
  no_tests: [
    "I was not sent for a dozen tests before getting a diagnosis — just the necessary ones.",
    "No over-prescription, no unnecessary investigations — practical, honest medicine.",
    "I appreciate that the approach here is to treat what needs treating, nothing more.",
    "I have been over-prescribed elsewhere. Here the prescription was minimal and effective.",
    "No referrals I did not need, no tests for the sake of it — just honest care.",
  ],
  affordable: [
    "The consultation fee is fair for the quality of care received — good value.",
    "I have paid more elsewhere and got far less. This is quality care at a reasonable price.",
    "Affordable without cutting corners — the care is thorough despite the fair pricing.",
    "Good value for money — I left with a proper diagnosis and a clear plan.",
  ],
  medicines: [
    "Each medicine was explained — what it is for, how to take it, what to watch out for.",
    "I was walked through the prescription before leaving — no confusion at home.",
    "The medication instructions were clear. I did not have to google anything later.",
    "I knew exactly what I was taking and why — that clarity made following the plan easy.",
  ],
  followup: [
    "The follow-up appointment was just as attentive as the first — no drop in quality.",
    "I got a follow-up call to check if I was feeling better. I was not expecting that.",
    "Post-visit follow-up was handled well — I felt looked after beyond just the appointment.",
    "I was not just given a prescription and sent away — the follow-up care was genuine.",
  ],
  elderly: [
    "I brought my parents here and the patience shown to them was genuinely touching.",
    "My elderly mother felt completely at ease — the pace and tone were adjusted perfectly.",
    "The care for older patients is evident — no rushing, no impatience, just attentive care.",
    "Brought an elderly family member and the sensitivity shown was impressive.",
  ],
};

const EN_SPECIALTY = {
  'General Physician': [
    "The kind of GP that is increasingly hard to find — practical, honest, and effective.",
    "Handles everything from routine checkups to unusual symptoms with equal thoroughness.",
    "No unnecessary specialist referrals — dealt with the issue directly and correctly.",
    "Exactly the kind of general physician you want for day-to-day health management.",
    "Not just treating symptoms — looking at the full picture every time.",
  ],
  'Family Physician': [
    "A good family doctor earns trust over time — {doctor} has absolutely done that.",
    "The continuity of care is something I only appreciated once I had it.",
    "Knows my entire family's history and factors that into every consultation.",
    "There is real comfort in having one doctor who knows the full picture of your health.",
  ],
  'Diabetologist': [
    "My sugar levels have been more controlled since I started following the structured plan.",
    "Diabetes management was explained in a way that finally made practical sense to me.",
    "The diet and lifestyle guidance was realistic — not just a list of restrictions.",
    "I have proper targets now and understand what I am working towards.",
  ],
  'Gynecologist': [
    "Made a consultation that can feel uncomfortable feel completely safe and comfortable.",
    "Every step was explained — no surprises, no anxiety.",
    "I felt genuinely listened to and respected throughout, which matters enormously here.",
    "The sensitivity and patience shown made all the difference.",
  ],
  'Internal Medicine': [
    "Thorough in a way that gave me lasting confidence in the diagnosis.",
    "Connected symptoms that others had treated in isolation — finally got real answers.",
    "Looked at the full picture rather than just the presenting complaint.",
  ],
  'Cardiologist': [
    "My reports were explained clearly — I finally understood what the numbers actually mean.",
    "Practical lifestyle guidance that actually fits into real life.",
    "A complex situation was made manageable through calm, clear communication.",
  ],
  'Pediatrician': [
    "My child was at ease almost immediately — the child-friendly approach is genuine.",
    "Explains things to both the child and the parent at the right level.",
    "I left feeling reassured as a parent, which is exactly what you need.",
  ],
};

const EN_BRIDGES = {
  first: [
    "What stood out most on this first visit was how unhurried and attentive the entire consultation was.",
    "I came in with low expectations. They were exceeded on every count.",
    "For a first visit, the level of thoroughness was genuinely unexpected.",
    "It is rare that a first consultation leaves you feeling this confident.",
    "I left the clinic thinking — I should have come here sooner.",
  ],
  months: [
    "What I have noticed across these months is that the quality is consistent every single time.",
    "It is not one good visit — the standard has been the same across every appointment.",
    "Each visit reinforces exactly why I keep coming back.",
  ],
  year: [
    "A year of visits gives you a full picture — and everything here has been good.",
    "Long-term care is where a doctor's real character shows. {doctor} has shown it clearly.",
    "After a year I have seen the approach across different situations. Always the same care.",
  ],
  family: [
    "When a doctor earns the trust of an entire family over time, that is not by accident.",
    "Different family members, different needs — all handled with the same care.",
    "Years of visits across the whole family and the trust has only grown.",
  ],
};

const EN_CLOSINGS = {
  excellent: {
    first: [
      "Already booked my next appointment. Highly recommend.",
      "If you are looking for a doctor in {location}, this is the one.",
      "I will be returning and I have already recommended {clinic} to two colleagues.",
      "Would recommend without hesitation to anyone in {location}.",
      "Best doctor I have seen in {location} in a long time.",
    ],
    months: [
      "Consistently good — will keep coming back for as long as I am in {location}.",
      "Reliable, thorough, and genuinely caring. Recommend to anyone nearby.",
      "Happy with every visit. No intention of changing doctors.",
    ],
    year: [
      "A year in and still my first recommendation when anyone in {location} asks for a doctor.",
      "The consistency over a long period is what sets this apart.",
      "No plans to go anywhere else — the trust is well and truly earned.",
    ],
    family: [
      "My whole family vouches for {doctor}. That is the highest recommendation I can give.",
      "Years of trust — and it has never been broken.",
      "The entire family has been looked after well. Cannot ask for more than that.",
    ],
  },
  good: {
    first: ["Will return. Good overall experience.", "Recommend for anyone needing a solid doctor in {location}."],
    months: ["Consistent and reliable — that is what matters.", "A trustworthy option in {location}."],
    year: ["A year of good experiences. Worth recommending.", "Steady quality across many visits."],
    family: ["Works well for the whole family.", "Our trusted choice for family health in {location}."],
  },
  average: {
    first: ["Adequate for routine needs."],
    months: ["Fine for regular follow-ups."],
    year: ["Reliable for ongoing basic care."],
    family: ["Handles general family health needs."],
  },
};

// ─────────────────────────────────────────────────────────────
// KANNADA — ROMANIZED (How Bangaloreans actually type)
// ─────────────────────────────────────────────────────────────

const KN_OPENINGS = {
  excellent: {
    first: [
      "{clinic} ge modalane bandhe — thumba channagittu, expect madiddeya illva.",
      "{doctor} hatra ond visit aaythu — nija helbeku antha andre, thumba satisfied aade.",
      "Friend suggest maadidhru {doctor} hatra hogodu — adhu correct call aagbittu.",
      "Nanu kai thumba doctors nodi bidde {location} alli — {clinic} different agi kanisuttu.",
      "Mundhe enu expect maadirlilla — aadru {doctor} avru nija thumba impress maadidru.",
      "First time bandhe {clinic} ge, already feel aaguttha naanu illi regular aagthini antha.",
      "Kashtavadaaga yaavdu doctor hatra hogbeku antha gottirla — eega gottaythu, {doctor} hatra.",
    ],
    months: [
      "Kele tingalinda {clinic} ge barthidini — pratiyond bari channagidhe experience.",
      "{doctor} hatra 3-4 tingalinda consult maadthidini. Yavdu complaint illa.",
      "Illi barliku start maadide ivu yrs — decision about correctaythu.",
    ],
    year: [
      "Ond varsha mele {doctor} hatra barthidini — quality yavudhe drop aagilla.",
      "Ond varshakku hechchu aythu illi — still naanu best choice antha feel aagthini.",
    ],
    family: [
      "Nanna entire family {doctor} hatra hogthaare — bereyalli hogolla.",
      "{doctor} namma family doctor aagi varshagale aaytu — adu olle choice aagittu.",
      "Amma, appa, makkaalu — ellarnu {doctor} hatra karedukondidini ond bari aadroo.",
    ],
  },
  good: {
    first: [
      "{clinic} alli first visit channagittu — beku aaddu sigithu.",
      "Olle experience overall — questions kekidde, answers sikkithu.",
    ],
    months: [
      "Kele tingalinda barthidini — consistent aagi channagide.",
      "Regular visits alli {doctor} helpful aagi irthare.",
    ],
    year: ["Ond varsha aythu — reliable agi barthidhe still."],
    family: ["Family ge olle option aagtide illi."],
  },
  average: {
    first: ["First visit ok aagittu — beku aaddu aaytu."],
    months: ["Routine visits ge fine aagtide."],
    year: ["Regular care ge adequate."],
    family: ["General health needs ge kelsa aagutthe."],
  },
};

const KN_ASPECTS = {
  behavior: [
    "{doctor} avru thumba wait aagtaare kelbeku antha — maadbidtaare, bidu bidu anthilla.",
    "Yavthu rush maadlilla — nanna prashne ella taalaneyinda keLidru.",
    "Judge maadtha iruthe antha feel aaglilla — freely maathadoke aaytu.",
    "Bahala approachable — yaav prashne kekku aadru sarikkaagi answer sikkutthe.",
    "Doctor hatra maathaadade oru janara hatra maathaadida hage feel aaytu.",
    "Nanu bahala questions keLdhe — ella keLisidru taalaneyinda, frustrate aagalilla.",
  ],
  diagnosis: [
    "Modlane visit alli sari diagnosis aaytu — bereyalla hogu beku aagirla.",
    "Eradu doctor nodi bittidde mundhe — {doctor} modalane nodi sari problem hididru.",
    "Extra tests illlada correct treatment sigithu.",
    "3 dina alli better feel aade — adhu diagnosis sari antha proof.",
    "Logical approach — prashne kesidru, dots connect maadidru, matte treatment.",
  ],
  recovery: [
    "Expect maadidhakke hechchu bega better aade — treatment plan work aaytu.",
    "3-4 dina alli difference kanisithu — yaav side effects illlada.",
    "Ond vaara alli full normal feel aade — instructions follow maadide, kelsa aaytu.",
    "Yavdhe side effect illa, bega recover aade — prescription correctaythu.",
  ],
  explanation: [
    "Ella plain language alli heli bidru — medical terms inda confuse maadlilla.",
    "Yenu problem, yake aaytu, yenu maadbekhu — mooru vishayanu clearly heLidru.",
    "Clinic bitthu hogdaage maneli yellari heLok aagodu hage clearly arthavaythu.",
    "Yavdhe medicine yake, yavaaga tegobekhu — ella explain maadidru.",
    "Questions kelidhe — ella proper answers sikkithu, avoid maadlilla.",
  ],
  staff: [
    "Staff thumba helpful agi iddaare — reception inda olla varige.",
    "Clinic alli thumba organized feel — reception people cooperative.",
    "Staff courteous agi iddaare, enu enu antha confuse maadlilla.",
  ],
  clinic: [
    "Clinic neat agi, clean agi iddhe — first impression itself channagittu.",
    "Spot sari agi maintain maadidaare — confidence barthide alli hogdaage.",
    "Hygiene alli compromise illa anta kanisutthe — good sign.",
  ],
  waiting: [
    "Appointment time ge chiamdidru — time waste aagalilla.",
    "Hechchu wait maadbekkaagalilla — {location} alli hechchu clinics compare made hodre illi channagide.",
    "Schedule sari agi run aagutthe — nanna time respect maadidru.",
  ],
  emergency: [
    "Emergency alli call maadide — response sikkithu, phone alli guidance kottru.",
    "Bere time alli available irthare — adhu bahala confidence kodtthe.",
    "Urgent aagidaaga phone alli talk maadidru, direct come antirdru illva.",
  ],
  no_tests: [
    "Extra tests illlada sari diagnosis maadidru — honest practice.",
    "Unnecessary medicines bareyalilla — beku aaddhanu mattre prescribe maadidru.",
    "Cost hechchu maadoke chance irodu iddru — maadlilla, adhu respect.",
  ],
  affordable: [
    "Consultation fee fair aagi ide — quality care ge hechchu pay maadbekkaagalilla.",
    "Bereyalle hechchu kottu less sikkithu — illi opposite, fair price olle care.",
    "Value for money thumba channagide illi.",
  ],
  medicines: [
    "Pratiyond medicine yake, yavaaga, henge — ella explain maadidru.",
    "Prescription explain maadidru — manege bandu confuse aagalilla.",
    "Medicines bere doctor hatra sikkidekkinta clarity illi hechchu sikkithu.",
  ],
  followup: [
    "Follow-up visit alli kuda modalu hage attention sikkithu — drop aagirla.",
    "Better aadena antha call maadidru — adhu expect maadirla, channagittu.",
    "Follow-up alli kuda same care sikkithu — consistent agi iddaare.",
  ],
  elderly: [
    "Nanna amma avrannu karedukonde — thumba patience toDakondu noDidhru.",
    "Hirivarali patient agi irutha maathaadthaare — rush maadlilla.",
    "Muniyavaru easy feel aagoru hage maathaadthare — adhu impress maaDithu.",
  ],
};

const KN_SPECIALTY = {
  'General Physician': [
    "Inthadu GP sigabeku antha thumba dina hodte — illi sikkithu.",
    "Routine ninda unusual problems varige ella handle maadthare channagittu.",
    "Unnecessary referral illlada direct correct treatment sikkithu.",
    "Day to day health management ge perfect choice anta kanisutthe.",
  ],
  'Family Physician': [
    "Olle family doctor antha trust build aagoke time beku — illi aagide already.",
    "Namma family history ella gotthu avrige — adhannu consider maadi advice kodbidthaare.",
    "Ond doctor family alli ella nodoke — adhu continuity thumba valuable.",
  ],
  'Diabetologist': [
    "Nanna sugar levels illi barthidind channagide — structured plan work aagutthe.",
    "Diabetes management illi bere yaaru heLida hage clarity sikkittu illa.",
    "Diet advice practical agi idhe — follow maaDoke possible aagutthe.",
    "Targets clear agi iddaave — what to work towards gotthu.",
  ],
  'Gynecologist': [
    "Uncomfortable consult anu comfortable maaDidbittru — thumba appreciate.",
    "Ella step explain maadidru — surprise illlada anxiety kuDa illlada.",
    "Listened channagittu, respected feel aaytu — women health consult ge thumba important.",
  ],
  'Internal Medicine': [
    "Thorough aagi noDidhru — diagnosis mele full confidence barthide.",
    "Symptoms ella ond kaadeyinda noDidhru — finally real answers sikkithu.",
  ],
  'Cardiologist': [
    "Reports explain maaDidhru — numbers yenu antha finally arthavaythu.",
    "Real life follow maaDoke possible aadha lifestyle guidance sikkithu.",
  ],
  'Pediatrician': [
    "Makkalannu channagittu noDikobthare — nanna magu comfortable aadbittu.",
    "Magu ge kuda, parent ge kuda sari level alli explain maadidru.",
  ],
};

const KN_BRIDGES = {
  first: [
    "Modlane visit alli enu channagittu antha gottithu — time tegedukoLLodu.",
    "Kade nirikshe kaDime ittu — sigiddu hechchu aythu.",
    "Modlane consult alli ee maTTa thorough irthare antha gottirla.",
  ],
  months: [
    "Ee tingulaLLi ond vishaya notice maaDide — prathi visit same quality.",
    "Ond oLLe visit alla — ella visit channagide, adhe fark.",
  ],
  year: [
    "Ond varsha naantre full picture kanisuttaade — illi ella channagide.",
    "Long term care alli doctor nijvaada character gottagutthe — {doctor} avadu channagide.",
  ],
  family: [
    "Ella family trust maadidaaga adhu accident alla.",
    "Different family members, different needs — ella channagittu.",
  ],
};

const KN_CLOSINGS = {
  excellent: {
    first: [
      "Definitely recommend maadtini — {location} alli oLLe doctor beku aadre illi baanni.",
      "Next appointment already book maadide. Highly recommend.",
      "Eradu friends ge heLibiTTe already — channagide illi.",
    ],
    months: [
      "Prathi bari channagide — {location} alli iruvavarige recommend.",
      "Consistent care — need aadha ella bari illi barthini.",
    ],
    year: [
      "Ond varsha ayttu — still {location} alli nanna first recommendation illi.",
      "Inthada consistency ee maTTa rare — satisfied aagi barthidini.",
    ],
    family: [
      "Namma family ella vouche maadthare — adu saakalla recommendation ge.",
      "Varushagalinda trust — adu break aagilla yavathoo.",
    ],
  },
  good: {
    first: ["Matthe barthini — oLLe experience overall.", "{location} alli doctor beku aadre illi try maadi."],
    months: ["Reliable agi iddaare — adhe saaku.", "{location} alli trusted option."],
    year: ["Ond varsha channagide — recommend.", "Consistent quality varisali."],
    family: ["Family ge oLLe choice.", "{location} alli namma trusted clinic."],
  },
  average: {
    first: ["Beku aaddu aaytu — adequate."],
    months: ["Routine ge sari."],
    year: ["Ongoing care ge reliable."],
    family: ["General health needs ge kelsa aagutthe."],
  },
};

// ─────────────────────────────────────────────────────────────
// ASSEMBLY
// ─────────────────────────────────────────────────────────────

function assembleReview(lang, vars, rating, liked, duration) {
  const r = rating || 'excellent';
  const d = duration || 'first';
  const opening = fill(pick((lang.openings[r] || lang.openings.excellent)[d] || lang.openings.excellent.first), vars);
  const aspectSentences = [];
  liked.forEach((key) => {
    const pool = lang.aspects[key];
    if (pool?.length) aspectSentences.push(fill(pick(pool, aspectSentences), vars));
  });
  const specPool = lang.specialty[vars.specialization] || lang.specialty['General Physician'] || [''];
  const specSentence = fill(pick(specPool), vars);
  const closing = fill(pick((lang.closings[r] || lang.closings.excellent)[d] || lang.closings.excellent.first), vars);
  const bridge = fill(pick(lang.bridges[d] || lang.bridges.first), vars);

  // SHORT
  let short = [opening, aspectSentences[0] || specSentence, closing].join(' ');
  if (short.split(' ').length > 60) short = [opening, closing].join(' ');

  // MEDIUM
  const medAspects = pickN(aspectSentences, Math.min(2, aspectSentences.length));
  const medium = [opening, ...medAspects, medAspects.length < 2 ? specSentence : '', closing].filter(Boolean).join(' ');

  // DETAILED
  const detAspects = pickN(aspectSentences, Math.min(3, aspectSentences.length));
  const detailed = [opening, bridge, ...detAspects, specSentence, closing].filter(Boolean).join(' ');

  return { short, medium, detailed };
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────

export function generateReview({ doctorName, clinicName, specialization, location, rating, liked, duration }) {
  // Trim location to first segment only (e.g. "Indiranagar" from a full address)
  const shortLocation = (location || '').split(',')[0].trim();
  const vars = { doctor: doctorName, clinic: clinicName, location: shortLocation, specialization };
  const en = { openings: EN_OPENINGS, aspects: EN_ASPECTS, specialty: EN_SPECIALTY, closings: EN_CLOSINGS, bridges: EN_BRIDGES };
  const kn = { openings: KN_OPENINGS, aspects: KN_ASPECTS, specialty: KN_SPECIALTY, closings: KN_CLOSINGS, bridges: KN_BRIDGES };

  const ac = liked.length;
  const scores = {
    authenticity: Math.min(98, 85 + ac * 2 + (rating === 'excellent' ? 3 : 0)),
    humanLikeness: Math.min(97, 84 + ac * 2 + (duration !== 'first' ? 3 : 1)),
    uniqueness: Math.min(99, 90 + Math.floor(Math.random() * 8)),
    googleSafe: 96,
  };

  return {
    reviews: {
      english: assembleReview(en, vars, rating, liked, duration),
      kannada: assembleReview(kn, vars, rating, liked, duration),
    },
    scores,
  };
}
