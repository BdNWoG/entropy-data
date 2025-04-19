// app/api/duneCsv/route.ts            (App Router version)
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.DUNE_API_KEY!;       // make sure it’s in .env.local
const BASE     = "https://api.dune.com/api/v1";

/** helper – poll until the CSV is ready (or times out) */
async function fetchDuneCsv(queryId: string) {
  // 1️⃣ kick off or reuse latest execution
  await fetch(`${BASE}/query/${queryId}/execute`, {
    method: "POST",
    headers: { "X-Dune-Api-Key": API_KEY },
  });

  // 2️⃣ poll the CSV endpoint
  const csvUrl = `${BASE}/query/${queryId}/results/csv`;
  for (let i = 0; i < 15; i++) {
    const r = await fetch(csvUrl, { headers: { "X-Dune-Api-Key": API_KEY } });
    if (r.ok) return await r.text();            // got the CSV 🎉
    if (r.status !== 202) throw new Error(`Dune ${r.status}`); // real error
    await new Promise((s) => setTimeout(s, 2000));             // wait & retry
  }
  throw new Error("Timed out waiting for Dune");
}

/* ───────── POST /api/duneCsv ───────── */
export async function POST(req: NextRequest) {
  const { queryId } = await req.json() as { queryId?: string };
  if (!queryId) {
    return NextResponse.json({ error: "Missing queryId" }, { status: 400 });
  }

  try {
    const csv = await fetchDuneCsv(queryId);
    return new NextResponse(csv, {
      status: 200,
      headers: { "Content-Type": "text/csv" },
    });
  } catch (err: unknown) {
    const message =
     err instanceof Error ? err.message : "Failed to fetch from Dune";
   console.error(err);
   return NextResponse.json({ error: message }, { status: 500 });
  }
}
