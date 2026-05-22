import { Link, useRouterState, useLoaderData } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { DEFAULT_GLOBAL } from "@/lib/cms-defaults";

export function Navbar() {
  const rootData = useLoaderData({ from: "__root__" }) as { globalSettings: typeof DEFAULT_GLOBAL };
  const global = rootData?.globalSettings || DEFAULT_GLOBAL;
  const logoText = global.logo || "GURMITRAA";
  const logoLetter = logoText.charAt(0).toUpperCase();
  const navLinks = global.navbar || DEFAULT_GLOBAL.navbar;
  const links = navLinks.map((l) => ({ to: l.href, label: l.label }));

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
            scrolled ? "glass-dark shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)]" : "bg-transparent"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 group">
            {global.longLogoUrl ? (
              <img src={global.longLogoUrl} alt={logoText} className="h-11 w-auto object-contain rounded-[4px]" />
            ) : global.logoUrl ? (
              <>
                <img src={global.logoUrl} alt={logoText} className="h-8 w-8 object-contain rounded-lg" />
                <span className="font-display font-bold text-white tracking-tight text-lg">
                  {logoText}
                </span>
              </>
            ) : (
              <>
                <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-orange to-orange-glow grid place-items-center">
                  <span className="font-display font-bold text-white text-sm">{logoLetter}</span>
                  <div className="absolute inset-0 rounded-lg bg-orange blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                </div>
                <span className="font-display font-bold text-white tracking-tight text-lg">
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
                  className="relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-white/10"
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
            className="lg:hidden text-white p-2"
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
              className="lg:hidden mt-2 glass-dark rounded-2xl p-4 flex flex-col gap-1"
            >
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-4 py-3 rounded-xl text-sm font-medium ${
                    pathname === l.to ? "bg-orange text-white" : "text-white/80 hover:bg-white/5"
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
