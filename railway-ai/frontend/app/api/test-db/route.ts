import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { supabaseClient } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const requests = await db.getRequests();
  const supabaseHealth = await supabaseClient.checkHealth();

  return NextResponse.json({
    supabase: supabaseHealth,
    totalCount: requests.length,
    requestsSummary: requests.map(r => ({
      id: r.id,
      department: r.department,
      status: r.status,
      corridor: r.corridor,
      section: r.blockSection
    }))
  });
}
