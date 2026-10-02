"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SlideUpProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Reveals content by sliding it up from behind a clipping mask.
 */
export function SlideUp({ children, className, delay = 0 }: SlideUpProps) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
