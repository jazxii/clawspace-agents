/**
 * Status badge — never relies on color alone (WCAG 1.4.1).
 * Always renders an icon glyph (text-readable, aria-hidden) + text label.
 * Color tokens defined in tailwind.config.ts (every pair audited ≥7:1).
 */

type Tone =
  | "drafting"
  | "ready"
  | "posted"
  | "inprogress"
  | "review"
  | "done"
  | "info"
  | "warning"
  | "error";

const toneClasses: Record<Tone, string> = {
  drafting: "bg-[#dbeafe] text-[#1e3a8a]",
  ready: "bg-[#dcfce7] text-[#14532d]",
  posted: "bg-[#f1f5f9] text-[#475569]",
  inprogress: "bg-[#fef3c7] text-[#7c2d12]",
  review: "bg-[#f3e8ff] text-[#581c87]",
  done: "bg-[#dcfce7] text-[#14532d]",
  info: "bg-[#dbeafe] text-[#1e3a8a]",
  warning: "bg-[#fef3c7] text-[#78350f]",
  error: "bg-[#fee2e2] text-[#7f1d1d]",
};

const icons: Record<Tone, string> = {
  drafting: "✎",
  ready: "✓",
  posted: "→",
  inprogress: "…",
  review: "◐",
  done: "✓",
  info: "ℹ",
  warning: "⚠",
  error: "✕",
};

export default function StatusBadge({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      <span aria-hidden="true">{icons[tone]}</span>
      {children}
    </span>
  );
}
