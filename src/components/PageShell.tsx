import { motion } from "motion/react";
import { Fragment, type ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="pt-20"
    >
      {children}
    </motion.main>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl mb-16">
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="inline-flex items-center gap-2 mb-5"
        >
          <span className={`h-px w-8 ${light ? "bg-[#ff9f43]" : "bg-orange"}`} />
          <span className={`text-xs font-semibold uppercase tracking-[0.25em] ${light ? "text-[#ff9f43]" : "text-orange"}`}>
            {eyebrow}
          </span>
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance ${
          light ? "text-white" : "text-navy-deep"
        }`}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className={`mt-6 text-lg leading-relaxed max-w-2xl ${
            light ? "text-white/60" : "text-muted-foreground"
          }`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function GradientItalic({ text, className = "" }: { text?: string; className?: string }) {
  if (!text) return null;
  const words = text.split(" ");
  return (
    <>
      {words.map((word, idx) => (
        <Fragment key={idx}>
          <span className={`text-gradient-orange italic inline-block ${className}`}>
            {word}
          </span>
          {idx < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </>
  );
}
