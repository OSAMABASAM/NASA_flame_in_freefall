export function Sources({ urls }: { urls: string[] }) {
  if (!urls.length) return <span className="text-muted-foreground italic">Not in our data yet</span>;
  return (
    <ul className="space-y-1">
      {urls.map((u) => (
        <li key={u}>
          <a href={u} target="_blank" rel="noreferrer" className="break-all underline underline-offset-2">
            {u.replace(/^https?:\/\//, "")}
          </a>
        </li>
      ))}
    </ul>
  );
}
