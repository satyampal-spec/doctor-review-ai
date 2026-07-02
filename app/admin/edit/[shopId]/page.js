'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CATEGORY_CONFIG } from '@/lib/shopReviewGenerator';

export default function EditShopPage() {
  const { shopId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    businessType: '',
    subType: '',
    location: '',
    googleProfileUrl: '',
    websiteUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', shopId)
        .single();

      if (error || !data) { setNotFound(true); setLoading(false); return; }

      setForm({
        shopName: data.shop_name || '',
        ownerName: data.owner_name || '',
        businessType: data.business_type || '',
        subType: data.sub_type || '',
        location: data.location || '',
        googleProfileUrl: data.google_profile_url || '',
        websiteUrl: data.website_url || '',
      });
      setExistingPhoto(data.photo_url || null);
      setLoading(false);
    }
    load();
  }, [shopId]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const handlePhotoChange = (file) => {
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.shopName.trim()) e.shopName = 'Required';
    if (!form.location.trim()) e.location = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);

    // Upload new photo if selected
    let photoUrl = existingPhoto;
    if (photoFile) {
      const ext = photoFile.name.split('.').pop();
      const filePath = `${shopId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('shop-photos')
        .upload(filePath, photoFile, { upsert: true, contentType: photoFile.type || 'image/jpeg' });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('shop-photos').getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }
    }

    const updates = {
      shop_name: form.shopName.trim(),
      owner_name: form.ownerName.trim() || null,
      business_type: form.businessType,
      sub_type: form.subType || null,
      location: form.location.trim(),
      google_profile_url: form.googleProfileUrl.trim() || null,
      website_url: form.websiteUrl.trim() || null,
      photo_url: photoUrl,
    };

    const { error } = await supabase.from('businesses').update(updates).eq('id', shopId);
    setSaving(false);

    if (error) {
      alert('Save failed: ' + error.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const selectedConfig = form.businessType ? CATEGORY_CONFIG[form.businessType] : null;
  const displayPhoto = photoPreview || existingPhoto;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">⏳</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="card text-center max-w-sm">
          <div className="text-4xl mb-3">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Business not found</h2>
          <p className="text-gray-500 mb-4">ID: <code className="text-purple-700">{shopId}</code></p>
          <Link href="/admin/dashboard" className="btn-primary">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-purple-700 font-semibold hover:underline">
            ← Dashboard
          </Link>
          <span className="text-sm text-gray-400 font-mono">{shopId}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">✏️ Edit Business</h1>
          <p className="text-gray-500 text-sm">Changes take effect immediately on the review page.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">

          {/* Category */}
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
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Business Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">{selectedConfig?.nameLabel || 'Business Name'} *</label>
                <input
                  className={`input-field ${errors.shopName ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  value={form.shopName}
                  onChange={(e) => set('shopName', e.target.value)}
                />
                {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>}
              </div>
              <div>
                <label className="label">{selectedConfig?.ownerLabel || 'Owner Name'} (optional)</label>
                <input
                  className="input-field"
                  value={form.ownerName}
                  onChange={(e) => set('ownerName', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Location / Area in Bengaluru *</label>
                <input
                  className={`input-field ${errors.location ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* Photo */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Business Photo</h3>
            {displayPhoto ? (
              <div className="relative rounded-2xl overflow-hidden mb-3 border-2 border-purple-200">
                <img src={displayPhoto} alt="Business" className="w-full h-44 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="bg-white/90 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {photoPreview ? '✓ New photo selected' : '✓ Current photo'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (!photoPreview) setExistingPhoto(null); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-xs font-bold flex items-center justify-center hover:bg-black/70"
                >✕</button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handlePhotoChange(f); }}
                className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
              >
                <div className="text-3xl mb-2">📸</div>
                <p className="text-sm font-semibold text-gray-600">Tap to upload photo</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
              </div>
            )}
            {(!photoPreview && !existingPhoto) || existingPhoto ? (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs text-purple-600 hover:underline font-medium">
                {displayPhoto ? 'Change photo' : 'Upload photo'}
              </button>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoChange(e.target.files[0])}
            />
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Links</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Google Business / Review URL</label>
                <input
                  className="input-field"
                  placeholder="https://share.google/... or https://g.page/yourshop"
                  value={form.googleProfileUrl}
                  onChange={(e) => set('googleProfileUrl', e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">The link customers tap to post their Google review.</p>
              </div>
              <div>
                <label className="label">Website URL</label>
                <input
                  className="input-field"
                  placeholder="https://yourwebsite.com"
                  value={form.websiteUrl}
                  onChange={(e) => set('websiteUrl', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 text-base py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: saved ? '#16a34a' : 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
            >
              {saving ? '⏳ Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
            <Link
              href="/admin/dashboard"
              className="px-6 py-4 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
