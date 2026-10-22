import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Siren, Users, Route as RouteIcon, Sparkles, Salad, Dumbbell, Crown } from "lucide-react";
import { fetchCredits, fetchProfile } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your SheAI dashboard" },
      { name: "description", content: "Your safety tools, trusted circle, trips and AI assistants." },
      { property: "og:title", content: "Your SheAI dashboard" },
      { property: "og:description", content: "Your safety tools, trusted circle, trips and AI assistants." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const credits = useQuery({ queryKey: ["credits"], queryFn: fetchCredits });
  const tiles = [
    { to: "/sos", title: "SOS", desc: "Local emergency contacts, siren & Safe Exit Call", icon: Siren, tone: "bg-destructive text-destructive-foreground" },
    { to: "/trip", title: "Walk Me Home", desc: "Share live location & Safe Arrival timer", icon: RouteIcon, tone: "bg-primary text-primary-foreground" },
    { to: "/contacts", title: "Trusted contacts", desc: "Who gets your alerts", icon: Users, tone: "bg-secondary" },
    { to: "/assistant", title: "Safety & Travel AI", desc: "Ask anything, anytime", icon: Sparkles, tone: "bg-secondary", mode: "safety" },
    { to: "/assistant", title: "Meal Planner", desc: "Meals + grocery list", icon: Salad, tone: "bg-secondary", mode: "meals" },
    { to: "/assistant", title: "Fitness & Cycle Coach", desc: "Workouts for today's energy", icon: Dumbbell, tone: "bg-secondary", mode: "fitness" },
  ] as const;
  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Hi{profile.data?.display_name ? `, ${profile.data.display_name}` : ""}.</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {credits.data && (
          <>
            <span className="rounded-full bg-secondary px-3 py-1 font-semibold capitalize">{credits.data.plan} plan</span>
            <span className="rounded-full border px-3 py-1">{credits.data.remaining}/{credits.data.limit} AI credits {credits.data.plan === "free" ? "(one-time)" : "today"}</span>
          </>
        )}
        {credits.data?.plan === "free" && (
          <Link to="/profile" className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-semibold text-accent-foreground"><Crown className="h-4 w-4" />Start 7-day free trial</Link>
        )}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const inner = (<><t.icon className="h-8 w-8" /><p className="mt-4 text-xl font-semibold">{t.title}</p><p className="text-sm opacity-80">{t.desc}</p></>);
          const cls = `rounded-3xl p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${t.tone}`;
          return "mode" in t ? (
            <Link key={t.title} to="/assistant" search={{ mode: t.mode }} className={cls}>{inner}</Link>
          ) : (
            <Link key={t.title} to={t.to} className={cls}>{inner}</Link>
          );
        })}
      </div>
    </div>
  );
}
