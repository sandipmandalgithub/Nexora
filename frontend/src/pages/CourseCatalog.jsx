
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, getApiError } from "../utils/api";

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
        if (active) setError(getApiError(err));
      } finally {
        if (active) setLoading(false);
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

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="text-sm font-semibold text-indigo-300 hover:text-white"
          >
            ← Back to home
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">
            Explore & learn
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Discover your next course.
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Explore available learning opportunities, build new skills,
            and take the next step in your learning journey.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-4 md:flex-row">
          <label className="min-w-0 flex-1">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Search courses
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by course, topic or instructor..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </label>

          <label className="md:w-64">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Category
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              Loading courses...
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700"
            >
              {error}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="ml-2 font-bold underline"
              >
                Try again
              </button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <div className="text-4xl">📚</div>
              <h2 className="mt-4 text-xl font-extrabold text-slate-900">
                No courses found
              </h2>
              <p className="mt-2 text-slate-600">
                Try another search term or category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <p className="mb-5 text-sm text-slate-500">
                {filteredCourses.length} course
                {filteredCourses.length === 1 ? "" : "s"} available
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                  <article
                    key={course.id}
                    className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        {course.category || "General"}
                      </span>
                      <span className="text-2xl" aria-hidden="true">
                        📘
                      </span>
                    </div>

                    <h2 className="mt-5 break-words text-xl font-extrabold text-slate-900">
                      {course.title}
                    </h2>

                    <p className="mt-3 line-clamp-4 flex-1 whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                      {course.description || "Explore this learning course."}
                    </p>

                    <p className="mt-5 text-sm text-slate-500">
                      Instructor:{" "}
                      <span className="font-semibold text-slate-700">
                        {course.instructorName || "Nexora"}
                      </span>
                    </p>

                    <Link
                      to={`/courses/${course.id}`}
                      className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-center font-bold text-white transition hover:bg-indigo-700"
                    >
                      View course details <span aria-hidden="true">→</span>
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
