// This server-side PDF generation route is no longer in use.
// It has been replaced by a client-side printable page at /app/pdf/page.tsx
// This file can be safely deleted.

import { NextResponse } from 'next/server';

export async function POST() {
  return new NextResponse(JSON.stringify({ error: 'This endpoint is obsolete.' }), {
    status: 410, // Gone
    headers: { 'Content-Type': 'application/json' },
  });
}
