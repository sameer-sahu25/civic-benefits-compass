import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { schemesQuery } from "@/lib/queries";
import { matchScheme, type Profile } from "@/lib/eligibility";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  UserCheck,
  Building,
  Tag,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/eligibility")({
  head: () => ({
    meta: [
      { title: "Find Schemes For You — NAGSI Eligibility Finder" },
      {
        name: "description",
        content:
          "Enter your age, income, category, and occupation to see government yojanas and AI initiatives you may be eligible for.",
      },
      { property: "og:title", content: "Find Schemes For You — NAGSI" },
      {
        property: "og:description",
        content: "Discover government schemes matching your profile with transparent eligibility rules.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(schemesQuery),
  component: Eligibility,
});

const sel = "h-9 w-full rounded-lg border bg-card px-3 text-xs focus:ring-1 focus:ring-primary";

const PRESETS: { label: string; profile: Profile }[] = [
  {
    label: "Tech Startup Founder",
    profile: {
      age: 26,
      gender: "male",
      annualIncome: 600000,
      socialCategory: "general",
      occupation: "entrepreneur",
      residence: "urban",
      bpl: false,
      disability: false,
    },
  },
  {
    label: "College Student",
    profile: {
      age: 20,
      gender: "female",
      annualIncome: 180000,
      socialCategory: "obc",
      occupation: "student",
      residence: "urban",
      bpl: false,
      disability: false,
    },
  },
  {
    label: "Rural Farmer",
    profile: {
      age: 42,
      gender: "male",
      annualIncome: 120000,
      socialCategory: "general",
      occupation: "farmer",
      residence: "rural",
      bpl: true,
      disability: false,
    },
  },
  {
    label: "Artisan / MSME",
    profile: {
      age: 35,
      gender: "female",
      annualIncome: 250000,
      socialCategory: "sc",
      occupation: "worker",
      residence: "rural",
      bpl: false,
      disability: false,
    },
  },
];

function Eligibility() {
  const { data } = useSuspenseQuery(schemesQuery);
  const [p, setP] = useState<Profile>({
    age: null,
    gender: "",
    annualIncome: null,
    socialCategory: "",
    occupation: "",
    residence: "",
    bpl: false,
    disability: false,
  });

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));
  const num = (v: string) => (v === "" ? null : Number(v));

  const resetProfile = () => {
    setP({
      age: null,
      gender: "",
      annualIncome: null,
      socialCategory: "",
      occupation: "",
      residence: "",
      bpl: false,
      disability: false,
    });
  };

  const results = useMemo(() => data.map((s) => ({ s, ...matchScheme(s, p) })), [data, p]);
  const matches = results.filter((r) => r.match);
  const nonMatches = results.filter((r) => !r.match);

  const filledCount = [
    p.age != null,
    p.gender !== "",
    p.annualIncome != null,
    p.socialCategory !== "",
    p.occupation !== "",
    p.residence !== "",
    p.bpl,
    p.disability,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Title */}
      <div className="border-b pb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
          <UserCheck className="h-3.5 w-3.5" />
          Interactive Eligibility Matcher
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Find Schemes For You
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your profile details below to narrow down 42 schemes. No personal data is stored or submitted.
        </p>

        {/* Quick Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Try Demo Profile:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setP(preset.profile)}
              className="rounded-lg border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary hover:bg-primary/5 transition-all shadow-2xs"
            >
              {preset.label}
            </button>
          ))}
          {filledCount > 0 && (
            <button
              onClick={resetProfile}
              className="ml-auto inline-flex items-center gap-1 text-xs text-destructive hover:underline font-medium"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* Profile Controls Sidebar */}
        <aside className="h-fit space-y-5 rounded-2xl border bg-card p-5 shadow-card lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Your Profile Parameters
            </h2>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {filledCount} of 8 filled
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Age</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 24"
                value={p.age ?? ""}
                onChange={(e) => set("age", num(e.target.value))}
                className="h-9 text-xs bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Gender</Label>
              <select
                className={sel}
                value={p.gender}
                onChange={(e) => set("gender", e.target.value as Profile["gender"])}
              >
                <option value="">Any Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="transgender">Transgender</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Family Annual Income (₹)</Label>
            <Input
              type="number"
              min={0}
              placeholder="e.g. 300000"
              value={p.annualIncome ?? ""}
              onChange={(e) => set("annualIncome", num(e.target.value))}
              className="h-9 text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Social Category</Label>
            <select
              className={sel}
              value={p.socialCategory}
              onChange={(e) => set("socialCategory", e.target.value as Profile["socialCategory"])}
            >
              <option value="">Any Category</option>
              <option value="general">General</option>
              <option value="sc">SC (Scheduled Caste)</option>
              <option value="st">ST (Scheduled Tribe)</option>
              <option value="obc">OBC (Other Backward Class)</option>
              <option value="minority">Minority</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Occupation / Profession</Label>
            <select
              className={sel}
              value={p.occupation}
              onChange={(e) => set("occupation", e.target.value as Profile["occupation"])}
            >
              <option value="">Any Occupation</option>
              <option value="student">Student / Researcher</option>
              <option value="farmer">Farmer / Agri-worker</option>
              <option value="worker">Artisan / Vendor / Worker</option>
              <option value="entrepreneur">Startup / Business Owner</option>
              <option value="unemployed">Unemployed / Job Seeker</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Area of Residence</Label>
            <select
              className={sel}
              value={p.residence}
              onChange={(e) => set("residence", e.target.value as Profile["residence"])}
            >
              <option value="">Rural & Urban</option>
              <option value="rural">Rural (Village)</option>
              <option value="urban">Urban (City / Town)</option>
            </select>
          </div>

          <div className="pt-2 border-t space-y-3">
            <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
              <span>BPL / Ration card household</span>
              <Switch checked={p.bpl} onCheckedChange={(v) => set("bpl", v)} />
            </label>

            <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
              <span>Person with disability (PwD)</span>
              <Switch checked={p.disability} onCheckedChange={(v) => set("disability", v)} />
            </label>
          </div>
        </aside>

        {/* Results Stream */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <p className="text-lg font-bold text-foreground">
                <span className="font-display text-3xl font-extrabold text-primary mr-2">
                  {matches.length}
                </span>
                Potential Matches Identified
              </p>
              <p className="text-xs text-muted-foreground">
                {filledCount > 0
                  ? `Filtered across all 42 schemes based on your profile inputs.`
                  : `Showing all 42 schemes — adjust profile parameters on the left to filter.`}
              </p>
            </div>

            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs h-8">
              <Link to="/assistant">
                <Sparkles className="h-3.5 w-3.5 text-saffron" />
                Ask Sahayak to explain
              </Link>
            </Button>
          </div>

          {/* Matches Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map(({ s }) => (
              <div
                key={s.id}
                className="group flex flex-col justify-between rounded-xl border bg-card p-5 shadow-card hover:shadow-md transition-all duration-150 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 capitalize">
                      {s.level} Govt · {s.sector}
                    </span>
                    {s.is_demo && (
                      <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-destructive">
                        Demo
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    <Link to="/schemes/$slug" params={{ slug: s.slug }}>
                      {s.title}
                    </Link>
                  </h3>

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {s.benefits || s.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {s.beneficiary_types?.slice(0, 2).map((b) => (
                      <span
                        key={b}
                        className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground capitalize"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <Link
                    to="/schemes/$slug"
                    params={{ slug: s.slug }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-accent transition-colors"
                  >
                    <span>View Scheme</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Expandable Non-Matches */}
          {filledCount > 0 && nonMatches.length > 0 && (
            <div className="rounded-xl border bg-card/60 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">
                  Why {nonMatches.length} schemes did not match your inputs
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                These schemes have specific criteria (such as income limits or required categories) that did not align with your current selections:
              </p>
              <div className="divide-y max-h-72 overflow-y-auto pr-2 text-xs">
                {nonMatches.map(({ s, reasons }) => (
                  <div key={s.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-semibold text-foreground">{s.title}</span>
                    <span className="text-muted-foreground italic sm:text-right">
                      {reasons.join(" · ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
