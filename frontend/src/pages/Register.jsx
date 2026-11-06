import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { API_BASE_URL, getApiError } from "../utils/api";
import AuthLayout from "../components/auth/AuthLayout";
import FormField from "../components/auth/FormField";
import AlertMessage from "../components/auth/AlertMessage";

export default function Register() {
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
        className="space-y-4"
      >
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
              className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-xs font-bold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:right-3"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Use at least 8 characters. Your password will be handled by the
            backend.
          </p>
        </div>

        <div className="min-w-0">
          <label
            htmlFor="register-confirm-password"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Confirm password
          </label>

          <div className="relative min-w-0">
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Enter your password again"
              autoComplete="new-password"
              required
              className="min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 pr-20 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:px-4"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword((previous) => !previous)
              }
              className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-xs font-bold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:right-3"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-base"
        >
          {loading ? (
            <>
              <svg
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm leading-6 text-slate-600 sm:mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="rounded-sm font-extrabold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Sign in
        </Link>
      </p>

      <Link
        to="/"
        className="mt-4 block rounded-sm text-center text-sm font-semibold text-slate-500 transition hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        ← Back to home
      </Link>
    </AuthLayout>
  );
}