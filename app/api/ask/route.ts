import { askModel, MAX_QUESTION } from "@/lib/ask";
import { investigations } from "@/lib/data";
import cache from "@/data/demo-answers.json";

// Two providers, each with one retry, can take a while; Vercel allows up to 60 s.
export const maxDuration = 60;

const LIMIT = 6;
const WINDOW_MS = 60_000;
// Per instance only: Vercel can run several, so this caps a burst from one IP, not a determined attacker.
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 2000) return Response.json({ error: "That request is too long." }, { status: 413 });
  const q = parseJson(raw)?.question;
  const question = typeof q === "string" ? q.replace(/[\u0000-\u001f\u007f]/g, " ").trim() : "";
  if (!question) return Response.json({ error: "Please type a question." }, { status: 400 });
  if (question.length > MAX_QUESTION)
    return Response.json({ error: `Please keep the question under ${MAX_QUESTION} characters.` }, { status: 400 });

  if (Object.hasOwn(cache, question)) return Response.json((cache as Record<string, unknown>)[question]);

  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (rateLimited(ip))
    return Response.json({ error: "Too many questions at once. Wait a minute, then ask again." }, { status: 429 });

  try {
    const answer = await askModel(question, investigations, {
      groq: process.env.GROQ_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
    });
    return Response.json(answer);
  } catch (e) {
    console.error("ask failed:", e);
    return Response.json(
      { error: "The AI is busy, or its answer did not match the data. Try an example question, or rephrase and try again in a minute." },
      { status: 503 },
    );
  }
}
