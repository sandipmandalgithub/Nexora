
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock3,
  FileText,
  GraduationCap,
  Layers3,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { API_BASE_URL } from "../utils/api";

function getStoredUser() {
  try {
    const user = localStorage.getItem("nexoraUser");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (parsedUrl.pathname === "/watch") {
        const videoId = parsedUrl.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        return url;
      }

      if (parsedUrl.pathname.startsWith("/shorts/")) {
        const videoId = parsedUrl.pathname.split("/")[2];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function StudentLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("nexoraToken");
  const user = useMemo(() => getStoredUser(), []);

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedModules, setExpandedModules] = useState({});

  const [completedLessons, setCompletedLessons] = useState({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [progressSuccess, setProgressSuccess] = useState("");

  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examsError, setExamsError] = useState("");

  const role = String(user?.role || "").toUpperCase();
  const isStudent = role === "STUDENT";

  const apiRequest = useCallback(
    async (endpoint, method = "GET", body = null) => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...(body !== null ? { body: JSON.stringify(body) } : {}),
      });

      if (!response.ok) {
        let message = "Something went wrong. Please try again.";

        try {
          const data = await response.json();
          message = data.message || data.error || message;
        } catch {
          // Keep the default error message.
        }

        const requestError = new Error(message);
        requestError.status = response.status;
        throw requestError;
      }

      if (response.status === 204) {
        return null;
      }

      const responseText = await response.text();
      return responseText ? JSON.parse(responseText) : null;
    },
    [token]
  );

  useEffect(() => {
    if (!token || !user) {
      navigate("/login", { replace: true });
      return;
    }

    if (role !== "STUDENT" && role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
    }
  }, [token, user, role, navigate]);

  useEffect(() => {
    let isActive = true;

    async function loadLearningContent() {
      if (!token || !user) return;

      setLoading(true);
      setError("");
      setProgressError("");
      setProgressSuccess("");
      setCompletedLessons({});
      setExams([]);
      setExamsError("");

      try {
        const [courseData, moduleData] = await Promise.all([
          apiRequest(`/courses/${courseId}`),
          apiRequest(`/courses/${courseId}/modules`),
        ]);

        const modulesWithLessons = await Promise.all(
          moduleData.map(async (module) => {
            const lessons = await apiRequest(`/modules/${module.id}/lessons`);

            return {
              ...module,
              lessons: Array.isArray(lessons) ? lessons : [],
            };
          })
        );

        if (!isActive) return;

        setCourse(courseData);
        setModules(modulesWithLessons);

        const firstModule = modulesWithLessons[0];

        if (firstModule) {
          setExpandedModules({ [firstModule.id]: true });

          if (firstModule.lessons.length > 0) {
            setSelectedLessonId(firstModule.lessons[0].id);
          } else {
            setSelectedLessonId(null);
          }
        } else {
          setSelectedLessonId(null);
        }

        if (isStudent) {
          setExamsLoading(true);

          try {
            const examData = await apiRequest(
              `/exams/course/${courseId}`
            );

            if (!isActive) return;

            setExams(
              Array.isArray(examData)
                ? examData.filter((exam) => exam.published === true)
                : []
            );
          } catch (examError) {
            if (!isActive) return;

            if (examError.status === 401) {
              localStorage.removeItem("nexoraToken");
              localStorage.removeItem("nexoraUser");
              navigate("/login", { replace: true });
              return;
            }

            setExamsError(
              examError.status === 403
                ? "You are not enrolled in this course and cannot access its exams."
                : examError.message
            );
          } finally {
            if (isActive) {
              setExamsLoading(false);
            }
          }

          const lessons = modulesWithLessons.flatMap(
            (module) => module.lessons
          );

          const progressResults = await Promise.all(
            lessons.map(async (lesson) => {
              try {
                const progress = await apiRequest(
                  `/lessons/${lesson.id}/progress`
                );

                return {
                  lessonId: String(lesson.id),
                  completed: Boolean(
                    progress?.completed ?? progress?.isCompleted
                  ),
                };
              } catch {
                return {
                  lessonId: String(lesson.id),
                  completed: false,
                };
              }
            })
          );

          if (!isActive) return;

          const progressMap = {};

          progressResults.forEach((item) => {
            progressMap[item.lessonId] = item.completed;
          });

          setCompletedLessons(progressMap);
        }
      } catch (requestError) {
        if (!isActive) return;

        if (requestError.status === 401) {
          localStorage.removeItem("nexoraToken");
          localStorage.removeItem("nexoraUser");
          navigate("/login", { replace: true });
          return;
        }

        if (requestError.status === 403) {
          setError(
            "You are not enrolled in this course or you do not have permission to access its learning content."
          );
        } else if (requestError.status === 404) {
          setError("The requested course or learning content was not found.");
        } else {
          setError(requestError.message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadLearningContent();

    return () => {
      isActive = false;
    };
  }, [courseId, token, user, isStudent, apiRequest, navigate]);

  const allLessons = useMemo(() => {
    return modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
      }))
    );
  }, [modules]);

  const selectedLessonIndex = allLessons.findIndex(
    (lesson) => String(lesson.id) === String(selectedLessonId)
  );

  const selectedLesson =
    selectedLessonIndex >= 0 ? allLessons[selectedLessonIndex] : null;

  const completedCount = allLessons.filter(
    (lesson) => completedLessons[String(lesson.id)]
  ).length;

  const totalLessons = allLessons.length;

  const progressPercentage =
    totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

  const isSelectedLessonCompleted = selectedLesson
    ? Boolean(completedLessons[String(selectedLesson.id)])
    : false;

  function toggleModule(moduleId) {
    setExpandedModules((previous) => ({
      ...previous,
      [moduleId]: !previous[moduleId],
    }));
  }

  function selectLesson(lessonId, moduleId) {
    setSelectedLessonId(lessonId);
    setProgressError("");
    setProgressSuccess("");

    setExpandedModules((previous) => ({
      ...previous,
      [moduleId]: true,
    }));
  }

  function goToPreviousLesson() {
    if (selectedLessonIndex > 0) {
      setSelectedLessonId(allLessons[selectedLessonIndex - 1].id);
      setProgressError("");
      setProgressSuccess("");
    }
  }

  function goToNextLesson() {
    if (selectedLessonIndex < allLessons.length - 1) {
      setSelectedLessonId(allLessons[selectedLessonIndex + 1].id);
      setProgressError("");
      setProgressSuccess("");
    }
  }

  async function markLessonComplete() {
    if (!selectedLesson || !isStudent || progressLoading) return;

    const lessonId = selectedLesson.id;

    setProgressLoading(true);
    setProgressError("");
    setProgressSuccess("");

    try {
      const response = await apiRequest(
        `/lessons/${lessonId}/progress`,
        "PUT",
        { completed: true }
      );

      const savedAsCompleted = Boolean(
        response?.completed ?? response?.isCompleted ?? true
      );

      setCompletedLessons((previous) => ({
        ...previous,
        [String(lessonId)]: savedAsCompleted,
      }));

      setProgressSuccess(
        "Lesson completed successfully. Your course progress has been saved."
      );
    } catch (requestError) {
      if (requestError.status === 401) {
        localStorage.removeItem("nexoraToken");
        localStorage.removeItem("nexoraUser");
        navigate("/login", { replace: true });
        return;
      }

      setProgressError(requestError.message);
    } finally {
      setProgressLoading(false);
    }
  }

  function attendExam(exam) {
    if (!exam?.id || !isStudent) return;

    navigate("/dashboard", {
      state: {
        startExamId: exam.id,
        returnTo: `/learn/${courseId}`,
      },
    });
  }

  const youtubeEmbedUrl = getYouTubeEmbedUrl(
    selectedLesson?.videoUrl
  );

  const isDirectVideo =
    selectedLesson?.videoUrl &&
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(selectedLesson.videoUrl);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-slate-200" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="h-[520px] rounded-2xl bg-white shadow-sm" />
            <div className="space-y-6">
              <div className="h-14 rounded-xl bg-slate-200" />
              <div className="aspect-video rounded-2xl bg-slate-200" />
              <div className="h-48 rounded-2xl bg-white" />
            </div>
          </div>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Preparing your learning experience...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <CircleAlert className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Unable to open course
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {error}
          </p>

          <Link
            to="/dashboard"
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Learning Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/dashboard"
              aria-label="Back to dashboard"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 sm:text-xs">
                Nexora Learning
              </p>
              <h1 className="mt-0.5 truncate text-sm font-extrabold text-slate-900 sm:text-base">
                {course?.title || "Course Learning"}
              </h1>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Course Content
              </p>
              <p className="text-sm font-bold text-slate-800">
                {modules.length} Modules · {totalLessons} Lessons
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Course Curriculum Sidebar */}
        <aside className="border-b border-slate-200 bg-white lg:min-h-[calc(100vh-69px)] lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 bg-gradient-to-br from-white to-slate-50 px-5 py-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
              <BookOpenCheck className="h-4 w-4" />
              Course Curriculum
            </div>

            <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900">
              Learning Modules
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Follow the curriculum and complete each lesson at your own pace.
            </p>

            {isStudent && (
              <div className="mt-6 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Your Progress
                    </span>
                  </div>

                  <span className="text-lg font-black tabular-nums text-indigo-600">
                    {progressPercentage}%
                  </span>
                </div>

                <div
                  className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label="Course completion progress"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">
                    Lessons completed
                  </span>
                  <span className="font-bold text-slate-700">
                    {completedCount} / {totalLessons}
                  </span>
                </div>
              </div>
            )}
          </div>

          {modules.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BookOpen className="h-7 w-7" />
              </div>

              <h3 className="mt-4 font-bold text-slate-800">
                No Modules Available
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Course lessons will appear here once the instructor adds them.
              </p>
            </div>
          ) : (
            <div className="max-h-[55vh] space-y-3 overflow-y-auto p-3 lg:max-h-[calc(100vh-260px)]">
              {modules.map((module, moduleIndex) => {
                const isExpanded = Boolean(expandedModules[module.id]);

                const moduleCompleted = module.lessons.filter(
                  (lesson) => completedLessons[String(lesson.id)]
                ).length;

                return (
                  <div
                    key={module.id}
                    className={`overflow-hidden rounded-xl border transition ${
                      isExpanded
                        ? "border-indigo-200 shadow-sm"
                        : "border-slate-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      aria-expanded={isExpanded}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition ${
                        isExpanded
                          ? "bg-indigo-50/70"
                          : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                            isExpanded
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {String(moduleIndex + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {module.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {module.lessons.length} Lessons
                            {isStudent && module.lessons.length > 0
                              ? ` · ${moduleCompleted} completed`
                              : ""}
                          </p>
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 shrink-0 text-indigo-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-white p-2">
                        {module.lessons.length === 0 ? (
                          <p className="px-3 py-4 text-xs text-slate-500">
                            No lessons in this module yet.
                          </p>
                        ) : (
                          module.lessons.map((lesson) => {
                            const isSelected =
                              String(lesson.id) === String(selectedLessonId);

                            const isCompleted = Boolean(
                              completedLessons[String(lesson.id)]
                            );

                            return (
                              <button
                                key={lesson.id}
                                type="button"
                                onClick={() =>
                                  selectLesson(lesson.id, module.id)
                                }
                                aria-current={isSelected ? "true" : undefined}
                                className={`mb-1 flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition last:mb-0 ${
                                  isSelected
                                    ? "bg-indigo-50 ring-1 ring-inset ring-indigo-100"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <span
                                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                    isCompleted
                                      ? "bg-emerald-100 text-emerald-700"
                                      : isSelected
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    <PlayCircle className="h-4 w-4" />
                                  )}
                                </span>

                                <span className="min-w-0 flex-1">
                                  <span
                                    className={`block text-sm font-semibold leading-5 ${
                                      isSelected
                                        ? "text-indigo-700"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {lesson.title}
                                  </span>

                                  {lesson.duration > 0 && (
                                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500">
                                      <Clock3 className="h-3 w-3" />
                                      {lesson.duration} minutes
                                    </span>
                                  )}

                                  {isCompleted && (
                                    <span className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-emerald-600">
                                      Completed
                                    </span>
                                  )}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* Main Learning Area */}
        <main className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-9">
          {/* Course Exams */}
          {isStudent && (
            <section className="mx-auto mb-8 max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <ClipboardList className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600 sm:text-xs">
                      Course Assessment
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                      Available Exams
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Attend the published exams for this course.
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                  <ClipboardList className="h-3.5 w-3.5" />
                  {exams.length} {exams.length === 1 ? "Exam" : "Exams"}
                </span>
              </div>

              <div className="p-5 sm:p-7">
                {examsLoading ? (
                  <div className="flex items-center justify-center gap-3 py-8">
                    <span className="h-6 w-6 animate-spin rounded-full border-3 border-indigo-100 border-t-indigo-600" />
                    <span className="text-sm font-medium text-slate-500">
                      Loading course exams...
                    </span>
                  </div>
                ) : examsError ? (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                    <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                    {examsError}
                  </div>
                ) : exams.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <ClipboardList className="h-7 w-7" />
                    </div>

                    <h3 className="mt-4 font-bold text-slate-800">
                      No Published Exams Yet
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Published exams for this course will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {exams.map((exam) => (
                      <article
                        key={exam.id}
                        className="flex flex-col rounded-xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FileText className="h-5 w-5" />
                          </div>

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Published
                          </span>
                        </div>

                        <h3 className="mt-4 text-base font-extrabold leading-6 text-slate-900">
                          {exam.title}
                        </h3>

                        {exam.description && (
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                            {exam.description}
                          </p>
                        )}

                        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
                          <Clock3 className="h-4 w-4 text-indigo-500" />
                          {exam.durationMinutes} minutes
                        </div>

                        <button
                          type="button"
                          onClick={() => attendExam(exam)}
                          className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                        >
                          Attend Exam
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {selectedLesson ? (
            <div className="mx-auto max-w-5xl">
              {/* Lesson Heading */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-indigo-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{selectedLesson.moduleTitle}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-400">
                    Lesson {selectedLessonIndex + 1}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                      {selectedLesson.title}
                    </h2>

                    {selectedLesson.description && (
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                        {selectedLesson.description}
                      </p>
                    )}
                  </div>

                  {isSelectedLessonCompleted && (
                    <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Video Player */}
              {youtubeEmbedUrl ? (
                <div className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg shadow-slate-300/40">
                  <div className="aspect-video">
                    <iframe
                      src={youtubeEmbedUrl}
                      title={selectedLesson.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : isDirectVideo ? (
                <div className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg shadow-slate-300/40">
                  <video
                    key={selectedLesson.videoUrl}
                    controls
                    className="aspect-video w-full"
                  >
                    <source src={selectedLesson.videoUrl} />
                    Your browser does not support video playback.
                  </video>
                </div>
              ) : selectedLesson.videoUrl ? (
                <div className="mb-7 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">
                      Video format not supported
                    </p>
                    <p className="mt-1">
                      This video URL format cannot be displayed in the embedded player.
                      <a
                        href={selectedLesson.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1 font-bold underline underline-offset-2"
                      >
                        Open video
                      </a>
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Lesson Content */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      <FileText className="h-5 w-5" />
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
                      Lesson Content
                    </h3>
                  </div>

                  {selectedLesson.duration > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                      <Clock3 className="h-3.5 w-3.5 text-indigo-500" />
                      {selectedLesson.duration} minutes
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-7">
                  {selectedLesson.content ? (
                    <div className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-700 sm:text-base">
                      {selectedLesson.content}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <FileText className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-3 text-sm text-slate-500">
                        No written content is available for this lesson.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Lesson Completion */}
              {isStudent && (
                <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isSelectedLessonCompleted
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {isSelectedLessonCompleted ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <GraduationCap className="h-6 w-6" />
                        )}
                      </div>

                      <div>
                        <h3 className="font-extrabold text-slate-900">
                          Lesson Completion
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Mark this lesson as complete after finishing the content.
                        </p>
                      </div>
                    </div>

                    {isSelectedLessonCompleted ? (
                      <span className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Lesson Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={markLessonComplete}
                        disabled={progressLoading}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {progressLoading ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Saving Progress...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Mark as Complete
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {(progressError || progressSuccess) && (
                    <div className="px-5 pb-5 sm:px-6">
                      {progressError && (
                        <p
                          role="alert"
                          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                        >
                          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                          {progressError}
                        </p>
                      )}

                      {progressSuccess && (
                        <p
                          role="status"
                          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          {progressSuccess}
                        </p>
                      )}
                    </div>
                  )}

                  {completedCount === totalLessons && totalLessons > 0 && (
                    <div className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:mx-6">
                      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <p className="text-sm font-semibold leading-6 text-emerald-700">
                        Congratulations! You have completed all lessons in this course.
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* Lesson Navigation */}
              <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={goToPreviousLesson}
                  disabled={selectedLessonIndex <= 0}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous Lesson
                </button>

                <button
                  type="button"
                  onClick={goToNextLesson}
                  disabled={
                    selectedLessonIndex < 0 ||
                    selectedLessonIndex >= allLessons.length - 1
                  }
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-indigo-600"
                >
                  Next Lesson
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                <BookOpen className="h-3.5 w-3.5" />
                Lesson {selectedLessonIndex + 1} of {allLessons.length}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12">
              <div className="max-w-md text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <BookOpen className="h-8 w-8" />
                </div>

                <h2 className="mt-5 text-xl font-extrabold text-slate-900">
                  No Lesson Selected
                </h2>

                <p className="mt-2 text-sm leading-7 text-slate-500">
                  {modules.length === 0
                    ? "There are no modules available in this course yet."
                    : "Select a lesson from the course curriculum to begin learning."}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default StudentLearning;
