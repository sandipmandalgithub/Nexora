import { useState } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    number: "01",
    icon: "📚",
    title: "Structured Learning",
    description:
      "Explore organized learning paths designed to help you build knowledge one step at a time.",
  },
  {
    number: "02",
    icon: "🎯",
    title: "Smart Assessments",
    description:
      "Practice with online examinations and understand your strengths through focused assessments.",
  },
  {
    number: "03",
    icon: "📈",
    title: "Track Your Progress",
    description:
      "Keep your learning goals in sight and monitor your progress as you move forward.",
  },
];

const learningTopics = [
  { name: "Web Development", lessons: "Frontend & Backend", icon: "💻" },
  { name: "Programming", lessons: "Logic & Problem Solving", icon: "⌨️" },
  { name: "Data & Technology", lessons: "Build Core Knowledge", icon: "📊" },
];

function Brand({ light = false }) {
  return (
    <Link
      to="/"
      aria-label="Nexora home"
      className={`group inline-flex shrink-0 items-center gap-3 ${
        light ? "text-white" : "text-slate-950"
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 text-2xl font-black text-white shadow-lg shadow-indigo-600/25 transition duration-300 group-hover:-rotate-3 group-hover:scale-105">
        N
      </span>

      <span className="text-2xl font-black tracking-tight">
        Nexora<span className="text-indigo-500">.</span>
      </span>
    </Link>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Learning", href: "#learning" },
    { label: "About", href: "#about" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm shadow-slate-950/[0.02] backdrop-blur-2xl">
      <div className="mx-auto flex min-h-[76px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <Link
            to="/login"
            className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-700"
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-600/30"
          >
            Get Started
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t border-slate-100 bg-white px-4 py-4 shadow-xl sm:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto flex max-w-[1280px] flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                {link.label}
              </a>
            ))}

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                onClick={closeMenu}
                className="flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Get Started <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-indigo-100/70 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-violet-100/60 blur-3xl" />
      </div>

      <div className="mx-auto grid min-w-0 max-w-[1280px] items-center gap-10 px-4 py-12 sm:gap-14 sm:px-6 sm:py-20 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-28">
        <div className="min-w-0 max-w-2xl">
          <div className="mb-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold leading-5 text-indigo-700 sm:mb-7 sm:px-3.5 sm:text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="min-w-0 break-words">
              Your journey to better learning starts here
            </span>
          </div>

          <h1 className="break-words text-4xl font-black leading-[1.12] tracking-[-0.045em] text-slate-950 sm:text-5xl md:text-6xl lg:text-[4.15rem]">
            Learn smarter.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-500 bg-clip-text text-transparent">
              Achieve more.
            </span>
          </h1>

          <p className="mt-5 max-w-xl break-words text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
            Discover a better way to learn, practice your skills, and prepare
            for your next big opportunity—all in one learning platform.
          </p>

          <div className="mt-7 flex min-w-0 flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/courses"
              className="inline-flex min-h-13 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-center font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 sm:w-auto sm:px-7"
            >
              Explore Learning <span aria-hidden="true">→</span>
            </Link>

            <a
              href="#features"
              className="inline-flex min-h-13 w-full min-w-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-center font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 sm:w-auto sm:px-7"
            >
              Discover Features
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:mt-10 sm:gap-x-6">
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 font-bold text-emerald-600">✓</span>
              Learn at your pace
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 font-bold text-emerald-600">✓</span>
              Practice with purpose
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-[540px] lg:ml-auto">
          <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100 opacity-80 blur-xl sm:-inset-4" />

          <div className="relative min-w-0 overflow-hidden rounded-2xl border border-white bg-white p-3 shadow-2xl shadow-indigo-950/10 sm:rounded-[1.75rem] sm:p-6">
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-100 pb-4 sm:pb-5">
              <div className="min-w-0">
                <p className="break-words text-xs font-bold uppercase tracking-[0.12em] text-indigo-600 sm:tracking-[0.16em]">
                  Your workspace
                </p>
                <h2 className="mt-1 break-words text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  Learning overview
                </h2>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-xl sm:h-11 sm:w-11">
                ✨
              </div>
            </div>

            <div className="mt-4 grid min-w-0 grid-cols-2 gap-2 sm:mt-5 sm:gap-4">
              <div className="min-w-0 rounded-xl bg-indigo-50 p-3 sm:rounded-2xl sm:p-5">
                <div className="flex min-w-0 items-center justify-between gap-1">
                  <span className="break-words text-xs font-semibold text-indigo-700 sm:text-sm">
                    Learning
                  </span>
                  <span className="shrink-0 text-base sm:text-lg">📘</span>
                </div>
                <p className="mt-3 break-words text-xl font-black text-slate-900 sm:text-3xl">
                  Explore
                </p>
                <p className="mt-1 break-words text-xs text-slate-500 sm:text-sm">
                  New knowledge
                </p>
              </div>

              <div className="min-w-0 rounded-xl bg-violet-50 p-3 sm:rounded-2xl sm:p-5">
                <div className="flex min-w-0 items-center justify-between gap-1">
                  <span className="break-words text-xs font-semibold text-violet-700 sm:text-sm">
                    Practice
                  </span>
                  <span className="shrink-0 text-base sm:text-lg">🎯</span>
                </div>
                <p className="mt-3 break-words text-xl font-black text-slate-900 sm:text-3xl">
                  Improve
                </p>
                <p className="mt-1 break-words text-xs text-slate-500 sm:text-sm">
                  Build confidence
                </p>
              </div>
            </div>

            <div className="mt-3 min-w-0 rounded-xl border border-slate-100 p-3 sm:mt-4 sm:rounded-2xl sm:p-5">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-bold text-slate-900">
                    Your learning path
                  </p>
                  <p className="mt-1 break-words text-xs text-slate-500 sm:text-sm">
                    Small steps, meaningful progress
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg sm:h-10 sm:w-10">
                  📈
                </span>
              </div>

              <div className="mt-4 space-y-4 sm:mt-5">
                {[
                  {
                    title: "Discover new topics",
                    width: "w-full",
                    color: "bg-indigo-500",
                  },
                  {
                    title: "Practice your skills",
                    width: "w-3/4",
                    color: "bg-violet-500",
                  },
                  {
                    title: "Review your progress",
                    width: "w-1/2",
                    color: "bg-emerald-500",
                  },
                ].map((item) => (
                  <div key={item.title} className="min-w-0">
                    <div className="mb-2 flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-600 sm:text-sm">
                      <span className="shrink-0 text-emerald-600">✓</span>
                      <span className="break-words">{item.title}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${item.width} ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex min-w-0 items-center gap-2 rounded-xl bg-slate-950 p-3 text-white sm:mt-4 sm:gap-3 sm:rounded-2xl sm:p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg sm:h-11 sm:w-11 sm:text-xl">
                🚀
              </div>
              <div className="min-w-0">
                <p className="break-words text-sm font-bold sm:text-base">
                  Ready for your next step?
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-slate-300 sm:text-sm">
                  Keep learning. Keep moving forward.
                </p>
              </div>
              <span className="ml-auto shrink-0 text-lg text-indigo-300 sm:text-xl">
                ↗
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="bg-slate-50 py-14 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600 sm:text-sm sm:tracking-[0.2em]">
            Why Nexora
          </span>
          <h2 className="mt-4 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Everything you need to{" "}
            <span className="text-indigo-600">move forward.</span>
          </h2>
          <p className="mt-5 break-words text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Build good learning habits with tools that help you study, practice,
            and keep improving.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5 sm:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl transition group-hover:bg-indigo-100 sm:h-14 sm:w-14">
                  {feature.icon}
                </span>
                <span className="text-sm font-black tracking-widest text-slate-300">
                  {feature.number}
                </span>
              </div>
              <h3 className="mt-6 break-words text-xl font-extrabold text-slate-900 sm:mt-7">
                {feature.title}
              </h3>
              <p className="mt-3 break-words text-sm leading-7 text-slate-600 sm:text-base">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Learning() {
  return (
    <section id="learning" className="bg-white py-14 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="min-w-0 max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600 sm:text-sm sm:tracking-[0.2em]">
              Explore & grow
            </span>
            <h2 className="mt-4 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Find your next learning path.
            </h2>
            <p className="mt-4 break-words leading-7 text-slate-600">
              Start with the areas that interest you and build a strong
              foundation for what comes next.
            </p>
          </div>

          <Link
            to="/courses"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 md:self-auto"
          >
            Browse all courses <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {learningTopics.map((topic, index) => (
            <Link
              key={topic.name}
              to={`/courses?category=${encodeURIComponent(topic.name)}`}
              className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-lg sm:gap-4 sm:p-6"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl sm:h-14 sm:w-14 ${
                  index === 0
                    ? "bg-sky-50"
                    : index === 1
                      ? "bg-violet-50"
                      : "bg-emerald-50"
                }`}
              >
                {topic.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="break-words font-extrabold text-slate-900">
                  {topic.name}
                </h3>
                <p className="mt-1 break-words text-sm text-slate-500">
                  {topic.lessons}
                </p>
              </div>
              <span className="shrink-0 text-lg text-indigo-500">↗</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section
      id="about"
      className="relative isolate overflow-hidden bg-gradient-to-br from-sky-50 via-indigo-50 to-violet-100 py-14 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />

      <div className="mx-auto grid min-w-0 max-w-[1280px] items-center gap-7 px-4 sm:gap-8 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] lg:px-8">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-indigo-200 bg-white/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-700 shadow-sm sm:text-sm sm:tracking-[0.2em]">
            Learn with purpose
          </span>

          <h2 className="mt-5 max-w-2xl break-words text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Your potential deserves a better platform.
          </h2>

          <p className="mt-5 max-w-2xl break-words leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Nexora brings learning and online assessment together in one
            organized experience—so you can focus on becoming better every day.
          </p>
        </div>

        <Link
          to="/courses"
          className="inline-flex min-h-13 max-w-full items-center justify-center gap-2 justify-self-start rounded-xl bg-indigo-600 px-7 py-3.5 text-center font-bold text-white shadow-lg shadow-indigo-600/25 transition duration-200 hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 md:justify-self-end"
        >
          Start Exploring <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  const footerGroups = [
    {
      title: "Explore",
      links: [
        { label: "Home", href: "/#home" },
        { label: "Features", href: "/#features" },
        { label: "Learning", href: "/#learning" },
        { label: "About Nexora", href: "/#about" },
      ],
    },
    {
      title: "Learning",
      links: [
        { label: "Browse Courses", href: "/courses" },
        { label: "Student Dashboard", href: "/dashboard" },
        { label: "My Learning", href: "/dashboard" },
      ],
    },
    {
      title: "Your Account",
      links: [
        { label: "Sign In", href: "/login" },
        { label: "Create Account", href: "/register" },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12">
          <div className="min-w-0">
            <Brand light />

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              A smarter way to learn, practice your skills, and track your
              progress—all in one place.
            </p>

            <Link
              to="/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white transition hover:border-indigo-400/50 hover:bg-indigo-500/10"
            >
              Explore courses <span aria-hidden="true">→</span>
            </Link>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title} className="min-w-0">
              <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white">
                {group.title}
              </h3>

              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    {link.href.startsWith("/#") ? (
                      <a
                        href={link.href}
                        className="inline-flex text-sm text-slate-400 transition hover:translate-x-1 hover:text-indigo-300"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="inline-flex text-sm text-slate-400 transition hover:translate-x-1 hover:text-indigo-300"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Nexora. All rights reserved.
          </p>

          <p className="flex items-center gap-2 text-sm text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Learn smarter. Achieve more.
          </p>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <Learning />
        <About />
      </main>
      <Footer />
    </div>
  );
}

export default App;
