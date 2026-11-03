import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Compass,
  Building2,
  Sparkles,
  ShieldCheck,
  Search,
  CheckCircle2,
  ArrowRight,
  Cpu,
  GraduationCap,
  Briefcase,
  Users,
  AlertTriangle,
  Layers,
  Scale,
  FileCheck,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NAGSI — National AI Governance & Schemes Intelligence" },
      {
        name: "description",
        content:
          "Two connected portals: a secure government AI governance workspace and an intelligent public directory of verified AI schemes.",
      },
      { property: "og:title", content: "NAGSI — AI Governance & Schemes Intelligence" },
      {
        property: "og:description",
        content:
          "AI System Registry, explainable risk assessment, and verified Indian AI initiatives for startups, students, and citizens.",
      },
    ],
  }),
  component: Index,
});

export function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Interactive Live Risk Triage Sandbox state
  const [isHighImpact, setIsHighImpact] = useState(true);
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [usesPersonalData, setUsesPersonalData] = useState(true);
  const [vulnerableGroups, setVulnerableGroups] = useState(false);
  const [nationalScale, setNationalScale] = useState(false);

  // Calculate interactive score based on NAGSI 8-dimension formula
  const riskCalculation = useMemo(() => {
    let score = 0.2; // base
    if (isHighImpact) score += 1.2;
    if (isAutonomous) score += 1.1;
    if (usesPersonalData) score += 0.8;
    if (vulnerableGroups) score += 0.6;
    if (nationalScale) score += 0.4;

    const total = Math.min(4.0, Number(score.toFixed(2)));
    let tier: "Low" | "Moderate" | "High" | "Critical" = "Low";
    let color = "text-emerald-600 bg-emerald-500/15 border-emerald-500/30";
    let meterColor = "bg-emerald-500";
    let advice = "Assistive / Informational: Standard 'Do No Harm' documentation and published plain-language transparency note.";

    if (total >= 3.0) {
      tier = "Critical";
      color = "text-rose-600 bg-rose-500/15 border-rose-500/30";
      meterColor = "bg-rose-500";
      advice = "Mandatory Regulatory Sandbox pilot, DPIA under DPDP Act 2023, senior reviewer sign-off, and strict human override.";
    } else if (total >= 2.0) {
      tier = "High";
      color = "text-amber-600 bg-amber-500/15 border-amber-500/30";
      meterColor = "bg-amber-500";
      advice = "High-Risk Controls: Pre-deployment fairness audit, consent management, access challenge protocol, and technical logging.";
    } else if (total >= 1.0) {
      tier = "Moderate";
      color = "text-blue-600 bg-blue-500/15 border-blue-500/30";
      meterColor = "bg-blue-500";
      advice = "Documented oversight: Human review of contested decisions, purpose limitation, and periodic review checkpoints.";
    }

    return { total, tier, color, meterColor, advice };
  }, [isHighImpact, isAutonomous, usesPersonalData, vulnerableGroups, nationalScale]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/schemes", search: { q: searchQuery.trim() } as never });
    }
  };

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-hero text-primary-foreground py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-saffron/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3.5 py-1 text-xs font-semibold text-saffron tracking-wide">
              <span className="h-2 w-2 rounded-full bg-saffron animate-pulse" />
              National AI Governance & Schemes Intelligence
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15]">
              Govern public AI responsibly. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron via-amber-200 to-emerald-300">
                Discover verified AI schemes.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-primary-foreground/80 leading-relaxed font-sans max-w-2xl">
              A unified digital ecosystem connecting ethical governance workflows for government departments with transparent scheme intelligence for citizens, startups, and researchers.
            </p>

            {/* Quick Interactive Search */}
            <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search AI compute, fellowships, grants, DPDP..."
                  className="pl-10 h-12 bg-card/95 text-foreground placeholder:text-muted-foreground border-0 shadow-lg text-sm rounded-xl focus-visible:ring-2 focus-visible:ring-saffron"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 bg-saffron text-saffron-foreground hover:bg-saffron/90 font-semibold rounded-xl shadow-md">
                Find Schemes
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs text-primary-foreground/70">Popular queries:</span>
              {[
                "GPU Compute",
                "Student Fellowships",
                "MSME AI Grants",
                "DPDP Act",
              ].map((term) => (
                <Link
                  key={term}
                  to="/schemes"
                  className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs text-white/90 hover:bg-white/20 hover:border-white/40 transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-3.5">
              <Button size="lg" variant="secondary" asChild className="rounded-xl shadow-md gap-2 font-semibold">
                <Link to="/eligibility">
                  <Compass className="h-4 w-4" />
                  Personal Eligibility Finder
                </Link>
              </Button>
              <Button size="lg" asChild className="rounded-xl shadow-md gap-2 bg-white text-primary hover:bg-white/90 font-semibold">
                <Link to="/assistant">
                  <Sparkles className="h-4 w-4 text-saffron" />
                  Ask Sahayak AI
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold">
                <Link to="/gov">
                  <Building2 className="h-4 w-4" />
                  Gov Portal
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE METRICS COUNTER */}
      <section className="border-y bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-saffron/15 text-saffron">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-foreground">42</p>
                <p className="text-xs text-muted-foreground font-medium">Published Schemes</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Scale className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-foreground">8</p>
                <p className="text-xs text-muted-foreground font-medium">Risk Triage Dimensions</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-foreground">6</p>
                <p className="text-xs text-muted-foreground font-medium">Governance Frameworks</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-foreground">10,000+</p>
                <p className="text-xs text-muted-foreground font-medium">IndiaAI GPUs Mapped</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE AI RISK TRIAGE SANDBOX */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-xl lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Scale className="h-3.5 w-3.5" />
                Live Interactive Demonstration
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Test NAGSI's 8-Dimension Risk Triage Engine
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                NAGSI uses transparent, reproducible weighted rules across 8 governance dimensions rather than an opaque black box. Toggle parameters below to see the risk score and required safeguards recalculate in real time:
              </p>

              {/* Toggles */}
              <div className="space-y-3.5 pt-2">
                <label className="flex items-center justify-between rounded-xl border bg-background/60 p-3.5 text-sm font-medium hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">High Public Impact / Rights Effect (+1.2)</p>
                    <p className="text-xs text-muted-foreground">System influences welfare eligibility, judicial triage, or service denial.</p>
                  </div>
                  <Switch checked={isHighImpact} onCheckedChange={setIsHighImpact} />
                </label>

                <label className="flex items-center justify-between rounded-xl border bg-background/60 p-3.5 text-sm font-medium hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">Autonomous Execution (+1.1)</p>
                    <p className="text-xs text-muted-foreground">Decisions take effect directly without mandatory prior human review.</p>
                  </div>
                  <Switch checked={isAutonomous} onCheckedChange={setIsAutonomous} />
                </label>

                <label className="flex items-center justify-between rounded-xl border bg-background/60 p-3.5 text-sm font-medium hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">Processes Personal Data / DPDP Scope (+0.8)</p>
                    <p className="text-xs text-muted-foreground">Processes Aadhaar, health, caste, income, or biometric information.</p>
                  </div>
                  <Switch checked={usesPersonalData} onCheckedChange={setUsesPersonalData} />
                </label>

                <label className="flex items-center justify-between rounded-xl border bg-background/60 p-3.5 text-sm font-medium hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">Affects Vulnerable Groups (+0.6)</p>
                    <p className="text-xs text-muted-foreground">Children, elderly, or marginalized demographics potentially impacted.</p>
                  </div>
                  <Switch checked={vulnerableGroups} onCheckedChange={setVulnerableGroups} />
                </label>

                <label className="flex items-center justify-between rounded-xl border bg-background/60 p-3.5 text-sm font-medium hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">State or National Deployment (+0.4)</p>
                    <p className="text-xs text-muted-foreground">Large-scale public rollout versus a small contained local district pilot.</p>
                  </div>
                  <Switch checked={nationalScale} onCheckedChange={setNationalScale} />
                </label>
              </div>
            </div>

            {/* Live Meter Card */}
            <div className="flex flex-col justify-between rounded-xl border bg-card p-6 shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Calculated Triage Posture
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${riskCalculation.color}`}>
                    {riskCalculation.tier} Risk Tier
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl font-bold text-foreground">
                    {riskCalculation.total}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 4.0 Max Score</span>
                </div>

                {/* Progress bar */}
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${riskCalculation.meterColor}`}
                    style={{ width: `${(riskCalculation.total / 4) * 100}%` }}
                  />
                </div>

                <div className="rounded-lg border bg-muted/30 p-3.5 space-y-1.5">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Recommended Governance Controls:
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    {riskCalculation.advice}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t mt-6 space-y-2">
                <p className="text-[11px] text-muted-foreground">
                  Try registering an actual AI model (such as a Crop Predictor or Student Triage tool) in the internal government workspace:
                </p>
                <Button asChild className="w-full gap-2">
                  <Link to="/gov/systems/new">
                    Register AI System in Gov Portal <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AUDIENCE PATHWAYS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Tailored Intelligence by Audience</h2>
          <p className="text-sm text-muted-foreground">
            Whether you are building AI solutions, applying for academic grants, or regulating deployments.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">Startups & Innovators</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Find compute subsidies, 10,000+ GPU infrastructure access under IndiaAI, and seed funds.
            </p>
            <Link to="/schemes" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              View Startup Schemes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">Students & Scholars</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore IndiaAI FutureSkills fellowships, research stipends, and open datasets on AIKosh.
            </p>
            <Link to="/schemes" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              Explore Fellowships <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">MSMEs & Industry</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Grants for adopting AI vision inspection, predictive maintenance, and credit-linked subsidies.
            </p>
            <Link to="/schemes" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              Browse MSME Grants <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">Government Officers</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Maintain an AI inventory, conduct risk audits, log incident containment, and check DPDP alignment.
            </p>
            <Link to="/gov" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
              Open Gov Workspace <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. TWO PORTAL SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Public Portal Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-card flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-saffron/20 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Public Portal
                </span>
                <span className="text-xs text-muted-foreground">Unauthenticated / Public Access</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">AI Scheme Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Search verified Central & State initiatives. Filter by target beneficiary, compute benefits, and verified status.
              </p>
              <ul className="space-y-2.5 text-sm text-foreground/90 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-saffron shrink-0" />
                  <span>Search 42 schemes across Agriculture, Health, Compute & Welfare</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-saffron shrink-0" />
                  <span>Official government portal links with last verification dates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-saffron shrink-0" />
                  <span>Interactive eligibility matching by age, income, and profession</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-saffron shrink-0" />
                  <span>Sahayak AI conversational assistant grounded in Supabase</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Button asChild size="lg" className="w-full gap-2">
                <Link to="/schemes">
                  Explore Scheme Directory <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Gov Portal Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-card flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                  Government Portal
                </span>
                <span className="text-xs text-muted-foreground">Role-Gated / Department Scope</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">AI Governance Workspace</h3>
              <p className="text-sm text-muted-foreground">
                Structured accountability for public-sector AI systems. Register use cases, triage risks, and log incidents.
              </p>
              <ul className="space-y-2.5 text-sm text-foreground/90 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Maintain an AI system inventory categorized by department</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Transparent 8-dimension risk triage with reviewer override capability</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Map controls against DPDP Act, India AI Guidelines, and NIST RMF</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Track AI failure incidents, containment actions, and audit events</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Button asChild variant="outline" size="lg" className="w-full gap-2">
                <Link to="/gov">
                  Enter Governance Workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ACADEMIC DISCLAIMER FOOTER */}
      <footer className="border-t bg-card/60 py-10 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © NAGSI — National AI Governance & Schemes Intelligence. Academic college major project prototype. Not affiliated with Government of India.
          </p>
          <div className="flex gap-4">
            <Link to="/frameworks" className="hover:underline">Frameworks</Link>
            <Link to="/schemes" className="hover:underline">Schemes</Link>
            <Link to="/assistant" className="hover:underline">Assistant</Link>
            <Link to="/gov" className="hover:underline">Gov Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
