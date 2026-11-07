
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

export default function AdminEnrollmentManagement() {
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [success, setSuccess] = useState("");

  const getAuthConfig = () => {
    const token = localStorage.getItem("nexoraToken");

    if (!token) {
      throw new Error("Admin session expired. Please sign in again.");
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/enrollments`,
        getAuthConfig()
      );

      setEnrollments(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          "Unable to load student enrollments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial enrollment loading
  useEffect(() => {
    let active = true;

    Promise.resolve()
      .then(() =>
        axios.get(
          `${API_BASE_URL}/enrollments`,
          getAuthConfig()
        )
      )
      .then((response) => {
        if (active) {
          setEnrollments(
            Array.isArray(response.data) ? response.data : []
          );
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.detail ||
              err.message ||
              "Unable to load student enrollments."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredEnrollments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return enrollments;
    }

    return enrollments.filter((enrollment) =>
      [
        enrollment.studentName,
        enrollment.studentEmail,
        enrollment.courseTitle,
        enrollment.category,
        String(enrollment.studentId),
        String(enrollment.courseId),
        String(enrollment.enrollmentId),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [enrollments, search]);

  async function handleDelete(enrollment) {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${enrollment.studentName}'s enrollment in "${enrollment.courseTitle}"?\n\nThe course itself will not be deleted.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(enrollment.enrollmentId);
    setError("");
    setSuccess("");

    try {
      await axios.delete(
        `${API_BASE_URL}/enrollments/admin/${enrollment.enrollmentId}`,
        getAuthConfig()
      );

      setEnrollments((current) =>
        current.filter(
          (item) => item.enrollmentId !== enrollment.enrollmentId
        )
      );

      setSuccess(
        `Enrollment for "${enrollment.courseTitle}" was removed successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          "Unable to delete this enrollment."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(value) {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString();
  }

  return (
    <section
      className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
      aria-label="Enrollment management"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                Enrollment Management
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                View and manage student course enrollments.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchEnrollments}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            aria-hidden="true"
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 7v5h-5M4 17v-5h5" />
            <path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Enrollments
          </p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">
            {enrollments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Search Results
          </p>
          <p className="mt-2 text-2xl font-extrabold text-indigo-900">
            {filteredEnrollments.length}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="enrollment-search"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Search enrollments
        </label>

        <div className="relative">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          <input
            id="enrollment-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student, email, course or ID..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            Loading student enrollments...
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
            <p className="font-semibold text-slate-700">
              {search
                ? "No matching enrollments found."
                : "No student enrollments available."}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try another student name, email or course."
                : "Student enrollments will appear here."}
            </p>
          </div>
        ) : (
          filteredEnrollments.map((enrollment) => (
            <article
              key={enrollment.enrollmentId}
              className="rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-200"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words font-bold text-slate-900">
                      {enrollment.studentName || "Unknown Student"}
                    </h3>

                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                      Enrollment #{enrollment.enrollmentId}
                    </span>
                  </div>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {enrollment.studentEmail || "No email available"}
                  </p>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Enrolled Course
                    </p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800">
                      {enrollment.courseTitle || "Unknown Course"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Student ID: {enrollment.studentId}</span>
                      <span>Course ID: {enrollment.courseId}</span>
                      {enrollment.category && (
                        <span>{enrollment.category}</span>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Enrolled at: {formatDate(enrollment.enrolledAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(enrollment)}
                  disabled={deletingId !== null}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === enrollment.enrollmentId ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                      </svg>
                      Remove Enrollment
                    </>
                  )}
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Removing an enrollment does not delete the student account or the
        course. The student can enroll again if the course is available.
      </p>
    </section>
  );
}
