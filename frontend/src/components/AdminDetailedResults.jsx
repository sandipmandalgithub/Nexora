
import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:8080/api";

function getToken() {
  return localStorage.getItem("nexoraToken");
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_URL}${path}`, {
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

function QuestionReview({ question, index }) {
  const resultStyles = {
    CORRECT: "border-emerald-200 bg-emerald-50 text-emerald-800",
    INCORRECT: "border-rose-200 bg-rose-50 text-rose-800",
    UNANSWERED: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h4 className="font-bold text-slate-900">
          Question {question.questionOrder ?? index + 1}
        </h4>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            resultStyles[question.result] ||
            "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {question.result || "UNKNOWN"}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
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
            className={`rounded-lg border p-3 text-sm ${
              question.correctOption === option
                ? "border-emerald-300 bg-emerald-50"
                : question.selectedOption === option
                  ? "border-rose-300 bg-rose-50"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <span className="font-bold">{option}.</span>{" "}
            {text || "—"}
            {question.correctOption === option && (
              <span className="ml-2 text-xs font-bold text-emerald-700">
                Correct answer
              </span>
            )}
            {question.selectedOption === option &&
              question.result !== "CORRECT" && (
                <span className="ml-2 text-xs font-bold text-rose-700">
                  Selected
                </span>
              )}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Student selected</p>
          <p className="mt-1 font-semibold text-slate-800">
            {question.selectedOption
              ? `${question.selectedOption}${
                  question.selectedOptionText
                    ? ` — ${question.selectedOptionText}`
                    : ""
                }`
              : "Unanswered"}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Correct answer</p>
          <p className="mt-1 font-semibold text-slate-800">
            {question.correctOption || "—"}
            {question.correctOptionText
              ? ` — ${question.correctOptionText}`
              : ""}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Marks awarded</p>
          <p className="mt-1 font-semibold text-slate-800">
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Examination Management
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Detailed Results &amp; Reports
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Search attempts, inspect submitted answers, and export results.
          </p>
        </div>

        <button
          type="button"
          onClick={() => downloadCsv(filteredAttempts)}
          disabled={filteredAttempts.length === 0}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
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

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Attempts"
          value={attempts.length}
          description="All recorded examination attempts"
        />
        <SummaryCard
          label="Submitted"
          value={submittedCount}
          description="Attempts available for detailed review"
        />
        <SummaryCard
          label="In Progress"
          value={inProgressCount}
          description="Attempts not yet submitted"
        />
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search student, exam, attempt ID..."
          aria-label="Search exam results"
          className="min-w-0 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by attempt status"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="ALL">All statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="IN_PROGRESS">In progress</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-5">
          <h3 className="font-bold text-slate-900">Exam Attempts</h3>
          <span className="text-xs text-slate-500">
            {filteredAttempts.length} result(s)
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading examination results...
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No examination attempts match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Attempt</th>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Exam</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Score</th>
                  <th className="px-5 py-4">Started</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="align-top hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      #{attempt.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {attempt.studentName || "Student"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        ID: {attempt.studentId ?? "—"}
                      </p>
                    </td>

                    <td className="max-w-[240px] px-5 py-4">
                      <p className="break-words font-medium text-slate-800">
                        {attempt.examTitle || "Exam"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Exam ID: {attempt.examId ?? "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={attempt.status} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                      {formatScore(attempt.score, attempt.totalMarks)}
                      {getPercentage(attempt.score, attempt.totalMarks) !==
                        null && (
                        <p className="mt-1 text-xs font-normal text-slate-500">
                          {getPercentage(attempt.score, attempt.totalMarks)}%
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDate(attempt.startedAt)}
                    </td>

                    <td className="px-5 py-4">
                      {attempt.status === "SUBMITTED" ? (
                        <button
                          type="button"
                          onClick={() => void openReview(attempt)}
                          className="whitespace-nowrap rounded-lg border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50"
                        >
                          View Review
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not submitted
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAttempt && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 sm:p-6 print:static print:overflow-visible print:bg-white print:p-0"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-heading"
        >
          <div className="mx-auto my-4 max-w-5xl rounded-2xl bg-slate-50 p-4 shadow-2xl sm:my-8 sm:p-6 print:my-0 print:max-w-none print:rounded-none print:p-0 print:shadow-none">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3 print:hidden">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Submitted Attempt #{selectedAttempt.id}
                </p>
                <h3
                  id="review-heading"
                  className="mt-2 text-xl font-black text-slate-900 sm:text-2xl"
                >
                  Detailed Answer Review
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={printReview}
                  disabled={!review}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Print Report
                </button>
                <button
                  type="button"
                  onClick={closeReview}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>

            {reviewLoading && (
              <p className="rounded-xl bg-white p-6 text-sm text-slate-500">
                Loading question review...
              </p>
            )}

            {reviewError && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              >
                {reviewError}
              </p>
            )}

            {review && (
              <div id="nexora-print-report" className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Nexora Examination Report
                  </p>
                  <h4 className="mt-2 text-xl font-black text-slate-900">
                    {review.examTitle || selectedAttempt.examTitle || "Exam"}
                  </h4>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-500">Student</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedAttempt.studentName || "Student"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Status</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {review.status || selectedAttempt.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Final score</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {formatScore(review.score, review.totalMarks)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Submitted at</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {formatDate(review.submittedAt)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    Percentage:{" "}
                    {getPercentage(review.score, review.totalMarks) ?? "—"}%
                  </p>
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

                  {(review.questions || review.reviewQuestions || []).length ===
                    0 && (
                    <p className="rounded-xl bg-white p-5 text-sm text-slate-500">
                      No question review data was returned by the server.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
