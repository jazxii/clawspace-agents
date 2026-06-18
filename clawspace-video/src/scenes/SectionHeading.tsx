import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme, type DomainAccent } from "../theme";

export const SectionHeading: React.FC<{
  kicker: string;
  title: string;
  accent?: DomainAccent;
}> = ({ kicker, title, accent = "projects" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  const y = interpolate(s, [0, 1], [24, 0]);
  const color = theme[accent];
  return (
    <div style={{ textAlign: "center", opacity: s, transform: `translateY(${y}px)` }}>
      <div
        style={{
          fontFamily: theme.fontSans,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color,
        }}
      >
        {kicker}
      </div>
      <h2
        style={{
          margin: "10px 0 0",
          fontFamily: theme.fontSans,
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: theme.text,
        }}
      >
        {title}
      </h2>
    </div>
  );
};
