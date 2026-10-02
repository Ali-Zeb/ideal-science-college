"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "isc-assistant-chat";
const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Assalam-o-Alaikum! I'm the Ideal Science College assistant. Ask me about programs, fees, eligibility or how to apply — in English or Urdu.",
};
const SUGGESTIONS = [
  "Which programs do you offer?",
  "What is the fee for FSc Pre-Medical?",
  "How do I apply online?",
  "Admission ke liye kya documents chahiye?",
];

function loadHistory(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatMessage[]) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [GREETING];
  } catch {
    return [GREETING];
  }
}

/** Turns "/path" mentions in assistant replies into clickable links. */
function renderWithLinks(text: string) {
  const parts = text.split(/(\s\/[a-z0-9\-/]+)/gi);
  return parts.map((part, i) => {
    const match = part.match(/^(\s)(\/[a-z0-9\-/]+)$/i);
    if (!match) return <span key={i}>{part}</span>;
    return (
      <span key={i}>
        {match[1]}
        <a href={match[2]} className="font-medium text-brand-600 underline underline-offset-2">
          {match[2]}
        </a>
      </span>
    );
  });
}

/** Floating AI help assistant that answers visitor questions about the college. */
export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => setMessages(loadHistory()), []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
    } catch {
      /* storage unavailable — chat still works in memory */
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const content = text.trim().slice(0, 1500);
    if (!content || loading) return;
    setError(null);
    setInput("");

    const history = [...messages, { role: "user" as const, content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const payload = history.filter((m, i) => !(i === 0 && m.role === "assistant")).slice(-12);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "The assistant is unavailable right now.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setMessages(history);
      setError((err as Error).message);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([GREETING]);
    setError(null);
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open college assistant"}
        aria-expanded={open}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-4 bottom-4 z-[70] flex size-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-2xl shadow-brand-900/40 ring-4 ring-gold-400/40 sm:right-6 sm:bottom-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? "x" : "chat"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
            {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
          </motion.span>
        </AnimatePresence>
        {!open ? <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white bg-leaf-500" aria-hidden /> : null}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Ideal Science College assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed right-4 bottom-22 z-[70] flex h-[min(600px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-sm origin-bottom-right flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl sm:right-6 sm:bottom-24"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-brand-800 to-brand-600 px-4 py-3 text-white">
              <span className="relative size-10 overflow-hidden rounded-full bg-white ring-2 ring-gold-400">
                <Image src="/images/logo.jpg" alt="" fill sizes="40px" className="object-contain" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Ideal Assistant</p>
                <p className="flex items-center gap-1.5 text-xs text-white/75">
                  <span className="size-2 rounded-full bg-leaf-400" aria-hidden /> AI help · answers may need confirming
                </p>
              </div>
              <button type="button" onClick={reset} className="rounded-md p-1.5 hover:bg-white/10" aria-label="Start a new chat">
                <RotateCcw className="size-4" />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2", m.role === "user" && "justify-end")}>
                  {m.role === "assistant" ? (
                    <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <Bot className="size-4" aria-hidden />
                    </span>
                  ) : null}
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                      m.role === "user" ? "rounded-br-sm bg-brand-700 text-white" : "rounded-bl-sm bg-white text-foreground shadow-sm",
                    )}
                  >
                    {m.content ? (
                      m.role === "assistant" ? renderWithLinks(m.content) : m.content
                    ) : (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" /> Thinking…
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {messages.length <= 1 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs text-brand-700 transition-colors hover:bg-brand-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
              {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p> : null}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-end gap-2 border-t bg-white p-3"
            >
              <label htmlFor="assistant-input" className="sr-only">
                Your question
              </label>
              <textarea
                id="assistant-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                maxLength={1500}
                placeholder="Ask about admissions, fees…"
                className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border bg-muted/40 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:opacity-40"
                aria-label="Send"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
