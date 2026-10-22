import { useEffect, useState } from "react";
import { Globe2, Phone, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { emergencyCountries, countryFromLocale } from "@/lib/emergency-contacts";

export function CountryEmergencyContacts() {
  const [code, setCode] = useState("");
  const [suggested, setSuggested] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sheai-emergency-country");
      if (saved && emergencyCountries.some((c) => c.code === saved)) setCode(saved);
    } catch { /* Country selection still works when storage is unavailable. */ }
    setSuggested(countryFromLocale(navigator.language) ?? "");
  }, []);
  const country = emergencyCountries.find((c) => c.code === code);
  const hint = emergencyCountries.find((c) => c.code === suggested);
  function choose(value: string) {
    setCode(value);
    try { localStorage.setItem("sheai-emergency-country", value); } catch { /* Optional preference only. */ }
  }

  return (
    <>
      <section className="grid gap-3 border-b pb-6">
        <h1 className="flex items-center gap-2 font-serif text-3xl font-semibold"><Globe2 className="h-6 w-6 text-accent" />Emergency help</h1>
        <label htmlFor="emergency-country" className="text-sm font-semibold">Country where help is needed</label>
        <Select value={code} onValueChange={choose}>
          <SelectTrigger id="emergency-country" className="h-12 bg-card"><SelectValue placeholder="Choose a country" /></SelectTrigger>
          <SelectContent>
            {emergencyCountries.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
            <SelectItem value="other">Another country</SelectItem>
          </SelectContent>
        </Select>
        {!code && hint && <Button variant="outline" className="h-auto justify-start whitespace-normal py-3" onClick={() => choose(hint.code)}>I'm in {hint.name}</Button>}
        <p className="text-xs text-muted-foreground">Confirm the country before calling, especially when travelling. Language settings do not confirm your location.</p>
        {country ? <div className="grid gap-3">
          {country.emergency.map((contact) => (
            <Button key={contact.tel} asChild variant="destructive" className="h-auto min-h-20 w-full whitespace-normal py-5 text-xl font-bold">
              <a href={`tel:${contact.tel}`}><Phone className="size-6" />Call {contact.label} — {contact.name}</a>
            </Button>
          ))}
          <p className="text-xs text-muted-foreground">Calls open your phone's dialler. SheAI does not contact emergency services for you.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {country.emergency.map((contact) => <a key={contact.tel} href={contact.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline">{contact.name} source<ExternalLink className="h-3 w-3" /></a>)}
          </div>
        </div> : code === "other" ? <p className="text-sm">We don't have verified emergency numbers for your country yet. Use your local emergency number; don't assume 911 or 112 works.</p> : null}
      </section>
      <section className="border-b pb-6">
        <h2 className="font-serif text-2xl font-semibold">Crisis support{country ? ` · ${country.name}` : ""}</h2>
        {country && country.hotlines.length > 0 && <ul className="mt-4 grid gap-3">
          {country.hotlines.map((h) => <li key={h.name} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
            <div className="min-w-0"><p className="font-semibold">{h.name}</p><p className="text-sm text-muted-foreground">{h.label}</p><a href={h.source} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">Service details</a></div>
            <div className="flex flex-wrap gap-2">
              {h.tel && <Button asChild><a href={`tel:${h.tel}`} aria-label={`Call ${h.name}`}><Phone />Call</a></Button>}
              {h.sms && <Button asChild variant="outline"><a href={`sms:${h.sms}${h.smsBody ? `?&body=${encodeURIComponent(h.smsBody)}` : ""}`} aria-label={`Text ${h.name}`}><MessageSquare />Text</a></Button>}
            </div>
          </li>)}
        </ul>}
        <p className="mt-3 text-xs text-muted-foreground">Availability, languages and call charges vary by service and network. Check service details when it is safe.</p>
        <Button asChild variant="outline" className="mt-4 h-auto whitespace-normal py-3"><a href="https://findahelpline.com/" target="_blank" rel="noopener noreferrer"><ExternalLink />Find more support by country</a></Button>
      </section>
    </>
  );
}