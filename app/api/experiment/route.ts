import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse, type NextRequest } from "next/server";
import { experiment } from "@/content/site";
import { computeStats, VARIANTS, type Variant } from "@/lib/experiment";

export const dynamic = "force-dynamic";

const redis = Redis.fromEnv();

// Local dev and preview deploys share the database, so keep their counts separate.
const env = process.env.VERCEL_ENV === "production" ? "prod" : "dev";
const key = `exp:${env}:${experiment.id}`;

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "exp:ratelimit",
});

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit/i;

export async function GET() {
  const counts = (await redis.hgetall<Record<string, number>>(key)) ?? {};
  return NextResponse.json(computeStats(counts), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  let body: { variant?: string; event?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const variant = body.variant as Variant;
  const event = body.event;
  if (!VARIANTS.includes(variant) || (event !== "exposure" && event !== "click")) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  if (BOT.test(req.headers.get("user-agent") ?? "")) {
    return new NextResponse(null, { status: 204 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  await redis.hincrby(key, `${variant}:${event}`, 1);
  return new NextResponse(null, { status: 204 });
}
