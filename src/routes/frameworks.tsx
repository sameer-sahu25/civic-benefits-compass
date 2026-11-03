import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { FRAMEWORKS, type Framework } from "@/lib/frameworks";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Scale,
  Sparkles,
  Building2,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/frameworks")({
  head: () => ({
    meta: [
      { title: "AI Governance Frameworks & Primary Sources — NAGSI" },
      {
        name: "description",
        content:
          "India AI Governance Guidelines 2025, DPDP Act 2023, IndiaAI Mission, NIST AI RMF, OECD, ISO/IEC 42001, and EU AI Act.",
      },
      { property: "og:title", content: "AI Governance Frameworks & Sources — NAGSI" },
      {
        property: "og:description",
        content:
          "The primary policy sources and guidelines NAGSI maps its governance controls to.",
      },
    ],
  }),
  component: Frameworks,
});

const REGIONS = ["All", "India", "Global", "US", "EU"] as const;

function Frameworks() {
  const [selectedRegion, setSelectedRegion] = useState<typeof REGIONS[number]>("All");

  const list = useMemo(() => {
    if (selectedRegion === "All") return FRAMEWORKS;
    return FRAMEWORKS.filter((f) => f.region === selectedRegion);
  }, [selectedRegion]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Policy & Control Mapping Library
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI Governance Frameworks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Official policy sources NAGSI maps its risk triage and recommended controls to. Guidance and academic decision-support only — not statutory legal certification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs h-8">
            <Link to="/gov">
              <Building2 className="h-3.5 w-3.5" />
              View Gov Controls
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5 text-xs h-8 bg-saffron text-saffron-foreground hover:bg-saffron/90">
            <Link to="/assistant">
              <Sparkles className="h-3.5 w-3.5" />
              Ask Sahayak
            </Link>
          </Button>
        </div>
      </div>

      {/* Region Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground mr-1">Jurisdiction:</span>
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
              selectedRegion === r
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-foreground"
            }`}
          >
            {r === "India" ? "🇮🇳 India (Primary)" : r}
          </button>
        ))}
      </div>

      {/* Frameworks Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {list.map((f) => (
          <article
            key={f.id}
            className="flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-card hover:shadow-lg transition-all duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  {f.region} · {f.publisher}
                </span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Verified Source
                </span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {f.name}
              </h2>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {f.summary}
              </p>

              {/* Key Points */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-2">
                  Key Principles & Requirements:
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {f.keyPoints.map((k) => (
                    <li key={k} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-saffron shrink-0 mt-0.5" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-6 pt-4 border-t flex items-center justify-between">
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                <span>Read Official Source</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <Link
                to="/gov/systems/new"
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>Apply in Triage</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Educational Callout on DPDP Act & Indian AI Guidelines */}
      <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold text-base">
          <BookOpen className="h-5 w-5 text-saffron" />
          How NAGSI Applies These Frameworks in Government AI Deployments
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          In public administration, an AI system should not be deployed based solely on model accuracy. NAGSI maps requirements from the <strong>Digital Personal Data Protection Act (DPDP 2023)</strong> and the <strong>India AI Governance Guidelines (2025)</strong> into actionable checkpoints:
        </p>
        <div className="grid gap-3 sm:grid-cols-3 pt-2 text-xs">
          <div className="rounded-xl border bg-card p-3.5 space-y-1">
            <p className="font-semibold text-foreground">Do No Harm & Plain Language</p>
            <p className="text-muted-foreground text-[11px]">
              Every registered AI model must provide a citizen-understandable explanation and appeal channel.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-3.5 space-y-1">
            <p className="font-semibold text-foreground">Data Minimisation & DPIA</p>
            <p className="text-muted-foreground text-[11px]">
              High-risk models processing sensitive personal data require a Data Protection Impact Assessment.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-3.5 space-y-1">
            <p className="font-semibold text-foreground">Human-in-the-Loop Override</p>
            <p className="text-muted-foreground text-[11px]">
              Autonomous execution without an authorized officer's oversight triggers an elevated triage tier.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
