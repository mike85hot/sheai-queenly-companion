import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchCredits, fetchProfile, type Profile } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Emergency profile — SheAI" },
      { name: "description", content: "Your emergency details, secret codewords and plan." },
      { property: "og:title", content: "Emergency profile — SheAI" },
      { property: "og:description", content: "Your emergency details, secret codewords and plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const credits = useQuery({ queryKey: ["credits"], queryFn: fetchCredits });
  const [form, setForm] = useState<Partial<Profile>>({});
  useEffect(() => {
    if (profile.data) setForm(profile.data);
  }, [profile.data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (form.safe_code && form.safe_code === form.duress_code) return toast.error("Safe and duress codewords must be different.");
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name, blood_type: form.blood_type, allergies: form.allergies,
        home_address: form.home_address, safe_code: form.safe_code || null, duress_code: form.duress_code || null,
      })
      .eq("id", profile.data!.id);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["profile"] }); }
  }
  async function startTrial() {
    const { error } = await supabase.rpc("start_free_trial");
    if (error) return toast.error(error.message);
    toast.success("Your 7-day trial has started");
    qc.invalidateQueries();
  }

  const field = (k: keyof Profile, label: string, placeholder = "", type = "text") => (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      <input type={type} className="rounded-xl border bg-background px-4 py-3" placeholder={placeholder} value={(form[k] as string) ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
    </label>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <form onSubmit={save} className="grid gap-4 rounded-3xl border bg-card p-6">
        <h1 className="font-serif text-3xl font-semibold">Emergency profile</h1>
        {field("display_name", "Name")}
        <div className="grid gap-4 sm:grid-cols-2">{field("blood_type", "Blood type (optional)", "e.g. O+")}{field("allergies", "Allergies / medical notes (optional)")}</div>
        {field("home_address", "Home address")}
        <div className="rounded-2xl bg-secondary p-4">
          <p className="font-semibold">Secret codewords</p>
          <p className="text-sm text-muted-foreground">Used to end a Walk Me Home trip. Your <b>safe</b> word ends it normally. Your <b>duress</b> word looks exactly the same on screen, but silently raises an alert to your trusted circle.</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">{field("safe_code", "Safe codeword", "", "password")}{field("duress_code", "Duress codeword", "", "password")}</div>
        </div>
        <button className="rounded-full bg-gradient-primary py-3 font-bold text-primary-foreground">Save profile</button>
      </form>
      <aside className="h-fit rounded-3xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">Your plan</p>
        <p className="font-serif text-3xl font-semibold capitalize">{credits.data?.plan ?? "…"}</p>
        {credits.data && <p className="mt-2 text-sm">{credits.data.remaining} of {credits.data.limit} AI credits left {credits.data.plan === "free" ? "(one-time)" : "today, resets at midnight UTC"}</p>}
        {profile.data?.plan === "trial" && profile.data.trial_ends_at && <p className="mt-2 text-sm text-muted-foreground">Trial ends {new Date(profile.data.trial_ends_at).toLocaleDateString()}</p>}
        {credits.data?.plan === "free" && !profile.data?.trial_ends_at && (
          <button onClick={startTrial} className="mt-4 w-full rounded-full bg-accent py-3 font-bold text-accent-foreground">Start 7-day free trial</button>
        )}
      </aside>
    </div>
  );
}
