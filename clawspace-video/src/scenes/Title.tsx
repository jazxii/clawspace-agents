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

export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const logo = spring({ frame, fps, config: { damping: 200, mass: 1.1 } });
  const logoScale = interpolate(logo, [0, 1], [0.7, 1]);

  const wordmarkOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const taglineOpacity = interpolate(frame, [28, 48], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const outOpacity = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 28,
        opacity: outOpacity,
      }}
    >
      {/* Five-dot mark — the five domain accents */}
      <div
        style={{
          display: "flex",
          gap: 22,
          transform: `scale(${logoScale})`,
        }}
      >
        {accents.map((c, i) => {
          const s = spring({
            frame: frame - i * 5,
            fps,
            config: { damping: 12, stiffness: 140, mass: 0.6 },
          });
          const pop = interpolate(s, [0, 1], [0, 1]);
          return (
            <span
              key={c}
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: c,
                transform: `scale(${pop})`,
                boxShadow: `0 0 40px ${c}`,
              }}
            />
          );
        })}
      </div>

      <h1
        style={{
          margin: 0,
          fontFamily: theme.fontSans,
          fontSize: 132,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: theme.text,
          opacity: wordmarkOpacity,
        }}
      >
        Clawspace
      </h1>

      <p
        style={{
          margin: 0,
          fontFamily: theme.fontSans,
          fontSize: 40,
          fontWeight: 500,
          color: theme.text3,
          opacity: taglineOpacity,
          letterSpacing: "-0.01em",
        }}
      >
        A personal AI workforce that runs on your machine.
      </p>
    </AbsoluteFill>
  );
};
