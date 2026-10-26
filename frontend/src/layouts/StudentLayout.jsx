import StudentHeader from "../components/layout/StudentHeader";
import StudentFooter from "../components/layout/StudentFooter";

export default function StudentLayout({ user, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <StudentHeader user={user} />

      <main className="w-full flex-1">
        {children}
      </main>

      <StudentFooter />
    </div>
  );
}