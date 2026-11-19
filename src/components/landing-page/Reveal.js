"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Fade + rise-in wrapper for the landing page. Elements appear one after
 * another: pass an increasing `delay` to stagger siblings.
 *  - default: animates once when scrolled into view
 *  - `immediate`: animates on mount (for above-the-fold content)
 * Honors prefers-reduced-motion by rendering a plain div.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  immediate = false,
  className = "",
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  const target = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(immediate
        ? { animate: target }
        : { whileInView: target, viewport: { once: true, amount: 0.2 } })}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
