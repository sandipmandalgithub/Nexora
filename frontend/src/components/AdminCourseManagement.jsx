
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  instructorName: "",
  imageUrl: "",
  published: true,
};

const EMPTY_MODULE_FORM = {
  title: "",
  description: "",
  orderIndex: 0,
};

const EMPTY_LESSON_FORM = {
  title: "",
  description: "",
  videoUrl: "",
  content: "",
  duration: 0,
  orderIndex: 0,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60";

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

function StatusBadge({ published }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        published
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          published ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 9h8M8 13h8M8 17h4"
          />
        </svg>
      </div>

      <h4 className="mt-4 text-base font-bold text-slate-800">{title}</h4>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function AdminCourseManagement() {
  const [courses, setCourses] = useState([]);
  const [archivedCourses, setArchivedCourses] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
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

  // Module management state
  const [moduleCourse, setModuleCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [moduleForm, setModuleForm] = useState(EMPTY_MODULE_FORM);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [moduleSaving, setModuleSaving] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState(null);

  // Lesson management state
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON_FORM);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonSaving, setLessonSaving] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState(null);

  const getAuthConfig = () => {
    const token = localStorage.getItem("nexoraToken");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch active courses
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

  // Fetch archived courses
  const fetchArchivedCourses = useCallback(async () => {
    setArchivedLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/courses/archived`,
        getAuthConfig()
      );

      setArchivedCourses(
        Array.isArray(response.data) ? response.data : []
      );
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setArchivedLoading(false);
    }
  }, []);

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

  // Active course filtering
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

  // Archived course filtering
  const filteredArchivedCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return archivedCourses.filter((course) => {
      return (
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
          )
      );
    });
  }, [archivedCourses, searchTerm]);

  const displayedCourses = showArchived
    ? filteredArchivedCourses
    : filteredCourses;

  const currentLoading = showArchived ? archivedLoading : loading;

  const publishedCount = courses.filter(
    (course) => course.published
  ).length;

  const draftCount = courses.length - publishedCount;

  // Course form handlers
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
      imageUrl: course.imageUrl || "",
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
        imageUrl: form.imageUrl.trim(),
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
        imageUrl: course.imageUrl || "",
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
      `Are you sure you want to archive "${course.title}"? Existing enrollments, exams and course data will be preserved.`
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

      if (moduleCourse?.id === course.id) {
        closeModuleManagement();
      }

      setSuccess("Course archived successfully.");

      await fetchCourses();

      if (showArchived) {
        await fetchArchivedCourses();
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRestore(course) {
    const confirmed = window.confirm(
      `Are you sure you want to restore "${course.title}"?`
    );

    if (!confirmed) return;

    setRestoringId(course.id);
    setError("");
    setSuccess("");

    try {
      await axios.patch(
        `${API_BASE_URL}/courses/${course.id}/restore`,
        {},
        getAuthConfig()
      );

      setSuccess("Course restored successfully.");

      await Promise.all([
        fetchCourses(),
        fetchArchivedCourses(),
      ]);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setRestoringId(null);
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

  // ==========================================
  // MODULE MANAGEMENT
  // ==========================================

  async function fetchModules(courseId) {
    setModuleLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/courses/${courseId}/modules`,
        getAuthConfig()
      );

      setModules(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (requestError) {
      setModules([]);
      setError(getErrorMessage(requestError));
    } finally {
      setModuleLoading(false);
    }
  }

  async function openModuleManagement(course) {
    setModuleCourse(course);
    setModules([]);
    setModuleForm(EMPTY_MODULE_FORM);
    setEditingModuleId(null);
    setSelectedModule(null);
    setLessons([]);
    setError("");
    setSuccess("");

    await fetchModules(course.id);
  }

  function closeModuleManagement() {
    setModuleCourse(null);
    setModules([]);
    setModuleForm(EMPTY_MODULE_FORM);
    setEditingModuleId(null);
    setSelectedModule(null);
    setLessons([]);
    setLessonForm(EMPTY_LESSON_FORM);
    setEditingLessonId(null);
  }

  function handleModuleFormChange(event) {
    const { name, value } = event.target;

    setModuleForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleEditModule(module) {
    setModuleForm({
      title: module.title || "",
      description: module.description || "",
      orderIndex: module.orderIndex ?? 0,
    });

    setEditingModuleId(module.id);
  }

  function resetModuleForm() {
    setModuleForm(EMPTY_MODULE_FORM);
    setEditingModuleId(null);
  }

  async function handleModuleSubmit(event) {
    event.preventDefault();

    if (!moduleCourse) return;

    const payload = {
      title: moduleForm.title.trim(),
      description: moduleForm.description.trim(),
      orderIndex: Number(moduleForm.orderIndex),
    };

    if (!payload.title) {
      setError("Module title is required.");
      return;
    }

    if (payload.orderIndex < 0 || !Number.isInteger(payload.orderIndex)) {
      setError("Module order must be a non-negative whole number.");
      return;
    }

    setModuleSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingModuleId !== null) {
        await axios.put(
          `${API_BASE_URL}/courses/${moduleCourse.id}/modules/${editingModuleId}`,
          payload,
          getAuthConfig()
        );

        setSuccess("Module updated successfully.");
      } else {
        await axios.post(
          `${API_BASE_URL}/courses/${moduleCourse.id}/modules`,
          payload,
          getAuthConfig()
        );

        setSuccess("Module created successfully.");
      }

      resetModuleForm();
      await fetchModules(moduleCourse.id);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setModuleSaving(false);
    }
  }

  async function handleDeleteModule(module) {
    if (!moduleCourse) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${module.title}"? All lessons and their progress inside this module will also be deleted.`
    );

    if (!confirmed) return;

    setDeletingModuleId(module.id);
    setError("");
    setSuccess("");

    try {
      await axios.delete(
        `${API_BASE_URL}/courses/${moduleCourse.id}/modules/${module.id}`,
        getAuthConfig()
      );

      if (selectedModule?.id === module.id) {
        setSelectedModule(null);
        setLessons([]);
        setLessonForm(EMPTY_LESSON_FORM);
        setEditingLessonId(null);
      }

      if (editingModuleId === module.id) {
        resetModuleForm();
      }

      setSuccess("Module deleted successfully.");
      await fetchModules(moduleCourse.id);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingModuleId(null);
    }
  }

  // ==========================================
  // LESSON MANAGEMENT
  // ==========================================

  async function fetchLessons(moduleId) {
    setLessonLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/modules/${moduleId}/lessons`,
        getAuthConfig()
      );

      setLessons(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (requestError) {
      setLessons([]);
      setError(getErrorMessage(requestError));
    } finally {
      setLessonLoading(false);
    }
  }

  async function handleSelectModule(module) {
    setSelectedModule(module);
    setLessons([]);
    setLessonForm(EMPTY_LESSON_FORM);
    setEditingLessonId(null);
    setError("");
    setSuccess("");

    await fetchLessons(module.id);
  }

  function handleLessonFormChange(event) {
    const { name, value } = event.target;

    setLessonForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleEditLesson(lesson) {
    setLessonForm({
      title: lesson.title || "",
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      content: lesson.content || "",
      duration: lesson.duration ?? 0,
      orderIndex: lesson.orderIndex ?? 0,
    });

    setEditingLessonId(lesson.id);
  }

  function resetLessonForm() {
    setLessonForm(EMPTY_LESSON_FORM);
    setEditingLessonId(null);
  }

  async function handleLessonSubmit(event) {
    event.preventDefault();

    if (!selectedModule) return;

    const payload = {
      title: lessonForm.title.trim(),
      description: lessonForm.description.trim(),
      videoUrl: lessonForm.videoUrl.trim(),
      content: lessonForm.content,
      duration: Number(lessonForm.duration),
      orderIndex: Number(lessonForm.orderIndex),
    };

    if (!payload.title) {
      setError("Lesson title is required.");
      return;
    }

    if (
      !Number.isInteger(payload.duration) ||
      payload.duration < 0
    ) {
      setError("Duration must be a non-negative whole number.");
      return;
    }

    if (
      !Number.isInteger(payload.orderIndex) ||
      payload.orderIndex < 0
    ) {
      setError("Lesson order must be a non-negative whole number.");
      return;
    }

    setLessonSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingLessonId !== null) {
        await axios.put(
          `${API_BASE_URL}/modules/${selectedModule.id}/lessons/${editingLessonId}`,
          payload,
          getAuthConfig()
        );

        setSuccess("Lesson updated successfully.");
      } else {
        await axios.post(
          `${API_BASE_URL}/modules/${selectedModule.id}/lessons`,
          payload,
          getAuthConfig()
        );

        setSuccess("Lesson created successfully.");
      }

      resetLessonForm();
      await fetchLessons(selectedModule.id);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLessonSaving(false);
    }
  }

  async function handleDeleteLesson(lesson) {
    if (!selectedModule) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${lesson.title}"?`
    );

    if (!confirmed) return;

    setDeletingLessonId(lesson.id);
    setError("");
    setSuccess("");

    try {
      await axios.delete(
        `${API_BASE_URL}/modules/${selectedModule.id}/lessons/${lesson.id}`,
        getAuthConfig()
      );

      if (editingLessonId === lesson.id) {
        resetLessonForm();
      }

      setSuccess("Lesson deleted successfully.");
      await fetchLessons(selectedModule.id);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingLessonId(null);
    }
  }

  return (
    <section className="mt-8 min-w-0 space-y-7 sm:mt-10 sm:space-y-8">
      {/* Header and Statistics */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-7 text-white sm:px-7 sm:py-8 lg:px-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                Academic Content
              </div>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Course Management
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Create, organize and manage your learning courses from one
                centralized workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={showArchived ? fetchArchivedCourses : fetchCourses}
              disabled={currentLoading}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className={`h-4 w-4 ${currentLoading ? "animate-spin" : ""}`}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7v5h-5M4 17v-5h5M5.6 9A7 7 0 0 1 18 6l2 1M4 17l2-1a7 7 0 0 0 12.4-3"
                />
              </svg>
              {currentLoading ? "Refreshing..." : "Refresh courses"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">
                Total courses
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 8h8M8 12h8M8 16h5"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              {courses.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Active learning courses
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-emerald-700">
                Published
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 12 4 4L19 6"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-800">
              {publishedCount}
            </p>
            <p className="mt-1 text-xs text-emerald-700/80">
              Visible to students
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-amber-700">Drafts</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm ring-1 ring-amber-100">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.5 5.5 3 3M4 20l4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-amber-800">
              {draftCount}
            </p>
            <p className="mt-1 text-xs text-amber-700/80">
              Not yet published
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              strokeLinecap="round"
              d="M12 8v5m0 3h.01"
            />
          </svg>
          <div className="min-w-0 flex-1 break-words">{error}</div>
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
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8 12 2.5 2.5L16 9"
            />
          </svg>
          <div className="min-w-0 flex-1 break-words">{success}</div>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="shrink-0 rounded-lg px-2 py-1 font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create / Edit Course Form */}
      <div
        id="admin-course-form"
        className="scroll-mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  {editingId !== null ? "Edit course" : "Create a course"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {editingId !== null
                    ? "Update the course information below."
                    : "Add a new learning course to the Nexora platform."}
                </p>
              </div>
            </div>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className={secondaryButtonClass}
              >
                Cancel edit
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="course-title" className={labelClass}>
                Course title <span className="text-red-500">*</span>
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
                className={inputClass}
              />
              <p className="mt-1.5 text-right text-xs text-slate-400">
                {form.title.length}/150 characters
              </p>
            </div>

            <div>
              <label htmlFor="course-category" className={labelClass}>
                Category <span className="text-red-500">*</span>
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
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="course-instructor" className={labelClass}>
                Instructor name <span className="text-red-500">*</span>
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
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="course-image-url" className={labelClass}>
                Course image URL <span className="text-xs font-normal text-slate-400">(Optional)</span>
              </label>
              <input
                id="course-image-url"
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                maxLength={1000}
                placeholder="https://example.com/course-image.jpg"
                className={inputClass}
                aria-describedby="course-image-help"
              />
              <p id="course-image-help" className="mt-1.5 text-xs leading-5 text-slate-500">
                Add a publicly accessible image URL. A landscape image with a 16:9 ratio works best.
              </p>

              {form.imageUrl.trim() && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-700">Image preview</span>
                    <button
                      type="button"
                      onClick={() => setForm((previous) => ({ ...previous, imageUrl: "" }))}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Remove image
                    </button>
                  </div>
                  <img
                    src={form.imageUrl.trim()}
                    alt="Course cover preview"
                    className="aspect-video max-h-64 w-full bg-slate-100 object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    onLoad={(event) => {
                      event.currentTarget.style.display = "block";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="course-description" className={labelClass}>
                Course description <span className="text-red-500">*</span>
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
                className={`${inputClass} resize-y leading-6`}
              />
              <p className="mt-1.5 text-right text-xs text-slate-400">
                {form.description.length}/2000 characters
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
              className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
            />
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-800">
                Publish this course
              </span>
              <span className="mt-1 block text-sm leading-5 text-slate-500">
                Published courses are visible to students. Unpublished courses
                remain available for administration.
              </span>
            </span>
          </label>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={saving}
              className={`${primaryButtonClass} w-full sm:w-auto`}
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save changes"
                  : "Create course"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className={`${secondaryButtonClass} w-full sm:w-auto`}
              >
                Discard changes
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Active / Archived Course Tabs */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setShowArchived(false)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
              !showArchived
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 9h8M8 13h8"
              />
            </svg>
            Active
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                !showArchived
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {courses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={async () => {
              setShowArchived(true);
              await fetchArchivedCourses();
            }}
            disabled={archivedLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              showArchived
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3"
              />
            </svg>
            Archived
          </button>
        </div>

        <p className="px-2 text-xs text-slate-500 sm:text-right">
          {showArchived
            ? "Previously archived courses"
            : "Currently available courses"}
        </p>
      </div>

      {/* Course List */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  {showArchived ? "Archived Courses" : "All courses"}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    showArchived
                      ? "bg-amber-50 text-amber-700"
                      : "bg-indigo-50 text-indigo-700"
                  }`}
                >
                  {displayedCourses.length}{" "}
                  {displayedCourses.length === 1 ? "course" : "courses"}
                </span>
              </div>

              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                {showArchived
                  ? "Review archived courses and restore them when needed."
                  : "Search, review and manage courses available in the system."}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path
                  strokeLinecap="round"
                  d="m16 16 4 4"
                />
              </svg>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, category, instructor or ID..."
                aria-label="Search courses"
                className={`${inputClass} pl-10`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter courses by status"
              disabled={showArchived}
              className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          {showArchived && (
            <p className="mt-2 text-xs text-slate-400">
              Status filtering is available in the Active Courses tab.
            </p>
          )}
        </div>

        <div className="p-5 sm:p-7">
          {currentLoading && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="mt-4 text-sm font-semibold text-slate-600">
                Loading {showArchived ? "archived" : "active"} courses...
              </p>
            </div>
          )}

          {!currentLoading &&
            !showArchived &&
            courses.length === 0 && (
              <EmptyState
                title="No courses created yet"
                description="Create your first course using the form above. Your courses will appear here once they are added."
              />
            )}

          {!currentLoading &&
            showArchived &&
            archivedCourses.length === 0 && (
              <EmptyState
                title="No archived courses"
                description="Courses that you archive will appear here. You can restore them whenever needed."
              />
            )}

          {!currentLoading &&
            !showArchived &&
            courses.length > 0 &&
            filteredCourses.length === 0 && (
              <EmptyState
                title="No matching courses"
                description="Try another search term or change the status filter to find the course you are looking for."
              />
            )}

          {!currentLoading &&
            showArchived &&
            archivedCourses.length > 0 &&
            filteredArchivedCourses.length === 0 && (
              <EmptyState
                title="No matching archived courses"
                description="Try another search term to find the archived course you are looking for."
              />
            )}

          {!currentLoading && displayedCourses.length > 0 && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {displayedCourses.map((course) => (
                <article
                  key={course.id}
                  className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-200/50 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="inline-flex max-w-full items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                        <span className="truncate">
                          {course.category || "General"}
                        </span>
                      </span>

                      <StatusBadge published={course.published} />
                    </div>

                    <span className="shrink-0 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
                      #{course.id}
                    </span>
                  </div>

                  <div className="mt-4 min-w-0 flex-1">
                    <h4 className="break-words text-lg font-extrabold leading-7 text-slate-900 transition group-hover:text-indigo-700">
                      {course.title}
                    </h4>

                    <p className="mt-2 line-clamp-3 whitespace-pre-line break-words text-sm leading-6 text-slate-500">
                      {course.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50/80 p-3 sm:grid-cols-2">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="8" r="3.5" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 20a7 7 0 0 1 14 0"
                          />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Instructor
                        </p>
                        <p className="mt-0.5 break-words text-sm font-semibold text-slate-700">
                          {course.instructorName || "Nexora Team"}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-start gap-2.5">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="8.5" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 7v5l3 2"
                          />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Created
                        </p>
                        <p className="mt-0.5 break-words text-sm font-semibold text-slate-700">
                          {formatDate(course.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:flex sm:flex-wrap">
                    {!showArchived && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleViewDetails(course)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2.5 text-xs font-bold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 sm:text-sm"
                        >
                          View details
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(course)}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => openModuleManagement(course)}
                          disabled={deletingId === course.id}
                          className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1 sm:text-sm"
                        >
                          Manage Modules
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTogglePublished(course)}
                          disabled={
                            updatingStatusId === course.id ||
                            deletingId === course.id
                          }
                          className={`inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${
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
                          className="col-span-2 inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1 sm:text-sm"
                        >
                          {deletingId === course.id
                            ? "Archiving..."
                            : "Archive"}
                        </button>
                      </>
                    )}

                    {showArchived && (
                      <button
                        type="button"
                        onClick={() => handleRestore(course)}
                        disabled={restoringId === course.id}
                        className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 12a8 8 0 1 0 2.3-5.6L4 8.5M4 4v4.5h4.5"
                          />
                        </svg>
                        {restoringId === course.id
                          ? "Restoring..."
                          : "Restore Course"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6"
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
            className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 p-5 sm:p-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Course information
                </div>

                <h3
                  id="course-details-title"
                  className="mt-3 text-xl font-extrabold text-slate-900"
                >
                  Course Details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                aria-label="Close course details"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                ×
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading course details...
                </p>
              </div>
            ) : (
              <div className="space-y-6 p-5 sm:p-7">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {selectedCourse.category || "General"}
                    </span>
                    <StatusBadge published={selectedCourse.published} />
                  </div>

                  <h4 className="mt-4 break-words text-2xl font-extrabold leading-8 text-slate-900">
                    {selectedCourse.title}
                  </h4>

                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                    {selectedCourse.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Course ID
                    </p>
                    <p className="mt-2 break-all text-sm font-bold text-slate-900">
                      {selectedCourse.id}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Instructor
                    </p>
                    <p className="mt-2 break-words text-sm font-bold text-slate-900">
                      {selectedCourse.instructorName || "Nexora Team"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Created at
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {formatDate(selectedCourse.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Last updated
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {formatDate(selectedCourse.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className={secondaryButtonClass}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse(null);
                      handleEdit(selectedCourse);
                    }}
                    className={primaryButtonClass}
                  >
                    Edit course
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Module Management Modal */}
      {moduleCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-2 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModuleManagement();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="module-management-title"
            className="my-auto flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white p-5 sm:p-6">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Course Curriculum
                </div>

                <h3
                  id="module-management-title"
                  className="mt-3 break-words text-xl font-extrabold text-slate-900 sm:text-2xl"
                >
                  Manage Modules
                </h3>

                <p className="mt-1.5 break-words text-sm text-slate-500">
                  {moduleCourse.title} · Course ID: {moduleCourse.id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModuleManagement}
                aria-label="Close module management"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-7 overflow-y-auto p-4 sm:p-6">
              {/* Module Form */}
              <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {editingModuleId !== null
                        ? "Edit Module"
                        : "Add New Module"}
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Create sections to organize your course topics.
                    </p>
                  </div>

                  {editingModuleId !== null && (
                    <button
                      type="button"
                      onClick={resetModuleForm}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white"
                    >
                      Cancel edit
                    </button>
                  )}
                </div>

                <form
                  onSubmit={handleModuleSubmit}
                  className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <div className="sm:col-span-2">
                    <label htmlFor="module-title" className={labelClass}>
                      Module title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="module-title"
                      name="title"
                      value={moduleForm.title}
                      onChange={handleModuleFormChange}
                      required
                      maxLength={150}
                      placeholder="e.g. Introduction to Java"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="module-order" className={labelClass}>
                      Order index
                    </label>
                    <input
                      id="module-order"
                      name="orderIndex"
                      type="number"
                      min="0"
                      step="1"
                      value={moduleForm.orderIndex}
                      onChange={handleModuleFormChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="module-description"
                      className={labelClass}
                    >
                      Description
                    </label>
                    <textarea
                      id="module-description"
                      name="description"
                      value={moduleForm.description}
                      onChange={handleModuleFormChange}
                      rows={3}
                      maxLength={2000}
                      placeholder="Describe what students will learn in this module..."
                      className={`${inputClass} resize-y leading-6`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={moduleSaving}
                      className={`${primaryButtonClass} w-full bg-violet-600 hover:bg-violet-700 focus:ring-violet-500/20 sm:w-auto`}
                    >
                      {moduleSaving
                        ? "Saving..."
                        : editingModuleId !== null
                          ? "Save Module Changes"
                          : "Create Module"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Module List */}
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900">
                      Course Modules
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Select a module to manage its lessons and topics.
                    </p>
                  </div>

                  <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 ring-1 ring-inset ring-violet-100">
                    {modules.length} Modules
                  </span>
                </div>

                {moduleLoading && (
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-10 text-center">
                    <div className="h-7 w-7 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
                    <p className="mt-3 text-sm font-medium text-slate-500">
                      Loading modules...
                    </p>
                  </div>
                )}

                {!moduleLoading && modules.length === 0 && (
                  <EmptyState
                    title="No modules added yet"
                    description="Use the form above to create the first module for this course."
                  />
                )}

                {!moduleLoading && modules.length > 0 && (
                  <div className="space-y-3">
                    {modules.map((module) => (
                      <article
                        key={module.id}
                        className={`rounded-2xl border p-4 transition sm:p-5 ${
                          selectedModule?.id === module.id
                            ? "border-violet-300 bg-violet-50/60 shadow-sm"
                            : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                          <button
                            type="button"
                            onClick={() => handleSelectModule(module)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                                Module {module.orderIndex ?? 0}
                              </span>

                              <span className="text-xs text-slate-400">
                                ID: {module.id}
                              </span>

                              {selectedModule?.id === module.id && (
                                <span className="rounded-full bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white">
                                  Selected
                                </span>
                              )}
                            </div>

                            <h5 className="mt-2 break-words font-bold text-slate-900">
                              {module.title}
                            </h5>

                            {module.description && (
                              <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-slate-500">
                                {module.description}
                              </p>
                            )}

                            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-violet-700">
                              {selectedModule?.id === module.id
                                ? "Selected module"
                                : "Manage lessons"}
                              <span aria-hidden="true">→</span>
                            </span>
                          </button>

                          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditModule(module)}
                              className={secondaryButtonClass}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteModule(module)}
                              disabled={deletingModuleId === module.id}
                              className="inline-flex items-center justify-center rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingModuleId === module.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Lesson Management */}
              {selectedModule && (
                <div className="space-y-6 border-t border-slate-200 pt-7">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      Selected Module
                    </p>

                    <h4 className="mt-1.5 break-words text-lg font-extrabold text-slate-900">
                      {selectedModule.title}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Manage the lessons and topics inside this module.
                    </p>
                  </div>

                  {/* Lesson Form */}
                  <div className="rounded-2xl border border-indigo-100 bg-white p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h5 className="font-extrabold text-slate-900">
                          {editingLessonId !== null
                            ? "Edit Lesson / Topic"
                            : "Add New Lesson / Topic"}
                        </h5>
                        <p className="mt-1 text-sm text-slate-500">
                          Add learning content to the selected module.
                        </p>
                      </div>

                      {editingLessonId !== null && (
                        <button
                          type="button"
                          onClick={resetLessonForm}
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                        >
                          Cancel edit
                        </button>
                      )}
                    </div>

                    <form
                      onSubmit={handleLessonSubmit}
                      className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                      <div className="sm:col-span-2">
                        <label htmlFor="lesson-title" className={labelClass}>
                          Lesson / Topic title{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="lesson-title"
                          name="title"
                          value={lessonForm.title}
                          onChange={handleLessonFormChange}
                          required
                          maxLength={150}
                          placeholder="e.g. What is Java?"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="lesson-duration"
                          className={labelClass}
                        >
                          Duration (minutes)
                        </label>
                        <input
                          id="lesson-duration"
                          name="duration"
                          type="number"
                          min="0"
                          step="1"
                          value={lessonForm.duration}
                          onChange={handleLessonFormChange}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor="lesson-order" className={labelClass}>
                          Order index
                        </label>
                        <input
                          id="lesson-order"
                          name="orderIndex"
                          type="number"
                          min="0"
                          step="1"
                          value={lessonForm.orderIndex}
                          onChange={handleLessonFormChange}
                          className={inputClass}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="lesson-description"
                          className={labelClass}
                        >
                          Description
                        </label>
                        <textarea
                          id="lesson-description"
                          name="description"
                          value={lessonForm.description}
                          onChange={handleLessonFormChange}
                          rows={3}
                          maxLength={2000}
                          placeholder="Short description of this lesson..."
                          className={`${inputClass} resize-y leading-6`}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="lesson-video-url"
                          className={labelClass}
                        >
                          Video URL
                        </label>
                        <input
                          id="lesson-video-url"
                          name="videoUrl"
                          type="url"
                          value={lessonForm.videoUrl}
                          onChange={handleLessonFormChange}
                          maxLength={1000}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className={inputClass}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="lesson-content"
                          className={labelClass}
                        >
                          Lesson Content
                        </label>
                        <textarea
                          id="lesson-content"
                          name="content"
                          value={lessonForm.content}
                          onChange={handleLessonFormChange}
                          rows={7}
                          maxLength={100000}
                          placeholder="Write lesson notes, explanations, examples or learning materials..."
                          className={`${inputClass} resize-y leading-6`}
                        />
                        <p className="mt-1.5 text-right text-xs text-slate-400">
                          {lessonForm.content.length}/100000 characters
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          type="submit"
                          disabled={lessonSaving}
                          className={`${primaryButtonClass} w-full sm:w-auto`}
                        >
                          {lessonSaving
                            ? "Saving..."
                            : editingLessonId !== null
                              ? "Save Lesson Changes"
                              : "Create Lesson"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Lesson List */}
                  <div>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h5 className="font-extrabold text-slate-900">
                          Lessons / Topics
                        </h5>
                        <p className="mt-1 text-sm text-slate-500">
                          Lessons belonging to this module.
                        </p>
                      </div>

                      <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                        {lessons.length} Lessons
                      </span>
                    </div>

                    {lessonLoading && (
                      <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-10 text-center">
                        <div className="h-7 w-7 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                        <p className="mt-3 text-sm font-medium text-slate-500">
                          Loading lessons...
                        </p>
                      </div>
                    )}

                    {!lessonLoading && lessons.length === 0 && (
                      <EmptyState
                        title="No lessons added yet"
                        description="Use the lesson form above to add the first topic to this module."
                      />
                    )}

                    {!lessonLoading && lessons.length > 0 && (
                      <div className="space-y-3">
                        {lessons.map((lesson) => (
                          <article
                            key={lesson.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 sm:p-5"
                          >
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                    Topic {lesson.orderIndex ?? 0}
                                  </span>

                                  <span className="text-xs text-slate-400">
                                    ID: {lesson.id}
                                  </span>

                                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      className="h-3.5 w-3.5"
                                      aria-hidden="true"
                                    >
                                      <circle cx="12" cy="12" r="8.5" />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 7v5l3 2"
                                      />
                                    </svg>
                                    {lesson.duration ?? 0} min
                                  </span>
                                </div>

                                <h6 className="mt-3 break-words font-bold text-slate-900">
                                  {lesson.title}
                                </h6>

                                {lesson.description && (
                                  <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-slate-500">
                                    {lesson.description}
                                  </p>
                                )}

                                {lesson.videoUrl && (
                                  <a
                                    href={lesson.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center gap-1.5 break-all text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      className="h-4 w-4 shrink-0"
                                      aria-hidden="true"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M14 4h6v6m-10 4L20 4M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"
                                      />
                                    </svg>
                                    Open lesson video
                                  </a>
                                )}

                                {lesson.content && (
                                  <details className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                                    <summary className="cursor-pointer bg-slate-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50">
                                      Preview lesson content
                                    </summary>

                                    <div className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words border-t border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                                      {lesson.content}
                                    </div>
                                  </details>
                                )}
                              </div>

                              <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                                <button
                                  type="button"
                                  onClick={() => handleEditLesson(lesson)}
                                  className={secondaryButtonClass}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(lesson)}
                                  disabled={deletingLessonId === lesson.id}
                                  className="inline-flex items-center justify-center rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {deletingLessonId === lesson.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white p-4 sm:px-6">
              <button
                type="button"
                onClick={closeModuleManagement}
                className={`${secondaryButtonClass} w-full sm:w-auto`}
              >
                Close Module Management
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminCourseManagement;
