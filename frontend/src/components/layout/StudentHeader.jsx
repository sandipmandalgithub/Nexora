import { Link, useNavigate } from "react-router-dom";

export default function StudentHeader({ user = {} }) {
  const navigate = useNavigate();

  function handleSignOut() {
    localStorage.removeItem("nexoraToken");
    localStorage.removeItem("nexoraUser");
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          className="flex min-w-0 items-center gap-3"
          aria-label="Nexora Student Dashboard"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white shadow-sm">
            N
          </span>

          <span className="min-w-0">
            <span className="block text-lg font-black tracking-tight text-slate-950">
              Nexora<span className="text-indigo-600">.</span>
            </span>

            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
              Student Portal
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden text-right sm:block">
            <p className="max-w-48 truncate text-sm font-bold text-slate-800">
              {user.fullName || "Student"}
            </p>

            <p className="text-xs font-medium text-indigo-600">
              Student Account
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-10 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:px-4"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}