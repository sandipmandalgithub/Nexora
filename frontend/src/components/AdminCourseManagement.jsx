
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

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

function AdminCourseManagement() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const getAuthConfig = () => {
    const token = localStorage.getItem("nexoraToken");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch courses for refresh and after CRUD operations.
  const fetchCourses = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/courses`,
        getAuthConfig()
      );

      setCourses(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial loading: update React state only after the API promise resolves.
  useEffect(() => {
    let active = true;

    axios
      .get(`${API_BASE_URL}/courses`, getAuthConfig())
      .then((response) => {
        if (!active) return;

        setCourses(Array.isArray(response.data) ? response.data : []);
        setError("");
      })
      .catch((requestError) => {
        if (!active) return;

        setError(getErrorMessage(requestError));
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

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          course.title,
          course.category,
          course.instructorName,
          course.description,
          String(course.id),
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch)
          );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && course.published) ||
        (statusFilter === "draft" && !course.published);

      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  const publishedCount = courses.filter(
    (course) => course.published
  ).length;

  const draftCount = courses.length - publishedCount;

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
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        instructorName: form.instructorName.trim(),
        published: form.published,
      };

      if (
        !payload.title ||
        !payload.description ||
        !payload.category ||
        !payload.instructorName
      ) {
        setError("Please complete all required course fields.");
        return;
      }

      if (editingId !== null) {
        await axios.put(
          `${API_BASE_URL}/courses/${editingId}`,
          payload,
          getAuthConfig()
        );

        setSuccess("Course updated successfully.");
      } else {
        await axios.post(
          `${API_BASE_URL}/courses`,
          payload,
          getAuthConfig()
        );

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

    if (!confirmed) return;

    setUpdatingStatusId(course.id);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        instructorName: course.instructorName || "",
        published: !course.published,
      };

      await axios.put(
        `${API_BASE_URL}/courses/${course.id}`,
        payload,
        getAuthConfig()
      );

      setSuccess(
        `Course ${course.published ? "unpublished" : "published"} successfully.`
      );

      await fetchCourses();

      if (selectedCourse?.id === course.id) {
        const response = await axios.get(
          `${API_BASE_URL}/courses/${course.id}`,
          getAuthConfig()
        );

        setSelectedCourse(response.data);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleDelete(course) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${course.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(course.id);
    setError("");
    setSuccess("");

    try {
      await axios.delete(
        `${API_BASE_URL}/courses/${course.id}`,
        getAuthConfig()
      );

      if (editingId === course.id) {
        resetForm();
      }

      if (selectedCourse?.id === course.id) {
        setSelectedCourse(null);
      }

      setSuccess("Course deleted successfully.");

      await fetchCourses();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleViewDetails(course) {
    setSelectedCourse(course);
    setDetailsLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/courses/${course.id}`,
        getAuthConfig()
      );

      setSelectedCourse(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <section className="mt-5 min-w-0 space-y-5 sm:mt-7 sm:space-y-6">
      {/* Header and Statistics */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 sm:text-sm">
              Administration
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
              Course Management
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Create, update, publish, unpublish and manage your learning
              courses from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCourses}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Refreshing..." : "Refresh courses"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total courses</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {courses.length}
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
        </div>
      )}

      {success && (
        <div
          role="status"
          className="break-words rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
        >
          {success}
        </div>
      )}

      {/* Create / Edit Form */}
      <div
        id="admin-course-form"
        className="scroll-mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7"
      >
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              {editingId !== null ? "Edit course" : "Create a course"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {editingId !== null
                ? "Update the course information below."
                : "Add a new course to the Nexora learning platform."}
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
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
                maxLength={150}
                placeholder="e.g. Java Full Stack Development"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {form.title.length}/150
              </p>
            </div>

            <div>
              <label
                htmlFor="course-category"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category *
              </label>

              <input
                id="course-category"
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                required
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
                Instructor name *
              </label>

              <input
                id="course-instructor"
                name="instructorName"
                type="text"
                value={form.instructorName}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="e.g. Nexora Team"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="course-description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Course description *
              </label>

              <textarea
                id="course-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                maxLength={2000}
                placeholder="Describe what students will learn in this course..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {form.description.length}/2000
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

      {/* Course List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              All courses
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Search and manage all courses available in the system.
            </p>
          </div>

          <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
            {filteredCourses.length} of {courses.length}
          </span>
        </div>

        {/* Search and Filter */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, category, instructor or ID..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>

        {loading && (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-500">
              Loading courses...
            </p>
          </div>
        )}

        {!loading && courses.length === 0 && (
          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center">
            <h4 className="font-semibold text-slate-800">No courses found</h4>

            <p className="mt-2 text-sm text-slate-500">
              Create your first course using the form above.
            </p>
          </div>
        )}

        {!loading && courses.length > 0 && filteredCourses.length === 0 && (
          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center">
            <h4 className="font-semibold text-slate-800">
              No matching courses
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Try another search term or change the status filter.
            </p>
          </div>
        )}

        {!loading && filteredCourses.length > 0 && (
          <div className="mt-5 space-y-4">
            {filteredCourses.map((course) => (
              <article
                key={course.id}
                className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-indigo-200 sm:p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
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

                      <span className="break-all text-xs text-slate-400">
                        ID: {course.id}
                      </span>
                    </div>

                    <h4 className="mt-3 break-words text-base font-bold leading-7 text-slate-900 sm:text-lg">
                      {course.title}
                    </h4>

                    <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                      {course.description || "No description provided."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                      <span>
                        Instructor: {course.instructorName || "Nexora Team"}
                      </span>

                      <span>Created: {formatDate(course.createdAt)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:max-w-72 lg:shrink-0 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(course)}
                      className="rounded-lg border border-indigo-200 px-3 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                    >
                      View details
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEdit(course)}
                      className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePublished(course)}
                      disabled={
                        updatingStatusId === course.id ||
                        deletingId === course.id
                      }
                      className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        course.published
                          ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      }`}
                    >
                      {updatingStatusId === course.id
                        ? "Updating..."
                        : course.published
                          ? "Unpublish"
                          : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(course)}
                      disabled={
                        deletingId === course.id ||
                        updatingStatusId === course.id
                      }
                      className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
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

      {/* Course Details Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCourse(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-details-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Course information
                </p>

                <h3
                  id="course-details-title"
                  className="mt-1 text-xl font-extrabold text-slate-900"
                >
                  Course Details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                aria-label="Close course details"
                className="rounded-lg px-3 py-2 text-xl font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                ×
              </button>
            </div>

            {detailsLoading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Loading course details...
              </div>
            ) : (
              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {selectedCourse.category || "General"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        selectedCourse.published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {selectedCourse.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <h4 className="mt-4 break-words text-xl font-extrabold leading-8 text-slate-900">
                    {selectedCourse.title}
                  </h4>

                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                    {selectedCourse.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Course ID
                    </p>
                    <p className="mt-2 break-all font-bold text-slate-900">
                      {selectedCourse.id}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Instructor
                    </p>
                    <p className="mt-2 break-words font-bold text-slate-900">
                      {selectedCourse.instructorName || "Nexora Team"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created at
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatDate(selectedCourse.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Last updated
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatDate(selectedCourse.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse(null);
                      handleEdit(selectedCourse);
                    }}
                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Edit course
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminCourseManagement;
