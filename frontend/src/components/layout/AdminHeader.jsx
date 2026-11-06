
import { Link, useNavigate } from "react-router-dom";

export default function AdminHeader({ user = {} }) {
  const navigate = useNavigate();

  function handleSignOut() {
    localStorage.removeItem("nexoraToken");
    localStorage.removeItem("nexoraUser");
    navigate("/login", { replace: true });
  }

  const displayName = user.fullName || "Administrator";
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-[0_2px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
        {/* Brand */}
        <Link
          to="/dashboard"
          className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4"
          aria-label="Nexora Admin Dashboard"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-xl font-black text-white shadow-lg shadow-indigo-200/70 transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-indigo-300/70">
            N
          </span>

          <span className="min-w-0">
            <span className="block text-xl font-extrabold leading-tight tracking-tight text-slate-950">
              Nexora<span className="text-indigo-600">.</span>
            </span>

            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.19em] text-slate-500 sm:text-[10px]">
              Admin Console
            </span>
          </span>
        </Link>

        {/* Account Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Admin Identity */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-sm font-extrabold text-indigo-700 ring-4 ring-indigo-50/70">
              {initial}
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-44 truncate text-sm font-bold leading-5 text-slate-800 md:max-w-52">
                {displayName}
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-[11px] font-semibold tracking-wide text-slate-500">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          <span className="hidden h-9 w-px bg-slate-200 sm:block" />

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:scale-[0.98] sm:px-4 sm:text-sm"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </svg>

            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
