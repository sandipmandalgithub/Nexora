import { useEffect, useState } from "react";
import axios from "axios";
import CourseList from "./CourseList";

const API_BASE_URL = "http://localhost:8080/api";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "My Courses" },
  { id: "available", label: "Available Courses" },
  { id: "results", label: "My Results" },
  { id: "profile", label: "Profile" },
];

function getErrorMessage(error) {
  if (!error.response) {
    return "Cannot connect to the server. Please check that the backend is running.";
  }

  if (error.response.status === 401) {
    return "Your session may have expired. Please sign in again.";
  }

  if (error.response.status === 403) {
    return "You do not have permission to view this information.";
  }

  return (
    error.response.data?.message ||
    "Unable to load this information. Please try again."
  );
}

function getCourseFromEnrollment(enrollment) {
  return (
    enrollment?.course ??
    enrollment?.courseResponse ??
    enrollment?.courseDetails ??
    null
  );
}

function getCourseTitle(enrollment) {
  const course = getCourseFromEnrollment(enrollment);

  return (
    course?.title ??
    enrollment?.courseTitle ??
    enrollment?.title ??
    "Course"
  );
}

function getEnrollmentId(enrollment, index) {
  return (
    enrollment?.id ??
    enrollment?.enrollmentId ??
    `${getCourseTitle(enrollment)}-${index}`
  );
}

function getAttemptId(attempt, index) {
  return attempt?.id ?? attempt?.attemptId ?? `attempt-${index}`;
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function SummaryCard({ label, value, description, icon }) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-700">
          {icon}
        </span>
      </div>

      <p className="mt-3 break-words text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold tracking-[0.16em] text-indigo-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
        {title}
      </h2>

      {description && (
        <p className="mt-2 break-words text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [enrollments, setEnrollments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [exams, setExams] = useState([]);

  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  const [attemptLoading, setAttemptLoading] = useState(true);
  const [examLoading, setExamLoading] = useState(true);

  const [enrollmentError, setEnrollmentError] = useState("");
  const [attemptError, setAttemptError] = useState("");
  const [examError, setExamError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("nexoraToken");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    async function loadEnrollments() {
      setEnrollmentLoading(true);
      setEnrollmentError("");

      try {
        const response = await axios.get(
          `${API_BASE_URL}/enrollments/my`,
          { headers }
        );

        if (isMounted) {
          setEnrollments(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (error) {
        if (isMounted) {
          setEnrollmentError(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setEnrollmentLoading(false);
        }
      }
    }

    async function loadAttempts() {
      setAttemptLoading(true);
      setAttemptError("");

      try {
        const response = await axios.get(
          `${API_BASE_URL}/exam-attempts/my`,
          { headers }
        );

        if (isMounted) {
          setAttempts(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (error) {
        if (isMounted) {
          setAttemptError(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setAttemptLoading(false);
        }
      }
    }

    async function loadExams() {
      setExamLoading(true);
      setExamError("");

      try {
        const response = await axios.get(`${API_BASE_URL}/exams`, {
          headers,
        });

        if (isMounted) {
          const examList = Array.isArray(response.data)
            ? response.data
            : [];

          setExams(
            examList.filter((exam) => exam?.published === true)
          );
        }
      } catch (error) {
        if (isMounted) {
          setExamError(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setExamLoading(false);
        }
      }
    }

    loadEnrollments();
    loadAttempts();
    loadExams();

    return () => {
      isMounted = false;
    };
  }, []);

  const firstName = user.fullName?.trim()?.split(/\s+/)[0] || "Learner";

  function renderTabContent() {
    if (activeTab === "overview") {
      return (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              label="My Courses"
              value={
                enrollmentLoading ? "…" : enrollments.length
              }
              description="Courses associated with your account"
              icon="📚"
            />

            <SummaryCard
              label="Available Exams"
              value={examLoading ? "…" : exams.length}
              description="Published exams currently listed by Nexora"
              icon="🎯"
            />

            <SummaryCard
              label="My Exam Attempts"
              value={attemptLoading ? "…" : attempts.length}
              description="Exam attempts recorded for your account"
              icon="📊"
            />
          </section>

          {(enrollmentError || attemptError || examError) && (
            <section
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
              role="status"
            >
              Some dashboard information could not be loaded. Check the
              relevant section below for details.
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionHeading
              eyebrow="YOUR LEARNING JOURNEY"
              title={`Welcome back, ${firstName}!`}
              description="Your Nexora learning workspace brings your courses and exam activity together."
            />

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setActiveTab("courses")}
                className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <span className="text-lg">📘</span>
                <span className="mt-2 block text-sm font-bold text-slate-900">
                  My Courses
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  View your enrollments
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("available")}
                className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <span className="text-lg">🔎</span>
                <span className="mt-2 block text-sm font-bold text-slate-900">
                  Explore Courses
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Browse available courses
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("results")}
                className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <span className="text-lg">📝</span>
                <span className="mt-2 block text-sm font-bold text-slate-900">
                  Exam Activity
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Review your attempts
                </span>
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading
                eyebrow="LEARNING"
                title="My Courses"
                description="A quick look at your enrolled courses."
              />

              {enrollmentLoading ? (
                <p className="mt-4 text-sm text-slate-500" role="status">
                  Loading your courses…
                </p>
              ) : enrollmentError ? (
                <p className="mt-4 text-sm leading-6 text-red-700" role="alert">
                  {enrollmentError}
                </p>
              ) : enrollments.length === 0 ? (
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  You have not enrolled in a course yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {enrollments.slice(0, 3).map((enrollment, index) => (
                    <li
                      key={getEnrollmentId(enrollment, index)}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <p className="break-words text-sm font-bold text-slate-900">
                        {getCourseTitle(enrollment)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("courses")}
                className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800"
              >
                View my courses →
              </button>
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading
                eyebrow="ASSESSMENTS"
                title="Recent Exam Activity"
                description="Your latest recorded exam attempts."
              />

              {attemptLoading ? (
                <p className="mt-4 text-sm text-slate-500" role="status">
                  Loading exam activity…
                </p>
              ) : attemptError ? (
                <p className="mt-4 text-sm leading-6 text-red-700" role="alert">
                  {attemptError}
                </p>
              ) : attempts.length === 0 ? (
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  No exam attempts have been recorded yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {attempts.slice(0, 3).map((attempt, index) => (
                    <li
                      key={getAttemptId(attempt, index)}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <p className="break-words text-sm font-bold text-slate-900">
                        {attempt.examTitle ??
                          attempt.examName ??
                          attempt.exam?.title ??
                          `Exam attempt #${attempt.id ?? index + 1}`}
                      </p>

                      <p className="mt-1 break-words text-xs text-slate-500">
                        Status: {formatValue(attempt.status)}
                        {attempt.score !== undefined &&
                          ` · Score: ${attempt.score}`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("results")}
                className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800"
              >
                View my results →
              </button>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "courses") {
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            eyebrow="YOUR LEARNING"
            title="My Courses"
            description="Courses associated with your student account."
          />

          {enrollmentLoading ? (
            <p className="mt-5 text-sm text-slate-500" role="status">
              Loading your enrollments…
            </p>
          ) : enrollmentError ? (
            <p className="mt-5 text-sm leading-6 text-red-700" role="alert">
              {enrollmentError}
            </p>
          ) : enrollments.length === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              You have not enrolled in any courses yet. Open Available
              Courses to explore the current catalogue.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {enrollments.map((enrollment, index) => {
                const course = getCourseFromEnrollment(enrollment);

                return (
                  <article
                    key={getEnrollmentId(enrollment, index)}
                    className="min-w-0 rounded-xl border border-slate-200 p-4 sm:p-5"
                  >
                    <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {course?.category ??
                        enrollment.category ??
                        "Enrolled course"}
                    </span>

                    <h3 className="mt-3 break-words text-lg font-extrabold text-slate-900">
                      {getCourseTitle(enrollment)}
                    </h3>

                    <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                      {course?.description ??
                        enrollment.courseDescription ??
                        "Course details are not available in the enrollment response."}
                    </p>

                    <p className="mt-3 break-words text-xs text-slate-500">
                      Enrollment status:{" "}
                      {formatValue(enrollment.status)}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      );
    }

    if (activeTab === "available") {
      return <CourseList />;
    }

    if (activeTab === "results") {
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            eyebrow="ASSESSMENTS"
            title="My Results"
            description="Exam attempts returned by your authenticated account."
          />

          {attemptLoading ? (
            <p className="mt-5 text-sm text-slate-500" role="status">
              Loading your results…
            </p>
          ) : attemptError ? (
            <p className="mt-5 text-sm leading-6 text-red-700" role="alert">
              {attemptError}
            </p>
          ) : attempts.length === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              No exam attempts or results are available yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {attempts.map((attempt, index) => (
                <article
                  key={getAttemptId(attempt, index)}
                  className="min-w-0 rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <h3 className="break-words font-bold text-slate-900">
                        {attempt.examTitle ??
                          attempt.examName ??
                          attempt.exam?.title ??
                          `Exam attempt #${attempt.id ?? index + 1}`}
                      </h3>

                      <p className="mt-2 break-words text-sm text-slate-500">
                        Status: {formatValue(attempt.status)}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl bg-indigo-50 px-4 py-3 sm:text-right">
                      <p className="text-xs font-semibold text-indigo-700">
                        Score
                      </p>

                      <p className="mt-1 text-xl font-black text-indigo-950">
                        {formatValue(attempt.score)}
                        {attempt.totalMarks !== undefined &&
                          ` / ${attempt.totalMarks}`}
                      </p>
                    </div>
                  </div>

                  {attempt.startedAt && (
                    <p className="mt-3 break-words text-xs text-slate-500">
                      Started: {String(attempt.startedAt)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      );
    }

    if (activeTab === "profile") {
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeading
            eyebrow="YOUR ACCOUNT"
            title="Profile"
            description="Account details saved when you signed in."
          />

          <dl className="mt-5 divide-y divide-slate-100">
            <div className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-4">
              <dt className="text-sm font-semibold text-slate-500">
                Full name
              </dt>
              <dd className="break-words text-sm font-bold text-slate-900">
                {formatValue(user.fullName)}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-4">
              <dt className="text-sm font-semibold text-slate-500">
                Email address
              </dt>
              <dd className="break-words text-sm font-bold text-slate-900">
                {formatValue(user.email)}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-4">
              <dt className="text-sm font-semibold text-slate-500">
                Role
              </dt>
              <dd className="break-words text-sm font-bold text-slate-900">
                {formatValue(user.role)}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={onLogout}
            className="mt-4 min-h-11 rounded-xl bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            Sign out
          </button>
        </section>
      );
    }

    return null;
  }

  return (
    <div className="space-y-5 sm:space-y-7">
      <section className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-lg sm:rounded-3xl">
        <div className="flex flex-col justify-between gap-5 p-5 sm:p-7 md:flex-row md:items-center md:p-9">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.18em] text-indigo-300 sm:text-sm">
              STUDENT WORKSPACE
            </p>

            <h1 className="mt-3 break-words text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
              Welcome back, {firstName}!
            </h1>

            <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-slate-300 sm:text-base">
              Keep learning, explore courses, and review your examination
              activity from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="min-h-11 shrink-0 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </section>

      <nav
        aria-label="Student dashboard sections"
        className="flex min-w-0 gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? "page" : undefined}
            className={`shrink-0 rounded-xl px-3 py-3 text-sm font-bold transition sm:px-4 ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {renderTabContent()}

      <p className="break-words text-xs leading-6 text-slate-500">
        Signed in as {user.email || "your account"} · Role:{" "}
        {user.role || "STUDENT"}
      </p>
    </div>
  );
}

export default StudentDashboard;
