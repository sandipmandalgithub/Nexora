import { Navigate } from "react-router-dom";

import AdminCourseManagement from "../components/AdminCourseManagement";
import AdminQuestionManagement from "../components/AdminQuestionManagement";
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
        <section className="min-w-0">
          <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm sm:rounded-3xl sm:p-8 lg:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300 sm:text-sm">
              Admin Workspace
            </p>

            <h1 className="mt-3 break-words text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Welcome{user.fullName ? `, ${user.fullName}` : " to Nexora"}!
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Manage courses, examinations, and question content from one
              professional workspace.
            </p>
          </div>

          <AdminCourseManagement />

          <AdminQuestionManagement />

          <div className="mt-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-500">
            Signed in as{" "}
            <span className="break-all font-semibold text-slate-700">
              {user.email || "your account"}
            </span>
            <span className="mx-2 text-slate-300">·</span>
            Role:{" "}
            <span className="font-semibold text-slate-700">
              {user.role || "ADMIN"}
            </span>
          </div>
        </section>
      </AdminLayout>
    );
  }

  return <StudentDashboard user={user} />;
}