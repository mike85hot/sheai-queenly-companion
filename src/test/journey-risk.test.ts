import { describe, expect, it } from "vitest";
import { assessJourney } from "@/lib/journey-risk";

describe("assessJourney", () => {
  it("rates a daytime shared car trip with company as low", () => {
    const risk = assessJourney({ hour: 14, transport: "car", alone: false, familiar: true, lowBattery: false, shared: true });
    expect(risk.level).toBe("low");
    expect(risk.score).toBeLessThan(30);
  });

  it("rates a late-night solo walk on an unfamiliar route as high", () => {
    const risk = assessJourney({ hour: 23, transport: "walk", alone: true, familiar: false, lowBattery: false, shared: false });
    expect(risk.level).toBe("high");
    expect(risk.factors).toContain("It's late at night");
    expect(risk.factors).toContain("You're travelling alone");
    expect(risk.factors).toContain("You don't know this route well");
  });

  it("shares the trip when nobody is following", () => {
    const risk = assessJourney({ hour: 12, transport: "transit", alone: true, familiar: true, lowBattery: false, shared: false });
    expect(risk.actions[0]).toBe("Share your trip on Walk Me Home so a trusted contact can follow along");
  });

  it("suggests a Safe Exit Call for a late solo trip", () => {
    const risk = assessJourney({ hour: 22, transport: "rideshare", alone: true, familiar: true, lowBattery: false, shared: true });
    expect(risk.actions.some((a) => a.startsWith("Schedule a Safe Exit Call"))).toBe(true);
  });

  it("flags a low battery", () => {
    const risk = assessJourney({ hour: 12, transport: "car", alone: false, familiar: true, lowBattery: true, shared: true });
    expect(risk.factors).toContain("Your phone battery is low");
    expect(risk.actions.some((a) => a.startsWith("Charge your phone"))).toBe(true);
  });

  it("scores a shared trip 15 points lower than the same unshared trip", () => {
    const base = { hour: 20, transport: "transit" as const, alone: true, familiar: false, lowBattery: false };
    const shared = assessJourney({ ...base, shared: true });
    const unshared = assessJourney({ ...base, shared: false });
    expect(unshared.score - shared.score).toBe(15);
  });

  it("never leaves the 0-100 range", () => {
    const best = assessJourney({ hour: 12, transport: "car", alone: false, familiar: true, lowBattery: false, shared: true });
    const worst = assessJourney({ hour: 23, transport: "walk", alone: true, familiar: false, lowBattery: true, shared: false });
    expect(best.score).toBeGreaterThanOrEqual(0);
    expect(worst.score).toBeLessThanOrEqual(100);
  });
});
