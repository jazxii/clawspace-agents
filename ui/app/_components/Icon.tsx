/**
 * Clawspace UI v3 line icons. Ported 1:1 from the design's icons.jsx.
 * Apple-flavored, currentColor stroke, sized via the `size` prop.
 */

import * as React from "react";

export type IconName =
  | "home" | "kanban" | "chat" | "activity" | "coin" | "log" | "graph"
  | "digest" | "audit" | "queue" | "palette" | "settings" | "notion"
  | "search" | "bell" | "sun" | "moon" | "plus" | "play" | "pause"
  | "check" | "x" | "arrow-right" | "chevron" | "chevron-down" | "dot"
  | "sparkles" | "menu" | "filter" | "send" | "attach" | "at"
  | "linkedin" | "instagram" | "twitter" | "mail" | "flag" | "spark" | "globe";

interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name" | "stroke"> {
  name: IconName;
  size?: number;
  stroke?: number;
}

export function Icon({ name, size = 16, stroke = 1.6, ...rest }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...rest,
  };
  switch (name) {
    case "home":         return <svg {...common}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z"/></svg>;
    case "kanban":       return <svg {...common}><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/></svg>;
    case "chat":         return <svg {...common}><path d="M21 12a8 8 0 0 1-11.2 7.3L3 21l1.7-6.8A8 8 0 1 1 21 12z"/></svg>;
    case "activity":     return <svg {...common}><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>;
    case "coin":         return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9 10c0-1.7 1.3-2.5 3-2.5s3 .8 3 2.5-1.3 2-3 2.5-3 .8-3 2.5 1.3 2.5 3 2.5 3-.8 3-2.5"/><path d="M12 6v1.5M12 16.5V18"/></svg>;
    case "log":          return <svg {...common}><path d="M5 4h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M16 4v3h3M7 11h10M7 15h10M7 19h6"/></svg>;
    case "graph":        return <svg {...common}><circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><circle cx="12" cy="12" r="2.2"/><path d="M12 7v3M10.5 13.5L7 16M13.5 13.5L17 16"/></svg>;
    case "digest":       return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>;
    case "audit":        return <svg {...common}><path d="M4 4h11l5 5v11a2 2 0 0 1-2 2H4z"/><path d="M14 4v5h5"/><path d="M8 14h8M8 18h6"/></svg>;
    case "queue":        return <svg {...common}><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>;
    case "palette":      return <svg {...common}><circle cx="11" cy="6" r="1.5"/><circle cx="6" cy="11" r="1.5"/><circle cx="6" cy="17" r="1.5"/><circle cx="16" cy="6" r="1.5"/><path d="M12 22a10 10 0 1 1 10-10c0 3-3 4-5 4h-2a2 2 0 0 0-2 2v2c0 1-1 2-1 2z"/></svg>;
    case "settings":     return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.2.6.7 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case "notion":       return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7v10M8 7l8 10M16 7v10"/></svg>;
    case "search":       return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "bell":         return <svg {...common}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/></svg>;
    case "sun":          return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
    case "moon":         return <svg {...common}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>;
    case "plus":         return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case "play":         return <svg {...common}><path d="M6 4l14 8-14 8z"/></svg>;
    case "pause":        return <svg {...common}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>;
    case "check":        return <svg {...common}><path d="M5 13l4 4L19 7"/></svg>;
    case "x":            return <svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "arrow-right":  return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "chevron":      return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case "chevron-down": return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>;
    case "dot":          return <svg {...common}><circle cx="12" cy="12" r="4"/></svg>;
    case "sparkles":     return <svg {...common}><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/></svg>;
    case "menu":         return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case "filter":       return <svg {...common}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>;
    case "send":         return <svg {...common}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>;
    case "attach":       return <svg {...common}><path d="M21 11l-9 9a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/></svg>;
    case "at":           return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>;
    case "linkedin":     return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 1 1 4 0v4M12 11v6"/></svg>;
    case "instagram":    return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>;
    case "twitter":      return <svg {...common}><path d="M4 4l7.5 10L4 20h2.5l6-6.5L17 20h3l-7.7-10.5L19.5 4H17l-5.5 6L7 4z"/></svg>;
    case "mail":         return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>;
    case "flag":         return <svg {...common}><path d="M5 21V4l13 3-2 5 2 5-13-2"/></svg>;
    case "spark":        return <svg {...common}><path d="M3 17l4-6 4 4 4-7 6 9"/></svg>;
    case "globe":        return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    default:             return null;
  }
}
