
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (parsedUrl.pathname === "/watch") {
        const videoId = parsedUrl.searchParams.get("v");
        return videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : null;
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        return url;
      }

      if (parsedUrl.pathname.startsWith("/shorts/")) {
        const videoId = parsedUrl.pathname.split("/")[2];
        return videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : null;
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

      try {
        const [courseData, moduleData] = await Promise.all([
          apiRequest(`/courses/${courseId}`),
          apiRequest(`/courses/${courseId}/modules`),
        ]);

        const modulesWithLessons = await Promise.all(
          moduleData.map(async (module) => {
            const lessons = await apiRequest(
              `/modules/${module.id}/lessons`
            );

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

        // Load saved lesson completion status for students.
        if (isStudent) {
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

  const youtubeEmbedUrl = getYouTubeEmbedUrl(
    selectedLesson?.videoUrl
  );

  const isDirectVideo =
    selectedLesson?.videoUrl &&
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(selectedLesson.videoUrl);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading your learning content...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
            !
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Unable to Open Course
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {error}
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              ← Dashboard
            </Link>

            <h1 className="mt-1 truncate text-base font-bold text-slate-900 sm:text-lg">
              {course?.title || "Course Learning"}
            </h1>
          </div>

          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-xs text-slate-500">Course Content</p>
            <p className="text-sm font-semibold text-slate-800">
              {modules.length} Modules · {totalLessons} Lessons
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white lg:min-h-[calc(100vh-69px)] lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 px-5 py-5">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Course Curriculum
            </p>

            <h2 className="mt-2 text-lg font-bold text-slate-900">
              Learning Modules
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a lesson to start learning.
            </p>

            {isStudent && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">
                    Course Progress
                  </span>
                  <span className="font-bold text-indigo-600">
                    {progressPercentage}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {completedCount} of {totalLessons} lessons completed
                </p>
              </div>
            )}
          </div>

          {modules.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="text-3xl">📚</div>
              <h3 className="mt-3 font-semibold text-slate-800">
                No Modules Available
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Course lessons will appear here once the instructor adds them.
              </p>
            </div>
          ) : (
            <div className="max-h-[55vh] overflow-y-auto p-3 lg:max-h-[calc(100vh-190px)]">
              {modules.map((module, moduleIndex) => {
                const isExpanded = Boolean(expandedModules[module.id]);

                return (
                  <div
                    key={module.id}
                    className="mb-2 overflow-hidden rounded-xl border border-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                          {moduleIndex + 1}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {module.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {module.lessons.length} Lessons
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-slate-500">
                        {isExpanded ? "−" : "+"}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-200 p-2">
                        {module.lessons.length === 0 ? (
                          <p className="px-3 py-3 text-xs text-slate-500">
                            No lessons in this module yet.
                          </p>
                        ) : (
                          module.lessons.map((lesson, lessonIndex) => {
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
                                className={`mb-1 flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition last:mb-0 ${
                                  isSelected
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <span
                                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                    isCompleted
                                      ? "bg-green-100 text-green-700"
                                      : isSelected
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {isCompleted ? "✓" : lessonIndex + 1}
                                </span>

                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-medium leading-5">
                                    {lesson.title}
                                  </span>

                                  {lesson.duration > 0 && (
                                    <span className="mt-1 block text-xs text-slate-500">
                                      {lesson.duration} minutes
                                    </span>
                                  )}

                                  {isCompleted && (
                                    <span className="mt-1 block text-xs font-semibold text-green-600">
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

        <main className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {selectedLesson ? (
            <div className="mx-auto max-w-5xl">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  {selectedLesson.moduleTitle}
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {selectedLesson.title}
                </h2>

                {selectedLesson.description && (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                    {selectedLesson.description}
                  </p>
                )}
              </div>

              {youtubeEmbedUrl ? (
                <div className="mb-7 overflow-hidden rounded-2xl bg-black shadow-sm">
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
                <div className="mb-7 overflow-hidden rounded-2xl bg-black shadow-sm">
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
                <div className="mb-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  This video URL format is not supported by the embedded player.
                  <a
                    href={selectedLesson.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 font-semibold underline"
                  >
                    Open video
                  </a>
                </div>
              ) : null}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Lesson Content
                  </h3>

                  {selectedLesson.duration > 0 && (
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {selectedLesson.duration} minutes
                    </span>
                  )}
                </div>

                {selectedLesson.content ? (
                  <div className="whitespace-pre-wrap break-words pt-5 text-sm leading-8 text-slate-700 sm:text-base">
                    {selectedLesson.content}
                  </div>
                ) : (
                  <p className="pt-5 text-sm text-slate-500">
                    No written content is available for this lesson.
                  </p>
                )}
              </section>

              {isStudent && (
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Lesson Completion
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Mark this lesson as complete after finishing the content.
                      </p>
                    </div>

                    {isSelectedLessonCompleted ? (
                      <span className="inline-flex items-center justify-center rounded-xl bg-green-50 px-5 py-3 text-sm font-semibold text-green-700">
                        ✓ Lesson Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={markLessonComplete}
                        disabled={progressLoading}
                        className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {progressLoading
                          ? "Saving Progress..."
                          : "Mark as Complete"}
                      </button>
                    )}
                  </div>

                  {progressError && (
                    <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {progressError}
                    </p>
                  )}

                  {progressSuccess && (
                    <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {progressSuccess}
                    </p>
                  )}

                  {completedCount === totalLessons && totalLessons > 0 && (
                    <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                      Congratulations! You have completed all lessons in this course.
                    </p>
                  )}
                </section>
              )}

              <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={goToPreviousLesson}
                  disabled={selectedLessonIndex <= 0}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous Lesson
                </button>

                <button
                  type="button"
                  onClick={goToNextLesson}
                  disabled={
                    selectedLessonIndex < 0 ||
                    selectedLessonIndex >= allLessons.length - 1
                  }
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next Lesson →
                </button>
              </div>

              <p className="mt-5 text-center text-xs text-slate-400">
                Lesson {selectedLessonIndex + 1} of {allLessons.length}
              </p>
            </div>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="max-w-md text-center">
                <div className="text-5xl">📖</div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  No Lesson Selected
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
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
