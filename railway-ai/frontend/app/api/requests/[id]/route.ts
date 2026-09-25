import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import type { RequestStatus } from '../../../../types/request';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await db.getRequestById(params.id);
    if (!item) {
      return NextResponse.json({ error: `Request ${params.id} not found` }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err) {
    console.error(`API GET /api/requests/${params.id} error:`, err);
    return NextResponse.json({ error: 'Failed to retrieve request' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, remarks, officer, note, completedAt } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updated = await db.updateRequestStatus(params.id, status as RequestStatus, {
      officer,
      remarks,
      note,
      completedAt
    });

    if (!updated) {
      return NextResponse.json({ error: `Request ${params.id} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Block request ${params.id} status updated to ${status} and saved in Supabase`,
      record: updated
    });
  } catch (err) {
    console.error(`API PATCH /api/requests/${params.id} error:`, err);
    return NextResponse.json({ error: 'Failed to update request status' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    if (!body || !body.id) {
      return NextResponse.json({ error: 'Valid request body with ID is required' }, { status: 400 });
    }

    const saved = await db.saveRequest(body);
    return NextResponse.json({
      success: true,
      record: saved
    });
  } catch (err) {
    console.error(`API PUT /api/requests/${params.id} error:`, err);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
