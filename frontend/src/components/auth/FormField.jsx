
export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:px-4"
      />
    </div>
  );
}
