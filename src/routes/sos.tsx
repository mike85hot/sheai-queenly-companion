import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Siren, MessageSquare, ArrowLeft, Volume2 } from "lucide-react";
import logoAsset from "@/assets/sheai-logo.png.asset.json";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "SOS — Siren, Safe Exit Call & Hotlines | SheAI" },
      { name: "description", content: "One-tap 911, crisis hotlines, a loud siren with strobe, and a Safe Exit fake call." },
      { property: "og:title", content: "SOS — SheAI" },
      { property: "og:description", content: "One-tap 911, crisis hotlines, siren with strobe, and a Safe Exit fake call." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SosPage,
});

const hotlines = [
  { name: "National Domestic Violence Hotline", tel: "18007997233", label: "1-800-799-7233", sms: "88788", smsBody: "START" },
  { name: "988 Suicide & Crisis Lifeline", tel: "988", label: "988", sms: "988" },
  { name: "Crisis Text Line", label: "Text HOME to 741741", sms: "741741", smsBody: "HOME" },
  { name: "RAINN Sexual Assault Hotline", tel: "18006564673", label: "1-800-656-4673" },
  { name: "Love is Respect (dating abuse)", tel: "18663319474", label: "1-866-331-9474", sms: "22522", smsBody: "LOVEIS" },
];

function SosPage() {
  return (
    <div className="min-h-screen bg-background pb-16 text-foreground">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <a href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back</a>
        <img src={logoAsset.url} alt="SheAI" className="h-10 w-10" />
      </header>
      <main className="mx-auto grid max-w-3xl gap-6 px-4">
        <a href="tel:911" className="flex items-center justify-center gap-3 rounded-3xl bg-destructive py-8 text-3xl font-bold text-destructive-foreground shadow-lg">
          <Phone className="h-8 w-8" />Call 911
        </a>
        <SirenCard />
        <SafeExitCard />
        <section className="rounded-3xl border bg-card p-6">
          <h2 className="font-serif text-2xl font-semibold">Crisis hotlines</h2>
          <p className="text-sm text-muted-foreground">Free, confidential, 24/7 (US).</p>
          <ul className="mt-4 grid gap-3">
            {hotlines.map((h) => (
              <li key={h.name} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-secondary p-4">
                <div><p className="font-semibold">{h.name}</p><p className="text-sm text-muted-foreground">{h.label}</p></div>
                <div className="flex gap-2">
                  {h.tel && <a href={`tel:${h.tel}`} className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><Phone className="h-4 w-4" />Call</a>}
                  {h.sms && <a href={`sms:${h.sms}${h.smsBody ? `?&body=${h.smsBody}` : ""}`} className="flex items-center gap-1 rounded-full border border-primary px-4 py-2 text-sm font-bold text-primary"><MessageSquare className="h-4 w-4" />Text</a>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function SirenCard() {
  const [on, setOn] = useState(false);
  const [flash, setFlash] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<() => void>(() => {});

  function start() {
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc2.type = "square";
    gain.gain.value = 0.9;
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    const sweep = () => {
      const t = ctx.currentTime;
      for (let i = 0; i < 40; i++) {
        osc.frequency.setValueAtTime(700, t + i * 0.8);
        osc.frequency.linearRampToValueAtTime(1600, t + i * 0.8 + 0.4);
        osc.frequency.linearRampToValueAtTime(700, t + i * 0.8 + 0.8);
        osc2.frequency.setValueAtTime(1400, t + i * 0.8);
        osc2.frequency.linearRampToValueAtTime(3200, t + i * 0.8 + 0.4);
        osc2.frequency.linearRampToValueAtTime(1400, t + i * 0.8 + 0.8);
      }
    };
    sweep();
    const loop = setInterval(sweep, 30000);
    osc.start();
    osc2.start();
    const strobe = setInterval(() => setFlash((f) => !f), 120);
    stopRef.current = () => {
      clearInterval(loop);
      clearInterval(strobe);
      osc.stop();
      osc2.stop();
      ctx.close();
      setFlash(false);
    };
    setOn(true);
  }
  function stop() {
    stopRef.current();
    setOn(false);
  }
  useEffect(() => () => stopRef.current(), []);

  return (
    <>
      {on && (
        <button onClick={stop} className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 text-4xl font-bold ${flash ? "bg-accent text-accent-foreground" : "bg-background text-foreground"}`}>
          <Siren className="h-20 w-20" />SIREN ON<span className="text-base font-medium">Tap anywhere to stop</span>
        </button>
      )}
      <section className="rounded-3xl border bg-card p-6">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Volume2 className="h-6 w-6 text-accent" />Siren & strobe</h2>
        <p className="mt-1 text-sm text-muted-foreground">Turn your volume all the way up. A piercing alarm plays and your screen flashes to draw attention.</p>
        <button onClick={start} className="mt-4 w-full rounded-full bg-accent py-4 text-lg font-bold text-accent-foreground">Sound the siren</button>
      </section>
    </>
  );
}

const callScript = [
  "Hey, it's me. Sorry to call out of nowhere.",
  "Something's come up and I really need you right now. Can you come?",
  "No, it can't wait, I'm sorry. How soon can you get here?",
  "Okay. Leave now and call me when you're on the way. Thank you, seriously.",
];

function SafeExitCard() {
  const [delay, setDelay] = useState(30);
  const [caller, setCaller] = useState("Mom");
  const [phase, setPhase] = useState<"idle" | "waiting" | "ringing" | "live">("idle");
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const ringRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (phase !== "waiting") return;
    if (remaining <= 0) {
      setPhase("ringing");
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, remaining]);

  useEffect(() => {
    if (phase !== "ringing") return;
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.frequency.value = 440;
    o2.frequency.value = 480;
    o1.connect(gain);
    o2.connect(gain);
    gain.gain.value = 0;
    const t = ctx.currentTime;
    for (let i = 0; i < 20; i++) {
      gain.gain.setValueAtTime(0.4, t + i * 3);
      gain.gain.setValueAtTime(0, t + i * 3 + 1.6);
    }
    o1.start();
    o2.start();
    navigator.vibrate?.([800, 400, 800, 400, 800]);
    ringRef.current = () => ctx.close();
    return () => ctx.close();
  }, [phase]);

  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    let i = 0;
    const speak = () => {
      if (i >= callScript.length) return;
      const u = new SpeechSynthesisUtterance(callScript[i++]);
      u.rate = 0.95;
      u.onend = () => setTimeout(speak, 3500);
      speechSynthesis.speak(u);
    };
    const s = setTimeout(speak, 1200);
    return () => {
      clearInterval(t);
      clearTimeout(s);
      speechSynthesis.cancel();
    };
  }, [phase]);

  function schedule() {
    setRemaining(delay);
    setElapsed(0);
    setPhase(delay === 0 ? "ringing" : "waiting");
  }
  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (phase === "ringing" || phase === "live")
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-primary py-20 text-primary-foreground">
        <div className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-foreground/15 text-4xl font-semibold">{caller.slice(0, 1).toUpperCase()}</div>
          <p className="mt-4 text-3xl font-semibold">{caller}</p>
          <p className="mt-1 opacity-80">{phase === "ringing" ? "mobile · incoming call" : mmss(elapsed)}</p>
        </div>
        <div className="flex gap-16">
          <button aria-label="Decline" onClick={() => { ringRef.current?.(); setPhase("idle"); }} className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground"><PhoneOff className="h-7 w-7" /></button>
          {phase === "ringing" && (
            <button aria-label="Answer" onClick={() => { ringRef.current?.(); setPhase("live"); }} className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-success text-primary-foreground"><Phone className="h-7 w-7" /></button>
          )}
        </div>
      </div>
    );

  return (
    <section className="rounded-3xl border bg-card p-6">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Phone className="h-6 w-6 text-accent" />Safe Exit Call</h2>
      <p className="mt-1 text-sm text-muted-foreground">Get a realistic incoming call to excuse yourself from an uncomfortable situation.</p>
      {phase === "waiting" ? (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-secondary p-4">
          <p>Call from <b>{caller}</b> in <b>{mmss(remaining)}</b></p>
          <button onClick={() => setPhase("idle")} className="text-sm font-semibold text-accent">Cancel</button>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          <input value={caller} onChange={(e) => setCaller(e.target.value)} className="rounded-xl border bg-background px-4 py-3 text-sm" placeholder="Caller name" />
          <div className="grid grid-cols-4 gap-2">
            {[0, 30, 60, 300].map((d) => (
              <button key={d} onClick={() => setDelay(d)} className={`rounded-full border py-2 text-sm ${delay === d ? "border-primary bg-primary text-primary-foreground" : ""}`}>{d === 0 ? "Now" : d < 60 ? `${d}s` : `${d / 60}m`}</button>
            ))}
          </div>
          <button onClick={schedule} className="rounded-full bg-gradient-primary py-3 font-bold text-primary-foreground">Schedule call</button>
        </div>
      )}
    </section>
  );
}
