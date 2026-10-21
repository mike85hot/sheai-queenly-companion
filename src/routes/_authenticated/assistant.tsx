import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ShieldHalf, Salad, Dumbbell } from "lucide-react";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { supabase } from "@/integrations/supabase/client";
import { fetchCredits } from "@/hooks/use-session";
import { CYCLE_PHASES, MODES, type AssistantMode } from "@/lib/ai/assistant-modes";

export const Route = createFileRoute("/_authenticated/assistant")({
  validateSearch: z.object({ mode: z.enum(["safety", "meals", "fitness"]).catch("safety") }),
  head: () => ({
    meta: [
      { title: "SheAI Assistant — Safety, Meals & Fitness" },
      { name: "description", content: "AI-powered safety advice, meal plans with grocery lists, and cycle-synced workouts." },
      { property: "og:title", content: "SheAI Assistant" },
      { property: "og:description", content: "AI-powered safety advice, meal plans and cycle-synced workouts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssistantPage,
});

const icons = { safety: ShieldHalf, meals: Salad, fitness: Dumbbell };

function AssistantPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div className="flex gap-2 overflow-x-auto pb-3">
        {(Object.keys(MODES) as AssistantMode[]).map((m) => {
          const I = icons[m];
          return (
            <button key={m} onClick={() => navigate({ search: { mode: m } })} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm ${m === mode ? "border-primary bg-primary text-primary-foreground" : ""}`}>
              <I className="h-4 w-4" />{MODES[m].label}
            </button>
          );
        })}
      </div>
      <ChatPane key={mode} mode={mode} />
    </div>
  );
}

function ChatPane({ mode }: { mode: AssistantMode }) {
  const qc = useQueryClient();
  const credits = useQuery({ queryKey: ["credits"], queryFn: fetchCredits });
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<string>(CYCLE_PHASES[0]);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const Icon = icons[mode];

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
        },
        body: () => ({ mode, cyclePhase: phaseRef.current }),
        fetch: async (url, init) => {
          const res = await fetch(url, init);
          if (!res.ok) {
            const msg = await res.clone().json().then((j: { error?: string }) => j.error).catch(() => null);
            throw new Error(msg ?? `Request failed (${res.status})`);
          }
          return res;
        },
      }),
    [mode],
  );
  const { messages, sendMessage, status, stop } = useChat({
    transport,
    onError: (e) => toast.error(e.message),
    onFinish: () => qc.invalidateQueries({ queryKey: ["credits"] }),
  });
  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-3xl border bg-card">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState icon={<Icon className="h-10 w-10 text-accent" />} title={MODES[mode].label} description={MODES[mode].blurb}>
              <div className="flex flex-col items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary"><Icon className="h-7 w-7 text-accent" /></span>
                <p className="font-serif text-2xl font-semibold">{MODES[mode].label}</p>
                <p className="max-w-sm text-center text-sm text-muted-foreground">{MODES[mode].blurb}</p>
                <div className="mt-2 grid w-full max-w-md gap-2">
                  {MODES[mode].suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-2xl border px-4 py-3 text-left text-sm hover:bg-secondary">{s}</button>
                  ))}
                </div>
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageContent className={m.role === "user" ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground" : ""}>
                  {m.parts.map((p, i) => (p.type === "text" ? <MessageResponse key={i}>{p.text}</MessageResponse> : null))}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer className="text-sm">SheAI is thinking…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t p-3">
        <PromptInput onSubmit={(msg) => send(msg.text ?? "")}>
          <PromptInputTextarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask SheAI…" />
          <PromptInputFooter>
            <PromptInputTools>
              {mode === "fitness" && (
                <select value={phase} onChange={(e) => setPhase(e.target.value)} className="rounded-full border bg-background px-3 py-1 text-xs">
                  {CYCLE_PHASES.map((c) => <option key={c}>{c}</option>)}
                </select>
              )}
              {credits.data && <span className="text-xs text-muted-foreground">{credits.data.remaining} credits left</span>}
            </PromptInputTools>
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !input.trim()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
