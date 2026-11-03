import { describe, it, expect } from "vitest";
import { matchScheme, type Profile, type SchemeRules } from "./eligibility";

const base: SchemeRules = { min_age: null, max_age: null, genders: [], max_annual_income: null, social_categories: [], occupations: [], residence: "any", requires_bpl: false, requires_disability: false };
const p: Profile = { age: 22, gender: "female", annualIncome: 200000, socialCategory: "sc", occupation: "student", residence: "rural", bpl: false, disability: false };

describe("eligibility match", () => {
  it("matches open scheme", () => expect(matchScheme(base, p).match).toBe(true));
  it("rejects over max age", () => expect(matchScheme({ ...base, max_age: 21 }, p).match).toBe(false));
  it("rejects income above limit", () => expect(matchScheme({ ...base, max_annual_income: 150000 }, p).match).toBe(false));
  it("rejects wrong gender", () => expect(matchScheme({ ...base, genders: ["male"] }, p).match).toBe(false));
  it("rejects wrong social category", () => expect(matchScheme({ ...base, social_categories: ["st"] }, p).match).toBe(false));
  it("requires BPL", () => expect(matchScheme({ ...base, requires_bpl: true }, p).match).toBe(false));
  it("rejects urban-only for rural user", () => expect(matchScheme({ ...base, residence: "urban" }, p).match).toBe(false));
});
