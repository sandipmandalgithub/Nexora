
import { Link } from "react-router-dom";

export default function AdminFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand and Description */}
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-lg font-black text-white shadow-md shadow-indigo-200/60">
              N
            </span>

            <div className="min-w-0">
              <p className="text-sm font-extrabold tracking-tight text-slate-900">
                Nexora<span className="text-indigo-600">.</span>
                <span className="ml-2 font-semibold text-slate-500">
                  Admin Console
                </span>
              </p>

              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                Manage courses, examinations and academic results from one
                centralized learning management platform.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Admin footer navigation"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 sm:justify-end"
          >
            <Link
              to="/dashboard"
              className="rounded-sm transition-colors duration-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Dashboard
            </Link>

            <Link
              to="/"
              className="rounded-sm transition-colors duration-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Public Home
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex flex-col gap-2 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Nexora. All rights reserved.
            </p>

            <p className="font-semibold tracking-wide text-slate-600">
              Learn. Practice. Evaluate. Grow.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
