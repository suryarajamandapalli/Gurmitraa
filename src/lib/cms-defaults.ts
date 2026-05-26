export const DEFAULT_GLOBAL = {
  logo: "GURMITRAA",
  logoUrl: "/Logo.png",
  longLogoUrl: "/LongLogo.png",
  favicon: "/Logo.png",
  theme: {
    primaryColor: "#0b1120",
    accentColor: "#ff7a00",
    backgroundColor: "#ffffff",
    foregroundColor: "#0b1120",
  },
  fonts: {
    primaryFont: "Inter",
    displayFont: "Space Grotesk",
  },
  meta: {
    defaultTitle: "GURMITRAA — Innovative Digital Solutions For Future Businesses",
    defaultDescription:
      "Software product development, mobile apps, IT consulting, and digital experiences engineered with craft. In. Innovate. Imagine.",
  },
  analytics: "",
  navbar: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Products", href: "/products" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Contact", href: "/contact" },
  ],
  footer: {
    copyright: "© 2026 GURMITRAA. All rights reserved.",
    socialLinks: [
      { platform: "Twitter", url: "#" },
      { platform: "Linkedin", url: "#" },
      { platform: "Github", url: "#" },
      { platform: "Instagram", url: "#" },
    ],
    contactDetails: {
      email: "hello@gurmitraa.com",
      phone: "+91 98765 43210",
      address: "Bengaluru, India",
    },
  },
};

export const DEFAULT_HOME = {
  seo: {
    title: "GURMITRAA — Innovative Digital Solutions For Future Businesses",
    description:
      "Software product development, mobile apps, IT consulting, and digital experiences engineered with craft. In. Innovate. Imagine.",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      active: true,
      order: 0,
      content: {
        eyebrow: "In · Innovate · Imagine",
        titlePrefix: "Innovative ",
        titleItalic: "Digital",
        titleMiddle: " Solutions for the ",
        titleSuffix: "Future.",
        bgImageUrl: "/scenic_hero.png",
        videoUrl: "/bgvideo.mp4",
        videoOpacity: 0.6,
        videoBlur: 0,
        description:
          "We Engineer Software, Mobile Apps and Digital Experiences that Shape Industries.",
        ctaText: "Explore services",
        ctaLink: "/services",
        secondaryCtaText: "Talk to us",
        secondaryCtaLink: "/contact",
        stats: [
          { t: "Avg. Lighthouse", v: "99/100" },
          { t: "Time to ship", v: "−42%" },
          { t: "NPS", v: "78" },
          { t: "Uptime", v: "99.99%" },
        ],
      },
    },
    {
      id: "about",
      type: "about",
      active: true,
      order: 1,
      content: {
        eyebrow: "About Gurmitraa",
        title: "We build software that ",
        titleItalic: "moves the world",
        titleSuffix: " forward.",
        imageUrl: "/images/about_gurmitraa.png",
        description:
          "GURMITRAA is an Indian software product development, outsourcing and IT consulting studio. We partner with founders and enterprises to engineer web, mobile and digital experiences that feel inevitable.",
        stats: [
          { value: 250, suffix: "+", label: "Projects shipped" },
          { value: 120, suffix: "+", label: "Global clients" },
          { value: 12, suffix: " yrs", label: "Of craft" },
          { value: 24, suffix: "/7", label: "Support" },
        ],
      },
    },
    {
      id: "services",
      type: "services",
      active: true,
      order: 2,
      content: {
        eyebrow: "What we do",
        title: "End-to-end capabilities, ",
        titleItalic: "one studio",
        titleSuffix: ".",
        description: "Eight disciplines under one roof, shipping outcomes — not deliverables.",
        list: [
          {
            title: "Web Development",
            desc: "Production-grade web apps with elite performance.",
            icon: "Code2",
          },
          {
            title: "Mobile Apps",
            desc: "iOS and Android products users obsess over.",
            icon: "Smartphone",
          },
          {
            title: "IT Consulting",
            desc: "Strategy that turns technology into leverage.",
            icon: "Lightbulb",
          },
          {
            title: "Product Development",
            desc: "0→1 software products, end to end.",
            icon: "Boxes",
          },
          {
            title: "Digital Marketing",
            desc: "Performance growth, brand and SEO.",
            icon: "Megaphone",
          },
          {
            title: "Ecommerce",
            desc: "Storefronts that convert and scale globally.",
            icon: "ShoppingBag",
          },
          { title: "UI / UX Design", desc: "Interfaces that feel inevitable.", icon: "Palette" },
          {
            title: "Cloud Solutions",
            desc: "Cloud-native infrastructure built to last.",
            icon: "Cloud",
          },
        ],
      },
    },
    {
      id: "process",
      type: "process",
      active: true,
      order: 3,
      content: {
        eyebrow: "Process",
        title: "A futuristic process, ",
        titleItalic: "engineered for outcomes",
        titleSuffix: ".",
        list: [
          { n: "01", t: "Discover", d: "Workshops, audits, alignment." },
          { n: "02", t: "Research", d: "User and market intelligence." },
          { n: "03", t: "Design", d: "Systems, prototypes, motion." },
          { n: "04", t: "Develop", d: "Engineering with rigor and speed." },
          { n: "05", t: "Test", d: "Quality, performance, accessibility." },
          { n: "06", t: "Deploy", d: "Ship with confidence." },
          { n: "07", t: "Support", d: "Operate, iterate, evolve." },
        ],
      },
    },
    {
      id: "recent_works",
      type: "recent_works",
      active: true,
      order: 4,
      content: {
        eyebrow: "Recent works",
        title: "Selected projects, ",
        titleItalic: "shipped with obsession",
        titleSuffix: ".",
        list: [
          { tag: "Fintech", title: "Nimbus Banking", color: "from-indigo-500 to-blue-700", imageUrl: "/images/nimbus_banking.png" },
          { tag: "SaaS", title: "Orbit Analytics", color: "from-orange to-red-500", imageUrl: "/images/orbit_analytics.png" },
          { tag: "Healthcare", title: "PulseCare", color: "from-emerald-500 to-teal-700", imageUrl: "/images/pulsecare.png" },
        ],
      },
    },
    {
      id: "testimonials",
      type: "testimonials",
      active: true,
      order: 5,
      content: {
        eyebrow: "Feedback",
        title: "What partners say after we ",
        titleItalic: "ship together",
        titleSuffix: ".",
        list: [
          {
            q: "Gurmitraa rebuilt our product in 90 days. Revenue doubled in the next quarter.",
            a: "Ananya R.",
            r: "CEO, Northwind",
          },
          {
            q: "Easily the most senior engineering partner we've worked with. Obsessed with details.",
            a: "Marcus L.",
            r: "CTO, Hexa",
          },
          {
            q: "Design, code, ops — they own outcomes, not tickets.",
            a: "Priya S.",
            r: "VP Product, Lumio",
          },
          {
            q: "From discovery to launch in one continuous, beautiful arc.",
            a: "Daniel K.",
            r: "Founder, Vela",
          },
        ],
        logos: ["NIMBUS", "ORBIT", "PULSE", "LUMEN", "VOYAGE", "SYNAPSE", "HEXA", "VELA"],
      },
    },
    {
      id: "enquiry",
      type: "enquiry",
      active: true,
      order: 6,
      content: {
        eyebrow: "Start a project",
        title: "Tell us about your ",
        titleItalic: "idea",
        titleSuffix: ".",
        description: "We'll respond within one business day with a discovery plan.",
      },
    },
  ],
};

export const DEFAULT_ABOUT = {
  seo: {
    title: "About — GURMITRAA",
    description:
      "GURMITRAA is a software product development and IT consulting studio from India. Meet the team behind the craft.",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      active: true,
      order: 0,
      content: {
        eyebrow: "About us",
        title: "A perfect team that engineering",
        titleItalic: "tomorrow's",
        titleSuffix: " software, today.",
        description:
          "GURMITRAA is a product, design and engineering Innovative team based in India, partnering with founders and enterprises around the world. We believe great software is born from craft, courage, and obsessive care.",
      },
    },
    {
      id: "story",
      type: "story",
      active: true,
      order: 1,
      content: {
        eyebrow: "Who we are",
        title: "Started with one idea: ",
        titleItalic: "make software that matters",
        titleSuffix: ".",
        imageUrl: "/images/about_story.png",
        paragraph1:
          "Founded in 2013, GURMITRAA grew from a small atelier of engineers into a multi-disciplinary studio serving clients across Europe, North America and Asia. Through every chapter, our north star has stayed the same — craft.",
        paragraph2:
          "Today we partner with venture-backed founders, growth-stage companies and global enterprises to imagine, design and engineer products that shape the next decade of digital experiences.",
        yearsText: "12 years",
        yearsSub: "of crafting software",
      },
    },
    {
      id: "vision_mission",
      type: "vision_mission",
      active: true,
      order: 2,
      content: {
        eyebrow: "Vision · Mission · Values",
        title: "What we believe, ",
        titleItalic: "embedded in every product",
        titleSuffix: ".",
        visionText:
          "Build a global studio that's a benchmark for digital craft — where technology, design and imagination meet without compromise.",
        missionText:
          "Engineer software experiences that move companies — and the people they serve — into the future, faster.",
        values: [
          { t: "Craft", d: "Every pixel, every line of code is intentional.", icon: "Sparkles" },
          { t: "Outcomes", d: "We ship business impact, not deliverables.", icon: "Target" },
          { t: "Partnership", d: "Long-term collaboration over short-term wins.", icon: "Heart" },
          { t: "Foresight", d: "Designed for where the world is going.", icon: "Eye" },
        ],
      },
    },
    {
      id: "team",
      type: "team",
      active: true,
      order: 3,
      content: {
        eyebrow: "Team & culture",
        title: "A multi-disciplinary collective of ",
        titleItalic: "makers",
        titleSuffix: ".",
        description: "Engineers, designers, strategists, researchers — working as one.",
        members: [
          { n: "Ananya Rao", r: "Founder, CEO" },
          { n: "Vikram Shah", r: "Head of Engineering" },
          { n: "Meera Iyer", r: "Design Director" },
          { n: "Rohan Mehta", r: "Product Strategy" },
        ],
      },
    },
    {
      id: "why_us",
      type: "why_us",
      active: true,
      order: 4,
      content: {
        eyebrow: "Why us",
        title: "Senior, cross-functional teams — ",
        titleItalic: "no juniors hidden in pods",
        titleSuffix: ".",
        imageUrl: "/images/about_why_us.png",
        items: [
          "Founder-level care on every engagement",
          "Designers and engineers in the same room",
          "Fixed-scope or embedded squads — your call",
          "Code we'd be proud to ship under our own brand",
          "Documented, handover-ready from day one",
          "Long-term partnership, not vendor handoffs",
        ],
      },
    },
    {
      id: "timeline",
      type: "timeline",
      active: true,
      order: 5,
      content: {
        eyebrow: "Achievements",
        title: "A timeline of ",
        titleItalic: "milestones",
        titleSuffix: ".",
        list: [
          { y: "2013", t: "Studio founded", d: "A small team with a big ambition in Bengaluru." },
          { y: "2016", t: "First global client", d: "We crossed borders and never looked back." },
          {
            y: "2019",
            t: "100+ products shipped",
            d: "Web, mobile, platforms — across 5 continents.",
          },
          {
            y: "2022",
            t: "Product engineering arm",
            d: "0→1 launches with venture-backed founders.",
          },
          { y: "2025", t: "AI & cloud practice", d: "Building intelligent systems at scale." },
        ],
      },
    },
    {
      id: "cta",
      type: "cta",
      active: true,
      order: 6,
      content: {
        title: "Let's build something ",
        titleItalic: "worth remembering",
        titleSuffix: ".",
        ctaText: "Start a conversation",
        ctaLink: "/contact#enquiry",
        ceoImage: "/images/ceo.png",
        ceoTalk: "We don't just write code; we design futures. Every product we build is a testament to our obsession with craft.",
        ceoName: "Ananya Rao, CEO & Founder",
      },
    },
  ],
};

export const DEFAULT_SERVICES = {
  seo: {
    title: "Services — GURMITRAA",
    description:
      "Web, mobile, product, consulting, cloud and ecommerce — full-stack digital services delivered with craft.",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      active: true,
      order: 0,
      content: {
        eyebrow: "Services",
        title: "Capabilities that ",
        titleItalic: "compound",
        titleSuffix: " into outcomes.",
        description: "Eight disciplines, one team. From strategy through launch and beyond.",
      },
    },
    {
      id: "list",
      type: "list",
      active: true,
      order: 1,
      content: {
        eyebrow: "All services",
        title: "What we ",
        titleItalic: "do best",
        titleSuffix: ".",
        list: [
          {
            t: "Web Development",
            d: "Marketing sites, dashboards, SaaS platforms — performant by default.",
            b: ["Next.js / React", "Edge rendering", "Design systems"],
            icon: "Code2",
          },
          {
            t: "Mobile Apps",
            d: "iOS, Android and cross-platform apps users open every day.",
            b: ["Swift / Kotlin", "React Native", "Offline-first"],
            icon: "Smartphone",
          },
          {
            t: "IT Consulting",
            d: "Audits, architecture, strategy — clarity at every layer.",
            b: ["Tech due diligence", "Architecture review", "CTO advisory"],
            icon: "Lightbulb",
          },
          {
            t: "Product Development",
            d: "0→1 software products built with founders.",
            b: ["Discovery sprints", "MVP launch", "Scale-ready code"],
            icon: "Boxes",
          },
          {
            t: "Digital Marketing",
            d: "Brand, growth, performance and SEO that compounds.",
            b: ["SEO", "Paid growth", "Content systems"],
            icon: "Megaphone",
          },
          {
            t: "Ecommerce",
            d: "Headless storefronts that convert at every scale.",
            b: ["Shopify Hydrogen", "Custom checkout", "Internationalization"],
            icon: "ShoppingBag",
          },
          {
            t: "UI / UX Design",
            d: "Brand-aligned interfaces that feel inevitable.",
            b: ["Research", "Design systems", "Motion design"],
            icon: "Palette",
          },
          {
            t: "Cloud Solutions",
            d: "Cloud-native infrastructure built for resilience.",
            b: ["AWS / GCP / Azure", "DevOps & IaC", "Observability"],
            icon: "Cloud",
          },
        ],
      },
    },
    {
      id: "process",
      type: "process",
      active: true,
      order: 2,
      content: {
        eyebrow: "Development process",
        title: "From idea to ",
        titleItalic: "shipped product",
        titleSuffix: ".",
        list: ["Discover", "Design", "Develop", "Deploy"],
        descs: [
          "Workshops, audits, and alignment on goals and scope.",
          "Systems, prototypes and brand-aligned interface design.",
          "Production code, tests, infrastructure and integrations.",
          "Launch, monitor, iterate — turn release into momentum.",
        ],
      },
    },
    {
      id: "tech_stack",
      type: "tech_stack",
      active: true,
      order: 3,
      content: {
        eyebrow: "Technology stack",
        title: "Tools we ",
        titleItalic: "love and ship",
        titleSuffix: ".",
        stack: [
          "TypeScript",
          "React",
          "Next.js",
          "Node.js",
          "Python",
          "Go",
          "PostgreSQL",
          "MongoDB",
          "Redis",
          "Kafka",
          "GraphQL",
          "tRPC",
          "AWS",
          "GCP",
          "Cloudflare",
          "Vercel",
          "Docker",
          "Kubernetes",
          "Figma",
          "Framer",
          "Lottie",
          "GSAP",
          "WebGL",
          "Three.js",
        ],
      },
    },
    {
      id: "benefits",
      type: "benefits",
      active: true,
      order: 4,
      content: {
        eyebrow: "Why work with us",
        title: "Benefits you'll ",
        titleItalic: "feel from week one",
        titleSuffix: ".",
        list: [
          {
            t: "Lightning velocity",
            d: "Senior teams move 2–3x faster than typical agencies.",
            icon: "Zap",
          },
          {
            t: "Production-grade",
            d: "Testing, observability and security baked in.",
            icon: "ShieldCheck",
          },
          { t: "Design + Code", d: "One studio, one pen — no handoff gaps.", icon: "Layers" },
          { t: "Launch & evolve", d: "We partner long after launch day.", icon: "Rocket" },
        ],
      },
    },
    {
      id: "faq",
      type: "faq",
      active: true,
      order: 5,
      content: {
        eyebrow: "FAQ",
        title: "Things people ",
        titleItalic: "often ask",
        titleSuffix: ".",
        faqs: [
          {
            q: "How do you engage with clients?",
            a: "Fixed-scope projects, retainers, or embedded squads — chosen based on your stage and need.",
          },
          {
            q: "What's your typical timeline?",
            a: "MVPs ship in 8–12 weeks. Large platforms run 3–9 months with continuous releases.",
          },
          { q: "Do you sign NDAs?", a: "Yes — always, before any discovery work begins." },
          {
            q: "Can you work with our existing team?",
            a: "Absolutely. We routinely embed alongside in-house engineering and design teams.",
          },
          {
            q: "Do you offer post-launch support?",
            a: "Yes — SLAs, monitoring, and feature evolution under retainer.",
          },
        ],
      },
    },
  ],
};

export const DEFAULT_PRODUCTS = {
  seo: {
    title: "Products — GURMITRAA",
    description:
      "Modern SaaS products engineered by GURMITRAA — for commerce, analytics, learning, healthcare and finance.",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      active: true,
      order: 0,
      content: {
        eyebrow: "Products",
        title: "Software ",
        titleItalic: "products",
        titleSuffix: " for the next decade.",
        description:
          "We don't just build for clients — we ship our own SaaS products, engineered with the same craft we bring to every engagement.",
      },
    },
    {
      id: "showcase",
      type: "showcase",
      active: true,
      order: 1,
      content: {
        eyebrow: "Product showcase",
        title: "Our ",
        titleItalic: "launched",
        titleSuffix: " products.",
        list: [
          {
            t: "Synapse AI",
            d: "Conversational intelligence platform for enterprise teams.",
            color: "from-orange to-red-500",
            icon: "Bot",
            imageUrl: "/images/synapse_studio.png",
          },
          {
            t: "Orbit Analytics",
            d: "Realtime product analytics with zero instrumentation.",
            color: "from-indigo-500 to-blue-700",
            icon: "BarChart3",
            imageUrl: "/images/orbit_analytics.png",
          },
          {
            t: "Lumen Commerce",
            d: "Headless commerce engine for boutique global brands.",
            color: "from-fuchsia-500 to-purple-700",
            icon: "ShoppingBag",
            imageUrl: "/images/lumen_commerce.png",
          },
          {
            t: "Mentora",
            d: "Cohort-based learning platform with live experiences.",
            color: "from-emerald-500 to-teal-700",
            icon: "GraduationCap",
            imageUrl: "/images/mentora_learn.png",
          },
        ],
      },
    },
    {
      id: "features",
      type: "features",
      active: true,
      order: 2,
      content: {
        eyebrow: "Product features",
        title: "Engineered with the ",
        titleItalic: "enterprise in mind",
        titleSuffix: ".",
        imageUrl: "/images/enterprise_features.png",
        list: [
          "Modular architecture",
          "Enterprise SSO",
          "Realtime collaboration",
          "Audit-grade security",
          "AI-native workflows",
          "API-first design",
          "Multi-tenant by default",
          "Global edge delivery",
        ],
        activeUsers: "12.4k",
        revenueMom: "+34%",
      },
    },
    {
      id: "industries",
      type: "industries",
      active: true,
      order: 3,
      content: {
        eyebrow: "Industries served",
        title: "Trusted across ",
        titleItalic: "verticals",
        titleSuffix: ".",
        list: [
          { t: "Fintech", icon: "Banknote" },
          { t: "Healthcare", icon: "HeartPulse" },
          { t: "Retail", icon: "ShoppingBag" },
          { t: "Education", icon: "GraduationCap" },
          { t: "Enterprise", icon: "Building2" },
          { t: "AI & SaaS", icon: "Bot" },
        ],
      },
    },
    {
      id: "workflow",
      type: "workflow",
      active: true,
      order: 4,
      content: {
        eyebrow: "Product workflow",
        title: "How our products ",
        titleItalic: "come alive",
        titleSuffix: ".",
        list: [
          "Research & discovery",
          "Strategic product design",
          "Engineering & QA",
          "Beta with design partners",
          "Public launch & growth",
        ],
      },
    },
    {
      id: "cta",
      type: "cta",
      active: true,
      order: 5,
      content: {
        title: "Want a ",
        titleItalic: "demo",
        titleSuffix: " or a custom build?",
        ctaText: "Request access",
        ctaLink: "/contact",
      },
    },
  ],
};

export const DEFAULT_PORTFOLIO = {
  seo: {
    title: "Portfolio — GURMITRAA",
    description:
      "Selected work from GURMITRAA — case studies across fintech, SaaS, healthcare, ecommerce and AI.",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      active: true,
      order: 0,
      content: {
        eyebrow: "Portfolio",
        title: "Selected work. ",
        titleItalic: "Real outcomes",
        titleSuffix: ".",
      },
    },
    {
      id: "projects",
      type: "projects",
      active: true,
      order: 1,
      content: {
        filters: ["All", "Fintech", "SaaS", "Healthcare", "Ecommerce", "Mobile", "AI"],
        list: [
          { t: "Nimbus Banking", c: "Fintech", color: "from-indigo-500 to-blue-700", year: "2024", imageUrl: "/images/nimbus_banking.png" },
          { t: "Orbit Analytics", c: "SaaS", color: "from-orange to-red-500", year: "2024", imageUrl: "/images/orbit_analytics.png" },
          { t: "PulseCare", c: "Healthcare", color: "from-emerald-500 to-teal-700", year: "2023", imageUrl: "/images/pulsecare.png" },
          {
            t: "Lumen Commerce",
            c: "Ecommerce",
            color: "from-fuchsia-500 to-purple-700",
            year: "2024",
            imageUrl: "/images/lumen_commerce.png",
          },
          { t: "Voyage Travel", c: "Mobile", color: "from-amber-500 to-orange-600", year: "2023", imageUrl: "/images/voyage_travel.png" },
          { t: "Synapse Studio", c: "AI", color: "from-slate-700 to-navy-deep", year: "2025", imageUrl: "/images/synapse_studio.png" },
          { t: "Mentora Learn", c: "SaaS", color: "from-rose-500 to-pink-700", year: "2024", imageUrl: "/images/mentora_learn.png" },
          { t: "Vela Mobility", c: "Mobile", color: "from-cyan-500 to-blue-600", year: "2023", imageUrl: "/images/vela_mobility.png" },
          {
            t: "Hexa Health",
            c: "Healthcare",
            color: "from-teal-500 to-emerald-700",
            year: "2025",
            imageUrl: "/images/hexa_health.png",
          },
        ],
      },
    },
    {
      id: "case_studies",
      type: "case_studies",
      active: true,
      order: 2,
      content: {
        eyebrow: "Case studies",
        title: "Inside our ",
        titleItalic: "favorite launches",
        titleSuffix: ".",
        list: [
          {
            t: "Nimbus Banking — Rebuilt in 90 days",
            m: "2x revenue",
            d: "Replatformed legacy banking app to a modern React + Node stack with biometric auth.",
            color: "from-indigo-500 to-blue-700",
          },
          {
            t: "Orbit Analytics — From beta to series A",
            m: "+340% MAU",
            d: "Realtime analytics with WebSockets, ClickHouse and edge rendering.",
            color: "from-orange to-red-500",
          },
          {
            t: "PulseCare — HIPAA-grade telehealth",
            m: "99.99% uptime",
            d: "End-to-end telehealth with video, payments and clinician workflows.",
            color: "from-emerald-500 to-teal-700",
          },
        ],
      },
    },
    {
      id: "showreel",
      type: "showreel",
      active: true,
      order: 3,
      content: {
        eyebrow: "Video showcase",
        title: "Motion ",
        titleItalic: "reels",
        titleSuffix: " from selected work.",
        videoTitle: "GURMITRAA — Year in motion",
        videoSubtitle: "2025 Showreel",
        videoUrl: "",
      },
    },
    {
      id: "awards",
      type: "awards",
      active: true,
      order: 4,
      content: {
        eyebrow: "Awards & recognition",
        title: "Recognition for our ",
        titleItalic: "work",
        titleSuffix: ".",
        list: [
          { y: "2025", t: "Awwwards Site of the Day", c: "Orbit Analytics" },
          { y: "2024", t: "CSS Design Awards — Best UI", c: "Lumen Commerce" },
          { y: "2024", t: "FWA — Site of the Day", c: "Synapse Studio" },
          { y: "2023", t: "Webby Honoree — Mobile", c: "Voyage Travel" },
        ],
      },
    },
  ],
};

export const DEFAULT_CONTACT = {
  seo: {
    title: "Contact — GURMITRAA",
    description:
      "Get in touch with GURMITRAA — start a project, request a demo, or join our team.",
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      active: true,
      order: 0,
      content: {
        eyebrow: "Contact",
        title: "Let's build something ",
        titleItalic: "together",
        titleSuffix: ".",
        description:
          "Tell us about your product, problem or possibility — and we'll come back with a discovery plan within a day.",
      },
    },
    {
      id: "form_section",
      type: "form_section",
      active: true,
      order: 1,
      content: {
        title: "Project enquiry",
        email: "hello@gurmitraa.com",
        phone: "+91 98765 43210",
        address: "Bengaluru, India",
        socialLinks: ["Twitter", "Linkedin", "Github", "Instagram"],
      },
    },
    {
      id: "map",
      type: "map",
      active: true,
      order: 2,
      content: {
        eyebrow: "Find us",
        title: "Our ",
        titleItalic: "studio",
        titleSuffix: " in Bengaluru.",
        mapIframeUrl: "https://www.google.com/maps?q=Bengaluru,India&z=12&output=embed",
      },
    },
    {
      id: "faq",
      type: "faq",
      active: true,
      order: 3,
      content: {
        eyebrow: "FAQ",
        title: "Quick ",
        titleItalic: "answers",
        titleSuffix: ".",
        faqs: [
          { q: "How quickly will you respond?", a: "Within one business day, usually faster." },
          {
            q: "Where are you based?",
            a: "Bengaluru, India — serving clients across 20+ countries.",
          },
          { q: "Do you sign NDAs?", a: "Always — before discovery begins." },
          { q: "What's the smallest engagement?", a: "A 2-week discovery sprint, fixed-scope." },
        ],
      },
    },
  ],
};
