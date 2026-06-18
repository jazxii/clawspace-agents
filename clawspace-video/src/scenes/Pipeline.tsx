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

type Step = { label: string; sub: string; accent: DomainAccent };

const steps: Step[] = [
  { label: "domain-researcher", sub: "Exa · Tavily · web", accent: "research" },
  { label: "notebooklm-bridge", sub: "grounded Q&A", accent: "research" },
  { label: "writers ×3", sub: "LinkedIn · IG · X", accent: "content" },
  { label: "humanizer", sub: "writing signature", accent: "content" },
  { label: "notion-publisher", sub: "mirror, never post", accent: "meta" },
];

const StepNode: React.FC<{ step: Step; index: number }> = ({ step, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 12 + index * 11;
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const color = theme[step.accent];
  const pulse =
    0.5 +
    0.5 *
      Math.sin(Math.max(0, (frame - delay) / 6)) *
      Math.exp(-Math.max(0, frame - delay) / 30);
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
        background: theme.bgElev2,
        border: `1px solid ${softAccent(color, 40)}`,
        borderRadius: 16,
        padding: "20px 22px",
        width: 240,
        textAlign: "center",
        boxShadow: `0 0 ${20 + pulse * 30}px ${softAccent(color, 25)}`,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: color,
          margin: "0 auto 12px",
          boxShadow: `0 0 16px ${color}`,
        }}
      />
      <div
        style={{
          fontFamily: theme.fontMono,
          fontSize: 23,
          fontWeight: 600,
          color: theme.text,
        }}
      >
        {step.label}
      </div>
      <div
        style={{
          fontFamily: theme.fontSans,
          fontSize: 18,
          color: theme.text3,
          marginTop: 6,
        }}
      >
        {step.sub}
      </div>
    </div>
  );
};

const Arrow: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const delay = 12 + index * 11 + 7;
  const grow = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // moving spark
  const t = ((frame - delay) % 40) / 40;
  return (
    <div style={{ position: "relative", width: 52, height: 4 }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 3,
          width: `${grow * 100}%`,
          background: theme.borderStrong,
          borderRadius: 2,
        }}
      />
      {grow > 0.9 && (
        <div
          style={{
            position: "absolute",
            top: -2,
            left: `${t * 100}%`,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: theme.content,
            boxShadow: `0 0 12px ${theme.content}`,
          }}
        />
      )}
    </div>
  );
};

export const Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const cmdOpacity = interpolate(frame, [4, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ flexDirection: "column", alignItems: "center", paddingTop: 110 }}
    >
      <SectionHeading
        kicker="One command"
        title="Research becomes content"
        accent="content"
      />

      <div
        style={{
          marginTop: 30,
          opacity: cmdOpacity,
          fontFamily: theme.fontMono,
          fontSize: 30,
          color: theme.text2,
          background: theme.bgSunken,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: "14px 26px",
        }}
      >
        <span style={{ color: theme.text4 }}>$ </span>
        <span style={{ color: theme.content }}>/research-to-content</span>{" "}
        accessible AI agents
      </div>

      <div
        style={{
          marginTop: 56,
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}
      >
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <StepNode step={s} index={i} />
            {i < steps.length - 1 && <Arrow index={i} />}
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};
