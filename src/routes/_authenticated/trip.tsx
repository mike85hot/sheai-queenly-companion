import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MapPin, Share2, MessageSquare, ShieldCheck, AlertTriangle, Hotel, Radar, ExternalLink, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfile } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { tripShareMessage, whatsappTripUrl } from "@/lib/trip-sharing";
import { assessJourney, levelCopy, type Transport } from "@/lib/journey-risk";
import { findNearbySafePlaces, type SafePlace } from "@/lib/places.functions";

export const Route = createFileRoute("/_authenticated/trip")({
  head: () => ({
    meta: [
      { title: "Walk Me Home — SheAI" },
      { name: "description", content: "Journey risk check, live location sharing, Safe Arrival timer and nearby safe places." },
      { property: "og:title", content: "Walk Me Home — SheAI" },
      { property: "og:description", content: "Journey risk check, live location sharing, Safe Arrival timer and nearby safe places." },
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
    <div className="mx-auto grid max-w-lg gap-6">
      <JourneyCheckCard />
      <form onSubmit={start} className="grid gap-4 rounded-3xl border bg-card p-6">
        <h1 className="font-serif text-3xl font-semibold">Walk Me Home</h1>
        <p className="text-sm text-muted-foreground">Share a live location link with your trusted contacts. If you don't check in by your arrival time, SheAI flags it and prompts you to alert them.</p>
        <input required value={dest} onChange={(e) => setDest(e.target.value)} placeholder="Where are you heading?" className="rounded-xl border bg-background px-4 py-3" />
        <label className="text-sm font-semibold">Expected arrival in {mins} min</label>
        <input type="range" min={5} max={180} step={5} value={mins} onChange={(e) => setMins(+e.target.value)} className="accent-[var(--color-primary)]" />
        <button className="rounded-full bg-gradient-primary py-3 font-bold text-primary-foreground">Start trip</button>
      </form>
    </div>
  );
}

const transports: { value: Transport; label: string }[] = [
  { value: "walk", label: "Walking" },
  { value: "transit", label: "Bus / train" },
  { value: "rideshare", label: "Rideshare / taxi" },
  { value: "car", label: "Own or friend's car" },
];

function JourneyCheckCard() {
  const [hour] = useState(() => new Date().getHours());
  const [transport, setTransport] = useState<Transport>("walk");
  const [alone, setAlone] = useState(true);
  const [familiar, setFamiliar] = useState(false);
  const [lowBattery, setLowBattery] = useState(false);
  const risk = useMemo(() => assessJourney({ hour, transport, alone, familiar, lowBattery, shared: false }), [hour, transport, alone, familiar, lowBattery]);
  const copy = levelCopy[risk.level];
  const tone = risk.level === "high" || risk.level === "elevated" ? "text-accent" : "text-primary";

  return (
    <section className="grid gap-4 rounded-3xl border bg-card p-6">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Radar className="h-6 w-6 text-accent" />Journey check</h2>
      <p className="text-sm text-muted-foreground">A quick pre-trip check of tonight's conditions — time, transport and who's expecting you. This is context to help you plan, not a crime prediction.</p>
      <div className="flex flex-wrap gap-2">
        {transports.map((t) => (
          <button key={t.value} type="button" onClick={() => setTransport(t.value)} className={`rounded-full border px-4 py-2 text-sm ${transport === t.value ? "border-primary bg-primary text-primary-foreground" : ""}`}>{t.label}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { on: alone, set: setAlone, label: "I'm going alone" },
          { on: !familiar, set: (v: boolean) => setFamiliar(!v), label: "Unfamiliar route" },
          { on: lowBattery, set: setLowBattery, label: "Battery below 20%" },
        ].map((c) => (
          <button key={c.label} type="button" onClick={() => c.set(!c.on)} className={`rounded-full border px-4 py-2 text-sm ${c.on ? "border-accent bg-accent text-accent-foreground" : ""}`}>{c.label}</button>
        ))}
      </div>
      <div className="rounded-2xl bg-secondary p-4">
        <p className={`font-serif text-2xl font-semibold ${tone}`}>{copy.label} · {risk.score}/100</p>
        <p className="mt-1 text-sm text-muted-foreground">{copy.blurb}</p>
        {risk.factors.length > 0 && (
          <ul className="mt-3 grid gap-1 text-sm">
            {risk.factors.map((f) => <li key={f} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{f}</li>)}
          </ul>
        )}
        <ul className="mt-3 grid gap-1 text-sm">
          {risk.actions.map((a) => <li key={a} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{a}</li>)}
        </ul>
      </div>
    </section>
  );
}

const kindLabels: Record<string, string> = { hotel: "Hotel", hostel: "Hostel", guest_house: "Guest house", motel: "Motel" };

const hotelChecklist = [
  "Pick a room on floors 2–6 — above easy break-in reach, within fire-ladder reach.",
  "Test the door lock, peephole and window latch when you first check in.",
  "Find the nearest stairwell exit before you need it.",
  "Share your hotel name and room number with a trusted contact — and only one you trust.",
  "Save the front-desk number; call them if anything feels off during the night.",
];

function SafePlacesCard({ pos }: { pos: { lat: number; lng: number } | null }) {
  const findPlaces = useServerFn(findNearbySafePlaces);
  const [places, setPlaces] = useState<SafePlace[] | null>(null);
  const [placesErr, setPlacesErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!pos) return;
    setLoading(true);
    try {
      const r = await findPlaces({ data: { lat: pos.lat, lng: pos.lng, radius: 2000 } });
      setPlaces(r.places);
      setPlacesErr(r.error);
    } catch {
      setPlacesErr("Something went wrong. Try again in a minute.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-3 rounded-3xl border bg-card p-6">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Hotel className="h-6 w-6 text-accent" />Backup hotel safety net</h2>
      <p className="text-sm text-muted-foreground">Plans fell through? Find places to sleep near where you are right now, then run the check-in checklist.</p>
      {pos ? (
        <Button onClick={search} disabled={loading} className="justify-self-start">
          <Radar />{loading ? "Searching nearby…" : "Find places near me"}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">Turn on location access to search nearby.</p>
      )}
      {placesErr && <p className="text-sm text-accent">{placesErr}</p>}
      {places && (
        <>
          {places.length === 0 && !placesErr && <p className="text-sm text-muted-foreground">No named hotels or guest houses found within 2 km. Try widening your search or asking a trusted contact.</p>}
          <ul className="grid gap-2">
            {places.map((p) => (
              <li key={`${p.name}-${p.lat}-${p.lng}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{kindLabels[p.kind] ?? "Lodging"} · {p.distance_m >= 1000 ? `${(p.distance_m / 1000).toFixed(1)} km` : `${p.distance_m} m`}</p>
                </div>
                <div className="flex gap-2">
                  {p.tel && <Button asChild size="sm" variant="outline"><a href={`tel:${p.tel}`} aria-label={`Call ${p.name}`}><Phone />Call</a></Button>}
                  <Button asChild size="sm" variant="outline"><a href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=17/${p.lat}/${p.lng}`} target="_blank" rel="noopener noreferrer">Map<ExternalLink className="h-3.5 w-3.5" /></a></Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <details className="rounded-2xl bg-secondary p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Hotel check-in checklist</summary>
        <ul className="mt-3 grid gap-2">
          {hotelChecklist.map((c) => <li key={c} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{c}</li>)}
        </ul>
      </details>
      <p className="text-xs text-muted-foreground">Place data © OpenStreetMap contributors — listings can be out of date. Check reviews and confirm the area feels right before you book.</p>
    </section>
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
      <SafePlacesCard pos={pos} />
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
