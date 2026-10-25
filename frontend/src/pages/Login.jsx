
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { API_BASE_URL, getApiError } from "../utils/api";
import AuthLayout from "../components/auth/AuthLayout";
import FormField from "../components/auth/FormField";
import AlertMessage from "../components/auth/AlertMessage";

export default function Login() {
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
