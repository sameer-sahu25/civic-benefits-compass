import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { incidentsQuery, systemsQuery } from "@/lib/queries";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  PlusCircle,
  Building,
  ShieldAlert,
  Calendar,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/gov/incidents")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(incidentsQuery),
      context.queryClient.ensureQueryData(systemsQuery),
    ]),
  component: Incidents,
});

const sel = "h-10 w-full rounded-xl border bg-card px-3 text-xs focus:ring-1 focus:ring-primary shadow-2xs";

function Incidents() {
  const { data: incidents } = useSuspenseQuery(incidentsQuery);
  const { data: systems } = useSuspenseQuery(systemsQuery);
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [sev, setSev] = useState("medium");
  const [sys, setSys] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const refresh = () => qc.invalidateQueries({ queryKey: ["incidents"] });

  const report = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("incidents").insert({
      title,
      description: desc,
      severity: sev,
      ai_system_id: sys || null,
      reported_by: u.user?.id ?? null,
      status: "open",
    });

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    setTitle("");
    setDesc("");
    setSys("");
    toast.success("Incident registered and logged to audit trail");
    refresh();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("incidents")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Incident status updated to ${newStatus}`);
    refresh();
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (severityFilter !== "all" && i.severity !== severityFilter) return false;
      return true;
    });
  }, [incidents, statusFilter, severityFilter]);

  const openCount = incidents.filter((i) => i.status === "open").length;
  const investigatingCount = incidents.filter((i) => i.status === "investigating").length;
  const resolvedCount = incidents.filter((i) => i.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Incident & Grievance Register
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track AI model failures, discriminatory outputs, data exposures, and containment remediation actions.
        </p>

        {/* Status Counters */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-muted-foreground hover:border-primary"
            }`}
          >
            All Incidents ({incidents.length})
          </button>

          <button
            onClick={() => setStatusFilter("open")}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "open"
                ? "bg-rose-500 text-white shadow-xs"
                : "bg-card text-rose-600 border-rose-500/20 hover:border-rose-500"
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Open ({openCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter("investigating")}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "investigating"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-card text-amber-600 border-amber-500/20 hover:border-amber-500"
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>Investigating ({investigatingCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter("resolved")}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === "resolved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-card text-emerald-600 border-emerald-500/20 hover:border-emerald-500"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Resolved ({resolvedCount})</span>
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Incidents Feed */}
        <div className="space-y-4">
          {filteredIncidents.map((i) => (
            <div
              key={i.id}
              className="rounded-2xl border bg-card p-5 shadow-card space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        i.status === "open"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                          : i.status === "investigating"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {i.status}
                    </span>
                    <RiskBadge tier={i.severity} />
                  </div>

                  <h2 className="text-base font-bold text-foreground">{i.title}</h2>

                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Building className="h-3.5 w-3.5" />
                    <span>{i.ai_systems?.name ? `Linked: ${i.ai_systems.name}` : "Unlinked System"}</span>
                    <span>·</span>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(i.created_at).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              {i.description && (
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl">
                  {i.description}
                </p>
              )}

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                <span className="text-[11px] font-medium text-muted-foreground">Change Status:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => updateStatus(i.id, "open")}
                    disabled={i.status === "open"}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      i.status === "open"
                        ? "bg-rose-500 text-white cursor-default"
                        : "border bg-card hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => updateStatus(i.id, "investigating")}
                    disabled={i.status === "investigating"}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      i.status === "investigating"
                        ? "bg-amber-500 text-white cursor-default"
                        : "border bg-card hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    Investigating
                  </button>
                  <button
                    onClick={() => updateStatus(i.id, "resolved")}
                    disabled={i.status === "resolved"}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      i.status === "resolved"
                        ? "bg-emerald-600 text-white cursor-default"
                        : "border bg-card hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredIncidents.length === 0 && (
            <div className="rounded-2xl border border-dashed p-10 text-center space-y-2 bg-card/40">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="text-sm font-semibold">No incidents under this filter</p>
              <p className="text-xs text-muted-foreground">All systems are currently running within parameters.</p>
            </div>
          )}
        </div>

        {/* Report New Incident Sidebar Form */}
        <aside>
          <form
            onSubmit={report}
            className="rounded-2xl border bg-card p-6 shadow-card space-y-4 lg:sticky lg:top-24"
          >
            <div className="border-b pb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <AlertOctagon className="h-4 w-4 text-rose-500" />
                Report AI Incident
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Log a model failure, discrimination complaint, or breach
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Incident Title</Label>
              <Input
                required
                placeholder="e.g. Bias in rural scholarship filtering"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description & Impact</Label>
              <Textarea
                placeholder="Describe what occurred, who was affected, and immediate containment..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                className="text-xs resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Affected AI System</Label>
              <select className={sel} value={sys} onChange={(e) => setSys(e.target.value)}>
                <option value="">Unlinked / Cross-cutting</option>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Severity Tier</Label>
              <select className={sel} value={sev} onChange={(e) => setSev(e.target.value)}>
                <option value="low">Low (Minor anomaly)</option>
                <option value="medium">Medium (Moderate deviation)</option>
                <option value="high">High (Service disruption / unfairness)</option>
                <option value="critical">Critical (Severe harm / data breach)</option>
              </select>
            </div>

            <Button type="submit" disabled={submitting} className="w-full gap-2 text-xs">
              <PlusCircle className="h-3.5 w-3.5" />
              {submitting ? "Submitting..." : "Log Incident to Supabase"}
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
