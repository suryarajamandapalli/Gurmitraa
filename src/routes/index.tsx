import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import React, { useRef, useState, useEffect } from "react";
import * as Icons from "lucide-react";
import {
  ArrowRight,
  Quote,
  Star,
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { PageShell, SectionHeader, Reveal, GradientItalic } from "@/components/PageShell";
import { fetchPageData } from "@/lib/cms";
import { DEFAULT_HOME } from "@/lib/cms-defaults";
import { db } from "@/lib/firebase";
import { ref, push } from "firebase/database";

export const Route = createFileRoute("/")({
  loader: async () => {
    const pageData = await fetchPageData("home");
    return { pageData };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.pageData || DEFAULT_HOME;
    const title = page.seo?.title || "GURMITRAA — Innovative Digital Solutions For Future Businesses";
    const description = page.seo?.description || "Software product development, mobile apps, IT consulting, and digital experiences engineered with craft. In. Innovate. Imagine.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: "https://gurmitraa.vercel.app/og-image.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:url", content: "https://gurmitraa.vercel.app/" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://gurmitraa.vercel.app/og-image.png" },
      ],
    };
  },
  component: Home,
});

const getIcon = (name: string) => {
  const IconComponent = (Icons as any)[name];
  return IconComponent || HelpCircle;
};

function isBgVideo(url: string) {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".ogg") ||
    url.includes("video/upload") ||
    url.includes("/video/")
  );
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const dur = 1600;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.round(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

function Home() {
  const { pageData } = Route.useLoaderData();
  const page = pageData || DEFAULT_HOME;
  const sections = page.sections || DEFAULT_HOME.sections;

  // Reorder and filter active sections
  const activeSections = [...sections]
    .filter((s: any) => s.active !== false)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityBg = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  // Extract services for form select options
  const servicesSec = sections.find((s: any) => s.id === "services");
  const servicesList = servicesSec?.content?.list?.map((s: any) => s.title) || [
    "Web Development",
    "Mobile Apps",
    "IT Consulting",
    "Product Development",
    "UI/UX Design",
    "Ecommerce",
    "Cloud",
    "Other",
  ];

  return (
    <PageShell>
      {activeSections.map((section: any) => {
        const c = section.content;

        switch (section.id) {
          case "hero":
            return (
              <section
                key={section.id}
                ref={heroRef}
                className="relative min-h-[100svh] -mt-20 overflow-hidden bg-navy-deep text-white"
              >
                <motion.div style={{ y: yBg, opacity: opacityBg }} className="absolute inset-0">
                  {(() => {
                    const videoSrc = c.videoUrl || "/bgvideo.mp4";
                    const ytId = getYouTubeId(videoSrc);
                    if (ytId) {
                      return (
                        <>
                          <div 
                            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                            style={{
                              opacity: c.videoOpacity !== undefined ? c.videoOpacity : 0.6,
                              filter: `blur(${c.videoBlur !== undefined ? c.videoBlur : 0}px)`,
                            }}
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&rel=0&playsinline=1&enablejsapi=1`}
                              title="Background Video"
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] h-[56.25vw] min-w-full min-h-full pointer-events-none"
                              frameBorder="0"
                              allow="autoplay; encrypted-media"
                              allowFullScreen
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/40 via-navy-deep/20 to-transparent" />
                        </>
                      );
                    }
                    if (isBgVideo(videoSrc)) {
                      return (
                        <>
                          <video
                            key={videoSrc}
                            src={videoSrc}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                            style={{
                              opacity: c.videoOpacity !== undefined ? c.videoOpacity : 0.6,
                              filter: `blur(${c.videoBlur !== undefined ? c.videoBlur : 0}px)`,
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/40 via-navy-deep/20 to-transparent" />
                        </>
                      );
                    }
                    return (
                      <>
                        <img
                          key={videoSrc}
                          src={videoSrc}
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                          alt=""
                          style={{
                            opacity: c.videoOpacity !== undefined ? c.videoOpacity : 0.6,
                            filter: `blur(${c.videoBlur !== undefined ? c.videoBlur : 0}px)`,
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/40 via-navy-deep/20 to-transparent" />
                      </>
                    );
                  })()}
                </motion.div>

                {/* floating particles */}
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.span
                    key={i}
                    aria-hidden
                    className="absolute h-1 w-1 rounded-full bg-white/40"
                    style={{
                      left: `${(i * 37) % 100}%`,
                      top: `${(i * 53) % 100}%`,
                    }}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0.2, 0.8, 0.2],
                    }}
                    transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}

                <div className="relative mx-auto max-w-4xl px-6 pt-40 pb-24 flex flex-col items-center justify-center text-center min-h-[100svh]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center gap-3 rounded-full glass px-4 py-2 text-xs uppercase tracking-[0.25em] mb-8"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-orange animate-pulse" />
                    {c.eyebrow || "In · Innovate · Imagine"}
                  </motion.div>

                  <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-balance text-center">
                    {(c.titlePrefix || "Innovative ").split("").map((ch: string, i: number) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.03, duration: 0.6 }}
                        className="inline-block"
                      >
                        {ch === " " ? "\u00A0" : ch}
                      </motion.span>
                    ))}
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="inline-block"
                    >
                      <GradientItalic text={c.titleItalic || "Digital"} />
                    </motion.span>
                    <br />
                    <motion.span
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      {c.titleMiddle || " Solutions for the "}
                    </motion.span>{" "}
                    <motion.span
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="relative"
                    >
                      {c.titleSuffix || "Future."}
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="absolute -bottom-2 left-0 right-0 h-1 bg-orange origin-left"
                      />
                    </motion.span>
                  </h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-8 text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mx-auto text-center"
                  >
                    {c.description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="mt-10 flex flex-wrap gap-4 justify-center"
                  >
                    <Link
                      to={c.ctaLink || "/services"}
                      className="group inline-flex items-center gap-2 rounded-full bg-orange px-7 py-4 font-semibold text-white glow-orange hover:bg-orange-glow transition"
                    >
                      {c.ctaText || "Explore services"}
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                    <Link
                      to={c.secondaryCtaLink || "/contact"}
                      className="inline-flex items-center gap-2 rounded-full glass px-7 py-4 font-semibold text-white hover:bg-white/10 transition"
                    >
                      {c.secondaryCtaText || "Talk to us"}
                    </Link>
                  </motion.div>
                </div>

                {/* marquee */}
                <div className="relative border-y border-white/10 bg-black/30 overflow-hidden">
                  <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="flex gap-16 py-5 whitespace-nowrap font-display text-2xl text-white/40 uppercase tracking-[0.3em]"
                  >
                    {Array.from({ length: 2 }).map((_, k) => (
                      <div key={k} className="flex gap-16">
                        {["In", "Innovate", "Imagine", "Engineer", "Design", "Ship", "Scale"].map(
                          (w, i) => (
                            <span key={i} className="flex items-center gap-16">
                              {w}
                              <span className="text-orange">✦</span>
                            </span>
                          ),
                        )}
                      </div>
                    ))}
                  </motion.div>
                </div>
              </section>
            );

          case "about":
            return (
              <section key={section.id} className="relative py-20 bg-background overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
                  <Reveal>
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-orange mb-5">
                      {c.eyebrow}
                    </div>
                    <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-balance text-navy-deep">
                      {c.title}
                      <GradientItalic text={c.titleItalic} />
                      {c.titleSuffix}
                    </h2>
                    <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                      {c.description}
                    </p>
                    <div className="grid grid-cols-2 gap-8 mt-12">
                      {(c.stats || []).map((s: any) => (
                        <div key={s.label}>
                          <div className="font-display text-5xl font-bold text-navy-deep">
                            <Counter to={s.value} suffix={s.suffix} />
                          </div>
                          <div className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Reveal>

                  <Reveal delay={0.1}>
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-orange/20 to-orange-glow/10 blur-xl opacity-75" />
                      <div className="relative rounded-[2rem] overflow-hidden border border-border bg-card shadow-2xl transition duration-500 hover:border-orange/30">
                        {/* Browser Header */}
                        <div className="flex items-center gap-1.5 px-6 py-3.5 bg-muted/30 border-b border-border">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                          <div className="ml-4 flex-1 max-w-[200px] text-[10px] text-muted-foreground/60 bg-background px-3 py-0.5 rounded border border-border text-center truncate">
                            gurmitraa.com/console
                          </div>
                        </div>
                        {/* Browser content */}
                        <div className="relative aspect-[4/3] bg-navy-deep overflow-hidden">
                          <img
                            src={c.imageUrl || "/images/about_gurmitraa.png"}
                            alt="Gurmitraa developer console dashboard mockup"
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </section>
            );

          case "services":
            return (
              <section
                key={section.id}
                className="relative py-20 bg-navy-deep text-white overflow-hidden"
              >
                <div className="absolute inset-0 grid-bg opacity-50" />
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
                    description={c.description}
                  />
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-3xl overflow-hidden">
                    {(c.list || []).map((s: any, i: number) => {
                      const Icon = getIcon(s.icon);
                      return (
                        <motion.div
                          key={s.title}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-60px" }}
                          transition={{ delay: i * 0.05, duration: 0.6 }}
                          className="group relative bg-navy-deep p-8 hover:bg-navy transition-colors duration-500"
                        >
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Icon className="text-orange mb-6" size={32} />
                          <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
                          <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
                          <Link
                            to="/services"
                            className="mt-6 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-orange opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Learn more <ArrowRight size={12} />
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
              <section key={section.id} className="relative py-20 bg-background overflow-hidden">
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
                  <div className="relative">
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/40 to-transparent" />
                    <div className="grid md:grid-cols-7 gap-8">
                      {(c.list || []).map((p: any, i: number) => (
                        <motion.div
                          key={p.n}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-60px" }}
                          transition={{ delay: i * 0.08, duration: 0.6 }}
                          className="relative text-center"
                        >
                          <div className="relative mx-auto h-16 w-16 rounded-full bg-navy-deep text-white grid place-items-center font-display font-bold">
                            {p.n}
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-orange"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                            />
                          </div>
                          <h4 className="mt-4 font-display font-semibold">{p.t}</h4>
                          <p className="mt-1 text-xs text-muted-foreground">{p.d}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );

          case "recent_works":
            return (
              <section key={section.id} className="relative py-20 bg-mist overflow-hidden">
                <div className="mx-auto max-w-7xl px-6">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
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
                    <Link
                      to="/portfolio"
                      className="self-start md:self-end inline-flex items-center gap-2 text-sm font-semibold text-navy-deep"
                    >
                      View all <ArrowRight size={16} />
                    </Link>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(c.list || []).map((w: any, i: number) => {
                      const defaultItem = DEFAULT_HOME.sections
                        .find((s: any) => s.id === "recent_works")?.content?.list
                        ?.find((item: any) => item.title === w.title);
                      const imageUrl = w.imageUrl || (defaultItem as any)?.imageUrl;
                      return (
                        <motion.div
                          key={w.title}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: (i % 3) * 0.1, duration: 0.6 }}
                          whileHover={{ y: -8 }}
                          className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              alt={w.title}
                            />
                          ) : (
                            <>
                              <div className={`absolute inset-0 bg-gradient-to-br ${w.color}`} />
                              <div className="absolute inset-0 grid-bg opacity-30" />
                            </>
                          )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                          <span className="self-start glass rounded-full px-3 py-1 text-xs uppercase tracking-widest">
                            {w.tag}
                          </span>
                          <div>
                            <h3 className="font-display text-3xl font-bold">{w.title}</h3>
                            <Link
                              to="/portfolio"
                              className="mt-3 inline-flex items-center gap-2 text-sm opacity-70 group-hover:opacity-100 transition"
                            >
                              Case study <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  </div>
                </div>
              </section>
            );

          case "testimonials":
            return (
              <section
                key={section.id}
                className="relative py-20 bg-navy-deep text-white overflow-hidden"
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
                  <div className="grid md:grid-cols-2 gap-6">
                    {(c.list || []).map((t: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="glass-dark rounded-3xl p-8"
                      >
                        <Quote className="text-orange mb-4" size={28} />
                        <p className="font-display text-xl leading-snug text-white/90">"{t.q}"</p>
                        <div className="mt-6 flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{t.a}</div>
                            <div className="text-xs text-white/50 uppercase tracking-widest">
                              {t.r}
                            </div>
                          </div>
                          <div className="flex gap-0.5 text-orange">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} size={14} fill="currentColor" />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Logo strip */}
                  <div className="mt-16 overflow-hidden border-y border-white/10 py-8">
                    <motion.div
                      animate={{ x: ["0%", "-50%"] }}
                      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                      className="flex gap-16 whitespace-nowrap font-display text-2xl text-white/30 tracking-widest"
                    >
                      {Array.from({ length: 2 }).map((_, k) => (
                        <div key={k} className="flex gap-16">
                          {(c.logos || []).map((logoName: string, i: number) => (
                            <span key={i}>{logoName}</span>
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </section>
            );

          case "enquiry":
            return (
              <section key={section.id} className="relative py-20 bg-background overflow-hidden">
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
                    description={c.description}
                  />
                  <HomeEnquiryForm servicesList={servicesList} />
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

function HomeEnquiryForm({ servicesList }: { servicesList: string[] }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSent(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      service: formData.get("service") as string,
      message: formData.get("message") as string,
      timestamp: Date.now(),
    };

    try {
      await push(ref(db, "submissions"), data);
      setSent(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error("Firebase submit error:", err);
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
      {[
        { n: "name", l: "Your name", icon: User },
        { n: "email", l: "Email", icon: Mail, type: "email" },
        { n: "phone", l: "Phone", icon: Phone },
        { n: "company", l: "Company", icon: Building2 },
      ].map((f) => (
        <FloatingInput key={f.n} {...f} />
      ))}
      <div className="md:col-span-2">
        <FloatingSelect name="service" label="Service of interest" options={servicesList} />
      </div>
      <div className="md:col-span-2">
        <FloatingTextarea name="message" label="Tell us more" icon={MessageSquare} />
      </div>
      <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          {sent && (
            <span className="text-sm text-green-600 font-medium">
              Thanks — we'll be in touch soon.
            </span>
          )}
          {error && <span className="text-sm text-red-500 font-medium">{error}</span>}
          {!sent && !error && (
            <p className="text-xs text-muted-foreground">
              By submitting you agree to be contacted by our team.
            </p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          type="submit"
          disabled={loading}
          className="group inline-flex items-center gap-2 rounded-full bg-orange px-8 py-4 font-semibold text-white glow-orange disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send enquiry"}
          {!loading && (
            <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
          )}
        </motion.button>
      </div>
    </form>
  );
}

function FloatingInput({ name, l, icon: Icon, type = "text" }: any) {
  return (
    <label className="group relative block">
      <input
        type={type}
        name={name}
        required
        placeholder=" "
        className="peer w-full rounded-2xl border border-border bg-card px-12 py-4 outline-none focus:border-orange transition text-foreground"
      />
      <Icon
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground peer-focus:text-orange"
        size={18}
      />
      <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 px-1 bg-card text-muted-foreground text-sm transition-all peer-focus:-top-0 peer-focus:text-xs peer-focus:text-orange peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:text-xs">
        {l}
      </span>
    </label>
  );
}

function FloatingSelect({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
}) {
  return (
    <label className="relative block">
      <select
        name={name}
        required
        defaultValue=""
        className="w-full rounded-2xl border border-border bg-card px-4 py-4 outline-none focus:border-orange text-foreground"
      >
        <option value="" disabled>
          {label}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="text-foreground">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function FloatingTextarea({ name, label, icon: Icon }: any) {
  return (
    <label className="group relative block">
      <textarea
        name={name}
        rows={5}
        required
        placeholder=" "
        className="peer w-full rounded-2xl border border-border bg-card px-12 py-4 outline-none focus:border-orange text-foreground"
      />
      <Icon
        className="absolute left-4 top-5 text-muted-foreground peer-focus:text-orange"
        size={18}
      />
      <span className="pointer-events-none absolute left-12 top-5 px-1 bg-card text-muted-foreground text-sm transition-all peer-focus:-top-0 peer-focus:text-xs peer-focus:text-orange peer-[:not(:placeholder-shown)]:-top-0 peer-[:not(:placeholder-shown)]:text-xs">
        {label}
      </span>
    </label>
  );
}
