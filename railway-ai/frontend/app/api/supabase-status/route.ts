import { NextResponse } from 'next/server';
import { getSupabaseUrl, getSupabaseKey, supabaseClient } from '../../../lib/supabase';
import { db } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const url = getSupabaseUrl();
  const startTime = Date.now();
  const requests = await db.getRequests();
  const durationMs = Date.now() - startTime;

  return NextResponse.json({
    supabaseUrl: url,
    connected: true,
    latencyMs: durationMs,
    totalRequestsCount: requests.length,
    requestsSummary: requests.map(r => ({
      id: r.id,
      department: r.department,
      status: r.status,
      corridor: r.corridor,
      requestedBy: r.requestedBy,
      createdAt: r.createdAt
    }))
  });
}
