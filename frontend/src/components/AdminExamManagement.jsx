
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
      [name]:
        type === "checkbox"
          ? checked
          : value,
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

  return (
    <section className="mt-5 min-w-0 space-y-5 sm:mt-7 sm:space-y-6">
      {/* Header and statistics */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 sm:text-sm">
              Administration
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
              Exam Management
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Create and manage multiple examinations for every course.
              Control exam duration and publication status from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Refreshing..." : "Refresh exams"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total exams</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {exams.length}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Published</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-800">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-sm text-amber-700">Drafts</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-800">
              {draftCount}
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          {error}

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-3 font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="break-words rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
        >
          {success}

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="ml-3 font-bold underline"
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
            <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              {editingId !== null ? "Edit exam" : "Create a new exam"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {editingId !== null
                ? "Update the examination information below."
                : "Select a course and create an examination for its students."}
            </p>
          </div>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 sm:w-auto"
            >
              Cancel edit
            </button>
          )}
        </div>

        {courses.length === 0 && !loading && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            No active courses are available. Create or restore a course in
            Course Management before creating an exam.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="sm:col-span-2">
              <label
                htmlFor="exam-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
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
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {form.title.length}/150
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="exam-course"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Select course *
              </label>

              <select
                id="exam-course"
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Choose a course</option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} (ID: {course.id})
                    {!course.published ? " - Draft course" : ""}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Every exam is linked to one course. Students enrolled in that
                course can access its published exams.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="exam-description"
                className="mb-2 block text-sm font-semibold text-slate-700"
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
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {form.description.length}/2000
              </p>
            </div>

            <div>
              <label
                htmlFor="exam-duration"
                className="mb-2 block text-sm font-semibold text-slate-700"
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
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-1 text-xs text-slate-500">
                Minimum 1 minute; maximum 600 minutes.
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
              className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
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

          <button
            type="submit"
            disabled={saving || courses.length === 0}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving
              ? "Saving..."
              : editingId !== null
                ? "Save exam changes"
                : "Create exam"}
          </button>
        </form>
      </div>

      {/* Exam list */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              All examinations
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Search, filter, edit, publish or delete examinations.
            </p>
          </div>

          <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
            {filteredExams.length} of {exams.length}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search exam title, course or ID..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:col-span-3"
          />

          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:col-span-2"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Unpublished</option>
          </select>
        </div>

        {loading && (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-500">
              Loading examinations...
            </p>
          </div>
        )}

        {!loading && exams.length === 0 && (
          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center">
            <h4 className="font-semibold text-slate-800">
              No examinations found
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Create your first exam using the form above.
            </p>
          </div>
        )}

        {!loading && exams.length > 0 && filteredExams.length === 0 && (
          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center">
            <h4 className="font-semibold text-slate-800">
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
                className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-indigo-200 sm:p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        {exam.courseTitle || "Course"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          exam.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {exam.published ? "Published" : "Unpublished"}
                      </span>

                      <span className="break-all text-xs text-slate-400">
                        Exam ID: {exam.id}
                      </span>
                    </div>

                    <h4 className="mt-3 break-words text-base font-bold leading-7 text-slate-900 sm:text-lg">
                      {exam.title}
                    </h4>

                    <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                      {exam.description || "No description provided."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                      <span>
                        Duration: {exam.durationMinutes} minutes
                      </span>

                      <span>Course ID: {exam.courseId}</span>

                      <span>Created: {formatDate(exam.createdAt)}</span>
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
                      className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePublished(exam)}
                      disabled={
                        updatingStatusId === exam.id ||
                        deletingId === exam.id
                      }
                      className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        exam.published
                          ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      }`}
                    >
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
                      className="col-span-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1"
                    >
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
