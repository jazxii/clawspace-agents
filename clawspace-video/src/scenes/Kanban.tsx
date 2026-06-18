import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { theme, softAccent } from "../theme";
import { AppFrame, Camera, Vignette, type CamKey } from "../ui/shell";
import { Pill, Caption } from "../ui/widgets";

/* ── geometry (content-local px) ── */
const PAD = 30;
const GAP = 24;
const COLW = (1760 - PAD * 2 - GAP * 3) / 4; // 407
const STEP = COLW + GAP; // 431
const CARD_W = COLW - 28; // body padding 14 each side
const H_CARD = 84;
const PITCH = 98; // card height + margin-bottom 14
const BODY_TOP = 184; // padding(30) + title(96) + colHeader(44) + bodyPad(14)
const REST_TOP = BODY_TOP + 2 * PITCH; // slot 2 — below the two existing cards = 380
const colLeft = (c: number) => PAD + c * STEP + 14;

/* ── drag timeline ── */
const PICK = 40;
const DROP = 120;
const dragProg = (frame: number) =>
  interpolate(frame, [PICK, DROP], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
const dragLeft = (frame: number) => interpolate(dragProg(frame), [0, 1], [colLeft(0), colLeft(3)]);
const dragTop = (frame: number) => REST_TOP - 48 * Math.sin(dragProg(frame) * Math.PI);

type Col = { name: string; dot: string };
const COLS: Col[] = [
  { name: "Backlog", dot: theme.text4 },
  { name: "In Progress", dot: theme.projects },
  { name: "Review", dot: theme.projects },
  { name: "Done", dot: theme.meta },
];

type Cm = { title: string; meta: string; col: number };
const CARDS: Cm[] = [
  { title: "Crawl DOM for missing alt text", meta: "a11y", col: 0 },
  { title: "Score contrast vs WCAG AA", meta: "audit", col: 0 },
  { title: "Phase 11: Figma ADA Notes Generator", meta: "card-11", col: 1 },
  { title: "Listbox kanban a11y pass", meta: "ui", col: 3 },
  { title: "Wire axe-core into the CI gate", meta: "ci", col: 3 },
];

const CardBox: React.FC<{ title: string; meta: string; delay?: number; dragging?: boolean }> = ({ title, meta, delay = 0, dragging }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [12, 0])}px)`,
        height: H_CARD,
        boxSizing: "border-box",
        background: theme.bgElev2,
        border: dragging ? `2px solid ${theme.projects}` : `1px solid ${theme.border}`,
        borderRadius: 10,
        padding: "13px 16px",
        marginBottom: 14,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 9,
        boxShadow: dragging
          ? `0 22px 46px ${softAccent(theme.projects, 55)}, 0 0 0 6px ${softAccent(theme.projects, 12)}`
          : "0 1px 2px rgba(0,0,0,.35)",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 600, color: theme.text, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      <Pill tone="projects" dot={dragging} style={{ alignSelf: "flex-start", fontSize: 14 }}>{meta}</Pill>
    </div>
  );
};

const DragCursor: React.FC = () => {
  const frame = useCurrentFrame();
  // approach → grab → follow → release
  let cx: number;
  let cy: number;
  if (frame < PICK) {
    cx = interpolate(frame, [10, PICK], [150, colLeft(0) + 70], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
    cy = interpolate(frame, [10, PICK], [650, REST_TOP + 26], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  } else {
    cx = dragLeft(frame) + 70;
    cy = dragTop(frame) + 26;
  }
  const appear = interpolate(frame, [6, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const grabbing = frame >= PICK - 2 && frame < DROP + 2;
  const ripple = interpolate(frame, [DROP, DROP + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: cx, top: cy, opacity: appear, transform: `scale(${grabbing ? 0.9 : 1})`, zIndex: 60, pointerEvents: "none" }}>
      {ripple > 0 && ripple < 1 && (
        <div style={{ position: "absolute", left: 2, top: 2, width: 54 * ripple, height: 54 * ripple, marginLeft: -27 * ripple, marginTop: -27 * ripple, borderRadius: "50%", border: `2px solid ${theme.meta}`, opacity: 1 - ripple }} />
      )}
      <svg width="34" height="34" viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,.55))" }}>
        <path d="M5 2 L5 19 L9.5 14.8 L12.4 21.3 L15 20.1 L12.1 13.7 L18 13.6 Z" fill="#fff" stroke="#000" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const KanbanContent: React.FC = () => {
  const frame = useCurrentFrame();
  const picked = frame >= PICK;
  const dropped = frame >= DROP;
  const lifted = frame >= PICK - 2 && frame < DROP + 2;

  const counts = [picked ? 2 : 3, 1, 0, dropped ? 3 : 2];
  const overDone = frame >= 96 && frame < DROP + 14;

  const left = dragLeft(frame);
  const top = dragTop(frame);
  const rot = lifted ? -3 : 0;
  const scl = lifted ? 1.05 : 1;

  return (
    <div style={{ padding: PAD, height: "100%", boxSizing: "border-box", position: "relative" }}>
      <div style={{ height: 96, boxSizing: "border-box" }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: theme.text }}>
          Kanban · a11yai-accessibility-defect-automation
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 17, color: theme.text3 }}>
          30 cards · drag with the mouse, or focus a card and use ←/→
        </p>
      </div>

      <div style={{ display: "flex", gap: GAP }}>
        {COLS.map((col, ci) => {
          const cards = CARDS.filter((c) => c.col === ci);
          const over = ci === 3 && overDone;
          return (
            <div key={col.name} style={{ width: COLW }}>
              <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 19, fontWeight: 600, color: theme.text2 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: col.dot }} />
                  {col.name}
                </span>
                <span style={{ fontSize: 16, color: theme.text4, fontFamily: theme.fontMono }}>{counts[ci]}</span>
              </div>
              <div
                style={{
                  background: over ? softAccent(theme.meta, 12) : theme.bgElev1,
                  border: over ? `1px solid ${softAccent(theme.meta, 50)}` : `1px solid ${theme.border}`,
                  borderRadius: 14,
                  padding: 14,
                  minHeight: 560,
                }}
              >
                {cards.map((c, i) => (
                  <CardBox key={c.title} title={c.title} meta={c.meta} delay={16 + i * 5} />
                ))}
                {/* reserved drop slot appears under the existing Done cards as it lands */}
                {ci === 3 && dropped && <div style={{ height: H_CARD + 14 }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* the card being dragged (and finally resting in Done, below the others) */}
      <div style={{ position: "absolute", left, top, width: CARD_W, transform: `rotate(${rot}deg) scale(${scl})`, transformOrigin: "center", pointerEvents: "none" }}>
        <CardBox title="Generate fix-it report" meta={dropped ? "done" : "in-flight"} dragging={lifted} />
      </div>

      <DragCursor />
    </div>
  );
};

const TrackingCamera: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const cardCenter = dragLeft(frame) + CARD_W / 2;
  const blend = interpolate(frame, [14, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const camX = 880 * (1 - blend) + cardCenter * blend;
  const camS = interpolate(frame, [0, 46], [1.02, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const keys: CamKey[] = [
    { f: Math.max(0, frame - 1), x: camX, y: 470, s: camS },
    { f: frame + 1, x: camX, y: 470, s: camS },
  ];
  return <Camera keys={keys}>{children}</Camera>;
};

export const Kanban: React.FC = () => (
  <AbsoluteFill>
    <TrackingCamera>
      <AppFrame active="kanban" page="Kanban">
        <KanbanContent />
      </AppFrame>
    </TrackingCamera>
    <Vignette />
    <Caption text="Drag a card to Done — and it just works." accent="projects" inAt={126} outAt={180} />
  </AbsoluteFill>
);
