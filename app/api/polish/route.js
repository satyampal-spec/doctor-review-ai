// Free, no API key, no billing — uses LanguageTool's public grammar/spell
// check endpoint (api.languagetool.org) instead of a paid LLM. Fixes
// ONLY spelling/grammar/casing of exactly what the patient typed; never
// adds words, sentences, doctor names, or keywords — this route just
// applies LanguageTool's own suggested corrections in place.

// Patient reviews use a narrow, predictable vocabulary that LanguageTool's
// general-purpose dictionary doesn't prioritize — it ranked "staph" (a
// bacteria) above "staff" for the typo "staf", which is a bad guess for
// context it doesn't have. Nudge toward common review words when one is
// a close match, before falling back to LanguageTool's own ranking.
const REVIEW_VOCAB = [
  'staff', 'doctor', 'nurse', 'nice', 'good', 'great', 'clean', 'helpful',
  'friendly', 'kind', 'caring', 'professional', 'hospital', 'clinic',
  'treatment', 'experience', 'recommend', 'appointment', 'waiting', 'time',
  'excellent', 'polite', 'patient', 'service', 'checkup', 'consultation',
  'explained', 'comfortable', 'quick', 'gentle', 'thorough', 'attentive',
];

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// LanguageTool often ranks an all-caps acronym first for a short garbled
// word (e.g. "nic" -> "NIC" before "nice"). Prefer the first suggestion
// that's plain lowercase when the original word was plain lowercase —
// closer to what a human proofreader would actually pick.
function pickReplacement(match, originalWord) {
  const candidates = match.replacements.map(r => r.value).filter(Boolean);
  if (!candidates.length) return null;

  const lowerOriginal = originalWord.toLowerCase();
  let bestVocab = null, bestDist = Infinity;
  for (const w of REVIEW_VOCAB) {
    const d = levenshtein(lowerOriginal, w);
    if (d <= 2 && d < bestDist) { bestDist = d; bestVocab = w; }
  }
  if (bestVocab) return bestVocab;

  const wasLower = originalWord === lowerOriginal && /[a-z]/.test(originalWord);
  if (wasLower) {
    const lowerCandidate = candidates.find(c => /^[a-z]+$/.test(c));
    if (lowerCandidate) return lowerCandidate;
  }
  return candidates[0];
}

export async function POST(request) {
  const { text } = await request.json();
  if (!text || !text.trim()) {
    return Response.json({ error: 'empty_text' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({ text, language: 'en-US' });
    const res = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    if (!res.ok) throw new Error(`languagetool status ${res.status}`);

    const data = await res.json();
    // Apply from the end of the string backward so earlier offsets stay valid.
    const matches = (data.matches || [])
      .filter(m => m.replacements && m.replacements.length > 0)
      .sort((a, b) => b.offset - a.offset);

    let fixed = text;
    for (const m of matches) {
      const original = fixed.slice(m.offset, m.offset + m.length);
      const replacement = pickReplacement(m, original);
      if (!replacement) continue;
      fixed = fixed.slice(0, m.offset) + replacement + fixed.slice(m.offset + m.length);
    }

    return Response.json({ polished: fixed });
  } catch (err) {
    console.error('polish upstream error', err);
    return Response.json({ error: 'upstream_error' }, { status: 502 });
  }
}
