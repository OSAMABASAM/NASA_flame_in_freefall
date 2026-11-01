"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EXAMPLE_QUESTIONS, MAX_QUESTION, type Answer } from "@/lib/ask";

type Props = { cache: Record<string, Answer> };

// "[FLEX]" in the answer becomes a chip that jumps to that investigation's card.
function AnswerText({ text }: { text: string }) {
  return (
    <p className="text-[15px] leading-relaxed sm:text-base">
      {text.split(/(\[[^\]]+\])/).map((part, i) => {
        const id = part.match(/^\[(.+)\]$/)?.[1];
        return id ? (
          <a
            key={i}
            href={`#inv-${id}`}
            className="mx-0.5 inline-block rounded-full bg-accent px-2 py-px font-mono text-xs font-semibold text-accent-foreground hover:bg-primary hover:text-primary-foreground"
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
    if (Object.hasOwn(cache, q)) return setResult(cache[q]);
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
    <section className="mt-8 max-w-3xl" aria-label="Ask the fire data">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex gap-2 rounded-full bg-card p-2 pl-3 ring-1 ring-transparent focus-within:ring-2 focus-within:ring-ring"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the fire data…"
          maxLength={MAX_QUESTION}
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
          <p className="flex items-center gap-2 rounded-2xl bg-card p-5 text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-primary" /> Reading NASA&apos;s fire data…
          </p>
        )}
        {error && <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">{error}</p>}
        {result && (
          <div className="glow rounded-2xl bg-card p-6">
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="card-label text-muted-foreground">AI answer</p>
              {result.cited.length > 0 && <span className="pill bg-sun text-sun-foreground">{result.cited.length} cited</span>}
            </div>
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
