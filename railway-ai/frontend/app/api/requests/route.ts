import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const requests = await db.getRequests();
    return NextResponse.json(requests);
  } catch (err) {
    console.error('API GET /api/requests error:', err);
    return NextResponse.json({ error: 'Failed to retrieve requests from database' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.id) {
      return NextResponse.json({ error: 'Invalid request: ID is required' }, { status: 400 });
    }

    const saved = await db.saveRequest(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error('API POST /api/requests error:', err);
    return NextResponse.json({ error: 'Failed to save request to database' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.clearAll();
    return NextResponse.json({ success: true, message: 'All requests cleared from database' });
  } catch (err) {
    console.error('API DELETE /api/requests error:', err);
    return NextResponse.json({ error: 'Failed to clear database' }, { status: 500 });
  }
}
