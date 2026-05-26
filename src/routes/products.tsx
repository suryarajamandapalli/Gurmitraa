import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import { PageShell, SectionHeader, Reveal, GradientItalic } from "@/components/PageShell";
import { fetchPageData } from "@/lib/cms";
import { DEFAULT_PRODUCTS } from "@/lib/cms-defaults";

export const Route = createFileRoute("/products")({
  loader: async () => {
    const pageData = await fetchPageData("products");
    return { pageData };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.pageData || DEFAULT_PRODUCTS;
    const title = page.seo?.title || "Products — GURMITRAA";
    const description = page.seo?.description || "Modern SaaS products engineered by GURMITRAA — for commerce, analytics, learning, healthcare and finance.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: "https://gurmitraa.vercel.app/og-image.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:url", content: "https://gurmitraa.vercel.app/products" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://gurmitraa.vercel.app/og-image.png" },
      ],
    };
  },
  component: Products,
});

const getIcon = (name: string) => {
  const IconComponent = (Icons as any)[name];
  return IconComponent || Icons.HelpCircle;
};

function Products() {
  const { pageData } = Route.useLoaderData();
  const page = pageData || DEFAULT_PRODUCTS;
  const sections = page.sections || DEFAULT_PRODUCTS.sections;

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
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,122,0,0.25),transparent_60%)]" />
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
                    {c.title} <GradientItalic text={c.titleItalic} />{" "}
                    {c.titleSuffix}
                  </motion.h1>
                  <p className="mt-8 max-w-2xl text-lg text-white/70">{c.description}</p>
                </div>
              </section>
            );

          case "showcase":
            return (
              <section key={section.id} className="py-20 bg-background">
                <div className="mx-auto max-w-7xl px-6">
                  <SectionHeader
                    eyebrow={c.eyebrow}
                    title={
                      <>
                        {c.title}{" "}
                        <GradientItalic text={c.titleItalic} />{" "}
                        {c.titleSuffix}
                      </>
                    }
                  />
                  <div className="grid md:grid-cols-2 gap-6">
                    {(c.list || []).map((p: any, i: number) => {
                      const Icon = getIcon(p.icon);
                      const defaultItem = DEFAULT_PRODUCTS.sections
                        .find((s: any) => s.id === "showcase")?.content?.list
                        ?.find((item: any) => item.t === p.t);
                      const imageUrl = p.imageUrl || (defaultItem as any)?.imageUrl;
                      return (
                        <motion.div
                          key={p.t}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: (i % 2) * 0.1 }}
                          whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
                          style={{ transformStyle: "preserve-3d" }}
                          className="group relative aspect-[5/4] rounded-3xl overflow-hidden cursor-pointer"
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
                          <motion.div
                            className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 8, repeat: Infinity }}
                          />
                          <div className="absolute inset-0 p-10 flex flex-col justify-between text-white">
                            <Icon size={40} />
                            <div>
                              <h3 className="font-display text-4xl font-bold">{p.t}</h3>
                              <p className="mt-3 max-w-md text-white/80">{p.d}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );

          case "features":
            return (
              <section key={section.id} className="py-20 bg-mist">
                <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
                  <Reveal>
                    <SectionHeader
                      eyebrow={c.eyebrow}
                      title={
                        <>
                          {c.title}{" "}
                          <GradientItalic text={c.titleItalic} />{" "}
                          {c.titleSuffix}
                        </>
                      }
                    />
                    <div className="grid sm:grid-cols-2 gap-3">
                      {(c.list || []).map((f: string, i: number) => (
                        <motion.div
                          key={f}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
                        >
                          <Icons.CheckCircle2 className="text-orange flex-shrink-0" size={18} />
                          <span className="text-sm font-medium">{f}</span>
                        </motion.div>
                      ))}
                    </div>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <div className="relative aspect-square rounded-[2rem] bg-gradient-to-br from-navy to-navy-deep overflow-hidden grid-bg group">
                      {c.imageUrl && (
                        <img
                          src={c.imageUrl}
                          alt="Enterprise features"
                          className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-65 transition duration-700 ease-out"
                        />
                      )}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,122,0,0.3),transparent_55%)]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-navy/40" />
                      <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity }}
                        className="absolute top-10 left-10 glass-dark rounded-2xl p-5 w-48"
                      >
                        <div className="text-xs text-white/50 uppercase tracking-widest">
                          Active users
                        </div>
                        <div className="text-3xl font-display font-bold text-white mt-1">
                          {c.activeUsers}
                        </div>
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 7, repeat: Infinity }}
                        className="absolute bottom-10 right-10 glass-dark rounded-2xl p-5 w-48"
                      >
                        <div className="text-xs text-white/50 uppercase tracking-widest">
                          Revenue MoM
                        </div>
                        <div className="text-3xl font-display font-bold text-gradient-orange mt-1">
                          {c.revenueMom}
                        </div>
                      </motion.div>
                    </div>
                  </Reveal>
                </div>
              </section>
            );

          case "industries":
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
                        {c.title}{" "}
                        <GradientItalic text={c.titleItalic} />{" "}
                        {c.titleSuffix}
                      </>
                    }
                  />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {(c.list || []).map((ind: any, idx: number) => {
                      const Icon = getIcon(ind.icon);
                      return (
                        <motion.div
                          key={ind.t}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          className="glass-dark rounded-2xl p-6 text-center hover:bg-orange/10 transition"
                        >
                          <Icon className="text-orange mx-auto mb-3" size={28} />
                          <div className="font-display font-semibold">{ind.t}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );

          case "workflow":
            return (
              <section key={section.id} className="py-20 bg-background">
                <div className="mx-auto max-w-5xl px-6">
                  <SectionHeader
                    eyebrow={c.eyebrow}
                    title={
                      <>
                        {c.title}{" "}
                        <GradientItalic text={c.titleItalic} />{" "}
                        {c.titleSuffix}
                      </>
                    }
                  />
                  <div className="space-y-4">
                    {(c.list || []).map((step: string, i: number) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-6 bg-card border border-border rounded-2xl p-6 hover:border-orange transition"
                      >
                        <div className="font-display text-4xl font-bold text-orange w-16">
                          0{i + 1}
                        </div>
                        <div className="font-display text-xl font-semibold">{step}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "cta":
            const CtaIcon = c.icon ? (Icons as any)[c.icon] : null;
            return (
              <section key={section.id} className="py-20 bg-mist">
                <div className="mx-auto max-w-5xl px-6 text-center">
                  {CtaIcon && <CtaIcon className="text-orange mx-auto mb-6" size={40} />}
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
