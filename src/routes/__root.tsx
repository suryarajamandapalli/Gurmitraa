import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CursorFollower } from "@/components/CursorFollower";
import { fetchGlobalSettings } from "@/lib/cms";
import { DEFAULT_GLOBAL } from "@/lib/cms-defaults";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep px-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-bold text-gradient-orange">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Lost in the matrix</h2>
        <p className="mt-2 text-sm text-white/60">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-orange px-5 py-2.5 text-sm font-semibold"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    const globalSettings = await fetchGlobalSettings();
    return { globalSettings };
  },
  head: ({ loaderData }) => {
    const global = loaderData?.globalSettings || DEFAULT_GLOBAL;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: global.meta?.defaultTitle || "GURMITRAA — In. Innovate. Imagine." },
        {
          name: "description",
          content:
            global.meta?.defaultDescription ||
            "GURMITRAA — Software product development, IT consulting, and digital solutions engineered for futuristic businesses.",
        },
        { property: "og:title", content: global.meta?.defaultTitle || "GURMITRAA — In. Innovate. Imagine." },
        {
          property: "og:description",
          content:
            global.meta?.defaultDescription ||
            "Premium software, mobile, and digital engineering from India to the world.",
        },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: global.logo || "GURMITRAA" },
        { property: "og:image", content: "https://gurmitraa.vercel.app/og-image.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: global.meta?.defaultTitle || "GURMITRAA — In. Innovate. Imagine." },
        {
          name: "twitter:description",
          content:
            global.meta?.defaultDescription ||
            "Premium software, mobile, and digital engineering from India to the world.",
        },
        { name: "twitter:image", content: "https://gurmitraa.vercel.app/og-image.png" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: global.favicon || "/favicon.ico" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(global.fonts?.displayFont || "Space Grotesk")}:wght@400;500;600;700&family=${encodeURIComponent(global.fonts?.primaryFont || "Inter")}:wght@300;400;500;600;700&display=swap`,
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { globalSettings } = Route.useLoaderData();
  const global = globalSettings || DEFAULT_GLOBAL;
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname, isAdmin]);

  useEffect(() => {
    if (loading && !isAdmin) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading, isAdmin]);

  const primaryColor = global.theme?.primaryColor || "#0b1120";
  const accentColor = global.theme?.accentColor || "#ff7a00";
  const backgroundColor = global.theme?.backgroundColor || "#ffffff";
  const foregroundColor = global.theme?.foregroundColor || "#0b1120";

  // Compute a darker variant of the primary color for navy-deep
  // Hex to simple opacity/darkness or fallback
  const navyDeepColor = primaryColor === "#0b1120" ? "#060a13" : primaryColor;

  useEffect(() => {
    if (global.analytics) {
      const containerId = "cms-analytics-container";
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.style.display = "none";
        document.body.appendChild(container);
      }
      container.innerHTML = global.analytics;

      // Execute any inline or external scripts manually
      const scripts = container.getElementsByTagName("script");
      Array.from(scripts).forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });

      return () => {
        document.getElementById(containerId)?.remove();
      };
    }
  }, [global.analytics]);

  // Unregister any existing service workers to avoid stale cache/preload issues during development
  useEffect(() => {
    if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait">
        {loading && !isAdmin && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              y: -20,
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070b13] text-white"
          >
            {/* Elegant grid background inside preloader */}
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,122,0,0.12),transparent_70%)] pointer-events-none" />

            <div className="relative flex flex-col items-center gap-6">
              {/* Logo container with pulse & scaling */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  transition: { duration: 0.8, ease: "easeOut" }
                }}
                className="relative"
              >
                <div className="absolute -inset-4 rounded-2xl bg-orange/20 blur-xl animate-pulse" />
                <img
                  src="/PreLogo.png"
                  alt={global.logo || "Logo"}
                  className="h-20 w-20 object-contain relative z-10 rounded-[4px]"
                />
              </motion.div>

              {/* Progress Line */}
              <div className="h-[2px] w-32 bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.2, 
                    ease: "easeInOut" 
                  }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-orange to-transparent"
                />
              </div>

              {/* Text */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-xs uppercase tracking-[0.4em] font-display text-white/70 pl-[0.4em]"
              >
                {global.logo || "GURMITRAA"}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col bg-background">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --navy: ${primaryColor};
            --navy-deep: ${navyDeepColor};
            --orange: ${accentColor};
            --orange-glow: ${accentColor}cc;
            --background: ${backgroundColor};
            --foreground: ${foregroundColor};
            --primary: ${accentColor};
            --primary-foreground: ${backgroundColor};
            --secondary: ${primaryColor};
            --secondary-foreground: ${backgroundColor};
            --border: ${backgroundColor === "#ffffff" ? "oklch(0.92 0.01 260)" : "rgba(255, 255, 255, 0.1)"};
            --card: ${backgroundColor === "#ffffff" ? "#ffffff" : "var(--background)"};
            --card-foreground: ${foregroundColor};
          }
          body {
            font-family: "${global.fonts?.primaryFont || "Inter"}", system-ui, sans-serif;
          }
          h1, h2, h3, h4, h5 {
            font-family: "${global.fonts?.displayFont || "Space Grotesk"}", system-ui, sans-serif;
          }
        `,
          }}
        />
        {!isAdmin && <CursorFollower />}
        {!isAdmin && <Navbar />}
        <div
          className={
            isAdmin ? "flex-1 flex flex-col min-h-screen bg-[#070b13] text-white" : "flex-1"
          }
        >
          <Outlet />
        </div>
        {!isAdmin && <Footer />}
      </div>
    </QueryClientProvider>
  );
}
