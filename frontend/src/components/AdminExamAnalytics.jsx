import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Your session may have expired. Please sign in again.";
  }

  if (error.response?.status === 403) {
    return "You do not have permission to view exam analytics.";
  }

  if (!error.response) {
    return "Cannot connect to the server. Please make sure the backend is running.";
  }

  return (
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.response?.data?.title ||
    "Unable to load exam analytics. Please try again."
  );
}

function getPercentage(score, totalMarks) {
  const scoreValue = Number(score);
  const totalValue = Number(totalMarks);

  if (
    score === null ||
    score === undefined ||
    totalMarks === null ||
    totalMarks === undefined ||
    !Number.isFinite(scoreValue) ||
    !Number.isFinite(totalValue) ||
    totalValue <= 0
  ) {
    return null;
  }

  return (scoreValue / totalValue) * 100;
}

function formatPercentage(value) {
  return value === null || !Number.isFinite(value)
    ? "—"
    : `${value.toFixed(1)}%`;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
  if (status === "SUBMITTED") {
    return "Submitted";
  }

  if (status === "IN_PROGRESS") {
    return "In Progress";
  }

  return status || "Unknown";
}

function StatusBadge({ status }) {
  const classes =
    status === "SUBMITTED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "IN_PROGRESS"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex max-w-full rounded-full px-3 py-1 text-xs font-bold ${classes}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function MetricCard({ label, value, description, color = "indigo" }) {
  const colorClasses = {
    indigo: "border-indigo-100 bg-indigo-50 text-indigo-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
  };

  return (
    <article
      className={`min-w-0 rounded-xl border p-4 sm:p-5 ${
        colorClasses[color] || colorClasses.indigo
      }`}
    >
      <p className="break-words text-sm font-semibold">{label}</p>

      <p className="mt-3 break-words text-2xl font-extrabold tracking-tight sm:text-3xl">
        {value}
      </p>

      <p className="mt-2 break-words text-xs leading-5 opacity-80">
        {description}
      </p>
    </article>
  );
}

function AdminExamAnalytics() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAttempts() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("nexoraToken");

        const response = await axios.get(
          `${API_BASE_URL}/exam-attempts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (active) {
          setAttempts(Array.isArray(response.data) ? response.data : []);
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError));
          setAttempts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAttempts();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const sortedAttempts = useMemo(() => {
    return [...attempts].sort((first, second) => {
      const firstDate = new Date(
        first.startedAt || first.submittedAt || 0
      ).getTime();

      const secondDate = new Date(
        second.startedAt || second.submittedAt || 0
      ).getTime();

      return secondDate - firstDate;
    });
  }, [attempts]);

  const submittedAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.status === "SUBMITTED"),
    [attempts]
  );

  const inProgressCount = attempts.filter(
    (attempt) => attempt.status === "IN_PROGRESS"
  ).length;

  const validPercentages = submittedAttempts
    .map((attempt) => getPercentage(attempt.score, attempt.totalMarks))
    .filter((percentage) => percentage !== null);

  const averagePercentage =
    validPercentages.length > 0
      ? validPercentages.reduce((total, value) => total + value, 0) /
        validPercentages.length
      : null;

  const highestPercentage =
    validPercentages.length > 0 ? Math.max(...validPercentages) : null;

  const examSummaries = useMemo(() => {
    const grouped = new Map();

    attempts.forEach((attempt) => {
      const examKey = String(
        attempt.examId ?? attempt.examTitle ?? "unknown"
      );

      if (!grouped.has(examKey)) {
        grouped.set(examKey, {
          examKey,
          examId: attempt.examId,
          examTitle: attempt.examTitle || "Untitled exam",
          totalAttempts: 0,
          submittedCount: 0,
          inProgressCount: 0,
          percentages: [],
        });
      }

      const summary = grouped.get(examKey);

      summary.totalAttempts += 1;

      if (attempt.status === "SUBMITTED") {
        summary.submittedCount += 1;

        const percentage = getPercentage(
          attempt.score,
          attempt.totalMarks
        );

        if (percentage !== null) {
          summary.percentages.push(percentage);
        }
      } else if (attempt.status === "IN_PROGRESS") {
        summary.inProgressCount += 1;
      }
    });

    return Array.from(grouped.values())
      .map((summary) => ({
        ...summary,
        averagePercentage:
          summary.percentages.length > 0
            ? summary.percentages.reduce((total, value) => total + value, 0) /
              summary.percentages.length
            : null,
        highestPercentage:
          summary.percentages.length > 0
            ? Math.max(...summary.percentages)
            : null,
      }))
      .sort((first, second) => second.totalAttempts - first.totalAttempts);
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortedAttempts.filter((attempt) => {
      const matchesStatus =
        statusFilter === "ALL" || attempt.status === statusFilter;

      const searchableText = [
        attempt.studentName,
        attempt.examTitle,
        attempt.studentId,
        attempt.examId,
        attempt.id,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!query || searchableText.includes(query));
    });
  }, [sortedAttempts, search, statusFilter]);

  return (
    <section className="mt-5 min-w-0 space-y-4 sm:mt-7 sm:space-y-6">
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 sm:text-sm">
              Administration
            </p>

            <h2 className="mt-1 break-words text-xl font-extrabold leading-8 text-slate-900 sm:text-2xl">
              Exam Results &amp; Analytics
            </h2>

            <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-600">
              Monitor examination attempts, review submitted scores, and
              compare performance across exams.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((previous) => previous + 1)}
            disabled={loading}
            className="w-full shrink-0 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2.5"
          >
            {loading ? "Refreshing..." : "Refresh analytics"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700 sm:p-4"
          >
            <p className="font-semibold">Unable to load exam analytics</p>
            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={() => setRefreshKey((previous) => previous + 1)}
              className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold text-red-700 transition hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <MetricCard
            label="Total attempts"
            value={loading ? "…" : attempts.length}
            description="All recorded examination attempts"
            color="indigo"
          />

          <MetricCard
            label="Submitted"
            value={loading ? "…" : submittedAttempts.length}
            description="Attempts submitted by students"
            color="emerald"
          />

          <MetricCard
            label="In progress"
            value={loading ? "…" : inProgressCount}
            description="Attempts not yet submitted"
            color="amber"
          />

          <MetricCard
            label="Average score"
            value={loading ? "…" : formatPercentage(averagePercentage)}
            description={`${validPercentages.length} submitted attempt(s) with valid marks`}
            color="violet"
          />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Highest submitted score
            </p>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Highest percentage among submitted attempts with valid total marks.
            </p>
          </div>

          <p className="mt-3 text-2xl font-extrabold text-slate-900 sm:mt-0">
            {loading ? "…" : formatPercentage(highestPercentage)}
          </p>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div>
          <h3 className="break-words text-lg font-extrabold text-slate-900 sm:text-xl">
            Exam-wise performance
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Compare attempt volume and submitted scores for each exam.
          </p>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-slate-500" role="status">
            Loading exam summaries...
          </p>
        ) : !error && examSummaries.length === 0 ? (
          <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">
            <p className="font-semibold text-slate-800">No exam data yet</p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Exam summaries will appear when students start attempting exams.
            </p>
          </div>
        ) : (
          !error && (
            <div className="mt-5 space-y-3">
              {examSummaries.map((exam) => (
                <article
                  key={exam.examKey}
                  className="min-w-0 rounded-xl border border-slate-200 p-4 sm:p-5"
                >
                  <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <h4 className="break-words font-bold leading-6 text-slate-900">
                        {exam.examTitle}
                      </h4>

                      {exam.examId !== null && exam.examId !== undefined && (
                        <p className="mt-1 text-xs text-slate-400">
                          Exam ID: {exam.examId}
                        </p>
                      )}
                    </div>

                    <span className="w-fit shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {exam.totalAttempts} attempt(s)
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs leading-5 text-slate-500">
                        Submitted
                      </p>

                      <p className="mt-1 text-lg font-extrabold text-slate-900">
                        {exam.submittedCount}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs leading-5 text-slate-500">
                        In progress
                      </p>

                      <p className="mt-1 text-lg font-extrabold text-slate-900">
                        {exam.inProgressCount}
                      </p>
                    </div>

                    <div className="rounded-lg bg-emerald-50 p-3">
                      <p className="text-xs leading-5 text-emerald-700">
                        Average score
                      </p>

                      <p className="mt-1 text-lg font-extrabold text-emerald-800">
                        {formatPercentage(exam.averagePercentage)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-violet-50 p-3">
                      <p className="text-xs leading-5 text-violet-700">
                        Highest score
                      </p>

                      <p className="mt-1 text-lg font-extrabold text-violet-800">
                        {formatPercentage(exam.highestPercentage)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </div>

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <h3 className="break-words text-lg font-extrabold text-slate-900 sm:text-xl">
              Student result history
            </h3>

            <p className="mt-1 break-words text-sm leading-6 text-slate-500">
              Search and filter all recorded attempts. Results are ordered by
              most recent start time.
            </p>
          </div>

          <span className="w-fit shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
            {loading ? "…" : `${filteredAttempts.length} result(s)`}
          </span>
        </div>

        <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
          <div className="min-w-0">
            <label
              htmlFor="admin-result-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Search results
            </label>

            <input
              id="admin-result-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Student, exam title, or ID..."
              className="w-full min-w-0 rounded-xl border border-slate-300 px-3 py-3 text-base outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 sm:text-sm"
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="admin-result-status"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Attempt status
            </label>

            <select
              id="admin-result-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 sm:text-sm"
            >
              <option value="ALL">All statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>
        </div>

        {loading && (
          <p className="mt-6 text-sm text-slate-500" role="status">
            Loading student results...
          </p>
        )}

        {!loading && !error && filteredAttempts.length === 0 && (
          <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center sm:mt-6">
            <p className="font-semibold text-slate-800">
              {attempts.length === 0
                ? "No exam attempts found"
                : "No matching results"}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {attempts.length === 0
                ? "Student attempts will appear here once they start an exam."
                : "Try another search term or select a different status."}
            </p>
          </div>
        )}

        {!loading && !error && filteredAttempts.length > 0 && (
          <div className="mt-5 space-y-3 sm:mt-6">
            {filteredAttempts.map((attempt) => {
              const percentage = getPercentage(
                attempt.score,
                attempt.totalMarks
              );

              return (
                <article
                  key={attempt.id}
                  className="min-w-0 rounded-xl border border-slate-200 p-4 transition-colors hover:border-indigo-200 sm:p-5"
                >
                  <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <StatusBadge status={attempt.status} />

                        <span className="break-all text-xs text-slate-400">
                          Attempt ID: {attempt.id}
                        </span>
                      </div>

                      <h4 className="mt-3 break-words text-base font-bold leading-6 text-slate-900">
                        {attempt.studentName || "Unknown student"}
                      </h4>

                      <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                        {attempt.examTitle || "Untitled exam"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 sm:min-w-32 sm:text-right">
                      <p className="text-xs font-medium text-slate-500">
                        Score
                      </p>

                      <p className="mt-1 break-words text-xl font-extrabold text-slate-900">
                        {attempt.status === "SUBMITTED" &&
                        attempt.score !== null &&
                        attempt.score !== undefined &&
                        attempt.totalMarks !== null &&
                        attempt.totalMarks !== undefined
                          ? `${attempt.score} / ${attempt.totalMarks}`
                          : "—"}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-indigo-700">
                        {attempt.status === "SUBMITTED"
                          ? formatPercentage(percentage)
                          : "Not submitted"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">Student ID</p>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                        {attempt.studentId ?? "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Started at</p>

                      <p className="mt-1 break-words text-sm font-medium text-slate-700">
                        {formatDate(attempt.startedAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Submitted at</p>

                      <p className="mt-1 break-words text-sm font-medium text-slate-700">
                        {formatDate(attempt.submittedAt)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminExamAnalytics;
