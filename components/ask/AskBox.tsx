"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EXAMPLE_QUESTIONS, type Answer } from "@/lib/ask";

type Props = { cache: Record<string, Answer> };

// Shows "[FLEX]" in the answer text as a chip that jumps to that investigation.
function AnswerText({ text }: { text: string }) {
  return (
    <p className="text-[15px] leading-relaxed sm:text-base">
      {text.split(/(\[[^\]]+\])/).map((part, i) => {
        const id = part.match(/^\[(.+)\]$/)?.[1];
        return id ? (
          <a
            key={i}
            href={`#inv-${id}`}
            className="mx-0.5 inline-block rounded-md bg-accent px-1.5 py-px font-mono text-xs text-accent-foreground hover:bg-primary hover:text-primary-foreground"
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
    <section className="mt-10 max-w-3xl" aria-label="Ask the fire data">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex gap-2 rounded-full bg-card p-2 pl-3 shadow-lift ring-1 ring-border focus-within:ring-2 focus-within:ring-primary/60"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the fire data…"
          maxLength={300}
          aria-label="Your question"
          className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground"
        />
        <Button size="lg" disabled={loading} className="px-5 sm:px-7">
          {loading ? "Asking…" : "Ask"}
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_QUESTIONS.map((q) => (
          <Button key={q} variant="chip" size="chip" onClick={() => ask(q)}>
            {q}
          </Button>
        ))}
      </div>
      <div aria-live="polite" className="mt-5 empty:hidden">
        {loading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-primary" /> Reading NASA&apos;s fire data…
          </p>
        )}
        {error && <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">{error}</p>}
        {result && (
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
AI answer</p>
            <AnswerText text={result.answer} />
            <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
              Written only from the investigation data on this page. Click an id to jump to that investigation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
