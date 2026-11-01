import { askModel } from "@/lib/ask";
import { investigations } from "@/lib/data";
import cache from "@/data/demo-answers.json";

export const maxDuration = 15;

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
      { error: "The AI is busy or unavailable right now. Try an example question, or try again in a minute." },
      { status: 503 },
    );
  }
}
