export type AssistantMode = "safety" | "meals" | "fitness";

export const MODES: Record<AssistantMode, { label: string; blurb: string; suggestions: string[] }> = {
  safety: {
    label: "Safety & Travel",
    blurb: "Situational awareness, solo travel and getting out of tricky moments.",
    suggestions: [
      "I'm travelling solo to Lisbon next week. What should I know?",
      "My rideshare driver is taking a strange route. What do I do?",
      "How do I check a first date is who they say they are?",
    ],
  },
  meals: {
    label: "Meal Planner",
    blurb: "Meals built around your cravings, diet and budget — with a grocery list.",
    suggestions: [
      "Plan 3 high-protein vegetarian dinners for this week",
      "I'm craving something sweet but want to stay on track",
      "Iron-rich meals for my period week, under $40",
    ],
  },
  fitness: {
    label: "Fitness & Cycle Coach",
    blurb: "Workouts matched to your energy, equipment and cycle phase.",
    suggestions: [
      "20-minute home workout, no equipment, low energy today",
      "What training suits the luteal phase?",
      "A 4-week beginner strength plan with dumbbells",
    ],
  },
};

export const CYCLE_PHASES = ["Not tracking", "Menstrual", "Follicular", "Ovulation", "Luteal"] as const;

export function systemPrompt(mode: AssistantMode, cyclePhase?: string) {
  const base =
    "You are SheAI, a warm, direct and practical assistant built for women. Keep answers concise and skimmable with short headings and bullet points. Never shame or lecture.";
  if (mode === "safety")
    return `${base} Focus: personal safety, situational awareness, solo travel, dating safety and exit strategies. If the user describes immediate danger, tell them first to call 911 (or local emergency number) and use the SheAI SOS page, then give brief steps. Do not invent crime statistics; say when local data should be checked.`;
  if (mode === "meals")
    return `${base} Focus: meal planning. Ask at most one clarifying question only if essential. Give recipes with portions and times, then end with a "Grocery list" section as a markdown task list ("- [ ] item — qty") grouped by aisle. You are not a doctor; flag allergies and medical diets.`;
  return `${base} Focus: fitness and cycle-synced wellness. Current cycle phase: ${cyclePhase || "not tracking"}. Tailor intensity to energy and phase, include warm-up, sets/reps or times, and recovery tips. You are not a doctor; suggest seeing one for pain or unusual symptoms.`;
}
