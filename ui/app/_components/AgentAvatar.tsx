"use client";

const DOMAIN_BG: Record<string, string> = {
  content: "var(--accent-content)",
  projects: "var(--accent-projects)",
  research: "var(--accent-research)",
  meta: "var(--accent-meta)",
};

const TIER_COLOR: Record<number, string> = {
  4: "#ffd60a",
  3: "#bf5af2",
  2: "#0a84ff",
  1: "#8e8e93",
};

interface Props {
  name: string;
  domain: string;
  tier?: number;
  size?: number;
  showTier?: boolean;
}

export default function AgentAvatar({ name, domain, tier, size = 32, showTier = false }: Props) {
  const initials = name.replace(/^(daily-|content-|project-|research-|weekly-)/, "").slice(0, 2).toUpperCase();
  const bg = DOMAIN_BG[domain] || DOMAIN_BG.meta;
  const fontSize = Math.max(9, size * 0.375);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "var(--r-sm)",
        background: bg,
        color: "white",
        fontSize,
        fontWeight: 600,
        lineHeight: 1,
      }}
      aria-hidden
    >
      {initials}
      {showTier && tier && (
        <span
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "var(--bg)",
            border: `1.5px solid ${TIER_COLOR[tier] || TIER_COLOR[1]}`,
            color: TIER_COLOR[tier] || TIER_COLOR[1],
            fontSize: 8,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          {tier}
        </span>
      )}
    </span>
  );
}
