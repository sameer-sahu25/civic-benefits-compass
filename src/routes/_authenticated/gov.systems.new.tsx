import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { departmentsQuery } from "@/lib/queries";
import { scoreRisk, type RiskAnswers } from "@/lib/risk";
import { RiskBadge } from "@/components/RiskBadge";
import { applicableControls, frameworkName } from "@/lib/frameworks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/gov/systems/new")({
  loader: ({ context }) => context.queryClient.ensureQueryData(departmentsQuery),
  component: NewSystem,
});

const sel = "h-9 w-full rounded-md border bg-card px-3 text-sm";

function NewSystem() {
  const { data: depts } = useSuspenseQuery(departmentsQuery);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [dept, setDept] = useState(depts[0]?.id ?? "");
  const [population, setPopulation] = useState("");
  const [saving, setSaving] = useState(false);
  const [a, setA] = useState<RiskAnswers>({
    domain: "public_services", automation: "assistive", personalData: false, sensitiveData: false,
    vulnerableGroups: false, humanOversight: true, explainable: true, scale: "district",
  });
  const r = scoreRisk(a);
  const set = <K extends keyof RiskAnswers>(k: K, v: RiskAnswers[K]) => setA((p) => ({ ...p, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { data: sys, error } = await supabase.from("ai_systems").insert({
      name, purpose, department_id: dept || null, domain: a.domain, automation_level: a.automation,
      uses_personal_data: a.personalData, affected_population: population, status: "under_review",
      risk_tier: r.tier, risk_score: r.total, owner_id: u.user?.id ?? null,
    }).select("id").single();
    if (error || !sys) { setSaving(false); { toast.error(error?.message ?? "Failed"); return; } }
    const { error: e2 } = await supabase.from("risk_assessments").insert({
      ai_system_id: sys.id, answers: a as never, dimension_scores: r.dimensions as never, total_score: r.total, tier: r.tier, created_by: u.user?.id ?? null,
    });
    await supabase.from("audit_events").insert({ actor_id: u.user?.id ?? null, action: "register_system", entity: "ai_systems", entity_id: sys.id });
    setSaving(false);
    if (e2) { toast.error(e2.message); return; }
    toast.success("AI system registered");
    qc.invalidateQueries({ queryKey: ["ai_systems"] });
    navigate({ to: "/gov/systems" });
  };

  const toggles: [keyof RiskAnswers, string][] = [
    ["personalData", "Uses personal data"], ["sensitiveData", "Uses sensitive data (health, caste, biometrics)"],
    ["vulnerableGroups", "Affects vulnerable groups"], ["humanOversight", "Human reviews every decision"], ["explainable", "Decisions can be explained to citizens"],
  ];

  return (
    <form onSubmit={save} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <h1 className="text-3xl font-semibold">Register an AI system</h1>
        <div className="space-y-1.5"><Label>System name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} className="bg-card" /></div>
        <div className="space-y-1.5"><Label>Purpose</Label><Textarea required value={purpose} onChange={(e) => setPurpose(e.target.value)} className="bg-card" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Department</Label>
            <select className={sel} value={dept} onChange={(e) => setDept(e.target.value)}>{depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          <div className="space-y-1.5"><Label>Affected population</Label><Input value={population} onChange={(e) => setPopulation(e.target.value)} className="bg-card" /></div>
          <div className="space-y-1.5"><Label>Domain</Label>
            <select className={sel} value={a.domain} onChange={(e) => set("domain", e.target.value as RiskAnswers["domain"])}>
              {["public_services", "healthcare", "welfare", "law_enforcement", "education", "agriculture", "other"].map((d) => <option key={d} value={d}>{d.replace("_", " ")}</option>)}
            </select></div>
          <div className="space-y-1.5"><Label>Automation level</Label>
            <select className={sel} value={a.automation} onChange={(e) => set("automation", e.target.value as RiskAnswers["automation"])}>
              <option value="assistive">Assistive</option><option value="decision_support">Decision support</option><option value="automated">Fully automated</option>
            </select></div>
          <div className="space-y-1.5"><Label>Scale of deployment</Label>
            <select className={sel} value={a.scale} onChange={(e) => set("scale", e.target.value as RiskAnswers["scale"])}>
              <option value="small">Small pilot</option><option value="district">District</option><option value="state">State</option><option value="national">National</option>
            </select></div>
        </div>
        <div className="space-y-3 rounded-lg border bg-card p-4">
          {toggles.map(([k, label]) => (
            <label key={k} className="flex items-center justify-between text-sm">{label}<Switch checked={a[k] as boolean} onCheckedChange={(v) => set(k, v as never)} /></label>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-lg border bg-card p-5 shadow-card lg:sticky lg:top-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Preliminary risk</p>
        <div className="mt-2 flex items-center gap-3"><span className="font-display text-5xl font-semibold text-primary">{r.total}</span><RiskBadge tier={r.tier} /></div>
        <ul className="mt-4 space-y-1.5 text-sm">
          {Object.entries(r.dimensions).map(([k, v]) => (
            <li key={k} className="flex justify-between"><span className="capitalize text-muted-foreground">{k.replace("_", " ")}</span><span className="font-medium">+{v}</span></li>
          ))}
        </ul>
        <div className="mt-5 border-t pt-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Required controls ({applicableControls(a, r.tier).length})</p><ul className="mt-2 space-y-2 text-sm">{applicableControls(a, r.tier).map((c) => <li key={c.text}><p>{c.text}</p><p className="text-[11px] text-accent">{frameworkName(c.framework)}</p></li>)}</ul></div>
        <p className="mt-4 text-xs text-muted-foreground">Transparent rule-based triage. Requires human review; not a legal classification.</p>
        <Button className="mt-4 w-full" disabled={saving}>{saving ? "Saving…" : "Register & submit for review"}</Button>
      </aside>
    </form>
  );
}
