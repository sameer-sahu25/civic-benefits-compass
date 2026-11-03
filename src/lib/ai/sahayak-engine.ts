import { FRAMEWORKS, type Framework } from "../frameworks";

export interface SchemeRecord {
  slug: string;
  title: string;
  ministry?: string;
  level?: string;
  state_name?: string | null;
  sector?: string;
  category?: string;
  beneficiary_types?: string[];
  summary?: string;
  eligibility?: string;
  benefits?: string;
  official_url?: string | null;
  last_verified?: string | null;
  is_demo?: boolean;
  min_age?: number | null;
  max_age?: number | null;
  genders?: string[];
  max_annual_income?: number | null;
  social_categories?: string[];
  occupations?: string[];
  residence?: string;
  requires_bpl?: boolean;
  requires_disability?: boolean;
}

/**
 * Generate a comprehensive, grounded markdown response answering the user's prompt
 * using live Supabase scheme records and published AI governance frameworks.
 */
export function generateSahayakResponse(
  userQuery: string,
  schemes: SchemeRecord[],
  conversationHistory: { role: string; content: string }[] = [],
): string {
  const query = userQuery.toLowerCase().trim();

  // 1. Check for AI Governance, Frameworks, and Laws
  const isGovernanceQuery =
    query.includes("governance") ||
    query.includes("framework") ||
    query.includes("dpdp") ||
    query.includes("privacy") ||
    query.includes("guideline") ||
    query.includes("nist") ||
    query.includes("iso") ||
    query.includes("oecd") ||
    query.includes("eu ai act") ||
    query.includes("law") ||
    query.includes("regulation");

  const isRiskQuery =
    query.includes("risk") ||
    query.includes("triage") ||
    query.includes("score") ||
    query.includes("assessment") ||
    query.includes("tier");

  if (isGovernanceQuery && !query.includes("scheme")) {
    return buildGovernanceResponse(query);
  }

  if (isRiskQuery && !query.includes("scheme")) {
    return buildRiskTriageResponse();
  }

  // 2. Keyword & semantic matching across Supabase schemes
  const matched = searchSchemes(query, schemes);

  if (matched.length > 0) {
    return buildSchemeMatchesResponse(query, matched);
  }

  // 3. Fallback greeting or general guidance
  if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query === "help") {
    return buildGreetingResponse(schemes);
  }

  // 4. Default intelligent response with suggested schemes
  return buildGeneralHelpResponse(query, schemes);
}

function searchSchemes(query: string, schemes: SchemeRecord[]): SchemeRecord[] {
  const terms = query
    .replace(/[?,.!]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scores = schemes.map((s) => {
    let score = 0;
    const text = [
      s.title,
      s.summary,
      s.sector,
      s.category,
      s.eligibility,
      s.benefits,
      s.ministry,
      ...(s.beneficiary_types ?? []),
      ...(s.occupations ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // Specific high-intent mappings
    if ((query.includes("compute") || query.includes("gpu")) && s.slug === "indiaai-mission") score += 50;
    if ((query.includes("fellowship") || query.includes("research") || query.includes("student")) && s.slug === "indiaai-fellowship") score += 40;
    if ((query.includes("data") || query.includes("dataset")) && s.slug === "aikosh") score += 40;
    if (query.includes("startup") && (s.slug === "startup-india-seed" || s.slug === "indiaai-mission" || s.slug === "stand-up-india")) score += 30;
    if (query.includes("msme") && (s.slug === "demo-msme-ai-adoption" || s.slug === "pmegp" || s.slug === "pm-mudra")) score += 30;
    if ((query.includes("farmer") || query.includes("agri")) && (s.slug.includes("kisan") || s.slug.includes("agri") || s.slug === "pm-kusum" || s.slug === "pmfby")) score += 30;
    if ((query.includes("health") || query.includes("hospital")) && (s.slug === "ayushman-bharat" || s.slug === "demo-ka-health-ai")) score += 30;
    if ((query.includes("solar") || query.includes("electricity") || query.includes("bijli")) && s.slug === "pm-surya-ghar") score += 30;
    if ((query.includes("internship") || query.includes("intern")) && s.slug === "pm-internship") score += 30;
    if ((query.includes("scholarship") || query.includes("sc") || query.includes("st") || query.includes("girl")) && s.slug.includes("scholarship") || s.slug.includes("post-matric") || s.slug.includes("pragati")) score += 25;

    // Direct title or slug match
    if (text.includes(query)) score += 20;

    for (const term of terms) {
      if (s.title.toLowerCase().includes(term)) score += 10;
      if (s.beneficiary_types?.some((b) => b.toLowerCase().includes(term))) score += 8;
      if (s.sector?.toLowerCase().includes(term)) score += 6;
      if (s.summary?.toLowerCase().includes(term)) score += 4;
      if (text.includes(term)) score += 2;
    }

    return { scheme: s, score };
  });

  return scores
    .filter((item) => item.score > 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.scheme);
}

function buildSchemeMatchesResponse(query: string, matches: SchemeRecord[]): string {
  const lines: string[] = [];
  lines.push(`Based on the NAGSI directory, here are **${matches.length} relevant schemes** for your query:`);
  lines.push("");

  for (const s of matches) {
    const isDemo = s.is_demo;
    const demoTag = isDemo ? " *(DEMO — NOT A REAL GOVERNMENT SCHEME)*" : "";
    lines.push(`### [${s.title}](/schemes/${s.slug})${demoTag}`);
    lines.push(`- **Authority / Ministry:** ${s.ministry || s.level || "Central"}`);
    lines.push(`- **Sector & Target:** ${s.sector || "General"} · ${s.beneficiary_types?.join(", ") || "Citizens"}`);
    lines.push(`- **Summary:** ${s.summary || "Government initiative providing financial and operational support."}`);
    if (s.benefits) {
      lines.push(`- **Key Benefits:** ${s.benefits}`);
    }
    if (s.eligibility) {
      lines.push(`- **Eligibility:** ${s.eligibility}`);
    }
    if (s.official_url && !isDemo) {
      lines.push(`- **Official Source:** [Visit Official Portal](${s.official_url}) · Verified: ${s.last_verified || "Recent"}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("> **Academic Notice & Disclaimer:**");
  lines.push("> These are potential matches identified from verified scheme listings. Official eligibility determination and actual applications must be completed on each initiative's official government portal. You can also explore personal filters in the [/eligibility](/eligibility) finder.");

  return lines.join("\n");
}

function buildGovernanceResponse(query: string): string {
  const lines: string[] = [];
  lines.push("### Primary AI Governance & Policy Frameworks");
  lines.push("NAGSI maps governance controls and risk requirements to official Indian and international standards:");
  lines.push("");

  for (const f of FRAMEWORKS) {
    lines.push(`#### [${f.name}](${f.url}) (${f.publisher})`);
    lines.push(`- **Region:** ${f.region}`);
    lines.push(`- **Summary:** ${f.summary}`);
    lines.push(`- **Key Governance Pillars:**`);
    for (const kp of f.keyPoints.slice(0, 4)) {
      lines.push(`  * ${kp}`);
    }
    lines.push(`- **Official Reference:** [${f.url}](${f.url})`);
    lines.push("");
  }

  lines.push("---");
  lines.push("You can inspect the full framework mapping and applicable controls at [/frameworks](/frameworks).");
  return lines.join("\n");
}

function buildRiskTriageResponse(): string {
  return `### NAGSI Explainable AI Risk Triage Architecture

NAGSI calculates preliminary risk triage for registered government AI systems using a transparent, rules-based weighted engine across **8 key dimensions** (0–4 scale):

| Dimension | Weight | Focus Area |
|---|---|---|
| **Impact on Public Services** | 20% | Critical rights, denial of service, essential welfare |
| **Automation Level** | 15% | Assistive vs. decision support vs. autonomous |
| **Privacy & Data Sensitivity** | 15% | DPDP Act compliance, personal & sensitive personal data |
| **Fairness & Non-Discrimination** | 15% | Group parity, historical bias, disparate impact |
| **Transparency & Contestability** | 10% | Explainability to citizens, appeal mechanisms |
| **Security & Robustness** | 10% | Adversarial vulnerability, prompt injection, data integrity |
| **Scale of Deployment** | 10% | District vs. State vs. National scope |
| **Reversibility of Harm** | 5% | Speed and ease of rectifying incorrect outputs |

#### Triage Bands:
- **Low (0.00 – 0.99):** Informational / assistive systems with full human oversight.
- **Moderate (1.00 – 1.99):** Meaningful decision support; requires documented governance controls.
- **High (2.00 – 2.99):** High-stakes public impact; requires independent audit, bias testing, and DPIA.
- **Critical Review (3.00 – 4.00):** Severe impact; sandbox piloting and mandatory human reviewer override.

*Note: Risk scores are explainable triage aids, not legal compliance certifications.* You can register and assess a system at [/gov/systems/new](/gov/systems/new).`;
}

function buildGreetingResponse(schemes: SchemeRecord[]): string {
  const aiSchemes = schemes.filter((s) => s.slug.includes("ai") || s.sector === "Cross-sector" || s.is_demo).slice(0, 4);
  const lines: string[] = [];
  lines.push("### Namaste! I am Sahayak, your NAGSI AI Scheme Assistant.");
  lines.push("I can help you navigate India's government AI initiatives, compute subsidies, research fellowships, startup funding, and governance guidelines.");
  lines.push("");
  lines.push("Here are some ways I can assist you today:");
  lines.push("1. **Find Schemes for Your Profile:** Ask about opportunities for students, researchers, startups, MSMEs, or farmers.");
  lines.push("2. **AI Infrastructure & Compute:** Inquire about GPU access under the IndiaAI Mission.");
  lines.push("3. **Governance & Legal Standards:** Understand the DPDP Act 2023, India AI Governance Guidelines, and NIST AI RMF.");
  lines.push("4. **Risk Triage:** Learn how AI systems are evaluated across fairness, privacy, and impact.");
  lines.push("");
  lines.push("#### Quick Highlighted Initiatives:");
  for (const s of aiSchemes) {
    lines.push(`- **[${s.title}](/schemes/${s.slug})** — ${s.summary?.slice(0, 95)}...`);
  }
  lines.push("");
  lines.push("Feel free to ask a question or try one of the prompt suggestions below!");
  return lines.join("\n");
}

function buildGeneralHelpResponse(query: string, schemes: SchemeRecord[]): string {
  const topSchemes = schemes.slice(0, 3);
  const lines: string[] = [];
  lines.push(`I searched the NAGSI database for: *"${query}"*.`);
  lines.push("");
  lines.push("While I didn't find an exact keyword match, here are some of the most popular national and AI schemes available:");
  lines.push("");
  for (const s of topSchemes) {
    lines.push(`- **[${s.title}](/schemes/${s.slug})** (${s.sector || "General"}): ${s.summary || ""}`);
  }
  lines.push("");
  lines.push("💡 **Tips:**");
  lines.push("- Try asking by target beneficiary: *'AI fellowships for students'*, *'GPU compute for startups'*, or *'MSME technology grants'*.");
  lines.push("- Use the [/schemes](/schemes) page to browse the complete directory with sector filters.");
  lines.push("- Use the [/eligibility](/eligibility) tool to check schemes matching your age, occupation, and state.");
  return lines.join("\n");
}

