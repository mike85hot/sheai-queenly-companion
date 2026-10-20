import { createFileRoute } from "@tanstack/react-router";
import { Shield, Plane, Heart, Dumbbell, Sparkles, Phone, MapPin, Crown, Check, ShoppingBag, Utensils, Hotel, Siren } from "lucide-react";
import logoAsset from "@/assets/sheai-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SheAI — Every woman deserves her own AI" },
      { name: "description", content: "SheAI is a women-first predictive intelligence platform for safety, travel, health, wellness and fitness." },
      { property: "og:title", content: "SheAI — Every woman deserves her own AI" },
      { property: "og:description", content: "Safety, travel, wellness and fitness AI built by women, for women." },
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
          <a href="tel:911" className="flex items-center gap-1 rounded-full bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground"><Phone className="h-4 w-4" />911</a>
          <button className="hidden items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground sm:flex"><MapPin className="h-4 w-4" />Share Location</button>
          <button className="rounded-full border border-primary px-4 py-2 text-sm text-primary">Login</button>
        </div>
      </header>

      <section className="bg-gradient-hero">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="font-serif text-5xl leading-tight md:text-6xl">Every woman deserves her own She<span className="text-accent">AI</span></h1>
            <p className="mt-5 text-xl font-medium">Predictive intelligence, built by women, for women.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {pills.map(({ icon: I, label }) => (
                <span key={label} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-medium"><I className="h-4 w-4 text-primary" />{label}</span>
              ))}
            </div>
            <p className="mt-6 font-bold">Smart. Safe. Sovereign.</p>
            <p className="mt-3 text-muted-foreground">An AI built to protect, elevate and empower you — because your safety, health, balance and dreams deserve the smartest support.</p>
          </div>
          <div className="rounded-3xl border bg-card p-8 shadow-sm">
            <button className="w-full rounded-full border border-primary px-6 py-3 font-semibold text-primary">Create a Free SheAI Account</button>
            <p className="mt-6 text-center"><b>Coming soon 👑</b> SheAI is launching soon — join us as we bring the next generation of predictive intelligence to women first.</p>
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 py-4 font-bold text-primary-foreground"><Crown className="h-5 w-5" />Reserve Your Early Access</button>
            <p className="mt-6 flex gap-2 rounded-2xl border p-4 text-sm"><Check className="h-4 w-4 shrink-0 text-primary" />Early app access, founding member perks and an exclusive launch discount.</p>
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
          <h2 className="font-serif text-4xl">Built for women, by women</h2>
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

      <section id="pricing" className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <div className="rounded-3xl bg-gradient-primary p-12 text-primary-foreground">
          <p className="font-serif text-7xl">$0</p>
          <p className="mt-2 text-2xl font-bold">Free Forever</p>
          <p className="mt-3 opacity-90">Core safety stays free — the emergency hub, crisis hotlines and SOS sharing, for every woman.</p>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© 2026 SheAI. SheAI provides information and context and does not guarantee safety.</footer>
    </div>
  );
}
