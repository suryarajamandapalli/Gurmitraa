import { Link, useRouterState, useLoaderData } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { DEFAULT_GLOBAL } from "@/lib/cms-defaults";
import { deepMerge, subscribeToGlobalChanges } from "@/lib/cms";

export function Navbar() {
  const rootData = useLoaderData({ from: "__root__" }) as { globalSettings: typeof DEFAULT_GLOBAL };
  const [global, setGlobal] = useState<any>(rootData?.globalSettings || DEFAULT_GLOBAL);

  useEffect(() => {
    if (rootData?.globalSettings) {
      setGlobal(rootData.globalSettings);
    }
  }, [rootData]);

  useEffect(() => {
    // Subscribe to live global updates
    const unsub = subscribeToGlobalChanges((data) => {
      if (data) setGlobal(data);
    });

    return () => unsub();
  }, []);

  const logoText = global.logo || "GURMITRAA";
  const logoLetter = logoText.charAt(0).toUpperCase();
  const navLinks = global.navbar || DEFAULT_GLOBAL.navbar;
  const links: { to: string; label: string }[] = (navLinks || [])
    .filter((l: any) => !l.hidden)
    .map((l: any) => ({ to: l.href, label: l.label }));

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div
          className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
            scrolled
              ? "bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_10px_30px_-10px_rgba(6,5,102,0.12)]"
              : "bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_10px_30px_-10px_rgba(6,5,102,0.06)]"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 group">
            {global.longLogoUrl ? (
              <img src={global.longLogoUrl} alt={logoText} className="h-11 w-auto object-contain rounded-[4px]" />
            ) : global.logoUrl ? (
              <>
                <img src={global.logoUrl} alt={logoText} className="h-8 w-8 object-contain rounded-lg" />
                <span className="font-display font-bold tracking-tight text-lg text-navy-deep">
                  {logoText}
                </span>
              </>
            ) : (
              <>
                <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-orange to-orange-glow grid place-items-center">
                  <span className="font-display font-bold text-white text-sm">{logoLetter}</span>
                  <div className="absolute inset-0 rounded-lg bg-orange blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                </div>
                <span className="font-display font-bold tracking-tight text-lg text-navy-deep">
                  {logoText}
                </span>
              </>
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "text-orange font-semibold"
                      : "text-navy-deep/80 hover:text-navy-deep hover:text-orange"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-orange/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block">
            <Link
              to="/contact"
              hash="enquiry"
              className="group relative inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white overflow-hidden"
            >
              <span className="relative z-10">Start a project</span>
              <span className="relative z-10 transition-transform group-hover:translate-x-1">
                →
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-glow to-orange opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 text-navy-deep transition-colors"
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mt-2 rounded-2xl p-4 flex flex-col gap-1 bg-white/95 backdrop-blur-md border border-border shadow-lg text-navy-deep"
            >
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === l.to
                      ? "bg-orange text-white"
                      : "text-navy-deep/80 hover:bg-navy-deep/5"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
