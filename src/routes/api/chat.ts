import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai/run-id.server";
import { systemPrompt, type AssistantMode } from "@/lib/ai/assistant-modes";

const json = (status: number, message: string) =>
  new Response(JSON.stringify({ error: message }), { status, headers: { "content-type": "application/json" } });

async function handleChat(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, "Please sign in to use the assistant.");

  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}`, apikey: key } },
  });
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData.user) return json(401, "Your session has expired. Please sign in again.");

  const body = (await request.json()) as { messages?: UIMessage[]; mode?: string; cyclePhase?: string };
  const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
  if (!messages.length) return json(400, "No message to send.");
  const mode: AssistantMode = body.mode === "meals" || body.mode === "fitness" ? body.mode : "safety";

  const { data: credit, error: creditErr } = await supabase.rpc("consume_ai_credit");
  if (creditErr) return json(500, "Couldn't check your AI credits. Please try again.");
  if (!(credit as { ok: boolean }).ok)
    return json(402, "You're out of AI credits. Free accounts get 8 one-time credits; Trial and Premium get 40 per day.");

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json(500, "AI is not configured.");

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: systemPrompt(mode, body.cyclePhase),
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: true,
      onError: (e) => {
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 429) return "SheAI is busy right now. Please try again in a moment.";
        if (status === 402) return "The app's AI credits are used up. Please try again later.";
        return "Something went wrong generating a reply.";
      },
    }),
    runIdFetch,
  );
}

export const Route = createFileRoute("/api/chat")({
  server: { handlers: { POST: ({ request }) => handleChat(request) } },
});
