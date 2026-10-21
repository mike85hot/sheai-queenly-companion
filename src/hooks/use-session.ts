import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSessionUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return { user, ready };
}

export type Profile = {
  id: string;
  display_name: string | null;
  blood_type: string | null;
  allergies: string | null;
  home_address: string | null;
  plan: string;
  trial_ends_at: string | null;
  safe_code: string | null;
  duress_code: string | null;
};

export type CreditStatus = { plan: "free" | "trial" | "premium"; limit: number; used: number; remaining: number };

export async function fetchProfile(): Promise<Profile | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
  return (data as Profile) ?? null;
}

export async function fetchCredits(): Promise<CreditStatus> {
  const { data, error } = await supabase.rpc("ai_credit_status");
  if (error) throw error;
  return data as unknown as CreditStatus;
}
