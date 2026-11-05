
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL, getApiError } from "../../utils/api";
import AlertMessage from "../auth/AlertMessage";
import EmptyState from "../ui/EmptyState";

export default function StudentGradeCards() {
  const [activeSection, setActiveSection] = useState("grades");
  const [gradeCards, setGradeCards] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [downloading, setDownloading] = useState("");

  const token = localStorage.getItem("nexoraToken");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // Fetch grade cards and certificates without updating component state.
  const fetchData = useCallback(async () => {
    const results = await Promise.allSettled([
      axios.get(`${API_BASE_URL}/grade-cards/my`, {
        headers: authHeaders,
      }),
      axios.get(`${API_BASE_URL}/certificates/my`, {
        headers: authHeaders,
      }),
    ]);

    const nextErrors = {};

    const nextGradeCards =
      results[0].status === "fulfilled"
        ? Array.isArray(results[0].value.data)
          ? results[0].value.data
          : []
        : (nextErrors.grades = getApiError(results[0].reason), []);

    const nextCertificates =
      results[1].status === "fulfilled"
        ? Array.isArray(results[1].value.data)
          ? results[1].value.data
          : []
        : (nextErrors.certificates = getApiError(results[1].reason), []);

    return {
      gradeCards: nextGradeCards,
      certificates: nextCertificates,
      errors: nextErrors,
    };
  }, [authHeaders]);

  // Initial data loading.
  useEffect(() => {
    let isActive = true;

    async function initializeData() {
      try {
        const data = await fetchData();

        if (!isActive) {
          return;
        }

        setGradeCards(data.gradeCards);
        setCertificates(data.certificates);
        setErrors(data.errors);
        setLoading(false);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrors({
          grades: getApiError(error),
          certificates: getApiError(error),
        });
        setLoading(false);
      }
    }

    initializeData();

    return () => {
      isActive = false;
    };
  }, [fetchData]);

  // Manual refresh.
  async function handleRefresh() {
    setLoading(true);
    setErrors({});

    try {
      const data = await fetchData();

      setGradeCards(data.gradeCards);
      setCertificates(data.certificates);
      setErrors(data.errors);
    } catch (error) {
      const message = getApiError(error);

      setErrors({
        grades: message,
        certificates: message,
      });
    } finally {
      setLoading(false);
    }
  }

  // Download Grade Card or Certificate PDF.
  async function handleDownload(type, id) {
    const key = `${type}-${id}`;

    setDownloading(key);

    try {
      const endpoint =
        type === "grade"
          ? `${API_BASE_URL}/grade-cards/my/${id}/pdf`
          : `${API_BASE_URL}/certificates/my/${id}/pdf`;

      const response = await axios.get(endpoint, {
        headers: authHeaders,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download =
        type === "grade"
          ? `Nexora-Grade-Card-${id}.pdf`
          : `Nexora-Certificate-${id}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      const message = getApiError(error);
      window.alert(`Unable to download PDF. ${message}`);
    } finally {
      setDownloading("");
    }
  }

  function renderGradeCards() {
    if (errors.grades) {
      return (
        <AlertMessage
          message={`Unable to load your grade cards. ${errors.grades}`}
        />
      );
    }

    if (loading) {
      return (
        <p className="py-8 text-center text-sm text-slate-500" role="status">
          Loading your grade cards...
        </p>
      );
    }

    if (gradeCards.length === 0) {
      return (
        <EmptyState
          icon="📊"
          title="No grade cards available"
          description="Your grade cards will appear here after you submit an examination."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {gradeCards.map((card) => {
          const passed = String(card.result).toUpperCase() === "PASS";

          return (
            <article
              key={card.id}
              className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                    Grade Card #{card.id}
                  </p>

                  <h3 className="mt-2 break-words text-lg font-black text-slate-900">
                    {card.examTitle || `Exam #${card.examId}`}
                  </h3>

                  <p className="mt-1 break-words text-sm text-slate-500">
                    {card.courseTitle || `Course #${card.courseId}`}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                    passed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {card.result || "UNKNOWN"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">
                    Score
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-900">
                    {card.score ?? "—"}/{card.totalMarks ?? "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">
                    Percentage
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-900">
                    {Number(card.percentage ?? 0).toFixed(2)}%
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-50 p-3">
                  <p className="text-xs font-semibold text-indigo-600">
                    Grade
                  </p>
                  <p className="mt-1 text-lg font-black text-indigo-800">
                    {card.grade || "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">
                    Attempt
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-900">
                    #{card.attemptId ?? "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Issued:{" "}
                  {card.issuedAt
                    ? String(card.issuedAt).replace("T", " ").slice(0, 16)
                    : "—"}
                </p>

                <button
                  type="button"
                  onClick={() => handleDownload("grade", card.id)}
                  disabled={downloading !== ""}
                  className="min-h-10 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloading === `grade-${card.id}`
                    ? "Downloading..."
                    : "↓ Download Grade Card"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  function renderCertificates() {
    if (errors.certificates) {
      return (
        <AlertMessage
          message={`Unable to load your certificates. ${errors.certificates}`}
        />
      );
    }

    if (loading) {
      return (
        <p className="py-8 text-center text-sm text-slate-500" role="status">
          Loading your certificates...
        </p>
      );
    }

    if (certificates.length === 0) {
      return (
        <EmptyState
          icon="🎓"
          title="No certificates issued yet"
          description="Complete all published examinations in a course with a passing result to become eligible for its certificate."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {certificates.map((certificate) => {
          const issued =
            String(certificate.status).toUpperCase() === "ISSUED";

          return (
            <article
              key={certificate.id}
              className="min-w-0 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm"
            >
              <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    🎓
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      issued
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {certificate.status || "UNKNOWN"}
                  </span>
                </div>

                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                  Nexora Achievement Certificate
                </p>

                <h3 className="mt-2 break-words text-xl font-black text-slate-950">
                  {certificate.courseTitle ||
                    `Course #${certificate.courseId}`}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Awarded to
                </p>

                <p className="mt-1 break-words text-lg font-extrabold text-slate-900">
                  {certificate.studentName || "Student"}
                </p>
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Certificate Number
                  </p>
                  <p className="mt-1 break-all text-sm font-bold text-slate-800">
                    {certificate.certificateNumber || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Issue Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {certificate.issuedAt
                      ? String(certificate.issuedAt).slice(0, 10)
                      : "—"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleDownload("certificate", certificate.id)
                  }
                  disabled={!issued || downloading !== ""}
                  className="flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloading === `certificate-${certificate.id}`
                    ? "Downloading..."
                    : "↓ Download Certificate PDF"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-900">
          Academic Achievements
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          View your examination grades and download your earned certificates.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <button
          type="button"
          onClick={() => setActiveSection("grades")}
          aria-pressed={activeSection === "grades"}
          className={`min-h-10 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeSection === "grades"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          My Grade Cards ({gradeCards.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("certificates")}
          aria-pressed={activeSection === "certificates"}
          className={`min-h-10 rounded-lg px-4 py-2 text-sm font-bold transition ${
            activeSection === "certificates"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          My Certificates ({certificates.length})
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="ml-auto min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {activeSection === "grades"
        ? renderGradeCards()
        : renderCertificates()}
    </section>
  );
}
