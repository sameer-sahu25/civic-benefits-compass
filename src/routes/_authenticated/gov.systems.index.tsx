import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { systemsQuery } from "@/lib/queries";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusCircle,
  Search,
  Filter,
  Database,
  Building,
  CheckCircle2,
  Users,
  AlertTriangle,
  X,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/gov/systems/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(systemsQuery),
  component: Registry,
});

const DOMAINS = [
  "All Domains",
  "public_services",
  "healthcare",
  "welfare",
  "education",
  "agriculture",
  "law_enforcement",
  "other",
];

const TIERS = ["all", "low", "medium", "high", "critical"] as const;

function Registry() {
  const { data } = useSuspenseQuery(systemsQuery);
  const [q, setQ] = useState("");
  const [domainFilter, setDomainFilter] = useState("All Domains");
  const [tierFilter, setTierFilter] = useState<typeof TIERS[number]>("all");

  const filteredSystems = useMemo(() => {
    return data.filter((s) => {
      // Domain
      if (domainFilter !== "All Domains" && s.domain !== domainFilter) return false;

      // Tier
      if (tierFilter !== "all" && s.risk_tier !== tierFilter) return false;

      // Query
      if (q.trim()) {
        const hay = `${s.name} ${s.purpose} ${s.departments?.name || ""} ${s.affected_population || ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }

      return true;
    });
  }, [data, q, domainFilter, tierFilter]);

  const resetFilters = () => {
    setQ("");
    setDomainFilter("All Domains");
    setTierFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            AI System Inventory & Registry
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, inspect risk triage scores, and manage registered public-sector models.
          </p>
        </div>

        <Button asChild className="gap-2 bg-saffron text-saffron-foreground hover:bg-saffron/90 font-semibold shadow-xs">
          <Link to="/gov/systems/new">
            <PlusCircle className="h-4 w-4" />
            Register AI System
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search AI system name, purpose, or department..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-10 bg-card text-sm rounded-xl"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Domain Filter */}
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="h-10 rounded-xl border bg-card px-3 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary shadow-xs"
        >
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d === "All Domains" ? "All Domains" : d.replace("_", " ")}
            </option>
          ))}
        </select>

        {/* Tier Filter */}
        <div className="flex rounded-xl border bg-card p-1 shadow-xs">
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                tierFilter === t
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-bold">AI System & Purpose</TableHead>
              <TableHead className="font-bold">Department</TableHead>
              <TableHead className="font-bold">Domain</TableHead>
              <TableHead className="font-bold">Automation Level</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-right">Score</TableHead>
              <TableHead className="font-bold text-center">Triage Tier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSystems.map((s) => (
              <TableRow key={s.id} className="hover:bg-muted/20 transition-colors">
                <TableCell className="max-w-xs">
                  <p className="font-bold text-foreground text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.purpose}</p>
                  {s.affected_population && (
                    <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3 text-primary" />
                      <span>{s.affected_population}</span>
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{s.departments?.name ?? "General Administration"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs capitalize font-medium">
                  {s.domain.replace("_", " ")}
                </TableCell>
                <TableCell className="text-xs capitalize text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-0.5">
                    {s.automation_level.replace("_", " ")}
                  </span>
                </TableCell>
                <TableCell className="text-xs capitalize font-medium">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        s.status === "approved" || s.status === "live"
                          ? "bg-emerald-500"
                          : "bg-amber-500 animate-pulse"
                      }`}
                    />
                    {s.status.replace("_", " ")}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-mono font-bold text-right">
                  {s.risk_score ? `${s.risk_score}` : "—"}
                </TableCell>
                <TableCell className="text-center">
                  <RiskBadge tier={s.risk_tier} />
                </TableCell>
              </TableRow>
            ))}

            {filteredSystems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <div className="space-y-2">
                    <Database className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-semibold">No AI systems match your search</p>
                    <p className="text-xs text-muted-foreground">
                      Try clearing your search terms or register a new public-sector system.
                    </p>
                    <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2 text-xs">
                      Reset filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
