
export default function AlertMessage({ message, type = "error" }) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`mb-5 min-w-0 break-words rounded-xl border px-3 py-3 text-sm leading-6 sm:px-4 ${styles}`}
    >
      {message}
    </div>
  );
}
