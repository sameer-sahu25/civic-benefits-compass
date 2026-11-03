import { describe, it, expect } from "vitest";
import { applicableControls } from "./frameworks";
import type { RiskAnswers } from "./risk";

const base: RiskAnswers = { domain: "agriculture", automation: "assistive", personalData: false, sensitiveData: false, vulnerableGroups: false, humanOversight: true, explainable: true, scale: "district" };

describe("applicable controls", () => {
  it("no DPDP controls without personal data", () => {
    expect(applicableControls(base, "low").some((c) => c.framework === "dpdp")).toBe(false);
  });
  it("personal data triggers DPDP controls", () => {
    expect(applicableControls({ ...base, personalData: true }, "low").some((c) => c.framework === "dpdp")).toBe(true);
  });
  it("high tier triggers ISO 42001 and EU AI Act controls", () => {
    const ids = applicableControls(base, "high").map((c) => c.framework);
    expect(ids).toContain("iso-42001");
    expect(ids).toContain("eu-ai-act");
  });
});
