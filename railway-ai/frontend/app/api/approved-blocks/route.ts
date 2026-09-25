import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { supabaseClient, isSupabaseConfigured, getSupabaseUrl } from '../../../lib/supabase';
import type { RequestStatus } from '../../../types/request';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Fetch real blocks directly from Supabase table `existing_blocks`
    const ebResult = await supabaseClient.getExistingBlocks();

    let approved = ebResult.inactive;
    let completed = ebResult.completed;
    let all = ebResult.all;

    // 2. If existing_blocks is empty, fallback to local database
    if (all.length === 0) {
      const localAll = await db.getRequests(true);
      approved = localAll.filter(r => r.status === 'APPROVED');
      completed = localAll.filter(r => r.status === 'COMPLETED');
      all = localAll;
    }

    const supabaseHealth = await supabaseClient.checkHealth();

    return NextResponse.json({
      success: true,
      source: 'existing_blocks',
      approved,
      completed,
      all,
      allCount: all.length,
      supabase: {
        configured: isSupabaseConfigured(),
        connected: supabaseHealth.connected,
        url: getSupabaseUrl(),
        message: 'Connected to Supabase table `existing_blocks`'
      }
    });
  } catch (err: any) {
    console.error('API GET /api/approved-blocks error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve blocks from existing_blocks', details: err?.message || err },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, remarks, officer, note, completedAt } = body;

    if (!id) {
      return NextResponse.json({ error: 'Block ID is required' }, { status: 400 });
    }

    const targetStatus: RequestStatus = status || 'COMPLETED';
    const isCompleted = targetStatus === 'COMPLETED';

    // In existing_blocks check constraint: 'Completed', 'Active', 'Scheduled', 'Cancelled'
    const ebStatus = isCompleted ? 'Completed' : 'Active';

    // 1. Persist directly into the Supabase table `existing_blocks` (also syncs corridor availability)
    const ebUpdated = await supabaseClient.updateExistingBlockStatus(id, ebStatus, remarks);

    // 2. Also update local cache & fallback DB
    const updated = await db.updateRequestStatus(id, targetStatus, {
      officer,
      remarks,
      note,
      completedAt
    });

    // 3. Explicitly synchronize corridor availability in Supabase
    try {
      const blockRec = updated || (await db.getRequestById(id));
      if (blockRec && blockRec.corridor) {
        const isRestricted = /speed\s*restriction|TSR|caution\s*order|45\s*km\/h|30\s*km\/h/i.test(remarks || note || '');
        const corridorAvail = isCompleted ? (isRestricted ? 'Restricted Speed' : 'Available') : 'Blocked';
        await supabaseClient.updateCorridorAvailability(
          blockRec.corridor,
          corridorAvail,
          blockRec.blockSection,
          blockRec.line
        );
      }
    } catch (e) {
      console.warn('Explicit corridor availability sync warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Block ${id} status successfully updated to ${ebStatus} in Supabase table existing_blocks and corridor marked as ${isCompleted ? 'Available' : 'Blocked'}`,
      record: updated || { id, status: targetStatus, remarks },
      ebUpdated,
      supabaseStored: ebUpdated
    });
  } catch (err: any) {
    console.error('API PATCH /api/approved-blocks error:', err);
    return NextResponse.json(
      { error: 'Failed to update block status in Supabase table existing_blocks', details: err?.message || err },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.id) {
      const ebUpdated = await supabaseClient.updateExistingBlockStatus(body.id, 'Active', body.remarks);
      const updated = await db.updateRequestStatus(body.id, 'APPROVED', {
        officer: body.officer || 'Sr. DOM / Operating Control (COA)',
        remarks: body.remarks || 'Sanctioned via Control Office Application (COA)',
        note: 'Approved for execution'
      });
      return NextResponse.json({
        success: true,
        message: `Block ${body.id} marked as Active in Supabase existing_blocks`,
        record: updated,
        ebUpdated
      });
    }

    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  } catch (err: any) {
    console.error('API POST /api/approved-blocks error:', err);
    return NextResponse.json({ error: 'Operation failed', details: err?.message || err }, { status: 500 });
  }
}
