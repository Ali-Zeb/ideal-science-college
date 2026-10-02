"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
  image: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  priority?: boolean;
  strength?: number;
}

/**
 * Section with a background image that moves slower than the page (parallax).
 */
export function ParallaxSection({
  image,
  alt,
  children,
  className,
  overlayClassName,
  priority = false,
  strength = 18,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    <section ref={ref} className={cn("relative isolate overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-[-20%_0] -z-20">
        <Image src={image} alt={alt} fill priority={priority} sizes="100vw" className="object-cover" />
      </motion.div>
      <div className={cn("absolute inset-0 -z-10 bg-brand-900/75", overlayClassName)} />
      {children}
    </section>
  );
}
