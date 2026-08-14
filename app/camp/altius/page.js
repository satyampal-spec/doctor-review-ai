'use client';

import { useState } from 'react';

// ── Altius theme (same palette as app/review/hospital/[shopId]/page.js) ──
const GOOGLE_COLORS = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853' };
const THEME = {
  primary:  GOOGLE_COLORS.blue,
  dark:     '#1a73e8',
  gradient: `linear-gradient(135deg, ${GOOGLE_COLORS.blue} 0%, #1a73e8 100%)`,
  light:    '#e8f0fe',
  ring:     '#aecbfa',
  accents:  [GOOGLE_COLORS.blue, GOOGLE_COLORS.red, GOOGLE_COLORS.yellow, GOOGLE_COLORS.green],
};

// ── TODO: fill these in once the Google Form is created ──
// 1. Create the form (Name + Phone Number, both short answer, required)
// 2. Open it, click the 3-dot menu → "Get pre-filled link", fill dummy values, click "Get link"
// 3. The resulting URL looks like:
//    https://docs.google.com/forms/d/e/1FAIpQLS.../viewform?usp=pp_url&entry.111111=John&entry.222222=9999999999
//    -> GOOGLE_FORM_ID   = the 1FAIpQLS... part
//    -> ENTRY_NAME       = entry.111111
//    -> ENTRY_PHONE      = entry.222222
const GOOGLE_FORM_ID = '1FAIpQLSdC0xrYWjwDdC24XW2v9jipiyUeQvw9RvSZB7ekNlTROfMWKQ';
const ENTRY_NAME = 'entry.1496448125';
const ENTRY_PHONE = 'entry.687105003';
const GOOGLE_FORM_ACTION = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`;

// ── TODO: confirm the offer copy ──
const OFFER_TITLE = 'Claim It, Hurry!';
const OFFER_SUBTITLE = 'Free Health Checkup — Today Only';

export default function AltiusCampPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const phoneValid = /^[6-9]\d{9}$/.test(phone.trim());
  const canSubmit = name.trim().length > 1 && phoneValid && !submitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    // Fire-and-forget POST straight into the Google Form's response sheet
    // via a hidden iframe target, so there's no redirect / CORS issue.
    const form = document.createElement('form');
    form.action = GOOGLE_FORM_ACTION;
    form.method = 'POST';
    form.target = 'hidden_iframe';

    const nameInput = document.createElement('input');
    nameInput.name = ENTRY_NAME;
    nameInput.value = name.trim();
    form.appendChild(nameInput);

    const phoneInput = document.createElement('input');
    phoneInput.name = ENTRY_PHONE;
    phoneInput.value = phone.trim();
    form.appendChild(phoneInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc', display: 'flex', flexDirection: 'column' }}>
      <iframe name="hidden_iframe" style={{ display: 'none' }} title="hidden" />

      {/* Header */}
      <div style={{ background: THEME.gradient, padding: '28px 20px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', padding: '6px 14px', borderRadius: 999, marginBottom: 14 }}>
            {THEME.accents.map((c, i) => (
              <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
            ))}
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 0.4, marginLeft: 4 }}>ALTIUS MULTI-SPECIALITY HOSPITAL</span>
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 8, textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
            🎉 {OFFER_TITLE}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>
            {OFFER_SUBTITLE}
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: '0 20px', marginTop: -24 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 20, boxShadow: '0 12px 40px rgba(26,115,232,0.15)', padding: 26 }}>
          {!submitted ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: THEME.dark, marginBottom: 4 }}>⏳ Limited slots for today</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Leave your details and our team will call you right back</div>
              </div>

              <form onSubmit={handleSubmit}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Your Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: 14, border: `2px solid ${THEME.ring}`, fontSize: 16, marginBottom: 16, outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = THEME.primary)}
                  onBlur={(e) => (e.target.style.borderColor = THEME.ring)}
                />

                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: 14, border: `2px solid ${THEME.ring}`, fontSize: 16, marginBottom: 20, outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = THEME.primary)}
                  onBlur={(e) => (e.target.style.borderColor = THEME.ring)}
                />

                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                    background: canSubmit ? THEME.gradient : '#e2e8f0',
                    color: '#fff', fontWeight: 800, fontSize: 16,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    boxShadow: canSubmit ? '0 8px 20px rgba(66,133,244,0.35)' : 'none',
                  }}
                >
                  {submitting ? 'Submitting…' : 'Claim My Spot →'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 46, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: THEME.dark, marginBottom: 8 }}>You're In!</div>
              <div style={{ fontSize: 14, color: '#64748b' }}>
                Our team will call <b>{name}</b> shortly at <b>{phone}</b>.
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, margin: '20px 0 30px' }}>
          Altius Multi-Speciality Hospital · HBR Layout, Bengaluru
        </div>
      </div>
    </div>
  );
}
