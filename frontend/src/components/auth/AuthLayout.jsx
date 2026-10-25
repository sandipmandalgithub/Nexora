
import { Link } from "react-router-dom";

export default function AuthLayout({ children, subtitle, title }) {
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
