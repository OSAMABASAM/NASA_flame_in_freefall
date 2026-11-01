import { askModel } from "@/lib/ask";
import { investigations } from "@/lib/data";
import cache from "@/data/demo-answers.json";

// Two providers, each with one retry, can take a while; Vercel allows up to 60 s.
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const question = typeof body.question === "string" ? body.question.trim().slice(0, 300) : "";
  if (!question) return Response.json({ error: "Please type a question." }, { status: 400 });

  const cached = (cache as Record<string, unknown>)[question];
  if (cached) return Response.json(cached);

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
