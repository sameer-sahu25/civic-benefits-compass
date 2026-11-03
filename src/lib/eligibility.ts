// Rule-based "potential match" check — never confirmed eligibility.
export type Profile = {
  age: number | null;
  gender: "male" | "female" | "transgender" | "";
  annualIncome: number | null;
  socialCategory: "general" | "sc" | "st" | "obc" | "minority" | "";
  occupation: "student" | "farmer" | "worker" | "entrepreneur" | "unemployed" | "other" | "";
  residence: "rural" | "urban" | "";
  bpl: boolean;
  disability: boolean;
};

export type SchemeRules = {
  min_age: number | null;
  max_age: number | null;
  genders: string[];
  max_annual_income: number | null;
  social_categories: string[];
  occupations: string[];
  residence: string;
  requires_bpl: boolean;
  requires_disability: boolean;
};

export function matchScheme(s: SchemeRules, p: Profile): { match: boolean; reasons: string[] } {
  const fails: string[] = [];
  if (p.age != null) {
    if (s.min_age != null && p.age < s.min_age) fails.push(`Minimum age ${s.min_age}`);
    if (s.max_age != null && p.age > s.max_age) fails.push(`Maximum age ${s.max_age}`);
  }
  if (s.genders.length && p.gender && !s.genders.includes(p.gender)) fails.push(`Only for ${s.genders.join("/")}`);
  if (s.max_annual_income != null && p.annualIncome != null && p.annualIncome > s.max_annual_income)
    fails.push(`Income up to ₹${s.max_annual_income.toLocaleString("en-IN")}`);
  if (s.social_categories.length && p.socialCategory && !s.social_categories.includes(p.socialCategory))
    fails.push(`Only for ${s.social_categories.map((c) => c.toUpperCase()).join("/")}`);
  if (s.occupations.length && p.occupation && !s.occupations.includes(p.occupation)) fails.push(`For ${s.occupations.join("/")}`);
  if (s.residence !== "any" && p.residence && s.residence !== p.residence) fails.push(`${s.residence} areas only`);
  if (s.requires_bpl && !p.bpl) fails.push("BPL / poor household required");
  if (s.requires_disability && !p.disability) fails.push("For persons with disability");
  return { match: fails.length === 0, reasons: fails };
}
