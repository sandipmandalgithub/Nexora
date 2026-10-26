import { Link } from "react-router-dom";

export default function StudentFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-extrabold text-slate-800">
            Nexora<span className="text-indigo-600">.</span>
            <span className="ml-2 font-medium text-slate-500">
              Student Portal
            </span>
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Learn, practice, and track your progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
          <Link
            to="/dashboard"
            className="transition hover:text-indigo-600"
          >
            Dashboard
          </Link>

          <Link
            to="/"
            className="transition hover:text-indigo-600"
          >
            Home
          </Link>

          <span>© {new Date().getFullYear()} Nexora</span>
        </div>
      </div>
    </footer>
  );
}