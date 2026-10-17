
import { useState } from "react";
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
import CourseList from "./components/CourseList";
import AdminCourseManagement from "./components/AdminCourseManagement";

const API_BASE_URL = "http://localhost:8080/api";

function AuthLayout({ children, subtitle, title }) {
  return (
    <main className="relative flex min-h-[calc(100vh-76px)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />

      <div className="relative w-full max-w-[460px]">
        <div className="mb-7 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-3xl font-black tracking-tight text-slate-950"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white shadow-lg shadow-indigo-600/20">
              N
            </span>
            Nexora<span className="text-indigo-500">.</span>
          </Link>

          <p className="mt-4 text-sm text-slate-500">{subtitle}</p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your learning journey starts here.
            </p>
          </div>

          {children}
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
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
        className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      />
    </div>
  );
}

function AlertMessage({ message, type = "error" }) {
  if (!message) {
    return null;
  }

  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-6 ${styles}`}
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

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.errors && typeof data.errors === "object") {
    return Object.values(data.errors).flat().join(" ");
  }

  if (error.response.status === 400) {
    return "Please check your details and try again.";
  }

  if (error.response.status === 401) {
    return "Invalid email or password.";
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
        role: String(
          data?.role ?? data?.user?.role ?? "STUDENT"
        ).toUpperCase(),
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="text-sm font-bold text-slate-700"
            >
              Password
            </label>
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-20 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute inset-y-0 right-3 my-auto rounded-md px-2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in to Nexora"}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">
          NEW TO NEXORA?
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <p className="text-center text-sm text-slate-600">
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
        className="mt-5 block text-center text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
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

        <div>
          <label
            htmlFor="register-password"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Password
          </label>

          <div className="relative">
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
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-20 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute inset-y-0 right-3 my-auto rounded-md px-2 text-xs font-bold text-indigo-600 hover:text-indigo-800"
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
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
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
        className="mt-5 block text-center text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        ← Back to home
      </Link>
    </AuthLayout>
  );
}

function Dashboard() {
  const navigate = useNavigate();
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

  function handleLogout() {
    localStorage.removeItem("nexoraToken");
    localStorage.removeItem("nexoraUser");
    navigate("/login", { replace: true });
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <main className="min-h-[calc(100vh-76px)] bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-slate-950 p-6 text-white sm:p-9 md:flex-row md:items-center">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-indigo-300">
              {isAdmin ? "ADMIN WORKSPACE" : "STUDENT WORKSPACE"}
            </p>

            <h1 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-4xl">
              Welcome{user.fullName ? `, ${user.fullName}` : " to Nexora"}!
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              Your account is signed in. Your learning workspace will grow as
              we add the course and examination features.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="min-h-11 shrink-0 rounded-xl border border-white/20 px-5 py-3 font-bold text-white transition hover:bg-white/10"
          >
            Sign out
          </button>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
              📚
            </span>

            <h2 className="mt-5 text-xl font-extrabold text-slate-900">
              Learning
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your learning paths and course features will be available here
              as we build them.
            </p>

            <span className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              Coming next
            </span>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-2xl">
              🎯
            </span>

            <h2 className="mt-5 text-xl font-extrabold text-slate-900">
              Online examinations
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Practice tests, timed examinations, and results will be added in
              a later step.
            </p>

            <span className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              Coming next
            </span>
          </section>
        </div>

        {isAdmin ? <AdminCourseManagement /> : <CourseList />}

        <p className="mt-6 break-words text-sm text-slate-500">
          Signed in as {user.email || "your account"} · Role:{" "}
          {user.role || "STUDENT"}
        </p>
      </div>
    </main>
  );
}

function LoginRoute() {
  const location = useLocation();
  const registrationSuccess = Boolean(
    location.state?.registrationSuccess
  );

  return (
    <>
      {registrationSuccess && (
        <div className="mx-auto max-w-[460px] px-4 pt-6">
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
