'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CATEGORY_CONFIG } from '@/lib/shopReviewGenerator';

// Category-specific service/menu templates to help users fill in
const CATEGORY_SERVICE_HINTS = {
  clinic:        [{ name: 'General Consultation', price: '200', duration: '20 min' }, { name: 'Follow-up Visit', price: '100', duration: '10 min' }],
  pharmacy:      [{ name: 'Home Delivery', price: '', duration: '' }, { name: 'Prescription Filling', price: '', duration: '' }],
  barber:        [{ name: 'Haircut', price: '100', duration: '30 min' }, { name: 'Shave', price: '80', duration: '20 min' }, { name: 'Hair Colour', price: '300', duration: '60 min' }],
  clothes:       [{ name: "Men's Wear", price: '', duration: '' }, { name: "Women's Wear", price: '', duration: '' }],
  jewellery:     [{ name: 'Gold Jewellery', price: '', duration: '' }, { name: 'Diamond Jewellery', price: '', duration: '' }, { name: 'Custom Orders', price: '', duration: '' }],
  shoes:         [{ name: 'Sports Shoes', price: '', duration: '' }, { name: 'Formal Shoes', price: '', duration: '' }, { name: 'Sandals & Slippers', price: '', duration: '' }],
  'car-service': [{ name: 'Oil Change', price: '500', duration: '30 min' }, { name: 'Full Service', price: '2500', duration: '3 hrs' }, { name: 'Tyre Change', price: '300', duration: '20 min' }],
  restaurant:    [],
};

const RESTAURANT_MENU_HINT = [
  { category: 'Starters', items: [{ name: 'Veg Spring Rolls', price: '120', desc: '' }] },
  { category: 'Main Course', items: [{ name: 'Paneer Butter Masala', price: '220', desc: '' }] },
];

function SectionLabel({ children }) {
  return (
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
      <div className="flex-1 h-px bg-gray-100" />
      {children}
      <div className="flex-1 h-px bg-gray-100" />
    </h3>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function WebsiteBuilderPage({ params }) {
  const { businessId } = params;
  const [biz, setBiz]     = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const fileInputRef = useRef(null);

  // Form state
  const [tagline, setTagline]   = useState('');
  const [about, setAbout]       = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress]   = useState('');
  const [timings, setTimings]   = useState('');
  const [estYear, setEstYear]   = useState('');
  const [highlights, setHighlights] = useState(''); // comma-separated
  const [galleryUrls, setGalleryUrls] = useState([]);
  // Services (all categories except restaurant)
  const [services, setServices] = useState([{ name: '', price: '', duration: '', desc: '' }]);
  // Menu (restaurant only)
  const [menu, setMenu] = useState([{ category: '', items: [{ name: '', price: '', desc: '' }] }]);
  // Clinic extras
  const [clinicExtras, setClinicExtras] = useState({ qualifications: '', languages: '', consultation_fee: '' });
  // Restaurant extras
  const [restExtras, setRestExtras] = useState({ cuisine: '', veg_type: 'both' });

  useEffect(() => {
    async function load() {
      const { data: bizData, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();
      if (error || !bizData) { setNotFound(true); return; }
      setBiz(bizData);

      // Pre-fill whatsapp and address from business data
      if (!whatsapp) setWhatsapp('');
      if (!address) setAddress(bizData.location || '');

      // Load existing site data
      const { data: siteData } = await supabase
        .from('business_websites')
        .select('*')
        .eq('business_id', businessId)
        .single();

      if (siteData) {
        setTagline(siteData.tagline || '');
        setAbout(siteData.about || '');
        setWhatsapp(siteData.whatsapp_number || '');
        setAddress(siteData.address || bizData.location || '');
        setTimings(siteData.timings || '');
        setGalleryUrls(siteData.gallery_urls || []);
        const ex = siteData.extra || {};
        setEstYear(ex.established_year || '');
        setHighlights((ex.highlights || []).join(', '));
        if (bizData.business_type === 'restaurant') {
          setMenu(ex.menu?.length ? ex.menu : RESTAURANT_MENU_HINT);
          setRestExtras({ cuisine: ex.cuisine || '', veg_type: ex.veg_type || 'both' });
        } else {
          setServices(ex.services?.length ? ex.services : (CATEGORY_SERVICE_HINTS[bizData.business_type] || [{ name: '', price: '', duration: '', desc: '' }]));
          if (bizData.business_type === 'clinic') {
            setClinicExtras({ qualifications: ex.qualifications || '', languages: ex.languages || '', consultation_fee: ex.consultation_fee || '' });
          }
        }
      } else {
        // First time — pre-fill hints
        setAddress(bizData.location || '');
        if (bizData.business_type === 'restaurant') {
          setMenu(RESTAURANT_MENU_HINT);
        } else {
          const hints = CATEGORY_SERVICE_HINTS[bizData.business_type] || [];
          if (hints.length) setServices(hints);
        }
      }
    }
    load();
  }, [businessId]);

  const uploadPhoto = async (file, idx) => {
    setUploadingIdx(idx);
    const ext = file.name.split('.').pop();
    const path = `${businessId}_gallery_${idx}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('site-gallery').upload(path, file, { upsert: true });
    if (error) {
      alert('Upload failed: ' + error.message + '\n\nMake sure you created the "site-gallery" bucket in Supabase Storage → New bucket → Public ON');
    } else {
      const { data } = supabase.storage.from('site-gallery').getPublicUrl(path);
      const newUrls = [...galleryUrls];
      newUrls[idx] = data.publicUrl;
      setGalleryUrls(newUrls);
    }
    setUploadingIdx(null);
  };

  const removePhoto = (idx) => {
    const newUrls = [...galleryUrls];
    newUrls.splice(idx, 1);
    setGalleryUrls(newUrls);
  };

  const addService = () => setServices((s) => [...s, { name: '', price: '', duration: '', desc: '' }]);
  const updateService = (i, key, val) => setServices((s) => s.map((x, j) => j === i ? { ...x, [key]: val } : x));
  const removeService = (i) => setServices((s) => s.filter((_, j) => j !== i));

  const addMenuCategory = () => setMenu((m) => [...m, { category: '', items: [{ name: '', price: '', desc: '' }] }]);
  const updateMenuCategory = (ci, key, val) => setMenu((m) => m.map((c, i) => i === ci ? { ...c, [key]: val } : c));
  const addMenuItem = (ci) => setMenu((m) => m.map((c, i) => i === ci ? { ...c, items: [...c.items, { name: '', price: '', desc: '' }] } : c));
  const updateMenuItem = (ci, ii, key, val) => setMenu((m) => m.map((c, i) => i === ci ? { ...c, items: c.items.map((item, j) => j === ii ? { ...item, [key]: val } : item) } : c));
  const removeMenuItem = (ci, ii) => setMenu((m) => m.map((c, i) => i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c));
  const removeMenuCategory = (ci) => setMenu((m) => m.filter((_, i) => i !== ci));

  const handleSave = async () => {
    if (!whatsapp.trim()) { alert('WhatsApp number is required'); return; }
    setSaving(true);

    const extra = {
      established_year: estYear,
      highlights: highlights.split(',').map((h) => h.trim()).filter(Boolean),
    };

    if (biz.business_type === 'restaurant') {
      extra.menu = menu.filter((c) => c.category);
      extra.cuisine = restExtras.cuisine;
      extra.veg_type = restExtras.veg_type;
    } else {
      extra.services = services.filter((s) => s.name);
      if (biz.business_type === 'clinic') {
        extra.qualifications = clinicExtras.qualifications;
        extra.languages = clinicExtras.languages;
        extra.consultation_fee = clinicExtras.consultation_fee;
      }
    }

    const payload = {
      business_id: businessId,
      tagline: tagline.trim(),
      about: about.trim(),
      whatsapp_number: whatsapp.trim(),
      address: address.trim(),
      timings: timings.trim(),
      gallery_urls: galleryUrls.filter(Boolean),
      extra,
      published: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('business_websites').upsert(payload, { onConflict: 'business_id' });
    setSaving(false);
    if (error) { alert('Save failed: ' + error.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-800">Business not found</h2>
        <Link href="/admin/dashboard" className="mt-4 inline-block text-blue-600 underline">← Dashboard</Link>
      </div>
    </div>
  );

  if (!biz) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  const cfg = CATEGORY_CONFIG[biz.business_type] || {};
  const isRestaurant = biz.business_type === 'restaurant';
  const siteUrl = typeof window !== 'undefined' ? `${window.location.origin}/site/${businessId}` : `/site/${businessId}`;

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all bg-white';
  const textareaCls = inputCls + ' resize-none';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 transition-all">← Dashboard</Link>
            <span className="text-gray-300">/</span>
            <span className="font-bold text-gray-800">{cfg.emoji} {biz.shop_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={siteUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
              👁 Preview
            </a>
            <button onClick={handleSave} disabled={saving}
              className="text-sm px-5 py-2 rounded-xl font-bold text-white transition-all disabled:opacity-50"
              style={{ background: saved ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#9333ea,#7c3aed)' }}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Website'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Website link */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
          <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Your Website URL</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm text-purple-700 break-all">{siteUrl}</code>
            <button onClick={() => navigator.clipboard.writeText(siteUrl)}
              className="text-xs px-3 py-1.5 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition-all shrink-0">
              Copy
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <SectionLabel>Basic Info</SectionLabel>

          <Field label="Tagline *" hint="One powerful line customers see first. Max 60 chars.">
            <input className={inputCls} maxLength={80}
              placeholder={`e.g. Bengaluru's Most Trusted ${cfg.label || 'Business'}`}
              value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </Field>

          <Field label="About / Description" hint="Tell your story. 2–4 sentences work best.">
            <textarea className={textareaCls} rows={4}
              placeholder="We've been serving Bengaluru since 2010 with a commitment to quality and care..."
              value={about} onChange={(e) => setAbout(e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="WhatsApp Number *" hint="10-digit number (no country code)">
              <input className={inputCls} placeholder="9876543210" maxLength={10}
                value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </Field>
            <Field label="Established Year">
              <input className={inputCls} placeholder="2015"
                value={estYear} onChange={(e) => setEstYear(e.target.value)} />
            </Field>
          </div>

          <Field label="Full Address">
            <input className={inputCls} placeholder="Shop No. 12, MG Road, Bengaluru – 560001"
              value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>

          <Field label="Opening Hours" hint="Write naturally — customers will read this.">
            <input className={inputCls}
              placeholder="Mon–Sat: 9am to 9pm  |  Sunday: 10am to 6pm"
              value={timings} onChange={(e) => setTimings(e.target.value)} />
          </Field>

          <Field label="Key Highlights" hint="Comma-separated — shown as bullet points in About section.">
            <input className={inputCls}
              placeholder="Free parking, 20+ years experience, Insurance accepted, Home delivery"
              value={highlights} onChange={(e) => setHighlights(e.target.value)} />
          </Field>
        </div>

        {/* Clinic extras */}
        {biz.business_type === 'clinic' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
            <SectionLabel>Doctor Details</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Qualifications">
                <input className={inputCls} placeholder="MBBS, MD (Internal Medicine)"
                  value={clinicExtras.qualifications} onChange={(e) => setClinicExtras((x) => ({ ...x, qualifications: e.target.value }))} />
              </Field>
              <Field label="Consultation Fee (₹)">
                <input className={inputCls} placeholder="300"
                  value={clinicExtras.consultation_fee} onChange={(e) => setClinicExtras((x) => ({ ...x, consultation_fee: e.target.value }))} />
              </Field>
            </div>
            <Field label="Languages Spoken">
              <input className={inputCls} placeholder="English, Kannada, Hindi"
                value={clinicExtras.languages} onChange={(e) => setClinicExtras((x) => ({ ...x, languages: e.target.value }))} />
            </Field>
          </div>
        )}

        {/* Restaurant extras */}
        {isRestaurant && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
            <SectionLabel>Restaurant Details</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cuisine Type">
                <input className={inputCls} placeholder="North Indian, Biryani, Multi-cuisine"
                  value={restExtras.cuisine} onChange={(e) => setRestExtras((x) => ({ ...x, cuisine: e.target.value }))} />
              </Field>
              <Field label="Food Type">
                <select className={inputCls} value={restExtras.veg_type}
                  onChange={(e) => setRestExtras((x) => ({ ...x, veg_type: e.target.value }))}>
                  <option value="veg">Pure Veg 🌿</option>
                  <option value="non-veg">Non-Veg 🍖</option>
                  <option value="both">Both Veg & Non-Veg</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* Services / Menu */}
        {!isRestaurant ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <SectionLabel>Services & Pricing</SectionLabel>
            <p className="text-xs text-gray-400 -mt-2 mb-3">Add your main services. Price and duration are optional.</p>
            {services.map((s, i) => (
              <div key={i} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 relative">
                <button onClick={() => removeService(i)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-100 text-red-400 text-xs font-bold hover:bg-red-200 transition-all flex items-center justify-center">
                  ✕
                </button>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="col-span-3 sm:col-span-1">
                    <input className={inputCls} placeholder="Service name *"
                      value={s.name} onChange={(e) => updateService(i, 'name', e.target.value)} />
                  </div>
                  <div>
                    <input className={inputCls} placeholder="₹ Price"
                      value={s.price} onChange={(e) => updateService(i, 'price', e.target.value)} />
                  </div>
                  <div>
                    <input className={inputCls} placeholder="Duration"
                      value={s.duration} onChange={(e) => updateService(i, 'duration', e.target.value)} />
                  </div>
                </div>
                <input className={inputCls} placeholder="Short description (optional)"
                  value={s.desc} onChange={(e) => updateService(i, 'desc', e.target.value)} />
              </div>
            ))}
            <button onClick={addService}
              className="w-full py-3 rounded-xl border-2 border-dashed border-purple-200 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-all">
              + Add Service
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <SectionLabel>Menu</SectionLabel>
            {menu.map((cat, ci) => (
              <div key={ci} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-3 mb-4">
                  <input className={inputCls} placeholder="Category (e.g. Starters, Main Course)"
                    value={cat.category} onChange={(e) => updateMenuCategory(ci, 'category', e.target.value)} />
                  <button onClick={() => removeMenuCategory(ci)}
                    className="w-9 h-9 rounded-full bg-red-100 text-red-400 font-bold text-sm hover:bg-red-200 transition-all flex-shrink-0 flex items-center justify-center">✕</button>
                </div>
                <div className="space-y-2.5 mb-3">
                  {cat.items.map((item, ii) => (
                    <div key={ii} className="flex gap-2 items-start">
                      <input className={inputCls} placeholder="Dish name *"
                        value={item.name} onChange={(e) => updateMenuItem(ci, ii, 'name', e.target.value)} />
                      <input className={inputCls + ' w-28 flex-shrink-0'} placeholder="₹ Price"
                        value={item.price} onChange={(e) => updateMenuItem(ci, ii, 'price', e.target.value)} />
                      <button onClick={() => removeMenuItem(ci, ii)}
                        className="w-9 h-9 rounded-full bg-red-50 text-red-400 text-xs font-bold flex-shrink-0 hover:bg-red-100 flex items-center justify-center">✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => addMenuItem(ci)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition-all">
                  + Add Item
                </button>
              </div>
            ))}
            <button onClick={addMenuCategory}
              className="w-full py-3 rounded-xl border-2 border-dashed border-purple-200 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-all">
              + Add Menu Category
            </button>
          </div>
        )}

        {/* Gallery */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <SectionLabel>Photo Gallery</SectionLabel>
          <p className="text-xs text-gray-400 mb-5">First photo = hero background. Up to 6 photos. Tap each slot to upload.</p>
          {/* Single hidden file input used for all slots */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && fileInputRef.current?._slot !== undefined) {
                uploadPhoto(file, fileInputRef.current._slot);
              }
              e.target.value = '';
            }}
          />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const url = galleryUrls[idx];
              return (
                <label key={idx} htmlFor={`gallery-slot-${idx}`}
                  className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-purple-300 transition-all group block">
                  <input
                    id={`gallery-slot-${idx}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadPhoto(file, idx);
                      e.target.value = '';
                    }}
                  />
                  {url ? (
                    <>
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removePhoto(idx); }}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-white text-red-500 font-bold text-sm transition-all flex items-center justify-center">✕</button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute top-1.5 left-1.5 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Hero</div>
                      )}
                    </>
                  ) : uploadingIdx === idx ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <span className="text-2xl mb-1">📸</span>
                      <span className="text-xs">{idx === 0 ? 'Hero photo' : `Photo ${idx + 1}`}</span>
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-2xl text-base font-extrabold text-white transition-all active:scale-95 disabled:opacity-50 shadow-xl"
          style={{ background: saved ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#9333ea,#7c3aed)', boxShadow: '0 8px 32px rgba(147,51,234,0.35)' }}>
          {saving ? '⏳ Saving...' : saved ? '✓ Website Saved & Live!' : '🚀 Save & Publish Website'}
        </button>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="font-bold text-green-700 mb-2">Website is live! 🎉</p>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer"
              className="text-green-600 underline text-sm font-semibold">{siteUrl}</a>
          </div>
        )}
      </div>
    </div>
  );
}
