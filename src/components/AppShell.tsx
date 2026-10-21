import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { LayoutDashboard, Users, Route as RouteIcon, Sparkles, UserRound, LogOut, Siren } from "lucide-react";
import logo from "@/assets/sheai-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/trip", label: "Walk Me Home", icon: RouteIcon },
  { to: "/assistant", label: "Assistant", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={(logo as { url: string }).url} alt="SheAI" className="h-9 w-9" />
            <span className="font-serif text-2xl font-semibold">She<span className="text-accent">AI</span></span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-primary" activeProps={{ className: "bg-secondary text-primary font-semibold" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/sos" className="flex items-center gap-1 rounded-full bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground"><Siren className="h-4 w-4" />SOS</Link>
            <button onClick={signOut} aria-label="Sign out" className="rounded-full border p-2 text-muted-foreground hover:text-primary"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-background md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary font-semibold" }}>
            <n.icon className="h-5 w-5" />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
