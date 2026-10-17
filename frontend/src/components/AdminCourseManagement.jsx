
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  instructorName: "",
  published: true,
};

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Your session may have expired. Please sign in again.";
  }

  if (error.response?.status === 403) {
    return "You do not have permission to manage courses.";
  }

  if (!error.response) {
    return "Cannot connect to the server. Please make sure the backend is running.";
  }

  return (
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.response?.data?.title ||
    "Something went wrong. Please try again."
  );
}

function AdminCourseManagement() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem("nexoraToken");

      const response = await axios.get(`${API_BASE_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadCourses() {
      try {
        const token = localStorage.getItem("nexoraToken");

        const response = await axios.get(`${API_BASE_URL}/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isActive) {
          setCourses(Array.isArray(response.data) ? response.data : []);
          setError("");
        }
      } catch (requestError) {
        if (isActive) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      isActive = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleEdit(course) {
    setForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      instructorName: course.instructorName || "",
      published: Boolean(course.published),
    });

    setEditingId(course.id);
    setError("");
    setSuccess("");

    document
      .getElementById("admin-course-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("nexoraToken");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        instructorName: form.instructorName.trim(),
        published: form.published,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingId !== null) {
        await axios.put(
          `${API_BASE_URL}/courses/${editingId}`,
          payload,
          config
        );

        setSuccess("Course updated successfully.");
      } else {
        await axios.post(`${API_BASE_URL}/courses`, payload, config);

        setSuccess("Course created successfully.");
      }

      resetForm();
      await fetchCourses();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublished(course) {
    const action = course.published ? "unpublish" : "publish";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${course.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("nexoraToken");

      await axios.put(
        `${API_BASE_URL}/courses/${course.id}`,
        {
          title: course.title || "",
          description: course.description || "",
          category: course.category || "",
          instructorName: course.instructorName || "",
          published: !course.published,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        `Course ${course.published ? "unpublished" : "published"} successfully.`
      );

      await fetchCourses();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleDelete(course) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${course.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(course.id);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("nexoraToken");

      await axios.delete(`${API_BASE_URL}/courses/${course.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (editingId === course.id) {
        resetForm();
      }

      setSuccess("Course deleted successfully.");
      await fetchCourses();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-7 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Administration
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
              Course Management
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create, update, publish, and manage your learning courses.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCourses}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh courses"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total courses</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {courses.length}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Published</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-800">
              {courses.filter((course) => course.published).length}
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-sm text-amber-700">Drafts</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-800">
              {courses.filter((course) => !course.published).length}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
        >
          {success}
        </div>
      )}

      <div
        id="admin-course-form"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {editingId !== null ? "Edit course" : "Create a course"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Enter the course details below.
            </p>
          </div>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="course-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Course title *
              </label>

              <input
                id="course-title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="e.g. Java Full Stack Development"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="course-category"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category
              </label>

              <input
                id="course-category"
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Programming"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="course-instructor"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Instructor name
              </label>

              <input
                id="course-instructor"
                name="instructorName"
                type="text"
                value={form.instructorName}
                onChange={handleChange}
                maxLength={150}
                placeholder="e.g. Nexora Team"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="course-description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="course-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                maxLength={5000}
                placeholder="Describe what students will learn in this course..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-slate-300 accent-indigo-600"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Publish this course
              </span>

              <span className="mt-1 block text-sm leading-5 text-slate-500">
                Published courses are visible to students. Unpublished courses
                remain available for administration.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving
              ? "Saving..."
              : editingId !== null
                ? "Save changes"
                : "Create course"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              All courses
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Manage existing courses and their publication status.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
            {courses.length}
          </span>
        </div>

        {loading && (
          <p className="mt-6 text-sm text-slate-500" role="status">
            Loading courses...
          </p>
        )}

        {!loading && courses.length === 0 && !error && (
          <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
            <p className="font-semibold text-slate-800">No courses found</p>
            <p className="mt-2 text-sm text-slate-500">
              Create your first course using the form above.
            </p>
          </div>
        )}

        {!loading && courses.length > 0 && (
          <div className="mt-6 space-y-4">
            {courses.map((course) => (
              <article
                key={course.id}
                className="rounded-xl border border-slate-200 p-5 transition hover:border-indigo-200"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        {course.category || "General"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          course.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>

                      <span className="text-xs text-slate-400">
                        ID: {course.id}
                      </span>
                    </div>

                    <h4 className="mt-3 break-words text-lg font-bold text-slate-900">
                      {course.title}
                    </h4>

                    <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                      {course.description || "No description provided."}
                    </p>

                    <p className="mt-3 text-sm text-slate-500">
                      Instructor: {course.instructorName || "Nexora Team"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:max-w-48 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => handleEdit(course)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePublished(course)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        course.published
                          ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      }`}
                    >
                      {course.published ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(course)}
                      disabled={deletingId === course.id}
                      className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === course.id ? "Deleting..." : "Delete"}
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

export default AdminCourseManagement;
