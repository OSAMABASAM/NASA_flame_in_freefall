import { investigations } from "@/lib/data";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Flame in Freefall</h1>
      <p className="mt-2 text-muted-foreground">
        Which NASA microgravity fire experiments matter for a crew habitat, and why.
      </p>
      <h2 className="mt-10 text-lg font-medium">Investigations ({investigations.length})</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        * From the challenge text only, not yet checked against NASA sources.
      </p>
      <ul className="mt-3 divide-y rounded-lg border">
        {investigations.map((inv) => (
          <li key={inv.id} className="px-4 py-3">
            <span className="font-mono text-sm text-muted-foreground">{inv.id}</span> {inv.name}
            {inv.data_status === "challenge_text" && <span className="text-muted-foreground"> *</span>}
          </li>
        ))}
      </ul>
    </main>
  );
}
