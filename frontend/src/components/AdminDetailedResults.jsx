
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Filter,
  LoaderCircle,
  Printer,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../utils/api";

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
      // Keep the default error message when the response has no JSON body.
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

function formatScore(score, totalMarks) {
  if (score == null || totalMarks == null) return "—";
  return `${score} / ${totalMarks}`;
}

function getPercentage(score, totalMarks) {
  if (score == null || !totalMarks || totalMarks <= 0) {
    return null;
  }

  return ((Number(score) / Number(totalMarks)) * 100).toFixed(2);
}

function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(rows) {
  const headers = [
    "Attempt ID",
    "Student",
    "Student ID",
    "Exam",
    "Status",
    "Score",
    "Total Marks",
    "Percentage",
    "Started At",
    "Submitted At",
  ];

  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((attempt) =>
      [
        attempt.id,
        attempt.studentName,
        attempt.studentId,
        attempt.examTitle,
        attempt.status,
        attempt.score,
        attempt.totalMarks,
        getPercentage(attempt.score, attempt.totalMarks),
        attempt.startedAt,
        attempt.submittedAt,
      ]
        .map(escapeCsv)
        .join(","),
    ),
  ];

  const blob = new Blob(["\uFEFF", lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "nexora-exam-results.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function StatusBadge({ status }) {
  const styles = {
    SUBMITTED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${
        styles[status] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "SUBMITTED"
            ? "bg-emerald-500"
            : status === "IN_PROGRESS"
              ? "bg-amber-500"
              : "bg-slate-400"
        }`}
      />
      {(status || "UNKNOWN").replaceAll("_", " ")}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  iconStyle,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function QuestionReview({ question, index }) {
  const resultStyles = {
    CORRECT: "border-emerald-200 bg-emerald-50 text-emerald-800",
    INCORRECT: "border-rose-200 bg-rose-50 text-rose-800",
    UNANSWERED: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <article className="break-inside-avoid rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-700">
            {question.questionOrder ?? index + 1}
          </span>

          <h4 className="font-bold text-slate-900">
            Question {question.questionOrder ?? index + 1}
          </h4>
        </div>

        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
            resultStyles[question.result] ||
            "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {question.result || "UNKNOWN"}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-800">
        {question.questionText || "Question text unavailable"}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[
          ["A", question.optionA],
          ["B", question.optionB],
          ["C", question.optionC],
          ["D", question.optionD],
        ].map(([option, text]) => (
          <div
            key={option}
            className={`rounded-xl border p-3 text-sm leading-6 ${
              question.correctOption === option
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : question.selectedOption === option
                  ? "border-rose-300 bg-rose-50 text-rose-900"
                  : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <span className="mr-1 font-bold">{option}.</span>
            {text || "—"}

            {question.correctOption === option && (
              <span className="mt-1 block text-xs font-bold text-emerald-700">
                <CheckCircle2 className="mr-1 inline" size={13} />
                Correct answer
              </span>
            )}

            {question.selectedOption === option &&
              question.result !== "CORRECT" && (
                <span className="mt-1 block text-xs font-bold text-rose-700">
                  Your selection
                </span>
              )}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">
            Student selected
          </p>
          <p className="mt-2 break-words font-semibold text-slate-800">
            {question.selectedOption
              ? `${question.selectedOption}${
                  question.selectedOptionText
                    ? ` — ${question.selectedOptionText}`
                    : ""
                }`
              : "Unanswered"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Correct answer</p>
          <p className="mt-2 break-words font-semibold text-slate-800">
            {question.correctOption || "—"}
            {question.correctOptionText
              ? ` — ${question.correctOptionText}`
              : ""}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Marks awarded</p>
          <p className="mt-2 font-semibold text-slate-800">
            {question.awardedMarks ?? 0} / {question.marks ?? 0}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function AdminDetailedResults() {
  const [attempts, setAttempts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const loadAttempts = useCallback(async (signal) => {
    const data = await apiRequest("/exam-attempts", { signal });
    return Array.isArray(data) ? data : [];
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function fetchAttempts() {
      try {
        const data = await loadAttempts(controller.signal);

        if (active) {
          setAttempts(data);
          setError("");
        }
      } catch (err) {
        if (active && err.name !== "AbortError") {
          setError(err.message || "Could not load exam results.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchAttempts();

    return () => {
      active = false;
      controller.abort();
    };
  }, [loadAttempts]);

  const filteredAttempts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return attempts.filter((attempt) => {
      const matchesStatus =
        statusFilter === "ALL" || attempt.status === statusFilter;

      const searchable = [
        attempt.id,
        attempt.studentName,
        attempt.studentId,
        attempt.examTitle,
        attempt.examId,
      ]
        .filter((value) => value != null)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!term || searchable.includes(term));
    });
  }, [attempts, search, statusFilter]);

  const submittedCount = attempts.filter(
    (attempt) => attempt.status === "SUBMITTED",
  ).length;

  const inProgressCount = attempts.filter(
    (attempt) => attempt.status === "IN_PROGRESS",
  ).length;

  async function openReview(attempt) {
    if (attempt.status !== "SUBMITTED") {
      return;
    }

    setSelectedAttempt(attempt);
    setReview(null);
    setReviewError("");
    setReviewLoading(true);

    try {
      const data = await apiRequest(
        `/exam-attempts/admin/${attempt.id}/review`,
      );
      setReview(data);
    } catch (err) {
      setReviewError(err.message || "Could not load the detailed review.");
    } finally {
      setReviewLoading(false);
    }
  }

  function closeReview() {
    setSelectedAttempt(null);
    setReview(null);
    setReviewError("");
  }

  function printReview() {
    window.print();
  }

  return (
    <section className="mt-8 min-w-0 space-y-6">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }

            #nexora-print-report,
            #nexora-print-report * {
              visibility: visible !important;
            }

            #nexora-print-report {
              position: absolute !important;
              inset: 0 !important;
              width: 100% !important;
              padding: 12px !important;
              background: white !important;
            }

            #nexora-print-report article {
              break-inside: avoid;
            }

            @page {
              size: auto;
              margin: 12mm;
            }
          }
        `}
      </style>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
            <ClipboardList size={14} />
            Examination Management
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Detailed Results &amp; Reports
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor examination attempts, inspect submitted answers, and
            generate detailed performance reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => downloadCsv(filteredAttempts)}
          disabled={filteredAttempts.length === 0}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Total Attempts"
          value={attempts.length}
          description="All recorded examination attempts"
          icon={ClipboardList}
          iconStyle="bg-indigo-50 text-indigo-600"
        />

        <SummaryCard
          label="Submitted"
          value={submittedCount}
          description="Attempts available for detailed review"
          icon={CheckCircle2}
          iconStyle="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          label="In Progress"
          value={inProgressCount}
          description="Attempts not yet submitted"
          icon={Activity}
          iconStyle="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={17} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Search &amp; Filter Results
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative min-w-0">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student, exam, attempt ID..."
              aria-label="Search exam results"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by attempt status"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">All statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In progress</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <BookOpen size={19} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">Exam Attempts</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Student examination records
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {filteredAttempts.length} result(s)
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <LoaderCircle
              size={28}
              className="animate-spin text-indigo-600"
            />
            <p className="text-sm font-medium text-slate-500">
              Loading examination results...
            </p>
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
              <FileText size={28} />
            </div>

            <h4 className="mt-4 font-bold text-slate-800">
              No examination attempts found
            </h4>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              No examination attempts match your current search or status
              filter. Try changing your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Attempt</th>
                  <th className="px-5 py-4 font-bold">Student</th>
                  <th className="px-5 py-4 font-bold">Exam</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Score</th>
                  <th className="px-5 py-4 font-bold">Started</th>
                  <th className="px-5 py-4 font-bold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredAttempts.map((attempt) => {
                  const percentage = getPercentage(
                    attempt.score,
                    attempt.totalMarks,
                  );

                  return (
                    <tr
                      key={attempt.id}
                      className="align-top transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4 font-bold text-slate-800">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs">
                          #{attempt.id}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <UserRound size={17} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {attempt.studentName || "Student"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              ID: {attempt.studentId ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="max-w-[240px] px-5 py-4">
                        <p className="break-words font-semibold text-slate-800">
                          {attempt.examTitle || "Exam"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Exam ID: {attempt.examId ?? "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={attempt.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-bold text-slate-800">
                          {formatScore(attempt.score, attempt.totalMarks)}
                        </p>

                        {percentage !== null && (
                          <p className="mt-1 text-xs font-semibold text-indigo-600">
                            {percentage}%
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs leading-5 text-slate-500">
                        {formatDate(attempt.startedAt)}
                      </td>

                      <td className="px-5 py-4">
                        {attempt.status === "SUBMITTED" ? (
                          <button
                            type="button"
                            onClick={() => void openReview(attempt)}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
                          >
                            <FileText size={14} />
                            View Review
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            Not submitted
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAttempt && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6 print:static print:overflow-visible print:bg-white print:p-0 print:backdrop-blur-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-heading"
        >
          <div className="mx-auto my-4 max-w-5xl overflow-hidden rounded-2xl bg-slate-50 shadow-2xl sm:my-8 print:my-0 print:max-w-none print:overflow-visible print:rounded-none print:shadow-none">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-white p-4 sm:p-6 print:hidden">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                  <Award size={14} />
                  Submitted Attempt #{selectedAttempt.id}
                </div>

                <h3
                  id="review-heading"
                  className="mt-3 text-xl font-black text-slate-900 sm:text-2xl"
                >
                  Detailed Answer Review
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Review student answers and examination performance.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={printReview}
                  disabled={!review}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Printer size={16} />
                  Print Report
                </button>

                <button
                  type="button"
                  onClick={closeReview}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <X size={16} />
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-4 sm:p-6 print:max-h-none print:overflow-visible print:p-0">
              {reviewLoading && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center">
                  <LoaderCircle
                    size={30}
                    className="animate-spin text-indigo-600"
                  />
                  <p className="text-sm font-medium text-slate-500">
                    Loading question review...
                  </p>
                </div>
              )}

              {reviewError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                >
                  <AlertCircle className="mt-0.5 shrink-0" size={18} />
                  <p>{reviewError}</p>
                </div>
              )}

              {review && (
                <div id="nexora-print-report" className="space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                          <Award size={15} />
                          Nexora Examination Report
                        </p>

                        <h4 className="mt-2 text-xl font-black text-slate-900">
                          {review.examTitle ||
                            selectedAttempt.examTitle ||
                            "Exam"}
                        </h4>
                      </div>

                      <StatusBadge
                        status={review.status || selectedAttempt.status}
                      />
                    </div>

                    <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Student
                        </p>
                        <p className="mt-1.5 font-bold text-slate-800">
                          {selectedAttempt.studentName || "Student"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Final score
                        </p>
                        <p className="mt-1.5 font-bold text-slate-800">
                          {formatScore(review.score, review.totalMarks)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Submitted at
                        </p>
                        <p className="mt-1.5 text-sm font-semibold text-slate-800">
                          {formatDate(review.submittedAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Percentage
                        </p>
                        <p className="mt-1.5 font-bold text-indigo-700">
                          {getPercentage(review.score, review.totalMarks) ??
                            "—"}
                          %
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900">
                      Question-wise Analysis
                    </h4>

                    <span className="text-xs font-medium text-slate-500">
                      {(review.questions || review.reviewQuestions || [])
                        .length}{" "}
                      question(s)
                    </span>
                  </div>

                  <div className="space-y-4">
                    {(review.questions || review.reviewQuestions || []).map(
                      (question, index) => (
                        <QuestionReview
                          key={question.questionId ?? question.id ?? index}
                          question={question}
                          index={index}
                        />
                      ),
                    )}

                    {(review.questions || review.reviewQuestions || [])
                      .length === 0 && (
                      <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                        No question review data was returned by the server.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
