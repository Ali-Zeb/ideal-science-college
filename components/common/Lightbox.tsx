"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface LightboxImage {
  url: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
}

/** Full-screen image viewer with keyboard (←/→/Esc) and swipe-free button navigation. */
export function Lightbox({ images, index, onClose, onChange }: LightboxProps) {
  const open = index !== null && images[index] !== undefined;
  const prev = useCallback(() => index !== null && onChange((index - 1 + images.length) % images.length), [index, images.length, onChange]);
  const next = useCallback(() => index !== null && onChange((index + 1) % images.length), [index, images.length, onChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, prev, next]);

  return (
    <AnimatePresence>
      {open && index !== null ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button type="button" onClick={onClose} className="absolute top-4 right-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20" aria-label="Close">
            <X className="size-6" />
          </button>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-6"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6"
                aria-label="Next image"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          ) : null}
          <motion.figure
            key={index}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="relative flex h-full max-h-[85vh] w-full max-w-5xl flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-full w-full">
              <Image src={images[index].url} alt={images[index].caption ?? ""} fill sizes="100vw" className="object-contain" />
            </div>
            <figcaption className="mt-4 text-center text-sm text-white/80">
              {images[index].caption} <span className="ml-2 text-white/50">{index + 1} / {images.length}</span>
            </figcaption>
          </motion.figure>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
