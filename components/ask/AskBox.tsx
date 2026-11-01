"use client";

import { useState } from "react";
import { EXAMPLE_QUESTIONS, type Answer } from "@/lib/ask";

type Props = { cache: Record<string, Answer> };

// Shows "[FLEX]" in the answer text as a chip that jumps to that investigation.
function AnswerText({ text }: { text: string }) {
  return (
    <p className="leading-relaxed">
      {text.split(/(\[[^\]]+\])/).map((part, i) => {
        const id = part.match(/^\[(.+)\]$/)?.[1];
        return id ? (
          <a
            key={i}
            href={`#inv-${id}`}
            className="mx-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-xs hover:bg-primary hover:text-primary-foreground"
          >
            {id}
          </a>
        ) : (
          part
        );
      })}
    </p>
  );
}

export function AskBox({ cache }: Props) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<Answer | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(q: string) {
    q = q.trim();
    if (!q || loading) return;
    setQuestion(q);
    setError("");
    setResult(null);
    if (cache[q]) return setResult(cache[q]);
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the fire data…"
          maxLength={300}
          aria-label="Your question"
          className="min-w-0 flex-1 rounded-lg border bg-background px-4 py-3"
        />
        <button
          disabled={loading}
          className="rounded-lg bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Asking…" : "Ask"}
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            className="rounded-full border px-3 py-1.5 text-left text-sm hover:bg-muted"
          >
            {q}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="mt-5">
        {loading && <p className="text-muted-foreground">Reading NASA&apos;s fire data…</p>}
        {error && <p className="rounded-lg border border-destructive/40 p-4 text-destructive">{error}</p>}
        {result && (
          <div className="rounded-lg border p-4">
            <AnswerText text={result.answer} />
            <p className="mt-3 text-xs text-muted-foreground">
              AI answer written only from the investigation data on this page. Click an id to jump to that investigation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
