import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { theme, softAccent, mixWithText, tierColor, type DomainAccent } from "../theme";

/* ─────────────────────────── animated number ─────────────────────────── */
export const AnimatedNumber: React.FC<{
  to: number;
  delay?: number;
  duration?: number;
  format?: (n: number) => string;
}> = ({ to, delay = 0, duration = 26, format }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame - delay, [0, duration], [0, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const n = Math.round(v);
  return <>{format ? format(n) : String(n)}</>;
};

/* ───────────────────────────── sparkline ─────────────────────────────── */
export const Sparkline: React.FC<{
  data: number[];
  tint: DomainAccent;
  delay?: number;
  width?: number;
  height?: number;
}> = ({ data, tint, delay = 0, width = 130, height = 40 }) => {
  const frame = useCurrentFrame();
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const W = 100;
  const H = 32;
  const pts = data.map((val, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((val - min) / (max - min || 1)) * (H - 4) - 2;
    return [x, y] as const;
  });
  const poly = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const color = theme[tint];
  const draw = interpolate(frame - delay, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const totalLen = 240;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: "block", width, height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`sg-${tint}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${poly} ${W},${H}`} fill={`url(#sg-${tint})`} opacity={draw} />
      <polyline
        points={poly}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={totalLen}
        strokeDashoffset={totalLen * (1 - draw)}
      />
    </svg>
  );
};

/* ───────────────────────────── stat tile ─────────────────────────────── */
export const StatTile: React.FC<{
  tint: DomainAccent;
  label: string;
  value: number;
  valueFormat?: (n: number) => string;
  delta: string;
  spark: number[];
  delay?: number;
}> = ({ tint, label, value, valueFormat, delta, spark, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.8 } });
  const color = theme[tint];
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [22, 0])}px)`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 22,
        background: theme.bgElev2,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,.4)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
      <div
        style={{
          fontSize: 17,
          textTransform: "uppercase",
          letterSpacing: ".04em",
          color: theme.text3,
          fontWeight: 600,
          fontFamily: theme.fontSans,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: theme.text,
          fontFamily: theme.fontSans,
          fontVariantNumeric: "tabular-nums",
          marginTop: 2,
          lineHeight: 1.05,
        }}
      >
        <AnimatedNumber to={value} delay={delay + 6} format={valueFormat} />
      </div>
      <div style={{ fontSize: 16, color: theme.text3, fontFamily: theme.fontSans }}>{delta}</div>
      <div style={{ marginTop: 8 }}>
        <Sparkline data={spark} tint={tint} delay={delay + 8} width={180} height={50} />
      </div>
    </div>
  );
};

/* ─────────────────────────────── pill ────────────────────────────────── */
export const Pill: React.FC<{
  tone: DomainAccent | "alert";
  dot?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ tone, dot, children, style }) => {
  const color = tone === "alert" ? theme.system : theme[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "4px 12px",
        borderRadius: 9999,
        fontSize: 18,
        fontWeight: 600,
        fontFamily: theme.fontSans,
        background: softAccent(color, 14),
        color: mixWithText(color, 62),
        border: `1px solid ${softAccent(color, 28)}`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />}
      {children}
    </span>
  );
};

/* ──────────────────────────── agent avatar ───────────────────────────── */
export const AgentAvatar: React.FC<{
  name: string;
  domain: DomainAccent;
  tier?: number;
  size?: number;
}> = ({ name, domain, tier, size = 44 }) => {
  const initials = name
    .replace(/^(daily-|content-|project-|research-|weekly-)/, "")
    .slice(0, 2)
    .toUpperCase();
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
        borderRadius: 9,
        background: theme[domain],
        color: "#fff",
        fontSize: size * 0.375,
        fontWeight: 700,
        fontFamily: theme.fontSans,
      }}
    >
      {initials}
      {tier && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 19,
            height: 19,
            borderRadius: "50%",
            background: theme.bg,
            border: `2px solid ${tierColor[tier]}`,
            color: tierColor[tier],
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {tier}
        </span>
      )}
    </span>
  );
};

/* ──────────────────────────────── card ───────────────────────────────── */
export const Card: React.FC<{
  title?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}> = ({ title, right, children, style, bodyStyle }) => (
  <div
    style={{
      background: theme.bgElev2,
      border: `1px solid ${theme.border}`,
      borderRadius: 14,
      boxShadow: "0 1px 2px rgba(0,0,0,.4)",
      overflow: "hidden",
      ...style,
    }}
  >
    {title && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 20px",
          borderBottom: `1px solid ${theme.hairline}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 19,
            fontWeight: 600,
            color: theme.text,
            fontFamily: theme.fontSans,
          }}
        >
          {title}
        </div>
        {right}
      </div>
    )}
    <div style={{ padding: "16px 20px", ...bodyStyle }}>{children}</div>
  </div>
);

/* ─────────────────────────── floating caption ────────────────────────── */
export const Caption: React.FC<{
  text: string;
  accent: DomainAccent;
  inAt?: number;
  outAt?: number;
}> = ({ text, accent, inAt = 24, outAt = 100000 }) => {
  const frame = useCurrentFrame();
  const color = theme[accent];

  // Slow, eased fade-in → hold → slow fade-out.
  const appear = interpolate(frame, [inAt, inAt + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const disappear = interpolate(frame, [outAt - 30, outAt], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const opacity = Math.min(appear, disappear);

  // Gentle rise on entry, gentle drift down on exit.
  const riseIn = interpolate(frame, [inAt, inAt + 34], [46, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const driftOut = interpolate(frame, [outAt - 30, outAt], [0, 22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 46,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${riseIn + driftOut}px)`,
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 32px 16px 24px",
          borderRadius: 9999,
          background: "rgba(18,18,20,.86)",
          border: `1px solid ${softAccent(color, 45)}`,
          boxShadow: `0 18px 50px rgba(0,0,0,.55), 0 0 36px ${softAccent(color, 20)}`,
        }}
      >
        <span
          style={{
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 16px ${color}`,
          }}
        />
        <span style={{ fontFamily: theme.fontSans, fontSize: 32, fontWeight: 600, color: theme.text }}>
          {text}
        </span>
      </div>
    </div>
  );
};

/* ───────────────────────────── mac cursor ────────────────────────────── */
export const Cursor: React.FC<{
  from: [number, number];
  to: [number, number];
  startFrame: number;
  travel?: number;
  clickAt?: number;
}> = ({ from, to, startFrame, travel = 22, clickAt }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - startFrame, [0, travel], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const x = interpolate(t, [0, 1], [from[0], to[0]]);
  const y = interpolate(t, [0, 1], [from[1], to[1]]);
  const appear = interpolate(frame - startFrame, [-6, 0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const clickFrame = clickAt ?? startFrame + travel;
  const ripple = interpolate(frame - clickFrame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const press = frame >= clickFrame && frame < clickFrame + 6 ? 0.88 : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: appear,
        transform: `scale(${press})`,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      {ripple > 0 && ripple < 1 && (
        <div
          style={{
            position: "absolute",
            left: 2,
            top: 2,
            width: 46 * ripple,
            height: 46 * ripple,
            marginLeft: -23 * ripple,
            marginTop: -23 * ripple,
            borderRadius: "50%",
            border: `2px solid ${theme.projects}`,
            opacity: 1 - ripple,
          }}
        />
      )}
      <svg width="32" height="32" viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,.5))" }}>
        <path
          d="M5 2 L5 19 L9.5 14.8 L12.4 21.3 L15 20.1 L12.1 13.7 L18 13.6 Z"
          fill="#fff"
          stroke="#000"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
