export interface MenuOption {
  name: string;
  description: string;
  rotation: number;
  zIndex: number;
  offsetX: number;
  offsetY: number;
  fontSize: string;
  bannerScaleX: number;
  bannerScaleY: number;
  tag: string;
  summary: string;
}

export interface PinnedProject {
  numeral: string;
  title: string;
  subtitle: string;
  desc: string;
  stack: string[];
  repoUrl: string;
  demoUrl?: string;
  isEnterprise?: boolean;
}

export interface SkillItem {
  name: string;
  level: number;
}

export interface SkillGroup {
  id: string;
  code: string;
  title: string;
  skills: SkillItem[];
}

export interface SkillTab {
  id: string;
  code: string;
  label: string;
}

export interface ContactChannel {
  label: string;
  value: string;
  href: string;
  iconType: "gmail" | "github" | "linkedin" | "web" | "location";
}

export const MENU_OPTIONS: MenuOption[] = [
  {
    name: "PROJECT",
    description: "View Featured Systems & Works",
    rotation: -20,
    zIndex: 1,
    offsetX: -40,
    offsetY: 25,
    fontSize: "5.15rem",
    bannerScaleX: 1.07,
    bannerScaleY: 3.35,
    tag: "PINNED REPOSITORIES",
    summary: "Production web applications, AI RAG assistants & mobile engineering"
  },
  {
    name: "SKILLS",
    description: "Technical Abilities & Stack Matrix",
    rotation: -12,
    zIndex: 2,
    offsetX: -65,
    offsetY: 30,
    fontSize: "4.55rem",
    bannerScaleX: 0.96,
    bannerScaleY: 3.05,
    tag: "ABILITIES & PROFICIENCY",
    summary: "Modern backend systems, reactive frontends, mobile architectures & cloud tooling"
  },
  {
    name: "ABOUT",
    description: "Developer Profile & Experience",
    rotation: -4,
    zIndex: 3,
    offsetX: -80,
    offsetY: 35,
    fontSize: "4.85rem",
    bannerScaleX: 1.02,
    bannerScaleY: 3.25,
    tag: "PROFILE & JOURNEY",
    summary: "Fullstack developer specializing in Laravel, Flutter, and high-concurrency systems"
  },
  {
    name: "CONTACT",
    description: "Initiate Communication & Channels",
    rotation: 5,
    zIndex: 4,
    offsetX: -85,
    offsetY: 40,
    fontSize: "4.65rem",
    bannerScaleX: 1.04,
    bannerScaleY: 3.2,
    tag: "COMMUNICATION CHANNELS",
    summary: "Available for engineering roles, technical collaboration & freelance systems"
  }
];

export const PINNED_PROJECTS: PinnedProject[] = [
  {
    numeral: "I",
    title: "ACADEMIA STUDY COMPANION",
    subtitle: "AI RAG ASSISTANT · HYBRID SEARCH & RERANKING",
    desc: "Intelligent study assistant integrating modern RAG with Hybrid Search (BM25 + Dense Vector Search) and FlashRank Cross-Encoder reranking for university coursework.",
    stack: ["TypeScript", "Next.js", "FastAPI", "LangChain", "Ollama", "ChromaDB"],
    repoUrl: "https://github.com/Zee7X/Academia-Study-Companion"
  },
  {
    numeral: "II",
    title: "SISTEM INFORMASI BHP LAB",
    subtitle: "LAB CONSUMABLES & INVENTORY GATEWAY",
    desc: "Comprehensive lab consumables inventory management for Politeknik Negeri Cilacap with stock in/out tracking, low-stock threshold triggers, and multi-tier approval flows.",
    stack: ["Laravel", "Inertia.js", "React", "Tailwind CSS", "MySQL", "Docker"],
    repoUrl: "https://github.com/Zee7X/Sistem-Informasi-Bahan-Habis-Pakai",
    demoUrl: "https://bhp-lab.onrender.com/login?email=admin%40bhp.com&password=12345"
  },
  {
    numeral: "III",
    title: "SISTEM INFORMASI CUTI PEGAWAI",
    subtitle: "TRANSACTION-SAFE HR LEAVE SYSTEM",
    desc: "Enterprise HR leave management system featuring multi-tier manager review pipelines, raw MySQL database locking against race conditions, and asynchronous queue broadcasts.",
    stack: ["Laravel", "MySQL", "JavaScript", "Docker", "Render"],
    repoUrl: "https://github.com/Zee7X/Sistem-Informasi-Permohonan-Cuti-Pegawai",
    demoUrl: "https://sicute.onrender.com/login?nip=200302094&password=test"
  },
  {
    numeral: "IV",
    title: "LITERASI DIGITAL TUNA NETRA",
    subtitle: "ACCESSIBILITY-FIRST MOBILE APPLICATION",
    desc: "Digital literacy Android mobile app engineered specifically for visually impaired users. Built with accessibility and TalkBack screen-reader compatibility from ground zero.",
    stack: ["Flutter", "Dart", "Firebase", "Accessibility"],
    repoUrl: "https://github.com/Zee7X/Literasi-Digital-Tuna-Netra"
  },
  {
    numeral: "V",
    title: "CAMPUS PROFILE PNC (ITO PNC)",
    subtitle: "OFFLINE-FIRST CAMPUS DIRECTORY & MAP",
    desc: "Offline-first campus profile mobile app for Politeknik Negeri Cilacap with local caching, custom canvas rendering for campus navigation mapping, and search indexing.",
    stack: ["Flutter", "Dart", "Provider", "Canvas Map"],
    repoUrl: "https://github.com/Zee7X/Campus-Profile-Politeknik-Negeri-Cilacap",
    demoUrl: "https://play.google.com/store/apps/details?id=com.pnc.itoapp&hl=id"
  },
  {
    numeral: "VI",
    title: "POCKETFLOW",
    subtitle: "SALARY-FIRST ZERO-BASED BUDGETING",
    desc: "Smart salary-first zero-based budgeting mobile app built with Flutter and Riverpod, featuring allocation envelopes, cashflow analytics, and neo-banking visual design.",
    stack: ["Flutter", "Dart", "Riverpod", "Neo-Banking"],
    repoUrl: "https://github.com/Zee7X/Pocket-Flow"
  }
];

export const SKILL_TABS: SkillTab[] = [
  { id: "backend", code: "01", label: "BACKEND" },
  { id: "frontend", code: "02", label: "FRONTEND" },
  { id: "mobile", code: "03", label: "MOBILE" },
  { id: "infra", code: "04", label: "INFRA & TOOLS" }
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "backend",
    code: "01",
    title: "BACKEND & DISTRIBUTED SYSTEMS",
    skills: [
      { name: "Laravel & Core Framework", level: 95 },
      { name: "CodeIgniter 4 & RESTful APIs", level: 90 },
      { name: "PHP 8.x Modern Ecosystem", level: 92 },
      { name: "MySQL & SQL Server (Locks & Indexing)", level: 88 },
      { name: "Laravel Reverb & Real-time WebSockets", level: 86 },
      { name: "Asynchronous Queue Workers & Jobs", level: 85 }
    ]
  },
  {
    id: "frontend",
    code: "02",
    title: "FRONTEND & WEB INTERACTION",
    skills: [
      { name: "React & Next.js App Router", level: 90 },
      { name: "Inertia.js Fullstack Monolith", level: 92 },
      { name: "Tailwind CSS (v3 / v4) Systems", level: 95 },
      { name: "TypeScript & JavaScript (ESNext)", level: 88 },
      { name: "Semantic HTML5 & Native CSS3", level: 94 },
      { name: "Responsive Layouts & Motion HUD", level: 90 }
    ]
  },
  {
    id: "mobile",
    code: "03",
    title: "MOBILE APPLICATION ARCHITECTURE",
    skills: [
      { name: "Flutter & Dart Architecture", level: 92 },
      { name: "Riverpod & Provider State Management", level: 88 },
      { name: "Offline-First Caching & Local DB", level: 86 },
      { name: "Accessibility & Screen Reader Design", level: 85 },
      { name: "Custom Canvas & Vector Mapping", level: 84 },
      { name: "REST API & Cloud Synchronization", level: 90 }
    ]
  },
  {
    id: "infra",
    code: "04",
    title: "INFRASTRUCTURE & DEPLOYMENTS",
    skills: [
      { name: "Docker & Containerization", level: 85 },
      { name: "Git & GitHub Automation Workflows", level: 92 },
      { name: "Cloudflare & Cache-Purging APIs", level: 86 },
      { name: "cPanel & Linux Server Administration", level: 88 },
      { name: "Supabase & Firebase Cloud Backends", level: 88 },
      { name: "Postman & Automated API Verification", level: 90 }
    ]
  }
];

export const PROFILE_INFO = {
  name: "RIZICK FS",
  badgeName: "RIZICK FS",
  role: "Fullstack Developer & Systems Builder",
  bio: [
    "Hi! I am RIZICK FS, a Fullstack Developer & Systems Builder specializing in robust web architecture, real-time data sync, and high-performance hybrid mobile apps.",
    "Alumni D3 Teknik Informatika Politeknik Negeri Cilacap. Experienced building high-concurrency Laravel backends, CI4 REST APIs, and accessible Flutter apps designed to resolve actual operational friction."
  ],
  education: {
    institution: "Politeknik Negeri Cilacap",
    degree: "D3 Teknik Informatika (Associate Degree)",
    gpa: "3.62 / 4.00",
    period: "2020 – 2023",
    focus: "Specialized in database architecture, web application systems, networking, and software engineering."
  },
  career: [
    {
      company: "PT Murni Solusindo Nusantara",
      period: "2025 – Present",
      role: "Fullstack Web Developer",
      desc: "Indoconnex B2B connection portal: member portals, marketplace, job boards, real-time social timeline (Laravel, Tailwind, MySQL, Reverb) and CMS panels (React, Inertia.js)."
    },
    {
      company: "CV Entwo Electrical & Engineering",
      period: "2024 – 2025",
      role: "Backend Developer",
      desc: "Developed CI4 REST APIs for PLTU S2P Central App, consolidating 24 internal web applications (permits, environment monitoring, LK3, attendance) into a unified enterprise gateway."
    }
  ],
  quote: {
    text: "A systems mind and a modern stack: engineering software that bridges logic and value.",
    author: "Rizick FS"
  },
  photo: "/assets/profile.jpg",
  fallbackPhoto: "/assets/profile.jpg"
};

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    label: "Gmail",
    value: "rizick076@gmail.com",
    href: "mailto:rizick076@gmail.com",
    iconType: "gmail"
  },
  {
    label: "GitHub",
    value: "github.com/Zee7X",
    href: "https://github.com/Zee7X",
    iconType: "github"
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/rizick-z-123594327",
    href: "https://www.linkedin.com/in/rizick-z-123594327/",
    iconType: "linkedin"
  },
  {
    label: "Web Portfolio",
    value: "rizick-portfolio.vercel.app",
    href: "https://rizick-portfolio.vercel.app/",
    iconType: "web"
  },
  {
    label: "Status / Territory",
    value: "Indonesia · Ready for High-Impact Roles",
    href: "mailto:rizick076@gmail.com",
    iconType: "location"
  }
];
