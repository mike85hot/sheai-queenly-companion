import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import logoAsset from "@/assets/sheai-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/t/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live trip — SheAI" },
      { name: "description", content: "Follow a friend's trip home in real time." },
      { property: "og:title", content: "Follow my trip home — SheAI" },
      { property: "og:description", content: "Follow a friend's trip home in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SharedTrip,
});

type Shared = { destination: string; status: string; expected_arrival: string; last_lat: number | null; last_lng: number | null; last_ping_at: string | null; traveler: string | null } | null;

function SharedTrip() {
  const { token } = Route.useParams();
  const q = useQuery({
    queryKey: ["shared", token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_shared_trip", { _token: token });
      if (error) throw error;
      return data as unknown as Shared;
    },
    refetchInterval: 15000,
  });
  const t = q.data;
  const late = t && t.status === "active" && new Date(t.expected_arrival) < new Date();
  const help = t && (t.status === "overdue" || t.status === "duress" || late);
  const label = !t ? "" : help ? "May need help" : t.status === "arrived" ? "Arrived safely" : "On the way";
  const name = t?.traveler ?? "Your friend";
  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-2xl">
        <img src={logoAsset.url} alt="SheAI" className="h-12 w-12" />
        {q.isLoading ? <p className="mt-6">Loading…</p> : !t ? <p className="mt-6">This trip link isn't valid.</p> : (
          <>
            <div className={`mt-6 rounded-3xl p-6 ${help ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>
              <p className="text-sm opacity-80">{name} → {t.destination}</p>
              <p className="font-serif text-4xl font-semibold">{label}</p>
              <p className="mt-2 text-sm opacity-80">Expected by {new Date(t.expected_arrival).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}{t.last_ping_at && ` · last seen ${new Date(t.last_ping_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}</p>
            </div>
            {help && <Button asChild className="mt-4 h-auto w-full whitespace-normal py-4"><a href="/sos">Emergency contacts — choose the person's country</a></Button>}
            {t.last_lat != null && t.last_lng != null && (
              <div className="mt-4 overflow-hidden rounded-3xl border">
                <iframe title="Live location" className="h-96 w-full" src={`https://www.openstreetmap.org/export/embed.html?bbox=${t.last_lng - 0.01},${t.last_lat - 0.006},${t.last_lng + 0.01},${t.last_lat + 0.006}&layer=mapnik&marker=${t.last_lat},${t.last_lng}`} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
