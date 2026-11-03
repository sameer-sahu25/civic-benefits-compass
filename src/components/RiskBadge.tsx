import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  low: "bg-risk-low/15 text-risk-low border-risk-low/40",
  medium: "bg-risk-medium/15 text-foreground border-risk-medium/50",
  high: "bg-risk-high/15 text-risk-high border-risk-high/40",
  critical: "bg-risk-critical/15 text-risk-critical border-risk-critical/40",
};

export function RiskBadge({ tier }: { tier: string | null }) {
  if (!tier) return <span className="text-xs text-muted-foreground">Not assessed</span>;
  return (
    <span className={cn("inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide", styles[tier])}>
      {tier}
    </span>
  );
}
