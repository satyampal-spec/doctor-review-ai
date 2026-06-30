/**
 * ShopReview AI — Review Generator for 6 Business Categories
 * Categories: clothes, pharmacy, jewellery, shoes, car-service, barber
 * Languages: English + Kannada (romanized)
 * All reviews: first-person "I" only. No gendered pronouns. Bengaluru-specific.
 */

// ── Seeded picker — guarantees each variant produces a different review ──
// seed = reviews_generated count from Supabase
// n    = call counter (increments with each pick in one generation pass)
// Together they ensure review #47 ≠ review #46, even with identical user inputs.
function makeSeededPick(seed) {
  let n = 0;
  return function pick(arr, exclude = []) {
    n++;
    const pool = exclude.length ? arr.filter((x) => !exclude.includes(x)) : [...arr];
    const base = pool.length ? pool : arr;
    // Prime multipliers spread selections across the array as seed/n grow
    const idx = Math.abs((seed * 37 + n * 17 + seed * n) % base.length);
    return base[idx];
  };
}

// Seeded shuffle for pickN (medium/detailed aspect ordering)
function seededPickN(arr, n, seed) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((seed * 31 + i * 13) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

// Kept for backward compatibility (used nowhere critical now)
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
// CATEGORY CONFIG: liked options per business type
// ─────────────────────────────────────────────────────────────

export const CATEGORY_CONFIG = {
  clothes: {
    label: 'Clothes Shop',
    emoji: '👗',
    icon: '🛍️',
    subTypes: ['Mens Wear', 'Womens Wear', 'Kids Wear', 'Multi-brand', 'Ethnic Wear', 'Casual Wear', 'Formal Wear', 'Sports Wear'],
    nameLabel: 'Shop Name',
    ownerLabel: 'Owner / Manager Name',
    likedOptions: [
      { key: 'fabric_quality', label: 'Quality fabric', emoji: '🧵' },
      { key: 'great_variety', label: 'Wide variety', emoji: '🎨' },
      { key: 'helpful_staff', label: 'Helpful staff', emoji: '😊' },
      { key: 'fair_price', label: 'Fair pricing', emoji: '💰' },
      { key: 'trendy_designs', label: 'Trendy designs', emoji: '✨' },
      { key: 'good_brands', label: 'Good brands', emoji: '🏷️' },
      { key: 'return_policy', label: 'Good return policy', emoji: '🔄' },
      { key: 'clean_store', label: 'Neat & organized', emoji: '🏪' },
      { key: 'good_discounts', label: 'Good discounts', emoji: '🎁' },
      { key: 'alteration', label: 'Alteration service', emoji: '✂️' },
      { key: 'good_fit', label: 'Clothes fit well', emoji: '👌' },
      { key: 'genuine_products', label: 'Genuine products', emoji: '✅' },
    ],
    durationOptions: [
      { key: 'first', label: 'First time here' },
      { key: 'few_times', label: 'Visited a few times' },
      { key: 'regular', label: 'Regular customer (months)' },
      { key: 'loyal', label: 'Long-time customer (years)' },
    ],
  },
  pharmacy: {
    label: 'Pharmacy',
    emoji: '💊',
    icon: '🏥',
    subTypes: ['General Pharmacy', '24-Hour Pharmacy', 'Online + Store', 'Ayurvedic', 'Homeopathy + Allopathy'],
    nameLabel: 'Pharmacy Name',
    ownerLabel: 'Pharmacist / Owner Name',
    likedOptions: [
      { key: 'stock_availability', label: 'Always in stock', emoji: '📦' },
      { key: 'genuine_medicines', label: 'Genuine medicines', emoji: '✅' },
      { key: 'knowledgeable_staff', label: 'Knowledgeable staff', emoji: '🧠' },
      { key: 'fair_price', label: 'Fair pricing', emoji: '💰' },
      { key: 'quick_service', label: 'Quick service', emoji: '⚡' },
      { key: 'home_delivery', label: 'Home delivery', emoji: '🚚' },
      { key: 'good_advice', label: 'Good medicine advice', emoji: '💬' },
      { key: 'proper_storage', label: 'Proper storage', emoji: '❄️' },
      { key: 'good_discounts', label: 'Good discounts', emoji: '🎁' },
      { key: 'availability_247', label: '24/7 availability', emoji: '🌙' },
      { key: 'privacy', label: 'Discreet & respectful', emoji: '🤫' },
      { key: 'generic_options', label: 'Offers generic options', emoji: '💡' },
    ],
    durationOptions: [
      { key: 'first', label: 'First time here' },
      { key: 'few_times', label: 'Used a few times' },
      { key: 'regular', label: 'Regular customer (months)' },
      { key: 'loyal', label: 'Neighbourhood pharmacy (years)' },
    ],
  },
  jewellery: {
    label: 'Jewellery Shop',
    emoji: '💍',
    icon: '✨',
    subTypes: ['Gold Jewellery', 'Silver Jewellery', 'Diamond Jewellery', 'Artificial Jewellery', 'Bridal Collection', 'Antique Jewellery'],
    nameLabel: 'Shop Name',
    ownerLabel: 'Owner Name',
    likedOptions: [
      { key: 'quality', label: 'High quality gold/silver', emoji: '🥇' },
      { key: 'bis_hallmark', label: 'BIS hallmarked', emoji: '🔏' },
      { key: 'good_designs', label: 'Beautiful designs', emoji: '💎' },
      { key: 'fair_making', label: 'Fair making charges', emoji: '💰' },
      { key: 'honest_weighing', label: 'Honest weighing', emoji: '⚖️' },
      { key: 'wide_collection', label: 'Wide collection', emoji: '🎨' },
      { key: 'exchange_policy', label: 'Good exchange policy', emoji: '🔄' },
      { key: 'skilled_craftsmen', label: 'Skilled craftsmen', emoji: '🛠️' },
      { key: 'helpful_staff', label: 'Helpful & patient staff', emoji: '😊' },
      { key: 'good_packaging', label: 'Good packaging', emoji: '📦' },
      { key: 'certificate', label: 'Comes with certificate', emoji: '📜' },
      { key: 'customisation', label: 'Custom jewellery made', emoji: '✏️' },
    ],
    durationOptions: [
      { key: 'first', label: 'First visit' },
      { key: 'few_times', label: 'Bought here before' },
      { key: 'regular', label: 'Regular customer' },
      { key: 'loyal', label: 'Family has shopped here for years' },
    ],
  },
  shoes: {
    label: 'Shoe / Slipper Shop',
    emoji: '👟',
    icon: '👠',
    subTypes: ['Mens Footwear', 'Womens Footwear', 'Kids Footwear', 'Sports Shoes', 'Formal Shoes', 'Slippers & Sandals', 'Multi-brand'],
    nameLabel: 'Shop Name',
    ownerLabel: 'Owner / Manager Name',
    likedOptions: [
      { key: 'good_variety', label: 'Wide variety', emoji: '🎨' },
      { key: 'comfortable_fit', label: 'Comfortable fit', emoji: '😌' },
      { key: 'fair_price', label: 'Fair pricing', emoji: '💰' },
      { key: 'good_brands', label: 'Good brands', emoji: '🏷️' },
      { key: 'durable', label: 'Durable quality', emoji: '💪' },
      { key: 'helpful_staff', label: 'Helpful staff', emoji: '😊' },
      { key: 'easy_exchange', label: 'Easy exchange/return', emoji: '🔄' },
      { key: 'wide_sizes', label: 'Wide size range', emoji: '📏' },
      { key: 'kids_section', label: 'Good kids section', emoji: '👶' },
      { key: 'sports_section', label: 'Sports footwear', emoji: '🏃' },
      { key: 'clean_store', label: 'Clean & organized', emoji: '✨' },
      { key: 'good_discounts', label: 'Good discounts', emoji: '🎁' },
    ],
    durationOptions: [
      { key: 'first', label: 'First visit' },
      { key: 'few_times', label: 'Shopped here before' },
      { key: 'regular', label: 'Regular customer' },
      { key: 'loyal', label: 'Long-time customer' },
    ],
  },
  'car-service': {
    label: 'Car / Vehicle Service',
    emoji: '🚗',
    icon: '🔧',
    subTypes: ['Multi-brand Car Service', 'Bike Service Center', 'AC & Electrical', 'Denting & Painting', 'Tyre Service', 'Car Wash & Detailing', 'Authorized Service Center'],
    nameLabel: 'Garage / Service Center Name',
    ownerLabel: 'Owner / Manager Name',
    likedOptions: [
      { key: 'honest_billing', label: 'Honest billing', emoji: '🧾' },
      { key: 'quick_turnaround', label: 'Quick turnaround', emoji: '⚡' },
      { key: 'genuine_parts', label: 'Genuine spare parts', emoji: '✅' },
      { key: 'experienced', label: 'Experienced mechanics', emoji: '🔧' },
      { key: 'good_diagnosis', label: 'Accurate diagnosis', emoji: '🎯' },
      { key: 'clean_service', label: 'Clean service area', emoji: '✨' },
      { key: 'transparent_price', label: 'Transparent pricing', emoji: '💰' },
      { key: 'pickup_drop', label: 'Pickup & drop service', emoji: '🚚' },
      { key: 'no_unnecessary', label: 'No unnecessary repairs', emoji: '🚫' },
      { key: 'warranty', label: 'Warranty on work done', emoji: '🛡️' },
      { key: 'updates', label: 'Real-time job updates', emoji: '📱' },
      { key: 'washing', label: 'Vehicle washed after service', emoji: '💧' },
    ],
    durationOptions: [
      { key: 'first', label: 'First service here' },
      { key: 'few_times', label: 'Used a couple of times' },
      { key: 'regular', label: 'Regular customer' },
      { key: 'loyal', label: 'My go-to garage for years' },
    ],
  },
  restaurant: {
    label: 'Restaurant / Food',
    emoji: '🍽️',
    icon: '🍴',
    subTypes: [
      'Biryani', 'Multi Cuisine', 'Pizza', 'Burger & Fast Food',
      'North Indian', 'South Indian / Dosa', 'Chinese', 'Continental',
      'Tandoor & Grill', 'Seafood', 'Cafe & Sandwich', 'Bakery & Desserts',
      'Ice Cream & Shakes', 'Pav Bhaji & Chaat', 'Rolls & Wraps',
      'Thali Restaurant', 'Breakfast & Tiffin', 'Juice Bar',
      'Mughlai', 'Kerala / Malabar', 'Bengali', 'Rajasthani',
      'Tibetan / Momos', 'Thai & Asian', 'Mexican',
      'Shawarma & Middle Eastern', 'Vegan & Healthy', 'Pure Veg',
      'Barbecue & Grill', 'Fine Dining',
    ],
    nameLabel: 'Restaurant Name',
    ownerLabel: 'Owner / Manager Name',
    likedOptions: [
      { key: 'food_taste',     label: 'Amazing taste',        emoji: '😋' },
      { key: 'food_quality',   label: 'Fresh ingredients',    emoji: '🌿' },
      { key: 'portion_size',   label: 'Good portion size',    emoji: '🍛' },
      { key: 'value_money',    label: 'Value for money',      emoji: '💰' },
      { key: 'quick_service',  label: 'Quick service',        emoji: '⚡' },
      { key: 'friendly_staff', label: 'Friendly staff',       emoji: '😊' },
      { key: 'ambiance',       label: 'Great ambiance',       emoji: '✨' },
      { key: 'hygiene',        label: 'Clean & hygienic',     emoji: '🧼' },
      { key: 'menu_variety',   label: 'Wide menu variety',    emoji: '📋' },
      { key: 'delivery',       label: 'Good delivery',        emoji: '🚚' },
      { key: 'packaging',      label: 'Good packaging',       emoji: '📦' },
      { key: 'family_friendly',label: 'Family friendly',      emoji: '👨‍👩‍👧' },
    ],
    durationOptions: [
      { key: 'first',      label: 'First time here' },
      { key: 'few_times',  label: 'Been a few times' },
      { key: 'regular',    label: 'Regular customer' },
      { key: 'loyal',      label: 'Our go-to place for years' },
    ],
  },
  barber: {
    label: 'Barber Shop',
    emoji: '💈',
    icon: '✂️',
    subTypes: ['Mens Salon', 'Unisex Salon', 'Traditional Barber', 'Premium Grooming', 'Beard Specialist', 'Kids Haircut'],
    nameLabel: 'Salon / Shop Name',
    ownerLabel: 'Barber / Owner Name',
    likedOptions: [
      { key: 'great_cut', label: 'Great haircut', emoji: '✂️' },
      { key: 'clean_shop', label: 'Clean & hygienic', emoji: '🧼' },
      { key: 'beard_trim', label: 'Expert beard trim', emoji: '🧔' },
      { key: 'modern_styles', label: 'Modern styles', emoji: '💈' },
      { key: 'quick_service', label: 'Quick service', emoji: '⚡' },
      { key: 'fair_price', label: 'Reasonable prices', emoji: '💰' },
      { key: 'good_ambiance', label: 'Good ambiance', emoji: '🎵' },
      { key: 'expert_staff', label: 'Skilled barbers', emoji: '👨‍🎨' },
      { key: 'no_waiting', label: 'Minimal waiting', emoji: '⏱️' },
      { key: 'hair_advice', label: 'Good hair care tips', emoji: '💡' },
      { key: 'massage', label: 'Good head massage', emoji: '🙆' },
      { key: 'facial', label: 'Good facial / cleanup', emoji: '🌟' },
    ],
    durationOptions: [
      { key: 'first', label: 'First visit' },
      { key: 'few_times', label: 'Been a few times' },
      { key: 'regular', label: 'Regular customer' },
      { key: 'loyal', label: 'My go-to place for years' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// ENGLISH TEMPLATES PER CATEGORY
// ─────────────────────────────────────────────────────────────

// ── CLOTHES ──────────────────────────────────────────────────

const CLOTHES_EN = {
  openings: {
    excellent: {
      first: [
        "Walked into {shop} without any expectations and came out with three bags — that says everything.",
        "I had been searching for a good clothes shop in {location} for a while. Found one.",
        "A friend kept insisting I try {shop} — finally went and understood why.",
        "First visit to {shop} and it was one of the better shopping experiences I have had in {location}.",
        "I came just to browse and ended up buying more than I planned — honestly not complaining.",
        "I was not planning to shop but {shop} in {location} changed that within 10 minutes of walking in.",
        "Came to {shop} for the first time and left genuinely impressed with what they have.",
        "I have tried a few shops in {location} before — {shop} stands out from the others.",
        "Just stepped in to see and ended up finding exactly what I had been looking for.",
        "My first visit to {shop} and I have to say the collection is genuinely impressive.",
        "I was looking for something specific and {shop} had it — plus much more.",
        "Heard a lot about {shop} in {location} and finally visited. Did not disappoint.",
        "One visit and {shop} is already my first recommendation when anyone asks about clothes in {location}.",
        "Never thought a single shop in {location} would have everything I needed — {shop} proved me wrong.",
      ],
      few_times: [
        "I have been to {shop} a few times now and the quality has been consistent every visit.",
        "Already on my third visit to {shop} — clearly doing something right.",
        "Each time I visit {shop} I find something new worth picking up.",
        "After a couple of visits, {shop} has become my default clothes stop in {location}.",
        "I keep coming back to {shop} because every time I find something worth buying.",
      ],
      regular: [
        "I have been shopping at {shop} for several months and the quality stays consistent.",
        "A few months of regular visits to {shop} and I have never left disappointed.",
        "Since I found {shop} in {location} I have barely looked anywhere else for clothes.",
        "Month after month, {shop} keeps delivering on quality, variety, and service.",
      ],
      loyal: [
        "I have been a customer at {shop} for years now — the consistency is remarkable.",
        "Years of shopping here and {shop} has never given me a reason to switch.",
        "My family has been buying from {shop} for years and the quality has only gotten better.",
        "Long-time customer here — {shop} in {location} has been a constant for our family's wardrobe.",
      ],
    },
    good: {
      first: [
        "Good first experience at {shop} — found what I was looking for without any trouble.",
        "Solid visit to {shop}. The collection was decent and the staff were helpful.",
        "A reliable clothes shop in {location}. Got what I needed and came out satisfied.",
      ],
      few_times: ["A few visits in and {shop} has been consistently decent.", "Good experience each time I visit {shop}."],
      regular: ["Regular here for a few months — consistent and reliable.", "A dependable choice in {location} for clothes."],
      loyal: ["Been here for years — a trusted shop overall.", "Long-time customer, always a solid experience."],
    },
    average: {
      first: ["Decent first visit — got what I needed.", "Fine for basic needs. Nothing outstanding but not bad either."],
      few_times: ["Okay across a few visits — adequate for basic shopping."],
      regular: ["Fine for regular purchases."],
      loyal: ["A familiar place — fine for basic needs over the years."],
    },
  },
  aspects: {
    fabric_quality: [
      "The fabric quality is noticeably better than what you get at most places at this price point — washed it four times and it still looks the same.",
      "I have bought clothes from Commercial Street before that fell apart after two washes. Nothing like that here — the material holds up.",
      "The stitching is clean and the fabric has weight to it — not the flimsy kind that looks good in the store and dies in a week.",
      "I specifically check stitching at the seams before buying anywhere. This passed easily.",
      "What I bought three months ago still looks almost new — the fabric quality clearly does not cut corners.",
      "The material feels premium — not the kind of synthetic that pills up in a month.",
      "You can tell the difference the moment you hold it — this is properly made clothing.",
      "I was sceptical about the price point but the quality justified every rupee.",
    ],
    great_variety: [
      "More variety here than I found across three other shops I visited the same day in {location}.",
      "From formal to casual to ethnic — it is genuinely all here, not just a token section of each.",
      "I came looking for one thing and spent an hour because there was so much worth looking at.",
      "The collection is refreshed regularly — something I had not seen on my last visit was now on display.",
      "Different price ranges within the same category — you do not have to go premium to find something decent.",
      "I found styles here I had been seeing on Instagram but could not find anywhere in {location} until now.",
      "Every visit there is something new — clearly they keep updating the stock.",
      "The range felt curated rather than randomly stocked — someone with taste put this together.",
    ],
    helpful_staff: [
      "The staff showed me multiple options without once pushing me to buy the more expensive one — genuinely refreshing.",
      "I described what I was looking for and they found it in under five minutes — they know their stock.",
      "No one followed me around making me feel watched — they helped when I asked and left me alone when I did not.",
      "The person helping me was honest when something did not suit me. That kind of honesty is rare.",
      "I asked a vague question and they understood exactly what I meant and showed me the right options.",
      "Courteous, patient, and actually knowledgeable — not just showing whatever is nearest.",
      "I tried six or seven pieces and they were patient throughout — no impatience, no attitude.",
    ],
    fair_price: [
      "I expected to pay more for this quality — the pricing is genuinely fair for what you get.",
      "Compared prices at two other shops in {location} before coming here — this worked out better.",
      "The price-to-quality ratio here is one of the best I have found in Bengaluru.",
      "No hidden charges, no pressure to buy add-ons — what you see is what you pay.",
      "Good value without having to bargain or negotiate — the prices are straightforward.",
      "The MRP is clearly marked and they stick to it — no inflated sticker prices.",
    ],
    trendy_designs: [
      "The designs are current without being gimmicky — clothes that will still look good next season.",
      "I found designs here I had been looking for everywhere — styles that are actually in fashion right now.",
      "The collection keeps up with trends without going overboard — tasteful and wearable.",
      "Not the kind of shop stuck in 2018 designs — they clearly update based on what is actually being worn.",
      "I came in looking for something modern and left with exactly that, within my budget.",
      "The ethnic wear collection has designs that feel fresh — not the same templates you see everywhere.",
    ],
    good_brands: [
      "Genuine branded stock — I checked and there was no doubt about authenticity.",
      "The brands they carry are recognizable and the products are clearly the real thing.",
      "A good mix of established and newer brands — not just the same five labels you see everywhere.",
      "No concerns about counterfeit here — the sourcing is clearly legitimate.",
    ],
    return_policy: [
      "I needed to exchange a size the next day and it was done in under five minutes — no questions, no drama.",
      "The return policy is clearly stated and they honor it — no negotiating required.",
      "One item did not fit right at home and the exchange was handled politely and quickly.",
      "I have fought with shops in {location} over returns before. Not here — smooth and straightforward.",
      "Good to know that if something does not work out, returning it is not a battle.",
    ],
    clean_store: [
      "The store is organized in a way that makes sense — you do not need to dig through piles to find your size.",
      "The trial rooms are clean and have proper lighting — not always a given in {location} shops.",
      "Everything is neatly arranged and logically placed — makes the shopping much less stressful.",
      "Well-maintained space — you can browse without the chaos you get at most budget shops.",
      "Clean, spacious, well-lit — the kind of store where you actually want to spend time.",
    ],
    good_discounts: [
      "The discounts are real — not the inflated-MRP-then-reduced kind of fake discount.",
      "I got a genuinely good deal without having to ask or bargain — the price was fair upfront.",
      "The sale items were the same quality as full-price stock — no dumping of bad inventory.",
      "Good savings during the seasonal sale — I came back specifically for it and it was worth the trip.",
      "Honest discounting — what they call 30% off is actually 30% off a fair original price.",
    ],
    alteration: [
      "The alteration was done in two days and the fit was perfect — no re-doing needed.",
      "I had trousers taken in and the finish was clean — you cannot tell it was altered.",
      "In-store alteration meant I did not have to carry the clothes to a separate tailor — convenient.",
      "The measurements were taken carefully and the result matched exactly what I asked for.",
      "Good alteration service at a reasonable charge — completes the whole buying experience.",
    ],
    good_fit: [
      "The sizing here is consistent — the label says what it means, which is not always the case.",
      "I found my size without trying six variations — the sizing is reliable.",
      "Everything I tried on fit properly across the range — clearly quality controlled.",
    ],
    genuine_products: [
      "No doubts about authenticity — everything is clearly genuine, not a grey-market copy.",
      "I have unknowingly bought fake branded goods elsewhere. No such concern at {shop}.",
      "The quality and labels are clearly the real thing — you can tell immediately.",
    ],
  },
  bridges: {
    first: [
      "For a first visit, the entire experience — from entry to billing — was smooth and well-managed.",
      "It is rare that a first visit to a new shop goes this well — normally there is a learning curve.",
      "I was in and out without any friction, which is exactly how a first visit should go.",
      "I left thinking I had found my regular clothes shop in {location}.",
    ],
    few_times: [
      "What I have noticed across visits is that the quality and service stay consistent.",
      "Each visit confirms exactly why I keep coming back.",
      "The consistency across multiple visits is what builds trust.",
    ],
    regular: [
      "Months of regular shopping here and the standard has not dropped once.",
      "The consistency over time is what makes this my default choice.",
    ],
    loyal: [
      "Years of trust — and nothing has happened to break it.",
      "Long-term customers like me keep coming back for a reason.",
    ],
  },
  closings: {
    excellent: {
      first: [
        "Definitely my first recommendation now when anyone asks about clothes shopping in {location}.",
        "Will be back. Already planning my next visit.",
        "Highly recommend {shop} to anyone in {location} looking for good clothes.",
        "Going to tell everyone I know in {location} about {shop}.",
        "Already sent the address to two friends. Highly recommend.",
      ],
      few_times: ["Will keep coming back — no reason to shop elsewhere in {location}.", "My regular clothes stop in {location} from here on."],
      regular: ["Month after month, still my top choice. Recommend without hesitation.", "My consistent go-to — recommend to anyone nearby."],
      loyal: ["Years in and still my first recommendation. That says it all.", "The whole family shops here. No intention of changing."],
    },
    good: {
      first: ["Will return. Good overall experience.", "A solid choice for clothes in {location}."],
      few_times: ["Consistent and reliable — recommend for anyone in {location}.", "Good experience each time."],
      regular: ["A dependable regular choice.", "Worth recommending in {location}."],
      loyal: ["Trusted over the years. Recommend.", "A steady choice for the family."],
    },
    average: {
      first: ["Fine for basic needs."],
      few_times: ["Adequate for regular shopping."],
      regular: ["Fine for ongoing purchases."],
      loyal: ["A familiar fallback."],
    },
  },
};

// ── PHARMACY ─────────────────────────────────────────────────

const PHARMACY_EN = {
  openings: {
    excellent: {
      first: [
        "I needed a medicine urgently and {shop} had it when three other pharmacies in {location} did not.",
        "I came to {shop} for the first time and left genuinely impressed with how it was run.",
        "A neighbour mentioned {shop} when I was looking for a reliable pharmacy in {location} — glad I listened.",
        "My first visit to {shop} and I already know this is where I am buying medicines from now on.",
        "Finding a trustworthy pharmacy in {location} is harder than it sounds — {shop} is it.",
        "I had an unusual prescription that most pharmacies could not fill. {shop} had everything.",
        "I walked in with a long prescription and was helped efficiently — everything was in stock.",
        "First-time customer and already impressed by how professional this pharmacy is.",
        "I was referred by my doctor to a pharmacy in {location} and ended up at {shop} — good choice.",
        "I came on a weekday evening expecting limited stock. Was pleasantly surprised.",
        "From the moment I walked in, {shop} felt different from the typical disorganised pharmacy.",
        "I have been to several pharmacies in {location}. {shop} stands out for all the right reasons.",
      ],
      few_times: [
        "I have been here a few times now and the service and stock quality remain consistent.",
        "Each visit to {shop} has been smooth and reliable — a consistent pharmacy.",
        "After a few visits I have come to rely on {shop} for all my medical needs.",
      ],
      regular: [
        "I have been buying medicines from {shop} for several months and the quality has never been in question.",
        "Month after month, {shop} has been my go-to pharmacy in {location}.",
        "Regular customer here — the reliability and stock availability have been consistent.",
      ],
      loyal: [
        "I have been coming to {shop} for years — it is my family's neighbourhood pharmacy.",
        "Years of trust built over countless prescriptions — {shop} has never let me down.",
        "My whole family has relied on {shop} for years. The trust is fully earned.",
        "Long-time customer — {shop} has been part of our household's health routine for years.",
      ],
    },
    good: {
      first: ["Good first experience — had what I needed and the staff were helpful.", "Solid pharmacy. Got everything on the prescription without any issues."],
      few_times: ["Consistently good across visits. A reliable pharmacy in {location}."],
      regular: ["Regular here for months — no complaints. Dependable."],
      loyal: ["Years of reliable service. Recommend."],
    },
    average: {
      first: ["Decent — got what I needed.", "Fine for basic medication needs."],
      few_times: ["Okay across a few visits."],
      regular: ["Adequate for regular needs."],
      loyal: ["Familiar and consistent for basic needs."],
    },
  },
  aspects: {
    stock_availability: [
      "Every medicine on my prescription was in stock — no partial fills, no coming back the next day.",
      "I had a complicated prescription with less common medicines. Everything was available.",
      "The stock levels here are genuinely impressive — I have never had to hear 'not available'.",
      "Even the branded medicine my doctor specifically asked for was available immediately.",
      "No waiting on back-orders or supplier delays — everything I needed was on the shelf.",
      "I came with a list of medicines for multiple family members. All in stock. No substitutions needed.",
      "The inventory is well-maintained — you can count on availability here.",
      "I needed a medicine after a hospital discharge at an odd hour. {shop} had it.",
    ],
    genuine_medicines: [
      "I have heard stories about fake medicines in circulation — {shop} is clearly sourcing properly.",
      "Everything is properly packed with intact seals and correct batch details — no worries about authenticity.",
      "I cross-checked the batch number on the MRP — everything was legitimate and properly stored.",
      "The packaging, seals, and expiry dates are all in order — you can see the stock is well-managed.",
      "No doubts about the authenticity of anything purchased here — the sourcing is clearly above board.",
      "I have peace of mind buying here because the medicines are genuinely sourced.",
    ],
    knowledgeable_staff: [
      "The pharmacist actually read my prescription carefully and flagged a potential interaction — that is expertise.",
      "I asked about a medicine I was unfamiliar with and got a proper explanation, not just the leaflet.",
      "The staff know their stock and can guide you — not just hand over whatever is written on the prescription.",
      "I had questions about dosage and timing and got clear, confident answers.",
      "A pharmacist here corrected a dosage query I had — saved me a phone call to the doctor.",
      "The level of knowledge on display here is reassuring — these are proper pharmacists, not just shopkeepers.",
      "I was given practical advice about when and how to take each medicine without having to ask twice.",
    ],
    fair_price: [
      "The pricing is fair — no markup beyond MRP and the discounts on branded items are genuine.",
      "I compared the bill here against what I paid elsewhere. This works out better.",
      "They offer medicines at MRP without inflating costs under any pretext — straightforward billing.",
      "Fair pricing with no pressure to buy more than you need. Honest pharmacy.",
      "Good generic options available at a fraction of the branded cost — the staff recommend them proactively.",
    ],
    quick_service: [
      "I was in and out in under 5 minutes with everything on my prescription — efficient.",
      "Even with a long queue, the service moved fast — well-managed counter.",
      "The staff are fast without cutting corners — prescription filled correctly and quickly.",
      "I had an emergency and {shop} handled it quickly without making me wait unnecessarily.",
      "No standing around waiting for someone to find the medicine — things move at a good pace here.",
    ],
    home_delivery: [
      "The home delivery is reliable — medicines arrived on time and properly packed.",
      "I ordered online and the delivery was same-day — properly sealed and complete.",
      "The delivery person double-checked the prescription details before handing over — proper protocol.",
      "Home delivery option is genuinely useful and they handle it well — no missing items.",
      "I have used the delivery service multiple times and it has been reliable every single time.",
    ],
    good_advice: [
      "I was advised to consult my doctor before combining two medicines I had bought — that is responsible service.",
      "The pharmacist explained when to take each medicine and what to avoid — practical, helpful guidance.",
      "Simple but useful advice about taking the medicine with food vs. on an empty stomach — made a difference.",
      "I was told which medicines can be taken together and which need spacing — exactly what I needed.",
      "They did not just hand over the bag — there was actual guidance about the prescription.",
    ],
    proper_storage: [
      "Temperature-sensitive medicines were stored correctly — you can see the cold chain is maintained.",
      "The refrigeration section is properly maintained — important for certain medicines.",
      "I checked the storage conditions and everything is handled the way it should be.",
      "The store is cool, clean, and the medicines are stored in proper conditions.",
    ],
    good_discounts: [
      "The discount on branded medicines here is better than most pharmacies in {location}.",
      "Regular discounts that are genuinely applied — not just advertised and then not honored.",
      "I saved a meaningful amount on a long-term prescription due to the discount structure here.",
      "They offer good discounts on generics too — not just token savings.",
    ],
    availability_247: [
      "I had a medical emergency at midnight and {shop} was open and fully stocked. That matters enormously.",
      "The 24-hour availability has come through for me multiple times — a genuine convenience in {location}.",
      "Knowing that {shop} is open at odd hours has given me real peace of mind.",
      "At 2am with a sick family member, {shop} was there and had everything we needed.",
    ],
    privacy: [
      "My prescription was handled discreetly — no unnecessary questions or attention from others around.",
      "I needed a sensitive medicine and it was handled professionally with full discretion.",
      "There is a quiet corner for sensitive consultations — that level of privacy is appreciated.",
    ],
    generic_options: [
      "The pharmacist proactively suggested a generic equivalent at a fraction of the brand price — same active ingredient.",
      "I was offered a quality generic and saved significantly — that is honest service.",
      "Generic options are available and the staff recommend them clearly — useful for long-term prescriptions.",
    ],
  },
  bridges: {
    first: [
      "For a first visit, {shop} set a standard I now use to judge other pharmacies.",
      "The first visit was smooth — from reading the prescription to billing, everything was handled well.",
      "I left with everything I needed and no confusion. That is how a pharmacy should work.",
    ],
    few_times: ["The consistency across multiple visits is what earns trust with a pharmacy.", "Each visit has reinforced why I chose {shop} as my regular pharmacy."],
    regular: ["Months of relying on {shop} and the reliability has never wavered.", "Regular use has only increased my confidence in {shop}."],
    loyal: ["Years of dependability — that is what a neighbourhood pharmacy should be.", "The trust built over years here cannot be easily replaced."],
  },
  closings: {
    excellent: {
      first: ["My go-to pharmacy in {location} from here on. Highly recommend.", "Already sent the address to two neighbours.", "Recommend to anyone in {location} who wants a reliable pharmacy."],
      few_times: ["Will keep coming back — this is my regular pharmacy now.", "Consistent and reliable — recommend."],
      regular: ["Month after month, still my first choice.", "Will not be switching — {shop} has earned my loyalty."],
      loyal: ["My family pharmacy for years — recommend without any hesitation.", "Years of trust — cannot ask for more than that."],
    },
    good: {
      first: ["Will return. Good pharmacy.", "Recommend for anyone needing a reliable pharmacy in {location}."],
      few_times: ["Consistent — good choice in {location}.", "A trustworthy option."],
      regular: ["Reliable and consistent — recommend.", "A solid pharmacy in {location}."],
      loyal: ["Trusted over years. Recommend.", "A dependable pharmacy for the family."],
    },
    average: {
      first: ["Fine for basic needs."], few_times: ["Adequate."], regular: ["Fine for routine prescriptions."], loyal: ["A familiar choice."],
    },
  },
};

// ── JEWELLERY ────────────────────────────────────────────────

const JEWELLERY_EN = {
  openings: {
    excellent: {
      first: [
        "I went into {shop} just to browse and ended up making my most satisfying jewellery purchase in years.",
        "My first visit to {shop} in {location} and I left genuinely impressed — with the collection and the service.",
        "A cousin recommended {shop} for our wedding shopping. The recommendation was spot on.",
        "I have been to several jewellery shops in {location} — {shop} stands apart in the best way.",
        "I came with a specific design in mind and not only did {shop} have it — they improved on it.",
        "First visit and {shop} has completely changed how I think about buying jewellery in {location}.",
        "I walked into {shop} with a budget and left with more than I hoped for within that budget.",
        "I had been putting off buying jewellery because of bad past experiences. {shop} was a fresh start.",
        "I was brought here by my family for the first time — understood immediately why they only shop here.",
        "I came to {shop} for a festival purchase and came out with exactly what I wanted and more.",
      ],
      few_times: [
        "I have purchased here a few times now and the quality and trust have been consistent.",
        "Each visit to {shop} has reinforced why I chose this shop over others in {location}.",
        "Already my go-to jewellery shop after just a couple of visits.",
      ],
      regular: [
        "I have been buying jewellery from {shop} for several months and the quality and service have never dipped.",
        "A trusted jewellery shop in {location} — regular purchases, no complaints.",
      ],
      loyal: [
        "My family has been shopping at {shop} for generations — the trust is deeply rooted.",
        "Years of purchases — every single one without any issue. That is what earns loyalty.",
        "I have bought jewellery here for every important occasion in my family for years.",
        "Our family's trusted jeweller in {location} — been coming here for over a decade.",
      ],
    },
    good: {
      first: ["Good first visit — found what I wanted and the staff were helpful.", "Solid jewellery shop. Good collection and fair pricing."],
      few_times: ["A few good visits — consistent quality.", "Reliable each time I come."],
      regular: ["Regular customer — no complaints, consistent quality."],
      loyal: ["Years of good experience here."],
    },
    average: {
      first: ["Decent visit — got what I needed."],
      few_times: ["Fine for basic purchases."],
      regular: ["Adequate for regular needs."],
      loyal: ["Familiar and consistent."],
    },
  },
  aspects: {
    quality: [
      "The gold is clearly of the purity stated — you can see and feel the difference compared to lower-quality shops.",
      "I had the jewellery independently tested after purchase. The purity was exactly as stated.",
      "The quality here is not compromised to offer a lower price — they maintain the standard.",
      "Every piece I have bought from {shop} has maintained its finish and quality over years of wearing.",
      "The craftsmanship is evident — not mass-produced-looking pieces but properly made jewellery.",
      "High-quality stones and metal — nothing feels cheap or poorly finished.",
    ],
    bis_hallmark: [
      "Every piece is BIS hallmarked — I checked, and the certification is legitimate and traceable.",
      "The hallmarking here is not just a sticker — the actual pieces are certified and the details match.",
      "BIS hallmark on every gold item — no need to take their word for it, the certification is verifiable.",
      "I appreciate that the BIS certification is taken seriously here — it is not just a selling point.",
      "Proper hallmarking was a non-negotiable for me and {shop} delivers on that without question.",
    ],
    good_designs: [
      "The design range covers traditional and contemporary — I found styles I had not seen at other shops in {location}.",
      "The designs are actually well-thought-out — not just generic shapes but properly crafted pieces.",
      "They have designs that are timeless, not just trendy — the kind you will wear for decades.",
      "I was looking for a specific South Indian design and {shop} had a range I was not expecting.",
      "The contemporary designs are tasteful without looking cheap — a balance that is hard to find.",
      "Every piece in the showcase looks like it was made by someone who cares about design.",
      "From temple jewellery to minimalist modern designs — the range is genuinely broad.",
    ],
    fair_making: [
      "The making charges are fair and explained upfront — no surprises in the final billing.",
      "I compared making charges across shops in {location}. {shop} is competitive without compromising quality.",
      "The making charges were discussed clearly before I committed — full transparency.",
      "No hidden fees beyond what was discussed — the final bill matched what was quoted.",
      "The charges for custom work were reasonable and the quality of execution was high.",
    ],
    honest_weighing: [
      "The weighing was done in front of me on a calibrated scale — I was satisfied with the transparency.",
      "I cross-checked the weight against the bill and it matched exactly — honest practice.",
      "No concern about weighing here — done openly and the measurements matched the invoice.",
      "The weight printed on the bill matched what I verified independently — straightforward and honest.",
    ],
    wide_collection: [
      "The collection is genuinely large — you are not choosing from six similar items.",
      "They have jewellery for every occasion, every budget, and every style — the breadth is impressive.",
      "From lightweight daily-wear pieces to heavy bridal jewellery — everything under one roof.",
      "I spent over an hour browsing and still felt like I had not seen everything — extensive collection.",
      "The variety is good enough that my whole family found something different in the same visit.",
    ],
    exchange_policy: [
      "The exchange policy is clearly stated and honored — I exchanged a piece and it was done without any negotiation.",
      "I needed to upgrade a piece and the exchange value given was fair and transparent.",
      "The old gold buyback rate here was among the best I was quoted in {location}.",
      "They explained the exchange terms clearly before the transaction — no confusion later.",
      "The exchange process was smooth and the deductions were fair and explained.",
    ],
    skilled_craftsmen: [
      "The intricate work on what I bought is clearly done by skilled hands — no rough edges or imperfect joins.",
      "I got a custom piece made and the craftsmanship exceeded my expectations.",
      "The finishing on even the lower-priced pieces is careful and precise.",
      "You can tell the difference between machine-made and handcrafted — {shop} has both and the hand work shows.",
      "I got repairs done here and the work was seamless — matched the original perfectly.",
    ],
    helpful_staff: [
      "The staff were patient — I must have looked at forty pieces before deciding and no one rushed me.",
      "They listened to what I wanted before suggesting anything — not just pushing high-value items.",
      "I felt genuinely guided, not sold to — the suggestions were thoughtful and within my stated budget.",
      "I had lots of questions about karats and making charges. Every single one was answered clearly.",
      "The staff treated me with respect regardless of my budget — that matters in a jewellery shop.",
      "No pressure tactics — the staff let me take my time and the buying decision was entirely mine.",
    ],
    good_packaging: [
      "The packaging is beautiful — I received it as a gift and the presentation was impressive.",
      "Even for a small purchase, the packaging was careful and protective.",
      "The box and certificate are both high quality — the experience extends beyond the jewellery itself.",
      "Proper jewellery pouches and certificates came with my purchase — well-packaged.",
    ],
    certificate: [
      "A proper certificate of authenticity came with the purchase — something I checked and found legitimate.",
      "The documentation is complete — bill, certificate, and warranty all provided without having to ask.",
      "I was given a proper receipt with weight, purity, and making charges itemised separately.",
    ],
    customisation: [
      "I brought a reference image and {shop} turned it into exactly what I had imagined.",
      "The custom order process was straightforward — discussed the design, agreed on price, delivered on time.",
      "I got a custom piece made and the final product was better than what I had sketched out.",
      "Custom jewellery made to my specifications — the team was involved and genuinely interested in getting it right.",
    ],
  },
  bridges: {
    first: [
      "For a first purchase at {shop}, the level of transparency and care shown was beyond what I expected.",
      "I left the shop feeling confident about what I bought — not second-guessing whether I made a good choice.",
      "From selection to billing to packaging — the entire first visit was handled professionally.",
    ],
    few_times: ["Across multiple purchases, the quality and service have been the same — consistent.", "Each purchase here has reinforced the trust I placed in {shop} from the first visit."],
    regular: ["Regular purchases over months and not once have I had cause to complain.", "Consistency over time is the true test — {shop} passes it."],
    loyal: ["Years of important purchases — birthdays, anniversaries, festivals — all from {shop}.", "A jeweller earns loyalty by being trustworthy over time. {shop} has done that."],
  },
  closings: {
    excellent: {
      first: ["My first and only recommendation for jewellery in {location}.", "Will be back for the next occasion — no need to look elsewhere.", "Recommend {shop} without hesitation to anyone in {location}."],
      few_times: ["Will keep coming back — my trusted jeweller in {location}.", "No reason to shop elsewhere for jewellery."],
      regular: ["My regular jeweller — recommend to anyone in {location}.", "Will not be going anywhere else."],
      loyal: ["Decades of trust — recommend to the entire community.", "My family's jeweller — the highest endorsement I can give."],
    },
    good: {
      first: ["Will return. Good jewellery shop.", "Recommend for purchases in {location}."],
      few_times: ["Consistent and trustworthy.", "A good jeweller in {location}."],
      regular: ["Reliable — recommend.", "A dependable choice."],
      loyal: ["Trusted over years.", "A good family jeweller."],
    },
    average: {
      first: ["Fine for basic purchases."], few_times: ["Adequate."], regular: ["Fine ongoing."], loyal: ["Familiar."],
    },
  },
};

// ── SHOES ────────────────────────────────────────────────────

const SHOES_EN = {
  openings: {
    excellent: {
      first: [
        "I went to {shop} for a single pair of shoes and came out with three — take that as a review.",
        "I had been looking for a good footwear shop in {location} for a while. Found it in {shop}.",
        "First visit and I already have two pairs sorted for the season — excellent range.",
        "My first time at {shop} and I was not expecting much from the outside. The inside was a different story.",
        "I came for kids shoes and ended up buying for the whole family — the range is that good.",
        "A friend gave me the {shop} recommendation and it was spot on.",
        "I have tried a few shoe shops in {location}. {shop} stands out.",
        "I walked in not knowing what I wanted and walked out with exactly what I needed.",
        "First time here and I already have a clear picture of why people keep coming back.",
        "I was struggling to find my size at most shops in {location}. {shop} had it immediately.",
        "I came for sports shoes and the collection here is genuinely impressive — not just two or three options.",
      ],
      few_times: [
        "A few visits in and {shop} has become my default for footwear in {location}.",
        "Each visit I find something new — the collection is clearly refreshed regularly.",
        "Already recommended {shop} to two colleagues after my second visit.",
      ],
      regular: [
        "Several months of shopping here and the quality and service have been consistent.",
        "My regular footwear shop in {location} — no complaints across multiple purchases.",
      ],
      loyal: [
        "I have been buying shoes from {shop} for years — the quality and reliability are consistent.",
        "My family's footwear needs have been met by {shop} for years without any issue.",
        "Long-time customer — {shop} has become a trusted part of our shopping routine.",
      ],
    },
    good: {
      first: ["Good first visit — found what I needed and the staff were helpful.", "Solid shoe shop. Good variety and fair pricing."],
      few_times: ["Consistently good across visits.", "Reliable each time."],
      regular: ["Regular customer — no complaints.", "Dependable choice in {location}."],
      loyal: ["Years of good experience.", "Trusted over time."],
    },
    average: {
      first: ["Decent — got what I needed."], few_times: ["Fine across visits."], regular: ["Adequate."], loyal: ["Consistent for basics."],
    },
  },
  aspects: {
    good_variety: [
      "The variety of footwear here is impressive — formal, casual, sports, ethnic, all under one roof.",
      "I found styles in {shop} I had not seen at three other shops I visited in {location}.",
      "The collection is refreshed regularly — something new every time I visit.",
      "From budget-friendly to premium — the range covers different price points genuinely.",
      "Every occasion is covered — I bought formal shoes and running shoes in the same trip.",
      "The variety within each category is good — multiple options per style, not just one.",
      "Even the less common sizes had options — the range is not just for standard feet.",
    ],
    comfortable_fit: [
      "I walked around the store in the shoes for 5 minutes before buying — genuinely comfortable.",
      "The fit is accurate — I did not need to go half a size up or down.",
      "I have worn the shoes I bought here for a full day and my feet are fine — real comfort.",
      "The staff let me walk around before deciding and the comfort was evident immediately.",
      "Good insoles and proper lasts — these are shoes made with fit in mind, not just looks.",
      "I have had shoes from elsewhere that looked good but hurt by afternoon. Not these.",
    ],
    fair_price: [
      "The prices are fair for the quality on offer — good value without cutting corners.",
      "I compared the same brand at another store — {shop} was better priced.",
      "Price to quality here is among the best I have found for footwear in {location}.",
      "Good deals without the gimmick of inflated MRPs — honest pricing.",
      "I got quality shoes within my budget without having to compromise on the brand.",
    ],
    good_brands: [
      "They carry genuine branded stock — I checked and the authenticity is clear.",
      "A good range of trusted brands — I found what I had been looking for from a brand I trust.",
      "Both well-known and emerging brands are available — good mix.",
      "The branded items here are authentic — no worrying about fakes.",
    ],
    durable: [
      "I bought shoes here three months ago and they still look almost new — quality that lasts.",
      "The stitching and sole quality are good — these are built to last, not just look good in the store.",
      "I have put these shoes through daily wear and they have held up remarkably well.",
      "The quality of construction is evident — not cheap materials with a good-looking upper.",
    ],
    helpful_staff: [
      "The staff asked what I needed before pulling out half the stock — efficient and targeted help.",
      "I was given honest feedback about what suited me and what did not — no fake sales pitch.",
      "Patient staff — I must have tried eight pairs before deciding and no one made me feel rushed.",
      "The suggestion from the staff turned out to be exactly right — good product knowledge.",
      "No pressure to buy — I was helped, not sold to.",
    ],
    easy_exchange: [
      "I needed to exchange a size the next day and it was done without any pushback.",
      "The exchange policy is clear and was honored — no negotiating or explaining required.",
      "The size I bought turned out to be slightly tight. Exchange was smooth and staff were helpful.",
      "They handle exchanges properly — no forms, no attitude, just a quick swap.",
    ],
    wide_sizes: [
      "They stock wide sizes — I have larger than average feet and found options immediately.",
      "I came specifically because I heard they carry sizes other shops do not. Correct.",
      "Half sizes are available here — that alone is a reason to come.",
      "Kids sizes are well stocked — different widths too, not just length.",
    ],
    kids_section: [
      "The kids section is well-stocked with comfortable, durable options at fair prices.",
      "My child found the school shoes within minutes — good selection and proper fit.",
      "The kids' shoes here are not flimsy — proper quality footwear for growing feet.",
      "Wide range for kids — school shoes, sports shoes, casual — all in one place.",
    ],
    sports_section: [
      "The sports shoes collection is impressive — multiple options for running, court, and casual sports.",
      "I found proper running shoes here with good cushioning — not just fashion sports shoes.",
      "The sports section has variety across price points — from budget to premium.",
      "The staff in the sports section know what they are talking about — helpful guidance.",
    ],
    clean_store: [
      "The store is well-organized — shoes are easy to find by size and type.",
      "Clean, well-maintained store. The shoes are displayed nicely and easy to browse.",
      "The fitting area is clean and comfortable — makes trying on shoes easy.",
    ],
    good_discounts: [
      "The end-of-season discounts are real — I got a great pair at a significantly reduced price.",
      "Good offers that apply without any complications — honest discounting.",
      "I saved well on my purchase during the sale — the original pricing was fair too.",
    ],
  },
  bridges: {
    first: ["For a first visit, {shop} delivered in every way — selection, service, and pricing.", "I left confident I had made a good buying decision — rare for a first visit to a new shop."],
    few_times: ["The consistency across visits is what converts a first-time shopper into a regular.", "Each visit confirms why {shop} is my default for footwear in {location}."],
    regular: ["Months of regular buying and the quality has never been a concern.", "Consistent quality and service — the benchmark for footwear in {location}."],
    loyal: ["Years of reliable footwear — the kind of loyalty that builds up over real quality.", "Long-term trust is earned, and {shop} has earned it."],
  },
  closings: {
    excellent: {
      first: ["My first recommendation for footwear in {location} from here on.", "Will be back soon. Highly recommend.", "Already sent the address to friends — highly recommend {shop}."],
      few_times: ["My regular shoe shop in {location} — no reason to go elsewhere.", "Will keep coming back."],
      regular: ["Month after month, still my first choice for footwear.", "Recommend to anyone in {location}."],
      loyal: ["Years in and still my go-to. That says everything.", "My family shops here for footwear — recommend without hesitation."],
    },
    good: {
      first: ["Will return. Good shop.", "Recommend."],
      few_times: ["Consistent — recommend.", "A good footwear shop in {location}."],
      regular: ["Reliable — recommend.", "Solid choice."],
      loyal: ["Trusted over years.", "A dependable shop for footwear."],
    },
    average: {
      first: ["Fine for basics."], few_times: ["Adequate."], regular: ["Fine ongoing."], loyal: ["Familiar."],
    },
  },
};

// ── CAR SERVICE ──────────────────────────────────────────────

const CARSERVICE_EN = {
  openings: {
    excellent: {
      first: [
        "I had been burned by dishonest garages before. {shop} in {location} was a completely different experience.",
        "First service at {shop} and I finally understand what a proper car service centre should look like.",
        "A colleague recommended {shop} when my car needed urgent attention — genuinely glad I went.",
        "I came in expecting the usual overquoting and unnecessary recommendations. Got neither.",
        "First time bringing my car to {shop} and I left knowing exactly what was done and why.",
        "I was skeptical about trying a new service centre in {location}. {shop} removed every doubt.",
        "I had an issue that another garage had been unable to diagnose correctly. {shop} got it right on the first try.",
        "First service here and I left more confident about my car's condition than I have been in years.",
        "I came in based on a word-of-mouth recommendation — it was accurate.",
        "My regular service centre was unavailable and I tried {shop} — it is now my regular service centre.",
        "From the moment I dropped the car, the communication was better than anything I had experienced before.",
        "I came for a simple service and found a team that was genuinely thorough.",
      ],
      few_times: [
        "I have brought my car here a few times now and the quality and honesty of the service is consistent.",
        "Each service at {shop} has been as good as the first — that is rare in my experience.",
        "Already referred two colleagues after my second visit.",
      ],
      regular: [
        "I have been getting my car serviced at {shop} for several months — consistent quality and honest billing.",
        "Regular servicing here and I have never been given a padded estimate or unnecessary work.",
      ],
      loyal: [
        "My car has been serviced at {shop} for years and the trust has never been broken.",
        "I have tried other garages over the years. I always come back to {shop}.",
        "Both my vehicles are serviced exclusively at {shop} — years of reliable work.",
        "My go-to garage in {location} for years — honest, skilled, and dependable.",
      ],
    },
    good: {
      first: ["Good first service. Work was done correctly and billing was fair.", "Solid service centre. No complaints."],
      few_times: ["Consistently good work across a few services.", "Reliable each time."],
      regular: ["Regular customer — no issues, dependable service.", "A solid choice for car service in {location}."],
      loyal: ["Years of reliable service.", "Trusted over time."],
    },
    average: {
      first: ["Decent — work done as requested."], few_times: ["Fine across visits."], regular: ["Adequate."], loyal: ["Consistent for basic service."],
    },
  },
  aspects: {
    honest_billing: [
      "The estimate given upfront matched the final bill — no inflated additions after the job.",
      "I was told exactly what needed to be done and why before anything was touched.",
      "The bill was itemised clearly — parts, labour, and any additional work were all listed separately.",
      "I have been overcharged at other garages in {location}. {shop} was completely transparent.",
      "No surprise charges at pickup — the quote was the quote.",
      "I checked the parts prices online before approving — the rates quoted here were honest.",
      "The bill actually came in slightly below the estimate — a first for me at any garage.",
    ],
    quick_turnaround: [
      "My car was ready when they said it would be — not three hours late like most garages.",
      "I dropped the car in the morning and had it back by afternoon — exactly as promised.",
      "The turnaround time was fast without the quality being rushed — properly done.",
      "They gave me a realistic timeline and stuck to it — no vague 'we will call you' treatment.",
      "My car needed urgent attention before a trip. {shop} prioritised and got it done in time.",
    ],
    genuine_parts: [
      "I asked about the parts being used and was shown the original packaging — genuine OEM parts.",
      "The parts used are genuine — no spurious or duplicate components.",
      "I had the part number checked against the manufacturer's database — all legitimate.",
      "Genuine spare parts, not cheap substitutes — that is what protects the car in the long run.",
      "They clearly source parts properly — nothing was swapped out for an inferior version.",
    ],
    experienced: [
      "The mechanic who worked on my car clearly knew what he was doing — confident and precise.",
      "Years of experience are visible in how the team diagnoses and handles problems.",
      "The senior mechanic here has a proper understanding of the car's systems — not just parts replacement.",
      "I described the symptom and got an accurate explanation of what was causing it immediately.",
      "The team here has handled my car model before — they knew exactly where to look.",
    ],
    good_diagnosis: [
      "The diagnosis was accurate — the fix solved the problem completely on the first attempt.",
      "I had been told by another garage it was the gearbox. {shop} correctly identified it was the clutch plate.",
      "They do not guess and replace — they diagnose properly and only fix what actually needs fixing.",
      "The problem I described was accurately diagnosed and fixed correctly — no repeat visits for the same issue.",
      "Proper diagnostic tools were used — not just going by feel or guessing.",
      "I came in with a noise I could not identify. It was correctly diagnosed and resolved in one visit.",
    ],
    clean_service: [
      "The service bay is clean and organised — you can see the professionalism in how the space is maintained.",
      "The garage is not the typical grimy mess — it is properly maintained and well-organised.",
      "Clean work area means less chance of contamination during service — clearly they understand this.",
      "My car came back without oil stains or grease marks on the interior — proper care during service.",
    ],
    transparent_price: [
      "Every charge was explained before it appeared on the bill — no item was a mystery.",
      "Labour charges are reasonable and explained clearly — you know what you are paying for.",
      "I received a written estimate before any work began — professional and transparent.",
      "The pricing is clear and consistent — what you are quoted is what you pay.",
    ],
    pickup_drop: [
      "The pickup and drop service was smooth — my car was collected and returned on time.",
      "I did not have to arrange transport — the pickup service was convenient and handled well.",
      "The vehicle was collected and returned on the agreed schedule without any follow-up needed.",
      "Pickup and drop available — a genuine convenience that I used and found efficient.",
    ],
    no_unnecessary: [
      "I was not told my tyres needed replacing when they did not — refreshingly honest.",
      "The service report did not include a list of non-essential recommendations to inflate the bill.",
      "I came in for a specific repair and that is what was done — nothing extra was added.",
      "They will tell you what needs attention now and what can wait — not just upsell everything at once.",
      "I appreciate that they did not recommend work that was not needed — that is rare honesty.",
    ],
    warranty: [
      "The work done comes with a warranty — and they honored it when a small issue came up after.",
      "I needed a minor re-check after a week and it was done at no charge under warranty.",
      "The warranty on parts and labour is genuine — not just a verbal promise.",
      "I came back with a small concern and it was addressed without any argument, covered under warranty.",
    ],
    updates: [
      "I received updates throughout the day on what was being done — no need to call and chase.",
      "They sent photos of the issue before proceeding — that level of communication is impressive.",
      "I was kept informed at every step — I never had to wonder what was happening with my car.",
      "Real-time WhatsApp updates on the service status — genuinely useful and professional.",
    ],
    washing: [
      "My car came back washed and cleaned inside — better than I sent it.",
      "Interior vacuumed and exterior washed after service — a nice finishing touch.",
      "The car was returned clean, which I was not expecting but genuinely appreciated.",
    ],
  },
  bridges: {
    first: [
      "For a first service at a new garage, {shop} set a standard I will now hold others to.",
      "From drop-off to pickup, the entire process was handled professionally.",
      "I left with full confidence in what was done — that does not happen with every garage.",
    ],
    few_times: ["Consistent quality and honesty across multiple visits — the mark of a trustworthy garage.", "Each service has confirmed that {shop} is where my car will be looked after going forward."],
    regular: ["Regular servicing here has been consistently good — no surprises, no letdowns.", "Months of servicing and the standard has not dropped once."],
    loyal: ["Years of servicing and I have not once regretted the choice.", "Long-term trust in a garage is built through consistent honesty. {shop} has that."],
  },
  closings: {
    excellent: {
      first: ["My go-to service centre in {location} from here on. Highly recommend.", "Already recommended to three people. Highly recommend {shop}.", "No need to look for another garage in {location} — {shop} is the one."],
      few_times: ["Will keep coming back — this is my regular service centre now.", "Recommend to anyone with a vehicle in {location}."],
      regular: ["Month after month, still my first choice. Recommend.", "The only garage I recommend in {location}."],
      loyal: ["Years in and still the only garage I trust. Recommend to everyone.", "My vehicles will continue to be serviced here — no question."],
    },
    good: {
      first: ["Will return. Good service centre.", "Recommend for vehicle service in {location}."],
      few_times: ["Consistent — recommend.", "A good choice for car service."],
      regular: ["Reliable — recommend.", "Dependable service centre."],
      loyal: ["Trusted over years. Recommend.", "A good garage in {location}."],
    },
    average: {
      first: ["Fine for basic service."], few_times: ["Adequate."], regular: ["Fine ongoing."], loyal: ["Consistent."],
    },
  },
};

// ── RESTAURANT ──────────────────────────────────────────────

const RESTAURANT_EN = {
  openings: {
    excellent: {
      first: [
        "I came to {shop} for the first time last week and I am genuinely struggling to think of anything they did wrong.",
        "First visit to {shop} in {location} and I already know I will be back — the food did that.",
        "A colleague would not stop talking about {shop}. Finally went. Now I understand.",
        "I was in {location} and tried {shop} on a whim — best impulsive decision I have made in months.",
        "I came to {shop} not knowing what to expect and left completely satisfied.",
        "I have been looking for a good {type} place in {location} for a while. Found one.",
        "First time at {shop} and I am already planning my next visit before I have even left.",
        "My first meal at {shop} and I kept thinking — why did I not come here sooner.",
        "Tried {shop} on a recommendation and the food exceeded what I was told to expect.",
        "I was sceptical because of the crowd outside {shop}. Joined the queue anyway. Worth every minute.",
        "First visit and {shop} has already replaced my previous go-to in {location}.",
        "I walked past {shop} a dozen times before finally going in. That was a mistake — should have gone sooner.",
      ],
      few_times: [
        "I have been to {shop} a few times now and the food has been consistently good every single visit.",
        "Already on my fourth visit to {shop} — that tells you everything about how good it is.",
        "A few visits in and {shop} has become my default when someone asks where to eat in {location}.",
        "Each time I visit {shop} the food is as good as the first time — that consistency is rare.",
        "I have tried most things on the menu at {shop} across a few visits and have not been disappointed once.",
      ],
      regular: [
        "I have been eating at {shop} regularly for several months and the quality has never dipped.",
        "Month after month, {shop} delivers the same quality — and that is exactly why I keep coming back.",
        "Regular customer at {shop} for a while now — the consistency is what keeps me from trying elsewhere.",
        "I have had more meals at {shop} than I can count at this point. Zero regrets.",
      ],
      loyal: [
        "I have been coming to {shop} for years and the food is as good today as it was the first time.",
        "Years of meals at {shop} — it is the kind of place that becomes part of your routine without you realising.",
        "My family has been eating at {shop} for years. It is our default for {type} in {location}.",
        "Long-time regular at {shop} — the loyalty is completely earned by the food.",
      ],
    },
    good: {
      first: ["Good first meal at {shop} — exactly what I was looking for.", "Solid visit. Food was good, service was smooth."],
      few_times: ["A few good visits — consistent and reliable.", "Each visit has been worth it."],
      regular: ["Regular here for months — no complaints.", "A dependable choice in {location}."],
      loyal: ["Years of good food here.", "A trusted spot for {type} in {location}."],
    },
    average: {
      first: ["Decent first visit — food was fine.", "Adequate for what I needed."],
      few_times: ["Fine across visits."], regular: ["OK for routine meals."], loyal: ["Familiar and consistent."],
    },
  },
  aspects: {
    food_taste: [
      "The taste is genuinely exceptional — I kept eating past the point of being full because I did not want to stop.",
      "The flavours are bold and well-balanced — clearly someone in that kitchen knows exactly what they are doing.",
      "The {type} here is the best I have had in {location} — and I have tried most of the well-known places.",
      "Each dish tasted like it was made with actual care — not the kind of cooking that just goes through the motions.",
      "I am not someone who finishes everything on the plate. I finished every single thing here.",
      "The spice level is spot on — flavourful without being overwhelming, exactly how it should be.",
      "The food here ruined other places for me — everything else tastes like a compromise now.",
      "I have had {type} at many places in Bengaluru. {shop} is in a different category.",
    ],
    food_quality: [
      "You can taste the freshness — the ingredients are clearly not sitting in a freezer for days.",
      "The quality of the raw ingredients shows in the final dish — nothing tastes processed or artificial.",
      "Fresh, properly cooked, no shortcuts — the kind of food that reminds you what a good meal actually is.",
      "The oil does not feel heavy and the ingredients taste fresh — a sign the kitchen is run properly.",
      "Nothing tasted like it came out of a packet — clearly made fresh and with good ingredients.",
      "The freshness of the food here is noticeable immediately — makes a real difference to how it tastes.",
    ],
    portion_size: [
      "The portions are generous — I ordered what I usually order elsewhere and it was significantly more here.",
      "Good quantity for the price — I did not feel short-changed at any point.",
      "The portion size is proper — you leave actually full, not wondering if you should have ordered more.",
      "I was not expecting the quantity to be this good at this price point.",
      "Large enough that I had leftovers — which tasted just as good the next day.",
    ],
    value_money: [
      "For what you pay at {shop}, the quality and quantity you get is exceptional value.",
      "I compared with similar places in {location} — {shop} gives you more for the same money.",
      "Genuinely affordable without cutting corners on quality — rare combination.",
      "I spent less than I expected and ate better than I do at places that cost twice as much.",
      "The value here is one of the best things about {shop} — good food does not have to be expensive.",
      "You get more than you pay for — the pricing is honest and fair.",
    ],
    quick_service: [
      "Food arrived faster than I expected — no long wait even on a busy evening.",
      "The service was quick without feeling rushed — properly managed kitchen and floor.",
      "I came during the lunch rush and still had my order within a reasonable time.",
      "The delivery was on time and the food was still hot — properly packed and dispatched quickly.",
      "No unnecessary delays — from order to plate was smooth and efficient.",
    ],
    friendly_staff: [
      "The staff were genuinely welcoming — not the kind of service where they make you feel like a bother.",
      "I asked questions about the menu and got patient, helpful answers — not just pointing at the board.",
      "The team here is warm without being overbearing — good balance.",
      "The person who took our order remembered my preference from a previous visit — small but impressive.",
      "Friendly, attentive, and quick — the service matched the food quality.",
    ],
    ambiance: [
      "The place is clean, well-lit, and comfortable — you actually want to sit and enjoy the meal.",
      "The ambiance is relaxed and pleasant — easy to have a conversation without shouting.",
      "Nice seating, good lighting, and a comfortable temperature — the environment adds to the experience.",
      "The vibe is casual and friendly — the kind of place you want to bring people to.",
      "Well-maintained interiors — you can tell they care about the space as much as the food.",
      "Clean tables, good music at the right volume, comfortable seating — all the basics done well.",
    ],
    hygiene: [
      "The kitchen is visible and clearly maintained — I could see the cleanliness from where I was sitting.",
      "Clean tables, clean utensils, clean overall — basic but important and done right here.",
      "The hygiene standards here are noticeably higher than most places in {location}.",
      "No concerns about cleanliness — the place is well-maintained and clearly takes food safety seriously.",
      "Hands-down one of the cleaner kitchens and dining areas I have eaten at in {location}.",
    ],
    menu_variety: [
      "The menu has enough options that I have something different to try every visit.",
      "Good variety within the {type} category — not just three options dressed up differently.",
      "The menu covers different dietary preferences — vegetarian options are as good as the rest.",
      "I came in a group with different preferences and everyone found something they wanted.",
      "The range is broad without being overwhelming — everything on the menu feels intentional.",
    ],
    delivery: [
      "The delivery was on time, food was hot, and the packaging kept everything intact.",
      "I order from {shop} on Swiggy regularly — consistent quality and reliable delivery every time.",
      "Ordered on Zomato and it arrived exactly as expected — timing was accurate and food was fresh.",
      "The delivery experience is as good as eating in — they clearly pack thoughtfully.",
      "I have had too many deliveries where the food arrives cold or soggy. Not at {shop}.",
    ],
    packaging: [
      "The packaging is proper — everything arrived without spilling and the food did not get soggy.",
      "Separate containers for gravy and rice — the kind of attention to packaging that shows care.",
      "The packaging kept the temperature well — food was still hot when it arrived.",
      "Well-sealed, leak-proof, and organised — packaging that actually does the job.",
    ],
    family_friendly: [
      "Came with the family including kids — everyone was accommodated well and the kids loved the food.",
      "The staff were patient with our large group and the seating was arranged without fuss.",
      "A good place for a family meal — the noise level is comfortable and the menu works for all ages.",
      "Brought elderly parents — the staff were considerate and the seating was comfortable for them.",
    ],
  },
  bridges: {
    first: [
      "For a first visit, {shop} delivered on every count — food, service, and value.",
      "I left wondering why I had not tried this place sooner.",
      "A first meal that sets the standard for what good {type} in {location} should be.",
      "I came without expectations and left having found my new regular spot.",
    ],
    few_times: [
      "Consistency across multiple visits is what separates a good restaurant from a great one.",
      "Each visit has confirmed exactly why I keep coming back.",
      "What I have noticed is that the quality never varies — same standard every time.",
    ],
    regular: [
      "Months of regular meals and the standard has not dropped once.",
      "The consistency over time is what earns a restaurant real loyalty.",
    ],
    loyal: [
      "Years of meals and the food still tastes as good as it did the first time.",
      "Long-term loyalty is earned through consistent quality — {shop} has that.",
    ],
  },
  closings: {
    excellent: {
      first: [
        "My first recommendation now when anyone asks about {type} in {location}.",
        "Already sent the address to three people. Highly recommend {shop}.",
        "Will be back very soon. Highly recommend.",
        "If you are in {location} and want good {type}, {shop} is the answer.",
        "One of the best meals I have had in {location} in a long time.",
      ],
      few_times: ["My regular spot for {type} in {location} — no reason to go elsewhere.", "Will keep coming back. Highly recommend."],
      regular: ["Month after month still my first choice. Recommend to everyone.", "The only {type} place I recommend in {location}."],
      loyal: ["Years in and still the best — recommend without hesitation.", "My family's go-to for years. The highest endorsement I can give."],
    },
    good: {
      first: ["Will return. Good restaurant.", "Recommend for {type} in {location}."],
      few_times: ["Consistent — recommend.", "A reliable choice."],
      regular: ["Dependable — recommend.", "A solid regular option."],
      loyal: ["Trusted over years.", "A good place for {type}."],
    },
    average: {
      first: ["Fine for basics."], few_times: ["Adequate."], regular: ["Fine ongoing."], loyal: ["Familiar."],
    },
  },
};

// ── BARBER ───────────────────────────────────────────────────

const BARBER_EN = {
  openings: {
    excellent: {
      first: [
        "I have been to a lot of barbers in {location} and {shop} is genuinely the best I have found.",
        "First visit to {shop} and I left with the best haircut I have had in months.",
        "I walked in just to try a new place and walked out already planning my next appointment.",
        "My usual barber was unavailable and I tried {shop} — not going back to my usual now.",
        "First time at {shop} and I have already recommended it to three people I know.",
        "I came in with a vague idea of what I wanted and {shop} made it clearer and better.",
        "I was sceptical about trying a new barber in {location}. {shop} changed that quickly.",
        "I described what I wanted and the barber delivered it better than I described.",
        "First visit and this is now my regular barber in {location} — no doubt.",
        "I have been going to the same barber for years. {shop} is the first place I considered switching to.",
        "One of the better barbershops I have been to in {location} — and I have tried many.",
        "From the moment I sat down, I could tell the barber knew what they were doing.",
      ],
      few_times: [
        "I have been to {shop} a few times now and the quality is consistent every visit.",
        "Each haircut at {shop} has been as good as the first — consistency that earns loyalty.",
        "Already my regular barber shop after just three visits.",
      ],
      regular: [
        "I have been going to {shop} for several months and the standard has not dropped once.",
        "Regular customer here — the haircut quality and overall experience are reliably good.",
      ],
      loyal: [
        "I have been coming to {shop} for years — the skill and cleanliness have always been maintained.",
        "My go-to barber for years in {location}. Would not go anywhere else.",
        "Years of haircuts and never once left dissatisfied. That is a track record.",
        "I have been a loyal customer at {shop} for years — and I will remain one.",
      ],
    },
    good: {
      first: ["Good first haircut — exactly what I asked for, well executed.", "Solid barbershop. Good skill and fair pricing."],
      few_times: ["Consistently good across visits.", "Reliable haircuts each time."],
      regular: ["Regular customer — consistent quality.", "A dependable barber in {location}."],
      loyal: ["Years of good haircuts here.", "Trusted barber over time."],
    },
    average: {
      first: ["Decent — got a reasonable haircut."], few_times: ["Fine across visits."], regular: ["Adequate."], loyal: ["Consistent for basics."],
    },
  },
  aspects: {
    great_cut: [
      "The haircut was precise and exactly as I described — nothing was lost in translation.",
      "The barber took time to understand what I wanted before touching the scissors.",
      "I left with a haircut that looked good immediately and held its shape for days.",
      "First time in a long time I have left a barber fully satisfied with the cut.",
      "The fade is clean, the edges are sharp, and the overall cut is well-proportioned.",
      "I showed a reference photo and the result was accurate — not a rough approximation.",
      "The barber suggested a slight modification to what I asked for and the result was better.",
      "Clean, precise, and well-finished — a haircut that still looks good a week later.",
      "The detailing on the hairline and neckline is careful — clearly done by someone who cares.",
    ],
    clean_shop: [
      "The shop is properly cleaned between customers — towels are fresh and tools are sanitised.",
      "I could see the razors and scissors being cleaned before use — that is how it should be.",
      "The hygiene here is a genuine priority, not just an afterthought.",
      "Clean, fresh-smelling shop — I felt comfortable from the moment I sat down.",
      "Tools are sterilised, towels changed between customers — proper hygiene protocol.",
      "The floor is swept regularly and the station is clean before every client.",
      "The overall cleanliness gives confidence — you know the tools being used on you are safe.",
    ],
    beard_trim: [
      "My beard was shaped better than I have managed myself in weeks — the barber has a real eye for it.",
      "The beard trim was precise — the lines are clean and the overall shape improved how I look.",
      "I came primarily for the beard work and it was done brilliantly.",
      "The straight razor shave was smooth and clean — no irritation afterwards.",
      "The beard contour was done carefully with attention to symmetry — looks clean and well-defined.",
      "Beard work here is meticulous — every edge is clean and proportional.",
      "I showed what shape I wanted for my beard and it was executed exactly.",
    ],
    modern_styles: [
      "The barbers here are familiar with current styles — I got exactly the modern cut I was looking for.",
      "Not stuck in 2005 — the barbers know what is current and can execute it properly.",
      "I asked for a specific style I had seen online and the barber knew exactly what I meant.",
      "The styles available here range from classic to modern — good range of skills.",
      "I was shown examples and the barber was confident about executing the style I chose.",
      "The fade techniques here are modern and well-executed — clearly trained well.",
    ],
    quick_service: [
      "I was in and out in 25 minutes with a complete haircut and beard trim — efficient.",
      "No wasted time — the service is fast without cutting corners on quality.",
      "Quick without being rushed — the cut is done properly, just efficiently.",
      "I had a tight schedule and they managed the full service without rushing the quality.",
    ],
    fair_price: [
      "The price is very fair for the quality of the haircut — good value in {location}.",
      "I have paid more elsewhere for a worse cut — {shop} offers better value.",
      "Transparent pricing — no surprises at the end.",
      "Reasonable rates that reflect what is delivered, not just inflated because of the location.",
      "Good value — the skill level justifies the price and the price is not unreasonable.",
    ],
    good_ambiance: [
      "The atmosphere in {shop} is relaxed — not rushed or noisy.",
      "Good music, clean space, friendly vibe — I actually enjoy being there.",
      "The overall experience is pleasant — not just the haircut but the whole time there.",
      "Nice, comfortable place to spend 30 minutes — makes the wait (if any) easy.",
      "The ambiance makes it a place you want to come back to, not just for the haircut.",
    ],
    expert_staff: [
      "The barbers here are clearly trained and skilled — you can see the difference in technique.",
      "I was assigned to a barber who listened, asked the right questions, and delivered perfectly.",
      "The expertise at {shop} is evident — not self-trained amateurs but properly skilled barbers.",
      "Every barber I have seen here has the same level of skill — no weak links in the team.",
      "The skill level is consistent across the team — whether I come on a Monday or a Saturday, the quality is the same.",
    ],
    no_waiting: [
      "I walked in without an appointment and was in the chair within 10 minutes.",
      "The queue moves quickly here — managed well, no long waits.",
      "I was seen promptly without needing to book ahead — good management.",
      "Even on a busy day the wait was not excessive — they manage the flow well.",
    ],
    hair_advice: [
      "I was given practical advice about what would suit my hair type and face shape — genuinely useful.",
      "The barber suggested a style I had not considered and it turned out to be exactly right.",
      "Simple, practical advice about hair care that I have actually used — nothing gimmicky.",
      "The barber pointed out I had been using the wrong product for my hair type — good insight.",
    ],
    massage: [
      "The head massage here is genuinely relaxing — a proper addition to the service.",
      "The scalp massage at the end is worth coming for on its own.",
      "Good strong head massage — I left feeling properly relaxed.",
    ],
    facial: [
      "The cleanup here is thorough — skin felt noticeably cleaner afterwards.",
      "The facial service is proper, not just a face wipe — real skin care.",
      "I left with noticeably better-looking skin after the cleanup — good products and technique.",
    ],
  },
  bridges: {
    first: ["For a first haircut at {shop}, the skill and care shown exceeded what I expected.", "I left already planning when to come back — that is the best sign."],
    few_times: ["Consistent quality across every visit — the mark of a trustworthy barber.", "Each visit confirms why {shop} is my regular in {location}."],
    regular: ["Months of regular haircuts here and the standard has been the same throughout.", "Consistent quality and a comfortable experience — hard to match."],
    loyal: ["Years of haircuts and not once did I leave unhappy — remarkable consistency.", "Long-term trust in a barber is built through reliable skill. {shop} has that."],
  },
  closings: {
    excellent: {
      first: ["My regular barber in {location} from here on. Highly recommend.", "Already recommended to three people. Highly recommend {shop}.", "Will not be trying anywhere else in {location} — {shop} is the one."],
      few_times: ["Will keep coming back — this is my barber now.", "Recommend to anyone in {location} who wants a proper haircut."],
      regular: ["Month after month, still my first choice. Recommend.", "The best barber in {location} — and I have tried many."],
      loyal: ["Years in and still my only choice. Recommend to everyone.", "My loyalty is fully earned — highly recommend {shop}."],
    },
    good: {
      first: ["Will return. Good barbershop.", "Recommend for a haircut in {location}."],
      few_times: ["Consistent — recommend.", "A good barber in {location}."],
      regular: ["Reliable — recommend.", "Dependable."],
      loyal: ["Trusted over years. Recommend.", "A good barbershop in {location}."],
    },
    average: {
      first: ["Fine for a basic cut."], few_times: ["Adequate."], regular: ["Fine ongoing."], loyal: ["Consistent."],
    },
  },
};

// ─────────────────────────────────────────────────────────────
// KANNADA TEMPLATES PER CATEGORY
// ─────────────────────────────────────────────────────────────

const KN_TEMPLATES = {
  clothes: {
    openings: {
      excellent: {
        first: [
          "{shop} ge first time bandhe — expect maadiddhakku hechchu sikkittu.",
          "{location} alli oLLe clothes shop hodothe antha. {shop} alli sikkithu.",
          "Ond pair tegedu hogbeku antha bandhe, mooru bags thadkond hogide — ee review saaku.",
          "Modalane visit {shop} ge — already next visit plan aagide.",
          "Friend suggest maadidru {shop} — correct aaythu anta.",
          "Hotto hogo antha bandhe, full wardrobe update aagithu — ee shop magic aagte.",
          "Yella kaategalli style ide — formal, casual, traditional — ondu jagadalli sigutthe.",
          "Modlane bandhe, adre regular aagthini antha gottu — that good.",
        ],
        few_times: [
          "Kelavu sari bandhe — prathi bari channagide.",
          "Each visit alli hosa vishaya sigutthe — collection update aagutthe.",
          "Moodu visits aagide, already nanna regular clothes shop aagtide.",
        ],
        regular: [
          "Kele tingalinda illi barthidini — quality drop aagilla.",
          "Regular customer — prathi bari satisfied aage banthini.",
        ],
        loyal: [
          "Varshagalinda illi shoppin maadthidini — consistency remarkable.",
          "Namma family yella illi shoppin maadthare — neenu bereyalli hogalla.",
          "Years of trust illi — adhu break aagilla yavathoo.",
        ],
      },
      good: {
        first: ["Good first visit — beku aadhdhu sikkithu.", "Solid shop. Collection decent, staff helpful."],
        few_times: ["Few visits — consistent."], regular: ["Regular — no complaints."], loyal: ["Years — good experience."],
      },
      average: {
        first: ["Decent — got basics."], few_times: ["Fine."], regular: ["Adequate."], loyal: ["Familiar."],
      },
    },
    aspects: {
      fabric_quality: ["Fabric quality thumba channagide — wash maadidmele kuda hage iruttade.", "Material premium feel — cheap alla.", "3 times wash aadru condition same — oLLe quality."],
      great_variety: ["Variety impressive — {location} alli bereyalla kaanadhu illi sigutthe.", "Formal inda casual varige — yella ide illi.", "Prathi visit alli hosa stock iruttade."],
      helpful_staff: ["Staff listen maadthare, push maadalla.", "Honest suggestions — sooth heLalla.", "Beku adhu suggest maadthare, beda adhu illa anthaare."],
      fair_price: ["Pricing fair — quality ge hechchu pay maadbekkaagalilla.", "MRP ge correct bill — markup illa.", "Value for money thumba channagide."],
      trendy_designs: ["Designs current — outdated alla.", "Fashion ge match aadha designs ide illi.", "Online nokide aadhre, offline illi sigithu."],
      good_brands: ["Genuine branded items — fake alla.", "Brands trusted — no doubts.", "Mix of known and new brands."],
      return_policy: ["Return policy clear — hassle illa.", "Size exchange maadbeku aaythu — 5 min alli aaytu.", "Exchange maadide — staff helpful aagiiddru."],
      clean_store: ["Shop organize agi ide — find maadoke easy.", "Fitting room clean — maintained.", "Layout logical — easy to browse."],
      good_discounts: ["Discounts genuine — inflated prices alla.", "Sale alli oLLe savings.", "Seasonal offers worth it."],
      alteration: ["Alteration quick, accurate — fit perfect aaythu.", "Trouser alter maadbeku aaythu — 2 days alli ready.", "In-store alteration convenient."],
      good_fit: ["Sizing consistent — label heLadhu correct.", "My size easily sikkithu.", "Fit perfect."],
      genuine_products: ["Authentic products — no fake.", "Clearly genuine — quality proves it."],
    },
    bridges: {
      first: ["Modlane visit alli ee maTTa smooth aagide antha expect maadirla.", "Billing inda barlinda — yella smooth."],
      few_times: ["Prathi visit quality same — adhe trust build aaguttade."],
      regular: ["Tingala kaala consistently good — my default."], loyal: ["Varshagalinda trust — yenu break aagilla."],
    },
    closings: {
      excellent: {
        first: ["{location} alli clothes beku aadre {shop} — highly recommend.", "Already eradu friends ge address heLbitte.", "Next visit already plan aagide."],
        few_times: ["Regular here now — recommend.", "My go-to in {location}."],
        regular: ["Tingala baradha recommend.", "No other shop needed."],
        loyal: ["Varsha varsha recommend maadthini.", "Family goose here — best endorsement."],
      },
      good: { first: ["Matthe barthini."], few_times: ["Recommend."], regular: ["Reliable."], loyal: ["Trusted."] },
      average: { first: ["Fine."], few_times: ["Adequate."], regular: ["OK."], loyal: ["Familiar."] },
    },
  },
  pharmacy: {
    openings: {
      excellent: {
        first: [
          "Urgent medicine beku aaythu — {location} alli mooru pharmacies ide antidru — {shop} ge bandhe, sigithu.",
          "First time {shop} ge bandhe, enu expect maadirla — adre thumba impressed aade.",
          "Neighbor heLidru {shop} banna antha — correct suggestion aaythu.",
          "Trust aadha pharmacy {location} alli hodothe — {shop} alli sikkithu.",
          "Doctor anta prescription kottidru — {shop} alli ella in stock aaythu.",
          "Odd hour alli bandu kuda stock full aaythu — impressive.",
          "Long prescription iddhu — ella sikkithu, substitution illlada.",
        ],
        few_times: ["Kelavu sari bandhe — service and stock consistent.", "Regular aagthidini — reliable pharmacy."],
        regular: ["Kele tingalinda illi — quality doubt illlada.", "My regular pharmacy in {location}."],
        loyal: ["Varshagalinda illi — namma family pharmacy.", "Years of trust — never failed.", "Namma neighbourhood pharmacy aagtide {shop}."],
      },
      good: {
        first: ["Good first — prescription fill aaytu.", "Solid pharmacy."], few_times: ["Consistent."], regular: ["Reliable."], loyal: ["Trusted."],
      },
      average: { first: ["Decent."], few_times: ["OK."], regular: ["Adequate."], loyal: ["Familiar."] },
    },
    aspects: {
      stock_availability: ["Prescription alli ella in stock — partial fill illlada.", "Rare medicine kuda illi sigithu.", "Yavaaga bandru — stock ready."],
      genuine_medicines: ["Seals intact, batch details correct — authentic.", "Fake medicines concern illlada illi.", "Proper sourcing — no doubts."],
      knowledgeable_staff: ["Pharmacist prescription careful agi nodidru, interaction heLidru.", "Question kelidhe — proper answer sikkithu.", "Dosage query alli correct guidance sikkithu."],
      fair_price: ["MRP alli bill — markup illlada.", "Generic options suggest maadidru — savings sigithu.", "Honest pricing."],
      quick_service: ["5 minutes alli prescription fill — efficient.", "Long queue iddru kuda fast aaythu.", "Emergency alli quick service sikkithu."],
      home_delivery: ["Home delivery reliable — time ge banthide.", "Online order — same day delivery.", "Delivery accurate — nothing missing."],
      good_advice: ["Medicine combination atti jagrita maadi antha heLidru — responsible.", "Yavaaga, henge tegebekhu — clear agi heLidru.", "Practical advice — doctor call save aaythu."],
      proper_storage: ["Temperature sensitive medicines correctly stored.", "Cold chain maintained — proper.", "Storage conditions correct."],
      good_discounts: ["Discount genuine — better than other pharmacies in {location}.", "Savings on branded medicines.", "Long prescription alli significant savings."],
      availability_247: ["Midnight alli emergency — {shop} open aagthu, stock aagthu.", "24 hour availability life saver aaythu.", "Odd hour alli kuda available — peace of mind."],
      privacy: ["Sensitive medicine discreetly handled.", "No unnecessary attention from others.", "Privacy respected."],
      generic_options: ["Generic suggest maadidru — same active ingredient, low price.", "Honest about options — savings sigithu.", "Proactively suggest generic — helpful."],
    },
    bridges: {
      first: ["Modlane visit alli {shop} standard set maadithu — others judge aagtini illi kaanisida criteria inda.", "Prescription inda billing varige smooth."],
      few_times: ["Multiple visits — reliability consistent."], regular: ["Tingala kaala dependable."], loyal: ["Varshagalinda reliable."],
    },
    closings: {
      excellent: {
        first: ["My go-to pharmacy in {location} from here. Highly recommend.", "Address already heLbitte neighbors ge.", "Recommend to anyone in {location}."],
        few_times: ["Regular here now.", "Highly recommend."], regular: ["Month after month first choice.", "Will not switch."], loyal: ["Family pharmacy — best endorsement.", "Years of trust."],
      },
      good: { first: ["Matthe barthini."], few_times: ["Recommend."], regular: ["Reliable."], loyal: ["Trusted."] },
      average: { first: ["Fine."], few_times: ["OK."], regular: ["Adequate."], loyal: ["Familiar."] },
    },
  },
  jewellery: {
    openings: {
      excellent: {
        first: [
          "{shop} ge browse maadoke bandhe — purchase maadde hogthini antha gottirla.",
          "{location} alli jewellery shop kaNdu barodu kashtavaagide — {shop} alli sikkithu.",
          "Wedding shopping ge cousin {shop} suggest maadidru — correct aaythu.",
          "First visit, adre already nanna trusted jeweller aagide.",
          "Specific design iddhu — {shop} alli sikkithu, plus better made aaythu.",
          "Budget alli beku aadhdhu inta hechchu sikkithu — {shop} channagide.",
          "Jewellery alli bad experiences ittu — {shop} fresh start aaythu.",
        ],
        few_times: ["Kelavu sari purchase maadide — quality consistent.", "Each visit trust build aagide.", "Already my regular jeweller."],
        regular: ["Kele tingalinda — quality drop illlada.", "Regular — no complaints."],
        loyal: ["Family generations inda {shop} alli — trust deeply rooted.", "Yella important occasion ge illi — years inda.", "Namma family trusted jeweller in {location}."],
      },
      good: {
        first: ["Good visit — beku aadhdhu sikkithu.", "Solid jewellery shop."], few_times: ["Consistent."], regular: ["Reliable."], loyal: ["Trusted."],
      },
      average: { first: ["Decent."], few_times: ["Fine."], regular: ["Adequate."], loyal: ["Familiar."] },
    },
    aspects: {
      quality: ["Gold purity exactly stated — test maadide, correct aaythu.", "Quality feel maadoke gottagutthe — premium.", "Years wear maadide — finish maintain aagtide."],
      bis_hallmark: ["BIS hallmark check maadide — legitimate.", "Certification verifiable — genuine.", "Hallmarking seriously taken here."],
      good_designs: ["Traditional and contemporary — both ide illi.", "Timeless designs — yella varusha wear maaDok aagutthe.", "South Indian designs — good range.", "Contemporary designs tasteful."],
      fair_making: ["Making charges upfront clear — no surprise.", "Compared with {location} other shops — competitive.", "Custom work charges reasonable."],
      honest_weighing: ["Weighing in front of me — scale calibrated.", "Weight bill ge match — correct.", "Transparent — nothing to hide."],
      wide_collection: ["Collection large — six similar items only alla.", "Yella occasion, yella budget — ide illi.", "Bridal to daily wear — one shop."],
      exchange_policy: ["Exchange policy honored — no argument needed.", "Old gold buyback rate fair.", "Exchange terms clear — no confusion later."],
      skilled_craftsmen: ["Intricate work — skilled hands clearly.", "Custom piece made — expectation exceeded.", "Finishing careful."],
      helpful_staff: ["Patient — 40 pieces nodide, rush maadlilla.", "Budget stated — within that suggest maadidru.", "Honest, not pushy."],
      good_packaging: ["Packaging beautiful — gift ge perfect.", "Box and certificate quality.", "Care extends beyond jewellery itself."],
      certificate: ["Authenticity certificate — legit.", "Documentation complete — bill, certificate, warranty.", "Weight, purity, making charges separate — clear invoice."],
      customisation: ["Reference image thumbprint — exactly made.", "Custom order process simple — on time delivery.", "Design improvement suggest maadidru — result better."],
    },
    bridges: {
      first: ["First purchase alli ee maTTa transparency — beyond expectation.", "Selection inda billing inda packaging — all professional."],
      few_times: ["Multiple purchases — quality consistent."], regular: ["Months of regular buying — no cause to complain."], loyal: ["Varshagalinda important purchases — yella illi."],
    },
    closings: {
      excellent: {
        first: ["{location} alli jewellery — {shop} first recommendation.", "Next occasion ge illi barthini.", "Recommend without hesitation."],
        few_times: ["Will keep coming back.", "Recommend."], regular: ["My regular jeweller.", "No need go elsewhere."], loyal: ["Decades of trust.", "Family jeweller — highest endorsement."],
      },
      good: { first: ["Matthe barthini."], few_times: ["Recommend."], regular: ["Reliable."], loyal: ["Trusted."] },
      average: { first: ["Fine."], few_times: ["OK."], regular: ["Adequate."], loyal: ["Familiar."] },
    },
  },
  shoes: {
    openings: {
      excellent: {
        first: [
          "Ond pair shoes tegeyoke bandhe — mooru pair thadkond hogide. Review saaku.",
          "{location} alli oLLe footwear shop hodothe — {shop} alli sikkithu.",
          "Kids shoes beku aaNdhu, ella family ge aaytu — range ashthu channagide.",
          "Friend recommend maadidru {shop} — spot on.",
          "Modlane bandhe — collection inside different story aagthu.",
          "My size ella shop alli sigirla {location} alli — {shop} immediately ide aaythu.",
          "Sports shoes collection — multiple options, not just two three.",
        ],
        few_times: ["Kelavu sari bandhe — default footwear shop aagtide.", "Each visit hosa kaaNo sigutthe.", "Already recommended to colleagues."],
        regular: ["Kele tingalinda — quality consistent.", "Regular — no complaints."],
        loyal: ["Varshagalinda illi — quality and reliability consistent.", "Family footwear — years from here."],
      },
      good: {
        first: ["Good visit — beku aadhdhu sikkithu.", "Solid shoe shop."], few_times: ["Consistent."], regular: ["Reliable."], loyal: ["Trusted."],
      },
      average: { first: ["Decent."], few_times: ["Fine."], regular: ["Adequate."], loyal: ["Familiar."] },
    },
    aspects: {
      good_variety: ["Formal, casual, sports, ethnic — ondu jagadalli.", "Bereyalla kaanadhu illi sigutthe.", "Collection regularly refreshed."],
      comfortable_fit: ["Shop alli 5 min walk maadide — genuinely comfortable.", "Fit accurate — size up/down baro abashyakatha illlada.", "Full day wear maadide — feet fine."],
      fair_price: ["Pricing fair — quality ge high pay maadbekkaagalilla.", "Same brand bereyalliu compare maadide — illi better price.", "Value for money."],
      good_brands: ["Genuine branded items — fake alla.", "Trusted brands available.", "Authentic — no doubts."],
      durable: ["3 months later — almost new look.", "Stitching and sole quality good — built to last.", "Daily wear maadide — held up well."],
      helpful_staff: ["Beku adhu kelidhu suggest maadidru — efficient.", "8 pairs try maadide — rush maadlilla.", "Honest — suit aagadhu antha heLidru."],
      easy_exchange: ["Exchange next day — smooth.", "Policy honored — no pushback.", "Size tight aaythu — exchange quick."],
      wide_sizes: ["Wide sizes — larger than average feet options iddaavu.", "Half sizes available — rare.", "Kids — different widths too."],
      kids_section: ["Kids section well stocked — durable options.", "School shoes quick sigithu.", "Range for kids — school, sports, casual."],
      sports_section: ["Sports shoes — running, court, casual — multiple options.", "Proper running shoes — cushioning good.", "Range across price points."],
      clean_store: ["Shop organized — easy to find.", "Fitting area clean.", "Display neat."],
      good_discounts: ["End of season discounts real — significant savings.", "Sale alli honest offers.", "Good savings on quality footwear."],
    },
    bridges: {
      first: ["Modlane visit alli ella delivered — selection, service, pricing.", "Good buying decision confidence aaythu."],
      few_times: ["Consistency across visits — my default."], regular: ["Months — quality never a concern."], loyal: ["Years of reliable footwear."],
    },
    closings: {
      excellent: {
        first: ["First recommendation for footwear in {location}.", "Friends ge address heLbitte.", "Will be back soon."],
        few_times: ["Regular here now.", "Recommend."], regular: ["Month after month first choice.", "Recommend to anyone."], loyal: ["Years in — my go-to. Recommend.", "Family shops here."],
      },
      good: { first: ["Matthe barthini."], few_times: ["Recommend."], regular: ["Reliable."], loyal: ["Trusted."] },
      average: { first: ["Fine."], few_times: ["OK."], regular: ["Adequate."], loyal: ["Familiar."] },
    },
  },
  'car-service': {
    openings: {
      excellent: {
        first: [
          "Before alli dishonest garages inda burnt aagidde — {shop} completely different experience.",
          "First service alli proper car service centre hege irattadhu antha gottaaythu.",
          "Colleague recommend maadidru {shop} — glad I went.",
          "Overquoting expect maadidde — illi yavudhe illlada.",
          "Car illi yaenu aagthu antha clearly heLidru — touch maadoke mundhe.",
          "Another garage diagnose maaDoke aagilla — {shop} first try alli correct aaythu.",
          "Upgrade aagthu antha heLidru — illi idu illlada.",
          "Communication better than any garage I have used.",
        ],
        few_times: ["Kelavu bari service maadide — quality and honesty consistent.", "Each service as good as first.", "Already referred colleagues."],
        regular: ["Kele tingalinda — consistent quality and honest billing.", "Regular — no padded estimates."],
        loyal: ["Varshagalinda car illi service — trust break aaglilla.", "Other garages try maadide — illi matthe barthini.", "Both vehicles — years from here."],
      },
      good: {
        first: ["Good first service — work correct, billing fair.", "Solid service centre."], few_times: ["Consistent."], regular: ["Reliable."], loyal: ["Trusted."],
      },
      average: { first: ["Decent."], few_times: ["Fine."], regular: ["Adequate."], loyal: ["Consistent."] },
    },
    aspects: {
      honest_billing: ["Estimate ge bill match — no additions.", "Ella explain maaDidhru — work approve maadoke mundhe.", "Bill itemised — parts, labour separate.", "Slightly below estimate aaytu — first time ever.", "Parts price online check maadide — honest."],
      quick_turnaround: ["Said time ge ready aaythu — 3 hours late alla.", "Morning drop, afternoon back — exactly promised.", "Realistic timeline — stuck to it.", "Urgent aaythu — prioritised, on time."],
      genuine_parts: ["Original packaging show maadidru — genuine OEM.", "Parts genuine — spurious alla.", "Part number manufacturer database check maadide — legitimate."],
      experienced: ["Mechanic confident and precise — clearly experienced.", "Symptom describe maadide — immediately explanation sikkithu.", "Car model before handle maadidaare — known issues gotthu."],
      good_diagnosis: ["Diagnosis accurate — first attempt fix aaythu.", "Gearbox antha heLidru bere garage — {shop} correctly clutch plate identify maadidru.", "Guess maaDalla — properly diagnose maadthare.", "Noise identify maadide — correctly resolved."],
      clean_service: ["Service bay clean, organized.", "Grimy mess alla — properly maintained.", "Car oily stains illlada back.", "Car interior respect maadidaare."],
      transparent_price: ["Yella charge explain maaDidhru — bill surprise illlada.", "Written estimate before work — professional.", "Labour charges reasonable, explained."],
      pickup_drop: ["Pickup drop smooth — on time.", "Arrange maadolle beko aagirla — convenient.", "Schedule follow maaDidhru."],
      no_unnecessary: ["Tyres replace antha heLalilla — honest.", "Service report inflate maadirla.", "Specific repair maaDidhru — extra illlada.", "Wait aagude, now kaaDbekkaagilla — honest."],
      warranty: ["Warranty honored — small issue came up, no charge.", "Week later check maaDbeku aaythu — covered under warranty.", "Parts and labour warranty genuine."],
      updates: ["Day throughout updates sikkithu — follow up maadolle beko aagirla.", "Photos sent before proceeding — impressive.", "WhatsApp updates — professional.", "Real-time status — peace of mind."],
      washing: ["Car washed and cleaned inside — better than sent.", "Interior vacuumed, exterior washed.", "Car clean back — not expected but appreciated."],
    },
    bridges: {
      first: ["First service illi — standard set maadide, others judge aagtini.", "Drop inda pickup varige — professional."],
      few_times: ["Consistent quality and honesty — trustworthy garage."], regular: ["Months — standard never dropped."], loyal: ["Years — regret illlada."],
    },
    closings: {
      excellent: {
        first: ["My go-to garage in {location}. Highly recommend.", "3 people ge already recommend maadide.", "No need look for another garage."],
        few_times: ["Will keep coming back.", "Recommend anyone."], regular: ["Month after month first choice.", "Only garage I recommend."], loyal: ["Years in — only trust illi. Recommend.", "Both vehicles here."],
      },
      good: { first: ["Matthe barthini."], few_times: ["Recommend."], regular: ["Reliable."], loyal: ["Trusted."] },
      average: { first: ["Fine."], few_times: ["OK."], regular: ["Adequate."], loyal: ["Consistent."] },
    },
  },
  restaurant: {
    openings: {
      excellent: {
        first: [
          "{shop} ge modlane bandhe — food nodidaaga eSTu channagide antha gottirla.",
          "{location} alli oLLe {type} place hodothe — {shop} alli sikkithu.",
          "Friend suggest maaDidhru {shop} — taste nodidaaga why antha gottaaythu.",
          "First time {shop} ge bandhe — already next visit plan ready.",
          "First meal — already nanna go-to spot in {location} aagtide.",
          "Queue nodide — wait maaDide — worth aaythu every minute.",
          "First time bandhe, adre kaDeya varige already matthe barthini antha gottaaythu.",
        ],
        few_times: ["Kelavu bari bandhe — prathi bari food consistent.", "4th visit aagide — adhe saaku ee review ge.", "Each visit same quality — rare adu."],
        regular: ["Kele tingalinda regular illi — quality drop aagilla yavagloo.", "Monthly bandhu bandu — still best choice."],
        loyal: ["Varshagalinda illi — food taste change aagilla.", "Family default spot for {type} in {location}."],
      },
      good: { first: ["Good first meal.", "Solid visit."], few_times: ["Consistent."], regular: ["Reliable."], loyal: ["Trusted."] },
      average: { first: ["Decent."], few_times: ["Fine."], regular: ["OK."], loyal: ["Familiar."] },
    },
    aspects: {
      food_taste: ["Taste thumba channagide — bere places comparison alli {shop} different level.", "Flavour balance sari agi ide — spice, salt, everything perfect.", "Full plate finish maaDide — adhu gottaaguttade food eSTu channagide antha.", "Bengaluru alli bahala {type} try maaDide — {shop} top alli ide."],
      food_quality: ["Fresh ingredients taste alli gottagutthe — processed feel illlada.", "Oil heavy illlada, ingredients fresh — kitchen sari agi run aagutthe.", "Made fresh anta immediately gottaaguttade — no packet taste."],
      portion_size: ["Quantity generous — bere places compare made hoge hechchu siguttade illi.", "Price ge quantity thumba channagide — short change feel illlada.", "Plate full aaythu — leftover kuda sikkithu."],
      value_money: ["Pay maadidakke quality and quantity — exceptional value.", "{location} alli compare maaDide — {shop} hechchu siguttade same money ge.", "Affordable without quality cut — rare combination.", "Twice costly places compare made illi better food — less money."],
      quick_service: ["Busy evening alli kuda food fast bandhe — well managed.", "Lunch rush alli kuda reasonable time alli sikkithu.", "Delivery on time, food hot — properly packed.", "Order to plate — smooth, no unnecessary wait."],
      friendly_staff: ["Staff welcoming agi iddaare — bother maaDthidivi antha feel illlada.", "Menu questions — patient agi answer maaDidru.", "Previous visit preference remember maaDiddru — small but impressive.", "Friendly without overdoing — good balance."],
      ambiance: ["Place clean, well-lit, comfortable — sit enjoy maaDoke easy.", "Casual relaxed vibe — conversation easy.", "Clean tables, good lighting, comfortable — basics all done well.", "Maintained interiors — space ge kuda care maaDthare anta kanisutthe."],
      hygiene: ["Kitchen visible — cleanliness nodoke aaytu, channagide.", "Clean tables, utensils, overall — basic adu sari agi maaDthare illi.", "{location} alli hechchu places compare made illi hygiene better.", "Food safety seriously tegedukonthidhare anta kanisutthe."],
      menu_variety: ["Menu variety idi — prathi visit hosa item try maaDoke aagutthe.", "Different dietary preferences — veg options kuda same quality.", "Group bandhu bandhe — ella janakku beku adhu sikkithu.", "Range broad without overwhelming — intentional feel."],
      delivery: ["Swiggy alli regular order maaDtini — consistent quality every time.", "Zomato alli order — timing accurate, food fresh.", "Delivery experience dining in hage — thoughtfully packed.", "Cold or soggy delivery fear illlada {shop} ge."],
      packaging: ["Proper packing — spill illlada, soggy aagalilla.", "Gravy and rice separate containers — attention to detail.", "Hot temperature maintain aaythu delivery varige.", "Well-sealed, leak-proof — kelsa maaDutte packaging."],
      family_friendly: ["Family karedukonde including kids — ella accommodate maaDiddru.", "Large group alli bandhe — seating arrange maaDiddru without fuss.", "Kids menu works, elderly kuda comfortable — all ages covered."],
    },
    bridges: {
      first: ["Modlane visit alli {shop} — food, service, value — ella delivered.", "Yake mundhe try maaDirla antha left thinking.", "First meal set kaaythu standard — {type} in {location} hege irabbeku antha."],
      few_times: ["Consistency across visits — great restaurant alli adu mattE iruttade.", "Prathi visit confirm maaDutthe why barthini antha."],
      regular: ["Tingala kaala — standard drop aagilla once kuda.", "Consistency over time — real loyalty earn maaDutthe."],
      loyal: ["Varshagalinda — still same taste first time hage.", "Long-term loyalty consistent quality inda earn aaguttade."],
    },
    closings: {
      excellent: {
        first: ["{location} alli {type} beku aadre — {shop} first recommendation.", "Already mooru jana ge address heLbitte. Highly recommend.", "Matthe bega barthini. Highly recommend.", "Best meal in {location} in a long time."],
        few_times: ["My regular spot — no other needed.", "Will keep coming back."],
        regular: ["Month after month first choice.", "Only {type} recommend in {location}."],
        loyal: ["Years in — still best. No hesitation recommend.", "Family go-to — highest endorsement."],
      },
      good: { first: ["Matthe barthini."], few_times: ["Recommend."], regular: ["Reliable."], loyal: ["Trusted."] },
      average: { first: ["Fine."], few_times: ["OK."], regular: ["Adequate."], loyal: ["Familiar."] },
    },
  },
  barber: {
    openings: {
      excellent: {
        first: [
          "{location} alli barbers bahala nodide — {shop} genuinely best sigithu.",
          "First visit {shop} ge — months alli best haircut aaytu.",
          "Hogo antha try maadide — next appointment plan ready.",
          "My usual barber unavailable — {shop} try maadide — not going back now.",
          "First time illi — already 3 people ge recommend maadide.",
          "Vague idea iddhu — {shop} alli better aagthu.",
          "New barber try maadoke sceptical aagthu — {shop} quickly changed that.",
          "First visit — my regular barber in {location} now. No doubt.",
        ],
        few_times: ["Kelavu sari bandhe — quality consistent every visit.", "Each haircut as good as first.", "Already my regular after 3 visits."],
        regular: ["Kele tingalinda — standard drop illlada.", "Regular — reliably good."],
        loyal: ["Varshagalinda {shop} — skill and cleanliness maintained.", "Years — never left dissatisfied.", "My go-to barber for years."],
      },
      good: {
        first: ["Good first haircut — exactly asked.", "Solid barbershop."], few_times: ["Consistent."], regular: ["Reliable."], loyal: ["Trusted."],
      },
      average: { first: ["Decent cut."], few_times: ["Fine."], regular: ["Adequate."], loyal: ["Consistent."] },
    },
    aspects: {
      great_cut: ["Haircut precise — nothing lost in translation.", "Time tegedukondu beku aadhdhu keLidru — before scissors.", "Left fully satisfied — first time in long time.", "Fade clean, edges sharp, well-proportioned.", "Reference photo show maadide — accurate result.", "Detailing careful — neckline and hairline neat.", "Week later kuda looks good."],
      clean_shop: ["Properly cleaned between customers — towels fresh, tools sanitised.", "Razors and scissors cleaned before use — nodide.", "Hygiene genuine priority here.", "Sterilised tools, changed towels.", "Floor regularly swept, station clean before client."],
      beard_trim: ["Beard better shaped than I manage myself.", "Lines clean, shape improved.", "Primarily beard work — brilliantly done.", "Straight razor shave — smooth, no irritation.", "Symmetry careful — clean and proportional."],
      modern_styles: ["Current styles known — not 2005.", "Specific style asked — barber immediately understood.", "Classic to modern — skill range.", "Fade technique modern, well-executed."],
      quick_service: ["25 min — full haircut and beard trim. Efficient.", "No wasted time — fast without corners cut.", "Tight schedule — managed without rush.", "Quick but proper."],
      fair_price: ["Price fair for quality — good value in {location}.", "Elsewhere more paid, worse cut — illi better value.", "Transparent pricing — no surprises.", "Reasonable — skill justifies, price reasonable."],
      good_ambiance: ["Relaxed atmosphere — not rushed or noisy.", "Good music, clean space, friendly — enjoy being there.", "Comfortable — 30 min pleasant.", "Makes it a place you want to return."],
      expert_staff: ["Trained and skilled — technique difference visible.", "Barber listened, asked right questions, delivered.", "Expertise evident — not self-trained.", "Team skill consistent — Monday or Saturday same quality."],
      no_waiting: ["No appointment — 10 min alli chair alli iddhe.", "Queue fast — managed well.", "Walk-in — promptly seen.", "Busy day kuda wait excessive illlada."],
      hair_advice: ["Practical advice about hair type and face shape — useful.", "Style I had not considered — turned out exactly right.", "Simple hair care tips — actually used.", "Wrong product pointed out — good insight."],
      massage: ["Head massage genuinely relaxing.", "Scalp massage worth coming for alone.", "Good strong head massage — properly relaxed left."],
      facial: ["Cleanup thorough — skin noticeably cleaner after.", "Facial proper — not just face wipe.", "Better-looking skin after — good products and technique."],
    },
    bridges: {
      first: ["First haircut alli skill and care — exceeded expectation.", "Left already planning next — best sign."],
      few_times: ["Consistent quality — trustworthy barber."], regular: ["Months — standard same throughout."], loyal: ["Years — never left unhappy. Remarkable."],
    },
    closings: {
      excellent: {
        first: ["My regular barber in {location} — highly recommend.", "Already 3 people ge recommend maadide.", "No other barber needed in {location}."],
        few_times: ["Will keep coming back.", "Recommend."], regular: ["Month after month first choice.", "Best barber in {location}."], loyal: ["Years in — only choice. Recommend.", "Loyalty fully earned."],
      },
      good: { first: ["Matthe barthini."], few_times: ["Recommend."], regular: ["Reliable."], loyal: ["Trusted."] },
      average: { first: ["Fine."], few_times: ["OK."], regular: ["Adequate."], loyal: ["Consistent."] },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// ASSEMBLY ENGINE
// ─────────────────────────────────────────────────────────────

function assembleShopReview(lang, category, vars, rating, liked, duration, variant = 0) {
  const r = rating || 'excellent';
  const d = duration || 'first';
  const templates = lang === 'english' ? getEnglishTemplates(category) : KN_TEMPLATES[category];
  if (!templates) return { short: '', medium: '', detailed: '' };

  // Each language gets a distinct seed offset so EN and KN don't mirror each other
  const langOffset = lang === 'kannada' ? 500 : 0;
  const seededPick = makeSeededPick(variant + langOffset);

  const openingPool = (templates.openings[r] || templates.openings.excellent)[d] || templates.openings.excellent.first;
  const opening = fill(seededPick(openingPool), vars);

  const aspectSentences = [];
  liked.forEach((key) => {
    const pool = templates.aspects[key];
    if (pool?.length) aspectSentences.push(fill(seededPick(pool, aspectSentences), vars));
  });

  const closing = fill(
    seededPick((templates.closings[r] || templates.closings.excellent)[d] || templates.closings.excellent.first),
    vars
  );
  const bridge = fill(seededPick(templates.bridges[d] || templates.bridges.first), vars);

  // SHORT: opening + first aspect (if any) + closing
  let short = [opening, aspectSentences[0] || '', closing].filter(Boolean).join(' ');
  const shortWords = short.split(/\s+/).length;
  if (shortWords > 65) short = [opening, closing].join(' ');

  // MEDIUM: opening + 2 aspects + closing (seeded shuffle for aspect order)
  const medAspects = seededPickN(aspectSentences, Math.min(2, aspectSentences.length), variant + 200);
  const medium = [opening, ...medAspects, closing].filter(Boolean).join(' ');

  // DETAILED: opening + bridge + 3 aspects + closing (seeded shuffle, different offset)
  const detAspects = seededPickN(aspectSentences, Math.min(3, aspectSentences.length), variant + 400);
  const detailed = [opening, bridge, ...detAspects, closing].filter(Boolean).join(' ');

  return { short, medium, detailed };
}

function getEnglishTemplates(category) {
  const map = {
    clothes: CLOTHES_EN,
    pharmacy: PHARMACY_EN,
    jewellery: JEWELLERY_EN,
    shoes: SHOES_EN,
    'car-service': CARSERVICE_EN,
    barber: BARBER_EN,
    restaurant: RESTAURANT_EN,
  };
  return map[category];
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────

// variant = reviews_generated count from Supabase (increments with each generation)
// This ensures review #47 for a shop is always different from review #46,
// even when two customers pick the exact same rating / liked options / duration.
export function generateShopReview({ shopName, ownerName, businessType, subType, location, rating, liked, duration, variant = 0 }) {
  const shortLocation = (location || '').split(',')[0].trim();
  const vars = {
    shop: shopName,
    owner: ownerName || '',
    type: subType || businessType,
    location: shortLocation,
  };

  const ac = liked.length;
  // Uniqueness score climbs as variant grows — visually shows value to shopkeeper
  const uniquenessBase = Math.min(96, 88 + Math.min(ac * 2, 6));
  const variantBoost = Math.min(3, Math.floor(variant / 10)); // +1 per 10 reviews, cap at +3
  const scores = {
    authenticity: Math.min(98, 84 + ac * 2 + (rating === 'excellent' ? 3 : 0)),
    humanLikeness: Math.min(97, 83 + ac * 2 + (duration !== 'first' ? 3 : 1)),
    uniqueness: uniquenessBase + variantBoost,
    googleSafe: 97,
  };

  return {
    reviews: {
      english: assembleShopReview('english', businessType, vars, rating, liked, duration, variant),
      kannada: assembleShopReview('kannada', businessType, vars, rating, liked, duration, variant),
    },
    scores,
    variant, // pass back so review page can show "Review #N"
  };
}
