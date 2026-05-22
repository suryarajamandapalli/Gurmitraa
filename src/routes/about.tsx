import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import React from "react";
import * as Icons from "lucide-react";
import { PageShell, SectionHeader, Reveal, GradientItalic } from "@/components/PageShell";
import { fetchPageData } from "@/lib/cms";
import { DEFAULT_ABOUT } from "@/lib/cms-defaults";

export const Route = createFileRoute("/about")({
  loader: async () => {
    const pageData = await fetchPageData("about");
    return { pageData };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.pageData || DEFAULT_ABOUT;
    return {
      meta: [
        { title: page.seo?.title || "About — GURMITRAA" },
        {
          name: "description",
          content:
            page.seo?.description ||
            "GURMITRAA is a software product development and IT consulting studio from India. Meet the team behind the craft.",
        },
      ],
    };
  },
  component: About,
});

const getIcon = (name: string) => {
  const IconComponent = (Icons as any)[name];
  return IconComponent || Icons.HelpCircle;
};

function About() {
  const { pageData } = Route.useLoaderData();
  const page = pageData || DEFAULT_ABOUT;
  const sections = page.sections || DEFAULT_ABOUT.sections;

  // Reorder and filter active sections
  const activeSections = [...sections]
    .filter((s: any) => s.active !== false && s.id !== "team")
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
                className="relative -mt-20 bg-navy-deep text-white overflow-hidden pt-36 pb-16"
              >
                <div className="absolute inset-0 grid-bg opacity-60" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,122,0,0.25),transparent_60%)]" />
                <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs uppercase tracking-[0.3em] text-orange mb-6"
                    >
                      {c.eyebrow}
                    </motion.div>
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-balance"
                    >
                      {c.title}
                      <GradientItalic text={c.titleItalic} />
                      {c.titleSuffix}
                    </motion.h1>
                  </div>
                  <div className="lg:col-span-4 lg:pt-16">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/70 leading-relaxed"
                    >
                      {c.description}
                    </motion.p>
                  </div>
                </div>
              </section>
            );

          case "story":
            return (
              <section key={section.id} className="py-20 bg-background">
                <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
                  <Reveal>
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
                    <div className="space-y-5 text-muted-foreground leading-relaxed">
                      <p>{c.paragraph1}</p>
                      <p>{c.paragraph2}</p>
                    </div>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-navy-deep">
                      <img
                        src={c.imageUrl || "/images/about_story.png"}
                        alt="Gurmitraa Workspace"
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/80 to-transparent" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,122,0,0.35),transparent_55%)]" />
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="font-display text-white text-center px-8 z-10">
                          <div className="text-orange text-sm tracking-[0.4em]">EST. 2013</div>
                          <div className="mt-4 text-5xl font-bold">{c.yearsText}</div>
                          <div className="mt-2 text-white/60 text-sm">{c.yearsSub}</div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </section>
            );

          case "vision_mission":
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
                  <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <Reveal>
                      <div className="bg-card border border-border rounded-3xl p-10 h-full">
                        <div className="text-xs uppercase tracking-[0.3em] text-orange mb-4">
                          Vision
                        </div>
                        <p className="font-display text-2xl leading-snug text-navy-deep">
                          {c.visionText}
                        </p>
                      </div>
                    </Reveal>
                    <Reveal delay={0.1}>
                      <div className="bg-navy-deep text-white rounded-3xl p-10 h-full relative overflow-hidden">
                        <div className="absolute inset-0 grid-bg opacity-40" />
                        <div className="relative">
                          <div className="text-xs uppercase tracking-[0.3em] text-orange mb-4">
                            Mission
                          </div>
                          <p className="font-display text-2xl leading-snug">{c.missionText}</p>
                        </div>
                      </div>
                    </Reveal>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(c.values || []).map((v: any, i: number) => {
                      const Icon = getIcon(v.icon);
                      return (
                        <motion.div
                          key={v.t}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.07 }}
                          className="bg-card border border-border rounded-2xl p-6 hover:border-orange transition group"
                        >
                          <Icon
                            className="text-orange mb-4 group-hover:scale-110 transition"
                            size={26}
                          />
                          <h4 className="font-display font-semibold text-lg mb-1">{v.t}</h4>
                          <p className="text-sm text-muted-foreground">{v.d}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );

          // Team section removed

          case "why_us":
            return (
              <section
                key={section.id}
                className="py-20 bg-navy-deep text-white relative overflow-hidden"
              >
                <div className="absolute inset-0 grid-bg opacity-50" />
                <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16">
                  <div>
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
                    <Reveal delay={0.1}>
                      <div className="relative aspect-[16/10] mt-8 rounded-2xl overflow-hidden bg-navy-deep border border-white/10">
                        <img
                          src={c.imageUrl || "/images/about_why_us.png"}
                          alt="Our Team Collaborating"
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-transparent to-transparent" />
                      </div>
                    </Reveal>
                  </div>
                  <div className="space-y-4">
                    {(c.items || []).map((p: string, i: number) => (
                      <motion.div
                        key={p}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-4 glass-dark rounded-2xl p-5"
                      >
                        <Icons.CheckCircle2
                          className="text-orange flex-shrink-0 mt-0.5"
                          size={20}
                        />
                        <span className="text-white/90">{p}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "timeline":
            return (
              <section key={section.id} className="py-20 bg-background">
                <div className="mx-auto max-w-5xl px-6">
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
                  <div className="relative">
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-orange via-orange/30 to-transparent" />
                    <div className="space-y-12">
                      {(c.list || []).map((t: any, i: number) => (
                        <motion.div
                          key={t.y}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className={`relative flex items-start gap-6 md:gap-0 ${
                            i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                          }`}
                        >
                          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-orange ring-4 ring-orange/20" />
                          <div
                            className={`md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"} pl-12 md:pl-0`}
                          >
                            <div className="text-orange font-display text-3xl font-bold">{t.y}</div>
                            <h4 className="font-display text-xl font-semibold mt-1">{t.t}</h4>
                            <p className="text-muted-foreground text-sm mt-2">{t.d}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );

          case "cta":
            return (
              <section key={section.id} className="py-20 bg-mist">
                <div className="mx-auto max-w-5xl px-6 text-center">
                  {c.icon && React.createElement((Icons as any)[c.icon] || Icons.Award, { className: "text-orange mx-auto mb-6", size: 40 })}
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-balance">
                    {c.title}
                    <GradientItalic text={c.titleItalic} />
                    {c.titleSuffix}
                  </h2>
                  <Link
                    to={c.ctaLink}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange px-7 py-4 font-semibold text-white glow-orange"
                  >
                    {c.ctaText} <Icons.ArrowRight size={18} />
                  </Link>
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
