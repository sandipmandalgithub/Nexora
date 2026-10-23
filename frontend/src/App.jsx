
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import Home from "./Home";
import AdminCourseManagement from "./components/AdminCourseManagement";

const API_BASE_URL = "http://localhost:8080/api";

function AuthLayout({ children, subtitle, title }) {
  return (
    <main className="relative flex min-h-[calc(100vh-76px)] items-center justify-center overflow-hidden bg-slate-50 px-3 py-7 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[460px] min-w-0">
        <div className="mb-5 text-center sm:mb-7">
          <Link
            to="/"
            className="inline-flex max-w-full items-center justify-center gap-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white shadow-lg shadow-indigo-600/20 sm:h-11 sm:w-11">
              N
            </span>
            <span>
              Nexora<span className="text-indigo-500">.</span>
            </span>
          </Link>

          <p className="mx-auto mt-3 max-w-sm break-words text-sm leading-6 text-slate-500 sm:mt-4">
            {subtitle}
          </p>
        </div>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 sm:rounded-3xl sm:p-8">
          <div className="mb-5 sm:mb-7">
            <h1 className="break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your learning journey starts here.
            </p>
          </div>

          {children}
        </section>

        <p className="mx-auto mt-5 max-w-sm break-words px-1 text-center text-xs leading-5 text-slate-500 sm:mt-6">
          © {new Date().getFullYear()} Nexora. Built for lifelong learning.
        </p>
      </div>
    </main>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:px-4"
      />
    </div>
  );
}

function AlertMessage({ message, type = "error" }) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`mb-5 min-w-0 break-words rounded-xl border px-3 py-3 text-sm leading-6 sm:px-4 ${styles}`}
    >
      {message}
    </div>
  );
}

function getApiError(error) {
  if (!error.response) {
    return "Cannot connect to the Nexora server. Make sure the Spring Boot backend is running on port 8080.";
  }

  const data = error.response.data;

  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;

  if (data?.errors && typeof data.errors === "object") {
    return Object.values(data.errors).flat().join(" ");
  }

  if (error.response.status === 400) {
    return "Please check your details and try again.";
  }

  if (error.response.status === 401) {
    return "Your session may have expired. Please sign in again.";
  }

  if (error.response.status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (error.response.status === 409) {
    return "An account with these details may already exist.";
  }

  return "Something went wrong. Please try again.";
}

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();

    if (!email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password: form.password,
      });

      const data = response.data;
      const accessToken = data?.accessToken || data?.token || data?.jwt;

      if (!accessToken) {
        setError(
          "Login response did not contain an access token. Please check the backend login response."
        );
        return;
      }

      const user = {
        id: data?.id ?? data?.user?.id ?? null,
        fullName:
          data?.fullName ??
          data?.name ??
          data?.user?.fullName ??
          data?.user?.name ??
          "",
        email: data?.email ?? data?.user?.email ?? email,
        role: String(data?.role ?? data?.user?.role ?? "STUDENT").toUpperCase(),
      };

      localStorage.setItem("nexoraToken", accessToken);
      localStorage.setItem("nexoraUser", JSON.stringify(user));

      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue your learning journey with Nexora"
    >
      <AlertMessage message={error} />

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <FormField
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <div className="min-w-0">
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Password
          </label>

          <div className="relative min-w-0">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 pr-20 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:px-4"
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 sm:right-3"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-base"
        >
          {loading ? "Signing in..." : "Sign in to Nexora"}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <div className="my-5 flex min-w-0 items-center gap-2 sm:my-6 sm:gap-3">
        <div className="h-px min-w-0 flex-1 bg-slate-200" />
        <span className="shrink-0 text-center text-[10px] font-medium tracking-wide text-slate-400 sm:text-xs">
          NEW TO NEXORA?
        </span>
        <div className="h-px min-w-0 flex-1 bg-slate-200" />
      </div>

      <p className="text-center text-sm leading-6 text-slate-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-extrabold text-indigo-600 hover:text-indigo-800"
        >
          Create account
        </Link>
      </p>

      <Link
        to="/"
        className="mt-4 block text-center text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        ← Back to home
      </Link>
    </AuthLayout>
  );
}

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();

    if (!fullName || !email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        fullName,
        email,
        password: form.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess: true,
          email,
        },
      });
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start learning, practicing, and growing with Nexora"
    >
      <AlertMessage message={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          autoComplete="name"
        />

        <FormField
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <div className="min-w-0">
          <label
            htmlFor="register-password"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Password
          </label>

          <div className="relative min-w-0">
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
              className="min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 pr-20 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:px-4"
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 sm:right-3"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Use at least 8 characters. Your password will be handled by the
            backend.
          </p>
        </div>

        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Enter your password again"
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-base"
        >
          {loading ? "Creating account..." : "Create account"}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <p className="mt-5 text-center text-sm leading-6 text-slate-600 sm:mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-extrabold text-indigo-600 hover:text-indigo-800"
        >
          Sign in
        </Link>
      </p>

      <Link
        to="/"
        className="mt-4 block text-center text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        ← Back to home
      </Link>
    </AuthLayout>
  );
}

function StatCard({ icon, label, value, description }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 break-words text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
          {icon}
        </span>
      </div>
    </section>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center sm:px-6">
      <span className="text-3xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-3 text-base font-extrabold text-slate-900">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  const [enrollments, setEnrollments] = useState([]);
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const [startingExamId, setStartingExamId] = useState(null);
  const [examActionError, setExamActionError] = useState("");
  const [examSession, setExamSession] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState("");
  const [answers, setAnswers] = useState({});
  const [submittingExam, setSubmittingExam] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  const token = localStorage.getItem("nexoraToken");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setErrors({});

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const results = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/enrollments/my`, { headers }),
        axios.get(`${API_BASE_URL}/exams`, { headers }),
        axios.get(`${API_BASE_URL}/exam-attempts/my`, { headers }),
      ]);

      if (!active) return;

      const nextErrors = {};

      if (results[0].status === "fulfilled") {
        setEnrollments(
          Array.isArray(results[0].value.data)
            ? results[0].value.data
            : []
        );
      } else {
        nextErrors.courses = getApiError(results[0].reason);
      }

      if (results[1].status === "fulfilled") {
        const data = results[1].value.data;
        const examList = Array.isArray(data) ? data : [];

        setExams(examList.filter((exam) => exam.published === true));
      } else {
        nextErrors.exams = getApiError(results[1].reason);
      }

      if (results[2].status === "fulfilled") {
        setAttempts(
          Array.isArray(results[2].value.data)
            ? results[2].value.data
            : []
        );
      } else {
        nextErrors.results = getApiError(results[2].reason);
      }

      setErrors(nextErrors);
      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [token, refreshKey]);

  function handleLogout() {
    localStorage.removeItem("nexoraToken");
    localStorage.removeItem("nexoraUser");
    navigate("/login", { replace: true });
  }

  function refreshDashboard() {
    setRefreshKey((key) => key + 1);
  }

  async function loadExamQuestions(examId) {
    setQuestionsLoading(true);
    setQuestionsError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/student/exams/${examId}/questions`,
        { headers: authHeaders }
      );

      setExamSession((current) => {
        if (!current || String(current.exam.id) !== String(examId)) {
          return current;
        }

        return {
          ...current,
          questions: Array.isArray(response.data) ? response.data : [],
        };
      });
    } catch (error) {
      setQuestionsError(getApiError(error));
    } finally {
      setQuestionsLoading(false);
    }
  }

  async function handleStartExam(exam) {
    if (startingExamId !== null || examSession) return;

    setStartingExamId(exam.id);
    setExamActionError("");
    setQuestionsError("");
    setSubmissionError("");
    setSubmissionResult(null);
    setAnswers({});
    setShowSubmitConfirmation(false);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/exam-attempts/exams/${exam.id}/start`,
        {},
        { headers: authHeaders }
      );

      const attempt = response.data;

      if (attempt?.id == null) {
        setExamActionError(
          "The server did not return an attempt ID. Check the start-attempt API response."
        );
        return;
      }

      setExamSession({
        exam,
        attempt,
        questions: [],
      });

      setActiveTab("Available Exams");

      await loadExamQuestions(exam.id);
    } catch (error) {
      setExamActionError(getApiError(error));
    } finally {
      setStartingExamId(null);
    }
  }

  function handleAnswerChange(questionId, selectedOption) {
    if (submissionResult || submittingExam) return;

    setAnswers((previous) => ({
      ...previous,
      [questionId]: selectedOption,
    }));
  }

  async function handleSubmitExam() {
    if (!examSession || !examSession.attempt?.id || submittingExam) return;

    setSubmittingExam(true);
    setSubmissionError("");
    setShowSubmitConfirmation(false);

    const submittedAnswers = Object.entries(answers)
      .filter(([, selectedOption]) =>
        ["A", "B", "C", "D"].includes(selectedOption)
      )
      .map(([questionId, selectedOption]) => ({
        questionId: Number(questionId),
        selectedOption,
      }));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/exam-attempts/${examSession.attempt.id}/submit`,
        { answers: submittedAnswers },
        { headers: authHeaders }
      );

      setSubmissionResult(response.data);
      refreshDashboard();
    } catch (error) {
      setSubmissionError(getApiError(error));
    } finally {
      setSubmittingExam(false);
    }
  }

  function closeExamSession() {
    setExamSession(null);
    setAnswers({});
    setQuestionsError("");
    setExamActionError("");
    setSubmissionError("");
    setSubmissionResult(null);
    setShowSubmitConfirmation(false);
    refreshDashboard();
  }

  const tabs = [
    { label: "Overview", icon: "⌂" },
    { label: "My Courses", icon: "▤" },
    { label: "Available Exams", icon: "◎" },
    { label: "My Results", icon: "▥" },
    { label: "Profile", icon: "♙" },
  ];

  const completedAttempts = attempts.filter((attempt) =>
    ["SUBMITTED", "COMPLETED", "GRADED"].includes(
      String(attempt.status || "").toUpperCase()
    )
  );

  const firstName = user.fullName?.trim().split(/\s+/)[0] || "Learner";

  function renderCourses(limit) {
    const list =
      typeof limit === "number"
        ? enrollments.slice(0, limit)
        : enrollments;

    if (errors.courses) {
      return (
        <AlertMessage
          message={`Unable to load your courses. ${errors.courses}`}
        />
      );
    }

    if (loading) {
      return (
        <p className="py-6 text-sm text-slate-500" role="status">
          Loading your courses...
        </p>
      );
    }

    if (list.length === 0) {
      return (
        <EmptyState
          icon="📚"
          title="No enrolled courses yet"
          description="When you enroll in a course, it will appear here."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {list.map((item) => (
          <article
            key={item.enrollmentId ?? item.courseId}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md sm:p-5"
          >
            <span className="inline-flex max-w-full rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {item.category || "General"}
            </span>

            <h3 className="mt-4 break-words text-lg font-extrabold text-slate-900">
              {item.courseTitle || `Course #${item.courseId}`}
            </h3>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              {item.courseDescription || "No course description available."}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Instructor: {item.instructorName || "Nexora Team"}
            </p>

            {item.enrolledAt && (
              <p className="mt-1 text-xs text-slate-400">
                Enrolled: {String(item.enrolledAt).slice(0, 10)}
              </p>
            )}
          </article>
        ))}
      </div>
    );
  }

  function renderExams(limit) {
    const list =
      typeof limit === "number" ? exams.slice(0, limit) : exams;

    if (errors.exams) {
      return (
        <AlertMessage
          message={`Unable to load available exams. ${errors.exams}`}
        />
      );
    }

    if (loading) {
      return (
        <p className="py-6 text-sm text-slate-500" role="status">
          Loading available exams...
        </p>
      );
    }

    if (list.length === 0) {
      return (
        <EmptyState
          icon="🎯"
          title="No published exams available"
          description="Published examinations will appear here when they are available."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {list.map((exam) => (
          <article
            key={exam.id}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                Online examination
              </span>

              <span className="text-xs font-semibold text-slate-500">
                {exam.durationMinutes
                  ? `${exam.durationMinutes} minutes`
                  : "Timed assessment"}
              </span>
            </div>

            <h3 className="mt-4 break-words text-lg font-extrabold text-slate-900">
              {exam.title || `Exam #${exam.id}`}
            </h3>

            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
              {exam.description || "Test your knowledge with this examination."}
            </p>

            {exam.courseTitle && (
              <p className="mt-3 text-sm text-slate-500">
                Course: {exam.courseTitle}
              </p>
            )}

            <p className="mt-4 text-xs leading-5 text-slate-400">
              Exam ID: {exam.id}
            </p>

            <button
              type="button"
              onClick={() => handleStartExam(exam)}
              disabled={startingExamId !== null || Boolean(examSession)}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {startingExamId === exam.id
                ? "Starting exam..."
                : "Start Exam →"}
            </button>
          </article>
        ))}
      </div>
    );
  }

  function renderExamResult(result) {
    const score = result.score;
    const totalMarks = result.totalMarks;
    const status = String(result.status || "UNKNOWN");

    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
            ✓
          </span>

          <h2 className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
            Exam submitted successfully
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-slate-500">
            {result.examTitle || examSession?.exam?.title || "Your examination"}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Score
            </p>
            <p className="mt-2 break-words text-2xl font-black text-slate-950">
              {score ?? "—"}
              {totalMarks != null ? ` / ${totalMarks}` : ""}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Status
            </p>
            <p className="mt-2 break-words text-lg font-black text-slate-950">
              {status}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Attempt ID
            </p>
            <p className="mt-2 break-words text-2xl font-black text-slate-950">
              {result.id ?? examSession?.attempt?.id ?? "—"}
            </p>
          </div>
        </div>

        {result.submittedAt && (
          <p className="mt-5 text-center text-xs text-slate-500">
            Submitted: {String(result.submittedAt).replace("T", " ")}
          </p>
        )}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              closeExamSession();
              setActiveTab("My Results");
            }}
            className="min-h-11 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            View My Results
          </button>

          <button
            type="button"
            onClick={() => {
              closeExamSession();
              setActiveTab("Available Exams");
            }}
            className="min-h-11 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Available Exams
          </button>
        </div>
      </section>
    );
  }

  function renderExamSession() {
    if (!examSession) return null;

    if (submissionResult) {
      return renderExamResult(submissionResult);
    }

    const questions = examSession.questions || [];
    const answeredCount = questions.filter(
      (question) => answers[question.id]
    ).length;
    const unansweredCount = Math.max(questions.length - answeredCount, 0);

    return (
      <section className="mx-auto max-w-4xl">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              Exam in progress
            </span>

            <h2 className="mt-3 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {examSession.exam.title || `Exam #${examSession.exam.id}`}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Select one answer for each question, then submit your examination.
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">Attempt ID</p>
            <p className="mt-1 text-lg font-black text-slate-900">
              {examSession.attempt.id}
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Questions</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {questionsLoading ? "…" : questions.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Answered</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">
              {answeredCount}
            </p>
          </div>

          <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 sm:col-span-1">
            <p className="text-xs font-semibold text-slate-500">Unanswered</p>
            <p className="mt-1 text-2xl font-black text-amber-600">
              {questionsLoading ? "…" : unansweredCount}
            </p>
          </div>
        </div>

        {questionsError && (
          <div className="mb-5">
            <AlertMessage message={questionsError} />

            <button
              type="button"
              onClick={() => loadExamQuestions(examSession.exam.id)}
              disabled={questionsLoading}
              className="min-h-10 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50"
            >
              {questionsLoading ? "Loading questions..." : "Retry loading questions"}
            </button>
          </div>
        )}

        {questionsLoading && questions.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading examination questions...
            </p>
          </div>
        )}

        {!questionsLoading && !questionsError && questions.length === 0 && (
          <EmptyState
            icon="📝"
            title="No questions available"
            description="This published exam currently has no questions. Contact your administrator for assistance."
          />
        )}

        {questions.length > 0 && (
          <div className="space-y-5">
            {questions.map((question, index) => {
              const options = [
                ["A", question.optionA],
                ["B", question.optionB],
                ["C", question.optionC],
                ["D", question.optionD],
              ].filter(([, value]) => value != null && String(value).trim() !== "");

              return (
                <article
                  key={question.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                      Question {question.questionOrder ?? index + 1}
                    </p>

                    {question.marks != null && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {question.marks} {question.marks === 1 ? "mark" : "marks"}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 break-words text-base font-bold leading-7 text-slate-900 sm:text-lg">
                    {question.questionText}
                  </h3>

                  <fieldset className="mt-5 space-y-3">
                    <legend className="sr-only">
                      Select an answer for question {index + 1}
                    </legend>

                    {options.map(([letter, value]) => {
                      const selected = answers[question.id] === letter;

                      return (
                        <label
                          key={letter}
                          className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition sm:p-4 ${
                            selected
                              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10"
                              : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                          } ${
                            submissionResult || submittingExam
                              ? "cursor-not-allowed opacity-80"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={letter}
                            checked={selected}
                            onChange={() =>
                              handleAnswerChange(question.id, letter)
                            }
                            disabled={Boolean(submissionResult) || submittingExam}
                            className="mt-1 h-4 w-4 shrink-0 accent-indigo-600"
                          />

                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                              selected
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {letter}
                          </span>

                          <span className="min-w-0 break-words text-sm leading-6 text-slate-700">
                            {value}
                          </span>
                        </label>
                      );
                    })}
                  </fieldset>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <p className="text-sm font-bold text-amber-900">
            Before you submit
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            You have answered {answeredCount} of {questions.length} questions.
            {unansweredCount > 0
              ? ` ${unansweredCount} question(s) remain unanswered.`
              : " All questions have an answer selected."}
          </p>

          {submissionError && (
            <div className="mt-4">
              <AlertMessage message={submissionError} />
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowSubmitConfirmation(true)}
              disabled={
                submittingExam ||
                questionsLoading ||
                questions.length === 0 ||
                Boolean(questionsError)
              }
              className="min-h-11 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingExam ? "Submitting exam..." : "Submit Exam"}
            </button>

            <button
              type="button"
              onClick={() => {
                setExamSession(null);
                setAnswers({});
                setQuestionsError("");
                setSubmissionError("");
                setShowSubmitConfirmation(false);
              }}
              disabled={submittingExam}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {showSubmitConfirmation && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
            role="presentation"
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="submit-exam-title"
              className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
            >
              <h3
                id="submit-exam-title"
                className="text-xl font-black text-slate-950"
              >
                Submit this examination?
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                You have answered {answeredCount} of {questions.length} questions.
                {unansweredCount > 0
                  ? " Unanswered questions will be submitted without a selected answer."
                  : " You have selected an answer for every question."}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Once the server accepts your submission, you may not be able to
                change your answers.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirmation(false)}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Continue Exam
                </button>

                <button
                  type="button"
                  onClick={handleSubmitExam}
                  disabled={submittingExam}
                  className="min-h-11 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingExam ? "Submitting..." : "Confirm Submit"}
                </button>
              </div>
            </section>
          </div>
        )}
      </section>
    );
  }

  function renderResults(limit) {
    const list =
      typeof limit === "number" ? attempts.slice(0, limit) : attempts;

    if (errors.results) {
      return (
        <AlertMessage
          message={`Unable to load your results. ${errors.results}`}
        />
      );
    }

    if (loading) {
      return (
        <p className="py-6 text-sm text-slate-500" role="status">
          Loading your results...
        </p>
      );
    }

    if (list.length === 0) {
      return (
        <EmptyState
          icon="📊"
          title="No exam attempts yet"
          description="Your exam attempts and results will appear here after you take an examination."
        />
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-bold">Exam</th>
              <th className="px-4 py-3 font-bold">Score</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Date</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {list.map((attempt, index) => {
              const status = String(attempt.status || "UNKNOWN");
              const score =
                attempt.score ??
                attempt.marksObtained ??
                attempt.totalScore;

              const date =
                attempt.submittedAt ||
                attempt.startedAt ||
                attempt.createdAt;

              return (
                <tr
                  key={attempt.id ?? attempt.attemptId ?? index}
                  className="bg-white"
                >
                  <td className="max-w-[220px] px-4 py-4 font-semibold text-slate-800">
                    <span className="break-words">
                      {attempt.examTitle ||
                        attempt.title ||
                        (attempt.examId
                          ? `Exam #${attempt.examId}`
                          : `Attempt #${attempt.id ?? index + 1}`)}
                    </span>
                  </td>

                  <td className="px-4 py-4 font-bold text-slate-800">
                    {attempt.score != null && attempt.totalMarks != null
                      ? `${attempt.score} / ${attempt.totalMarks}`
                      : score ?? "—"}
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-slate-500">
                    {date ? String(date).slice(0, 10) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderOverview() {
    return (
      <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            icon="📚"
            label="Enrolled courses"
            value={loading ? "—" : errors.courses ? "—" : enrollments.length}
            description="Courses in your learning journey"
          />

          <StatCard
            icon="🎯"
            label="Available exams"
            value={loading ? "—" : errors.exams ? "—" : exams.length}
            description="Published examinations"
          />

          <StatCard
            icon="🏆"
            label="Completed attempts"
            value={
              loading ? "—" : errors.results ? "—" : completedAttempts.length
            }
            description="Exam attempts marked as completed"
          />
        </div>

        <section className="mt-7 min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Continue learning
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your enrolled courses
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("My Courses")}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all →
            </button>
          </div>

          {renderCourses(2)}
        </section>

        <section className="mt-8 min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Available examinations
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Published exams ready for students
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("Available Exams")}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all →
            </button>
          </div>

          {renderExams(2)}
        </section>

        <section className="mt-8 min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Recent exam activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest attempts and results
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("My Results")}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all →
            </button>
          </div>

          {renderResults(3)}
        </section>
      </>
    );
  }

  function renderProfile() {
    return (
      <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white">
            {(user.fullName || user.email || "N").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h2 className="break-words text-xl font-black text-slate-900">
              {user.fullName || "Nexora Student"}
            </h2>
            <p className="mt-1 break-words text-sm text-slate-500">
              {user.email || "No email available"}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {user.role || "STUDENT"}
            </span>
          </div>
        </div>

        <div className="my-6 h-px bg-slate-100" />

        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Full name
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
              {user.fullName || "Not available"}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Email address
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
              {user.email || "Not available"}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Account role
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-800">
              {user.role || "STUDENT"}
            </dd>
          </div>
        </dl>

        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          This profile displays the account information saved at sign-in.
          Editing profile details requires a backend update endpoint.
        </p>
      </section>
    );
  }

  const pageContent = {
    Overview: renderOverview,
    "My Courses": () => renderCourses(),
    "Available Exams": () => renderExams(),
    "My Results": () => renderResults(),
    Profile: renderProfile,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col lg:min-h-screen lg:flex-row">
        <aside className="shrink-0 bg-slate-950 text-white lg:min-h-screen lg:w-64">
          <div className="flex items-center justify-between gap-3 px-5 py-5 lg:block lg:px-6 lg:py-7">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xl font-black tracking-tight"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg">
                N
              </span>
              <span>
                Nexora<span className="text-indigo-400">.</span>
              </span>
            </Link>

            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold tracking-wide text-indigo-200 lg:mt-5 lg:inline-flex">
              STUDENT PORTAL
            </span>
          </div>

          <nav
            aria-label="Student dashboard navigation"
            className="flex gap-2 overflow-x-auto px-3 pb-4 lg:mt-5 lg:flex-col lg:overflow-visible lg:px-3"
          >
            {tabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => {
                  if (examSession && !submissionResult) {
                    const leave = window.confirm(
                      "Your exam attempt is still in progress. Leave the exam screen?"
                    );

                    if (!leave) return;

                    setExamSession(null);
                    setAnswers({});
                    setQuestionsError("");
                    setSubmissionError("");
                    setShowSubmitConfirmation(false);
                  }

                  setActiveTab(tab.label);
                }}
                aria-current={activeTab === tab.label ? "page" : undefined}
                className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition lg:w-full ${
                  activeTab === tab.label
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="w-5 text-center text-lg" aria-hidden="true">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="hidden border-t border-white/10 px-5 py-5 lg:mt-8 lg:block">
            <p className="break-words text-sm font-bold text-white">
              {user.fullName || "Student"}
            </p>
            <p className="mt-1 break-words text-xs leading-5 text-slate-400">
              {user.email || ""}
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-5 min-h-11 w-full rounded-xl border border-white/15 px-4 py-2.5 text-left text-sm font-bold text-slate-200 transition hover:bg-white/10"
            >
              ↪ Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-white px-4 py-5 sm:flex-row sm:items-center sm:px-7 sm:py-6 lg:px-9">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Student workspace
              </p>
              <h1 className="mt-2 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {examSession && activeTab === "Available Exams"
                  ? submissionResult
                    ? "Exam Result"
                    : "Take Examination"
                  : activeTab === "Overview"
                    ? `Welcome back, ${firstName}!`
                    : activeTab}
              </h1>
              <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                {examSession && activeTab === "Available Exams"
                  ? submissionResult
                    ? "Your submission has been processed."
                    : "Answer the questions and submit your examination when ready."
                  : activeTab === "Overview"
                    ? "Your learning progress, courses, and examinations in one place."
                    : `Manage your ${activeTab.toLowerCase()} from your Nexora workspace.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (examSession && !submissionResult) {
                    const leave = window.confirm(
                      "Your exam attempt is still in progress. Refreshing dashboard data will not submit your answers. Continue?"
                    );

                    if (!leave) return;
                  }

                  refreshDashboard();
                }}
                disabled={loading}
                className="min-h-10 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "↻ Refresh"}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="min-h-10 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 lg:hidden"
              >
                Sign out
              </button>
            </div>
          </header>

          <div className="min-w-0 p-4 sm:p-6 lg:p-9">
            {Object.keys(errors).length > 0 && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Some dashboard information could not be loaded. Check the
                relevant section below or use Refresh to try again.
              </div>
            )}

            {examActionError && !examSession && (
              <div className="mb-5">
                <AlertMessage message={examActionError} />
              </div>
            )}

            {examSession && activeTab === "Available Exams" ? (
              renderExamSession()
            ) : (
              pageContent[activeTab]()
            )}

            <footer className="mt-10 border-t border-slate-200 py-5 text-xs leading-5 text-slate-400">
              © {new Date().getFullYear()} Nexora · Learning and online examinations
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}

function Dashboard() {
  const token = localStorage.getItem("nexoraToken");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("nexoraUser") || "{}");
    } catch {
      return {};
    }
  })();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "ADMIN") {
    return (
      <main className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 sm:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-5xl min-w-0">
          <div className="flex min-w-0 flex-col justify-between gap-5 rounded-2xl bg-slate-950 p-4 text-white sm:rounded-3xl sm:p-6 md:flex-row md:items-center md:p-9">
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-wide text-indigo-300">
                ADMIN WORKSPACE
              </p>
              <h1 className="mt-3 break-words text-2xl font-black sm:text-4xl">
                Welcome{user.fullName ? `, ${user.fullName}` : " to Nexora"}!
              </h1>
              <p className="mt-3 break-words text-sm leading-6 text-slate-300">
                Manage your learning platform and course content.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("nexoraToken");
                localStorage.removeItem("nexoraUser");
                window.location.replace("/login");
              }}
              className="min-h-11 w-full shrink-0 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Sign out
            </button>
          </div>

          <AdminCourseManagement />

          <p className="mt-6 break-words text-sm text-slate-500">
            Signed in as {user.email || "your account"} · Role:{" "}
            {user.role || "ADMIN"}
          </p>
        </div>
      </main>
    );
  }

  return <StudentDashboard user={user} />;
}

function LoginRoute() {
  const location = useLocation();
  const registrationSuccess = Boolean(location.state?.registrationSuccess);

  return (
    <>
      {registrationSuccess && (
        <div className="mx-auto w-full max-w-[460px] px-3 pt-5 sm:px-4 sm:pt-6">
          <AlertMessage
            type="success"
            message="Your account was created successfully. Please sign in."
          />
        </div>
      )}

      <Login />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
