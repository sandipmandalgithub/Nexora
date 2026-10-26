import AdminHeader from "../components/layout/AdminHeader";
import AdminFooter from "../components/layout/AdminFooter";

export default function AdminLayout({ user, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AdminHeader user={user} />

      <main className="w-full flex-1 px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-7xl min-w-0">
          {children}
        </div>
      </main>

      <AdminFooter />
    </div>
  );
}