
import { Navigate } from "react-router-dom";

import AdminCourseManagement from "../components/AdminCourseManagement";
import AdminExamManagement from "../components/AdminExamManagement";
import AdminQuestionManagement from "../components/AdminQuestionManagement";
import AdminDetailedResults from "../components/AdminDetailedResults";
import AdminAcademicAchievements from "../components/admin/AdminAcademicAchievements";
import AdminLayout from "../layouts/AdminLayout";
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
      <AdminLayout user={user}>
        <section className="min-w-0 space-y-8">
          {/* Admin Welcome Banner */}
          <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 text-white shadow-lg shadow-slate-900/10 sm:rounded-3xl sm:p-8 lg:p-9">
            {/* Decorative Background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 right-1/4 -z-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
            />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-indigo-200 sm:text-xs">
                    Admin Workspace
                  </span>
                </div>

                <h1 className="mt-5 break-words text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Welcome{user.fullName ? `, ${user.fullName}` : " to Nexora"}!
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Manage courses, examinations, question content, and student
                  academic results from your centralized learning management
                  workspace.
                </p>
              </div>

              {/* Admin Workspace Icon */}
              <div className="hidden shrink-0 sm:flex">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner backdrop-blur-sm lg:h-24 lg:w-24">
                  <svg
                    aria-hidden="true"
                    className="h-10 w-10 text-indigo-300 lg:h-12 lg:w-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M8 9h8M8 13h5M8 17h3" />
                    <path d="M17 13l1.5 1.5L21 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Course Management */}
          <section className="min-w-0" aria-label="Course management">
            <AdminCourseManagement />
          </section>

          {/* Exam Management */}
          <section className="min-w-0" aria-label="Exam management">
            <AdminExamManagement />
          </section>

          {/* Question Management */}
          <section className="min-w-0" aria-label="Question management">
            <AdminQuestionManagement />
          </section>

          {/* Examination Results */}
          <section className="min-w-0" aria-label="Examination results">
            <AdminDetailedResults />
          </section>

          {/* Academic Achievements */}
          <section className="min-w-0" aria-label="Academic achievements">
            <AdminAcademicAchievements />
          </section>

          {/* Account Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    Account Information
                  </p>

                  <p className="mt-0.5 break-all text-xs leading-5 text-slate-500">
                    {user.email || "your account"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  Active Session
                </span>

                <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700">
                  {user.role || "ADMIN"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </AdminLayout>
    );
  }

  return <StudentDashboard user={user} />;
}
