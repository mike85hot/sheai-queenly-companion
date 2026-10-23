import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SafePlace = {
  name: string;
  lat: number;
  lng: number;
  kind: string;
  distance_m: number;
  tel: string | null;
  website: string | null;
};

export type SafePlacesResult = { places: SafePlace[]; error: string | null };

const LODGING = '^(hotel|hostel|guest_house|motel)$';

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Public OpenStreetMap lodging data via Overpass — free, no key, source stays attributed in the UI.
export const findNearbySafePlaces = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { lat: number; lng: number; radius?: number }) => data)
  .handler(async ({ data }): Promise<SafePlacesResult> => {
    const radius = Math.min(Math.max(Math.round(data.radius ?? 2000), 300), 5000);
    const query = `[out:json][timeout:20];(node["tourism"~"${LODGING}"](around:${radius},${data.lat},${data.lng});way["tourism"~"${LODGING}"](around:${radius},${data.lat},${data.lng}););out center tags 40;`;
    const endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) continue;
        const json = (await res.json()) as {
          elements?: Array<{ lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }>;
        };
        const places = (json.elements ?? [])
          .map((el) => {
            const lat = el.lat ?? el.center?.lat;
            const lng = el.lon ?? el.center?.lon;
            const tags = el.tags ?? {};
            if (lat == null || lng == null || !tags.name) return null;
            return {
              name: tags.name,
              lat,
              lng,
              kind: tags.tourism ?? "lodging",
              distance_m: Math.round(haversine(data.lat, data.lng, lat, lng)),
              tel: tags["phone"] ?? tags["contact:phone"] ?? null,
              website: tags["website"] ?? tags["contact:website"] ?? null,
            } satisfies SafePlace;
          })
          .filter((p): p is SafePlace => p != null)
          .sort((a, b) => a.distance_m - b.distance_m)
          .slice(0, 8);
        return { places, error: null };
      } catch {
        continue;
      }
    }
    return { places: [], error: "We couldn't reach the map service just now. Try again in a minute." };
  });
