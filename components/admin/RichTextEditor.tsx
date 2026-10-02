"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Redo2, Strikethrough, Undo2, Unlink } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

function ToolbarButton({ onClick, active, label, children, disabled }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn("rounded-md p-2 transition-colors hover:bg-muted disabled:opacity-40", active && "bg-brand-100 text-brand-800")}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://…)", prev ?? "https://");
    if (url === null) return;
    if (!url || url === "https://") return editor.chain().focus().unsetLink().run();
    if (!/^(https?:\/\/|\/)/.test(url)) return window.alert("Links must start with https:// or /");
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("purpose", "content");
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (err) {
      window.alert((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-0.5 border-b bg-muted/40 p-1.5" role="toolbar" aria-label="Formatting">
      <ToolbarButton label="Heading" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Subheading" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
        <Heading3 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
        <Strikethrough className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Add link" onClick={setLink} active={editor.isActive("link")}>
        <Link2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")}>
        <Unlink className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Insert image" onClick={() => fileRef.current?.click()} disabled={uploading}>
        <ImagePlus className="size-4" />
      </ToolbarButton>
      <span className="mx-1 w-px bg-border" aria-hidden />
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo2 className="size-4" />
      </ToolbarButton>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void uploadImage(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** TipTap rich-text editor (output is sanitized again on the server). */
export function RichTextEditor({ value, onChange, invalid }: { value: string; onChange: (html: string) => void; invalid?: boolean }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true } }), Image],
    content: value,
    editorProps: { attributes: { class: "prose-content min-h-72 px-4 py-3 outline-none", "aria-label": "Content" } },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-white focus-within:ring-3 focus-within:ring-ring/50", invalid && "border-destructive")}>
      {editor ? <Toolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
