import { describe, it, expect } from "vitest";
import { scoreRisk, tierFor } from "./risk";

describe("risk tiers", () => {
  it("maps score thresholds", () => {
    expect(tierFor(24)).toBe("low");
    expect(tierFor(25)).toBe("medium");
    expect(tierFor(50)).toBe("high");
    expect(tierFor(75)).toBe("critical");
  });
  it("automated welfare system on vulnerable groups without oversight is critical", () => {
    const r = scoreRisk({
      domain: "welfare", automation: "automated", personalData: true, sensitiveData: true,
      vulnerableGroups: true, humanOversight: false, explainable: false, scale: "state",
    });
    expect(r.tier).toBe("critical");
  });
  it("assistive agriculture chatbot is low", () => {
    const r = scoreRisk({
      domain: "agriculture", automation: "assistive", personalData: false, sensitiveData: false,
      vulnerableGroups: false, humanOversight: true, explainable: true, scale: "district",
    });
    expect(r.total).toBe(10);
    expect(r.tier).toBe("low");
  });
});
