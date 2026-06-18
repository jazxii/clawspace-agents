import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";

const accents = [
  theme.content,
  theme.projects,
  theme.research,
  theme.meta,
  theme.system,
];

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 200, mass: 1.1 } });
  const scale = interpolate(s, [0, 1], [0.85, 1]);

  const lineOpacity = interpolate(frame, [24, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          opacity: s,
          transform: `scale(${scale})`,
        }}
      >
        {accents.map((c) => (
          <span
            key={c}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 26px ${c}`,
            }}
          />
        ))}
      </div>

      <h1
        style={{
          margin: 0,
          fontFamily: theme.fontSans,
          fontSize: 124,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: theme.text,
          transform: `scale(${scale})`,
          opacity: s,
        }}
      >
        Clawspace
      </h1>

      <div
        style={{
          width: 360,
          height: 1,
          background: theme.borderStrong,
          opacity: lineOpacity,
        }}
      />

      <p
        style={{
          margin: 0,
          fontFamily: theme.fontSans,
          fontSize: 34,
          fontWeight: 500,
          color: theme.text3,
          opacity: tagOpacity,
          letterSpacing: "-0.01em",
        }}
      >
        Markdown in. Momentum out.
      </p>
    </AbsoluteFill>
  );
};
