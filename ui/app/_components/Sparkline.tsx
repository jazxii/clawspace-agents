import type { DomainKey } from "@/lib/route-meta";

export function Sparkline({
  data,
  tint = "projects",
}: {
  data: number[];
  tint?: DomainKey;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const W = 100;
  const H = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / (max - min || 1)) * (H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const fill = `var(--accent-${tint})`;
  const gradId = `sg-${tint}`;
  return (
    <svg
      className="cs-spark"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity=".3" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#${gradId})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={fill}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
