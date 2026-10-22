import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MapPin, Share2, MessageSquare, ShieldCheck, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfile } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { tripShareMessage, whatsappTripUrl } from "@/lib/trip-sharing";

export const Route = createFileRoute("/_authenticated/trip")({
  head: () => ({
    meta: [
      { title: "Walk Me Home — SheAI" },
      { name: "description", content: "Share your live location and set a Safe Arrival timer." },
      { property: "og:title", content: "Walk Me Home — SheAI" },
      { property: "og:description", content: "Share your live location and set a Safe Arrival timer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TripPage,
});

async function fetchActiveTrip() {
  const { data } = await supabase.from("trips").select("*").in("status", ["active", "overdue"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data;
}
async function fetchPhones() {
  const { data } = await supabase.from("trusted_contacts").select("phone");
  return (data ?? []).map((c) => c.phone);
}

function TripPage() {
  const qc = useQueryClient();
  const trip = useQuery({ queryKey: ["trip"], queryFn: fetchActiveTrip });
  const phones = useQuery({ queryKey: ["phones"], queryFn: fetchPhones });
  const profile = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const [dest, setDest] = useState("");
  const [mins, setMins] = useState(25);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("trips").insert({ destination: dest, expected_arrival: new Date(Date.now() + mins * 60000).toISOString() });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["trip"] });
  }

  if (trip.isLoading) return null;
  if (trip.data) return <ActiveTrip trip={trip.data} phones={phones.data ?? []} safe={profile.data?.safe_code ?? null} duress={profile.data?.duress_code ?? null} onDone={() => qc.invalidateQueries({ queryKey: ["trip"] })} />;

  return (
    <form onSubmit={start} className="mx-auto grid max-w-lg gap-4 rounded-3xl border bg-card p-6">
      <h1 className="font-serif text-3xl font-semibold">Walk Me Home</h1>
      <p className="text-sm text-muted-foreground">Share a live location link with your trusted contacts. If you don't check in by your arrival time, SheAI flags it and prompts you to alert them.</p>
      <input required value={dest} onChange={(e) => setDest(e.target.value)} placeholder="Where are you heading?" className="rounded-xl border bg-background px-4 py-3" />
      <label className="text-sm font-semibold">Expected arrival in {mins} min</label>
      <input type="range" min={5} max={180} step={5} value={mins} onChange={(e) => setMins(+e.target.value)} className="accent-[var(--color-primary)]" />
      <button className="rounded-full bg-gradient-primary py-3 font-bold text-primary-foreground">Start trip</button>
    </form>
  );
}

type Trip = { id: string; share_token: string; destination: string; status: string; expected_arrival: string; last_lat: number | null; last_lng: number | null };

function ActiveTrip({ trip, phones, safe, duress, onDone }: { trip: Trip; phones: string[]; safe: string | null; duress: string | null; onDone: () => void }) {
  const [now, setNow] = useState(Date.now());
  const [code, setCode] = useState("");
  const [geoErr, setGeoErr] = useState<string | null>(null);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(trip.last_lat != null && trip.last_lng != null ? { lat: trip.last_lat, lng: trip.last_lng } : null);
  const lastSent = useRef(0);
  const flagged = useRef(trip.status === "overdue");
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    setShareUrl(`${window.location.origin}/t/${trip.share_token}`);
  }, [trip.share_token]);
  const left = Math.round((new Date(trip.expected_arrival).getTime() - now) / 1000);
  const overdue = left <= 0;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return setGeoErr("Location isn't available on this device.");
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const next = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPos(next);
        if (Date.now() - lastSent.current > 15000) {
          lastSent.current = Date.now();
          supabase.from("trips").update({ last_lat: next.lat, last_lng: next.lng, last_ping_at: new Date().toISOString() }).eq("id", trip.id).then();
        }
      },
      () => setGeoErr("Allow location access so your contacts can follow your trip."),
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [trip.id]);

  useEffect(() => {
    if (!overdue || flagged.current) return;
    flagged.current = true;
    supabase.from("trips").update({ status: "overdue" }).eq("id", trip.id).then();
    supabase.from("alerts").insert({ trip_id: trip.id, kind: "overdue", message: `Missed Safe Arrival to ${trip.destination}`, lat: pos?.lat ?? null, lng: pos?.lng ?? null }).then();
    navigator.vibrate?.([500, 200, 500]);
  }, [overdue, trip.id, trip.destination, pos]);

  const smsBody = encodeURIComponent(tripShareMessage(trip.destination, shareUrl));
  const helpBody = encodeURIComponent(tripShareMessage(trip.destination, shareUrl, true));
  const smsTo = phones.join(",");

  async function finish(e: React.FormEvent) {
    e.preventDefault();
    const hasCodes = !!safe;
    let status = "arrived";
    if (hasCodes) {
      if (duress && code === duress) status = "duress";
      else if (code !== safe) { toast.error("That codeword didn't match."); return; }
    }
    await supabase.from("trips").update({ status, ended_at: new Date().toISOString() }).eq("id", trip.id);
    if (status === "duress") await supabase.from("alerts").insert({ trip_id: trip.id, kind: "duress", message: "Duress codeword used", lat: pos?.lat ?? null, lng: pos?.lng ?? null });
    toast.success("Trip ended. Glad you're safe.");
    onDone();
  }

  const mmss = (s: number) => `${Math.floor(Math.abs(s) / 60)}:${String(Math.abs(s) % 60).padStart(2, "0")}`;
  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <div className={`rounded-3xl p-6 ${overdue ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>
        <p className="text-sm opacity-80">Heading to</p>
        <p className="font-serif text-3xl font-semibold">{trip.destination}</p>
        <p className="mt-3 text-5xl font-bold tabular-nums">{overdue ? `+${mmss(left)}` : mmss(left)}</p>
        <p className="text-sm opacity-80">{overdue ? "You're past your arrival time" : "until Safe Arrival check-in"}</p>
      </div>
      {overdue && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild className="h-auto whitespace-normal bg-accent py-4 text-accent-foreground"><a href={`sms:${smsTo}?&body=${helpBody}`}><AlertTriangle />Alert contacts by text</a></Button>
          <Button asChild className="h-auto whitespace-normal py-4"><a href={whatsappTripUrl(trip.destination, shareUrl, true)} target="_blank" rel="noopener noreferrer"><MessageSquare />Ask for help on WhatsApp</a></Button>
        </div>
      )}
      <div className="rounded-3xl border bg-card p-6">
        <p className="flex items-center gap-2 font-semibold"><MapPin className="h-5 w-5 text-accent" />{pos ? `Live location on · ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}` : geoErr ?? "Finding your location…"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`sms:${smsTo}?&body=${smsBody}`} className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><MessageSquare className="h-4 w-4" />Text link to {phones.length || "my"} contacts</a>
          <Button asChild disabled={!shareUrl}><a href={whatsappTripUrl(trip.destination, shareUrl)} target="_blank" rel="noopener noreferrer"><MessageSquare />Share to WhatsApp</a></Button>
          <Button variant="outline" disabled={!shareUrl} onClick={async () => {
            try { await navigator.clipboard.writeText(shareUrl); toast.success("Link copied"); }
            catch { toast.error("Couldn't copy the link. Try WhatsApp or text instead."); }
          }}><Share2 />Copy share link</Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Choose a recipient and send in WhatsApp or your messaging app. Alerts are not sent automatically. Anyone with this link can see your trip.</p>
      </div>
      <form onSubmit={finish} className="grid gap-3 rounded-3xl border bg-card p-6">
        <p className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-primary" />I've arrived safely</p>
        {safe ? (
          <input type="password" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter your codeword" className="rounded-xl border bg-background px-4 py-3" />
        ) : (
          <p className="text-sm text-muted-foreground">Tip: set a safe and duress codeword in your profile for stealth check-ins.</p>
        )}
        <button className="rounded-full bg-gradient-primary py-3 font-bold text-primary-foreground">End trip</button>
      </form>
    </div>
  );
}
