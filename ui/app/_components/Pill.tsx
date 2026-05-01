import type { DomainKey } from "@/lib/route-meta";

type PillTone = DomainKey | "alert" | "system";

export function Pill({
  tone,
  dot,
  children,
  className,
  ...rest
}: {
  tone?: PillTone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "className">) {
  return (
    <span className={`cs-pill${className ? ` ${className}` : ""}`} data-tone={tone} {...rest}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}
