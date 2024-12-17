import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const pythonServiceURL = "https://kaleido-f2rf.onrender.com/api/kaleidoExport";

  const response = await fetch(pythonServiceURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorText = 'Failed to export plot';
    try {
      const errorData = await response.json();
      errorText = errorData.message || errorText;
    } catch {
      try {
        errorText = await response.text();
      } catch {
        // If all fails, keep default
      }
    }
    return new Response(errorText, { status: response.status });
  }

  const blob = await response.blob();
  return new Response(blob, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'image/png',
    },
    status: 200,
  });
}
