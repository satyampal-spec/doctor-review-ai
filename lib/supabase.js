import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Convert DB row (snake_case) → app object (camelCase)
export function dbToClinic(row) {
  return {
    id: row.id,
    doctorName: row.doctor_name,
    clinicName: row.clinic_name,
    specialization: row.specialization,
    experience: row.experience,
    location: row.location,
    languages: row.languages || [],
    websiteUrl: row.website_url || '',
    practoUrl: row.practo_url || '',
    googleProfileUrl: row.google_profile_url || '',
    createdAt: row.created_at,
    stats: {
      scans: row.scans || 0,
      reviewsGenerated: row.reviews_generated || 0,
      reviewsSubmitted: row.reviews_submitted || 0,
    },
  };
}

// Convert app object → DB row
export function clinicToDb(clinic) {
  return {
    id: clinic.id,
    doctor_name: clinic.doctorName,
    clinic_name: clinic.clinicName,
    specialization: clinic.specialization,
    experience: clinic.experience,
    location: clinic.location,
    languages: clinic.languages,
    website_url: clinic.websiteUrl || null,
    practo_url: clinic.practoUrl || null,
    google_profile_url: clinic.googleProfileUrl || null,
  };
}

// ── Businesses (shops) ────────────────────────────────────────

export function dbToBusiness(row) {
  return {
    id: row.id,
    shopName: row.shop_name,
    ownerName: row.owner_name || '',
    businessType: row.business_type,
    subType: row.sub_type || '',
    location: row.location,
    googleProfileUrl: row.google_profile_url || '',
    websiteUrl: row.website_url || '',
    createdAt: row.created_at,
    stats: {
      scans: row.scans || 0,
      reviewsGenerated: row.reviews_generated || 0,
      reviewsSubmitted: row.reviews_submitted || 0,
    },
  };
}

export function businessToDb(shop) {
  return {
    id: shop.id,
    shop_name: shop.shopName,
    owner_name: shop.ownerName || null,
    business_type: shop.businessType,
    sub_type: shop.subType || null,
    location: shop.location,
    google_profile_url: shop.googleProfileUrl || null,
    website_url: shop.websiteUrl || null,
  };
}
