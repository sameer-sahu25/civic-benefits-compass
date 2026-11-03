// Transparent, rules-based preliminary risk triage (not a legal classification).
export type RiskAnswers = {
  domain: "public_services" | "healthcare" | "welfare" | "law_enforcement" | "education" | "agriculture" | "other";
  automation: "assistive" | "decision_support" | "automated";
  personalData: boolean;
  sensitiveData: boolean;
  vulnerableGroups: boolean;
  humanOversight: boolean;
  explainable: boolean;
  scale: "small" | "district" | "state" | "national";
};

export type Tier = "low" | "medium" | "high" | "critical";

const DOMAIN: Record<RiskAnswers["domain"], number> = {
  law_enforcement: 25, welfare: 20, healthcare: 20, education: 12, public_services: 10, agriculture: 6, other: 5,
};
const AUTOMATION = { assistive: 0, decision_support: 10, automated: 20 } as const;
const SCALE = { small: 0, district: 4, state: 8, national: 12 } as const;

export function scoreRisk(a: RiskAnswers) {
  const dimensions = {
    impact_domain: DOMAIN[a.domain],
    autonomy: AUTOMATION[a.automation],
    privacy: (a.personalData ? 8 : 0) + (a.sensitiveData ? 8 : 0),
    fairness: a.vulnerableGroups ? 12 : 0,
    oversight: a.humanOversight ? 0 : 10,
    transparency: a.explainable ? 0 : 6,
    scale: SCALE[a.scale],
  };
  const total = Math.min(100, Object.values(dimensions).reduce((s, v) => s + v, 0));
  return { dimensions, total, tier: tierFor(total) };
}

export function tierFor(score: number): Tier {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}
