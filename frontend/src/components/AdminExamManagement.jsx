import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

const EMPTY_FORM = {
  title: "",
  description: "",
  courseId: "",
  durationMinutes: 30,
  published: false,
};

function getAuthConfig() {
  const token = localStorage.getItem("nexoraToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Your session may have expired. Please sign in again.";
  }

  if (error.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (!error.response) {
    return "Cannot connect to the server. Please make sure the backend is running.";
  }

  const data = error.response?.data;

  if (typeof data === "string") {
    return data;
  }

  return (
    data?.detail ||
    data?.message ||
    data?.title ||
    "Something went wrong. Please try again."
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "Not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminExamManagement() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [courseResponse, examResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/courses`, getAuthConfig()),
        axios.get(`${API_BASE_URL}/exams`, getAuthConfig()),
      ]);

      setCourses(
        Array.isArray(courseResponse.data) ? courseResponse.data : []
      );

      setExams(
        Array.isArray(examResponse.data) ? examResponse.data : []
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    const controller = new AbortController();

    const loadInitialData = async () => {
      setError("");

      try {
        const config = {
          ...getAuthConfig(),
          signal: controller.signal,
        };

        const [courseResponse, examResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/courses`, config),
          axios.get(`${API_BASE_URL}/exams`, config),
        ]);

        if (controller.signal.aborted) return;

        setCourses(
          Array.isArray(courseResponse.data) ? courseResponse.data : []
        );

        setExams(
          Array.isArray(examResponse.data) ? examResponse.data : []
        );
      } catch (requestError) {
        if (
          controller.signal.aborted ||
          axios.isCancel(requestError)
        ) {
          return;
        }

        setError(getErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredExams = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          exam.title,
          exam.description,
          exam.courseTitle,
          String(exam.id),
          String(exam.courseId),
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch)
          );

      const matchesCourse =
        courseFilter === "all" ||
        String(exam.courseId) === courseFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && exam.published) ||
        (statusFilter === "draft" && !exam.published);

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [exams, searchTerm, courseFilter, statusFilter]);

  const publishedCount = exams.filter(
    (exam) => exam.published
  ).length;

  const draftCount = exams.length - publishedCount;

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleEdit(exam) {
    setForm({
      title: exam.title || "",
      description: exam.description || "",
      courseId: String(exam.courseId ?? ""),
      durationMinutes: exam.durationMinutes ?? 30,
      published: Boolean(exam.published),
    });

    setEditingId(exam.id);
    setError("");
    setSuccess("");

    document
      .getElementById("admin-exam-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      courseId: Number(form.courseId),
      durationMinutes: Number(form.durationMinutes),
      published: Boolean(form.published),
    };

    if (!payload.title || !payload.description || !payload.courseId) {
      setError("Please complete all required exam fields.");
      setSaving(false);
      return;
    }

    if (
      !Number.isInteger(payload.durationMinutes) ||
      payload.durationMinutes < 1 ||
      payload.durationMinutes > 600
    ) {
      setError("Exam duration must be between 1 and 600 minutes.");
      setSaving(false);
      return;
    }

    try {
      if (editingId !== null) {
        await axios.put(
          `${API_BASE_URL}/exams/${editingId}`,
          payload,
          getAuthConfig()
        );

        setSuccess("Exam updated successfully.");
      } else {
        await axios.post(
          `${API_BASE_URL}/exams`,
          payload,
          getAuthConfig()
        );

        setSuccess(
          "Exam created successfully. You can now add questions below."
        );
      }

      resetForm();
      await fetchData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublished(exam) {
    const nextStatus = !exam.published;
    const action = nextStatus ? "publish" : "unpublish";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${exam.title}"?`
    );

    if (!confirmed) return;

    setUpdatingStatusId(exam.id);
    setError("");
    setSuccess("");

    try {
      await axios.put(
        `${API_BASE_URL}/exams/${exam.id}`,
        {
          title: exam.title,
          description: exam.description,
          courseId: exam.courseId,
          durationMinutes: exam.durationMinutes,
          published: nextStatus,
        },
        getAuthConfig()
      );

      setSuccess(
        `Exam ${nextStatus ? "published" : "unpublished"} successfully.`
      );

      await fetchData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleDelete(exam) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${exam.title}"?\n\nThis may fail if questions or exam attempts are linked to this exam.`
    );

    if (!confirmed) return;

    setDeletingId(exam.id);
    setError("");
    setSuccess("");

    try {
      await axios.delete(
        `${API_BASE_URL}/exams/${exam.id}`,
        getAuthConfig()
      );

      if (editingId === exam.id) {
        resetForm();
      }

      setSuccess("Exam deleted successfully.");
      await fetchData();
    } catch (requestError) {
      setError(
        getErrorMessage(requestError) +
          " If this exam already has questions or attempts, the database may prevent deletion to protect existing records."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <section className="mt-5 min-w-0 space-y-5 sm:mt-7 sm:space-y-6">
      {/* Header and statistics */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Administration
              </div>

              <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Exam Management
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Create and manage multiple examinations for every course.
                Control exam duration and publication status from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <svg
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7v5h-5M4 17v-5h5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.5 9a7 7 0 0112-2L20 12M4 12l2.5 5a7 7 0 0012-2"
                />
              </svg>

              {loading ? "Refreshing..." : "Refresh exams"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total exams
                </p>
                <p className="mt-2 text-2xl font-extrabold tabular-nums text-slate-900">
                  {exams.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 4h8l4 4v12H4V4h4zM8 4v5h8V4M8 14h8M8 17h5"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Published
                </p>
                <p className="mt-2 text-2xl font-extrabold tabular-nums text-emerald-700">
                  {publishedCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12l4 4L19 6"
                  />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Drafts
                </p>
                <p className="mt-2 text-2xl font-extrabold tabular-nums text-amber-700">
                  {draftCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          <div className="flex min-w-0 items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                d="M12 8v4m0 4h.01"
              />
            </svg>
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 rounded-lg px-2 py-1 font-semibold text-red-700 transition hover:bg-red-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 break-words rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
        >
          <div className="flex min-w-0 items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12l2.5 2.5L16 9"
              />
            </svg>
            <span>{success}</span>
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="shrink-0 rounded-lg px-2 py-1 font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create / Edit exam form */}
      <div
        id="admin-exam-form"
        className="scroll-mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7"
      >
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14m-7-7h14"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                {editingId !== null ? "Edit exam" : "Create a new exam"}
              </h3>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {editingId !== null
                ? "Update the examination information below."
                : "Select a course and create an examination for its students."}
            </p>
          </div>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
            >
              Cancel edit
            </button>
          )}
        </div>

        {courses.length === 0 && !loading && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.3 3.8L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3l-7.5-13.2a2 2 0 00-3.4 0z"
              />
            </svg>

            <p>
              No active courses are available. Create or restore a course in
              Course Management before creating an exam.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <div className="sm:col-span-2">
              <label
                htmlFor="exam-title"
                className={labelClass}
              >
                Exam title *
              </label>

              <input
                id="exam-title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={150}
                placeholder="e.g. Java Fundamentals - Test 3"
                className={inputClass}
              />

              <p className="mt-1.5 text-right text-xs text-slate-400">
                {form.title.length}/150 characters
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="exam-course"
                className={labelClass}
              >
                Select course *
              </label>

              <select
                id="exam-course"
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Choose a course</option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} (ID: {course.id})
                    {!course.published ? " - Draft course" : ""}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Every exam is linked to one course. Students enrolled in that
                course can access its published exams.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="exam-description"
                className={labelClass}
              >
                Exam description *
              </label>

              <textarea
                id="exam-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                maxLength={2000}
                placeholder="Describe the exam, topics covered and instructions..."
                className={`${inputClass} min-h-28 resize-y leading-6`}
              />

              <p className="mt-1.5 text-right text-xs text-slate-400">
                {form.description.length}/2000 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="exam-duration"
                className={labelClass}
              >
                Duration (minutes) *
              </label>

              <input
                id="exam-duration"
                name="durationMinutes"
                type="number"
                min="1"
                max="600"
                step="1"
                value={form.durationMinutes}
                onChange={handleChange}
                required
                className={inputClass}
              />

              <p className="mt-1.5 text-xs text-slate-500">
                Minimum 1 minute; maximum 600 minutes.
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
              className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-indigo-600"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Publish this exam
              </span>

              <span className="mt-1 block text-sm leading-5 text-slate-500">
                Published exams become available to students enrolled in the
                selected course. Unpublished exams remain available for
                administration.
              </span>
            </span>
          </label>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={saving || courses.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    strokeOpacity="0.25"
                  />
                  <path
                    strokeLinecap="round"
                    d="M21 12a9 9 0 00-9-9"
                  />
                </svg>
              )}

              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save exam changes"
                  : "Create exam"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
              >
                Discard changes
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Exam list */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                All examinations
              </h3>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Search, filter, edit, publish or delete examinations.
            </p>
          </div>

          <span className="w-fit rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold tabular-nums text-indigo-700">
            {filteredExams.length} of {exams.length} exams
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-3">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path
                strokeLinecap="round"
                d="M16 16l4 4"
              />
            </svg>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search exam title, course or ID..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className={inputClass}
          >
            <option value="all">All courses</option>

            {courses.map((course) => (
              <option key={course.id} value={String(course.id)}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`${inputClass} sm:col-span-2`}
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Unpublished</option>
          </select>
        </div>

        {loading && (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              Loading examinations...
            </p>
          </div>
        )}

        {!loading && exams.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 4h8l4 4v12H4V4h4zM8 4v5h8V4"
                />
              </svg>
            </div>

            <h4 className="mt-4 font-bold text-slate-800">
              No examinations found
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Create your first exam using the form above.
            </p>
          </div>
        )}

        {!loading && exams.length > 0 && filteredExams.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="11" cy="11" r="7" />
                <path
                  strokeLinecap="round"
                  d="M16 16l4 4"
                />
              </svg>
            </div>

            <h4 className="mt-4 font-bold text-slate-800">
              No matching examinations
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Try another search term or change the filters.
            </p>
          </div>
        )}

        {!loading && filteredExams.length > 0 && (
          <div className="mt-5 space-y-4">
            {filteredExams.map((exam) => (
              <article
                key={exam.id}
                className="group rounded-xl border border-slate-200 bg-white p-4 transition duration-200 hover:border-indigo-200 hover:shadow-md sm:p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        <svg
                          className="h-3.5 w-3.5 shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 5h16v14H4zM8 9h8M8 13h5"
                          />
                        </svg>
                        <span className="truncate">
                          {exam.courseTitle || "Course"}
                        </span>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          exam.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            exam.published
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {exam.published ? "Published" : "Unpublished"}
                      </span>

                      <span className="break-all rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        Exam ID: {exam.id}
                      </span>
                    </div>

                    <h4 className="mt-3 break-words text-base font-bold leading-7 text-slate-900 transition group-hover:text-indigo-700 sm:text-lg">
                      {exam.title}
                    </h4>

                    <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                      {exam.description || "No description provided."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500 sm:text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 7v5l3 2"
                          />
                        </svg>
                        Duration: {exam.durationMinutes} minutes
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 5h16v14H4zM8 9h8M8 13h5"
                          />
                        </svg>
                        Course ID: {exam.courseId}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path
                            strokeLinecap="round"
                            d="M12 7v5l3 2"
                          />
                        </svg>
                        Created: {formatDate(exam.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:max-w-80 lg:shrink-0 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => handleEdit(exam)}
                      disabled={
                        deletingId === exam.id ||
                        updatingStatusId === exam.id
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4 11.5-11.5z"
                        />
                      </svg>
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePublished(exam)}
                      disabled={
                        updatingStatusId === exam.id ||
                        deletingId === exam.id
                      }
                      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        exam.published
                          ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      }`}
                    >
                      {updatingStatusId === exam.id ? (
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            strokeOpacity="0.25"
                          />
                          <path
                            strokeLinecap="round"
                            d="M21 12a9 9 0 00-9-9"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={
                              exam.published
                                ? "M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z"
                                : "M5 12h14M12 5l7 7-7 7"
                            }
                          />
                          {exam.published && <circle cx="12" cy="12" r="2.5" />}
                        </svg>
                      )}

                      {updatingStatusId === exam.id
                        ? "Updating..."
                        : exam.published
                          ? "Unpublish"
                          : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(exam)}
                      disabled={
                        deletingId === exam.id ||
                        updatingStatusId === exam.id
                      }
                      className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"
                        />
                      </svg>

                      {deletingId === exam.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}