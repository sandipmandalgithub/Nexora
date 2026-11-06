
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "./utils/api";

const features = [
  {
    number: "01",
    icon: "📚",
    title: "Structured Learning",
    description:
      "Explore organized learning paths designed to help you build knowledge one step at a time.",
    accent: "bg-indigo-50 text-indigo-600",
  },
  {
    number: "02",
    icon: "🎯",
    title: "Smart Assessments",
    description:
      "Practice with online examinations and understand your strengths through focused assessments.",
    accent: "bg-violet-50 text-violet-600",
  },
  {
    number: "03",
    icon: "📈",
    title: "Track Your Progress",
    description:
      "Keep your learning goals in sight and monitor your progress as you move forward.",
    accent: "bg-emerald-50 text-emerald-600",
  },
];

const learningTopics = [
  {
    name: "Web Development",
    lessons: "Frontend & Backend",
    icon: "💻",
    accent: "bg-sky-50 text-sky-600",
  },
  {
    name: "Programming",
    lessons: "Logic & Problem Solving",
    icon: "⌨️",
    accent: "bg-violet-50 text-violet-600",
  },
  {
    name: "Data & Technology",
    lessons: "Build Core Knowledge",
    icon: "📊",
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Database & Cloud Computing",
    lessons: "SQL, Databases & Cloud Fundamentals",
    icon: "☁️",
    accent: "bg-blue-50 text-blue-600",
  },
  {
    name: "AI & Machine Learning",
    lessons: "AI Concepts & Intelligent Systems",
    icon: "🤖",
    accent: "bg-fuchsia-50 text-fuchsia-600",
  },
  {
    name: "Mobile App Development",
    lessons: "Android, Flutter & Cross-platform Apps",
    icon: "📱",
    accent: "bg-orange-50 text-orange-600",
  },
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

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-700 sm:text-sm">
        {eyebrow}
      </span>

      <h2 className="mt-5 break-words text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
        {title}
      </h2>

      <p className="mt-5 break-words text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
        {description}
      </p>
    </div>
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
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 shadow-sm shadow-slate-950/[0.03] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav
          className="hidden items-center gap-1 rounded-2xl bg-slate-50 p-1 md:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition duration-200 ${
                link.label === "Home"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-indigo-700 hover:shadow-sm"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <Link
            to="/login"
            className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
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
  const learningSteps = [
    {
      title: "Discover new topics",
      color: "bg-indigo-500",
      width: "w-full",
    },
    {
      title: "Practice your skills",
      color: "bg-violet-500",
      width: "w-3/4",
    },
    {
      title: "Review your progress",
      color: "bg-emerald-500",
      width: "w-1/2",
    },
  ];

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-gradient-to-br from-white via-indigo-50/60 to-violet-50/70"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-violet-200/35 blur-3xl" />
        <div className="absolute right-[35%] top-1/3 h-64 w-64 rounded-full bg-sky-100/40 blur-3xl" />
      </div>

      <div className="mx-auto grid min-w-0 max-w-[1280px] items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-28">
        <div className="min-w-0 max-w-2xl">
          <div className="mb-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-xs font-bold leading-5 text-indigo-700 shadow-sm sm:mb-7 sm:text-sm">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
            Your journey to better learning starts here
          </div>

          <h1 className="break-words text-4xl font-black leading-[1.12] tracking-[-0.045em] text-slate-950 sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            Learn smarter.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-500 bg-clip-text text-transparent">
              Achieve more.
            </span>
          </h1>

          <p className="mt-6 max-w-xl break-words text-base leading-8 text-slate-600 sm:text-lg">
            Discover a better way to learn, practice your skills, and prepare
            for your next big opportunity — all in one learning platform.
          </p>

          <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/courses"
              className="inline-flex min-h-13 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-center font-bold text-white shadow-xl shadow-indigo-600/25 transition duration-200 hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-indigo-600/35 sm:w-auto sm:px-7"
            >
              Explore Learning <span aria-hidden="true">→</span>
            </Link>

            <a
              href="#features"
              className="inline-flex min-h-13 w-full min-w-0 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-6 py-3.5 text-center font-bold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:text-indigo-700 sm:w-auto"
            >
              Discover Features
            </a>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-indigo-100 pt-6 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <span className="font-bold text-emerald-600">✓</span>
              Learn at your pace
            </span>

            <span className="flex items-center gap-2">
              <span className="font-bold text-emerald-600">✓</span>
              Practice with purpose
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-[540px] lg:ml-auto">
          <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-indigo-200/70 via-violet-200/60 to-sky-100/70 opacity-80 blur-2xl sm:-inset-5" />

          <div className="relative min-w-0 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 p-3 shadow-2xl shadow-indigo-950/10 backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-100 pb-4 sm:pb-5">
              <div className="min-w-0">
                <p className="break-words text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                  Your workspace
                </p>
                <h2 className="mt-1 break-words text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  Learning overview
                </h2>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl">
                ✨
              </div>
            </div>

            <div className="mt-4 grid min-w-0 grid-cols-2 gap-3 sm:mt-5 sm:gap-4">
              <div className="min-w-0 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-3 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-700 sm:text-sm">
                    Learning
                  </span>
                  <span className="text-lg">📘</span>
                </div>
                <p className="mt-3 break-words text-xl font-black text-slate-900 sm:text-3xl">
                  Explore
                </p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  New knowledge
                </p>
              </div>

              <div className="min-w-0 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-3 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-violet-700 sm:text-sm">
                    Practice
                  </span>
                  <span className="text-lg">🎯</span>
                </div>
                <p className="mt-3 break-words text-xl font-black text-slate-900 sm:text-3xl">
                  Improve
                </p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Build confidence
                </p>
              </div>
            </div>

            <div className="mt-4 min-w-0 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900">
                    Your learning path
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                    Small steps, meaningful progress
                  </p>
                </div>

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  📈
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {learningSteps.map((item) => (
                  <div key={item.title}>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600 sm:text-sm">
                      <span className="font-bold text-emerald-600">✓</span>
                      <span>{item.title}</span>
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

            <div className="mt-4 flex min-w-0 items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-950 p-4 text-white sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                🚀
              </div>

              <div className="min-w-0">
                <p className="break-words text-sm font-bold sm:text-base">
                  Ready for your next step?
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-300 sm:text-sm">
                  Keep learning. Keep moving forward.
                </p>
              </div>

              <span className="ml-auto shrink-0 text-xl text-indigo-300">
                ↗
              </span>
            </div>
          </div>

          <div className="absolute -left-4 top-12 hidden items-center gap-2 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl shadow-indigo-950/10 sm:flex">
            <span className="text-xl">🎓</span>
            <span className="text-sm font-bold text-slate-800">
              Learn & grow
            </span>
          </div>

          <div className="absolute -bottom-5 -right-3 hidden items-center gap-2 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl shadow-indigo-950/10 sm:flex">
            <span className="text-xl">⭐</span>
            <span className="text-sm font-bold text-slate-800">
              Keep improving
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="bg-white py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Nexora"
          title={
            <>
              Everything you need to{" "}
              <span className="text-indigo-600">move forward.</span>
            </>
          }
          description="Build good learning habits with tools that help you study, practice, and keep improving."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group relative min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-950/[0.07] sm:p-8"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-50 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

              <div className="relative flex items-center justify-between gap-3">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl transition duration-300 group-hover:scale-110 ${feature.accent}`}
                >
                  {feature.icon}
                </span>

                <span className="text-sm font-black tracking-widest text-slate-300">
                  {feature.number}
                </span>
              </div>

              <h3 className="relative mt-7 break-words text-xl font-extrabold text-slate-900 sm:text-2xl">
                {feature.title}
              </h3>

              <p className="relative mt-3 break-words text-sm leading-7 text-slate-600 sm:text-base">
                {feature.description}
              </p>

              <div className="relative mt-6 flex items-center gap-2 text-sm font-bold text-indigo-600 transition group-hover:gap-3">
                Learn more <span aria-hidden="true">→</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      const token = localStorage.getItem("nexoraToken");
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      try {
        const courseResponse = await axios.get(`${API_BASE_URL}/courses`, {
          headers,
        });

        if (!isMounted) return;

        const publishedCourses = Array.isArray(courseResponse.data)
          ? courseResponse.data.filter((course) => course.published)
          : [];

        setCourses(publishedCourses);

        if (token) {
          try {
            const enrollmentResponse = await axios.get(
              `${API_BASE_URL}/enrollments/my`,
              { headers }
            );

            if (isMounted) {
              const ids = Array.isArray(enrollmentResponse.data)
                ? enrollmentResponse.data.map((item) => item.courseId)
                : [];

              setEnrolledCourseIds(ids);
            }
          } catch {
            // Course browsing remains available if enrollment lookup fails.
          }
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.status === 401
              ? "Please sign in to view available courses."
              : "Unable to load courses right now. Please try again later."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleEnroll(courseId) {
    const token = localStorage.getItem("nexoraToken");

    if (!token) {
      navigate("/login");
      return;
    }

    setError("");
    setSuccess("");
    setEnrollingCourseId(courseId);

    try {
      await axios.post(
        `${API_BASE_URL}/enrollments/${courseId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEnrolledCourseIds((previous) =>
        previous.includes(courseId) ? previous : [...previous, courseId]
      );

      setSuccess("You have successfully enrolled in this course.");
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else if (requestError.response?.status === 403) {
        setError("Only student accounts can enroll in courses.");
      } else if (requestError.response?.status === 409) {
        setEnrolledCourseIds((previous) =>
          previous.includes(courseId) ? previous : [...previous, courseId]
        );
        setSuccess("You are already enrolled in this course.");
      } else {
        setError(
          requestError.response?.data?.message ||
            "Unable to enroll in this course. Please try again."
        );
      }
    } finally {
      setEnrollingCourseId(null);
    }
  }

  return (
    <div className="mt-16 sm:mt-20">
      <div className="flex min-w-0 flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600 sm:text-sm">
            Start learning
          </span>

          <h3 className="mt-3 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Explore available courses.
          </h3>

          <p className="mt-3 max-w-2xl break-words leading-7 text-slate-600">
            Discover published courses and enroll to start your learning
            journey.
          </p>
        </div>

        <Link
          to="/courses"
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-700 transition hover:-translate-y-0.5 hover:bg-indigo-100 sm:self-auto"
        >
          Browse all courses <span aria-hidden="true">→</span>
        </Link>
      </div>

      {error && (
        <div
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
          role="status"
        >
          {success}
        </div>
      )}

      {loading && (
        <div
          className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500"
          role="status"
        >
          <span className="inline-flex items-center gap-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            Loading available courses...
          </span>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
            📚
          </div>
          <h4 className="mt-4 font-bold text-slate-900">
            No courses available yet
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            No published courses are available right now. Please check again
            later.
          </p>
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="mt-8 grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const isEnrolling = enrollingCourseId === course.id;

            return (
              <article
                key={course.id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/[0.07]"
              >
                <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-sky-50">
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-200/40 blur-2xl" />
                  <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-violet-200/40 blur-2xl" />

                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-3xl shadow-lg shadow-indigo-950/5 transition duration-300 group-hover:scale-110">
                    📘
                  </div>

                  <span className="absolute right-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                    Published
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <span className="inline-flex w-fit max-w-full break-words rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    {course.category || "General"}
                  </span>

                  <h4 className="mt-4 break-words text-lg font-extrabold leading-7 text-slate-900">
                    {course.title}
                  </h4>

                  <p className="mt-2 flex-1 break-words text-sm leading-6 text-slate-600">
                    {course.description || "Course description coming soon."}
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="break-words text-sm text-slate-500">
                      Instructor:{" "}
                      <span className="font-semibold text-slate-700">
                        {course.instructorName || "Nexora Team"}
                      </span>
                    </p>

                    {isEnrolled ? (
                      <Link
                        to="/dashboard"
                        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                      >
                        View My Courses <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={isEnrolling}
                        onClick={() => handleEnroll(course.id)}
                        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isEnrolling ? "Enrolling..." : "Enroll Now"}
                        {!isEnrolling && <span aria-hidden="true">→</span>}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Learning() {
  return (
    <section
      id="learning"
      className="bg-slate-50 py-16 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="min-w-0 max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600 sm:text-sm">
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
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-indigo-200 bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50 md:self-auto"
          >
            Browse all courses <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {learningTopics.map((topic) => (
            <Link
              key={topic.name}
              to={`/courses?category=${encodeURIComponent(topic.name)}`}
              className="group flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/[0.05] sm:p-6"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl transition duration-300 group-hover:scale-110 ${topic.accent}`}
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

              <span className="shrink-0 text-lg text-indigo-500 transition duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </div>

        <FeaturedCourses />
      </div>
    </section>
  );
}

function About() {
  return (
    <section
      id="about"
      className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950 py-16 sm:py-24 lg:py-28"
    >
      <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="mx-auto grid min-w-0 max-w-[1280px] items-center gap-8 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] lg:px-8">
        <div className="min-w-0 max-w-3xl">
          <span className="inline-flex rounded-full border border-indigo-300/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-200 sm:text-sm">
            Learn with purpose
          </span>

          <h2 className="mt-5 break-words text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Your potential deserves a better platform.
          </h2>

          <p className="mt-5 break-words text-base leading-8 text-slate-300 sm:text-lg">
            Nexora brings learning and online assessment together in one
            organized experience — so you can focus on becoming better every
            day.
          </p>
        </div>

        <Link
          to="/courses"
          className="inline-flex min-h-13 max-w-full items-center justify-center gap-2 justify-self-start rounded-xl bg-white px-7 py-3.5 text-center font-bold text-indigo-700 shadow-xl shadow-black/10 transition duration-200 hover:-translate-y-1 hover:bg-indigo-50 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 md:justify-self-end"
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
    <footer className="relative isolate overflow-hidden bg-slate-950 text-slate-300">
      <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-14 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12">
          <div className="min-w-0">
            <Brand light />

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              A smarter way to learn, practice your skills, and track your
              progress — all in one place.
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

function Home() {
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

export default Home;
