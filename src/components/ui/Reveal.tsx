"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { motion as motionTokens } from "@/lib/design-tokens";

/**
 * Purposeful reveal only: 16px up, 400ms, ease-out, runs once.
 * With prefers-reduced-motion the offset is dropped and only opacity fades.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: reduced ? 0 : motionTokens.reveal.distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: motionTokens.reveal.duration / 1000, delay, ease: motionTokens.reveal.ease }}
    >
      {children}
    </motion.div>
  );
}

export { SectionHeading } from "./SectionHeading";
