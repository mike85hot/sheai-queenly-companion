import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Phone, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCredits } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "Trusted contacts — SheAI" },
      { name: "description", content: "Choose who SheAI alerts when you need help." },
      { property: "og:title", content: "Trusted contacts — SheAI" },
      { property: "og:description", content: "Choose who SheAI alerts when you need help." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactsPage,
});

export async function fetchContacts() {
  const { data, error } = await supabase.from("trusted_contacts").select("*").order("created_at");
  if (error) throw error;
  return data;
}

function ContactsPage() {
  const qc = useQueryClient();
  const contacts = useQuery({ queryKey: ["contacts"], queryFn: fetchContacts });
  const credits = useQuery({ queryKey: ["credits"], queryFn: fetchCredits });
  const [f, setF] = useState({ name: "", phone: "", relationship: "" });
  const limit = credits.data ? ({ free: 2, trial: 4, premium: Infinity } as const)[credits.data.plan] : 2;
  const count = contacts.data?.length ?? 0;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\+?[\d\s().-]{7,}$/.test(f.phone)) { toast.error("Enter a valid phone number"); return; }
    const { error } = await supabase.from("trusted_contacts").insert({ name: f.name, phone: f.phone, relationship: f.relationship || null });
    if (error) { toast.error(error.message); return; }
    setF({ name: "", phone: "", relationship: "" });
    qc.invalidateQueries({ queryKey: ["contacts"] });
  }
  async function remove(id: string) {
    await supabase.from("trusted_contacts").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["contacts"] });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="font-serif text-3xl font-semibold">Trusted contacts</h1>
        <p className="text-sm text-muted-foreground">{count} of {limit === Infinity ? "unlimited" : limit} used on your {credits.data?.plan ?? "free"} plan.</p>
        <ul className="mt-4 grid gap-3">
          {contacts.data?.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
              <div><p className="font-semibold">{c.name} {c.relationship && <span className="text-sm font-normal text-muted-foreground">· {c.relationship}</span>}</p><p className="text-sm text-muted-foreground">{c.phone}</p></div>
              <div className="flex gap-1">
                <a href={`tel:${c.phone}`} aria-label="Call" className="rounded-full p-2 hover:bg-secondary"><Phone className="h-4 w-4" /></a>
                <a href={`sms:${c.phone}`} aria-label="Text" className="rounded-full p-2 hover:bg-secondary"><MessageSquare className="h-4 w-4" /></a>
                <button onClick={() => remove(c.id)} aria-label="Remove" className="rounded-full p-2 text-destructive hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
          {contacts.data && count === 0 && <li className="rounded-2xl bg-secondary p-6 text-center text-sm">Add the people you'd want to know if something felt wrong.</li>}
        </ul>
      </section>
      <form onSubmit={add} className="grid h-fit gap-3 rounded-3xl border bg-card p-6">
        <p className="font-semibold">Add a contact</p>
        <input required placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="rounded-xl border bg-background px-4 py-3 text-sm" />
        <input required placeholder="Phone (+1 555 123 4567)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="rounded-xl border bg-background px-4 py-3 text-sm" />
        <input placeholder="Relationship (optional)" value={f.relationship} onChange={(e) => setF({ ...f, relationship: e.target.value })} className="rounded-xl border bg-background px-4 py-3 text-sm" />
        <button disabled={count >= limit} className="rounded-full bg-gradient-primary py-3 font-bold text-primary-foreground disabled:opacity-50">{count >= limit ? "Limit reached — upgrade for more" : "Add contact"}</button>
      </form>
    </div>
  );
}
