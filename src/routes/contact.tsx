import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import * as Icons from "lucide-react";
import { PageShell, SectionHeader, Reveal, GradientItalic } from "@/components/PageShell";
import { db } from "@/lib/firebase";
import { ref, push } from "firebase/database";
import { fetchPageData } from "@/lib/cms";
import { DEFAULT_CONTACT, DEFAULT_GLOBAL } from "@/lib/cms-defaults";

export const Route = createFileRoute("/contact")({
  loader: async () => {
    const pageData = await fetchPageData("contact");
    return { pageData };
  },
  head: ({ loaderData }) => {
    const page = loaderData?.pageData || DEFAULT_CONTACT;
    return {
      meta: [
        { title: page.seo?.title || "Contact — GURMITRAA" },
        {
          name: "description",
          content:
            page.seo?.description ||
            "Get in touch with GURMITRAA — start a project, request a demo, or join our team.",
        },
      ],
    };
  },
  component: Contact,
});

const SOCIAL_ICONS: Record<string, any> = {
  twitter: Icons.Twitter,
  linkedin: Icons.Linkedin,
  github: Icons.Github,
  instagram: Icons.Instagram,
  facebook: Icons.Facebook,
  youtube: Icons.Youtube,
};

function Contact() {
  const rootData = useLoaderData({ from: "__root__" }) as { globalSettings: typeof DEFAULT_GLOBAL };
  const global = rootData?.globalSettings || DEFAULT_GLOBAL;

  const { pageData } = Route.useLoaderData();
  const page = pageData || DEFAULT_CONTACT;
  const sections = page.sections || DEFAULT_CONTACT.sections;

  // Reorder and filter active sections
  const activeSections = [...sections]
    .filter((s: any) => s.active !== false)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

  // Find floating contact details (default to settings, fallback to defaults)
  const phoneClean = (global.footer?.contactDetails?.phone || "+91 98765 43210").replace(
    /[^0-9+]/g,
    "",
  );

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
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(255,122,0,0.25),transparent_55%)]" />
                <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8">
                    <div className="text-xs uppercase tracking-[0.3em] text-orange mb-6">
                      {c.eyebrow}
                    </div>
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-balance"
                    >
                      {c.title} <GradientItalic text={c.titleItalic} />
                      {c.titleSuffix}
                    </motion.h1>
                    <p className="mt-8 max-w-2xl text-lg text-white/70">{c.description}</p>
                  </div>
                </div>
              </section>
            );

          case "form_section":
            return (
              <section key={section.id} className="py-20 bg-background">
                <div className="mx-auto max-w-7xl px-6 flex flex-col gap-12">
                  <Reveal>
                    <div className="bg-card border border-border rounded-3xl p-5 sm:p-8 lg:p-10">
                      <h3 className="font-display text-2xl font-bold mb-6">
                        {c.title || "Project enquiry"}
                      </h3>
                      <ContactForm />
                    </div>
                  </Reveal>

                  <Reveal delay={0.1}>
                    <div className="flex flex-col gap-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          {
                            icon: Icons.Mail,
                            t: "Email",
                            v:
                              c.email ||
                              global.footer?.contactDetails?.email ||
                              "hello@gurmitraa.com",
                          },
                          {
                            icon: Icons.Phone,
                            t: "Phone",
                            v: c.phone || global.footer?.contactDetails?.phone || "+91 98765 43210",
                          },
                          {
                            icon: Icons.MapPin,
                            t: "Studio",
                            v:
                              c.address ||
                              global.footer?.contactDetails?.address ||
                              "Bengaluru, India",
                          },
                        ].map((info) => (
                          <div
                            key={info.t}
                            className="flex items-start gap-4 bg-card border border-border rounded-2xl p-5"
                          >
                            <div className="h-10 w-10 rounded-xl bg-orange/10 grid place-items-center flex-shrink-0">
                              <info.icon className="text-orange" size={18} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                                {info.t}
                              </div>
                              <div className="font-display font-semibold mt-1 break-all">{info.v}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 justify-center">
                        {(global.footer?.socialLinks || DEFAULT_GLOBAL.footer.socialLinks).map(
                          (link, i) => {
                            const Icon = SOCIAL_ICONS[link.platform.toLowerCase()] || Icons.Twitter;
                            return (
                              <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-11 w-11 grid place-items-center rounded-full bg-card border border-border hover:bg-orange hover:text-white hover:border-orange transition"
                              >
                                <Icon size={16} />
                              </a>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </Reveal>
                </div>
              </section>
            );

          case "map":
            return (
              <section key={section.id} className="py-20 bg-mist">
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
                  <Reveal>
                    <div className="relative aspect-[16/7] rounded-3xl overflow-hidden border border-border">
                      <iframe
                        title="Gurmitraa studio map"
                        src={c.mapIframeUrl}
                        className="absolute inset-0 w-full h-full"
                        loading="lazy"
                      />
                    </div>
                  </Reveal>
                </div>
              </section>
            );

          case "faq":
            return (
              <section key={section.id} className="py-20 bg-background">
                <div className="mx-auto max-w-4xl px-6">
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

      {/* Floating actions */}
      <a
        href={`https://wa.me/${phoneClean.replace("+", "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-green-500 grid place-items-center text-white shadow-xl hover:scale-110 transition"
      >
        <Icons.MessageCircle size={22} />
      </a>
      <a
        href={`tel:${phoneClean}`}
        className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full bg-orange grid place-items-center text-white shadow-xl hover:scale-110 transition"
      >
        <Icons.Phone size={20} />
      </a>
    </PageShell>
  );
}

const SERVICES_LIST = [
  { label: "Web Development", icon: Icons.Globe },
  { label: "Mobile Apps", icon: Icons.Smartphone },
  { label: "IT Consulting", icon: Icons.HelpCircle },
  { label: "Product Development", icon: Icons.Layers },
  { label: "UI/UX Design", icon: Icons.Palette },
  { label: "Ecommerce", icon: Icons.ShoppingBag },
  { label: "Cloud", icon: Icons.Cloud },
  { label: "Other", icon: Icons.MoreHorizontal },
];

const BUDGET_LIST = ["< $10k", "$10k - $30k", "$30k - $60k", "$60k+"];

function ContactForm() {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string>("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
    );
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const isStep1Valid = selectedServices.length > 0 && selectedBudget !== "";
  const isStep2Valid = message.trim().length > 0;
  const isStep3Valid =
    name.trim().length > 0 && email.trim().includes("@") && phone.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep3Valid) return;
    setLoading(true);
    setError(null);
    setSent(false);

    const data = {
      name,
      email,
      phone,
      company,
      service: selectedServices.join(", "),
      budget: selectedBudget,
      message,
      timestamp: Date.now(),
    };

    try {
      await push(ref(db, "submissions"), data);
      setSent(true);
    } catch (err: any) {
      console.error("Firebase submit error:", err);
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="h-16 w-16 bg-orange/10 rounded-full grid place-items-center mx-auto mb-6">
          <Icons.CheckCircle2 className="text-orange" size={32} />
        </div>
        <h4 className="font-display text-2xl font-bold mb-2">Message Sent!</h4>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Thanks for reaching out, {name}. We have received your inquiry for{" "}
          {selectedServices.join(" and ")} and will be in touch in under a day.
        </p>
        <button
          onClick={() => {
            setStep(1);
            setSelectedServices([]);
            setSelectedBudget("");
            setCompany("");
            setMessage("");
            setName("");
            setEmail("");
            setPhone("");
            setSent(false);
          }}
          className="mt-8 text-sm font-semibold text-orange hover:underline inline-flex items-center gap-1"
        >
          Send another inquiry <Icons.ArrowRight size={14} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs uppercase tracking-widest text-muted-foreground mb-3">
          <span>Step {step} of 3</span>
          <span>
            {step === 1 && "Project Scope"}
            {step === 2 && "Project Context"}
            {step === 3 && "Contact Info"}
          </span>
        </div>
        <div className="w-full h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange"
            initial={{ width: "33.3%" }}
            animate={{ width: step === 1 ? "33.3%" : step === 2 ? "66.6%" : "100%" }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">
                What services do you need?
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {SERVICES_LIST.map((s) => {
                  const Icon = s.icon;
                  const isSelected = selectedServices.includes(s.label);
                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => toggleService(s.label)}
                      className={`flex items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border text-left transition select-none ${
                        isSelected
                          ? "bg-orange/10 border-orange text-navy-deep font-medium"
                          : "bg-background border-border text-muted-foreground hover:border-orange/50 hover:text-navy-deep"
                      }`}
                    >
                      <Icon size={18} className={`flex-shrink-0 ${isSelected ? "text-orange" : ""}`} />
                      <span className="text-sm min-w-0 break-words">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-3">
                Estimated budget range
              </span>
              <div className="flex flex-wrap gap-2">
                {BUDGET_LIST.map((b) => {
                  const isSelected = selectedBudget === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBudget(b)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium border transition select-none ${
                        isSelected
                          ? "bg-navy-deep text-white border-navy-deep"
                          : "bg-background border-border text-muted-foreground hover:border-orange hover:text-navy-deep"
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={handleNext}
                className="group inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3.5 font-semibold text-white glow-orange disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next Step{" "}
                <Icons.ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                Company Name (Optional)
              </span>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-orange transition"
              />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                Tell us about your project *
              </span>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your vision, goals, and any specific requirements..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-orange transition"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 font-semibold text-navy-deep hover:bg-mist transition"
              >
                <Icons.ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={!isStep2Valid}
                onClick={handleNext}
                className="group inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3.5 font-semibold text-white glow-orange disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next Step{" "}
                <Icons.ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                  Your Full Name *
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-orange transition"
                />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                  Email Address *
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jane@company.com"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-orange transition"
                />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                  Phone Number *
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-orange transition"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 font-semibold text-navy-deep hover:bg-mist transition disabled:opacity-50"
              >
                <Icons.ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                disabled={loading || !isStep3Valid}
                onClick={handleSubmit}
                className="group inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3.5 font-semibold text-white glow-orange disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Sending..." : "Submit Enquiry"}{" "}
                {!loading && (
                  <Icons.ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
          <Icons.Minus size={18} className="text-orange" />
        ) : (
          <Icons.Plus size={18} className="text-orange" />
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
