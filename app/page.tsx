import { AskBox } from "@/components/ask/AskBox";
import { RankView } from "@/components/rank/RankView";
import cache from "@/data/demo-answers.json";
import type { Answer } from "@/lib/ask";
import { investigations } from "@/lib/data";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Flame in Freefall</h1>
      <p className="mt-2 text-muted-foreground">
        Which NASA microgravity fire experiments matter for a crew habitat, and why.
      </p>
      <AskBox cache={cache as Record<string, Answer>} />
      <RankView investigations={investigations} />
    </main>
  );
}
