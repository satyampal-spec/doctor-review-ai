import { NextResponse } from 'next/server';

/**
 * This route is no longer used.
 * Review generation happens entirely client-side via lib/reviewGenerator.js
 * — zero API calls, zero cost.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Reviews are generated client-side. This endpoint is not in use.' },
    { status: 410 }
  );
}
