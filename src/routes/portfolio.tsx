import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import * as Icons from "lucide-react";
import { PageShell, SectionHeader, Reveal, GradientItalic } from "@/components/PageShell";
import { fetchPageData } from "@/lib/cms";
import { DEFAULT_PORTFOLIO } from "@/lib/cms-defaults";

export const Route = createFileRoute("/portfolio")({
  loader: async () => {
    const pageData = await fetchPageData("portfolio");
    return { pageData };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.pageData || DEFAULT_PORTFOLIO;
    const title = page.seo?.title || "Portfolio — GURMITRAA";
    const description = page.seo?.description || "Selected work from GURMITRAA — case studies across fintech, SaaS, healthcare, ecommerce and AI.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: "https://gurmitraa.vercel.app/og-image.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:url", content: "https://gurmitraa.vercel.app/portfolio" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://gurmitraa.vercel.app/og-image.png" },
      ],
    };
  },
  component: Portfolio,
});

function Portfolio() {
  const { pageData } = Route.useLoaderData();
  const page = pageData || DEFAULT_PORTFOLIO;
  const sections = page.sections || DEFAULT_PORTFOLIO.sections;

  // Find sections content
  const heroSection = sections.find((s: any) => s.id === "hero");
  const projectsSection = sections.find((s: any) => s.id === "projects");
  const caseStudiesSection = sections.find((s: any) => s.id === "case_studies");
  const awardsSection = sections.find((s: any) => s.id === "awards");

  // Reorder and filter active sections
  const activeSections = [...sections]
    .filter((s: any) => s.active !== false)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

  const [filter, setFilter] = useState("All");

  const projectList =
    projectsSection?.content?.list ||
    DEFAULT_PORTFOLIO.sections.find((s) => s.id === "projects")?.content.list ||
    [];
  const filters = projectsSection?.content?.filters ||
    DEFAULT_PORTFOLIO.sections.find((s) => s.id === "projects")?.content.filters || ["All"];

  const filteredProjects =
    filter === "All" ? projectList : projectList.filter((p: any) => p.c === filter);

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
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(255,122,0,0.25),transparent_55%)]" />
                <div className="relative mx-auto max-w-7xl px-6">
                  <div className="text-xs uppercase tracking-[0.3em] text-[#ff9f43] mb-6">
                    {c.eyebrow}
                  </div>
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight max-w-5xl text-balance"
                  >
                    {c.title} <GradientItalic text={c.titleItalic} />
                    {c.titleSuffix}
                  </motion.h1>
                </div>
              </section>
            );

          case "projects":
            return (
              <section key={section.id} className="py-16 bg-background">
                <div className="mx-auto max-w-7xl px-6">
                  <div className="flex flex-wrap gap-2 mb-12">
                    {(filters || []).map((f: string) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium border transition ${
                          filter === f
                            ? "bg-navy-deep text-white border-navy-deep"
                            : "bg-card border-border text-muted-foreground hover:border-orange hover:text-navy-deep"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {(filteredProjects || []).map((p: any, i: number) => {
                        const defaultItem = DEFAULT_PORTFOLIO.sections
                          .find((s) => s.id === "projects")?.content.list
                          ?.find((item: any) => item.t === p.t);
                        const imageUrl = p.imageUrl || (defaultItem as any)?.imageUrl;
                        return (
                          <motion.div
                            key={p.t}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ y: -8 }}
                            className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer"
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                alt={p.t}
                              />
                            ) : (
                              <>
                                <div className={`absolute inset-0 bg-gradient-to-br ${p.color}`} />
                                <div className="absolute inset-0 grid-bg opacity-30" />
                              </>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <div className="absolute inset-0 p-7 flex flex-col justify-between text-white">
                              <div className="flex items-start justify-between">
                                <span className="glass rounded-full px-3 py-1 text-xs uppercase tracking-widest">
                                  {p.c}
                                </span>
                                <span className="text-xs opacity-70">{p.year}</span>
                              </div>
                              <div>
                                <h3 className="font-display text-3xl font-bold">{p.t}</h3>
                                {/* <div className="mt-3 inline-flex items-center gap-1 text-sm opacity-70 group-hover:opacity-100 transition">
                                  View case <Icons.ArrowRight size={14} />
                                </div> */}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </section>
            );

          case "case_studies":
            return (
              <section key={section.id} className="py-20 bg-mist">
                <div className="mx-auto max-w-7xl px-6">
                  <SectionHeader
                    eyebrow={c.eyebrow}
                    title={
                      <>
                        {c.title}{" "}
                        <GradientItalic text={c.titleItalic} />
                        {c.titleSuffix}
                      </>
                    }
                  />
                  <div className="space-y-6">
                    {(c.list || []).map((cs: any, i: number) => (
                      <motion.div
                        key={cs.t}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="grid md:grid-cols-3 bg-card border border-border rounded-3xl overflow-hidden"
                      >
                        <div className={`relative h-48 md:h-auto bg-gradient-to-br ${cs.color}`}>
                          <div className="absolute inset-0 grid-bg opacity-30" />
                          <div className="absolute inset-0 grid place-items-center text-white font-display text-5xl font-bold">
                            {cs.m}
                          </div>
                        </div>
                        <div className="md:col-span-2 p-8 flex flex-col justify-center">
                          <h3 className="font-display text-2xl font-bold mb-3">{cs.t}</h3>
                          <p className="text-muted-foreground">{cs.d}</p>
                          <button className="self-start mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange">
                            Read story <Icons.ArrowRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            );



          case "awards":
            return (
              <section key={section.id} className="py-20 bg-background">
                <div className="mx-auto max-w-5xl px-6">
                  <SectionHeader
                    eyebrow={c.eyebrow}
                    title={
                      <>
                        {c.title}{" "}
                        <GradientItalic text={c.titleItalic} />
                        {c.titleSuffix}
                      </>
                    }
                  />
                  <div className="space-y-3">
                    {(c.list || []).map((a: any, i: number) => (
                      <motion.div
                        key={a.t}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-6 bg-card border border-border rounded-2xl p-6 hover:border-orange transition group"
                      >
                        <Icons.Trophy className="text-orange flex-shrink-0" size={28} />
                        <div className="flex-1">
                          <div className="font-display text-lg font-semibold">{a.t}</div>
                          <div className="text-sm text-muted-foreground">{a.c}</div>
                        </div>
                        <div className="font-display text-2xl font-bold text-muted-foreground/40 group-hover:text-orange transition">
                          {a.y}
                        </div>
                      </motion.div>
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
