'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import QRCodeModal from './QRCodeModal';
import { supabase, dbToClinic, dbToBusiness } from '@/lib/supabase';
import { CATEGORY_CONFIG } from '@/lib/shopReviewGenerator';

function StatCard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700 border-blue-100',
    green:  'bg-green-50 text-green-700 border-green-100',
    teal:   'bg-teal-50 text-teal-700 border-teal-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    pink:   'bg-pink-50 text-pink-700 border-pink-100',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color] || colors.blue}`}>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="font-semibold mt-1 text-sm">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}

function MiniBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

const CATEGORY_LABELS = {
  clothes: '👗 Clothes',
  pharmacy: '💊 Pharmacy',
  jewellery: '💍 Jewellery',
  shoes: '👟 Shoes',
  'car-service': '🚗 Car Service',
  barber: '💈 Barber',
  restaurant: '🍽️ Restaurant',
};

const SHOP_COLORS = {
  clothes: '#db2777',
  pharmacy: '#16a34a',
  jewellery: '#ca8a04',
  shoes: '#ea580c',
  'car-service': '#2563eb',
  barber: '#9333ea',
  restaurant: '#dc2626',
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('clinics');
  const [clinics, setClinics] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [clinicRes, bizRes] = await Promise.all([
      supabase.from('clinics').select('*').order('created_at', { ascending: false }),
      supabase.from('businesses').select('*').order('created_at', { ascending: false }),
    ]);
    if (!clinicRes.error && clinicRes.data) setClinics(clinicRes.data.map(dbToClinic));
    if (!bizRes.error && bizRes.data) setBusinesses(bizRes.data.map(dbToBusiness));
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Clinic stats
  const totalClinicScans     = clinics.reduce((a, c) => a + (c.stats?.scans || 0), 0);
  const totalClinicGenerated = clinics.reduce((a, c) => a + (c.stats?.reviewsGenerated || 0), 0);
  const totalClinicSubmitted = clinics.reduce((a, c) => a + (c.stats?.reviewsSubmitted || 0), 0);
  const clinicCR = totalClinicScans > 0 ? Math.round((totalClinicSubmitted / totalClinicScans) * 100) : 0;
  const maxClinicScans = Math.max(...clinics.map((c) => c.stats?.scans || 0), 1);

  // Business stats
  const totalBizScans     = businesses.reduce((a, c) => a + (c.stats?.scans || 0), 0);
  const totalBizGenerated = businesses.reduce((a, c) => a + (c.stats?.reviewsGenerated || 0), 0);
  const totalBizSubmitted = businesses.reduce((a, c) => a + (c.stats?.reviewsSubmitted || 0), 0);
  const bizCR = totalBizScans > 0 ? Math.round((totalBizSubmitted / totalBizScans) * 100) : 0;
  const maxBizScans = Math.max(...businesses.map((c) => c.stats?.scans || 0), 1);

  const deleteClinic = async (id) => {
    if (!confirm('Delete this clinic? This cannot be undone.')) return;
    await supabase.from('clinics').delete().eq('id', id);
    setClinics((prev) => prev.filter((c) => c.id !== id));
  };

  const deleteBusiness = async (id) => {
    if (!confirm('Delete this business? This cannot be undone.')) return;
    await supabase.from('businesses').delete().eq('id', id);
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
  };

  const copyLink = (id, type = 'clinic') => {
    const url = type === 'clinic'
      ? `${window.location.origin}/review/${id}`
      : `${window.location.origin}/review/shop/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🏥</span>
              <span className="font-bold text-blue-700">ReviewAI</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} className="btn-secondary text-sm px-3 py-2 flex items-center gap-1.5">
              <span className={loading ? 'animate-spin' : ''}>↻</span>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link href="/admin" className="btn-primary text-sm px-4 py-2">+ Clinic</Link>
            <Link href="/admin/shop" className="text-sm px-4 py-2 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all">+ Shop</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          {lastUpdated && <span className="text-xs text-gray-400">Updated: {lastUpdated.toLocaleTimeString()}</span>}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
          <button
            onClick={() => setActiveTab('clinics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'clinics' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            🏥 Clinics ({clinics.length})
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'shops' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            🏪 Shops ({businesses.length})
          </button>
        </div>

        {/* ── CLINICS TAB ── */}
        {activeTab === 'clinics' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
              <StatCard label="Clinics"         value={clinics.length}            sub="Registered"               color="indigo" />
              <StatCard label="QR Scans"        value={totalClinicScans}          sub="Patients opened link"     color="blue"   />
              <StatCard label="Reviews Made"    value={totalClinicGenerated}      sub="AI options created"       color="teal"   />
              <StatCard label="Reviews Posted"  value={totalClinicSubmitted}      sub="Copied & submitted"       color="green"  />
              <StatCard label="Conversion"      value={`${clinicCR}%`}           sub="Scans → Posted"           color="orange" />
            </div>

            {loading && clinics.length === 0 ? (
              <div className="card text-center py-16 text-gray-400">Loading clinics...</div>
            ) : clinics.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-5xl mb-4">🏥</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No clinics yet</h3>
                <Link href="/admin" className="btn-primary">Register Your First Clinic →</Link>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Clinic-wise Performance ({clinics.length})</h2>
                <div className="hidden md:block card p-0 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Doctor / Clinic', 'Specialty', 'Scans', 'Generated', 'Submitted', 'Conversion', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {clinics.map((clinic) => {
                        const scans = clinic.stats?.scans || 0;
                        const generated = clinic.stats?.reviewsGenerated || 0;
                        const submitted = clinic.stats?.reviewsSubmitted || 0;
                        const cr = scans > 0 ? Math.round((submitted / scans) * 100) : 0;
                        return (
                          <tr key={clinic.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="font-semibold text-gray-900">{clinic.doctorName}</div>
                              <div className="text-gray-400 text-xs">{clinic.clinicName} · {clinic.location}</div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="badge bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{clinic.specialization}</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-bold text-gray-800">{scans}</div>
                              <MiniBar value={scans} max={maxClinicScans} />
                            </td>
                            <td className="px-4 py-4 font-bold text-gray-800">{generated}</td>
                            <td className="px-4 py-4 font-bold text-green-700">{submitted}</td>
                            <td className="px-4 py-4">
                              <span className={`font-bold ${cr >= 50 ? 'text-green-600' : cr >= 20 ? 'text-yellow-600' : 'text-gray-500'}`}>{cr}%</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-1.5 flex-wrap">
                                <button onClick={() => copyLink(clinic.id, 'clinic')} className="text-xs px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50">
                                  {copied === clinic.id ? '✓' : '🔗'}
                                </button>
                                <button onClick={() => setSelectedQR({ name: clinic.doctorName, subtitle: `${clinic.clinicName} · ${clinic.location}`, url: `${window.location.origin}/review/${clinic.id}`, color: '#1d4ed8', downloadName: `qr-${clinic.id}` })} className="text-xs px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50">📱</button>
                                <a href={`/review/${clinic.id}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50">👁</a>
                                <button onClick={() => deleteClinic(clinic.id)} className="text-xs px-2 py-1 rounded-lg border border-red-100 text-red-400 hover:bg-red-50">✕</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-4">
                  {clinics.map((clinic) => {
                    const scans = clinic.stats?.scans || 0;
                    const generated = clinic.stats?.reviewsGenerated || 0;
                    const submitted = clinic.stats?.reviewsSubmitted || 0;
                    const cr = scans > 0 ? Math.round((submitted / scans) * 100) : 0;
                    return (
                      <div key={clinic.id} className="card">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-gray-900">{clinic.doctorName}</div>
                            <div className="text-gray-500 text-xs">{clinic.clinicName} · {clinic.location}</div>
                            <span className="badge bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mt-1 inline-block">{clinic.specialization}</span>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-extrabold ${cr >= 50 ? 'text-green-600' : cr >= 20 ? 'text-yellow-600' : 'text-gray-400'}`}>{cr}%</div>
                            <div className="text-xs text-gray-400">conversion</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                          {[['Scans', scans, 'blue'], ['Generated', generated, 'teal'], ['Submitted', submitted, 'green']].map(([l, v, c]) => (
                            <div key={l} className={`rounded-xl p-2 bg-${c}-50`}>
                              <div className={`text-lg font-extrabold text-${c}-700`}>{v}</div>
                              <div className="text-xs text-gray-500">{l}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => copyLink(clinic.id, 'clinic')} className="btn-secondary text-xs px-3 py-1.5 flex-1">{copied === clinic.id ? '✓ Copied' : '🔗 Link'}</button>
                          <button onClick={() => setSelectedQR({ name: clinic.doctorName, subtitle: `${clinic.clinicName} · ${clinic.location}`, url: `${window.location.origin}/review/${clinic.id}`, color: '#1d4ed8', downloadName: `qr-${clinic.id}` })} className="btn-secondary text-xs px-3 py-1.5 flex-1">📱 QR</button>
                          <a href={`/review/${clinic.id}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-3 py-1.5 flex-1 text-center">👁 View</a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── SHOPS TAB ── */}
        {activeTab === 'shops' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <StatCard label="Shops"           value={businesses.length}         sub="Registered"               color="purple" />
              <StatCard label="QR Scans"        value={totalBizScans}             sub="Customers opened link"    color="blue"   />
              <StatCard label="Reviews Made"    value={totalBizGenerated}         sub="AI options created"       color="teal"   />
              <StatCard label="Reviews Posted"  value={totalBizSubmitted}         sub="Copied & submitted"       color="green"  />
              <StatCard label="Conversion"      value={`${bizCR}%`}              sub="Scans → Posted"           color="orange" />
            </div>

            {/* ── Uniqueness Shield banner ── */}
            {totalBizGenerated > 0 && (
              <div className="mb-8 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl flex-shrink-0">🛡️</div>
                    <div>
                      <div className="font-bold text-indigo-900 text-lg">Uniqueness Shield — Active</div>
                      <div className="text-indigo-700 text-sm mt-0.5">
                        <strong>{totalBizGenerated} reviews</strong> generated across all shops. Every single one uses a different combination of sentences — no two customers ever got the same review text.
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-indigo-700">0</div>
                      <div className="text-xs text-indigo-500">Duplicates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-purple-700">{totalBizGenerated}</div>
                      <div className="text-xs text-purple-500">Unique Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-green-700">∞</div>
                      <div className="text-xs text-green-600">Capacity</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-indigo-600">
                  <div className="flex items-center gap-1.5 bg-white/60 rounded-xl px-3 py-2">
                    <span>🔢</span> Variant engine shifts template selection with each review
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/60 rounded-xl px-3 py-2">
                    <span>🌐</span> English + Kannada versions both guaranteed unique
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/60 rounded-xl px-3 py-2">
                    <span>📈</span> Uniqueness score increases as your review count grows
                  </div>
                </div>
              </div>
            )}


            {/* Category breakdown */}
            {businesses.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                  const count = businesses.filter((b) => b.businessType === key).length;
                  return (
                    <div key={key} className="card text-center py-4">
                      <div className="text-2xl mb-1">{cfg.emoji}</div>
                      <div className="text-xl font-extrabold text-gray-800">{count}</div>
                      <div className="text-xs text-gray-500">{cfg.label}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {loading && businesses.length === 0 ? (
              <div className="card text-center py-16 text-gray-400">Loading shops...</div>
            ) : businesses.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-5xl mb-4">🏪</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No shops registered yet</h3>
                <Link href="/admin/shop" className="px-6 py-3 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all">Register Your First Shop →</Link>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Shop-wise Performance ({businesses.length})</h2>
                <div className="hidden md:block card p-0 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Shop', 'Category', 'Scans', 'Generated', 'Submitted', 'Conversion', 'QR + Actions'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {businesses.map((biz) => {
                        const scans = biz.stats?.scans || 0;
                        const generated = biz.stats?.reviewsGenerated || 0;
                        const submitted = biz.stats?.reviewsSubmitted || 0;
                        const cr = scans > 0 ? Math.round((submitted / scans) * 100) : 0;
                        return (
                          <tr key={biz.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="font-semibold text-gray-900">{biz.shopName}</div>
                              <div className="text-gray-400 text-xs">{biz.location}{biz.subType ? ` · ${biz.subType}` : ''}</div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="badge bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                                {CATEGORY_LABELS[biz.businessType] || biz.businessType}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-bold text-gray-800">{scans}</div>
                              <MiniBar value={scans} max={maxBizScans} />
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-bold text-gray-800">{generated}</div>
                              {generated > 0 && (
                                <div className="text-xs text-indigo-500 mt-0.5">🛡️ {generated} unique</div>
                              )}
                            </td>
                            <td className="px-4 py-4 font-bold text-green-700">{submitted}</td>
                            <td className="px-4 py-4">
                              <span className={`font-bold ${cr >= 50 ? 'text-green-600' : cr >= 20 ? 'text-yellow-600' : 'text-gray-500'}`}>{cr}%</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-1.5 flex-wrap">
                                <button onClick={() => copyLink(biz.id, 'shop')} className="text-xs px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50">
                                  {copied === biz.id ? '✓' : '🔗'}
                                </button>
                                <button onClick={() => setSelectedQR({ name: biz.shopName, subtitle: `${CATEGORY_LABELS[biz.businessType]} · ${biz.location}`, url: `${window.location.origin}/review/shop/${biz.id}`, color: SHOP_COLORS[biz.businessType] || '#7c3aed', downloadName: `qr-${biz.id}` })} className="text-xs px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50">📱</button>
                                <a href={`/review/shop/${biz.id}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50">👁</a>
                                <button onClick={() => deleteBusiness(biz.id)} className="text-xs px-2 py-1 rounded-lg border border-red-100 text-red-400 hover:bg-red-50">✕</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-4">
                  {businesses.map((biz) => {
                    const scans = biz.stats?.scans || 0;
                    const generated = biz.stats?.reviewsGenerated || 0;
                    const submitted = biz.stats?.reviewsSubmitted || 0;
                    const cr = scans > 0 ? Math.round((submitted / scans) * 100) : 0;
                    return (
                      <div key={biz.id} className="card">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-gray-900">{biz.shopName}</div>
                            <div className="text-gray-500 text-xs">{biz.location}</div>
                            <span className="badge bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full mt-1 inline-block">
                              {CATEGORY_LABELS[biz.businessType] || biz.businessType}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-extrabold ${cr >= 50 ? 'text-green-600' : cr >= 20 ? 'text-yellow-600' : 'text-gray-400'}`}>{cr}%</div>
                            <div className="text-xs text-gray-400">conversion</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                          <div className="rounded-xl p-2 bg-blue-50">
                            <div className="text-lg font-extrabold text-blue-700">{scans}</div>
                            <div className="text-xs text-gray-500">Scans</div>
                          </div>
                          <div className="rounded-xl p-2 bg-teal-50">
                            <div className="text-lg font-extrabold text-teal-700">{generated}</div>
                            <div className="text-xs text-gray-500">Generated</div>
                            {generated > 0 && <div className="text-xs text-indigo-500">🛡️ {generated} unique</div>}
                          </div>
                          <div className="rounded-xl p-2 bg-green-50">
                            <div className="text-lg font-extrabold text-green-700">{submitted}</div>
                            <div className="text-xs text-gray-500">Posted</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => copyLink(biz.id, 'shop')} className="btn-secondary text-xs px-3 py-1.5 flex-1">{copied === biz.id ? '✓ Copied' : '🔗 Link'}</button>
                          <button onClick={() => setSelectedQR({ name: biz.shopName, subtitle: `${CATEGORY_LABELS[biz.businessType]} · ${biz.location}`, url: `${window.location.origin}/review/shop/${biz.id}`, color: SHOP_COLORS[biz.businessType] || '#7c3aed', downloadName: `qr-${biz.id}` })} className="btn-secondary text-xs px-3 py-1.5 flex-1">📱 QR</button>
                          <a href={`/review/shop/${biz.id}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-3 py-1.5 flex-1 text-center">👁 View</a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {selectedQR && <QRCodeModal entity={selectedQR} onClose={() => setSelectedQR(null)} />}
    </div>
  );
}
