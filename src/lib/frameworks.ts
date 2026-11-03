import type { RiskAnswers, Tier } from "./risk";

export type Framework = { id: string; name: string; publisher: string; region: "India" | "Global" | "EU" | "US"; url: string; summary: string; keyPoints: string[] };

export const FRAMEWORKS: Framework[] = [
  {
    id: "india-ai-gov", name: "India AI Governance Guidelines (2025)", publisher: "MeitY / IndiaAI Mission (PIB)", region: "India",
    url: "https://www.pib.gov.in/PressReleaseshare.aspx?PRID=2186639",
    summary: "Framework for safe, inclusive and responsible AI adoption across sectors, guided by 'Do No Harm' and reuse of existing laws.",
    keyPoints: ["Seven guiding principles (Sutras)", "Recommendations across six governance pillars", "Short/medium/long-term action plan", "Practical guidance for industry, developers and regulators", "Innovation sandboxes with risk mitigation"],
  },
  {
    id: "psa-ai-mission", name: "IndiaAI Mission & national AI initiatives", publisher: "Office of the Principal Scientific Adviser", region: "India",
    url: "https://psa.gov.in/ai-mission",
    summary: "Cabinet-approved (7 Mar 2024) mission to democratise compute, improve data quality, build indigenous AI and ensure ethical use.",
    keyPoints: ["Compute capacity", "Innovation Centre & indigenous models", "Datasets platform (AIKosh)", "Application development", "FutureSkills", "Startup financing", "Safe & Trusted AI"],
  },
  {
    id: "dpdp", name: "DPDP Act 2023 & DPDP Rules 2025", publisher: "MeitY (PIB)", region: "India",
    url: "https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=156054",
    summary: "India's personal data protection law: consent, purpose limitation, minimisation, security and accountability for Data Fiduciaries.",
    keyPoints: ["Clear, separate consent notice for each purpose", "Breach notification to affected individuals and the Board without delay", "Access/correction/erasure requests answered within 90 days", "Verifiable parental consent for children's data", "Significant Data Fiduciaries: independent audits & impact assessments", "Penalties up to ₹250 crore", "18-month phased compliance"],
  },
  {
    id: "nist-rmf", name: "NIST AI Risk Management Framework (AI RMF 1.0)", publisher: "NIST, USA", region: "US",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    summary: "Voluntary framework to manage AI risks through four functions: Govern, Map, Measure, Manage.",
    keyPoints: ["Govern: policies, roles, accountability", "Map: context, intended use, impacts", "Measure: test bias, robustness, explainability", "Manage: prioritise, treat and monitor risks"],
  },
  {
    id: "oecd", name: "OECD AI Principles", publisher: "OECD", region: "Global",
    url: "https://oecd.ai/en/ai-principles",
    summary: "Intergovernmental principles for trustworthy AI that respects human rights and democratic values.",
    keyPoints: ["Inclusive growth & well-being", "Human rights, fairness & privacy", "Transparency & explainability", "Robustness, security & safety", "Accountability"],
  },
  {
    id: "iso-42001", name: "ISO/IEC 42001 — AI Management System", publisher: "ISO / IEC", region: "Global",
    url: "https://www.iso.org/standard/81230.html",
    summary: "Certifiable management-system standard for organisations that develop or use AI.",
    keyPoints: ["AI policy & leadership commitment", "AI risk and impact assessment", "Lifecycle controls & documentation", "Continual improvement and internal audit"],
  },
  {
    id: "eu-ai-act", name: "EU AI Act", publisher: "European Commission", region: "EU",
    url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    summary: "Risk-based regulation: unacceptable, high, limited (transparency) and minimal risk tiers. Used here as an international reference only.",
    keyPoints: ["Prohibited practices (e.g. social scoring)", "High-risk: risk management, data governance, logging, human oversight", "Transparency duties for chatbots/generated content", "Conformity assessment for high-risk systems"],
  },
];

export type Control = { framework: string; text: string };

/** Controls recommended for a system, derived from its answers and tier. Reference guidance, not legal advice. */
export function applicableControls(a: RiskAnswers, tier: Tier): Control[] {
  const c: Control[] = [
    { framework: "india-ai-gov", text: "Apply 'Do No Harm' review and document intended use" },
    { framework: "nist-rmf", text: "Map context and impacts; assign accountable owner (Govern/Map)" },
    { framework: "oecd", text: "Publish a plain-language transparency note" },
  ];
  if (a.personalData || a.sensitiveData) {
    c.push(
      { framework: "dpdp", text: "Issue a clear, purpose-specific consent notice" },
      { framework: "dpdp", text: "Set up breach notification and a data-protection contact" },
      { framework: "dpdp", text: "Handle access/correction/erasure requests within 90 days" },
    );
  }
  if (a.vulnerableGroups) {
    c.push({ framework: "nist-rmf", text: "Measure bias across affected groups before deployment" });
    c.push({ framework: "dpdp", text: "Verify parental/guardian consent where children or dependants are involved" });
  }
  if (!a.humanOversight) c.push({ framework: "eu-ai-act", text: "Add meaningful human oversight before decisions take effect" });
  if (!a.explainable) c.push({ framework: "oecd", text: "Provide explanations citizens can understand and contest" });
  if (tier === "high" || tier === "critical") {
    c.push(
      { framework: "iso-42001", text: "Run a formal AI impact assessment and keep lifecycle records" },
      { framework: "eu-ai-act", text: "Treat as high-risk: logging, data governance, conformity-style review" },
      { framework: "dpdp", text: "Independent audit and DPIA (as for Significant Data Fiduciaries)" },
    );
  }
  if (tier === "critical") c.push({ framework: "india-ai-gov", text: "Pilot in a sandbox with senior sign-off before scale-up" });
  return c;
}

export const frameworkName = (id: string) => FRAMEWORKS.find((f) => f.id === id)?.name ?? id;
