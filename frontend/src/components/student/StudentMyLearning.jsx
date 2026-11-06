import { Link } from "react-router-dom";

function getCourseProgress(enrollment) {
  const possibleValues = [
    enrollment.progressPercentage,
    enrollment.completionPercentage,
    enrollment.progress,
    enrollment.courseProgress?.percentage,
    enrollment.learningProgress?.percentage,
  ];

  const rawProgress = possibleValues.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value))
  );

  if (rawProgress !== undefined) {
    return Math.min(100, Math.max(0, Number(rawProgress)));
  }

  const completedLessons = Number(
    enrollment.completedLessons ?? enrollment.completedLessonCount
  );
  const totalLessons = Number(
    enrollment.totalLessons ?? enrollment.totalLessonCount
  );

  if (
    Number.isFinite(completedLessons) &&
    Number.isFinite(totalLessons) &&
    totalLessons > 0
  ) {
    return Math.min(
      100,
      Math.max(0, (completedLessons / totalLessons) * 100)
    );
  }

  const status = String(
    enrollment.status || enrollment.enrollmentStatus || ""
  ).toUpperCase();

  if (
    enrollment.completed === true ||
    enrollment.isCompleted === true ||
    ["COMPLETED", "COMPLETE"].includes(status)
  ) {
    return 100;
  }

  return null;
}

export default function StudentMyLearning({
  enrollments = [],
  loading = false,
  error = "",
}) {
  const completedCourses = enrollments.filter(
    (course) => getCourseProgress(course) === 100
  );

  const inProgressCourses = enrollments.filter((course) => {
    const progress = getCourseProgress(course);
    return progress !== null && progress > 0 && progress < 100;
  });

  const notTrackedCourses = enrollments.filter(
    (course) => getCourseProgress(course) === null
  );

  const trackedCourses = enrollments.filter(
    (course) => getCourseProgress(course) !== null
  );

  const averageProgress =
    trackedCourses.length > 0
      ? Math.round(
          trackedCourses.reduce(
            (total, course) => total + getCourseProgress(course),
            0
          ) / trackedCourses.length
        )
      : null;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-5">
        <p className="text-sm font-semibold text-red-700">
          Unable to load your learning information. {error}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Loading your learning journey...
        </p>
      </div>
    );
  }

  return (
    <section className="min-w-0 space-y-6">
      {/* Learning Overview */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-5 text-white shadow-lg shadow-indigo-200/40 sm:p-8">
        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-indigo-100">
          YOUR LEARNING JOURNEY
        </span>

        <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
          Keep moving forward!
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
          Track your enrolled courses and continue learning from where you
          left off.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs font-semibold text-indigo-100">
              Enrolled Courses
            </p>
            <p className="mt-2 text-2xl font-black">
              {enrollments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs font-semibold text-indigo-100">
              Completed
            </p>
            <p className="mt-2 text-2xl font-black">
              {completedCourses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs font-semibold text-indigo-100">
              In Progress
            </p>
            <p className="mt-2 text-2xl font-black">
              {inProgressCourses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs font-semibold text-indigo-100">
              Average Progress
            </p>
            <p className="mt-2 text-2xl font-black">
              {averageProgress === null ? "—" : `${averageProgress}%`}
            </p>
          </div>
        </div>
      </div>

      {/* Course Progress Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-600">
              Completed Courses
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
              ✓
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-emerald-700">
            {completedCourses.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Courses with 100% progress
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-600">
              In Progress
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
              ↗
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-indigo-700">
            {inProgressCourses.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Courses currently being learned
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-600">
              Progress Not Tracked
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
              ◷
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-amber-600">
            {notTrackedCourses.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Courses without available progress data
          </p>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            Your Learning Courses
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Continue your enrolled courses and track the available progress.
          </p>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
              📚
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">
              Your learning journey starts here
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You have not enrolled in any courses yet. Once you enroll, your
              courses will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {enrollments.map((course) => {
              const progress = getCourseProgress(course);
              const isCompleted = progress === 100;

              return (
                <article
                  key={course.enrollmentId ?? course.courseId}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="max-w-full rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {course.category || "General"}
                    </span>

                    {isCompleted ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Completed
                      </span>
                    ) : progress !== null && progress > 0 ? (
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        In Progress
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {progress === 0 ? "Not Started" : "Enrolled"}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 break-words text-lg font-extrabold text-slate-900">
                    {course.courseTitle || `Course #${course.courseId}`}
                  </h3>

                  <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                    {course.courseDescription ||
                      "Continue exploring the learning materials in this course."}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-500">
                        Learning Progress
                      </span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {progress === null ? "Not available" : `${Math.round(progress)}%`}
                      </span>
                    </div>

                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-label={`${course.courseTitle || "Course"} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress === null ? undefined : Math.round(progress)}
                    >
                      {progress !== null && (
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCompleted ? "bg-emerald-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-xs text-slate-500">
                    <p>
                      Instructor: {course.instructorName || "Nexora Team"}
                    </p>
                    {course.enrolledAt && (
                      <p>
                        Enrolled: {String(course.enrolledAt).slice(0, 10)}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/learn/${course.courseId}`}
                    className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                  >
                    {isCompleted ? "Review Course" : "Continue Learning"}
                    <span aria-hidden="true">→</span>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}