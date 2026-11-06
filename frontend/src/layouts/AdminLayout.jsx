
import AdminHeader from "../components/layout/AdminHeader";
import AdminFooter from "../components/layout/AdminFooter";

export default function AdminLayout({ user, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AdminHeader user={user} />

      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-[1440px] min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
          <div className="min-w-0">
            {children}
          </div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
}
