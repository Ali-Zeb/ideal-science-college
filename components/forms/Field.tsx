"use client";

import { forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + hint/error wrapper used by every form. */
export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required ? <span className="text-destructive" aria-hidden> *</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = React.ComponentProps<typeof Input> & { invalid?: boolean };

/** Text input that wires `aria-invalid` and a taller touch-friendly height. */
export const TextInput = forwardRef<HTMLInputElement, InputProps>(function TextInput({ invalid, className, id, ...props }, ref) {
  return (
    <Input
      ref={ref}
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      className={cn("h-11", className)}
      {...props}
    />
  );
});

type TextareaProps = React.ComponentProps<typeof Textarea> & { invalid?: boolean };

/** Multi-line text input. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(function TextArea({ invalid, id, ...props }, ref) {
  return <Textarea ref={ref} id={id} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} {...props} />;
});

/** Password input with a show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput({ invalid, className, id, ...props }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        ref={ref}
        id={id}
        type={show ? "text" : "password"}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={cn("h-11 pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});

/** Native select styled like the inputs (works well with react-hook-form `register`). */
export const SelectInput = forwardRef<HTMLSelectElement, React.ComponentProps<"select"> & { invalid?: boolean }>(function SelectInput(
  { invalid, className, id, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      id={id}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

/** Applies server-side field errors (from an ActionResult) to react-hook-form. */
export function applyServerErrors(
  fieldErrors: Record<string, string[] | undefined> | undefined,
  setError: (name: never, error: { type: string; message: string }) => void,
) {
  if (!fieldErrors) return;
  for (const [name, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) setError(name as never, { type: "server", message: messages[0] });
  }
}
