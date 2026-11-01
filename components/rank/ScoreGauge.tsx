
// Half-circle gauge for the 0 to 100 score. The needle turns with a CSS transform (off with reduced motion).
export function ScoreGauge({ score, onSun }: { score: number; onSun?: boolean }) {
  return (
    <div className="flex w-20 shrink-0 flex-col items-center" role="img" aria-label={`Score ${score} of 100`}>
      <svg viewBox="0 0 80 46" className="w-full" aria-hidden>
        <path d="M10 40 A30 30 0 0 1 70 40" fill="none" strokeWidth={8} strokeLinecap="round" className={onSun ? "stroke-card" : "stroke-muted"} />
        {score > 0 && (
          <path
            d="M10 40 A30 30 0 0 1 70 40"
            fill="none"
            strokeWidth={8}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${score} 100`}
            className="stroke-charcoal"
          />
        )}
        <g
          className="transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${score * 1.8}deg)`, transformOrigin: "40px 40px", transformBox: "view-box" }}
        >
          <line x1={40} y1={40} x2={20} y2={40} strokeWidth={2.5} strokeLinecap="round" className="stroke-primary" />
        </g>
        <circle cx={40} cy={40} r={3.5} className="fill-charcoal" />
      </svg>
      <span className="mt-1 text-2xl leading-none font-bold tracking-tight tabular-nums">{score}</span>
    </div>
  );
}
