import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme, softAccent, type DomainAccent } from "../theme";
import { SectionHeading } from "./SectionHeading";

type Merit = {
  glyph: string;
  title: string;
  body: string;
  accent: DomainAccent;
};

const merits: Merit[] = [
  {
    glyph: "⌂",
    title: "Local-first",
    body: "Runs entirely on your machine. No server, no database, no cloud lock-in.",
    accent: "projects",
  },
  {
    glyph: "≡",
    title: "Markdown is truth",
    body: "Every plan, board and post is plain markdown. Notion is just a mirror.",
    accent: "research",
  },
  {
    glyph: "♿",
    title: "WCAG 2.2 AA",
    body: "The dashboard is built accessible-first — keyboard, screen-reader, contrast.",
    accent: "content",
  },
  {
    glyph: "⛉",
    title: "Nothing auto-posts",
    body: "Agents stage drafts only. You stay in control of every publish.",
    accent: "meta",
  },
];

const MeritCard: React.FC<{ m: Merit; index: number }> = ({ m, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - (10 + index * 6),
    fps,
    config: { damping: 200, stiffness: 110 },
  });
  const color = theme[m.accent];
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
        background: theme.bgElev2,
        border: `1px solid ${softAccent(color, 35)}`,
        borderRadius: 20,
        padding: 36,
        width: 420,
        boxShadow: `0 0 50px ${softAccent(color, 16)}`,
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 18,
          background: softAccent(color, 18),
          border: `1px solid ${softAccent(color, 40)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 42,
          color,
          marginBottom: 24,
        }}
      >
        {m.glyph}
      </div>
      <div
        style={{
          fontFamily: theme.fontSans,
          fontSize: 36,
          fontWeight: 700,
          color: theme.text,
          letterSpacing: "-0.02em",
        }}
      >
        {m.title}
      </div>
      <div
        style={{
          fontFamily: theme.fontSans,
          fontSize: 23,
          color: theme.text3,
          marginTop: 12,
          lineHeight: 1.5,
        }}
      >
        {m.body}
      </div>
    </div>
  );
};

export const Merits: React.FC = () => {
  return (
    <AbsoluteFill
      style={{ flexDirection: "column", alignItems: "center", paddingTop: 110 }}
    >
      <SectionHeading
        kicker="Why it matters"
        title="Yours, private, and in control"
        accent="meta"
      />
      <div
        style={{
          marginTop: 52,
          display: "grid",
          gridTemplateColumns: "repeat(2, auto)",
          gap: 30,
        }}
      >
        {merits.map((m, i) => (
          <MeritCard key={m.title} m={m} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
