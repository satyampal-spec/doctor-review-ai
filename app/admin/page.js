'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, clinicToDb } from '@/lib/supabase';

const specializations = [
  'General Physician',
  'Family Physician',
  'Internal Medicine',
  'Diabetologist',
  'Gynecologist',
  'Cardiologist',
  'Pediatrician',
  'Dermatologist',
  'Orthopedic Surgeon',
  'ENT Specialist',
  'Neurologist',
  'Psychiatrist',
  'Other',
];

const languages = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati'];

const emptyForm = {
  doctorName: '',
  clinicName: '',
  specialization: '',
  experience: '',
  location: '',
  languages: [],
  websiteUrl: '',
  practoUrl: '',
  googleProfileUrl: '',
};

export default function AdminPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const toggleLanguage = (lang) => {
    setForm((f) => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter((l) => l !== lang)
        : [...f.languages, lang],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.doctorName.trim()) e.doctorName = 'Required';
    if (!form.clinicName.trim()) e.clinicName = 'Required';
    if (!form.specialization) e.specialization = 'Select a specialization';
    if (!form.experience || isNaN(form.experience) || Number(form.experience) < 0)
      e.experience = 'Enter valid years of experience';
    if (!form.location.trim()) e.location = 'Required';
    if (form.languages.length === 0) e.languages = 'Select at least one language';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    const id = 'clinic_' + Math.random().toString(36).substring(2, 10);
    const clinic = { ...form, id, createdAt: new Date().toISOString(), stats: { scans: 0, reviewsGenerated: 0, reviewsSubmitted: 0 } };

    const { error } = await supabase.from('clinics').insert([clinicToDb(clinic)]);

    if (error) {
      alert('Error saving clinic: ' + error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSuccess(clinic);
  };

  const reviewUrl =
    typeof window !== 'undefined' && success
      ? `${window.location.origin}/review/${success.id}`
      : '';

  const copyLink = () => {
    navigator.clipboard.writeText(reviewUrl);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="card max-w-lg w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Clinic Registered!</h2>
          <p className="text-gray-500 mb-6">
            Share this link with patients or print the QR code in your clinic.
          </p>

          <div className="bg-blue-50 rounded-xl p-4 mb-4 text-left">
            <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Patient Review Link</p>
            <div className="flex items-center gap-2">
              <code className="text-blue-700 text-sm break-all flex-1">{reviewUrl}</code>
              <button onClick={copyLink} className="btn-secondary text-xs px-3 py-1.5 shrink-0">
                Copy
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Clinic ID: <strong className="font-mono text-blue-700">{success.id}</strong>
          </p>

          <div className="flex gap-3 flex-col sm:flex-row">
            <Link href="/admin/dashboard" className="btn-primary flex-1">
              Go to Dashboard
            </Link>
            <button
              onClick={() => {
                setSuccess(null);
                setForm(emptyForm);
              }}
              className="btn-secondary flex-1"
            >
              Add Another Clinic
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <span className="font-bold text-blue-700">ClinicReview AI</span>
          </Link>
          <Link href="/admin/dashboard" className="text-sm text-blue-600 hover:underline font-medium">
            View Dashboard →
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Clinic</h1>
          <p className="text-gray-500">Takes 2 minutes. Get a QR code instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Doctor Information */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
              Doctor Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Doctor Name *</label>
                <input
                  className={`input-field ${errors.doctorName ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  placeholder="Dr. Rajesh Sharma"
                  value={form.doctorName}
                  onChange={(e) => set('doctorName', e.target.value)}
                />
                {errors.doctorName && <p className="text-red-500 text-xs mt-1">{errors.doctorName}</p>}
              </div>
              <div>
                <label className="label">Clinic Name *</label>
                <input
                  className={`input-field ${errors.clinicName ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  placeholder="Sharma Family Clinic"
                  value={form.clinicName}
                  onChange={(e) => set('clinicName', e.target.value)}
                />
                {errors.clinicName && <p className="text-red-500 text-xs mt-1">{errors.clinicName}</p>}
              </div>
              <div>
                <label className="label">Specialization *</label>
                <select
                  className={`input-field ${errors.specialization ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  value={form.specialization}
                  onChange={(e) => set('specialization', e.target.value)}
                >
                  <option value="">Select specialty...</option>
                  {specializations.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
              </div>
              <div>
                <label className="label">Years of Experience *</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  className={`input-field ${errors.experience ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  placeholder="15"
                  value={form.experience}
                  onChange={(e) => set('experience', e.target.value)}
                />
                {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Clinic Location / Area *</label>
                <input
                  className={`input-field ${errors.location ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  placeholder="Koramangala, Bangalore"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="label">Languages Spoken *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    form.languages.includes(lang)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {errors.languages && <p className="text-red-500 text-xs mt-1">{errors.languages}</p>}
          </div>

          {/* Optional Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
              Optional Links
            </h3>
            <div className="space-y-3">
              <div>
                <label className="label">Website URL</label>
                <input
                  className="input-field"
                  placeholder="https://drsharmaclinic.com"
                  value={form.websiteUrl}
                  onChange={(e) => set('websiteUrl', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Practo Profile URL</label>
                <input
                  className="input-field"
                  placeholder="https://practo.com/..."
                  value={form.practoUrl}
                  onChange={(e) => set('practoUrl', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Google Business Profile URL</label>
                <input
                  className="input-field"
                  placeholder="https://g.page/..."
                  value={form.googleProfileUrl}
                  onChange={(e) => set('googleProfileUrl', e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full text-base py-4">
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Registering Clinic...
              </span>
            ) : (
              'Register Clinic & Get QR Code →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
