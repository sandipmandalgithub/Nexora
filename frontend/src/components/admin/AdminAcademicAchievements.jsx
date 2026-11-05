import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../utils/api";

function getToken() {
  return localStorage.getItem("nexoraToken");
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;

    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString();
}

function StatusBadge({ status }) {
  const styles = {
    PASS: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ISSUED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    FAIL: "bg-rose-50 text-rose-700 ring-rose-200",
    REVOKED: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        styles[status] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {(status || "UNKNOWN").replaceAll("_", " ")}
    </span>
  );
}

function SummaryCard({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

async function downloadPdf(path, filename) {
  const token = getToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = `PDF download failed (${response.status}).`;

    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export default function AdminAcademicAchievements() {
  const [activeTab, setActiveTab] = useState("grades");
  const [gradeCards, setGradeCards] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [certificateFilter, setCertificateFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gradeError, setGradeError] = useState("");
  const [certificateError, setCertificateError] = useState("");
  const [downloading, setDownloading] = useState("");

  const loadData = useCallback(async (signal) => {
    const results = await Promise.allSettled([
      apiRequest("/grade-cards", { signal }),
      apiRequest("/certificates", { signal }),
    ]);

    return {
      grades:
        results[0].status === "fulfilled" &&
        Array.isArray(results[0].value)
          ? results[0].value
          : [],
      certificates:
        results[1].status === "fulfilled" &&
        Array.isArray(results[1].value)
          ? results[1].value
          : [],
      gradeError:
        results[0].status === "rejected"
          ? results[0].reason.message || "Could not load grade cards."
          : "",
      certificateError:
        results[1].status === "rejected"
          ? results[1].reason.message || "Could not load certificates."
          : "",
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function fetchData() {
      try {
        const data = await loadData(controller.signal);

        if (!active) return;

        setGradeCards(data.grades);
        setCertificates(data.certificates);
        setGradeError(data.gradeError);
        setCertificateError(data.certificateError);
        setError("");
      } catch (err) {
        if (active && err.name !== "AbortError") {
          setError(err.message || "Could not load academic achievements.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [loadData]);

  async function handleRefresh() {
    setLoading(true);
    setError("");

    try {
      const data = await loadData();

      setGradeCards(data.grades);
      setCertificates(data.certificates);
      setGradeError(data.gradeError);
      setCertificateError(data.certificateError);
    } catch (err) {
      setError(err.message || "Could not refresh academic achievements.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(type, id) {
    const key = `${type}-${id}`;
    setDownloading(key);
    setError("");

    try {
      if (type === "grade") {
        await downloadPdf(
          `/grade-cards/${id}/pdf`,
          `Nexora-Grade-Card-${id}.pdf`,
        );
      } else {
        await downloadPdf(
          `/certificates/${id}/pdf`,
          `Nexora-Certificate-${id}.pdf`,
        );
      }
    } catch (err) {
      setError(err.message || "Could not download the PDF.");
    } finally {
      setDownloading("");
    }
  }

  const filteredGradeCards = useMemo(() => {
    const term = search.trim().toLowerCase();

    return gradeCards.filter((card) => {
      const matchesResult =
        resultFilter === "ALL" || card.result === resultFilter;

      const searchable = [
        card.id,
        card.attemptId,
        card.studentName,
        card.studentId,
        card.examTitle,
        card.examId,
        card.courseTitle,
        card.courseId,
        card.grade,
      ]
        .filter((value) => value != null)
        .join(" ")
        .toLowerCase();

      return matchesResult && (!term || searchable.includes(term));
    });
  }, [gradeCards, search, resultFilter]);

  const filteredCertificates = useMemo(() => {
    const term = search.trim().toLowerCase();

    return certificates.filter((certificate) => {
      const matchesStatus =
        certificateFilter === "ALL" ||
        certificate.status === certificateFilter;

      const searchable = [
        certificate.id,
        certificate.certificateNumber,
        certificate.studentName,
        certificate.studentEmail,
        certificate.studentId,
        certificate.courseTitle,
        certificate.courseId,
      ]
        .filter((value) => value != null)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!term || searchable.includes(term));
    });
  }, [certificates, search, certificateFilter]);

  const passCount = gradeCards.filter(
    (card) => card.result === "PASS",
  ).length;

  const failCount = gradeCards.filter(
    (card) => card.result === "FAIL",
  ).length;

  const issuedCertificateCount = certificates.filter(
    (certificate) => certificate.status === "ISSUED",
  ).length;

  return (
    <section className="mt-8 min-w-0 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Academic Management
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Grade Cards &amp; Certificates
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Inspect student examination grades and manage issued course
            certificates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Grade Cards"
          value={gradeCards.length}
          description="All recorded submitted attempts"
        />

        <SummaryCard
          label="Passed"
          value={passCount}
          description="Grade cards with PASS result"
        />

        <SummaryCard
          label="Failed"
          value={failCount}
          description="Grade cards with FAIL result"
        />

        <SummaryCard
          label="Issued Certificates"
          value={issuedCertificateCount}
          description="Certificates currently issued"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => {
            setActiveTab("grades");
            setSearch("");
          }}
          className={`rounded-t-xl px-4 py-3 text-sm font-bold transition ${
            activeTab === "grades"
              ? "border-b-2 border-indigo-600 bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          All Grade Cards ({gradeCards.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("certificates");
            setSearch("");
          }}
          className={`rounded-t-xl px-4 py-3 text-sm font-bold transition ${
            activeTab === "certificates"
              ? "border-b-2 border-indigo-600 bg-indigo-50 text-indigo-700"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          All Certificates ({certificates.length})
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            activeTab === "grades"
              ? "Search student, exam, course, attempt ID..."
              : "Search student, course, certificate number..."
          }
          aria-label="Search academic achievements"
          className="min-w-0 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />

        {activeTab === "grades" ? (
          <select
            value={resultFilter}
            onChange={(event) => setResultFilter(event.target.value)}
            aria-label="Filter grade cards by result"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">All results</option>
            <option value="PASS">Passed</option>
            <option value="FAIL">Failed</option>
          </select>
        ) : (
          <select
            value={certificateFilter}
            onChange={(event) => setCertificateFilter(event.target.value)}
            aria-label="Filter certificates by status"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">All statuses</option>
            <option value="ISSUED">Issued</option>
            <option value="REVOKED">Revoked</option>
          </select>
        )}
      </div>

      {activeTab === "grades" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-5">
            <h3 className="font-bold text-slate-900">Student Grade Cards</h3>
            <span className="text-xs text-slate-500">
              {filteredGradeCards.length} result(s)
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading grade cards...
            </div>
          ) : gradeError ? (
            <div
              role="alert"
              className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              {gradeError}
            </div>
          ) : filteredGradeCards.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No grade cards match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Grade Card</th>
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Exam &amp; Course</th>
                    <th className="px-5 py-4">Score</th>
                    <th className="px-5 py-4">Percentage</th>
                    <th className="px-5 py-4">Grade</th>
                    <th className="px-5 py-4">Result</th>
                    <th className="px-5 py-4">Issued</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredGradeCards.map((card) => (
                    <tr
                      key={card.id}
                      className="align-top hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        #{card.id}
                        <p className="mt-1 text-xs font-normal text-slate-500">
                          Attempt: #{card.attemptId ?? "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {card.studentName || "Student"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ID: {card.studentId ?? "—"}
                        </p>
                      </td>

                      <td className="max-w-[260px] px-5 py-4">
                        <p className="break-words font-medium text-slate-800">
                          {card.examTitle || "Exam"}
                        </p>
                        <p className="mt-1 break-words text-xs text-slate-500">
                          {card.courseTitle || "Course"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                        {card.score ?? "—"} / {card.totalMarks ?? "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                        {card.percentage != null
                          ? `${Number(card.percentage).toFixed(2)}%`
                          : "—"}
                      </td>

                      <td className="px-5 py-4 font-black text-slate-800">
                        {card.grade || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={card.result} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                        {formatDate(card.issuedAt)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            void handleDownload("grade", card.id)
                          }
                          disabled={downloading === `grade-${card.id}`}
                          className="whitespace-nowrap rounded-lg border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {downloading === `grade-${card.id}`
                            ? "Downloading..."
                            : "Download PDF"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-5">
            <h3 className="font-bold text-slate-900">Issued Certificates</h3>
            <span className="text-xs text-slate-500">
              {filteredCertificates.length} result(s)
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading certificates...
            </div>
          ) : certificateError ? (
            <div
              role="alert"
              className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              {certificateError}
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No certificates match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Certificate</th>
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Course</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Issued At</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCertificates.map((certificate) => (
                    <tr
                      key={certificate.id}
                      className="align-top hover:bg-slate-50"
                    >
                      <td className="max-w-[280px] px-5 py-4">
                        <p className="break-all font-semibold text-slate-800">
                          {certificate.certificateNumber || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ID: {certificate.id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {certificate.studentName || "Student"}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                          {certificate.studentEmail || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Student ID: {certificate.studentId ?? "—"}
                        </p>
                      </td>

                      <td className="max-w-[240px] px-5 py-4">
                        <p className="break-words font-medium text-slate-800">
                          {certificate.courseTitle || "Course"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Course ID: {certificate.courseId ?? "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={certificate.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                        {formatDate(certificate.issuedAt)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            void handleDownload("certificate", certificate.id)
                          }
                          disabled={
                            downloading === `certificate-${certificate.id}`
                          }
                          className="whitespace-nowrap rounded-lg border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {downloading === `certificate-${certificate.id}`
                            ? "Downloading..."
                            : "Download PDF"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}