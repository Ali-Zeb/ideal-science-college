import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { buildAssistantSystemPrompt } from "@/lib/ai/knowledge";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isDbConfigured } from "@/lib/db/connect";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-5-5";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1500),
      }),
    )
    .min(1)
    .max(20)
    .refine((m) => m[0]?.role === "user" && m[m.length - 1]?.role === "user", "Conversation must start and end with the visitor"),
});

const FALLBACK_REPLY =
  "Sorry, I can't help with that here. For admissions questions please call the college office or use the contact page at /contact.";

/**
 * POST /api/chat — streams the website assistant's reply as plain text.
 * Body: `{ messages: { role: "user" | "assistant"; content: string }[] }`.
 */
export async function POST(req: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "The assistant is not configured yet." }, { status: 503 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    const result = bodySchema.safeParse(await req.json());
    if (!result.success) return Response.json({ error: "Invalid message." }, { status: 400 });
    parsed = result.data;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (isDbConfigured()) {
    const ip = await getClientIp();
    const limit = await rateLimit(`chat:${ip}`, 25, 10 * 60);
    if (!limit.allowed) {
      return Response.json(
        { error: "You're sending messages too quickly. Please wait a few minutes." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }
  }

  const system = await buildAssistantSystemPrompt();
  const client = new Anthropic();

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: parsed.messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sentText = false;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            sentText = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal" || !sentText) {
          controller.enqueue(encoder.encode(sentText ? `\n\n${FALLBACK_REPLY}` : FALLBACK_REPLY));
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          controller.enqueue(encoder.encode("The assistant is busy right now. Please try again in a minute."));
        } else if (error instanceof Anthropic.APIError) {
          console.error(`[chat] Anthropic API error ${error.status}:`, error.message);
          controller.enqueue(encoder.encode("The assistant is temporarily unavailable. Please try again shortly."));
        } else {
          console.error("[chat]", error);
          controller.enqueue(encoder.encode("Something went wrong. Please try again."));
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
