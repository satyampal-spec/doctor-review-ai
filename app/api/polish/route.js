// Server-side only — ANTHROPIC_API_KEY never reaches the client. Fixes
// grammar/spelling of exactly what the patient typed, nothing else: no
// added sentences, no doctor/specialty keywords (those belong only to the
// auto-generate fallback in app/review/doctor/[clinicId]/page.js).
const SYSTEM_PROMPT = `You are a careful proofreader for short patient reviews of doctors. Fix ONLY spelling, grammar, and basic sentence structure in the text the user gives you. Do not add any new sentences, facts, opinions, doctor names, specialties, or keywords that are not already in the original text. Do not change the meaning, tone, or length beyond what's needed to fix errors. Keep it sounding like something a real patient typed, not formal or AI-generated. Return ONLY the corrected text with no preamble, quotes, or explanation.`;

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'not_configured' }, { status: 501 });
  }

  const { text } = await request.json();
  if (!text || !text.trim()) {
    return Response.json({ error: 'empty_text' }, { status: 400 });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    }),
  });

  if (!res.ok) {
    return Response.json({ error: 'upstream_error' }, { status: 502 });
  }

  const data = await res.json();
  const polished = data?.content?.[0]?.text?.trim();
  if (!polished) {
    return Response.json({ error: 'empty_response' }, { status: 502 });
  }

  return Response.json({ polished });
}
