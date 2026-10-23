export type Transport = "walk" | "transit" | "rideshare" | "car";

export type JourneyCheck = {
  /** Local hour 0-23 at departure. */
  hour: number;
  transport: Transport;
  alone: boolean;
  /** True when the user knows the route or neighbourhood well. */
  familiar: boolean;
  /** True when phone battery is below ~20%. */
  lowBattery: boolean;
  /** True when someone is already following the trip (shared link or check-in agreed). */
  shared: boolean;
};

export type RiskLevel = "low" | "moderate" | "elevated" | "high";

export type JourneyRisk = {
  /** 0 (calm) to 100 (worst combination of signals). Contextual guidance, not a crime prediction. */
  score: number;
  level: RiskLevel;
  factors: string[];
  actions: string[];
};

// Rule-based contextual signals only — time, transport, company, familiarity, battery.
// Deliberately NOT crime data or AI prediction; the wording everywhere must reflect that.
export function assessJourney(c: JourneyCheck): JourneyRisk {
  let score = 20;
  const factors: string[] = [];
  if (c.transport === "walk") { score += 20; factors.push("Walking keeps you exposed the longest"); }
  else if (c.transport === "transit") { score += 10; factors.push("Public transit runs on fixed stops and schedules"); }
  else if (c.transport === "rideshare") { score += 10; factors.push("A rideshare means travelling with a stranger"); }
  if (c.hour >= 22 || c.hour < 5) { score += 25; factors.push("It's late at night"); }
  else if (c.hour === 21 || c.hour === 5) { score += 10; factors.push("It's getting dark or very early"); }
  if (c.alone) { score += 15; factors.push("You're travelling alone"); }
  if (!c.familiar) { score += 15; factors.push("You don't know this route well"); }
  if (c.lowBattery) { score += 10; factors.push("Your phone battery is low"); }
  if (c.shared) score -= 15;
  score = Math.max(0, Math.min(100, score));
  const level: RiskLevel = score < 30 ? "low" : score < 55 ? "moderate" : score < 75 ? "elevated" : "high";
  const actions: string[] = [];
  if (!c.shared) actions.push("Share your trip on Walk Me Home so a trusted contact can follow along");
  if (c.alone && (c.hour >= 21 || c.hour < 5)) actions.push("Schedule a Safe Exit Call now so you have an easy way out");
  if (c.lowBattery) actions.push("Charge your phone first — a dead phone cuts off every safety tool");
  if (!c.familiar) actions.push("Preview the route in your map app before you set off");
  actions.push("Set your safe and duress codewords in your profile for a stealth check-in");
  return { score, level, factors, actions };
}

export const levelCopy: Record<RiskLevel, { label: string; blurb: string }> = {
  low: { label: "Looks calm", blurb: "Conditions look good. Keep your trip shared anyway — it costs nothing." },
  moderate: { label: "Take a little care", blurb: "A few conditions add up. Pick one or two of the actions below." },
  elevated: { label: "Be extra careful", blurb: "Several risk signals stack up. Share your trip and line up your exit before you go." },
  high: { label: "High caution tonight", blurb: "This trip has the toughest mix of signals. Share it, plan your exit, and keep your phone charged." },
};
