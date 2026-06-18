import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

/** Soft, slowly drifting accent glows on the dark canvas. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (seed: number) =>
    interpolate(
      Math.sin((frame + seed * 40) / 90),
      [-1, 1],
      [-60, 60],
    );

  const blobs = [
    { color: theme.projects, x: 18, y: 22, seed: 0, size: 720 },
    { color: theme.research, x: 78, y: 30, seed: 2, size: 640 },
    { color: theme.content, x: 30, y: 82, seed: 4, size: 600 },
    { color: theme.meta, x: 82, y: 80, seed: 6, size: 560 },
  ];

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            transform: `translate(-50%, -50%) translate(${drift(b.seed)}px, ${drift(
              b.seed + 1,
            )}px)`,
            background: b.color,
            borderRadius: "50%",
            filter: "blur(160px)",
            opacity: 0.16,
          }}
        />
      ))}
      {/* faint grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 85%)",
        }}
      />
    </AbsoluteFill>
  );
};
