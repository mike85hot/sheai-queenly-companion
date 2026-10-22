import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import { Shield, Plane, Heart, Dumbbell, Sparkles, Phone, MapPin, Crown, Check, ShoppingBag, Utensils, Hotel, Siren, ShieldCheck, Minus } from "lucide-react";
import logoAsset from "@/assets/sheai-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SheAI — Every woman deserves her own AI" },
      { name: "description", content: "SheAI is a women-first predictive intelligence platform for safety, travel, health, wellness and fitness." },
      { property: "og:title", content: "SheAI — Every woman deserves her own AI" },
      { property: "og:description", content: "Safety, travel, wellness and fitness AI built for women." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const pills = [
  { icon: Shield, label: "Safety" },
  { icon: Plane, label: "Travel" },
  { icon: Heart, label: "Health & Wellness" },
  { icon: Dumbbell, label: "Fitness" },
  { icon: Sparkles, label: "Predictive AI" },
];

const status = [
  { t: "Live Web Beta", tag: "Live now", d: "The web app is live in beta. Everything marked as working can be used today in your browser." },
  { t: "Mobile App", tag: "In progress", d: "The iOS and Android apps are being built and tested and will launch after the web beta." },
  { t: "Connected Devices", tag: "In development", d: "A GPS tracker and SOS wearable are in development and will pair with the mobile app." },
];

const pillars = [
  { t: "Protect", d: "Instant alerts, discreet escape tools and wearable tech that keeps you safe anywhere." },
  { t: "Elevate", d: "Automate your day and win back time with wellness, calendar and balance tools." },
  { t: "Empower", d: "Learn, grow and lead with AI that opens doors to new opportunities." },
];

const features = [
  { icon: Utensils, t: "Smart Meal Planning", d: "Recipes and a shoppable grocery list from what you crave." },
  { icon: ShoppingBag, t: "Smart Shopping", d: "Curated products, picked for you." },
  { icon: Dumbbell, t: "Fitness & Wellness Coach", d: "Workouts, nutrition and progress with personal insights." },
  { icon: Hotel, t: "Backup Hotel Safety Net", d: "Find and book the safest nearby hotel when plans fall through." },
  { icon: Siren, t: "Emergency SOS", d: "One tap shares your location with trusted contacts — only in that moment." },
];

function Logo() {
  return <img src={logoAsset.url} alt="SheAI" className="h-14 w-14 object-contain" />;
}

const plans = [
  {
    icon: Shield,
    name: "Free Account",
    price: "$0",
    period: "Free Forever",
    note: "No card needed",
    cta: "Start Free",
    featured: false,
    features: [
      "Safety alarm",
      "Safe Exit Call",
      "Country-specific emergency contacts",
      "2 trusted contacts",
      "Manual emergency alerts",
      "Core health & wellness",
      "8 one-time AI credits",
    ],
  },
  {
    icon: Sparkles,
    name: "7-Day Free Trial",
    price: "$0",
    period: "for 7 days",
    note: "Full Premium access for a week",
    cta: "Start Free Trial",
    featured: false,
    features: [
      "Full access to all Premium features",
      "4 trusted contacts",
      "40 AI credits per day",
      "Live location sharing",
    ],
  },
  {
    icon: Crown,
    name: "SheAI Premium",
    price: "$18",
    period: "/month",
    note: "Cancel anytime",
    cta: "Go Premium",
    featured: true,
    features: [
      "Automated emergency SMS alerts",
      "Unlimited trusted contacts",
      "40 daily AI credits",
      "Live GPS Trip Watch",
      "Welfare checks",
      "Secret codewords",
      "Predictive travel & location risk intelligence",
    ],
  },
  {
    icon: Check,
    name: "Founding SheAI Pass",
    price: "$58",
    period: "one-time",
    note: "Pay once, never subscribe",
    cta: "Claim Your Pass",
    featured: false,
    features: [
      "Lifetime founding member badge",
      "Exclusive perks",
      "No recurring subscription",
    ],
  },
];

const comparison = [
  {
    group: "Safety Tools",
    rows: [
      ["Siren", true, true],
      ["Safe Exit Call", true, true],
      ["Panic Button", "Manual", "Automated SMS"],
      ["Walk Me Home", false, true],
      ["Safe Arrival", "Manual check-in", "Automated welfare check"],
    ] as [string, string | boolean, string | boolean][],
  },
  {
    group: "Predictive AI & Location",
    rows: [
      ["Location risk score", false, true],
      ["Smart routing", false, true],
      ["Live location sharing", false, true],
      ["Crime map", false, true],
    ] as [string, string | boolean, string | boolean][],
  },
  {
    group: "AI Assistants",
    rows: [
      ["AI chat assistants", true, true],
      ["Daily AI credits", "8 one-time", "40 per day"],
    ] as [string, string | boolean, string | boolean][],
  },
  {
    group: "Health & Wellness",
    rows: [
      ["Core health & wellness tracking", true, true],
      ["Personalized insights & coaching", false, true],
    ] as [string, string | boolean, string | boolean][],
  },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="inline h-5 w-5 text-primary" />;
  if (value === false) return <Minus className="inline h-5 w-5 text-muted-foreground/50" />;
  return <span className="text-xs font-semibold text-primary">{value}</span>;
}

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden gap-7 text-sm md:flex">
          {["About", "Safety", "Shop", "Emergency", "AI Features", "Pricing"].map((n) => (
            <a key={n} href={`#${n.toLowerCase().replace(" ", "-")}`} className="hover:text-primary">{n}</a>
          ))}
        </nav>
        <div className="flex gap-2">
          <a href="/sos" className="flex items-center gap-1 rounded-full bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground"><Phone className="h-4 w-4" />SOS</a>
          <a href="/trip" className="hidden items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground sm:flex"><MapPin className="h-4 w-4" />Share Location</a>
          <a href="/auth" className="rounded-full border border-primary px-4 py-2 text-sm text-primary">Login</a>
        </div>
      </header>

      <section className="bg-gradient-hero">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="font-serif text-5xl leading-tight md:text-6xl">Every woman deserves her own She<span className="text-accent">AI</span></h1>
            <p className="mt-5 text-xl font-medium">Predictive intelligence. Built for Women.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {pills.map(({ icon: I, label }) => (
                <span key={label} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-medium"><I className="h-4 w-4 text-primary" />{label}</span>
              ))}
            </div>
            <p className="mt-6 font-bold">Smart. Safe. Sovereign.</p>
            <p className="mt-3 text-muted-foreground">An AI built to protect, elevate and empower you — because your safety, health, balance and dreams deserve the smartest support.</p>
          </div>
          <div className="rounded-3xl border bg-card p-8 shadow-sm">
            <a href="/auth" className="block w-full rounded-full border border-primary px-6 py-3 text-center font-semibold text-primary">Create a Free SheAI Account</a>
            <p className="mt-6 text-center"><b>Live now 👑</b> SheAI's free safety tools are ready to use today — no download, no card needed.</p>
            <a href="/sos" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 py-4 font-bold text-primary-foreground"><Siren className="h-5 w-5" />Try Emergency SOS — No Login Needed</a>
            <p className="mt-6 flex gap-2 rounded-2xl border p-4 text-sm"><Check className="h-4 w-4 shrink-0 text-primary" />Instant access to the SOS siren, Safe Exit Call, Walk Me Home and 8 free AI credits — free forever, no download.</p>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">What SheAI is</p>
        <h2 className="mt-3 font-serif text-4xl">A women-first predictive intelligence platform</h2>
        <p className="mt-5 text-muted-foreground">SheAI brings together safety, travel, health, wellness, fitness and personal AI assistance — using the signals you choose to share to help you understand changing conditions. SheAI gives you context. You stay the decision-maker.</p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h3 className="mb-6 text-center font-serif text-3xl">Product status</h3>
        <div className="grid gap-5 md:grid-cols-3">
          {status.map((s) => (
            <div key={s.t} className="rounded-3xl border bg-card p-6">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">{s.tag}</span>
              <h4 className="mt-4 text-lg font-bold">{s.t}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="safety" className="bg-secondary py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-serif text-4xl">Built for Women</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.t} className="rounded-3xl bg-card p-8">
                <h3 className="font-serif text-3xl text-primary">{p.t}</h3>
                <p className="mt-3 text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai-features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center font-serif text-4xl">Working today in the web beta</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-3xl border bg-card p-6">
              <I className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-bold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Pricing Plans</p>
          <h2 className="mt-3 font-serif text-4xl">Safety first, always</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Core safety stays free for every woman. Upgrade when you want SheAI watching over you around the clock.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map(({ icon: I, ...p }) => (
            <div key={p.name} className={`relative flex flex-col rounded-3xl border p-7 ${p.featured ? "border-primary bg-card shadow-lg ring-2 ring-coral" : "bg-card"}`}>
              {p.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral px-4 py-1 text-xs font-bold text-coral-foreground">Most Popular</span>}
              <div className="flex items-center gap-2">
                <I className="h-5 w-5 text-primary" />
                <h3 className="font-bold">{p.name}</h3>
              </div>
              <p className="mt-4"><span className="font-serif text-5xl">{p.price}</span> <span className="text-sm text-muted-foreground">{p.period}</span></p>
              <p className="mt-1 text-sm font-semibold text-accent">{p.note}</p>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>
                ))}
              </ul>
              <button className={`mt-6 w-full rounded-full px-6 py-3 font-bold ${p.featured ? "bg-gradient-primary text-primary-foreground" : "border border-primary text-primary"}`}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      <section id="compare" className="bg-secondary py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Feature Comparison</p>
            <h2 className="mt-3 font-serif text-4xl">Free vs. Premium</h2>
          </div>
          <div className="mt-10 overflow-x-auto rounded-3xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 font-semibold text-muted-foreground">Feature</th>
                  <th className="p-4 text-center font-bold">Free</th>
                  <th className="p-4 text-center font-bold text-accent">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((g) => (
                  <Fragment key={g.group}>
                    <tr className="bg-secondary/60">
                      <td colSpan={3} className="p-3 font-bold uppercase tracking-wide text-xs text-primary">{g.group}</td>
                    </tr>
                    {g.rows.map(([name, free, premium]) => (
                      <tr key={name as string} className="border-t">
                        <td className="p-4">{name}</td>
                        <td className="p-4 text-center"><Cell value={free} /></td>
                        <td className="p-4 text-center"><Cell value={premium} /></td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm font-medium text-muted-foreground">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            Cards handled securely by Stripe — never stored by us
          </p>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© 2026 SheAI. SheAI provides information and context and does not guarantee safety.</footer>
    </div>
  );
}
