import { EMPTY } from "@/lib/fields";

export function Sources({ urls }: { urls: string[] }) {
  if (!urls.length) return <span className="italic text-muted-foreground">{EMPTY}</span>;
  return (
    <ul className="space-y-1">
      {urls.map((u) => (
        <li key={u}>
          <a href={u} target="_blank" rel="noreferrer" className="break-all text-accent-foreground underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
            {u.replace(/^https?:\/\//, "")} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}
