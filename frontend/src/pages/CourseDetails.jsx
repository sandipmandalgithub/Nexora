
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, getApiError } from "../utils/api";

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
          axios.get(`${API_BASE_URL}/courses/${id}`, {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }),
          token
            ? axios.get(`${API_BASE_URL}/enrollments/my`, {
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
    const token = localStorage.getItem("nexoraToken");

    if (!token) {
      navigate("/login", {
        state: { from: `/courses/${id}` },
      });
      return;
    }

    setEnrolling(true);
    setError("");
    setMessage("");

    try {
      await axios.post(
        `${API_BASE_URL}/enrollments/${course.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEnrolled(true);
      setMessage("Enrollment successful! Your course is now in My Courses.");
    } catch (err) {
      if (err.response?.status === 409) {
        setEnrolled(true);
        setMessage("You are already enrolled in this course.");
      } else {
        setError(getApiError(err));
      }
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Loading course details...
        </div>
      </main>
    );
  }

  if (error && !course) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8">
          <h1 className="text-2xl font-black text-slate-900">
            Course unavailable
          </h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-red-700">
            {error}
          </p>
          <Link
            to="/courses"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
          >
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/courses"
            className="text-sm font-semibold text-indigo-300 hover:text-white"
          >
            ← All courses
          </Link>

          <div className="mt-8">
            <span className="inline-flex rounded-full bg-indigo-500/15 px-3 py-1 text-sm font-bold text-indigo-200">
              {course.category || "General"}
            </span>
            <h1 className="mt-4 break-words text-3xl font-black tracking-tight sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-5 text-sm text-slate-300 sm:text-base">
              Instructor: {course.instructorName || "Nexora"}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <h2 className="text-xl font-extrabold text-slate-900">
            About this course
          </h2>
          <p className="mt-4 whitespace-pre-line break-words text-sm leading-8 text-slate-600 sm:text-base">
            {course.description || "Course description has not been provided yet."}
          </p>
        </article>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="text-3xl" aria-hidden="true">
            📚
          </div>
          <h2 className="mt-3 text-xl font-extrabold text-slate-900">
            Start learning
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enroll in this course to add it to your learning dashboard.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-700"
            >
              {message}
            </p>
          )}

          {enrolled ? (
            <Link
              to="/dashboard"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-center font-bold text-white hover:bg-emerald-700"
            >
              Go to My Courses
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrolling}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enrolling ? "Enrolling..." : "Enroll Now"}
            </button>
          )}

          <p className="mt-4 text-center text-xs leading-5 text-slate-500">
            Sign in is required to enroll.
          </p>
        </aside>
      </section>
    </main>
  );
}
