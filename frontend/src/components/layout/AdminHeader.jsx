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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/dashboard"
          className="group flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          aria-label="Nexora Admin Dashboard"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-lg font-black text-white shadow-md shadow-indigo-200 transition-transform duration-200 group-hover:scale-105 sm:h-11 sm:w-11 sm:text-xl">
            N
          </span>

          <span className="min-w-0">
            <span className="block text-lg font-black leading-tight tracking-tight text-slate-950 sm:text-xl">
              Nexora<span className="text-indigo-600">.</span>
            </span>

            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-[10px] sm:tracking-[0.18em]">
              Admin Console
            </span>
          </span>
        </Link>

        {/* Account actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-sm font-extrabold text-indigo-700">
              {initial}
            </div>

            <div className="max-w-44 text-right md:max-w-52">
              <p className="truncate text-sm font-bold text-slate-800">
                {displayName}
              </p>

              <p className="mt-0.5 text-xs font-medium text-indigo-600">
                Administrator
              </p>
            </div>
          </div>

          <span className="hidden h-9 w-px bg-slate-200 sm:block" />

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:scale-[0.98] sm:px-4 sm:text-sm"
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
