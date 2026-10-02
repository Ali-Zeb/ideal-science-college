"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  /** Words (by exact match) to highlight in gold. */
  highlight?: string[];
  /** Animate on mount (hero) instead of on scroll. */
  immediate?: boolean;
}

/**
 * Reveals a heading word by word, each word sliding up from a mask.
 */
export function TextReveal({ text, as = "h2", className, delay = 0, highlight = [], immediate = false }: TextRevealProps) {
  const words = text.split(" ");
  const Tag = motion[as];
  const trigger = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true } };

  return (
    <Tag
      className={cn("flex flex-wrap", className)}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: 0.08, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="mr-[0.25em] inline-block overflow-hidden pb-[0.08em]" aria-hidden>
          <motion.span
            className={cn("inline-block", highlight.includes(word) && "text-gold-400")}
            variants={{
              hidden: { y: "110%", opacity: 0 },
              show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
