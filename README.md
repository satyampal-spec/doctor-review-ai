# ClinicReview AI — Google Review Generator for Doctors

An AI-powered review generation tool for Indian clinics. Patients scan a QR code, answer 3 quick questions, and receive 3 authentic personalised Google review options — ready to copy and post in under 60 seconds.

---

## Features

- **Admin Registration** — Register any clinic/doctor and get a unique QR code instantly
- **Patient Review Flow** — 3-step wizard (rate → liked aspects → consultation duration)
- **AI Review Generation** — Claude AI generates Short, Medium, and Detailed review options
- **Quality Scores** — Each review scored for Authenticity, Human-Likeness, Uniqueness, and Google Safety
- **Admin Dashboard** — Track QR scans, reviews generated, reviews submitted, and conversion rate
- **QR Code Download** — Download a printable QR code PNG for your clinic reception

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- No API key required — review generation is 100% free and client-side.

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/admin` | Register a clinic/doctor |
| `/admin/dashboard` | View all clinics, stats, QR codes |
| `/review/[clinicId]` | Patient-facing review form (QR destination) |

---

## Deploy to Vercel (Recommended)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your API key
4. Click **Deploy**

That's it. Vercel will give you a live URL. Use that URL as the base for your patient QR codes.

---

## Deploy to GitHub Pages / Static Hosts

This is a **Next.js** app with a server-side API route — it requires a Node.js server. It cannot be deployed as a purely static site. Use Vercel, Railway, Render, or any Node-compatible host.

---

## Environment Variables

No API keys required. Review generation runs entirely in the browser.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BASE_URL` | No | Override base URL (e.g. for QR code links on production) |

---

## Data Storage

Clinic data is stored in **localStorage** (browser-based). This means:
- Data persists on the same device/browser
- No database setup required for MVP
- For production multi-device use, replace `localStorage` calls in the admin pages with a real database (e.g. Supabase, MongoDB, PlanetScale)

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude (claude-3-5-haiku — fast & cost-effective)
- **QR Codes**: `qrcode` npm package
- **Storage**: localStorage (client-side, upgradeable to any DB)

---

## Cost

**Zero.** Review generation is entirely client-side JavaScript — no API calls, no external services, no ongoing cost. Just host the app and it runs for free indefinitely.

---

## Roadmap

- [ ] Multi-language reviews (Hindi, Kannada, Tamil)
- [ ] Voice-to-review conversion
- [ ] WhatsApp review link sharing
- [ ] Google Review direct posting flow
- [ ] Competitor review monitoring
- [ ] Monthly reputation score report
- [ ] Real database integration (Supabase)
- [ ] Multi-user admin accounts

---

## License

MIT — free to use and modify.
