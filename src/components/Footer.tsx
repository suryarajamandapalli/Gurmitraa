import { Link, useLoaderData } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { DEFAULT_GLOBAL } from "@/lib/cms-defaults";

const SOCIAL_ICONS: Record<string, any> = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
};

export function Footer() {
  const rootData = useLoaderData({ from: "__root__" }) as { globalSettings: typeof DEFAULT_GLOBAL };
  const global = rootData?.globalSettings || DEFAULT_GLOBAL;
  const logoText = global.logo || "GURMITRAA";
  const logoLetter = logoText.charAt(0).toUpperCase();

  return (
    <footer className="relative overflow-hidden bg-mist border-t border-border text-navy-deep">
      <div className="absolute inset-0 grid-bg-light opacity-50" />
      <motion.div
        aria-hidden
        animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-orange/10 blur-[120px]"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-500/5 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-10">
        <div className="grid lg:grid-cols-12 gap-12 pb-16 border-b border-border">
          <div className="lg:col-span-5">
            <Link to="/" className="flex items-center gap-2 mb-6">
              {global.longLogoUrl ? (
                <img src={global.longLogoUrl} alt={logoText} className="h-14 w-auto object-contain rounded-[4px]" />
              ) : global.logoUrl ? (
                <>
                  <img src={global.logoUrl} alt={logoText} className="h-10 w-10 object-contain rounded-xl" />
                  <span className="font-display font-bold text-xl">{logoText}</span>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange to-orange-glow grid place-items-center">
                    <span className="font-display font-bold text-white">{logoLetter}</span>
                  </div>
                  <span className="font-display font-bold text-xl">{logoText}</span>
                </>
              )}
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed mb-6">
              In... Innovate... Imagine... — Engineering the future of digital products with craft,
              intelligence, and obsession for detail.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-orange" />
                {global.footer?.contactDetails?.address || "Bengaluru, India"}
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-orange" />
                {global.footer?.contactDetails?.email || "hello@gurmitraa.com"}
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-orange" />
                {global.footer?.contactDetails?.phone || "+91 98765 43210"}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-widest text-orange">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-orange transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-orange transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange transition-colors">
                  Contact
                </Link>
              </li>

            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-widest text-orange">
              Services
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/services" className="hover:text-orange transition-colors">
                  Web Apps
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-orange transition-colors">
                  Mobile Apps
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-orange transition-colors">
                  Consulting
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-orange transition-colors">
                  Products
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-widest text-orange">
              Social Profiles
            </h4>
            <div className="flex gap-3 mt-6">
              {(global.footer?.socialLinks || DEFAULT_GLOBAL.footer.socialLinks).map((link, i) => {
                const Icon = SOCIAL_ICONS[link.platform.toLowerCase()] || Twitter;
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 grid place-items-center rounded-full bg-card border border-border text-navy-deep hover:bg-orange hover:text-white hover:border-orange transition"
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs text-muted-foreground/60">
          <span>
            {global.footer?.copyright ||
              `© ${new Date().getFullYear()} GURMITRAA. All rights reserved.`}
          </span>
          <span className="font-display tracking-[0.3em] text-muted-foreground/40">
                <Link to="/admin" className="hover:text-orange transition-colors">
                  Admin Panel
                </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
