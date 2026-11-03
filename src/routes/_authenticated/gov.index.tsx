import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { incidentsQuery, systemsQuery } from "@/lib/queries";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  Database,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Cpu,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/gov/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(systemsQuery),
      context.queryClient.ensureQueryData(incidentsQuery),
    ]),
  component: Dashboard,
});

const TIERS = [
  { key: "low", label: "Low Risk", color: "var(--risk-low)" },
  { key: "medium", label: "Moderate Risk", color: "var(--risk-medium)" },
  { key: "high", label: "High Risk", color: "var(--risk-high)" },
  { key: "critical", label: "Critical Review", color: "var(--risk-critical)" },
] as const;

function Dashboard() {
  const { data: systems } = useSuspenseQuery(systemsQuery);
  const { data: incidents } = useSuspenseQuery(incidentsQuery);

  const dist = TIERS.map((t) => ({
    tier: t.key,
    label: t.label,
    count: systems.filter((s) => s.risk_tier === t.key).length,
    color: t.color,
  }));

  const openIncidents = incidents.filter((i) => i.status !== "resolved").length;
  const highRisk = systems.filter(
    (s) => s.risk_tier === "high" || s.risk_tier === "critical"
  );
  const underReview = systems.filter((s) => s.status === "under_review").length;

  return (
    <div className="space-y-8">
      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total AI Systems
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-4xl font-extrabold text-foreground">{systems.length}</p>
          <p className="text-[11px] text-muted-foreground">Across Central & State departments</p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              High / Critical Tier
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-4xl font-extrabold text-amber-600 dark:text-amber-400">
            {highRisk.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Requires mandatory DPIA & bias audit</p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Under Triage Review
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-4xl font-extrabold text-foreground">{underReview}</p>
          <p className="text-[11px] text-muted-foreground">Awaiting reviewer sign-off</p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Open Incidents
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display text-4xl font-extrabold text-rose-600 dark:text-rose-400">
            {openIncidents}
          </p>
          <p className="text-[11px] text-muted-foreground">Active failures & containment actions</p>
        </div>
      </div>

      {/* Charts & Focus Areas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Distribution Chart */}
        <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-lg font-bold">Risk Tier Distribution</h2>
              <p className="text-xs text-muted-foreground">
                Triage classification based on NAGSI 8-dimension weighted formula
              </p>
            </div>
            <Link
              to="/gov/systems"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View Registry</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`${val} AI Systems`, "Count"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {dist.map((d) => (
                    <Cell key={d.tier} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t text-center text-xs">
            {dist.map((d) => (
              <div key={d.tier} className="space-y-0.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  {d.tier}
                </span>
                <p className="font-bold text-sm text-foreground">{d.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention List */}
        <div className="rounded-2xl border bg-card p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-lg font-bold">Needs Immediate Attention</h2>
                <p className="text-xs text-muted-foreground">
                  High-impact AI deployments requiring documented governance evidence
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="text-xs h-7">
                <Link to="/gov/systems/new">Add System</Link>
              </Button>
            </div>

            <ul className="mt-4 divide-y">
              {highRisk.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                  <div className="space-y-0.5 pr-2">
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {s.departments?.name || "General Department"} · {s.domain.replace("_", " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      {s.risk_score ? `${s.risk_score}/4.0` : ""}
                    </span>
                    <RiskBadge tier={s.risk_tier} />
                  </div>
                </li>
              ))}

              {highRisk.length === 0 && (
                <li className="py-8 text-center text-xs text-muted-foreground">
                  No high-risk deployments identified. All systems currently have moderate or low triage tiers.
                </li>
              )}
            </ul>
          </div>

          <div className="pt-4 border-t">
            <Button asChild variant="ghost" size="sm" className="w-full text-xs justify-between">
              <Link to="/gov/systems">
                <span>Inspect complete system inventory & versions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Governance Checkpoints & Guidance */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold text-base">
          <ShieldCheck className="h-5 w-5 text-saffron" />
          Mandatory Public Sector AI Checkpoints (India AI Guidelines 2025 & DPDP Act 2023)
        </div>
        <div className="grid gap-4 sm:grid-cols-3 pt-2 text-xs">
          <div className="rounded-xl border bg-card p-4 space-y-1.5 shadow-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              1. Do No Harm Review
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Verify that the system cannot automatically deny citizen entitlements without an appeal channel.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-1.5 shadow-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              2. Privacy & DPIA Audit
            </span>
            <p className="text-muted-foreground leading-relaxed">
              All personal data processing must have purpose-specific consent notices and 90-day erasure capability.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 space-y-1.5 shadow-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              3. Human Oversight Register
            </span>
            <p className="text-muted-foreground leading-relaxed">
              Designate a responsible government officer with authority to pause or override autonomous model outputs.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        *Risk triage scores are explainable decision-support indicators — they do not constitute formal legal certification or statutory compliance guarantees.*
      </p>
    </div>
  );
}
