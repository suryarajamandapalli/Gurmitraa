import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import React, { useState } from "react";
import * as Icons from "lucide-react";
import { PageShell, SectionHeader, Reveal, GradientItalic } from "@/components/PageShell";
import { fetchPageData } from "@/lib/cms";
import { DEFAULT_SERVICES } from "@/lib/cms-defaults";

export const Route = createFileRoute("/services")({
  loader: async () => {
    const pageData = await fetchPageData("services");
    return { pageData };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.pageData || DEFAULT_SERVICES;
    return {
      meta: [
        { title: page.seo?.title || "Services — GURMITRAA" },
        {
          name: "description",
          content:
            page.seo?.description ||
            "Web, mobile, product, consulting, cloud and ecommerce — full-stack digital services delivered with craft.",
        },
      ],
    };
  },
  component: Services,
});

const getIcon = (name: string) => {
  const IconComponent = (Icons as any)[name];
  return IconComponent || Icons.HelpCircle;
};

function Services() {
  const { pageData } = Route.useLoaderData();
  const page = pageData || DEFAULT_SERVICES;
  const sections = page.sections || DEFAULT_SERVICES.sections;

  // Reorder and filter active sections
  const activeSections = [...sections]
    .filter((s: any) => s.active !== false)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <PageShell>
      {activeSections.map((section: any) => {
        const c = section.content;

        switch (section.id) {
          case "hero":
            return (
              <section
                key={section.id}
                className="relative -mt-20 pt-36 pb-16 bg-navy-deep text-white overflow-hidden"
              >
                <div className="absolute inset-0 grid-bg opacity-60" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,122,0,0.3),transparent_55%)]" />
                <div className="relative mx-auto max-w-7xl px-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs uppercase tracking-[0.3em] text-orange mb-6"
                  >
                    {c.eyebrow}
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-balance max-w-5xl"
                  >
                    {c.title}
                    <GradientItalic text={c.titleItalic} />
                    {c.titleSuffix}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 max-w-2xl text-lg text-white/70"
                  >
                    {c.description}
                  </motion.p>
                </div>
              </section>
            );

          case "list":
            return (
              <section key={section.id} className="py-20 bg-background">
                <div className="mx-auto max-w-7xl px-6">
                  <SectionHeader
                    eyebrow={c.eyebrow}
                    title={
                      <>
                        {c.title}
                        <GradientItalic text={c.titleItalic} />
                        {c.titleSuffix}
                      </>
                    }
                  />
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(c.list || []).map((s: any, i: number) => {
                      const Icon = getIcon(s.icon);
                      return (
                        <motion.div
                          key={s.t}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ y: -6 }}
                          className="group relative bg-card border border-border rounded-3xl p-7 hover:border-orange transition flex flex-col animate-card"
                        >
                          <div className="h-12 w-12 rounded-2xl bg-orange/10 grid place-items-center mb-5 group-hover:bg-orange transition">
                            <Icon
                              className="text-orange group-hover:text-white transition"
                              size={22}
                            />
                          </div>
                          <h3 className="font-display text-xl font-semibold mb-2">{s.t}</h3>
                          <p className="text-sm text-muted-foreground mb-5">{s.d}</p>
                          <ul className="space-y-1.5 mb-6 text-xs text-muted-foreground">
                            {(s.b || []).map((x: string) => (
                              <li key={x}>— {x}</li>
                            ))}
                          </ul>
                          <Link
                            to="/contact"
                            className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-navy-deep group-hover:text-orange transition"
                          >
                            Discuss <Icons.ArrowRight size={14} />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );

          case "process":
            return (
              <section key={section.id} className="py-20 bg-mist">
                <div className="mx-auto max-w-7xl px-6">
                  <SectionHeader
                    eyebrow={c.eyebrow}
                    title={
                      <>
                        {c.title}
                        <GradientItalic text={c.titleItalic} />
                        {c.titleSuffix}
                      </>
                    }
                  />
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(c.list || []).map((p: string, i: number) => (
                      <motion.div
                        key={p}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative bg-card rounded-3xl p-8 border border-border overflow-hidden group"
                      >
                        <div className="absolute -right-6 -top-6 font-display text-9xl font-bold text-orange/5 group-hover:text-orange/10 transition">
                          0{i + 1}
                        </div>
                        <h4 className="relative font-display text-2xl font-semibold mb-2">{p}</h4>
                        <p className="relative text-sm text-muted-foreground">
                          {c.descs?.[i] || ""}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "tech_stack":
            return (
              <section
                key={section.id}
                className="py-20 bg-navy-deep text-white relative overflow-hidden"
              >
                <div className="absolute inset-0 grid-bg opacity-40" />
                <div className="relative mx-auto max-w-7xl px-6">
                  <SectionHeader
                    light
                    eyebrow={c.eyebrow}
                    title={
                      <>
                        {c.title}
                        <GradientItalic text={c.titleItalic} />
                        {c.titleSuffix}
                      </>
                    }
                  />
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(c.stack || []).map((tech: string, i: number) => (
                      <motion.div
                        key={tech}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.02 }}
                        whileHover={{ scale: 1.05 }}
                        className="glass-dark rounded-xl px-5 py-4 text-center font-display font-medium hover:bg-orange/20 hover:border-orange transition"
                      >
                        {tech}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "benefits":
            return (
              <section key={section.id} className="py-20 bg-background">
                <div className="mx-auto max-w-7xl px-6">
                  <SectionHeader
                    eyebrow={c.eyebrow}
                    title={
                      <>
                        {c.title}
                        <GradientItalic text={c.titleItalic} />
                        {c.titleSuffix}
                      </>
                    }
                  />
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(c.list || []).map((b: any, i: number) => {
                      const Icon = getIcon(b.icon);
                      return (
                        <Reveal key={b.t} delay={i * 0.08}>
                          <div className="relative bg-gradient-to-br from-navy-deep to-navy text-white rounded-3xl p-8 overflow-hidden h-full">
                            <div className="absolute inset-0 grid-bg opacity-30" />
                            <div className="relative">
                              <Icon className="text-orange mb-5" size={28} />
                              <h4 className="font-display text-xl font-semibold mb-2">{b.t}</h4>
                              <p className="text-sm text-white/60">{b.d}</p>
                            </div>
                          </div>
                        </Reveal>
                      );
                    })}
                  </div>
                </div>
              </section>
            );

          case "faq":
            return (
              <section key={section.id} className="py-20 bg-mist">
                <div className="mx-auto max-w-4xl px-6">
                  <SectionHeader
                    eyebrow={c.eyebrow}
                    title={
                      <>
                        {c.title}
                        <GradientItalic text={c.titleItalic} />
                        {c.titleSuffix}
                      </>
                    }
                  />
                  <div className="space-y-3">
                    {(c.faqs || []).map((f: any, i: number) => (
                      <FaqItem key={f.q} i={i} {...f} />
                    ))}
                  </div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </PageShell>
  );
}

function FaqItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(i === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-6 text-left"
      >
        <span className="font-display font-semibold text-lg">{q}</span>
        {open ? (
          <Icons.Minus size={18} className="text-orange flex-shrink-0" />
        ) : (
          <Icons.Plus size={18} className="text-orange flex-shrink-0" />
        )}
      </button>
      <motion.div
        animate={{ height: open ? "auto" : 0 }}
        initial={false}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 text-muted-foreground">{a}</div>
      </motion.div>
    </motion.div>
  );
}
