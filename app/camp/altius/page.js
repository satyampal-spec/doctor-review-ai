'use client';

import { useState } from 'react';

// ── Altius real brand theme (sampled from altiushospital.com) ──
// orange accent: rgb(255,134,48) · navy: rgb(13,50,118)
const THEME = {
  primary:  '#FF8630',
  dark:     '#C5591A',
  navy:     '#0D3276',
  gradient: 'linear-gradient(135deg, #FF8630 0%, #F2600C 100%)',
  light:    '#FFF1E6',
  ring:     '#FFD3AD',
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
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', padding: '10px 22px', borderRadius: 16, marginBottom: 18, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            <img src="/camp/altius-logo.webp" alt="Altius Hospitals" style={{ height: 40, display: 'block' }} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
            🎉 {OFFER_TITLE}
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: '0 20px', marginTop: -24 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 20, boxShadow: '0 12px 40px rgba(242,96,12,0.18)', padding: 26 }}>
          {!submitted ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: THEME.navy, marginBottom: 4 }}>⏳ Limited slots for today</div>
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
                    boxShadow: canSubmit ? '0 8px 20px rgba(242,96,12,0.35)' : 'none',
                  }}
                >
                  {submitting ? 'Submitting…' : 'Claim My Spot →'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 46, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: THEME.navy, marginBottom: 8 }}>You're In!</div>
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
