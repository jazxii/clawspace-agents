/**
 * Status badge — never relies on color alone (WCAG 1.4.1).
 * Always renders an icon glyph (text-readable, aria-hidden) + text label.
 *
 * v2: classes consume CSS variable tokens (light + dark pairs) per
 * ACCESSIBILITY-BRIEF-V2 §5.3.
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
  drafting: "badge badge-drafting",
  ready: "badge badge-ready",
  posted: "badge badge-posted",
  inprogress: "badge badge-inprogress",
  review: "badge badge-review",
  done: "badge badge-done",
  info: "badge badge-info",
  warning: "badge badge-warning",
  error: "badge badge-error",
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
    <span className={toneClasses[tone]}>
      <span aria-hidden="true">{icons[tone]}</span>
      {children}
    </span>
  );
}
