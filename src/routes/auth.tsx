import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";
import logoAsset from "@/assets/sheai-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SheAI" },
      { name: "description", content: "Sign in or create your free SheAI account." },
      { property: "og:title", content: "Sign in — SheAI" },
      { property: "og:description", content: "Sign in or create your free SheAI account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => data.user && navigate({ to: "/dashboard" }));
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) navigate({ to: "/dashboard" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name } },
      });
      if (error) toast.error(error.message);
      else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    }
    setBusy(false);
  }

  async function social(provider: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error(r.error.message ?? "Sign-in failed");
  }

  const input = "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary";
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-xl">
        <a href="/" className="mx-auto flex w-fit flex-col items-center">
          <img src={logoAsset.url} alt="SheAI" className="h-16 w-16" />
        </a>
        <h1 className="mt-4 text-center font-serif text-3xl font-semibold">{mode === "in" ? "Welcome back" : "Create your free account"}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Built for Women.</p>
        {sent ? (
          <p className="mt-6 rounded-2xl bg-secondary p-4 text-center text-sm">Check your inbox to confirm your email, then come back to sign in.</p>
        ) : (
          <>
            <div className="mt-6 grid gap-2">
              <button onClick={() => social("google")} className="w-full rounded-full border px-4 py-3 text-sm font-semibold hover:bg-secondary">Continue with Google</button>
              <button type="button" className="lovable-auth-button" onClick={() => social("lovable")}>Continue with Lovable</button>
            </div>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
            <form onSubmit={submit} className="grid gap-3">
              {mode === "up" && <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />}
              <input className={input} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className={input} type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button disabled={busy} className="rounded-full bg-gradient-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60">
                {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "in" ? "New to SheAI?" : "Already have an account?"}{" "}
              <button className="font-semibold text-accent" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "Create one" : "Sign in"}</button>
            </p>
          </>
        )}
        <a href="/sos" className="mt-6 block rounded-full bg-destructive px-4 py-3 text-center text-sm font-bold text-destructive-foreground">Need help now? Open SOS — no login needed</a>
      </div>
    </div>
  );
}
