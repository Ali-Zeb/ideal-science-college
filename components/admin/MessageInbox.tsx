"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Mail, MailOpen, Phone, Reply, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmAction, StatusBadge } from "./AdminUI";
import { deleteMessage, replyToMessage, setMessageRead } from "@/actions/contact.actions";
import { formatDateTime } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/types";

function MessageRow({ msg }: { msg: ContactMessage }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    setOpen((o) => !o);
    if (!open && !msg.isRead) {
      startTransition(async () => {
        await setMessageRead(msg.id, true);
        router.refresh();
      });
    }
  };

  const sendReply = () =>
    startTransition(async () => {
      const res = await replyToMessage({ id: msg.id, reply });
      if (res.success) {
        toast.success(res.message);
        setReply("");
        setReplying(false);
        router.refresh();
      } else toast.error(res.fieldErrors?.reply?.[0] ?? res.error);
    });

  return (
    <li className={cn("rounded-2xl border bg-card shadow-sm", !msg.isRead && "border-gold-400/60")}>
      <button type="button" onClick={toggle} aria-expanded={open} className="flex w-full items-start gap-4 p-4 text-left">
        <span className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full", msg.isRead ? "bg-muted text-muted-foreground" : "bg-gold-400/20 text-gold-600")}>
          {msg.isRead ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={cn("truncate", !msg.isRead && "font-semibold")}>{msg.name}</span>
            <span className="text-xs text-muted-foreground">{msg.email}</span>
            {msg.repliedAt ? <StatusBadge status="approved" label="Replied" /> : null}
          </span>
          <span className="block truncate text-sm text-muted-foreground">
            <strong className="font-medium text-foreground">{msg.subject}</strong> — {msg.message}
          </span>
        </span>
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{formatDateTime(msg.createdAt)}</span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <div className="space-y-4 border-t px-4 pt-4 pb-5 sm:pl-17">
          <p className="text-sm leading-relaxed whitespace-pre-line">{msg.message}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 hover:text-foreground">
              <Mail className="size-4" /> {msg.email}
            </a>
            {msg.phone ? (
              <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                <Phone className="size-4" /> {msg.phone}
              </a>
            ) : null}
          </div>
          {msg.replyNote ? (
            <div className="rounded-lg bg-brand-50 p-3 text-sm">
              <p className="mb-1 text-xs font-semibold text-brand-700">Your reply · {msg.repliedAt ? formatDateTime(msg.repliedAt) : ""}</p>
              <p className="whitespace-pre-line">{msg.replyNote}</p>
            </div>
          ) : null}
          {replying ? (
            <div className="space-y-3">
              <Textarea rows={5} value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to ${msg.name}…`} aria-label="Reply" />
              <div className="flex gap-2">
                <Button onClick={sendReply} disabled={pending || reply.trim().length < 10}>
                  {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send reply
                </Button>
                <Button variant="ghost" onClick={() => setReplying(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setReplying(true)}>
                <Reply className="size-4" /> Reply by email
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await setMessageRead(msg.id, false);
                    router.refresh();
                  })
                }
              >
                Mark unread
              </Button>
              <ConfirmAction action={() => deleteMessage(msg.id)} title="Delete this message?" />
            </div>
          )}
        </div>
      ) : null}
    </li>
  );
}

/** Expandable list of contact messages with reply/mark/delete actions. */
export function MessageInbox({ messages }: { messages: ContactMessage[] }) {
  return (
    <ul className="space-y-3">
      {messages.map((m) => (
        <MessageRow key={m.id} msg={m} />
      ))}
    </ul>
  );
}
