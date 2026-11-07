
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  Layers3,
  ShieldCheck,
  Sparkles,
  UserRound,
  Code2,
  Database,
  Brain,
  Globe,
  Briefcase,
  Palette,
  Calculator,
} from "lucide-react";
import { API_BASE_URL, getApiError } from "../utils/api";

// Isolated Axios client for course and enrollment requests.
const courseApi = axios.create();

function getCourseIcon(course) {
  const value = `${course.category || ""} ${course.title || ""}`.toLowerCase();

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
    value.includes("business") ||
    value.includes("management") ||
    value.includes("finance") ||
    value.includes("marketing")
  ) {
    return Briefcase;
  }

  if (
    value.includes("design") ||
    value.includes("creative") ||
    value.includes("art")
  ) {
    return Palette;
  }

  if (
    value.includes("math") ||
    value.includes("calculation") ||
    value.includes("statistics")
  ) {
    return Calculator;
  }

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

  return BookOpen;
}

function CourseCoverImage({ course }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = course.imageUrl?.trim();

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 shadow-2xl shadow-black/20">
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={`${course.title || "Course"} course cover`}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <>
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />

          <div className="relative flex h-full flex-col items-center justify-center gap-4 px-5 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-sm sm:h-24 sm:w-24">
              {(() => {
                const Icon = getCourseIcon(course);

                return (
                  <Icon
                    className="h-10 w-10 sm:h-12 sm:w-12"
                    strokeWidth={1.4}
                    aria-hidden="true"
                  />
                );
              })()}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-200">
                Nexora Learning
              </p>
              <p className="mt-2 line-clamp-2 text-lg font-extrabold text-white sm:text-2xl">
                {course.category || "Explore & Learn"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const token = localStorage.getItem("nexoraToken");

        const [courseResponse, enrollmentResponse] = await Promise.all([
          courseApi.get(`${API_BASE_URL}/courses/${id}`, {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }),
          token
            ? courseApi.get(`${API_BASE_URL}/enrollments/my`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ data: [] }),
        ]);

        if (!active) return;

        const loadedCourse = courseResponse.data;

        if (
          !loadedCourse ||
          String(loadedCourse.id) !== String(id) ||
          loadedCourse.published !== true
        ) {
          setError("This course is not available.");
          return;
        }

        setCourse(loadedCourse);

        const enrollments = Array.isArray(enrollmentResponse.data)
          ? enrollmentResponse.data
          : [];

        setEnrolled(
          enrollments.some(
            (item) => String(item.courseId) === String(loadedCourse.id)
          )
        );
      } catch (err) {
        if (active) setError(getApiError(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleEnroll() {
    // Read the latest session values at click time.
    const token = localStorage.getItem("nexoraToken")?.trim();

    const storedUser = (() => {
      try {
        return JSON.parse(localStorage.getItem("nexoraUser") || "null");
      } catch {
        return null;
      }
    })();

    // Check for a missing or placeholder token.
    if (!token || ["null", "undefined"].includes(token.toLowerCase())) {
      navigate("/login", {
        state: { from: `/courses/${id}` },
      });
      return;
    }

    // Only student accounts can enroll.
    if (storedUser?.role && storedUser.role.toUpperCase() !== "STUDENT") {
      setError("Only student accounts can enroll in a course.");
      return;
    }

    if (!course?.id) {
      setError("Course details are still loading. Please try again.");
      return;
    }

    setEnrolling(true);
    setError("");
    setMessage("");

    try {
      await courseApi.post(
        `${API_BASE_URL}/enrollments/${course.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEnrolled(true);
      setMessage(
        "Enrollment successful! Your course is now in My Courses."
      );
    } catch (err) {
      const status = err.response?.status;

      if (status === 409) {
        setEnrolled(true);
        setMessage("You are already enrolled in this course.");
      } else if (status === 401) {
        setError(
          "Your session is invalid or expired. Please sign in again, then retry enrollment."
        );
      } else if (status === 403) {
        setError(
          "Your account does not have permission to enroll. Please sign in with a student account."
        );
      } else {
        setError(getApiError(err));
      }
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <main
        className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 sm:py-16"
        aria-busy="true"
      >
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-5 w-32 rounded-lg bg-slate-200" />

          <div className="mt-10 max-w-3xl space-y-4">
            <div className="h-8 w-32 rounded-full bg-slate-200" />
            <div className="h-10 w-full max-w-xl rounded-xl bg-slate-200" />
            <div className="h-5 w-48 rounded-lg bg-slate-200" />
            <div className="h-4 w-full max-w-2xl rounded bg-slate-200" />
            <div className="h-4 w-4/5 max-w-xl rounded bg-slate-200" />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <div className="h-64 rounded-2xl border border-slate-200 bg-white" />
              <div className="h-48 rounded-2xl border border-slate-200 bg-white" />
            </div>
            <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
          </div>

          <p
            className="mt-6 text-center text-sm font-medium text-slate-500"
            role="status"
          >
            Loading course details...
          </p>
        </div>
      </main>
    );
  }

  if (error && !course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <BookOpen className="h-8 w-8" aria-hidden="true" />
          </div>

          <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-900">
            Course unavailable
          </h1>

          <p
            role="alert"
            className="mt-3 text-sm leading-7 text-red-700"
          >
            {error}
          </p>

          <Link
            to="/courses"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Course Hero */}
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div
          className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All courses
          </Link>

          <div className="mt-9 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/15 px-4 py-2 text-xs font-bold tracking-wide text-indigo-200 sm:text-sm">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              {course.category || "General"}
            </div>

            <h1 className="mt-6 break-words text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>

            <p className="mt-5 max-w-2xl whitespace-pre-line break-words text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              {course.description ||
                "Explore this learning opportunity and start building your knowledge with Nexora."}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-300">
                <UserRound
                  className="h-4 w-4 text-indigo-300"
                  aria-hidden="true"
                />
                <span>
                  Instructor:{" "}
                  <span className="font-bold text-white">
                    {course.instructorName || "Nexora"}
                  </span>
                </span>
              </div>

              <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-300">
                <ShieldCheck
                  className="h-4 w-4 text-emerald-300"
                  aria-hidden="true"
                />
                Quality learning experience
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Cover Image */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
        <CourseCoverImage course={course} />
      </section>

      {/* Course Content */}
      <section className="mx-auto grid max-w-6xl gap-7 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-9">
        <div className="min-w-0 space-y-7">
          {/* About Course */}
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  About this course
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Get to know what this course is about.
                </p>
              </div>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-6">
              <p className="whitespace-pre-line break-words text-sm leading-8 text-slate-600 sm:text-base">
                {course.description ||
                  "Course description has not been provided yet."}
              </p>
            </div>
          </article>

          {/* Learning Experience */}
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Layers3 className="h-6 w-6" aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  Your learning journey
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Enroll in this course to access your learning experience
                  through the Nexora student dashboard.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <BookOpenCheck
                  className="h-5 w-5 shrink-0 text-indigo-600"
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Organized learning
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <GraduationCap
                  className="h-5 w-5 shrink-0 text-indigo-600"
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Student dashboard access
                </span>
              </div>
            </div>
          </article>
        </div>

        {/* Enrollment Card */}
        <aside className="h-fit lg:sticky lg:top-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white sm:p-7">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border-[24px] border-white/10"
                aria-hidden="true"
              />

              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </div>

                <h2 className="mt-5 text-xl font-black tracking-tight">
                  Start learning today
                </h2>

                <p className="mt-2 text-sm leading-6 text-indigo-100">
                  Take the next step in your learning journey with Nexora.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Course category
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900">
                    {course.category || "General"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Instructor
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900">
                    {course.instructorName || "Nexora"}
                  </p>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </p>
              )}

              {message && (
                <p
                  role="status"
                  className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm leading-6 text-emerald-700"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{message}</span>
                </p>
              )}

              {enrolled ? (
                <Link
                  to="/dashboard"
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                >
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  Go to My Courses
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  aria-busy={enrolling}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {enrolling ? (
                    <>
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        aria-hidden="true"
                      />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <GraduationCap
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                      Enroll Now
                    </>
                  )}
                </button>
              )}

              <div className="mt-5 flex items-start justify-center gap-2 text-center">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <p className="text-xs leading-5 text-slate-500">
                  Sign in is required to enroll in this course.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/courses"
            className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-slate-500 transition hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Explore other courses
          </Link>
        </aside>
      </section>
    </main>
  );
}
