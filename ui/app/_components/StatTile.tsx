import type { DomainKey } from "@/lib/route-meta";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";
import { Sparkline } from "./Sparkline";

export function StatTile({
  tint,
  label,
  value,
  delta,
  deltaDir,
  spark,
  icon,
}: {
  tint: DomainKey;
  label: string;
  value: string;
  delta?: string;
  deltaDir?: "up" | "down" | "";
  spark?: number[];
  icon?: IconName;
}) {
  return (
    <div className={`cs-stat cs-tint-${tint}`}>
      <div className="cs-stat-stripe" />
      <div className="label">
        {icon && <Icon name={icon} size={12} />}
        {label}
      </div>
      <div className="value">{value}</div>
      {delta && <div className={`delta ${deltaDir || ""}`}>{delta}</div>}
      {spark && <Sparkline data={spark} tint={tint} />}
    </div>
  );
}
