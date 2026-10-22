import { describe, expect, it } from "vitest";
import { countriesByRegion, countryFromLocale, emergencyCountries } from "@/lib/emergency-contacts";

describe("Country-specific emergency dialing", () => {
  it.each([
    ["NG", "112"], ["IN", "112"], ["KE", "999"], ["ZA", "112"],
    ["GB", "999"], ["US", "911"], ["CA", "911"], ["PH", "911"], ["PK", "15"],
  ])("uses the source-verified primary number for %s", (code, number) => {
    expect(emergencyCountries.find((c) => c.code === code)?.emergency[0]?.tel).toBe(number);
  });
  it("does not guess a physical country from language-only or unsupported locales", () => {
    expect(countryFromLocale("en")).toBeUndefined();
    expect(countryFromLocale("fr-FR")).toBeUndefined();
    expect(countryFromLocale("not a locale")).toBeUndefined();
  });
  it("can suggest a supported locale region without making it a confirmed selection", () => {
    expect(countryFromLocale("en-NG")).toBe("NG");
    expect(countryFromLocale("hi-IN")).toBe("IN");
  });
  it("keeps South African ambulance and police lines separate", () => {
    const contacts = emergencyCountries.find((c) => c.code === "ZA")?.emergency;
    expect(contacts?.find((c) => c.name === "Police")?.tel).toBe("10111");
    expect(contacts?.find((c) => c.name === "Ambulance")?.tel).toBe("10177");
  });
  it("groups every verified country under a region for the landing page", () => {
    const groups = countriesByRegion();
    expect(groups.map((g) => g.region)).toEqual(["Africa", "Asia", "Europe", "Americas"]);
    expect(groups.reduce((n, g) => n + g.countries.length, 0)).toBe(emergencyCountries.length);
    expect(groups.find((g) => g.region === "Africa")?.countries.map((c) => c.name)).toEqual(["Kenya", "Nigeria", "South Africa"]);
  });
});