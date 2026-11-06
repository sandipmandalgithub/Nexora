import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  BookOpen,
  Brain,
  Briefcase,
  Calculator,
  Code2,
  Database,
  GraduationCap,
  Globe,
  Layers,
  Palette,
  ShieldCheck,
} from "lucide-react";

import { API_BASE_URL, getApiError } from "../utils/api";

function getCourseIcon(course) {
  const value = `${course.category || ""} ${course.title || ""}`.toLowerCase();

  if (
    value.includes("java") ||
    value.includes("programming") ||
    value.includes("coding") ||
    value.includes("development") ||
    value.includes("software") ||
    value.includes("react") ||
    value.includes("web")
  ) {
    return Code2;
  }

  if (
    value.includes("database") ||
    value.includes("sql") ||
    value.includes("mysql") ||
    value.includes("oracle") ||
    value.includes("mongodb")
  ) {
    return Database;
  }

  if (
    value.includes("business") ||
    value.includes("management") ||
    value.includes("finance") ||
    value.includes("marketing")
  ) {
    return Briefcase;
  }

  if (
    value.includes("math") ||
    value.includes("calculation") ||
    value.includes("statistics")
  ) {
    return Calculator;
  }

  if (
    value.includes("art") ||
    value.includes("design") ||
    value.includes("creative")
  ) {
    return Palette;
  }

  if (
    value.includes("security") ||
    value.includes("cyber") ||
    value.includes("network")
  ) {
    return ShieldCheck;
  }

  if (
    value.includes("ai") ||
    value.includes("artificial intelligence") ||
    value.includes("machine learning") ||
    value.includes("data science")
  ) {
    return Brain;
  }

  if (
    value.includes("cloud") ||
    value.includes("aws") ||
    value.includes("devops")
  ) {
    return Globe;
  }

  if (
    value.includes("academic") ||
    value.includes("education") ||
    value.includes("learning")
  ) {
    return GraduationCap;
  }

  if (
    value.includes("course") ||
    value.includes("training") ||
    value.includes("tutorial")
  ) {
    return Layers;
  }

  return BookOpen;
}

function CourseCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />

        <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />
      </div>

      <div className="mt-6 h-6 w-3/4 animate-pulse rounded-lg bg-slate-200" />

      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
      </div>

      <div className="mt-6 h-4 w-2/3 animate-pulse rounded bg-slate-100" />

      <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("nexoraToken");

        const response = await axios.get(`${API_BASE_URL}/courses`, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        });

        if (active) {
          setCourses(
            Array.isArray(response.data)
              ? response.data.filter(
                  (course) => course.published === true
                )
              : []
          );
        }
      } catch (err) {
        if (active) {
          setError(getApiError(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        courses
          .map((course) => course.category?.trim())
          .filter(Boolean)
      ),
    ],
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesCategory =
        category === "All" || course.category === category;

      const matchesSearch = [
        course.title,
        course.description,
        course.category,
        course.instructorName,
      ].some((value) => value?.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [courses, search, category]);

  const hasActiveFilters = search.trim() !== "" || category !== "All";

  function clearFilters() {
    setSearch("");
    setCategory("All");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-indigo-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
          >
            <span aria-hidden="true">←</span>
            Back to home
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">
            Explore & learn
          </p>

          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            Discover your next course.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Explore available learning opportunities, build new skills,
            and take the next step in your learning journey.
          </p>

          {!loading && !error && (
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 backdrop-blur-sm">
              <BookOpen
                size={17}
                className="text-indigo-300"
                aria-hidden="true"
              />
              {courses.length} published{" "}
              {courses.length === 1 ? "course" : "courses"}
            </div>
          )}
        </div>
      </section>

      {/* Course Catalog */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Search and Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <label className="min-w-0 flex-1">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Search courses
              </span>

              <input
                id="course-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by course, topic or instructor..."
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <label className="min-w-0 md:w-64">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Category
              </span>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!loading && !error && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p
                className="text-sm text-slate-500"
                aria-live="polite"
              >
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {filteredCourses.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {courses.length}
                </span>{" "}
                {courses.length === 1 ? "course" : "courses"}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-md text-sm font-bold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Course Results */}
        <div className="mt-8">
          {loading ? (
            <div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              role="status"
              aria-label="Loading courses"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700 sm:p-6"
            >
              <p className="font-bold">Unable to load courses</p>

              <p className="mt-1">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 font-bold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                Try again
              </button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BookOpen size={30} aria-hidden="true" />
              </div>

              <h2 className="mt-5 text-xl font-extrabold text-slate-900">
                No courses found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {courses.length === 0
                  ? "There are no published courses available right now. Please check back later."
                  : "Try another search term or category to find the course you are looking for."}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => {
                const CourseIcon = getCourseIcon(course);

                return (
                  <article
                    key={course.id}
                    className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl sm:p-6"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="max-w-[75%] truncate rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                        {course.category || "General"}
                      </span>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600 transition duration-300 group-hover:scale-105 group-hover:from-indigo-100 group-hover:to-violet-200">
                        <CourseIcon size={24} strokeWidth={1.8} aria-hidden="true" />
                      </div>
                    </div>

                    {/* Course Information */}
                    <h2 className="mt-5 break-words text-xl font-extrabold leading-7 text-slate-900 transition-colors group-hover:text-indigo-700">
                      {course.title}
                    </h2>

                    <p className="mt-3 line-clamp-4 flex-1 whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                      {course.description || "Explore this learning course."}
                    </p>

                    {/* Instructor */}
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Instructor
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                        {course.instructorName || "Nexora"}
                      </p>
                    </div>

                    {/* Course Action */}
                    <Link
                      to={`/courses/${course.id}`}
                      className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2"
                    >
                      View course details
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}