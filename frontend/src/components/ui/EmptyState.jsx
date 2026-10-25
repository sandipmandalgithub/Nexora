
export default function EmptyState({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center sm:px-6">
      <span className="text-3xl" aria-hidden="true">
        {icon}
      </span>

      <h3 className="mt-3 text-base font-extrabold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
