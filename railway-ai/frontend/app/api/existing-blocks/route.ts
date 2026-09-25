import { NextResponse } from 'next/server';
import { supabaseClient, isSupabaseConfigured, getSupabaseUrl } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * REST endpoint for Supabase table `existing_blocks`
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status')?.toLowerCase();

    const ebResult = await supabaseClient.getExistingBlocks();

    let items = ebResult.all;
    if (statusFilter === 'completed') {
      items = ebResult.completed;
    } else if (statusFilter === 'inactive' || statusFilter === 'approved' || statusFilter === 'active') {
      items = ebResult.inactive;
    }

    return NextResponse.json({
      success: true,
      count: items.length,
      data: items,
      inactive: ebResult.inactive,
      completed: ebResult.completed,
      supabase: {
        configured: isSupabaseConfigured(),
        url: getSupabaseUrl()
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to query existing_blocks', details: err?.message || err },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, remarks } = body;

    if (!id) {
      return NextResponse.json({ error: 'Block ID is required' }, { status: 400 });
    }

    const ebStatus = (status || '').toUpperCase() === 'COMPLETED' ? 'Completed' : 'Active';
    const updated = await supabaseClient.updateExistingBlockStatus(id, ebStatus, remarks);

    return NextResponse.json({
      success: updated,
      message: `Block ${id} status updated to ${ebStatus} in existing_blocks`,
      id,
      status: ebStatus
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to update existing_blocks', details: err?.message || err },
      { status: 500 }
    );
  }
}
