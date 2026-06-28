'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CATEGORY_CONFIG } from '@/lib/shopReviewGenerator';

const emptyForm = {
  shopName: '',
  ownerName: '',
  businessType: '',
  subType: '',
  location: '',
  googleProfileUrl: '',
  websiteUrl: '',
};

export default function AddShopPage() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const selectedConfig = form.businessType ? CATEGORY_CONFIG[form.businessType] : null;

  const validate = () => {
    const e = {};
    if (!form.shopName.trim()) e.shopName = 'Required';
    if (!form.businessType) e.businessType = 'Select a category';
    if (!form.location.trim()) e.location = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    const id = 'shop_' + Math.random().toString(36).substring(2, 10);

    const row = {
      id,
      shop_name: form.shopName.trim(),
      owner_name: form.ownerName.trim() || null,
      business_type: form.businessType,
      sub_type: form.subType || null,
      location: form.location.trim(),
      google_profile_url: form.googleProfileUrl.trim() || null,
      website_url: form.websiteUrl.trim() || null,
      scans: 0,
      reviews_generated: 0,
      reviews_submitted: 0,
    };

    const { error } = await supabase.from('businesses').insert([row]);
    if (error) { alert('Error saving shop: ' + error.message); setSubmitting(false); return; }

    setSubmitting(false);
    setSuccess({ ...form, id });
  };

  const reviewUrl =
    typeof window !== 'undefined' && success
      ? `${window.location.origin}/review/shop/${success.id}`
      : '';

  const copyLink = () => navigator.clipboard.writeText(reviewUrl);

  if (success) {
    const cfg = CATEGORY_CONFIG[success.businessType];
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="card max-w-lg w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{cfg?.emoji} Shop Registered!</h2>
          <p className="text-gray-500 mb-2 font-semibold">{success.shopName}</p>
          <p className="text-gray-400 text-sm mb-6">{cfg?.label} · {success.location}</p>

          <div className="bg-purple-50 rounded-xl p-4 mb-4 text-left">
            <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Customer Review Link</p>
            <div className="flex items-center gap-2">
              <code className="text-purple-700 text-sm break-all flex-1">{reviewUrl}</code>
              <button onClick={copyLink} className="btn-secondary text-xs px-3 py-1.5 shrink-0">Copy</button>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Shop ID: <strong className="font-mono text-purple-700">{success.id}</strong>
          </p>

          <div className="flex gap-3 flex-col sm:flex-row">
            <Link href="/admin/dashboard" className="btn-primary flex-1 bg-purple-600 hover:bg-purple-700">
              Go to Dashboard
            </Link>
            <button onClick={() => { setSuccess(null); setForm(emptyForm); }} className="btn-secondary flex-1">
              Add Another Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🏪</span>
            <span className="font-bold text-purple-700">ShopReview AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-500 hover:underline">Clinic</Link>
            <Link href="/admin/dashboard" className="text-sm text-purple-600 hover:underline font-medium">Dashboard →</Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Shop</h1>
          <p className="text-gray-500">Takes 2 minutes. Get a QR code instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Category Selection */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Business Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { set('businessType', key); set('subType', ''); }}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all text-sm font-semibold ${
                    form.businessType === key
                      ? 'border-purple-500 bg-purple-50 text-purple-800'
                      : 'border-gray-100 bg-white text-gray-600 hover:border-purple-200 hover:bg-purple-50/50'
                  }`}
                >
                  <span className="text-2xl">{cfg.emoji}</span>
                  <span className="text-center leading-tight">{cfg.label}</span>
                </button>
              ))}
            </div>
            {errors.businessType && <p className="text-red-500 text-xs mt-2">{errors.businessType}</p>}
          </div>

          {/* Sub-type */}
          {selectedConfig && (
            <div>
              <label className="label">{selectedConfig.label} Type (optional)</label>
              <select
                className="input-field"
                value={form.subType}
                onChange={(e) => set('subType', e.target.value)}
              >
                <option value="">Select type (optional)...</option>
                {selectedConfig.subTypes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Shop Details */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Shop Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{selectedConfig?.nameLabel || 'Shop Name'} *</label>
                <input
                  className={`input-field ${errors.shopName ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  placeholder="e.g. Fashion Point, City Pharmacy..."
                  value={form.shopName}
                  onChange={(e) => set('shopName', e.target.value)}
                />
                {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>}
              </div>
              <div>
                <label className="label">{selectedConfig?.ownerLabel || 'Owner Name'} (optional)</label>
                <input
                  className="input-field"
                  placeholder="e.g. Rajan Kumar"
                  value={form.ownerName}
                  onChange={(e) => set('ownerName', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Location / Area in Bengaluru *</label>
                <input
                  className={`input-field ${errors.location ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  placeholder="e.g. Koramangala, Bangalore"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Optional Links</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Google Business Profile URL</label>
                <input
                  className="input-field"
                  placeholder="https://g.page/yourshop"
                  value={form.googleProfileUrl}
                  onChange={(e) => set('googleProfileUrl', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Website URL</label>
                <input
                  className="input-field"
                  placeholder="https://yourshop.com"
                  value={form.websiteUrl}
                  onChange={(e) => set('websiteUrl', e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full text-base py-4 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Registering Shop...
              </span>
            ) : 'Register Shop & Get QR Code →'}
          </button>
        </form>
      </div>
    </div>
  );
}
