import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Database,
  PlusCircle,
  AlertOctagon,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/gov")({
  head: () => ({
    meta: [
      { title: "Government AI Governance Workspace — NAGSI" },
      {
        name: "description",
        content:
          "Register public-sector AI systems, triage risk, map policy controls, and manage incident remediation across departments.",
      },
      { property: "og:title", content: "Government AI Governance Workspace — NAGSI" },
      {
        property: "og:description",
        content: "Internal department-scoped AI governance and risk posture dashboard.",
      },
    ],
  }),
  component: GovLayout,
});

function GovLayout() {
  const tab = "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all";
  const active = { className: "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold bg-primary text-primary-foreground shadow-xs" };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              Government AI Governance Workspace
            </span>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              Department-Scoped RBAC
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Internal decision-support environment for registering public AI models, evaluating risk tiers, and tracking compliance evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/frameworks"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <span>View 6 Policy Frameworks</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap items-center gap-1.5 rounded-xl border bg-card p-1.5 shadow-xs">
        <Link to="/gov" activeOptions={{ exact: true }} className={tab} activeProps={active}>
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Governance Dashboard</span>
        </Link>
        <Link to="/gov/systems" activeOptions={{ exact: true }} className={tab} activeProps={active}>
          <Database className="h-3.5 w-3.5" />
          <span>AI System Registry</span>
        </Link>
        <Link to="/gov/systems/new" className={tab} activeProps={active}>
          <PlusCircle className="h-3.5 w-3.5 text-saffron" />
          <span>Register New System</span>
        </Link>
        <Link to="/gov/incidents" className={tab} activeProps={active}>
          <AlertOctagon className="h-3.5 w-3.5" />
          <span>Incidents & Remediation</span>
        </Link>
      </nav>

      {/* Child Content */}
      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}
