
import { Navigate } from "react-router-dom";

import AdminCourseManagement from "../components/AdminCourseManagement";
import AdminQuestionManagement from "../components/AdminQuestionManagement";
import StudentDashboard from "./StudentDashboard";

export default function Dashboard() {
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
                Manage courses, examinations, and question content from one
                place.
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

          <AdminQuestionManagement />

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
